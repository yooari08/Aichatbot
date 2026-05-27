import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Skeleton } from '@/app/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { KpiCard } from '@/app/components/molecules/KpiCard'
import * as adminApi from '@/app/lib/api/admin'
import type { StatsResponse, DailyStat } from '@/app/lib/api/admin'

const CAT_COLORS = ['#2563EB', '#4C6FD8', '#7C9CF8', '#B0C0F0', '#CBD5E1', '#94A3B8']

function pctChange(current: number, prev: number): string {
  if (prev === 0) return current > 0 ? '신규 데이터' : '—'
  const diff = ((current - prev) / prev) * 100
  return diff >= 0
    ? `▲ ${diff.toFixed(1)}% vs 지난달`
    : `▼ ${Math.abs(diff).toFixed(1)}% vs 지난달`
}

function DailyBarChart({ data }: { data: DailyStat[] }) {
  const max = Math.max(...data.map((d) => d.count), 1)
  return (
    <div className="flex items-end gap-[3px] h-24 w-full">
      {data.map((d) => (
        <div key={d.date} className="flex-1 flex flex-col items-center relative group">
          <div
            className="w-full rounded-sm bg-[#2563EB] opacity-60 hover:opacity-100 transition-opacity cursor-default"
            style={{ height: `${Math.max((d.count / max) * 88, d.count > 0 ? 4 : 1)}px` }}
            title={`${d.date}: ${d.count}건`}
          />
          {(d.date.endsWith('-01') || d.date.endsWith('-15')) && (
            <span className="text-[9px] text-muted-foreground absolute -bottom-4 whitespace-nowrap">
              {d.date.slice(5)}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

export function AnalyticsDashboard() {
  const [stats, setStats]     = useState<StatsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    setLoading(true)
    try {
      const data = await adminApi.getStats()
      setStats(data)
    } catch {
      toast.error('통계 데이터를 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void fetchStats() }, [])

  return (
    <div className="flex flex-col gap-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-foreground">사용 현황</h2>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-1.5 text-[12px] text-[#2563EB] hover:underline disabled:opacity-50"
        >
          <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
          새로고침
        </button>
      </div>

      {/* KPI 카드 */}
      <div className="grid grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-[#E5E5E5] p-5 bg-white">
              <Skeleton className="h-3 w-24 mb-3" />
              <Skeleton className="h-7 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))
        ) : stats ? (
          <>
            <KpiCard
              label="이번 달 질문 수"
              value={stats.total_messages_this_month.toLocaleString()}
              sub={pctChange(stats.total_messages_this_month, stats.total_messages_last_month)}
              accent="text-[#2563EB]"
            />
            <KpiCard
              label="활성 사용자"
              value={stats.total_users_active.toLocaleString()}
              sub="현재 활성 계정"
            />
            <KpiCard
              label="전체 문서"
              value={stats.total_documents.toLocaleString()}
              sub={`색인 완료 ${stats.documents_indexed}건`}
            />
            <KpiCard
              label="색인 완료율"
              value={
                stats.total_documents > 0
                  ? `${Math.round((stats.documents_indexed / stats.total_documents) * 100)}%`
                  : '—'
              }
              sub="문서 색인 현황"
            />
          </>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* 카테고리별 대화 비율 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-[13px] font-bold">카테고리별 대화 비율</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              ))
            ) : stats && stats.category_breakdown.length > 0 ? (
              stats.category_breakdown.map((bar, idx) => (
                <div key={bar.name}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-muted-foreground">{bar.name}</span>
                    <span className="font-semibold text-foreground">{bar.pct}%</span>
                  </div>
                  <div className="h-2 bg-[#F0F2F6] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${bar.pct}%`,
                        backgroundColor: CAT_COLORS[idx % CAT_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[12px] text-muted-foreground py-4 text-center">
                대화 데이터가 없습니다.
              </p>
            )}
          </CardContent>
        </Card>

        {/* 자주 다룬 주제 Top 5 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-[13px] font-bold">자주 다룬 주제 Top 5</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="size-5 rounded-full flex-shrink-0" />
                  <Skeleton className="h-3 flex-1" />
                </div>
              ))
            ) : stats && stats.top_conversation_titles.length > 0 ? (
              stats.top_conversation_titles.map((title, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="size-5 rounded-full bg-[#EEF2FF] text-[#2563EB] text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-[12px] text-foreground truncate">{title}</span>
                </div>
              ))
            ) : (
              <p className="text-[12px] text-muted-foreground py-4 text-center">
                대화 데이터가 없습니다.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 최근 30일 메시지 추이 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-[13px] font-bold">최근 30일 메시지 추이</CardTitle>
        </CardHeader>
        <CardContent className="pb-8">
          {loading ? (
            <Skeleton className="h-24 w-full" />
          ) : stats ? (
            <DailyBarChart data={stats.daily_messages} />
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
