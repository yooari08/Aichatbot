import type { UserRole } from '@/app/types/auth'

const ROLE_LABELS: Record<UserRole, string> = {
  user: '일반 사용자',
  admin: '관리자',
}

export function getRoleLabel(role: UserRole): string {
  return ROLE_LABELS[role]
}

export function emailToDisplayName(email: string): string {
  const local = email.split('@')[0]?.trim()
  return local || email
}

export function emailToInitials(email: string): string {
  const local = email.split('@')[0]?.trim() ?? ''
  if (local.length >= 2) {
    return local.slice(0, 2).toUpperCase()
  }
  return local.slice(0, 1).toUpperCase() || '?'
}
