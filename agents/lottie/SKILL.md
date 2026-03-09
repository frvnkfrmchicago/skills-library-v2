---
name: lottie
description: Lottie animations. Pre-made icon animations, loading states, micro-interactions. LottieFiles library.
last_updated: 2026-03
owner: Frank
---

# Lottie

Pre-made animations. Export from After Effects or get from LottieFiles.

> **See also:** `agents/rive/SKILL.md`, `agents/motion/SKILL.md`

---

## TL;DR

| Need | Use Lottie? |
|------|-------------|
| Pre-made icon animation | ✅ Perfect |
| Loading spinner | ✅ Great |
| Success checkmark | ✅ Great |
| Interactive animation | ⚠️ Limited, use Rive |
| Custom complex animation | ⚠️ Need After Effects skills |

---

## What is Lottie?

Lottie = JSON-based animation format

- **Tiny file sizes** (usually <50KB)
- **Scalable** (vector-based)
- **Cross-platform** (web, iOS, Android)
- **No code needed** — just play/pause

---

## Setup

```bash
# React (recommended)
npm install lottie-react

# Vanilla JS
npm install lottie-web
```

---

## Basic Usage (React)

```tsx
import Lottie from "lottie-react"
import successAnimation from "./animations/success.json"

export function SuccessAnimation() {
  return (
    <Lottie
      animationData={successAnimation}
      loop={false}
      className="w-32 h-32"
    />
  )
}
```

---

## With Controls

```tsx
import Lottie, { LottieRefCurrentProps } from "lottie-react"
import { useRef } from "react"

export function ControlledAnimation() {
  const lottieRef = useRef<LottieRefCurrentProps>(null)

  return (
    <div>
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={true}
        autoplay={false}
      />
      
      <button onClick={() => lottieRef.current?.play()}>Play</button>
      <button onClick={() => lottieRef.current?.pause()}>Pause</button>
      <button onClick={() => lottieRef.current?.stop()}>Stop</button>
      <button onClick={() => lottieRef.current?.setSpeed(2)}>2x Speed</button>
    </div>
  )
}
```

---

## Hover Animation

```tsx
import Lottie from "lottie-react"
import { useRef } from "react"

export function HoverAnimation() {
  const lottieRef = useRef(null)

  return (
    <div
      onMouseEnter={() => lottieRef.current?.play()}
      onMouseLeave={() => lottieRef.current?.stop()}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={iconAnimation}
        loop={false}
        autoplay={false}
        className="w-8 h-8"
      />
    </div>
  )
}
```

---

## Loading Button

```tsx
import Lottie from "lottie-react"
import loadingAnimation from "./loading.json"
import successAnimation from "./success.json"

export function SubmitButton({ onClick }: { onClick: () => Promise<void> }) {
  const [state, setState] = useState<"idle" | "loading" | "success">("idle")

  const handleClick = async () => {
    setState("loading")
    await onClick()
    setState("success")
    setTimeout(() => setState("idle"), 2000)
  }

  return (
    <button onClick={handleClick} className="relative w-32 h-12">
      {state === "idle" && <span>Submit</span>}
      {state === "loading" && (
        <Lottie animationData={loadingAnimation} className="w-8 h-8" />
      )}
      {state === "success" && (
        <Lottie animationData={successAnimation} loop={false} className="w-8 h-8" />
      )}
    </button>
  )
}
```

---

## From URL (LottieFiles)

```tsx
import { DotLottieReact } from "@lottiefiles/dotlottie-react"

export function FromUrl() {
  return (
    <DotLottieReact
      src="https://lottie.host/xxx/animation.lottie"
      loop
      autoplay
      style={{ width: 200, height: 200 }}
    />
  )
}
```

---

## Where to Get Animations

| Source | What It Has | Link |
|--------|-------------|------|
| **LottieFiles** | Huge library | lottiefiles.com |
| **IconScout** | Icon animations | iconscout.com/lottie |
| **Motion Elements** | Premium | motionelements.com |

---

## Common Patterns

| Pattern | File to Get |
|---------|-------------|
| Loading spinner | "loading" on LottieFiles |
| Success checkmark | "success check" |
| Error X | "error" |
| Heart like | "heart animation" |
| Confetti | "confetti" |
| Pull to refresh | "pull refresh" |

---

## Performance Tips

1. **Keep JSON small** — Simplify in After Effects
2. **Lazy load** — Don't load on initial render
3. **Stop when hidden** — Use Intersection Observer
4. **Use .lottie format** — More compressed than JSON

---

## Lottie vs Rive

| Feature | Lottie | Rive |
|---------|--------|------|
| Pre-made library | ✅ Huge | Growing |
| State machines | ❌ | ✅ |
| Interactivity | Limited | Full |
| Mouse tracking | ❌ | ✅ |
| Design tool | After Effects | Rive Editor |
| Best for | Static animations | Interactive |

---

## Resources

- **LottieFiles:** https://lottiefiles.com
- **Docs:** https://airbnb.io/lottie
- **React Package:** https://www.npmjs.com/package/lottie-react

---

## Related Skills

- `agents/rive/SKILL.md` — Interactive animations
- `agents/motion/SKILL.md` — React animations
- `agents/micro-interactions/SKILL.md` — UI feedback
