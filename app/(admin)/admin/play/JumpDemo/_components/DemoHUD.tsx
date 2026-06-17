"use client";

import { Icon } from "@/components/Icon";
import type { JumpEvent, JumpType } from "@/lib/use-jump-classification";

type Props = {
  jumpHistory: JumpEvent[];
  onClose: () => void;
  onReset: () => void;
};

const JUMP_TYPE_LABELS: Record<JumpType, { kr: string; en: string; color: string; icon: string }> = {
  basic: { kr: "모아뛰기", en: "Basic", color: "bg-slate-500", icon: "⬆️" },
  cross: { kr: "X자", en: "Cross", color: "bg-red-500", icon: "✖️" },
  "rock-paper": { kr: "보바위", en: "Rock-Paper", color: "bg-emerald-500", icon: "✊✋" },
  zigzag: { kr: "지그재그", en: "Zigzag", color: "bg-orange-500", icon: "↔️" },
  "side-swing": { kr: "옆흔들어", en: "Side Swing", color: "bg-purple-500", icon: "↪️" },
};

export function DemoHUD({ jumpHistory, onClose, onReset }: Props) {
  // 동작별 카운트
  const counts = jumpHistory.reduce((acc, jump) => {
    acc[jump.type] = (acc[jump.type] || 0) + 1;
    return acc;
  }, {} as Record<JumpType, number>);

  const totalCount = jumpHistory.length;
  const latestJump = jumpHistory[jumpHistory.length - 1];

  return (
    <>
      {/* 헤더 */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm grid place-items-center text-white"
        >
          <Icon name="chevron-left" className="w-5 h-5" />
        </button>
        <h1 className="text-white font-bold text-lg">줄넘기 동작 인식 데모</h1>
        <button
          onClick={onReset}
          className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-bold"
        >
          초기화
        </button>
      </div>

      {/* 최근 점프 알림 */}
      {latestJump && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 animate-[bounce_0.5s_ease-in-out]">
          <div
            className={`${JUMP_TYPE_LABELS[latestJump.type].color} text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2`}
          >
            <span className="text-2xl">{JUMP_TYPE_LABELS[latestJump.type].icon}</span>
            <div>
              <div className="font-extrabold text-lg">{JUMP_TYPE_LABELS[latestJump.type].kr}</div>
              <div className="text-xs opacity-90">
                {JUMP_TYPE_LABELS[latestJump.type].en} · {Math.round(latestJump.confidence * 100)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 통계 패널 */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 pb-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
          {/* 총 카운트 */}
          <div className="text-center mb-4 pb-4 border-b border-white/20">
            <div className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">
              Total Jumps
            </div>
            <div className="text-white font-num text-5xl font-extrabold">
              {totalCount}
            </div>
          </div>

          {/* 동작별 카운트 그리드 */}
          <div className="grid grid-cols-5 gap-2">
            {(Object.keys(JUMP_TYPE_LABELS) as JumpType[]).map((type) => {
              const label = JUMP_TYPE_LABELS[type];
              const count = counts[type] || 0;
              const percentage = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;

              return (
                <div
                  key={type}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-2 border border-white/10 text-center"
                >
                  <div className="text-xl mb-1">{label.icon}</div>
                  <div className="text-white text-xs font-bold mb-0.5">{label.kr}</div>
                  <div className="text-white font-num text-lg font-extrabold">{count}</div>
                  <div className="text-white/50 text-[10px] font-medium">{percentage}%</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 범례 */}
        <div className="mt-3 text-white/60 text-[10px] text-center space-y-1">
          <div>카메라 전체를 보고 다양한 줄넘기 동작을 시도해보세요</div>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span>❌ 발을 교차하세요 (X자)</span>
            <span>🦵 한 발씩 들어보세요 (번갈아)</span>
            <span>✖️ 팔을 교차하세요 (십자)</span>
          </div>
        </div>
      </div>
    </>
  );
}
