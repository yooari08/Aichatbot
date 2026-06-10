import { useCallback, useEffect, useMemo, useState } from 'react'
import { Calendar, RefreshCw } from 'lucide-react'
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
import { cn } from '@/app/lib/utils'
import * as adminApi from '@/app/lib/api/admin'
import type { MonitoringConversation } from '@/app/lib/api/admin'

const parseUtc = (iso: string): Date =>
  // Pydantic may omit timezone suffix for UTC; treat ambiguous strings as UTC
  new Date(/[Z+]/.test(iso) ? iso : iso + 'Z')

const formatDate = (iso: string): string =>
  new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(parseUtc(iso))

// local date, not UTC — avoids off-by-one in KST before 09:00
const toIsoDate = (d: Date): string => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const toKoreanDateDisplay = (iso: string): string => {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${y}. ${m}. ${d}.`
}

type Preset = 'all' | 'today' | '1w' | '1m' | 'custom'

const PRESETS: { key: Preset; label: string }[] = [
  { key: 'all',   label: '전체' },
  { key: 'today', label: '오늘' },
  { key: '1w',    label: '1주' },
  { key: '1m',    label: '1달' },
]

const presetRange = (key: Preset): { from: string; to: string } => {
  if (key === 'all') return { from: '', to: '' }
  const today = new Date()
  const to = toIsoDate(today)
  if (key === 'today') return { from: to, to }
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

// Korean date input: shows "YYYY. MM. DD." text while a transparent date input
// sits on top to provide the native calendar picker
type KoreanDateInputProps = { value: string; onChange: (v: string) => void }

const KoreanDateInput = ({ value, onChange }: KoreanDateInputProps) => (
  <div className="relative inline-flex items-center gap-1 h-7 w-[148px] border border-[#E5E5E5] rounded bg-white px-2 cursor-pointer hover:border-[#2563EB] transition-colors">
    <span className="text-[11px] flex-1 pointer-events-none text-foreground">
      {value
        ? toKoreanDateDisplay(value)
        : <span className="text-muted-foreground">날짜 선택</span>}
    </span>
    <Calendar className="size-3 text-muted-foreground pointer-events-none shrink-0" />
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="absolute inset-0 w-full opacity-0 cursor-pointer"
    />
  </div>
)

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

  // Client-side filter so results are always accurate regardless of backend state
  const displayRows = useMemo(() => {
    let result = rows
    if (dateFrom) {
      // dateFrom is local (KST) date string — create local midnight for correct comparison
      const from = new Date(dateFrom + 'T00:00:00')
      result = result.filter(r => parseUtc(r.updated_at) >= from)
    }
    if (dateTo) {
      const to = new Date(dateTo + 'T23:59:59')
      result = result.filter(r => parseUtc(r.updated_at) <= to)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.user_email.toLowerCase().includes(q)
      )
    }
    return result
  }, [rows, dateFrom, dateTo, search])

  const handleSearch = useCallback(() => {
    void fetchRows({ q: search, dateFrom, dateTo })
  }, [fetchRows, search, dateFrom, dateTo])

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
  }

  const handleToChange = (value: string) => {
    setDateTo(value)
    setPreset('custom')
  }

  return (
    <AdminTablePanel
      title={`대화 모니터링 ${loading ? '' : `(${displayRows.length}건)`}`}
      actions={
        <>
          <SearchInput
            value={search}
            onChange={setSearch}
            onEnter={handleSearch}
            placeholder="제목/이메일 검색…"
            className="w-[220px]"
          />
          <Button size="sm" onClick={handleSearch} disabled={loading} variant="outline">
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
          <KoreanDateInput value={dateFrom} onChange={handleFromChange} />
          <span className="text-[11px] text-muted-foreground">~</span>
          <KoreanDateInput value={dateTo} onChange={handleToChange} />
        </div>
      </div>

      <Table>
        <TableHeader className="bg-[#F8F8F9]">
          <TableRow className="border-[#E5E5E5]">
            {['제목', '사용자', '카테고리', '메시지 수', '마지막 메시지', '업데이트'].map((h) => (
              <TableHead key={h} className="text-[11px] font-semibold text-muted-foreground h-9 px-4">
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="px-4 py-10 text-center text-[12px] text-muted-foreground">
                {loading ? '로딩 중...' : '표시할 대화가 없습니다.'}
              </TableCell>
            </TableRow>
          ) : (
            displayRows.map((row) => (
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
