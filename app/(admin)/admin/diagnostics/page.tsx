"use client";

import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import { usePoseDetection } from "@/lib/use-pose-detection";
import { MHeader } from "@/components/MHeader";
import {
  extractPoseMetrics,
  detectJumpEvents,
  calculatePerformanceScore,
  calculateTempoConsistency,
  calculateHeightConsistency,
  type PoseMetrics,
  type JumpEvent,
} from "@/lib/pose-analytics";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

export default function DiagnosticsPage() {
  const { phase: posePhase, status: poseStatus, errorMsg, videoRef, landmarksRef } = usePoseDetection(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const metricsHistoryRef = useRef<PoseMetrics[]>([]);
  const jumpEventsRef = useRef<JumpEvent[]>([]);
  const baselineHipYRef = useRef<number | null>(null);
  const calibrationCountRef = useRef(0);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [jumpCount, setJumpCount] = useState(0);
  const [metrics, setMetrics] = useState<PoseMetrics | null>(null);
  const [performanceScore, setPerformanceScore] = useState<ReturnType<typeof calculatePerformanceScore> | null>(null);
  const [tempoStats, setTempoStats] = useState<ReturnType<typeof calculateTempoConsistency> | null>(null);
  const [heightStats, setHeightStats] = useState<ReturnType<typeof calculateHeightConsistency> | null>(null);
  const [calibrationStatus, setCalibrationStatus] = useState<"waiting" | "calibrating" | "ready">("waiting");

  // 녹화 타이머
  useEffect(() => {
    if (!isRecording) return;
    const interval = setInterval(() => {
      setRecordingTime((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRecording]);

  // 캔버스 렌더링 + 메트릭 수집
  useEffect(() => {
    function drawFrame() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const lms = landmarksRef.current;

      if (!video || !canvas) {
        animationFrameRef.current = requestAnimationFrame(drawFrame);
        return;
      }

      // 캔버스 설정
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        animationFrameRef.current = requestAnimationFrame(drawFrame);
        return;
      }

      // 배경 지우기
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 비디오 그리기 (좌우 반전)
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0);
      ctx.restore();

      // 랜드마크가 있을 때만 메트릭 추출
      if (lms && lms.length > 0) {
        const m = extractPoseMetrics(lms);
        if (m) {
          setMetrics(m);

          // 캘리브레이션 모드 (처음 1초)
          if (!isRecording && calibrationStatus !== "ready") {
            setCalibrationStatus("calibrating");
            return;
          }

          // 녹화 모드
          if (isRecording) {
            // 기준선 설정 (처음 30프레임 평균)
            if (baselineHipYRef.current === null) {
              calibrationCountRef.current++;
              metricsHistoryRef.current.push(m);

              if (calibrationCountRef.current >= 30) {
                const avgHipY = metricsHistoryRef.current.reduce((sum, mm) => sum + mm.hipY, 0) / metricsHistoryRef.current.length;
                baselineHipYRef.current = avgHipY;
                metricsHistoryRef.current = []; // 리셋
              }
              drawLandmarks(ctx, lms, canvas.width, canvas.height);
              animationFrameRef.current = requestAnimationFrame(drawFrame);
              return;
            }

            // 메트릭 수집
            metricsHistoryRef.current.push(m);
            if (metricsHistoryRef.current.length > 600) {
              metricsHistoryRef.current.shift();
            }

            // 점프 감지
            if (baselineHipYRef.current !== null) {
              const events = detectJumpEvents(metricsHistoryRef.current, baselineHipYRef.current);
              jumpEventsRef.current = events;
              setJumpCount(events.length);

              // 성과 점수 계산
              const score = calculatePerformanceScore(events);
              setPerformanceScore(score);

              const tempo = calculateTempoConsistency(events);
              setTempoStats(tempo);

              const height = calculateHeightConsistency(events);
              setHeightStats(height);
            }
          }

          // 랜드마크 그리기
          drawLandmarks(ctx, lms, canvas.width, canvas.height);
        }
      }

      animationFrameRef.current = requestAnimationFrame(drawFrame);
    }

    animationFrameRef.current = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [videoRef, landmarksRef, isRecording, calibrationStatus]);

  const handleStartRecording = useCallback(() => {
    setIsRecording(true);
    setRecordingTime(0);
    setJumpCount(0);
    setMetrics(null);
    setPerformanceScore(null);
    setTempoStats(null);
    setHeightStats(null);
    metricsHistoryRef.current = [];
    jumpEventsRef.current = [];
    baselineHipYRef.current = null;
    calibrationCountRef.current = 0;
  }, []);

  const handleStopRecording = useCallback(() => {
    setIsRecording(false);
  }, []);

  const handleExport = useCallback(() => {
    const data = {
      recordingTime,
      jumpCount: jumpEventsRef.current.length,
      jumpEvents: jumpEventsRef.current,
      tempoStats,
      heightStats,
      performanceScore,
      metricsCount: metricsHistoryRef.current.length,
      exportTime: new Date().toISOString(),
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jump-diagnostics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [recordingTime, tempoStats, heightStats, performanceScore]);

  return (
    <div className="min-h-dvh flex flex-col bg-black text-white">
      <MHeader title="포즈 진단" backHref="/admin" />

      <div className="flex-1 flex flex-col gap-4 p-4 overflow-auto">
        {/* 카메라 피드 */}
        <div className="relative w-full aspect-video bg-neutral-900 rounded-lg overflow-hidden border-2 border-neutral-700">
          <video ref={videoRef} className="hidden" playsInline muted />
          <canvas ref={canvasRef} className="w-full h-full block" />

          {/* 로딩 상태 */}
          {posePhase === "initializing" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm font-bold">카메라 초기화</p>
              </div>
            </div>
          )}

          {/* 에러 상태 */}
          {posePhase === "error" && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-900/60 backdrop-blur-sm">
              <div className="text-center">
                <p className="text-sm font-bold text-red-100">{errorMsg || "오류 발생"}</p>
              </div>
            </div>
          )}
        </div>

        {/* 상태 표시 */}
        <div className="flex gap-2">
          {posePhase === "initializing" && (
            <div className="flex-1 bg-yellow-600 px-4 py-3 rounded-lg text-sm font-bold flex items-center gap-2">
              <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              포즈 감지 초기화 중...
            </div>
          )}
          {posePhase === "detecting" && poseStatus === "ok" && (
            <div className="flex-1 bg-green-600 px-4 py-3 rounded-lg text-sm font-bold flex items-center gap-2">
              <span className="w-3 h-3 bg-white rounded-full animate-pulse" />
              신체 감지됨
            </div>
          )}
          {posePhase === "detecting" && poseStatus === "warn" && (
            <div className="flex-1 bg-orange-600 px-4 py-3 rounded-lg text-sm font-bold flex items-center gap-2">
              <span className="w-3 h-3 bg-white rounded-full animate-pulse" />
              신체 재조정 필요
            </div>
          )}
          {posePhase === "error" && (
            <div className="flex-1 bg-red-600 px-4 py-3 rounded-lg text-sm font-bold">
              오류: {errorMsg}
            </div>
          )}
        </div>

        {/* 제어 패널 */}
        <div className="flex gap-2">
          <button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            disabled={posePhase !== "detecting"}
            className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${
              isRecording
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            }`}
          >
            {isRecording ? `🔴 녹화 중 ${recordingTime}s` : "🟢 녹화 시작"}
          </button>
          <button
            onClick={handleExport}
            disabled={!performanceScore || performanceScore.overallScore === 0}
            className="flex-1 py-3 rounded-lg font-bold text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            📥 데이터 내보내기
          </button>
        </div>

        {/* 실시간 메트릭 */}
        {metrics && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-neutral-900 p-2 rounded border border-neutral-700">
              <div className="text-neutral-400">Hip Y</div>
              <div className="text-lg font-mono">{metrics.hipY.toFixed(3)}</div>
            </div>
            <div className="bg-neutral-900 p-2 rounded border border-neutral-700">
              <div className="text-neutral-400">Body Tilt</div>
              <div className="text-lg font-mono">{metrics.bodyTilt.toFixed(3)}</div>
            </div>
            <div className="bg-neutral-900 p-2 rounded border border-neutral-700">
              <div className="text-neutral-400">Symmetry</div>
              <div className="text-lg font-mono">{(metrics.symmetry * 100).toFixed(1)}%</div>
            </div>
            <div className="bg-neutral-900 p-2 rounded border border-neutral-700">
              <div className="text-neutral-400">Arm Rotation</div>
              <div className="text-lg font-mono">{metrics.armRotationSpeed.toFixed(2)}</div>
            </div>
          </div>
        )}

        {/* 성과 점수 */}
        {performanceScore && performanceScore.overallScore > 0 && (
          <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">전체 점수</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">{(performanceScore.overallScore * 100).toFixed(1)}</span>
                <span className="text-xs text-neutral-400">/100</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-neutral-400 mb-1">감지율</div>
                <div className="flex items-end gap-1">
                  <div className="w-12 h-6 bg-neutral-800 rounded">
                    <div
                      className="h-full bg-blue-500 rounded"
                      style={{ width: `${performanceScore.detectionRate * 100}%` }}
                    />
                  </div>
                  <span className="font-mono">{(performanceScore.detectionRate * 100).toFixed(0)}%</span>
                </div>
              </div>

              <div>
                <div className="text-neutral-400 mb-1">타이밍 정확도</div>
                <div className="flex items-end gap-1">
                  <div className="w-12 h-6 bg-neutral-800 rounded">
                    <div
                      className="h-full bg-purple-500 rounded"
                      style={{ width: `${performanceScore.timingAccuracy * 100}%` }}
                    />
                  </div>
                  <span className="font-mono">{(performanceScore.timingAccuracy * 100).toFixed(0)}%</span>
                </div>
              </div>

              <div>
                <div className="text-neutral-400 mb-1">박자 일관성</div>
                <div className="flex items-end gap-1">
                  <div className="w-12 h-6 bg-neutral-800 rounded">
                    <div
                      className="h-full bg-green-500 rounded"
                      style={{ width: `${performanceScore.tempoConsistency * 100}%` }}
                    />
                  </div>
                  <span className="font-mono">{(performanceScore.tempoConsistency * 100).toFixed(0)}%</span>
                </div>
              </div>

              <div>
                <div className="text-neutral-400 mb-1">고도 일관성</div>
                <div className="flex items-end gap-1">
                  <div className="w-12 h-6 bg-neutral-800 rounded">
                    <div
                      className="h-full bg-yellow-500 rounded"
                      style={{ width: `${performanceScore.heightConsistency * 100}%` }}
                    />
                  </div>
                  <span className="font-mono">{(performanceScore.heightConsistency * 100).toFixed(0)}%</span>
                </div>
              </div>

              <div>
                <div className="text-neutral-400 mb-1">착지 안정성</div>
                <div className="flex items-end gap-1">
                  <div className="w-12 h-6 bg-neutral-800 rounded">
                    <div
                      className="h-full bg-orange-500 rounded"
                      style={{ width: `${performanceScore.landingStability * 100}%` }}
                    />
                  </div>
                  <span className="font-mono">{(performanceScore.landingStability * 100).toFixed(0)}%</span>
                </div>
              </div>

              <div>
                <div className="text-neutral-400 mb-1">팔 동기화</div>
                <div className="flex items-end gap-1">
                  <div className="w-12 h-6 bg-neutral-800 rounded">
                    <div
                      className="h-full bg-pink-500 rounded"
                      style={{ width: `${performanceScore.armSync * 100}%` }}
                    />
                  </div>
                  <span className="font-mono">{(performanceScore.armSync * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 상세 통계 */}
        {jumpCount > 0 && (
          <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-4 space-y-3">
            <h3 className="font-bold">점프 통계</h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-neutral-400">감지된 점프</div>
                <div className="text-2xl font-bold">{jumpCount}</div>
              </div>

              {tempoStats && (
                <>
                  <div>
                    <div className="text-neutral-400">평균 박자</div>
                    <div className="text-2xl font-bold">{tempoStats.bpm.toFixed(0)}</div>
                    <div className="text-xs text-neutral-500">BPM</div>
                  </div>

                  <div>
                    <div className="text-neutral-400">점프 간격</div>
                    <div className="text-lg font-mono">{tempoStats.avgInterval.toFixed(0)}ms</div>
                  </div>

                  <div>
                    <div className="text-neutral-400">박자 정확도</div>
                    <div className="text-lg font-mono">{(tempoStats.consistency * 100).toFixed(1)}%</div>
                  </div>
                </>
              )}

              {heightStats && (
                <>
                  <div>
                    <div className="text-neutral-400">평균 높이</div>
                    <div className="text-lg font-mono">{(heightStats.avgHeight * 100).toFixed(1)}cm</div>
                  </div>

                  <div>
                    <div className="text-neutral-400">고도 분산</div>
                    <div className="text-lg font-mono">{(heightStats.consistency * 100).toFixed(1)}%</div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 랜드마크와 연결선 그리기
 */
function drawLandmarks(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  width: number,
  height: number
) {
  const VIS_THRESHOLD = 0.5;

  // 색상 정의
  const COLORS = {
    pose: "#00ff00",
    leftSide: "#ff0080",
    rightSide: "#00ffff",
    center: "#ffff00",
  };

  // 연결선 정의
  const connections = [
    [11, 12], // shoulders
    [11, 13], // left arm
    [13, 15],
    [12, 14], // right arm
    [14, 16],
    [11, 23], // left hip
    [12, 24], // right hip
    [23, 25], // left leg
    [25, 27],
    [24, 26], // right leg
    [26, 28],
  ];

  // 연결선 그리기
  ctx.strokeStyle = "rgba(100, 255, 100, 0.5)";
  ctx.lineWidth = 2;
  for (const [start, end] of connections) {
    const lmStart = landmarks[start];
    const lmEnd = landmarks[end];
    if (
      lmStart &&
      lmEnd &&
      (lmStart.visibility ?? 0) > VIS_THRESHOLD &&
      (lmEnd.visibility ?? 0) > VIS_THRESHOLD
    ) {
      ctx.beginPath();
      ctx.moveTo(lmStart.x * width, lmStart.y * height);
      ctx.lineTo(lmEnd.x * width, lmEnd.y * height);
      ctx.stroke();
    }
  }

  // 포인트 그리기
  for (let i = 0; i < landmarks.length; i++) {
    const lm = landmarks[i];
    if (!lm || (lm.visibility ?? 0) <= VIS_THRESHOLD) continue;

    const x = lm.x * width;
    const y = lm.y * height;

    // 색상 선택
    let color = COLORS.pose;
    if (i === 11 || i === 13 || i === 15) color = COLORS.leftSide;
    if (i === 12 || i === 14 || i === 16) color = COLORS.rightSide;
    if (i === 23 || i === 24 || i === 25 || i === 26 || i === 27 || i === 28) color = COLORS.center;

    // 원 그리기
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();

    // 포인트 라벨
    if (i === 23 || i === 24 || i === 25 || i === 26 || i === 27 || i === 28) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.font = "10px monospace";
      ctx.fillText(String(i), x + 8, y - 2);
    }
  }
}
