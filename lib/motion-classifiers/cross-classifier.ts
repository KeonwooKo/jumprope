import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import type { MotionJumpEvent } from "./types";

const LANDMARK = {
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
} as const;

// X자: 팔이 교차하면 OK
export function classifyCrossJump(frames: NormalizedLandmark[][]): MotionJumpEvent {
  if (frames.length < 2) {
    return {
      type: "cross",
      timestamp: Date.now(),
      isMatch: false,
      confidence: 0,
      reason: "프레임 부족",
      raw: { ankleDistance: 0, isCrossed: false, isWide: false, sideDirection: "center", isArmCrossed: false },
    };
  }

  const midFrames = frames.slice(
    Math.floor(frames.length * 0.3),
    Math.floor(frames.length * 0.7)
  );

  let crossedCount = 0;
  let validCount = 0;

  for (const lms of midFrames) {
    const leftWrist = lms[LANDMARK.LEFT_WRIST];
    const rightWrist = lms[LANDMARK.RIGHT_WRIST];
    const leftShoulder = lms[LANDMARK.LEFT_SHOULDER];
    const rightShoulder = lms[LANDMARK.RIGHT_SHOULDER];

    if (!leftWrist || !rightWrist || !leftShoulder || !rightShoulder) continue;

    const shoulderCenterX = (leftShoulder.x + rightShoulder.x) / 2;

    // 왼손이 중심 오른쪽에, 오른손이 중심 왼쪽에 있으면 교차
    if (leftWrist.x > shoulderCenterX && rightWrist.x < shoulderCenterX) {
      crossedCount++;
    }
    validCount++;
  }

  if (validCount === 0) {
    return {
      type: "cross",
      timestamp: Date.now(),
      isMatch: false,
      confidence: 0,
      reason: "랜드마크 없음",
      raw: { ankleDistance: 0, isCrossed: false, isWide: false, sideDirection: "center", isArmCrossed: false },
    };
  }

  const crossRatio = crossedCount / validCount;
  const isCrossed = crossRatio > 0.5;

  return {
    type: "cross",
    timestamp: Date.now(),
    isMatch: isCrossed,
    confidence: isCrossed ? 0.95 : 0.2,
    reason: isCrossed
      ? `✅ X자 인식 (교차율: ${(crossRatio * 100).toFixed(0)}%)`
      : `❌ 팔 교차 부족 (${(crossRatio * 100).toFixed(0)}%)`,
    raw: { ankleDistance: 0, isCrossed: false, isWide: false, sideDirection: "center", isArmCrossed: isCrossed },
  };
}