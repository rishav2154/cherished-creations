import { Suspense, useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  ContactShadows, 
  Html, 
  Text,
  Float,
  Center
} from '@react-three/drei';
import * as THREE from 'three';
import { Loader2 } from 'lucide-react';

interface ImageTransform {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

interface ProductViewer3DProps {
  productType: 'tshirt' | 'mug' | 'frame' | 'phone' | 'poster' | 'combo';
  color?: string;
  customImage?: string | null;
  customText?: string;
  textColor?: string;
  fontFamily?: string;
  imageTransform?: ImageTransform;
}

function LoadingSpinner() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-accent/20 rounded-full" />
          <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-accent rounded-full animate-spin" />
        </div>
        <span className="text-sm font-medium text-muted-foreground">Loading 3D Model...</span>
      </div>
    </Html>
  );
}

// Procedural T-Shirt Model - No FBX dependency
function TShirtModel({ 
  color, 
  customImage, 
  customText, 
  textColor,
  imageTransform = { x: 0, y: 0, scale: 1, rotation: 0 }
}: { 
  color: string; 
  customImage?: string | null;
  customText?: string;
  textColor?: string;
  imageTransform?: ImageTransform;
}) {
  const meshRef = useRef<THREE.Group>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  
  // Load texture from uploaded image
  useEffect(() => {
    if (!customImage) {
      setTexture(null);
      return;
    }
    
    const loader = new THREE.TextureLoader();
    loader.load(
      customImage,
      (loadedTexture) => {
        loadedTexture.colorSpace = THREE.SRGBColorSpace;
        loadedTexture.needsUpdate = true;
        setTexture(loadedTexture);
      },
      undefined,
      (err) => console.error('Error loading texture:', err)
    );
    
    return () => {
      texture?.dispose();
    };
  }, [customImage]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
    }
  });

  // Image transform calculations
  const imageScale = 0.9 * imageTransform.scale;
  const imageX = imageTransform.x * 0.3;
  const imageY = 0.3 + imageTransform.y * 0.3;

  return (
    <Float speed={1} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={meshRef} scale={1.4} position={[0, -0.3, 0]}>
        {/* Main Body - Torso */}
        <mesh castShadow receiveShadow position={[0, 0, 0]}>
          <boxGeometry args={[1.6, 2, 0.5]} />
          <meshStandardMaterial 
            color={color} 
            roughness={0.9} 
            metalness={0}
            side={THREE.DoubleSide}
          />
        </mesh>
        
        {/* Front panel curve effect */}
        <mesh position={[0, 0, 0.26]} castShadow>
          <planeGeometry args={[1.58, 1.98]} />
          <meshStandardMaterial 
            color={color} 
            roughness={0.85} 
            metalness={0}
          />
        </mesh>
        
        {/* Collar - V-neck style */}
        <mesh position={[0, 0.95, 0.15]} rotation={[0.3, 0, 0]}>
          <torusGeometry args={[0.25, 0.06, 8, 32, Math.PI]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
        
        {/* Neck opening */}
        <mesh position={[0, 1.02, 0.1]}>
          <cylinderGeometry args={[0.22, 0.28, 0.15, 32]} />
          <meshStandardMaterial 
            color={color} 
            roughness={0.85}
            side={THREE.DoubleSide}
          />
        </mesh>
        
        {/* Left Sleeve */}
        <group position={[-1.0, 0.55, 0]} rotation={[0, 0, 0.4]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.32, 0.38, 0.7, 16]} />
            <meshStandardMaterial color={color} roughness={0.9} />
          </mesh>
          {/* Sleeve hem */}
          <mesh position={[0, -0.38, 0]}>
            <torusGeometry args={[0.32, 0.03, 8, 32]} />
            <meshStandardMaterial color={color} roughness={0.85} />
          </mesh>
        </group>
        
        {/* Right Sleeve */}
        <group position={[1.0, 0.55, 0]} rotation={[0, 0, -0.4]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.32, 0.38, 0.7, 16]} />
            <meshStandardMaterial color={color} roughness={0.9} />
          </mesh>
          {/* Sleeve hem */}
          <mesh position={[0, -0.38, 0]}>
            <torusGeometry args={[0.32, 0.03, 8, 32]} />
            <meshStandardMaterial color={color} roughness={0.85} />
          </mesh>
        </group>
        
        {/* Bottom hem */}
        <mesh position={[0, -1.02, 0]}>
          <boxGeometry args={[1.62, 0.08, 0.52]} />
          <meshStandardMaterial color={color} roughness={0.85} />
        </mesh>
        
        {/* Shoulder seams - left */}
        <mesh position={[-0.65, 0.85, 0.1]} rotation={[0, 0, 0.3]}>
          <boxGeometry args={[0.5, 0.04, 0.02]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
        
        {/* Shoulder seams - right */}
        <mesh position={[0.65, 0.85, 0.1]} rotation={[0, 0, -0.3]}>
          <boxGeometry args={[0.5, 0.04, 0.02]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
        
        {/* Custom Image on chest - VISIBLE! */}
        {texture && (
          <mesh 
            position={[imageX, imageY, 0.28]} 
            rotation={[0, 0, (imageTransform.rotation * Math.PI) / 180]}
          >
            <planeGeometry args={[imageScale, imageScale]} />
            <meshBasicMaterial 
              map={texture} 
              transparent
              toneMapped={false}
            />
          </mesh>
        )}
        
        {/* Custom Text */}
        {customText && (
          <Text
            position={[0, texture ? imageY - imageScale / 2 - 0.15 : 0.2, 0.28]}
            fontSize={0.12}
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
    </Float>
  );
}

// Realistic Ceramic Mug with glossy finish
function MugModel({ 
  color, 
  customImage, 
  customText, 
  textColor,
  imageTransform = { x: 0, y: 0, scale: 1, rotation: 0 }
}: { 
  color: string; 
  customImage?: string | null;
  customText?: string;
  textColor?: string;
  imageTransform?: ImageTransform;
}) {
  const meshRef = useRef<THREE.Group>(null);
  
  const texture = useMemo(() => {
    if (!customImage) return null;
    const tex = new THREE.TextureLoader().load(customImage);
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [customImage]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  const imageScale = 1.0 * imageTransform.scale;

  return (
    <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.2}>
      <group ref={meshRef} scale={1.2}>
        {/* Outer Mug Body - Ceramic look */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.9, 0.8, 2.2, 48]} />
          <meshStandardMaterial 
            color={color} 
            roughness={0.15} 
            metalness={0.05}
            envMapIntensity={0.8}
          />
        </mesh>
        
        {/* Inner Mug - Dark interior */}
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.78, 0.7, 1.9, 48]} />
          <meshStandardMaterial 
            color="#1a1a1a" 
            roughness={0.3} 
            metalness={0.1}
            side={THREE.BackSide}
          />
        </mesh>
        
        {/* Rim highlight */}
        <mesh position={[0, 1.08, 0]}>
          <torusGeometry args={[0.84, 0.06, 12, 48]} />
          <meshStandardMaterial 
            color={color} 
            roughness={0.1} 
            metalness={0.1}
          />
        </mesh>
        
        {/* Handle - Smooth curved */}
        <mesh position={[1.05, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <torusGeometry args={[0.45, 0.12, 16, 32, Math.PI]} />
          <meshStandardMaterial 
            color={color} 
            roughness={0.15} 
            metalness={0.05}
          />
        </mesh>
        
        {/* Custom Image on mug - Curved appearance */}
        {texture && (
          <mesh 
            position={[imageTransform.x * 0.3, 0.1 + imageTransform.y * 0.3, 0.92]} 
            rotation={[0, 0, imageTransform.rotation * Math.PI / 180]}
          >
            <planeGeometry args={[imageScale, imageScale]} />
            <meshStandardMaterial 
              map={texture} 
              transparent 
              opacity={0.92}
              roughness={0.2}
            />
          </mesh>
        )}
        
        {/* Custom Text */}
        {customText && (
          <Text
            position={[0, customImage ? -0.6 : 0.1, 0.92]}
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
        
        {/* Bottom base */}
        <mesh position={[0, -1.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.78, 48]} />
          <meshStandardMaterial color="#e5e5e5" roughness={0.6} />
        </mesh>
      </group>
    </Float>
  );
}

// Elegant Photo Frame with wood/metal finish
function FrameModel({ 
  color, 
  customImage,
  imageTransform = { x: 0, y: 0, scale: 1, rotation: 0 }
}: { 
  color: string; 
  customImage?: string | null;
  imageTransform?: ImageTransform;
}) {
  const meshRef = useRef<THREE.Group>(null);
  
  const texture = useMemo(() => {
    if (!customImage) return null;
    const tex = new THREE.TextureLoader().load(customImage);
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [customImage]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.15;
    }
  });

  const imageScale = imageTransform.scale;

  // Determine if color is dark for frame profile
  const isMetallic = color === '#ca8a04' || color === '#1a1a1a';

  return (
    <Float speed={0.8} rotationIntensity={0.08} floatIntensity={0.15}>
      <group ref={meshRef} scale={1.1}>
        {/* Outer Frame Border */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.8, 3.6, 0.2]} />
          <meshStandardMaterial 
            color={color} 
            roughness={isMetallic ? 0.25 : 0.5} 
            metalness={isMetallic ? 0.7 : 0.1}
            envMapIntensity={1}
          />
        </mesh>
        
        {/* Frame bevels - top */}
        <mesh position={[0, 1.6, 0.11]}>
          <boxGeometry args={[2.5, 0.18, 0.08]} />
          <meshStandardMaterial color={color} roughness={0.4} metalness={isMetallic ? 0.5 : 0} />
        </mesh>
        {/* Frame bevels - bottom */}
        <mesh position={[0, -1.6, 0.11]}>
          <boxGeometry args={[2.5, 0.18, 0.08]} />
          <meshStandardMaterial color={color} roughness={0.4} metalness={isMetallic ? 0.5 : 0} />
        </mesh>
        {/* Frame bevels - left */}
        <mesh position={[-1.25, 0, 0.11]}>
          <boxGeometry args={[0.18, 3.05, 0.08]} />
          <meshStandardMaterial color={color} roughness={0.4} metalness={isMetallic ? 0.5 : 0} />
        </mesh>
        {/* Frame bevels - right */}
        <mesh position={[1.25, 0, 0.11]}>
          <boxGeometry args={[0.18, 3.05, 0.08]} />
          <meshStandardMaterial color={color} roughness={0.4} metalness={isMetallic ? 0.5 : 0} />
        </mesh>
        
        {/* Inner mat */}
        <mesh position={[0, 0, 0.08]}>
          <boxGeometry args={[2.2, 3, 0.04]} />
          <meshStandardMaterial color="#fafafa" roughness={0.95} />
        </mesh>
        
        {/* Glass effect */}
        <mesh position={[0, 0, 0.12]}>
          <planeGeometry args={[2.1, 2.9]} />
          <meshStandardMaterial 
            color="#ffffff"
            transparent
            opacity={0.08}
            roughness={0}
            metalness={1}
          />
        </mesh>
        
        {/* Photo/Custom Image */}
        <mesh 
          position={[imageTransform.x * 0.3, imageTransform.y * 0.4, 0.1]} 
          rotation={[0, 0, imageTransform.rotation * Math.PI / 180]}
        >
          <planeGeometry args={[2 * imageScale, 2.8 * imageScale]} />
          {texture ? (
            <meshStandardMaterial map={texture} roughness={0.5} />
          ) : (
            <meshStandardMaterial color="#d4d4d4" roughness={0.8} />
          )}
        </mesh>
        
        {/* Frame Stand */}
        <mesh position={[0, -1.9, -0.4]} rotation={[Math.PI / 5, 0, 0]} castShadow>
          <boxGeometry args={[0.9, 1.5, 0.08]} />
          <meshStandardMaterial 
            color={color} 
            roughness={isMetallic ? 0.25 : 0.5} 
            metalness={isMetallic ? 0.7 : 0.1}
          />
        </mesh>
      </group>
    </Float>
  );
}

// Premium Phone Case with realistic details
function PhoneModel({ 
  color, 
  customImage, 
  customText, 
  textColor,
  imageTransform = { x: 0, y: 0, scale: 1, rotation: 0 }
}: { 
  color: string;
  customImage?: string | null;
  customText?: string;
  textColor?: string;
  imageTransform?: ImageTransform;
}) {
  const meshRef = useRef<THREE.Group>(null);
  
  const texture = useMemo(() => {
    if (!customImage) return null;
    const tex = new THREE.TextureLoader().load(customImage);
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [customImage]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    }
  });

  const imageScale = 1.0 * imageTransform.scale;

  return (
    <Float speed={1.2} rotationIntensity={0.12} floatIntensity={0.25}>
      <group ref={meshRef} scale={1.15}>
        {/* Phone Case Back - Main body */}
        <mesh position={[0, 0, -0.1]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 3, 0.12]} />
          <meshStandardMaterial 
            color={color} 
            roughness={0.4} 
            metalness={0.15}
            envMapIntensity={0.6}
          />
        </mesh>
        
        {/* Case edge - left */}
        <mesh position={[-0.73, 0, -0.02]}>
          <boxGeometry args={[0.08, 2.95, 0.28]} />
          <meshStandardMaterial color={color} roughness={0.35} metalness={0.2} />
        </mesh>
        {/* Case edge - right */}
        <mesh position={[0.73, 0, -0.02]}>
          <boxGeometry args={[0.08, 2.95, 0.28]} />
          <meshStandardMaterial color={color} roughness={0.35} metalness={0.2} />
        </mesh>
        {/* Case edge - top */}
        <mesh position={[0, 1.45, -0.02]}>
          <boxGeometry args={[1.38, 0.08, 0.28]} />
          <meshStandardMaterial color={color} roughness={0.35} metalness={0.2} />
        </mesh>
        {/* Case edge - bottom */}
        <mesh position={[0, -1.45, -0.02]}>
          <boxGeometry args={[1.38, 0.08, 0.28]} />
          <meshStandardMaterial color={color} roughness={0.35} metalness={0.2} />
        </mesh>
        
        {/* Phone Screen - Super glossy */}
        <mesh position={[0, 0, 0.06]}>
          <boxGeometry args={[1.38, 2.85, 0.04]} />
          <meshStandardMaterial 
            color="#050505" 
            roughness={0.02} 
            metalness={0.95}
            envMapIntensity={1.5}
          />
        </mesh>
        
        {/* Screen bezel */}
        <mesh position={[0, 0, 0.08]}>
          <planeGeometry args={[1.3, 2.75]} />
          <meshStandardMaterial color="#111111" roughness={0.05} metalness={0.8} />
        </mesh>
        
        {/* Camera Module - Island style */}
        <mesh position={[-0.4, 1.05, -0.18]} castShadow>
          <boxGeometry args={[0.6, 0.75, 0.08]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.8} />
        </mesh>
        
        {/* Camera lenses */}
        <mesh position={[-0.5, 1.2, -0.24]}>
          <cylinderGeometry args={[0.12, 0.12, 0.04, 24]} />
          <meshStandardMaterial color="#1a2040" roughness={0.05} metalness={0.95} />
        </mesh>
        <mesh position={[-0.5, 1.2, -0.26]}>
          <cylinderGeometry args={[0.08, 0.08, 0.02, 24]} />
          <meshStandardMaterial color="#0a0a15" roughness={0} metalness={1} />
        </mesh>
        <mesh position={[-0.3, 1.2, -0.24]}>
          <cylinderGeometry args={[0.12, 0.12, 0.04, 24]} />
          <meshStandardMaterial color="#1a2040" roughness={0.05} metalness={0.95} />
        </mesh>
        <mesh position={[-0.3, 1.2, -0.26]}>
          <cylinderGeometry args={[0.08, 0.08, 0.02, 24]} />
          <meshStandardMaterial color="#0a0a15" roughness={0} metalness={1} />
        </mesh>
        <mesh position={[-0.4, 0.95, -0.24]}>
          <cylinderGeometry args={[0.1, 0.1, 0.04, 24]} />
          <meshStandardMaterial color="#1a2040" roughness={0.05} metalness={0.95} />
        </mesh>
        
        {/* Flash */}
        <mesh position={[-0.55, 0.95, -0.22]}>
          <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
          <meshStandardMaterial color="#fffae6" roughness={0.2} emissive="#fffae6" emissiveIntensity={0.1} />
        </mesh>
        
        {/* Custom Image on back */}
        {texture && (
          <mesh 
            position={[imageTransform.x * 0.2, -0.3 + imageTransform.y * 0.3, -0.17]} 
            rotation={[0, Math.PI, imageTransform.rotation * Math.PI / 180]}
          >
            <planeGeometry args={[imageScale, imageScale * 1.3]} />
            <meshStandardMaterial map={texture} transparent opacity={0.95} roughness={0.4} />
          </mesh>
        )}
        
        {/* Custom Text on back */}
        {customText && (
          <Text
            position={[0, customImage ? -1.1 : -0.3, -0.17]}
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
    </Float>
  );
}

// High-Quality Poster with paper texture
function PosterModel({ 
  color, 
  customImage, 
  customText, 
  textColor,
  imageTransform = { x: 0, y: 0, scale: 1, rotation: 0 }
}: { 
  color: string;
  customImage?: string | null;
  customText?: string;
  textColor?: string;
  imageTransform?: ImageTransform;
}) {
  const meshRef = useRef<THREE.Group>(null);
  
  const texture = useMemo(() => {
    if (!customImage) return null;
    const tex = new THREE.TextureLoader().load(customImage);
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [customImage]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.12;
    }
  });

  const imageScale = imageTransform.scale;

  return (
    <Float speed={0.6} rotationIntensity={0.06} floatIntensity={0.1}>
      <group ref={meshRef} scale={1.05}>
        {/* Poster Paper */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.6, 3.8, 0.02]} />
          <meshStandardMaterial 
            color="#fefefe" 
            roughness={0.95}
            metalness={0}
          />
        </mesh>
        
        {/* Slight curl effect - top corners */}
        <mesh position={[-1.25, 1.85, 0.04]} rotation={[0.1, 0, -0.1]}>
          <boxGeometry args={[0.15, 0.15, 0.01]} />
          <meshStandardMaterial color="#fafafa" roughness={0.9} />
        </mesh>
        <mesh position={[1.25, 1.85, 0.04]} rotation={[0.1, 0, 0.1]}>
          <boxGeometry args={[0.15, 0.15, 0.01]} />
          <meshStandardMaterial color="#fafafa" roughness={0.9} />
        </mesh>
        
        {/* Custom Image - Full poster print */}
        {texture ? (
          <mesh 
            position={[imageTransform.x * 0.3, imageTransform.y * 0.4, 0.015]} 
            rotation={[0, 0, imageTransform.rotation * Math.PI / 180]}
          >
            <planeGeometry args={[2.4 * imageScale, 3.6 * imageScale]} />
            <meshStandardMaterial map={texture} roughness={0.8} />
          </mesh>
        ) : (
          <mesh position={[0, 0, 0.015]}>
            <planeGeometry args={[2.4, 3.6]} />
            <meshStandardMaterial color={color} roughness={0.75} />
          </mesh>
        )}
        
        {/* Custom Text overlay */}
        {customText && (
          <Text
            position={[0, -1.5, 0.02]}
            fontSize={0.18}
            color={textColor || '#1a1a1a'}
            anchorX="center"
            anchorY="middle"
            maxWidth={2.2}
            textAlign="center"
          >
            {customText}
          </Text>
        )}
        
        {/* Paper shadow edge */}
        <mesh position={[0, 0, -0.015]}>
          <planeGeometry args={[2.65, 3.85]} />
          <meshBasicMaterial color="#00000015" transparent opacity={0.1} />
        </mesh>
      </group>
    </Float>
  );
}

// Premium Gift Combo Box
function ComboModel({ color }: { color: string }) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
      <group ref={meshRef} scale={1.1}>
        {/* Box Body - Matte luxury finish */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.4, 1.8, 2.4]} />
          <meshStandardMaterial 
            color={color} 
            roughness={0.6} 
            metalness={0.15}
            envMapIntensity={0.4}
          />
        </mesh>
        
        {/* Box Lid */}
        <mesh position={[0, 1, 0]} castShadow>
          <boxGeometry args={[2.5, 0.22, 2.5]} />
          <meshStandardMaterial 
            color={color} 
            roughness={0.5} 
            metalness={0.2}
          />
        </mesh>
        
        {/* Lid edge detail */}
        <mesh position={[0, 0.88, 0]}>
          <boxGeometry args={[2.52, 0.04, 2.52]} />
          <meshStandardMaterial color="#ffffff20" transparent opacity={0.2} roughness={0.2} metalness={0.5} />
        </mesh>
        
        {/* Satin Ribbon Horizontal */}
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[2.55, 0.35, 0.1]} />
          <meshStandardMaterial 
            color="#DD2476" 
            roughness={0.25} 
            metalness={0.5}
            envMapIntensity={0.8}
          />
        </mesh>
        
        {/* Satin Ribbon Vertical */}
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[0.1, 0.35, 2.55]} />
          <meshStandardMaterial 
            color="#DD2476" 
            roughness={0.25} 
            metalness={0.5}
          />
        </mesh>
        
        {/* Elegant Bow - Left loop */}
        <mesh position={[-0.35, 1.3, 0]} rotation={[0, 0, Math.PI / 3.5]} castShadow>
          <torusGeometry args={[0.22, 0.08, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#DD2476" roughness={0.3} metalness={0.4} />
        </mesh>
        
        {/* Bow - Right loop */}
        <mesh position={[0.35, 1.3, 0]} rotation={[0, 0, -Math.PI / 3.5]} castShadow>
          <torusGeometry args={[0.22, 0.08, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#DD2476" roughness={0.3} metalness={0.4} />
        </mesh>
        
        {/* Bow center knot */}
        <mesh position={[0, 1.25, 0]} castShadow>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial color="#DD2476" roughness={0.3} metalness={0.4} />
        </mesh>
        
        {/* Ribbon tails */}
        <mesh position={[-0.15, 1.1, 0]} rotation={[0, 0, 0.3]}>
          <boxGeometry args={[0.08, 0.4, 0.06]} />
          <meshStandardMaterial color="#DD2476" roughness={0.3} metalness={0.4} />
        </mesh>
        <mesh position={[0.15, 1.1, 0]} rotation={[0, 0, -0.3]}>
          <boxGeometry args={[0.08, 0.4, 0.06]} />
          <meshStandardMaterial color="#DD2476" roughness={0.3} metalness={0.4} />
        </mesh>
      </group>
    </Float>
  );
}

function Scene({ productType, color, customImage, customText, textColor, imageTransform }: ProductViewer3DProps & { imageTransform?: ImageTransform }) {
  const productColor = color || '#ffffff';
  const transform = imageTransform || { x: 0, y: 0, scale: 1, rotation: 0 };

  return (
    <>
      {/* Enhanced Lighting Setup */}
      <ambientLight intensity={0.4} />
      <spotLight 
        position={[5, 8, 5]} 
        angle={0.25} 
        penumbra={1} 
        intensity={1.5} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
      />
      <spotLight 
        position={[-5, 5, -5]} 
        angle={0.3} 
        penumbra={1} 
        intensity={0.6}
      />
      <pointLight position={[0, 5, 0]} intensity={0.4} color="#ffffff" />
      <pointLight position={[-3, 2, 4]} intensity={0.3} color="#ffeedd" />
      
      <Suspense fallback={<LoadingSpinner />}>
        <Center>
          {productType === 'tshirt' && (
            <TShirtModel 
              color={productColor} 
              customImage={customImage} 
              customText={customText} 
              textColor={textColor}
              imageTransform={transform}
            />
          )}
          {productType === 'mug' && (
            <MugModel 
              color={productColor} 
              customImage={customImage} 
              customText={customText} 
              textColor={textColor}
              imageTransform={transform}
            />
          )}
          {productType === 'frame' && (
            <FrameModel 
              color={productColor} 
              customImage={customImage}
              imageTransform={transform}
            />
          )}
          {productType === 'phone' && (
            <PhoneModel 
              color={productColor} 
              customImage={customImage} 
              customText={customText} 
              textColor={textColor}
              imageTransform={transform}
            />
          )}
          {productType === 'poster' && (
            <PosterModel 
              color={productColor} 
              customImage={customImage} 
              customText={customText} 
              textColor={textColor}
              imageTransform={transform}
            />
          )}
          {productType === 'combo' && <ComboModel color={productColor} />}
        </Center>
        
        <ContactShadows 
          position={[0, -2.5, 0]} 
          opacity={0.6} 
          scale={8} 
          blur={2.5} 
          far={5}
          color="#000000"
        />
        <Environment preset="studio" environmentIntensity={0.5} />
      </Suspense>
      
      <OrbitControls 
        enableZoom={true} 
        enablePan={false} 
        minDistance={3.5} 
        maxDistance={12}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.4}
        autoRotate={false}
        makeDefault
      />
    </>
  );
}

export default function ProductViewer3D({ 
  productType, 
  color, 
  customImage, 
  customText, 
  textColor, 
  fontFamily,
  imageTransform
}: ProductViewer3DProps) {
  return (
    <div className="relative w-full h-full min-h-[450px] rounded-3xl overflow-hidden bg-gradient-to-br from-muted/30 via-background to-muted/20">
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      
      <Canvas
        camera={{ position: [0, 0, 7], fov: 40 }}
        dpr={[1, 2]}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance"
        }}
        shadows
      >
        <Scene 
          productType={productType} 
          color={color} 
          customImage={customImage} 
          customText={customText}
          textColor={textColor}
          fontFamily={fontFamily}
          imageTransform={imageTransform}
        />
      </Canvas>
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted-foreground bg-card/95 px-5 py-2.5 rounded-full backdrop-blur-md border border-border/50 shadow-lg">
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
          Drag to rotate • Scroll to zoom
        </span>
      </div>
    </div>
  );
}
