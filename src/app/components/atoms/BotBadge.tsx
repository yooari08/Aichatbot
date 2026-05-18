import { Badge } from "@/app/components/ui/badge";
import { cn } from "@/app/lib/utils";

type Props = { className?: string };

export function BotBadge({ className }: Props) {
  return (
    <Badge
      className={cn(
        "bg-[#012DFF] text-white text-[10px] font-bold tracking-wide border-0 rounded px-1.5 py-0.5",
        className
      )}
    >
      BOT
    </Badge>
  );
}
