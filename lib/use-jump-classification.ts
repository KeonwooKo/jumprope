"use client";

import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

export type JumpType =
  | "basic"        // 기본 뛰기
  | "cross"        // X자 뛰기
  | "alternate"    // 번갈아 뛰기
  | "arm-cross"    // 십자 뛰기 (손목 교차)
  | "zigzag";      // 지그재그 뛰기

export type JumpEvent = {
  type: JumpType;
  timestamp: number;
  confidence: number; // 0~1
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
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT: 31,
  RIGHT_FOOT: 32,
};

// Canvas-internal helper: 줄넘기 동작을 분류하고 점프 이벤트 발생
export function JumpClassifier({ landmarksRef, onJump, enabled = true }: Props) {
  const baselineYRef = useRef<number | null>(null);
  const isInAirRef = useRef(false);

  // 동작 분석을 위한 히스토리 (착지 직전 프레임들)
  const frameHistoryRef = useRef<NormalizedLandmark[][]>([]);

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

    // 베이스라인 초기화
    if (baselineYRef.current === null) {
      baselineYRef.current = hipY;
      return;
    }

    const delta = baselineYRef.current - hipY;

    // 베이스라인 드리프트 보정
    if (Math.abs(delta) < 0.015) {
      baselineYRef.current =
        baselineYRef.current * (1 - BASELINE_ALPHA) + hipY * BASELINE_ALPHA;
    }

    // 공중에 있을 때 프레임 기록
    if (delta > JUMP_RESET_THRESHOLD) {
      frameHistoryRef.current.push([...lms]);
      // 최근 10프레임만 유지
      if (frameHistoryRef.current.length > 10) {
        frameHistoryRef.current.shift();
      }
    }

    // 점프 감지 (상승)
    if (delta > JUMP_UP_THRESHOLD && !isInAirRef.current) {
      isInAirRef.current = true;
    }
    // 착지 감지
    else if (delta < JUMP_RESET_THRESHOLD && isInAirRef.current) {
      isInAirRef.current = false;

      // 착지 시점에 동작 분류 수행
      const jumpType = classifyJump(frameHistoryRef.current);
      onJump({
        type: jumpType.type,
        timestamp: Date.now(),
        confidence: jumpType.confidence,
      });

      // 히스토리 초기화
      frameHistoryRef.current = [];
    }
  });

  return null;
}

// 점프 동작 분류 로직
function classifyJump(frames: NormalizedLandmark[][]): { type: JumpType; confidence: number } {
  if (frames.length < 3) {
    return { type: "basic", confidence: 0.5 };
  }

  // 중간 프레임들 분석 (공중에서의 자세)
  const midFrames = frames.slice(Math.floor(frames.length * 0.3), Math.floor(frames.length * 0.7));
  if (midFrames.length === 0) {
    return { type: "basic", confidence: 0.5 };
  }

  const scores = {
    cross: 0,
    alternate: 0,
    armCross: 0,
    zigzag: 0,
  };

  for (const lms of midFrames) {
    // 발목 교차 체크 (X자 뛰기)
    const leftAnkle = lms[LANDMARK.LEFT_ANKLE];
    const rightAnkle = lms[LANDMARK.RIGHT_ANKLE];
    const leftHip = lms[LANDMARK.LEFT_HIP];
    const rightHip = lms[LANDMARK.RIGHT_HIP];

    if (leftAnkle && rightAnkle && leftHip && rightHip) {
      const hipCenterX = (leftHip.x + rightHip.x) / 2;
      const hipWidth = Math.abs(leftHip.x - rightHip.x);

      // X자: 발목이 중심선을 기준으로 반대편에 있음
      const leftCross = (leftAnkle.x - hipCenterX) / hipWidth;
      const rightCross = (hipCenterX - rightAnkle.x) / hipWidth;

      if (leftCross > 0.3 && rightCross > 0.3) {
        scores.cross += 1;
      }

      // 지그재그: 양 발이 한쪽으로 치우침
      const avgAnkleX = (leftAnkle.x + rightAnkle.x) / 2;
      const deviation = Math.abs(avgAnkleX - hipCenterX) / hipWidth;
      if (deviation > 0.4) {
        scores.zigzag += 1;
      }
    }

    // 번갈아 뛰기: 좌우 무릎 높이 차이
    const leftKnee = lms[LANDMARK.LEFT_KNEE];
    const rightKnee = lms[LANDMARK.RIGHT_KNEE];
    const leftHip2 = lms[LANDMARK.LEFT_HIP];
    const rightHip2 = lms[LANDMARK.RIGHT_HIP];

    if (leftKnee && rightKnee && leftHip2 && rightHip2) {
      const leftKneeHeight = leftHip2.y - leftKnee.y;
      const rightKneeHeight = rightHip2.y - rightKnee.y;
      const heightDiff = Math.abs(leftKneeHeight - rightKneeHeight);
      const avgHeight = (leftKneeHeight + rightKneeHeight) / 2;

      // 한쪽 무릎만 올라감 (높이 차이가 평균의 50% 이상)
      if (heightDiff > avgHeight * 0.5 && avgHeight > 0.05) {
        scores.alternate += 1;
      }
    }

    // 십자 뛰기: 손목이 반대편 어깨 방향으로 교차
    const leftWrist = lms[LANDMARK.LEFT_WRIST];
    const rightWrist = lms[LANDMARK.RIGHT_WRIST];
    const leftShoulder = lms[LANDMARK.LEFT_SHOULDER];
    const rightShoulder = lms[LANDMARK.RIGHT_SHOULDER];

    if (leftWrist && rightWrist && leftShoulder && rightShoulder) {
      const shoulderCenterX = (leftShoulder.x + rightShoulder.x) / 2;
      const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);

      // 왼손이 중심선 넘어 오른쪽으로, 오른손이 왼쪽으로
      const leftCross = (leftWrist.x - shoulderCenterX) / shoulderWidth;
      const rightCross = (shoulderCenterX - rightWrist.x) / shoulderWidth;

      if (leftCross > 0.2 && rightCross > 0.2) {
        scores.armCross += 1;
      }
    }
  }

  // 점수 정규화
  const frameCount = midFrames.length;
  const normalizedScores = {
    cross: scores.cross / frameCount,
    alternate: scores.alternate / frameCount,
    armCross: scores.armCross / frameCount,
    zigzag: scores.zigzag / frameCount,
  };

  // 가장 높은 점수의 동작 선택 (임계값 이상일 때만)
  const CONFIDENCE_THRESHOLD = 0.4;

  if (normalizedScores.cross > CONFIDENCE_THRESHOLD && normalizedScores.cross > normalizedScores.zigzag) {
    return { type: "cross", confidence: Math.min(normalizedScores.cross, 1.0) };
  }
  if (normalizedScores.alternate > CONFIDENCE_THRESHOLD) {
    return { type: "alternate", confidence: Math.min(normalizedScores.alternate, 1.0) };
  }
  if (normalizedScores.armCross > CONFIDENCE_THRESHOLD) {
    return { type: "arm-cross", confidence: Math.min(normalizedScores.armCross, 1.0) };
  }
  if (normalizedScores.zigzag > CONFIDENCE_THRESHOLD) {
    return { type: "zigzag", confidence: Math.min(normalizedScores.zigzag, 1.0) };
  }

  // 기본 뛰기
  return { type: "basic", confidence: 0.8 };
}
