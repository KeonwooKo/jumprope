"use client";

import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import type { JumpType } from "./use-jump-classification";

export type TargetJumpEvent = {
  type: JumpType;
  timestamp: number;
  isMatch: boolean;
  confidence: number;
  reason: string;
  raw: {
    ankleDistance: number;
    isCrossed: boolean;
    isWide: boolean;
    sideDirection: "left" | "right" | "center";
    isArmCrossed: boolean;
  };
};

type Props = {
  landmarksRef: RefObject<NormalizedLandmark[] | null>;
  targetMotion: JumpType;
  onJump: (event: TargetJumpEvent) => void;
  enabled?: boolean;
};

// BasicJump과 동일한 파라미터
const BASELINE_ALPHA = 0.02;
const JUMP_UP_THRESHOLD = 0.04;
const JUMP_RESET_THRESHOLD = 0.02;
const VIS_THRESHOLD = 0.5;

// 랜드마크 인덱스
const LANDMARK = {
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
};

// 타겟 모드 전용 점프 분류기 (BasicJump 기반)
export function TargetJumpClassifier({ landmarksRef, targetMotion, onJump, enabled = true }: Props) {
  const baselineYRef = useRef<number | null>(null);
  const isInAirRef = useRef(false);
  const frameHistoryRef = useRef<NormalizedLandmark[][]>([]);

  useFrame(() => {
    if (!enabled) return;
    const lms = landmarksRef.current;
    if (!lms) return;

    // BasicJump과 동일: 엉덩이만 체크
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

    // 기준선 업데이트
    if (Math.abs(delta) < 0.015) {
      baselineYRef.current = baselineYRef.current * (1 - BASELINE_ALPHA) + hipY * BASELINE_ALPHA;
    }

    // 프레임 수집 (동작 분류용)
    if (delta > JUMP_RESET_THRESHOLD) {
      frameHistoryRef.current.push([...lms]);
      if (frameHistoryRef.current.length > 10) {
        frameHistoryRef.current.shift();
      }
    }

    // 점프 감지 (BasicJump와 동일)
    if (delta > JUMP_UP_THRESHOLD && !isInAirRef.current) {
      isInAirRef.current = true;
    } else if (delta < JUMP_RESET_THRESHOLD && isInAirRef.current) {
      isInAirRef.current = false;

      // 착지 시 동작 분류
      const jumpData = analyzeJumpFrame(frameHistoryRef.current);
      const result = checkTargetMotion(targetMotion, jumpData);

      onJump(result);
      frameHistoryRef.current = [];
    }
  });

  return null;
}

// 점프 프레임 분석 (원본 특징 추출)
function analyzeJumpFrame(frames: NormalizedLandmark[][]) {
  if (frames.length < 3) {
    return {
      ankleDistance: 0,
      isCrossed: false,
      isWide: false,
      sideDirection: "center" as const,
      isArmCrossed: false,
    };
  }

  const midFrames = frames.slice(
    Math.floor(frames.length * 0.3),
    Math.floor(frames.length * 0.7)
  );

  if (midFrames.length === 0) {
    return {
      ankleDistance: 0,
      isCrossed: false,
      isWide: false,
      sideDirection: "center" as const,
      isArmCrossed: false,
    };
  }

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

    if (leftAnkle.x > hipCenterX && rightAnkle.x < hipCenterX) {
      crossedCount++;
    }

    if (ankleDistance > hipWidth * 1.3) {
      wideCount++;
    }

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

      const leftWristCrossed = leftWrist.x > shoulderCenterX;
      const rightWristCrossed = rightWrist.x < shoulderCenterX;
      const leftCrossDistance = leftWrist.x - shoulderCenterX;
      const rightCrossDistance = shoulderCenterX - rightWrist.x;
      const wristHeightDiff = Math.abs(leftWrist.y - rightWrist.y);
      const avgWristY = (leftWrist.y + rightWrist.y) / 2;
      const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
      const isChestLevel = Math.abs(avgWristY - avgShoulderY) < shoulderWidth * 0.8;

      if (
        leftWristCrossed &&
        rightWristCrossed &&
        leftCrossDistance > shoulderWidth * 0.2 &&
        rightCrossDistance > shoulderWidth * 0.2 &&
        wristHeightDiff < shoulderWidth * 0.3 &&
        isChestLevel
      ) {
        armCrossedCount++;
      }
    }
  }

  if (validFrames === 0) {
    return {
      ankleDistance: 0,
      isCrossed: false,
      isWide: false,
      sideDirection: "center" as const,
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
    ankleDistance: avgAnkleDistance,
    isCrossed,
    isWide,
    sideDirection,
    isArmCrossed,
  };
}

// 타겟 동작 체크 (해당 동작만 판정)
function checkTargetMotion(
  targetMotion: JumpType,
  raw: ReturnType<typeof analyzeJumpFrame>
): TargetJumpEvent {
  const timestamp = Date.now();

  switch (targetMotion) {
    case "basic": {
      // 모아뛰기: 추가 동작 없음
      const isClean = !raw.isArmCrossed && !raw.isCrossed && !raw.isWide;

      return {
        type: "basic",
        timestamp,
        isMatch: isClean,
        confidence: isClean ? 0.9 : 0.5,
        reason: isClean
          ? "✅ 모아뛰기 인식"
          : `❌ ${raw.isArmCrossed ? "팔 교차" : ""}${raw.isCrossed ? "발 교차" : ""}${raw.isWide ? "발 벌림" : ""} 감지`,
        raw,
      };
    }

    case "cross": {
      // X자: 팔 교차
      return {
        type: "cross",
        timestamp,
        isMatch: raw.isArmCrossed,
        confidence: raw.isArmCrossed ? 0.9 : 0.3,
        reason: raw.isArmCrossed
          ? "✅ X자 인식 (팔 교차)"
          : "❌ 팔 교차 부족",
        raw,
      };
    }

    case "rock-paper": {
      // 보바위: 발 벌림 (교차 없음)
      const isValid = raw.isWide && !raw.isCrossed;
      return {
        type: "rock-paper",
        timestamp,
        isMatch: isValid,
        confidence: isValid ? 0.85 : 0.3,
        reason: isValid
          ? "✅ 보바위 인식 (발 벌림)"
          : `❌ ${!raw.isWide ? "발 벌림 부족" : "발이 교차됨"}`,
        raw,
      };
    }

    case "zigzag": {
      // 지그재그: 발 교차 또는 발 벌림
      const isValid = raw.isCrossed || raw.isWide;
      return {
        type: "zigzag",
        timestamp,
        isMatch: isValid,
        confidence: isValid ? 0.8 : 0.3,
        reason: isValid
          ? `✅ 지그재그 인식 (${raw.isCrossed ? "발 교차" : "발 벌림"})`
          : "❌ 발 동작 부족",
        raw,
      };
    }

    case "side-swing": {
      // 옆 흔들어: 좌우 이동
      const isValid = raw.sideDirection !== "center";
      return {
        type: "side-swing",
        timestamp,
        isMatch: isValid,
        confidence: isValid ? 0.85 : 0.3,
        reason: isValid
          ? `✅ 옆흔들기 인식 (${raw.sideDirection})`
          : "❌ 좌우 이동 부족",
        raw,
      };
    }

    default:
      return {
        type: targetMotion,
        timestamp,
        isMatch: false,
        confidence: 0,
        reason: "알 수 없는 동작",
        raw,
      };
  }
}
