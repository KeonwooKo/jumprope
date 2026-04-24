"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePoseDetection } from "@/lib/use-pose-detection";
import { PositionLoading } from "../_components/PositionLoading";
import { RaceScene, GOAL_DISTANCE, MAX_SPEED_EXPORTED } from "./_components/RaceScene";
import { RaceHUD } from "./_components/RaceHUD";
import { ResultDialog } from "./_components/ResultDialog";

type Phase = "calibrating" | "playing" | "ended";

export default function RacingJumpPage() {
  const router = useRouter();
  const {
    phase: posePhase,
    status: poseStatus,
    errorMsg,
    videoRef,
    landmarksRef,
  } = usePoseDetection(true);

  const [phase, setPhase] = useState<Phase>("calibrating");
  const [elapsedMs, setElapsedMs] = useState(0);

  const startedAtRef = useRef<number | null>(null);
  const jumpTimestampsRef = useRef<number[]>([]);
  const carZRef = useRef<number>(0);
  const distanceRef = useRef<number>(0);
  const speedRef = useRef<number>(0);

  const handleJump = useCallback(() => {
    jumpTimestampsRef.current.push(Date.now());
  }, []);

  const handlePositionReady = useCallback(() => {
    startedAtRef.current = Date.now();
    setElapsedMs(0);
    setPhase("playing");
  }, []);

  const handleFinish = useCallback(() => {
    const start = startedAtRef.current;
    if (start !== null) {
      setElapsedMs(Date.now() - start);
    }
    setPhase("ended");
  }, []);

  const handleRetry = useCallback(() => {
    jumpTimestampsRef.current = [];
    carZRef.current = 0;
    distanceRef.current = 0;
    speedRef.current = 0;
    startedAtRef.current = null;
    setElapsedMs(0);
    setPhase("calibrating");
  }, []);

  const handleExit = useCallback(() => {
    router.push("/admin/play");
  }, [router]);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  // Live elapsed time tick during playing
  useEffect(() => {
    if (phase !== "playing") return;
    const interval = setInterval(() => {
      const start = startedAtRef.current;
      if (start !== null) {
        setElapsedMs(Date.now() - start);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [phase]);

  return (
    <div className="relative h-dvh bg-black overflow-hidden">
      <video
        ref={videoRef}
        className={
          "absolute inset-0 w-full h-full object-cover [transform:scaleX(-1)] " +
          (phase === "calibrating" ? "opacity-100" : "opacity-0 pointer-events-none")
        }
        playsInline
        muted
      />

      {phase !== "calibrating" && (
        <RaceScene
          landmarksRef={landmarksRef}
          onJump={handleJump}
          jumpTimestampsRef={jumpTimestampsRef}
          carZRef={carZRef}
          distanceRef={distanceRef}
          speedRef={speedRef}
          onFinish={handleFinish}
          frozen={phase === "ended"}
        />
      )}

      <PositionLoading
        open={phase === "calibrating"}
        phase={posePhase}
        status={poseStatus}
        errorMsg={errorMsg}
        ready={true}
        videoRef={videoRef}
        landmarksRef={landmarksRef}
        onDismiss={handlePositionReady}
        onClose={handleClose}
      />

      {(phase === "playing" || phase === "ended") && (
        <RaceHUD
          speedRef={speedRef}
          distanceRef={distanceRef}
          elapsedMs={elapsedMs}
          goalDistance={GOAL_DISTANCE}
          maxSpeed={MAX_SPEED_EXPORTED}
        />
      )}

      {phase === "ended" && (
        <ResultDialog
          elapsedMs={elapsedMs}
          goalDistance={GOAL_DISTANCE}
          onExit={handleExit}
          onRetry={handleRetry}
        />
      )}
    </div>
  );
}
