import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { LANDMARK, type JumpFrameData } from "./types";

// 프레임 분석 유틸리티 (모든 분류기가 공유)
export function analyzeJumpFrames(frames: NormalizedLandmark[][]): JumpFrameData {
  if (frames.length < 3) {
    return getEmptyFrameData();
  }

  const midFrames = frames.slice(
    Math.floor(frames.length * 0.3),
    Math.floor(frames.length * 0.7)
  );

  if (midFrames.length === 0) {
    return getEmptyFrameData();
  }

  let totalAnkleDistance = 0;
  let crossedCount = 0;
  let wideCount = 0;
  let leftSideCount = 0;
  let rightSideCount = 0;
  let armCrossedCount = 0;
  let validFrames = 0;

  for (const lms of midFrames) {
    const leftAnkle = lms[LANDMARK.LEFT_ANKLE];
    const rightAnkle = lms[LANDMARK.RIGHT_ANKLE];
    const leftHip = lms[LANDMARK.LEFT_HIP];
    const rightHip = lms[LANDMARK.RIGHT_HIP];

    if (!leftAnkle || !rightAnkle || !leftHip || !rightHip) continue;

    const hipCenterX = (leftHip.x + rightHip.x) / 2;
    const hipWidth = Math.abs(leftHip.x - rightHip.x);
    const ankleDistance = Math.abs(leftAnkle.x - rightAnkle.x);

    totalAnkleDistance += ankleDistance;
    validFrames++;

    // 발 교차 체크
    if (leftAnkle.x > hipCenterX && rightAnkle.x < hipCenterX) {
      crossedCount++;
    }

    // 발 벌림 체크
    if (ankleDistance > hipWidth * 1.3) {
      wideCount++;
    }

    // 좌우 이동 체크
    const avgAnkleX = (leftAnkle.x + rightAnkle.x) / 2;
    const deviation = avgAnkleX - hipCenterX;
    if (deviation < -hipWidth * 0.3) {
      leftSideCount++;
    } else if (deviation > hipWidth * 0.3) {
      rightSideCount++;
    }

    // 팔 교차 체크
    const leftWrist = lms[LANDMARK.LEFT_WRIST];
    const rightWrist = lms[LANDMARK.RIGHT_WRIST];
    const leftShoulder = lms[LANDMARK.LEFT_SHOULDER];
    const rightShoulder = lms[LANDMARK.RIGHT_SHOULDER];

    if (leftWrist && rightWrist && leftShoulder && rightShoulder) {
      const shoulderCenterX = (leftShoulder.x + rightShoulder.x) / 2;
      const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);

      const leftWristCrossed = leftWrist.x > shoulderCenterX;
      const rightWristCrossed = rightWrist.x < shoulderCenterX;
      const leftCrossDistance = leftWrist.x - shoulderCenterX;
      const rightCrossDistance = shoulderCenterX - rightWrist.x;
      const wristHeightDiff = Math.abs(leftWrist.y - rightWrist.y);
      const avgWristY = (leftWrist.y + rightWrist.y) / 2;
      const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
      const isChestLevel = Math.abs(avgWristY - avgShoulderY) < shoulderWidth * 0.8;

      if (
        leftWristCrossed &&
        rightWristCrossed &&
        leftCrossDistance > shoulderWidth * 0.2 &&
        rightCrossDistance > shoulderWidth * 0.2 &&
        wristHeightDiff < shoulderWidth * 0.3 &&
        isChestLevel
      ) {
        armCrossedCount++;
      }
    }
  }

  if (validFrames === 0) {
    return getEmptyFrameData();
  }

  const avgAnkleDistance = totalAnkleDistance / validFrames;
  const isCrossed = crossedCount / validFrames > 0.5;
  const isWide = wideCount / validFrames > 0.5;
  const isArmCrossed = armCrossedCount / validFrames > 0.6;

  let sideDirection: "left" | "right" | "center" = "center";
  if (leftSideCount > validFrames * 0.5) {
    sideDirection = "left";
  } else if (rightSideCount > validFrames * 0.5) {
    sideDirection = "right";
  }

  return {
    ankleDistance: avgAnkleDistance,
    isCrossed,
    isWide,
    sideDirection,
    isArmCrossed,
  };
}

function getEmptyFrameData(): JumpFrameData {
  return {
    ankleDistance: 0,
    isCrossed: false,
    isWide: false,
    sideDirection: "center",
    isArmCrossed: false,
  };
}
