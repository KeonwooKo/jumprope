import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import type { MotionJumpEvent } from "./types";
import { analyzeJumpFrames } from "./frame-analyzer";

// 모아뛰기 전용 분류기 (매우 엄격)
export function classifyBasicJump(frames: NormalizedLandmark[][]): MotionJumpEvent {
  const raw = analyzeJumpFrames(frames);
  const timestamp = Date.now();

  // 모아뛰기 조건: 추가 동작이 전혀 없어야 함
  const hasArmCross = raw.isArmCrossed;
  const hasFootCross = raw.isCrossed;
  const hasFootWide = raw.isWide;
  const hasSideMove = raw.sideDirection !== "center";

  // 발 간격이 너무 넓으면 안됨 (엄격한 threshold)
  const ankleDistanceTooWide = raw.ankleDistance > 0.15;

  const isClean = !hasArmCross && !hasFootCross && !hasFootWide && !hasSideMove && !ankleDistanceTooWide;

  // 오탐 이유 수집
  const reasons: string[] = [];
  if (hasArmCross) reasons.push("팔 교차");
  if (hasFootCross) reasons.push("발 교차");
  if (hasFootWide) reasons.push("발 벌림");
  if (hasSideMove) reasons.push(`좌우 이동(${raw.sideDirection})`);
  if (ankleDistanceTooWide) reasons.push(`발 간격 과다(${raw.ankleDistance.toFixed(2)})`);

  return {
    type: "basic",
    timestamp,
    isMatch: isClean,
    confidence: isClean ? 0.95 : 0.3,
    reason: isClean
      ? "✅ 모아뛰기 인식"
      : `❌ ${reasons.join(", ")} 감지`,
    raw,
  };
}