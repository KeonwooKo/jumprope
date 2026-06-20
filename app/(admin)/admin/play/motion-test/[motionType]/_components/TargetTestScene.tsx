"use client";

import { useEffect, useRef, Suspense, type RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { TargetJumpClassifier, type TargetJumpEvent } from "@/lib/use-jump-classification-target";
import type { JumpType } from "@/lib/use-jump-classification";

type Props = {
  landmarksRef: RefObject<NormalizedLandmark[] | null>;
  targetMotion: JumpType;
  onJump: (event: TargetJumpEvent) => void;
};

const POSE_CONNECTIONS: [number, number][] = [
  [11, 12], [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19],
  [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20],
  [11, 23], [12, 24], [23, 24],
  [23, 25], [25, 27], [27, 29], [27, 31], [29, 31],
  [24, 26], [26, 28], [28, 30], [28, 32], [30, 32],
];

function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  w: number,
  h: number
) {
  const color = "#2bd67b";
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;

  for (const [a, b] of POSE_CONNECTIONS) {
    const la = landmarks[a];
    const lb = landmarks[b];
    if (!la || !lb) continue;
    if ((la.visibility ?? 0) < 0.3 || (lb.visibility ?? 0) < 0.3) continue;
    ctx.beginPath();
    ctx.moveTo(la.x * w, la.y * h);
    ctx.lineTo(lb.x * w, lb.y * h);
    ctx.stroke();
  }

  for (const lm of landmarks) {
    if ((lm.visibility ?? 0) < 0.3) continue;
    ctx.beginPath();
    ctx.arc(lm.x * w, lm.y * h, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function TargetTestScene({ landmarksRef, targetMotion, onJump }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;

    const tick = () => {
      if (cancelled) return;

      const video = document.querySelector("video");
      if (video && canvas) {
        canvas.width = video.videoWidth || canvas.clientWidth;
        canvas.height = video.videoHeight || canvas.clientHeight;

        const ctx = canvas.getContext("2d");
        const landmarks = landmarksRef.current;

        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          if (landmarks) {
            drawSkeleton(ctx, landmarks, canvas.width, canvas.height);
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [landmarksRef]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none transform-[scaleX(-1)]"
      />

      <Canvas
        className="absolute inset-0 h-dvh pointer-events-none"
        camera={{ position: [0, 1, 3.6], fov: 42 }}
        gl={{ alpha: true }}
        style={{ opacity: 0 }}
      >
        <Suspense fallback={null}>
          <TargetJumpClassifier
            landmarksRef={landmarksRef}
            targetMotion={targetMotion}
            onJump={onJump}
            enabled={true}
          />
        </Suspense>
      </Canvas>
    </>
  );
}
