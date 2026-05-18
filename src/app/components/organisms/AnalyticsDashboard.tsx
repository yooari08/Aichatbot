import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { KpiCard } from "@/app/components/molecules/KpiCard";
import { StatusTag } from "@/app/components/atoms/StatusTag";
import { CATEGORY_BARS, TOP_QUESTIONS, IMPROVEMENT_QUESTIONS } from "@/app/constants/adminData";

export function AnalyticsDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-[16px] font-bold text-foreground">사용 현황</h2>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="이번 달 질문 수" value="1,284" sub="▲ 12% vs 지난달" accent="text-[#2563EB]" />
        <KpiCard label="평균 응답 시간" value="1.2s" sub="목표: 2.0s 이내" />
        <KpiCard label="답변 만족도" value="87%" sub="좋아요 / 전체 응답" />
        <KpiCard label="미응답률" value="4.3%" sub="▼ 1.1%p 개선" accent="text-destructive" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Category distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-[13px] font-bold">카테고리별 질문 비율</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {CATEGORY_BARS.map((bar) => (
              <div key={bar.name}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-muted-foreground">{bar.name}</span>
                  <span className="font-semibold text-foreground">{bar.pct}%</span>
                </div>
                <div className="h-2 bg-[#F0F2F6] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${bar.pct}%`, backgroundColor: bar.color }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top questions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-[13px] font-bold">자주 묻는 질문 Top 5</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {TOP_QUESTIONS.map((q, i) => (
              <div key={q.label} className="flex items-center gap-3">
                <span className="size-5 rounded-full bg-[#EEF2FF] text-[#2563EB] text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <span className="flex-1 text-[12px] text-foreground">{q.label}</span>
                <span className="text-[12px] font-semibold text-foreground">{q.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Improvement needed */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-[13px] font-bold">개선 필요 질문</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-0">
          {IMPROVEMENT_QUESTIONS.map((q) => (
            <div
              key={q.label}
              className="flex items-center justify-between py-2 border-b border-[#F5F5F5] last:border-0"
            >
              <span className="text-[12px] text-foreground">{q.label}</span>
              <StatusTag
                label={q.tag}
                variant={q.tag === "미응답" ? "danger" : "warning"}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
