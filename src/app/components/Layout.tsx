import { Outlet, Link, useLocation } from "react-router";
import { MessageSquare, LayoutDashboard, ChevronRight, HelpCircle } from "lucide-react";
import Logo from "./Logo";
import { cn } from "./ui/utils";

const NAV_ITEMS = [
  { path: "/", icon: MessageSquare, label: "챗봇" },
  { path: "/admin", icon: LayoutDashboard, label: "어드민" },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="size-full flex">
      {/* Left sidebar */}
      <aside className="w-[220px] flex-shrink-0 bg-white border-r border-slate-200 flex flex-col z-10">
        {/* Logo */}
        <div className="px-5 h-16 flex items-center border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Logo className="w-8 h-8" />
            <div>
              <div className="text-[15px] font-semibold text-slate-900 leading-tight tracking-tight">
                MYChat
              </div>
              <div className="text-[11px] text-slate-400 leading-tight">
                사내 AI 어시스턴트
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon
                  className={cn(
                    "w-[18px] h-[18px] flex-shrink-0 transition-colors",
                    isActive
                      ? "text-blue-600"
                      : "text-slate-400 group-hover:text-slate-500"
                  )}
                />
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Help */}
        <div className="px-3 pb-2">
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-700 w-full transition-colors">
            <HelpCircle className="w-[18px] h-[18px] text-slate-400" />
            도움말
          </button>
        </div>

        {/* User profile */}
        <div className="border-t border-slate-100 px-4 py-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
              김
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-900 truncate">
                김담당자
              </div>
              <div className="text-xs text-slate-400 truncate">인사팀</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
