"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import type {
  NormalizedLandmark,
  PoseLandmarker as PoseLandmarkerType,
} from "@mediapipe/tasks-vision";

export type PoseDetectionPhase = "initializing" | "detecting" | "error";
export type PoseStatus = "warn" | "ok";

const KEY_LANDMARKS = [0, 11, 12, 23, 24, 25, 26, 27, 28];
const VIS_THRESHOLD = 0.5;
const BOUNDS_MARGIN = 0.05;

function isFullBodyVisible(landmarks: NormalizedLandmark[]): boolean {
  return KEY_LANDMARKS.every((i) => {
    const lm = landmarks[i];
    if (!lm) return false;
    const vis = lm.visibility ?? 0;
    return (
      vis > VIS_THRESHOLD &&
      lm.x > BOUNDS_MARGIN && lm.x < 1 - BOUNDS_MARGIN &&
      lm.y > BOUNDS_MARGIN && lm.y < 1 - BOUNDS_MARGIN
    );
  });
}

export type UsePoseDetection = {
  phase: PoseDetectionPhase;
  status: PoseStatus;
  errorMsg: string | null;
  videoRef: RefObject<HTMLVideoElement | null>;
  landmarksRef: RefObject<NormalizedLandmark[] | null>;
};

export function usePoseDetection(enabled: boolean): UsePoseDetection {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const landmarksRef = useRef<NormalizedLandmark[] | null>(null);
  const detectorRef = useRef<PoseLandmarkerType | null>(null);
  const rafRef = useRef<number>(0);
  const [phase, setPhase] = useState<PoseDetectionPhase>("initializing");
  const [status, setStatus] = useState<PoseStatus>("warn");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let stream: MediaStream | null = null;

    async function init() {
      try {
        const { PoseLandmarker, FilesetResolver } = await import(
          "@mediapipe/tasks-vision"
        );
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/wasm",
        );
        const detector = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numPoses: 1,
        });
        if (cancelled) {
          detector.close();
          return;
        }
        detectorRef.current = detector;

        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();

        setPhase("detecting");
        loop();
      } catch (e) {
        if (cancelled) return;
        setErrorMsg(e instanceof Error ? e.message : String(e));
        setPhase("error");
      }
    }

    function loop() {
      const video = videoRef.current;
      const detector = detectorRef.current;
      if (!video || !detector) return;

      let lastTime = -1;
      let tickCount = 0;
      const tick = () => {
        if (cancelled) return;
        if (video.readyState >= 2 && video.currentTime !== lastTime) {
          lastTime = video.currentTime;
          const result = detector.detectForVideo(video, performance.now());
          if (result.landmarks.length > 0) {
            const lm = result.landmarks[0];
            landmarksRef.current = lm;
            // Throttle status updates to ~every 5 frames (~12fps at 60fps detection)
            if (tickCount++ % 5 === 0) {
              setStatus(isFullBodyVisible(lm) ? "ok" : "warn");
            }
          } else {
            landmarksRef.current = null;
            if (tickCount++ % 5 === 0) setStatus("warn");
          }
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    }

    init();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (stream) stream.getTracks().forEach((t) => t.stop());
      detectorRef.current?.close();
      detectorRef.current = null;
      landmarksRef.current = null;
    };
  }, [enabled]);

  return { phase, status, errorMsg, videoRef, landmarksRef };
}
