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
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/admin/play"
            className="relative block overflow-hidden rounded-2xl p-4 text-white bg-[linear-gradient(135deg,var(--color-k-blue-hi),var(--color-k-blue-depth))] border-2 border-k-blue-outline shadow-[inset_0_2px_0_rgba(255,255,255,.45),inset_0_-5px_0_rgba(10,65,90,.35)]"
          >
            <div className="flex flex-col items-start gap-2">
              <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm grid place-items-center">
                <Icon name="play" className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">게임</div>
                <div className="font-extrabold text-sm [text-shadow:0_1px_0_rgba(10,65,90,.35)]">시작하기</div>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/diagnostics"
            className="relative block overflow-hidden rounded-2xl p-4 text-white bg-[linear-gradient(135deg,#8b5cf6,#6d28d9)] border-2 border-purple-400 shadow-[inset_0_2px_0_rgba(255,255,255,.45),inset_0_-5px_0_rgba(55,48,163,.35)]"
          >
            <div className="flex flex-col items-start gap-2">
              <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm grid place-items-center">
                <Icon name="target" className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">진단</div>
                <div className="font-extrabold text-sm [text-shadow:0_1px_0_rgba(55,48,163,.35)]">테스트</div>
              </div>
            </div>
          </Link>
        </div>

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
