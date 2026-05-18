import { ChatSidebar } from "@/app/components/organisms/ChatSidebar";
import { WelcomeScreen } from "@/app/components/organisms/WelcomeScreen";
import { MessageFeed } from "@/app/components/organisms/MessageFeed";
import { ChatComposer } from "@/app/components/organisms/ChatComposer";
import { useChat } from "./useChat";

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
    handleSend,
    handleSuggestion,
    handleLike,
    handleCopy,
  } = useChat();

  return (
    <div className="h-full flex overflow-hidden bg-white">
      <ChatSidebar
        conversations={conversations}
        activeId={activeId}
        onSelectConversation={selectConversation}
        onRenameConversation={renameConversation}
        onDeleteConversation={deleteConversation}
        onNewChat={newChat}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
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
          <>
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
            />
          </>
        )}
      </div>
    </div>
  );
}
