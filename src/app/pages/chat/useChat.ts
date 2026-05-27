import { startTransition, useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import * as chatApi from '@/app/lib/api/chat'
import { ApiError } from '@/app/lib/api/errors'
import {
  asCategory,
  conversationGroup,
  formatConversationTime,
  mapConversationDetail,
  mapConversationSummary,
} from '@/app/lib/chat/mappers'
import type { Conversation, Message } from '@/app/types/chat'

function chatErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return 'API 서버에 연결할 수 없습니다. 백엔드(8080) 실행 여부를 확인해 주세요.'
  }
  return '요청을 처리하지 못했습니다.'
}

function moveConversationToTop(conversations: Conversation[], updated: Conversation): Conversation[] {
  const rest = conversations.filter((c) => c.id !== updated.id)
  return [updated, ...rest]
}

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isLoadingList, setIsLoadingList] = useState(true)
  const [likedMessages, setLikedMessages] = useState<Record<string, boolean | null>>({})
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const streamAbortRef = useRef<AbortController | null>(null)
  const conversationsRef = useRef(conversations)
  const loadingConversationIdsRef = useRef(new Set<string>())

  conversationsRef.current = conversations

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null
  const messages = activeConversation?.messages ?? []

  const refreshConversations = useCallback(async () => {
    const summaries = await chatApi.listConversations()
    setConversations((prev) => {
      const messageMap = new Map(prev.map((c) => [c.id, c.messages]))
      return summaries.map((s) => mapConversationSummary(s, messageMap.get(s.id) ?? []))
    })
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await refreshConversations()
      } catch (error) {
        if (!cancelled) toast.error(chatErrorMessage(error))
      } finally {
        if (!cancelled) setIsLoadingList(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [refreshConversations])

  useEffect(() => {
    return () => {
      streamAbortRef.current?.abort()
    }
  }, [])

  const upsertConversation = useCallback((next: Conversation) => {
    setConversations((prev) => moveConversationToTop(prev, next))
  }, [])

  const patchConversation = useCallback((id: string, patch: Partial<Conversation>) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
    )
  }, [])

  const newChat = useCallback(() => {
    streamAbortRef.current?.abort()
    setActiveId(null)
    setInput('')
    setIsTyping(false)
  }, [])

  const selectConversation = useCallback(
    async (id: string) => {
      setActiveId(id)

      const existing = conversationsRef.current.find((c) => c.id === id)
      if (existing && existing.messages.length > 0) return
      if (loadingConversationIdsRef.current.has(id)) return

      loadingConversationIdsRef.current.add(id)
      try {
        const detail = await chatApi.getConversation(id)
        upsertConversation(mapConversationDetail(detail))
      } catch (error) {
        toast.error(chatErrorMessage(error))
      } finally {
        loadingConversationIdsRef.current.delete(id)
      }
    },
    [upsertConversation]
  )

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isTyping) return

      streamAbortRef.current?.abort()
      const abortController = new AbortController()
      streamAbortRef.current = abortController

      const tempUserId = `temp-user-${Date.now()}`
      const tempBotId = `temp-bot-${Date.now()}`
      const userMsg: Message = {
        id: tempUserId,
        text: trimmed,
        sender: 'user',
        timestamp: new Date(),
      }

      let conversationId = activeId

      if (conversationId) {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId ? { ...c, messages: [...c.messages, userMsg] } : c
          )
        )
      }

      setIsTyping(true)
      let assistantText = ''
      let botMessageStarted = false

      const applyMessages = (updater: (messages: Message[]) => Message[]) => {
        if (!conversationId) return
        startTransition(() => {
          setConversations((prev) =>
            prev.map((c) => {
              if (c.id !== conversationId) return c
              return { ...c, messages: updater(c.messages) }
            })
          )
        })
      }

      try {
        for await (const event of chatApi.streamChatMessage(
          { conversation_id: conversationId, content: trimmed },
          abortController.signal
        )) {
          if (abortController.signal.aborted) break

          if (event.type === 'conversation' && event.conversation_id) {
            conversationId = event.conversation_id
            setActiveId(conversationId)
            upsertConversation({
              id: conversationId,
              title: event.title ?? trimmed.slice(0, 40),
              category: asCategory(event.category),
              time: formatConversationTime(new Date()),
              group: 'today',
              pinned: false,
              messages: [userMsg],
            })
          }

          if (event.type === 'user_message' && conversationId && event.message_id) {
            applyMessages((msgs) =>
              msgs.map((m) => (m.id === tempUserId ? { ...m, id: event.message_id! } : m))
            )
          }

          if (event.type === 'delta' && event.text && conversationId) {
            assistantText += event.text
            if (!botMessageStarted) {
              botMessageStarted = true
              setIsTyping(false)
              applyMessages((msgs) => [
                ...msgs,
                {
                  id: tempBotId,
                  text: assistantText,
                  sender: 'bot',
                  timestamp: new Date(),
                },
              ])
            } else {
              applyMessages((msgs) =>
                msgs.map((m) => (m.id === tempBotId ? { ...m, text: assistantText } : m))
              )
            }
          }

          if (event.type === 'done' && conversationId && event.message_id) {
            applyMessages((msgs) =>
              msgs.map((m) =>
                m.id === tempBotId
                  ? {
                      ...m,
                      id: event.message_id!,
                      text: assistantText,
                      source: event.source ?? undefined,
                    }
                  : m
              )
            )
          }
        }

        if (conversationId && !abortController.signal.aborted) {
          const detail = await chatApi.getConversation(conversationId)
          upsertConversation(mapConversationDetail(detail))
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          toast.error(chatErrorMessage(error))
        }
      } finally {
        setIsTyping(false)
        if (streamAbortRef.current === abortController) {
          streamAbortRef.current = null
        }
      }
    },
    [activeId, isTyping, upsertConversation]
  )

  const handleSend = useCallback(() => {
    const text = input.trim()
    if (!text || isTyping) return
    setInput('')
    void sendMessage(text)
  }, [input, isTyping, sendMessage])

  const handleSuggestion = useCallback(
    (q: string) => {
      void sendMessage(q)
    },
    [sendMessage]
  )

  const handleLike = useCallback((id: string, value: boolean) => {
    setLikedMessages((prev) => ({
      ...prev,
      [id]: prev[id] === value ? null : value,
    }))
  }, [])

  const handleCopy = useCallback((id: string, text: string) => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }, [])

  const renameConversation = useCallback(
    async (id: string, title: string) => {
      const trimmed = title.trim()
      if (!trimmed) return
      try {
        const updated = await chatApi.updateConversation(id, { title: trimmed })
        patchConversation(id, {
          title: updated.title,
          time: formatConversationTime(new Date(updated.updated_at)),
          group: conversationGroup(new Date(updated.updated_at)),
        })
      } catch (error) {
        toast.error(chatErrorMessage(error))
      }
    },
    [patchConversation]
  )

  const deleteConversation = useCallback(async (id: string) => {
    try {
      await chatApi.deleteConversation(id)
      setConversations((prev) => prev.filter((c) => c.id !== id))
      setActiveId((prev) => (prev === id ? null : prev))
    } catch (error) {
      toast.error(chatErrorMessage(error))
    }
  }, [])

  const pinConversation = useCallback(
    async (id: string) => {
      patchConversation(id, { pinned: true })
      try {
        await chatApi.updateConversation(id, { pinned: true })
      } catch (error) {
        patchConversation(id, { pinned: false })
        toast.error(chatErrorMessage(error))
      }
    },
    [patchConversation]
  )

  const unpinConversation = useCallback(
    async (id: string) => {
      patchConversation(id, { pinned: false })
      try {
        await chatApi.updateConversation(id, { pinned: false })
      } catch (error) {
        patchConversation(id, { pinned: true })
        toast.error(chatErrorMessage(error))
      }
    },
    [patchConversation]
  )

  return {
    conversations,
    activeId,
    messages,
    input,
    setInput,
    isTyping,
    isLoadingList,
    likedMessages,
    copiedId,
    newChat,
    selectConversation,
    renameConversation,
    deleteConversation,
    pinConversation,
    unpinConversation,
    handleSend,
    handleSuggestion,
    handleLike,
    handleCopy,
  }
}
