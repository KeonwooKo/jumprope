// 중앙 export
export { classifyBasicJump } from "./basic-classifier";
export { classifyCrossJump } from "./cross-classifier";
export { classifyRockPaperJump } from "./rock-paper-classifier";
export { classifyZigzagJump } from "./zigzag-classifier";
export { classifySideSwingJump } from "./side-swing-classifier";

export type { MotionJumpEvent, JumpFrameData, MotionClassifier } from "./types";
export { LANDMARK, COMMON_PARAMS } from "./types";

// 동작별 분류기 매핑
import type { JumpType } from "../use-jump-classification";
import type { MotionClassifier } from "./types";
import { classifyBasicJump } from "./basic-classifier";
import { classifyCrossJump } from "./cross-classifier";
import { classifyRockPaperJump } from "./rock-paper-classifier";
import { classifyZigzagJump } from "./zigzag-classifier";
import { classifySideSwingJump } from "./side-swing-classifier";

export const motionClassifiers: Record<JumpType, MotionClassifier> = {
  basic: classifyBasicJump,
  cross: classifyCrossJump,
  "rock-paper": classifyRockPaperJump,
  zigzag: classifyZigzagJump,
  "side-swing": classifySideSwingJump,
};

// 편의 함수: targetMotion에 맞는 분류기 자동 선택
export function classifyJumpByMotion(
  frames: Parameters<MotionClassifier>[0],
  targetMotion: JumpType
): ReturnType<MotionClassifier> {
  const classifier = motionClassifiers[targetMotion];
  if (!classifier) {
    throw new Error(`Unknown motion type: ${targetMotion}`);
  }
  return classifier(frames, targetMotion);
}