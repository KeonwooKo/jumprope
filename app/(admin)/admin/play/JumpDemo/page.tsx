"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { usePoseDetection } from "@/lib/use-pose-detection";
import { PositionLoading } from "../_components/PositionLoading";
import { DemoScene } from "./_components/DemoScene";
import { DemoHUD } from "./_components/DemoHUD";
import type { JumpEvent } from "@/lib/use-jump-classification";
import { cn } from "@/lib/utils";

type Phase = "calibrating" | "demo";

export default function JumpDemoPage() {
  const router = useRouter();
  const { phase: posePhase, status: poseStatus, errorMsg, videoRef, landmarksRef } = usePoseDetection(true);

  const [phase, setPhase] = useState<Phase>("calibrating");
  const [jumpHistory, setJumpHistory] = useState<JumpEvent[]>([]);

  const handleJump = useCallback((event: JumpEvent) => {
    setJumpHistory((prev) => [...prev, event].slice(-20)); // 최근 20개만 유지
  }, []);

  const handlePositionReady = useCallback(() => {
    setPhase("demo");
  }, []);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const handleReset = useCallback(() => {
    setJumpHistory([]);
  }, []);

  return (
    <div className="relative h-dvh bg-black overflow-hidden">
      <video
        ref={videoRef}
        className={cn(
          "absolute inset-0 w-full h-full object-cover transform-[scaleX(-1)]",
          phase === "calibrating" ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        playsInline
        muted
      />

      {phase !== "calibrating" && (
        <DemoScene landmarksRef={landmarksRef} onJump={handleJump} />
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

      {phase === "demo" && (
        <DemoHUD
          jumpHistory={jumpHistory}
          onClose={handleClose}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
