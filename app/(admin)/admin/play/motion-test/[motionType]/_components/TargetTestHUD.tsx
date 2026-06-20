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
      {/* 헤더 */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/90 via-black/70 to-transparent px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm grid place-items-center text-white"
          >
            <Icon name="chevron-left" className="w-5 h-5" />
          </button>
          <div className="text-center flex-1">
            <div className="text-white/70 text-[10px] font-bold uppercase tracking-wider">Target Motion</div>
            <div className="text-white font-extrabold text-lg">{motionDef.name}</div>
          </div>
          <button
            onClick={onReset}
            className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-bold"
          >
            초기화
          </button>
        </div>

        {/* 동작 설명 */}
        <div className={`${motionDef.color} rounded-xl p-3 flex items-center gap-3`}>
          <div className="text-3xl">{motionDef.emoji}</div>
          <div className="flex-1 min-w-0 text-white">
            <div className="text-xs font-bold opacity-90">{motionDef.description}</div>
            <div className="text-[10px] opacity-75 mt-1">
              {motionDef.instructions.join(" · ")}
            </div>
          </div>
        </div>
      </div>

      {/* 최근 점프 피드백 (중앙) */}
      {latestResult && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-[fadeIn_0.3s_ease-out]">
          <div
            className={`${
              latestResult.isMatch
                ? "bg-green-500"
                : "bg-red-500"
            } text-white px-6 py-4 rounded-2xl shadow-2xl max-w-xs`}
          >
            <div className="text-center">
              <div className="text-3xl mb-2">{latestResult.isMatch ? "✅" : "❌"}</div>
              <div className="font-extrabold text-sm mb-1">
                {latestResult.isMatch ? motionDef.name : "미인식"}
              </div>
              <div className="text-xs opacity-90">
                {Math.round(latestResult.confidence * 100)}% 신뢰도
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 하단 통계 패널 */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/85 to-transparent px-4 pb-6 pt-8">
        {/* 카운트 요약 */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-green-500/20 backdrop-blur-sm rounded-xl p-3 border border-green-500/30 text-center">
            <div className="text-green-400 text-xs font-bold mb-1">인식</div>
            <div className="text-white font-num text-2xl font-extrabold">{matchCount}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 text-center">
            <div className="text-white/70 text-xs font-bold mb-1">정확도</div>
            <div className="text-white font-num text-2xl font-extrabold">{accuracy}%</div>
          </div>
          <div className="bg-red-500/20 backdrop-blur-sm rounded-xl p-3 border border-red-500/30 text-center">
            <div className="text-red-400 text-xs font-bold mb-1">미인식</div>
            <div className="text-white font-num text-2xl font-extrabold">{missCount}</div>
          </div>
        </div>

        {/* 최근 로그 */}
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-3 border border-white/10">
          <div className="text-white/60 text-[10px] font-bold uppercase tracking-wider mb-2">
            Recent Log
          </div>
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {recentResults.length === 0 ? (
              <div className="text-white/40 text-xs text-center py-4">
                아직 점프가 없습니다
              </div>
            ) : (
              recentResults.map((result, idx) => (
                <div
                  key={testResults.length - idx}
                  className={`${
                    result.isMatch
                      ? "bg-green-500/10 border-green-500/20"
                      : "bg-red-500/10 border-red-500/20"
                  } rounded-lg p-2 border text-xs`}
                >
                  <div className="flex items-start gap-2">
                    <div className="text-base flex-shrink-0">
                      {result.isMatch ? "✅" : "❌"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`font-bold ${
                          result.isMatch ? "text-green-300" : "text-red-300"
                        }`}
                      >
                        #{testResults.length - idx} {result.isMatch ? motionDef.name : "미인식"}
                      </div>
                      <div className="text-white/60 text-[10px] mt-0.5 leading-relaxed">
                        {result.reason}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 팁 */}
        {motionDef.tips.length > 0 && (
          <div className="mt-3 text-white/50 text-[10px] text-center space-y-1">
            {motionDef.tips.map((tip, idx) => (
              <div key={idx}>💡 {tip}</div>
            ))}
          </div>
        )}
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
