import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Box, Octahedron } from '@react-three/drei';
import * as THREE from 'three';

// Individual floating shape component
function FloatingShape({ position, shape, color, speed }: {
  position: [number, number, number];
  shape: 'sphere' | 'box' | 'octahedron';
  color: string;
  speed: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += speed * 0.01;
      meshRef.current.rotation.y += speed * 0.015;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.3;
    }
  });

  // Create geometry based on shape type
  const renderShape = () => {
    const material = (
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.6}
        roughness={0.2}
        metalness={0.8}
        emissive={color}
        emissiveIntensity={0.05}
      />
    );

    switch (shape) {
      case 'sphere':
        return (
          <mesh ref={meshRef} position={position}>
            <sphereGeometry args={[0.5, 16, 16]} />
            {material}
          </mesh>
        );
      case 'box':
        return (
          <mesh ref={meshRef} position={position}>
            <boxGeometry args={[0.8, 0.8, 0.8]} />
            {material}
          </mesh>
        );
      case 'octahedron':
        return (
          <mesh ref={meshRef} position={position}>
            <octahedronGeometry args={[0.6]} />
            {material}
          </mesh>
        );
      default:
        return null;
    }
  };

  return renderShape();
}

// Main component with multiple floating shapes
export function FloatingShapes() {
  const shapes = [
    { position: [-4, 2, -2] as [number, number, number], shape: 'sphere' as const, color: '#8B5CF6', speed: 1.2 },
    { position: [3, -1, -3] as [number, number, number], shape: 'box' as const, color: '#06B6D4', speed: 0.8 },
    { position: [-2, -2, -1] as [number, number, number], shape: 'octahedron' as const, color: '#EC4899', speed: 1.5 },
    { position: [4, 3, -4] as [number, number, number], shape: 'sphere' as const, color: '#10B981', speed: 0.9 },
    { position: [-3, 1, -5] as [number, number, number], shape: 'box' as const, color: '#F59E0B', speed: 1.1 },
    { position: [2, -3, -2] as [number, number, number], shape: 'octahedron' as const, color: '#EF4444', speed: 1.3 },
  ];

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 60 }}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8B5CF6" />
      
      {shapes.map((shapeProps, index) => (
        <FloatingShape key={index} {...shapeProps} />
      ))}
    </Canvas>
  );
}