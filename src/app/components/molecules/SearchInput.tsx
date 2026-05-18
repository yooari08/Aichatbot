import { Search } from "lucide-react";
import { Input } from "@/app/components/ui/input";
import { cn } from "@/app/lib/utils";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
};

export function SearchInput({ value, onChange, placeholder = "검색…", className }: Props) {
  return (
    <div className={cn("relative flex items-center", className)}>
      <Search className="absolute left-2.5 size-3.5 text-muted-foreground pointer-events-none" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-8 h-8 text-[12px] bg-[#F8F8F9] border-[#E5E5E5] focus-visible:ring-[#2563EB] focus-visible:border-[#2563EB]"
      />
    </div>
  );
}
