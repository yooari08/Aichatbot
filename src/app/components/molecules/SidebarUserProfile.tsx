import { UserAvatar } from "@/app/components/atoms/UserAvatar";
import { SidebarPopoverMenu, type SidebarPopoverMenuItem } from "@/app/components/molecules/SidebarPopoverMenu";
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover";
import { cn } from "@/app/lib/utils";

type Props = {
  initials: string;
  name: string;
  subtitle: string;
  subtitleClassName?: string;
  menuItems?: SidebarPopoverMenuItem[];
  avatarVariant?: "primary" | "dark" | "muted";
  className?: string;
  /** 아이콘만 표시 (접힌 사이드바) */
  compact?: boolean;
  popoverSide?: "top" | "right" | "bottom" | "left";
  popoverAlign?: "start" | "center" | "end";
};

export function SidebarUserProfile({
  initials,
  name,
  subtitle,
  subtitleClassName = "text-[#878B95] font-normal",
  menuItems,
  avatarVariant = "primary",
  className,
  compact = false,
  popoverSide = "top",
  popoverAlign = "start",
}: Props) {
  const inner = (
    <>
      <UserAvatar initials={initials} variant={avatarVariant} />
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-[#0A0A0A]">{name}</div>
        <div className={cn("text-[11px]", subtitleClassName)}>{subtitle}</div>
      </div>
    </>
  );

  const rowClass = cn(
    "flex items-center gap-2.5 w-full text-left rounded-md hover:bg-[#F8F8F9] transition-colors -mx-1 px-1 py-0.5 cursor-pointer",
    className
  );

  if (menuItems && menuItems.length > 0) {
    const triggerClass = compact
      ? cn(
          "flex size-9 items-center justify-center rounded-lg hover:bg-[#F0F2F6] transition-colors cursor-pointer",
          className
        )
      : rowClass;

    const triggerContent = compact ? (
      <UserAvatar initials={initials} variant={avatarVariant} />
    ) : (
      inner
    );

    return (
      <Popover>
        <PopoverTrigger asChild>
          <button type="button" className={triggerClass} aria-label={`${name} 메뉴`}>
            {triggerContent}
          </button>
        </PopoverTrigger>
        <PopoverContent align={popoverAlign} side={popoverSide} className="w-44 p-1">
          {compact && (
            <div className="px-2 py-1.5 border-b border-[#E5E5E5] mb-1">
              <div className="text-[13px] font-semibold text-[#0A0A0A] truncate">{name}</div>
              <div className={cn("text-[11px] truncate", subtitleClassName)}>{subtitle}</div>
            </div>
          )}
          <SidebarPopoverMenu items={menuItems} />
        </PopoverContent>
      </Popover>
    );
  }

  return <div className={cn("flex items-center gap-2.5 w-full", className)}>{inner}</div>;
}
