---
name: web-3d-asset-pipeline
description: >
  Prepares and optimizes browser-game 3D assets. Covers GLB and glTF
  shipping work including Blender cleanup and export, collision and
  LOD setup, Draco and meshopt geometry compression, KTX2/Basis texture
  compression, texture packaging and channel packing, and runtime
  validation with gltf-validator. Use when exporting models from Blender,
  compressing 3D assets, setting up collision meshes, creating LODs,
  or when user mentions GLB, glTF, 3D assets, model optimization,
  Draco, or texture compression.
---

# Web 3D Asset Pipeline

A beautiful 3D model means nothing if it takes 45 seconds to load on
mobile, crashes the GPU with 2 million triangles, or has collision
meshes that don't match the visual geometry.

This skill turns raw 3D art into browser-ready assets: compressed,
validated, collision-ready, and size-budgeted.

---

## STOP — Comprehension Gate

Before processing any 3D assets, answer:

1. **What is the source format?** Blender (.blend), FBX, OBJ, glTF, other?
2. **What is the target engine?** Three.js (plain), R3F (React Three Fiber), Babylon.js?
3. **Does the model need collision?** Visual-only, simple box/sphere, convex hull, or triangle mesh?
4. **Does the model need LODs?** Single fixed distance, or multiple LOD levels?
5. **What is the poly budget?** Hero character (10K-30K), environment prop (1K-5K), background (500-2K)?
6. **Are there animations?** Skeletal, morph targets, both?

---

## 1. Format Decision

### GLB vs glTF

| Format | When to Use | Trade-offs |
|--------|-------------|------------|
| **GLB** (binary) | Production delivery | Single file, faster load, no missing refs |
| **glTF** (JSON + .bin + textures) | Development, debugging | Inspectable, hot-reload textures |
| **glTF + Draco** | Production with compression | Smaller geometry, requires DRACO decoder |
| **GLB + meshopt** | Production with animated models | Better animation compression than Draco |

**Default: GLB for shipping. glTF during development.**

### When to Use Each Compression

```
Static model, no animations?
  → Draco compression (best geometry ratio)

Animated model (skeletal or morph targets)?
  → meshopt compression (handles animation data better)

Both in same scene?
  → Use both. Per-asset compression choice.

Need maximum compatibility?
  → Uncompressed GLB (Safari on older iOS can choke on WASM decoders)
  → Provide uncompressed fallback
```

---

## 2. Blender Export Workflow

### Pre-Export Checklist

```
Before exporting from Blender, verify:

□ Apply all transforms (Ctrl+A → All Transforms)
  BECAUSE un-applied transforms produce wrong positions at runtime

□ Apply all modifiers (Mirror, Subdivision, Array)
  BECAUSE modifiers don't export — what you see is not what ships

□ Remove unused materials
  BECAUSE each material = 1 draw call. 15 unused materials = 15 wasted calls

□ Remove loose vertices and degenerate faces
  BECAUSE they cause rendering artifacts and inflated poly counts

□ Check face orientation (normals facing outward)
  BECAUSE flipped normals render as invisible faces or black patches

□ Set origin to world center or expected anchor point
  BECAUSE misaligned origins make positioning at runtime impossible

□ Units set to Metric, scale = 1.0
  BECAUSE mismatched units produce 100x scale errors at runtime

□ UV maps clean (no overlapping for baked textures)
  BECAUSE overlapping UVs corrupt baked lighting and texture mapping
```

### Export Settings

```
Blender → File → Export → glTF 2.0 (.glb/.gltf)

Format: GLB (Binary)

Include:
  ☑ Selected Objects (if exporting single asset)
  ☑ Custom Properties (for collision tags)

Transform:
  ☑ +Y Up (Three.js and R3F expect Y-up)

Geometry:
  ☑ Apply Modifiers
  ☑ UVs
  ☑ Normals
  ☑ Vertex Colors (if used)
  ☐ Tangents (recalculate in engine — smaller file)
  ☑ Loose Edges: off
  ☑ Loose Points: off

Materials:
  ☑ Export Materials
  Image Format: WebP (if supported) or PNG
  ☐ Keep Original (exports raw embedded textures — usually too large)

Animation (if applicable):
  ☑ Export Animations
  ☑ Use NLA Strips (for multiple animations on one model)
  Sampling Rate: 1 (every frame) or 2 (half — acceptable for non-critical)
```

---

## 3. Mesh Cleanup

### Automated Checks

```bash
# Install gltf-validator (Node.js)
npm install -g gltf-validator

# Validate export
gltf-validator model.glb --max-issues 100

# Check with gltf-transform
npx gltf-transform inspect model.glb
```

### gltf-transform Cleanup Pipeline

```bash
# Full optimization pipeline
npx gltf-transform dedup model.glb model_dedup.glb        # Remove duplicate accessors
npx gltf-transform flatten model_dedup.glb model_flat.glb  # Flatten node hierarchy
npx gltf-transform prune model_flat.glb model_pruned.glb   # Remove unused resources
npx gltf-transform weld model_pruned.glb model_welded.glb  # Merge coincident vertices
```

### Poly Budget Enforcement

| Asset Type | Triangle Budget | Notes |
|-----------|----------------|-------|
| Hero character | 10K - 30K | Highest detail, seen up close |
| NPC / enemy | 5K - 15K | Medium detail |
| Weapon / item | 1K - 5K | Viewed at arm's length |
| Environment prop | 500 - 5K | Instanced, many copies |
| Background / skybox | 100 - 1K | Minimal geometry |
| Particle mesh | 10 - 100 | Hundreds of instances |

```bash
# Check poly count
npx gltf-transform inspect model.glb | grep -i "triangles\|primitives"
# If triangles > budget: reduce in Blender or use gltf-transform simplify
```

### Mesh Simplification

```bash
# Reduce polygon count by 50% (adjust ratio as needed)
npx gltf-transform simplify model.glb model_simplified.glb \
  --ratio 0.5 \
  --error 0.01
```

---

## 4. Collision Geometry

### Naming Convention

Collision meshes are invisible geometry used by the physics engine.
Name them with a prefix so the loader can identify and separate them.

```
Visual mesh:    tree_trunk
Collision mesh: COL_tree_trunk     (convex hull)
                COLBOX_tree_trunk  (box collider)
                COLSPH_tree_trunk  (sphere collider)
                COLTRI_tree_trunk  (triangle mesh — expensive, use sparingly)
```

### Collision Generation in Blender

```
1. Select the visual mesh
2. Duplicate (Shift+D)
3. Rename with COL_ prefix
4. Simplify: Decimate modifier (ratio 0.1 - 0.3)
5. Apply modifier
6. Set as wireframe display (so it's visible but non-rendering)
7. Add custom property: "collision" = "convex" (or "box", "sphere", "trimesh")
8. Export together — runtime code separates by name prefix
```

### Runtime Collision Extraction

```typescript
// Extract collision meshes from loaded GLB
function extractColliders(
  scene: THREE.Group
): { visual: THREE.Group; colliders: ColliderDef[] } {
  const colliders: ColliderDef[] = [];
  const toRemove: THREE.Object3D[] = [];

  scene.traverse((child) => {
    if (child.name.startsWith('COL_') || child.name.startsWith('COLBOX_') ||
        child.name.startsWith('COLSPH_') || child.name.startsWith('COLTRI_')) {

      if (child instanceof THREE.Mesh) {
        const type = child.name.startsWith('COLBOX_') ? 'box'
                   : child.name.startsWith('COLSPH_') ? 'sphere'
                   : child.name.startsWith('COLTRI_') ? 'trimesh'
                   : 'convex';

        colliders.push({
          type,
          geometry: child.geometry,
          position: child.position.clone(),
          rotation: child.quaternion.clone(),
          scale: child.scale.clone(),
        });

        toRemove.push(child);
      }
    }
  });

  // Remove collision meshes from visual scene
  for (const obj of toRemove) {
    obj.parent?.remove(obj);
  }

  return { visual: scene, colliders };
}
```

---

## 5. LOD (Level of Detail)

### When to Use LODs

```
Model visible at multiple distances?
  → YES → LOD system required

Model is a instanced prop (100+ copies)?
  → YES → LOD system critical for performance

Model is a UI element or always at fixed distance?
  → NO → Single resolution is fine
```

### LOD Levels

| LOD Level | Distance | Triangle Ratio | Texture Resolution |
|-----------|----------|----------------|-------------------|
| LOD0 (full) | 0 - 10m | 100% | Full (1024×1024) |
| LOD1 | 10 - 30m | 50% | Half (512×512) |
| LOD2 | 30 - 80m | 25% | Quarter (256×256) |
| LOD3 (billboard) | 80m+ | 2 triangles | 128×128 impostor |

### Generation Pipeline

```bash
# Generate LOD levels with gltf-transform
npx gltf-transform simplify model.glb model_lod0.glb --ratio 1.0
npx gltf-transform simplify model.glb model_lod1.glb --ratio 0.5 --error 0.01
npx gltf-transform simplify model.glb model_lod2.glb --ratio 0.25 --error 0.02
```

### Three.js LOD Usage

```typescript
import * as THREE from 'three';

function createLODMesh(
  lod0: THREE.Group,
  lod1: THREE.Group,
  lod2: THREE.Group
): THREE.LOD {
  const lod = new THREE.LOD();

  lod.addLevel(lod0, 0);    // Full detail: 0-10m
  lod.addLevel(lod1, 10);   // Half detail: 10-30m
  lod.addLevel(lod2, 30);   // Quarter detail: 30m+

  return lod;
}

// R3F equivalent
function LODTree({ position }: { position: [number, number, number] }) {
  const lod0 = useGLTF('/models/tree_lod0.glb');
  const lod1 = useGLTF('/models/tree_lod1.glb');
  const lod2 = useGLTF('/models/tree_lod2.glb');

  return (
    <Detailed distances={[0, 10, 30]} position={position}>
      <primitive object={lod0.scene.clone()} />
      <primitive object={lod1.scene.clone()} />
      <primitive object={lod2.scene.clone()} />
    </Detailed>
  );
}
```

---

## 6. Texture Compression

### Texture Formats for Web

| Format | Use Case | Size vs PNG | Browser Support |
|--------|----------|-------------|-----------------|
| **KTX2 (Basis)** | Universal GPU compressed | 75-90% smaller | All modern (via transcoder) |
| **WebP** | Embedded in GLB | 25-35% smaller | All modern |
| **PNG** | Source / pixel art | Baseline | Universal |
| **JPEG** | Photos, skyboxes | 80-90% smaller | Universal |
| **AVIF** | Best compression ratio | 90%+ smaller | Limited GPU decode |

### Compression Pipeline

```bash
# Convert textures to KTX2 (GPU-compressed via Basis Universal)
npx gltf-transform ktx2 model.glb model_ktx2.glb \
  --slots "baseColorTexture normalTexture" \
  --filter "LANCZOS4"

# Or convert to WebP (simpler, no WASM decoder needed)
npx gltf-transform webp model.glb model_webp.glb \
  --quality 85

# Resize oversize textures (max 1024 for most game assets)
npx gltf-transform resize model.glb model_resized.glb \
  --width 1024 --height 1024
```

### Channel Packing (ORM Maps)

Combine Occlusion, Roughness, and Metalness into a single RGB texture:

```
R channel = Ambient Occlusion
G channel = Roughness
B channel = Metalness
```

This reduces 3 texture samples to 1, saving GPU bandwidth and draw calls.

```bash
# Blender: Bake ORM map
# R: AO bake (Ambient Occlusion)
# G: Roughness (from Principled BSDF)
# B: Metalness (from Principled BSDF)
# Export as single PNG, reference as occlusionRoughnessMetallicTexture

# gltf-transform can merge separate maps
npx gltf-transform merge-orm model.glb model_orm.glb
```

### Texture Budget

| Texture Type | Max Resolution | Format | Notes |
|-------------|---------------|--------|-------|
| Albedo / Base Color | 1024×1024 | KTX2 or WebP | 2048 only for hero assets |
| Normal Map | 1024×1024 | KTX2 (ETC1S) | Never JPEG — artifacts are visible |
| ORM (packed) | 512×512 | KTX2 or PNG | Lower res acceptable |
| Emissive | 512×512 | WebP | Only if emissive areas are large |
| Lightmap | 1024×1024 | KTX2 | Pre-baked lighting |

---

## 7. Full Optimization Pipeline

### One-Command Pipeline

```bash
#!/bin/bash
# optimize-glb.sh — Full asset optimization pipeline
# Usage: ./optimize-glb.sh input.glb output.glb

INPUT="$1"
OUTPUT="$2"
TEMP=$(mktemp -d)

echo "Step 1: Dedup resources..."
npx gltf-transform dedup "$INPUT" "$TEMP/01_dedup.glb"

echo "Step 2: Flatten hierarchy..."
npx gltf-transform flatten "$TEMP/01_dedup.glb" "$TEMP/02_flat.glb"

echo "Step 3: Prune unused..."
npx gltf-transform prune "$TEMP/02_flat.glb" "$TEMP/03_pruned.glb"

echo "Step 4: Weld vertices..."
npx gltf-transform weld "$TEMP/03_pruned.glb" "$TEMP/04_welded.glb"

echo "Step 5: Resize textures (max 1024)..."
npx gltf-transform resize "$TEMP/04_welded.glb" "$TEMP/05_resized.glb" \
  --width 1024 --height 1024

echo "Step 6: Compress textures to WebP..."
npx gltf-transform webp "$TEMP/05_resized.glb" "$TEMP/06_webp.glb" \
  --quality 85

echo "Step 7: Draco compress geometry..."
npx gltf-transform draco "$TEMP/06_webp.glb" "$OUTPUT"

# Report
ORIGINAL_SIZE=$(stat -f%z "$INPUT" 2>/dev/null || stat --format=%s "$INPUT")
FINAL_SIZE=$(stat -f%z "$OUTPUT" 2>/dev/null || stat --format=%s "$OUTPUT")
RATIO=$(echo "scale=1; $FINAL_SIZE * 100 / $ORIGINAL_SIZE" | bc)

echo ""
echo "✅ Done!"
echo "   Original: $(echo "scale=1; $ORIGINAL_SIZE / 1024" | bc)KB"
echo "   Optimized: $(echo "scale=1; $FINAL_SIZE / 1024" | bc)KB"
echo "   Ratio: ${RATIO}% of original"

rm -rf "$TEMP"
```

---

## 8. Runtime Validation

### Pre-Ship Checklist Script

```bash
# Validate all GLBs in public/assets/models/
for file in public/assets/models/**/*.glb; do
  echo "=== Validating: $file ==="

  # 1. gltf-validator
  gltf-validator "$file" --max-issues 10

  # 2. File size check
  SIZE=$(stat -f%z "$file" 2>/dev/null || stat --format=%s "$file")
  if [ "$SIZE" -gt 5242880 ]; then  # 5MB
    echo "⚠️ WARNING: $file is $(echo "scale=1; $SIZE / 1048576" | bc)MB (budget: 5MB)"
  fi

  # 3. Inspect details
  npx gltf-transform inspect "$file" 2>/dev/null | grep -E "meshes|materials|textures|animations"

  echo ""
done
```

---

## ⛔ STOP GATE — Asset Quality

Before integrating ANY 3D asset into the game:

1. **gltf-validator passes** with 0 errors (warnings acceptable)
2. **File size within budget** (< 2MB for props, < 5MB for hero models)
3. **Poly count within budget** (check against table in Section 3)
4. **Textures compressed** (KTX2 or WebP, max 1024×1024)
5. **Collision meshes included** (if physics is needed)
6. **Y-up orientation** confirmed (model loads right-side-up in Three.js)
7. **No missing textures** (all materials have assigned textures or procedural values)

```bash
# Quick validation command
gltf-validator model.glb && echo "✅ Valid" || echo "❌ Invalid"
npx gltf-transform inspect model.glb | head -20
```

---

## NEVER

- **NEVER** ship uncompressed GLB files — always run through the optimization pipeline
- **NEVER** export from Blender without applying transforms — positions will be wrong
- **NEVER** use 4096×4096 textures for game props — 1024 max, 512 preferred
- **NEVER** skip gltf-validator — it catches issues that are invisible until runtime
- **NEVER** use triangle mesh colliders for simple shapes — box/sphere/convex are 100x cheaper
- **NEVER** embed unoptimized textures in GLB — they inflate file size dramatically
- **NEVER** forget Y-up export — Three.js expects Y-up, Blender defaults to Z-up
- **NEVER** pack LODs into one GLB — separate files for lazy loading per distance

---

## Pre-Completion Checklist

- [ ] Source model cleaned in Blender (transforms applied, modifiers applied, normals checked)
- [ ] Exported as GLB with correct settings (Y-up, applied modifiers, optimized images)
- [ ] gltf-validator reports 0 errors
- [ ] Poly count within budget for asset type
- [ ] Textures compressed (KTX2 or WebP) and resized to max 1024
- [ ] Collision geometry included and named with COL_ prefix (if needed)
- [ ] LODs generated (if asset is visible at multiple distances)
- [ ] File size within budget
- [ ] Test load in target engine — renders correctly, no missing textures
- [ ] Channel-packed ORM map used (if applicable)

---

## Related Skills

| Skill | When to use |
|-------|-------------|
| `web-game-foundations` | Asset loading strategy and directory organization |
| `r3f-game-building` | Loading optimized GLBs in React Three Fiber |
| `three-webgl-game-building` | Loading optimized GLBs in plain Three.js |
| `playmaster` | 2D asset preparation (sister pipeline) |
| `three-d-developing` | Non-game 3D asset usage (websites, product viewers) |
| `performance-tuning` | Diagnosing asset-related performance issues |

---

## Output Format

```markdown
## 3D Asset Pipeline: [Asset Name]

### Source
[Source format, original poly count, original file size]

### Optimization Applied
| Step | Before | After |
|------|--------|-------|
| Dedup | — | -X% |
| Weld | — | -X triangles |
| Texture compress | PNG 4MB | WebP 400KB |
| Draco | — | -X% geometry |
| **Total** | **X MB** | **Y MB (Z% of original)** |

### Collision
[Collider type, COL_ mesh names, poly count]

### LODs
| Level | Distance | Triangles | File Size |
|-------|----------|-----------|-----------|
| LOD0  | 0-10m    | 10,000    | 500KB     |
| LOD1  | 10-30m   | 5,000     | 250KB     |
| LOD2  | 30m+     | 2,500     | 125KB     |

### Validation
- gltf-validator: [✓ 0 errors / ✗ N errors]
- File size: [X KB — within budget ✓/✗]
- Textures: [Format, max resolution]
- Orientation: [Y-up confirmed ✓/✗]
```
