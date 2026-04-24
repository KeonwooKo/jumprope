import type { Kpi } from "@/lib/mock/kpis";

type Props = {
  kpi: Kpi;
};

const items = (kpi: Kpi) => [
  { num: kpi.totalMembers.toString(),             label: "회원 수" },
  { num: kpi.activeToday.toString(),              label: "오늘 활동" },
  { num: kpi.totalJumpsThisWeek.toLocaleString(), label: "주간 줄넘기" },
];

export function KpiRow({ kpi }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {items(kpi).map((it, i) => (
        <div
          key={i}
          className="bg-k-blue-soft border-[1.5px] border-k-blue-soft-2 rounded-xl px-2 py-3 text-center"
        >
          <div className="font-num text-xl font-extrabold text-k-blue-depth leading-tight">
            {it.num}
          </div>
          <div className="text-[10px] text-ink-sub font-semibold mt-1">
            {it.label}
          </div>
        </div>
      ))}
    </div>
  );
}
