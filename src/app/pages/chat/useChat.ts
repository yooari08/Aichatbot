import { useState, useCallback } from "react";
import type { Conversation, Message } from "@/app/types/chat";
import { INITIAL_CONVERSATIONS } from "@/app/constants/chatData";
import { getBotResponse, detectCategory } from "@/app/constants/chatResponses";

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [likedMessages, setLikedMessages] = useState<Record<string, boolean | null>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;
  const messages = activeConversation?.messages ?? [];

  const newChat = useCallback(() => setActiveId(null), []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping) return;

      const userMsg: Message = {
        id: `m-${Date.now()}`,
        text: trimmed,
        sender: "user",
        timestamp: new Date(),
      };

      let targetId = activeId;

      if (!targetId) {
        const category = detectCategory(trimmed);
        const newConv: Conversation = {
          id: `c-${Date.now()}`,
          title: trimmed.length > 20 ? trimmed.slice(0, 20) + "…" : trimmed,
          time: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
          group: "today",
          category,
          messages: [userMsg],
        };
        setConversations((prev) => [newConv, ...prev]);
        setActiveId(newConv.id);
        targetId = newConv.id;
      } else {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === targetId ? { ...c, messages: [...c.messages, userMsg] } : c
          )
        );
      }

      setIsTyping(true);

      await new Promise((r) => setTimeout(r, 900 + Math.random() * 600));

      const { text: botText, source } = getBotResponse(trimmed);
      const botMsg: Message = {
        id: `m-${Date.now()}`,
        text: botText,
        sender: "bot",
        timestamp: new Date(),
        source,
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === targetId ? { ...c, messages: [...c.messages, botMsg] } : c
        )
      );
      setIsTyping(false);
    },
    [activeId, isTyping]
  );

  const handleSend = useCallback(() => {
    sendMessage(input);
    setInput("");
  }, [input, sendMessage]);

  const handleSuggestion = useCallback(
    (q: string) => {
      sendMessage(q);
    },
    [sendMessage]
  );

  const handleLike = useCallback((id: string, value: boolean) => {
    setLikedMessages((prev) => ({
      ...prev,
      [id]: prev[id] === value ? null : value,
    }));
  }, []);

  const handleCopy = useCallback((id: string, text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const renameConversation = useCallback((id: string, title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: trimmed } : c))
    );
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    setActiveId((prev) => (prev === id ? null : prev));
  }, []);

  const pinConversation = useCallback((id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pinned: true } : c))
    );
  }, []);

  const unpinConversation = useCallback((id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pinned: false } : c))
    );
  }, []);

  return {
    conversations,
    activeId,
    messages,
    input,
    setInput,
    isTyping,
    likedMessages,
    copiedId,
    newChat,
    selectConversation: setActiveId,
    renameConversation,
    deleteConversation,
    pinConversation,
    unpinConversation,
    handleSend,
    handleSuggestion,
    handleLike,
    handleCopy,
  };
}
