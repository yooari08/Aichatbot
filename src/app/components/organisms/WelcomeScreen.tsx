import type { ReactNode } from "react";
import Logo from "@/app/components/atoms/Logo";
import { SuggestionCard } from "@/app/components/molecules/SuggestionCard";
import { SUGGESTIONS } from "@/app/constants/chatData";

type Props = {
  onSend: (text: string) => void;
  composer: ReactNode;
};

export function WelcomeScreen({ onSend, composer }: Props) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 overflow-y-auto">
      <Logo className="w-14 h-14 mb-4" />
      <h1 className="text-[22px] font-bold text-[#0A0A0A] mb-1">무엇을 도와드릴까요?</h1>
      <p className="text-[13px] text-[#878B95] mb-8">
        사내 규정, 복리후생, 프로젝트 문서를 빠르게 찾아드립니다.
      </p>

      <div className="w-full max-w-[480px] mb-6">{composer}</div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-[480px]">
        {SUGGESTIONS.map((s) => (
          <SuggestionCard key={s.q} cat={s.cat} q={s.q} onClick={onSend} />
        ))}
      </div>
    </div>
  );
}
