---
name: rive
description: Rive interactive animations. State machines, interactive graphics, loading states, games.
last_updated: 2026-03
owner: Frank
---

# Rive

Interactive animations that respond to user input. State machines, not timelines.

> **See also:** `agents/gsap/SKILL.md`, `agents/motion/SKILL.md`, `agents/lottie/SKILL.md`

---

## Context Questions

Before using Rive:

1. **What's the interaction?** — Mouse follow, click states, scroll-driven, game-like?
2. **How complex?** — Simple loop, multiple states, full state machine?
3. **Where does it live?** — Hero background, button, loading state, full-screen?
4. **Performance needs?** — Mobile-critical, desktop showcase?
5. **Design skill?** — Comfortable in Rive editor, or need pre-made assets?

---

## TL;DR

| Need | Use Rive? |
|------|-----------|
| Interactive character that reacts | ✅ Yes, perfect |
| Loading animation with states | ✅ Yes |
| Mouse-following element | ✅ Yes |
| Button with complex hover states | ✅ Yes |
| Simple fade/slide | ❌ Use Motion/CSS |
| Scroll-driven timeline | ❌ Use GSAP |
| Pre-made icon animations | ❌ Use Lottie |

---

## What Makes Rive Special

| Feature | Rive | Lottie | GSAP |
|---------|------|--------|------|
| **State machines** | ✅ Built-in | ❌ | Manual |
| **Interactivity** | ✅ Native | Limited | Manual |
| **Mouse tracking** | ✅ Easy | ❌ | Possible |
| **File size** | Very small | Small | Code-based |
| **Design tool** | Rive Editor | After Effects | Code |
| **Runtime control** | Full | Play/pause | Full |

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Complexity** | Simple loop ←→ Full state machine |
| **Interactivity** | Passive ←→ Mouse/touch reactive |
| **Design** | Pre-made assets ←→ Custom in Rive Editor |
| **Integration** | Embed ←→ Full code control |

---

## Setup

```bash
# React/Next.js
npm install @rive-app/react-canvas

# Vanilla JS
npm install @rive-app/canvas
```

---

## Basic Usage (React)

```tsx
"use client"

import { useRive } from "@rive-app/react-canvas"

export function RiveAnimation() {
  const { RiveComponent } = useRive({
    src: "/animations/character.riv",
    stateMachines: "State Machine 1",
    autoplay: true,
  })

  return (
    <div className="w-64 h-64">
      <RiveComponent />
    </div>
  )
}
```

---

## State Machine Control

```tsx
import { useRive, useStateMachineInput } from "@rive-app/react-canvas"

export function InteractiveCharacter() {
  const { rive, RiveComponent } = useRive({
    src: "/animations/character.riv",
    stateMachines: "State Machine 1",
    autoplay: true,
  })

  // Get inputs defined in Rive Editor
  const isHovering = useStateMachineInput(rive, "State Machine 1", "isHovering")
  const clickTrigger = useStateMachineInput(rive, "State Machine 1", "onClick")

  return (
    <div
      className="w-64 h-64 cursor-pointer"
      onMouseEnter={() => isHovering && (isHovering.value = true)}
      onMouseLeave={() => isHovering && (isHovering.value = false)}
      onClick={() => clickTrigger?.fire()}
    >
      <RiveComponent />
    </div>
  )
}
```

---

## Mouse Tracking

```tsx
import { useRive, useStateMachineInput } from "@rive-app/react-canvas"
import { useRef } from "react"

export function MouseFollower() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { rive, RiveComponent } = useRive({
    src: "/animations/eyes.riv",
    stateMachines: "LookAround",
    autoplay: true,
  })

  // These inputs must exist in your Rive file
  const lookX = useStateMachineInput(rive, "LookAround", "lookX")
  const lookY = useStateMachineInput(rive, "LookAround", "lookY")

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || !lookX || !lookY) return
    
    const rect = containerRef.current.getBoundingClientRect()
    // Normalize to -100 to 100 range
    const x = ((e.clientX - rect.left) / rect.width) * 200 - 100
    const y = ((e.clientY - rect.top) / rect.height) * 200 - 100
    
    lookX.value = x
    lookY.value = y
  }

  return (
    <div 
      ref={containerRef}
      className="w-full h-screen"
      onMouseMove={handleMouseMove}
    >
      <RiveComponent />
    </div>
  )
}
```

---

## Loading Button

```tsx
import { useRive, useStateMachineInput } from "@rive-app/react-canvas"
import { useState } from "react"

export function SubmitButton({ onSubmit }: { onSubmit: () => Promise<void> }) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle")
  
  const { rive, RiveComponent } = useRive({
    src: "/animations/button.riv",
    stateMachines: "ButtonStates",
    autoplay: true,
  })

  const stateInput = useStateMachineInput(rive, "ButtonStates", "state")

  const handleClick = async () => {
    if (state === "loading") return
    
    setState("loading")
    stateInput && (stateInput.value = 1) // loading state
    
    try {
      await onSubmit()
      setState("success")
      stateInput && (stateInput.value = 2) // success state
    } catch {
      setState("error")
      stateInput && (stateInput.value = 3) // error state
    }
  }

  return (
    <button onClick={handleClick} className="w-48 h-16" disabled={state === "loading"}>
      <RiveComponent />
    </button>
  )
}
```

---

## Full-Screen Hero Background

```tsx
export function HeroWithRive() {
  const { RiveComponent } = useRive({
    src: "/animations/hero-bg.riv",
    stateMachines: "Ambient",
    autoplay: true,
  })

  return (
    <section className="relative h-screen">
      {/* Rive background */}
      <div className="absolute inset-0 -z-10">
        <RiveComponent />
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <h1 className="text-6xl font-bold text-white">
          Welcome
        </h1>
      </div>
    </section>
  )
}
```

---

## Where to Get Rive Files

| Source | What It Has |
|--------|-------------|
| **Rive Community** | Free animations | rive.app/community |
| **Create your own** | Full control | rive.app (editor) |
| **Hire on Contra** | Custom work | contra.com |

---

## State Machine Inputs

| Input Type | Use For | Code |
|------------|---------|------|
| **Boolean** | Toggle states | `input.value = true` |
| **Number** | Ranges, positions | `input.value = 50` |
| **Trigger** | One-shot events | `input.fire()` |

---

## Rive vs Alternatives

| Scenario | Best Tool |
|----------|-----------|
| Character with expressions | **Rive** |
| Mouse-following eyes | **Rive** |
| Complex button states | **Rive** |
| Simple icon animation | Lottie |
| Scroll-driven parallax | GSAP |
| Layout animations | Motion |
| Video generation | Remotion |

---

## Performance Tips

```tsx
// 1. Lazy load Rive
import dynamic from "next/dynamic"
const RiveAnimation = dynamic(() => import("./RiveAnimation"), { ssr: false })

// 2. Pause when off-screen
const { rive } = useRive({ ... })
// In intersection observer:
isVisible ? rive?.play() : rive?.pause()

// 3. Use layout="fixed" for static sizes
<RiveComponent layout={new Layout({ fit: Fit.Cover })} />
```

---

## Rive Editor Tips

1. **Name your state machines** clearly
2. **Name your inputs** (isHovering, lookX, etc.)
3. **Export as .riv** (not .rev)
4. **Keep file sizes small** — optimize paths
5. **Test on mobile** — complex state machines can lag

---

## Resources

- **Rive Editor:** https://rive.app
- **Docs:** https://rive.app/docs
- **Community Files:** https://rive.app/community
- **React Docs:** https://rive.app/docs/runtimes/react
- **YouTube Tutorials:** Search "Rive animation tutorial 2025"

---

## Related Skills

- `agents/lottie/SKILL.md` — Pre-made animations
- `agents/gsap/SKILL.md` — Scroll-driven timelines
- `agents/motion/SKILL.md` — React layout animations
- `agents/micro-interactions/SKILL.md` — UI feedback
