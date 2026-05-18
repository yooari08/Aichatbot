import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { BotBadge } from "@/app/components/atoms/BotBadge";
import { ConversationItem } from "@/app/components/molecules/ConversationItem";
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
import { CONVERSATION_GROUPS } from "@/app/types/chat";
import { CHAT_CURRENT_USER } from "@/app/constants/chatData";
import type { Conversation } from "@/app/types/chat";

const DEFAULT_CHATBOT_TITLE = "사내 챗봇";

type Props = {
  conversations: Conversation[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onRenameConversation: (id: string, title: string) => void;
  onDeleteConversation: (id: string) => void;
  onNewChat: () => void;
};

export function ChatSidebar({
  conversations,
  activeId,
  onSelectConversation,
  onRenameConversation,
  onDeleteConversation,
  onNewChat,
}: Props) {
  const [search, setSearch] = useState("");
  const [chatbotTitle, setChatbotTitle] = useState(DEFAULT_CHATBOT_TITLE);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameTitle, setRenameTitle] = useState(chatbotTitle);
  const [headerPopoverOpen, setHeaderPopoverOpen] = useState(false);

  const filtered = conversations.filter(
    (c) => search === "" || c.title.includes(search)
  );

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
    <aside className="w-[260px] flex-shrink-0 flex flex-col bg-[#F8F8F9] border-r border-[#E5E5E5]">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E5E5] px-4 py-3 flex-shrink-0 flex flex-col gap-3">
        <Popover open={headerPopoverOpen} onOpenChange={setHeaderPopoverOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex items-center justify-center gap-2 w-full font-bold text-[15px] text-foreground rounded-md hover:bg-[#F8F8F9] py-1 transition-colors"
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

        <Button
          variant="outline"
          onClick={onNewChat}
          className="w-full justify-start gap-2 h-9 text-[13px] font-semibold border-[#E5E5E5] bg-white hover:bg-[#F8F8F9]"
        >
          <Plus className="size-4 text-[#012DFF]" />
          새 채팅
        </Button>

        <SearchInput value={search} onChange={setSearch} placeholder="대화 검색…" />
      </div>

      {/* Conversation list */}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        {CONVERSATION_GROUPS.map(({ key, label }) => {
          const group = filtered.filter((c) => c.group === key);
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
        <SidebarUserProfile
          initials={CHAT_CURRENT_USER.initials}
          name={CHAT_CURRENT_USER.name}
          subtitle={CHAT_CURRENT_USER.role}
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
          ]}
        />
        <a
          href="/admin"
          className="mt-2 block text-center text-[11px] text-[#012DFF] border border-dashed border-[#012DFF] rounded-lg py-1.5 bg-[#EEF2FF] hover:bg-[#E0E8FF] transition-colors"
        >
          어드민 콘솔 →
        </a>
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
