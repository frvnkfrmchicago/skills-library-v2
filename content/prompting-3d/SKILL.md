---
name: prompting-3d
description: AI 3D prompting. Text-to-3D, image-to-3D, Luma, Meshy, Tripo workflows.
last_updated: 2026-03
---

# 3D Prompting

Generate 3D models from text or images.

---

## Context Questions

Before generating 3D content, ask:

1. **What's the end use case?** — Product mockup, game asset, AR, marketing, 3D print
2. **What input do you have?** — Text description, reference image, existing model
3. **What quality level needed?** — Quick prototype, production-ready, hero asset
4. **What's the target platform?** — Web (R3F), Unity, Unreal, iOS AR, print
5. **What's your refinement capacity?** — AI-only, Blender cleanup, full pipeline

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| Quality | Draft/prototype ←→ Production-ready |
| Style | Realistic ←→ Stylized/low-poly |
| Complexity | Single object ←→ Multi-part assembly |
| Refinement | AI-only ←→ Manual post-processing |
| Format | Web-optimized ←→ Print-ready |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Web showcase + quick turnaround | Luma/Tripo, GLB export, minimal cleanup |
| Game asset + Unity | Meshy, FBX export, low-poly, texture baking |
| Product mockup + hero quality | Rodin/Luma, Blender refinement, PBR materials |
| AR experience + iOS | USDZ export, optimized poly count, clean topology |
| Prototype + exploration | Tripo free tier, rapid iteration, text-to-3D |

---

## TL;DR

| What | Details |
|------|---------|
| **Best Tools** | Luma AI Genie, Meshy, Tripo, Rodin |
| **Workflows** | Text-to-3D, Image-to-3D, Video-to-3D |
| **Output** | GLB, OBJ, FBX (web-ready) |
| **Use Cases** | Product mockups, game assets, AR, marketing |

---

## 1. Tool Landscape (2025)

### Primary Tools

| Tool | Best For | Access | Pricing |
|------|----------|--------|---------|
| **Luma AI Genie** | High quality, fast | [lumalabs.ai/genie](https://lumalabs.ai/genie) | Free tier + paid |
| **Meshy** | Game-ready assets | [meshy.ai](https://meshy.ai) | Free tier + paid |
| **Tripo AI** | Quick prototypes | [tripo3d.ai](https://tripo3d.ai) | Free tier |
| **Rodin** | Detailed objects | [hyperhuman.deemos.com/rodin](https://hyperhuman.deemos.com/rodin) | Paid |
| **OpenAI Shap-E** | Open source | GitHub | Free |

### When to Use Which

| Use Case | Recommended |
|----------|-------------|
| Quick prototype | Tripo AI |
| Product mockup | Luma AI Genie |
| Game asset | Meshy |
| Character/avatar | Rodin |
| Developer/custom | Shap-E (open source) |

---

## 2. Text-to-3D Workflow

### Prompt Structure

```
[OBJECT] + [STYLE] + [DETAILS] + [QUALITY MODIFIERS]
```

### Effective Prompts

**Product Object:**
```
A modern wireless earbud case, white matte finish, 
rounded corners, premium product design, clean topology
```

**Game Asset:**
```
Low-poly treasure chest, fantasy RPG style, 
wood with gold bands, game-ready, textured
```

**Character:**
```
Stylized robot character, friendly expression, 
round body, metallic blue finish, cartoon style
```

### Prompt Tips

| Do | Don't |
|----|-------|
| Describe physical form | Describe actions/movement |
| Specify material/texture | Use vague adjectives |
| Mention style (low-poly, realistic) | Expect perfect first result |
| Keep it focused (one object) | Describe complex scenes |

---

## 3. Image-to-3D Workflow

### What Works Best

| Image Type | Quality | Notes |
|------------|---------|-------|
| **Product photo (white bg)** | ⭐⭐⭐⭐⭐ | Best results |
| **Character concept art** | ⭐⭐⭐⭐ | Side + front views help |
| **Simple object photo** | ⭐⭐⭐⭐ | Clean backgrounds |
| **Complex scene** | ⭐⭐ | Too much for single model |
| **Low quality/blurry** | ⭐ | Garbage in, garbage out |

### Image Prep Tips

```
✅ DO:
- Use high resolution (1024px+)
- Clean, solid background (white ideal)
- Good lighting, no harsh shadows
- Multiple angles if tool supports

❌ AVOID:
- Cluttered backgrounds
- Heavy shadows obscuring form
- Multiple objects in one image
- Text or watermarks
```

### Multi-View Input

Some tools accept multiple views for better reconstruction:

```
Front view + Side view + Back view
       ↓
    Better 3D model
```

---

## 4. Prompt Patterns

### By Category

**Products:**
```
[product type], [material], [finish], product photography style, 
clean design, commercial quality
```

**Characters:**
```
[character description], [style], [expression], 
full body, T-pose, character design, game-ready
```

**Props/Objects:**
```
[object], [era/style], [material], prop asset, 
detailed, textured
```

**Environments (limited):**
```
[element], modular, [style], environment asset,
tileable/repeatable
```

### Style Modifiers

| Modifier | Effect |
|----------|--------|
| "low-poly" | Simplified geometry, stylized |
| "realistic" | High detail, real-world materials |
| "cartoon" | Smooth, simplified, vibrant |
| "stylized" | Artist interpretation, not realistic |
| "game-ready" | Clean topology, optimized |
| "PBR" | Physically-based rendering textures |

---

## 5. Output Formats

### Common Formats

| Format | Best For | Notes |
|--------|----------|-------|
| **GLB/GLTF** | Web (R3F, Three.js) | Standard for web |
| **OBJ** | General use | Widely compatible |
| **FBX** | Game engines (Unity, Unreal) | Rigging support |
| **USDZ** | Apple AR | iOS AR Quick Look |
| **STL** | 3D printing | Geometry only |

### Web Usage (R3F)

```tsx
import { useGLTF } from "@react-three/drei"

function Model() {
  const { scene } = useGLTF("/models/generated-model.glb")
  return <primitive object={scene} scale={0.5} />
}
```

---

## 6. Quality Checklist

### Before Using Generated Model

```
[ ] Check topology (clean mesh, no holes)
[ ] Verify textures (applied correctly)
[ ] Test scale (appropriate for scene)
[ ] Check orientation (up = Y or Z)
[ ] Review polygon count (optimized for use case)
[ ] Confirm materials (PBR or basic)
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Holes in mesh | Manual cleanup in Blender |
| Bad topology | Regenerate or use different tool |
| Missing textures | Re-export with textures embedded |
| Scale wrong | Scale in 3D software before export |
| Too many polygons | Use decimation/reduce polys |

---

## 7. Refinement Workflow

### From AI to Production

```
1. GENERATE
   Text/Image → 3D Tool → Draft model

2. REVIEW
   Check in 3D viewer → Identify issues

3. REFINE (if needed)
   Import to Blender → Fix topology, UVs, textures

4. OPTIMIZE
   Reduce polys → Bake textures → Export

5. USE
   Import to R3F/Game engine/AR
```

### Quick Fixes in Blender

| Task | Blender Action |
|------|----------------|
| Fix holes | Mesh > Clean Up > Fill Holes |
| Reduce polys | Modifier > Decimate |
| Fix normals | Mesh > Normals > Recalculate Outside |
| Center origin | Object > Set Origin > Origin to Geometry |

---

## 8. Use Cases

### Product Mockups

```
Workflow:
1. Generate 3D model from product prompt
2. Export as GLB
3. Use in R3F product showcase
4. Add lighting, rotation controls
```

### Game Assets

```
Workflow:
1. Generate asset (prop, character, etc.)
2. Optimize in Blender
3. Export as FBX
4. Import to Unity/Unreal
5. Set up materials, collision
```

### AR/Marketing

```
Workflow:
1. Generate product model
2. Export as USDZ (iOS) or GLB (web)
3. Embed in website/app
4. User views in AR
```

### Social Content

```
Workflow:
1. Generate 3D object
2. Render short animation/turntable
3. Export as video
4. Use in social posts
```

---

## 9. Comparison Table

| Tool | Text-to-3D | Image-to-3D | Quality | Speed | Cost |
|------|------------|-------------|---------|-------|------|
| **Luma Genie** | ✅ | ✅ | ⭐⭐⭐⭐⭐ | Fast | Free + Paid |
| **Meshy** | ✅ | ✅ | ⭐⭐⭐⭐ | Fast | Free + Paid |
| **Tripo AI** | ✅ | ✅ | ⭐⭐⭐ | Fast | Free tier |
| **Rodin** | ✅ | ✅ | ⭐⭐⭐⭐⭐ | Slow | Paid |
| **Shap-E** | ✅ | ❌ | ⭐⭐⭐ | Slow | Free |

---

## Checklist

- [ ] Identified use case (product, game, AR, etc.)
- [ ] Chose appropriate tool
- [ ] Wrote clear prompt / prepared image
- [ ] Generated initial model
- [ ] Reviewed quality
- [ ] Refined if needed
- [ ] Exported in correct format
- [ ] Tested in target environment

---

## Related Skills

- [R3F](/agents/r3f/SKILL.md) — 3D in React
- [Image Prompting](/content/prompting-images/SKILL.md) — 2D generation
- [Video Prompting](/content/prompting-video/SKILL.md) — Video generation
- [Gaming](/agents/gaming/SKILL.md) — Game development
