/**
 * Admin API 클라이언트
 * - GET /api/v1/admin/documents   → 문서 목록
 * - GET /api/v1/admin/users       → 사용자 목록
 * - GET /api/v1/admin/stats       → 분석 통계
 */
import { apiFetch } from '@/app/lib/api/client'

const ADMIN = '/api/v1/admin'

// ── 문서 ────────────────────────────────────────────────
export type DocumentStatus = 'done' | 'processing' | 'failed' | 'pending'

export interface ApiDocument {
  id: string
  file_name: string
  storage_path: string
  category: string | null
  owner_name: string | null
  status: DocumentStatus
  created_at: string
  updated_at: string
}

export function listDocuments(params?: {
  status?: DocumentStatus
  category?: string
  q?: string
}): Promise<ApiDocument[]> {
  const sp = new URLSearchParams()
  if (params?.status)   sp.set('status', params.status)
  if (params?.category) sp.set('category', params.category)
  if (params?.q)        sp.set('q', params.q)
  const qs = sp.toString() ? `?${sp.toString()}` : ''
  return apiFetch<ApiDocument[]>(`${ADMIN}/documents${qs}`)
}

export function deleteDocument(id: string): Promise<void> {
  return apiFetch<void>(`${ADMIN}/documents/${id}`, { method: 'DELETE' })
}

export function reindexDocument(id: string): Promise<void> {
  return apiFetch<void>(`${ADMIN}/documents/${id}/reindex`, { method: 'POST', body: JSON.stringify({}) })
}

export function uploadDocument(payload: {
  file: File
  category?: string
  owner_name?: string
}): Promise<ApiDocument> {
  const form = new FormData()
  form.append('file', payload.file)
  if (payload.category) form.append('category', payload.category)
  if (payload.owner_name) form.append('owner_name', payload.owner_name)
  return apiFetch<ApiDocument>(`${ADMIN}/documents/upload`, {
    method: 'POST',
    body: form,
  })
}

// ── 사용자 ──────────────────────────────────────────────
export type UserRole = 'admin' | 'user'

export interface ApiUser {
  id: string
  email: string
  role: UserRole
  is_active: boolean
  created_at: string
  message_count: number
}

export interface UserListResponse {
  items: ApiUser[]
  total: number
}

export function listUsers(q?: string): Promise<UserListResponse> {
  const qs = q ? `?q=${encodeURIComponent(q)}` : ''
  return apiFetch<UserListResponse>(`${ADMIN}/users${qs}`)
}

// ── 통계 ────────────────────────────────────────────────
export interface CategoryStat {
  name: string
  count: number
  pct: number
}

export interface DailyStat {
  date: string
  count: number
}

export interface StatsResponse {
  total_messages_this_month: number
  total_messages_last_month: number
  total_users_active: number
  total_documents: number
  documents_indexed: number
  category_breakdown: CategoryStat[]
  daily_messages: DailyStat[]
  top_conversation_titles: string[]
}

export function getStats(): Promise<StatsResponse> {
  return apiFetch<StatsResponse>(`${ADMIN}/stats`)
}

// ── 모니터링 / 헬스 ───────────────────────────────────────
export interface AdminHealthResponse {
  status: 'ready' | 'degraded'
  checks: Record<string, string>
  bedrock_mock_enabled: boolean
}

export interface MonitoringConversation {
  id: string
  user_email: string
  title: string
  category: string | null
  message_count: number
  last_message: string | null
  last_message_role: string | null
  updated_at: string
}

export interface MonitoringConversationListResponse {
  items: MonitoringConversation[]
  total: number
}

export function getAdminHealth(): Promise<AdminHealthResponse> {
  return apiFetch<AdminHealthResponse>(`${ADMIN}/health`)
}

export function listMonitoringConversations(params?: {
  q?: string
  limit?: number
}): Promise<MonitoringConversationListResponse> {
  const sp = new URLSearchParams()
  if (params?.q) sp.set('q', params.q)
  if (params?.limit) sp.set('limit', String(params.limit))
  const qs = sp.toString() ? `?${sp.toString()}` : ''
  return apiFetch<MonitoringConversationListResponse>(`${ADMIN}/monitoring/conversations${qs}`)
}
