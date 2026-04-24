"use client";

import { useEffect, useState, type RefObject } from "react";
import { Icon } from "@/components/Icon";

type Props = {
  speedRef: RefObject<number>;
  distanceRef: RefObject<number>;
  elapsedMs: number;
  goalDistance: number;
  maxSpeed: number;
};

function formatTime(ms: number) {
  const sec = ms / 1000;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const t = Math.floor((ms % 1000) / 100);
  return `${m}:${String(s).padStart(2, "0")}.${t}`;
}

export function RaceHUD({
  speedRef,
  distanceRef,
  elapsedMs,
  goalDistance,
  maxSpeed,
}: Props) {
  const [speed, setSpeed] = useState(0);
  const [distance, setDistance] = useState(0);

  // Poll refs at 10Hz for UI display (separate from 60fps scene loop)
  useEffect(() => {
    const interval = setInterval(() => {
      setSpeed(speedRef.current);
      setDistance(distanceRef.current);
    }, 100);
    return () => clearInterval(interval);
  }, [speedRef, distanceRef]);

  const speedKmh = Math.round(speed * 3.6);
  const distPct = Math.min(100, (distance / goalDistance) * 100);
  const speedPct = Math.min(100, (speed / maxSpeed) * 100);

  return (
    <>
      {/* Timer */}
      <div className="absolute top-[50px] left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-4 py-2 rounded-full text-white bg-black/50 backdrop-blur-md border-[1.5px] border-white/20">
        <Icon name="calendar" className="w-4 h-4" />
        <span className="font-num text-lg font-extrabold tabular-nums">
          {formatTime(elapsedMs)}
        </span>
      </div>

      {/* Distance bar */}
      <div className="absolute top-[100px] left-1/2 -translate-x-1/2 z-10 w-[70%]">
        <div className="flex justify-between text-[10px] text-white mb-1 font-bold tabular-nums">
          <span>{Math.round(distance)}m</span>
          <span>{goalDistance}m</span>
        </div>
        <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
          <div
            className="h-full bg-k-blue-hi transition-[width] duration-100 ease-linear"
            style={{ width: `${distPct}%` }}
          />
        </div>
      </div>

      {/* Speed gauge */}
      <div className="absolute top-1/2 right-3 -translate-y-1/2 z-10 flex flex-col items-center gap-2 px-3 py-3 rounded-2xl bg-black/55 backdrop-blur-md border-[1.5px] border-white/15 text-white">
        <span className="text-[9px] font-bold uppercase tracking-wider opacity-80">
          SPEED
        </span>
        <div className="relative w-3 h-24 rounded-full bg-white/15 overflow-hidden">
          <div
            className="absolute bottom-0 left-0 w-full bg-[linear-gradient(0deg,#22c55e,#f59e0b_60%,#ef4444)] transition-[height] duration-100 ease-linear"
            style={{ height: `${speedPct}%` }}
          />
        </div>
        <span className="font-num text-xl font-extrabold leading-none tabular-nums">
          {speedKmh}
        </span>
        <span className="text-[9px] opacity-70">km/h</span>
      </div>
    </>
  );
}
