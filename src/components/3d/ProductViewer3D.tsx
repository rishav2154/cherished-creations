import { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html, Center, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Loader2 } from 'lucide-react';

interface ProductViewer3DProps {
  productType: 'tshirt' | 'mug' | 'frame' | 'phone' | 'poster' | 'combo';
  color?: string;
  customImage?: string | null;
  customText?: string;
  textColor?: string;
  fontFamily?: string;
}

function LoadingSpinner() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <span className="text-sm text-muted-foreground">Loading 3D Model...</span>
      </div>
    </Html>
  );
}

// T-Shirt Model with texture support
function TShirtModel({ color, customImage, customText, textColor }: { 
  color: string; 
  customImage?: string | null;
  customText?: string;
  textColor?: string;
}) {
  const meshRef = useRef<THREE.Group>(null);
  
  const texture = useMemo(() => {
    if (!customImage) return null;
    const tex = new THREE.TextureLoader().load(customImage);
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }, [customImage]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
    }
  });

  return (
    <group ref={meshRef}>
      {/* T-Shirt Body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.2, 2.8, 0.25]} />
        <meshStandardMaterial color={color} roughness={0.9} metalness={0} />
      </mesh>
      {/* Left Sleeve */}
      <mesh position={[-1.4, 0.9, 0]} rotation={[0, 0, Math.PI / 5]}>
        <boxGeometry args={[0.9, 0.7, 0.22]} />
        <meshStandardMaterial color={color} roughness={0.9} metalness={0} />
      </mesh>
      {/* Right Sleeve */}
      <mesh position={[1.4, 0.9, 0]} rotation={[0, 0, -Math.PI / 5]}>
        <boxGeometry args={[0.9, 0.7, 0.22]} />
        <meshStandardMaterial color={color} roughness={0.9} metalness={0} />
      </mesh>
      {/* Collar */}
      <mesh position={[0, 1.3, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.35, 0.08, 8, 24, Math.PI]} />
        <meshStandardMaterial color={color} roughness={0.9} metalness={0} />
      </mesh>
      
      {/* Custom Image on shirt */}
      {texture && (
        <mesh position={[0, 0.2, 0.14]}>
          <planeGeometry args={[1.4, 1.4]} />
          <meshBasicMaterial map={texture} transparent opacity={0.95} />
        </mesh>
      )}
      
      {/* Custom Text */}
      {customText && (
        <Text
          position={[0, customImage ? -0.7 : 0.2, 0.14]}
          fontSize={0.18}
          color={textColor || '#ffffff'}
          anchorX="center"
          anchorY="middle"
          maxWidth={1.8}
          textAlign="center"
        >
          {customText}
        </Text>
      )}
    </group>
  );
}

// Mug Model with custom design
function MugModel({ color, customImage, customText, textColor }: { 
  color: string; 
  customImage?: string | null;
  customText?: string;
  textColor?: string;
}) {
  const meshRef = useRef<THREE.Group>(null);
  
  const texture = useMemo(() => {
    if (!customImage) return null;
    const tex = new THREE.TextureLoader().load(customImage);
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }, [customImage]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.008;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Mug Body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.85, 0.75, 2, 32]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
      </mesh>
      {/* Inner Mug */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.75, 0.65, 1.7, 32]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.2} />
      </mesh>
      {/* Handle */}
      <mesh position={[1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.4, 0.12, 12, 24, Math.PI]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
      </mesh>
      
      {/* Custom Image on mug */}
      {texture && (
        <mesh position={[0, 0.1, 0.87]} rotation={[0, 0, 0]}>
          <planeGeometry args={[1.2, 1.2]} />
          <meshBasicMaterial map={texture} transparent opacity={0.95} />
        </mesh>
      )}
      
      {/* Custom Text */}
      {customText && (
        <Text
          position={[0, customImage ? -0.6 : 0.1, 0.87]}
          fontSize={0.14}
          color={textColor || '#ffffff'}
          anchorX="center"
          anchorY="middle"
          maxWidth={1.4}
          textAlign="center"
        >
          {customText}
        </Text>
      )}
    </group>
  );
}

// Photo Frame Model
function FrameModel({ color, customImage }: { color: string; customImage?: string | null }) {
  const meshRef = useRef<THREE.Group>(null);
  
  const texture = useMemo(() => {
    if (!customImage) return null;
    const tex = new THREE.TextureLoader().load(customImage);
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }, [customImage]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.2;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Outer Frame */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.6, 3.4, 0.25]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Inner Cutout */}
      <mesh position={[0, 0, 0.08]}>
        <boxGeometry args={[2, 2.8, 0.15]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      
      {/* Photo/Custom Image */}
      <mesh position={[0, 0, 0.14]}>
        <planeGeometry args={[1.9, 2.7]} />
        {texture ? (
          <meshBasicMaterial map={texture} />
        ) : (
          <meshStandardMaterial color="#3a3a3a" roughness={0.7} />
        )}
      </mesh>
      
      {/* Frame Stand */}
      <mesh position={[0, -1.8, -0.3]} rotation={[Math.PI / 6, 0, 0]}>
        <boxGeometry args={[0.8, 1.2, 0.08]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>
    </group>
  );
}

// Phone Cover Model
function PhoneModel({ color, customImage, customText, textColor }: { 
  color: string;
  customImage?: string | null;
  customText?: string;
  textColor?: string;
}) {
  const meshRef = useRef<THREE.Group>(null);
  
  const texture = useMemo(() => {
    if (!customImage) return null;
    const tex = new THREE.TextureLoader().load(customImage);
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }, [customImage]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.25;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Phone Case Back */}
      <mesh position={[0, 0, -0.08]}>
        <boxGeometry args={[1.4, 2.8, 0.12]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Phone Case Sides */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.5, 2.9, 0.2]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} transparent opacity={0.3} />
      </mesh>
      {/* Phone Screen */}
      <mesh position={[0, 0, 0.03]}>
        <boxGeometry args={[1.3, 2.6, 0.04]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.05} metalness={0.9} />
      </mesh>
      {/* Camera Module */}
      <mesh position={[-0.4, 1.1, -0.16]}>
        <boxGeometry args={[0.5, 0.6, 0.06]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Camera Lens */}
      <mesh position={[-0.4, 1.2, -0.2]}>
        <cylinderGeometry args={[0.1, 0.1, 0.02, 16]} />
        <meshStandardMaterial color="#2a2a4a" roughness={0.1} metalness={0.9} />
      </mesh>
      <mesh position={[-0.4, 1.0, -0.2]}>
        <cylinderGeometry args={[0.1, 0.1, 0.02, 16]} />
        <meshStandardMaterial color="#2a2a4a" roughness={0.1} metalness={0.9} />
      </mesh>
      
      {/* Custom Image on back */}
      {texture && (
        <mesh position={[0, -0.2, -0.15]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[1.1, 1.5]} />
          <meshBasicMaterial map={texture} transparent opacity={0.95} />
        </mesh>
      )}
      
      {/* Custom Text on back */}
      {customText && (
        <Text
          position={[0, customImage ? -1.1 : -0.2, -0.15]}
          rotation={[0, Math.PI, 0]}
          fontSize={0.1}
          color={textColor || '#ffffff'}
          anchorX="center"
          anchorY="middle"
          maxWidth={1.2}
          textAlign="center"
        >
          {customText}
        </Text>
      )}
    </group>
  );
}

// Poster Model
function PosterModel({ color, customImage, customText, textColor }: { 
  color: string;
  customImage?: string | null;
  customText?: string;
  textColor?: string;
}) {
  const meshRef = useRef<THREE.Group>(null);
  
  const texture = useMemo(() => {
    if (!customImage) return null;
    const tex = new THREE.TextureLoader().load(customImage);
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }, [customImage]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.15;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Poster Base */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.4, 3.4, 0.04]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>
      
      {/* Custom Image */}
      {texture ? (
        <mesh position={[0, 0, 0.025]}>
          <planeGeometry args={[2.2, 3.2]} />
          <meshBasicMaterial map={texture} />
        </mesh>
      ) : (
        <mesh position={[0, 0, 0.025]}>
          <planeGeometry args={[2.2, 3.2]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
      )}
      
      {/* Custom Text */}
      {customText && (
        <Text
          position={[0, -1.4, 0.03]}
          fontSize={0.15}
          color={textColor || '#000000'}
          anchorX="center"
          anchorY="middle"
          maxWidth={2}
          textAlign="center"
        >
          {customText}
        </Text>
      )}
    </group>
  );
}

// Combo Gift Box Model
function ComboModel({ color }: { color: string }) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.4;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Box Body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.2, 1.6, 2.2]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.2} />
      </mesh>
      {/* Box Lid */}
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[2.3, 0.2, 2.3]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.2} />
      </mesh>
      {/* Ribbon Horizontal */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[2.35, 0.35, 0.12]} />
        <meshStandardMaterial color="#DD2476" roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Ribbon Vertical */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.12, 0.35, 2.35]} />
        <meshStandardMaterial color="#DD2476" roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Bow Left */}
      <mesh position={[-0.25, 1.15, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.5, 0.2, 0.15]} />
        <meshStandardMaterial color="#DD2476" roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Bow Right */}
      <mesh position={[0.25, 1.15, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[0.5, 0.2, 0.15]} />
        <meshStandardMaterial color="#DD2476" roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Bow Center */}
      <mesh position={[0, 1.15, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#DD2476" roughness={0.3} metalness={0.4} />
      </mesh>
    </group>
  );
}

function Scene({ productType, color, customImage, customText, textColor }: ProductViewer3DProps) {
  const productColor = color || '#ffffff';

  return (
    <>
      <ambientLight intensity={0.6} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.2} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={0.4} />
      <pointLight position={[0, 10, 0]} intensity={0.3} />
      
      <Suspense fallback={<LoadingSpinner />}>
        <Center>
          {productType === 'tshirt' && <TShirtModel color={productColor} customImage={customImage} customText={customText} textColor={textColor} />}
          {productType === 'mug' && <MugModel color={productColor} customImage={customImage} customText={customText} textColor={textColor} />}
          {productType === 'frame' && <FrameModel color={productColor} customImage={customImage} />}
          {productType === 'phone' && <PhoneModel color={productColor} customImage={customImage} customText={customText} textColor={textColor} />}
          {productType === 'poster' && <PosterModel color={productColor} customImage={customImage} customText={customText} textColor={textColor} />}
          {productType === 'combo' && <ComboModel color={productColor} />}
        </Center>
        
        <ContactShadows position={[0, -2.2, 0]} opacity={0.5} scale={6} blur={2.5} far={4} />
        <Environment preset="studio" />
      </Suspense>
      
      <OrbitControls 
        enableZoom={true} 
        enablePan={false} 
        minDistance={3} 
        maxDistance={10}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.5}
        autoRotate={false}
      />
    </>
  );
}

export default function ProductViewer3D({ productType, color, customImage, customText, textColor, fontFamily }: ProductViewer3DProps) {
  return (
    <div className="relative w-full h-full min-h-[450px] rounded-3xl overflow-hidden bg-gradient-to-br from-muted/50 to-muted/20">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene 
          productType={productType} 
          color={color} 
          customImage={customImage} 
          customText={customText}
          textColor={textColor}
          fontFamily={fontFamily}
        />
      </Canvas>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted-foreground bg-card/90 px-4 py-2 rounded-full backdrop-blur-sm border border-border/50">
        🖱️ Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
}
