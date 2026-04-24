"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePoseDetection } from "@/lib/use-pose-detection";
import { PositionLoading } from "../_components/PositionLoading";

export default function RacingJumpPage() {
  const router = useRouter();
  const {
    phase: posePhase,
    status: poseStatus,
    errorMsg,
    videoRef,
    landmarksRef,
  } = usePoseDetection(true);

  const [open, setOpen] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 3000);
    return () => clearTimeout(t);
  }, []);

  const handleDismiss = useCallback(() => setOpen(false), []);
  const handleClose = useCallback(() => router.back(), [router]);

  return (
    <div className="relative min-h-dvh bg-black text-white overflow-hidden">
      <video
        ref={videoRef}
        className={
          "absolute inset-0 w-full h-full object-cover [transform:scaleX(-1)] " +
          (open ? "opacity-100" : "opacity-0 pointer-events-none")
        }
        playsInline
        muted
      />
      <main className="absolute inset-0 grid place-items-center text-lg font-extrabold">
        RacingJump
      </main>
      <PositionLoading
        open={open}
        phase={posePhase}
        status={poseStatus}
        errorMsg={errorMsg}
        ready={ready}
        videoRef={videoRef}
        landmarksRef={landmarksRef}
        onDismiss={handleDismiss}
        onClose={handleClose}
      />
    </div>
  );
}
