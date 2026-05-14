import { useState } from "react";
import {
  Users,
  MessageSquare,
  TrendingUp,
  Clock,
  Search,
  BarChart2,
  BookOpen,
  Settings,
  LayoutDashboard,
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  Filter,
  Download,
  CheckCircle2,
  AlertCircle,
  Save,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { cn } from "./ui/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Conversation {
  id: string;
  userName: string;
  department: string;
  lastMessage: string;
  messageCount: number;
  timestamp: Date;
  status: "resolved" | "pending";
}

interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  updatedAt: string;
}

// ─── Sample Data ──────────────────────────────────────────────────────────────

const CONVERSATIONS: Conversation[] = [
  {
    id: "1",
    userName: "김철수",
    department: "인사팀",
    lastMessage: "연차 신청 방법을 알려주세요.",
    messageCount: 6,
    timestamp: new Date(Date.now() - 1000 * 60 * 18),
    status: "resolved",
  },
  {
    id: "2",
    userName: "이영희",
    department: "개발팀",
    lastMessage: "VPN 접속이 안됩니다.",
    messageCount: 12,
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    status: "pending",
  },
  {
    id: "3",
    userName: "박민수",
    department: "마케팅팀",
    lastMessage: "경비 처리 방법을 알려주세요.",
    messageCount: 4,
    timestamp: new Date(Date.now() - 1000 * 60 * 80),
    status: "resolved",
  },
  {
    id: "4",
    userName: "최지은",
    department: "디자인팀",
    lastMessage: "복리후생 혜택에 대해 알려주세요.",
    messageCount: 8,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
    status: "resolved",
  },
  {
    id: "5",
    userName: "정우현",
    department: "영업팀",
    lastMessage: "급여 지급일이 언제인가요?",
    messageCount: 3,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    status: "resolved",
  },
  {
    id: "6",
    userName: "강수연",
    department: "법무팀",
    lastMessage: "회의실 예약이 안됩니다.",
    messageCount: 9,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 7),
    status: "pending",
  },
  {
    id: "7",
    userName: "윤재원",
    department: "기획팀",
    lastMessage: "사내 메일 설정을 도와주세요.",
    messageCount: 7,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    status: "resolved",
  },
];

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "f1",
    category: "인사·복지",
    question: "연차 신청은 어떻게 하나요?",
    answer:
      "그룹웨어 포털 > 근태관리 > 휴가신청 메뉴에서 날짜를 선택하고 팀장 승인을 받으면 처리됩니다.",
    updatedAt: "2026.05.12",
  },
  {
    id: "f2",
    category: "인사·복지",
    question: "복리후생 혜택은 무엇이 있나요?",
    answer:
      "건강검진, 자기계발비(연 50만원), 도서구매비, 가족경조사 지원, 사내동호회 지원 등이 있습니다.",
    updatedAt: "2026.05.10",
  },
  {
    id: "f3",
    category: "IT·시스템",
    question: "VPN 접속은 어떻게 하나요?",
    answer:
      "IT 포털에서 VPN 클라이언트를 다운로드 후 사번으로 로그인하세요. 서버: vpn.company.com",
    updatedAt: "2026.05.08",
  },
  {
    id: "f4",
    category: "IT·시스템",
    question: "사내 메일 설정 방법은?",
    answer:
      "Outlook 앱 설치 후 사번@company.com으로 로그인, Exchange 서버: mail.company.com",
    updatedAt: "2026.05.05",
  },
  {
    id: "f5",
    category: "시설·공간",
    question: "회의실은 어떻게 예약하나요?",
    answer:
      "인트라넷 > 공간예약 메뉴에서 날짜·시간·회의실을 선택 후 목적을 입력하면 즉시 예약됩니다.",
    updatedAt: "2026.05.01",
  },
  {
    id: "f6",
    category: "시설·공간",
    question: "주차 이용 안내",
    answer:
      "지하 1~3층 임직원 전용 구역. 월 주차권은 총무팀에서 신청(선착순). 이용 무료.",
    updatedAt: "2026.04.28",
  },
  {
    id: "f7",
    category: "급여·재무",
    question: "급여는 언제 지급되나요?",
    answer:
      "매월 25일 지급. 25일이 주말/공휴일인 경우 직전 평일에 지급됩니다.",
    updatedAt: "2026.04.25",
  },
  {
    id: "f8",
    category: "급여·재무",
    question: "경비 처리 방법을 알려주세요.",
    answer:
      "그룹웨어 > 재무 > 지출결의서 작성 후 영수증 첨부, 팀장 승인 완료 시 익월 급여와 함께 지급됩니다.",
    updatedAt: "2026.04.20",
  },
];

const WEEKLY_DATA = [
  { day: "월", count: 42 },
  { day: "화", count: 58 },
  { day: "수", count: 71 },
  { day: "목", count: 55 },
  { day: "금", count: 89 },
  { day: "토", count: 12 },
  { day: "일", count: 8 },
];

const TOP_QUESTIONS = [
  { question: "연차 신청 방법", count: 47, pct: 100 },
  { question: "급여 지급일", count: 38, pct: 80 },
  { question: "회의실 예약", count: 31, pct: 66 },
  { question: "VPN 접속 방법", count: 28, pct: 59 },
  { question: "복리후생 혜택", count: 22, pct: 47 },
];

const CATEGORY_COLORS: Record<string, string> = {
  "인사·복지": "bg-blue-50 text-blue-700 border border-blue-200",
  "IT·시스템": "bg-violet-50 text-violet-700 border border-violet-200",
  "시설·공간": "bg-emerald-50 text-emerald-700 border border-emerald-200",
  "급여·재무": "bg-amber-50 text-amber-700 border border-amber-200",
};

type TabKey = "dashboard" | "conversations" | "knowledge" | "settings";

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "dashboard", label: "대시보드", icon: LayoutDashboard },
  { key: "conversations", label: "대화 관리", icon: MessageSquare },
  { key: "knowledge", label: "지식베이스", icon: BookOpen },
  { key: "settings", label: "설정", icon: Settings },
];

// ─── Utilities ────────────────────────────────────────────────────────────────

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);
  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHr < 24) return `${diffHr}시간 전`;
  return `${diffDay}일 전`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendLabel,
  colorClass,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  trend: "up" | "down" | "neutral";
  trendLabel: string;
  colorClass: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            colorClass
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
        <span
          className={cn(
            "flex items-center gap-1 text-xs font-medium",
            trend === "up"
              ? "text-emerald-600"
              : trend === "down"
                ? "text-red-500"
                : "text-slate-400"
          )}
        >
          {trend === "up" ? (
            <ArrowUpRight className="w-3.5 h-3.5" />
          ) : trend === "down" ? (
            <ArrowDownRight className="w-3.5 h-3.5" />
          ) : null}
          {trendLabel}
        </span>
      </div>
      <div className="text-2xl font-semibold text-slate-900 mb-0.5">
        {value}
      </div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  );
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────────

function DashboardTab() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="총 사용자"
          value="124"
          trend="up"
          trendLabel="+12%"
          colorClass="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={MessageSquare}
          label="총 대화수"
          value="1,847"
          trend="up"
          trendLabel="+8%"
          colorClass="bg-violet-50 text-violet-600"
        />
        <StatCard
          icon={TrendingUp}
          label="오늘 문의"
          value="47"
          trend="down"
          trendLabel="-5%"
          colorClass="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          icon={Clock}
          label="평균 응답시간"
          value="1.8초"
          trend="up"
          trendLabel="빨라짐"
          colorClass="bg-amber-50 text-amber-600"
        />
      </div>

      {/* Chart + Top Questions */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Weekly chart */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                주간 대화량
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">최근 7일</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-xs text-slate-500">대화수</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={WEEKLY_DATA}
              barSize={28}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "12px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                cursor={{ fill: "#f8fafc" }}
                formatter={(value: number) => [`${value}건`, "대화수"]}
              />
              <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top questions */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">
            자주 묻는 질문 TOP 5
          </h3>
          <p className="text-xs text-slate-400 mb-5">이번 주 기준</p>
          <div className="space-y-3">
            {TOP_QUESTIONS.map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-700 truncate pr-2">
                    {item.question}
                  </span>
                  <span className="text-xs font-medium text-slate-500 flex-shrink-0">
                    {item.count}건
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent conversations */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">최근 대화</h3>
          <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
            전체 보기
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {CONVERSATIONS.slice(0, 5).map((conv) => (
            <div
              key={conv.id}
              className="px-5 py-3.5 flex items-center gap-4 hover:bg-slate-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                {conv.userName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium text-slate-900">
                    {conv.userName}
                  </span>
                  <span className="text-xs text-slate-400">
                    {conv.department}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate">
                  {conv.lastMessage}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span
                  className={cn(
                    "text-[11px] font-medium px-2 py-0.5 rounded-full",
                    conv.status === "resolved"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  )}
                >
                  {conv.status === "resolved" ? "해결됨" : "대기 중"}
                </span>
                <span className="text-xs text-slate-400">
                  {formatRelativeTime(conv.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Conversations Tab ────────────────────────────────────────────────────────

function ConversationsTab() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "resolved" | "pending"
  >("all");

  const filtered = CONVERSATIONS.filter((c) => {
    const matchSearch =
      c.userName.includes(search) ||
      c.department.includes(search) ||
      c.lastMessage.includes(search);
    const matchStatus =
      statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="사용자, 부서, 내용 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
          </div>
          <div className="flex items-center gap-2">
            {(["all", "resolved", "pending"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "text-sm px-3 py-1.5 rounded-lg font-medium transition-colors",
                  statusFilter === s
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                {s === "all" ? "전체" : s === "resolved" ? "해결됨" : "대기 중"}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="w-3.5 h-3.5" />
              내보내기
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                사용자
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                마지막 질문
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                메시지
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                상태
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                시간
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((conv) => (
              <tr
                key={conv.id}
                className="hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                      {conv.userName[0]}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">
                        {conv.userName}
                      </div>
                      <div className="text-xs text-slate-400">
                        {conv.department}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-slate-700 line-clamp-1">
                    {conv.lastMessage}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <span className="text-slate-600 font-medium">
                    {conv.messageCount}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full",
                      conv.status === "resolved"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    )}
                  >
                    {conv.status === "resolved" ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <AlertCircle className="w-3 h-3" />
                    )}
                    {conv.status === "resolved" ? "해결됨" : "대기 중"}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-slate-500 text-xs whitespace-nowrap">
                  {formatRelativeTime(conv.timestamp)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-slate-400">
            <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">검색 결과가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Knowledge Tab ────────────────────────────────────────────────────────────

function KnowledgeTab() {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<FaqItem[]>(FAQ_ITEMS);
  const [categoryFilter, setCategoryFilter] = useState("전체");

  const categories = ["전체", "인사·복지", "IT·시스템", "시설·공간", "급여·재무"];

  const filtered = items.filter((item) => {
    const matchSearch =
      item.question.includes(search) || item.answer.includes(search);
    const matchCat =
      categoryFilter === "전체" || item.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const deleteItem = (id: string) =>
    setItems((prev) => prev.filter((item) => item.id !== id));

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="질문 또는 답변 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-lg font-medium transition-colors",
                  categoryFilter === cat
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100 border border-slate-200"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="ml-auto">
            <Button size="sm" className="gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              FAQ 추가
            </Button>
          </div>
        </div>
      </div>

      {/* FAQ grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <span
                className={cn(
                  "text-[11px] font-semibold px-2 py-0.5 rounded-md",
                  CATEGORY_COLORS[item.category] ?? "bg-slate-100 text-slate-600"
                )}
              >
                {item.category}
              </span>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <h4 className="text-sm font-semibold text-slate-900 mb-2 leading-snug">
              {item.question}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
              {item.answer}
            </p>
            <div className="mt-3 pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-400">
                최종 수정: {item.updatedAt}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 bg-white rounded-xl border border-slate-200 text-center text-slate-400">
          <BookOpen className="w-8 h-8 mx-auto mb-3 opacity-40" />
          <p className="text-sm">검색 결과가 없습니다.</p>
        </div>
      )}
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────

function SettingsTab() {
  const [botName, setBotName] = useState("MYChat");
  const [greeting, setGreeting] = useState(
    "안녕하세요! MYChat입니다. 사내 업무에 관한 궁금한 점을 편하게 질문해 주세요."
  );
  const [autoReply, setAutoReply] = useState(true);
  const [weekdayOp, setWeekdayOp] = useState(true);
  const [weekendOp, setWeekendOp] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Bot basic info */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">
          챗봇 기본 정보
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              챗봇 이름
            </label>
            <input
              value={botName}
              onChange={(e) => setBotName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              인사말
            </label>
            <textarea
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white resize-none"
            />
            <p className="text-xs text-slate-400 mt-1">
              대화 시작 시 사용자에게 표시되는 첫 메시지입니다.
            </p>
          </div>
        </div>
      </div>

      {/* Response settings */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">응답 설정</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-1">
            <div>
              <div className="text-sm font-medium text-slate-800">
                자동 응답 활성화
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                챗봇이 자동으로 질문에 답변합니다
              </div>
            </div>
            <Switch
              checked={autoReply}
              onCheckedChange={setAutoReply}
            />
          </div>
          <div className="border-t border-slate-100" />
          <div className="flex items-center justify-between py-1">
            <div>
              <div className="text-sm font-medium text-slate-800">
                미답변 질문 알림
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                답변하지 못한 질문이 있을 때 관리자에게 알림
              </div>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </div>

      {/* Operation hours */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">운영 시간</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-1">
            <div>
              <div className="text-sm font-medium text-slate-800">
                평일 운영
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                월요일 ~ 금요일 09:00 ~ 18:00
              </div>
            </div>
            <Switch
              checked={weekdayOp}
              onCheckedChange={setWeekdayOp}
            />
          </div>
          <div className="border-t border-slate-100" />
          <div className="flex items-center justify-between py-1">
            <div>
              <div className="text-sm font-medium text-slate-800">
                주말 운영
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                토요일 ~ 일요일 운영 여부
              </div>
            </div>
            <Switch
              checked={weekendOp}
              onCheckedChange={setWeekendOp}
            />
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          변경사항 저장
        </Button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
            저장되었습니다.
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Main AdminPage ───────────────────────────────────────────────────────────

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");

  const ActiveTabIcon = TABS.find((t) => t.key === activeTab)?.icon ?? LayoutDashboard;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-200 px-6 h-14 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <ActiveTabIcon className="w-4 h-4 text-slate-400" />
          <span className="text-slate-800 font-medium">
            {TABS.find((t) => t.key === activeTab)?.label}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          시스템 정상 운영 중
        </div>
      </header>

      {/* Tab bar */}
      <div className="bg-white border-b border-slate-200 px-6 flex-shrink-0">
        <nav className="flex gap-0">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                "flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors",
                activeTab === key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {activeTab === "dashboard" && <DashboardTab />}
        {activeTab === "conversations" && <ConversationsTab />}
        {activeTab === "knowledge" && <KnowledgeTab />}
        {activeTab === "settings" && <SettingsTab />}
      </div>
    </div>
  );
}
