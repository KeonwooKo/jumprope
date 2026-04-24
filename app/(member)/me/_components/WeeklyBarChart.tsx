import type { WeeklyBar } from "@/lib/mock/sessions";

type Props = {
  data: WeeklyBar[];
};

export function WeeklyBarChart({ data }: Props) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="bg-white border-[1.5px] border-line rounded-[14px] p-3">
      <div className="flex items-end justify-between gap-2 h-32">
        {data.map((d, i) => {
          const h = Math.round((d.count / max) * 100);
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <span className="font-num text-[10px] font-bold text-ink-sub">{d.count}</span>
              <div className="w-full bg-panel-sub rounded-md relative h-full flex items-end">
                <div
                  className={
                    "w-full rounded-md " +
                    (d.isToday
                      ? "bg-[linear-gradient(180deg,var(--color-k-blue-hi),var(--color-k-blue-mid))] shadow-[inset_0_1px_0_rgba(255,255,255,.45),inset_0_-2px_0_var(--color-k-blue-depth)]"
                      : "bg-k-blue-soft-2")
                  }
                  style={{ height: `${h}%` }}
                />
              </div>
              <span
                className={
                  "text-[10px] font-bold " +
                  (d.isToday ? "text-k-blue-depth" : "text-ink-mut")
                }
              >
                {d.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
