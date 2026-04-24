import Link from "next/link";
import { RankMedal } from "./RankMedal";
import type { Member } from "@/lib/mock/members";

type Props = {
  member: Member;
  rank?: number;
  count: number;
};

export function MemberRow({ member, rank, count }: Props) {
  return (
    <Link
      href={`/admin/members/${member.id}`}
      className="flex items-center gap-3 bg-white border-[1.5px] border-line rounded-xl px-3 py-2.5 hover:border-k-blue transition-colors"
    >
      {rank !== undefined && <RankMedal rank={rank} />}
      <div className="w-9 h-9 rounded-full bg-k-blue-soft border border-k-blue-soft-2 grid place-items-center text-xs font-bold text-k-blue-depth shrink-0">
        {member.name.slice(0, 1)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-extrabold text-ink truncate">{member.name}</div>
        <div className="text-[11px] text-ink-sub mt-0.5 flex items-center gap-1">
          Lv.{member.level} · 연속 {member.streak}일
        </div>
      </div>
      <div className="text-right">
        <div className="font-num text-[15px] font-extrabold text-k-blue-depth leading-none">
          {count.toLocaleString()}
        </div>
        <div className="text-[10px] text-ink-mut mt-1">회</div>
      </div>
    </Link>
  );
}
