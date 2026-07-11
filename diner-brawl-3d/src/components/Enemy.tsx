import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CapsuleCollider, CuboidCollider, useRapier, RapierRigidBody } from '@react-three/rapier';
import { useGameStore } from '../store';
import { AnimatedSprite } from './AnimatedSprite';

const MOVE_SPEED = 3.5;

export function Enemy() {
  const bodyRef = useRef<RapierRigidBody>(null);
  const { rapier, world } = useRapier();

  // Character spec from store
  const enemyChar = useGameStore((s) => s.enemyChar);
  const playerPosition = useGameStore((s) => s.playerPosition);
  const hitStopActive = useGameStore((s) => s.hitStopActive);

  const [facing, setFacing] = useState(-1); // Facing left by default
  const [animState, setAnimState] = useState<'idle' | 'walk' | 'punch' | 'kick' | 'block' | 'hurt' | 'special' | 'knockdown' | 'victory'>('idle');
  const animStateRef = useRef(animState);
  animStateRef.current = animState;

  // Temp states to lock animations (punch/kick locks)
  const [lockTimer, setLockTimer] = useState(0);
  const lockTimerRef = useRef(lockTimer);
  lockTimerRef.current = lockTimer;

  // Track if enemy is currently blocking
  const [isBlocking, setIsBlocking] = useState(false);

  // AI Decision interval timer
  const [aiTimer, setAiTimer] = useState(0);

  useFrame((_, delta) => {
    if (!bodyRef.current) return;
    
    // Freeze frame under Hit Stop
    if (hitStopActive) {
      bodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      return;
    }

    const velocity = bodyRef.current.linvel();
    const position = bodyRef.current.translation();

    // Determine facing direction relative to the player
    const dx = playerPosition[0] - position.x;
    const currentFacing = dx > 0 ? 1 : -1;
    setFacing(currentFacing);

    // Lock timer countdown
    if (lockTimerRef.current > 0) {
      setLockTimer((prev) => Math.max(0, prev - delta));
    }

    // AI decision making logic
    let moveX = 0;
    let nextState = animStateRef.current;
    
    // Countdown AI timer
    if (aiTimer > 0) {
      setAiTimer((prev) => Math.max(0, prev - delta));
    }

    if (animStateRef.current === 'hurt' || animStateRef.current === 'knockdown') {
      // Recovery after knockback/hurt frame lock
      if (lockTimerRef.current <= 0 && animStateRef.current === 'hurt') {
        nextState = 'idle';
      }
    } else if (lockTimerRef.current <= 0) {
      const dist = Math.abs(dx);
      
      // Basic AI State Machine
      if (dist > 2.0) {
        // Walk towards player
        moveX = currentFacing;
        nextState = 'walk';
        setIsBlocking(false);
      } else {
        // We are close! Run AI decision check every 0.4s
        if (aiTimer <= 0) {
          setAiTimer(0.4 + Math.random() * 0.3); // Randomize next decision time
          
          const decision = Math.random();
          const specialPower = useGameStore.getState().enemySpecial;

          if (specialPower >= 25 && decision < 0.25) {
            // Superpower / Fireball!
            nextState = 'special';
            setLockTimer(0.5);
            useGameStore.getState().addSpecial('enemy', -25);
            useGameStore.getState().spawnFireball(
              'enemy',
              position.x + currentFacing * 0.8,
              position.y,
              currentFacing
            );
          } else if (decision < 0.55) {
            // Punch!
            nextState = 'punch';
            setLockTimer(0.3);
            useGameStore.getState().addSpecial('enemy', 5);
          } else if (decision < 0.75) {
            // Kick!
            nextState = 'kick';
            setLockTimer(0.35);
            useGameStore.getState().addSpecial('enemy', 6);
          } else if (decision < 0.90) {
            // Block posture!
            nextState = 'block';
            setIsBlocking(true);
            setLockTimer(0.4);
          } else {
            // Idle/Tease
            nextState = 'idle';
            setIsBlocking(false);
          }
        }
      }
    }

    // Set blocking state correctly in user data
    bodyRef.current.userData = { 
      type: 'enemy', 
      isBlocking: nextState === 'block' || isBlocking,
      isHurt: animStateRef.current === 'hurt'
    };

    // Apply movement velocity
    if (nextState === 'walk' && lockTimerRef.current <= 0 && animStateRef.current !== 'hurt') {
      bodyRef.current.setLinvel({ x: moveX * MOVE_SPEED, y: velocity.y, z: 0 }, true);
    } else if (lockTimerRef.current <= 0 || animStateRef.current === 'hurt') {
      bodyRef.current.setLinvel({ x: 0, y: velocity.y, z: 0 }, true);
    }

    // Ground Check (Raycast down)
    const ray = new rapier.Ray(
      { x: position.x, y: position.y - 0.9, z: position.z },
      { x: 0, y: -1, z: 0 }
    );
    world.castRay(ray, 0.25, true);

    // Strict 2.5D coordinate lock
    bodyRef.current.setTranslation({ x: position.x, y: position.y, z: 0 }, true);

    if (animState !== nextState) {
      setAnimState(nextState);
    }

    // Sync state positions
    useGameStore.getState().setEnemyPosition([position.x, position.y, position.z]);
  });

  // Listen for external hits to play hurt or knockdown animation
  useEffect(() => {
    const unsub = useGameStore.subscribe(
      (s) => s.enemyHealth,
      (current, prev) => {
        if (current < prev && bodyRef.current) {
          const isDead = current <= 0;
          if (isDead) {
            setAnimState('knockdown');
            setLockTimer(9999); // Lock indefinitely on knockdown
          } else if (!isBlocking) {
            setAnimState('hurt');
            setLockTimer(0.3); // Hurt freeze frame
            // Recoil pushback away from player
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
      position={[3.5, 1.2, 0]}
      type="dynamic"
      colliders={false}
      enabledRotations={[false, false, false]}
      linearDamping={1.2}
      userData={{ type: 'enemy', isBlocking }}
    >
      {/* Normalized physical capsule matching Player.tsx exactly */}
      <CapsuleCollider args={[0.55, 0.45]} position={[0, 0.1, 0]} />
      
      {/* Hitbox Sensor - triggers when punching/kicking and intersects player */}
      <CuboidCollider 
        args={[0.5, 0.4, 0.5]} 
        position={[facing * 0.9, 0.1, 0]} 
        sensor 
        onIntersectionEnter={({ other }) => {
          if (other.rigidBodyObject?.userData?.type === 'player') {
            const currentAnim = animStateRef.current;
            if (currentAnim === 'punch' || currentAnim === 'kick') {
              const opponentBlocking = other.rigidBodyObject?.userData?.isBlocking;
              const damage = opponentBlocking ? 2 : 12;
              useGameStore.getState().takeDamage('player', damage);
              
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
          url={enemyChar.sprite} 
          columns={4} 
          rows={4} 
          playState={animState} 
          scaleX={facing} 
          tint="#ffcccc" // Subtle reddish tint for enemy indicators
        />
      </group>
    </RigidBody>
  );
}
