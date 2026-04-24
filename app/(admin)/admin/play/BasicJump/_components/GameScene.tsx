"use client";

import { Suspense, useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment } from "@react-three/drei";
import * as THREE from "three";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { HDR_ENV_URL } from "@/lib/three-env";

const GROUND_URL = "/models/ground_grass.glb";
const GRASS_URL = "/models/grass.glb";
const FLOWER_URL = "/models/flower_purpleC.glb";
const CHARACTER_URL = "/models/character-female-d.glb";

useGLTF.preload(GROUND_URL);
useGLTF.preload(GRASS_URL);
useGLTF.preload(FLOWER_URL);
useGLTF.preload(CHARACTER_URL);

// Ground: tile the base mesh in a grid so it looks continuous
function Ground() {
  const { scene } = useGLTF(GROUND_URL);
  const tiles = useMemo(() => {
    const out: { key: string; object: THREE.Object3D; pos: [number, number, number] }[] = [];
    const SIZE = 1;
    const N = 9;
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        out.push({
          key: `g-${i}-${j}`,
          object: scene.clone(true),
          pos: [(i - (N - 1) / 2) * SIZE, 0, (j - (N - 1) / 2) * SIZE],
        });
      }
    }
    return out;
  }, [scene]);
  return (
    <>
      {tiles.map((t) => (
        <primitive key={t.key} object={t.object} position={t.pos} />
      ))}
    </>
  );
}

function Decoration({ url, positions, scale = 1 }: { url: string; positions: [number, number, number][]; scale?: number }) {
  const { scene } = useGLTF(url);
  const clones = useMemo(() => positions.map(() => scene.clone(true)), [scene, positions]);
  return (
    <>
      {clones.map((obj, i) => (
        <primitive key={i} object={obj} position={positions[i]} scale={scale} />
      ))}
    </>
  );
}

type CharacterProps = {
  landmarksRef: RefObject<NormalizedLandmark[] | null>;
  onJump: () => void;
  frozen: boolean;
};

// Jump tuning
const BASELINE_ALPHA = 0.02; // baseline drift speed
const JUMP_UP_THRESHOLD = 0.04; // hipY drop (normalized) to count a jump
const JUMP_RESET_THRESHOLD = 0.02; // return-to-ground threshold (hysteresis)
const POS_Y_SCALE = 4; // maps landmark delta to world-space height
const POS_Y_MAX = 1.2; // cap character world-space Y
const POS_SMOOTH = 0.35; // lerp factor per frame

function Character({ landmarksRef, onJump, frozen }: CharacterProps) {
  const { scene } = useGLTF(CHARACTER_URL);
  const groupRef = useRef<THREE.Group>(null);
  const baselineYRef = useRef<number | null>(null);
  const isInAirRef = useRef(false);

  useFrame(() => {
    const group = groupRef.current;
    if (!group || frozen) return;
    const lms = landmarksRef.current;
    if (!lms) return;

    const l23 = lms[23];
    const l24 = lms[24];
    if (!l23 || !l24) return;
    const vis = Math.min(l23.visibility ?? 0, l24.visibility ?? 0);
    if (vis < 0.5) return;

    const hipY = (l23.y + l24.y) / 2;

    if (baselineYRef.current === null) {
      baselineYRef.current = hipY;
      return;
    }

    const delta = baselineYRef.current - hipY; // positive when user jumps up
    // Drift baseline slowly only when user is near rest to follow standing drift
    if (Math.abs(delta) < 0.015) {
      baselineYRef.current = baselineYRef.current * (1 - BASELINE_ALPHA) + hipY * BASELINE_ALPHA;
    }

    const targetY = Math.max(0, Math.min(POS_Y_MAX, delta * POS_Y_SCALE));
    group.position.y = THREE.MathUtils.lerp(group.position.y, targetY, POS_SMOOTH);

    // Jump count state machine
    if (delta > JUMP_UP_THRESHOLD && !isInAirRef.current) {
      isInAirRef.current = true;
      onJump();
    } else if (delta < JUMP_RESET_THRESHOLD) {
      isInAirRef.current = false;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

type Props = {
  landmarksRef: RefObject<NormalizedLandmark[] | null>;
  onJump: () => void;
  frozen: boolean;
};

export function GameScene({ landmarksRef, onJump, frozen }: Props) {
  const grassPositions: [number, number, number][] = useMemo(
    () => [
      [-1.6, 0, 0.4],
      [1.4, 0, 0.6],
      [-2.0, 0, -0.9],
      [2.1, 0, -0.7],
      [-0.9, 0, 1.3],
      [0.8, 0, 1.5],
      [-2.4, 0, 1.1],
      [2.3, 0, 1.2],
    ],
    [],
  );

  const flowerPositions: [number, number, number][] = useMemo(
    () => [
      [-1.1, 0, 0.9],
      [1.3, 0, -0.3],
      [-0.6, 0, -1.4],
      [0.5, 0, -1.7],
      [-2.0, 0, -1.9],
      [2.0, 0, 1.9],
    ],
    [],
  );

  return (
    <Canvas className="absolute inset-0 h-dvh" camera={{ position: [0, 1.4, 3.6], fov: 42 }} shadows>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 3]} intensity={1.1} castShadow />
      <Suspense fallback={null}>
        <Environment files={HDR_ENV_URL} background />
        <Ground />
        <Decoration url={GRASS_URL} positions={grassPositions} />
        <Decoration url={FLOWER_URL} positions={flowerPositions} />
        <Character landmarksRef={landmarksRef} onJump={onJump} frozen={frozen} />
      </Suspense>
    </Canvas>
  );
}
