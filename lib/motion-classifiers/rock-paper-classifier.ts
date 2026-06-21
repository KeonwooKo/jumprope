import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import type { MotionJumpEvent } from "./types";
import { analyzeJumpFrames } from "./frame-analyzer";

// 보바위 전용 분류기
export function classifyRockPaperJump(frames: NormalizedLandmark[][]): MotionJumpEvent {
  const raw = analyzeJumpFrames(frames);
  const timestamp = Date.now();

  // 보바위 조건: 발 벌림 (교차 없음)
  const isWide = raw.isWide;
  const isCrossed = raw.isCrossed;

  const isValid = isWide && !isCrossed;
  const confidence = isValid ? 0.9 : (isWide ? 0.5 : 0.2);

  let reason: string;
  if (isValid) {
    reason = "✅ 보바위 인식 (발 벌림)";
  } else if (!isWide) {
    reason = "❌ 발 벌림 부족";
  } else {
    reason = "❌ 발이 교차됨 (지그재그와 혼동)";
  }

  return {
    type: "rock-paper",
    timestamp,
    isMatch: isValid,
    confidence,
    reason,
    raw,
  };
}