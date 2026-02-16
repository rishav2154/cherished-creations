import { Suspense, useRef, useMemo, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  ContactShadows, 
  Html,
  Lightformer
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
    reset: () => { camera.position.set(2.5, 1.8, 4.5); camera.lookAt(0, 0.3, 0); controlsRef.current?.reset(); },
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

// ─── Gentle steam wisps ───
const SteamParticles = ({ mugHeight, topRadius }: { mugHeight: number; topRadius: number }) => {
  const ref = useRef<THREE.Points>(null);
  const count = 50;
  const { positions, seeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const s = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * (topRadius * 0.5);
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = mugHeight * 0.5 + Math.random() * 1.0;
      pos[i * 3 + 2] = Math.sin(a) * r;
      s[i * 3] = Math.random() * Math.PI * 2;
      s[i * 3 + 1] = 0.002 + Math.random() * 0.004;
      s[i * 3 + 2] = 0.2 + Math.random() * 0.6;
    }
    return { positions: pos, seeds: s };
  }, [count, topRadius, mugHeight]);

  useFrame((state) => {
    if (!ref.current) return;
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      arr[i * 3] += Math.sin(t * 0.5 + seeds[i * 3]) * 0.001 * seeds[i * 3 + 2];
      arr[i * 3 + 1] += seeds[i * 3 + 1];
      arr[i * 3 + 2] += Math.cos(t * 0.4 + seeds[i * 3] * 1.3) * 0.0008 * seeds[i * 3 + 2];
      if (arr[i * 3 + 1] > mugHeight * 0.5 + 2.0) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() * (topRadius * 0.5);
        arr[i * 3] = Math.cos(a) * r;
        arr[i * 3 + 1] = mugHeight * 0.5;
        arr[i * 3 + 2] = Math.sin(a) * r;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.05} transparent opacity={0.08} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
    </points>
  );
};

// ─── Print wrap ───
const PrintWrap = ({ textureUrl, mugHeight, bottomRadius, topRadius }: {
  textureUrl: string; variant: MugVariant; mugHeight: number; bottomRadius: number; topRadius: number;
}) => {
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
    const gap = Math.PI * 0.5;
    const arc = Math.PI * 2 - gap;
    const start = Math.PI + gap / 2 + 1.5;
    const h = mugHeight * 0.7;
    const off = 0.04;
    const geo = new THREE.CylinderGeometry(topRadius + off, bottomRadius + off, h, 128, 1, true, start, arc);
    const uvs = geo.attributes.uv;
    for (let i = 0; i < uvs.count; i++) uvs.setXY(i, uvs.getX(i), 1 - uvs.getY(i));
    uvs.needsUpdate = true;
    return geo;
  }, [mugHeight, bottomRadius, topRadius]);

  if (!texture) return null;
  return (
    <mesh geometry={geometry} position={[0, 0.04, 0]}>
      <meshStandardMaterial map={texture} side={THREE.FrontSide} toneMapped={false} roughness={0.28} metalness={0.0} polygonOffset polygonOffsetFactor={-5} polygonOffsetUnits={-5} />
    </mesh>
  );
};

// ─── The Mug ───
const RealisticMug = ({ textureUrl, color, variant }: { textureUrl: string | null; color: string; variant: MugVariant }) => {
  const groupRef = useRef<THREE.Group>(null);

  // Slow gentle rotation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.08;
    }
  });

  const isLarge = variant.id === '15oz';
  const H = isLarge ? 2.6 : 2.3;    // height
  const Rb = isLarge ? 0.82 : 0.72;  // bottom radius
  const Rt = isLarge ? 0.95 : 0.84;  // top radius

  // Realistic mug silhouette - based on actual ceramic mug proportions
  const outerProfile = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    // Flat bottom
    pts.push(new THREE.Vector2(0, 0));
    pts.push(new THREE.Vector2(Rb * 0.88, 0));
    // Bottom edge with foot ring
    pts.push(new THREE.Vector2(Rb * 0.94, 0.015));
    pts.push(new THREE.Vector2(Rb, 0.06));
    // Foot ring indent  
    pts.push(new THREE.Vector2(Rb - 0.008, 0.10));
    pts.push(new THREE.Vector2(Rb + 0.003, 0.16));
    
    // Main body - very subtle taper with micro belly
    const segments = 60;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      // Subtle outward belly in lower third
      const belly = Math.sin(t * Math.PI) * 0.015;
      // Slight concave near top (like real mugs)
      const concave = t > 0.7 ? Math.sin((t - 0.7) / 0.3 * Math.PI) * -0.008 : 0;
      const r = Rb + (Rt - Rb) * t + belly + concave;
      pts.push(new THREE.Vector2(r, 0.16 + t * (H - 0.16)));
    }
    
    // Rolled rim - key detail for realism
    pts.push(new THREE.Vector2(Rt + 0.035, H + 0.01));
    pts.push(new THREE.Vector2(Rt + 0.048, H + 0.035));
    pts.push(new THREE.Vector2(Rt + 0.045, H + 0.055));
    pts.push(new THREE.Vector2(Rt + 0.025, H + 0.065));
    pts.push(new THREE.Vector2(Rt + 0.005, H + 0.06));
    pts.push(new THREE.Vector2(Rt - 0.015, H + 0.04));
    return pts;
  }, [Rb, Rt, H]);

  // Inner cavity
  const innerProfile = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    const w = 0.06; // wall thickness
    const ib = Rb - w;
    const it = Rt - w;
    // Inner bottom (flat with slight radius)
    pts.push(new THREE.Vector2(0, 0.12));
    pts.push(new THREE.Vector2(ib * 0.3, 0.12));
    pts.push(new THREE.Vector2(ib, 0.14));
    // Inner wall
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      pts.push(new THREE.Vector2(ib + (it - ib) * t, 0.14 + t * (H + 0.03)));
    }
    // Connect to rim
    pts.push(new THREE.Vector2(Rt - 0.015, H + 0.04));
    return pts;
  }, [Rb, Rt, H]);

  // Handle - realistic C-shape path
  const handleCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-(Rt + 0.005), H * 0.72, 0),
      new THREE.Vector3(-(Rt + 0.18), H * 0.72, 0),
      new THREE.Vector3(-(Rt + 0.32), H * 0.60, 0),
      new THREE.Vector3(-(Rt + 0.38), H * 0.45, 0),
      new THREE.Vector3(-(Rt + 0.34), H * 0.28, 0),
      new THREE.Vector3(-(Rt + 0.18), H * 0.15, 0),
      new THREE.Vector3(-(Rt + 0.005), H * 0.13, 0),
    ], false, 'catmullrom', 0.5);
  }, [Rt, H]);

  // Handle cross-section (slightly flat D-shape like real handles)
  const handleShape = useMemo(() => {
    const s = new THREE.Shape();
    const w = 0.065, h = 0.09;
    s.moveTo(0, -h);
    s.bezierCurveTo(w, -h, w * 1.3, -h * 0.4, w * 1.3, 0);
    s.bezierCurveTo(w * 1.3, h * 0.4, w, h, 0, h);
    s.bezierCurveTo(-w * 0.5, h, -w * 0.6, h * 0.3, -w * 0.6, 0);
    s.bezierCurveTo(-w * 0.6, -h * 0.3, -w * 0.5, -h, 0, -h);
    return s;
  }, []);

  // Ceramic material - the key to realism
  const isWhite = color === '#ffffff' || color === '#fff';
  const ceramicColor = isWhite ? '#faf8f5' : color; // Real white ceramic is slightly warm

  return (
    <group ref={groupRef} scale={1.15} position={[0, -1.1, 0]}>
      {/* Outer body */}
      <mesh castShadow receiveShadow>
        <latheGeometry args={[outerProfile, 128]} />
        <meshPhysicalMaterial
          color={ceramicColor}
          roughness={0.08}
          metalness={0.0}
          clearcoat={0.85}
          clearcoatRoughness={0.04}
          envMapIntensity={1.6}
          sheen={0.15}
          sheenRoughness={0.25}
          sheenColor={new THREE.Color(ceramicColor).lerp(new THREE.Color('#ffffff'), 0.6)}
        />
      </mesh>

      {/* Inner wall - slightly different glaze tone */}
      <mesh>
        <latheGeometry args={[innerProfile, 96]} />
        <meshPhysicalMaterial
          color={isWhite ? '#f0ece4' : new THREE.Color(ceramicColor).lerp(new THREE.Color('#f0ece4'), 0.3)}
          roughness={0.15}
          clearcoat={0.6}
          clearcoatRoughness={0.1}
          side={THREE.BackSide}
          envMapIntensity={0.8}
        />
      </mesh>

      {/* Coffee liquid */}
      <CoffeeSurface H={H} Rt={Rt} />

      {/* Handle */}
      <mesh castShadow>
        <extrudeGeometry args={[handleShape, { steps: 80, extrudePath: handleCurve }]} />
        <meshPhysicalMaterial
          color={ceramicColor}
          roughness={0.08}
          metalness={0.0}
          clearcoat={0.85}
          clearcoatRoughness={0.04}
          envMapIntensity={1.6}
        />
      </mesh>

      {/* Bottom ring stamp */}
      <mesh position={[0, -0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[Rb * 0.3, Rb * 0.55, 64]} />
        <meshPhysicalMaterial color={ceramicColor} roughness={0.35} clearcoat={0.3} />
      </mesh>

      {/* Subtle steam */}
      <SteamParticles mugHeight={H} topRadius={Rt} />

      {/* Print wrap */}
      {textureUrl && (
        <PrintWrap textureUrl={textureUrl} variant={variant} mugHeight={H} bottomRadius={Rb} topRadius={Rt} />
      )}
    </group>
  );
};

// Coffee with glossy wet look
const CoffeeSurface = ({ H, Rt }: { H: number; Rt: number }) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (ref.current) ref.current.position.y = H * 0.85 + Math.sin(s.clock.elapsedTime * 0.3) * 0.003;
  });
  return (
    <mesh ref={ref} position={[0, H * 0.85, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[Rt - 0.1, 64]} />
      <meshPhysicalMaterial
        color="#2c150a"
        roughness={0.02}
        metalness={0.1}
        clearcoat={1.0}
        clearcoatRoughness={0.005}
        envMapIntensity={1.2}
      />
    </mesh>
  );
};

// ─── Scene ───
interface SceneProps extends MugPreview3DProps {
  cameraRef: React.RefObject<{ reset: () => void; zoomIn: () => void; zoomOut: () => void }>;
  controlsRef: React.RefObject<any>;
}

const Scene = ({ canvasTexture, variant, mugColor, cameraRef, controlsRef }: SceneProps) => (
  <>
    {/* Natural studio lighting - warm key, cool fill */}
    <directionalLight
      position={[4, 8, 6]}
      intensity={1.8}
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-bias={-0.0001}
      color="#fff5eb"
    />
    <directionalLight position={[-3, 5, -2]} intensity={0.4} color="#e4ecff" />
    <spotLight position={[-2, 6, 5]} angle={0.2} penumbra={1} intensity={0.7} color="#ffe8d0" />
    <ambientLight intensity={0.35} color="#f5f0ea" />
    {/* Under-fill to prevent pitch-black bottom */}
    <hemisphereLight args={['#ffeedd', '#8899aa', 0.25]} />

    <CameraController ref={cameraRef} controlsRef={controlsRef} />

    <Suspense fallback={<LoadingSpinner />}>
      <RealisticMug textureUrl={canvasTexture} color={mugColor || '#ffffff'} variant={variant} />
      
      {/* Ground shadow */}
      <ContactShadows
        position={[0, -1.12, 0]}
        opacity={0.4}
        scale={8}
        blur={2.2}
        far={4}
        color="#1a0e05"
      />
      
      {/* Environment with custom lightformers for rich reflections */}
      <Environment resolution={256} environmentIntensity={0.85}>
        <Lightformer form="ring" intensity={2.0} position={[0, 6, -4]} scale={5} color="#ffffff" />
        <Lightformer form="rect" intensity={0.8} position={[-6, 3, 0]} scale={8} color="#f0f4ff" />
        <Lightformer form="rect" intensity={0.5} position={[6, 2, 3]} scale={6} color="#fff8f0" />
        <Lightformer form="circle" intensity={0.3} position={[0, -3, 0]} scale={10} color="#f5ede5" />
      </Environment>
    </Suspense>

    <OrbitControls
      ref={controlsRef}
      enableZoom enablePan={false}
      minDistance={3} maxDistance={10}
      minPolarAngle={Math.PI / 5}
      maxPolarAngle={Math.PI / 1.8}
      target={[0, 0.2, 0]}
      enableDamping dampingFactor={0.05}
      makeDefault
    />
  </>
);

export function MugPreview3D({ canvasTexture, variant, mugColor = '#ffffff' }: MugPreview3DProps) {
  const cameraRef = useRef<{ reset: () => void; zoomIn: () => void; zoomOut: () => void }>(null);
  const controlsRef = useRef<any>(null);

  return (
    <div className="relative w-full h-full min-h-[500px] lg:min-h-[600px] rounded-2xl overflow-hidden bg-gradient-to-br from-muted/30 via-background to-muted/20">
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
        <Button variant="secondary" size="icon" className="h-8 w-8 bg-background/90 backdrop-blur shadow-sm" onClick={() => cameraRef.current?.zoomIn()}><ZoomIn className="h-4 w-4" /></Button>
        <Button variant="secondary" size="icon" className="h-8 w-8 bg-background/90 backdrop-blur shadow-sm" onClick={() => cameraRef.current?.zoomOut()}><ZoomOut className="h-4 w-4" /></Button>
        <Button variant="secondary" size="icon" className="h-8 w-8 bg-background/90 backdrop-blur shadow-sm" onClick={() => cameraRef.current?.reset()}><RotateCcw className="h-4 w-4" /></Button>
      </div>
      <Canvas
        camera={{ position: [2.5, 1.8, 4.5], fov: 32 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
        shadows
      >
        <Scene canvasTexture={canvasTexture} variant={variant} mugColor={mugColor} cameraRef={cameraRef} controlsRef={controlsRef} />
      </Canvas>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-muted-foreground bg-background/80 backdrop-blur px-3 py-1.5 rounded-full">
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
}
