import { apiFetch } from '@/app/lib/api/client'
import { ApiError } from '@/app/lib/api/errors'
import { getStoredToken } from '@/app/lib/auth/tokenStorage'
import type { ApiErrorBody } from '@/app/types/auth'
import type {
  ApiConversationDetail,
  ApiConversationSummary,
  ChatStreamEvent,
  SendChatMessagePayload,
} from '@/app/types/chatApi'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

function parseSseChunk(chunk: string): ChatStreamEvent | null {
  const line = chunk.split('\n').find((row) => row.startsWith('data: '))
  if (!line) return null
  try {
    return JSON.parse(line.slice(6)) as ChatStreamEvent
  } catch {
    return null
  }
}

export function listConversations(): Promise<ApiConversationSummary[]> {
  return apiFetch<ApiConversationSummary[]>('/api/v1/conversations')
}

export function getConversation(id: string): Promise<ApiConversationDetail> {
  return apiFetch<ApiConversationDetail>(`/api/v1/conversations/${id}`)
}

export function updateConversation(
  id: string,
  body: { title?: string; pinned?: boolean }
): Promise<ApiConversationSummary> {
  return apiFetch<ApiConversationSummary>(`/api/v1/conversations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function deleteConversation(id: string): Promise<void> {
  return apiFetch<void>(`/api/v1/conversations/${id}`, { method: 'DELETE' })
}

export async function* streamChatMessage(
  payload: SendChatMessagePayload,
  signal?: AbortSignal
): AsyncGenerator<ChatStreamEvent> {
  const token = getStoredToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'text/event-stream',
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}/api/v1/chat/messages`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      conversation_id: payload.conversation_id ?? null,
      content: payload.content,
    }),
    signal,
  })

  if (!response.ok) {
    let body: ApiErrorBody = {}
    try {
      body = (await response.json()) as ApiErrorBody
    } catch {
      body = {}
    }
    throw new ApiError(response.status, body)
  }

  if (!response.body) {
    throw new Error('Streaming response body is empty')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const parts = buffer.split('\n\n')
      buffer = parts.pop() ?? ''

      for (const part of parts) {
        const event = parseSseChunk(part)
        if (event) yield event
      }
    }

    if (buffer.trim()) {
      const event = parseSseChunk(buffer)
      if (event) yield event
    }
  } finally {
    reader.releaseLock()
  }
}
