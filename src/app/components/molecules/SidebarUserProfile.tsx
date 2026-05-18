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
};

export function SidebarUserProfile({
  initials,
  name,
  subtitle,
  subtitleClassName = "text-[#878B95] font-normal",
  menuItems,
  avatarVariant = "primary",
  className,
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
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button type="button" className={rowClass}>
            {inner}
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" side="top" className="w-44 p-1">
          <SidebarPopoverMenu items={menuItems} />
        </PopoverContent>
      </Popover>
    );
  }

  return <div className={cn("flex items-center gap-2.5 w-full", className)}>{inner}</div>;
}
