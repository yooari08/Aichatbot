import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MessageBubble } from "@/app/components/molecules/MessageBubble";
import { EmailModal } from "@/app/components/molecules/EmailModal";
import { TypingIndicator } from "@/app/components/atoms/TypingIndicator";
import type { Message } from "@/app/types/chat";

type Props = {
  messages: Message[];
  isTyping: boolean;
  likedMessages: Record<string, boolean | null>;
  copiedId: string | null;
  onLike: (id: string, v: boolean) => void;
  onCopy: (id: string, text: string) => void;
};

export function MessageFeed({ messages, isTyping, likedMessages, copiedId, onLike, onCopy }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [emailText, setEmailText] = useState<string | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <>
      <div className="px-6 py-4 flex flex-col gap-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageBubble
                message={msg}
                liked={likedMessages[msg.id] ?? null}
                copiedId={copiedId}
                onLike={onLike}
                onCopy={onCopy}
                onEmail={(text) => setEmailText(text)}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <TypingIndicator />
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      <EmailModal
        open={emailText !== null}
        onOpenChange={(open) => { if (!open) setEmailText(null); }}
        messageText={emailText ?? ""}
      />
    </>
  );
}
