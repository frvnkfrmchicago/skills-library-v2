---
name: 3d-librarian
description: Guides building immersive, interactive 3D web experiences using React Three Fiber, Three.js, Spline, Babylon.js, and CSS 3D. Covers scroll-driven scenes, interactive product viewers, 3D landing pages, particle systems, shader effects, GLTF model loading, physics, and post-processing. Pushes beyond spinning shapes into real experiences. Use when building 3D websites, interactive scenes, product configurators, 3D portfolios, or immersive landing pages.
last_updated: 2026-03-24
version: v2
protocol: anti-skimming-v3
---

# 3D Librarian

**Role**: You build 3D web experiences that are interactive, purposeful, and impressive — not just shapes spinning in space.

**Problem this solves**: AI defaults to the laziest 3D output — a torus knot floating and rotating. That's a tech demo, not an experience. This librarian pushes you to build scenes that respond, tell stories, and make users want to interact.

---

## TLDR — What Makes 3D Actually Good

| Bad 3D (What AI Defaults To) | Good 3D (What We Build) |
|------|------|
| Random shapes spinning | Scene that reacts to scroll position |
| Static floating objects | Products you can rotate, zoom, customize |
| Ambient light + one mesh | Dramatic lighting with shadows and atmosphere |
| No purpose — just "looks cool" | Tied to content — reveals info, guides user |
| Same from every angle | Camera moves tell a story |
| Breaks on mobile | Graceful degradation, touch controls |

---

## Technology Decision Tree

```
What kind of 3D?
│
├── Interactive scene in a web page
│   ├── React project? → React Three Fiber (R3F) + drei
│   └── Vanilla JS? → Three.js direct
│
├── Pre-designed visual scene (designer made it)
│   └── Spline (export .splinecode, embed with @splinetool/react-spline)
│
├── Full 3D application (game-like, physics, heavy)
│   └── Babylon.js
│
├── Simple depth effects (parallax, card tilt, perspective text)
│   └── CSS 3D transforms + perspective
│
└── Particle effects, data viz, generative art
    └── Three.js + custom shaders or instanced meshes
```

---

## Experience Patterns (Not Just Shapes)

### 1. Scroll-Driven Scene

Camera moves through a 3D environment as user scrolls. Content reveals at specific scroll positions.

```tsx
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ScrollControls, useScroll, Text } from '@react-three/drei';

function ScrollScene() {
  const scroll = useScroll();
  const { camera } = useThree();

  useFrame(() => {
    const offset = scroll.offset; // 0 to 1
    // Camera flies through the scene
    camera.position.z = 10 - offset * 20;
    camera.position.y = offset * 5;
    camera.rotation.x = -offset * 0.3;
  });

  return (
    <>
      {/* Content reveals at different scroll depths */}
      <group position={[0, 0, 5]}>
        <Text fontSize={1.5} color="white">Welcome</Text>
      </group>
      <group position={[0, 2, -5]}>
        <Text fontSize={1}>Discover More</Text>
      </group>
      <group position={[0, 5, -15]}>
        <Text fontSize={2}>The Future</Text>
      </group>
    </>
  );
}

function App() {
  return (
    <Canvas style={{ height: '100vh', position: 'fixed' }}>
      <ScrollControls pages={5} damping={0.25}>
        <ScrollScene />
      </ScrollControls>
      <ambientLight intensity={0.3} />
      <spotLight position={[5, 10, 5]} intensity={1} castShadow />
    </Canvas>
  );
}
```

**When to use**: Landing pages, portfolios, storytelling, product reveals.

### 2. Interactive Product Viewer

User can rotate, zoom, and interact with a 3D model. Click hotspots to learn more.

```tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows, Html } from '@react-three/drei';

function ProductModel({ url }) {
  const { scene } = useGLTF(url);
  const [hovered, setHovered] = useState(null);

  return (
    <group>
      <primitive
        object={scene}
        scale={1.5}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(e.object.name);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(null);
          document.body.style.cursor = 'auto';
        }}
      />
      {hovered && (
        <Html position={[0, 2, 0]} center>
          <div className="tooltip">{hovered}</div>
        </Html>
      )}
    </group>
  );
}

function Viewer() {
  return (
    <Canvas shadows camera={{ position: [0, 2, 5], fov: 50 }}>
      <Environment preset="city" />
      <ContactShadows position={[0, -1, 0]} opacity={0.4} blur={2} />
      <ProductModel url="/models/product.glb" />
      <OrbitControls
        enablePan={false}
        minDistance={3}
        maxDistance={8}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2}
      />
    </Canvas>
  );
}
```

**When to use**: E-commerce, product pages, configurators, portfolio pieces.

### 3. Atmospheric Landing Page

Full-screen 3D background with particles, fog, and dramatic lighting. Content overlays on top.

```tsx
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Cloud, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function AtmosphericScene() {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    meshRef.current.rotation.y = clock.elapsedTime * 0.1;
  });

  return (
    <>
      <fog attach="fog" args={['#0a0a1a', 5, 25]} />
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} color="#4f46e5" />
      <pointLight position={[-5, 3, -5]} intensity={0.5} color="#ec4899" />

      {/* Hero object with distortion */}
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
        <mesh ref={meshRef} scale={2}>
          <icosahedronGeometry args={[1, 4]} />
          <MeshDistortMaterial
            color="#6366f1"
            roughness={0.1}
            metalness={0.8}
            distort={0.3}
            speed={2}
          />
        </mesh>
      </Float>

      {/* Particle field */}
      <Stars radius={50} depth={50} count={2000} factor={4} fade speed={1} />

      {/* Volumetric clouds */}
      <Cloud position={[0, 5, -10]} opacity={0.3} speed={0.2} />
      <Cloud position={[-5, 3, -15]} opacity={0.2} speed={0.1} />
    </>
  );
}

function LandingPage() {
  return (
    <div style={{ position: 'relative', height: '100vh' }}>
      <Canvas
        style={{ position: 'absolute', inset: 0 }}
        camera={{ position: [0, 0, 8], fov: 60 }}
      >
        <AtmosphericScene />
      </Canvas>
      <div style={{ position: 'relative', zIndex: 1, padding: '4rem' }}>
        <h1>Your Content Here</h1>
        <p>Text overlays on top of the 3D scene</p>
      </div>
    </div>
  );
}
```

**When to use**: Hero sections, brand pages, creative portfolios, agency sites.

### 4. Particle Morphing

Particles that form shapes, dissolve, and reform into new shapes.

```tsx
function ParticleMorph({ positions1, positions2 }) {
  const ref = useRef();
  const [morphProgress, setMorphProgress] = useState(0);

  useFrame(() => {
    const geo = ref.current.geometry;
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      pos.setX(i, THREE.MathUtils.lerp(positions1[i * 3], positions2[i * 3], morphProgress));
      pos.setY(i, THREE.MathUtils.lerp(positions1[i * 3 + 1], positions2[i * 3 + 1], morphProgress));
      pos.setZ(i, THREE.MathUtils.lerp(positions1[i * 3 + 2], positions2[i * 3 + 2], morphProgress));
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions1.length / 3}
          array={new Float32Array(positions1)}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#8b5cf6" sizeAttenuation />
    </points>
  );
}
```

**When to use**: Data visualization, brand animations, transitions, loading screens.

### 5. Card Tilt / Perspective Effects (CSS 3D — No WebGL)

For when you want depth without the weight of a full 3D library.

```css
.tilt-card {
  perspective: 1000px;
  transform-style: preserve-3d;
}

.tilt-card-inner {
  transition: transform 0.3s ease;
  transform-style: preserve-3d;
}

.tilt-card:hover .tilt-card-inner {
  transform: rotateY(10deg) rotateX(-5deg) translateZ(20px);
}

.tilt-card .shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    transparent 40%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 60%
  );
  pointer-events: none;
}
```

```tsx
function TiltCard({ children }) {
  const ref = useRef();

  function handleMouseMove(e) {
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    ref.current.style.transform =
      `rotateY(${x * 20}deg) rotateX(${-y * 20}deg) translateZ(10px)`;
  }

  function handleMouseLeave() {
    ref.current.style.transform = 'rotateY(0) rotateX(0) translateZ(0)';
  }

  return (
    <div className="tilt-card">
      <div
        ref={ref}
        className="tilt-card-inner"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {children}
        <div className="shine" />
      </div>
    </div>
  );
}
```

**When to use**: Cards, images, CTAs, pricing tables — subtle depth without WebGL overhead.

---

## Loading 3D Models

### GLTF/GLB (Recommended Format)

```tsx
import { useGLTF, useAnimations } from '@react-three/drei';

function AnimatedModel({ url }) {
  const { scene, animations } = useGLTF(url);
  const { actions } = useAnimations(animations, scene);

  useEffect(() => {
    // Play the first animation
    if (actions && Object.keys(actions).length > 0) {
      const firstAction = Object.values(actions)[0];
      firstAction.play();
    }
  }, [actions]);

  return <primitive object={scene} scale={1} />;
}

// Preload for faster rendering
useGLTF.preload('/models/character.glb');
```

### Where to Get Free Models

| Source | Quality | License |
|--------|---------|---------|
| Sketchfab (free section) | High | CC varies |
| poly.pizza | Medium | CC0 |
| Kenney.nl | Stylized | CC0 |
| Three.js examples | Basic | MIT |

> [!IMPORTANT]
> Always compress GLTF models with `gltf-transform` or `gltfjsx` before shipping. Uncompressed models can be 10x larger than needed.

---

## Post-Processing Effects

```tsx
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';

function Effects() {
  return (
    <EffectComposer>
      <Bloom luminanceThreshold={0.6} luminanceSmoothing={0.9} intensity={0.5} />
      <ChromaticAberration offset={[0.001, 0.001]} />
      <Vignette darkness={0.5} />
    </EffectComposer>
  );
}
```

**Use sparingly.** Post-processing is expensive. Test on mobile.

---

## Lighting That Actually Looks Good

| Lighting Setup | Effect | When |
|---------------|--------|------|
| Ambient (0.2) + one Directional | Clean, product photography | Product viewers |
| Environment map (HDR) | Realistic reflections | Metallic/glossy objects |
| Multiple colored point lights | Dramatic, cinematic | Landing pages, hero scenes |
| Rim light (backlight) | Object pops from background | Any hero element |
| Contact shadows | Grounding, realism | Floating objects |

```tsx
// Dramatic two-tone lighting
<ambientLight intensity={0.15} />
<directionalLight position={[5, 5, 5]} intensity={1} color="#4f46e5" castShadow />
<pointLight position={[-5, -2, 3]} intensity={0.6} color="#ec4899" />
<hemisphereLight skyColor="#4f46e5" groundColor="#1a1a2e" intensity={0.3} />
```

---

## Performance Budget

| Metric | Target | Danger Zone |
|--------|--------|-------------|
| Triangles per scene | < 100K | > 500K |
| Texture size | 1024x1024 max | 4096x4096 |
| Draw calls | < 50 | > 200 |
| Scene file size | < 2MB | > 10MB |
| Mobile FPS | > 30 | < 20 |
| Desktop FPS | > 55 | < 30 |

### Performance Techniques

| Technique | What It Does | When |
|-----------|-------------|------|
| Instancing | Renders 1000s of identical meshes in 1 draw call | Particles, forests, grids |
| LOD (Level of Detail) | Swaps simpler models at distance | Large scenes |
| `frameloop="demand"` | Only re-renders when something changes | Static scenes |
| Lazy load + Suspense | Defers 3D load until needed | Below-fold scenes |
| Draco compression | Compresses geometry 90%+ | All GLTF models |
| Texture atlasing | Combines multiple textures into one | Multi-material scenes |

---

## Mobile Considerations

```tsx
// Detect mobile and simplify
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

<Canvas
  dpr={isMobile ? [1, 1.5] : [1, 2]}  // Lower pixel ratio on mobile
  frameloop={isMobile ? 'demand' : 'always'}
  camera={{ fov: isMobile ? 60 : 50 }}  // Wider FOV for small screens
>
  {!isMobile && <Effects />}  {/* Skip post-processing on mobile */}
  <Scene particleCount={isMobile ? 500 : 2000} />
</Canvas>
```

- Touch controls: Use `OrbitControls` with `enableRotate` and touch events
- Reduce particle count, polygon count, and texture resolution on mobile
- Skip post-processing effects entirely
- Test on real devices, not just resized browsers

---

## WebGL Fallback

Always provide a non-3D fallback:

```tsx
function Scene3DWithFallback() {
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) setWebglSupported(false);
    } catch {
      setWebglSupported(false);
    }
  }, []);

  if (!webglSupported) {
    return <div className="fallback-gradient" />;
  }

  return <Canvas>...</Canvas>;
}
```

---

## NEVER

- NEVER just spin a shape and call it 3D — add purpose and interaction
- NEVER skip the WebGL fallback
- NEVER load uncompressed models (use Draco/gltf-transform)
- NEVER use post-processing on mobile without testing FPS
- NEVER assume WebGL2 support — check and degrade gracefully
- NEVER render a 3D canvas without `Suspense` and a loading state
- NEVER use `OrbitControls` without constraining zoom/pan ranges
- NEVER ignore lighting — default lighting looks like a tech demo

---

## Pre-Completion Checklist

- [ ] Scene has a clear PURPOSE (not just decoration)
- [ ] User can interact (scroll, hover, click, drag — not just watch)
- [ ] Lighting is intentional (not just ambientLight 0.5)
- [ ] Performance tested on mobile device (> 30 FPS)
- [ ] WebGL fallback exists
- [ ] Models compressed (Draco or gltf-transform)
- [ ] Lazy loaded with Suspense
- [ ] Touch controls work on mobile
- [ ] Design tokens used for colors where possible
- [ ] No spinning shapes with no purpose

---

## Skills References

| Skill | Purpose |
|-------|---------|
| [three-d-developing](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.agents/skills/three-d-developing/SKILL.md) | Base R3F patterns |
| [animation-designing](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.agents/skills/animation-designing/SKILL.md) | Motion design, GSAP integration |
| [interactive-animating](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.agents/skills/interactive-animating/SKILL.md) | Mouse-follow, scroll-driven, gesture animations |
| [experience-designing](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.agents/skills/experience-designing/SKILL.md) | Design tokens for 3D materials |
| [component-building](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.agents/skills/component-building/SKILL.md) | Wrapping 3D in reusable components |
| [mobile-first-enforcing](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.agents/skills/mobile-first-enforcing/SKILL.md) | Mobile performance, touch targets |

## Related Librarians

- [animation-librarian](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/librarians/animation-librarian.md) — Motion timing
- [experience-designer-librarian](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/librarians/experience-designer-librarian.md) — Visual design
- [playmaster-librarian](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/librarians/playmaster-librarian.md) — Game Studio hub (Playmaster routing, runtimes, sprite pipelines)
- [mobile-first-librarian](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/librarians/mobile-first-librarian.md) — Mobile compliance
