---
name: three-webgl-game-building
description: >
  Implements browser-game runtimes with plain Three.js and Vite. Covers
  imperative scene control in TypeScript, GLB asset loading with DRACO,
  Rapier WASM physics integration, input managers, scene state machines,
  rendering pipeline with post-processing, WebGPU readiness checks, and
  GPU resource lifecycle management. Use when building a standalone 3D
  browser game without React, using Three.js directly, debugging WebGL
  issues, or when user mentions Three.js game, imperative 3D, WebGL game,
  or Vite game.
---

# Three WebGL Game Building

Plain Three.js gives you total control. No React reconciliation overhead,
no virtual DOM, no component lifecycle fighting your game loop. You manage
the scene graph, the render pipeline, and every GPU resource yourself.

The cost: you also manage every disposal, every resize handler, every
state transition. There is no framework to catch your leaks.

---

## STOP — Comprehension Gate

Before writing Three.js game code, confirm:

1. **Have you completed `web-game-foundations`?** Engine choice, game loop, input model, scene states must be defined first.
2. **Why plain Three.js over R3F?** Valid reasons: no React in the project, need maximum control, team prefers imperative, performance ceiling matters. Invalid reason: "React is slow" (R3F is not slow when used correctly).
3. **What is the physics engine?** Rapier (WASM, recommended), Cannon-es, Ammo.js (Bullet port), or none?
4. **What is the rendering target?** WebGL2 (safe default), WebGPU (experimental), or WebGL1 fallback?

---

## 1. Project Setup

```bash
npm create vite@latest my-game -- --template vanilla-ts
cd my-game
npm install three @dimforge/rapier3d-compat
npm install -D @types/three vite-plugin-glsl
```

### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  plugins: [glsl()],
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          rapier: ['@dimforge/rapier3d-compat'],
        },
      },
    },
  },
  assetsInclude: ['**/*.glb', '**/*.gltf', '**/*.hdr', '**/*.ktx2'],
});
```

### Entry Point

```typescript
// src/main.ts
import { Engine } from './engine/Engine';

async function main() {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;

  if (!canvas) {
    throw new Error('Canvas element #game-canvas not found');
  }

  const engine = new Engine(canvas);
  await engine.init();
  engine.start();
}

main().catch((err) => {
  console.error('Game failed to start:', err);
  document.body.innerHTML = `
    <div style="display:grid;place-items:center;height:100vh;color:#ef4444;font-family:monospace">
      <div>
        <h1>Failed to start</h1>
        <p>${err.message}</p>
        <button onclick="location.reload()">Retry</button>
      </div>
    </div>
  `;
});
```

---

## 2. Engine Architecture

### Core Engine Class

```typescript
// src/engine/Engine.ts
import * as THREE from 'three';
import { SceneManager, GameScene } from './SceneManager';
import { InputManager } from './InputManager';
import { AssetManager } from './AssetManager';
import { PhysicsWorld } from './PhysicsWorld';

export class Engine {
  readonly renderer: THREE.WebGLRenderer;
  readonly clock: THREE.Clock;
  readonly scenes: SceneManager;
  readonly input: InputManager;
  readonly assets: AssetManager;
  readonly physics: PhysicsWorld;

  private animationFrameId: number = 0;
  private accumulator: number = 0;
  private readonly TICK_RATE = 1 / 60;

  constructor(canvas: HTMLCanvasElement) {
    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;

    // Systems
    this.clock = new THREE.Clock();
    this.scenes = new SceneManager(this);
    this.input = new InputManager();
    this.assets = new AssetManager();
    this.physics = new PhysicsWorld();

    // Resize handler
    window.addEventListener('resize', this.onResize);
  }

  async init(): Promise<void> {
    await this.physics.init();
    await this.assets.loadManifest('/assets/manifest.json');
    this.scenes.switchTo('MENU');
  }

  start(): void {
    this.clock.start();
    this.loop(performance.now());
  }

  stop(): void {
    cancelAnimationFrame(this.animationFrameId);
  }

  private loop = (currentTime: number): void => {
    this.animationFrameId = requestAnimationFrame(this.loop);

    const dt = this.clock.getDelta();
    const cappedDt = Math.min(dt, 0.25); // Spiral of death cap
    this.accumulator += cappedDt;

    // Fixed timestep simulation
    while (this.accumulator >= this.TICK_RATE) {
      this.input.poll();
      this.physics.step(this.TICK_RATE);
      this.scenes.update(this.TICK_RATE);
      this.accumulator -= this.TICK_RATE;
    }

    // Render with interpolation alpha
    const alpha = this.accumulator / this.TICK_RATE;
    this.scenes.render(this.renderer, alpha);

    this.input.endFrame();
  };

  private onResize = (): void => {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.scenes.onResize(window.innerWidth, window.innerHeight);
  };

  dispose(): void {
    this.stop();
    window.removeEventListener('resize', this.onResize);
    this.scenes.dispose();
    this.physics.dispose();
    this.input.dispose();
    this.renderer.dispose();
  }
}
```

---

## 3. Scene Manager

```typescript
// src/engine/SceneManager.ts
import * as THREE from 'three';
import type { Engine } from './Engine';

export type GameSceneKey = 'MENU' | 'LOADING' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export interface GameScene {
  readonly scene: THREE.Scene;
  readonly camera: THREE.Camera;

  enter(engine: Engine): Promise<void>;
  exit(engine: Engine): void;
  update(dt: number, engine: Engine): void;
  render(renderer: THREE.WebGLRenderer, alpha: number): void;
  onResize(width: number, height: number): void;
  dispose(): void;
}

export class SceneManager {
  private scenes = new Map<GameSceneKey, GameScene>();
  private current: GameSceneKey | null = null;

  constructor(private engine: Engine) {}

  register(key: GameSceneKey, scene: GameScene): void {
    this.scenes.set(key, scene);
  }

  async switchTo(key: GameSceneKey): Promise<void> {
    // Exit current scene
    if (this.current) {
      const prev = this.scenes.get(this.current);
      prev?.exit(this.engine);
    }

    // Enter new scene
    const next = this.scenes.get(key);
    if (!next) throw new Error(`Scene "${key}" not registered`);

    await next.enter(this.engine);
    this.current = key;
  }

  update(dt: number): void {
    if (!this.current) return;
    this.scenes.get(this.current)?.update(dt, this.engine);
  }

  render(renderer: THREE.WebGLRenderer, alpha: number): void {
    if (!this.current) return;
    const scene = this.scenes.get(this.current);
    if (scene) {
      scene.render(renderer, alpha);
    }
  }

  onResize(width: number, height: number): void {
    if (!this.current) return;
    this.scenes.get(this.current)?.onResize(width, height);
  }

  dispose(): void {
    for (const scene of this.scenes.values()) {
      scene.dispose();
    }
    this.scenes.clear();
  }
}
```

---

## 4. Input Manager

```typescript
// src/engine/InputManager.ts
type GameAction =
  | 'MOVE_FORWARD' | 'MOVE_BACKWARD' | 'MOVE_LEFT' | 'MOVE_RIGHT'
  | 'JUMP' | 'FIRE' | 'INTERACT' | 'PAUSE';

interface Binding {
  keys: string[];
  gamepadButton?: number;
  gamepadAxis?: [number, number]; // [axis, threshold]
}

const DEFAULT_BINDINGS: Record<GameAction, Binding> = {
  MOVE_FORWARD:  { keys: ['KeyW', 'ArrowUp'],    gamepadAxis: [1, -0.3] },
  MOVE_BACKWARD: { keys: ['KeyS', 'ArrowDown'],  gamepadAxis: [1, 0.3] },
  MOVE_LEFT:     { keys: ['KeyA', 'ArrowLeft'],   gamepadAxis: [0, -0.3] },
  MOVE_RIGHT:    { keys: ['KeyD', 'ArrowRight'],  gamepadAxis: [0, 0.3] },
  JUMP:          { keys: ['Space'],               gamepadButton: 0 },
  FIRE:          { keys: ['KeyF', 'Enter'],       gamepadButton: 2 },
  INTERACT:      { keys: ['KeyE'],                gamepadButton: 3 },
  PAUSE:         { keys: ['Escape'],              gamepadButton: 9 },
};

export class InputManager {
  private keysDown = new Set<string>();
  private keysJustPressed = new Set<string>();
  private keysJustReleased = new Set<string>();
  private bindings: Record<GameAction, Binding> = { ...DEFAULT_BINDINGS };

  constructor() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    if (!this.keysDown.has(e.code)) {
      this.keysJustPressed.add(e.code);
    }
    this.keysDown.add(e.code);
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    this.keysDown.delete(e.code);
    this.keysJustReleased.add(e.code);
  };

  private onBlur = (): void => {
    this.keysDown.clear(); // Release all keys when window loses focus
  };

  poll(): void {
    // Poll gamepads (they don't fire events)
    this.pollGamepads();
  }

  isActive(action: GameAction): boolean {
    const binding = this.bindings[action];
    return binding.keys.some((k) => this.keysDown.has(k));
  }

  justPressed(action: GameAction): boolean {
    const binding = this.bindings[action];
    return binding.keys.some((k) => this.keysJustPressed.has(k));
  }

  endFrame(): void {
    this.keysJustPressed.clear();
    this.keysJustReleased.clear();
  }

  private pollGamepads(): void {
    const gamepads = navigator.getGamepads();
    // Gamepad polling implementation
    for (const gp of gamepads) {
      if (!gp) continue;
      // Map buttons and axes to actions
    }
  }

  dispose(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
  }
}
```

---

## 5. GLB/glTF Asset Loading

```typescript
// src/engine/AssetManager.ts
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';

export class AssetManager {
  private gltfLoader: GLTFLoader;
  private textureLoader: THREE.TextureLoader;
  private audioLoader: THREE.AudioLoader;
  private cache = new Map<string, any>();

  constructor() {
    // DRACO decoder for compressed geometry
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');

    this.gltfLoader = new GLTFLoader();
    this.gltfLoader.setDRACOLoader(dracoLoader);

    this.textureLoader = new THREE.TextureLoader();
    this.audioLoader = new THREE.AudioLoader();
  }

  async loadManifest(url: string): Promise<void> {
    const response = await fetch(url);
    const manifest = await response.json();
    // Store manifest for scene-based loading
    this.cache.set('__manifest', manifest);
  }

  async loadGLTF(url: string): Promise<THREE.Group> {
    if (this.cache.has(url)) {
      return (this.cache.get(url) as THREE.Group).clone();
    }

    const gltf = await this.gltfLoader.loadAsync(url);
    this.cache.set(url, gltf.scene);
    return gltf.scene.clone();
  }

  async loadGLTFWithAnimations(url: string): Promise<{
    scene: THREE.Group;
    animations: THREE.AnimationClip[];
  }> {
    const gltf = await this.gltfLoader.loadAsync(url);
    return {
      scene: gltf.scene,
      animations: gltf.animations,
    };
  }

  async loadTexture(url: string): Promise<THREE.Texture> {
    if (this.cache.has(url)) return this.cache.get(url);

    const texture = await this.textureLoader.loadAsync(url);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(url, texture);
    return texture;
  }

  // Load with progress callback
  async loadSceneAssets(
    sceneKey: string,
    onProgress: (loaded: number, total: number) => void
  ): Promise<void> {
    const manifest = this.cache.get('__manifest');
    const sceneAssets = manifest?.scenes?.[sceneKey];
    if (!sceneAssets) return;

    const urls = [...(sceneAssets.required || []), ...(sceneAssets.optional || [])];
    let loaded = 0;

    await Promise.all(
      urls.map(async (url: string) => {
        try {
          if (url.endsWith('.glb') || url.endsWith('.gltf')) {
            await this.loadGLTF(url);
          } else if (url.match(/\.(png|jpg|jpeg|webp)$/)) {
            await this.loadTexture(url);
          }
          loaded++;
          onProgress(loaded, urls.length);
        } catch (err) {
          console.warn(`Failed to load optional asset: ${url}`, err);
          loaded++;
          onProgress(loaded, urls.length);
        }
      })
    );
  }

  dispose(): void {
    for (const [key, value] of this.cache) {
      if (key === '__manifest') continue;
      if (value instanceof THREE.Texture) value.dispose();
      if (value instanceof THREE.Group) {
        value.traverse((obj: THREE.Object3D) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry?.dispose();
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m) => m.dispose());
            } else {
              (obj.material as THREE.Material)?.dispose();
            }
          }
        });
      }
    }
    this.cache.clear();
  }
}
```

---

## 6. Physics Integration (Rapier)

```typescript
// src/engine/PhysicsWorld.ts
import RAPIER from '@dimforge/rapier3d-compat';

export class PhysicsWorld {
  world!: RAPIER.World;
  private initialized = false;

  async init(): Promise<void> {
    await RAPIER.init();
    this.world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
    this.initialized = true;
  }

  step(dt: number): void {
    if (!this.initialized) return;
    this.world.timestep = dt;
    this.world.step();
  }

  createDynamicBody(
    position: { x: number; y: number; z: number },
    colliderDesc: RAPIER.ColliderDesc
  ): { body: RAPIER.RigidBody; collider: RAPIER.Collider } {
    const bodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(
      position.x, position.y, position.z
    );
    const body = this.world.createRigidBody(bodyDesc);
    const collider = this.world.createCollider(colliderDesc, body);
    return { body, collider };
  }

  createStaticBody(
    position: { x: number; y: number; z: number },
    colliderDesc: RAPIER.ColliderDesc
  ): RAPIER.Collider {
    const bodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(
      position.x, position.y, position.z
    );
    const body = this.world.createRigidBody(bodyDesc);
    return this.world.createCollider(colliderDesc, body);
  }

  castRay(
    origin: { x: number; y: number; z: number },
    direction: { x: number; y: number; z: number },
    maxDistance: number
  ): RAPIER.RayColliderHit | null {
    const ray = new RAPIER.Ray(origin, direction);
    return this.world.castRay(ray, maxDistance, true);
  }

  dispose(): void {
    if (this.initialized) {
      this.world.free();
    }
  }
}
```

---

## 7. GPU Resource Management

### The #1 Bug in Three.js Games: Memory Leaks

```typescript
// ✅ REQUIRED — dispose helper
function disposeObject(object: THREE.Object3D): void {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry?.dispose();

      if (Array.isArray(child.material)) {
        child.material.forEach(disposeMaterial);
      } else {
        disposeMaterial(child.material);
      }
    }

    if (child instanceof THREE.Line) {
      child.geometry?.dispose();
      disposeMaterial(child.material as THREE.Material);
    }

    if (child instanceof THREE.Points) {
      child.geometry?.dispose();
      disposeMaterial(child.material as THREE.Material);
    }
  });
}

function disposeMaterial(material: THREE.Material): void {
  material.dispose();

  // Dispose textures attached to the material
  for (const key of Object.keys(material)) {
    const value = (material as any)[key];
    if (value instanceof THREE.Texture) {
      value.dispose();
    }
  }
}
```

### Scene Transition Cleanup

```typescript
// When switching scenes, dispose EVERYTHING from the previous scene
class PlayScene implements GameScene {
  readonly scene = new THREE.Scene();
  // ...

  exit(engine: Engine): void {
    // Remove all children and dispose
    while (this.scene.children.length > 0) {
      const child = this.scene.children[0];
      this.scene.remove(child);
      disposeObject(child);
    }

    // Clear any render targets
    // Dispose post-processing passes
    // Remove event listeners

    console.log(
      `[PlayScene] Disposed. Geometries: ${engine.renderer.info.memory.geometries}, ` +
      `Textures: ${engine.renderer.info.memory.textures}`
    );
  }
}
```

---

## 8. Post-Processing

```typescript
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';

class RenderPipeline {
  private composer: EffectComposer;

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
    this.composer = new EffectComposer(renderer);

    const renderPass = new RenderPass(scene, camera);
    this.composer.addPass(renderPass);

    // Bloom for emissive objects (pickups, projectiles)
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.5,   // strength
      0.4,   // radius
      0.85   // threshold
    );
    this.composer.addPass(bloomPass);

    // Anti-aliasing (cheaper than MSAA on complex scenes)
    const smaaPass = new SMAAPass(
      window.innerWidth * renderer.getPixelRatio(),
      window.innerHeight * renderer.getPixelRatio()
    );
    this.composer.addPass(smaaPass);
  }

  render(): void {
    this.composer.render();
  }

  onResize(width: number, height: number): void {
    this.composer.setSize(width, height);
  }

  dispose(): void {
    this.composer.dispose();
  }
}
```

---

## 9. Debugging Tools

```typescript
// src/engine/DebugOverlay.ts
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

export class DebugOverlay {
  private stats: Stats;
  private gui: GUI;

  constructor(private engine: Engine) {
    // FPS / MS / Memory panels
    this.stats = new Stats();
    this.stats.showPanel(0);
    document.body.appendChild(this.stats.dom);

    // Tweakable parameters
    this.gui = new GUI({ title: 'Debug' });

    this.gui.add(engine.renderer.info.memory, 'geometries').listen().name('Geometries');
    this.gui.add(engine.renderer.info.memory, 'textures').listen().name('Textures');
    this.gui.add(engine.renderer.info.render, 'calls').listen().name('Draw Calls');
    this.gui.add(engine.renderer.info.render, 'triangles').listen().name('Triangles');
  }

  beginFrame(): void {
    this.stats.begin();
  }

  endFrame(): void {
    this.stats.end();
  }

  dispose(): void {
    this.gui.destroy();
    document.body.removeChild(this.stats.dom);
  }
}
```

---

## ⛔ STOP GATE — Three.js Anti-Patterns

```bash
# 1. Game loop issues
grep -rn "setInterval\|setTimeout" src/ --include="*.ts" | grep -v node_modules
# EXPECT: 0 results in game logic

# 2. Missing dispose calls
grep -rn "\.dispose()" src/ --include="*.ts" | wc -l
# Compare against:
grep -rn "new THREE\.\(Mesh\|Geometry\|Material\|Texture\|RenderTarget\)" src/ --include="*.ts" | wc -l
# Dispose count should be >= creation count

# 3. Object allocation in hot path
grep -rn "new THREE\.\|new RAPIER\." src/ --include="*.ts" | grep -v "class\|constructor\|init\|setup\|create"
# Any results inside update/render/loop functions: 🔴 CRITICAL

# 4. Missing resize handler
grep -rn "addEventListener.*resize" src/ --include="*.ts"
# EXPECT: At least 1 result. If 0: renderer/camera won't adapt.

# 5. No pixel ratio cap
grep -rn "setPixelRatio" src/ --include="*.ts"
# EXPECT: Math.min(devicePixelRatio, 2) — uncapped = 4K rendering on Retina = death
```

---

## NEVER

- **NEVER** use `setInterval` for the game loop — `requestAnimationFrame` only
- **NEVER** skip GPU resource disposal — geometries, materials, textures, render targets
- **NEVER** allocate `new Vector3()` / `new Quaternion()` in the update loop — preallocate and reuse
- **NEVER** set pixel ratio without capping at 2 — `Math.min(devicePixelRatio, 2)`
- **NEVER** forget the blur handler — keys "stick" when the window loses focus
- **NEVER** load assets synchronously — always use async loaders with progress
- **NEVER** skip the spiral-of-death cap on delta time
- **NEVER** use `renderer.render()` without clearing the scene's previous frame appropriately

---

## Pre-Completion Checklist

- [ ] Engine class manages init/start/stop/dispose lifecycle
- [ ] Game loop uses `requestAnimationFrame` with fixed timestep
- [ ] Scene manager handles enter/exit/dispose for each scene
- [ ] Input manager uses action mapping with gamepad support
- [ ] GLB assets loaded with DRACO decoder
- [ ] Loading progress shown to user
- [ ] Physics world initialized with WASM (Rapier)
- [ ] GPU resources disposed on scene exit (`renderer.info.memory` checked)
- [ ] Post-processing pipeline with dispose
- [ ] Debug overlay available in development mode
- [ ] Resize handler updates renderer + camera + composer
- [ ] Pixel ratio capped at 2
- [ ] No object allocation in update/render loop

---

## Related Skills

| Skill | When to use |
|-------|-------------|
| `web-game-foundations` | BEFORE this skill — architecture decisions |
| `r3f-game-building` | Alternative — if the game lives in a React app |
| `web-3d-asset-pipeline` | Preparing GLB models for Three.js loading |
| `playmaster` | If the game has 2D sprite elements |
| `live-session-building` | Multiplayer via WebSocket/Supabase |
| `deploying` | Shipping to Vercel/Cloudflare |
| `anti-glitch-debugging` | Diagnosing performance issues |

---

## Output Format

```markdown
## Three.js Game: [Game Name]

### Engine Architecture
[Class diagram: Engine → SceneManager, InputManager, PhysicsWorld, AssetManager]

### Rendering Pipeline
[WebGL2/WebGPU, post-processing passes, shadow config]

### Physics Setup
[Rapier/Cannon, collider types, raycasts, sensors]

### Scene Flow
[State machine: BOOT → MENU → LOADING → PLAYING → GAME_OVER]

### Asset Loading
[DRACO-compressed GLBs, texture formats, progress tracking]

### Memory Management
[Dispose strategy, renderer.info.memory targets]

### Debug Tools
[Stats.js, lil-gui, physics debug draw]

### Anti-Pattern Scan
[Output from stop gate commands above]
```
