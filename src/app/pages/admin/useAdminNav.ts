import { useState, useCallback } from "react";
import type { AdminView } from "@/app/types/admin";

export function useAdminNav(initial: AdminView = "documents") {
  const [activeView, setActiveView] = useState<AdminView>(initial);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(["kb", "analytics", "users"])
  );

  const toggleGroup = useCallback((key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  return { activeView, setActiveView, expandedGroups, toggleGroup };
}
