import type { Category, Conversation } from "../types/chat";

export const CHAT_CURRENT_USER = {
  initials: "홍길",
  name: "홍길동",
  role: "일반 사용자",
  hint: "↑ 클릭: 공지사항 · 의견 보내기",
} as const;

export const SUGGESTIONS: { cat: Category; q: string }[] = [
  { cat: "HR", q: "연차는 입사 후\n며칠부터 쓸 수 있나요?" },
  { cat: "복리후생", q: "경조사비 지원 조건과\n절차가 궁금해요" },
  { cat: "프로젝트", q: "요구사항 변경 시\n변경관리 절차는?" },
  { cat: "이슈", q: "재택근무 신청은\n어떻게 하나요?" },
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: "c1",
    title: "연차 사용 규정 문의",
    time: "14:32",
    group: "today",
    category: "HR",
    messages: [
      { id: "m1", text: "연차는 입사 후 며칠부터 쓸 수 있어?", sender: "user", timestamp: new Date(Date.now() - 1000 * 60 * 40) },
      { id: "m2", text: "입사 후 1개월이 경과하면 연차를 사용할 수 있습니다.\n· 1년 미만: 월 1일씩 부여\n· 1년 이상: 연 15일 일괄 부여", sender: "bot", timestamp: new Date(Date.now() - 1000 * 60 * 38), source: "취업규칙_2026.pdf · p.12" },
    ],
  },
  {
    id: "c2",
    title: "재택근무 신청 절차",
    time: "11:05",
    group: "today",
    category: "이슈",
    messages: [
      { id: "m1", text: "재택근무 신청은 어떻게 해?", sender: "user", timestamp: new Date(Date.now() - 1000 * 60 * 120) },
      { id: "m2", text: "그룹웨어 > 근태관리 > 재택근무 신청 메뉴에서 신청하실 수 있습니다. 팀장 승인 후 당일 적용됩니다.", sender: "bot", timestamp: new Date(Date.now() - 1000 * 60 * 119), source: "재택근무_가이드.md" },
    ],
  },
  {
    id: "c3",
    title: "경조사비 신청 방법",
    time: "05/14 09:21",
    group: "yesterday",
    category: "복리후생",
    messages: [
      { id: "m1", text: "경조사비 지원 조건과 절차가 궁금해요", sender: "user", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25) },
      { id: "m2", text: "경조사비는 본인 결혼·부모 사망 등 주요 경조사 발생 시 지원됩니다.\n신청: 그룹웨어 > 복리후생 > 경조사 신청", sender: "bot", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), source: "복리후생_안내서.docx" },
    ],
  },
  {
    id: "c4",
    title: "변경관리 표준 절차",
    time: "05/14 15:47",
    group: "yesterday",
    category: "프로젝트",
    messages: [
      { id: "m1", text: "요구사항 변경 시 변경관리 절차는?", sender: "user", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 22) },
      { id: "m2", text: "요구사항 변경 발생 시 변경요청서(CR) 작성 → PM 검토 → 이해관계자 승인 → 산출물 갱신 순으로 진행합니다.", sender: "bot", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 21), source: "변경관리_절차_v4.pdf · p.3" },
    ],
  },
  {
    id: "c5",
    title: "건강검진 대상 및 절차",
    time: "05/12",
    group: "week",
    category: "복리후생",
    messages: [{ id: "m1", text: "건강검진 대상 및 절차", sender: "user", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 50) }],
  },
  {
    id: "c6",
    title: "출장비 정산 기준",
    time: "05/09",
    group: "week",
    category: "이슈",
    messages: [{ id: "m1", text: "출장비 정산 기준", sender: "user", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 80) }],
  },
];
