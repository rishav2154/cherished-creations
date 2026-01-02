import { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html, Center } from '@react-three/drei';
import * as THREE from 'three';
import { Loader2 } from 'lucide-react';

interface ProductViewer3DProps {
  productType: 'tshirt' | 'mug' | 'frame' | 'phone' | 'poster' | 'combo';
  color?: string;
  customImage?: string;
  customText?: string;
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

// T-Shirt Model
function TShirtModel({ color, customText }: { color: string; customText?: string }) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <group ref={meshRef} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      {/* T-Shirt Body */}
      <mesh position={[0, 0, 0]} scale={hovered ? 1.02 : 1}>
        <boxGeometry args={[2, 2.5, 0.3]} />
        <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} />
      </mesh>
      {/* Left Sleeve */}
      <mesh position={[-1.3, 0.8, 0]} rotation={[0, 0, Math.PI / 6]}>
        <boxGeometry args={[0.8, 0.6, 0.25]} />
        <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} />
      </mesh>
      {/* Right Sleeve */}
      <mesh position={[1.3, 0.8, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <boxGeometry args={[0.8, 0.6, 0.25]} />
        <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} />
      </mesh>
      {/* Collar */}
      <mesh position={[0, 1.15, 0.05]}>
        <torusGeometry args={[0.3, 0.08, 8, 24, Math.PI]} />
        <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} />
      </mesh>
      {/* Custom Design Area */}
      {customText && (
        <Html position={[0, 0.2, 0.2]} center transform>
          <div className="text-lg font-bold text-black bg-white/80 px-2 py-1 rounded whitespace-nowrap">
            {customText}
          </div>
        </Html>
      )}
    </group>
  );
}

// Mug Model
function MugModel({ color, customText }: { color: string; customText?: string }) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Mug Body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.8, 0.7, 1.8, 32]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Inner Mug */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.7, 0.6, 1.6, 32]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.2} />
      </mesh>
      {/* Handle */}
      <mesh position={[0.95, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.35, 0.1, 8, 24, Math.PI]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
      </mesh>
      {customText && (
        <Html position={[0, 0, 0.85]} center transform>
          <div className="text-sm font-bold text-white bg-accent/90 px-2 py-1 rounded whitespace-nowrap">
            {customText}
          </div>
        </Html>
      )}
    </group>
  );
}

// Photo Frame Model
function FrameModel({ color }: { color: string }) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.15;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Outer Frame */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.4, 3, 0.2]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Inner Photo Area */}
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[1.8, 2.4, 0.15]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.9} />
      </mesh>
      {/* Photo placeholder */}
      <mesh position={[0, 0, 0.13]}>
        <planeGeometry args={[1.6, 2.2]} />
        <meshStandardMaterial color="#e0e0e0" roughness={0.7} />
      </mesh>
    </group>
  );
}

// Phone Cover Model
function PhoneModel({ color, customText }: { color: string; customText?: string }) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.2;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Phone Body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.2, 2.4, 0.15]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.5} />
      </mesh>
      {/* Screen */}
      <mesh position={[0, 0, 0.08]}>
        <boxGeometry args={[1.0, 2.1, 0.02]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.1} metalness={0.8} />
      </mesh>
      {/* Camera bump */}
      <mesh position={[-0.35, 0.9, -0.1]}>
        <cylinderGeometry args={[0.15, 0.15, 0.05, 16]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.3} metalness={0.7} />
      </mesh>
      {customText && (
        <Html position={[0, 0, 0.1]} center transform>
          <div className="text-xs font-bold text-white bg-accent/90 px-1 py-0.5 rounded whitespace-nowrap">
            {customText}
          </div>
        </Html>
      )}
    </group>
  );
}

// Poster Model
function PosterModel({ color }: { color: string }) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Poster */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.2, 3.2, 0.05]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>
      {/* Art area */}
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[2, 3]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
    </group>
  );
}

// Combo Model (Gift Box)
function ComboModel({ color }: { color: string }) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Box Body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 1.5, 2]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.2} />
      </mesh>
      {/* Ribbon Horizontal */}
      <mesh position={[0, 0.76, 0]}>
        <boxGeometry args={[2.05, 0.1, 0.3]} />
        <meshStandardMaterial color="#DD2476" roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Ribbon Vertical */}
      <mesh position={[0, 0.76, 0]}>
        <boxGeometry args={[0.3, 0.1, 2.05]} />
        <meshStandardMaterial color="#DD2476" roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Bow */}
      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#DD2476" roughness={0.3} metalness={0.4} />
      </mesh>
    </group>
  );
}

function Scene({ productType, color, customText }: ProductViewer3DProps) {
  const productColor = color || '#ffffff';

  return (
    <>
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      
      <Suspense fallback={<LoadingSpinner />}>
        <Center>
          {productType === 'tshirt' && <TShirtModel color={productColor} customText={customText} />}
          {productType === 'mug' && <MugModel color={productColor} customText={customText} />}
          {productType === 'frame' && <FrameModel color={productColor} />}
          {productType === 'phone' && <PhoneModel color={productColor} customText={customText} />}
          {productType === 'poster' && <PosterModel color={productColor} />}
          {productType === 'combo' && <ComboModel color={productColor} />}
        </Center>
        
        <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={5} blur={2.5} far={4} />
        <Environment preset="studio" />
      </Suspense>
      
      <OrbitControls 
        enableZoom={true} 
        enablePan={false} 
        minDistance={3} 
        maxDistance={8}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.5}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
}

export default function ProductViewer3D({ productType, color, customImage, customText }: ProductViewer3DProps) {
  return (
    <div className="relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden glass-card">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene productType={productType} color={color} customImage={customImage} customText={customText} />
      </Canvas>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted-foreground bg-card/80 px-3 py-1 rounded-full backdrop-blur-sm">
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
}
