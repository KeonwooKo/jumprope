"use client";

import { Suspense, useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment } from "@react-three/drei";
import * as THREE from "three";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { HDR_ENV_URL } from "@/lib/three-env";
import { JumpTracker } from "../../_components/JumpTracker";

const ROAD_URL = "/models/roadStraight.glb";
const CAR_URL = "/models/car/race.glb";
const GROUND_URL = "/models/ground_grass.glb";
const BUILDING_URL = "/models/building/building-a.glb";

useGLTF.preload(ROAD_URL);
useGLTF.preload(CAR_URL);
useGLTF.preload(GROUND_URL);
useGLTF.preload(BUILDING_URL);

// Tuning
export const GOAL_DISTANCE = 500; // meters
const TILE_LENGTH = 1; // meters per road tile — reduce if gaps appear, increase if overlapping
const POOL_SIZE = Math.ceil(GOAL_DISTANCE / TILE_LENGTH) + 10; // cover + buffer
const MAX_SPEED = 25; // m/s (≈ 90 km/h)
const MAX_JUMPS_PER_SEC = 3; // tempo that hits max speed
const JUMP_WINDOW_MS = 3000;
const SPEED_LERP = 0.04; // how fast speed catches up to target

// If the road GLB is oriented wrong, rotate here
const ROAD_ROTATION_Y = 0;
// If the car GLB faces the wrong way, rotate here (pi = 180°)
const CAR_ROTATION_Y = 0;
const CAR_SCALE = 0.5;

// Side ground tiles
const SIDE_GRASS_SCALE = 4;
const SIDE_GRASS_STEP = 4; // matches scale so tiles tessellate
const SIDE_GRASS_ROWS =
  Math.ceil((GOAL_DISTANCE + 20) / SIDE_GRASS_STEP) + 2;
// Decorations — buildings line the sides of the road
const BUILDING_COUNT = 55;

// Deterministic PRNG so decoration positions don't change each render
function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Road() {
  const { scene } = useGLTF(ROAD_URL);
  const tiles = useMemo(
    () =>
      Array.from({ length: POOL_SIZE + 5 }, (_, i) => ({
        object: scene.clone(true),
        z: (i - 5) * TILE_LENGTH,
      })),
    [scene],
  );

  return (
    <>
      {tiles.map((t, i) => (
        <primitive key={i} object={t.object} position={[0, 0, t.z]} rotation={[0, ROAD_ROTATION_Y, 0]} />
      ))}
    </>
  );
}

// Two rows of grass tiles on each side of the road
function SideGround() {
  const { scene } = useGLTF(GROUND_URL);
  const tiles = useMemo(() => {
    const out: { object: THREE.Object3D; pos: [number, number, number] }[] = [];
    for (let i = -1; i < SIDE_GRASS_ROWS; i++) {
      const z = i * SIDE_GRASS_STEP;
      for (const sign of [-1, 1] as const) {
        for (let c = 0; c < 2; c++) {
          // -1 offset = tile overlaps the road edge slightly to eliminate gaps
          const x = sign * (SIDE_GRASS_SCALE / 2 + SIDE_GRASS_SCALE * c - 1);
          out.push({
            object: scene.clone(true),
            pos: [x, -0.02, z],
          });
        }
      }
    }
    return out;
  }, [scene]);
  return (
    <>
      {tiles.map((t, i) => (
        <primitive
          key={i}
          object={t.object}
          position={t.pos}
          scale={SIDE_GRASS_SCALE}
        />
      ))}
    </>
  );
}

function ScatteredDecorations({
  url,
  count,
  seed,
  scale = 1,
  xNear = 2.5,
  xFar = 11.5,
  randomRotation = true,
  scaleJitter = 0.5,
}: {
  url: string;
  count: number;
  seed: number;
  scale?: number;
  xNear?: number;
  xFar?: number;
  randomRotation?: boolean;
  scaleJitter?: number;
}) {
  const { scene } = useGLTF(url);
  const items = useMemo(() => {
    const rand = mulberry32(seed);
    const out: {
      object: THREE.Object3D;
      pos: [number, number, number];
      rot: number;
      s: number;
    }[] = [];
    const xSpan = Math.max(0, xFar - xNear);
    for (let i = 0; i < count; i++) {
      const sideSign = rand() < 0.5 ? -1 : 1;
      const x = sideSign * (xNear + rand() * xSpan);
      const z = rand() * (GOAL_DISTANCE + 20) - 5;
      const rot = randomRotation ? rand() * Math.PI * 2 : 0;
      const s = scale * (1 - scaleJitter / 2 + rand() * scaleJitter);
      out.push({
        object: scene.clone(true),
        pos: [x, 0, z],
        rot,
        s,
      });
    }
    return out;
  }, [scene, count, seed, scale, xNear, xFar, randomRotation, scaleJitter]);

  return (
    <>
      {items.map((it, i) => (
        <primitive
          key={i}
          object={it.object}
          position={it.pos}
          rotation={[0, it.rot, 0]}
          scale={it.s}
        />
      ))}
    </>
  );
}

function Car({ carZRef }: { carZRef: RefObject<number> }) {
  const { scene } = useGLTF(CAR_URL);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.x = 0.15;
      groupRef.current.position.z = carZRef.current;
    }
  });

  return (
    <group ref={groupRef} rotation={[0, CAR_ROTATION_Y, 0]} scale={CAR_SCALE}>
      <primitive object={scene} />
    </group>
  );
}

function CameraFollow({ carZRef }: { carZRef: RefObject<number> }) {
  const { camera } = useThree();

  useFrame(() => {
    const z = carZRef.current;
    camera.position.set(0, 6, z - 6);
    camera.lookAt(0, 0.5, z + 3);
  });

  return null;
}

type EngineProps = {
  jumpTimestampsRef: RefObject<number[]>;
  carZRef: RefObject<number>;
  distanceRef: RefObject<number>;
  speedRef: RefObject<number>;
  onFinish: () => void;
  frozen: boolean;
};

function RaceEngine({ jumpTimestampsRef, carZRef, distanceRef, speedRef, onFinish, frozen }: EngineProps) {
  const finishedRef = useRef(false);

  useFrame((_state, delta) => {
    if (frozen || finishedRef.current) return;

    // Trim stale jump timestamps
    const now = Date.now();
    const stamps = jumpTimestampsRef.current;
    while (stamps.length > 0 && stamps[0] < now - JUMP_WINDOW_MS) {
      stamps.shift();
    }

    // Target speed ∝ recent jumps per second, capped
    const jps = stamps.length / (JUMP_WINDOW_MS / 1000);
    const targetSpeed = Math.min(MAX_SPEED, (jps / MAX_JUMPS_PER_SEC) * MAX_SPEED);

    speedRef.current = THREE.MathUtils.lerp(speedRef.current, targetSpeed, SPEED_LERP);

    // Advance car + distance
    const clampedDelta = Math.min(delta, 0.1); // safety cap
    carZRef.current += speedRef.current * clampedDelta;
    distanceRef.current = carZRef.current;

    if (carZRef.current >= GOAL_DISTANCE) {
      carZRef.current = GOAL_DISTANCE;
      distanceRef.current = GOAL_DISTANCE;
      finishedRef.current = true;
      onFinish();
    }
  });

  return null;
}

type Props = {
  landmarksRef: RefObject<NormalizedLandmark[] | null>;
  onJump: () => void;
  jumpTimestampsRef: RefObject<number[]>;
  carZRef: RefObject<number>;
  distanceRef: RefObject<number>;
  speedRef: RefObject<number>;
  onFinish: () => void;
  frozen: boolean;
};

export function RaceScene({ landmarksRef, onJump, jumpTimestampsRef, carZRef, distanceRef, speedRef, onFinish, frozen }: Props) {
  return (
    <Canvas className="absolute inset-0 h-dvh" camera={{ position: [0, 6, -6], fov: 52 }}>
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 8, 4]} intensity={1.2} />
      <Suspense fallback={null}>
        <Environment files={HDR_ENV_URL} background environmentIntensity={0.5} />
        <SideGround />
        <Road />
        <ScatteredDecorations
          url={BUILDING_URL}
          count={BUILDING_COUNT}
          seed={42}
          scale={1}
          xNear={2.2}
          xFar={2.2}
          randomRotation={false}
          scaleJitter={0}
        />
        <Car carZRef={carZRef} />
        <CameraFollow carZRef={carZRef} />
        <RaceEngine jumpTimestampsRef={jumpTimestampsRef} carZRef={carZRef} distanceRef={distanceRef} speedRef={speedRef} onFinish={onFinish} frozen={frozen} />
        <JumpTracker landmarksRef={landmarksRef} onJump={onJump} enabled={!frozen} />
      </Suspense>
    </Canvas>
  );
}

export const MAX_SPEED_EXPORTED = MAX_SPEED;
