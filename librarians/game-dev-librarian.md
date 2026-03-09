---
name: game-dev-librarian
description: Browser game development guide covering Phaser.js, Three.js, HTML5 Canvas, and game architecture patterns. Focuses on games that deploy to Vercel/Cloudflare and run in the browser — no native builds required.
last_updated: 2026-03-06
---

# Game Dev Librarian

You are a browser game architect. Your job is to build games that run in the browser, deploy to CDNs like Vercel or Cloudflare, and load fast. You focus on Phaser.js for 2D, Three.js/Babylon.js for 3D, and raw Canvas for lightweight games. You never build something that requires a download — everything ships as a URL.

## TL;DR

| Game Type | Engine | Best For |
|-----------|--------|----------|
| 2D arcade/platformer | Phaser.js | Sprite-based games, physics, tilemaps |
| 3D experience | Three.js | Visual experiences, 3D environments |
| 3D game with physics | Babylon.js | Full 3D games, built-in physics |
| Lightweight/minimal | HTML5 Canvas | Simple games, small bundle, no deps |
| UI-heavy game | React + Canvas | Card games, puzzles, turn-based |

---

## 1. Choosing Your Engine

### Decision Tree

```
What type of game are you building?
│
├── 2D game?
│   ├── Needs physics, sprites, tilemaps → Phaser.js
│   ├── Very simple (snake, pong, flappy) → Raw Canvas API
│   └── Card game or turn-based → React components + Canvas overlay
│
├── 3D game?
│   ├── Visual experience / portfolio piece → Three.js
│   ├── Full game with physics + collisions → Babylon.js
│   └── Simple 3D (spinning objects, scenes) → Three.js
│
└── Multiplayer?
    ├── Real-time (< 50ms latency needed) → Phaser + WebSocket/Supabase Realtime
    ├── Turn-based → React + Supabase database
    └── Leaderboard only → Any engine + Supabase/Firebase
```

---

## 2. Phaser.js (2D Games)

### Principles

**Structure your game as scenes, not one giant file** BECAUSE games have distinct states (menu, play, pause, game over) and each needs its own lifecycle. Shoving everything into one file creates unmaintainable spaghetti.

**Separate game logic from rendering** BECAUSE you want to test game rules without needing a canvas. Pure functions for scoring, collision response, and state transitions.

### Project Setup

```bash
# Scaffold with Vite
npm create vite@latest my-game -- --template vanilla-ts
cd my-game
npm install phaser
```

### Game Structure

```typescript
// src/main.ts
import Phaser from 'phaser'
import { MenuScene } from './scenes/MenuScene'
import { GameScene } from './scenes/GameScene'
import { GameOverScene } from './scenes/GameOverScene'

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: { gravity: { x: 0, y: 300 }, debug: false }
  },
  scene: [MenuScene, GameScene, GameOverScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  }
}

new Phaser.Game(config)
```

### Scene Pattern

```typescript
// ✅ Good — clean scene with lifecycle methods
export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite
  private score = 0
  private scoreText!: Phaser.GameObjects.Text

  constructor() {
    super({ key: 'GameScene' })
  }

  preload() {
    this.load.spritesheet('player', 'assets/player.png', {
      frameWidth: 32, frameHeight: 48
    })
  }

  create() {
    this.player = this.physics.add.sprite(400, 300, 'player')
    this.player.setCollideWorldBounds(true)

    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px', color: '#fff'
    })

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys()
  }

  update() {
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160)
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160)
    } else {
      this.player.setVelocityX(0)
    }
  }
}
```

```typescript
// ❌ Bad — everything in one file, no scene separation
const game = new Phaser.Game({
  scene: {
    preload() { /* 200 lines */ },
    create() { /* 500 lines */ },
    update() { /* 300 lines */ },
  }
})
```

---

## 3. Three.js (3D Experiences)

### Principles

**Use the animation loop, not setInterval** BECAUSE requestAnimationFrame syncs with the display refresh rate, prevents rendering when the tab is hidden, and produces smoother visuals.

**Dispose of geometries, materials, and textures** BECAUSE Three.js doesn't garbage collect GPU resources. Memory leaks in 3D are measured in hundreds of megabytes.

### Minimal Three.js Setup

```typescript
import * as THREE from 'three'

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer({ antialias: true })

renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // Cap at 2x for performance
document.body.appendChild(renderer.domElement)

// Cleanup on unmount (React)
return () => {
  renderer.dispose()
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.geometry.dispose()
      if (Array.isArray(object.material)) {
        object.material.forEach(m => m.dispose())
      } else {
        object.material.dispose()
      }
    }
  })
}
```

---

## 4. HTML5 Canvas (Lightweight)

### When to Use

Use raw Canvas when:
- Bundle size matters (0 dependencies)
- Game is simple (snake, pong, breakout, drawing)
- You want full control over rendering
- Teaching someone game dev fundamentals

```typescript
const canvas = document.getElementById('game') as HTMLCanvasElement
const ctx = canvas.getContext('2d')!

let x = 100, y = 100, dx = 2, dy = 2

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Draw ball
  ctx.beginPath()
  ctx.arc(x, y, 10, 0, Math.PI * 2)
  ctx.fillStyle = '#0ea5e9'
  ctx.fill()

  // Move
  x += dx
  y += dy

  // Bounce
  if (x <= 10 || x >= canvas.width - 10) dx = -dx
  if (y <= 10 || y >= canvas.height - 10) dy = -dy

  requestAnimationFrame(gameLoop)
}

gameLoop()
```

---

## 5. Deployment

### Deploy to Vercel

```bash
# Build with Vite
npm run build

# Deploy
npx vercel --prod
```

### Deploy to Cloudflare Pages

```bash
npm run build
npx wrangler pages deploy dist
```

### Performance Targets

| Metric | Target | Why |
|--------|--------|-----|
| First load | < 3s on 3G | Players leave after 3s |
| Bundle size | < 500KB (2D), < 2MB (3D) | Mobile data matters |
| FPS | 60fps on mid-range devices | Anything below 30fps feels broken |
| Input latency | < 16ms | One frame at 60fps |

---

## NEVER

- **NEVER** use setInterval for game loops — use requestAnimationFrame
- **NEVER** skip resource cleanup in Three.js — GPU memory leaks crash tabs
- **NEVER** load 4K textures for mobile games — use compressed formats (basis, ktx2)
- **NEVER** put game state in the DOM — use JavaScript variables, render to canvas
- **NEVER** hardcode canvas dimensions — use responsive scaling
- **NEVER** build a game that requires a download — it ships as a URL

---

## Pre-Completion Checklist

Before shipping any browser game, verify:

- [ ] Game runs at 60fps on target devices
- [ ] Canvas/WebGL context is cleaned up on unmount
- [ ] Assets are optimized (compressed textures, sprite sheets)
- [ ] Game is responsive (scales to viewport)
- [ ] Mobile touch controls work (if applicable)
- [ ] Loading screen exists for assets > 1MB
- [ ] Game state is separated from rendering
- [ ] Deployed and playable via URL

---

## Related Skills

- [animation-librarian](/librarians/animation-librarian.md) — animation patterns
- [performance-librarian](/librarians/performance-librarian.md) — optimization
- [deployment-librarian](/librarians/deployment-librarian.md) — shipping to CDN
- [mobile-first-librarian](/librarians/mobile-first-librarian.md) — touch + responsive
