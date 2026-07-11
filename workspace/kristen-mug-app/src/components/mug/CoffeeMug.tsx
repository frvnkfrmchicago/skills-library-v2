import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import CupBody from './CupBody';
import CupHandle from './CupHandle';

interface CoffeeMugProps {
  mugColor: string;
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
  isPlaying: boolean;
}

export default function CoffeeMug({ mugColor, analyserRef, isPlaying }: CoffeeMugProps) {
  const groupRef = useRef<THREE.Group>(null);
  const tempFreqData = useMemo(() => new Uint8Array(64), []);

  useFrame(() => {
    // Read audio data for scale pulsation
    let bassValue = 0;
    if (analyserRef.current) {
      analyserRef.current.getByteFrequencyData(tempFreqData);
      
      // Calculate bass (average of index 0-6)
      let bassSum = 0;
      for (let i = 0; i < 6; i++) {
        bassSum += tempFreqData[i];
      }
      bassValue = bassSum / 6 / 255;
    }

    // Set static tilted angle so the hollow interior and the side K-handle are both visible.
    // X tilt lets the user peer inside; Y rotation shows the handle.
    if (groupRef.current) {
      groupRef.current.rotation.x = 0.22; // 12.6 degrees forward tilt
      groupRef.current.rotation.y = 0.65; // ~37 degrees y rotation
    }

    // Pulsate the entire mug scale to the bass beat when music is playing
    const targetScale = 1.0 + (isPlaying ? bassValue * 0.04 : 0);
    if (groupRef.current) {
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.12);
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      {/* Hollow Mug Body with Coffee */}
      <CupBody 
        mugColor={mugColor} 
        isPlaying={isPlaying} 
        analyserRef={analyserRef} 
      />

      {/* C-Shape Handle with K Emblem */}
      <CupHandle mugColor={mugColor} />
    </group>
  );
}
