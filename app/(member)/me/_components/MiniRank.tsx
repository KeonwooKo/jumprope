import type { RankEntry } from "@/lib/mock/rankings";
import { getMember } from "@/lib/mock/members";

type Props = {
  entries: RankEntry[];
  meId: string;
};

export function MiniRank({ entries, meId }: Props) {
  return (
    <div className="bg-white border-[1.5px] border-line rounded-[14px] p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[11px] font-bold text-ink-sub uppercase tracking-wider">랭킹</h3>
        <span className="text-[11px] text-k-blue-depth font-bold">이번 주</span>
      </div>
      <ul className="space-y-1">
        {entries.slice(0, 5).map((r) => {
          const m = getMember(r.memberId);
          if (!m) return null;
          const isMe = r.memberId === meId;
          return (
            <li
              key={r.memberId}
              className={
                "flex items-center gap-2 text-[12px] " +
                (isMe ? "text-k-blue-depth font-extrabold" : "text-ink-sub")
              }
            >
              <span className="w-5 text-center font-num">{r.rank}</span>
              <span className="flex-1 truncate">{m.name}{isMe ? " (나)" : ""}</span>
              <span className="font-num font-bold">{r.count.toLocaleString()}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
