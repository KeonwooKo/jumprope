type Props = {
  year: number;
  month: number;
  checkedDates: string[];
  today?: string;
};

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function firstWeekday(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay();
}

function toISO(year: number, month: number, day: number) {
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

export function AttendanceCalendar({ year, month, checkedDates, today }: Props) {
  const total = daysInMonth(year, month);
  const offset = firstWeekday(year, month);
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const checked = new Set(checkedDates);

  const cells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= total; d++) cells.push(d);

  return (
    <div className="bg-white border-[1.5px] border-line rounded-[14px] p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[13px] font-bold text-ink">
          {year}년 {month}월
        </h3>
        <span className="text-[11px] text-ink-mut">
          체크 <strong className="text-k-blue-depth">{checked.size}</strong>일
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekdays.map((w) => (
          <div
            key={w}
            className="text-center text-[10px] font-bold text-ink-mut py-1"
          >
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <div key={i} />;
          const iso = toISO(year, month, d);
          const isChecked = checked.has(iso);
          const isToday = today === iso;
          return (
            <div
              key={i}
              className={
                "aspect-square grid place-items-center text-[11px] rounded-lg font-bold " +
                (isChecked
                  ? "text-white border-[1.5px] border-k-blue-outline bg-[linear-gradient(180deg,var(--color-k-blue-hi),var(--color-k-blue-mid))] shadow-[inset_0_1px_0_rgba(255,255,255,.45),inset_0_-2px_0_var(--color-k-blue-depth)]"
                  : isToday
                  ? "text-k-blue-depth border-[1.5px] border-k-blue border-dashed"
                  : "text-ink-sub border border-line")
              }
            >
              {d}
            </div>
          );
        })}
      </div>
    </div>
  );
}
