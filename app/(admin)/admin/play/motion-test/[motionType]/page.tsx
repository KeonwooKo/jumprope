"use client";

import { useCallback, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { usePoseDetection } from "@/lib/use-pose-detection";
import { PositionLoading } from "../../_components/PositionLoading";
import { TargetTestScene } from "./_components/TargetTestScene";
import { TargetTestHUD } from "./_components/TargetTestHUD";
import { DebugOverlay } from "./_components/DebugOverlay";
import { getMotionDefinition } from "@/lib/mock/motion-types";
import type { JumpEvent, JumpType } from "@/lib/use-jump-classification";

type Phase = "calibrating" | "testing";

export type TestResult = {
  jump: JumpEvent;
  isMatch: boolean;
  reason: string;
};

export default function MotionTestPage() {
  const router = useRouter();
  const params = useParams();
  const targetMotion = params.motionType as JumpType;
  const motionDef = getMotionDefinition(targetMotion);

  const { phase: posePhase, status: poseStatus, errorMsg, videoRef, landmarksRef } = usePoseDetection(true);

  const [phase, setPhase] = useState<Phase>("calibrating");
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const handleJump = useCallback((event: JumpEvent) => {
    const isMatch = event.type === targetMotion;

    // 판정 이유 생성
    let reason = "";
    if (isMatch) {
      reason = `✅ 정확히 인식됨 (신뢰도 ${Math.round(event.confidence * 100)}%)`;
      if (event.isArmCrossed) reason += " / 팔 교차 OK";
      if (event.isCrossed) reason += " / 발 교차 OK";
      if (event.isWide) reason += " / 발 벌림 OK";
    } else {
      reason = `❌ ${getMotionLabel(event.type)}로 인식됨`;
      if (targetMotion === "cross") {
        if (!event.isArmCrossed) reason += " / 팔 교차 부족";
        else reason += " / 다른 동작과 혼동";
      } else if (targetMotion === "rock-paper") {
        if (event.isCrossed) reason += " / 발이 교차됨";
        else if (!event.isWide) reason += " / 발을 더 벌리세요";
      } else if (targetMotion === "zigzag") {
        if (!event.isWide && !event.isCrossed) reason += " / 발 동작 불분명";
      } else if (targetMotion === "side-swing") {
        if (event.sideDirection === "center") reason += " / 좌우 이동 부족";
      }
    }

    const result: TestResult = {
      jump: event,
      isMatch,
      reason,
    };

    setTestResults((prev) => [...prev, result].slice(-20));
  }, [targetMotion]);

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
