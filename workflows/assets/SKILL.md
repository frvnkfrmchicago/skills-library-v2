# Assets & AI Generation Skill

**Generate images, vectors, game assets, and media with AI tools.**

---

## Context Questions

Before generating assets, ask:

1. **What's the asset type?** — Images, vectors, icons, game sprites, 3D models, video
2. **What's the use case?** — Marketing, UI, game, social media, product photos
3. **What's the style needed?** — Photorealistic, stylized, pixel art, minimalist, 3D
4. **What's the format requirement?** — PNG, SVG, sprite sheet, GLTF, MP4
5. **What's the commercial context?** — Personal project, client work, commercial product

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| Fidelity | Quick placeholder ←→ Production quality |
| Style | Realistic ←→ Highly stylized |
| Format | Raster (PNG) ←→ Vector (SVG) ←→ 3D (GLTF) |
| Quantity | Single asset ←→ Full asset library |
| Customization | Use as-is ←→ Heavy post-processing |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| App icon needed | Midjourney for quality → vectorize for scalability |
| UI mockup | v0 or Stitch (gets code too) |
| Game sprites | Scenario for consistency, sprite sheet format |
| Logo design | Recraft for vectors, or Midjourney → Vectorizer.AI |
| Marketing images | Midjourney or ChatGPT Images 2.0 for hero images |
| 3D models for web | Meshy or 3DFY.AI, export as GLTF |
| Background video | Runway for smooth loops |

---

## TL;DR

| Asset Type | Best Tool | Output |
|------------|-----------|--------|
| Photorealistic images | Midjourney, ChatGPT Images 2.0 | PNG/JPG |
| Stylized/artistic | Midjourney | PNG |
| UI mockups | v0, Stitch, Gemini | Code + images |
| Vectors/SVG | Recraft, Illustroke, Vectorizer.AI | SVG |
| Game sprites | Scenario, Midjourney | PNG (sprite sheets) |
| 3D models | 3DFY.AI, Meshy | GLTF/GLB |
| Icons | Midjourney + vectorize | SVG |
| Video | Runway, Pika | MP4 |

---

## Part 1: AI Image Generation

### Tool Comparison (2025)

| Tool | Strength | Weakness | Best For |
|------|----------|----------|----------|
| **Midjourney** | Artistic, stylized | Less precise control | Concept art, marketing |
| **ChatGPT Images 2.0** | Precise prompts, text in images | Less artistic | Accurate illustrations |
| **Stable Diffusion** | Free, customizable | Setup required | Technical users |
| **Adobe Firefly** | Commercial-safe | Less creative | Enterprise |
| **Google Imagen** | Photorealistic | Limited access | Realistic photos |
| **Stitch/Gemini** | UI generation | Not for standalone art | App mockups |

---

### Prompt Engineering for Images

**Structure:**
```
[Subject] + [Style] + [Details] + [Technical specs]
```

**Examples:**

```
# App icon
A minimalist app icon for a trading journal app, flat design, 
green gradient, simple chart symbol, iOS style, 1024x1024

# Game character
Pixel art character sprite sheet, 16x16, idle and walking animations,
medieval knight, 8-bit style, transparent background

# Marketing hero image
Modern SaaS dashboard on laptop screen, dark mode UI,
gradient purple and blue, clean minimal desk setup, 
professional photography style, 4k

# Landing page background
Abstract gradient mesh background, soft purple and teal,
subtle noise texture, web design, 1920x1080
```

---

### Midjourney Specific

**Parameters:**
```
/imagine [prompt] --ar 16:9 --v 6 --style raw

--ar        Aspect ratio (16:9, 1:1, 9:16)
--v 6       Version 6 (latest)
--style raw Less stylized, more literal
--q 2       Higher quality (slower)
--s 50      Stylize amount (0-1000)
--c 20      Chaos/variety (0-100)
```

**Style keywords:**
- `flat design` - Clean, minimal
- `3D render` - Glossy, dimensional
- `pixel art` - Retro game style
- `watercolor` - Soft, artistic
- `cyberpunk` - Neon, futuristic
- `minimalist` - Simple, clean
- `isometric` - 3D angle view

---

### ChatGPT Images 2.0 Specific

**Via ChatGPT or API:**
```
Create an image of [detailed description].
Style: [art style]
Colors: [color palette]
Mood: [atmosphere]
```

**Strengths:**
- Better at text in images
- More literal interpretation
- Good for diagrams/infographics

---

## Part 2: Vector Graphics

### Raster to Vector Workflow

```
AI Image (PNG) → Vectorizer.AI → SVG → Edit in Figma/Illustrator
```

### AI Vector Tools

| Tool | Type | Output |
|------|------|--------|
| **Recraft** | Text-to-vector | SVG |
| **Illustroke** | Text-to-vector | SVG |
| **Vectorizer.AI** | Raster-to-vector | SVG |
| **Adobe Illustrator** | AI enhance + manual | SVG |

### Vector Prompts

```
# Logo
Minimalist logo for "AppName", geometric shapes only,
single color, scalable, modern tech company

# Icon set
Set of 6 app icons: home, settings, profile, search, notifications, menu
Outline style, consistent 2px stroke, rounded corners

# Illustration
Flat vector illustration of person using laptop,
minimal colors (3 max), no gradients, simple shapes
```

---

## Part 3: Game Assets

### AI Game Asset Tools (2025)

| Tool | Best For | Notes |
|------|----------|-------|
| **Scenario** | Game-specific art | Style consistency |
| **3DFY.AI** | Text to 3D models | Game-ready meshes |
| **Meshy** | Text to 3D | Low-poly friendly |
| **Leonardo AI** | Character art | Consistent styles |
| **Midjourney** | Concept art | Then vectorize |

### Sprite Sheet Generation

**Prompt structure:**
```
Character sprite sheet, [style], [view], [frames]

Example:
Pixel art character sprite sheet, knight with sword,
side view, 8 frames walk cycle, 4 frames attack,
16x16 pixels each, transparent background, retro game style
```

**Post-processing:**
1. Generate base image
2. Split into individual frames
3. Import to game engine
4. Create animation from frames

---

### Tileset Generation

```
Tileset for 2D platformer game, [theme], [style]

Example:
Tileset for 2D platformer, forest theme, pixel art 16x16,
includes: grass, dirt, stone, water, trees, bushes,
seamless edges, retro game style
```

---

### Character Consistency

**Create a style reference first:**
```
Character design sheet for [name]:
- Front view
- Side view  
- Back view
- Expression variations
[Include style details]
```

**Then reference for all assets:**
```
[Character name] in [action], same art style as reference,
[specific scene details]
```

---

## Part 4: Video Content

### AI Video Tools

| Tool | Best For | Length |
|------|----------|--------|
| **Runway Gen-2** | General video | 4-16 sec |
| **Pika Labs** | Stylized video | 3-4 sec |
| **Stable Video** | Open source | Varies |
| **HeyGen** | Avatar videos | Long |

### Use Cases

- **Product demos:** Screen recording + AI enhancement
- **Social content:** Short loops
- **Backgrounds:** Animated gradients, particles
- **Explainers:** Avatar-based narration

---

## Part 5: Asset Organization

### Folder Structure

```
assets/
├── images/
│   ├── marketing/       # Hero images, social
│   ├── ui/              # Icons, buttons
│   └── content/         # Blog, product images
├── vectors/
│   ├── icons/           # SVG icons
│   └── illustrations/   # SVG artwork
├── game/
│   ├── sprites/         # Character sheets
│   ├── tilesets/        # Level tiles
│   └── backgrounds/     # Parallax layers
├── fonts/
└── video/
```

### Naming Convention

```
[type]-[description]-[size].[ext]

hero-dashboard-1920x1080.png
icon-settings-24.svg
sprite-knight-idle-32x32.png
```

---

## Part 6: Integration Workflows

### For Web Apps (Next.js)

```typescript
// Using next/image for optimization
import Image from 'next/image';

export function Hero() {
  return (
    <Image
      src="/images/marketing/hero-dashboard.png"
      alt="Dashboard preview"
      width={1920}
      height={1080}
      priority
    />
  );
}
```

### For Games (Phaser)

```typescript
preload() {
  // Load generated sprite sheet
  this.load.spritesheet('player', '/assets/game/sprites/player-sheet.png', {
    frameWidth: 32,
    frameHeight: 32,
  });
  
  // Load tileset
  this.load.image('tiles', '/assets/game/tilesets/forest-tiles.png');
}
```

### For 3D (R3F)

```tsx
import { useGLTF } from '@react-three/drei';

function Model() {
  const { scene } = useGLTF('/assets/models/character.glb');
  return <primitive object={scene} />;
}
```

---

## Part 7: When to Use What

| Need | Tool | Why |
|------|------|-----|
| App icon | Midjourney → vectorize | Best quality |
| Social media graphics | Midjourney or ChatGPT Images 2.0 | Fast, good quality |
| UI mockup | Stitch, v0 | Gets you code too |
| Logo | Recraft or manual | Needs to be vector |
| Game sprites | Scenario or Midjourney | Consistency |
| 3D models | Meshy, 3DFY | Game-ready |
| Background video | Runway | Smooth loops |
| Product photos | ChatGPT Images 2.0 | Photorealistic |

---

## Quick Reference

### Fast Asset Workflow

```
1. Describe what you need (plain language)
2. Generate with AI tool
3. Download highest resolution
4. Vectorize if needed (for icons/logos)
5. Optimize (compress, resize)
6. Organize in project structure
```

### Prompt Template

```
[Asset type] for [use case],
[visual style],
[specific details],
[technical requirements: size, format, colors]
```

---

## Resources

- **Midjourney:** discord.gg/midjourney
- **ChatGPT Images 2.0:** Via ChatGPT Plus or API
- **Vectorizer.AI:** vectorizer.ai
- **Recraft:** recraft.ai
- **Scenario:** scenario.com
- **3DFY.AI:** 3dfy.ai
- **Runway:** runwayml.com
- **Leonardo:** leonardo.ai

---

## Related Skills

- `agents/gaming/SKILL.md` - Using assets in games
- `agents/r3f/SKILL.md` - 3D assets and models
- `agents/performance/SKILL.md` - Image optimization
- `prompt-craft/` - Visual prompting patterns
