import type { KbDocument, AdminUser, NavSection } from "../types/admin";

export const ADMIN_CURRENT_USER = {
  initials: "이준",
  name: "이준호",
  role: "슈퍼 어드민",
} as const;

export const DOCUMENTS: KbDocument[] = [
  { name: "취업규칙_2026.pdf", cat: "HR", type: "PDF", ver: "v3", status: "done", date: "2026-01-01", owner: "인사팀" },
  { name: "복리후생_안내서.docx", cat: "복리후생", type: "DOCX", ver: "v2", status: "done", date: "2026-01-15", owner: "인사팀" },
  { name: "변경관리_절차_v4.pdf", cat: "프로젝트", type: "PDF", ver: "v4", status: "processing", date: "2026-03-01", owner: "PMO" },
  { name: "요구사항_가이드.md", cat: "프로젝트", type: "MD", ver: "v1", status: "done", date: "2025-11-01", owner: "PMO" },
  { name: "장비신청_매뉴얼.pdf", cat: "이슈", type: "PDF", ver: "v1", status: "failed", date: "2025-06-01", owner: "IT" },
];

export const USERS: AdminUser[] = [
  { name: "홍길동", email: "hong@company.com", role: "user", dept: "개발팀", lastLogin: "오늘", qCount: 47, active: true },
  { name: "김민지", email: "kim.minji@company.com", role: "editor", dept: "인사팀", lastLogin: "어제", qCount: 12, active: true },
  { name: "이준호", email: "lee.junho@company.com", role: "admin", dept: "IT", lastLogin: "오늘", qCount: 8, active: true },
  { name: "박서연", email: "park.seoyeon@company.com", role: "user", dept: "PMO", lastLogin: "3일 전", qCount: 23, active: false },
  { name: "최현우", email: "choi.hyunwoo@company.com", role: "editor", dept: "PMO", lastLogin: "오늘", qCount: 31, active: true },
];

export const ROLE_LABELS: Record<string, { label: string; cls: string }> = {
  admin: { label: "슈퍼 어드민", cls: "bg-[#FEE2E2] text-[#991b1b]" },
  editor: { label: "콘텐츠 관리자", cls: "bg-[#DBEAFE] text-[#1e40af]" },
  user: { label: "일반 사용자", cls: "bg-[#F0F2F6] text-[#444]" },
};

export const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  done: { label: "색인 완료", cls: "bg-[#DCFCE7] text-[#166534]" },
  processing: { label: "처리 중", cls: "bg-[#FEF3C7] text-[#92400e]" },
  failed: { label: "색인 실패", cls: "bg-[#FEE2E2] text-[#991b1b]" },
};

export const NAV: NavSection[] = [
  {
    label: "콘텐츠 관리",
    groups: [
      { key: "kb", label: "지식베이스", subs: [{ key: "documents", label: "문서 목록" }, { key: "faq", label: "FAQ 플레이어" }, { key: "categories", label: "카테고리 설정" }, { key: "indexLog", label: "색인 로그" }] },
      { key: "monitoring", label: "대화 모니터링", subs: [] },
    ],
  },
  {
    label: "분석",
    groups: [
      { key: "analytics", label: "분석 대시보드", subs: [{ key: "analytics", label: "사용 현황" }, { key: "quality", label: "품질 분석" }] },
    ],
  },
  {
    label: "시스템",
    groups: [
      { key: "users", label: "사용자 관리", subs: [{ key: "users", label: "사용자 목록" }, { key: "roles", label: "역할/권한" }, { key: "auditLog", label: "감사 로그" }] },
      { key: "settings", label: "시스템 설정", subs: [] },
    ],
  },
];

export const CATEGORY_BARS = [
  { name: "HR / 취업규칙", pct: 38, color: "#012DFF" },
  { name: "복리후생", pct: 29, color: "#4C6FD8" },
  { name: "프로젝트 표준", pct: 24, color: "#7C9CF8" },
  { name: "기타", pct: 9, color: "#B0C0F0" },
];

export const TOP_QUESTIONS = [
  { label: "연차 신청 방법", count: 142 },
  { label: "경조사비 지급 기준", count: 98 },
  { label: "변경관리 절차", count: 87 },
  { label: "재택근무 신청", count: 76 },
  { label: "건강검진 대상 및 절차", count: 61 },
];

export const IMPROVEMENT_QUESTIONS: { label: string; tag: "미응답" | "낮은 신뢰도" }[] = [
  { label: "출장비 정산 기준", tag: "미응답" },
  { label: "소프트웨어 라이선스 갱신", tag: "낮은 신뢰도" },
  { label: "팀 OKR 입력 방법", tag: "미응답" },
  { label: "사내 교육 신청", tag: "낮은 신뢰도" },
  { label: "계약직 전환 절차", tag: "낮은 신뢰도" },
];
