import { Badge } from "@/app/components/ui/badge";
import { cn } from "@/app/lib/utils";
import { CAT_STYLE } from "@/app/types/chat";
import type { Category } from "@/app/types/chat";

type Props = { category: Category; className?: string };

export function CategoryBadge({ category, className }: Props) {
  return (
    <Badge
      className={cn(
        "border-0 rounded text-[10px] font-bold px-1.5 py-0.5",
        CAT_STYLE[category].badge,
        className
      )}
    >
      {category}
    </Badge>
  );
}
