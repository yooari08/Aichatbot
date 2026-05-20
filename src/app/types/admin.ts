export type AdminView =
  | "documents" | "faq" | "categories" | "indexLog"
  | "monitoring" | "analytics" | "quality"
  | "users" | "roles" | "auditLog" | "settings";

export type DocumentStatus = "done" | "processing" | "failed";
export type UserRole = "admin" | "editor" | "user";

export interface KbDocument {
  name: string;
  cat: string;
  type: string;
  ver: string;
  status: DocumentStatus;
  date: string;
  owner: string;
}

export interface AdminUser {
  name: string;
  email: string;
  role: UserRole;
  dept: string;
  lastLogin: string;
  qCount: number;
  active: boolean;
}

import type { LucideIcon } from "lucide-react";

export type NavSubItem = { key: AdminView; label: string };

export type NavGroup = {
  key: string;
  label: string;
  icon?: LucideIcon;
  subs: NavSubItem[];
};

export type NavSection = {
  label: string;
  groups: NavGroup[];
};

export const VIEW_LABELS: Record<AdminView, string> = {
  documents: "문서 목록",
  faq: "FAQ 플레이어",
  categories: "카테고리 설정",
  indexLog: "색인 로그",
  monitoring: "대화 모니터링",
  analytics: "사용 현황",
  quality: "품질 분석",
  users: "사용자 목록",
  roles: "역할/권한",
  auditLog: "감사 로그",
  settings: "시스템 설정",
};
