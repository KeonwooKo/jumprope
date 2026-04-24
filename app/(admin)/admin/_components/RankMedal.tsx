type Props = {
  rank: number;
};

export function RankMedal({ rank }: Props) {
  if (rank > 3) {
    return (
      <span className="w-7 h-7 grid place-items-center text-[11px] font-num font-extrabold text-ink-sub bg-panel-sub border border-line rounded-full">
        {rank}
      </span>
    );
  }
  const palette =
    rank === 1
      ? "bg-[linear-gradient(180deg,#ffd969,#f0a400)] border-[#a87600] text-white"
      : rank === 2
      ? "bg-[linear-gradient(180deg,#e5ebf4,#9aa7c0)] border-[#5a6a85] text-[#2a3244]"
      : "bg-[linear-gradient(180deg,#fbaf7a,#d46f33)] border-[#7c3912] text-white";

  return (
    <span
      className={
        "w-7 h-7 grid place-items-center text-[11px] font-num font-extrabold rounded-full border-[1.5px] shadow-[inset_0_1px_0_rgba(255,255,255,.5)] " +
        palette
      }
    >
      {rank}
    </span>
  );
}
