import React, { Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          alt?: string;
          poster?: string;
          'camera-controls'?: boolean;
          'auto-rotate'?: boolean;
          'shadow-intensity'?: number;
          exposure?: number;
        },
        HTMLElement
      >;
    }
  }
}

/** Encode @ in URL path - Supabase paths with email (darren@domain.co.za) can break fetch */
function encodeModelUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.pathname.includes('@')) {
      u.pathname = u.pathname.replace(/@/g, '%40');
      return u.toString();
    }
    return url;
  } catch {
    return url;
  }
}

/** Center and scale object to fit in view (target size ~1.5 units) */
function normalizeModel(object: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(object);
  const center = new THREE.Vector3();
  box.getCenter(center);
  object.position.sub(center);
  const size = new THREE.Vector3();
  box.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z, 0.001);
  const scale = Math.min(Math.max(1.5 / maxDim, 0.01), 1000);
  object.scale.setScalar(scale);
}

// Metal presets: PBR materials for hyperrealistic jewelry
export const METAL_PRESETS: Record<string, { color: string; metalness: number; roughness: number }> = {
  'Yellow Gold': { color: '#D4AF37', metalness: 0.92, roughness: 0.18 },
  'White Gold': { color: '#F5F5DC', metalness: 0.9, roughness: 0.15 },
  'Rose Gold': { color: '#B76E79', metalness: 0.9, roughness: 0.2 },
  'Platinum': { color: '#E5E4E2', metalness: 0.95, roughness: 0.1 },
  'Silver': { color: '#C0C0C0', metalness: 0.9, roughness: 0.15 },
  'Black Rhodium': { color: '#2C2C2C', metalness: 0.9, roughness: 0.25 },
};

export const STONE_PRESETS: Record<string, { color: string; metalness: number; roughness: number }> = {
  'Diamond': { color: '#FFFFFF', metalness: 0.05, roughness: 0.02 },
  'Sapphire': { color: '#0F52BA', metalness: 0.05, roughness: 0.05 },
  'Emerald': { color: '#50C878', metalness: 0.05, roughness: 0.05 },
  'Ruby': { color: '#E0115F', metalness: 0.05, roughness: 0.05 },
  'Moissanite': { color: '#F5F5F5', metalness: 0.08, roughness: 0.03 },
};

function applyPresetToMesh(mesh: THREE.Mesh, preset: { color: string; metalness: number; roughness: number }) {
  const mat = mesh.material as THREE.MeshStandardMaterial;
  if (mat && 'metalness' in mat) {
    mat.color.set(preset.color);
    mat.metalness = preset.metalness;
    mat.roughness = preset.roughness;
    mat.needsUpdate = true;
  } else {
    mesh.material = new THREE.MeshStandardMaterial({
      color: preset.color,
      metalness: preset.metalness,
      roughness: preset.roughness,
    });
  }
}

function RotatingGroup({ children }: { children: React.ReactNode }) {
  const group = React.useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.3;
  });
  return <group ref={group}>{children}</group>;
}

/** Loads and displays OBJ - supports OBJ + MTL (MTL loads automatically if same path) */
function OBJModel({ url, metalPreset }: { url: string; metalPreset: string }) {
  const obj = useLoader(OBJLoader, url);
  const preset = METAL_PRESETS[metalPreset] || METAL_PRESETS['Yellow Gold'];

  const cloned = useMemo(() => {
    const c = obj.clone();
    c.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        applyPresetToMesh(child, preset);
      }
    });
    normalizeModel(c);
    return c;
  }, [obj, metalPreset]);

  return (
    <RotatingGroup>
      <primitive object={cloned} />
    </RotatingGroup>
  );
}

type ModelViewerMaterial = {
  pbrMetallicRoughness?: {
    setBaseColorFactor?: (c: number[] | string) => void;
    setMetallicFactor?: (v: number) => void;
    setRoughnessFactor?: (v: number) => void;
    metallicFactor?: number;
  };
};

/** Apply metal/stone presets to model-viewer materials at runtime (no re-export needed) */
function applyModelViewerMaterials(
  modelViewer: HTMLElement & { model?: { materials?: ModelViewerMaterial[] } },
  metalPreset: string,
  stonePreset: string
) {
  const model = modelViewer?.model;
  if (!model?.materials?.length) return;
  const metal = METAL_PRESETS[metalPreset] || METAL_PRESETS['Yellow Gold'];
  const stone = STONE_PRESETS[stonePreset] || STONE_PRESETS['Diamond'];
  (model.materials as ModelViewerMaterial[]).forEach((mat, idx) => {
    const pbr = mat.pbrMetallicRoughness;
    if (!pbr?.setBaseColorFactor) return;
    const isMetal = idx === 0 || (pbr.metallicFactor ?? 0) > 0.5;
    const preset = isMetal ? metal : stone;
    pbr.setBaseColorFactor(preset.color);
    pbr.setMetallicFactor?.(preset.metalness);
    pbr.setRoughnessFactor?.(preset.roughness);
  });
}

/** GLB/GLTF: use model-viewer with runtime material application */
function GLBModelViewer({ url, poster, metalPreset, stonePreset }: { url: string; poster?: string; metalPreset: string; stonePreset: string }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const applyMaterials = React.useCallback(() => {
    const el = containerRef.current?.querySelector('model-viewer') as HTMLElement & { model?: unknown } | null;
    if (el) applyModelViewerMaterials(el, metalPreset, stonePreset);
  }, [metalPreset, stonePreset]);
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const el = container.querySelector('model-viewer');
    if (!el) return;
    const onLoad = () => { try { applyMaterials(); } catch (e) { console.warn('[ProductModelViewer] applyMaterials:', e); } };
    el.addEventListener('load', onLoad);
    onLoad();
    return () => el.removeEventListener('load', onLoad);
  }, [applyMaterials, url]);
  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '200px' }}>
      <model-viewer
        src={url}
        alt="3D model"
        poster={poster}
        camera-controls
        auto-rotate
        shadow-intensity={0.5}
        shadow-softness={0.4}
        exposure={1.5}
        style={{ width: '100%', height: '100%', minHeight: '200px' }}
      />
    </div>
  );
}

interface ProductModelViewerProps {
  src: string;
  alt?: string;
  className?: string;
  poster?: string;
  cameraControls?: boolean;
  autoRotate?: boolean;
  metalPreset?: string;
  stonePreset?: string;
  showConfigurator?: boolean;
}

function ModelErrorFallback({ poster, message, modelUrl }: { poster?: string; message: string; modelUrl?: string }) {
  return (
    <div className="w-full h-full min-h-[200px] flex flex-col items-center justify-center bg-black/40 gap-2 p-4">
      {poster && <img src={poster} alt="" className="max-h-24 object-contain opacity-50" />}
      <p className="text-[10px] uppercase opacity-70 text-center px-4">{message}</p>
      {modelUrl && (
        <a href={modelUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] text-emerald-400 hover:underline mt-1">
          Open model URL in new tab
        </a>
      )}
    </div>
  );
}

class ModelErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError = () => ({ hasError: true });
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

function ModelContent({ src, isObj, metalPreset }: {
  src: string; isObj: boolean; metalPreset: string;
}) {
  const loadUrl = encodeModelUrl(src);
  return isObj ? (
    <OBJModel url={loadUrl} metalPreset={metalPreset} />
  ) : null;
}

export default function ProductModelViewer({
  src,
  alt = '3D model',
  className = '',
  poster,
  cameraControls = true,
  autoRotate = true,
  metalPreset: initialMetal = 'Yellow Gold',
  stonePreset: initialStone = 'Diamond',
  showConfigurator = true,
}: ProductModelViewerProps) {
  const [metalPreset, setMetalPreset] = React.useState(initialMetal);
  const [stonePreset, setStonePreset] = React.useState(initialStone);

  const pathPart = src.split('?')[0].toLowerCase();
  const isLocalPath = src.startsWith('file://') || /^[a-z]:[\\/]|^\/[a-z]|^\\\\/i.test(src);
  const isObj = pathPart.endsWith('.obj');
  const isGlb = pathPart.endsWith('.glb') || pathPart.endsWith('.gltf');
  const isSupported = isObj || isGlb;

  if (isLocalPath) {
    return (
      <div className={`w-full h-full min-h-[200px] flex flex-col items-center justify-center bg-black/20 gap-2 p-4 ${className}`}>
        <p className="text-[10px] uppercase opacity-70 text-center">Local file paths don&apos;t work in web apps.</p>
        <p className="text-[9px] opacity-60 text-center">Use the <strong>Upload</strong> button in Jeweler Portal → Catalog to upload your file. That creates a web URL.</p>
      </div>
    );
  }

  if (!isSupported) {
    return (
      <div className={`w-full h-full min-h-[200px] flex items-center justify-center bg-black/20 ${className}`}>
        <p className="text-[10px] uppercase opacity-60">Use OBJ or GLB format</p>
      </div>
    );
  }

  const loadUrl = encodeModelUrl(src);

  return (
    <div className={`w-full h-full min-h-[200px] flex flex-col ${className}`}>
      <div className="flex-1 min-h-[200px] relative">
        {poster && (
          <img src={poster} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none" aria-hidden />
        )}
        {isGlb ? (
          <GLBModelViewer url={loadUrl} poster={poster} metalPreset={metalPreset} stonePreset={stonePreset} />
        ) : (
          <ModelErrorBoundary
            fallback={
              <ModelErrorFallback
                poster={poster}
                modelUrl={src}
                message="Could not load 3D model. Open the URL below to verify it downloads."
              />
            }
          >
            <Canvas
              camera={{ position: [0, 0, 2.5], fov: 45 }}
              gl={{ antialias: true, alpha: false }}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
              frameloop="always"
            >
              <color attach="background" args={['#1a1a1a']} />
              <ambientLight intensity={0.8} />
              <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
              <directionalLight position={[-3, 2, 2]} intensity={0.8} />
              <pointLight position={[0, 2, 2]} intensity={0.8} />
              {cameraControls && <OrbitControls enableZoom enablePan />}
              <Suspense
                fallback={
                  <mesh>
                    <boxGeometry args={[0.1, 0.1, 0.1]} />
                    <meshBasicMaterial color="#333" transparent opacity={0.5} />
                  </mesh>
                }
              >
                <ModelContent src={src} isObj={isObj} metalPreset={metalPreset} />
              </Suspense>
            </Canvas>
          </ModelErrorBoundary>
        )}
      </div>
      {showConfigurator && (isObj || isGlb) && (
        <div className="flex flex-wrap gap-4 p-3 bg-black/30 border-t border-white/5 text-[9px] uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <span className="opacity-60">Metal</span>
            <select
              value={metalPreset}
              onChange={(e) => setMetalPreset(e.target.value)}
              className="bg-black/50 border border-white/10 px-2 py-1 focus:outline-none focus:border-white/30"
            >
              {Object.keys(METAL_PRESETS).map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
          {isGlb && (
            <div className="flex items-center gap-2">
              <span className="opacity-60">Stone</span>
              <select
                value={stonePreset}
                onChange={(e) => setStonePreset(e.target.value)}
                className="bg-black/50 border border-white/10 px-2 py-1 focus:outline-none focus:border-white/30"
              >
                {Object.keys(STONE_PRESETS).map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
