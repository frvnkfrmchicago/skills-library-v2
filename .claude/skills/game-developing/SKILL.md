---
name: game-developing
description: >
  Guides browser game development with Phaser.js, Three.js, HTML5 Canvas,
  and Babylon.js. Covers engine selection, scene architecture, asset
  optimization, responsive scaling, and CDN deployment. Use when building
  browser games, choosing a game engine, optimizing game performance, or
  deploying games to Vercel or Cloudflare.
---

# Game Developing

Build games that run in the browser, deploy to CDNs, and load fast.
Everything ships as a URL — no downloads required.

---

## 1. Engine Selection

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
    ├── Real-time (< 50ms latency) → Phaser + WebSocket/Supabase Realtime
    ├── Turn-based → React + Supabase database
    └── Leaderboard only → Any engine + Supabase/Firebase
```

### Quick Reference

| Game Type | Engine | Best For |
|-----------|--------|----------|
| 2D arcade/platformer | Phaser.js | Sprite-based, physics, tilemaps |
| 3D experience | Three.js | Visual experiences, 3D environments |
| 3D game with physics | Babylon.js | Full 3D, built-in physics |
| Lightweight/minimal | HTML5 Canvas | Simple games, 0 deps |
| UI-heavy game | React + Canvas | Card games, puzzles, turn-based |

---

## 2. Phaser.js (2D Games)

**Structure games as scenes, not one giant file.** Games have distinct states
(menu, play, pause, game over) and each needs its own lifecycle.

**Separate game logic from rendering.** Test game rules without canvas.

### Project Setup

```bash
npm create vite@latest my-game -- --template vanilla-ts
cd my-game
npm install phaser
```

### Scene Pattern

```typescript
// ✅ REQUIRED — clean scene with lifecycle
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

### Game Config

```typescript
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
```

---

## 3. Three.js (3D Experiences)

**Use requestAnimationFrame, not setInterval.** It syncs with display refresh
rate, prevents rendering in hidden tabs, produces smoother visuals.

**Dispose of geometries, materials, and textures.** Three.js doesn't garbage
collect GPU resources. Leaks are measured in hundreds of MB.

```typescript
import * as THREE from 'three'

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
  75, window.innerWidth / window.innerHeight, 0.1, 1000
)
const renderer = new THREE.WebGLRenderer({ antialias: true })

renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
document.body.appendChild(renderer.domElement)

// ✅ REQUIRED — cleanup on unmount
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

Use raw Canvas when:
- Bundle size matters (0 dependencies)
- Game is simple (snake, pong, breakout, drawing)
- You want full control over rendering

```typescript
const canvas = document.getElementById('game') as HTMLCanvasElement
const ctx = canvas.getContext('2d')!

let x = 100, y = 100, dx = 2, dy = 2

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  ctx.beginPath()
  ctx.arc(x, y, 10, 0, Math.PI * 2)
  ctx.fillStyle = '#0ea5e9'
  ctx.fill()

  x += dx; y += dy
  if (x <= 10 || x >= canvas.width - 10) dx = -dx
  if (y <= 10 || y >= canvas.height - 10) dy = -dy

  requestAnimationFrame(gameLoop)
}

gameLoop()
```

---

## 5. Deployment

### Deploy to Vercel / Cloudflare

```bash
# Build
npm run build

# Vercel
npx vercel --prod

# Cloudflare Pages
npx wrangler pages deploy dist
```

### Performance Targets

| Metric | Target | Why |
|--------|--------|-----|
| First load | < 3s on 3G | Players leave after 3s |
| Bundle size | < 500KB (2D), < 2MB (3D) | Mobile data matters |
| FPS | 60fps on mid-range | Below 30fps feels broken |
| Input latency | < 16ms | One frame at 60fps |

---

## NEVER

- **NEVER** use setInterval for game loops — use requestAnimationFrame
- **NEVER** skip resource cleanup in Three.js — GPU memory leaks crash tabs
- **NEVER** load 4K textures for mobile — use compressed formats (basis, ktx2)
- **NEVER** put game state in the DOM — use JS variables, render to canvas
- **NEVER** hardcode canvas dimensions — use responsive scaling
- **NEVER** build a game that requires a download — it ships as a URL

---

## Pre-Completion Checklist

- [ ] Game runs at 60fps on target devices
- [ ] Canvas/WebGL context cleaned up on unmount
- [ ] Assets optimized (compressed textures, sprite sheets)
- [ ] Game is responsive (scales to viewport)
- [ ] Mobile touch controls work (if applicable)
- [ ] Loading screen for assets > 1MB
- [ ] Game state separated from rendering
- [ ] Deployed and playable via URL
