"use client";

import { useCallback, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { usePoseDetection } from "@/lib/use-pose-detection";
import { PositionLoading } from "../../_components/PositionLoading";
import { TargetTestScene } from "./_components/TargetTestScene";
import { TargetTestHUD } from "./_components/TargetTestHUD";
import { DebugOverlay } from "./_components/DebugOverlay";
import { getMotionDefinition } from "@/lib/mock/motion-types";
import type { TargetJumpEvent } from "@/lib/use-jump-classification-target";
import type { JumpType } from "@/lib/use-jump-classification";

type Phase = "calibrating" | "testing";

export type TestResult = TargetJumpEvent;

export default function MotionTestPage() {
  const router = useRouter();
  const params = useParams();
  const targetMotion = params.motionType as JumpType;
  const motionDef = getMotionDefinition(targetMotion);

  const { phase: posePhase, status: poseStatus, errorMsg, videoRef, landmarksRef } = usePoseDetection(true);

  const [phase, setPhase] = useState<Phase>("calibrating");
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const handleJump = useCallback((event: TargetJumpEvent) => {
    // 이제 이벤트 자체에 isMatch와 reason이 포함되어 있음
    setTestResults((prev) => [...prev, event].slice(-20));
  }, []);

  const handlePositionReady = useCallback(() => {
    setPhase("testing");
  }, []);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const handleReset = useCallback(() => {
    setTestResults([]);
  }, []);

  if (!motionDef) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="text-4xl mb-2">❌</div>
          <div className="font-bold">알 수 없는 동작 타입</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-dvh bg-black overflow-hidden">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover transform-[scaleX(-1)]"
        playsInline
        muted
      />

      {phase !== "calibrating" && (
        <TargetTestScene
          landmarksRef={landmarksRef}
          targetMotion={targetMotion}
          onJump={handleJump}
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

      {phase === "testing" && (
        <>
          <TargetTestHUD
            motionDef={motionDef}
            testResults={testResults}
            onClose={handleClose}
            onReset={handleReset}
          />
          <DebugOverlay landmarksRef={landmarksRef} />
        </>
      )}
    </div>
  );
}

function getMotionLabel(type: JumpType): string {
  const labels: Record<JumpType, string> = {
    basic: "모아뛰기",
    cross: "X자",
    "rock-paper": "보바위",
    zigzag: "지그재그",
    "side-swing": "옆흔들기",
  };
  return labels[type] || type;
}
