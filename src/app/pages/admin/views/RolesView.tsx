import { useEffect, useState, useCallback } from 'react'
import { RefreshCw, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/app/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/app/components/ui/table'
import { UserAvatar } from '@/app/components/atoms/UserAvatar'
import { StatusTag } from '@/app/components/atoms/StatusTag'
import { AdminTablePanel } from '@/app/components/organisms/AdminTablePanel'
import * as adminApi from '@/app/lib/api/admin'
import type { ApiUser, UserRole } from '@/app/lib/api/admin'
import { emailToDisplayName, emailToInitials } from '@/app/lib/auth/userDisplay'

const PERMISSIONS: { label: string; admin: boolean; user: boolean }[] = [
  { label: '채팅 사용',         admin: true,  user: true  },
  { label: '문서 업로드',       admin: true,  user: false },
  { label: '문서 삭제/재색인',  admin: true,  user: false },
  { label: '사용자 목록 조회',  admin: true,  user: false },
  { label: '역할 변경',         admin: true,  user: false },
  { label: '대화 모니터링',     admin: true,  user: false },
  { label: '분석/통계 조회',    admin: true,  user: false },
  { label: '감사 로그 조회',    admin: true,  user: false },
  { label: '시스템 상태 확인',  admin: true,  user: false },
]

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'admin', label: '슈퍼 어드민' },
  { value: 'user',  label: '일반 사용자' },
]

function PermIcon({ ok }: { ok: boolean }) {
  return ok
    ? <Check className="size-3.5 text-[#16a34a] mx-auto" />
    : <X className="size-3.5 text-[#d1d5db] mx-auto" />
}

export function RolesView() {
  const [users, setUsers]         = useState<ApiUser[]>([])
  const [loading, setLoading]     = useState(true)
  const [updating, setUpdating]   = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminApi.listUsers()
      setUsers(data.items)
    } catch {
      toast.error('사용자 목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void fetchUsers() }, [fetchUsers])

  const handleRoleChange = async (user: ApiUser, newRole: UserRole) => {
    if (user.role === newRole) return
    setUpdating(user.id)
    try {
      const updated = await adminApi.updateUserRole(user.id, newRole)
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
      toast.success(`${emailToDisplayName(user.email)}의 역할이 변경되었습니다.`)
    } catch {
      toast.error('역할 변경에 실패했습니다.')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="flex flex-col gap-6 h-full min-h-0 overflow-y-auto py-1">
      {/* Permission matrix */}
      <div className="flex flex-col gap-2">
        <h2 className="text-[14px] font-bold text-foreground px-1">권한 매트릭스</h2>
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <Table>
            <TableHeader className="bg-[#F8F8F9]">
              <TableRow className="border-[#E5E5E5]">
                <TableHead className="text-[11px] font-semibold text-muted-foreground h-9 px-4 w-[60%]">기능</TableHead>
                <TableHead className="text-[11px] font-semibold text-muted-foreground h-9 px-4 text-center">슈퍼 어드민</TableHead>
                <TableHead className="text-[11px] font-semibold text-muted-foreground h-9 px-4 text-center">일반 사용자</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PERMISSIONS.map((p) => (
                <TableRow key={p.label} className="border-[#F0F0F0]">
                  <TableCell className="px-4 py-2.5 text-[12px] text-foreground">{p.label}</TableCell>
                  <TableCell className="px-4 py-2.5 text-center"><PermIcon ok={p.admin} /></TableCell>
                  <TableCell className="px-4 py-2.5 text-center"><PermIcon ok={p.user} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* User role assignments */}
      <AdminTablePanel
        title={`사용자 역할 관리 ${loading ? '' : `(${users.length}명)`}`}
        actions={
          <Button size="sm" variant="outline" onClick={fetchUsers} disabled={loading} className="gap-1.5">
            <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
        }
      >
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-[#F8F8F9]">
            <TableRow className="border-[#E5E5E5]">
              {['이름 / 이메일', '현재 역할', '역할 변경'].map((h) => (
                <TableHead key={h} className="text-[11px] font-semibold text-muted-foreground h-9 px-4">
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i} className="border-[#F0F0F0]">
                  {Array.from({ length: 3 }).map((__, j) => (
                    <TableCell key={j} className="px-4 py-3">
                      <div className="h-3 bg-[#F0F2F6] rounded animate-pulse w-3/4" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="px-4 py-10 text-center text-[12px] text-muted-foreground">
                  등록된 사용자가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} className="border-[#F0F0F0] hover:bg-[#FAFAFA]">
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <UserAvatar initials={emailToInitials(user.email)} size="sm" />
                      <div>
                        <p className="text-[12px] font-medium text-foreground">{emailToDisplayName(user.email)}</p>
                        <p className="text-[11px] text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <StatusTag
                      label={user.role === 'admin' ? '슈퍼 어드민' : '일반 사용자'}
                      variant={user.role === 'admin' ? 'danger' : 'gray'}
                    />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {ROLE_OPTIONS.map((opt) => (
                        <Button
                          key={opt.value}
                          size="sm"
                          variant={user.role === opt.value ? 'default' : 'outline'}
                          disabled={updating === user.id}
                          onClick={() => void handleRoleChange(user, opt.value)}
                          className={`h-7 text-[11px] px-2.5 ${user.role === opt.value ? 'bg-[#2563EB] hover:bg-[#1D4ED8]' : ''}`}
                        >
                          {opt.label}
                        </Button>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </AdminTablePanel>
    </div>
  )
}
