import { Card } from "@/app/components/ui/card";
import { cn } from "@/app/lib/utils";

type Props = {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

/** Admin 목록 화면 — 툴바 고정, 테이블 영역만 세로 스크롤 */
export function AdminTablePanel({ title, actions, children, className }: Props) {
  return (
    <div className={cn("flex h-full min-h-0 flex-col gap-4", className)}>
      <div className="flex shrink-0 items-center justify-between">
        <h2 className="text-[16px] font-bold text-foreground">{title}</h2>
        {actions != null && <div className="flex gap-2">{actions}</div>}
      </div>
      <Card className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden p-0">
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </Card>
    </div>
  );
}
