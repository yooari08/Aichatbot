import { cn } from "@/app/lib/utils";

export type SidebarPopoverMenuItem = {
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive";
};

type Props = {
  items: SidebarPopoverMenuItem[];
};

export function SidebarPopoverMenu({ items }: Props) {
  return (
    <div className="flex flex-col gap-0.5">
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={item.onClick}
          className={cn(
            "w-full text-left rounded-sm px-2.5 py-2 text-[13px] font-medium transition-colors",
            item.variant === "destructive"
              ? "text-destructive hover:bg-destructive/10"
              : "text-foreground hover:bg-accent"
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
