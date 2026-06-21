import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import type { MotionJumpEvent } from "./types";

const LANDMARK = {
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
} as const;

// 옆흔들기: 발이 좌우로 이동하면 OK
export function classifySideSwingJump(frames: NormalizedLandmark[][]): MotionJumpEvent {
  if (frames.length < 2) {
    return {
      type: "side-swing",
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

  let leftSideCount = 0;
  let rightSideCount = 0;
  let validCount = 0;

  for (const lms of midFrames) {
    const leftAnkle = lms[LANDMARK.LEFT_ANKLE];
    const rightAnkle = lms[LANDMARK.RIGHT_ANKLE];
    const leftHip = lms[LANDMARK.LEFT_HIP];
    const rightHip = lms[LANDMARK.RIGHT_HIP];

    if (!leftAnkle || !rightAnkle || !leftHip || !rightHip) continue;

    const hipCenterX = (leftHip.x + rightHip.x) / 2;
    const hipWidth = Math.abs(leftHip.x - rightHip.x);
    const avgAnkleX = (leftAnkle.x + rightAnkle.x) / 2;
    const deviation = avgAnkleX - hipCenterX;

    // 엉덩이 중심에서 30% 이상 벗어나면 좌우 이동
    if (deviation < -hipWidth * 0.3) {
      leftSideCount++;
    } else if (deviation > hipWidth * 0.3) {
      rightSideCount++;
    }

    validCount++;
  }

  if (validCount === 0) {
    return {
      type: "side-swing",
      timestamp: Date.now(),
      isMatch: false,
      confidence: 0,
      reason: "랜드마크 없음",
      raw: { ankleDistance: 0, isCrossed: false, isWide: false, sideDirection: "center", isArmCrossed: false },
    };
  }

  const leftRatio = leftSideCount / validCount;
  const rightRatio = rightSideCount / validCount;

  let sideDirection: "left" | "right" | "center" = "center";
  let isValid = false;

  if (leftRatio > 0.5) {
    sideDirection = "left";
    isValid = true;
  } else if (rightRatio > 0.5) {
    sideDirection = "right";
    isValid = true;
  }

  return {
    type: "side-swing",
    timestamp: Date.now(),
    isMatch: isValid,
    confidence: isValid ? 0.95 : 0.2,
    reason: isValid
      ? `✅ 옆흔들기 인식 (${sideDirection === "left" ? "왼쪽" : "오른쪽"})`
      : "❌ 좌우 이동 부족",
    raw: { ankleDistance: 0, isCrossed: false, isWide: false, sideDirection, isArmCrossed: false },
  };
}