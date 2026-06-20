"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { usePoseDetection } from "@/lib/use-pose-detection";
import { PositionLoading } from "../../_components/PositionLoading";
import { DemoScene } from "./_components/DemoScene";
import { AllTestHUD } from "./_components/AllTestHUD";
import type { JumpEvent } from "@/lib/use-jump-classification";

type Phase = "calibrating" | "testing";

export default function AllMotionTestPage() {
  const router = useRouter();
  const { phase: posePhase, status: poseStatus, errorMsg, videoRef, landmarksRef } = usePoseDetection(true);

  const [phase, setPhase] = useState<Phase>("calibrating");
  const [jumpHistory, setJumpHistory] = useState<JumpEvent[]>([]);

  const handleJump = useCallback((event: JumpEvent) => {
    setJumpHistory((prev) => [...prev, event].slice(-50)); // 최근 50개 유지
  }, []);

  const handlePositionReady = useCallback(() => {
    setPhase("testing");
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
        className="absolute inset-0 w-full h-full object-cover [transform:scaleX(-1)]"
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

      {phase === "testing" && (
        <AllTestHUD
          jumpHistory={jumpHistory}
          onClose={handleClose}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
