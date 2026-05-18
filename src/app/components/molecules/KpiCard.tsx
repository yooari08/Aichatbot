import { Card, CardContent } from "@/app/components/ui/card";
import { cn } from "@/app/lib/utils";

type Props = {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
  className?: string;
};

export function KpiCard({ label, value, sub, accent, className }: Props) {
  return (
    <Card className={cn("gap-0 p-4", className)}>
      <CardContent className="p-0 flex flex-col gap-1">
        <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
        <span className={cn("text-[28px] font-bold leading-none", accent ?? "text-foreground")}>
          {value}
        </span>
        {sub && <span className="text-[11px] text-muted-foreground">{sub}</span>}
      </CardContent>
    </Card>
  );
}
