import { Link } from "react-router";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { BotBadge } from "@/app/components/atoms/BotBadge";
import { SidebarShell } from "@/app/components/organisms/SidebarShell";
import { SidebarUserProfile } from "@/app/components/molecules/SidebarUserProfile";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/components/ui/tooltip";
import { useAuth } from "@/app/contexts/AuthContext";
import { useLogout } from "@/app/hooks/useLogout";
import { emailToDisplayName, emailToInitials, getRoleLabel } from "@/app/lib/auth/userDisplay";
import { NAV } from "@/app/constants/adminData";
import type { AdminView } from "@/app/types/admin";

export type { AdminView };

type Props = {
  activeView: AdminView;
  expandedGroups: Set<string>;
  toggleGroup: (key: string) => void;
  setActiveView: (view: AdminView) => void;
  collapsed: boolean;
  onToggle: () => void;
};

export function AdminSidebar({
  activeView,
  expandedGroups,
  toggleGroup,
  setActiveView,
  collapsed,
  onToggle,
}: Props) {
  const { user } = useAuth();
  const handleLogout = useLogout();

  const allGroups = NAV.flatMap((s) => s.groups);

  const header = collapsed ? (
    <div className="flex h-full w-full items-center justify-center">
      <button
        type="button"
        onClick={onToggle}
        className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-[#F0F2F6] hover:text-foreground transition-colors"
        aria-label="사이드바 펼치기"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  ) : (
    <div className="flex h-full w-full items-center gap-2 px-4">
      <div className="flex items-center gap-2 flex-1 font-bold text-[15px] text-[#0A0A0A]">
        <BotBadge />
        어드민 콘솔
      </div>
      <button
        type="button"
        onClick={onToggle}
        className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-[#F0F2F6] hover:text-foreground transition-colors"
        aria-label="사이드바 접기"
      >
        <ChevronLeft className="size-4" />
      </button>
    </div>
  );

  const footer = collapsed ? (
    user ? (
      <div className="py-3 flex justify-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={handleLogout}
              className="size-8 rounded-full bg-[#1e293b] flex items-center justify-center text-white text-[11px] font-bold hover:opacity-80 transition-opacity"
            >
              {emailToInitials(user.email)}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>로그아웃</TooltipContent>
        </Tooltip>
      </div>
    ) : null
  ) : (
    <div className="px-4 py-3">
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
  );

  /* ── Icon-only nav (collapsed) ── */
  const collapsedNav = (
    <div className="py-2 flex flex-col items-center gap-0.5">
      {allGroups.map((group) => {
        const Icon = group.icon;
        const isActive =
          group.subs.length === 0
            ? (activeView as string) === group.key
            : group.subs.some((s) => s.key === activeView);

        return (
          <Tooltip key={group.key}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => {
                  const target =
                    group.subs.length > 0
                      ? group.subs[0].key
                      : (group.key as AdminView);
                  setActiveView(target);
                }}
                className={cn(
                  "flex size-9 items-center justify-center rounded-lg transition-colors",
                  isActive
                    ? "bg-[#EEF2FF] text-[#2563EB]"
                    : "text-muted-foreground hover:bg-[#EEEFF2] hover:text-foreground"
                )}
              >
                {Icon && <Icon className="size-4" />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              {group.label}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );

  /* ── Full nav (expanded) ── */
  const expandedNav = (
    <div className="px-2 py-2">
      {NAV.map((section) => (
        <div key={section.label} className="mb-4">
          {/* Section label */}
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-3 py-1 mb-0.5">
            {section.label}
          </div>

          {section.groups.map((group) => {
            const isExpanded = expandedGroups.has(group.key);
            const isLeafActive =
              group.subs.length === 0 && (activeView as string) === group.key;
            const hasActiveChild = group.subs.some((s) => s.key === activeView);
            const Icon = group.icon;

            return (
              <div key={group.key} className="mb-0.5">
                {group.subs.length > 0 ? (
                  <>
                    {/* Group button (expandable) */}
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.key)}
                      className={cn(
                        "w-full flex items-center justify-start gap-2 px-3 py-2 rounded-lg text-left text-[14px] font-semibold transition-colors",
                        hasActiveChild
                          ? "text-[#2563EB]"
                          : "text-[#374151] hover:bg-[#EEEFF2] hover:text-foreground"
                      )}
                    >
                      {Icon && (
                        <Icon
                          className={cn(
                            "size-3.5 shrink-0",
                            hasActiveChild ? "text-[#2563EB]" : "text-[#6B7280]"
                          )}
                        />
                      )}
                      <span className="flex-1 text-left">{group.label}</span>
                      {isExpanded ? (
                        <ChevronDown className="size-3 text-[#9CA3AF] shrink-0" />
                      ) : (
                        <ChevronRight className="size-3 text-[#9CA3AF] shrink-0" />
                      )}
                    </button>

                    {/* Sub-items with left border */}
                    {isExpanded && (
                      <div className="ml-[22px] border-l-2 border-[#E5E7EB] mt-0.5 mb-1">
                        {group.subs.map((sub) => {
                          const isActive = activeView === sub.key;
                          return (
                            <button
                              key={sub.key}
                              type="button"
                              onClick={() => setActiveView(sub.key)}
                              className={cn(
                                "w-full text-left pl-4 pr-3 py-1.5 rounded-r-lg text-[13px] transition-colors",
                                isActive
                                  ? "text-[#2563EB] font-medium bg-[#EEF2FF]"
                                  : "text-[#6B7280] hover:text-foreground hover:bg-accent/50"
                              )}
                            >
                              {sub.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  /* Leaf group (no subs, directly navigable) */
                  <button
                    type="button"
                    onClick={() => setActiveView(group.key as AdminView)}
                    className={cn(
                      "w-full flex items-center justify-start gap-2 px-3 py-2 rounded-lg text-left text-[14px] font-semibold transition-colors",
                      isLeafActive
                        ? "bg-white text-[#2563EB]"
                        : "text-[#374151] hover:bg-[#EEEFF2] hover:text-foreground"
                    )}
                  >
                    {Icon && (
                      <Icon
                        className={cn(
                          "size-3.5 shrink-0",
                          isLeafActive ? "text-[#2563EB]" : "text-[#6B7280]"
                        )}
                      />
                    )}
                    {group.label}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );

  return (
    <SidebarShell
      header={header}
      footer={footer}
      className={cn(
        "transition-[width] duration-200 overflow-hidden",
        collapsed ? "w-[56px]" : "w-[240px]"
      )}
    >
      {collapsed ? collapsedNav : expandedNav}
    </SidebarShell>
  );
}
