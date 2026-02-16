import { Suspense, useRef, useMemo, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  ContactShadows, 
  Html,
  Float,
  Lightformer,
  AccumulativeShadows,
  RandomizedLight
} from '@react-three/drei';
import * as THREE from 'three';
import { MugVariant } from './types';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface MugPreview3DProps {
  canvasTexture: string | null;
  variant: MugVariant;
  mugColor?: string;
}

// Camera controller
const CameraController = forwardRef<
  { reset: () => void; zoomIn: () => void; zoomOut: () => void },
  { controlsRef: React.RefObject<any> }
>(({ controlsRef }, ref) => {
  const { camera } = useThree();
  useImperativeHandle(ref, () => ({
    reset: () => { camera.position.set(0, 0.5, 6); camera.lookAt(0, 0, 0); controlsRef.current?.reset(); },
    zoomIn: () => { const d = new THREE.Vector3(); camera.getWorldDirection(d); camera.position.addScaledVector(d, 0.5); },
    zoomOut: () => { const d = new THREE.Vector3(); camera.getWorldDirection(d); camera.position.addScaledVector(d, -0.5); },
  }));
  return null;
});
CameraController.displayName = 'CameraController';

const LoadingSpinner = () => (
  <Html center>
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-accent/20 rounded-full" />
        <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-accent rounded-full animate-spin" />
      </div>
      <span className="text-sm font-medium text-muted-foreground">Loading 3D Preview...</span>
    </div>
  </Html>
);

// ─── Steam particles with wispy behavior ───
const SteamParticles = ({ mugHeight, topRadius }: { mugHeight: number; topRadius: number }) => {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 80;

  const { positions, seeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const s = new Float32Array(count * 4); // seed data: phase, speed, drift, life
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * (topRadius - 0.25);
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = mugHeight * 0.45;
      pos[i * 3 + 2] = Math.sin(angle) * r;
      s[i * 4] = Math.random() * Math.PI * 2; // phase
      s[i * 4 + 1] = 0.003 + Math.random() * 0.007; // rise speed
      s[i * 4 + 2] = 0.3 + Math.random() * 0.7; // drift intensity
      s[i * 4 + 3] = Math.random(); // life offset
    }
    return { positions: pos, seeds: s };
  }, [count, topRadius, mugHeight]);

  const sizesAttr = useMemo(() => {
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) sizes[i] = 0.03 + Math.random() * 0.05;
    return sizes;
  }, [count]);

  useFrame((state) => {
    if (!particlesRef.current) return;
    const posAttr = particlesRef.current.geometry.attributes.position;
    const arr = posAttr.array as Float32Array;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const phase = seeds[i * 4];
      const speed = seeds[i * 4 + 1];
      const drift = seeds[i * 4 + 2];

      arr[i * 3] += Math.sin(t * 0.8 + phase) * 0.0015 * drift;
      arr[i * 3 + 1] += speed;
      arr[i * 3 + 2] += Math.cos(t * 0.6 + phase * 1.3) * 0.0012 * drift;

      if (arr[i * 3 + 1] > mugHeight * 0.45 + 2.8) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * (topRadius - 0.25);
        arr[i * 3] = Math.cos(angle) * r;
        arr[i * 3 + 1] = mugHeight * 0.45;
        arr[i * 3 + 2] = Math.sin(angle) * r;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
        <bufferAttribute attach="attributes-size" args={[sizesAttr, 1]} count={count} />
      </bufferGeometry>
      <pointsMaterial
        color="#ffffff"
        size={0.07}
        transparent
        opacity={0.1}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
};

// ─── Print wrap ───
interface PrintWrapProps {
  textureUrl: string;
  variant: MugVariant;
  mugHeight: number;
  bottomRadius: number;
  topRadius: number;
}

const PrintWrap = ({ textureUrl, variant, mugHeight, bottomRadius, topRadius }: PrintWrapProps) => {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!textureUrl) { setTexture(null); return; }
    const img = new Image();
    img.onload = () => {
      const tex = new THREE.Texture(img);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      tex.flipY = false;
      tex.needsUpdate = true;
      setTexture(prev => { if (prev) prev.dispose(); return tex; });
    };
    img.src = textureUrl;
  }, [textureUrl]);

  const geometry = useMemo(() => {
    const handleGapAngle = Math.PI * 0.5;
    const printArcAngle = Math.PI * 2 - handleGapAngle;
    const startAngle = Math.PI + handleGapAngle / 2 + 1.5;
    const actualPrintHeight = mugHeight * 0.7;
    const radiusOffset = 0.038;
    const geo = new THREE.CylinderGeometry(topRadius + radiusOffset, bottomRadius + radiusOffset, actualPrintHeight, 128, 1, true, startAngle, printArcAngle);
    const uvs = geo.attributes.uv;
    for (let i = 0; i < uvs.count; i++) {
      uvs.setXY(i, uvs.getX(i), 1 - uvs.getY(i));
    }
    uvs.needsUpdate = true;
    return geo;
  }, [mugHeight, bottomRadius, topRadius]);

  if (!texture) return null;
  return (
    <mesh geometry={geometry} position={[0, 0.04, 0]}>
      <meshStandardMaterial map={texture} side={THREE.FrontSide} toneMapped={false} roughness={0.3} metalness={0.0} polygonOffset polygonOffsetFactor={-5} polygonOffsetUnits={-5} />
    </mesh>
  );
};

// ─── Procedural bump map for ceramic micro-texture ───
const useCeramicBumpMap = () => {
  return useMemo(() => {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Multi-octave noise for realistic ceramic grain
    const imageData = ctx.createImageData(size, size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        const fine = (Math.random() - 0.5) * 8;
        const coarse = Math.sin(x * 0.05) * Math.cos(y * 0.05) * 3;
        const v = 128 + fine + coarse;
        imageData.data[i] = v;
        imageData.data[i + 1] = v;
        imageData.data[i + 2] = v;
        imageData.data[i + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(6, 6);
    return tex;
  }, []);
};

// ─── The mug ───
const RealisticMug = ({ textureUrl, color, variant }: { textureUrl: string | null; color: string; variant: MugVariant }) => {
  const groupRef = useRef<THREE.Group>(null);
  const bumpMap = useCeramicBumpMap();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.08;
    }
  });

  const isLarge = variant.id === '15oz';
  const mugHeight = isLarge ? 2.6 : 2.3;
  const bottomRadius = isLarge ? 0.85 : 0.75;
  const topRadius = isLarge ? 1.0 : 0.88;
  const wallThickness = 0.055;

  // Outer body — smooth tapered cylinder with foot ring and rolled rim
  const mugProfile = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    // Flat bottom disc
    pts.push(new THREE.Vector2(0, 0));
    pts.push(new THREE.Vector2(bottomRadius * 0.82, 0));
    // Bottom edge bevel
    pts.push(new THREE.Vector2(bottomRadius * 0.90, 0.015));
    pts.push(new THREE.Vector2(bottomRadius * 0.96, 0.04));
    pts.push(new THREE.Vector2(bottomRadius, 0.07));
    // Foot ring indent
    pts.push(new THREE.Vector2(bottomRadius - 0.008, 0.10));
    pts.push(new THREE.Vector2(bottomRadius + 0.003, 0.16));

    // Main body — 64 subdivision points for ultra smooth taper with subtle belly
    for (let i = 0; i <= 64; i++) {
      const t = i / 64;
      const belly = Math.sin(t * Math.PI) * 0.018;
      const taper = bottomRadius + (topRadius - bottomRadius) * Math.pow(t, 0.92);
      pts.push(new THREE.Vector2(taper + belly, 0.16 + t * (mugHeight - 0.16)));
    }

    // Rolled rim — smooth lip
    const rimBase = mugHeight + 0.015;
    pts.push(new THREE.Vector2(topRadius + 0.04, rimBase));
    pts.push(new THREE.Vector2(topRadius + 0.055, rimBase + 0.025));
    pts.push(new THREE.Vector2(topRadius + 0.05, rimBase + 0.05));
    pts.push(new THREE.Vector2(topRadius + 0.035, rimBase + 0.065));
    pts.push(new THREE.Vector2(topRadius + 0.01, rimBase + 0.06));
    pts.push(new THREE.Vector2(topRadius - 0.015, rimBase + 0.04));
    pts.push(new THREE.Vector2(topRadius - 0.025, rimBase + 0.015));
    return pts;
  }, [bottomRadius, topRadius, mugHeight]);

  // Inner wall — concave interior
  const innerProfile = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    const ib = bottomRadius - wallThickness;
    const it = topRadius - wallThickness;
    const rimTop = mugHeight + 0.065;
    // Inner bottom — slight concave
    pts.push(new THREE.Vector2(0, 0.12));
    pts.push(new THREE.Vector2(ib * 0.3, 0.115));
    pts.push(new THREE.Vector2(ib * 0.7, 0.12));
    pts.push(new THREE.Vector2(ib, 0.13));
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      pts.push(new THREE.Vector2(ib + (it - ib) * t, 0.13 + t * (rimTop - 0.16)));
    }
    pts.push(new THREE.Vector2(topRadius - 0.025, rimTop + 0.015));
    return pts;
  }, [bottomRadius, topRadius, mugHeight, wallThickness]);

  // Handle cross-section — D-shape
  const handleShape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, -0.075);
    s.bezierCurveTo(0.048, -0.075, 0.075, -0.04, 0.075, 0);
    s.bezierCurveTo(0.075, 0.04, 0.048, 0.075, 0, 0.075);
    s.bezierCurveTo(-0.022, 0.075, -0.04, 0.04, -0.04, 0);
    s.bezierCurveTo(-0.04, -0.04, -0.022, -0.075, 0, -0.075);
    return s;
  }, []);

  // Handle path — ergonomic curve
  const handleCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-(topRadius + 0.005), mugHeight * 0.80, 0),
      new THREE.Vector3(-(topRadius + 0.28), mugHeight * 0.72, 0),
      new THREE.Vector3(-(topRadius + 0.40), mugHeight * 0.50, 0),
      new THREE.Vector3(-(topRadius + 0.38), mugHeight * 0.28, 0),
      new THREE.Vector3(-(topRadius + 0.22), mugHeight * 0.12, 0),
      new THREE.Vector3(-(topRadius + 0.005), mugHeight * 0.07, 0),
    ]);
  }, [topRadius, mugHeight]);

  const ceramicColor = new THREE.Color(color);
  const sheenCol = ceramicColor.clone().lerp(new THREE.Color('#ffffff'), 0.65);

  const ceramicMat = useMemo(() => ({
    color,
    roughness: 0.035,
    metalness: 0.0,
    envMapIntensity: 2.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.012,
    bumpMap,
    bumpScale: 0.0015,
    sheen: 0.6,
    sheenRoughness: 0.12,
    sheenColor: sheenCol,
    reflectivity: 0.95,
    ior: 1.52,
  }), [color, bumpMap, sheenCol]);

  return (
    <Float speed={0.25} rotationIntensity={0.005} floatIntensity={0.025}>
      <group ref={groupRef} scale={0.55}>
        {/* Outer body */}
        <mesh position={[0, -mugHeight / 2, 0]} castShadow receiveShadow>
          <latheGeometry args={[mugProfile, 160]} />
          <meshPhysicalMaterial {...ceramicMat} />
        </mesh>

        {/* Inner wall — glazed white */}
        <mesh position={[0, -mugHeight / 2, 0]}>
          <latheGeometry args={[innerProfile, 128]} />
          <meshPhysicalMaterial
            color="#f8f4ee"
            roughness={0.06}
            clearcoat={1.0}
            clearcoatRoughness={0.025}
            envMapIntensity={1.8}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Coffee surface */}
        <CoffeeSurface mugHeight={mugHeight} topRadius={topRadius} />

        {/* Handle */}
        <mesh castShadow position={[0, -mugHeight / 2, 0]}>
          <extrudeGeometry args={[handleShape, { steps: 100, extrudePath: handleCurve }]} />
          <meshPhysicalMaterial {...ceramicMat} />
        </mesh>

        {/* Bottom unglazed ring */}
        <mesh position={[0, -mugHeight / 2 - 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[bottomRadius * 0.35, bottomRadius * 0.55, 64]} />
          <meshPhysicalMaterial color="#e8ddd0" roughness={0.45} clearcoat={0.15} />
        </mesh>

        {/* Rim highlight ring */}
        <mesh position={[0, mugHeight / 2 + 0.065, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[topRadius - 0.025, topRadius + 0.035, 160]} />
          <meshPhysicalMaterial
            color={color}
            roughness={0.03}
            clearcoat={1.0}
            clearcoatRoughness={0.008}
            envMapIntensity={2.8}
          />
        </mesh>

        {/* Steam */}
        <SteamParticles mugHeight={mugHeight} topRadius={topRadius} />

        {/* Print */}
        {textureUrl && (
          <PrintWrap textureUrl={textureUrl} variant={variant} mugHeight={mugHeight} bottomRadius={bottomRadius} topRadius={topRadius} />
        )}
      </group>
    </Float>
  );
};

// Coffee with animated subtle ripple & Fresnel-like sheen
const CoffeeSurface = ({ mugHeight, topRadius }: { mugHeight: number; topRadius: number }) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (ref.current) ref.current.position.y = mugHeight * 0.4 + Math.sin(s.clock.elapsedTime * 0.4) * 0.004;
  });
  return (
    <mesh ref={ref} position={[0, mugHeight * 0.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[topRadius - 0.11, 64]} />
      <meshPhysicalMaterial
        color="#321a0a"
        roughness={0.05}
        metalness={0.08}
        clearcoat={1.0}
        clearcoatRoughness={0.01}
        transmission={0.03}
        thickness={1.0}
        ior={1.33}
      />
    </mesh>
  );
};

// ─── Reflective ground disc ───
const GroundDisc = () => (
  <mesh position={[0, -2.32, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
    <circleGeometry args={[5, 128]} />
    <meshPhysicalMaterial
      color="#faf8f5"
      roughness={0.08}
      metalness={0.0}
      clearcoat={1.0}
      clearcoatRoughness={0.04}
      envMapIntensity={0.8}
      transparent
      opacity={0.7}
      reflectivity={1.0}
    />
  </mesh>
);

// ─── Scene ───
interface SceneProps extends MugPreview3DProps {
  cameraRef: React.RefObject<{ reset: () => void; zoomIn: () => void; zoomOut: () => void }>;
  controlsRef: React.RefObject<any>;
}

const Scene = ({ canvasTexture, variant, mugColor, cameraRef, controlsRef }: SceneProps) => (
  <>
    {/* Key light - warm, strong */}
    <spotLight position={[5, 10, 6]} angle={0.15} penumbra={1} intensity={3.0} castShadow shadow-mapSize={[4096, 4096]} shadow-bias={-0.00002} color="#fff8f0" />
    {/* Fill light - cooler, softer */}
    <spotLight position={[-6, 5, -3]} angle={0.4} penumbra={1} intensity={0.8} color="#dde8ff" />
    {/* Rim/back light */}
    <spotLight position={[-3, 8, 7]} angle={0.2} penumbra={0.9} intensity={1.2} color="#ffe8cc" />
    {/* Accent kicker */}
    <pointLight position={[4, 0, -5]} intensity={0.35} color="#ffd0a8" />
    <pointLight position={[-2, -1, 4]} intensity={0.2} color="#e8f0ff" />
    {/* Subtle ambient fill */}
    <ambientLight intensity={0.15} color="#f5f0ea" />

    <CameraController ref={cameraRef} controlsRef={controlsRef} />

    <Suspense fallback={<LoadingSpinner />}>
      <RealisticMug textureUrl={canvasTexture} color={mugColor || '#ffffff'} variant={variant} />
      <GroundDisc />
      <ContactShadows position={[0, -2.3, 0]} opacity={0.6} scale={14} blur={2.0} far={6} color="#0a0806" frames={1} />
      <Environment resolution={1024} environmentIntensity={1.0}>
        {/* Large soft overhead panel */}
        <Lightformer form="rect" intensity={2.0} position={[0, 8, 0]} scale={[12, 4, 1]} color="#ffffff" />
        {/* Warm key side */}
        <Lightformer form="rect" intensity={1.2} position={[6, 3, 2]} scale={[4, 8, 1]} color="#fff0dd" rotation-y={-Math.PI / 3} />
        {/* Cool fill side */}
        <Lightformer form="rect" intensity={0.8} position={[-6, 3, -1]} scale={[4, 8, 1]} color="#dde5ff" rotation-y={Math.PI / 4} />
        {/* Back rim panel */}
        <Lightformer form="rect" intensity={0.6} position={[0, 4, -8]} scale={[10, 3, 1]} color="#ffe8d0" />
        {/* Small specular highlights */}
        <Lightformer form="ring" intensity={3.0} position={[2, 5, 4]} scale={1.5} color="#ffffff" />
        <Lightformer form="ring" intensity={1.5} position={[-3, 6, 3]} scale={1} color="#f0f4ff" />
        {/* Ground bounce */}
        <Lightformer form="rect" intensity={0.3} position={[0, -5, 0]} scale={[15, 15, 1]} color="#f5ede5" rotation-x={Math.PI / 2} />
      </Environment>
    </Suspense>

    <OrbitControls
      ref={controlsRef}
      enableZoom enablePan={false}
      minDistance={3} maxDistance={12}
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 1.6}
      autoRotate={false}
      enableDamping dampingFactor={0.04}
      makeDefault
    />
  </>
);

export function MugPreview3D({ canvasTexture, variant, mugColor = '#ffffff' }: MugPreview3DProps) {
  const cameraRef = useRef<{ reset: () => void; zoomIn: () => void; zoomOut: () => void }>(null);
  const controlsRef = useRef<any>(null);

  return (
    <div className="relative w-full h-full min-h-[500px] lg:min-h-[600px] rounded-2xl overflow-hidden bg-gradient-to-br from-muted/30 via-background to-muted/20">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
        <Button variant="secondary" size="icon" className="h-8 w-8 bg-background/90 backdrop-blur shadow-sm" onClick={() => cameraRef.current?.zoomIn()}><ZoomIn className="h-4 w-4" /></Button>
        <Button variant="secondary" size="icon" className="h-8 w-8 bg-background/90 backdrop-blur shadow-sm" onClick={() => cameraRef.current?.zoomOut()}><ZoomOut className="h-4 w-4" /></Button>
        <Button variant="secondary" size="icon" className="h-8 w-8 bg-background/90 backdrop-blur shadow-sm" onClick={() => cameraRef.current?.reset()}><RotateCcw className="h-4 w-4" /></Button>
      </div>
      <Canvas
        camera={{ position: [0, 0.5, 6], fov: 36 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.25 }}
        shadows="soft"
      >
        <Scene canvasTexture={canvasTexture} variant={variant} mugColor={mugColor} cameraRef={cameraRef} controlsRef={controlsRef} />
      </Canvas>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-muted-foreground bg-background/80 backdrop-blur px-3 py-1.5 rounded-full">
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
}
