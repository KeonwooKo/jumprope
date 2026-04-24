"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePoseDetection } from "@/lib/use-pose-detection";
import { PositionLoading } from "../_components/PositionLoading";
import { GameScene } from "./_components/GameScene";
import { JumpHUD } from "./_components/JumpHUD";
import { ResultDialog } from "./_components/ResultDialog";

const GAME_DURATION = 60;

type Phase = "calibrating" | "playing" | "ended";

export default function BasicJumpPage() {
  const router = useRouter();
  const { phase: posePhase, status: poseStatus, errorMsg, videoRef, landmarksRef } = usePoseDetection(true);

  const [phase, setPhase] = useState<Phase>("calibrating");
  const [jumpCount, setJumpCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);

  const handleJump = useCallback(() => {
    setJumpCount((c) => c + 1);
  }, []);

  const handlePositionReady = useCallback(() => {
    setPhase("playing");
  }, []);

  const handleRetry = useCallback(() => {
    setJumpCount(0);
    setTimeLeft(GAME_DURATION);
    setPhase("calibrating");
  }, []);

  const handleExit = useCallback(() => {
    router.push("/admin/play");
  }, [router]);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  // 60s countdown during "playing"
  useEffect(() => {
    if (phase !== "playing") return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setPhase("ended");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  return (
    <div className="relative h-dvh bg-black overflow-hidden">
      <video ref={videoRef} className={"absolute inset-0 w-full h-full object-cover [transform:scaleX(-1)] " + (phase === "calibrating" ? "opacity-100" : "opacity-0 pointer-events-none")} playsInline muted />

      {phase !== "calibrating" && <GameScene landmarksRef={landmarksRef} onJump={handleJump} frozen={phase === "ended"} />}

      <PositionLoading open={phase === "calibrating"} phase={posePhase} status={poseStatus} errorMsg={errorMsg} ready={true} videoRef={videoRef} landmarksRef={landmarksRef} onDismiss={handlePositionReady} onClose={handleClose} />

      {(phase === "playing" || phase === "ended") && <JumpHUD count={jumpCount} timeLeft={timeLeft} totalTime={GAME_DURATION} />}

      {phase === "ended" && <ResultDialog count={jumpCount} totalTime={GAME_DURATION} onExit={handleExit} onRetry={handleRetry} />}
    </div>
  );
}
