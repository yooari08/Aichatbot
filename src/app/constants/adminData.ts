import { BookOpen, MessageSquare, BarChart2, Users, Settings } from 'lucide-react'
import { VIEW_LABELS } from '../types/admin'
import type { AdminView, NavSection } from '../types/admin'

export const NAV: NavSection[] = [
  {
    label: '콘텐츠 관리',
    groups: [
      {
        key: 'kb',
        label: '지식베이스',
        icon: BookOpen,
        subs: [
          { key: 'documents', label: '문서 목록' },
          { key: 'faq', label: 'FAQ 플레이어' },
          { key: 'categories', label: '카테고리 설정' },
          { key: 'indexLog', label: '색인 로그' },
        ],
      },
      { key: 'monitoring', label: '대화 모니터링', icon: MessageSquare, subs: [] },
    ],
  },
  {
    label: '분석',
    groups: [
      {
        key: 'analytics',
        label: '분석 대시보드',
        icon: BarChart2,
        subs: [
          { key: 'analytics', label: '사용 현황' },
          { key: 'quality', label: '품질 분석' },
        ],
      },
    ],
  },
  {
    label: '시스템',
    groups: [
      {
        key: 'users',
        label: '사용자 관리',
        icon: Users,
        subs: [
          { key: 'users', label: '사용자 목록' },
          { key: 'roles', label: '역할/권한' },
          { key: 'auditLog', label: '감사 로그' },
        ],
      },
      { key: 'settings', label: '시스템 설정', icon: Settings, subs: [] },
    ],
  },
]

export function getBreadcrumb(view: AdminView): string[] {
  for (const section of NAV) {
    for (const group of section.groups) {
      if (group.subs.length === 0 && group.key === view) {
        return [group.label]
      }
      for (const sub of group.subs) {
        if (sub.key === view) {
          return [group.label, sub.label]
        }
      }
    }
  }
  return [VIEW_LABELS[view]]
}
