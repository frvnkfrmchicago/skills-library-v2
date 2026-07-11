import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, BallCollider, RapierRigidBody } from '@react-three/rapier';
import { useGameStore, type FireballState } from '../store';
import * as THREE from 'three';

export function Fireball({ id, x, y, vx, owner }: FireballState) {
  const bodyRef = useRef<RapierRigidBody>(null);
  const color = owner === 'player' ? '#00ffff' : '#ff4400';

  useFrame(() => {
    if (!bodyRef.current) return;
    const pos = bodyRef.current.translation();

    // Set linear velocity to fly across the screen
    bodyRef.current.setLinvel({ x: vx, y: 0, z: 0 }, true);
    // Lock Z to 0
    bodyRef.current.setTranslation({ x: pos.x, y: pos.y, z: 0 }, true);

    // Clean up out of bounds fireballs
    if (Math.abs(pos.x) > 12) {
      useGameStore.getState().removeFireball(id);
    }
  });

  const handleIntersection = ({ other }: { other: any }) => {
    const type = other.rigidBodyObject?.userData?.type;
    const opposite = owner === 'player' ? 'enemy' : 'player';

    if (type === opposite) {
      // Impact logic!
      const store = useGameStore.getState();
      
      // Calculate damage based on block status
      // We will check if the opposite player is blocking in Player/Enemy logic or Zustand
      const isBlocking = other.rigidBodyObject?.userData?.isBlocking;
      const damage = isBlocking ? 3 : 15;

      store.takeDamage(opposite, damage);
      store.triggerCameraShake(0.8);
      
      // Trigger Hit Stop!
      store.setHitStop(true);
      setTimeout(() => {
        useGameStore.getState().setHitStop(false);
      }, 80);

      // Remove the fireball
      store.removeFireball(id);
    }
  };

  return (
    <RigidBody
      ref={bodyRef}
      position={[x, y, 0]}
      type="kinematicVelocity"
      colliders={false}
      sensor
      onIntersectionEnter={handleIntersection}
      userData={{ type: 'fireball', owner }}
    >
      <BallCollider args={[0.3]} />
      
      {/* Visual Fireball Core */}
      <mesh castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>

      {/* Visual Glowing Aura */}
      <mesh>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={0.3} 
          side={THREE.BackSide} 
          toneMapped={false} 
        />
      </mesh>
    </RigidBody>
  );
}
