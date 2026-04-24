import Link from "next/link";
import { MHeader } from "@/components/MHeader";
import { Icon } from "@/components/Icon";
import { KpiRow } from "./_components/KpiRow";
import { MemberRow } from "./_components/MemberRow";
import { kpis } from "@/lib/mock/kpis";
import { rankings } from "@/lib/mock/rankings";
import { getMember } from "@/lib/mock/members";

export default function AdminHome() {
  const top5 = rankings.slice(0, 5);

  return (
    <>
      <MHeader
        title="도장 어드민"
        right={
          <button className="w-9 h-9 rounded-[10px] bg-panel-sub border-[1.5px] border-line grid place-items-center text-k-blue-depth">
            <Icon name="bell" />
          </button>
        }
      />

      <div className="flex-1 overflow-auto p-4 space-y-5">
        <Link
          href="/admin/play"
          className="relative block overflow-hidden rounded-2xl p-5 text-white bg-[linear-gradient(135deg,var(--color-k-blue-hi),var(--color-k-blue-depth))] border-2 border-k-blue-outline shadow-[inset_0_2px_0_rgba(255,255,255,.45),inset_0_-5px_0_rgba(10,65,90,.35)]"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm grid place-items-center">
              <Icon name="play" className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold uppercase tracking-wider opacity-80">오늘의 세션</div>
              <div className="font-extrabold text-lg [text-shadow:0_1px_0_rgba(10,65,90,.35)]">게임 시작하기</div>
              <div className="text-[11px] mt-0.5 opacity-90">도장에서 회원 플레이 시작</div>
            </div>
            <Icon name="chevron-right" className="w-5 h-5" />
          </div>
        </Link>

        <section>
          <h2 className="text-[11px] font-bold text-ink-sub uppercase tracking-wider mb-2">
            이번 주
          </h2>
          <KpiRow kpi={kpis} />
        </section>

        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[11px] font-bold text-ink-sub uppercase tracking-wider">
              TOP 5 랭킹
            </h2>
            <span className="text-[11px] text-k-blue-depth font-bold">이번 주</span>
          </div>
          <div className="space-y-1.5">
            {top5.map((r) => {
              const m = getMember(r.memberId);
              if (!m) return null;
              return (
                <MemberRow
                  key={r.memberId}
                  member={m}
                  rank={r.rank}
                  count={r.count}
                />
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-[11px] font-bold text-ink-sub uppercase tracking-wider mb-2">
            오늘 세션
          </h2>
          <div className="bg-k-blue-soft border-[1.5px] border-k-blue-soft-2 rounded-xl p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white border-[1.5px] border-k-blue grid place-items-center text-k-blue-depth">
              <Icon name="play" className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="font-extrabold text-[13px] text-ink">오후 반 진행 중</div>
              <div className="text-[11px] text-ink-sub mt-0.5">참여 12명 · 시작 14:30</div>
            </div>
            <span className="text-[11px] font-bold text-white bg-k-blue px-2.5 py-1 rounded-full">LIVE</span>
          </div>
        </section>
      </div>
    </>
  );
}
