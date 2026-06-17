import { Icon } from "@/components/Icon";
import type { Session } from "@/lib/mock/sessions";
import { cn } from "@/lib/utils";

type Props = {
  sessions: Session[];
};

function gameLabel(g: Session["game"]) {
  return g === "grassland" ? "초원 점프" : "레이싱";
}

export function JumpLogList({ sessions }: Props) {
  if (sessions.length === 0) {
    return (
      <div className="text-center text-[12px] text-ink-mut py-6">
        기록이 없습니다
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {sessions.map((s, i) => (
        <div
          key={i}
          className="flex items-center gap-3 bg-white border-[1.5px] border-line rounded-xl px-3 py-2.5"
        >
          <div className="w-9 h-9 rounded-xl bg-k-blue-soft border border-k-blue-soft-2 grid place-items-center text-k-blue-depth shrink-0">
            <Icon name={s.game === "racing" ? "play" : "flame"} className="w-[18px] h-[18px]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-bold text-ink">{gameLabel(s.game)}</div>
            <div className="text-[11px] text-ink-sub">{s.date} · 콤보 {s.combo}</div>
          </div>
          <div className="text-right">
            <div className="font-num text-[15px] font-extrabold text-k-blue-depth leading-none">
              {s.count}
            </div>
            <div className="flex gap-0.5 justify-end mt-1">
              {Array.from({ length: 3 }).map((_, j) => (
                <Icon
                  key={j}
                  name="star"
                  className={cn("w-3 h-3", j < s.stars ? "text-gold fill-gold" : "text-line-2")}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
