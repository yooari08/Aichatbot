import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/app/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/app/components/ui/table'
import { UserAvatar } from '@/app/components/atoms/UserAvatar'
import { StatusTag } from '@/app/components/atoms/StatusTag'
import { SearchInput } from '@/app/components/molecules/SearchInput'
import { AdminTablePanel } from '@/app/components/organisms/AdminTablePanel'
import * as adminApi from '@/app/lib/api/admin'
import type { ApiUser } from '@/app/lib/api/admin'
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

export function UsersTable() {
  const [users, setUsers]     = useState<ApiUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')

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

  const rows = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminTablePanel
      title={`사용자 목록 ${loading ? '' : `(${users.length}명)`}`}
      actions={
        <>
          <SearchInput value={search} onChange={setSearch} placeholder="이메일 검색…" className="w-[200px]" />
          <Button size="sm" variant="outline" onClick={fetchUsers} disabled={loading} className="gap-1.5">
            <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
          <Button size="sm" className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white">
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
                  <Button variant="link" size="sm" className="h-auto p-0 text-[11px] text-[#2563EB]">
                    편집
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </AdminTablePanel>
  )
}
