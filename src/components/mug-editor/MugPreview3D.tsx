import { Suspense, useRef, useMemo, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  ContactShadows, 
  Html,
  Float,
  Caustics,
  MeshTransmissionMaterial
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

// Camera controller for zoom controls
const CameraController = forwardRef<
  { reset: () => void; zoomIn: () => void; zoomOut: () => void },
  { controlsRef: React.RefObject<any> }
>(({ controlsRef }, ref) => {
  const { camera } = useThree();
  
  useImperativeHandle(ref, () => ({
    reset: () => {
      camera.position.set(0, 0.5, 6);
      camera.lookAt(0, 0, 0);
      controlsRef.current?.reset();
    },
    zoomIn: () => {
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      camera.position.addScaledVector(dir, 0.5);
    },
    zoomOut: () => {
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      camera.position.addScaledVector(dir, -0.5);
    }
  }));
  
  return null;
});

CameraController.displayName = 'CameraController';

// Loading spinner
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

// Steam particles rising from the mug
const SteamParticles = ({ mugHeight, topRadius }: { mugHeight: number; topRadius: number }) => {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 60;

  const [positions, velocities, opacities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const opa = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * (topRadius - 0.2);
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = mugHeight * 0.45 + Math.random() * 1.5;
      pos[i * 3 + 2] = Math.sin(angle) * r;
      vel[i * 3] = (Math.random() - 0.5) * 0.003;
      vel[i * 3 + 1] = 0.004 + Math.random() * 0.006;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.003;
      opa[i] = Math.random();
    }
    return [pos, vel, opa];
  }, [count, topRadius, mugHeight]);

  useFrame(() => {
    if (!particlesRef.current) return;
    const posAttr = particlesRef.current.geometry.attributes.position;
    const arr = posAttr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3] += velocities[i * 3] + Math.sin(Date.now() * 0.001 + i) * 0.001;
      arr[i * 3 + 1] += velocities[i * 3 + 1];
      arr[i * 3 + 2] += velocities[i * 3 + 2] + Math.cos(Date.now() * 0.001 + i) * 0.001;

      if (arr[i * 3 + 1] > mugHeight * 0.45 + 2.5) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * (topRadius - 0.2);
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
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#ffffff"
        size={0.06}
        transparent
        opacity={0.12}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
};

// Print wrap component
interface PrintWrapProps {
  textureUrl: string;
  variant: MugVariant;
  mugHeight: number;
  bottomRadius: number;
  topRadius: number;
}

const PrintWrap = ({ textureUrl, variant, mugHeight, bottomRadius, topRadius }: PrintWrapProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!textureUrl) {
      setTexture(null);
      return;
    }

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
      
      setTexture(prev => {
        if (prev) prev.dispose();
        return tex;
      });
    };
    img.src = textureUrl;
  }, [textureUrl]);

  const geometry = useMemo(() => {
    const handleGapAngle = Math.PI * 0.5;
    const printArcAngle = Math.PI * 2 - handleGapAngle;
    const startAngle = Math.PI + handleGapAngle / 2 + 1.5;
    const actualPrintHeight = mugHeight * 0.7;
    const radiusOffset = 0.035;
    
    const geo = new THREE.CylinderGeometry(
      topRadius + radiusOffset,
      bottomRadius + radiusOffset,
      actualPrintHeight,
      128, // Higher segments for smoother wrap
      1,
      true,
      startAngle,
      printArcAngle
    );

    const uvs = geo.attributes.uv;
    for (let i = 0; i < uvs.count; i++) {
      const u = uvs.getX(i);
      const v = uvs.getY(i);
      uvs.setXY(i, u, 1 - v);
    }
    uvs.needsUpdate = true;

    return geo;
  }, [mugHeight, bottomRadius, topRadius]);

  if (!texture) return null;

  return (
    <mesh ref={meshRef} geometry={geometry} position={[0, 0.04, 0]}>
      <meshStandardMaterial
        map={texture}
        side={THREE.FrontSide}
        toneMapped={false}
        roughness={0.35}
        metalness={0.0}
        polygonOffset
        polygonOffsetFactor={-5}
        polygonOffsetUnits={-5}
      />
    </mesh>
  );
};

interface RealisticMugProps {
  textureUrl: string | null;
  color: string;
  variant: MugVariant;
}

const RealisticMug = ({ textureUrl, color, variant }: RealisticMugProps) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.12;
    }
  });

  const isLarge = variant.id === '15oz';
  const mugHeight = isLarge ? 2.6 : 2.3;
  const bottomRadius = isLarge ? 0.85 : 0.75;
  const topRadius = isLarge ? 1.0 : 0.88;
  const handleRadius = isLarge ? 0.5 : 0.44;

  // High-detail mug body profile with subtle curves
  const mugProfile = useMemo(() => {
    const points: THREE.Vector2[] = [];
    // Bottom center
    points.push(new THREE.Vector2(0, 0));
    // Bottom flat
    points.push(new THREE.Vector2(bottomRadius * 0.85, 0));
    // Bottom edge radius
    points.push(new THREE.Vector2(bottomRadius * 0.92, 0.02));
    points.push(new THREE.Vector2(bottomRadius * 0.97, 0.05));
    points.push(new THREE.Vector2(bottomRadius, 0.08));
    // Slight foot indent
    points.push(new THREE.Vector2(bottomRadius - 0.01, 0.12));
    points.push(new THREE.Vector2(bottomRadius + 0.005, 0.18));

    // Main body with subtle belly curve
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      const belly = Math.sin(t * Math.PI) * 0.03;
      const r = bottomRadius + (topRadius - bottomRadius) * t + belly;
      points.push(new THREE.Vector2(r, 0.18 + t * (mugHeight - 0.18)));
    }

    // Rim detail - rolled lip
    const rimTop = mugHeight + 0.08;
    points.push(new THREE.Vector2(topRadius + 0.05, mugHeight + 0.02));
    points.push(new THREE.Vector2(topRadius + 0.06, mugHeight + 0.05));
    points.push(new THREE.Vector2(topRadius + 0.055, rimTop));
    points.push(new THREE.Vector2(topRadius + 0.03, rimTop + 0.02));
    points.push(new THREE.Vector2(topRadius - 0.01, rimTop + 0.01));
    points.push(new THREE.Vector2(topRadius - 0.03, rimTop - 0.01));

    return points;
  }, [bottomRadius, topRadius, mugHeight]);

  // Inner wall profile
  const innerProfile = useMemo(() => {
    const points: THREE.Vector2[] = [];
    const wallThickness = 0.07;
    const innerBottom = bottomRadius - wallThickness;
    const innerTop = topRadius - wallThickness;
    const rimTop = mugHeight + 0.08;

    points.push(new THREE.Vector2(innerBottom * 0.2, 0.15));
    points.push(new THREE.Vector2(innerBottom, 0.15));

    for (let i = 0; i <= 30; i++) {
      const t = i / 30;
      const r = innerBottom + (innerTop - bottomRadius + topRadius - wallThickness - innerBottom) * t;
      const correctedR = innerBottom + (innerTop - innerBottom) * t;
      points.push(new THREE.Vector2(correctedR, 0.15 + t * (rimTop - 0.18)));
    }

    points.push(new THREE.Vector2(topRadius - 0.03, rimTop - 0.01));

    return points;
  }, [bottomRadius, topRadius, mugHeight]);

  // Handle cross-section shape (D-shaped for realism)
  const handleShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, -0.09);
    shape.bezierCurveTo(0.06, -0.09, 0.09, -0.05, 0.09, 0);
    shape.bezierCurveTo(0.09, 0.05, 0.06, 0.09, 0, 0.09);
    shape.bezierCurveTo(-0.03, 0.09, -0.05, 0.05, -0.05, 0);
    shape.bezierCurveTo(-0.05, -0.05, -0.03, -0.09, 0, -0.09);
    return shape;
  }, []);

  // Handle path (smooth curve)
  const handleCurve = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-(topRadius + 0.02), mugHeight * 0.75, 0),
      new THREE.Vector3(-(topRadius + 0.38), mugHeight * 0.65, 0),
      new THREE.Vector3(-(topRadius + 0.48), mugHeight * 0.4, 0),
      new THREE.Vector3(-(topRadius + 0.38), mugHeight * 0.15, 0),
      new THREE.Vector3(-(topRadius + 0.02), mugHeight * 0.08, 0),
    ]);
    return curve;
  }, [topRadius, mugHeight]);

  // Ceramic material properties
  const ceramicProps = useMemo(() => ({
    color: color,
    roughness: 0.08,
    metalness: 0.0,
    envMapIntensity: 1.2,
    clearcoat: 0.9,
    clearcoatRoughness: 0.05,
  }), [color]);

  return (
    <Float speed={0.4} rotationIntensity={0.01} floatIntensity={0.05}>
      <group ref={groupRef} scale={1.1}>
        {/* Mug body - outer shell */}
        <mesh position={[0, -mugHeight / 2, 0]} castShadow receiveShadow>
          <latheGeometry args={[mugProfile, 128]} />
          <meshPhysicalMaterial {...ceramicProps} />
        </mesh>

        {/* Inner wall - glazed ceramic */}
        <mesh position={[0, -mugHeight / 2, 0]}>
          <latheGeometry args={[innerProfile, 96]} />
          <meshPhysicalMaterial
            color="#f0ece4"
            roughness={0.15}
            metalness={0.0}
            clearcoat={0.6}
            clearcoatRoughness={0.1}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Coffee surface with subtle animation */}
        <CoffeeSurface mugHeight={mugHeight} topRadius={topRadius} />

        {/* Handle - extruded along curve for realistic D-profile */}
        <mesh castShadow position={[0, -mugHeight / 2, 0]}>
          <extrudeGeometry args={[handleShape, {
            steps: 64,
            extrudePath: handleCurve,
          }]} />
          <meshPhysicalMaterial {...ceramicProps} />
        </mesh>

        {/* Bottom stamp indent */}
        <mesh position={[0, -mugHeight / 2 - 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[bottomRadius * 0.3, bottomRadius * 0.6, 64]} />
          <meshPhysicalMaterial
            color={color}
            roughness={0.3}
            metalness={0.0}
            clearcoat={0.3}
          />
        </mesh>

        {/* Steam particles */}
        <SteamParticles mugHeight={mugHeight} topRadius={topRadius} />

        {/* Print wrap */}
        {textureUrl && (
          <PrintWrap
            textureUrl={textureUrl}
            variant={variant}
            mugHeight={mugHeight}
            bottomRadius={bottomRadius}
            topRadius={topRadius}
          />
        )}
      </group>
    </Float>
  );
};

// Animated coffee surface with subtle ripple
const CoffeeSurface = ({ mugHeight, topRadius }: { mugHeight: number; topRadius: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = mugHeight * 0.4 + Math.sin(state.clock.elapsedTime * 0.5) * 0.005;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, mugHeight * 0.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[topRadius - 0.12, 64]} />
      <meshPhysicalMaterial
        color="#3a1e0d"
        roughness={0.1}
        metalness={0.05}
        clearcoat={1.0}
        clearcoatRoughness={0.02}
        transmission={0.05}
        thickness={0.5}
      />
    </mesh>
  );
};

interface SceneProps extends MugPreview3DProps {
  cameraRef: React.RefObject<{ reset: () => void; zoomIn: () => void; zoomOut: () => void }>;
  controlsRef: React.RefObject<any>;
}

const Scene = ({ canvasTexture, variant, mugColor, cameraRef, controlsRef }: SceneProps) => (
  <>
    {/* Key light */}
    <spotLight
      position={[5, 8, 5]}
      angle={0.2}
      penumbra={1}
      intensity={2.0}
      castShadow
      shadow-mapSize={[4096, 4096]}
      shadow-bias={-0.00005}
      color="#fff8f0"
    />
    {/* Fill light */}
    <spotLight
      position={[-5, 4, -3]}
      angle={0.35}
      penumbra={1}
      intensity={0.6}
      color="#e8eeff"
    />
    {/* Rim light */}
    <spotLight
      position={[-3, 6, 5]}
      angle={0.25}
      penumbra={0.8}
      intensity={0.8}
      color="#ffe4cc"
    />
    {/* Ambient fill */}
    <ambientLight intensity={0.25} color="#f5f0eb" />
    {/* Under-light for drama */}
    <pointLight position={[0, -3, 2]} intensity={0.15} color="#ffeedd" />
    {/* Back accent */}
    <pointLight position={[2, 3, -5]} intensity={0.3} color="#dde8ff" />

    <CameraController ref={cameraRef} controlsRef={controlsRef} />

    <Suspense fallback={<LoadingSpinner />}>
      <RealisticMug textureUrl={canvasTexture} color={mugColor || '#ffffff'} variant={variant} />
      <ContactShadows
        position={[0, -2.3, 0]}
        opacity={0.55}
        scale={12}
        blur={2.8}
        far={6}
        color="#1a1008"
        frames={1}
      />
      <Environment preset="studio" environmentIntensity={0.7} />
    </Suspense>

    <OrbitControls
      ref={controlsRef}
      enableZoom
      enablePan={false}
      minDistance={3}
      maxDistance={12}
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 1.6}
      autoRotate={false}
      enableDamping
      dampingFactor={0.05}
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
        <Button variant="secondary" size="icon" className="h-8 w-8 bg-background/90 backdrop-blur shadow-sm" onClick={() => cameraRef.current?.zoomIn()}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="icon" className="h-8 w-8 bg-background/90 backdrop-blur shadow-sm" onClick={() => cameraRef.current?.zoomOut()}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="icon" className="h-8 w-8 bg-background/90 backdrop-blur shadow-sm" onClick={() => cameraRef.current?.reset()}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <Canvas
        camera={{ position: [0, 0.5, 6], fov: 38 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
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
