import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/app/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/app/components/ui/dialog'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/app/components/ui/select'
import { Switch } from '@/app/components/ui/switch'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/app/components/ui/table'
import { UserAvatar } from '@/app/components/atoms/UserAvatar'
import { StatusTag } from '@/app/components/atoms/StatusTag'
import { SearchInput } from '@/app/components/molecules/SearchInput'
import { AdminTablePanel } from '@/app/components/organisms/AdminTablePanel'
import { TablePagination } from '@/app/components/molecules/TablePagination'
import * as adminApi from '@/app/lib/api/admin'
import type { ApiUser, UserRole } from '@/app/lib/api/admin'
import { emailToDisplayName, emailToInitials } from '@/app/lib/auth/userDisplay'
import { formatIsoDate } from '@/app/lib/formatIsoDate'
import type { StatusVariant } from '@/app/components/atoms/StatusTag'

const ROLE_LABEL: Record<string, string> = {
  admin: '슈퍼 어드민',
  user:  '일반 사용자',
}

const ROLE_VARIANT: Record<string, StatusVariant> = {
  admin: 'danger',
  user:  'gray',
}

type EditState = { role: UserRole; is_active: boolean }

type InviteForm = { email: string; password: string; role: UserRole }

const InviteUserModal = ({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: (user: ApiUser) => void
}) => {
  const [form, setForm] = useState<InviteForm>({ email: '', password: '', role: 'user' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) setForm({ email: '', password: '', role: 'user' })
  }, [open])

  const handleSubmit = async () => {
    if (!form.email.trim() || !form.password.trim()) return
    setSaving(true)
    try {
      const user = await adminApi.inviteUser(form)
      onCreated(user)
      toast.success(`${user.email} 계정이 생성되었습니다.`)
      onClose()
    } catch {
      toast.error('사용자 생성에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-[14px]">사용자 초대</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 pt-1">
          <div className="flex flex-col gap-1.5">
            <Label className="text-[12px] font-medium">이메일</Label>
            <Input
              type="email"
              placeholder="user@company.com"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="h-9 text-[12px]"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-[12px] font-medium">임시 비밀번호</Label>
            <Input
              type="password"
              placeholder="8자 이상"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="h-9 text-[12px]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-[12px] font-medium">역할</Label>
            <Select
              value={form.role}
              onValueChange={(v) => setForm((f) => ({ ...f, role: v as UserRole }))}
            >
              <SelectTrigger className="h-9 text-[12px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user" className="text-[12px]">일반 사용자</SelectItem>
                <SelectItem value="admin" className="text-[12px]">슈퍼 어드민</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>취소</Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={saving || !form.email.trim() || !form.password.trim()}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
          >
            {saving ? '생성 중…' : '초대'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const UserEditDialog = ({
  user,
  open,
  onClose,
  onSaved,
}: {
  user: ApiUser
  open: boolean
  onClose: () => void
  onSaved: (updated: ApiUser) => void
}) => {
  const [form, setForm] = useState<EditState>({ role: user.role, is_active: user.is_active })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) setForm({ role: user.role, is_active: user.is_active })
  }, [open, user])

  const handleSave = async () => {
    setSaving(true)
    try {
      const calls: Promise<ApiUser>[] = []
      if (form.role !== user.role)
        calls.push(adminApi.updateUserRole(user.id, form.role))
      if (form.is_active !== user.is_active)
        calls.push(adminApi.toggleUserActive(user.id, form.is_active))

      if (calls.length === 0) { onClose(); return }

      const results = await Promise.all(calls)
      const last = results[results.length - 1]
      // message_count는 편집 대상이 아니므로 원본 값 유지
      onSaved({ ...last, message_count: user.message_count })
      toast.success('사용자 정보가 저장되었습니다.')
      onClose()
    } catch {
      toast.error('저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-[14px]">사용자 편집</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-3 py-1">
          <UserAvatar initials={emailToInitials(user.email)} size="sm" />
          <div>
            <p className="text-[13px] font-semibold text-foreground">{emailToDisplayName(user.email)}</p>
            <p className="text-[11px] text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-1">
          <div className="flex flex-col gap-1.5">
            <Label className="text-[12px] font-medium">역할</Label>
            <Select
              value={form.role}
              onValueChange={(v) => setForm((f) => ({ ...f, role: v as UserRole }))}
            >
              <SelectTrigger className="h-9 text-[12px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user" className="text-[12px]">일반 사용자</SelectItem>
                <SelectItem value="admin" className="text-[12px]">슈퍼 어드민</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-[12px] font-medium">계정 활성화</Label>
            <Switch
              checked={form.is_active}
              onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
            />
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>취소</Button>
          <Button size="sm" onClick={handleSave} disabled={saving}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white">
            {saving ? '저장 중…' : '저장'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export const UsersTable = () => {
  const [users, setUsers]           = useState<ApiUser[]>([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  // search 변경 시 1페이지로 초기화
  useEffect(() => { setPage(1) }, [search])
  const [editTarget, setEditTarget] = useState<ApiUser | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 15

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const data = await adminApi.listUsers()
      setUsers(data.items)
    } catch {
      toast.error('사용자 목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void fetchUsers() }, [])

  const filtered = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase())
  )
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <>
    <AdminTablePanel
      title={`사용자 목록 ${loading ? '' : `(${users.length}명)`}`}
      footer={
        <TablePagination
          page={page}
          pageSize={PAGE_SIZE}
          total={filtered.length}
          onPageChange={setPage}
        />
      }
      actions={
        <>
          <SearchInput value={search} onChange={setSearch} placeholder="이메일 검색…" className="w-[200px]" />
          <Button size="sm" variant="outline" onClick={fetchUsers} disabled={loading} className="gap-1.5">
            <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
          <Button size="sm" className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white" onClick={() => setInviteOpen(true)}>
            + 사용자 초대
          </Button>
        </>
      }
    >
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-[#F8F8F9]">
          <TableRow className="border-[#E5E5E5]">
            {['이름 / 이메일', '역할', '가입일', '메시지 수', '상태', ''].map((h) => (
              <TableHead key={h} className="text-[11px] font-semibold text-muted-foreground h-9 px-4">
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i} className="border-[#F0F0F0]">
                {Array.from({ length: 6 }).map((__, j) => (
                  <TableCell key={j} className="px-4 py-3">
                    <div className="h-3 bg-[#F0F2F6] rounded animate-pulse w-3/4" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="px-4 py-10 text-center text-[12px] text-muted-foreground">
                {search ? '검색 결과가 없습니다.' : '등록된 사용자가 없습니다.'}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((user) => (
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
                    label={ROLE_LABEL[user.role] ?? user.role}
                    variant={ROLE_VARIANT[user.role] ?? 'gray'}
                  />
                </TableCell>
                <TableCell className="px-4 py-3 text-[12px] text-muted-foreground">
                  {formatIsoDate(user.created_at)}
                </TableCell>
                <TableCell className="px-4 py-3 text-[12px] text-muted-foreground">
                  {user.message_count.toLocaleString()}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <StatusTag
                    label={user.is_active ? '활성' : '비활성'}
                    variant={user.is_active ? 'success' : 'gray'}
                  />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-[11px] text-[#2563EB]"
                    onClick={() => setEditTarget(user)}
                  >
                    편집
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </AdminTablePanel>

    {editTarget && (
      <UserEditDialog
        user={editTarget}
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSaved={(updated) => {
          setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
        }}
      />
    )}

    <InviteUserModal
      open={inviteOpen}
      onClose={() => setInviteOpen(false)}
      onCreated={(user) => setUsers((prev) => [{ ...user, message_count: 0 }, ...prev])}
    />
    </>
  )
}
