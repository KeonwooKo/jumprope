import { Icon } from "@/components/Icon";

type Props = {
  count: number;
  timeLeft: number;
  totalTime: number;
};

export function JumpHUD({ count, timeLeft, totalTime }: Props) {
  const pct = Math.max(0, Math.min(100, (timeLeft / totalTime) * 100));
  const urgent = timeLeft <= 10;

  return (
    <>
      {/* Timer at top */}
      <div className="absolute top-[50px] left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
        <div
          className={
            "flex items-center gap-2 px-4 py-2 rounded-full text-white border-[1.5px] backdrop-blur-md " +
            (urgent
              ? "bg-[rgba(239,68,68,0.35)] border-[rgba(239,68,68,0.6)]"
              : "bg-black/50 border-white/20")
          }
        >
          <Icon name="calendar" className="w-4 h-4" />
          <span className="font-num text-lg font-extrabold tabular-nums">
            {String(Math.floor(timeLeft / 60)).padStart(1, "0")}:
            {String(timeLeft % 60).padStart(2, "0")}
          </span>
        </div>
      </div>
      {/* Thin progress bar under timer */}
      <div className="absolute top-[100px] left-1/2 -translate-x-1/2 z-10 w-[60%] h-[3px] rounded-full bg-white/20 overflow-hidden">
        <div
          className={
            "h-full transition-[width] duration-200 ease-linear " +
            (urgent ? "bg-[#ef4444]" : "bg-k-blue-hi")
          }
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Jump counter */}
      <div className="absolute top-1/2 right-4 -translate-y-1/2 z-10 flex flex-col items-center gap-1 px-3 py-2.5 rounded-2xl bg-black/55 backdrop-blur-md border-[1.5px] border-white/15 text-white">
        <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">점프</span>
        <span className="font-num text-3xl font-extrabold leading-none tabular-nums">{count}</span>
      </div>
    </>
  );
}
