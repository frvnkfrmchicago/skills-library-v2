---
name: gaming
description: Web game development with Phaser. 2D games, game loops, physics.
last_updated: 2026-03
owner: Frank
---

# Gaming Skill

**Build actual web games with Phaser and Canvas.**

---

## Context Questions

Before building a game:

1. **What type of game?** — Platformer, runner, clicker, puzzle, shooter
2. **2D or 3D?** — Phaser (2D) vs R3F (3D)
3. **Multiplayer needed?** — Solo vs realtime multiplayer
4. **Target platform?** — Web, mobile, desktop
5. **Scope?** — Quick prototype vs full game

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Graphics** | 2D sprite ←→ 3D rendered |
| **Complexity** | Clicker game ←→ Full RPG |
| **Physics** | None ←→ Full simulation |
| **Players** | Single ←→ MMO |
| **Platform** | Web only ←→ Cross-platform |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Quick 2D game | Phaser (most docs, best support) |
| 3D game | R3F + @react-three/rapier |
| Multiplayer | Phaser + Supabase realtime |
| Mobile-first | Phaser + touch controls |
| Idle/clicker | Minimal physics, focus on progression |
| Platformer | Phaser arcade physics |

---

## TL;DR

```bash
npm install phaser
```

| Game Type | Complexity | Time Estimate |
|-----------|------------|---------------|
| Simple (clicker, endless runner) | Low | 1-2 hours |
| Medium (platformer, shooter) | Medium | 4-8 hours |
| Complex (RPG, multiplayer) | High | 16+ hours |

---

## Framework Comparison (2025)

| Framework | Status | Best For | Notes |
|-----------|--------|----------|-------|
| **Phaser** | ✅ Active (v4 coming) | 2D games | Most popular, great docs |
| Kaboom.js | ❌ Deprecated | - | No longer maintained |
| Pixi.js | ✅ Active | 2D rendering | Lower-level than Phaser |
| Three.js / R3F | ✅ Active | 3D games | Use agents/r3f/SKILL.md |

**Phaser wins for 2D games in 2025.**

---

## Phaser + React/Next.js Setup

```typescript
// src/game/config.ts
import Phaser from 'phaser'
;
import { MainScene } from './scenes/MainScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: [MainScene],
};
```

```typescript
// src/game/scenes/MainScene.ts
import Phaser from 'phaser';

export class MainScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;

  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    // Load assets
    this.load.image('player', '/assets/player.png');
    this.load.image('platform', '/assets/platform.png');
  }

  create() {
    // Create game objects
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // Add input
    this.input.keyboard?.on('keydown-SPACE', () => {
      this.player.setVelocityY(-200);
    });
  }

  update() {
    // Game loop
    const cursors = this.input.keyboard?.createCursorKeys();
    if (cursors?.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (cursors?.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }
  }
}
```

```tsx
// src/components/Game.tsx
'use client';

import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { gameConfig } from '@/game/config';

export function Game() {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !gameRef.current) {
      gameRef.current = new Phaser.Game(gameConfig);
    }

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return <div id="game-container" className="w-full h-full" />;
}
```

---

## Game Loop Pattern

```typescript
// Core game loop structure
class GameScene extends Phaser.Scene {
  // 1. PRELOAD - Load assets
  preload() {
    this.load.image('key', 'path');
    this.load.audio('key', 'path');
    this.load.spritesheet('key', 'path', { frameWidth: 32, frameHeight: 32 });
  }

  // 2. CREATE - Set up game objects (runs once)
  create() {
    // Create sprites, physics, input handlers
    this.setupPlayer();
    this.setupEnemies();
    this.setupUI();
    this.setupCollisions();
  }

  // 3. UPDATE - Runs every frame (~60fps)
  update(time: number, delta: number) {
    // Handle input
    // Move objects
    // Check conditions
    // Update score/UI
    this.handleInput();
    this.updateEnemies();
    this.checkGameOver();
  }
}
```

---

## Common Game Patterns

### Platformer
```typescript
// Physics + platforms + player
const platforms = this.physics.add.staticGroup();
platforms.create(400, 568, 'ground').setScale(2).refreshBody();

const player = this.physics.add.sprite(100, 450, 'dude');
player.setBounce(0.2);
player.setCollideWorldBounds(true);

this.physics.add.collider(player, platforms);
```

### Endless Runner
```typescript
// Auto-scroll background + obstacle spawning
update() {
  this.background.tilePositionX += 2;
  
  if (time > this.nextObstacle) {
    this.spawnObstacle();
    this.nextObstacle = time + Phaser.Math.Between(1500, 3000);
  }
}
```

### Click/Idle Game
```typescript
// Click handler + resource accumulation
this.input.on('pointerdown', () => {
  this.score += this.clickPower;
  this.updateUI();
});

// Passive income
this.time.addEvent({
  delay: 1000,
  callback: () => { this.score += this.passiveIncome; },
  loop: true,
});
```

---

## AI in Games (2025)

| Use Case | Tool | Notes |
|----------|------|-------|
| Procedural content | Custom | Level generation, items |
| Smarter NPCs | LLM integration | Dynamic dialogue |
| Difficulty adjustment | Analytics | Adaptive challenge |
| Asset generation | workflows/assets/SKILL.md | Characters, backgrounds |

---

## Resources

- **Phaser Docs:** https://phaser.io/docs
- **Phaser Examples:** https://phaser.io/examples
- **React-Phaser Template:** https://github.com/phaserjs/template-react
- **Game Patterns:** https://gameprogrammingpatterns.com

---

## Related Skills

- `agents/gamification/SKILL.md` - Add XP, achievements, streaks
- `agents/r3f/SKILL.md` - 3D games with Three.js
- `agents/gsap/SKILL.md` - Advanced animations
- `agents/realtime/SKILL.md` - Multiplayer
- `workflows/assets/SKILL.md` - Generate game art
