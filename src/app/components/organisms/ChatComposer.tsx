import { type KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { Textarea } from "@/app/components/ui/textarea";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/app/lib/utils";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled?: boolean;
};

export function ChatComposer({ value, onChange, onSend, disabled }: Props) {
  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="border-t border-[#E5E5E5] bg-white px-4 py-3">
      <div
        className={cn(
          "flex items-center justify-center gap-2 align-middle bg-[#F8F8F9] border rounded-xl px-3 py-2 transition-all",
          "border-[#E5E5E5] focus-within:border-[#012DFF] focus-within:ring-1 focus-within:ring-[#012DFF]"
        )}
      >
        <Textarea
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKey}
          disabled={disabled}
          placeholder="무엇이든 질문하세요…"
          className="flex-1 border-0 bg-transparent p-0 text-[13px] min-h-0 shadow-none focus-visible:ring-0 focus-visible:border-0 align-middle justify-start items-start"
          style={{ maxHeight: 120, overflowY: "auto", verticalAlign: "middle" }}
        />
        <Button
          onClick={onSend}
          disabled={!value.trim() || disabled}
          size="icon"
          className="size-8 flex-shrink-0 rounded-lg bg-[#012DFF] hover:bg-[#0025d4] disabled:bg-[#E5E5E5] disabled:text-muted-foreground"
        >
          <Send className="size-4" />
        </Button>
      </div>
      <p className="text-center text-[10px] text-muted-foreground/60 mt-1.5">
        AI 답변은 참고용입니다. 중요한 사안은 담당 부서에 확인하세요.
      </p>
    </div>
  );
}
