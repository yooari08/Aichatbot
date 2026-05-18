import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Input } from "@/app/components/ui/input";
import { cn } from "@/app/lib/utils";
import type { Conversation } from "@/app/types/chat";

type Props = {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
};

export function ConversationItem({
  conversation,
  isActive,
  onClick,
  onRename,
  onDelete,
}: Props) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameTitle, setRenameTitle] = useState(conversation.title);

  const openRename = () => {
    setRenameTitle(conversation.title);
    setRenameOpen(true);
  };

  const submitRename = () => {
    const trimmed = renameTitle.trim();
    if (!trimmed) return;
    onRename(conversation.id, trimmed);
    setRenameOpen(false);
  };

  return (
    <>
      <div
        className={cn(
          "flex items-center w-full rounded-lg",
          isActive && "bg-white shadow-sm"
        )}
      >
        <button
          type="button"
          onClick={onClick}
          className={cn(
            "flex-1 min-w-0 text-left px-3 py-2.5 rounded-lg text-[14px] font-semibold truncate transition-colors",
            isActive ? "text-[#012DFF]" : "text-foreground hover:bg-accent/50"
          )}
        >
          {conversation.title}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 flex-shrink-0 text-[#878B95] hover:text-foreground"
              onClick={(e) => e.stopPropagation()}
              aria-label="대화 메뉴"
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={openRename}>
              <Pencil />
              채팅방 이름 변경
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(conversation.id)}
            >
              <Trash2 />
              채팅 삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>채팅방 이름 변경</DialogTitle>
          </DialogHeader>
          <Input
            value={renameTitle}
            onChange={(e) => setRenameTitle(e.target.value)}
            placeholder="채팅방 이름"
            onKeyDown={(e) => {
              if (e.key === "Enter") submitRename();
            }}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameOpen(false)}>
              취소
            </Button>
            <Button onClick={submitRename} disabled={!renameTitle.trim()}>
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
