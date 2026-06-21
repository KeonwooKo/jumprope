import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import type { MotionJumpEvent } from "./types";
import { analyzeJumpFrames } from "./frame-analyzer";

// X자 전용 분류기
export function classifyCrossJump(frames: NormalizedLandmark[][]): MotionJumpEvent {
  const raw = analyzeJumpFrames(frames);
  const timestamp = Date.now();

  // X자 조건: 팔 교차가 명확해야 함
  const isArmCrossed = raw.isArmCrossed;

  // 발은 모아야 함 (교차나 벌림이 있으면 감점)
  const hasFootIssue = raw.isCrossed || raw.isWide;

  const isValid = isArmCrossed && !hasFootIssue;
  const confidence = isArmCrossed ? (hasFootIssue ? 0.7 : 0.95) : 0.2;

  let reason: string;
  if (isValid) {
    reason = "✅ X자 인식 (팔 교차)";
  } else if (!isArmCrossed) {
    reason = "❌ 팔 교차 부족";
  } else {
    reason = `❌ 팔은 교차했으나 ${raw.isCrossed ? "발 교차" : "발 벌림"} 감지`;
  }

  return {
    type: "cross",
    timestamp,
    isMatch: isValid,
    confidence,
    reason,
    raw,
  };
}