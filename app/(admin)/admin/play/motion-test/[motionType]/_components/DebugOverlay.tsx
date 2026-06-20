"use client";

import { useEffect, useState, type RefObject } from "react";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

type Props = {
  landmarksRef: RefObject<NormalizedLandmark[] | null>;
};

export function DebugOverlay({ landmarksRef }: Props) {
  const [hipY, setHipY] = useState<number | null>(null);
  const [baselineY, setBaselineY] = useState<number | null>(null);
  const [delta, setDelta] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    let baseline: number | null = null;
    const BASELINE_ALPHA = 0.02;

    const interval = setInterval(() => {
      const lms = landmarksRef.current;
      if (!lms) return;

      const leftHip = lms[23];
      const rightHip = lms[24];

      if (!leftHip || !rightHip) {
        setIsVisible(false);
        return;
      }

      const vis = Math.min(leftHip.visibility ?? 0, rightHip.visibility ?? 0);
      setIsVisible(vis > 0.5);

      const currentHipY = (leftHip.y + rightHip.y) / 2;
      setHipY(currentHipY);

      if (baseline === null) {
        baseline = currentHipY;
      } else {
        const d = baseline - currentHipY;
        if (Math.abs(d) < 0.015) {
          baseline = baseline * (1 - BASELINE_ALPHA) + currentHipY * BASELINE_ALPHA;
        }
        setDelta(d);
      }

      setBaselineY(baseline);
    }, 100);

    return () => clearInterval(interval);
  }, [landmarksRef]);

  return (
    <div className="absolute top-32 left-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono space-y-1 backdrop-blur-sm">
      <div className="font-bold text-yellow-400 mb-2">🔧 Debug Info</div>
      <div className={isVisible ? "text-green-400" : "text-red-400"}>
        Visible: {isVisible ? "YES" : "NO"}
      </div>
      <div>Hip Y: {hipY?.toFixed(3) ?? "N/A"}</div>
      <div>Baseline: {baselineY?.toFixed(3) ?? "N/A"}</div>
      <div className={delta > 0.04 ? "text-green-400 font-bold" : ""}>
        Delta: {delta.toFixed(3)} {delta > 0.04 && "✅ JUMP!"}
      </div>
      <div className="text-white/60 mt-2 pt-2 border-t border-white/20">
        Need: &gt;0.040 to jump
      </div>
      <div className="text-white/60">
        Current: {delta > 0.04 ? "🟢" : "🔴"} {(delta / 0.04 * 100).toFixed(0)}%
      </div>
    </div>
  );
}
