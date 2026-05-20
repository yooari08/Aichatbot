export type ApiMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  source: string | null
  created_at: string
}

export type ApiConversationSummary = {
  id: string
  title: string
  category: string | null
  pinned: boolean
  updated_at: string
  message_count: number
}

export type ApiConversationDetail = ApiConversationSummary & {
  messages: ApiMessage[]
}

export type ChatStreamEvent = {
  type: 'conversation' | 'user_message' | 'delta' | 'done'
  conversation_id?: string
  message_id?: string
  text?: string
  source?: string | null
  title?: string
  category?: string | null
}

export type SendChatMessagePayload = {
  conversation_id?: string | null
  content: string
}
