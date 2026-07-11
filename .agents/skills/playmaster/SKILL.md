---
name: playmaster
description: >
  Handles 2D asset pipelines (outpainting, parallax layers, tilesets, sprite sheets, props)
  via the playmaster Next.js application. Covers anchor and scale normalization,
  animation metadata manifests, and engine integration for Phaser, PixiJS, and Canvas.
  Use when outpainting images, building parallax layers, generating tilesets/sprites,
  creating scatter props, or when the user mentions Playmaster, sprites, tiles, or parallax.
---

# Playmaster

Sprites look simple until your walk cycle drifts 3 pixels left per loop,
your attack animation is 2x the size of your idle, and your character
teleports because every animator used a different anchor point.

This skill turns raw art frames into production-ready sprite assets with
consistent anchors, uniform scale, proper metadata, and previews that
prove correctness before code is written.

---

## STOP — Comprehension Gate

Before processing any sprites, answer:

1. **What is the source format?** Individual PNGs? PSD layers? Aseprite files? AI-generated frames?
2. **What is the target engine?** Phaser (strip or atlas), PixiJS (atlas), Three.js/R3F (individual textures), raw Canvas (strip)?
3. **What is the target resolution?** Native pixel art (no scaling) or HD (pre-scaled)?
4. **What is the anchor convention?** Center-bottom for characters, center-center for effects, custom?
5. **How many animation states?** idle, walk, run, jump, attack, hurt, die — list them all.

---

## 1. Source Frame Requirements

### Naming Convention

```
{character}_{animation}_{frame:04d}.png

Examples:
  player_idle_0000.png
  player_idle_0001.png
  player_walk_0000.png
  player_walk_0001.png
  player_walk_0002.png
  enemy_slime_attack_0000.png
```

### Quality Checklist

Before processing, verify each source frame:

- [ ] Consistent canvas size across all frames of ONE animation
- [ ] No accidental background (transparent PNG, not white)
- [ ] Subject centered relative to the anchor point
- [ ] No cut-off edges (character fits within canvas bounds with padding)
- [ ] Power-of-two canvas is NOT required (Phaser/PixiJS handle arbitrary sizes)

### Resolution Standards

| Art Style | Base Frame Size | Scale Factor | Final Game Size |
|-----------|----------------|--------------|-----------------|
| Pixel art (16-bit) | 16×16 to 32×32 | Integer only (2x, 3x, 4x) | 64×64 to 128×128 |
| Pixel art (32-bit) | 32×48 to 64×96 | Integer only | 64×96 to 128×192 |
| HD hand-drawn | 256×256 to 512×512 | 1x or 0.5x | 256×256 to 512×512 |
| AI-generated | 512×512 to 1024×1024 | Downscale to target | 128×128 to 256×256 |

**BECAUSE** non-integer scaling of pixel art creates blurry sub-pixel
rendering. If your source is 32px, scale to 64, 96, or 128 — never 48 or 80.

---

## 2. Anchor Normalization

### The Problem

Every frame of every animation must share the same anchor point relative
to the character's "feet" (or center of mass for non-characters). If they
don't, the character slides, bounces, or teleports between frames.

### Standard Anchors

| Entity Type | Anchor Point | Anchor Coordinates |
|-------------|-------------|-------------------|
| Character (grounded) | Center-bottom | `(0.5, 1.0)` |
| Character (flying) | Center-center | `(0.5, 0.5)` |
| Projectile | Center-center | `(0.5, 0.5)` |
| Effect / particle | Center-center | `(0.5, 0.5)` |
| UI element | Top-left | `(0.0, 0.0)` |

### Normalization Process

```typescript
// Anchor normalization algorithm
interface FrameConfig {
  width: number;      // Uniform canvas width for this animation
  height: number;     // Uniform canvas height
  anchorX: number;    // 0.0 to 1.0 (left to right)
  anchorY: number;    // 0.0 to 1.0 (top to bottom)
  padding: number;    // Pixels of padding around content
}

/**
 * Given raw frames of varying sizes, normalize them to a uniform canvas
 * with consistent anchor positioning.
 *
 * Steps:
 * 1. Find the bounding box of content across ALL frames (union bounds)
 * 2. Calculate the uniform canvas size (max width + padding, max height + padding)
 * 3. Place each frame's content so the anchor point aligns consistently
 * 4. Export all frames at the uniform canvas size
 */
function normalizeFrames(
  frames: { image: ImageData; contentBounds: Rect }[],
  config: FrameConfig
): ImageData[] {
  // Step 1: Union bounds
  let maxContentWidth = 0;
  let maxContentHeight = 0;
  for (const frame of frames) {
    maxContentWidth = Math.max(maxContentWidth, frame.contentBounds.width);
    maxContentHeight = Math.max(maxContentHeight, frame.contentBounds.height);
  }

  // Step 2: Uniform canvas = max content + 2x padding
  const canvasW = maxContentWidth + config.padding * 2;
  const canvasH = maxContentHeight + config.padding * 2;

  // Step 3: Place each frame with anchor alignment
  return frames.map((frame) => {
    const canvas = createCanvas(canvasW, canvasH);
    const anchorPixelX = canvasW * config.anchorX;
    const anchorPixelY = canvasH * config.anchorY;

    // Content anchor = same proportional position within content bounds
    const contentAnchorX = frame.contentBounds.width * config.anchorX;
    const contentAnchorY = frame.contentBounds.height * config.anchorY;

    // Offset so content anchor aligns with canvas anchor
    const offsetX = anchorPixelX - contentAnchorX;
    const offsetY = anchorPixelY - contentAnchorY;

    drawImage(canvas, frame.image, offsetX, offsetY);
    return canvas;
  });
}
```

### ⛔ STOP GATE — Anchor Verification

Before proceeding to strip generation, create a **flip test**:

1. Overlay frame 0 and the last frame of each animation at 50% opacity
2. The anchor point (feet, center) should not drift by more than 1px
3. If drift > 1px, the anchor is wrong — fix before continuing

```bash
# Quick visual anchor test using ImageMagick
convert player_idle_0000.png player_idle_0005.png \
  -compose blend -define compose:args=50 -composite \
  anchor_test_idle.png
# Open anchor_test_idle.png — feet should overlap perfectly
```

---

## 3. Strip Generation

### Horizontal Strip (Phaser, Canvas)

All frames of one animation composited left-to-right into a single image.

```bash
# ImageMagick — horizontal strip
convert player_walk_*.png +append player_walk_strip.png

# With specific ordering
convert player_walk_0000.png player_walk_0001.png player_walk_0002.png \
  player_walk_0003.png player_walk_0004.png player_walk_0005.png \
  +append player_walk_strip.png
```

### Programmatic Strip Generation (Sharp)

```typescript
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

interface StripConfig {
  inputDir: string;          // Directory of individual frames
  outputPath: string;        // Output strip path
  animationName: string;     // e.g., "walk"
  frameWidth: number;        // Uniform frame width
  frameHeight: number;       // Uniform frame height
}

async function generateStrip(config: StripConfig): Promise<{
  path: string;
  frameCount: number;
  totalWidth: number;
}> {
  // Get sorted frame files
  const files = fs.readdirSync(config.inputDir)
    .filter((f) => f.startsWith(config.animationName) && f.endsWith('.png'))
    .sort();

  if (files.length === 0) throw new Error(`No frames found for "${config.animationName}"`);

  const frameCount = files.length;
  const totalWidth = config.frameWidth * frameCount;

  // Create empty strip canvas
  const strip = sharp({
    create: {
      width: totalWidth,
      height: config.frameHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  });

  // Composite each frame at its position
  const composites = files.map((file, index) => ({
    input: path.join(config.inputDir, file),
    left: index * config.frameWidth,
    top: 0,
  }));

  await strip.composite(composites).png().toFile(config.outputPath);

  return { path: config.outputPath, frameCount, totalWidth };
}
```

### Atlas Generation (TexturePacker format)

For engines that prefer atlas JSON + spritesheet (PixiJS, Phaser 3 atlas):

```json
{
  "frames": {
    "player_idle_0": {
      "frame": { "x": 0, "y": 0, "w": 64, "h": 96 },
      "sourceSize": { "w": 64, "h": 96 },
      "spriteSourceSize": { "x": 0, "y": 0, "w": 64, "h": 96 },
      "anchor": { "x": 0.5, "y": 1.0 }
    },
    "player_idle_1": {
      "frame": { "x": 64, "y": 0, "w": 64, "h": 96 },
      "sourceSize": { "w": 64, "h": 96 },
      "spriteSourceSize": { "x": 0, "y": 0, "w": 64, "h": 96 },
      "anchor": { "x": 0.5, "y": 1.0 }
    }
  },
  "meta": {
    "image": "player_atlas.png",
    "format": "RGBA8888",
    "size": { "w": 512, "h": 512 },
    "scale": 1
  }
}
```

---

## 4. Animation Metadata

### Manifest Format

Every animation set ships with a JSON manifest. The game engine reads this
to configure animations without hardcoding frame counts or timings.

```json
{
  "character": "player",
  "version": 1,
  "frameWidth": 64,
  "frameHeight": 96,
  "anchor": { "x": 0.5, "y": 1.0 },
  "animations": {
    "idle": {
      "strip": "player_idle_strip.png",
      "frameCount": 6,
      "frameRate": 8,
      "loop": true,
      "pingPong": false
    },
    "walk": {
      "strip": "player_walk_strip.png",
      "frameCount": 8,
      "frameRate": 12,
      "loop": true,
      "pingPong": false
    },
    "attack": {
      "strip": "player_attack_strip.png",
      "frameCount": 5,
      "frameRate": 15,
      "loop": false,
      "pingPong": false,
      "hitFrames": [2, 3]
    },
    "hurt": {
      "strip": "player_hurt_strip.png",
      "frameCount": 3,
      "frameRate": 10,
      "loop": false,
      "pingPong": false
    },
    "die": {
      "strip": "player_die_strip.png",
      "frameCount": 6,
      "frameRate": 8,
      "loop": false,
      "pingPong": false
    }
  }
}
```

### Loading in Phaser

```typescript
// Preload from manifest
async function loadSpriteManifest(scene: Phaser.Scene, manifestUrl: string) {
  const response = await fetch(manifestUrl);
  const manifest = await response.json();

  for (const [name, anim] of Object.entries(manifest.animations)) {
    scene.load.spritesheet(`${manifest.character}_${name}`, anim.strip, {
      frameWidth: manifest.frameWidth,
      frameHeight: manifest.frameHeight,
    });
  }
}

// Create animations from manifest
function createAnimations(scene: Phaser.Scene, manifest: SpriteManifest) {
  for (const [name, anim] of Object.entries(manifest.animations)) {
    scene.anims.create({
      key: `${manifest.character}_${name}`,
      frames: scene.anims.generateFrameNumbers(`${manifest.character}_${name}`, {
        start: 0,
        end: anim.frameCount - 1,
      }),
      frameRate: anim.frameRate,
      repeat: anim.loop ? -1 : 0,
      yoyo: anim.pingPong,
    });
  }
}
```

---

## 5. Preview Generation

### Animated Preview (GIF / WebP)

Generate previews for design review before integration.

```bash
# ImageMagick — animated GIF from frames
convert -delay 8 -loop 0 player_walk_*.png player_walk_preview.gif

# FFmpeg — animated WebP (smaller, better quality)
ffmpeg -framerate 12 -i player_walk_%04d.png -vf "scale=256:-1:flags=neighbor" \
  -loop 0 player_walk_preview.webp

# Filmstrip thumbnail (all frames in a row, scaled down)
convert player_walk_strip.png -resize 512x player_walk_filmstrip.png
```

### Programmatic Preview

```typescript
async function generateAnimatedPreview(
  inputDir: string,
  animationName: string,
  outputPath: string,
  options: {
    scale: number;      // 2x, 3x for pixel art visibility
    frameRate: number;
    format: 'gif' | 'webp';
  }
): Promise<void> {
  const frames = getFrameFiles(inputDir, animationName);

  const preview = sharp(frames[0], { animated: true })
    .resize({
      width: options.scale * getFrameWidth(frames[0]),
      kernel: 'nearest', // Nearest-neighbor for pixel art
    });

  if (options.format === 'webp') {
    await preview.webp({ loop: 0, delay: Math.round(1000 / options.frameRate) }).toFile(outputPath);
  } else {
    await preview.gif({ loop: 0, delay: Math.round(1000 / options.frameRate) }).toFile(outputPath);
  }
}
```

---

## 6. Playmaster Pipelines

When generating sprite resources using your local **`playmaster`** app (hosted at `http://localhost:3000`), you must follow specific prompts, keying configurations, and post-processing steps to ensure high-fidelity integration.

The `playmaster` provides five workspaces, each corresponding to a game asset requirement:

### 6.1 Extender Mode (Outpainting Core Scenes)
- **Objective:** Extend a focal character portrait or a 1:1 asset into a widescreen 16:9 cinematic or scrollable map.
- **Workflow:**
  1. Upload the base image to the center of the canvas.
  2. Select the extension direction (Left, Right, Top, Bottom).
  3. Prompt the model with specific scene descriptors rather than generic styling tags (e.g. `"Neon-lit wet streets, cinematic brawler backdrop, side-scrolling fighting stage"`).
  4. Rely on the Poisson-blending QA loop to smooth edge seams. Pick the best variant from the Horizontal N-best picker.

### 6.2 Parallax Mode (Layer Slicing & Extension)
- **Objective:** Generate horizontal, looping layers (Far background, Midground, Foreground) for side-scrollers.
- **Workflow:**
  1. Generate or import a layered backdrop.
  2. Use a high-contrast magenta color key (`#ff00ff`) to isolate foreground elements (e.g. street lamps, railings).
  3. Select **Parallax** workspace and outpaint horizontally (Left + Right). Set `EXTENSION_PERCENT` to `50%` to ensure a wide enough canvas to loop seamlessly:
     ```
     [Left Extended Section] ──> [Original Layer Content] ──> [Right Extended Section]
     ```
  4. Ensure far backgrounds loop without high-contrast visual "anchors" (like a giant mountain) that reveal the repeating loop.

### 6.3 Tiles Mode (Autotiles & Repeating Textures)
- **Objective:** Generate repeating ground tilesets.
- **Workflow:**
  1. Input a 512×512 base texture into the **Tiles** workspace.
  2. Toggle "Seamless Wrap" to force the generator to match boundary pixel gradients (left-to-right and top-to-bottom).
  3. Generate the 4×4 sheets with `TILESET_ATLAS_EXTRUDE_PX` set to `2` to prevent sub-pixel bleeding at camera edges in WebGL.

### 6.4 Sprites Mode (Character Grid Generation)
- **Objective:** Prompt biped/quadruped grids to create walk, idle, and attack animations.
- **Workflow:**
  1. Set the grid parameters (e.g., `Grid: 8 cols, 1 rows`, `Frame Size: 128x128`).
  2. Prompt utilizing deterministic frame actions. For a biped walk cycle:
     `"Biped creature walk cycle strip, profile view, walking to the right, frame-by-frame progression: Frame 1 left foot forward, Frame 2 passing, Frame 3 right foot forward, Frame 4 passing. Clean solid background. 2D sprite sheet."`
  3. Apply the **Anchor Normalization** algorithm in Section 2 to align feet borders to `(0.5, 1.0)`.

### 6.5 Props Mode (Game Props & Items)
- **Objective:** Generate item pick-ups, breakable barrels, or UI icons.
- **Workflow:**
  1. Input a prompt defining the prop and its state transitions (e.g., `"Wooden chest, closed, slightly cracked, opening animation, open with glowing gold inside"`).
  2. Set the `PROP_BATCH` config knob to `8` to generate 8 variations.
  3. Export with transparent backgrounds (PNG). If the exporter fails transparency, use a black background and apply a chromakey filter in-engine.

---

## 7. Format Targets

### Per-Engine Output

| Engine | Format | Details |
|--------|--------|---------|
| Phaser 3 (strip) | Horizontal PNG strip + JSON | `scene.load.spritesheet()` |
| Phaser 3 (atlas) | Packed atlas PNG + JSON | `scene.load.atlas()` |
| PixiJS | Packed atlas PNG + JSON | TexturePacker format |
| Three.js / R3F | Individual PNGs or atlas | `THREE.TextureLoader` + UV mapping |
| Raw Canvas | Horizontal strip | `ctx.drawImage()` with source rect |

### Compression

```bash
# PNG optimization (lossless)
pngquant --quality=80-100 --speed=1 *.png

# Convert to WebP for non-pixel-art (lossy OK)
cwebp -q 90 player_atlas.png -o player_atlas.webp

# For pixel art: ALWAYS use PNG, NEVER lossy compression
# WebP/JPEG will blur pixel edges
```

---

## ⛔ STOP GATE — Quality Verification

Before shipping sprites to the game:

1. **Anchor test**: Overlay first and last frame of each animation — anchor drift < 1px
2. **Size consistency**: All frames of one animation have identical canvas dimensions
3. **No background bleed**: Open strip on checkered background — edges are clean
4. **Metadata completeness**: Manifest includes every animation with correct frame count and rate
5. **Preview review**: Watch each animated preview — timing feels right, no frame skips

```bash
# Verify all frames in a set have the same dimensions
identify player_walk_*.png | awk '{print $3}' | sort -u
# EXPECT: exactly 1 unique size. If multiple: ❌ size inconsistency

# Verify strip width = frameWidth × frameCount
identify player_walk_strip.png | awk '{print $3}'
# Width should equal frameWidth * frameCount exactly
```

---

## NEVER

- **NEVER** use non-integer scaling on pixel art — nearest-neighbor only, 2x/3x/4x
- **NEVER** ship sprites without anchor normalization — the character will slide between animations
- **NEVER** hardcode frame counts in game code — read from the manifest
- **NEVER** use JPEG or lossy WebP for pixel art — it blurs pixel edges
- **NEVER** pack different characters at different scales into one atlas — normalize first
- **NEVER** skip the flip test — anchor drift is invisible until the game is running
- **NEVER** assume all frames have the same content bounds — union bounds then normalize

---

## Pre-Completion Checklist

- [ ] Source frames follow naming convention (`{character}_{animation}_{frame:04d}.png`)
- [ ] Anchor point defined and documented for each character type
- [ ] Anchor normalization applied — flip test passed for every animation
- [ ] All frames of each animation have identical canvas dimensions
- [ ] Strips generated for target engine format
- [ ] Animation manifest JSON created with frame count, rate, loop mode, anchor
- [ ] Animated previews generated and reviewed
- [ ] Compression applied (lossless PNG for pixel art, optimized for HD)
- [ ] No background bleed on transparent edges

---

## Related Skills

| Skill | When to use |
|-------|-------------|
| `web-game-foundations` | Defining asset organization and loading strategy |
| `r3f-game-building` | If sprites are used in an R3F game (2D in 3D) |
| `three-webgl-game-building` | If sprites are textured onto planes in Three.js |
| `web-3d-asset-pipeline` | For 3D asset preparation (sister pipeline) |
| `animation-designing` | Motion principles for sprite animation timing |

---

## Output Format

```markdown
## Sprite Pipeline: [Character/Asset Name]

### Source
[Frame count per animation, source resolution, art style]

### Anchor
[Anchor type (center-bottom, center-center), coordinates]

### Animations
| Animation | Frames | Frame Rate | Loop | Strip File |
|-----------|--------|------------|------|------------|
| idle      | 6      | 8 fps     | ✓    | player_idle_strip.png |
| walk      | 8      | 12 fps    | ✓    | player_walk_strip.png |

### Output Format
[Target engine, strip/atlas, compression]

### Verification
- Anchor drift: [< 1px ✓ / > 1px ✗]
- Size consistency: [All frames uniform ✓/✗]
- Preview reviewed: [✓/✗]

### Manifest
[Link to animation manifest JSON]
```
