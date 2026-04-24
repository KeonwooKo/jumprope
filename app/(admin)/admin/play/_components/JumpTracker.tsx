"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

const BASELINE_ALPHA = 0.02;
const JUMP_UP_THRESHOLD = 0.04;
const JUMP_RESET_THRESHOLD = 0.02;

type Props = {
  landmarksRef: RefObject<NormalizedLandmark[] | null>;
  onJump: () => void;
  enabled?: boolean;
};

// Canvas-internal helper: watches pose landmarks each frame and emits
// onJump() when the user's hip Y drops past the threshold (returns to
// rest before counting again). Renders nothing.
export function JumpTracker({ landmarksRef, onJump, enabled = true }: Props) {
  const baselineYRef = useRef<number | null>(null);
  const isInAirRef = useRef(false);

  useFrame(() => {
    if (!enabled) return;
    const lms = landmarksRef.current;
    if (!lms) return;

    const l23 = lms[23];
    const l24 = lms[24];
    if (!l23 || !l24) return;
    const vis = Math.min(l23.visibility ?? 0, l24.visibility ?? 0);
    if (vis < 0.5) return;

    const hipY = (l23.y + l24.y) / 2;

    if (baselineYRef.current === null) {
      baselineYRef.current = hipY;
      return;
    }

    const delta = baselineYRef.current - hipY;
    if (Math.abs(delta) < 0.015) {
      baselineYRef.current =
        baselineYRef.current * (1 - BASELINE_ALPHA) + hipY * BASELINE_ALPHA;
    }

    if (delta > JUMP_UP_THRESHOLD && !isInAirRef.current) {
      isInAirRef.current = true;
      onJump();
    } else if (delta < JUMP_RESET_THRESHOLD) {
      isInAirRef.current = false;
    }
  });

  return null;
}
