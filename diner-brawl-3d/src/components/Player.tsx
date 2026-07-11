import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import { RigidBody, CapsuleCollider, CuboidCollider, useRapier, RapierRigidBody } from '@react-three/rapier';
import { useGameStore } from '../store';
import { AnimatedSprite } from './AnimatedSprite';
import * as THREE from 'three';

const MOVE_SPEED = 5.5;
const JUMP_FORCE = 9.5;

export function Player() {
  const bodyRef = useRef<RapierRigidBody>(null);
  const [, getKeys] = useKeyboardControls();
  const { rapier, world } = useRapier();

  // Character spec from store
  const playerChar = useGameStore((s) => s.playerChar);
  const enemyPosition = useGameStore((s) => s.enemyPosition);
  const hitStopActive = useGameStore((s) => s.hitStopActive);

  const [facing, setFacing] = useState(1); // 1 = right, -1 = left
  const [animState, setAnimState] = useState<'idle' | 'walk' | 'punch' | 'kick' | 'block' | 'hurt' | 'special' | 'knockdown' | 'victory'>('idle');
  const animStateRef = useRef(animState);
  animStateRef.current = animState;

  // Temp states to lock animations (e.g. punch/kick frame locks)
  const [lockTimer, setLockTimer] = useState(0);
  const lockTimerRef = useRef(lockTimer);
  lockTimerRef.current = lockTimer;

  // Track if player is currently blocking
  const [isBlocking, setIsBlocking] = useState(false);

  // Cast fireball
  const [hasCastSpecial, setHasCastSpecial] = useState(false);

  useFrame((state, delta) => {
    if (!bodyRef.current) return;
    
    // Freeze frame under Hit Stop
    if (hitStopActive) {
      bodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      return;
    }

    const { backward, left, right, jump, punch, kick, special } = getKeys();
    const velocity = bodyRef.current.linvel();
    const position = bodyRef.current.translation();

    // Determine facing direction relative to the enemy
    const dx = enemyPosition[0] - position.x;
    const currentFacing = dx > 0 ? 1 : -1;
    setFacing(currentFacing);

    // Lock timer countdown
    if (lockTimerRef.current > 0) {
      setLockTimer((prev) => Math.max(0, prev - delta));
    }

    // Auto-Block: Holding backward key (away from opponent)
    const isMovingAway = (currentFacing === 1 && left) || (currentFacing === -1 && right);
    const isHoldingDown = backward;
    const blockingActive = (isMovingAway || isHoldingDown) && animStateRef.current === 'idle';
    setIsBlocking(blockingActive);

    // Update blocking status in Rapier userData
    bodyRef.current.userData = { 
      type: 'player', 
      isBlocking: blockingActive,
      isHurt: animStateRef.current === 'hurt'
    };

    let moveX = 0;
    if (lockTimerRef.current <= 0 && animStateRef.current !== 'hurt') {
      if (left) moveX -= 1;
      if (right) moveX += 1;
    }

    bodyRef.current.setLinvel({ x: moveX * MOVE_SPEED, y: velocity.y, z: 0 }, true);

    // Ground Check (Raycast down)
    const ray = new rapier.Ray(
      { x: position.x, y: position.y - 0.9, z: position.z },
      { x: 0, y: -1, z: 0 }
    );
    const hit = world.castRay(ray, 0.25, true);
    const isGrounded = hit !== null;

    if (jump && isGrounded && lockTimerRef.current <= 0 && animStateRef.current !== 'hurt') {
      bodyRef.current.setLinvel({ x: velocity.x, y: JUMP_FORCE, z: 0 }, true);
    }

    // Strict 2.5D coordinate lock
    bodyRef.current.setTranslation({ x: position.x, y: position.y, z: 0 }, true);

    // Animation & Combat triggers
    let nextState = animStateRef.current;

    if (animStateRef.current === 'hurt') {
      // Recovery after knockback/hurt frame lock
      if (lockTimerRef.current <= 0) {
        nextState = 'idle';
      }
    } else if (lockTimerRef.current <= 0) {
      if (special && useGameStore.getState().special >= 25 && !hasCastSpecial) {
        nextState = 'special';
        setLockTimer(0.5); // Lock for fireball release
        setHasCastSpecial(true);
        
        // Spawn fireball
        useGameStore.getState().addSpecial('player', -25);
        useGameStore.getState().spawnFireball(
          'player', 
          position.x + currentFacing * 0.8, 
          position.y, 
          currentFacing
        );
      } else if (punch) {
        nextState = 'punch';
        setLockTimer(0.3); // Lock during punch duration
        useGameStore.getState().addSpecial('player', 5); // Accumulate energy
      } else if (kick) {
        nextState = 'kick';
        setLockTimer(0.35); // Lock during kick duration
        useGameStore.getState().addSpecial('player', 6);
      } else if (blockingActive) {
        nextState = 'block';
      } else if (moveX !== 0) {
        nextState = 'walk';
      } else {
        nextState = 'idle';
      }
    }

    // Reset fireball state trigger when special key released
    if (!special) {
      setHasCastSpecial(false);
    }

    if (animState !== nextState) {
      setAnimState(nextState);
    }

    // Lerp Camera with subtle spring delay
    state.camera.position.lerp(new THREE.Vector3(position.x, position.y + 1.8, 7.5), 0.08);
    state.camera.lookAt(position.x, position.y + 0.8, 0);

    // Sync state positions
    useGameStore.getState().setPlayerPosition([position.x, position.y, position.z]);
  });

  // Listen for external hits to play hurt animation
  useEffect(() => {
    const unsub = useGameStore.subscribe(
      (s) => s.health,
      (current, prev) => {
        if (current < prev && bodyRef.current) {
          // Play hurt only if not blocking
          if (!isBlocking) {
            setAnimState('hurt');
            setLockTimer(0.3); // Hurt freeze frame
            // Subtle recoil pushback
            bodyRef.current.setLinvel({ x: -facing * 4, y: 2, z: 0 }, true);
          }
        }
      }
    );
    return unsub;
  }, [facing, isBlocking]);

  return (
    <RigidBody
      ref={bodyRef}
      position={[-3.5, 1.2, 0]}
      type="dynamic"
      colliders={false}
      enabledRotations={[false, false, false]}
      linearDamping={1.2}
      userData={{ type: 'player', isBlocking }}
    >
      {/* Normalized physical capsule heights and widths */}
      <CapsuleCollider args={[0.55, 0.45]} position={[0, 0.1, 0]} />
      
      {/* Hitbox Sensor - triggers when punching/kicking and intersects enemy */}
      <CuboidCollider 
        args={[0.5, 0.4, 0.5]} 
        position={[facing * 0.9, 0.1, 0]} 
        sensor 
        onIntersectionEnter={({ other }) => {
          if (other.rigidBodyObject?.userData?.type === 'enemy') {
            const currentAnim = animStateRef.current;
            if (currentAnim === 'punch' || currentAnim === 'kick') {
              const damage = other.rigidBodyObject?.userData?.isBlocking ? 2 : 12;
              useGameStore.getState().takeDamage('enemy', damage);
              useGameStore.getState().addScore(150);
              
              // Trigger combat rumble and hitstop feel
              useGameStore.getState().triggerCameraShake(0.65);
              useGameStore.getState().setHitStop(true);
              setTimeout(() => {
                useGameStore.getState().setHitStop(false);
              }, 70);
            }
          }
        }}
      />

      {/* Ground plane offset perfectly matching size standardizations */}
      <group position={[0, -0.9, 0]}>
        <AnimatedSprite 
          url={playerChar.sprite} 
          columns={4} 
          rows={4} 
          playState={animState} 
          scaleX={facing} 
        />
      </group>
    </RigidBody>
  );
}
