"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import { HDR_ENV_URL } from "@/lib/three-env";

const DEFAULT_MODEL = "/models/character-female-d.glb";

const ALL_MODELS = [
  "/models/character-female-a.glb",
  "/models/character-female-b.glb",
  "/models/character-female-c.glb",
  "/models/character-female-d.glb",
  "/models/character-female-e.glb",
];

ALL_MODELS.forEach((url) => useGLTF.preload(url));

function Character({ modelUrl }: { modelUrl: string }) {
  const { scene } = useGLTF(modelUrl);
  return <primitive object={scene} position={[0, -1, 0]} scale={1.2} />;
}

type Props = {
  modelUrl?: string;
};

export function CharacterPreview3D({ modelUrl = DEFAULT_MODEL }: Props) {
  return (
    <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[linear-gradient(180deg,var(--color-k-blue-soft),#fff)] border-[1.5px] border-k-blue-soft-2">
      <Canvas camera={{ position: [0, 1, 3.2], fov: 35 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 5, 2]} intensity={1.1} />
        <Suspense fallback={null}>
          <Character modelUrl={modelUrl} />
          <Environment files={HDR_ENV_URL} background />
        </Suspense>
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2}
          autoRotate
          autoRotateSpeed={1.5}
        />
      </Canvas>
    </div>
  );
}
