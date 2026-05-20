import { appShellHeaderBarClass } from "@/app/lib/layout";
import { cn } from "@/app/lib/utils";

type Props = {
  header: React.ReactNode;
  headerClassName?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function SidebarShell({ header, headerClassName, footer, children, className }: Props) {
  return (
    <aside
      className={cn(
        "h-full flex-shrink-0 flex flex-col bg-[#F8F8F9] border-r border-[#E5E5E5]",
        className
      )}
    >
      <div className={cn(appShellHeaderBarClass, headerClassName)}>{header}</div>
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
      {footer != null && (
        <div className="border-t border-[#E5E5E5] bg-white flex-shrink-0">
          {footer}
        </div>
      )}
    </aside>
  );
}
