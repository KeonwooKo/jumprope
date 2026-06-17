"use client";

import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

export type JumpType =
  | "basic"        // 모아뛰기
  | "cross"        // X자 뛰기 (팔 교차)
  | "rock-paper"   // 보바위 뛰기
  | "zigzag"       // 지그재그 뛰기
  | "side-swing";  // 옆 흔들어 뛰기

export type JumpEvent = {
  type: JumpType;
  timestamp: number;
  confidence: number;
  // 패턴 분석용 데이터
  ankleDistance: number;
  isCrossed: boolean;
  isWide: boolean;
  sideDirection: "left" | "right" | "center";
  isArmCrossed: boolean; // 팔(손목) 교차 여부
};

type Props = {
  landmarksRef: RefObject<NormalizedLandmark[] | null>;
  onJump: (event: JumpEvent) => void;
  enabled?: boolean;
};

// Tuning parameters
const BASELINE_ALPHA = 0.02;
const JUMP_UP_THRESHOLD = 0.04;
const JUMP_RESET_THRESHOLD = 0.02;
const VIS_THRESHOLD = 0.5;
const PATTERN_HISTORY_SIZE = 4; // 패턴 분석을 위한 히스토리 크기

// 랜드마크 인덱스
const LANDMARK = {
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
};

// Canvas-internal helper: 줄넘기 동작을 분류하고 점프 이벤트 발생
export function JumpClassifier({ landmarksRef, onJump, enabled = true }: Props) {
  const baselineYRef = useRef<number | null>(null);
  const isInAirRef = useRef(false);
  const frameHistoryRef = useRef<NormalizedLandmark[][]>([]);
  const jumpHistoryRef = useRef<JumpEvent[]>([]); // 최근 점프 히스토리

  useFrame(() => {
    if (!enabled) return;
    const lms = landmarksRef.current;
    if (!lms) return;

    const leftHip = lms[LANDMARK.LEFT_HIP];
    const rightHip = lms[LANDMARK.RIGHT_HIP];
    if (!leftHip || !rightHip) return;

    const vis = Math.min(leftHip.visibility ?? 0, rightHip.visibility ?? 0);
    if (vis < VIS_THRESHOLD) return;

    const hipY = (leftHip.y + rightHip.y) / 2;

    if (baselineYRef.current === null) {
      baselineYRef.current = hipY;
      return;
    }

    const delta = baselineYRef.current - hipY;

    if (Math.abs(delta) < 0.015) {
      baselineYRef.current =
        baselineYRef.current * (1 - BASELINE_ALPHA) + hipY * BASELINE_ALPHA;
    }

    if (delta > JUMP_RESET_THRESHOLD) {
      frameHistoryRef.current.push([...lms]);
      if (frameHistoryRef.current.length > 10) {
        frameHistoryRef.current.shift();
      }
    }

    if (delta > JUMP_UP_THRESHOLD && !isInAirRef.current) {
      isInAirRef.current = true;
    } else if (delta < JUMP_RESET_THRESHOLD && isInAirRef.current) {
      isInAirRef.current = false;

      // 착지 시점에 동작 분류 수행
      const jumpData = analyzeJumpFrame(frameHistoryRef.current);

      // 최근 히스토리에 추가
      jumpHistoryRef.current.push(jumpData);
      if (jumpHistoryRef.current.length > PATTERN_HISTORY_SIZE) {
        jumpHistoryRef.current.shift();
      }

      // 패턴 기반 최종 분류
      const finalClassification = classifyWithPattern(
        jumpData,
        jumpHistoryRef.current
      );

      onJump(finalClassification);
      frameHistoryRef.current = [];
    }
  });

  return null;
}

// 개별 점프 프레임 분석
function analyzeJumpFrame(frames: NormalizedLandmark[][]): JumpEvent {
  if (frames.length < 3) {
    return {
      type: "basic",
      timestamp: Date.now(),
      confidence: 0.5,
      ankleDistance: 0,
      isCrossed: false,
      isWide: false,
      sideDirection: "center",
      isArmCrossed: false,
    };
  }

  const midFrames = frames.slice(
    Math.floor(frames.length * 0.3),
    Math.floor(frames.length * 0.7)
  );

  if (midFrames.length === 0) {
    return {
      type: "basic",
      timestamp: Date.now(),
      confidence: 0.5,
      ankleDistance: 0,
      isCrossed: false,
      isWide: false,
      sideDirection: "center",
      isArmCrossed: false,
    };
  }

  // 평균 값 계산
  let totalAnkleDistance = 0;
  let crossedCount = 0;
  let wideCount = 0;
  let leftSideCount = 0;
  let rightSideCount = 0;
  let armCrossedCount = 0;
  let validFrames = 0;

  for (const lms of midFrames) {
    const leftAnkle = lms[LANDMARK.LEFT_ANKLE];
    const rightAnkle = lms[LANDMARK.RIGHT_ANKLE];
    const leftHip = lms[LANDMARK.LEFT_HIP];
    const rightHip = lms[LANDMARK.RIGHT_HIP];

    if (!leftAnkle || !rightAnkle || !leftHip || !rightHip) continue;

    const hipCenterX = (leftHip.x + rightHip.x) / 2;
    const hipWidth = Math.abs(leftHip.x - rightHip.x);
    const ankleDistance = Math.abs(leftAnkle.x - rightAnkle.x);

    totalAnkleDistance += ankleDistance;
    validFrames++;

    // 발 교차 체크
    if (leftAnkle.x > hipCenterX && rightAnkle.x < hipCenterX) {
      crossedCount++;
    }

    // 발 벌림 체크
    if (ankleDistance > hipWidth * 1.3) {
      wideCount++;
    }

    // 좌우 치우침 체크
    const avgAnkleX = (leftAnkle.x + rightAnkle.x) / 2;
    const deviation = avgAnkleX - hipCenterX;
    if (deviation < -hipWidth * 0.3) {
      leftSideCount++;
    } else if (deviation > hipWidth * 0.3) {
      rightSideCount++;
    }

    // 팔(손목) 교차 체크
    const leftWrist = lms[LANDMARK.LEFT_WRIST];
    const rightWrist = lms[LANDMARK.RIGHT_WRIST];
    const leftShoulder = lms[LANDMARK.LEFT_SHOULDER];
    const rightShoulder = lms[LANDMARK.RIGHT_SHOULDER];

    if (leftWrist && rightWrist && leftShoulder && rightShoulder) {
      const shoulderCenterX = (leftShoulder.x + rightShoulder.x) / 2;
      const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);

      // 손목이 중심선 교차 + 손목 높이 비슷
      const leftWristCrossed = leftWrist.x > shoulderCenterX;
      const rightWristCrossed = rightWrist.x < shoulderCenterX;
      const wristHeightDiff = Math.abs(leftWrist.y - rightWrist.y);
      const crossDepth = Math.abs(leftWrist.x - shoulderCenterX) + Math.abs(shoulderCenterX - rightWrist.x);

      if (
        leftWristCrossed &&
        rightWristCrossed &&
        wristHeightDiff < shoulderWidth * 0.4 &&
        crossDepth > shoulderWidth * 0.4
      ) {
        armCrossedCount++;
      }
    }
  }

  if (validFrames === 0) {
    return {
      type: "basic",
      timestamp: Date.now(),
      confidence: 0.5,
      ankleDistance: 0,
      isCrossed: false,
      isWide: false,
      sideDirection: "center",
      isArmCrossed: false,
    };
  }

  const avgAnkleDistance = totalAnkleDistance / validFrames;
  const isCrossed = crossedCount / validFrames > 0.5;
  const isWide = wideCount / validFrames > 0.5;
  const isArmCrossed = armCrossedCount / validFrames > 0.6;

  let sideDirection: "left" | "right" | "center" = "center";
  if (leftSideCount > validFrames * 0.5) {
    sideDirection = "left";
  } else if (rightSideCount > validFrames * 0.5) {
    sideDirection = "right";
  }

  return {
    type: "basic", // 임시, 패턴 분석 후 결정
    timestamp: Date.now(),
    confidence: 0.8,
    ankleDistance: avgAnkleDistance,
    isCrossed,
    isWide,
    sideDirection,
    isArmCrossed,
  };
}

// 패턴 기반 최종 분류
function classifyWithPattern(
  current: JumpEvent,
  history: JumpEvent[]
): JumpEvent {
  // X자 뛰기: 팔 교차 (손목 기반) - 단일 프레임 분석
  const crossScore = checkArmCross(history);
  if (crossScore > 0.6) {
    return { ...current, type: "cross", confidence: crossScore };
  }

  // 히스토리가 충분하지 않으면 단일 프레임 분석만
  if (history.length < 3) {
    return { ...current, type: "basic", confidence: 0.7 };
  }

  // 보바위 뛰기: 좁음-넓음 반복, 교차 없음
  const rockPaperScore = checkRockPaperPattern(history);
  if (rockPaperScore > 0.6) {
    return { ...current, type: "rock-paper", confidence: rockPaperScore };
  }

  // 지그재그 뛰기: 넓음-좁음교차 반복
  const zigzagScore = checkZigzagPattern(history);
  if (zigzagScore > 0.6) {
    return { ...current, type: "zigzag", confidence: zigzagScore };
  }

  // 옆 흔들어 뛰기: 좌우 방향 교대
  const sideSwingScore = checkSideSwingPattern(history);
  if (sideSwingScore > 0.6) {
    return { ...current, type: "side-swing", confidence: sideSwingScore };
  }

  // 기본 뛰기
  return { ...current, type: "basic", confidence: 0.8 };
}

// X자 뛰기: 손목 교차 체크
function checkArmCross(history: JumpEvent[]): number {
  if (history.length === 0) return 0;

  const recent = history.slice(-3);
  let armCrossCount = 0;

  for (const jump of recent) {
    if (jump.isArmCrossed) {
      armCrossCount++;
    }
  }

  return armCrossCount / recent.length;
}

// 보바위 패턴: 좁음-넓음 반복
function checkRockPaperPattern(history: JumpEvent[]): number {
  if (history.length < 3) return 0;

  const recent = history.slice(-4);
  let alternatingCount = 0;
  let hasCrossed = false;

  for (let i = 1; i < recent.length; i++) {
    const prev = recent[i - 1];
    const curr = recent[i];

    // 교차가 있으면 보바위 아님
    if (prev.isCrossed || curr.isCrossed) {
      hasCrossed = true;
      break;
    }

    // 좁음-넓음 또는 넓음-좁음 교대 체크
    if (prev.isWide !== curr.isWide) {
      alternatingCount++;
    }
  }

  if (hasCrossed) return 0;
  return alternatingCount / (recent.length - 1);
}

// 지그재그 패턴: 넓음-좁음교차 반복
function checkZigzagPattern(history: JumpEvent[]): number {
  if (history.length < 3) return 0;

  const recent = history.slice(-4);
  let patternCount = 0;

  for (let i = 1; i < recent.length; i++) {
    const prev = recent[i - 1];
    const curr = recent[i];

    // 넓음 → 좁음교차 또는 좁음교차 → 넓음
    const pattern1 = prev.isWide && !curr.isWide && curr.isCrossed;
    const pattern2 = !prev.isWide && prev.isCrossed && curr.isWide;

    if (pattern1 || pattern2) {
      patternCount++;
    }
  }

  return patternCount / (recent.length - 1);
}

// 옆 흔들어 뛰기 패턴: 좌우 방향 교대
function checkSideSwingPattern(history: JumpEvent[]): number {
  if (history.length < 3) return 0;

  const recent = history.slice(-4);
  let alternatingCount = 0;

  for (let i = 1; i < recent.length; i++) {
    const prev = recent[i - 1];
    const curr = recent[i];

    // 좌우 방향이 교대로 바뀜
    const leftRight = prev.sideDirection === "left" && curr.sideDirection === "right";
    const rightLeft = prev.sideDirection === "right" && curr.sideDirection === "left";

    if (leftRight || rightLeft) {
      alternatingCount++;
    }
  }

  return alternatingCount / (recent.length - 1);
}
