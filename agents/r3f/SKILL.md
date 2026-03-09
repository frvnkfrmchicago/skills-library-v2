---
name: r3f-agent
description: React Three Fiber - 3D in React. Use when adding 3D elements to websites/apps. Product showcases, interactive backgrounds, 3D experiences.
last_updated: 2026-03
owner: Frank
---

# R3F Agent (React Three Fiber)

3D on the web, the React way.

> **See also:** `agents/motion/SKILL.md`, `agents/gsap/SKILL.md`, `agents/micro-interactions/SKILL.md`

---

## Context Questions

Before adding 3D to your project:

1. **What's the use case?** — Product showcase, background, game, data viz
2. **How much interactivity?** — Static display, hover effects, full manipulation
3. **Performance requirements?** — Hero element, full-page, mobile-critical
4. **Team skill level?** — First 3D project, some experience, 3D experts
5. **Asset source?** — Custom models, stock, procedural geometry

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Complexity** | Simple shapes ←→ Complex scenes |
| **Interactivity** | View-only ←→ Full manipulation |
| **Performance** | Quality-first ←→ Mobile-optimized |
| **Assets** | Procedural ←→ GLTF models |
| **Learning Curve** | Use Spline ←→ Custom R3F code |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Simple floating shapes | R3F + Drei Float component |
| Product showcase | R3F + GLTF + OrbitControls + Stage |
| Background element | R3F with lower priority, lazy load |
| Don't want to code | Spline (visual editor) |
| Complex interactive | Custom R3F + Reanimated |
| Mobile-critical | Reduce geometry, use instances |

---

## TL;DR - When to Use

| Want | Use R3F? |
|------|----------|
| 3D product showcase | ✓ Yes |
| Interactive 3D background | ✓ Yes |
| 3D data visualization | ✓ Yes |
| Simple 2D animation | ✗ No, use GSAP/Motion |
| Video background | ✗ No, just use `<video>` |

---

## Plain English

**Three.js** = The library that makes 3D work in browsers
**React Three Fiber (R3F)** = Three.js but written for React
**Drei** = Helper tools that make R3F easier

You need all three:
```bash
pnpm add three @react-three/fiber @react-three/drei
```

---

## Quick Start (Copy This)

### Basic 3D Scene

```tsx
"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"

export function Scene3D() {
  return (
    <div className="h-screen w-full">
      <Canvas>
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        {/* Your 3D object */}
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="hotpink" />
        </mesh>
        
        {/* Let user rotate view */}
        <OrbitControls />
      </Canvas>
    </div>
  )
}
```

### Floating Object (Eye-Catching)

```tsx
import { Float } from "@react-three/drei"

<Float speed={2} rotationIntensity={1} floatIntensity={1}>
  <mesh>
    <sphereGeometry args={[1, 32, 32]} />
    <meshStandardMaterial color="#9d4edd" metalness={0.8} roughness={0.2} />
  </mesh>
</Float>
```

### Load a 3D Model (GLTF)

```tsx
import { useGLTF } from "@react-three/drei"

function Model() {
  const { scene } = useGLTF("/models/my-model.glb")
  return <primitive object={scene} scale={0.5} />
}

// In your Canvas:
<Model />
```

---

## Common Patterns

### 3D Hero Background

```tsx
export function HeroWith3D() {
  return (
    <div className="relative h-screen">
      {/* 3D Background */}
      <div className="absolute inset-0 -z-10">
        <Canvas>
          <ambientLight />
          <Float speed={1}>
            <mesh>
              <torusKnotGeometry args={[1, 0.3, 128, 16]} />
              <meshStandardMaterial color="#00f5d4" wireframe />
            </mesh>
          </Float>
        </Canvas>
      </div>
      
      {/* Your content on top */}
      <div className="relative z-10 flex h-full items-center justify-center">
        <h1 className="text-6xl font-bold">Your Headline</h1>
      </div>
    </div>
  )
}
```

### Product Showcase (Rotatable)

```tsx
import { OrbitControls, Stage } from "@react-three/drei"

function ProductViewer({ modelPath }: { modelPath: string }) {
  const { scene } = useGLTF(modelPath)
  
  return (
    <Canvas>
      <Stage environment="city" intensity={0.5}>
        <primitive object={scene} />
      </Stage>
      <OrbitControls autoRotate />
    </Canvas>
  )
}
```

---

## Where to Get 3D Models

| Source | Cost | Quality |
|--------|------|---------|
| **Sketchfab** | Free + Paid | High |
| **Poly Pizza** | Free | Good |
| **Mixamo** | Free | Characters/animations |
| **Spline** | Free | Create your own |
| **Blender** | Free | Create your own |

**Format:** Use `.glb` or `.gltf` files

---

## Performance Tips

```tsx
// 1. Lazy load 3D (don't block page load)
import dynamic from "next/dynamic"
const Scene = dynamic(() => import("./Scene"), { ssr: false })

// 2. Lower quality on mobile
<Canvas dpr={[1, 2]}> {/* Auto-adjusts */}

// 3. Use instances for many objects
import { Instances, Instance } from "@react-three/drei"
```

---

## No-Code Alternative: Spline

If code feels like too much:

1. Design 3D in **spline.design** (browser-based)
2. Export to React
3. Drop in your app:

```tsx
import Spline from "@splinetool/react-spline"

<Spline scene="https://prod.spline.design/your-scene-id/scene.splinecode" />
```

---

## Decision Tree

```
Want 3D?
├── Simple floating shapes → R3F + Drei
├── Product showcase → R3F + GLTF model
├── Complex interactive → R3F + custom code
├── Don't want to code → Spline
└── Just want motion → Skip 3D, use GSAP/Motion
```

---

## Official Resources

### Links
- **R3F Docs:** https://r3f.docs.pmnd.rs
- **Drei (helpers):** https://drei.docs.pmnd.rs
- **Three.js Docs:** https://threejs.org/docs
- **Three.js Journey (course):** https://threejs-journey.com

### What's New (2025)
- Better TypeScript support
- Improved performance with React 19+
- More Drei helpers for common tasks
- Better integration with Next.js App Router

### Where to Get Models
- **Sketchfab:** https://sketchfab.com
- **Poly Pizza:** https://poly.pizza
- **Mixamo (characters):** https://mixamo.com

### No-Code Alternative
- **Spline:** https://spline.design (design in browser, export to React)

### Search For More
```
"react three fiber [topic] 2025"
"r3f drei [helper]"
"three.js [feature]"
```
