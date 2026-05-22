import { useState, useEffect, Fragment } from "react";
import { ChevronRight } from "lucide-react";
import { AdminSidebar } from "@/app/components/organisms/AdminSidebar";
import { DocumentsView } from "./views/DocumentsView";
import { AnalyticsView } from "./views/AnalyticsView";
import { UsersView } from "./views/UsersView";
import { PlaceholderView } from "./views/PlaceholderView";
import { useAdminNav } from "./useAdminNav";
import {
  adminMainClass,
  adminMainContentClass,
  adminMainContentScrollClass,
  adminMainContentTableClass,
  appShellHeaderBarClass,
} from "@/app/lib/layout";
import { cn } from "@/app/lib/utils";
import { getBreadcrumb } from "@/app/constants/adminData";
import type { AdminView } from "@/app/types/admin";

const COLLAPSE_BREAKPOINT = 1200;

const TABLE_VIEWS: AdminView[] = ["documents", "users", "roles", "auditLog"];

function isTableView(view: AdminView) {
  return TABLE_VIEWS.includes(view);
}

function renderView(view: AdminView) {
  switch (view) {
    case "documents":
      return <DocumentsView />;
    case "analytics":
    case "quality":
      return <AnalyticsView />;
    case "users":
    case "roles":
    case "auditLog":
      return <UsersView />;
    default:
      return <PlaceholderView view={view} />;
  }
}

export default function AdminPage() {
  const { activeView, setActiveView, expandedGroups, toggleGroup } = useAdminNav();
  const [sidebarOpen, setSidebarOpen] = useState(
    () => window.innerWidth > COLLAPSE_BREAKPOINT
  );

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth <= COLLAPSE_BREAKPOINT) setSidebarOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="h-full flex overflow-hidden bg-[#F5F6FA]">
      <AdminSidebar
        activeView={activeView}
        expandedGroups={expandedGroups}
        toggleGroup={toggleGroup}
        setActiveView={setActiveView}
        collapsed={!sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
      />

      <main className={adminMainClass}>
        <div className={cn(appShellHeaderBarClass, "px-8 justify-between shrink-0")}>
          <h1 className="flex items-center gap-1.5">
            {getBreadcrumb(activeView).map((crumb, i, arr) => (
              <Fragment key={crumb}>
                {i > 0 && <ChevronRight className="size-3.5 text-[#9CA3AF]" />}
                <span className={i === arr.length - 1 ? "text-[15px] font-bold text-[#0A0A0A]" : "text-[15px] font-medium text-[#9CA3AF]"}>
                  {crumb}
                </span>
              </Fragment>
            ))}
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-[#878B95]">마지막 업데이트: 방금 전</span>
            <button className="text-[12px] text-[#2563EB] hover:underline">새로고침</button>
          </div>
        </div>

        <div
          className={cn(
            adminMainContentClass,
            isTableView(activeView) ? adminMainContentTableClass : adminMainContentScrollClass
          )}
        >
          {renderView(activeView)}
        </div>
      </main>
    </div>
  );
}
