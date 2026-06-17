"use client";

import { Suspense, type RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { HDR_ENV_URL } from "@/lib/three-env";
import { JumpClassifier, type JumpEvent } from "@/lib/use-jump-classification";

type Props = {
  landmarksRef: RefObject<NormalizedLandmark[] | null>;
  onJump: (event: JumpEvent) => void;
};

export function DemoScene({ landmarksRef, onJump }: Props) {
  return (
    <Canvas className="absolute inset-0 h-dvh" camera={{ position: [0, 1, 3.6], fov: 42 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 3]} intensity={1.1} />
      <Suspense fallback={null}>
        <Environment files={HDR_ENV_URL} background />
        <JumpClassifier landmarksRef={landmarksRef} onJump={onJump} enabled={true} />
      </Suspense>
    </Canvas>
  );
}
