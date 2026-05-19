import { ThumbsUp, ThumbsDown, Copy, Check, FileText, Mail } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/components/ui/tooltip";
import { BotBadge } from "@/app/components/atoms/BotBadge";
import { formatMessageTime } from "@/app/lib/formatMessageTime";
import { cn } from "@/app/lib/utils";
import { BRAND_PRIMARY_RGB } from "@/app/constants/brand";
import type { Message } from "@/app/types/chat";

function formatText(text: string) {
  return text.split("\n").map((line, i, arr) =>
    line === "" ? (
      <br key={i} />
    ) : (
      <span key={i}>
        {line}
        {i < arr.length - 1 && <br />}
      </span>
    )
  );
}

type ActionButtonProps = {
  tooltip: string;
  onClick: () => void;
  active?: boolean;
  activeClassName?: string;
  children: React.ReactNode;
};

function ActionButton({ tooltip, onClick, active, activeClassName, children }: ActionButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClick}
          className={cn("size-7 rounded-md text-muted-foreground", active && activeClassName)}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{tooltip}</TooltipContent>
    </Tooltip>
  );
}

type Props = {
  message: Message;
  liked: boolean | null;
  copiedId: string | null;
  onLike: (id: string, v: boolean) => void;
  onCopy: (id: string, text: string) => void;
  onEmail: (text: string) => void;
};

export function MessageBubble({ message, liked, copiedId, onLike, onCopy, onEmail }: Props) {
  const isBot = message.sender === "bot";
  const isCopied = copiedId === message.id;
  const timeLabel = formatMessageTime(message.timestamp);

  if (!isBot) {
    return (
      <div className="flex flex-col items-end gap-1">
        <div
          className="max-w-[75%] text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-[16px] leading-relaxed"
          style={{ backgroundColor: BRAND_PRIMARY_RGB }}
        >
          {formatText(message.text)}
        </div>
        <span className="text-[10px] text-[#878B95] px-1">{timeLabel}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 mb-1">
        <BotBadge />
        <span className="text-[11px] text-muted-foreground">사내 챗봇</span>
        <span className="text-[10px] text-[#878B95] ml-1">{timeLabel}</span>
      </div>

      <div className="max-w-[80%] bg-white rounded-2xl rounded-tl-sm pt-3 text-[16px] leading-[1.7] text-foreground">
        {formatText(message.text)}
        {message.source && (
          <div className="mt-2.5 flex items-center gap-1.5 rounded-md bg-[#F8F8F9] px-2.5 py-2">
            <FileText className="size-3 shrink-0 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground">{message.source}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-0.5">
        <ActionButton
          tooltip="도움이 됐어요"
          onClick={() => onLike(message.id, true)}
          active={liked === true}
          activeClassName="text-[#2563EB] bg-[#EFF6FF]"
        >
          <ThumbsUp className="size-3.5" />
        </ActionButton>
        <ActionButton
          tooltip="도움이 안 됐어요"
          onClick={() => onLike(message.id, false)}
          active={liked === false}
          activeClassName="text-[#dc2626] bg-[#FEE2E2]"
        >
          <ThumbsDown className="size-3.5" />
        </ActionButton>
        <ActionButton
          tooltip={isCopied ? "복사됨" : "복사"}
          onClick={() => onCopy(message.id, message.text)}
          active={isCopied}
          activeClassName="text-[#166534] bg-[#DCFCE7]"
        >
          {isCopied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </ActionButton>
        <ActionButton tooltip="이메일로 공유" onClick={() => onEmail(message.text)}>
          <Mail className="size-3.5" />
        </ActionButton>
      </div>
    </div>
  );
}
