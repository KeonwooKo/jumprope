"use client";

import { Icon } from "@/components/Icon";
import { motionDefinitions } from "@/lib/mock/motion-types";
import type { JumpEvent, JumpType } from "@/lib/use-jump-classification";

type Props = {
  jumpHistory: JumpEvent[];
  onClose: () => void;
  onReset: () => void;
};

export function AllTestHUD({ jumpHistory, onClose, onReset }: Props) {
  // 동작별 카운트
  const counts = jumpHistory.reduce((acc, jump) => {
    acc[jump.type] = (acc[jump.type] || 0) + 1;
    return acc;
  }, {} as Record<JumpType, number>);

  const totalCount = jumpHistory.length;
  const latestJump = jumpHistory[jumpHistory.length - 1];
  const recentJumps = jumpHistory.slice(-10).reverse();

  // 동작 정의 맵
  const motionMap = Object.fromEntries(
    motionDefinitions.map((m) => [m.id, m])
  );

  return (
    <>
      {/* 헤더 */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/90 to-transparent">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm grid place-items-center text-white"
        >
          <Icon name="chevron-left" className="w-5 h-5" />
        </button>
        <h1 className="text-white font-bold text-base">전체 동작 자동 인식</h1>
        <button
          onClick={onReset}
          className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-bold"
        >
          초기화
        </button>
      </div>

      {/* 최근 점프 알림 */}
      {latestJump && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 animate-[bounce_0.5s_ease-in-out] pointer-events-none">
          <div
            className={`${motionMap[latestJump.type]?.color || "bg-slate-500"} text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3`}
          >
            <span className="text-2xl">{motionMap[latestJump.type]?.emoji || "❓"}</span>
            <div>
              <div className="font-extrabold text-base">{motionMap[latestJump.type]?.name || latestJump.type}</div>
              <div className="text-xs opacity-90">
                {motionMap[latestJump.type]?.nameEn || ""} · {Math.round(latestJump.confidence * 100)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 하단 통계 패널 */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 to-transparent p-4 pb-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 space-y-4">
          {/* 총 카운트 */}
          <div className="text-center pb-3 border-b border-white/20">
            <div className="text-white/60 text-[10px] font-bold uppercase tracking-wider mb-1">
              Total Jumps
            </div>
            <div className="text-white font-num text-4xl font-extrabold">
              {totalCount}
            </div>
          </div>

          {/* 동작별 카운트 그리드 */}
          <div className="grid grid-cols-5 gap-2">
            {motionDefinitions.map((motion) => {
              const count = counts[motion.id] || 0;
              const percentage = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;

              return (
                <div
                  key={motion.id}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-2 border border-white/10 text-center"
                >
                  <div className="text-xl mb-1">{motion.emoji}</div>
                  <div className="text-white text-[10px] font-bold mb-0.5 truncate">{motion.name}</div>
                  <div className="text-white font-num text-base font-extrabold">{count}</div>
                  <div className="text-white/50 text-[9px] font-medium">{percentage}%</div>
                </div>
              );
            })}
          </div>

          {/* 최근 로그 */}
          <div>
            <div className="text-white/60 text-[10px] font-bold uppercase tracking-wider mb-2">
              Recent Log
            </div>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {recentJumps.length === 0 ? (
                <div className="text-white/40 text-xs text-center py-3">
                  자유롭게 다양한 동작을 시도해보세요
                </div>
              ) : (
                recentJumps.map((jump, idx) => {
                  const motion = motionMap[jump.type];
                  return (
                    <div
                      key={jumpHistory.length - idx}
                      className="bg-white/5 rounded-lg px-2 py-1.5 flex items-center gap-2 text-xs"
                    >
                      <span className="text-base">{motion?.emoji || "❓"}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-white font-bold">{motion?.name || jump.type}</span>
                        <span className="text-white/50 ml-2">
                          {Math.round(jump.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* 안내 */}
        <div className="mt-3 text-white/50 text-[10px] text-center">
          모든 동작이 자동으로 분류됩니다 · 다양하게 시도해보세요
        </div>
      </div>
    </>
  );
}
