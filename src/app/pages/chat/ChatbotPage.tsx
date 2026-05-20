import { useEffect, useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { ChatSidebar } from '@/app/components/organisms/ChatSidebar'
import { WelcomeScreen } from '@/app/components/organisms/WelcomeScreen'
import { MessageFeed } from '@/app/components/organisms/MessageFeed'
import { ChatComposer } from '@/app/components/organisms/ChatComposer'
import { Skeleton } from '@/app/components/ui/skeleton'
import { cn } from '@/app/lib/utils'
import { useChat } from './useChat'

const COLLAPSE_BREAKPOINT = 1200;

export default function ChatbotPage() {
  const {
    conversations,
    activeId,
    messages,
    input,
    setInput,
    isTyping,
    isLoadingList,
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
        {/* Sidebar — self-manages width via collapsed prop */}
        <ChatSidebar
          conversations={conversations}
          activeId={activeId}
          onSelectConversation={selectConversation}
          onRenameConversation={renameConversation}
          onDeleteConversation={deleteConversation}
          onNewChat={newChat}
          onPin={pinConversation}
          onUnpin={unpinConversation}
          collapsed={!sidebarOpen}
          isLoadingList={isLoadingList}
          onToggle={() => setSidebarOpen((v) => !v)}
        />

        {/* Main area — chat view scrolls here, not inside MessageFeed */}
        <div
          className={cn(
            'flex-1 flex flex-col min-h-0 relative',
            messages.length > 0 ? 'overflow-y-auto' : 'overflow-hidden'
          )}
        >
          {isLoadingList && messages.length === 0 ? (
            <div className="flex flex-1 flex-col gap-4 px-8 py-10 max-w-[800px] mx-auto w-full">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-16 w-3/4 ml-auto rounded-2xl" />
              <Skeleton className="h-24 w-4/5 rounded-2xl" />
            </div>
          ) : messages.length === 0 ? (
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
