import { useRef, useEffect, Suspense } from 'react';
import { Physics } from '@react-three/rapier';
import { Environment, ContactShadows, CameraShake } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { Player } from './Player';
import { Enemy } from './Enemy';
import { Fireball } from './Fireball';
import { DinerScene } from './DinerScene';
import { useGameStore } from '../store';
import * as THREE from 'three';

export function GameScene() {
  const fireballs = useGameStore((s) => s.fireballs);
  const cameraShake = useGameStore((s) => s.cameraShake);
  const triggerCameraShake = useGameStore((s) => s.triggerCameraShake);
  const shakeRef = useRef<any>(null);

  // Trigger camera rumble on impact and reset
  useEffect(() => {
    if (cameraShake > 0) {
      if (shakeRef.current) {
        shakeRef.current.setIntensities({
          rType: 'linear',
          pitch: cameraShake * 0.8,
          roll: cameraShake * 0.5,
          yaw: cameraShake * 0.8,
          x: cameraShake * 0.9,
          y: cameraShake * 0.9,
          z: cameraShake * 0.2
        });
      }
      triggerCameraShake(0);
    }
  }, [cameraShake, triggerCameraShake]);

  return (
    <Suspense fallback={null}>
      <Physics gravity={[0, -20, 0]} timeStep="vary" debug={false}>
        <ambientLight intensity={0.4} color="#88aaff" />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffddaa" castShadow />
        
        {/* Cinematic Backdrop */}
        <Environment preset="night" />

        <DinerScene />

        {/* Fighters */}
        <Player />
        <Enemy />

        {/* Projectiles */}
        {fireballs.map((fb) => (
          <Fireball key={fb.id} {...fb} />
        ))}
        
        {/* Grounding Shadows */}
        <ContactShadows position={[0, -0.49, 0]} opacity={0.8} scale={20} blur={2} far={4} />

      </Physics>

      {/* Dynamic Camera Shake Effect */}
      <CameraShake 
        ref={shakeRef}
        decay 
        decayRate={0.95} 
        maxYaw={0.08} 
        maxPitch={0.08} 
        maxRoll={0.08}
      />

      {/* VFX/Post-processing */}
      <EffectComposer>
        <Bloom 
          luminanceThreshold={1.2} 
          mipmapBlur 
          intensity={1.5} 
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
        <ChromaticAberration 
          blendFunction={BlendFunction.NORMAL} 
          offset={new THREE.Vector2(0.002, 0.002)} 
        />
      </EffectComposer>
    </Suspense>
  );
}
