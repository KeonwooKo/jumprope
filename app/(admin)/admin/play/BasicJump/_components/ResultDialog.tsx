import { KButton } from "@/components/KButton";
import { Icon } from "@/components/Icon";

type Props = {
  count: number;
  totalTime: number;
  onExit: () => void;
  onRetry: () => void;
};

function starsFor(count: number): 1 | 2 | 3 {
  if (count >= 80) return 3;
  if (count >= 40) return 2;
  return 1;
}

export function ResultDialog({ count, totalTime, onExit, onRetry }: Props) {
  const stars = starsFor(count);
  const perMin = totalTime > 0 ? Math.round((count / totalTime) * 60) : count;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-6 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 border-2 border-k-blue-outline shadow-[0_10px_0_rgba(15,93,127,0.2)]">
        <div className="text-center">
          <div className="text-[11px] font-bold text-k-blue-depth uppercase tracking-wider mb-1">
            게임 종료
          </div>
          <h2 className="text-2xl font-extrabold text-ink">수고했어요!</h2>
        </div>

        <div className="flex justify-center gap-1.5 my-4">
          {[0, 1, 2].map((i) => (
            <Icon
              key={i}
              name="star"
              className={
                "w-10 h-10 " + (i < stars ? "text-gold fill-gold" : "text-line-2")
              }
            />
          ))}
        </div>

        <div className="bg-k-blue-soft border-[1.5px] border-k-blue-soft-2 rounded-2xl p-4 text-center mb-5">
          <div className="text-[11px] font-bold text-ink-sub uppercase tracking-wider mb-1">
            총 점프
          </div>
          <div className="font-num text-5xl font-extrabold text-k-blue-depth leading-none tabular-nums">
            {count}
          </div>
          <div className="text-[11px] text-ink-sub mt-2">분당 {perMin}회 페이스</div>
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
