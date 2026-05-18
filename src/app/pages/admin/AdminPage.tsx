import { AdminSidebar } from "@/app/components/organisms/AdminSidebar";
import { DocumentsView } from "./views/DocumentsView";
import { AnalyticsView } from "./views/AnalyticsView";
import { UsersView } from "./views/UsersView";
import { PlaceholderView } from "./views/PlaceholderView";
import { useAdminNav } from "./useAdminNav";
import { VIEW_LABELS } from "@/app/types/admin";
import type { AdminView } from "@/app/types/admin";

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

  return (
    <div className="h-full flex overflow-hidden bg-[#F5F6FA]">
      <AdminSidebar
        activeView={activeView}
        expandedGroups={expandedGroups}
        toggleGroup={toggleGroup}
        setActiveView={setActiveView}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="bg-white border-b border-[#E5E5E5] px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-[15px] font-bold text-[#0A0A0A]">{VIEW_LABELS[activeView]}</h1>
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-[#878B95]">마지막 업데이트: 방금 전</span>
            <button className="text-[12px] text-[#012DFF] hover:underline">새로고침</button>
          </div>
        </div>

        <div className="px-8 py-6">{renderView(activeView)}</div>
      </main>
    </div>
  );
}
