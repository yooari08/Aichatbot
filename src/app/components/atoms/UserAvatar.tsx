import { Avatar, AvatarFallback } from "@/app/components/ui/avatar";
import { cn } from "@/app/lib/utils";

type Variant = "primary" | "dark" | "muted";

const BG: Record<Variant, string> = {
  primary: "bg-[#012DFF] text-white",
  dark:    "bg-[#111] text-white",
  muted:   "bg-[#9ca3af] text-white",
};

type Props = {
  initials: string;
  variant?: Variant;
  size?: "sm" | "md";
  className?: string;
};

export function UserAvatar({ initials, variant = "dark", size = "md", className }: Props) {
  return (
    <Avatar className={cn(size === "sm" ? "size-7" : "size-9", className)}>
      <AvatarFallback className={cn("text-[11px] font-bold", BG[variant])}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
