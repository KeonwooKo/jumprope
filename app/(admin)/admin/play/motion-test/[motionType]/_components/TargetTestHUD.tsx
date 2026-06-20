"use client";

import { Icon } from "@/components/Icon";
import type { MotionDefinition } from "@/lib/mock/motion-types";
import type { TestResult } from "../page";

type Props = {
  motionDef: MotionDefinition;
  testResults: TestResult[];
  onClose: () => void;
  onReset: () => void;
};

export function TargetTestHUD({ motionDef, testResults, onClose, onReset }: Props) {
  const matchCount = testResults.filter((r) => r.isMatch).length;
  const missCount = testResults.filter((r) => !r.isMatch).length;
  const totalCount = testResults.length;
  const accuracy = totalCount > 0 ? Math.round((matchCount / totalCount) * 100) : 0;

  const latestResult = testResults[testResults.length - 1];
  const recentResults = testResults.slice(-5).reverse();

  return (
    <>
      {/* 헤더 - 간소화 */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm grid place-items-center text-white"
          >
            <Icon name="chevron-left" className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="text-xl">{motionDef.emoji}</div>
            <div className="text-white font-bold text-sm">{motionDef.name}</div>
          </div>
          <button
            onClick={onReset}
            className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold"
          >
            초기화
          </button>
        </div>
      </div>

      {/* 최근 점프 피드백 (중앙) - 작게 */}
      {latestResult && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-[fadeIn_0.3s_ease-out]">
          <div
            className={`${
              latestResult.isMatch
                ? "bg-green-500/90"
                : "bg-red-500/90"
            } text-white px-4 py-2 rounded-xl shadow-xl backdrop-blur-sm`}
          >
            <div className="flex items-center gap-2">
              <div className="text-xl">{latestResult.isMatch ? "✅" : "❌"}</div>
              <div className="text-xs font-bold">
                {latestResult.isMatch ? motionDef.name : "미인식"} ({Math.round(latestResult.confidence * 100)}%)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 하단 통계 패널 - 작게 */}
      <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/90 to-transparent px-4 pb-4 pt-6">
        {/* 카운트 요약 - 한 줄로 */}
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="flex items-center gap-1.5">
            <div className="text-green-400 text-[10px] font-bold">✅</div>
            <div className="text-white font-num text-lg font-extrabold">{matchCount}</div>
          </div>
          <div className="text-white/30">|</div>
          <div className="flex items-center gap-1.5">
            <div className="text-white/70 text-[10px] font-bold">정확도</div>
            <div className="text-white font-num text-lg font-extrabold">{accuracy}%</div>
          </div>
          <div className="text-white/30">|</div>
          <div className="flex items-center gap-1.5">
            <div className="text-red-400 text-[10px] font-bold">❌</div>
            <div className="text-white font-num text-lg font-extrabold">{missCount}</div>
          </div>
        </div>

        {/* 최근 로그 - 간소화 */}
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-2.5 border border-white/10">
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {recentResults.length === 0 ? (
              <div className="text-white/40 text-[10px] text-center py-2">
                {motionDef.description}
              </div>
            ) : (
              recentResults.slice(0, 3).map((result, idx) => (
                <div
                  key={testResults.length - idx}
                  className="flex items-center gap-2 text-[10px]"
                >
                  <div className="shrink-0">
                    {result.isMatch ? "✅" : "❌"}
                  </div>
                  <div className={`flex-1 min-w-0 truncate ${
                    result.isMatch ? "text-green-300" : "text-red-300"
                  }`}>
                    {result.reason}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
    </>
  );
}

function getMotionLabel(type: string): string {
  const labels: Record<string, string> = {
    basic: "모아뛰기",
    cross: "X자",
    "rock-paper": "보바위",
    zigzag: "지그재그",
    "side-swing": "옆흔들기",
  };
  return labels[type] || type;
}
