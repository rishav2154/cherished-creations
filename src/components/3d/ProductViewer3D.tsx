import { Suspense, useRef, useMemo } from 'react';
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
  productType: 'mug' | 'frame' | 'phone' | 'keychain-heart' | 'keychain-circle' | 'keychain-square' | 'keychain-cubes' | 'night-lamp' | 'frame-6x8';
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

// Realistic Ceramic Mug with glossy finish (Magic Cup)
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
  imageTransform = { x: 0, y: 0, scale: 1, rotation: 0 },
  size = '7x5'
}: { 
  color: string; 
  customImage?: string | null;
  imageTransform?: ImageTransform;
  size?: '7x5' | '6x8';
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
  const isMetallic = color === '#ca8a04' || color === '#1a1a1a';
  
  // Different dimensions based on size
  const frameWidth = size === '6x8' ? 2.4 : 2.8;
  const frameHeight = size === '6x8' ? 3.2 : 3.6;

  return (
    <Float speed={0.8} rotationIntensity={0.08} floatIntensity={0.15}>
      <group ref={meshRef} scale={1.1}>
        {/* Outer Frame Border */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[frameWidth, frameHeight, 0.2]} />
          <meshStandardMaterial 
            color={color} 
            roughness={isMetallic ? 0.25 : 0.5} 
            metalness={isMetallic ? 0.7 : 0.1}
            envMapIntensity={1}
          />
        </mesh>
        
        {/* Frame bevels */}
        <mesh position={[0, frameHeight/2 - 0.2, 0.11]}>
          <boxGeometry args={[frameWidth - 0.3, 0.18, 0.08]} />
          <meshStandardMaterial color={color} roughness={0.4} metalness={isMetallic ? 0.5 : 0} />
        </mesh>
        <mesh position={[0, -frameHeight/2 + 0.2, 0.11]}>
          <boxGeometry args={[frameWidth - 0.3, 0.18, 0.08]} />
          <meshStandardMaterial color={color} roughness={0.4} metalness={isMetallic ? 0.5 : 0} />
        </mesh>
        <mesh position={[-frameWidth/2 + 0.15, 0, 0.11]}>
          <boxGeometry args={[0.18, frameHeight - 0.55, 0.08]} />
          <meshStandardMaterial color={color} roughness={0.4} metalness={isMetallic ? 0.5 : 0} />
        </mesh>
        <mesh position={[frameWidth/2 - 0.15, 0, 0.11]}>
          <boxGeometry args={[0.18, frameHeight - 0.55, 0.08]} />
          <meshStandardMaterial color={color} roughness={0.4} metalness={isMetallic ? 0.5 : 0} />
        </mesh>
        
        {/* Inner mat */}
        <mesh position={[0, 0, 0.08]}>
          <boxGeometry args={[frameWidth - 0.6, frameHeight - 0.6, 0.04]} />
          <meshStandardMaterial color="#fafafa" roughness={0.95} />
        </mesh>
        
        {/* Glass effect */}
        <mesh position={[0, 0, 0.12]}>
          <planeGeometry args={[frameWidth - 0.7, frameHeight - 0.7]} />
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
          <planeGeometry args={[(frameWidth - 0.8) * imageScale, (frameHeight - 0.8) * imageScale]} />
          {texture ? (
            <meshStandardMaterial map={texture} roughness={0.5} />
          ) : (
            <meshStandardMaterial color="#d4d4d4" roughness={0.8} />
          )}
        </mesh>
        
        {/* Frame Stand */}
        <mesh position={[0, -frameHeight/2 - 0.3, -0.4]} rotation={[Math.PI / 5, 0, 0]} castShadow>
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
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.2;
    }
  });

  const imageScale = 1.1 * imageTransform.scale;

  return (
    <Float speed={1.2} rotationIntensity={0.08} floatIntensity={0.15}>
      <group ref={meshRef} scale={1.3} rotation={[0, Math.PI, 0]}>
        {/* Phone Case Body - Back side facing camera */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.4, 2.9, 0.18]} />
          <meshStandardMaterial 
            color={color} 
            roughness={0.4} 
            metalness={0.15}
            envMapIntensity={0.6}
          />
        </mesh>
        
        {/* Rounded edges simulation */}
        <mesh position={[0.68, 0, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 2.85, 16]} />
          <meshStandardMaterial color={color} roughness={0.4} metalness={0.15} />
        </mesh>
        <mesh position={[-0.68, 0, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 2.85, 16]} />
          <meshStandardMaterial color={color} roughness={0.4} metalness={0.15} />
        </mesh>
        
        {/* Camera Cutout */}
        <mesh position={[-0.35, 1, -0.1]}>
          <boxGeometry args={[0.7, 0.9, 0.1]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.1} metalness={0.9} />
        </mesh>
        
        {/* Camera Lenses */}
        <mesh position={[-0.55, 1.15, -0.16]}>
          <cylinderGeometry args={[0.13, 0.13, 0.08, 24]} />
          <meshStandardMaterial color="#0a0a15" roughness={0} metalness={1} />
        </mesh>
        <mesh position={[-0.55, 1.15, -0.21]}>
          <cylinderGeometry args={[0.08, 0.08, 0.04, 24]} />
          <meshStandardMaterial color="#1a2040" roughness={0.05} metalness={0.95} />
        </mesh>
        <mesh position={[-0.2, 1.15, -0.16]}>
          <cylinderGeometry args={[0.13, 0.13, 0.08, 24]} />
          <meshStandardMaterial color="#0a0a15" roughness={0} metalness={1} />
        </mesh>
        <mesh position={[-0.2, 1.15, -0.21]}>
          <cylinderGeometry args={[0.08, 0.08, 0.04, 24]} />
          <meshStandardMaterial color="#1a2040" roughness={0.05} metalness={0.95} />
        </mesh>
        <mesh position={[-0.55, 0.85, -0.16]}>
          <cylinderGeometry args={[0.13, 0.13, 0.08, 24]} />
          <meshStandardMaterial color="#0a0a15" roughness={0} metalness={1} />
        </mesh>
        <mesh position={[-0.55, 0.85, -0.21]}>
          <cylinderGeometry args={[0.08, 0.08, 0.04, 24]} />
          <meshStandardMaterial color="#1a2040" roughness={0.05} metalness={0.95} />
        </mesh>
        
        {/* Flash */}
        <mesh position={[-0.2, 0.85, -0.16]}>
          <cylinderGeometry args={[0.06, 0.06, 0.05, 16]} />
          <meshStandardMaterial color="#fffae6" roughness={0.2} emissive="#fffae6" emissiveIntensity={0.2} />
        </mesh>
        
        {/* Custom Image on back */}
        {texture && (
          <mesh 
            position={[imageTransform.x * 0.2, -0.3 + imageTransform.y * 0.3, -0.1]} 
            rotation={[0, Math.PI, imageTransform.rotation * Math.PI / 180]}
          >
            <planeGeometry args={[imageScale, imageScale * 1.3]} />
            <meshStandardMaterial map={texture} transparent opacity={0.95} roughness={0.4} />
          </mesh>
        )}
        
        {/* Custom Text on back */}
        {customText && (
          <Text
            position={[0, customImage ? -1.1 : -0.3, -0.1]}
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

// Heart Shape Keychain
function KeychainHeartModel({ 
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
      meshRef.current.rotation.y += 0.008;
    }
  });

  const imageScale = 0.8 * imageTransform.scale;

  // Heart shape using custom geometry
  const heartShape = useMemo(() => {
    const shape = new THREE.Shape();
    const x = 0, y = 0;
    shape.moveTo(x, y + 0.5);
    shape.bezierCurveTo(x, y + 0.5, x - 0.5, y, x - 0.5, y);
    shape.bezierCurveTo(x - 0.5, y - 0.35, x, y - 0.6, x, y - 0.9);
    shape.bezierCurveTo(x, y - 0.6, x + 0.5, y - 0.35, x + 0.5, y);
    shape.bezierCurveTo(x + 0.5, y, x, y + 0.5, x, y + 0.5);
    return shape;
  }, []);

  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={meshRef} scale={2}>
        {/* Keychain Ring */}
        <mesh position={[0, 0.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.15, 0.03, 12, 32]} />
          <meshStandardMaterial color="#c0c0c0" roughness={0.2} metalness={0.9} />
        </mesh>
        
        {/* Chain connector */}
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.2, 12]} />
          <meshStandardMaterial color="#c0c0c0" roughness={0.2} metalness={0.9} />
        </mesh>
        
        {/* Heart Body - Front */}
        <mesh position={[0, 0, 0.08]} castShadow>
          <extrudeGeometry args={[heartShape, { depth: 0.15, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02 }]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
        </mesh>
        
        {/* Custom Image */}
        {texture && (
          <mesh 
            position={[imageTransform.x * 0.2, -0.2 + imageTransform.y * 0.2, 0.24]} 
            rotation={[0, 0, imageTransform.rotation * Math.PI / 180]}
          >
            <planeGeometry args={[imageScale * 0.7, imageScale * 0.7]} />
            <meshStandardMaterial map={texture} transparent opacity={0.95} roughness={0.3} />
          </mesh>
        )}
        
        {/* Custom Text */}
        {customText && (
          <Text
            position={[0, customImage ? -0.7 : -0.2, 0.24]}
            fontSize={0.08}
            color={textColor || '#ffffff'}
            anchorX="center"
            anchorY="middle"
            maxWidth={0.8}
            textAlign="center"
          >
            {customText}
          </Text>
        )}
      </group>
    </Float>
  );
}

// Circle Keychain
function KeychainCircleModel({ 
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
      meshRef.current.rotation.y += 0.008;
    }
  });

  const imageScale = 0.9 * imageTransform.scale;

  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={meshRef} scale={1.8}>
        {/* Keychain Ring */}
        <mesh position={[0, 0.9, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.15, 0.03, 12, 32]} />
          <meshStandardMaterial color="#c0c0c0" roughness={0.2} metalness={0.9} />
        </mesh>
        
        {/* Chain connector */}
        <mesh position={[0, 0.7, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.2, 12]} />
          <meshStandardMaterial color="#c0c0c0" roughness={0.2} metalness={0.9} />
        </mesh>
        
        {/* Circle Body */}
        <mesh position={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.6, 0.6, 0.12, 48]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
        </mesh>
        
        {/* Rim */}
        <mesh position={[0, 0, 0]}>
          <torusGeometry args={[0.6, 0.04, 12, 48]} />
          <meshStandardMaterial color={color} roughness={0.2} metalness={0.4} />
        </mesh>
        
        {/* Custom Image */}
        {texture && (
          <mesh 
            position={[imageTransform.x * 0.2, imageTransform.y * 0.2, 0.07]} 
            rotation={[0, 0, imageTransform.rotation * Math.PI / 180]}
          >
            <circleGeometry args={[0.45 * imageScale, 48]} />
            <meshStandardMaterial map={texture} transparent opacity={0.95} roughness={0.3} />
          </mesh>
        )}
        
        {/* Custom Text */}
        {customText && (
          <Text
            position={[0, customImage ? -0.35 : 0, 0.07]}
            fontSize={0.08}
            color={textColor || '#ffffff'}
            anchorX="center"
            anchorY="middle"
            maxWidth={0.9}
            textAlign="center"
          >
            {customText}
          </Text>
        )}
      </group>
    </Float>
  );
}

// Square Keychain
function KeychainSquareModel({ 
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
      meshRef.current.rotation.y += 0.008;
    }
  });

  const imageScale = 0.9 * imageTransform.scale;

  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={meshRef} scale={1.8}>
        {/* Keychain Ring */}
        <mesh position={[0, 0.9, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.15, 0.03, 12, 32]} />
          <meshStandardMaterial color="#c0c0c0" roughness={0.2} metalness={0.9} />
        </mesh>
        
        {/* Chain connector */}
        <mesh position={[0, 0.7, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.2, 12]} />
          <meshStandardMaterial color="#c0c0c0" roughness={0.2} metalness={0.9} />
        </mesh>
        
        {/* Square Body */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[1, 1, 0.12]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
        </mesh>
        
        {/* Custom Image */}
        {texture && (
          <mesh 
            position={[imageTransform.x * 0.2, imageTransform.y * 0.2, 0.07]} 
            rotation={[0, 0, imageTransform.rotation * Math.PI / 180]}
          >
            <planeGeometry args={[0.85 * imageScale, 0.85 * imageScale]} />
            <meshStandardMaterial map={texture} transparent opacity={0.95} roughness={0.3} />
          </mesh>
        )}
        
        {/* Custom Text */}
        {customText && (
          <Text
            position={[0, customImage ? -0.35 : 0, 0.07]}
            fontSize={0.08}
            color={textColor || '#ffffff'}
            anchorX="center"
            anchorY="middle"
            maxWidth={0.9}
            textAlign="center"
          >
            {customText}
          </Text>
        )}
      </group>
    </Float>
  );
}

// Cubes Keychain (3D rotating cube)
function KeychainCubesModel({ 
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
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    }
  });

  const imageScale = 0.7 * imageTransform.scale;

  return (
    <Float speed={1.5} rotationIntensity={0.15} floatIntensity={0.3}>
      <group scale={1.6}>
        {/* Keychain Ring */}
        <mesh position={[0, 1.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.15, 0.03, 12, 32]} />
          <meshStandardMaterial color="#c0c0c0" roughness={0.2} metalness={0.9} />
        </mesh>
        
        {/* Chain connector */}
        <mesh position={[0, 0.9, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.2, 12]} />
          <meshStandardMaterial color="#c0c0c0" roughness={0.2} metalness={0.9} />
        </mesh>
        
        {/* Rotating Cube */}
        <group ref={meshRef}>
          <mesh position={[0, 0, 0]} castShadow>
            <boxGeometry args={[0.9, 0.9, 0.9]} />
            <meshStandardMaterial color={color} roughness={0.25} metalness={0.3} />
          </mesh>
          
          {/* Images on each visible face */}
          {texture && (
            <>
              {/* Front */}
              <mesh position={[0, 0, 0.46]}>
                <planeGeometry args={[0.75 * imageScale, 0.75 * imageScale]} />
                <meshStandardMaterial map={texture} transparent opacity={0.95} />
              </mesh>
              {/* Right */}
              <mesh position={[0.46, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                <planeGeometry args={[0.75 * imageScale, 0.75 * imageScale]} />
                <meshStandardMaterial map={texture} transparent opacity={0.95} />
              </mesh>
              {/* Left */}
              <mesh position={[-0.46, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
                <planeGeometry args={[0.75 * imageScale, 0.75 * imageScale]} />
                <meshStandardMaterial map={texture} transparent opacity={0.95} />
              </mesh>
              {/* Back */}
              <mesh position={[0, 0, -0.46]} rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[0.75 * imageScale, 0.75 * imageScale]} />
                <meshStandardMaterial map={texture} transparent opacity={0.95} />
              </mesh>
            </>
          )}
          
          {/* Custom Text */}
          {customText && !texture && (
            <Text
              position={[0, 0, 0.46]}
              fontSize={0.1}
              color={textColor || '#ffffff'}
              anchorX="center"
              anchorY="middle"
              maxWidth={0.7}
              textAlign="center"
            >
              {customText}
            </Text>
          )}
        </group>
      </group>
    </Float>
  );
}

// Night Lamp with glowing effect
function NightLampModel({ 
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
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.15;
    }
  });

  const imageScale = imageTransform.scale;

  return (
    <Float speed={0.8} rotationIntensity={0.05} floatIntensity={0.1}>
      <group ref={meshRef} scale={1.1}>
        {/* Base */}
        <mesh position={[0, -1.8, 0]} castShadow>
          <cylinderGeometry args={[1.2, 1.4, 0.3, 48]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.3} metalness={0.6} />
        </mesh>
        
        {/* Base rim */}
        <mesh position={[0, -1.65, 0]}>
          <torusGeometry args={[1.2, 0.05, 8, 48]} />
          <meshStandardMaterial color="#404040" roughness={0.2} metalness={0.8} />
        </mesh>
        
        {/* LED Strip on base */}
        <mesh position={[0, -1.55, 0]}>
          <torusGeometry args={[1.1, 0.08, 8, 48]} />
          <meshStandardMaterial 
            color="#ffffff" 
            emissive="#ffffff" 
            emissiveIntensity={0.8}
            roughness={0.1}
          />
        </mesh>
        
        {/* Acrylic Panel */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.2, 3, 0.15]} />
          <meshStandardMaterial 
            color={color}
            transparent
            opacity={0.85}
            roughness={0.05}
            metalness={0.1}
            envMapIntensity={0.8}
          />
        </mesh>
        
        {/* Glowing edges */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2.25, 3.05, 0.12]} />
          <meshStandardMaterial 
            color="#ffffff"
            transparent
            opacity={0.15}
            emissive="#ffffff"
            emissiveIntensity={0.4}
          />
        </mesh>
        
        {/* Inner glow effect */}
        <pointLight position={[0, 0, 0.5]} intensity={0.5} color="#ffffff" distance={3} />
        <pointLight position={[0, 0, -0.5]} intensity={0.3} color="#ffffff" distance={2} />
        
        {/* Custom Image - etched effect */}
        {texture && (
          <mesh 
            position={[imageTransform.x * 0.3, imageTransform.y * 0.4, 0.08]} 
            rotation={[0, 0, imageTransform.rotation * Math.PI / 180]}
          >
            <planeGeometry args={[1.8 * imageScale, 2.4 * imageScale]} />
            <meshStandardMaterial 
              map={texture} 
              transparent 
              opacity={0.9}
              emissive="#ffffff"
              emissiveIntensity={0.1}
            />
          </mesh>
        )}
        
        {/* Custom Text */}
        {customText && (
          <Text
            position={[0, customImage ? -1.2 : 0, 0.08]}
            fontSize={0.15}
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
              size="7x5"
            />
          )}
          {productType === 'frame-6x8' && (
            <FrameModel 
              color={productColor} 
              customImage={customImage}
              imageTransform={transform}
              size="6x8"
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
          {productType === 'keychain-heart' && (
            <KeychainHeartModel 
              color={productColor} 
              customImage={customImage} 
              customText={customText} 
              textColor={textColor}
              imageTransform={transform}
            />
          )}
          {productType === 'keychain-circle' && (
            <KeychainCircleModel 
              color={productColor} 
              customImage={customImage} 
              customText={customText} 
              textColor={textColor}
              imageTransform={transform}
            />
          )}
          {productType === 'keychain-square' && (
            <KeychainSquareModel 
              color={productColor} 
              customImage={customImage} 
              customText={customText} 
              textColor={textColor}
              imageTransform={transform}
            />
          )}
          {productType === 'keychain-cubes' && (
            <KeychainCubesModel 
              color={productColor} 
              customImage={customImage} 
              customText={customText} 
              textColor={textColor}
              imageTransform={transform}
            />
          )}
          {productType === 'night-lamp' && (
            <NightLampModel 
              color={productColor} 
              customImage={customImage} 
              customText={customText} 
              textColor={textColor}
              imageTransform={transform}
            />
          )}
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
