---
name: remotion
description: Remotion programmatic video with motion design principles. Create premium, cinematic videos with React. Audio, 3D, transitions, brand storytelling.
last_updated: 2026-03
owner: Frank
---

# Remotion

Create premium videos with React. Motion design thinking + code = cinematic results.

> **See also:** `agents/gsap/SKILL.md`, `agents/motion/SKILL.md`, `workflows/animation-planning/SKILL.md`

---

## What is Remotion?

Remotion lets you **write React components that render as video**. But the difference between a basic video and a premium one isn't the code—it's the motion design thinking.

**What Remotion enables:**
- **Personalized** — Generate 1000 videos with different data
- **Data-driven** — Charts that animate from real data
- **Programmatic** — API-triggered video generation
- **Premium** — When you apply motion design principles

---

## Context Questions

Before building a Remotion video:

1. **What's the story?** — What emotional journey should viewers experience?
2. **What's the pacing?** — Fast/energetic or slow/premium?
3. **What assets do you have?** — Video clips, 3D, images, audio?
4. **What's the audio strategy?** — Music sync, voiceover, sound effects?
5. **What's the visual hierarchy?** — What do viewers see first, second, third?

---

## TL;DR

| Need | Use Remotion? |
|------|---------------|
| Personalized video at scale | ✅ Perfect |
| Animated data visualization | ✅ Perfect |
| Brand storytelling content | ✅ Great with motion design |
| Social media templates | ✅ Great |
| One-off promo video | ⚠️ Overkill, use editing software |
| Live streaming | ❌ Not for this |

---

## Setup

```bash
# Create new Remotion project
npx create-video@latest my-video

cd my-video
npm start  # Opens Remotion Studio
```

---

## Project Structure

```
my-video/
├── src/
│   ├── Root.tsx           # Composition entry
│   ├── Composition.tsx    # Main video component
│   └── components/        # Reusable pieces
├── public/
│   ├── sounds/            # Audio files
│   └── assets/            # Images, videos
└── remotion.config.ts     # Render settings
```

---

# Part 1: Motion Design Principles

The 12 principles of animation adapted for Remotion. Apply these to make videos that don't look basic.

## 1. Timing & Spacing

**Principle:** The number of frames = perceived weight and emotion.

| Frames | Feeling | Use For |
|--------|---------|---------|
| 10-15 (fast) | Snappy, energetic | UI elements, social content |
| 20-30 (medium) | Balanced, natural | Most animations |
| 45-60 (slow) | Premium, luxurious | Brand reveals, cinematic |

```tsx
// FAST: Energetic popup (15 frames = 0.5s at 30fps)
const fastScale = interpolate(frame, [0, 15], [0, 1], {
  easing: Easing.out(Easing.back(1.5)),
  extrapolateRight: "clamp",
})

// SLOW: Premium reveal (60 frames = 2s at 30fps)
const slowOpacity = interpolate(frame, [0, 60], [0, 1], {
  easing: Easing.inOut(Easing.cubic),
  extrapolateRight: "clamp",
})
```

## 2. Anticipation

**Principle:** Prepare the viewer for what's coming.

```tsx
// Pull back before launching forward
const anticipation = spring({
  frame,
  fps,
  config: { damping: 8, stiffness: 100 },
  delay: 0,
})

// Scale dips to 0.9 BEFORE expanding to 1.1
const scale = interpolate(
  frame,
  [0, 8, 20],
  [1, 0.9, 1.1],
  { extrapolateRight: "clamp" }
)
```

## 3. Follow-Through & Overlapping Action

**Principle:** Different parts move at different times.

```tsx
// Parent moves first, children follow with delays
const parentY = spring({ frame, fps, config: { damping: 12 } })

// Child delays slightly and has different physics
const childY = spring({
  frame: frame - 5, // 5 frame delay
  fps,
  config: { damping: 8, stiffness: 80 }, // More bouncy
})
```

## 4. Staging

**Principle:** Direct viewer attention to what matters most.

```tsx
// Primary element: Full animation, high contrast
const primaryOpacity = interpolate(frame, [0, 20], [0, 1])
const primaryScale = interpolate(frame, [0, 20], [0.9, 1])

// Secondary elements: Subtle, delayed, smaller motion
const secondaryOpacity = interpolate(frame, [15, 35], [0, 0.7])
const secondaryScale = interpolate(frame, [15, 35], [0.95, 1])
```

## 5. Exaggeration

**Principle:** Push motion beyond realistic to create impact.

```tsx
// Overshoot for punch
const scale = spring({
  frame,
  fps,
  config: {
    damping: 6,      // Low damping = more overshoot
    stiffness: 150,  // High stiffness = snappy
    mass: 0.5,       // Low mass = responsive
  },
})

// Extreme position change for drama
const y = interpolate(frame, [0, 30], [200, 0], {
  easing: Easing.out(Easing.expo),
})
```

---

# Part 2: Timing & Easing Mastery

## Easing Reference

| Easing | Personality | Use For |
|--------|-------------|---------|
| `linear` | Robotic, mechanical | Progress bars, loading |
| `Easing.cubic` | Natural, default | General purpose |
| `Easing.quad` | Gentle, subtle | Fades, opacity |
| `Easing.expo` | Dramatic, punchy | Hero reveals, impact |
| `Easing.back` | Playful, bouncy | Buttons, UI elements |
| `spring()` | Organic, alive | Natural motion |

## Premium Easing Patterns

```tsx
import { Easing, interpolate, spring } from "remotion"

// CINEMATIC REVEAL: Slow start, dramatic finish
const cinematicY = interpolate(frame, [0, 45], [100, 0], {
  easing: Easing.out(Easing.expo),
})

// LUXURY FADE: Ultra-slow, smooth
const luxuryOpacity = interpolate(frame, [0, 60], [0, 1], {
  easing: Easing.inOut(Easing.sine),
})

// ENERGETIC POP: Fast in, slight overshoot
const energeticScale = spring({
  frame,
  fps,
  config: { damping: 8, stiffness: 200, mass: 0.5 },
})

// CUSTOM BEZIER: Brand-specific curve
const customEasing = Easing.bezier(0.25, 0.1, 0.25, 1.0)
const brandMotion = interpolate(frame, [0, 30], [0, 1], {
  easing: customEasing,
})
```

## Frame Timing Psychology

```tsx
const { fps } = useVideoConfig()

// Convert seconds to frames
const seconds = (s: number) => Math.round(s * fps)

// Timing constants
const INSTANT = seconds(0.1)      // 3 frames - imperceptible
const FAST = seconds(0.3)         // 9 frames - snappy
const NORMAL = seconds(0.5)       // 15 frames - natural
const SLOW = seconds(0.8)         // 24 frames - deliberate
const DRAMATIC = seconds(1.5)     // 45 frames - cinematic
const LUXURIOUS = seconds(2.5)    // 75 frames - premium
```

---

# Part 3: Visual Hierarchy in Motion

## Stagger Patterns

```tsx
// STAGGER: Sequential reveal with delay
const StaggeredList: React.FC<{ items: string[] }> = ({ items }) => {
  const frame = useCurrentFrame()
  
  return (
    <div>
      {items.map((item, i) => {
        const staggerDelay = i * 8 // 8 frames between each
        const opacity = interpolate(
          frame - staggerDelay,
          [0, 20],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        )
        const x = interpolate(
          frame - staggerDelay,
          [0, 20],
          [-50, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
        )
        
        return (
          <div key={i} style={{ opacity, transform: `translateX(${x}px)` }}>
            {item}
          </div>
        )
      })}
    </div>
  )
}
```

## Text Reveal Hierarchy

```tsx
// Headline → Subhead → CTA (proper visual hierarchy)
export const TextReveal: React.FC = () => {
  const frame = useCurrentFrame()
  
  // HEADLINE: First, dramatic
  const headlineOpacity = interpolate(frame, [0, 30], [0, 1])
  const headlineY = interpolate(frame, [0, 30], [40, 0], {
    easing: Easing.out(Easing.expo),
  })
  
  // SUBHEAD: Second, subtle
  const subheadOpacity = interpolate(frame, [20, 45], [0, 1])
  const subheadY = interpolate(frame, [20, 45], [20, 0], {
    easing: Easing.out(Easing.cubic),
  })
  
  // CTA: Last, attention-grabbing
  const ctaOpacity = interpolate(frame, [40, 55], [0, 1])
  const ctaScale = spring({
    frame: frame - 40,
    fps: 30,
    config: { damping: 10, stiffness: 150 },
  })
  
  return (
    <AbsoluteFill className="flex flex-col items-center justify-center">
      <h1 style={{ opacity: headlineOpacity, transform: `translateY(${headlineY}px)` }}>
        Bold Headline
      </h1>
      <p style={{ opacity: subheadOpacity, transform: `translateY(${subheadY}px)` }}>
        Supporting subhead text
      </p>
      <button style={{ opacity: ctaOpacity, transform: `scale(${Math.max(0, ctaScale)})` }}>
        Call to Action
      </button>
    </AbsoluteFill>
  )
}
```

---

# Part 4: Audio & Sound Design

## Setup Audio

```bash
npm install @remotion/media-utils
```

## Basic Audio

```tsx
import { Audio, staticFile } from "remotion"

export const VideoWithAudio = () => {
  return (
    <AbsoluteFill>
      {/* Background music */}
      <Audio
        src={staticFile("sounds/background-music.mp3")}
        volume={0.3}
      />
      
      {/* Sound effect at specific time */}
      <Sequence from={30}>
        <Audio
          src={staticFile("sounds/whoosh.mp3")}
          volume={0.8}
        />
      </Sequence>
      
      {/* Your visual content */}
      <MyVisualContent />
    </AbsoluteFill>
  )
}
```

## Volume Automation

```tsx
import { Audio, interpolate, useCurrentFrame } from "remotion"

export const DynamicVolume = () => {
  const frame = useCurrentFrame()
  
  // Fade in music over first 30 frames
  const musicVolume = interpolate(frame, [0, 30], [0, 0.5], {
    extrapolateRight: "clamp",
  })
  
  // Duck music when voiceover plays (frames 60-120)
  const duckedVolume = interpolate(
    frame,
    [55, 60, 115, 120],
    [0.5, 0.15, 0.15, 0.5],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  )
  
  return (
    <>
      <Audio
        src={staticFile("sounds/music.mp3")}
        volume={frame < 60 ? musicVolume : duckedVolume}
      />
      <Sequence from={60} durationInFrames={60}>
        <Audio src={staticFile("sounds/voiceover.mp3")} volume={1} />
      </Sequence>
    </>
  )
}
```

## Audio Visualization

```tsx
import { useAudioData, visualizeAudio } from "@remotion/media-utils"
import { useCurrentFrame, useVideoConfig, staticFile } from "remotion"

export const AudioVisualizer: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const audioData = useAudioData(staticFile("sounds/music.mp3"))
  
  if (!audioData) return null
  
  // Get frequency data for current frame
  const visualization = visualizeAudio({
    fps,
    frame,
    audioData,
    numberOfSamples: 32, // Number of frequency bars
  })
  
  return (
    <div className="flex items-end justify-center gap-1 h-64">
      {visualization.map((amplitude, i) => (
        <div
          key={i}
          className="w-4 bg-blue-500 rounded-t"
          style={{ height: `${amplitude * 100}%` }}
        />
      ))}
    </div>
  )
}
```

## Beat Sync Technique

```tsx
// Define beat timestamps (in frames at 30fps)
const BEATS = [0, 15, 30, 45, 60, 75, 90] // Every 0.5 seconds

export const BeatSyncAnimation: React.FC = () => {
  const frame = useCurrentFrame()
  
  // Find which beat we're on
  const currentBeatIndex = BEATS.filter(beat => frame >= beat).length - 1
  const currentBeat = BEATS[currentBeatIndex] || 0
  const framesSinceBeat = frame - currentBeat
  
  // Pulse on each beat
  const beatPulse = interpolate(
    framesSinceBeat,
    [0, 8],
    [1.2, 1],
    { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  )
  
  return (
    <div style={{ transform: `scale(${beatPulse})` }}>
      <Logo />
    </div>
  )
}
```

---

# Part 5: Working with Video Assets

## Basic Video

```tsx
import { Video, OffthreadVideo, staticFile } from "remotion"

// Standard video (plays in sync with composition)
export const VideoClip = () => (
  <Video
    src={staticFile("assets/footage.mp4")}
    style={{ width: "100%", height: "100%" }}
  />
)

// Offthread video (better performance for background videos)
export const BackgroundVideo = () => (
  <OffthreadVideo
    src={staticFile("assets/background.mp4")}
    style={{ objectFit: "cover", width: "100%", height: "100%" }}
  />
)
```

## Video with Overlay

```tsx
export const VideoWithOverlay = () => {
  const frame = useCurrentFrame()
  const textOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateRight: "clamp",
  })
  
  return (
    <AbsoluteFill>
      {/* Background video */}
      <OffthreadVideo
        src={staticFile("assets/cinematic-bg.mp4")}
        style={{ objectFit: "cover", width: "100%", height: "100%" }}
      />
      
      {/* Darkening overlay */}
      <AbsoluteFill style={{ backgroundColor: "rgba(0,0,0,0.4)" }} />
      
      {/* Text overlay */}
      <AbsoluteFill className="flex items-center justify-center">
        <h1
          style={{ opacity: textOpacity }}
          className="text-white text-8xl font-bold"
        >
          Your Message
        </h1>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
```

## Video Transitions

```tsx
import { TransitionSeries, linearTiming } from "@remotion/transitions"
import { fade } from "@remotion/transitions/fade"
import { slide } from "@remotion/transitions/slide"

export const VideoMontage = () => (
  <TransitionSeries>
    <TransitionSeries.Sequence durationInFrames={90}>
      <Video src={staticFile("assets/clip1.mp4")} />
    </TransitionSeries.Sequence>
    
    <TransitionSeries.Transition
      presentation={fade()}
      timing={linearTiming({ durationInFrames: 15 })}
    />
    
    <TransitionSeries.Sequence durationInFrames={90}>
      <Video src={staticFile("assets/clip2.mp4")} />
    </TransitionSeries.Sequence>
    
    <TransitionSeries.Transition
      presentation={slide({ direction: "from-left" })}
      timing={linearTiming({ durationInFrames: 20 })}
    />
    
    <TransitionSeries.Sequence durationInFrames={90}>
      <Video src={staticFile("assets/clip3.mp4")} />
    </TransitionSeries.Sequence>
  </TransitionSeries>
)
```

---

# Part 6: 3D Integration

## Setup Three.js

```bash
npm install three @react-three/fiber @remotion/three @types/three
```

## Basic 3D Scene

```tsx
import { ThreeCanvas } from "@remotion/three"
import { useCurrentFrame } from "remotion"

const RotatingBox = () => {
  const frame = useCurrentFrame()
  const rotation = (frame / 60) * Math.PI * 2 // Full rotation every 2 seconds
  
  return (
    <mesh rotation={[0, rotation, 0]}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#6366f1" />
    </mesh>
  )
}

export const ThreeDScene = () => (
  <ThreeCanvas>
    <ambientLight intensity={0.5} />
    <directionalLight position={[10, 10, 5]} intensity={1} />
    <RotatingBox />
  </ThreeCanvas>
)
```

## Product Reveal 3D

```tsx
import { ThreeCanvas } from "@remotion/three"
import { useCurrentFrame, spring, useVideoConfig } from "remotion"

const ProductModel = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  
  // Animate rotation
  const rotationY = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 50 },
  }) * Math.PI * 0.5
  
  // Animate scale (grow in)
  const scale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
  })
  
  return (
    <mesh rotation={[0, rotationY, 0]} scale={scale}>
      {/* Replace with your 3D model using useGLTF */}
      <boxGeometry args={[2, 3, 0.3]} />
      <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
    </mesh>
  )
}

export const ProductReveal3D = () => (
  <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
    <ThreeCanvas camera={{ position: [0, 0, 5] }}>
      <ambientLight intensity={0.3} />
      <spotLight position={[5, 5, 5]} intensity={1} angle={0.3} />
      <ProductModel />
    </ThreeCanvas>
  </AbsoluteFill>
)
```

---

# Part 7: Brand Storytelling

## Narrative Structure

Structure your video with emotional pacing:

| Section | Frames | Purpose |
|---------|--------|---------|
| **Hook** | 0-30 | Grab attention immediately |
| **Problem** | 30-90 | Create tension, show pain point |
| **Solution** | 90-180 | Reveal your answer |
| **Proof** | 180-240 | Data, testimonials, results |
| **CTA** | 240-300 | Clear next step |

## Story-Driven Template

```tsx
export const BrandStory: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* ACT 1: Hook - Bold statement */}
      <Sequence from={0} durationInFrames={30}>
        <HookScene />
      </Sequence>
      
      {/* ACT 2: Problem - Create tension */}
      <Sequence from={30} durationInFrames={60}>
        <ProblemScene />
      </Sequence>
      
      {/* ACT 3: Solution - The reveal */}
      <Sequence from={90} durationInFrames={90}>
        <SolutionScene />
      </Sequence>
      
      {/* ACT 4: Proof - Build trust */}
      <Sequence from={180} durationInFrames={60}>
        <ProofScene />
      </Sequence>
      
      {/* ACT 5: CTA - Call to action */}
      <Sequence from={240}>
        <CTAScene />
      </Sequence>
    </AbsoluteFill>
  )
}
```

## Pre-Production Checklist

Before coding, answer these:

```
BRAND VIDEO PLANNING

Story:
□ What's the one key message?
□ What emotion should viewers feel?
□ What action should they take?

Visual Identity:
□ Primary brand colors: _______________
□ Typography: _______________
□ Logo placement: _______________
□ Visual style (minimal/bold/organic): _______________

Audio:
□ Music mood: _______________
□ Voiceover Y/N: _______________
□ Sound effects style: _______________

Assets Needed:
□ Product shots: _______________
□ Background footage: _______________
□ Icons/graphics: _______________
□ Customer testimonials: _______________
```

---

# Part 8: Premium Video Patterns

## Cinematic Text Reveal

```tsx
export const CinematicTitle: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame()
  const words = text.split(" ")
  
  return (
    <AbsoluteFill className="flex items-center justify-center bg-black">
      <h1 className="text-white text-8xl font-bold flex gap-4">
        {words.map((word, i) => {
          const delay = i * 12
          const opacity = interpolate(frame - delay, [0, 20], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
          const y = interpolate(frame - delay, [0, 20], [40, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.expo),
          })
          const blur = interpolate(frame - delay, [0, 20], [10, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
          
          return (
            <span
              key={i}
              style={{
                opacity,
                transform: `translateY(${y}px)`,
                filter: `blur(${blur}px)`,
              }}
            >
              {word}
            </span>
          )
        })}
      </h1>
    </AbsoluteFill>
  )
}
```

## Animated Data Counter

```tsx
export const AnimatedStat: React.FC<{
  value: number
  label: string
  suffix?: string
}> = ({ value, label, suffix = "" }) => {
  const frame = useCurrentFrame()
  
  const animatedValue = interpolate(frame, [0, 60], [0, value], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  })
  
  const opacity = interpolate(frame, [0, 20], [0, 1])
  const scale = spring({
    frame,
    fps: 30,
    config: { damping: 15, stiffness: 100 },
  })
  
  return (
    <div
      className="text-center"
      style={{ opacity, transform: `scale(${scale})` }}
    >
      <div className="text-7xl font-bold text-white">
        {Math.round(animatedValue).toLocaleString()}{suffix}
      </div>
      <div className="text-xl text-white/70 mt-2">{label}</div>
    </div>
  )
}
```

## Logo Sting

```tsx
export const LogoSting: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  
  // Phase 1: Logo scales in with overshoot
  const logoScale = spring({
    frame,
    fps,
    config: { damping: 8, stiffness: 150 },
  })
  
  // Phase 2: Glow pulse
  const glowOpacity = interpolate(frame, [20, 35, 50], [0, 0.8, 0], {
    extrapolateRight: "clamp",
  })
  
  // Phase 3: Tagline fade in
  const taglineOpacity = interpolate(frame, [40, 55], [0, 1], {
    extrapolateRight: "clamp",
  })
  
  return (
    <AbsoluteFill className="flex flex-col items-center justify-center bg-black">
      <div style={{ position: "relative" }}>
        {/* Glow effect */}
        <div
          style={{
            position: "absolute",
            inset: -40,
            background: "radial-gradient(circle, rgba(99,102,241,0.5) 0%, transparent 70%)",
            opacity: glowOpacity,
            filter: "blur(20px)",
          }}
        />
        
        {/* Logo */}
        <Img
          src={staticFile("assets/logo.svg")}
          style={{ transform: `scale(${logoScale})`, width: 200 }}
        />
      </div>
      
      {/* Tagline */}
      <p
        className="text-white/80 text-2xl mt-8"
        style={{ opacity: taglineOpacity }}
      >
        Your tagline here
      </p>
      
      {/* Sound effect on logo appear */}
      <Audio src={staticFile("sounds/logo-whoosh.mp3")} volume={0.6} />
    </AbsoluteFill>
  )
}
```

---

# Part 9: Color & Visual Treatment

## CSS Filter Chains

```tsx
// CINEMATIC LOOK: Slightly desaturated, high contrast
<div style={{ filter: "saturate(0.85) contrast(1.1)" }}>
  <Video src={staticFile("assets/footage.mp4")} />
</div>

// WARM VINTAGE: Sepia tint
<div style={{ filter: "sepia(0.2) saturate(1.1) brightness(1.05)" }}>
  <Content />
</div>

// MOODY DARK: Dark, desaturated, blue tint
<div style={{
  filter: "saturate(0.7) contrast(1.15) brightness(0.9)",
  backgroundColor: "rgba(0, 10, 30, 0.2)",
}}>
  <Content />
</div>
```

## Animated Gradients

```tsx
export const AnimatedGradientBg: React.FC = () => {
  const frame = useCurrentFrame()
  
  // Rotate gradient over time
  const angle = interpolate(frame, [0, 300], [0, 360])
  
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${angle}deg, 
          hsl(260, 80%, 20%) 0%, 
          hsl(220, 70%, 15%) 50%, 
          hsl(280, 60%, 25%) 100%)`,
      }}
    />
  )
}
```

## Color Palette System

```tsx
// Define brand colors as constants
const COLORS = {
  primary: "hsl(250, 80%, 60%)",      // Vibrant purple
  secondary: "hsl(200, 70%, 50%)",    // Ocean blue
  accent: "hsl(320, 70%, 55%)",       // Magenta
  background: "hsl(240, 20%, 8%)",    // Near-black
  foreground: "hsl(0, 0%, 98%)",      // Off-white
  muted: "hsl(240, 10%, 40%)",        // Gray
}

// Consistent use throughout video
<AbsoluteFill style={{ backgroundColor: COLORS.background }}>
  <h1 style={{ color: COLORS.foreground }}>Title</h1>
  <p style={{ color: COLORS.muted }}>Subtitle</p>
  <button style={{ backgroundColor: COLORS.primary }}>CTA</button>
</AbsoluteFill>
```

---

# Part 10: Rendering & Deployment

## Local Render

```bash
# Preview in browser
npm start

# Render to MP4
npx remotion render src/index.ts MyVideo out/video.mp4

# With custom props
npx remotion render src/index.ts MyVideo out/video.mp4 --props='{"name": "Frank"}'

# Different quality
npx remotion render src/index.ts MyVideo out/video.mp4 --crf=18  # Higher quality
```

## Batch Rendering

```typescript
// scripts/batch-render.ts
import { bundle } from "@remotion/bundler"
import { renderMedia, selectComposition } from "@remotion/renderer"

const users = [
  { id: 1, name: "Alice", metric: 1250 },
  { id: 2, name: "Bob", metric: 3400 },
  { id: 3, name: "Charlie", metric: 890 },
]

async function renderAll() {
  const bundled = await bundle(require.resolve("./src/index.ts"))

  for (const user of users) {
    const composition = await selectComposition({
      serveUrl: bundled,
      id: "PersonalizedVideo",
      inputProps: user,
    })

    await renderMedia({
      composition,
      serveUrl: bundled,
      codec: "h264",
      outputLocation: `out/${user.id}-${user.name}.mp4`,
      inputProps: user,
    })

    console.log(`✓ Rendered video for ${user.name}`)
  }
}

renderAll()
```

## Remotion Lambda

```bash
# Deploy to AWS Lambda
npx remotion lambda sites create src/index.ts --site-name=my-video

# Render via API
npx remotion lambda render my-video MyVideo --props='{"name":"Frank"}'
```

---

# Part 11: Kinetic Typography Workflow

Professional kinetic text requires a structured workflow.

## The Professional Workflow

```
KINETIC TEXT WORKFLOW

1. SCRIPT & HIERARCHY
   □ Mark PRIMARY phrases (bold animation)
   □ Mark SECONDARY phrases (supporting motion)
   □ Mark STATIC elements (minimal/no motion)

2. STORYBOARD
   □ Sketch 4-6 key frames
   □ Map text positions at each moment
   □ Define transition types

3. BUILD IN LAYERS
   □ Background first
   □ Supporting text second
   □ Primary text last

4. TIME TO AUDIO
   □ Import voiceover/music early
   □ Align key text to audio markers
   □ Refine timing by ear
```

## Typography Best Practices

| Do | Don't |
|----|-------|
| Use clean sans-serif fonts (Inter, Roboto) | Use decorative fonts in motion |
| Maintain strong contrast | Low contrast text |
| Keep text visible 0.5s+ after landing | Flash text too quickly |
| Limit to 2 font families | Mix many different fonts |
| Use size/weight for hierarchy | All text same size |

## Kinetic Text Component

```tsx
export const KineticText: React.FC<{
  text: string
  style: "word-by-word" | "character-by-character" | "line-by-line"
}> = ({ text, style }) => {
  const frame = useCurrentFrame()
  
  const elements = style === "character-by-character" 
    ? text.split("") 
    : style === "word-by-word" 
    ? text.split(" ") 
    : [text]
  
  const delayPerElement = style === "character-by-character" ? 2 : 8
  
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {elements.map((el, i) => {
        const delay = i * delayPerElement
        const progress = Math.max(0, (frame - delay) / 15)
        const opacity = Math.min(1, progress)
        const y = interpolate(progress, [0, 1], [20, 0], {
          extrapolateRight: "clamp",
        })
        
        return (
          <span
            key={i}
            style={{
              opacity,
              transform: `translateY(${y}px)`,
              display: "inline-block",
            }}
          >
            {el}{style === "word-by-word" ? " " : ""}
          </span>
        )
      })}
    </div>
  )
}
```

---

# Part 12: Async Data Loading

Use `delayRender()` and `continueRender()` when videos depend on external data.

## The Pattern

```tsx
import { delayRender, continueRender } from "remotion"
import { useEffect, useState } from "react"

export const DataDrivenVideo: React.FC = () => {
  const [data, setData] = useState<UserStats | null>(null)
  const [handle] = useState(() => delayRender("Loading user stats..."))
  
  useEffect(() => {
    fetchUserStats()
      .then((result) => {
        setData(result)
        continueRender(handle) // ← Signals: "OK to render now"
      })
      .catch((err) => {
        console.error(err)
        continueRender(handle) // ← Must call even on error
      })
  }, [handle])
  
  if (!data) return null
  
  return (
    <AbsoluteFill>
      <AnimatedStat value={data.totalUsers} label="Users" />
    </AbsoluteFill>
  )
}
```

## Multiple Async Operations

```tsx
const DataVideo: React.FC = () => {
  const [userData, setUserData] = useState(null)
  const [chartData, setChartData] = useState(null)
  
  const [handleUser] = useState(() => delayRender("User data"))
  const [handleChart] = useState(() => delayRender("Chart data"))
  
  useEffect(() => {
    fetchUser().then((d) => { setUserData(d); continueRender(handleUser) })
  }, [handleUser])
  
  useEffect(() => {
    fetchChart().then((d) => { setChartData(d); continueRender(handleChart) })
  }, [handleChart])
  
  if (!userData || !chartData) return null
  
  return <Content userData={userData} chartData={chartData} />
}
```

---

# Part 13: Lottie Animations

Embed vector animations from LottieFiles for complex graphics without heavy rendering.

## Setup

```bash
npm install @remotion/lottie lottie-web
```

## Using Lottie

```tsx
import { Lottie, LottieAnimationData } from "@remotion/lottie"
import { useEffect, useState } from "react"
import { delayRender, continueRender, staticFile } from "remotion"

export const LottieAnimation: React.FC = () => {
  const [animationData, setAnimationData] = useState<LottieAnimationData | null>(null)
  const [handle] = useState(() => delayRender("Loading Lottie"))
  
  useEffect(() => {
    fetch(staticFile("animations/success-check.json"))
      .then((res) => res.json())
      .then((data) => {
        setAnimationData(data)
        continueRender(handle)
      })
  }, [handle])
  
  if (!animationData) return null
  
  return (
    <Lottie
      animationData={animationData}
      style={{ width: 300, height: 300 }}
    />
  )
}
```

## Control Lottie Playback

```tsx
// Play specific segment
<Lottie
  animationData={animationData}
  playbackRate={1.5}  // Speed up
  direction="forward" // or "backward"
/>
```

---

# Part 14: Captions & Subtitles

Professional videos need captions for accessibility and engagement.

## Manual Captions

```tsx
interface Caption {
  text: string
  startFrame: number
  endFrame: number
}

const captions: Caption[] = [
  { text: "Welcome to our platform", startFrame: 0, endFrame: 60 },
  { text: "Let me show you what's new", startFrame: 65, endFrame: 120 },
  { text: "Here's our latest feature", startFrame: 125, endFrame: 180 },
]

export const CaptionedVideo: React.FC = () => {
  const frame = useCurrentFrame()
  
  const currentCaption = captions.find(
    (c) => frame >= c.startFrame && frame <= c.endFrame
  )
  
  return (
    <AbsoluteFill>
      <MainContent />
      
      {/* Caption overlay */}
      {currentCaption && (
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: 0,
            right: 0,
            textAlign: "center",
          }}
        >
          <span
            style={{
              backgroundColor: "rgba(0,0,0,0.75)",
              color: "white",
              padding: "8px 16px",
              borderRadius: 4,
              fontSize: 24,
            }}
          >
            {currentCaption.text}
          </span>
        </div>
      )}
    </AbsoluteFill>
  )
}
```

## Import SRT Files

```tsx
// Use @remotion/captions for SRT parsing
import { parseSrt } from "@remotion/captions"

const srtContent = `
1
00:00:00,000 --> 00:00:02,000
Welcome to our platform

2
00:00:02,100 --> 00:00:04,000
Let me show you around
`

const captions = parseSrt({ input: srtContent })
```

---

# Part 15: Accessibility

Professional videos consider all viewers.

## Accessibility Checklist

```
□ Captions for all spoken content
□ Text visible for 0.5s+ minimum after landing
□ No flashing effects exceeding 3Hz
□ High contrast text (4.5:1 ratio minimum)
□ Don't rely on color alone to convey meaning
□ Provide audio descriptions where needed
□ Motion should not trigger vestibular issues
```

## Reduce Motion Option

```tsx
// Offer a reduced motion version
export const AccessibleVideo: React.FC<{ reduceMotion?: boolean }> = ({
  reduceMotion = false,
}) => {
  const frame = useCurrentFrame()
  
  // Simplified animation for reduce motion
  const opacity = reduceMotion
    ? (frame > 10 ? 1 : 0)  // Simple fade
    : interpolate(frame, [0, 30], [0, 1], {
        easing: Easing.out(Easing.expo),
      })
  
  const y = reduceMotion
    ? 0  // No movement
    : interpolate(frame, [0, 30], [50, 0], {
        easing: Easing.out(Easing.expo),
      })
  
  return (
    <div style={{ opacity, transform: `translateY(${y}px)` }}>
      <Content />
    </div>
  )
}
```

---

## Performance Tips

1. **Use `staticFile()`** for assets in `/public`
2. **Use `<OffthreadVideo>`** for background videos
3. **Preload fonts** with `@remotion/google-fonts`
4. **Keep compositions modular** — split into sequences
5. **Use Lambda** for parallel batch rendering
6. **Cache bundled output** for repeated renders
7. **Optimize images** — use WebP, compress

---

## Resources

- **Official Docs:** https://www.remotion.dev/docs
- **Examples:** https://github.com/remotion-dev/remotion/tree/main/packages/example
- **Transitions:** https://www.remotion.dev/docs/transitions
- **Three.js:** https://www.remotion.dev/docs/three
- **Audio:** https://www.remotion.dev/docs/audio
- **Lambda:** https://www.remotion.dev/docs/lambda
- **Discord:** https://remotion.dev/discord

---

## Related Skills

- `agents/gsap/SKILL.md` — Web animations
- `agents/motion/SKILL.md` — React animations  
- `agents/video-scroll/SKILL.md` — Scroll-driven video
- `workflows/animation-planning/SKILL.md` — Plan before you build
