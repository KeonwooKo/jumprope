import Link from "next/link";
import { CharacterPreview3D } from "@/components/CharacterPreview3D";
import { Icon } from "@/components/Icon";
import { coins } from "@/lib/mock/store-items";

export function MyCharacter() {
  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[11px] font-bold text-ink-sub uppercase tracking-wider">
          내 캐릭터
        </h2>
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#fff6d0] border border-[#ffe38a] text-[#8a6200]">
          <Icon name="coin" className="w-3 h-3 text-gold-dark" />
          <span className="font-num text-[11px] font-extrabold">{coins.toLocaleString()}</span>
        </span>
      </div>

      <CharacterPreview3D />

      <p className="mt-2 text-center text-[11px] text-ink-sub leading-relaxed">
        도장에 더 열심히 출석해서 포인트를 모아보세요!
      </p>

      <Link
        href="/store"
        className="mt-2 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white border-[1.5px] border-k-blue text-k-blue-depth font-extrabold text-[13px] hover:bg-k-blue-soft transition-colors"
      >
        캐릭터 꾸미기
        <Icon name="chevron-right" className="w-4 h-4" />
      </Link>
    </section>
  );
}
