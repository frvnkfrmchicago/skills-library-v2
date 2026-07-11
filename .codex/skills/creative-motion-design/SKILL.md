---
name: creative-motion-design
description: >
  Enforces visual layout overhauls, custom canvas physics, and 3D coordinate bridges.
  Covers Bento grids, zoomable spatial canvases, cascade stacks, ambient vs. interactive
  motion states (sine drifting vs. spring physics), screen-to-world unprojection NDC vectors,
  and the AI Brainstorming Canvas ideation protocol. Use when designing non-standard UI
  containers, layout grids, transitions, or overlay animations.
---

# Creative Layouts & Motion Design Skill

Traditional AI-generated code suffers from "layout laziness"—defaulting to standard vertical lists, flat tab groups, and static card grids. Premium user experiences require breaking the standard viewport grid, employing spatial navigation, and coordinating physics-based animation states.

Use this skill when designing custom grids, infinite canvases, or motion-driven transitions that demand a high-end visual overhaul.

---

## 1. Breaking the Grid: Anti-AI Layout Systems

Standard layouts look "AI-coded." To achieve premium visual excellence, implement one of these alternative structures rather than default flexbox columns or standard tabs.

### A. Bento Grid System
Use Bento layouts to organize multi-dimensional information without using flat lists. Each grid item should have a distinct visual weight, custom micro-interactions, and a unique internal layout.

```css
/* Bento Grid Container */
.bento-container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-rows: minmax(140px, auto);
  gap: 1.5rem;
  padding: 1.5rem;
}

/* Dynamic Grid Cell Spans */
.bento-card-large {
  grid-column: span 8;
  grid-row: span 3;
}

.bento-card-tall {
  grid-column: span 4;
  grid-row: span 4;
}

.bento-card-medium {
  grid-column: span 6;
  grid-row: span 2;
}

.bento-card-small {
  grid-column: span 4;
  grid-row: span 2;
}

@media (max-width: 1024px) {
  .bento-container {
    grid-template-columns: repeat(6, 1fr);
  }
  .bento-card-large, .bento-card-tall, .bento-card-medium, .bento-card-small {
    grid-column: span 6;
  }
}
```

### B. Spatial Zoomable Canvas
For platforms displaying maps, nodes, or relational content, replace standard tab navigation with an interactive spatial canvas that users can drag, pan, and zoom.

```javascript
// Basic vanilla JS canvas panning logic
class SpatialCanvas {
  constructor(containerId, canvasId) {
    this.container = document.getElementById(containerId);
    this.canvas = document.getElementById(canvasId);
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.translateX = 0;
    this.translateY = 0;
    this.scale = 1;

    this.initEvents();
  }

  initEvents() {
    this.container.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.startX = e.clientX - this.translateX;
      this.startY = e.clientY - this.translateY;
      this.container.style.cursor = 'grabbing';
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
      this.container.style.cursor = 'grab';
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      this.translateX = e.clientX - this.startX;
      this.translateY = e.clientY - this.startY;
      this.updateTransform();
    });

    this.container.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = 0.1;
      if (e.deltaY < 0) {
        this.scale = Math.min(this.scale + zoomFactor, 3);
      } else {
        this.scale = Math.max(this.scale - zoomFactor, 0.5);
      }
      this.updateTransform();
    }, { passive: false });
  }

  updateTransform() {
    this.canvas.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
  }
}
```

### C. Pile & Cascade Cards
For galleries or feeds, stack elements sequentially with offsets and subtle rotations. When a user interacts with a card, animate the offset to reveal the cards below.

```css
.card-stack {
  position: relative;
  width: 320px;
  height: 400px;
}

.stacked-card {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 1.5rem;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
  transform-origin: bottom center;
}

.stacked-card:nth-child(1) {
  transform: translateY(0) scale(1) rotate(0deg);
  z-index: 3;
}
.stacked-card:nth-child(2) {
  transform: translateY(12px) scale(0.95) rotate(-2deg);
  opacity: 0.9;
  z-index: 2;
}
.stacked-card:nth-child(3) {
  transform: translateY(24px) scale(0.90) rotate(3deg);
  opacity: 0.8;
  z-index: 1;
}
```

---

## 2. Ambient vs. Interactive Motion Loops

Animations must support two primary states: **Ambient Loop (State A)** which plays autonomously to make the app feel alive, and **Interactive Action (State B)** which temporarily interrupts State A upon user input before settling back down.

```
       +---------------------------------------------+
       |             State A: Ambient                |
       |       Subtle breathing, floating loops      |
       +----------------------┬----------------------+
                              │
                    User Interaction (Click/Hover)
                              │
                              ▼
       +---------------------------------------------+
       |            State B: Interactive             |
       |     Spring snap, kick, character strike     |
       +----------------------┬----------------------+
                              │
                    Spring Dampening / Settling
                              │
                              ▼
       +---------------------------------------------+
       |             Return to State A               |
       +---------------------------------------------+
```

### Dual-State Coordination Pattern
Manage coordinates, transforms, and blending states to allow seamless transition between idle loops and user actions.

```javascript
class AnimatedElement {
  constructor(element) {
    this.el = element;
    this.time = Math.random() * 100;
    this.targetX = 0;
    this.targetY = 0;
    this.currentX = 0;
    this.currentY = 0;
    this.vx = 0;
    this.vy = 0;
    
    // Physics constants
    this.stiffness = 0.15;
    this.damping = 0.8;

    this.isInteractive = false;
    this.initEvents();
    this.animate();
  }

  initEvents() {
    this.el.addEventListener('mouseenter', () => {
      this.isInteractive = true;
    });

    this.el.addEventListener('mousemove', (e) => {
      const rect = this.el.getBoundingClientRect();
      this.targetX = (e.clientX - rect.left - rect.width / 2) * 0.4;
      this.targetY = (e.clientY - rect.top - rect.height / 2) * 0.4;
    });

    this.el.addEventListener('mouseleave', () => {
      this.isInteractive = false;
      this.targetX = 0;
      this.targetY = 0;
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    
    if (!this.isInteractive) {
      // STATE A: Ambient noise loop (sine/cosine movement)
      this.time += 0.02;
      this.currentX = Math.sin(this.time) * 12;
      this.currentY = Math.cos(this.time * 0.8) * 8;
      this.el.style.transform = `translate3d(${this.currentX}px, ${this.currentY}px, 0)`;
    } else {
      // STATE B: Spring physics to track cursor offset
      const ax = (this.targetX - this.currentX) * this.stiffness;
      const ay = (this.targetY - this.currentY) * this.stiffness;
      this.vx = (this.vx + ax) * this.damping;
      this.vy = (this.vy + ay) * this.damping;
      this.currentX += this.vx;
      this.currentY += this.vy;
      
      this.el.style.transform = `translate3d(${this.currentX}px, ${this.currentY}px, 0) scale(1.05)`;
    }
  }
}
```

---

## 3. Advanced 3D-to-2D UI Interaction Bridges

WebGL contexts operate on isolated GPU canvases. Premium designs require bridging these 3D scenes with 2D DOM layouts, allowing 3D characters, objects, or particles to interact directly with standard HTML text or containers.

### A. Setup: Transparent Overlay Canvas
Overlay a pointer-events transparent 3D Canvas (React Three Fiber) exactly matching the layout bounds of your 2D grid elements.

```css
.webgl-overlay-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10;
  pointer-events: none;
}

.webgl-overlay-canvas canvas {
  pointer-events: auto;
}
```

### B. Coordinate Projection (DOM coordinates to 3D Space)
To make a 3D asset align with a 2D DOM element (e.g. a character kicking a specific card), map the DOM element's coordinate space directly into 3D world coordinates.

```javascript
import * as THREE from 'three';

function getNormalizedCoordinates(element, camera) {
  const rect = element.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  // Convert to NDC space (-1 to +1)
  const ndcX = (x / window.innerWidth) * 2 - 1;
  const ndcY = -(y / window.innerHeight) * 2 + 1;

  // Project NDC to a 3D world vector at depth Z
  const vector = new THREE.Vector3(ndcX, ndcY, 0.5);
  vector.unproject(camera);
  
  const dir = vector.sub(camera.position).normalize();
  const distance = -camera.position.z / dir.z; // Project to plane z=0
  const worldPos = camera.position.clone().add(dir.multiplyScalar(distance));

  return worldPos;
}
```

---

## 4. The AI Brainstorming & Concept Iteration Protocol

Before writing a single line of layout code, the agent MUST collaborate with the user by generating a **Brainstorming Canvas**. This aligns core concepts and structures before starting the development phase.

```
+--------------------------------------------------------------+
|                   AI Brainstorming Canvas                     |
|                                                              |
| 1. Conceptual Metaphor (e.g. Vintage vinyl records catalog)  |
| 2. Visual Reference Models (Mobbin screenshots, UI patterns) |
| 3. Three Concept Layout Variations:                          |
|    - Variation 1: The Subtle Path (Clean, low-motion)        |
|    - Variation 2: The Playful Path (Active, particles)        |
|    - Variation 3: The Spatial Path (WebGL, zoom canvas)      |
| 4. Next Step Decisions (Clarifying questions)                |
+--------------------------------------------------------------+
```

### The Brainstorming Output Template
The agent must structure its brainstorming response exactly as follows:

```markdown
## 🎨 Brainstorming Canvas: [Feature/App Name]

### 1. Conceptual Metaphor
*   **The Analogue:** [Explain what real-world object or gaming mechanic this UI simulates. E.g., "A retro arcade cabinet console where posts act as collectible game cartridges."]
*   **Core Reaction Loop:** [What happens visually when a user acts? E.g., "Hovering a cartridge slides it into the slot, firing a spark particle loop and revealing details."]

### 2. Visual Reference Models
*   **Model Source:** [References to specific apps on Mobbin, Dribbble, or Awwwards. E.g., "Leveraging the asymmetrical Bento grid of the Figma onboarding UI, with the floating overlay panels seen in Zenly."]
*   **Structural Grid:** [Detail how elements stack to break the traditional tabbed container model.]

### 3. Concept Layout Variations
*   **Variation 1: The Subtle Path (Low Motion, High Structure)**
    *   *Grid:* A clean 3-column asymmetric grid.
    *   *Interaction:* Static cards with subtle spring-scale hover (+2%). Zero ambient animation. Perfect for rapid reading.
*   **Variation 2: The Playful Path (Medium Motion, High Feedback)**
    *   *Grid:* Overlapping card cascade with dynamic offsets.
    *   *Interaction:* Floating background ambient loops (subtle drift). Likes trigger particle sprays based on category tags.
*   **Variation 3: The Spatial Path (High Motion, Immersive Canvas)**
    *   *Grid:* Infinite 2D zoomable viewport map.
    *   *Interaction:* WebGL canvas layer overlay. Nodes drift organically and spring towards the user on zoom.

### 4. Interactive Ideation Questions
1. [Clarifying question regarding motion limits, e.g. "Do you want active screen-shake critical alerts, or should particle explosions be contained within the card bounds?"]
2. [Clarifying question regarding layout style, e.g. "Should the bento grid cells maintain a locked aspect ratio or dynamically warp based on viewport size?"]
```

---

## ⛔ STOP GATE — Design Quality Audit

Before submitting any code changes, the agent must verify:
- [ ] No raw `flex-col` list containers are used for secondary data displays (use bento or cards instead).
- [ ] Every button hover state has spring-based scaling or cursor attraction math.
- [ ] Particle emitters clear their array memory pools once opacity hits zero.
- [ ] Canvas overlay renders dynamically handle screen resize updates.
- [ ] The global `disable-motion` check is hooked into all continuous loops.
