import { Card } from "@/app/components/ui/card";
import { CategoryBadge } from "@/app/components/atoms/CategoryBadge";
import type { Category } from "@/app/types/chat";

type Props = {
  cat: Category;
  q: string;
  onClick: (q: string) => void;
};

export function SuggestionCard({ cat, q, onClick }: Props) {
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onClick(q.replace(/\n/g, " "))}
      onKeyDown={(e) => e.key === "Enter" && onClick(q.replace(/\n/g, " "))}
      className="cursor-pointer gap-2 p-3 border-[#E5E5E5] hover:shadow-md hover:-translate-y-0.5 transition-all"
    >
      <CategoryBadge category={cat} />
      <p className="text-[12px] text-[#333] leading-relaxed whitespace-pre-line">{q}</p>
    </Card>
  );
}
