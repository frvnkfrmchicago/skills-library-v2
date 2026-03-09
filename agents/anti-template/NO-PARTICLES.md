# NO PARTICLES + NO EMOJIS Rule

> Add to: `agents/anti-template/SKILL.md` or create as standalone rule

---

## FORBIDDEN

```
- NO floating particles
- NO energy wisps
- NO ambient dots drifting
- NO sparkle effects as filler
- NO "atmosphere" made of particles
```

Particles are lazy. They add nothing to comprehension. They're visual noise.

---

## USE INSTEAD

### Actual Imagery

| Instead of... | Use... |
|---------------|--------|
| Floating particles | Transparent PNG character silhouettes layered |
| Sparkle effects | Real star images with opacity/blur |
| Energy wisps | Gradient color washes that shift |
| Ambient dots | Layered background images at different scales |
| "Atmosphere" | Real photography or illustration with blur/depth |

### How to Use Transparent Images

```css
/* Layer multiple transparent PNGs */
.background {
  background:
    url('/images/character-silhouette.png') center/contain no-repeat,
    url('/images/secondary-element.png') bottom-right/30% no-repeat,
    linear-gradient(to bottom, #8E3B5E 0%, #000000 100%);
}

/* Animate position, not opacity flickering */
.floating-element {
  animation: gentle-float 6s ease-in-out infinite;
}

@keyframes gentle-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}
```

### Stars Without Particles

Use actual star PNG/SVG with:
- Different sizes (scale variation)
- Blur levels (depth of field)
- Opacity gradients (brighter center, faded edges)
- Slow rotation or subtle scale pulse

```css
.star {
  filter: blur(1px);
  opacity: 0.8;
  animation: star-pulse 4s ease-in-out infinite;
}

@keyframes star-pulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
}
```

---

## Micro-Animation Alternatives

Instead of particles moving, animate REAL ELEMENTS:

| Element | Animation |
|---------|-----------|
| Character image | Subtle breathing (scale 1.0 → 1.02) |
| Background image | Slow pan (translateX over 30+ seconds) |
| Text | Glow pulse on important words |
| Icons | Rotation or bounce on state change |
| Gradients | Color shift over time (hue rotation) |
| Shadows | Depth change (box-shadow expansion) |

---

## Character Placement

### On Quiz/Discovery Screens

```
┌─────────────────────────────────────┐
│                                     │
│   [Question text - left aligned]    │
│                                     │
│                    ┌─────────────┐  │
│   [Answer 1]       │  CHARACTER  │  │
│   [Answer 2]       │  SILHOUETTE │  │
│   [Answer 3]       │  (30-40%    │  │
│   [Answer 4]       │   width)    │  │
│                    └─────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

- Character: right side, 30-40% of screen width
- Opacity: 60-80% (not competing with UI)
- Z-index: behind content, creates depth

### On Profile/Card Screens

```
┌─────────────────────────────────────┐
│  ┌─────────────────────────────────┐│
│  │                                 ││
│  │   CHARACTER IMAGE               ││
│  │   (edge-to-edge, cropped)       ││
│  │                                 ││
│  └─────────────────────────────────┘│
│                                     │
│  [Power Card overlapping image]     │
│                                     │
│  [Content below]                    │
└─────────────────────────────────────┘
```

- Image bleeds to edges
- Content overlaps image (negative margin)
- Gradient overlay at bottom for text readability

### On Feed/Posts

- User avatar: 44px, LEFT of username
- Character cosplay image: FULL BLEED
- User info: OVERLAID on image bottom-left with gradient

---

## Depth Without Particles

Create visual depth using:

1. **Blur layers** — background more blurred than foreground
2. **Scale difference** — larger elements feel closer
3. **Opacity gradients** — fade edges, brighten center
4. **Shadows** — drop shadows on elevated elements
5. **Z-index stacking** — clear visual hierarchy

```css
/* Depth through blur */
.layer-back { filter: blur(4px); opacity: 0.6; }
.layer-mid { filter: blur(1px); opacity: 0.9; }
.layer-front { filter: none; opacity: 1; }
```

---

## NO EMOJIS IN UI

**FORBIDDEN in production UI:**
```
- NO emoji reactions (🔥, ⚡, ✨)
- NO emoji as icons
- NO emoji in buttons or labels
- NO emoji as status indicators
```

Emojis are unprofessional. They render differently across platforms. They look cheap.

### Use Icon Libraries Instead

| Platform | Library | Install |
|----------|---------|---------|
| React Native | Phosphor React Native | `npm install phosphor-react-native` |
| React Web | Lucide React | `npm install lucide-react` |
| Any | Heroicons | `npm install @heroicons/react` |

### Example: Reactions with Icons

```tsx
// Instead of emoji reactions, use Phosphor icons
import { Flame, Lightning, FistRaised, HandsPraying, StarFour } from 'phosphor-react-native';

const reactions = [
  { name: 'Fire', icon: <Flame weight="fill" color="#8E3B5E" size={24} /> },
  { name: 'Lightning', icon: <Lightning weight="fill" color="#87CEEB" size={24} /> },
  { name: 'Power Up', icon: <FistRaised weight="fill" size={24} /> },
  { name: 'Respect', icon: <HandsPraying weight="fill" size={24} /> },
  { name: 'Perfect', icon: <StarFour weight="fill" size={24} /> },
];
```

### When Emojis Are Acceptable

- User-generated content (chat messages, comments)
- Internal/debug tools
- Prototypes that won't ship

**Never in production UI components.**

