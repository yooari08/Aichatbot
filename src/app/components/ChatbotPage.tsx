import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Plus,
  Search,
  Clock,
  ChevronRight,
  Paperclip,
  Mic,
  X,
  MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/button";
import { cn } from "./ui/utils";
import Logo from "./Logo";
import { TypingIndicator } from "./TypingIndicator";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  preview: string;
  time: string;
  group: "today" | "yesterday" | "week";
  messages: Message[];
}

const SUGGESTED_CATEGORIES = [
  {
    label: "인사·복지",
    color: "bg-blue-50 border-blue-100 hover:bg-blue-100",
    iconColor: "text-blue-600",
    questions: ["연차 신청은 어떻게 하나요?", "복리후생 혜택을 알려주세요"],
  },
  {
    label: "IT·시스템",
    color: "bg-violet-50 border-violet-100 hover:bg-violet-100",
    iconColor: "text-violet-600",
    questions: ["VPN 접속 방법을 알려주세요", "사내 메일 설정 방법은?"],
  },
  {
    label: "시설·공간",
    color: "bg-emerald-50 border-emerald-100 hover:bg-emerald-100",
    iconColor: "text-emerald-600",
    questions: ["회의실 예약은 어떻게 하나요?", "주차 이용 안내"],
  },
  {
    label: "급여·재무",
    color: "bg-amber-50 border-amber-100 hover:bg-amber-100",
    iconColor: "text-amber-600",
    questions: ["급여 지급일이 언제인가요?", "경비 처리 방법을 알려주세요"],
  },
];

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: "c1",
    title: "연차 신청 방법",
    preview: "그룹웨어 > 근태관리 > 휴가신청 메뉴에서...",
    time: "10:23",
    group: "today",
    messages: [
      {
        id: "m1",
        text: "안녕하세요! MYChat입니다. 무엇을 도와드릴까요?",
        sender: "bot",
        timestamp: new Date(Date.now() - 1000 * 60 * 40),
      },
      {
        id: "m2",
        text: "연차 신청은 어떻게 하나요?",
        sender: "user",
        timestamp: new Date(Date.now() - 1000 * 60 * 38),
      },
      {
        id: "m3",
        text: "연차/휴가 신청은 그룹웨어 포털에서 하실 수 있습니다.\n\n신청 절차:\n1. 그룹웨어 접속\n2. 근태관리 > 휴가신청\n3. 날짜 및 종류 선택 후 신청\n4. 팀장 승인 완료 시 자동 처리됩니다.\n\n연차 잔여일 조회도 동일 메뉴에서 확인하실 수 있습니다.",
        sender: "bot",
        timestamp: new Date(Date.now() - 1000 * 60 * 37),
      },
    ],
  },
  {
    id: "c2",
    title: "VPN 접속 문의",
    preview: "IT 포털 > 소프트웨어 > VPN 클라이언트...",
    time: "09:11",
    group: "today",
    messages: [
      {
        id: "m1",
        text: "안녕하세요! MYChat입니다. 무엇을 도와드릴까요?",
        sender: "bot",
        timestamp: new Date(Date.now() - 1000 * 60 * 65),
      },
      {
        id: "m2",
        text: "VPN 접속 방법을 알려주세요",
        sender: "user",
        timestamp: new Date(Date.now() - 1000 * 60 * 63),
      },
      {
        id: "m3",
        text: "VPN 접속 방법을 안내드립니다.\n\n설치:\n1. IT 포털 > 소프트웨어 > VPN 클라이언트 다운로드\n2. 설치 후 사번으로 로그인\n\n접속 정보:\n- 서버: vpn.company.com\n- 포트: 443\n\n문제 발생 시 IT 헬프데스크(내선: 1234)로 문의 주세요.",
        sender: "bot",
        timestamp: new Date(Date.now() - 1000 * 60 * 62),
      },
    ],
  },
  {
    id: "c3",
    title: "회의실 예약",
    preview: "사내 예약 시스템을 통해 예약하실 수 있습니다.",
    time: "어제",
    group: "yesterday",
    messages: [
      {
        id: "m1",
        text: "안녕하세요! MYChat입니다. 무엇을 도와드릴까요?",
        sender: "bot",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26),
      },
      {
        id: "m2",
        text: "회의실 예약은 어떻게 하나요?",
        sender: "user",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25),
      },
      {
        id: "m3",
        text: "회의실 예약은 사내 예약 시스템을 통해 하실 수 있습니다.\n\n예약 방법:\n1. 인트라넷 > 공간예약 접속\n2. 날짜 및 시간 선택\n3. 회의실 선택 후 목적 입력\n4. 예약 완료\n\n회의실 현황은 각 층 디지털 안내판에서도 확인 가능합니다.",
        sender: "bot",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25),
      },
    ],
  },
  {
    id: "c4",
    title: "급여 지급일",
    preview: "급여는 매월 25일에 지급됩니다.",
    time: "어제",
    group: "yesterday",
    messages: [
      {
        id: "m1",
        text: "안녕하세요! MYChat입니다. 무엇을 도와드릴까요?",
        sender: "bot",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 30),
      },
      {
        id: "m2",
        text: "급여 지급일이 언제인가요?",
        sender: "user",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 29),
      },
      {
        id: "m3",
        text: "급여는 매월 25일 지급됩니다. 25일이 주말이나 공휴일인 경우 직전 평일에 지급됩니다.\n\n급여 명세서는 그룹웨어 > 급여관리 > 급여명세서에서 확인하실 수 있습니다.",
        sender: "bot",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 29),
      },
    ],
  },
  {
    id: "c5",
    title: "복리후생 혜택",
    preview: "건강검진, 자기계발비, 도서구매비 지원...",
    time: "화요일",
    group: "week",
    messages: [
      {
        id: "m1",
        text: "안녕하세요! MYChat입니다. 무엇을 도와드릴까요?",
        sender: "bot",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 50),
      },
      {
        id: "m2",
        text: "복리후생 혜택을 알려주세요",
        sender: "user",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 49),
      },
      {
        id: "m3",
        text: "주요 복리후생 혜택을 안내드립니다.\n\n건강/의료\n- 건강검진 (연 1회)\n- 단체상해보험\n\n교육/성장\n- 자기계발비 지원 (연 50만원)\n- 도서 구매비 지원\n\n여가/생활\n- 가족 경조사 지원\n- 사내 동호회 지원\n\n자세한 사항은 인트라넷 > 복리후생 메뉴를 참고하세요.",
        sender: "bot",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 49),
      },
    ],
  },
];

function getBotResponse(message: string): string {
  const msg = message.toLowerCase();

  if (msg.includes("연차") || msg.includes("휴가") || msg.includes("반차")) {
    return "연차/휴가 신청은 그룹웨어 포털에서 하실 수 있습니다.\n\n신청 절차:\n1. 그룹웨어 접속\n2. 근태관리 > 휴가신청\n3. 날짜 및 종류 선택 후 신청\n4. 팀장 승인 완료 시 자동 처리됩니다.\n\n연차 잔여일 조회도 동일 메뉴에서 확인하실 수 있습니다.";
  }
  if (msg.includes("급여") || msg.includes("월급") || msg.includes("지급일")) {
    return "급여는 매월 25일 지급됩니다. 25일이 주말이나 공휴일인 경우 직전 평일에 지급됩니다.\n\n급여 명세서는 그룹웨어 > 급여관리 > 급여명세서에서 확인하실 수 있습니다.";
  }
  if (msg.includes("회의실") || msg.includes("예약")) {
    return "회의실 예약은 사내 예약 시스템을 통해 하실 수 있습니다.\n\n예약 방법:\n1. 인트라넷 > 공간예약 접속\n2. 날짜 및 시간 선택\n3. 회의실 선택 후 목적 입력\n4. 예약 완료\n\n회의실 현황은 각 층 디지털 안내판에서도 확인 가능합니다.";
  }
  if (msg.includes("vpn") || msg.includes("재택") || msg.includes("원격")) {
    return "VPN 접속 방법을 안내드립니다.\n\n설치:\n1. IT 포털 > 소프트웨어 > VPN 클라이언트 다운로드\n2. 설치 후 사번으로 로그인\n\n접속 정보:\n- 서버: vpn.company.com\n- 포트: 443\n\n문제 발생 시 IT 헬프데스크(내선: 1234)로 문의 주세요.";
  }
  if (msg.includes("복리후생") || msg.includes("복지") || msg.includes("혜택")) {
    return "주요 복리후생 혜택을 안내드립니다.\n\n건강/의료\n- 건강검진 (연 1회)\n- 단체상해보험\n\n교육/성장\n- 자기계발비 지원 (연 50만원)\n- 도서 구매비 지원\n\n여가/생활\n- 가족 경조사 지원\n- 사내 동호회 지원\n\n자세한 사항은 인트라넷 > 복리후생 메뉴를 참고하세요.";
  }
  if (msg.includes("경비") || msg.includes("법인카드") || msg.includes("지출")) {
    return "경비 처리 방법을 안내드립니다.\n\n법인카드 사용:\n1. 재무팀에서 법인카드 신청 및 발급\n2. 사용 후 3영업일 이내 증빙 첨부\n3. 그룹웨어 > 재무 > 경비정산에서 신청\n\n개인 경비 처리:\n1. 영수증 원본 보관\n2. 그룹웨어 > 재무 > 지출결의서 작성\n3. 팀장 승인 후 익월 급여 지급\n\n자세한 내용은 재무팀(내선: 2345)으로 문의하세요.";
  }
  if (
    msg.includes("메일") ||
    msg.includes("이메일") ||
    msg.includes("아웃룩")
  ) {
    return "사내 메일 설정 방법을 안내드립니다.\n\nOutlook 설정:\n1. IT 포털 > 소프트웨어 > Outlook 다운로드\n2. 설치 후 사번@company.com으로 로그인\n3. Exchange 서버: mail.company.com\n\n모바일 설정:\n- iOS: 기본 메일 앱에서 Exchange 계정 추가\n- Android: Outlook 앱 설치 후 동일 계정 입력\n\n문제 발생 시 IT 헬프데스크(내선: 1234)로 연락주세요.";
  }
  if (msg.includes("주차")) {
    return "주차 이용 안내입니다.\n\n임직원 주차:\n- 지하 1~3층: 임직원 전용 구역\n- 월 주차권: 총무팀에서 신청 (선착순)\n- 주차 비용: 무료\n\n방문객 주차:\n- 지하 1층 A구역\n- 1일 최대 4시간 무료\n\n총무팀(내선: 3456)으로 문의하시면 자세히 안내해 드립니다.";
  }
  if (msg.includes("안녕") || msg.includes("반갑")) {
    return "안녕하세요! 저는 MYChat, 사내 AI 어시스턴트입니다.\n\n인사, IT, 시설, 복지, 재무 등 다양한 분야의 궁금한 점을 편하게 물어봐 주세요.";
  }

  return `"${message}"에 대해 답변 드리겠습니다.\n\n현재 베타 서비스 중으로 일부 질문에 대한 답변이 제한될 수 있습니다. 정확한 정보가 필요하신 경우 해당 부서로 직접 문의해 주시기 바랍니다.\n\n다른 궁금한 점이 있으시면 언제든지 질문해 주세요!`;
}

function formatMessageText(text: string) {
  return text.split("\n").map((line, i) => (
    <span key={i}>
      {line}
      {i < text.split("\n").length - 1 && <br />}
    </span>
  ));
}

const GROUPS = [
  { key: "today", label: "오늘" },
  { key: "yesterday", label: "어제" },
  { key: "week", label: "이번 주" },
] as const;

export default function ChatbotPage() {
  const [conversations, setConversations] = useState<Conversation[]>(
    INITIAL_CONVERSATIONS
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const startNewConversation = () => {
    setActiveId(null);
    setMessages([]);
    setInput("");
    inputRef.current?.focus();
  };

  const selectConversation = (conv: Conversation) => {
    setActiveId(conv.id);
    setMessages(conv.messages);
  };

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const userMsg: Message = {
        id: Date.now().toString(),
        text: trimmed,
        sender: "user",
        timestamp: new Date(),
      };

      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setInput("");
      setIsTyping(true);

      // If no active conversation, create a new one
      if (!activeId) {
        const newConv: Conversation = {
          id: `new-${Date.now()}`,
          title: trimmed.length > 20 ? trimmed.slice(0, 20) + "..." : trimmed,
          preview: "",
          time: new Date().toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          group: "today",
          messages: newMessages,
        };
        setActiveId(newConv.id);
        setConversations((prev) => [newConv, ...prev]);
      }

      setTimeout(
        () => {
          const botMsg: Message = {
            id: (Date.now() + 1).toString(),
            text: getBotResponse(trimmed),
            sender: "bot",
            timestamp: new Date(),
          };
          const finalMessages = [...newMessages, botMsg];
          setMessages(finalMessages);
          setIsTyping(false);

          // Update conversation
          setConversations((prev) =>
            prev.map((c) => {
              const targetId = activeId ?? `new-${Date.now() - 700}`;
              if (c.id === targetId || (activeId === null && c === prev[0])) {
                return {
                  ...c,
                  preview: botMsg.text.slice(0, 50) + "...",
                  messages: finalMessages,
                };
              }
              return c;
            })
          );
        },
        600 + Math.random() * 400
      );
    },
    [messages, activeId]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const filteredConversations = conversations.filter(
    (c) =>
      c.title.includes(searchQuery) || c.preview.includes(searchQuery)
  );

  const isWelcome = activeId === null && messages.length === 0;

  return (
    <div className="h-full flex">
      {/* Conversation sidebar */}
      <aside className="w-[260px] flex-shrink-0 border-r border-slate-200 bg-slate-50 flex flex-col">
        {/* Header */}
        <div className="px-4 pt-4 pb-3 flex-shrink-0">
          <Button
            onClick={startNewConversation}
            className="w-full justify-start gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm"
            variant="outline"
            size="sm"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            새 대화 시작
          </Button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="대화 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {GROUPS.map(({ key, label }) => {
            const group = filteredConversations.filter(
              (c) => c.group === key
            );
            if (group.length === 0) return null;
            return (
              <div key={key} className="mb-3">
                <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {label}
                </div>
                <div className="space-y-0.5">
                  {group.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => selectConversation(conv)}
                      className={cn(
                        "w-full text-left px-3 py-2.5 rounded-lg transition-all group",
                        activeId === conv.id
                          ? "bg-white shadow-sm border border-slate-200"
                          : "hover:bg-slate-100"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-0.5">
                        <span
                          className={cn(
                            "text-sm font-medium truncate",
                            activeId === conv.id
                              ? "text-slate-900"
                              : "text-slate-700"
                          )}
                        >
                          {conv.title}
                        </span>
                        <span className="text-[11px] text-slate-400 flex-shrink-0 mt-0.5">
                          {conv.time}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate leading-normal">
                        {conv.preview}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col bg-white min-w-0">
        {isWelcome ? (
          /* Welcome screen */
          <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-2xl"
            >
              <div className="flex flex-col items-center mb-10">
                <div className="mb-5">
                  <Logo className="w-16 h-16" />
                </div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-2 text-center">
                  무엇을 도와드릴까요?
                </h2>
                <p className="text-sm text-slate-500 text-center">
                  사내 시스템, HR, IT, 시설 등 궁금한 점을 자유롭게 질문해
                  주세요.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {SUGGESTED_CATEGORIES.map((cat) => (
                  <div
                    key={cat.label}
                    className={cn(
                      "border rounded-xl p-4 transition-colors",
                      cat.color
                    )}
                  >
                    <div
                      className={cn(
                        "text-xs font-semibold mb-2.5",
                        cat.iconColor
                      )}
                    >
                      {cat.label}
                    </div>
                    <div className="space-y-1.5">
                      {cat.questions.map((q) => (
                        <button
                          key={q}
                          onClick={() => sendMessage(q)}
                          className="w-full text-left flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900 group"
                        >
                          <ChevronRight
                            className={cn(
                              "w-3.5 h-3.5 flex-shrink-0 transition-transform group-hover:translate-x-0.5",
                              cat.iconColor
                            )}
                          />
                          <span className="leading-snug">{q}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="h-14 border-b border-slate-100 px-6 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-700">
                  {activeId
                    ? conversations.find((c) => c.id === activeId)?.title ??
                      "대화"
                    : "새로운 대화"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={startNewConversation}
                  className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  title="새 대화"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={cn(
                      "flex items-end gap-2",
                      msg.sender === "user" ? "flex-row-reverse" : ""
                    )}
                  >
                    {msg.sender === "bot" && (
                      <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 text-[10px] font-bold">
                          M
                        </span>
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[72%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                        msg.sender === "user"
                          ? "bg-blue-600 text-white rounded-br-sm shadow-sm"
                          : "bg-slate-50 border border-slate-200 text-slate-800 rounded-bl-sm"
                      )}
                    >
                      <div>{formatMessageText(msg.text)}</div>
                      <div
                        className={cn(
                          "text-[11px] mt-1.5",
                          msg.sender === "user"
                            ? "text-blue-200"
                            : "text-slate-400"
                        )}
                      >
                        {msg.timestamp.toLocaleTimeString("ko-KR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <TypingIndicator />
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </>
        )}

        {/* Input area */}
        <div className="border-t border-slate-100 px-6 py-4 flex-shrink-0 bg-white">
          <div className="flex items-end gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력하세요... (Shift+Enter로 줄바꿈)"
              className="flex-1 bg-transparent resize-none focus:outline-none text-sm text-slate-800 placeholder:text-slate-400 max-h-[120px] leading-relaxed"
              style={{ height: "auto" }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 120) + "px";
              }}
            />
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md transition-colors">
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isTyping}
                className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center transition-all flex-shrink-0",
                  input.trim() && !isTyping
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                )}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 text-center">
            MYChat은 실수를 할 수 있습니다. 중요한 정보는 반드시 해당 부서에
            확인하세요.
          </p>
        </div>
      </div>
    </div>
  );
}
