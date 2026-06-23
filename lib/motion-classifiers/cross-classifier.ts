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
    const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);

    // 1. 기본 교차 체크: 왼손이 오른쪽, 오른손이 왼쪽
    const leftWristCrossed = leftWrist.x > shoulderCenterX;
    const rightWristCrossed = rightWrist.x < shoulderCenterX;

    if (!leftWristCrossed || !rightWristCrossed) {
      validCount++;
      continue;
    }

    // 2. 교차 거리 체크: 어깨 폭의 20% 이상
    const leftCrossDistance = leftWrist.x - shoulderCenterX;
    const rightCrossDistance = shoulderCenterX - rightWrist.x;

    if (leftCrossDistance < shoulderWidth * 0.2 || rightCrossDistance < shoulderWidth * 0.2) {
      validCount++;
      continue;
    }

    // 3. 양손 높이 체크: 비슷한 높이여야 함 (어깨 폭의 30% 이내)
    const wristHeightDiff = Math.abs(leftWrist.y - rightWrist.y);
    if (wristHeightDiff > shoulderWidth * 0.3) {
      validCount++;
      continue;
    }

    // 4. 가슴 높이 체크: 손목이 어깨와 비슷한 높이 (어깨 폭의 80% 이내)
    const avgWristY = (leftWrist.y + rightWrist.y) / 2;
    const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
    const isChestLevel = Math.abs(avgWristY - avgShoulderY) < shoulderWidth * 0.8;

    if (!isChestLevel) {
      validCount++;
      continue;
    }

    // 모든 조건 통과 → 교차 인정
    crossedCount++;
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