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
      if (controlsRef.current) {
        controlsRef.current.reset();
      }
    },
    zoomIn: () => {
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      camera.position.addScaledVector(direction, 0.5);
    },
    zoomOut: () => {
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      camera.position.addScaledVector(direction, -0.5);
    }
  }));
  
  return null;
});

CameraController.displayName = 'CameraController';

// Loading spinner component
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

interface RealisticMugProps {
  textureUrl: string | null;
  color: string;
  variant: MugVariant;
}

// Realistic mug component
const RealisticMug = ({ textureUrl, color, variant }: RealisticMugProps) => {
  const meshRef = useRef<THREE.Group>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  // Load texture when URL changes
  useEffect(() => {
    if (!textureUrl) {
      setTexture(null);
      return;
    }

    const loader = new THREE.TextureLoader();
    loader.load(
      textureUrl,
      (loadedTexture) => {
        loadedTexture.wrapS = THREE.ClampToEdgeWrapping;
        loadedTexture.wrapT = THREE.ClampToEdgeWrapping;
        loadedTexture.colorSpace = THREE.SRGBColorSpace;
        loadedTexture.flipY = true;
        loadedTexture.minFilter = THREE.LinearFilter;
        loadedTexture.magFilter = THREE.LinearFilter;
        loadedTexture.generateMipmaps = false;
        loadedTexture.needsUpdate = true;
        setTexture(loadedTexture);
      },
      undefined,
      (error) => console.error('Error loading texture:', error)
    );
  }, [textureUrl]);

  // Gentle rotation animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  const isLarge = variant.id === '15oz';
  
  // Mug dimensions
  const mugHeight = isLarge ? 2.6 : 2.3;
  const bottomRadius = isLarge ? 0.85 : 0.75;
  const topRadius = isLarge ? 1.0 : 0.88;
  const handleRadius = isLarge ? 0.5 : 0.44;

  // Create mug body geometry using lathe - profile starts at y=0
  const mugProfile = useMemo(() => {
    const points: THREE.Vector2[] = [];
    
    // Bottom
    points.push(new THREE.Vector2(0, 0));
    points.push(new THREE.Vector2(bottomRadius * 0.9, 0));
    points.push(new THREE.Vector2(bottomRadius, 0.08));
    
    // Body curve
    const steps = 24;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const radius = bottomRadius + (topRadius - bottomRadius) * t + Math.sin(t * Math.PI) * 0.025;
      points.push(new THREE.Vector2(radius, 0.08 + t * mugHeight));
    }
    
    // Rim
    const rimHeight = mugHeight + 0.08;
    points.push(new THREE.Vector2(topRadius + 0.04, rimHeight));
    points.push(new THREE.Vector2(topRadius + 0.02, rimHeight + 0.05));
    points.push(new THREE.Vector2(topRadius - 0.02, rimHeight + 0.05));
    
    return points;
  }, [bottomRadius, topRadius, mugHeight]);

  // Print wrap geometry - wraps around mug with gap for handle
  const { printGeometry, printYOffset } = useMemo(() => {
    // Handle is at the back (angle = PI), gap centered there
    const handleGapAngle = Math.PI * 0.3; // ~54 degrees gap for handle
    const printArcAngle = Math.PI * 2 - handleGapAngle;
    
    // Start angle: print starts after half the gap (from front, going both ways)
    // Handle at back means gap at PI, so print goes from ~0.15PI to ~1.85PI
    const startAngle = handleGapAngle / 2;
    
    // Calculate print dimensions preserving aspect ratio
    const printAspectRatio = variant.printArea.width / variant.printArea.height;
    const avgRadius = (bottomRadius + topRadius) / 2;
    const arcLength = printArcAngle * avgRadius; // Circumference covered
    const printHeight = arcLength / printAspectRatio;
    
    // Clamp height to fit on mug with margins
    const maxPrintHeight = mugHeight * 0.85;
    const actualPrintHeight = Math.min(printHeight, maxPrintHeight);
    
    // Calculate vertical margins to center print on mug
    const verticalMargin = (mugHeight - actualPrintHeight) / 2;
    const printBottomY = verticalMargin;
    const printTopY = mugHeight - verticalMargin;
    
    // Calculate radii at print boundaries
    const bottomT = printBottomY / mugHeight;
    const topT = printTopY / mugHeight;
    const printBottomRadius = bottomRadius + (topRadius - bottomRadius) * bottomT + 0.005;
    const printTopRadius = bottomRadius + (topRadius - bottomRadius) * topT + 0.005;
    
    const radialSegments = 128;
    const heightSegments = 1;
    
    const geometry = new THREE.CylinderGeometry(
      printTopRadius,
      printBottomRadius,
      actualPrintHeight,
      radialSegments,
      heightSegments,
      true, // open-ended
      startAngle,
      printArcAngle
    );
    
    // Custom UV mapping for correct image display
    const uvs = geometry.attributes.uv;
    const count = uvs.count;
    const vertsPerRing = radialSegments + 1;
    
    for (let ring = 0; ring <= heightSegments; ring++) {
      for (let seg = 0; seg <= radialSegments; seg++) {
        const idx = ring * vertsPerRing + seg;
        if (idx < count) {
          // U: maps image width across the arc (0 = start, 1 = end)
          const u = seg / radialSegments;
          // V: maps image height (0 = bottom, 1 = top)
          const v = ring / heightSegments;
          uvs.setXY(idx, u, v);
        }
      }
    }
    uvs.needsUpdate = true;
    
    // CylinderGeometry is centered at origin, so we need to offset it
    // Mug body uses latheGeometry starting at y=0, so mug bottom is at y=0
    // Print should be centered vertically on the mug body
    const yOffset = 0.08 + mugHeight / 2; // 0.08 is the base height offset in profile
    
    return { printGeometry: geometry, printYOffset: yOffset };
  }, [variant, bottomRadius, topRadius, mugHeight]);

  return (
    <Float speed={0.6} rotationIntensity={0.015} floatIntensity={0.08}>
      <group ref={meshRef} scale={1.1}>
        {/* Main Mug Body - positioned so bottom is at y = -mugHeight/2 */}
        <mesh position={[0, -mugHeight / 2, 0]} castShadow receiveShadow>
          <latheGeometry args={[mugProfile, 64]} />
          <meshStandardMaterial 
            color={color}
            roughness={0.12}
            metalness={0.01}
            envMapIntensity={0.9}
          />
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
        
        {/* Handle - at back (PI angle) */}
        <group 
          position={[-(topRadius + 0.05), -0.05, 0]} 
          rotation={[0, 0, Math.PI / 2]}
        >
          <mesh castShadow>
            <torusGeometry args={[handleRadius, 0.09, 16, 32, Math.PI * 0.92]} />
            <meshStandardMaterial color={color} roughness={0.12} metalness={0.01} envMapIntensity={0.9} />
          </mesh>
        </group>
        
        {/* Print Area Wrap */}
        {texture && (
          <mesh position={[0, printYOffset - mugHeight / 2, 0]}>
            <primitive object={printGeometry} attach="geometry" />
            <meshStandardMaterial 
              map={texture}
              transparent
              opacity={0.98}
              roughness={0.15}
              side={THREE.FrontSide}
              depthWrite={true}
            />
          </mesh>
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
    <spotLight 
      position={[5, 8, 5]} 
      angle={0.25} 
      penumbra={1} 
      intensity={1.6} 
      castShadow 
      shadow-mapSize={[2048, 2048]}
      shadow-bias={-0.0001}
    />
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
      enableZoom={true}
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
    <div className="relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden bg-gradient-to-br from-muted/30 via-background to-muted/20">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      
      {/* Zoom Controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 bg-background/90 backdrop-blur shadow-sm"
          onClick={() => cameraRef.current?.zoomIn()}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 bg-background/90 backdrop-blur shadow-sm"
          onClick={() => cameraRef.current?.zoomOut()}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 bg-background/90 backdrop-blur shadow-sm"
          onClick={() => cameraRef.current?.reset()}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
      
      <Canvas
        camera={{ position: [0, 0.5, 6], fov: 40 }}
        dpr={[1, 2]}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05
        }}
        shadows
      >
        <Scene 
          canvasTexture={canvasTexture}
          variant={variant}
          mugColor={mugColor}
          cameraRef={cameraRef}
          controlsRef={controlsRef}
        />
      </Canvas>
      
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-muted-foreground bg-background/80 backdrop-blur px-3 py-1.5 rounded-full">
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
}
