import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import type { MotionJumpEvent } from "./types";

const LANDMARK = {
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
} as const;

// 지그재그: 발이 교차하거나 벌어지면 OK
export function classifyZigzagJump(frames: NormalizedLandmark[][]): MotionJumpEvent {
  if (frames.length < 2) {
    return {
      type: "zigzag",
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
  let wideCount = 0;
  let validCount = 0;

  for (const lms of midFrames) {
    const leftAnkle = lms[LANDMARK.LEFT_ANKLE];
    const rightAnkle = lms[LANDMARK.RIGHT_ANKLE];
    const leftHip = lms[LANDMARK.LEFT_HIP];
    const rightHip = lms[LANDMARK.RIGHT_HIP];

    if (!leftAnkle || !rightAnkle || !leftHip || !rightHip) continue;

    const hipCenterX = (leftHip.x + rightHip.x) / 2;
    const hipWidth = Math.abs(leftHip.x - rightHip.x);
    const ankleDistance = Math.abs(leftAnkle.x - rightAnkle.x);

    // 발 교차
    if (leftAnkle.x > hipCenterX && rightAnkle.x < hipCenterX) {
      crossedCount++;
    }

    // 발 벌림
    if (ankleDistance > hipWidth * 1.3) {
      wideCount++;
    }

    validCount++;
  }

  if (validCount === 0) {
    return {
      type: "zigzag",
      timestamp: Date.now(),
      isMatch: false,
      confidence: 0,
      reason: "랜드마크 없음",
      raw: { ankleDistance: 0, isCrossed: false, isWide: false, sideDirection: "center", isArmCrossed: false },
    };
  }

  const crossRatio = crossedCount / validCount;
  const wideRatio = wideCount / validCount;

  const isCrossed = crossRatio > 0.3;
  const isWide = wideRatio > 0.3;
  const isValid = isCrossed || isWide;

  let reason: string;
  if (isCrossed && isWide) {
    reason = `✅ 지그재그 인식 (교차+벌림)`;
  } else if (isCrossed) {
    reason = `✅ 지그재그 인식 (교차 ${(crossRatio * 100).toFixed(0)}%)`;
  } else if (isWide) {
    reason = `✅ 지그재그 인식 (벌림 ${(wideRatio * 100).toFixed(0)}%)`;
  } else {
    reason = `❌ 발 동작 부족`;
  }

  return {
    type: "zigzag",
    timestamp: Date.now(),
    isMatch: isValid,
    confidence: isValid ? 0.9 : 0.2,
    reason,
    raw: { ankleDistance: 0, isCrossed, isWide, sideDirection: "center", isArmCrossed: false },
  };
}