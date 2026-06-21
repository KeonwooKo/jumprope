import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import type { MotionJumpEvent } from "./types";
import { analyzeJumpFrames } from "./frame-analyzer";

// 지그재그 전용 분류기
export function classifyZigzagJump(frames: NormalizedLandmark[][]): MotionJumpEvent {
  const raw = analyzeJumpFrames(frames);
  const timestamp = Date.now();

  // 지그재그 조건: 발 교차 또는 발 벌림
  const isCrossed = raw.isCrossed;
  const isWide = raw.isWide;

  const isValid = isCrossed || isWide;
  const confidence = isValid ? (isCrossed && isWide ? 0.95 : 0.8) : 0.2;

  let reason: string;
  if (isCrossed && isWide) {
    reason = "✅ 지그재그 인식 (발 교차 + 벌림)";
  } else if (isCrossed) {
    reason = "✅ 지그재그 인식 (발 교차)";
  } else if (isWide) {
    reason = "✅ 지그재그 인식 (발 벌림)";
  } else {
    reason = "❌ 발 동작 부족";
  }

  return {
    type: "zigzag",
    timestamp,
    isMatch: isValid,
    confidence,
    reason,
    raw,
  };
}