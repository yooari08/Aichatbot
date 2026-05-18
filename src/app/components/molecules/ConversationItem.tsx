import { useState } from "react";
import { MoreHorizontal, Pin, PinOff } from "lucide-react";
import { useDrag } from "react-dnd";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Input } from "@/app/components/ui/input";
import { cn } from "@/app/lib/utils";
import type { Conversation } from "@/app/types/chat";

export const DRAG_TYPE_CONVERSATION = "CONVERSATION_ITEM";

type Props = {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onPin: (id: string) => void;
  onUnpin: (id: string) => void;
};

export function ConversationItem({
  conversation,
  isActive,
  onClick,
  onRename,
  onDelete,
  onPin,
  onUnpin,
}: Props) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameTitle, setRenameTitle] = useState(conversation.title);

  const [{ isDragging }, drag] = useDrag({
    type: DRAG_TYPE_CONVERSATION,
    item: { id: conversation.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

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
        ref={(node) => {
          drag(node)
        }}
        className={cn(
          "relative flex items-center w-full rounded-lg cursor-grab active:cursor-grabbing",
          isActive && "bg-white shadow-sm",
          isDragging && "opacity-40"
        )}
      >
        <button
          type="button"
          onClick={onClick}
          className={cn(
            "flex-1 min-w-0 text-left px-3 py-2.5 pr-9 rounded-lg text-[14px] font-semibold truncate transition-colors",
            isActive ? "text-[#2563EB]" : "text-foreground hover:bg-accent/50"
          )}
        >
          {conversation.pinned && (
            <Pin className="inline size-3 mr-1.5 text-[#2563EB] -mt-0.5" />
          )}
          {conversation.title}
        </button>

        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="대화 메뉴"
              className="absolute right-1 top-1/2 z-10 -translate-y-1/2 flex size-7 items-center justify-center rounded-md text-[#878B95] hover:bg-[#F0F2F6] hover:text-foreground"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="bottom" className="w-44 z-[200]">
            {conversation.pinned ? (
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  onUnpin(conversation.id);
                }}
              >
                <PinOff className="size-3.5 mr-2" />
                고정 해제
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  onPin(conversation.id);
                }}
              >
                <Pin className="size-3.5 mr-2" />
                고정하기
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                openRename();
              }}
            >
              이름 변경
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onSelect={(e) => {
                e.preventDefault();
                onDelete(conversation.id);
              }}
            >
              삭제
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
