import { useCallback, useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
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
import { cn } from '@/app/lib/utils'
import * as adminApi from '@/app/lib/api/admin'
import type { MonitoringConversation } from '@/app/lib/api/admin'

const formatDate = (iso: string): string => iso.slice(0, 16).replace('T', ' ')

const toIsoDate = (d: Date): string => d.toISOString().slice(0, 10)

type Preset = 'all' | '1w' | '1m' | 'custom'

const PRESETS: { key: Preset; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: '1w', label: '1주' },
  { key: '1m', label: '1달' },
]

const presetRange = (key: Preset): { from: string; to: string } => {
  if (key === 'all') return { from: '', to: '' }
  const today = new Date()
  const to = toIsoDate(today)
  if (key === '1w') {
    const from = new Date(today)
    from.setDate(today.getDate() - 7)
    return { from: toIsoDate(from), to }
  }
  if (key === '1m') {
    const from = new Date(today)
    from.setMonth(today.getMonth() - 1)
    return { from: toIsoDate(from), to }
  }
  return { from: '', to: '' }
}

export const MonitoringView = () => {
  const [rows, setRows] = useState<MonitoringConversation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [preset, setPreset] = useState<Preset>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const fetchRows = useCallback(async (params: {
    q?: string
    dateFrom?: string
    dateTo?: string
  }) => {
    setLoading(true)
    try {
      const data = await adminApi.listMonitoringConversations({
        q: params.q || undefined,
        date_from: params.dateFrom || undefined,
        date_to: params.dateTo || undefined,
        limit: 200,
      })
      setRows(data.items)
    } catch {
      toast.error('대화 모니터링 데이터를 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchRows({})
  }, [fetchRows])

  const handlePreset = (key: Preset) => {
    setPreset(key)
    const { from, to } = presetRange(key)
    setDateFrom(from)
    setDateTo(to)
    void fetchRows({ q: search, dateFrom: from, dateTo: to })
  }

  const handleFromChange = (value: string) => {
    setDateFrom(value)
    setPreset('custom')
    if (value.length === 10 || value === '') {
      void fetchRows({ q: search, dateFrom: value, dateTo })
    }
  }

  const handleToChange = (value: string) => {
    setDateTo(value)
    setPreset('custom')
    if (value.length === 10 || value === '') {
      void fetchRows({ q: search, dateFrom, dateTo: value })
    }
  }

  const handleRefresh = () => {
    void fetchRows({ q: search, dateFrom, dateTo })
  }

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
          <Button size="sm" onClick={handleRefresh} disabled={loading} variant="outline">
            <RefreshCw className={cn('size-3.5 mr-1', loading && 'animate-spin')} />
            새로고침
          </Button>
        </>
      }
    >
      {/* 날짜 필터 바 */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#E5E5E5] px-4 py-2.5 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1">
          {PRESETS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => handlePreset(key)}
              className={cn(
                'px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors',
                preset === key
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="w-px h-4 bg-[#E5E5E5] shrink-0" />

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground shrink-0">직접 설정</span>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => handleFromChange(e.target.value)}
            className="h-7 text-[11px] w-[136px] px-2"
          />
          <span className="text-[11px] text-muted-foreground">~</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => handleToChange(e.target.value)}
            className="h-7 text-[11px] w-[136px] px-2"
          />
        </div>
      </div>

      <Table>
        <TableHeader className="sticky top-[45px] z-10 bg-[#F8F8F9]">
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
