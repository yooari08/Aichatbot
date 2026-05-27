import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/app/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table'
import { SearchInput } from '@/app/components/molecules/SearchInput'
import { AdminTablePanel } from '@/app/components/organisms/AdminTablePanel'
import * as adminApi from '@/app/lib/api/admin'
import type { MonitoringConversation } from '@/app/lib/api/admin'

function formatDate(iso: string): string {
  return iso.slice(0, 16).replace('T', ' ')
}

export function MonitoringView() {
  const [rows, setRows] = useState<MonitoringConversation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchRows = async (q?: string) => {
    setLoading(true)
    try {
      const data = await adminApi.listMonitoringConversations({ q, limit: 100 })
      setRows(data.items)
    } catch {
      toast.error('대화 모니터링 데이터를 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchRows()
  }, [])

  return (
    <AdminTablePanel
      title={`대화 모니터링 ${loading ? '' : `(${rows.length}건)`}`}
      actions={
        <>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="제목/이메일 검색…"
            className="w-[220px]"
          />
          <Button size="sm" onClick={() => void fetchRows(search)} disabled={loading} variant="outline">
            <RefreshCw className={`size-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
        </>
      }
    >
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-[#F8F8F9]">
          <TableRow className="border-[#E5E5E5]">
            {['제목', '사용자', '카테고리', '메시지 수', '마지막 메시지', '업데이트'].map((h) => (
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
                {loading ? '로딩 중...' : '표시할 대화가 없습니다.'}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id} className="border-[#F0F0F0] hover:bg-[#FAFAFA]">
                <TableCell className="px-4 py-3 text-[12px] font-medium text-foreground">{row.title}</TableCell>
                <TableCell className="px-4 py-3 text-[12px] text-muted-foreground">{row.user_email}</TableCell>
                <TableCell className="px-4 py-3 text-[12px] text-muted-foreground">{row.category ?? '—'}</TableCell>
                <TableCell className="px-4 py-3 text-[12px] text-muted-foreground">{row.message_count}</TableCell>
                <TableCell className="px-4 py-3 text-[12px] text-muted-foreground max-w-[280px] truncate">
                  {row.last_message ?? '—'}
                </TableCell>
                <TableCell className="px-4 py-3 text-[12px] text-muted-foreground">
                  {formatDate(row.updated_at)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </AdminTablePanel>
  )
}
