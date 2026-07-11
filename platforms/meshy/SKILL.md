# Meshy 3D AI Platform

**AI-powered 3D model generation from text and images.**

---

## Context Questions

1. **What do you need?** — Text to 3D, Image to 3D, texturing, or rigging?
2. **What's the use case?** — Game assets, 3D printing, VR/AR, marketing?
3. **Quality level?** — Quick prototype or production-ready asset?
4. **Export format?** — FBX, GLTF, OBJ, STL?

---

## TL;DR

| Need | Meshy Feature |
|------|---------------|
| **Text to 3D** | Describe object, get 3D model in < 1 min |
| **Image to 3D** | Upload image, get 3D model |
| **Multi-view** | Upload 3 angles for better accuracy |
| **Texturing** | AI-generate textures from prompts |
| **Rigging** | Auto-rig characters for animation |
| **3D Print** | Creative Lab for print-ready exports |

---

## Text to 3D Workflow

### 1. Write Effective Prompts

```markdown
## Good Prompts
- "A low-poly medieval sword with ornate handle, game asset style"
- "Stylized cartoon robot, bright colors, Pixar style"
- "Realistic human skull, anatomically correct, museum quality"

## Bad Prompts
- "sword" (too vague)
- "cool thing" (meaningless)
- "make it look good" (no direction)
```

### 2. Prompt Formula

```
[Style] + [Object] + [Details] + [Quality Level]
```

Examples:
- "Low-poly isometric tree, pine tree, snowy, game asset"
- "Photorealistic sports car, red Ferrari F40, studio lighting"
- "Cute chibi character, anime girl, pink hair, figurine style"

---

## Image to 3D Workflow

### Single Image

```markdown
1. Upload clear image (front view best)
2. Select art style (realistic, cartoon, low-poly)
3. Generate and refine
```

### Multi-View (Better Results)

```markdown
1. Upload 2-3 images of same object:
   - Front view
   - Side view
   - 3/4 angle
2. AI combines for accurate geometry
```

---

## AI Texturing

```markdown
## Prompt Examples
"Vintage leather texture, worn and weathered"
"Futuristic metal, glowing blue circuits"
"Stone brick wall, moss covered, medieval"

## Apply to Existing Model
1. Upload your mesh (FBX, OBJ)
2. Describe desired texture
3. AI generates and applies material
```

---

## Meshy 6 Features (2026)

| Feature | Description |
|---------|-------------|
| **Sculpting Detail** | Studio-grade mesh fidelity |
| **3D to Image/Video** | Turn 3D into cinematic visuals |
| **Smart Remesh** | Adjust poly count, optimize exports |
| **Creative Lab** | AI to 3D print in one click |

---

## Export Formats

| Format | Best For |
|--------|----------|
| **GLTF/GLB** | Web, Three.js, React Three Fiber |
| **FBX** | Unity, Unreal, Maya |
| **OBJ** | General 3D software |
| **STL** | 3D printing |

---

## Integration Patterns

### React Three Fiber

```tsx
import { useGLTF } from '@react-three/drei';

function MeshyModel() {
  const { scene } = useGLTF('/models/meshy-export.glb');
  return <primitive object={scene} />;
}
```

### Spline

```markdown
1. Export from Meshy as GLTF
2. Import into Spline
3. Add interactions and materials
4. Export to React
```

---

## Best Practices

| Do | Don't |
|----|-------|
| Be specific in prompts | Use vague descriptions |
| Specify art style | Assume default is right |
| Use multi-view for accuracy | Rely on single blurry image |
| Check poly count for target | Export highest quality always |
| Optimize before web export | Ship raw exports to web |

---

## Related Skills

- `librarians/3d-librarian.md` — 3D implementation
- `agents/3d/SKILL.md` — Three.js patterns
- `agents/spline/SKILL.md` — Spline integration
