import { MHeader } from "@/components/MHeader";
import { Icon } from "@/components/Icon";
import { GameCard } from "./_components/GameCard";
import { games, tournament } from "@/lib/mock/games";

export default function PlayPage() {
  return (
    <div className="min-h-dvh flex flex-col bg-white">
      <MHeader title="게임 선택" backHref="/admin" />

      <div className="flex-1 overflow-auto p-4 space-y-4">
        <section className="bg-[linear-gradient(135deg,#ffd23f,#ffa500)] border-2 border-[#c79200] rounded-2xl p-4 text-[#3a2400] shadow-[inset_0_2px_0_rgba(255,255,255,.5)]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/80 grid place-items-center">
              <Icon name="trophy" className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold uppercase tracking-wider opacity-80">대회</div>
              <div className="font-extrabold text-[15px]">{tournament.title}</div>
              <div className="text-[11px] mt-0.5 opacity-90">{tournament.prize}</div>
            </div>
            <div className="text-center">
              <div className="font-num text-xl font-extrabold leading-none">D-{tournament.dday}</div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-[11px] font-bold text-ink-sub uppercase tracking-wider mb-2">게임 모드</h2>
          <div className="space-y-3">
            {games.map((g) => (
              <GameCard key={g.id} game={g} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
