import { useMemo, useState } from 'react'
import { Link } from "react-router";
import { Plus, Pin, ChevronLeft, ChevronRight, Search, MessageSquare } from "lucide-react";
import { useDrop } from "react-dnd";
import { Button } from '@/app/components/ui/button'
import { Skeleton } from '@/app/components/ui/skeleton'
import { BotBadge } from "@/app/components/atoms/BotBadge";
import { SidebarShell } from "@/app/components/organisms/SidebarShell";
import { ConversationItem, DRAG_TYPE_CONVERSATION } from "@/app/components/molecules/ConversationItem";
import { SearchInput } from "@/app/components/molecules/SearchInput";
import { SidebarUserProfile } from "@/app/components/molecules/SidebarUserProfile";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/components/ui/tooltip";
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
  onPin: (id: string) => void
  onUnpin: (id: string) => void
  onToggle: () => void
  collapsed?: boolean
  isLoadingList?: boolean
}

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
      ref={(node) => { drop(node); }}
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
  collapsed = false,
  isLoadingList = false,
}: Props) {
  const { user } = useAuth();
  const handleLogout = useLogout();
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () => conversations.filter((c) => search === '' || c.title.includes(search)),
    [conversations, search]
  )
  const pinnedConvs = useMemo(() => filtered.filter((c) => c.pinned), [filtered])
  const unpinnedConvs = useMemo(() => filtered.filter((c) => !c.pinned), [filtered])

  const handleDropToPin = (id: string) => {
    const conv = conversations.find((c) => c.id === id);
    if (conv && !conv.pinned) onPin(id);
  };

  const profileMenuItems = useMemo(
    () => [
      { label: "공지사항", onClick: () => window.alert("공지사항 기능은 준비 중입니다.") },
      { label: "의견 보내기", onClick: () => window.alert("의견 보내기 기능은 준비 중입니다.") },
      { label: "로그아웃", onClick: handleLogout },
    ],
    [handleLogout]
  );

  const userProfileProps = user
    ? {
        initials: emailToInitials(user.email),
        name: emailToDisplayName(user.email),
        subtitle: getRoleLabel(user.role),
        avatarVariant: "primary" as const,
        menuItems: profileMenuItems,
      }
    : null;

  if (collapsed) {
    return (
      <SidebarShell
        className="w-[56px]"
        header={
          <div className="flex h-full w-full items-center justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={onToggle}
                  className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-[#F0F2F6] hover:text-foreground transition-colors"
                  aria-label="사이드바 펼치기"
                >
                  <ChevronRight className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>사이드바 펼치기</TooltipContent>
            </Tooltip>
          </div>
        }
        footer={
          userProfileProps ? (
            <div className="flex justify-center py-3">
              <SidebarUserProfile
                {...userProfileProps}
                compact
                popoverSide="right"
                popoverAlign="end"
              />
            </div>
          ) : undefined
        }
      >
        <div className="py-2 flex flex-col items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onNewChat}
                aria-label="새 채팅"
                className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-[#EEEFF2] hover:text-foreground transition-colors"
              >
                <Plus className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>새 채팅</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="대화 검색"
                className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-[#EEEFF2] hover:text-foreground transition-colors"
                onClick={onToggle}
              >
                <Search className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>대화 검색</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="대화 목록"
                className={cn(
                  "flex size-9 items-center justify-center rounded-lg transition-colors",
                  activeId
                    ? "bg-[#EEF2FF] text-[#2563EB]"
                    : "text-muted-foreground hover:bg-[#EEEFF2] hover:text-foreground"
                )}
                onClick={onToggle}
              >
                <MessageSquare className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>대화 목록</TooltipContent>
          </Tooltip>
        </div>
      </SidebarShell>
    );
  }

  return (
    <>
      <SidebarShell
        className="w-[260px]"
        headerClassName="h-auto max-h-none items-start"
        header={
          <div className="px-4 py-3 flex flex-col gap-3 w-full">
            <div className="flex items-center gap-1">
              <Link
                to="/"
                onClick={onNewChat}
                className="flex-1 flex items-center justify-center gap-2 font-bold text-[15px] text-foreground rounded-md hover:bg-[#F8F8F9] py-1 transition-colors"
              >
                <BotBadge />
                <span className="align-middle">{DEFAULT_CHATBOT_TITLE}</span>
              </Link>
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
        }
        footer={
          <div className="px-4 py-3">
            {userProfileProps && <SidebarUserProfile {...userProfileProps} />}
            {user?.role === "admin" && (
              <Link
                to="/admin"
                className="mt-2 block text-center text-[11px] text-[#2563EB] border border-dashed border-[#2563EB] rounded-lg py-1.5 bg-[#EEF2FF] hover:bg-[#E0E8FF] transition-colors"
              >
                어드민 콘솔 →
              </Link>
            )}
          </div>
        }
      >
        {/* Conversation list */}
        <div className="px-2 py-2">
          {isLoadingList ? (
            <div className="flex flex-col gap-2 px-2 py-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <>
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
            <p className="text-[12px] text-muted-foreground text-center py-8">
              {search ? '검색 결과 없음' : '대화가 없습니다'}
            </p>
          )}
            </>
          )}
        </div>
      </SidebarShell>

    </>
  );
}
