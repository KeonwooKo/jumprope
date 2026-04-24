type Props = {
  level: number;
  xp: number;
};

export function LevelBar({ level, xp }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="font-num text-[13px] font-extrabold text-k-blue-depth">Lv.{level}</span>
        <span className="text-[11px] text-ink-sub font-semibold">
          다음 레벨까지 <strong className="text-ink font-extrabold">{100 - xp}</strong>
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-panel-sub border border-line overflow-hidden">
        <div
          className="h-full bg-[linear-gradient(180deg,var(--color-k-blue-hi),var(--color-k-blue-mid))] shadow-[inset_0_1px_0_rgba(255,255,255,.45),inset_0_-1.5px_0_var(--color-k-blue-depth)]"
          style={{ width: `${xp}%` }}
        />
      </div>
    </div>
  );
}
