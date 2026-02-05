import React, { useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

/** Ring size US 5–13 → inner diameter mm (standard chart) */
export const RING_SIZE_TO_MM: Record<number, number> = {
  5: 15.6, 6: 16.5, 7: 17.3, 8: 18.1, 9: 19.0, 10: 19.8, 11: 20.6, 12: 21.4, 13: 22.2,
};

/** Carat → mm (GIA round brilliant approx) */
export const CARAT_TO_MM: Record<number, number> = {
  0.25: 4.1, 0.5: 5.1, 0.75: 5.9, 1: 6.5, 1.25: 7.0, 1.5: 7.4, 2: 8.2, 2.5: 8.8, 3: 9.4,
};

export const CAD_METAL_OPTIONS: { id: string; label: string; color: string }[] = [
  { id: '18k_yellow', label: '18k Yellow Gold', color: '#D4AF37' },
  { id: '18k_white', label: '18k White Gold', color: '#F5F5DC' },
  { id: '18k_rose', label: '18k Rose Gold', color: '#B76E79' },
  { id: 'platinum', label: 'Platinum 950', color: '#E5E4E2' },
  { id: '14k_yellow', label: '14k Yellow Gold', color: '#C5A028' },
  { id: '14k_white', label: '14k White Gold', color: '#E8E6D9' },
];

export interface RingPlaygroundParams {
  ringInnerDiaMm: number;
  bandWidthMm: number;
  bandThicknessMm: number;
  centerStoneDiaMm: number;
  centerStoneHeightMm: number;
  sideStoneCount: number;
  sideStoneDiaMm: number;
  headHeightMm: number;
  metalColor: string;
  showStones: boolean;
}

const DEFAULT_PARAMS: RingPlaygroundParams = {
  ringInnerDiaMm: 17.3,
  bandWidthMm: 2.5,
  bandThicknessMm: 1.8,
  centerStoneDiaMm: 6.5,
  centerStoneHeightMm: 4,
  sideStoneCount: 0,
  sideStoneDiaMm: 3,
  headHeightMm: 5,
  metalColor: '#D4AF37',
  showStones: true,
};

/** Scale mm to scene units (1 unit ≈ 1 cm, so mm/10) */
function mm(x: number) {
  return x / 10;
}

function Band({ params }: { params: RingPlaygroundParams }) {
  const innerR = mm(params.ringInnerDiaMm / 2);
  const tubeR = mm(params.bandThicknessMm / 2);
  const majorR = innerR + tubeR;
  const geometry = useMemo(() => new THREE.TorusGeometry(majorR, tubeR, 32, 64), [majorR, tubeR]);
  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial color={params.metalColor} metalness={0.92} roughness={0.15} />
    </mesh>
  );
}

/** 4 prongs around center stone (solitaire style): base at head top, tip above stone table */
function Prongs({ params, headTopY }: { params: RingPlaygroundParams; headTopY: number }) {
  const centerR = mm(params.centerStoneDiaMm / 2);
  const centerH = mm(params.centerStoneHeightMm);
  const prongHeight = centerH * 0.85;
  const prongBaseW = mm(1.0);
  const prongTipW = mm(0.7);
  const metalColor = params.metalColor;
  const positions = [
    [centerR * 0.9, 0],
    [0, centerR * 0.9],
    [-centerR * 0.9, 0],
    [0, -centerR * 0.9],
  ] as [number, number][];

  return (
    <>
      {positions.map(([x, z], i) => (
        <group key={i} position={[x, headTopY + prongHeight / 2, z]}>
          <mesh castShadow>
            <cylinderGeometry args={[prongBaseW, prongTipW, prongHeight, 8]} />
            <meshStandardMaterial color={metalColor} metalness={0.92} roughness={0.15} />
          </mesh>
        </group>
      ))}
    </>
  );
}

function HeadAndStones({ params }: { params: RingPlaygroundParams }) {
  const cy = mm(params.ringInnerDiaMm / 2 + params.bandThicknessMm / 2);
  const headH = mm(params.headHeightMm);
  const centerR = mm(params.centerStoneDiaMm / 2);
  const centerH = mm(params.centerStoneHeightMm);
  const sideR = mm(params.sideStoneDiaMm / 2);
  const headTopY = headH;

  // Slightly slimmer shoulders that rise toward the head to better match a cathedral solitaire
  const shoulderHeight = headH * 0.9;
  const shoulderThickness = mm(Math.max(params.bandThicknessMm * 0.6, 1.2));
  const shoulderOffsetZ = centerR * 0.9;

  return (
    <group position={[cy, 0, 0]}>
      {/* Cathedral shoulders – front/back split shank rising into the head */}
      <group>
        {/* Front pair */}
        <mesh
          position={[0, shoulderHeight / 2, shoulderOffsetZ]}
          rotation={[-Math.PI / 10, 0, 0]}
          castShadow
        >
          <boxGeometry args={[shoulderThickness, shoulderHeight, shoulderThickness * 0.9]} />
          <meshStandardMaterial color={params.metalColor} metalness={0.95} roughness={0.18} />
        </mesh>
        <mesh
          position={[0, shoulderHeight / 2, shoulderOffsetZ + shoulderThickness * 0.9]}
          rotation={[-Math.PI / 10, 0, 0]}
          castShadow
        >
          <boxGeometry args={[shoulderThickness * 0.85, shoulderHeight, shoulderThickness * 0.8]} />
          <meshStandardMaterial color={params.metalColor} metalness={0.95} roughness={0.18} />
        </mesh>
        {/* Back pair */}
        <mesh
          position={[0, shoulderHeight / 2, -shoulderOffsetZ]}
          rotation={[Math.PI / 10, 0, 0]}
          castShadow
        >
          <boxGeometry args={[shoulderThickness, shoulderHeight, shoulderThickness * 0.9]} />
          <meshStandardMaterial color={params.metalColor} metalness={0.95} roughness={0.18} />
        </mesh>
        <mesh
          position={[0, shoulderHeight / 2, -shoulderOffsetZ - shoulderThickness * 0.9]}
          rotation={[Math.PI / 10, 0, 0]}
          castShadow
        >
          <boxGeometry args={[shoulderThickness * 0.85, shoulderHeight, shoulderThickness * 0.8]} />
          <meshStandardMaterial color={params.metalColor} metalness={0.95} roughness={0.18} />
        </mesh>
      </group>

      {/* Head / basket — wider base, visible setting under the stone */}
      <mesh position={[0, headH / 2, 0]} castShadow>
        <cylinderGeometry args={[centerR * 1.1, centerR * 1.35, headH, 32]} />
        <meshStandardMaterial color={params.metalColor} metalness={0.92} roughness={0.15} />
      </mesh>
      {/* 4 prongs (solitaire) */}
      <Prongs params={params} headTopY={headTopY} />
      {/* Center stone placeholder (cyan = preview) */}
      {params.showStones && (
        <mesh position={[0, headH + centerH / 2, 0]} castShadow>
          <cylinderGeometry args={[centerR * 0.98, centerR, centerH, 32]} />
          <meshStandardMaterial color="#00ffff" metalness={0.05} roughness={0.02} />
        </mesh>
      )}
      {/* Side stones */}
      {params.showStones && params.sideStoneCount >= 2 && (
        <>
          <mesh position={[0, headH + centerH * 0.3, -centerR * 1.4]} castShadow>
            <cylinderGeometry args={[sideR, sideR, centerH * 0.5, 24]} />
            <meshStandardMaterial color="#00ffff" metalness={0.05} roughness={0.02} />
          </mesh>
          <mesh position={[0, headH + centerH * 0.3, centerR * 1.4]} castShadow>
            <cylinderGeometry args={[sideR, sideR, centerH * 0.5, 24]} />
            <meshStandardMaterial color="#00ffff" metalness={0.05} roughness={0.02} />
          </mesh>
        </>
      )}
    </group>
  );
}

function RingScene({ params }: { params: RingPlaygroundParams }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-far={50} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={10} shadow-camera-bottom={-10} />
      <pointLight position={[-5, 5, 5]} intensity={0.4} />
      <group rotation={[0, 0, Math.PI / 2]}>
        <Band params={params} />
        <HeadAndStones params={params} />
      </group>
      <OrbitControls enablePan={false} minDistance={1} maxDistance={8} />
    </>
  );
}

export interface RingPlayground3DProps {
  params: RingPlaygroundParams;
  className?: string;
  theme?: 'dark' | 'light';
}

export default function RingPlayground3D({ params, className = '', theme = 'dark' }: RingPlayground3DProps) {
  return (
    <div className={`rounded-xl overflow-hidden bg-black/40 ${className}`} style={{ minHeight: 280 }}>
      <Suspense fallback={<div className="w-full h-full min-h-[280px] flex items-center justify-center text-[11px] uppercase opacity-60">Loading 3D…</div>}>
        <Canvas camera={{ position: [4, 3, 4], fov: 45 }} shadows gl={{ antialias: true }}>
          <RingScene params={params} />
        </Canvas>
      </Suspense>
    </div>
  );
}

export { DEFAULT_PARAMS };
