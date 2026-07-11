import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SteamParticlesProps {
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
  mugColor: string;
}

interface Particle {
  position: THREE.Vector3;
  speed: number;
  scale: number;
  angle: number;
  driftSpeed: number;
  initialX: number;
  initialZ: number;
}

export default function SteamParticles({ analyserRef, mugColor }: SteamParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 45;
  const tempFreqData = useMemo(() => new Uint8Array(64), []);

  // Initialize particles in a cylinder volume above the mug mouth
  const particles = useMemo(() => {
    const list: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 0.45; // Mug top radius is roughly 0.6
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      list.push({
        position: new THREE.Vector3(x, 1.1 + Math.random() * 2, z), // Start above the coffee surface (y = 1.0)
        speed: 0.015 + Math.random() * 0.02,
        scale: 0.1 + Math.random() * 0.18,
        angle: Math.random() * Math.PI * 2,
        driftSpeed: 0.5 + Math.random() * 1.5,
        initialX: x,
        initialZ: z
      });
    }
    return list;
  }, []);

  // Set up geometry arrays once
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    particles.forEach((p, i) => {
      pos[i * 3] = p.position.x;
      pos[i * 3 + 1] = p.position.y;
      pos[i * 3 + 2] = p.position.z;
    });
    return pos;
  }, [particles]);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const geo = pointsRef.current.geometry;
    const posAttr = geo.attributes.position;
    
    // Read audio data
    let bassIntensity = 0.5; // Default ambient multiplier
    let midIntensity = 0.5;
    
    if (analyserRef.current) {
      analyserRef.current.getByteFrequencyData(tempFreqData);
      // Average bass frequencies (first 8 bins)
      let bassSum = 0;
      for (let i = 0; i < 8; i++) {
        bassSum += tempFreqData[i];
      }
      bassIntensity = bassSum / 8 / 255; // Normalize 0 - 1
      
      // Average mid frequencies (bins 8-24)
      let midSum = 0;
      for (let i = 8; i < 24; i++) {
        midSum += tempFreqData[i];
      }
      midIntensity = midSum / 16 / 255;
    }

    const time = state.clock.getElapsedTime();

    particles.forEach((p, i) => {
      // Modify speed and drift based on music volume
      const currentSpeed = p.speed * (1 + bassIntensity * 2.0);
      const sway = Math.sin(time * p.driftSpeed + p.angle) * (0.003 + midIntensity * 0.015);
      
      // Move particle upwards
      p.position.y += currentSpeed;
      p.position.x += sway;
      p.position.z += Math.cos(time * p.driftSpeed + p.angle) * (0.003 + midIntensity * 0.015);

      // Reset when particle reaches the top of the steam plume
      if (p.position.y > 3.5) {
        p.position.y = 1.1; // Reset to mug rim height
        p.position.x = p.initialX;
        p.position.z = p.initialZ;
      }

      // Update shader position attributes
      posAttr.setXYZ(i, p.position.x, p.position.y, p.position.z);
    });

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        color={mugColor === '#ff69b4' ? '#ffc0cb' : '#ffffff'}
        transparent
        opacity={0.35}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
