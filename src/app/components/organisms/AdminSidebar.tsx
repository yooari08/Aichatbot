import { Link } from "react-router";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { BotBadge } from "@/app/components/atoms/BotBadge";
import { SidebarUserProfile } from "@/app/components/molecules/SidebarUserProfile";
import { ADMIN_CURRENT_USER, NAV } from "@/app/constants/adminData";
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
  return (
    <aside className="w-[240px] flex-shrink-0 flex flex-col bg-[#F8F8F9] border-r border-[#E5E5E5]">
      <div className="bg-white border-b border-[#E5E5E5] px-4 py-4 flex-shrink-0">
        <div className="flex items-center gap-2 font-bold text-[15px] text-[#0A0A0A]">
          <BotBadge />
          어드민 콘솔
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {NAV.map((section) => (
          <div key={section.label}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#878B95] px-3 py-2 mt-2">
              {section.label}
            </div>
            {section.groups.map((group) => {
              const isExpanded = expandedGroups.has(group.key);
              const isGroupActive =
                group.subs.length === 0
                  ? (activeView as string) === group.key
                  : group.subs.some((s) => s.key === activeView);

              return (
                <div key={group.key}>
                  <button
                    onClick={() => {
                      if (group.subs.length > 0) {
                        toggleGroup(group.key);
                      } else {
                        setActiveView(group.key as AdminView);
                      }
                    }}
                    className={cn(
                      "w-full text-left flex items-center justify-between px-3 py-2 rounded-md text-[13px] font-semibold",
                      isGroupActive ? "text-[#2563EB]" : "text-[#0A0A0A]"
                    )}
                  >
                    {group.label}
                    {group.subs.length > 0 &&
                      (isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-[#878B95]" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-[#878B95]" />
                      ))}
                  </button>

                  {isExpanded && group.subs.length > 0 && (
                    <>
                      {group.subs.map((sub) => (
                        <button
                          key={`${group.key}-${sub.key}`}
                          onClick={() => setActiveView(sub.key)}
                          className={cn(
                            "w-full text-left flex items-center gap-1.5 px-3 py-1.5 pl-6 rounded-md text-[12px] transition-all",
                            activeView === sub.key
                              ? "bg-white text-[#2563EB] font-semibold border-l-[3px] border-[#2563EB] pl-[21px] shadow-sm"
                              : "text-[#444] hover:bg-[#F0F2F6]"
                          )}
                        >
                          <span className="text-[#878B95] mr-0.5">·</span>
                          {sub.label}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-[#E5E5E5] bg-white px-4 py-3 flex-shrink-0">
        <SidebarUserProfile
          initials={ADMIN_CURRENT_USER.initials}
          name={ADMIN_CURRENT_USER.name}
          subtitle={ADMIN_CURRENT_USER.role}
          subtitleClassName="text-[#dc2626] font-semibold"
          avatarVariant="dark"
        />
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
