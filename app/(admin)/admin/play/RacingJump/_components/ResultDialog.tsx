import { KButton } from "@/components/KButton";
import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";

type Props = {
  elapsedMs: number;
  goalDistance: number;
  onExit: () => void;
  onRetry: () => void;
};

function starsForTime(ms: number): 1 | 2 | 3 {
  const sec = ms / 1000;
  if (sec <= 35) return 3;
  if (sec <= 55) return 2;
  return 1;
}

function formatTime(ms: number) {
  const sec = ms / 1000;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const cs = Math.floor((ms % 1000) / 10);
  return `${m}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}

export function ResultDialog({ elapsedMs, goalDistance, onExit, onRetry }: Props) {
  const stars = starsForTime(elapsedMs);
  const sec = Math.max(1, elapsedMs / 1000);
  const avgKmh = (goalDistance / sec) * 3.6;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-6 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 border-2 border-k-blue-outline shadow-[0_10px_0_rgba(15,93,127,0.2)]">
        <div className="text-center">
          <div className="text-[11px] font-bold text-k-blue-depth uppercase tracking-wider mb-1">
            완주
          </div>
          <h2 className="text-2xl font-extrabold text-ink">잘했어요!</h2>
        </div>

        <div className="flex justify-center gap-1.5 my-4">
          {[0, 1, 2].map((i) => (
            <Icon
              key={i}
              name="star"
              className={cn("w-10 h-10", i < stars ? "text-gold fill-gold" : "text-line-2")}
            />
          ))}
        </div>

        <div className="bg-k-blue-soft border-[1.5px] border-k-blue-soft-2 rounded-2xl p-4 text-center mb-5">
          <div className="text-[11px] font-bold text-ink-sub uppercase tracking-wider mb-1">
            기록
          </div>
          <div className="font-num text-5xl font-extrabold text-k-blue-depth leading-none tabular-nums">
            {formatTime(elapsedMs)}
          </div>
          <div className="text-[11px] text-ink-sub mt-2">
            평균 {avgKmh.toFixed(1)} km/h · {goalDistance}m 완주
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <KButton variant="outline" size="md" block onClick={onRetry}>
            다시하기
          </KButton>
          <KButton size="md" block onClick={onExit}>
            돌아가기
          </KButton>
        </div>
      </div>
    </div>
  );
}
