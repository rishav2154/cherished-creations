import { Suspense, useRef, useMemo, useEffect, useState, forwardRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  ContactShadows, 
  Html,
  Float
} from '@react-three/drei';
import * as THREE from 'three';
import { MugVariant } from './types';

interface MugPreview3DProps {
  canvasTexture: string | null;
  variant: MugVariant;
  mugColor?: string;
}

// Loading spinner component
const LoadingSpinner = forwardRef<THREE.Group>((_, ref) => {
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
});

LoadingSpinner.displayName = 'LoadingSpinner';

interface RealisticMugProps {
  textureUrl: string | null;
  color: string;
  variant: MugVariant;
}

// Realistic mug component with proper UV mapping
const RealisticMug = forwardRef<THREE.Group, RealisticMugProps>(({ textureUrl, color, variant }, ref) => {
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
        // Configure texture for proper UV mapping - ClampToEdge prevents repeating
        loadedTexture.wrapS = THREE.ClampToEdgeWrapping;
        loadedTexture.wrapT = THREE.ClampToEdgeWrapping;
        loadedTexture.colorSpace = THREE.SRGBColorSpace;
        loadedTexture.flipY = true;
        loadedTexture.minFilter = THREE.LinearFilter;
        loadedTexture.magFilter = THREE.LinearFilter;
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
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  // Create mug body geometry using lathe
  const mugProfile = useMemo(() => {
    const points: THREE.Vector2[] = [];
    const isLarge = variant.id === '15oz';
    const bodyWidth = isLarge ? 0.85 : 0.75;
    const topWidth = isLarge ? 1.0 : 0.88;
    const height = isLarge ? 2.5 : 2.2;
    
    // Bottom flat
    points.push(new THREE.Vector2(0, 0));
    points.push(new THREE.Vector2(bodyWidth * 0.9, 0));
    points.push(new THREE.Vector2(bodyWidth, 0.08));
    
    // Body curve with classic mug taper
    const steps = 24;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      // Slight curve outward toward top
      const radius = bodyWidth + (topWidth - bodyWidth) * t + Math.sin(t * Math.PI) * 0.03;
      points.push(new THREE.Vector2(radius, 0.08 + t * height));
    }
    
    // Rim
    const rimHeight = height + 0.08;
    points.push(new THREE.Vector2(topWidth + 0.04, rimHeight));
    points.push(new THREE.Vector2(topWidth + 0.02, rimHeight + 0.06));
    points.push(new THREE.Vector2(topWidth - 0.02, rimHeight + 0.06));
    
    return points;
  }, [variant]);

  // Create print wrap geometry that covers the mug body from handle to handle
  const printWrapGeometry = useMemo(() => {
    const isLarge = variant.id === '15oz';
    const bottomRadius = isLarge ? 0.88 : 0.78;
    const topRadius = isLarge ? 1.02 : 0.90;
    const height = isLarge ? 1.9 : 1.65;
    
    // Create a cylinder segment that wraps around the front of the mug
    // The wrap starts and ends at the handle position
    const handleAngle = Math.PI * 0.15; // Small gap for handle
    const wrapAngle = Math.PI * 2 - (handleAngle * 2); // Full wrap minus handle gaps
    
    const radialSegments = 128; // More segments for smoother UV mapping
    
    const geometry = new THREE.CylinderGeometry(
      topRadius + 0.004,    // Top radius (slightly larger than mug)
      bottomRadius + 0.004, // Bottom radius
      height,
      radialSegments,       // Radial segments for smooth curve
      1,                    // Height segments
      true,                 // Open ended
      handleAngle,          // Start angle (after handle)
      wrapAngle             // Arc length (wraps around to other side of handle)
    );
    
    // Recalculate UVs for proper texture mapping
    // The entire image should map across the visible wrap area
    const uvs = geometry.attributes.uv;
    const positions = geometry.attributes.position;
    
    for (let i = 0; i < uvs.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);
      const y = positions.getY(i);
      
      // Calculate angle from center relative to handle position
      let angle = Math.atan2(z, x);
      if (angle < 0) angle += Math.PI * 2;
      
      // Normalize to get U coordinate (0 to 1 across the wrap)
      // Subtract handleAngle to start from 0, divide by wrapAngle to normalize
      let u = (angle - handleAngle) / wrapAngle;
      
      // Clamp and ensure proper range
      u = Math.max(0, Math.min(1, u));
      
      // V coordinate based on height (0 at bottom, 1 at top)
      const v = (y / height) + 0.5;
      
      uvs.setXY(i, u, v);
    }
    
    uvs.needsUpdate = true;
    
    return geometry;
  }, [variant]);

  const isLarge = variant.id === '15oz';
  const handleRadius = isLarge ? 0.52 : 0.46;
  const mugHeight = isLarge ? 2.5 : 2.2;

  return (
    <Float speed={0.6} rotationIntensity={0.015} floatIntensity={0.08}>
      <group ref={meshRef} scale={1.1}>
        {/* Main Mug Body */}
        <mesh position={[0, -mugHeight / 2, 0]} castShadow receiveShadow>
          <latheGeometry args={[mugProfile, 64]} />
          <meshStandardMaterial 
            color={color}
            roughness={0.12}
            metalness={0.01}
            envMapIntensity={0.9}
          />
        </mesh>
        
        {/* Inner cavity - dark interior */}
        <mesh position={[0, isLarge ? 0.55 : 0.4, 0]}>
          <cylinderGeometry args={[
            isLarge ? 0.88 : 0.78, 
            isLarge ? 0.78 : 0.68, 
            isLarge ? 2.3 : 2.0, 
            48, 
            1, 
            true
          ]} />
          <meshStandardMaterial 
            color="#1a1a1a" 
            roughness={0.5}
            side={THREE.BackSide}
          />
        </mesh>
        
        {/* Coffee/liquid surface */}
        <mesh 
          position={[0, isLarge ? 1.1 : 0.9, 0]} 
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[isLarge ? 0.8 : 0.7, 48]} />
          <meshStandardMaterial 
            color="#2a1810" 
            roughness={0.85} 
            metalness={0.1}
          />
        </mesh>
        
        {/* Handle - positioned at the back */}
        <group position={[isLarge ? 1.1 : 1.0, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
          <mesh castShadow>
            <torusGeometry args={[handleRadius, 0.095, 16, 32, Math.PI * 0.92]} />
            <meshStandardMaterial 
              color={color} 
              roughness={0.12} 
              metalness={0.01}
              envMapIntensity={0.9}
            />
          </mesh>
        </group>
        
        {/* Print Area Wrap - wraps from one side of handle to the other */}
        {texture && (
          <mesh 
            position={[0, isLarge ? 0.45 : 0.3, 0]}
            rotation={[0, Math.PI, 0]} // Rotate to align with handle position
          >
            <primitive object={printWrapGeometry} attach="geometry" />
            <meshStandardMaterial 
              map={texture}
              transparent
              opacity={0.97}
              roughness={0.18}
              side={THREE.FrontSide}
              depthWrite={true}
            />
          </mesh>
        )}
      </group>
    </Float>
  );
});

RealisticMug.displayName = 'RealisticMug';

interface SceneProps extends MugPreview3DProps {}

// Scene component
const Scene = forwardRef<THREE.Group, SceneProps>(({ canvasTexture, variant, mugColor }, ref) => {
  return (
    <>
      {/* Studio Lighting */}
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
      <spotLight 
        position={[-5, 5, -5]} 
        angle={0.3} 
        penumbra={1} 
        intensity={0.45}
        color="#ffeedd"
      />
      <pointLight position={[0, 6, 0]} intensity={0.35} />
      <pointLight position={[-4, 3, 5]} intensity={0.2} color="#fff5ee" />
      
      <Suspense fallback={<LoadingSpinner />}>
        <RealisticMug 
          textureUrl={canvasTexture}
          color={mugColor || '#ffffff'}
          variant={variant}
        />
        
        <ContactShadows 
          position={[0, -2.3, 0]} 
          opacity={0.45} 
          scale={10} 
          blur={2.4} 
          far={5}
          color="#000000"
        />
        <Environment preset="studio" environmentIntensity={0.55} />
      </Suspense>
      
      <OrbitControls 
        enableZoom={true}
        enablePan={false}
        minDistance={4}
        maxDistance={10}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.6}
        autoRotate={false}
        makeDefault
      />
    </>
  );
});

Scene.displayName = 'Scene';

export function MugPreview3D({ canvasTexture, variant, mugColor = '#ffffff' }: MugPreview3DProps) {
  return (
    <div className="relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden bg-gradient-to-br from-muted/30 via-background to-muted/20">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      
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
        />
      </Canvas>
      
      {/* Rotation hint */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-muted-foreground bg-background/80 backdrop-blur px-3 py-1.5 rounded-full">
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
}
