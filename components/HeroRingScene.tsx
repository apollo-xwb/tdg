import React, { useEffect, useMemo, useRef, ErrorInfo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Vite: import GLB as URL so it resolves in dev and build.
// Use the richer Crystal-Jewels ring asset with full stones.
import heroRingUrl from '../src/3d/ring2_webgi3.glb?url';
const HERO_RING_URL = heroRingUrl;

// Fallback placeholder component if model fails
function RingPlaceholder() {
  return (
    <div className="w-full h-full min-h-[50vh] lg:min-h-screen relative bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-[#050505] flex items-center justify-center">
      <div className="text-center px-6">
        <div className="w-32 h-32 mx-auto mb-6 rounded-full border-2 border-white/10 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full border border-white/20" />
        </div>
        <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">
          Premium 3D Experience
        </p>
      </div>
    </div>
  );
}

type Vec3 = [number, number, number];

export interface HeroRingPose {
  cameraPosition: Vec3;
  target: Vec3;
  ringRotation: Vec3;
}

interface HeroRingSceneProps {
  pose: HeroRingPose;
  /** Optional explicit background color (hex). Defaults to white. */
  background?: string;
  /** Stone colour tint for the hero ring (e.g. diamond, ruby, emerald). */
  stoneColor?: string;
}

function RingModel({ rotation, stoneColor = '#f7fbff' }: { rotation: Vec3; stoneColor?: string }) {
  const group = useRef<THREE.Group>(null);
  const gltf = useGLTF(HERO_RING_URL);
  const targetRotation = useRef<Vec3>(rotation);

  if (!gltf?.scene) {
    return null;
  }

  // Center and normalize once
  const scene = useMemo(() => {
    const root = gltf.scene.clone(true);

    // Normalize position & scale so we can frame it nicely.
    const box = new THREE.Box3().setFromObject(root);
    const center = new THREE.Vector3();
    box.getCenter(center);
    root.position.sub(center);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z, 0.001);
    // Slightly larger presence in the frame, especially on large screens.
    const scale = Math.min(Math.max(2.2 / maxDim, 0.01), 100);
    root.scale.setScalar(scale);

    // Stone detection: same mesh names as Crystal-Jewels + heuristic.
    const isStoneMesh = (mesh: THREE.Mesh, m: THREE.MeshStandardMaterial) => {
      const name = (m.name || mesh.name || '').toLowerCase();
      const explicit =
        name === 'diamonds' || name === 'diamonds001' || name === 'diamonds002' ||
        name === 'diamonds003' || name === 'diamonds004' || name === 'diamonds005' ||
        name === 'object';
      return explicit || name.includes('diamond') || name.includes('stone') || name.includes('gem') ||
        (m.metalness < 0.2 && m.roughness < 0.6 && m.color.r > 0.7 && m.color.g > 0.7 && m.color.b > 0.7);
    };

    // Replace stone materials with refractive MeshPhysicalMaterial (no emission = no flat white).
    root.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      mesh.castShadow = true;
      const mat = (mesh as any).material as THREE.Material | THREE.Material[] | undefined;
      if (!mat) return;
      const mats = Array.isArray(mat) ? mat : [mat];
      const newMats: THREE.Material[] = [];
      let replaced = false;
      mats.forEach((m) => {
        const isPBR = m instanceof THREE.MeshStandardMaterial || m instanceof THREE.MeshPhysicalMaterial;
        if (!isPBR) {
          newMats.push(m);
          return;
        }
        const std = m as THREE.MeshStandardMaterial;
        if (!isStoneMesh(mesh, std)) {
          newMats.push(m);
          return;
        }
        // Refractive gem: transmission 1, IOR 2.417, emission 0 (guide: emission causes flat white).
        const physical = new THREE.MeshPhysicalMaterial({
          color: std.color.clone(),
          metalness: 0,
          roughness: 0.04,
          transmission: 1,
          ior: 2.417,
          thickness: 0.3,
          envMapIntensity: 1.2,
          transparent: true,
          opacity: 1,
          depthWrite: true,
          side: THREE.FrontSide,
        });
        (physical as any).emissive = new THREE.Color(0, 0, 0);
        (physical as any).emissiveIntensity = 0;
        (physical as any).userData = { __isStone: true };
        newMats.push(physical);
        replaced = true;
      });
      if (replaced) (mesh as any).material = newMats.length === 1 ? newMats[0] : newMats;
    });

    return root;
  }, [gltf.scene]);

  // Re-tint stone materials when stoneColor changes. Only set color; no emissive (emission = flat white).
  useEffect(() => {
    const color = new THREE.Color(stoneColor);
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      const mat = (mesh as any).material as THREE.Material | THREE.Material[] | undefined;
      if (!mat) return;
      const mats = Array.isArray(mat) ? mat : [mat];
      mats.forEach((m) => {
        const isOurStone = (m as any).userData?.__isStone === true;
        const isTransmissive = m instanceof THREE.MeshPhysicalMaterial && (m as THREE.MeshPhysicalMaterial).transmission === 1;
        if (!isOurStone && !isTransmissive) return;
        m.color.copy(color);
        // Keep emission at zero so stones stay refractive, not flat white.
        if ('emissive' in m) (m as any).emissive.set(0, 0, 0);
        if ('emissiveIntensity' in m) (m as any).emissiveIntensity = 0;
      });
    });
  }, [scene, stoneColor]);

  useFrame((_, delta) => {
    if (!group.current) return;
    // Smoothly lerp towards target rotation for pose changes.
    const r = group.current.rotation;
    const [tx, ty, tz] = targetRotation.current;
    r.x += (tx - r.x) * 0.08;
    r.y += (ty - r.y) * 0.08;
    r.z += (tz - r.z) * 0.08;
    // Subtle constant drift layered on top.
    r.y += delta * 0.1;
  });

  useEffect(() => {
    targetRotation.current = rotation;
  }, [rotation]);

  return <group ref={group}><primitive object={scene} /></group>;
}

function HeroRingCameraController({ pose }: { pose: HeroRingPose }) {
  const { camera } = useThree();
  const targetVec = useRef(new THREE.Vector3(...pose.target));
  const posVec = useRef(new THREE.Vector3(...pose.cameraPosition));

  useEffect(() => {
    posVec.current.set(...pose.cameraPosition);
    targetVec.current.set(...pose.target);
  }, [pose.cameraPosition, pose.target]);

  useFrame(() => {
    camera.position.lerp(posVec.current, 0.08);
    camera.lookAt(targetVec.current);
  });

  return null;
}

function HeroRingSceneInner({ pose, background, stoneColor }: HeroRingSceneProps) {
  const [hasModel, setHasModel] = React.useState(true);
  const bgColor = background || '#ffffff';

  return (
    <div
      className="w-full h-full min-h-[50vh] lg:min-h-screen relative"
    >
      {hasModel ? (
        <Canvas
          camera={{ position: pose.cameraPosition, fov: 38 }}
          shadows
          gl={{ antialias: true, alpha: true }}
          style={{ width: '100%', height: '100%', background: 'transparent' }}
        >
          {/* Background comes from the parent div; keep Canvas transparent */}
          <ambientLight intensity={0.8} />
          <directionalLight position={[6, 8, 4]} intensity={1.4} castShadow />
          <directionalLight position={[-4, 3, -2]} intensity={0.7} />
          <HeroRingCameraController pose={pose} />
          <React.Suspense
            fallback={
              <Html center>
                <div className="text-[10px] uppercase tracking-[0.25em] text-white/60">
                  Loading ring…
                </div>
              </Html>
            }
          >
            <RingModel rotation={pose.ringRotation} stoneColor={stoneColor} />
            {/* Soft ground shadow under ring */}
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, -0.4, 0]}
              receiveShadow
            >
              <planeGeometry args={[6, 6]} />
              <shadowMaterial opacity={0.35} />
            </mesh>
            {hasModel && <Environment preset="studio" />}
          </React.Suspense>
        </Canvas>
      ) : (
        <RingPlaceholder />
      )}
    </div>
  );
}

export default function HeroRingScene({ pose, background, stoneColor }: HeroRingSceneProps) {
  return (
    <HeroRingErrorBoundary>
      <HeroRingSceneInner pose={pose} background={background} stoneColor={stoneColor} />
    </HeroRingErrorBoundary>
  );
}

if (typeof window !== 'undefined' && HERO_RING_URL) {
  try {
    useGLTF.preload(HERO_RING_URL);
  } catch (e) {
    console.warn('[HeroRingScene] Preload failed:', e);
  }
}

// Error boundary for the entire scene
class HeroRingErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  state = { hasError: false };
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[HeroRingScene] Error boundary caught:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[50vh] lg:min-h-screen relative bg-[#050505] flex items-center justify-center">
          <div className="text-center px-6">
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/40 mb-2">
              3D ring unavailable
            </p>
            <p className="text-[9px] text-white/30">
              The homepage will continue to work normally.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

