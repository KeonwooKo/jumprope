"use client";

import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import type { JumpType } from "./use-jump-classification";
import {
  classifyJumpByMotion,
  LANDMARK,
  COMMON_PARAMS,
  type MotionJumpEvent,
} from "./motion-classifiers";

export type TargetJumpEvent = MotionJumpEvent;

type Props = {
  landmarksRef: RefObject<NormalizedLandmark[] | null>;
  targetMotion: JumpType;
  onJump: (event: TargetJumpEvent) => void;
  enabled?: boolean;
};

// BasicJump과 동일한 파라미터
const { BASELINE_ALPHA, JUMP_UP_THRESHOLD, JUMP_RESET_THRESHOLD, VIS_THRESHOLD } = COMMON_PARAMS;

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

      // 착지 시 동작 분류 (전용 분류기 사용)
      const result = classifyJumpByMotion(frameHistoryRef.current, targetMotion);

      // 매칭될 때만 UI에 전달 (준비 동작은 무시)
      if (result.isMatch) {
        onJump(result);
      }
      frameHistoryRef.current = [];
    }
  });

  return null;
}
