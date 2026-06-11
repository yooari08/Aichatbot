import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
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
import { AdminTablePanel } from '@/app/components/organisms/AdminTablePanel'
import { cn } from '@/app/lib/utils'
import * as adminApi from '@/app/lib/api/admin'
import type { IndexJobEntry, IndexJobStatus } from '@/app/lib/api/admin'

const LIMIT = 100
const REFRESH_INTERVAL_MS = 30_000

type FilterStatus = 'all' | IndexJobStatus

const STATUS_TABS: { key: FilterStatus; label: string }[] = [
  { key: 'all',       label: '전체' },
  { key: 'pending',   label: 'pending' },
  { key: 'running',   label: 'running' },
  { key: 'succeeded', label: 'succeeded' },
  { key: 'failed',    label: 'failed' },
]

const STATUS_BADGE: Record<IndexJobStatus, string> = {
  pending:   'bg-[#F3F4F6] text-[#6B7280]',
  running:   'bg-[#DBEAFE] text-[#1D4ED8]',
  succeeded: 'bg-[#D1FAE5] text-[#065F46]',
  failed:    'bg-[#FEE2E2] text-[#991B1B]',
}

const formatDate = (iso: string): string => iso.slice(0, 19).replace('T', ' ')

const StatusBadge = ({ status }: { status: IndexJobStatus }) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold',
      STATUS_BADGE[status],
      status === 'running' && 'animate-pulse',
    )}
  >
    {status}
  </span>
)

export const IndexLogView = () => {
  const [rows, setRows] = useState<IndexJobEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<FilterStatus>('all')
  const [page, setPage] = useState(1)

  const fetchRows = useCallback(async (st: FilterStatus, pg: number) => {
    setLoading(true)
    try {
      const data = await adminApi.listIndexJobs({
        status: st === 'all' ? undefined : st,
        limit: LIMIT,
        offset: (pg - 1) * LIMIT,
      })
      setRows(data)
    } catch {
      toast.error('색인 로그를 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchRows(status, page)
    const id = setInterval(() => { void fetchRows(status, page) }, REFRESH_INTERVAL_MS)
    return () => clearInterval(id)
  }, [fetchRows, status, page])

  const handleTabClick = useCallback((key: FilterStatus) => {
    setStatus(key)
    setPage(1)
  }, [])

  const handleRefresh = useCallback(() => {
    void fetchRows(status, page)
  }, [fetchRows, status, page])

  const handlePrev = useCallback(() => {
    setPage((p) => Math.max(1, p - 1))
  }, [])

  const handleNext = useCallback(() => {
    setPage((p) => p + 1)
  }, [])

  return (
    <AdminTablePanel
      title={`색인 로그 ${loading ? '' : `(${rows.length}건)`}`}
      actions={
        <Button
          size="sm"
          variant="outline"
          onClick={handleRefresh}
          disabled={loading}
          className="gap-1.5"
        >
          <RefreshCw className={cn('size-3.5', loading && 'animate-spin')} />
          새로고침
        </Button>
      }
      footer={
        <div className="flex items-center justify-between border-t border-[#E5E5E5] px-4 py-2.5">
          <span className="text-[11px] text-muted-foreground">페이지 {page}</span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              disabled={page <= 1}
              onClick={handlePrev}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              disabled={rows.length < LIMIT}
              onClick={handleNext}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      }
    >
      {/* 상태 필터 탭 */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#E5E5E5] px-4 py-2.5 flex items-center gap-1.5 flex-wrap">
        {STATUS_TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => handleTabClick(key)}
            className={cn(
              'px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors',
              status === key
                ? 'bg-[#2563EB] text-white'
                : 'bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <Table>
        <TableHeader className="sticky top-[41px] z-10 bg-[#F8F8F9]">
          <TableRow className="border-[#E5E5E5]">
            {['파일명', '상태', '메시지', '시작 시각', '완료 시각'].map((h) => (
              <TableHead
                key={h}
                className="text-[11px] font-semibold text-muted-foreground h-9 px-4"
              >
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i} className="border-[#F0F0F0]">
                {Array.from({ length: 5 }).map((__, j) => (
                  <TableCell key={j} className="px-4 py-3">
                    <div className="h-3 bg-[#F0F2F6] rounded animate-pulse w-3/4" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="px-4 py-10 text-center text-[12px] text-muted-foreground"
              >
                색인 로그가 없습니다.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id} className="border-[#F0F0F0] hover:bg-[#FAFAFA]">
                <TableCell className="px-4 py-3 text-[12px] font-medium text-foreground">
                  {row.document_file_name ?? '—'}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <StatusBadge status={row.status} />
                </TableCell>
                <TableCell className="px-4 py-3 text-[12px] text-muted-foreground max-w-[300px] truncate">
                  {row.message ?? '—'}
                </TableCell>
                <TableCell className="px-4 py-3 text-[12px] text-muted-foreground whitespace-nowrap">
                  {formatDate(row.created_at)}
                </TableCell>
                <TableCell className="px-4 py-3 text-[12px] text-muted-foreground whitespace-nowrap">
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
