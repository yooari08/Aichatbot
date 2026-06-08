import { useEffect, useState, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/app/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/app/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/app/components/ui/table'
import { SearchInput } from '@/app/components/molecules/SearchInput'
import { AdminTablePanel } from '@/app/components/organisms/AdminTablePanel'
import { TablePagination } from '@/app/components/molecules/TablePagination'
import * as adminApi from '@/app/lib/api/admin'
import type { AuditLogEntry } from '@/app/lib/api/admin'

const PAGE_SIZE = 20

const ACTION_OPTIONS = [
  { value: 'all', label: '전체 액션' },
  { value: 'CREATE', label: 'CREATE' },
  { value: 'UPDATE', label: 'UPDATE' },
  { value: 'DELETE', label: 'DELETE' },
  { value: 'LOGIN', label: 'LOGIN' },
  { value: 'LOGIN_FAILED', label: 'LOGIN_FAILED' },
] as const

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-[#DCFCE7] text-[#166534]',
  UPDATE: 'bg-[#EEF2FF] text-[#2563EB]',
  DELETE: 'bg-[#FEE2E2] text-[#991b1b]',
  LOGIN: 'bg-[#F3F4F6] text-[#374151]',
  LOGIN_FAILED: 'bg-[#FEE2E2] text-[#991b1b]',
}

function ActionBadge({ action }: { action: string }) {
  const cls = ACTION_COLORS[action.toUpperCase()] ?? 'bg-[#F3F4F6] text-[#374151]'
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${cls}`}>
      {action}
    </span>
  )
}

function formatDate(iso: string): string {
  return iso.slice(0, 19).replace('T', ' ')
}

export function AuditLogView() {
  const [rows, setRows] = useState<AuditLogEntry[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [action, setAction] = useState('all')
  const [page, setPage] = useState(1)

  const fetchRows = useCallback(async (q: string, act: string, p: number) => {
    setLoading(true)
    try {
      const data = await adminApi.listAuditLog({
        q: q || undefined,
        action: act === 'all' ? undefined : act,
        limit: PAGE_SIZE,
        offset: (p - 1) * PAGE_SIZE,
      })
      setRows(data.items)
      setTotal(data.total)
    } catch {
      toast.error('감사 로그를 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchRows(search, action, page)
  }, [fetchRows, search, action, page])

  const handleSearchChange = (q: string) => {
    setSearch(q)
    setPage(1)
  }

  const handleActionChange = (value: string) => {
    setAction(value)
    setPage(1)
  }

  return (
    <AdminTablePanel
      title={`감사 로그 ${loading ? '' : `(${total}건)`}`}
      footer={
        <TablePagination
          page={page}
          pageSize={PAGE_SIZE}
          total={total}
          onPageChange={setPage}
        />
      }
      actions={
        <>
          <SearchInput
            value={search}
            onChange={handleSearchChange}
            placeholder="이메일 검색…"
            className="w-[200px]"
          />
          <Select value={action} onValueChange={handleActionChange}>
            <SelectTrigger className="h-8 w-[150px] text-[12px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACTION_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-[12px]">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant="outline"
            onClick={() => void fetchRows(search, action, page)}
            disabled={loading}
            className="gap-1.5"
          >
            <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
        </>
      }
    >
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-[#F8F8F9]">
          <TableRow className="border-[#E5E5E5]">
            {['시각', '사용자', '액션', '대상', '상세', 'IP'].map((h) => (
              <TableHead key={h} className="text-[11px] font-semibold text-muted-foreground h-9 px-4">
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="px-4 py-10 text-center text-[12px] text-muted-foreground">
                {loading ? '로딩 중...' : '감사 로그가 없습니다.'}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id} className="border-[#F0F0F0] hover:bg-[#FAFAFA]">
                <TableCell className="px-4 py-2.5 text-[11px] text-muted-foreground whitespace-nowrap">
                  {formatDate(row.created_at)}
                </TableCell>
                <TableCell className="px-4 py-2.5 text-[12px] text-foreground max-w-[180px] truncate">
                  {row.user_email}
                </TableCell>
                <TableCell className="px-4 py-2.5">
                  <ActionBadge action={row.action} />
                </TableCell>
                <TableCell className="px-4 py-2.5 text-[12px] text-muted-foreground">
                  {row.resource_type}{row.resource_id ? ` #${row.resource_id.slice(0, 8)}` : ''}
                </TableCell>
                <TableCell className="px-4 py-2.5 text-[12px] text-muted-foreground max-w-[240px] truncate">
                  {row.detail ?? '—'}
                </TableCell>
                <TableCell className="px-4 py-2.5 text-[11px] text-muted-foreground">
                  {row.ip_address ?? '—'}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </AdminTablePanel>
  )
}
