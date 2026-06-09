import { useEffect, useState, useCallback } from 'react'
import { RefreshCw, ThumbsUp, ThumbsDown } from 'lucide-react'
import { toast } from 'sonner'
import { Skeleton } from '@/app/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { KpiCard } from '@/app/components/molecules/KpiCard'
import * as adminApi from '@/app/lib/api/admin'
import type { FeedbackStatsResponse } from '@/app/lib/api/admin'

const pctChange = (current: number, prev: number): string => {
  if (prev === 0) return current > 0 ? '신규 데이터' : '—'
  const diff = ((current - prev) / prev) * 100
  return diff >= 0
    ? `▲ ${diff.toFixed(1)}% vs 지난달`
    : `▼ ${Math.abs(diff).toFixed(1)}% vs 지난달`
}

const formatDate = (iso: string): string => iso.slice(0, 16).replace('T', ' ')

export const QualityView = () => {
  const [stats, setStats]     = useState<FeedbackStatsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminApi.getFeedbackStats()
      setStats(data)
    } catch {
      toast.error('품질 분석 데이터를 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void fetchStats() }, [fetchStats])

  const total = (stats?.total_positive ?? 0) + (stats?.total_negative ?? 0)
  const positivePct = total > 0 ? Math.round(((stats?.total_positive ?? 0) / total) * 100) : 0
  const negativePct = total > 0 ? 100 - positivePct : 0

  return (
    <div className="flex flex-col gap-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-foreground">품질 분석</h2>
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
              label="만족도"
              value={`${stats.satisfaction_rate.toFixed(1)}%`}
              sub={`전체 ${total.toLocaleString()}건 기준`}
              accent="text-[#16a34a]"
            />
            <KpiCard
              label="이번 달 피드백"
              value={stats.total_this_month.toLocaleString()}
              sub={pctChange(stats.total_this_month, stats.total_last_month)}
            />
            <KpiCard
              label="긍정 피드백"
              value={stats.total_positive.toLocaleString()}
              sub={`전체의 ${positivePct}%`}
              accent="text-[#16a34a]"
            />
            <KpiCard
              label="부정 피드백"
              value={stats.total_negative.toLocaleString()}
              sub={`전체의 ${negativePct}%`}
              accent="text-[#dc2626]"
            />
          </>
        ) : null}
      </div>

      {/* 긍정/부정 비율 바 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-[13px] font-bold">긍정 / 부정 비율</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-6 w-full rounded-full" />
          ) : total > 0 ? (
            <div className="flex flex-col gap-2">
              <div className="flex h-5 w-full overflow-hidden rounded-full">
                <div
                  className="h-full bg-[#4ade80] transition-all"
                  style={{ width: `${positivePct}%` }}
                  title={`긍정 ${positivePct}%`}
                />
                <div
                  className="h-full bg-[#f87171] flex-1 transition-all"
                  title={`부정 ${negativePct}%`}
                />
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="inline-block size-2 rounded-full bg-[#4ade80]" />
                  긍정 {positivePct}% ({stats?.total_positive.toLocaleString()}건)
                </span>
                <span className="flex items-center gap-1">
                  부정 {negativePct}% ({stats?.total_negative.toLocaleString()}건)
                  <span className="inline-block size-2 rounded-full bg-[#f87171]" />
                </span>
              </div>
            </div>
          ) : (
            <p className="text-[12px] text-muted-foreground text-center py-4">피드백 데이터가 없습니다.</p>
          )}
        </CardContent>
      </Card>

      {/* 최근 피드백 목록 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-[13px] font-bold">최근 피드백</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-0 divide-y divide-[#F0F0F0]">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="py-3 flex items-start gap-3">
                <Skeleton className="size-5 rounded-full flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-1/3 mb-1.5" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))
          ) : stats && stats.recent_feedback.length > 0 ? (
            stats.recent_feedback.map((fb) => (
              <div key={fb.id} className="py-3 flex items-start gap-3">
                <div className={`mt-0.5 flex-shrink-0 size-5 rounded-full flex items-center justify-center ${fb.value ? 'bg-[#DCFCE7]' : 'bg-[#FEE2E2]'}`}>
                  {fb.value
                    ? <ThumbsUp className="size-2.5 text-[#16a34a]" />
                    : <ThumbsDown className="size-2.5 text-[#dc2626]" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-muted-foreground mb-0.5">
                    {fb.user_email} · {fb.conversation_title} · {formatDate(fb.created_at)}
                  </p>
                  <p className="text-[12px] text-foreground truncate">{fb.message_preview}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-[12px] text-muted-foreground text-center py-8">피드백 데이터가 없습니다.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
