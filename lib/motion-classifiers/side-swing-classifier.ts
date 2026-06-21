import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import type { MotionJumpEvent } from "./types";
import { analyzeJumpFrames } from "./frame-analyzer";

// 옆흔들기 전용 분류기
export function classifySideSwingJump(frames: NormalizedLandmark[][]): MotionJumpEvent {
  const raw = analyzeJumpFrames(frames);
  const timestamp = Date.now();

  // 옆흔들기 조건: 좌우 이동
  const sideDirection = raw.sideDirection;
  const isValid = sideDirection !== "center";

  const confidence = isValid ? 0.9 : 0.2;

  const reason = isValid
    ? `✅ 옆흔들기 인식 (${sideDirection === "left" ? "왼쪽" : "오른쪽"})`
    : "❌ 좌우 이동 부족";

  return {
    type: "side-swing",
    timestamp,
    isMatch: isValid,
    confidence,
    reason,
    raw,
  };
}