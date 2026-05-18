import { VIEW_LABELS } from "@/app/types/admin";
import type { AdminView } from "@/app/types/admin";

type Props = { view: AdminView };

export function PlaceholderView({ view }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-24">
      <div className="w-14 h-14 rounded-2xl bg-[#EEF2FF] flex items-center justify-center mb-4">
        <span className="text-2xl">🚧</span>
      </div>
      <h2 className="text-[16px] font-bold text-[#0A0A0A] mb-1">{VIEW_LABELS[view]}</h2>
      <p className="text-[13px] text-[#878B95]">이 기능은 현재 개발 중입니다.</p>
    </div>
  );
}
