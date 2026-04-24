"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { Icon } from "@/components/Icon";
import type { PoseDetectionPhase, PoseStatus } from "@/lib/use-pose-detection";

type Props = {
  open: boolean;
  phase: PoseDetectionPhase;
  status: PoseStatus;
  errorMsg: string | null;
  ready: boolean;
  videoRef: RefObject<HTMLVideoElement | null>;
  landmarksRef: RefObject<NormalizedLandmark[] | null>;
  onDismiss: () => void;
  onClose?: () => void;
};

const HOLD_MS = 3000;

const POSE_CONNECTIONS: [number, number][] = [
  [11, 12],
  [11, 13],
  [13, 15],
  [15, 17],
  [15, 19],
  [15, 21],
  [17, 19],
  [12, 14],
  [14, 16],
  [16, 18],
  [16, 20],
  [16, 22],
  [18, 20],
  [11, 23],
  [12, 24],
  [23, 24],
  [23, 25],
  [25, 27],
  [27, 29],
  [27, 31],
  [29, 31],
  [24, 26],
  [26, 28],
  [28, 30],
  [28, 32],
  [30, 32],
];

function drawSkeleton(ctx: CanvasRenderingContext2D, landmarks: NormalizedLandmark[], w: number, h: number, ok: boolean) {
  const color = ok ? "#2bd67b" : "#3fc8f1";
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
    ctx.arc(lm.x * w, lm.y * h, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function PositionLoading({ open, phase, status, errorMsg, ready, videoRef, landmarksRef, onDismiss, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const [remainingMs, setRemainingMs] = useState<number>(HOLD_MS);

  // Hold-to-confirm
  useEffect(() => {
    if (!open) return;
    const shouldCount = phase === "detecting" && status === "ok" && ready;
    if (!shouldCount) return;
    const start = Date.now();
    const interval = setInterval(() => {
      const rem = Math.max(0, HOLD_MS - (Date.now() - start));
      setRemainingMs(rem);
      if (rem <= 0) {
        clearInterval(interval);
        onDismiss();
      }
    }, 100);
    return () => clearInterval(interval);
  }, [open, phase, status, ready, onDismiss]);

  // Skeleton drawing loop — reads from shared landmarksRef/videoRef
  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const landmarks = landmarksRef.current;
      if (canvas && video && video.videoWidth > 0) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          if (landmarks) {
            drawSkeleton(ctx, landmarks, canvas.width, canvas.height, status === "ok");
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
  }, [open, status, videoRef, landmarksRef]);

  if (!open) return null;

  const ok = status === "ok";
  const accentHex = phase === "detecting" ? (ok ? "#2bd67b" : "#3fc8f1") : "#3fc8f1";
  const isHolding = phase === "detecting" && ok && ready;
  const remainingSec = Math.max(1, Math.ceil(remainingMs / 1000));
  const progress = isHolding ? ((HOLD_MS - remainingMs) / HOLD_MS) * 100 : 0;

  const statusLabel = phase === "error" ? "카메라 오류" : phase === "initializing" ? "카메라 준비 중" : ok ? "감지 완료 · 포즈 추적 중" : "전신이 보이도록 서주세요";

  const statusSub =
    phase === "error"
      ? (errorMsg ?? "카메라 권한을 허용해주세요")
      : phase === "initializing"
        ? "모델 로딩 중…"
        : ok
          ? ready
            ? `${remainingSec}초 뒤 시작해요 · 자세 유지`
            : "게임 불러오는 중…"
          : "머리부터 발끝까지 모두 보여야 해요";

  const bubbleText = phase === "error" ? "카메라 접근이 필요해요" : phase === "initializing" ? "잠시만 기다려주세요" : ok ? "완벽해! 이제 시작하자" : "조금 뒤로 물러서!";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Skeleton canvas — drawn over the shared video element (rendered by parent) */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover pointer-events-none [transform:scaleX(-1)]" />
      <div className="absolute inset-0 bg-black/30 pointer-events-none" />

      {phase === "initializing" && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[3] grid place-items-center">
          <div className="w-12 h-12 rounded-full border-[3px] border-white/20 border-t-k-blue-hi animate-spin" />
        </div>
      )}

      {phase === "error" && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[3] grid place-items-center text-center px-8">
          <Icon name="camera" className="w-12 h-12 text-white/70 mx-auto mb-3" />
          <p className="text-white font-bold text-sm">카메라 접근이 거부되었어요</p>
          <p className="text-white/70 text-xs mt-1">브라우저 설정에서 허용해주세요</p>
        </div>
      )}

      {/* Top bar */}
      <div className="absolute top-[50px] left-3.5 right-3.5 flex justify-between items-center z-10">
        <button type="button" onClick={onClose} className="w-[34px] h-[34px] rounded-full grid place-items-center bg-black/40 border-[1.5px] border-white/30 text-white" aria-label="닫기">
          <Icon name="close" className="w-4 h-4" />
        </button>
        <div
          className={
            "flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[11px] font-bold text-white border-[1.5px] backdrop-blur-sm " + (ok ? "bg-[rgba(43,214,123,0.3)] border-[rgba(43,214,123,0.5)]" : "bg-white/10 border-white/20")
          }
        >
          <Icon name={ok ? "check" : "camera"} className="w-4 h-4" />
          {ok ? "감지 완료" : phase === "detecting" ? "거리 감지 중" : "준비 중"}
        </div>
      </div>

      {/* Focus box */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[78%] aspect-[4/6] rounded-[22px] border-[2.5px] border-dashed z-[2] animate-pulse" style={{ borderColor: accentHex }}>
        {(["tl", "tr", "bl", "br"] as const).map((p) => (
          <span
            key={p}
            className={
              "absolute w-[22px] h-[22px] border-[3px] " +
              (p === "tl"
                ? "-top-[3px] -left-[3px] border-r-0 border-b-0 rounded-tl-[22px]"
                : p === "tr"
                  ? "-top-[3px] -right-[3px] border-l-0 border-b-0 rounded-tr-[22px]"
                  : p === "bl"
                    ? "-bottom-[3px] -left-[3px] border-r-0 border-t-0 rounded-bl-[22px]"
                    : "-bottom-[3px] -right-[3px] border-l-0 border-t-0 rounded-br-[22px]")
            }
            style={{ borderColor: accentHex }}
          />
        ))}
      </div>

      {/* Bubble */}
      <div className="absolute bottom-[148px] left-1/2 -translate-x-1/2 z-10">
        <div
          className={
            "relative bg-white border-2 rounded-[14px] px-3.5 py-2.5 font-bold text-xs whitespace-nowrap " +
            (ok ? "border-[#00864a] text-[#0a6339] shadow-[0_4px_0_rgba(0,134,74,0.2)]" : "border-[#b07600] text-[#704b00] shadow-[0_4px_0_rgba(176,118,0,0.2)]")
          }
        >
          {bubbleText}
          <span className={"absolute -bottom-[8px] left-6 w-3 h-3 bg-white rotate-45 border-r-2 border-b-2 " + (ok ? "border-[#00864a]" : "border-[#b07600]")} />
        </div>
      </div>

      {/* Bottom status */}
      <div className="absolute bottom-0 left-0 right-0 px-[18px] pt-4 pb-[26px] z-10 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.75))]">
        <div className="relative bg-black/60 backdrop-blur-md border-[1.5px] border-white/15 rounded-[14px] px-3.5 py-2.5 flex items-center gap-2.5 mb-2.5 overflow-hidden">
          {isHolding && <div className="absolute top-0 left-0 h-[3px] bg-[#2bd67b] transition-[width] duration-100 ease-linear" style={{ width: `${progress}%` }} />}
          <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: accentHex, boxShadow: `0 0 10px ${accentHex}` }} />
          <div>
            <div className="text-[12px] font-extrabold text-white">{statusLabel}</div>
            <div className="text-[10px] opacity-80 text-white mt-0.5">{statusSub}</div>
          </div>
        </div>
        <button
          type="button"
          disabled
          className="w-full py-4 rounded-xl text-white font-extrabold text-sm opacity-50 cursor-default border-[1.5px] border-k-blue-outline bg-[linear-gradient(180deg,var(--color-k-blue-hi)_0%,var(--color-k-blue)_55%,var(--color-k-blue-mid)_82%)] shadow-[inset_0_1.5px_0_rgba(255,255,255,.55),inset_0_-5px_0_var(--color-k-blue-depth),inset_0_-6.5px_0_rgba(10,65,90,.45)]"
        >
          {isHolding ? `${remainingSec}초 뒤 시작…` : "자세를 잡으면 자동 시작돼요"}
        </button>
      </div>
    </div>
  );
}
