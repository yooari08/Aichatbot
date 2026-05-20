import type {
  ApiConversationDetail,
  ApiConversationSummary,
  ApiMessage,
} from '@/app/types/chatApi'
import type { Category, Conversation, ConversationGroup, Message } from '@/app/types/chat'

const CATEGORIES: Category[] = ['HR', '복리후생', '프로젝트', '이슈']

export function asCategory(value: string | null | undefined): Category {
  if (value && CATEGORIES.includes(value as Category)) {
    return value as Category
  }
  return '이슈'
}

export function conversationGroup(updatedAt: Date): ConversationGroup {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfYesterday = new Date(startOfToday)
  startOfYesterday.setDate(startOfYesterday.getDate() - 1)

  if (updatedAt >= startOfToday) return 'today'
  if (updatedAt >= startOfYesterday) return 'yesterday'
  return 'week'
}

export function formatConversationTime(updatedAt: Date): string {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (updatedAt >= startOfToday) {
    return updatedAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  }
  return updatedAt.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })
}

export function mapApiMessage(message: ApiMessage): Message {
  return {
    id: message.id,
    text: message.content,
    sender: message.role === 'user' ? 'user' : 'bot',
    timestamp: new Date(message.created_at),
    source: message.source ?? undefined,
  }
}

export function mapConversationSummary(
  summary: ApiConversationSummary,
  messages: Message[] = []
): Conversation {
  const updatedAt = new Date(summary.updated_at)
  return {
    id: summary.id,
    title: summary.title,
    time: formatConversationTime(updatedAt),
    group: conversationGroup(updatedAt),
    category: asCategory(summary.category),
    pinned: summary.pinned,
    messages,
  }
}

export function mapConversationDetail(detail: ApiConversationDetail): Conversation {
  return mapConversationSummary(
    detail,
    detail.messages.map(mapApiMessage)
  )
}
