import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

/**
 * 포즈 동작 분석을 위한 유틸리티
 * 다양한 줄넘기 동작의 메트릭을 계산
 */

export type PoseMetrics = {
  // 기본 정보
  timestamp: number;
  isVisible: boolean;
  
  // 높이 관련
  hipY: number;
  hipZ: number;
  shoulderY: number;
  kneeY: number;
  ankleY: number;
  
  // 각도 관련 (라디안)
  leftArmAngle: number;      // 왼쪽 팔 각도
  rightArmAngle: number;     // 오른쪽 팔 각도
  armRotationSpeed: number;  // 팔 회전 속도
  
  // 안정성
  bodyTilt: number;          // 신체 기울기 (좌우)
  symmetry: number;          // 좌우 대칭도 (0-1)
  
  // 동작 상태
  isJumping: boolean;
  jumpPhase: "preparing" | "ascending" | "peak" | "descending" | "grounded";
};

export type JumpEvent = {
  timestamp: number;
  startTime: number;
  endTime: number;
  jumpHeight: number;        // 정점 높이
  flightTime: number;        // 공중 시간 (ms)
  landingStability: number;  // 착지 안정성 (0-1)
  armSyncScore: number;      // 팔 동기화 점수 (0-1)
};

// 핵심 랜드마크 인덱스
const LANDMARKS = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_WRIST: 9,
  RIGHT_WRIST: 10,
  LEFT_ELBOW: 7,
  RIGHT_ELBOW: 8,
};

/**
 * 두 랜드마크 사이 거리 계산 (3D)
 */
function distance(lm1: NormalizedLandmark, lm2: NormalizedLandmark): number {
  const dx = lm1.x - lm2.x;
  const dy = lm1.y - lm2.y;
  const dz = (lm1.z ?? 0) - (lm2.z ?? 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * 세 점으로 이루어진 각도 계산
 */
function angle(a: NormalizedLandmark, b: NormalizedLandmark, c: NormalizedLandmark): number {
  const ba = { x: a.x - b.x, y: a.y - b.y };
  const bc = { x: c.x - b.x, y: c.y - b.y };
  const dot = ba.x * bc.x + ba.y * bc.y;
  const mag1 = Math.sqrt(ba.x * ba.x + ba.y * ba.y);
  const mag2 = Math.sqrt(bc.x * bc.x + bc.y * bc.y);
  if (mag1 === 0 || mag2 === 0) return 0;
  return Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2))));
}

/**
 * 랜드마크에서 포즈 메트릭 추출
 */
export function extractPoseMetrics(landmarks: NormalizedLandmark[] | null): PoseMetrics | null {
  if (!landmarks || landmarks.length < 29) return null;

  const lms = landmarks;
  const VIS_THRESHOLD = 0.5;

  // 주요 포인트 가시성 체크
  const lhip = lms[LANDMARKS.LEFT_HIP];
  const rhip = lms[LANDMARKS.RIGHT_HIP];
  const lknee = lms[LANDMARKS.LEFT_KNEE];
  const rknee = lms[LANDMARKS.RIGHT_KNEE];
  const lshoulder = lms[LANDMARKS.LEFT_SHOULDER];
  const rshoulder = lms[LANDMARKS.RIGHT_SHOULDER];
  const lwrist = lms[LANDMARKS.LEFT_WRIST];
  const rwrist = lms[LANDMARKS.RIGHT_WRIST];
  const lelbow = lms[LANDMARKS.LEFT_ELBOW];
  const relbow = lms[LANDMARKS.RIGHT_ELBOW];

  const isVisible =
    (lhip?.visibility ?? 0) > VIS_THRESHOLD &&
    (rhip?.visibility ?? 0) > VIS_THRESHOLD &&
    (lknee?.visibility ?? 0) > VIS_THRESHOLD &&
    (rknee?.visibility ?? 0) > VIS_THRESHOLD;

  if (!isVisible || !lhip || !rhip || !lknee || !rknee) return null;

  // 높이 계산
  const hipY = (lhip.y + rhip.y) / 2;
  const hipZ = (lhip.z ?? 0 + rhip.z ?? 0) / 2;
  const shoulderY = lshoulder && rshoulder ? (lshoulder.y + rshoulder.y) / 2 : hipY;
  const kneeY = (lknee.y + rknee.y) / 2;
  const ankleY = lms[LANDMARKS.LEFT_ANKLE] && lms[LANDMARKS.RIGHT_ANKLE]
    ? ((lms[LANDMARKS.LEFT_ANKLE].y ?? 0) + (lms[LANDMARKS.RIGHT_ANKLE].y ?? 0)) / 2
    : kneeY;

  // 팔 각도 계산
  let leftArmAngle = 0;
  let rightArmAngle = 0;
  let armRotationSpeed = 0;

  if (lshoulder && lelbow && lwrist && (lwrist.visibility ?? 0) > VIS_THRESHOLD) {
    leftArmAngle = angle(lwrist, lelbow, lshoulder);
  }
  if (rshoulder && relbow && rwrist && (rwrist.visibility ?? 0) > VIS_THRESHOLD) {
    rightArmAngle = angle(rwrist, relbow, rshoulder);
  }

  // 팔의 수평 속도 (회전 유무)
  if (lwrist && rwrist) {
    const armSpan = distance(lwrist, rwrist);
    armRotationSpeed = Math.abs(leftArmAngle - rightArmAngle) / Math.max(0.1, armSpan);
  }

  // 신체 기울기 (좌우)
  const bodyTilt = Math.abs(lhip.x - rhip.x);

  // 좌우 대칭도
  const leftDist = distance(lhip, lknee) + distance(lknee, lms[LANDMARKS.LEFT_ANKLE] ?? lknee);
  const rightDist = distance(rhip, rknee) + distance(rknee, lms[LANDMARKS.RIGHT_ANKLE] ?? rknee);
  const symmetry = leftDist > 0 && rightDist > 0
    ? Math.min(leftDist, rightDist) / Math.max(leftDist, rightDist)
    : 0;

  return {
    timestamp: Date.now(),
    isVisible,
    hipY,
    hipZ,
    shoulderY,
    kneeY,
    ankleY,
    leftArmAngle,
    rightArmAngle,
    armRotationSpeed,
    bodyTilt,
    symmetry,
    isJumping: false, // 나중에 상태 머신으로 계산
    jumpPhase: "grounded",
  };
}

/**
 * 메트릭 시퀀스에서 점프 이벤트 감지
 */
export function detectJumpEvents(
  metricsHistory: PoseMetrics[],
  baselineHipY: number
): JumpEvent[] {
  const events: JumpEvent[] = [];
  let inJump = false;
  let jumpStartIdx = -1;
  let jumpPeak = 0;

  for (let i = 0; i < metricsHistory.length; i++) {
    const m = metricsHistory[i];
    const delta = baselineHipY - m.hipY;
    const jumpThreshold = 0.04;
    const resetThreshold = 0.02;

    if (delta > jumpThreshold && !inJump) {
      // 점프 시작
      inJump = true;
      jumpStartIdx = i;
      jumpPeak = delta;
    } else if (delta < resetThreshold && inJump && jumpStartIdx >= 0) {
      // 점프 종료
      const jumpStart = metricsHistory[jumpStartIdx];
      const flightTime = m.timestamp - jumpStart.timestamp;
      const landingStability = calculateLandingStability(metricsHistory, Math.max(0, i - 3), i);
      const armSyncScore = calculateArmSync(metricsHistory, jumpStartIdx, i);

      events.push({
        timestamp: jumpStart.timestamp,
        startTime: jumpStart.timestamp,
        endTime: m.timestamp,
        jumpHeight: jumpPeak,
        flightTime,
        landingStability,
        armSyncScore,
      });

      inJump = false;
      jumpStartIdx = -1;
      jumpPeak = 0;
    }

    if (inJump && delta > jumpPeak) {
      jumpPeak = delta;
    }
  }

  return events;
}

/**
 * 착지 안정성 계산 (착지 순간의 신체 안정성)
 */
function calculateLandingStability(
  metrics: PoseMetrics[],
  startIdx: number,
  endIdx: number
): number {
  const relevantMetrics = metrics.slice(Math.max(0, startIdx), endIdx + 1);
  if (relevantMetrics.length === 0) return 0;

  // 착지 순간의 좌우 대칭도로 안정성 평가
  const symmetries = relevantMetrics.map((m) => m.symmetry);
  const avgSymmetry = symmetries.reduce((a, b) => a + b, 0) / symmetries.length;
  const variance =
    symmetries.reduce((sum, s) => sum + Math.pow(s - avgSymmetry, 2), 0) / symmetries.length;

  // 낮은 분산 = 안정적
  return Math.max(0, 1 - variance);
}

/**
 * 팔 동기화 점수 계산
 */
function calculateArmSync(
  metrics: PoseMetrics[],
  jumpStartIdx: number,
  jumpEndIdx: number
): number {
  if (jumpStartIdx < 0 || jumpEndIdx < 0 || jumpEndIdx <= jumpStartIdx) return 0;

  const jumpMetrics = metrics.slice(jumpStartIdx, jumpEndIdx + 1);
  if (jumpMetrics.length < 2) return 0;

  // 팔 각도 차이의 일관성
  const angleDiffs = jumpMetrics.map((m) =>
    Math.abs(m.leftArmAngle - m.rightArmAngle)
  );

  const avgDiff = angleDiffs.reduce((a, b) => a + b, 0) / angleDiffs.length;
  const variance =
    angleDiffs.reduce((sum, d) => sum + Math.pow(d - avgDiff, 2), 0) / angleDiffs.length;

  // 낮은 분산 = 동기화 잘 됨
  return Math.max(0, 1 - variance * 2);
}

/**
 * 박자 일관성 계산
 */
export function calculateTempoConsistency(jumpEvents: JumpEvent[]): {
  avgInterval: number;
  consistency: number; // 0-1, 1이 가장 일관성 있음
  bpm: number;
} {
  if (jumpEvents.length < 2) {
    return { avgInterval: 0, consistency: 0, bpm: 0 };
  }

  const intervals = [];
  for (let i = 1; i < jumpEvents.length; i++) {
    intervals.push(jumpEvents[i].startTime - jumpEvents[i - 1].startTime);
  }

  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const variance = intervals.reduce((sum, i) => sum + Math.pow(i - avgInterval, 2), 0) / intervals.length;
  const stdDev = Math.sqrt(variance);

  // CV (Coefficient of Variation): 낮을수록 일관성 높음
  const cv = stdDev / avgInterval;
  const consistency = Math.max(0, 1 - cv * 2);

  const bpm = (60 * 1000) / avgInterval; // BPM으로 변환

  return { avgInterval, consistency, bpm };
}

/**
 * 고도 일관성 계산
 */
export function calculateHeightConsistency(jumpEvents: JumpEvent[]): {
  avgHeight: number;
  consistency: number; // 0-1
  variance: number;
} {
  if (jumpEvents.length === 0) {
    return { avgHeight: 0, consistency: 0, variance: 0 };
  }

  const heights = jumpEvents.map((e) => e.jumpHeight);
  const avgHeight = heights.reduce((a, b) => a + b, 0) / heights.length;
  const variance = heights.reduce((sum, h) => sum + Math.pow(h - avgHeight, 2), 0) / heights.length;
  const stdDev = Math.sqrt(variance);

  // 표준화된 분산으로 일관성 계산
  const consistency = Math.max(0, 1 - stdDev / Math.max(0.05, avgHeight));

  return { avgHeight, consistency, variance };
}

/**
 * 전체 성과 점수 계산
 */
export function calculatePerformanceScore(jumpEvents: JumpEvent[]): {
  detectionRate: number;
  timingAccuracy: number;
  tempoConsistency: number;
  heightConsistency: number;
  landingStability: number;
  armSync: number;
  overallScore: number;
} {
  if (jumpEvents.length === 0) {
    return {
      detectionRate: 0,
      timingAccuracy: 0,
      tempoConsistency: 0,
      heightConsistency: 0,
      landingStability: 0,
      armSync: 0,
      overallScore: 0,
    };
  }

  const tempo = calculateTempoConsistency(jumpEvents);
  const height = calculateHeightConsistency(jumpEvents);

  const detectionRate = Math.min(1, jumpEvents.length / 60); // 60초 기준
  const timingAccuracy = tempo.consistency;
  const tempoConsistency = tempo.consistency;
  const heightConsistency = height.consistency;
  const landingStability =
    jumpEvents.reduce((sum, e) => sum + e.landingStability, 0) / jumpEvents.length;
  const armSync = jumpEvents.reduce((sum, e) => sum + e.armSyncScore, 0) / jumpEvents.length;

  // 가중 평균
  const overallScore =
    detectionRate * 0.15 +
    timingAccuracy * 0.2 +
    tempoConsistency * 0.2 +
    heightConsistency * 0.2 +
    landingStability * 0.15 +
    armSync * 0.1;

  return {
    detectionRate,
    timingAccuracy,
    tempoConsistency,
    heightConsistency,
    landingStability,
    armSync,
    overallScore: Math.min(1, overallScore),
  };
}
