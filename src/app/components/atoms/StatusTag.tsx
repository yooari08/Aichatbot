import { Badge } from "@/app/components/ui/badge";
import { cn } from "@/app/lib/utils";

export type StatusVariant = "success" | "warning" | "danger" | "info" | "gray";

const VARIANTS: Record<StatusVariant, string> = {
  success: "bg-[#DCFCE7] text-[#166534]",
  warning: "bg-[#FEF9C3] text-[#854d0e]",
  danger:  "bg-[#FEE2E2] text-[#991b1b]",
  info:    "bg-[#EEF2FF] text-[#2563EB]",
  gray:    "bg-[#F3F4F6] text-[#374151]",
};

type Props = { label: string; variant: StatusVariant; className?: string };

export function StatusTag({ label, variant, className }: Props) {
  return (
    <Badge
      className={cn(
        "border-0 rounded-full text-[11px] font-semibold px-2 py-0.5",
        VARIANTS[variant],
        className
      )}
    >
      {label}
    </Badge>
  );
}
