import type { Category } from "../types/chat";

export function getBotResponse(message: string): { text: string; source?: string } {
  const msg = message.toLowerCase();
  if (msg.includes("연차") || msg.includes("휴가") || msg.includes("반차"))
    return { text: "입사 후 1개월이 경과하면 연차를 사용할 수 있습니다.\n· 1년 미만: 월 1일씩 부여\n· 1년 이상: 연 15일 일괄 부여\n\n원칙적으로 3영업일 전까지 신청해야 하며, 긴급 사유 시 당일 신청 가능(팀장 승인 필요)합니다.", source: "취업규칙_2026.pdf · p.12" };
  if (msg.includes("경조사") || msg.includes("복리후생") || msg.includes("복지") || msg.includes("혜택"))
    return { text: "경조사비는 본인 결혼·부모 사망 등 주요 경조사 발생 시 지원됩니다.\n\n주요 복리후생:\n· 건강검진 (연 1회)\n· 자기계발비 지원 (연 50만원)\n· 도서 구매비 지원\n· 가족 경조사 지원\n\n신청: 그룹웨어 > 복리후생 > 경조사 신청", source: "복리후생_안내서.docx" };
  if (msg.includes("변경관리") || msg.includes("요구사항") || msg.includes("cr"))
    return { text: "요구사항 변경 발생 시:\n1. 변경요청서(CR) 작성\n2. PM 검토 및 영향도 분석\n3. 이해관계자 승인\n4. 산출물 및 일정 갱신\n\n긴급 변경의 경우 PM 구두 승인 후 사후 문서화 가능합니다.", source: "변경관리_절차_v4.pdf · p.3" };
  if (msg.includes("재택") || msg.includes("원격") || msg.includes("wfh"))
    return { text: "재택근무는 주 최대 2일 신청 가능합니다.\n\n신청 방법:\n그룹웨어 > 근태관리 > 재택근무 신청\n\n팀장 승인 후 당일 적용되며, 전일 18시 이전 신청이 원칙입니다.", source: "재택근무_가이드.md" };
  if (msg.includes("급여") || msg.includes("월급") || msg.includes("지급일"))
    return { text: "급여는 매월 25일 지급됩니다. 25일이 주말이나 공휴일인 경우 직전 평일에 지급됩니다.\n\n급여 명세서는 그룹웨어 > 급여관리 > 급여명세서에서 확인하실 수 있습니다.", source: "급여규정_2026.pdf · p.4" };
  if (msg.includes("회의실") || msg.includes("예약"))
    return { text: "회의실 예약은 인트라넷 > 공간예약에서 하실 수 있습니다.\n\n예약 방법:\n1. 날짜 및 시간 선택\n2. 회의실 선택 후 목적 입력\n3. 예약 완료 (즉시 확정)" };
  if (msg.includes("출장") || msg.includes("출장비"))
    return { text: "출장비 정산 기준:\n· 국내 출장: 일당 3만원\n· 교통비: 실비 정산\n· 숙박비: 서울 8만원, 지방 7만원 한도\n\n출장 복귀 후 5영업일 이내 정산 신청해야 합니다.", source: "출장규정_2026.pdf · p.7" };
  return { text: `"${message}"에 대해 답변드립니다.\n\n현재 베타 서비스 중으로 일부 질문에 대한 답변이 제한될 수 있습니다. 정확한 정보가 필요하신 경우 해당 부서로 직접 문의해 주시기 바랍니다.` };
}

export function detectCategory(text: string): Category {
  const t = text.toLowerCase();
  if (t.includes("연차") || t.includes("휴가") || t.includes("반차") || t.includes("급여") || t.includes("인사")) return "HR";
  if (t.includes("복리") || t.includes("복지") || t.includes("경조") || t.includes("건강검진")) return "복리후생";
  if (t.includes("변경") || t.includes("요구사항") || t.includes("프로젝트") || t.includes("cr")) return "프로젝트";
  return "이슈";
}

