import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ChatSidebar } from "@/app/components/organisms/ChatSidebar";
import { WelcomeScreen } from "@/app/components/organisms/WelcomeScreen";
import { MessageFeed } from "@/app/components/organisms/MessageFeed";
import { ChatComposer } from "@/app/components/organisms/ChatComposer";
import { cn } from "@/app/lib/utils";
import { useChat } from "./useChat";

const COLLAPSE_BREAKPOINT = 1200;

export default function ChatbotPage() {
  const {
    conversations,
    activeId,
    messages,
    input,
    setInput,
    isTyping,
    likedMessages,
    copiedId,
    newChat,
    selectConversation,
    renameConversation,
    deleteConversation,
    pinConversation,
    unpinConversation,
    handleSend,
    handleSuggestion,
    handleLike,
    handleCopy,
  } = useChat();

  const [sidebarOpen, setSidebarOpen] = useState(
    () => window.innerWidth > COLLAPSE_BREAKPOINT
  );

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth <= COLLAPSE_BREAKPOINT) {
        setSidebarOpen(false)
      }
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-full flex overflow-hidden bg-white">
        {/* Sidebar wrapper — width animates open/closed */}
        <div
          className={cn(
            "flex-shrink-0 overflow-hidden transition-[width] duration-200",
            sidebarOpen ? "w-[260px]" : "w-0"
          )}
        >
          <ChatSidebar
            conversations={conversations}
            activeId={activeId}
            onSelectConversation={selectConversation}
            onRenameConversation={renameConversation}
            onDeleteConversation={deleteConversation}
            onNewChat={newChat}
            onPin={pinConversation}
            onUnpin={unpinConversation}
            onToggle={() => setSidebarOpen(false)}
          />
        </div>

        {/* Main area — chat view scrolls here, not inside MessageFeed */}
        <div
          className={cn(
            "flex-1 flex flex-col min-h-0 relative",
            messages.length > 0 ? "overflow-y-auto" : "overflow-hidden"
          )}
        >
          {/* Expand button — visible only when sidebar is collapsed */}
          {!sidebarOpen && (
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="absolute top-3 left-3 z-10 flex size-8 items-center justify-center rounded-lg border border-[#E5E5E5] bg-white shadow-sm hover:bg-[#F8F8F9] transition-colors"
              aria-label="사이드바 펼치기"
            >
              <ChevronRight className="size-4 text-foreground" />
            </button>
          )}

          {messages.length === 0 ? (
            <WelcomeScreen
              onSend={handleSuggestion}
              composer={
                <ChatComposer
                  value={input}
                  onChange={setInput}
                  onSend={handleSend}
                  disabled={isTyping}
                  className="px-0 py-0"
                  showDisclaimer={false}
                />
              }
            />
          ) : (
            /* Chat content — centered, max 800px */
            <div className="flex flex-1 flex-col min-h-full w-full max-w-[800px] mx-auto">
              <MessageFeed
                messages={messages}
                isTyping={isTyping}
                likedMessages={likedMessages}
                copiedId={copiedId}
                onLike={handleLike}
                onCopy={handleCopy}
              />
              <ChatComposer
                value={input}
                onChange={setInput}
                onSend={handleSend}
                disabled={isTyping}
                pinned
              />
            </div>
          )}
        </div>
      </div>
    </DndProvider>
  );
}
