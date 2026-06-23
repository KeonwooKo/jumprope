import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import type { JumpType } from "../use-jump-classification";

// 공통 이벤트 타입
export type MotionJumpEvent = {
  type: JumpType;
  timestamp: number;
  isMatch: boolean;
  confidence: number;
  reason: string;
  raw: JumpFrameData;
  debug?: string[]; // 디버그 정보 (개발용)
};

// 프레임 분석 결과
export type JumpFrameData = {
  ankleDistance: number;
  isCrossed: boolean;
  isWide: boolean;
  sideDirection: "left" | "right" | "center";
  isArmCrossed: boolean;
};

// 분류기 인터페이스
export type MotionClassifier = (
  frames: NormalizedLandmark[][],
  targetMotion: JumpType
) => MotionJumpEvent;

// 랜드마크 상수
export const LANDMARK = {
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
} as const;

// 공통 파라미터
export const COMMON_PARAMS = {
  BASELINE_ALPHA: 0.02,
  JUMP_UP_THRESHOLD: 0.04,
  JUMP_RESET_THRESHOLD: 0.02,
  VIS_THRESHOLD: 0.5,
} as const;