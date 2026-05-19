import { Link } from "react-router";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { BotBadge } from "@/app/components/atoms/BotBadge";
import { SidebarUserProfile } from "@/app/components/molecules/SidebarUserProfile";
import { useAuth } from "@/app/contexts/AuthContext";
import { useLogout } from "@/app/hooks/useLogout";
import { emailToDisplayName, emailToInitials, getRoleLabel } from "@/app/lib/auth/userDisplay";
import { NAV } from "@/app/constants/adminData";
import type { AdminView } from "@/app/types/admin";

export type { AdminView };

type AdminSidebarProps = {
  activeView: AdminView;
  expandedGroups: Set<string>;
  toggleGroup: (key: string) => void;
  setActiveView: (view: AdminView) => void;
};

export function AdminSidebar({
  activeView,
  expandedGroups,
  toggleGroup,
  setActiveView,
}: AdminSidebarProps) {
  const { user } = useAuth();
  const handleLogout = useLogout();

  return (
    <aside className="w-[240px] flex-shrink-0 flex flex-col bg-[#F8F8F9] border-r border-[#E5E5E5]">
      <div className="bg-white border-b border-[#E5E5E5] px-4 py-4 flex-shrink-0">
        <div className="flex items-center gap-2 font-bold text-[15px] text-[#0A0A0A]">
          <BotBadge />
          어드민 콘솔
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-2">
        {NAV.map((section) => (
          <div key={section.label} className="mb-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-3 py-1">
              {section.label}
            </div>
            {section.groups.map((group) => {
              const isExpanded = expandedGroups.has(group.key);
              const isLeafActive =
                group.subs.length === 0 && (activeView as string) === group.key;

              return (
                <div key={group.key}>
                  {group.subs.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.key)}
                      className="w-full text-left flex items-center justify-between px-3 py-1.5 rounded-lg text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {group.label}
                      {isExpanded ? (
                        <ChevronDown className="size-3.5 shrink-0" />
                      ) : (
                        <ChevronRight className="size-3.5 shrink-0" />
                      )}
                    </button>
                  ) : (
                    <div
                      className={cn(
                        "relative flex items-center w-full rounded-lg",
                        isLeafActive && "bg-white"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveView(group.key as AdminView)}
                        className={cn(
                          "flex-1 min-w-0 w-full text-left px-3 py-2.5 rounded-lg text-[14px] font-normal truncate transition-colors",
                          isLeafActive
                            ? "text-[#2563EB]"
                            : "text-foreground hover:bg-accent/50"
                        )}
                      >
                        {group.label}
                      </button>
                    </div>
                  )}

                  {isExpanded &&
                    group.subs.map((sub) => {
                      const isActive = activeView === sub.key;
                      return (
                        <div
                          key={`${group.key}-${sub.key}`}
                          className={cn(
                            "relative flex items-center w-full rounded-lg",
                            isActive && "bg-white"
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => setActiveView(sub.key)}
                            className={cn(
                              "flex-1 min-w-0 w-full text-left px-3 py-2.5 rounded-lg text-[14px] font-normal truncate transition-colors",
                              isActive
                                ? "text-[#2563EB]"
                                : "text-foreground hover:bg-accent/50"
                            )}
                          >
                            {sub.label}
                          </button>
                        </div>
                      );
                    })}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-[#E5E5E5] bg-white px-4 py-3 flex-shrink-0">
        {user && (
          <SidebarUserProfile
            initials={emailToInitials(user.email)}
            name={emailToDisplayName(user.email)}
            subtitle={getRoleLabel(user.role)}
            subtitleClassName="text-[#dc2626] font-semibold"
            avatarVariant="dark"
            menuItems={[{ label: "로그아웃", onClick: handleLogout }]}
          />
        )}
        <Link
          to="/"
          className="mt-2 block text-center text-[11px] text-[#2563EB] border border-dashed border-[#2563EB] rounded-lg py-1.5 bg-[#EEF2FF] hover:bg-[#E0E8FF] transition-colors"
        >
          ← 챗봇으로 돌아가기
        </Link>
      </div>
    </aside>
  );
}
