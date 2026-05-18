export type Category = "HR" | "복리후생" | "프로젝트" | "이슈";
export type ConversationGroup = "today" | "yesterday" | "week";

export interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  source?: string;
}

export interface Conversation {
  id: string;
  title: string;
  time: string;
  group: ConversationGroup;
  category: Category;
  messages: Message[];
}

export const CONVERSATION_GROUPS: { key: ConversationGroup; label: string }[] = [
  { key: "today", label: "오늘" },
  { key: "yesterday", label: "어제" },
  { key: "week", label: "지난 대화" },
];

export const CAT_STYLE: Record<Category, { badge: string; chip: string }> = {
  HR: { badge: "bg-[#EEF2FF] text-[#012DFF]", chip: "bg-[#EEF2FF] text-[#012DFF]" },
  복리후생: { badge: "bg-[#ECFCCB] text-[#4d7c0f]", chip: "bg-[#ECFCCB] text-[#4d7c0f]" },
  프로젝트: { badge: "bg-[#FEF3C7] text-[#92400e]", chip: "bg-[#FEF3C7] text-[#92400e]" },
  이슈: { badge: "bg-[#FCE7F3] text-[#be185d]", chip: "bg-[#FCE7F3] text-[#be185d]" },
};
