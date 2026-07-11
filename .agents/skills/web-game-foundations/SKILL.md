---
name: web-game-foundations
description: >
  Sets browser-game architecture before implementation. Covers engine
  selection (Phaser, Three.js, R3F, Babylon.js, PixiJS, raw Canvas),
  simulation vs render boundaries, fixed-timestep game loops, input
  model design, asset organization, save/load architecture, state
  machines, ECS vs OOP patterns, and debug/performance strategy.
  Use when starting a new browser game, choosing an engine, designing
  game architecture, planning input systems, or when user mentions
  game foundations, engine choice, game loop, or game architecture.
---

# Web Game Foundations

Architecture before implementation. Every game that skips this step
ships bugs baked into its structure — not its logic.

A game is not a web app with a canvas. It has a simulation that ticks
independent of the display, an input layer that maps hardware to verbs,
an asset pipeline that loads before play begins, and a state machine
that governs what the player can do at any moment. If any of these are
missing, you don't have a game — you have an interactive toy that will
break the moment someone alt-tabs.

---

## STOP — Comprehension Gate

Before writing any game code, answer ALL of these:

1. **What engine?** Phaser, Three.js, R3F, Babylon.js, PixiJS, raw Canvas? (Use the decision tree below.)
2. **What is the simulation tick?** Fixed timestep or variable? What target rate?
3. **What are the inputs?** Keyboard, touch, gamepad, mouse? What are the verbs (jump, move, fire)?
4. **What scenes/states exist?** Menu → Play → Pause → GameOver? Map them.
5. **Where do assets live?** Directory structure, manifest, lazy vs eager loading?
6. **Is there save/load?** localStorage, IndexedDB, cloud? What gets persisted?
7. **Is this multiplayer?** If yes, stop here and also activate `live-session-building`.

**Do not proceed without clear answers. Unclear architecture produces unclear bugs.**

---

## 1. Engine Selection

### Decision Tree

```
What type of game?
│
├── 2D game
│   ├── Physics, sprites, tilemaps, animations → Phaser 3
│   ├── Particle-heavy, rendering focus, no built-in physics → PixiJS + matter.js
│   ├── Very simple (snake, pong, breakout) → Raw Canvas API
│   ├── Card game, turn-based, UI-heavy → React components + Canvas overlay
│   └── Puzzle, word game, board game → React/HTML + minimal Canvas
│
├── 3D game
│   ├── Lives inside a React app (shared state, HUD as JSX) → React Three Fiber
│   ├── Standalone, imperative, maximum control → Three.js + Vite
│   ├── Built-in physics, full game framework → Babylon.js
│   └── Visual editor, rapid prototyping → PlayCanvas
│
├── Hybrid 2D/3D
│   ├── 2D gameplay with 3D presentation → R3F with orthographic camera
│   └── 3D world with 2D HUD → Three.js/R3F + HTML overlay
│
└── Multiplayer?
    ├── Real-time (< 50ms latency) → WebSocket + authoritative server
    ├── Turn-based → REST API or Supabase database
    ├── Audience/spectator → Supabase Realtime channels
    └── See: live-session-building skill
```

### Quick Reference

| Engine | Best For | Bundle Size | Physics | Learning Curve |
|--------|----------|-------------|---------|----------------|
| Phaser 3 | 2D arcade, platformer, RPG | ~1MB | Arcade + Matter.js | Medium |
| PixiJS | 2D rendering, particles, effects | ~500KB | None (add manually) | Low |
| Three.js | 3D standalone games | ~600KB | None (add Rapier/Cannon) | Medium-High |
| React Three Fiber | 3D in React apps | ~700KB + React | @react-three/rapier | High |
| Babylon.js | Full 3D game framework | ~2MB | Built-in (Havok/Ammo) | High |
| Raw Canvas | Minimal 2D, learning | 0 | None | Low |

### STOP — Engine Lock

Once an engine is chosen, **do not switch mid-build.** Engine changes are
full rewrites. If you're unsure, prototype in 2 engines for 1 hour each,
then commit. Document the choice and rationale.

---

## 2. The Game Loop

### Why This Matters

Web apps render when state changes. Games render every frame, 60 times per
second, whether anything changed or not. The game loop is the heartbeat.

### Fixed Timestep (Recommended)

Simulation ticks at a constant rate regardless of frame rate. Rendering
interpolates between simulation states. This prevents physics from breaking
on fast/slow machines.

```typescript
// ✅ REQUIRED — fixed timestep game loop
const TICK_RATE = 1 / 60; // 60 Hz simulation
let accumulator = 0;
let previousTime = performance.now();
let simulationState = { /* your game state */ };
let previousState = { /* copy of previous state for interpolation */ };

function gameLoop(currentTime: number) {
  const deltaTime = (currentTime - previousTime) / 1000;
  previousTime = currentTime;

  // Cap delta to prevent spiral of death (tab was hidden)
  const cappedDelta = Math.min(deltaTime, 0.25);
  accumulator += cappedDelta;

  // Fixed timestep simulation
  while (accumulator >= TICK_RATE) {
    previousState = structuredClone(simulationState);
    simulationState = simulate(simulationState, TICK_RATE);
    accumulator -= TICK_RATE;
  }

  // Interpolation factor for smooth rendering
  const alpha = accumulator / TICK_RATE;
  render(previousState, simulationState, alpha);

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
```

**BECAUSE** variable timestep means physics runs faster on fast machines
and slower on slow machines. A character that jumps 3 tiles on your MacBook
jumps 4.7 tiles on a gaming PC. Fixed timestep eliminates this entire class
of bug.

### Variable Timestep (When Acceptable)

Only for games with no physics and no time-dependent logic (puzzle games,
card games, turn-based).

```typescript
// Acceptable ONLY for non-physics games
function gameLoop(currentTime: number) {
  const dt = (currentTime - previousTime) / 1000;
  previousTime = currentTime;

  update(dt); // dt-scaled movement: position += velocity * dt
  render();

  requestAnimationFrame(gameLoop);
}
```

### ⛔ STOP GATE — Game Loop

Run: `grep -rn "setInterval\|setTimeout" src/ --include="*.ts" --include="*.tsx" | grep -v node_modules`
If ANY game loop uses setInterval or setTimeout, flag as 🔴 CRITICAL.
Game loops MUST use `requestAnimationFrame`.

---

## 3. Input Model

### Action Mapping (Not Raw Keys)

Map hardware inputs to game verbs. This makes input remapping, gamepad
support, and touch controls trivial.

```typescript
// ✅ REQUIRED — action map, not raw key checks
type GameAction = 'MOVE_LEFT' | 'MOVE_RIGHT' | 'JUMP' | 'FIRE' | 'PAUSE';

interface InputBinding {
  keyboard: string[];
  gamepad?: { button?: number; axis?: [number, number] };
  touch?: 'left' | 'right' | 'tap' | 'swipe_up';
}

const DEFAULT_BINDINGS: Record<GameAction, InputBinding> = {
  MOVE_LEFT:  { keyboard: ['ArrowLeft', 'KeyA'], gamepad: { axis: [0, -1] }, touch: 'left' },
  MOVE_RIGHT: { keyboard: ['ArrowRight', 'KeyD'], gamepad: { axis: [0, 1] }, touch: 'right' },
  JUMP:       { keyboard: ['Space', 'ArrowUp', 'KeyW'], gamepad: { button: 0 }, touch: 'swipe_up' },
  FIRE:       { keyboard: ['KeyF', 'Enter'], gamepad: { button: 2 }, touch: 'tap' },
  PAUSE:      { keyboard: ['Escape', 'KeyP'], gamepad: { button: 9 } },
};

class InputManager {
  private activeActions = new Set<GameAction>();
  private pressedThisFrame = new Set<GameAction>();

  isActive(action: GameAction): boolean {
    return this.activeActions.has(action);
  }

  justPressed(action: GameAction): boolean {
    return this.pressedThisFrame.has(action);
  }

  // Call at end of each frame
  endFrame() {
    this.pressedThisFrame.clear();
  }
}
```

**BECAUSE** checking `if (keys['ArrowLeft'])` scattered across 20 files
means you can never add gamepad support, remap keys, or add touch without
rewriting everything.

### Touch Controls for Mobile

```typescript
// Virtual joystick zones
// Left 40% of screen = movement
// Right 60% of screen = actions
const JOYSTICK_ZONE_WIDTH = 0.4; // 40% of viewport

function handleTouchStart(e: TouchEvent) {
  for (const touch of e.changedTouches) {
    const x = touch.clientX / window.innerWidth;
    if (x < JOYSTICK_ZONE_WIDTH) {
      startVirtualJoystick(touch);
    } else {
      handleActionTouch(touch);
    }
  }
}
```

---

## 4. Scene State Machine

Every game has states. If you don't define them explicitly, they exist
implicitly as boolean spaghetti (`isPlaying && !isPaused && hasStarted`).

```typescript
// ✅ REQUIRED — explicit scene states
type GameScene =
  | 'BOOT'       // Loading core assets
  | 'MENU'       // Title screen, options
  | 'LOADING'    // Loading level assets
  | 'PLAYING'    // Active gameplay
  | 'PAUSED'     // Gameplay frozen, overlay visible
  | 'GAME_OVER'  // Results, retry options
  | 'CUTSCENE';  // Non-interactive sequence

type SceneTransition =
  | { from: 'BOOT'; to: 'MENU' }
  | { from: 'MENU'; to: 'LOADING' }
  | { from: 'LOADING'; to: 'PLAYING' }
  | { from: 'PLAYING'; to: 'PAUSED' }
  | { from: 'PAUSED'; to: 'PLAYING' }
  | { from: 'PLAYING'; to: 'GAME_OVER' }
  | { from: 'GAME_OVER'; to: 'MENU' }
  | { from: 'GAME_OVER'; to: 'LOADING' }; // Retry

const VALID_TRANSITIONS: Record<GameScene, GameScene[]> = {
  BOOT:      ['MENU'],
  MENU:      ['LOADING'],
  LOADING:   ['PLAYING'],
  PLAYING:   ['PAUSED', 'GAME_OVER', 'CUTSCENE'],
  PAUSED:    ['PLAYING', 'MENU'],
  GAME_OVER: ['MENU', 'LOADING'],
  CUTSCENE:  ['PLAYING'],
};
```

### ECS vs OOP — Architecture Decision

```
Need dynamic component composition (add/remove behaviors at runtime)?
  → Entity-Component-System (bitECS, miniplex, custom)

Traditional game objects with inheritance (Player extends Character)?
  → OOP with composition (prefer composition over deep inheritance)

Small game, few entity types?
  → OOP is fine, don't over-engineer

Large game, many entity types, need performance?
  → ECS for data-oriented design and cache efficiency
```

---

## 5. Asset Organization

### Directory Structure

```
public/
├── assets/
│   ├── sprites/        # 2D sprite sheets, individual frames
│   │   ├── player/
│   │   ├── enemies/
│   │   └── effects/
│   ├── models/         # 3D GLB/glTF files
│   │   ├── characters/
│   │   ├── environment/
│   │   └── props/
│   ├── audio/
│   │   ├── music/      # BGM (ogg/mp3, loop points documented)
│   │   └── sfx/        # Sound effects (short, pre-decoded)
│   ├── textures/       # Standalone textures, not in models
│   ├── fonts/          # Bitmap fonts, SDF fonts
│   └── data/           # Level data, dialogue, config JSONs
└── manifest.json       # Asset manifest with sizes and dependencies
```

### Asset Manifest

```json
{
  "scenes": {
    "menu": {
      "required": ["sprites/ui/buttons.png", "audio/music/menu.ogg"],
      "optional": ["sprites/backgrounds/menu-bg.png"]
    },
    "level-1": {
      "required": [
        "sprites/player/player-strip.png",
        "sprites/enemies/slime-strip.png",
        "data/levels/level-1.json"
      ],
      "optional": ["audio/music/level-1.ogg"]
    }
  }
}
```

### Loading Strategy

```
BOOT scene: Load menu assets (< 500KB target)
  → Show progress bar ONLY if load > 1 second
  → Transition to MENU when complete

MENU scene: Background-load level-1 assets
  → Show "loading" indicator on play button if not ready

LOADING scene: Load remaining level assets
  → Show actual progress (loaded / total bytes)
  → Transition to PLAYING when 100%
```

---

## 6. Save / Load Architecture

### Decision Tree

```
What needs persistence?
│
├── High scores, settings only → localStorage
│   Max: 5-10MB, synchronous, string-only
│
├── Level progress, inventory, complex state → IndexedDB
│   Max: unlimited (with user permission), async, structured data
│
├── Cross-device sync → Cloud save (Supabase / Firebase)
│   Merge strategy needed for offline + sync conflicts
│
└── Nothing (arcade, session-only) → In-memory only
```

### Save Data Pattern

```typescript
interface SaveData {
  version: number;      // For migration
  timestamp: number;
  player: {
    level: number;
    score: number;
    position: { x: number; y: number };
    inventory: string[];
  };
  settings: {
    musicVolume: number;
    sfxVolume: number;
    bindings: Record<string, string>;
  };
}

// ✅ REQUIRED — version-aware save/load
function save(data: SaveData): void {
  data.version = CURRENT_SAVE_VERSION;
  data.timestamp = Date.now();
  localStorage.setItem('game-save', JSON.stringify(data));
}

function load(): SaveData | null {
  const raw = localStorage.getItem('game-save');
  if (!raw) return null;

  const data = JSON.parse(raw) as SaveData;

  // Migration
  if (data.version < CURRENT_SAVE_VERSION) {
    return migrate(data);
  }

  return data;
}
```

---

## 7. Debug & Performance Strategy

### Required Debug Tools

| Tool | Purpose | When |
|------|---------|------|
| FPS counter | Frame rate monitor | Always during dev |
| Memory graph | Heap/GPU memory tracking | Profiling sessions |
| Physics debug draw | Visualize colliders, velocities | Physics tuning |
| Entity inspector | View/edit entity properties | Gameplay debugging |
| State logger | Log scene transitions, events | Flow debugging |
| Input visualizer | Show active actions, raw inputs | Input debugging |

### Performance Budgets

| Metric | 2D Game | 3D Game | Why |
|--------|---------|---------|-----|
| Target FPS | 60 | 60 (30 acceptable on mobile) | Below 30 = broken |
| Max bundle | 500KB | 2MB | Mobile data |
| First playable | < 3s on 3G | < 5s on 3G | Players leave |
| Input latency | < 16ms (1 frame) | < 16ms (1 frame) | Responsiveness |
| Memory ceiling | 50MB | 150MB | Mobile constraints |
| Draw calls | < 100 | < 200 | GPU bottleneck |

### Profiling Checklist

```bash
# 1. Check for game loop issues
grep -rn "setInterval\|setTimeout" src/ --include="*.ts" --include="*.tsx"
# Expect: 0 results in game loop code

# 2. Check for missing disposal (3D)
grep -rn "new THREE\.\|new Mesh\|new Geometry\|new Material" src/ --include="*.ts" --include="*.tsx"
# For each result, verify a corresponding .dispose() exists

# 3. Check for raw key checks instead of action mapping
grep -rn "keyCode\|key ==\|key ===\|keys\[" src/ --include="*.ts" --include="*.tsx"
# Expect: Only inside InputManager, not in game logic

# 4. Check for missing state machine
grep -rn "isPlaying\|isPaused\|isGameOver\|gameStarted" src/ --include="*.ts" --include="*.tsx"
# If boolean flags for game state: refactor to state machine
```

---

## NEVER

- **NEVER** use `setInterval` or `setTimeout` for game loops — use `requestAnimationFrame`
- **NEVER** skip the fixed timestep — variable dt breaks physics on different hardware
- **NEVER** scatter raw key checks — use an action map
- **NEVER** use boolean flags for scene state — use an explicit state machine
- **NEVER** load all assets upfront — load per-scene with a manifest
- **NEVER** skip the spiral-of-death cap (`Math.min(dt, 0.25)`) — hidden tabs will break physics
- **NEVER** choose an engine mid-build — prototype first, commit once
- **NEVER** put game state in React state (for R3F games) — use Zustand or plain objects

---

## Pre-Completion Checklist

- [ ] Engine selected and documented with rationale
- [ ] Game loop uses `requestAnimationFrame` with fixed timestep (or justified variable)
- [ ] Input model uses action mapping, not raw key checks
- [ ] Scene state machine defined with valid transitions
- [ ] Asset directory structure matches conventions
- [ ] Loading strategy documented (per-scene, with progress)
- [ ] Save/load strategy chosen (or explicitly marked "none needed")
- [ ] Performance budgets set (FPS, bundle, memory, draw calls)
- [ ] Debug tools plan documented
- [ ] All profiling checks pass

---

## Related Skills

| Skill | When to use |
|-------|-------------|
| `r3f-game-building` | After foundations — building the game with React Three Fiber |
| `three-webgl-game-building` | After foundations — building the game with plain Three.js |
| `playmaster` | Preparing 2D sprite assets for the game |
| `web-3d-asset-pipeline` | Preparing 3D model assets for the game |
| `live-session-building` | If multiplayer or audience features are needed |
| `animation-designing` | Motion design for game UI and transitions |
| `deploying` | Shipping the game to Vercel/Cloudflare |

---

## Output Format

```markdown
## Game Architecture: [Game Name]

### Engine
[Selected engine + rationale]

### Game Loop
[Fixed/variable timestep, tick rate, spiral-of-death handling]

### Input Model
[Action map, supported devices (keyboard/touch/gamepad)]

### Scene States
[State machine diagram, valid transitions]

### Asset Strategy
[Directory structure, loading strategy, bundle budget]

### Save/Load
[Persistence strategy or "session-only"]

### Performance Targets
[FPS, bundle size, memory, draw calls]

### Debug Plan
[Which tools, when to profile]
```
