---
name: three-d-developing
description: >
  Builds 3D elements for web and mobile using React Three Fiber, Three.js,
  Spline, and drei helpers. Covers scene setup, interactive 3D elements,
  floating shapes, mouse-follow cameras, performance optimization, and WebGL
  fallbacks. Use when adding 3D backgrounds, creating interactive 3D elements,
  integrating Spline scenes, optimizing WebGL performance, or when user
  mentions 3D, Three.js, R3F, WebGL, or Spline.
---

# Three-D Developing Skill

3D should enhance, not distract. Use depth to create immersion, not to show off.

---

## Tool Selection

| Need | Tool |
|------|------|
| Custom 3D logic | React Three Fiber (R3F) |
| Designer-friendly | Spline |
| Simple shapes | drei helpers |
| Complex scenes | Three.js raw |
| Quick effects | CSS 3D transforms |

---

## React Three Fiber Setup

```tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';

function Scene() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />

      <Float speed={2} rotationIntensity={0.5}>
        <mesh>
          <torusKnotGeometry args={[1, 0.3, 128, 32]} />
          <meshStandardMaterial color="#8b5cf6" />
        </mesh>
      </Float>

      <OrbitControls enableZoom={false} />
    </Canvas>
  );
}
```

---

## Spline Integration

```tsx
import Spline from '@splinetool/react-spline';

export function Scene3D() {
  return (
    <Spline
      scene="https://prod.spline.design/YOUR_SCENE_ID/scene.splinecode"
      style={{ width: '100%', height: '100vh' }}
    />
  );
}
```

---

## 3D Background Patterns

### Floating Shapes

```tsx
function FloatingShapes() {
  return (
    <Canvas className="absolute inset-0 -z-10">
      <ambientLight intensity={0.4} />
      {[...Array(20)].map((_, i) => (
        <Float key={i} speed={1 + Math.random()}>
          <mesh position={[
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 5
          ]}>
            <icosahedronGeometry args={[0.3, 0]} />
            <meshStandardMaterial
              color={`hsl(${260 + Math.random() * 40}, 70%, 60%)`}
              transparent
              opacity={0.6}
            />
          </mesh>
        </Float>
      ))}
    </Canvas>
  );
}
```

### Mouse-Follow Camera

```tsx
function MouseCamera() {
  const { camera } = useThree();

  useFrame(({ mouse }) => {
    camera.position.x = THREE.MathUtils.lerp(
      camera.position.x, mouse.x * 0.5, 0.05
    );
    camera.position.y = THREE.MathUtils.lerp(
      camera.position.y, mouse.y * 0.5, 0.05
    );
  });

  return null;
}
```

---

## Performance Optimization

### Instancing for Many Objects

```tsx
<Instances limit={1000}>
  <boxGeometry />
  <meshStandardMaterial />
  {positions.map((pos, i) => (
    <Instance key={i} position={pos} />
  ))}
</Instances>
```

### Lazy Loading

```tsx
const Scene = lazy(() => import('./Scene'));

<Suspense fallback={<div className="loading" />}>
  <Scene />
</Suspense>
```

### On-Demand Rendering

```tsx
<Canvas frameloop="demand" />
```

### Performance Directives

- [ ] Use instancing for > 50 identical objects
- [ ] Lazy load all 3D scenes behind `Suspense`
- [ ] Set `frameloop="demand"` when scene is static
- [ ] Keep polygon count reasonable (check with `useFrame` + stats)
- [ ] Compress textures to WebP/AVIF, max 1024×1024 unless critical
- [ ] Provide graceful fallback when WebGL is unsupported

---

## Design Token Integration

Reference color tokens for materials:

```tsx
// Use CSS custom property values for material colors
const primaryColor = getComputedStyle(document.documentElement)
  .getPropertyValue('--color-primary').trim();

<meshStandardMaterial color={primaryColor} />
```

Reference spacing tokens for scene positioning and camera configuration.

---

## WebGL Fallback

Always provide a fallback for environments without WebGL:

```tsx
function Scene3DWithFallback() {
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) setWebglSupported(false);
  }, []);

  if (!webglSupported) {
    return <div className="fallback-gradient" />;
  }

  return <Canvas>...</Canvas>;
}
```

---

## ⛔ STOP GATE — Completion

DO NOT mark 3D implementation complete without:

1. Scene renders correctly on target browsers
2. Performance tested on mobile (check FPS)
3. Fallback exists for WebGL failure
4. Lazy loading with Suspense implemented
5. No unnecessary re-renders (check with React DevTools)

---

## Output Format

```markdown
## 3D Element: [Name]

### Purpose
[What this adds to the experience]

### Technology
[R3F / Spline / Three.js]

### Scene Setup
[Code]

### Performance
- Polygon count: [X]
- Textures: [sizes]
- Lazy loaded: ✓/✗

### Fallback
[What shows if WebGL fails]
```
