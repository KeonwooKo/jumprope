"use client";

import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import type { JumpType } from "./use-jump-classification";

export type TargetJumpEvent = {
  type: JumpType;
  timestamp: number;
  isMatch: boolean;  // 타겟 동작과 일치하는가?
  confidence: number;
  reason: string;    // 판정 이유
  // 디버깅용 원본 데이터
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

// Tuning parameters
const BASELINE_ALPHA = 0.02;
const JUMP_UP_THRESHOLD = 0.04;  // 엉덩이 상승 기준
const JUMP_RESET_THRESHOLD = 0.02;
const VIS_THRESHOLD = 0.5;
const ANKLE_JUMP_THRESHOLD = 0.03;  // 발 상승 기준

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

// 타겟 모드 전용 점프 분류기
export function TargetJumpClassifier({ landmarksRef, targetMotion, onJump, enabled = true }: Props) {
  const baselineHipYRef = useRef<number | null>(null);
  const baselineAnkleYRef = useRef<number | null>(null);
  const isInAirRef = useRef(false);
  const frameHistoryRef = useRef<NormalizedLandmark[][]>([]);

  useFrame(() => {
    if (!enabled) return;
    const lms = landmarksRef.current;
    if (!lms) return;

    const leftHip = lms[LANDMARK.LEFT_HIP];
    const rightHip = lms[LANDMARK.RIGHT_HIP];
    const leftAnkle = lms[LANDMARK.LEFT_ANKLE];
    const rightAnkle = lms[LANDMARK.RIGHT_ANKLE];

    if (!leftHip || !rightHip || !leftAnkle || !rightAnkle) return;

    const vis = Math.min(
      leftHip.visibility ?? 0,
      rightHip.visibility ?? 0,
      leftAnkle.visibility ?? 0,
      rightAnkle.visibility ?? 0
    );
    if (vis < VIS_THRESHOLD) return;

    const hipY = (leftHip.y + rightHip.y) / 2;
    const ankleY = (leftAnkle.y + rightAnkle.y) / 2;

    // 기준선 초기화
    if (baselineHipYRef.current === null) {
      baselineHipYRef.current = hipY;
      baselineAnkleYRef.current = ankleY;
      return;
    }

    const hipDelta = baselineHipYRef.current - hipY;
    const ankleDelta = baselineAnkleYRef.current - ankleY;

    // 기준선 업데이트 (지면에 있을 때)
    if (Math.abs(hipDelta) < 0.015) {
      baselineHipYRef.current =
        baselineHipYRef.current * (1 - BASELINE_ALPHA) + hipY * BASELINE_ALPHA;
      baselineAnkleYRef.current =
        baselineAnkleYRef.current * (1 - BASELINE_ALPHA) + ankleY * BASELINE_ALPHA;
    }

    // 프레임 히스토리 수집 (점프 중)
    if (hipDelta > JUMP_RESET_THRESHOLD) {
      frameHistoryRef.current.push([...lms]);
      if (frameHistoryRef.current.length > 10) {
        frameHistoryRef.current.shift();
      }
    }

    // 점프 감지: 엉덩이 + 발 모두 올라가야 함
    const isValidJump = hipDelta > JUMP_UP_THRESHOLD && ankleDelta > ANKLE_JUMP_THRESHOLD;

    if (isValidJump && !isInAirRef.current) {
      isInAirRef.current = true;
    } else if (hipDelta < JUMP_RESET_THRESHOLD && ankleDelta < JUMP_RESET_THRESHOLD && isInAirRef.current) {
      isInAirRef.current = false;

      // 착지 시점: 기본 점프 검증 + 타겟 동작 체크
      const jumpData = analyzeJumpFrame(frameHistoryRef.current);
      const result = checkTargetMotion(targetMotion, jumpData, { hipDelta, ankleDelta });

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
  raw: ReturnType<typeof analyzeJumpFrame>,
  jumpMetrics: { hipDelta: number; ankleDelta: number }
): TargetJumpEvent {
  const timestamp = Date.now();

  // 기본 점프 검증
  const hasValidJump = jumpMetrics.hipDelta > JUMP_UP_THRESHOLD && jumpMetrics.ankleDelta > ANKLE_JUMP_THRESHOLD;

  switch (targetMotion) {
    case "basic": {
      // 모아뛰기: 기본 점프 + 추가 동작 없음
      const isClean = !raw.isArmCrossed && !raw.isCrossed && !raw.isWide;
      const isMatch = hasValidJump && isClean;

      let reason = "";
      if (!hasValidJump) {
        reason = `❌ 점프 높이 부족 (엉덩이 ${(jumpMetrics.hipDelta * 100).toFixed(1)}%, 발 ${(jumpMetrics.ankleDelta * 100).toFixed(1)}% / 필요: 엉덩이 4%, 발 3%)`;
      } else if (!isClean) {
        const issues = [];
        if (raw.isArmCrossed) issues.push("팔 교차");
        if (raw.isCrossed) issues.push("발 교차");
        if (raw.isWide) issues.push("발 벌림");
        reason = `❌ 불필요한 동작: ${issues.join(", ")}`;
      } else {
        reason = `✅ 깔끔한 모아뛰기 (엉덩이↑${(jumpMetrics.hipDelta * 100).toFixed(1)}%, 발↑${(jumpMetrics.ankleDelta * 100).toFixed(1)}%)`;
      }

      return {
        type: "basic",
        timestamp,
        isMatch,
        confidence: isMatch ? 0.9 : 0.3,
        reason,
        raw,
      };
    }

    case "cross": {
      // X자: 기본 점프 + 팔 교차
      const isMatch = hasValidJump && raw.isArmCrossed;

      let reason = "";
      if (!hasValidJump) {
        reason = `❌ 점프 높이 부족 (엉덩이 ${(jumpMetrics.hipDelta * 100).toFixed(1)}%, 발 ${(jumpMetrics.ankleDelta * 100).toFixed(1)}%)`;
      } else if (!raw.isArmCrossed) {
        reason = "❌ 팔 교차 부족 - 가슴 앞에서 확실히 교차하세요";
      } else {
        reason = "✅ X자 완성 (점프 + 팔 교차)";
      }

      return {
        type: "cross",
        timestamp,
        isMatch,
        confidence: isMatch ? 0.9 : 0.3,
        reason,
        raw,
      };
    }

    case "rock-paper": {
      // 보바위: 기본 점프 + 발 벌림 (교차 없음)
      const isValid = hasValidJump && raw.isWide && !raw.isCrossed;

      let reason = "";
      if (!hasValidJump) {
        reason = "❌ 점프 높이 부족";
      } else if (!raw.isWide) {
        reason = "❌ 발을 더 벌리세요";
      } else if (raw.isCrossed) {
        reason = "❌ 발이 교차됨 (벌리기만 해야 함)";
      } else {
        reason = "✅ 보바위 완성 (점프 + 발 벌림)";
      }

      return {
        type: "rock-paper",
        timestamp,
        isMatch: isValid,
        confidence: isValid ? 0.85 : 0.3,
        reason,
        raw,
      };
    }

    case "zigzag": {
      // 지그재그: 기본 점프 + 발 교차 또는 발 벌림
      const isValid = hasValidJump && (raw.isCrossed || raw.isWide);

      let reason = "";
      if (!hasValidJump) {
        reason = "❌ 점프 높이 부족";
      } else if (!raw.isCrossed && !raw.isWide) {
        reason = "❌ 발을 교차하거나 벌리세요";
      } else {
        reason = `✅ 지그재그 (점프 + ${raw.isCrossed ? "발 교차" : "발 벌림"})`;
      }

      return {
        type: "zigzag",
        timestamp,
        isMatch: isValid,
        confidence: isValid ? 0.8 : 0.3,
        reason,
        raw,
      };
    }

    case "side-swing": {
      // 옆 흔들어: 기본 점프 + 좌우 이동
      const isValid = hasValidJump && raw.sideDirection !== "center";

      let reason = "";
      if (!hasValidJump) {
        reason = "❌ 점프 높이 부족";
      } else if (raw.sideDirection === "center") {
        reason = "❌ 좌우로 몸을 더 기울이세요";
      } else {
        reason = `✅ 옆흔들기 (점프 + ${raw.sideDirection === "left" ? "왼쪽" : "오른쪽"} 이동)`;
      }

      return {
        type: "side-swing",
        timestamp,
        isMatch: isValid,
        confidence: isValid ? 0.85 : 0.3,
        reason,
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
