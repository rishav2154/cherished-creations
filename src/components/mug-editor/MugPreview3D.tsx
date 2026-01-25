import { Suspense, useRef, useMemo, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  ContactShadows, 
  Html,
  Float
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

// Print wrap component - simplified approach
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

  // Load texture
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
      tex.flipY = false; // Canvas data is already in correct orientation
      tex.needsUpdate = true;
      
      setTexture(prev => {
        if (prev) prev.dispose();
        return tex;
      });
    };
    img.src = textureUrl;
  }, [textureUrl]);

  // Create cylinder geometry wrapping around the mug
  const geometry = useMemo(() => {
    const handleGapAngle = Math.PI * 0.4;
    const printArcAngle = Math.PI * 2 - handleGapAngle;
    const startAngle = Math.PI + handleGapAngle / 2;
    
    const actualPrintHeight = mugHeight * 0.7;
    const radiusOffset = 0.035;
    
    const geo = new THREE.CylinderGeometry(
      topRadius + radiusOffset,
      bottomRadius + radiusOffset,
      actualPrintHeight,
      64,
      1,
      true,
      startAngle,
      printArcAngle
    );

    // Adjust UVs for correct orientation on cylinder
    const uvs = geo.attributes.uv;
    for (let i = 0; i < uvs.count; i++) {
      const u = uvs.getX(i);
      const v = uvs.getY(i);
      // Only flip V (vertical) to fix upside-down, keep U normal to avoid horizontal mirror
      uvs.setXY(i, u, 1 - v);
    }
    uvs.needsUpdate = true;

    return geo;
  }, [mugHeight, bottomRadius, topRadius]);

  if (!texture) return null;

  return (
    <mesh ref={meshRef} geometry={geometry} position={[0, 0.04, 0]}>
      <meshBasicMaterial
        map={texture}
        side={THREE.FrontSide}
        toneMapped={false}
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

  // Debug logging
  useEffect(() => {
    console.log('RealisticMug: textureUrl received:', textureUrl ? `data URL (${textureUrl.length} chars)` : 'null');
  }, [textureUrl]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  const isLarge = variant.id === '15oz';
  const mugHeight = isLarge ? 2.6 : 2.3;
  const bottomRadius = isLarge ? 0.85 : 0.75;
  const topRadius = isLarge ? 1.0 : 0.88;
  const handleRadius = isLarge ? 0.5 : 0.44;

  // Mug body profile
  const mugProfile = useMemo(() => {
    const points: THREE.Vector2[] = [];
    points.push(new THREE.Vector2(0, 0));
    points.push(new THREE.Vector2(bottomRadius * 0.9, 0));
    points.push(new THREE.Vector2(bottomRadius, 0.08));

    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      const r = bottomRadius + (topRadius - bottomRadius) * t + Math.sin(t * Math.PI) * 0.025;
      points.push(new THREE.Vector2(r, 0.08 + t * mugHeight));
    }

    points.push(new THREE.Vector2(topRadius + 0.04, mugHeight + 0.08));
    points.push(new THREE.Vector2(topRadius + 0.02, mugHeight + 0.13));
    points.push(new THREE.Vector2(topRadius - 0.02, mugHeight + 0.13));

    return points;
  }, [bottomRadius, topRadius, mugHeight]);

  return (
    <Float speed={0.6} rotationIntensity={0.015} floatIntensity={0.08}>
      <group ref={groupRef} scale={1.1}>
        {/* Mug body */}
        <mesh position={[0, -mugHeight / 2, 0]} castShadow receiveShadow>
          <latheGeometry args={[mugProfile, 64]} />
          <meshStandardMaterial color={color} roughness={0.12} metalness={0.01} envMapIntensity={0.9} />
        </mesh>

        {/* Inner cavity */}
        <mesh position={[0, mugHeight * 0.15, 0]}>
          <cylinderGeometry args={[topRadius - 0.08, bottomRadius - 0.06, mugHeight * 0.9, 48, 1, true]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.5} side={THREE.BackSide} />
        </mesh>

        {/* Coffee surface */}
        <mesh position={[0, mugHeight * 0.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[topRadius - 0.15, 48]} />
          <meshStandardMaterial color="#2a1810" roughness={0.85} metalness={0.1} />
        </mesh>

        {/* Handle */}
        <group position={[-(topRadius + 0.05), -0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
          <mesh castShadow>
            <torusGeometry args={[handleRadius, 0.09, 16, 32, Math.PI * 0.92]} />
            <meshStandardMaterial color={color} roughness={0.12} metalness={0.01} envMapIntensity={0.9} />
          </mesh>
        </group>

        {/* Print wrap - only render when texture exists */}
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

interface SceneProps extends MugPreview3DProps {
  cameraRef: React.RefObject<{ reset: () => void; zoomIn: () => void; zoomOut: () => void }>;
  controlsRef: React.RefObject<any>;
}

const Scene = ({ canvasTexture, variant, mugColor, cameraRef, controlsRef }: SceneProps) => (
  <>
    <ambientLight intensity={0.4} />
    <spotLight position={[5, 8, 5]} angle={0.25} penumbra={1} intensity={1.6} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0001} />
    <spotLight position={[-5, 5, -5]} angle={0.3} penumbra={1} intensity={0.45} color="#ffeedd" />
    <pointLight position={[0, 6, 0]} intensity={0.35} />
    <pointLight position={[-4, 3, 5]} intensity={0.2} color="#fff5ee" />

    <CameraController ref={cameraRef} controlsRef={controlsRef} />

    <Suspense fallback={<LoadingSpinner />}>
      <RealisticMug textureUrl={canvasTexture} color={mugColor || '#ffffff'} variant={variant} />
      <ContactShadows position={[0, -2.3, 0]} opacity={0.45} scale={10} blur={2.4} far={5} color="#000000" />
      <Environment preset="studio" environmentIntensity={0.55} />
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
        camera={{ position: [0, 0.5, 6], fov: 40 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
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
