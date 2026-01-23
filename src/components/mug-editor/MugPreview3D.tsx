import { Suspense, useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  ContactShadows, 
  Html,
  Float,
  useTexture
} from '@react-three/drei';
import * as THREE from 'three';
import { Loader2 } from 'lucide-react';
import { MugVariant } from './types';

interface MugPreview3DProps {
  canvasTexture: string | null;
  variant: MugVariant;
  mugColor?: string;
}

function LoadingSpinner() {
  return (
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
}

interface RealisticMugProps {
  textureUrl: string | null;
  color: string;
  variant: MugVariant;
}

function RealisticMug({ textureUrl, color, variant }: RealisticMugProps) {
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
        // Configure texture for proper UV mapping
        loadedTexture.wrapS = THREE.RepeatWrapping;
        loadedTexture.wrapT = THREE.ClampToEdgeWrapping;
        loadedTexture.colorSpace = THREE.SRGBColorSpace;
        loadedTexture.flipY = true;
        loadedTexture.needsUpdate = true;
        setTexture(loadedTexture);
      },
      undefined,
      (error) => {
        console.error('Error loading texture:', error);
      }
    );
  }, [textureUrl]);

  // Gentle rotation animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  // Create mug geometry based on variant
  const mugProfile = useMemo(() => {
    const points = [];
    const isLarge = variant.id === '15oz';
    const bodyWidth = isLarge ? 0.85 : 0.75;
    const topWidth = isLarge ? 1.05 : 0.92;
    const height = isLarge ? 2.6 : 2.3;
    
    // Bottom curve
    points.push(new THREE.Vector2(0, 0));
    points.push(new THREE.Vector2(bodyWidth * 0.92, 0));
    points.push(new THREE.Vector2(bodyWidth, 0.1));
    
    // Body curve with slight taper
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const radius = bodyWidth + Math.sin(t * Math.PI * 0.3) * 0.08 + t * (topWidth - bodyWidth);
      points.push(new THREE.Vector2(radius, 0.1 + t * height));
    }
    
    // Rim
    points.push(new THREE.Vector2(topWidth + 0.03, height + 0.15));
    points.push(new THREE.Vector2(topWidth, height + 0.2));
    
    return points;
  }, [variant]);

  // Calculate wrap geometry for the print area
  const printWrapGeometry = useMemo(() => {
    const isLarge = variant.id === '15oz';
    const radius = isLarge ? 0.95 : 0.85;
    const height = isLarge ? 2.0 : 1.75;
    
    // Create a cylinder segment that wraps around the mug
    const geometry = new THREE.CylinderGeometry(
      radius + 0.002, // Slightly larger to sit on surface
      radius * 0.95 + 0.002,
      height,
      64,
      1,
      true,
      Math.PI * 0.15, // Start angle
      Math.PI * 1.7   // Sweep angle (~270°)
    );
    
    // Recalculate UVs for proper texture mapping
    const uvs = geometry.attributes.uv;
    const positions = geometry.attributes.position;
    
    for (let i = 0; i < uvs.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);
      const y = positions.getY(i);
      
      // Calculate angle for U coordinate
      const angle = Math.atan2(z, x);
      const u = (angle + Math.PI) / (Math.PI * 2);
      
      // Calculate V coordinate based on height
      const v = (y / height) + 0.5;
      
      uvs.setXY(i, u, v);
    }
    
    uvs.needsUpdate = true;
    
    return geometry;
  }, [variant]);

  const handleRadius = variant.id === '15oz' ? 0.55 : 0.5;

  return (
    <Float speed={0.8} rotationIntensity={0.02} floatIntensity={0.1}>
      <group ref={meshRef} scale={1.15}>
        {/* Main Mug Body */}
        <mesh position={[0, -1.1, 0]} castShadow receiveShadow>
          <latheGeometry args={[mugProfile, 64]} />
          <meshStandardMaterial 
            color={color}
            roughness={0.1}
            metalness={0.02}
            envMapIntensity={1}
          />
        </mesh>
        
        {/* Inner cavity */}
        <mesh position={[0, variant.id === '15oz' ? 0.4 : 0.25, 0]}>
          <cylinderGeometry args={[
            variant.id === '15oz' ? 0.92 : 0.82, 
            variant.id === '15oz' ? 0.82 : 0.72, 
            variant.id === '15oz' ? 2.4 : 2.1, 
            48, 
            1, 
            true
          ]} />
          <meshStandardMaterial 
            color="#1a1a1a" 
            roughness={0.4}
            side={THREE.BackSide}
          />
        </mesh>
        
        {/* Coffee surface */}
        <mesh position={[0, variant.id === '15oz' ? 1.0 : 0.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[variant.id === '15oz' ? 0.85 : 0.75, 48]} />
          <meshStandardMaterial color="#2a1810" roughness={0.9} />
        </mesh>
        
        {/* Handle */}
        <group position={[variant.id === '15oz' ? 1.15 : 1.05, 0, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <torusGeometry args={[handleRadius, 0.1, 20, 48, Math.PI * 0.95]} />
            <meshStandardMaterial color={color} roughness={0.1} metalness={0.02} />
          </mesh>
        </group>
        
        {/* Print Area Wrap - The main design area */}
        {texture && (
          <mesh 
            position={[0, variant.id === '15oz' ? 0.35 : 0.2, 0]}
            rotation={[0, Math.PI * 0.85, 0]}
          >
            <primitive object={printWrapGeometry} attach="geometry" />
            <meshStandardMaterial 
              map={texture}
              transparent
              opacity={0.98}
              roughness={0.15}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
      </group>
    </Float>
  );
}

function Scene({ canvasTexture, variant, mugColor }: MugPreview3DProps) {
  return (
    <>
      {/* Studio Lighting */}
      <ambientLight intensity={0.35} />
      <spotLight 
        position={[5, 8, 5]} 
        angle={0.22} 
        penumbra={1} 
        intensity={1.8} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      />
      <spotLight 
        position={[-5, 5, -5]} 
        angle={0.28} 
        penumbra={1} 
        intensity={0.5}
        color="#ffeedd"
      />
      <pointLight position={[0, 6, 0]} intensity={0.3} />
      <pointLight position={[-4, 3, 5]} intensity={0.25} color="#fff5ee" />
      
      <Suspense fallback={<LoadingSpinner />}>
        <RealisticMug 
          textureUrl={canvasTexture}
          color={mugColor || '#ffffff'}
          variant={variant}
        />
        
        <ContactShadows 
          position={[0, -2.5, 0]} 
          opacity={0.5} 
          scale={10} 
          blur={2.2} 
          far={6}
          color="#000000"
        />
        <Environment preset="studio" environmentIntensity={0.6} />
      </Suspense>
      
      <OrbitControls 
        enableZoom={true}
        enablePan={false}
        minDistance={4}
        maxDistance={12}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.5}
        autoRotate={false}
        makeDefault
      />
    </>
  );
}

export function MugPreview3D({ canvasTexture, variant, mugColor = '#ffffff' }: MugPreview3DProps) {
  return (
    <div className="relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden bg-gradient-to-br from-muted/30 via-background to-muted/20">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      
      <Canvas
        camera={{ position: [0, 0, 7], fov: 38 }}
        dpr={[1, 2]}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1
        }}
        shadows
      >
        <Scene 
          canvasTexture={canvasTexture}
          variant={variant}
          mugColor={mugColor}
        />
      </Canvas>
      
      {/* Rotation hint */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-muted-foreground bg-background/80 backdrop-blur px-3 py-1.5 rounded-full">
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
}
