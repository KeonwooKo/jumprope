import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import type { MotionJumpEvent } from "./types";

const LANDMARK = {
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
} as const;

// 보바위: 발이 벌어지면 OK
export function classifyRockPaperJump(frames: NormalizedLandmark[][]): MotionJumpEvent {
  if (frames.length < 2) {
    return {
      type: "rock-paper",
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

  let totalAnkleDistance = 0;
  let validCount = 0;

  for (const lms of midFrames) {
    const leftAnkle = lms[LANDMARK.LEFT_ANKLE];
    const rightAnkle = lms[LANDMARK.RIGHT_ANKLE];
    const leftHip = lms[LANDMARK.LEFT_HIP];
    const rightHip = lms[LANDMARK.RIGHT_HIP];

    if (!leftAnkle || !rightAnkle || !leftHip || !rightHip) continue;

    const hipWidth = Math.abs(leftHip.x - rightHip.x);
    const ankleDistance = Math.abs(leftAnkle.x - rightAnkle.x);

    totalAnkleDistance += ankleDistance / hipWidth;
    validCount++;
  }

  if (validCount === 0) {
    return {
      type: "rock-paper",
      timestamp: Date.now(),
      isMatch: false,
      confidence: 0,
      reason: "랜드마크 없음",
      raw: { ankleDistance: 0, isCrossed: false, isWide: false, sideDirection: "center", isArmCrossed: false },
    };
  }

  const avgDistance = totalAnkleDistance / validCount;

  // 발이 엉덩이 폭보다 넓으면 보바위
  const isWide = avgDistance > 1.3;

  return {
    type: "rock-paper",
    timestamp: Date.now(),
    isMatch: isWide,
    confidence: isWide ? 0.95 : 0.3,
    reason: isWide
      ? `✅ 보바위 인식 (발 간격: ${avgDistance.toFixed(2)})`
      : `❌ 발 벌림 부족 (${avgDistance.toFixed(2)})`,
    raw: { ankleDistance: avgDistance, isCrossed: false, isWide, sideDirection: "center", isArmCrossed: false },
  };
}