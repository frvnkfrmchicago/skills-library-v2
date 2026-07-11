import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CupBodyProps {
  mugColor: string;
  isPlaying: boolean;
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
}

export default function CupBody({ mugColor, isPlaying, analyserRef }: CupBodyProps) {
  const liquidRef = useRef<THREE.Mesh>(null);
  const fillLevelRef = useRef(0.1); // Starts near bottom floor
  const tempFreqData = useMemo(() => new Uint8Array(64), []);

  useFrame((state) => {
    let trebleValue = 0;

    // Read audio data for surface ripples
    if (analyserRef.current) {
      analyserRef.current.getByteFrequencyData(tempFreqData);
      
      // Average treble frequencies (index 40-60)
      let trebleSum = 0;
      for (let i = 40; i < 60; i++) {
        trebleSum += tempFreqData[i];
      }
      trebleValue = trebleSum / 20 / 255;
    }

    // Smoothly lerp fill level (0.1 = empty, 0.96 = full)
    const targetFill = isPlaying ? 0.96 : 0.1;
    fillLevelRef.current = THREE.MathUtils.lerp(fillLevelRef.current, targetFill, 0.035);

    if (liquidRef.current) {
      // Y position moves from -0.7 (empty) to 0.73 (full) inside the cavity
      const yPos = THREE.MathUtils.lerp(-0.7, 0.73, fillLevelRef.current);
      
      // Add a subtle wave animation
      const time = state.clock.getElapsedTime();
      const wave = Math.sin(time * 12) * (0.002 + trebleValue * 0.012);
      
      liquidRef.current.position.y = yPos + wave;
      
      // Account for slight tapering of the inner cavity as it rises
      const radiusScale = THREE.MathUtils.lerp(0.93, 1.0, fillLevelRef.current);
      liquidRef.current.scale.set(radiusScale, 1.0, radiusScale);
    }
  });

  return (
    <group>
      {/* 1. OUTER CERAMIC WALL (Tapered Cylinder, Open Ends) */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.7, 0.66, 1.6, 32, 1, true]} />
        <meshPhysicalMaterial
          color={mugColor}
          roughness={0.15}
          metalness={0.05}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 2. INNER CAVITY WALL (Cream porcelain glaze, Open Ends, slightly offset for bottom thickness) */}
      <mesh receiveShadow position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.64, 0.60, 1.5, 32, 1, true]} />
        <meshPhysicalMaterial
          color="#fdfbf7" // Premium glossy cream porcelain interior
          roughness={0.1}
          metalness={0.0}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 3. TOP RIM (Smooth ring connecting outer and inner walls) */}
      <mesh position={[0, 0.8, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <ringGeometry args={[0.64, 0.7, 32]} />
        <meshPhysicalMaterial
          color={mugColor}
          roughness={0.15}
          metalness={0.05}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 4. OUTER BOTTOM BASE DISC */}
      <mesh position={[0, -0.8, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.66, 32]} />
        <meshPhysicalMaterial
          color={mugColor}
          roughness={0.2}
          metalness={0.05}
          clearcoat={0.8}
        />
      </mesh>

      {/* 5. INNER CAVITY FLOOR DISC (Cream porcelain glaze) */}
      <mesh position={[0, -0.7, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.60, 32]} />
        <meshPhysicalMaterial
          color="#fdfbf7"
          roughness={0.1}
          metalness={0.0}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
        />
      </mesh>

      {/* 6. COFFEE LIQUID LAYER (Sits inside the inner cavity) */}
      <mesh ref={liquidRef} position={[0, -0.7, 0]} castShadow>
        {/* Slightly smaller than inner cavity radius to prevent Z-fighting */}
        <cylinderGeometry args={[0.635, 0.635, 0.03, 32]} />
        <meshStandardMaterial
          color="#1b0c07" // Premium dark roast coffee color
          roughness={0.08}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
}
