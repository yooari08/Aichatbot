import { useState } from "react";
import { Link } from "react-router";
import { Plus, Pin, ChevronLeft } from "lucide-react";
import { useDrop } from "react-dnd";
import { Button } from "@/app/components/ui/button";
import { BotBadge } from "@/app/components/atoms/BotBadge";
import { ConversationItem, DRAG_TYPE_CONVERSATION } from "@/app/components/molecules/ConversationItem";
import { SearchInput } from "@/app/components/molecules/SearchInput";
import { SidebarPopoverMenu } from "@/app/components/molecules/SidebarPopoverMenu";
import { SidebarUserProfile } from "@/app/components/molecules/SidebarUserProfile";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover";
import { cn } from "@/app/lib/utils";
import { useAuth } from "@/app/contexts/AuthContext";
import { useLogout } from "@/app/hooks/useLogout";
import { emailToDisplayName, emailToInitials, getRoleLabel } from "@/app/lib/auth/userDisplay";
import { CONVERSATION_GROUPS } from "@/app/types/chat";
import type { Conversation } from "@/app/types/chat";

const DEFAULT_CHATBOT_TITLE = "사내 챗봇";

type Props = {
  conversations: Conversation[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onRenameConversation: (id: string, title: string) => void;
  onDeleteConversation: (id: string) => void;
  onNewChat: () => void;
  onPin: (id: string) => void;
  onUnpin: (id: string) => void;
  onToggle: () => void;
};

function PinnedDropZone({
  onDrop,
  children,
  isEmpty,
}: {
  onDrop: (id: string) => void;
  children: React.ReactNode;
  isEmpty: boolean;
}) {
  const [{ isOver }, drop] = useDrop({
    accept: DRAG_TYPE_CONVERSATION,
    drop: (item: { id: string }) => onDrop(item.id),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={(node) => {
        drop(node)
      }}
      className={cn(
        "min-h-[44px] rounded-lg border-2 border-dashed transition-colors",
        isOver
          ? "border-[#2563EB] bg-[#EFF6FF]"
          : isEmpty
          ? "border-[#CBD5E1] bg-[#F8FAFF]"
          : "border-transparent"
      )}
    >
      {isEmpty ? (
        <p className={cn(
          "text-[11px] text-center py-3 px-2 transition-colors",
          isOver ? "text-[#2563EB] font-medium" : "text-muted-foreground"
        )}>
          {isOver ? "여기에 놓아 고정하세요" : "채팅을 드래그하여 고정하세요"}
        </p>
      ) : (
        children
      )}
    </div>
  );
}

export function ChatSidebar({
  conversations,
  activeId,
  onSelectConversation,
  onRenameConversation,
  onDeleteConversation,
  onNewChat,
  onPin,
  onUnpin,
  onToggle,
}: Props) {
  const { user } = useAuth();
  const handleLogout = useLogout();
  const [search, setSearch] = useState("");
  const [chatbotTitle, setChatbotTitle] = useState(DEFAULT_CHATBOT_TITLE);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameTitle, setRenameTitle] = useState(chatbotTitle);
  const [headerPopoverOpen, setHeaderPopoverOpen] = useState(false);

  const filtered = conversations.filter(
    (c) => search === "" || c.title.includes(search)
  );

  const pinnedConvs = filtered.filter((c) => c.pinned);
  const unpinnedConvs = filtered.filter((c) => !c.pinned);

  const handleDropToPin = (id: string) => {
    const conv = conversations.find((c) => c.id === id);
    if (conv && !conv.pinned) onPin(id);
  };

  const openHeaderRename = () => {
    setRenameTitle(chatbotTitle);
    setRenameOpen(true);
    setHeaderPopoverOpen(false);
  };

  const submitHeaderRename = () => {
    const trimmed = renameTitle.trim();
    if (!trimmed) return;
    setChatbotTitle(trimmed);
    setRenameOpen(false);
  };

  const handleHeaderDelete = () => {
    setChatbotTitle(DEFAULT_CHATBOT_TITLE);
    setHeaderPopoverOpen(false);
  };

  return (
    <aside className="w-[260px] h-full flex-shrink-0 flex flex-col bg-[#F8F8F9] border-r border-[#E5E5E5]">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E5E5] px-4 py-3 flex-shrink-0 flex flex-col gap-3">
        <div className="flex items-center gap-1">
        <Popover open={headerPopoverOpen} onOpenChange={setHeaderPopoverOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-2 font-bold text-[15px] text-foreground rounded-md hover:bg-[#F8F8F9] py-1 transition-colors"
            >
              <BotBadge />
              <span className="align-middle">{chatbotTitle}</span>
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-44 p-1">
            <SidebarPopoverMenu
              items={[
                { label: "이름 변경", onClick: openHeaderRename },
                {
                  label: "삭제",
                  variant: "destructive",
                  onClick: handleHeaderDelete,
                },
              ]}
            />
          </PopoverContent>
        </Popover>
        <button
          type="button"
          onClick={onToggle}
          className="flex size-7 flex-shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-[#F0F2F6] hover:text-foreground"
          aria-label="사이드바 접기"
        >
          <ChevronLeft className="size-4" />
        </button>
        </div>

        <Button
          variant="outline"
          onClick={onNewChat}
          className="w-full justify-start gap-2 h-9 text-[13px] font-semibold border-[#E5E5E5] bg-white hover:bg-[#F8F8F9]"
        >
          <Plus className="size-4 text-[#2563EB]" />
          새 채팅
        </Button>

        <SearchInput value={search} onChange={setSearch} placeholder="대화 검색…" />
      </div>

      {/* Conversation list */}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        {/* Pinned section */}
        <div className="mb-3">
          <div className="flex items-center gap-1.5 px-3 py-1">
            <Pin className="size-3 text-muted-foreground" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              고정됨
            </span>
          </div>
          <PinnedDropZone onDrop={handleDropToPin} isEmpty={pinnedConvs.length === 0}>
            {pinnedConvs.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={activeId === conv.id}
                onClick={() => onSelectConversation(conv.id)}
                onRename={onRenameConversation}
                onDelete={onDeleteConversation}
                onPin={onPin}
                onUnpin={onUnpin}
              />
            ))}
          </PinnedDropZone>
        </div>

        {/* Grouped conversations (unpinned) */}
        {CONVERSATION_GROUPS.map(({ key, label }) => {
          const group = unpinnedConvs.filter((c) => c.group === key);
          if (group.length === 0) return null;
          return (
            <div key={key} className="mb-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-3 py-1">
                {label}
              </div>
              {group.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  isActive={activeId === conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  onRename={onRenameConversation}
                  onDelete={onDeleteConversation}
                  onPin={onPin}
                  onUnpin={onUnpin}
                />
              ))}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <p className="text-[12px] text-muted-foreground text-center py-8">검색 결과 없음</p>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-[#E5E5E5] bg-white px-4 py-3 flex-shrink-0">
        {user && (
          <SidebarUserProfile
            initials={emailToInitials(user.email)}
            name={emailToDisplayName(user.email)}
            subtitle={getRoleLabel(user.role)}
            avatarVariant="primary"
            menuItems={[
              {
                label: "공지사항",
                onClick: () => window.alert("공지사항 기능은 준비 중입니다."),
              },
              {
                label: "의견 보내기",
                onClick: () => window.alert("의견 보내기 기능은 준비 중입니다."),
              },
              {
                label: "로그아웃",
                onClick: handleLogout,
              },
            ]}
          />
        )}
        {user?.role === "admin" && (
          <Link
            to="/admin"
            className="mt-2 block text-center text-[11px] text-[#2563EB] border border-dashed border-[#2563EB] rounded-lg py-1.5 bg-[#EEF2FF] hover:bg-[#E0E8FF] transition-colors"
          >
            어드민 콘솔 →
          </Link>
        )}
      </div>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>챗봇 이름 변경</DialogTitle>
          </DialogHeader>
          <Input
            value={renameTitle}
            onChange={(e) => setRenameTitle(e.target.value)}
            placeholder="챗봇 이름"
            onKeyDown={(e) => {
              if (e.key === "Enter") submitHeaderRename();
            }}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameOpen(false)}>
              취소
            </Button>
            <Button onClick={submitHeaderRename} disabled={!renameTitle.trim()}>
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
