---
name: prompting-images
description: AI image prompting with Imagen 3 (Gemini). 4K generation, text rendering, content creator workflows.
last_updated: 2026-01-26
---

# AI Image Prompting

Generate high-quality images for content creation using Imagen 3 (Google's flagship image model).

---

## Context Questions

Before generating images, ask:

1. **What's the use case?** — Thumbnail, social graphic, product mockup, blog illustration
2. **What style are you going for?** — Photorealistic, illustration, 3D render, abstract
3. **What's the mood/emotion?** — Professional, playful, dramatic, minimalist
4. **Do you need text in the image?** — Imagen 3 Pro handles text, others struggle
5. **What aspect ratio?** — Square (social), 16:9 (YouTube), 9:16 (Stories)

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| Style | Photorealistic ←→ Stylized/artistic |
| Complexity | Simple/minimal ←→ Detailed/complex |
| Mood | Light/airy ←→ Dark/moody |
| Text | No text ←→ Text-heavy |
| Resolution | Quick draft ←→ 4K final |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| YouTube thumbnail + attention | High contrast, face close-up, bold text, dramatic lighting |
| Blog illustration + professional | Clean, minimal, brand colors, no text overlay |
| Social graphic + engagement | Eye-catching, trend-aligned style, clear focal point |
| Product mockup + sales | Photorealistic, lifestyle context, professional lighting |
| Quick iteration + drafting | Lower resolution first, refine winning concepts |

---

## TL;DR

| What | Tool |
|------|------|
| **Primary** | Imagen 3 (via Gemini, AI Studio, Vertex) |
| **Text in Images** | Imagen 3 Pro (legible text rendering) |
| **Resolution** | Up to 4K |
| **Best For** | Thumbnails, social graphics, product mockups |
| **Disclosure** | SynthID watermark auto-applied |

---

## 1. Tool Overview

### Imagen 3 (Google DeepMind)

Google's most capable image generation model, available via multiple access points:

**Capabilities:**
- 2K and 4K resolution generation
- Legible text in multiple languages
- Advanced creative controls (lighting, camera angles, depth of field)
- SynthID watermarking (automatic AI detection)
- Strong photorealism and artistic styles

**Access Points:**

| Platform | Use Case |
|----------|----------|
| Gemini app | Quick consumer generations |
| Google AI Studio | Developer prototyping |
| Vertex AI | Enterprise production |
| ImageFX | Standalone image generator |
| Google Slides/Vids | Workspace integration |
| Canva, Figma | Third-party integration |

**Pricing (Vertex AI):**
- ~$0.02-0.04 per image (varies by resolution)
- Free tier in Gemini consumer app (limited)

---

## 2. Prompt Anatomy

Structure your prompts with these components:

```
[SUBJECT] + [STYLE] + [LIGHTING] + [COMPOSITION] + [MOOD] + [DETAILS]
```

### Components

| Component | Example |
|-----------|---------|
| **Subject** | A golden retriever puppy |
| **Style** | In watercolor illustration style |
| **Lighting** | Soft natural window light |
| **Composition** | Close-up portrait, centered |
| **Mood** | Warm and cheerful |
| **Details** | Wearing a red bandana, looking at camera |

### Example Prompts

**Product Photography:**
```
A sleek wireless earbud case on a marble surface, studio lighting, 
shallow depth of field, minimalist aesthetic, professional product 
photography, 4K detail
```

**Social Media Graphic:**
```
Abstract geometric background with gradient from deep purple to coral, 
modern and clean, space for text overlay, Instagram story format 9:16
```

**YouTube Thumbnail:**
```
Surprised person looking at laptop screen, bright colorful background, 
dramatic lighting, expressive face, YouTube thumbnail style, 
16:9 aspect ratio, HIGH CONTRAST
```

---

## 3. Text in Images

Imagen 3 Pro excels at rendering legible text — unlike most AI image models.

### Best Practices

```
✅ DO:
- Keep text short (1-5 words work best)
- Specify exact text in quotes: text saying "SALE 50% OFF"
- Describe text style: bold sans-serif, handwritten script

❌ AVOID:
- Long paragraphs
- Complex layouts with multiple text blocks
- Expecting perfect kerning
```

### Text Prompt Examples

**Quote Graphic:**
```
Minimalist poster with text "STAY CURIOUS" in bold white sans-serif 
font, centered, dark blue gradient background, modern motivational style
```

**Product Label:**
```
Coffee bag mockup with text "DARK ROAST" in elegant gold script, 
black matte packaging, professional product photography
```

---

## 4. Resolution & Aspect Ratios

### Resolution Options

| Setting | Resolution | Use Case |
|---------|------------|----------|
| Standard | 1024×1024 | Web, social posts |
| HD | 2048×2048 | Print, high-quality |
| 4K | 4096×4096 | Large format, zoom-in |

### Aspect Ratios for Content

| Platform | Ratio | Prompt Addition |
|----------|-------|-----------------|
| Instagram Post | 1:1 | "square format" |
| Instagram Story/Reel | 9:16 | "vertical, 9:16 aspect ratio" |
| YouTube Thumbnail | 16:9 | "wide format, 16:9" |
| Blog Header | 3:1 | "panoramic banner format" |
| Pinterest | 2:3 | "Pinterest pin format" |

---

## 5. Content Creator Use Cases

### Thumbnails

```
YouTube Thumbnail Prompt:
Dramatic split-screen comparison, left side dark and chaotic, 
right side bright and organized, large expressive emoji face 
in center, bold text "BEFORE vs AFTER", eye-catching colors, 
professional YouTube thumbnail, 16:9
```

### Instagram Carousel Cover

```
Clean minimalist cover slide, soft gradient background pink to 
purple, text "5 TIPS" in bold white geometric font, modern 
Instagram carousel style, square format
```

### Newsletter Header

```
Abstract flowing shapes in brand colors blue and gold, 
professional header image, subtle texture, space for 
logo overlay, panoramic 3:1 format
```

### Product Mockup

```
iPhone 15 Pro showing app interface, held by hand, 
coffee shop background blurred, natural lighting, 
lifestyle product photography, warm tones
```

---

## 6. Workflow Integration

### Batch Generation for Content Calendar

1. Define your content pillars (e.g., tips, quotes, promos)
2. Create prompt templates for each pillar
3. Generate 5-10 variations per template
4. Select best options for each week
5. Store in asset library

### Template System

```markdown
## Quote Graphic Template
Minimalist poster with text "[INSERT_QUOTE]" in [FONT_STYLE], 
[COLOR_SCHEME] background, [MOOD] aesthetic, square format

Variables:
- INSERT_QUOTE: The quote text
- FONT_STYLE: bold sans-serif / elegant script / modern geometric
- COLOR_SCHEME: dark gradient / soft pastels / vibrant pop
- MOOD: inspiring / calm / energetic
```

---

## 7. Best Practices 2025-2026

### Disclosure Requirements

| Platform | Requirement |
|----------|-------------|
| **FTC** | AI disclosure if commercial/sponsored |
| **Instagram** | "Made with AI" label recommended |
| **TikTok** | AI label for realistic images |
| **Google** | SynthID watermark auto-applied |

### Avoiding Issues

```
✅ Safe Uses:
- Abstract graphics and illustrations
- Stylized product mockups
- Artistic interpretations
- Text-based graphics

⚠️ Caution:
- Photorealistic humans (consent issues)
- Brand logos (trademark)
- Copyrighted characters
- Political content
```

---

## 8. Style Library

**Key principle:** Keep technical settings (4K, ratio) separate from creative prompts.

### Visual Styles

| Style | Description | Prompt Modifiers |
|-------|-------------|------------------|
| **Cinematic** | Film-like, dramatic | "cinematic lighting, anamorphic lens, film grain, shallow depth of field" |
| **Photorealistic** | Real photo feel | "photorealistic, 85mm lens, natural lighting, DSLR quality" |
| **Editorial** | Magazine quality | "editorial photography, high fashion, studio lighting, Vogue style" |
| **Minimalist** | Clean, simple | "minimalist, clean, negative space, simple composition" |
| **Moody/Dark** | Atmospheric | "moody lighting, dark tones, dramatic shadows, atmospheric" |
| **Bright/Airy** | Light, cheerful | "bright lighting, airy, soft shadows, cheerful" |

### Illustration Styles

| Style | Description | Prompt Modifiers |
|-------|-------------|------------------|
| **Cartoon** | Animated look | "cartoon style, vibrant colors, clean lines, animated" |
| **Flat Vector** | Modern graphics | "flat vector illustration, geometric, bold colors" |
| **Watercolor** | Painted feel | "watercolor illustration, soft edges, artistic" |
| **3D Render** | CGI look | "3D render, octane render, subsurface scattering" |
| **Anime** | Japanese animation | "anime style, cel shading, Studio Ghibli inspired" |
| **Sketch** | Hand-drawn | "pencil sketch, hand-drawn, rough lines" |

### Special Effects

| Style | Description | Prompt Modifiers |
|-------|-------------|------------------|
| **Holographic** | Futuristic glass | "holographic, iridescent, prismatic, translucent, futuristic" |
| **Neon** | Cyberpunk glow | "neon lighting, cyberpunk, glowing, dark background" |
| **Retro/Vintage** | Old school | "vintage, retro, 80s aesthetic, film grain, faded colors" |
| **Ethereal** | Dreamlike | "ethereal, dreamy, soft focus, magical, mystical" |
| **Glitch** | Digital distortion | "glitch art, digital distortion, corrupted, vaporwave" |

---

## 9. People Styles

### Types of People in Images

| Type | Approach | When to Use |
|------|----------|-------------|
| **Photorealistic** | "portrait of [description], photorealistic, natural lighting" | Authentic feel |
| **Illustrated** | "cartoon illustration of a person..." | Friendly, approachable |
| **Anonymous** | "person from behind, silhouette, partial view" | Stock-like, universal |
| **Stylized** | "in the style of [artist/aesthetic]..." | Creative, branded |
| **Diverse** | Explicitly describe in prompt | Representation matters |

### People Prompt Examples

**Photorealistic Portrait:**
```
Portrait of a confident woman in her 30s, natural makeup, 
warm smile, professional attire, soft natural lighting, 
shallow depth of field, corporate headshot style
```

**Illustrated Character:**
```
Cartoon illustration of a friendly developer, 
casual hoodie, holding coffee, vibrant colors, 
clean modern style, flat design
```

**Anonymous/Stock Style:**
```
Person from behind looking at city skyline at sunset,
silhouette, contemplative mood, warm golden hour lighting
```

**Diverse Representation:**
```
Group of diverse colleagues collaborating around a table,
mixed ethnicities and genders, professional office setting,
natural candid moment, warm lighting
```

### Avoiding Issues with People

```
✅ DO:
- Describe general characteristics (age range, expression, attire)
- Use style modifiers that set expectations
- Be specific about mood and context
- Request diverse representation when relevant

⚠️ CAUTION:
- Real person likenesses (avoid unless authorized)
- Oversexualized content
- Harmful stereotypes
- Deepfake concerns
```

---

## 10. Flexible Prompt System

**The library is malleable.** Mix and match components based on your need.

### Core Formula

```
PROMPT = [SUBJECT] + [STYLE] + [MOOD] + [LIGHTING] + [COMPOSITION]

SETTINGS = Separate (passed as parameters, not in prompt text):
- Resolution: 1024, 2048, 4096
- Aspect Ratio: 1:1, 16:9, 9:16
- Quality: standard, HD, 4K
```

### Why Separate Settings?

```
❌ OLD WAY (settings in prompt):
"A mountain landscape, 4K resolution, 16:9 aspect ratio, high quality"

✅ NEW WAY (settings separate):
Prompt: "A mountain landscape, golden hour, dramatic clouds, epic scale"
Settings: resolution=4096, aspect=16:9

Better because:
- Clearer creative direction
- Settings don't clutter prompt
- Easier to reuse prompts across platforms
- More flexibility
```

### Building Blocks

**Mix these as needed:**

| Block | Options |
|-------|---------|
| **Subject** | Person, object, scene, abstract |
| **Style** | Cinematic, cartoon, editorial, holographic... |
| **Mood** | Energetic, calm, mysterious, playful, serious |
| **Lighting** | Natural, studio, dramatic, soft, neon |
| **Composition** | Close-up, wide, centered, rule of thirds |
| **Camera** | 85mm portrait, wide angle, macro, drone |
| **Color** | Vibrant, muted, monochrome, warm, cool |

### Quick Combos

**Thumbnail (Engaging):**
```
Subject + Dramatic lighting + Bright mood + Close-up
"Person with surprised expression, dramatic rim lighting, 
vibrant colorful background, extreme close-up"
```

**Product (Clean):**
```
Subject + Studio lighting + Minimalist + Centered
"Wireless earbuds on marble surface, studio lighting, 
minimalist white background, centered composition"
```

**Social Graphic (Trendy):**
```
Abstract + Holographic + Modern + Space for text
"Holographic abstract shapes, iridescent gradients, 
modern and clean, ample negative space for text overlay"
```

**Editorial (Premium):**
```
Subject + Editorial style + Natural + Fashion
"Confident professional in modern office, editorial style, 
natural window light, high fashion magazine aesthetic"
```

---

## 11. Alternatives Comparison

| Tool | Best For | Text Quality |
|------|----------|--------------|
| **Imagen 3** | All-around, text | ⭐⭐⭐⭐⭐ |
| Midjourney | Art styles, aesthetics | ⭐⭐ |
| ChatGPT Images 2.0 | ChatGPT integration | ⭐⭐⭐ |
| Ideogram | Text-heavy designs | ⭐⭐⭐⭐ |
| Flux | Open source, fast | ⭐⭐ |

---

## Checklist

- [ ] Access set up (Gemini / AI Studio / Vertex)
- [ ] Prompt templates created for your content types
- [ ] Aspect ratio presets saved for each platform
- [ ] AI disclosure policy defined
- [ ] Asset organization system in place

---

## Related Skills

- [TikTok Content](/content/tiktok/SKILL.md) — Using AI images in short-form
- [Instagram Content](/content/instagram/SKILL.md) — Carousels and stories
- [YouTube Content](/content/youtube/SKILL.md) — Thumbnails
- [Social Strategy](/content/social/SKILL.md) — Cross-platform planning
- [Vision Models](/ai-builder/vision-models/SKILL.md) — API integration
