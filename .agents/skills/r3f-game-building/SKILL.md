---
name: r3f-game-building
description: >
  Builds React-hosted 3D browser games with React Three Fiber. Covers
  pmndrs scene composition, @react-three/rapier physics, shared React/game
  state with Zustand, 3D HUD integration, camera systems, asset loading,
  and R3F-specific performance patterns. Use when building a 3D game inside
  a React app, integrating game logic with React state, using pmndrs
  ecosystem tools, or when user mentions R3F game, React Three Fiber game,
  react-three, or pmndrs game.
---

# R3F Game Building

React Three Fiber turns Three.js into a declarative React component tree.
For games, this means your scene graph is JSX, your HUD is React, and your
game state lives in Zustand stores — not scattered across useEffect hooks.

The trap: treating R3F like a React app. React re-renders are the enemy of
60fps. Game state changes 60 times per second — if every state change
triggers a React re-render, your game runs at 6fps. The entire architecture
of an R3F game is about keeping hot-path state OUT of React's render cycle.

---

## STOP — Comprehension Gate

Before writing R3F game code, confirm:

1. **Have you completed `web-game-foundations`?** Engine choice, game loop design, input model, scene states must be defined first.
2. **Why R3F over plain Three.js?** Valid reasons: shared React state, React-based HUD/menus, existing React app, team knows React. Invalid reason: "I know React."
3. **What owns game state?** Zustand store (imperative access via `getState()`), NOT `useState`.
4. **What is the HUD strategy?** React components via portal? `<Html>` from drei? Pure 3D text?

---

## 1. Project Setup

```bash
npm create vite@latest my-r3f-game -- --template react-ts
cd my-r3f-game
npm install three @react-three/fiber @react-three/drei @react-three/rapier zustand
npm install -D @types/three
```

### Canvas Configuration

```tsx
// ✅ REQUIRED — game-optimized Canvas setup
import { Canvas } from '@react-three/fiber';
import { KeyboardControls } from '@react-three/drei';

// Define keyboard map OUTSIDE component (stable reference)
const KEYBOARD_MAP = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
  { name: 'jump', keys: ['Space'] },
  { name: 'sprint', keys: ['ShiftLeft'] },
];

function Game() {
  return (
    <KeyboardControls map={KEYBOARD_MAP}>
      <Canvas
        shadows
        camera={{ position: [0, 5, 10], fov: 50 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          // Prevent context loss on mobile
          failIfMajorPerformanceCaveat: false,
        }}
        // Game loop — always render, don't optimize for static
        frameloop="always"
      >
        <GameScene />
      </Canvas>
      <HUD />
    </KeyboardControls>
  );
}
```

---

## 2. State Architecture

### The Golden Rule

**Game state → Zustand store with imperative access.**
**UI state → React state (useState, useContext).**
**Never cross the streams.**

```typescript
// ✅ REQUIRED — Zustand game store
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface GameState {
  // Game simulation state (changes every frame)
  playerPosition: [number, number, number];
  playerVelocity: [number, number, number];
  health: number;
  score: number;
  ammo: number;

  // Scene state (changes on events)
  scene: 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';
  level: number;
  enemies: Enemy[];

  // Actions (called from useFrame, NOT from React renders)
  setPlayerPosition: (pos: [number, number, number]) => void;
  takeDamage: (amount: number) => void;
  addScore: (points: number) => void;
  setScene: (scene: GameState['scene']) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    playerPosition: [0, 0, 0],
    playerVelocity: [0, 0, 0],
    health: 100,
    score: 0,
    ammo: 30,
    scene: 'MENU',
    level: 1,
    enemies: [],

    setPlayerPosition: (pos) => set({ playerPosition: pos }),

    takeDamage: (amount) => {
      const health = Math.max(0, get().health - amount);
      set({ health });
      if (health <= 0) set({ scene: 'GAME_OVER' });
    },

    addScore: (points) => set({ score: get().score + points }),

    setScene: (scene) => set({ scene }),

    reset: () => set({
      health: 100, score: 0, ammo: 30,
      playerPosition: [0, 0, 0], scene: 'PLAYING',
    }),
  }))
);
```

### Accessing State in useFrame (HOT PATH)

```tsx
// ✅ CORRECT — imperative access, no re-renders
function Player() {
  const ref = useRef<THREE.Group>(null);

  useFrame(() => {
    // Get state WITHOUT subscribing to React re-renders
    const { playerPosition } = useGameStore.getState();
    if (ref.current) {
      ref.current.position.set(...playerPosition);
    }
  });

  return (
    <group ref={ref}>
      <mesh>
        <capsuleGeometry args={[0.5, 1, 8, 16]} />
        <meshStandardMaterial color="#4f46e5" />
      </mesh>
    </group>
  );
}

// ❌ WRONG — subscribes to React, re-renders 60x/sec
function BadPlayer() {
  const playerPosition = useGameStore((s) => s.playerPosition);
  // This component re-renders every frame. At 60fps with 50 enemies
  // doing the same thing, React reconciliation kills performance.
  return <mesh position={playerPosition} />;
}
```

### Subscribing to Infrequent Changes (UI)

```tsx
// ✅ CORRECT — React subscription for UI that changes rarely
function HealthBar() {
  // This only re-renders when health actually changes (selector equality)
  const health = useGameStore((s) => s.health);

  return (
    <div className="health-bar">
      <div
        className="health-bar-fill"
        style={{ width: `${health}%` }}
      />
    </div>
  );
}
```

---

## 3. Physics with @react-three/rapier

### Setup

```tsx
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier';

function GameScene() {
  return (
    <Physics
      gravity={[0, -9.81, 0]}
      timeStep="vary"  // or 1/60 for fixed
      debug={process.env.NODE_ENV === 'development'} // Physics wireframes in dev
    >
      <Player />
      <Ground />
      <Enemies />
    </Physics>
  );
}
```

### Character Controller

```tsx
import { RigidBody, CapsuleCollider, useRapier } from '@react-three/rapier';
import { useKeyboardControls } from '@react-three/drei';

function Player() {
  const rigidBody = useRef<RapierRigidBody>(null);
  const [, getKeys] = useKeyboardControls();
  const { rapier, world } = useRapier();

  const MOVE_SPEED = 5;
  const JUMP_FORCE = 8;

  useFrame(() => {
    if (!rigidBody.current) return;

    const { forward, backward, left, right, jump } = getKeys();
    const velocity = rigidBody.current.linvel();

    // Movement
    const moveX = (right ? 1 : 0) - (left ? 1 : 0);
    const moveZ = (backward ? 1 : 0) - (forward ? 1 : 0);

    rigidBody.current.setLinvel(
      { x: moveX * MOVE_SPEED, y: velocity.y, z: moveZ * MOVE_SPEED },
      true
    );

    // Ground check via raycast
    const origin = rigidBody.current.translation();
    const ray = new rapier.Ray(
      { x: origin.x, y: origin.y, z: origin.z },
      { x: 0, y: -1, z: 0 }
    );
    const hit = world.castRay(ray, 1.5, true);
    const isGrounded = hit !== null && hit.timeOfImpact < 1.2;

    // Jump
    if (jump && isGrounded) {
      rigidBody.current.setLinvel(
        { x: velocity.x, y: JUMP_FORCE, z: velocity.z },
        true
      );
    }

    // Update store (imperative — no React re-render)
    const pos = rigidBody.current.translation();
    useGameStore.getState().setPlayerPosition([pos.x, pos.y, pos.z]);
  });

  return (
    <RigidBody
      ref={rigidBody}
      type="dynamic"
      colliders={false}
      enabledRotations={[false, false, false]} // Don't topple
      linearDamping={0.5}
    >
      <CapsuleCollider args={[0.5, 0.5]} position={[0, 1, 0]} />
      <PlayerModel />
    </RigidBody>
  );
}
```

### Collision Detection

```tsx
// Sensor colliders for triggers (pickups, zones, hazards)
function HealthPickup({ position }: { position: [number, number, number] }) {
  const [collected, setCollected] = useState(false);

  if (collected) return null;

  return (
    <RigidBody type="fixed" colliders={false} position={position}>
      <CuboidCollider
        args={[0.5, 0.5, 0.5]}
        sensor
        onIntersectionEnter={({ other }) => {
          if (other.rigidBodyObject?.name === 'player') {
            useGameStore.getState().takeDamage(-25); // Heal
            setCollected(true);
          }
        }}
      />
      <Float speed={2} rotationIntensity={1}>
        <mesh>
          <octahedronGeometry args={[0.3]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} />
        </mesh>
      </Float>
    </RigidBody>
  );
}
```

---

## 4. Camera Systems

### Third-Person Follow Camera

```tsx
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const CAMERA_OFFSET = new THREE.Vector3(0, 5, 8);
const LOOK_OFFSET = new THREE.Vector3(0, 1, 0);
const SMOOTH_SPEED = 5;

function FollowCamera() {
  const { camera } = useThree();
  const targetPosition = new THREE.Vector3();
  const targetLookAt = new THREE.Vector3();

  useFrame((_, delta) => {
    const playerPos = useGameStore.getState().playerPosition;
    const playerVec = new THREE.Vector3(...playerPos);

    // Target position = player + offset
    targetPosition.copy(playerVec).add(CAMERA_OFFSET);

    // Smooth lerp
    camera.position.lerp(targetPosition, SMOOTH_SPEED * delta);

    // Look at player (with vertical offset)
    targetLookAt.copy(playerVec).add(LOOK_OFFSET);
    camera.lookAt(targetLookAt);
  });

  return null;
}
```

### Orbital Camera (Strategy / Top-Down)

```tsx
import { OrbitControls } from '@react-three/drei';

function StrategyCamera() {
  return (
    <OrbitControls
      enablePan={true}
      enableRotate={true}
      enableZoom={true}
      minDistance={10}
      maxDistance={50}
      minPolarAngle={Math.PI / 6}   // Don't go below horizon
      maxPolarAngle={Math.PI / 3}   // Don't go too top-down
      panSpeed={2}
      zoomSpeed={1.5}
    />
  );
}
```

---

## 5. HUD Integration

### Strategy 1: React Portal (Recommended)

HUD lives in React DOM, positioned absolutely over the Canvas. Best
performance, full CSS styling, no 3D rendering cost.

```tsx
function App() {
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <Canvas style={{ position: 'absolute', inset: 0 }}>
        <GameScene />
      </Canvas>

      {/* HUD layer — pure React, no Canvas cost */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <HealthBar />
        <ScoreDisplay />
        <AmmoCounter />
        <Minimap />
      </div>
    </div>
  );
}
```

### Strategy 2: drei `<Html>` (For World-Space UI)

UI elements attached to 3D positions (name tags, health bars above enemies).

```tsx
import { Html } from '@react-three/drei';

function EnemyHealthBar({ health, maxHealth }: { health: number; maxHealth: number }) {
  return (
    <Html
      position={[0, 2.5, 0]}
      center
      distanceFactor={10}     // Scale with distance
      occlude                  // Hide when behind objects
      style={{ pointerEvents: 'none' }}
    >
      <div className="enemy-health-bar">
        <div
          className="enemy-health-fill"
          style={{ width: `${(health / maxHealth) * 100}%` }}
        />
      </div>
    </Html>
  );
}
```

**Use `<Html>` sparingly.** Each instance creates a DOM element that must be
positioned every frame via CSS transform. 50 enemies with `<Html>` health
bars = 50 DOM elements updating position 60x/sec = jank.

---

## 6. Asset Loading

### Preloading Pattern

```tsx
import { useGLTF, useTexture, useAnimations } from '@react-three/drei';
import { Suspense } from 'react';

// Preload outside component tree (runs once)
useGLTF.preload('/models/player.glb');
useGLTF.preload('/models/environment.glb');
useTexture.preload('/textures/ground.webp');

function GameScene() {
  return (
    <Suspense fallback={<LoadingScene />}>
      <Physics>
        <Player />
        <Environment />
      </Physics>
    </Suspense>
  );
}

function LoadingScene() {
  // Show a simple loading indicator inside the Canvas
  return (
    <mesh>
      <ringGeometry args={[0.8, 1, 32]} />
      <meshBasicMaterial color="#6366f1" />
    </mesh>
  );
}
```

### Animated Models

```tsx
function AnimatedCharacter({ url, animation }: { url: string; animation: string }) {
  const { scene, animations } = useGLTF(url);
  const { actions, mixer } = useAnimations(animations, scene);

  useEffect(() => {
    const action = actions[animation];
    if (action) {
      action.reset().fadeIn(0.2).play();
      return () => { action.fadeOut(0.2); };
    }
  }, [animation, actions]);

  // Clone scene to allow multiple instances
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  return <primitive object={clonedScene} />;
}
```

---

## 7. Performance

### Critical Rules

| Rule | Why |
|------|-----|
| Never subscribe game state to React renders | 60 state changes/sec = 60 re-renders = death |
| Use `useFrame` + `getState()` for hot path | Imperative access skips React reconciliation |
| Instance identical meshes | 100 coins as `<Instance>` = 1 draw call |
| Use `<Suspense>` for all asset loading | Prevents render-before-load crashes |
| Set `dpr={[1, 2]}` not `dpr={2}` | Adapts to device capability |
| Skip post-processing on mobile | Check `isMobile` and conditionally render |

### Instancing for Many Objects

```tsx
import { Instances, Instance } from '@react-three/drei';

function CoinField({ positions }: { positions: [number, number, number][] }) {
  return (
    <Instances limit={positions.length}>
      <cylinderGeometry args={[0.3, 0.3, 0.05, 16]} />
      <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
      {positions.map((pos, i) => (
        <Instance key={i} position={pos} rotation={[Math.PI / 2, 0, 0]} />
      ))}
    </Instances>
  );
}
```

### Performance Monitor

```tsx
import { Perf } from 'r3f-perf';

function GameScene() {
  return (
    <>
      {process.env.NODE_ENV === 'development' && (
        <Perf position="bottom-left" />
      )}
      {/* ... game content */}
    </>
  );
}
```

---

## ⛔ STOP GATE — R3F Anti-Patterns

Run these checks before marking an R3F game complete:

```bash
# 1. React subscriptions to hot-path state
grep -rn "useGameStore((s)" src/ --include="*.tsx" --include="*.ts"
# Each result: Is this in a component that renders a 3D mesh?
# If yes: Does the subscribed value change every frame?
# If yes: 🔴 CRITICAL — use getState() instead

# 2. Missing Suspense boundaries
grep -rn "useGLTF\|useTexture\|useFont" src/ --include="*.tsx"
# For each: Is the parent wrapped in <Suspense>? If not: 🔴 CRITICAL

# 3. Object allocation in useFrame
grep -rn "new THREE\.\|new Vector3\|new Quaternion\|new Euler" src/ --include="*.tsx"
# If inside useFrame: 🔴 CRITICAL — allocate outside, reuse

# 4. Missing physics cleanup
grep -rn "RigidBody\|CuboidCollider\|CapsuleCollider" src/ --include="*.tsx"
# Count physics bodies. If > 200: Review instancing and sleep distance

# 5. <Html> overuse
grep -rn "<Html" src/ --include="*.tsx" | wc -l
# If > 10 instances rendered simultaneously: 🟡 WARNING — performance risk
```

---

## NEVER

- **NEVER** use `useState` for values that change every frame — use Zustand `getState()`
- **NEVER** allocate objects (`new Vector3()`) inside `useFrame` — allocate once, reuse
- **NEVER** skip `<Suspense>` around async loaders — the scene will crash
- **NEVER** use `<Html>` for bulk elements (50+ enemies with DOM health bars)
- **NEVER** forget to clone GLTF scenes when reusing the same model — instances share mutations
- **NEVER** set `frameloop="demand"` for games — games render every frame
- **NEVER** put game simulation logic in `useEffect` — it belongs in `useFrame` or the Zustand store
- **NEVER** use `OrbitControls` for a game camera — build a purpose-built camera system

---

## Pre-Completion Checklist

- [ ] Canvas has `frameloop="always"` and performance-tuned `gl` props
- [ ] Game state in Zustand store with `getState()` for hot-path access
- [ ] UI state (health, score, ammo) subscribed via selectors (React re-renders OK)
- [ ] Physics bodies use correct types (dynamic, fixed, kinematic)
- [ ] Character controller uses raycast ground check (not collision events)
- [ ] Camera system is purpose-built (follow, orbital, first-person)
- [ ] HUD uses React portal overlay (not `<Html>` for every element)
- [ ] Assets preloaded with `useGLTF.preload()` and wrapped in `<Suspense>`
- [ ] Instancing used for repeated objects (coins, bullets, particles)
- [ ] Performance tested on mobile (FPS > 30)
- [ ] No `new Vector3()` inside `useFrame`
- [ ] No `useState` for per-frame game state

---

## Related Skills

| Skill | When to use |
|-------|-------------|
| `web-game-foundations` | BEFORE this skill — engine choice, game loop, input model |
| `three-webgl-game-building` | Alternative to R3F for games that don't need React |
| `web-3d-asset-pipeline` | Preparing GLB models for R3F loading |
| `three-d-developing` | Non-game 3D patterns (scroll scenes, product viewers) |
| `live-session-building` | Multiplayer session architecture |
| `animation-designing` | Motion design for game UI transitions |
| `component-building` | Building the React HUD components |

---

## Output Format

```markdown
## R3F Game: [Game Name]

### Architecture
[Zustand store shape, scene structure, physics setup]

### Player Controller
[Movement, physics body type, ground detection]

### Camera
[Camera type, smoothing, constraints]

### HUD Strategy
[Portal overlay vs <Html> vs 3D text]

### Asset Loading
[Preloaded models, Suspense boundaries, loading state]

### Performance
[FPS target, instancing usage, draw call count]

### R3F Anti-Pattern Scan
[Output from stop gate commands above]
```
