---
name: game-assessor
description: >
  Assesses game feasibility, mobile super-app WebView memory constraints, brawler mechanics,
  and high-concurrency spectator sync for Game Night. Use when analyzing performance budgets,
  designing brawler combat (hit/hurt boxes, Y-sorting), planning multiplayer networks,
  or evaluating embedded webview constraints.
last_updated: 2026-06-02
version: v1.0
protocol: anti-skimming-v3
---

# Game Assessor

Embedded games must feel like native code, load instantly, and run inside strict super-app sandboxes. This skill outlines concrete engineering limits, architectural designs, and verification methods to ensure your games don't crash, lag, or stutter.

---

## STOP — Comprehension Gate

Before providing advice or writing code, answer these:

1. **What is the target engine?** Phaser (2D), Cocos Creator (2D/Hybrid), R3F/ThreeJS (3D)?
2. **What is the mobile WebView container?** iOS WKWebView, Android WebView, React Native Expo WebView?
3. **What is the gameplay model?** Side-scrolling brawler (Tekken style, Simpsons style), 2D stick fighter, or casual puzzle?
4. **What is the multiplayer player count?** Single-player with score sync, 1v1 real-time, or multiplayer brawler?
5. **What is the Game Night spectator target?** 100 viewers, 1,000+ viewers, 10,000+ viewers?
6. **What is the live stream video tech?** WebRTC (sub-second latency, expensive), low-latency HLS (2-3s latency, cheap), or purely animated Canvas state sync (no actual video)?

**Uncertain constraints produce memory leaks and high server bills.**

---

## 1. Super-App WebView Constraints & Memory Recycling

WebViews on mobile platforms are subject to strict operating system memory limits. If a WKWebView exceeds its memory limit, the iOS system will instantly terminate the process (yielding a white screen or a crash).

### Memory Budget Math

Total runtime memory is dominated by **uncompressed GPU textures**. PNGs are compressed on disk, but once loaded into GPU memory, they expand to raw bitmaps:

$$\text{Memory (bytes)} = \text{Width} \times \text{Height} \times 4 \text{ bytes per pixel} \times 1.4 \text{ (mipmaps extra)}$$

#### Texture Budget Cap:
- **iOS WebView Ceiling:** ~150MB total RAM.
- **Maximum Texture Memory Budget:** **64MB** (leaves ~86MB for engine core, garbage collector, DOM, and JS execution heap).

```
Example: A 2048 × 2048 spritesheet expands to:
  2048 * 2048 * 4 * 1.4 = 23,488,102 bytes (~23.4 MB)
Just three 2048px sheets will exceed the entire GPU budget and crash the WebView.
```

### Complete Scene Cleanup Pattern

To prevent memory leaks when switching between 100+ games, you must explicitly destroy the canvas, purge texture caches, stop sound contexts, and release event handlers.

```typescript
// ✅ REQUIRED — WebView game cleanup manager
class GameRecycleManager {
  static destroyGameInstance(gameInstance: any, canvasElement: HTMLCanvasElement) {
    if (!gameInstance) return;

    console.log("purging game memory buffers...");

    // 1. Purge Engine-specific texture memory (Phaser Example)
    if (typeof gameInstance.destroy === 'function') {
      // Destroy game, remove canvas, destroy sound manager, shutdown plugins
      gameInstance.destroy(true, true); 
    }

    // 2. Explicit WebGL Context Release
    const gl = canvasElement.getContext('webgl') || canvasElement.getContext('webgl2');
    if (gl) {
      const numAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
      for (let i = 0; i < numAttribs; ++i) {
        gl.disableVertexAttribArray(i);
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
      
      // Force lose WebGL context to instantly free GPU texture allocations
      const extension = gl.getExtension('WEBGL_lose_context');
      if (extension) {
        extension.loseContext();
      }
    }

    // 3. Clear DOM bindings and GC anchors
    canvasElement.remove();
    
    // 4. Close Audio Context
    if (window.AudioContext || (window as any).webkitAudioContext) {
      // Traverse active audio nodes and close them
      const tempCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      tempCtx.close();
    }

    // 5. Force garbage collection trigger hints
    (window as any).gameInstance = null;
  }
}
```

---

## 2. Game Night & Real-Time Multiplayer Sync

Game Night features require scaling real-time game inputs to players while broadcasting video + interactive game states to thousands of spectators.

### Brawler Multiplayer Sync (1v1 Real-Time)

For fast-paced brawlers (Tekken, stick fighting), you must use **Client-Side Prediction with Authoritative Server Reconciliation** over WebSockets to mask latency up to 150ms.

```
Client A (Local Player)       WebSocket Server              Client B (Remote Player)
   │                             │                             │
   ├── Input: [Right] ──────────>┼                             │
   │   (Predict: Move Right)     │                             │
   │                             ├── Forward Inputs: [A:Right] ┼──────────>
   │                             │   to Client B               │
   │                             │                             │   (Interpolates Client A)
   │                             ┼<── Input: [B:Punch] ────────┤
   │                             │                             │
   ┼<── Authoritative State ─────┼                             │
   │    Reconciliation           │                             │
```

#### authoritative brawler sync protocol:
1. **Input Queueing:** Clients tag every input frame with a sequence number.
2. **Local Prediction:** Client applies inputs locally *immediately* (0ms latency).
3. **Server Authority:** Server runs the simulation loop at 60Hz using player inputs. It periodically broadcasts the true coordinates.
4. **Reconciliation:** If the server coordinates differ from the client's past predicted frame, the client snaps back to the server state and re-applies all inputs made since that sequence number.

### Spectator Scale (Game Night Streaming)

To support 10,000+ simultaneous viewers watching Game Night, **never broadcast raw game states individually via WebSockets.** This will crush server bandwidth.

```
STREAMING ARCHITECTURE:
[Players] ──> [Game Server (Input Loop)] ──> [Stream Encoding (OBS/FFmpeg)]
                                                      │
[Spectators (UI Overlay)] <── [CDN (HLS / WebRTC)] <──┘
           │
           └──> [Lightweight WebSocket / PubSub] (Betting, chat, scores ONLY)
```

1. **Video Streaming:** Encode the host's viewport as video (WebRTC for sub-second delay, or LL-HLS via a CDN).
2. **State Overlays:** Transmit interactive state (health bars, betting options) via a lightweight Pub/Sub system (e.g. Supabase Realtime, Redis) at a lower rate (e.g. 5Hz), then interpolate values client-side.

---

## 3. Classic 2D Brawler Blueprint (Tekken / Simpsons)

A side-scrolling beat 'em up requires sorting layers dynamically based on screen coordinates and separating hitboxes from hurtboxes.

### 1. Sprite Z-Depth Sorting (Y-Sorting)

Because players can move vertically ("in and out" of the background), sprites must sort their rendering order based on their current `y` position:

```typescript
// Phaser 3 depth sorting update loop
updateDepthSorting(scene: Phaser.Scene) {
  // Sort characters and obstacles dynamically by their bottom-edge Y value
  const displayGroup = scene.children.list;
  displayGroup.sort((a: any, b: any) => {
    const aY = a.y + (a.displayHeight * (1 - a.originY));
    const bY = b.y + (b.displayHeight * (1 - b.originY));
    return aY - bY;
  });

  // Apply depths
  displayGroup.forEach((child: any, index: number) => {
    if (child.depth !== undefined) {
      child.setDepth(index);
    }
  });
}
```

### 2. Hitbox vs Hurtbox Design

Never check collisions using the standard sprite boundaries. You must create two bounding boxes relative to the player's anchor:

- **Hurtbox:** The defensive area where the character can receive damage.
- **Hitbox:** The active attack area spawned only during attack frames.

```typescript
interface CollisionBox {
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
}

class BrawlerCharacter {
  hurtbox: CollisionBox = { offsetX: -16, offsetY: -80, width: 32, height: 80 };
  activeHitbox: CollisionBox | null = null; // Spawned on punch/kick frames

  getHurtboxBounds(x: number, y: number, facingRight: boolean) {
    const offset = facingRight ? this.hurtbox.offsetX : -this.hurtbox.offsetX - this.hurtbox.width;
    return {
      left: x + offset,
      top: y + this.hurtbox.offsetY,
      right: x + offset + this.hurtbox.width,
      bottom: y + this.hurtbox.offsetY + this.hurtbox.height
    };
  }

  // Called only during key attack frames (defined in animation manifest)
  spawnPunchHitbox(facingRight: boolean) {
    this.activeHitbox = {
      offsetX: facingRight ? 10 : -42, // extend punch forward
      offsetY: -60,
      width: 32,
      height: 16
    };
  }
}
```

---

## Verification Plan

### Memory Verification (Chrome DevTools console)
Measure the Javascript heap usage before and after starting/stopping a game:
```javascript
// Paste into Chrome Console during play
performance.memory.usedJSHeapSize / 1024 / 1024 + " MB"
// Target: Difference before starting and after destroying a game should be < 5MB (fully reclaimed)
```

### Asset Overhead Scan (Terminal)
Run this inside your asset directory to audit image dimensions:
```bash
# Verify no image exceeds 2048px (which would chew up 23.4MB of GPU RAM)
identify -format "%w %h %f\n" public/assets/**/*.png | awk '$1 > 2048 || $2 > 2048 {print "🔴 OVERSIZE:", $3, $1"x"$2}'
```

---

## NEVER

- **NEVER** exceed a total texture size of 64MB for WebViews.
- **NEVER** leave a Canvas or AudioContext un-destroyed on game exit.
- **NEVER** use bounding box overlaps (`physics.arcade.overlap` on full sprite) for brawler combat.
- **NEVER** sync high-frequency brawler state (60Hz coordinate tracking) directly to spectators.
- **NEVER** use variable timesteps for real-time multiplayer brawler loops.
