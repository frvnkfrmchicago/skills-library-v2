---
name: interactive-animating
description: >
  Builds animations that respond to user input — mouse position, scroll,
  clicks, and gestures — using Rive state machines, GSAP ScrollTrigger,
  Framer Motion springs, React Three Fiber, and Lottie. Use when implementing
  mouse-follow effects, interactive characters, scroll-driven experiences,
  gesture-based animations, cursor effects, or when user mentions interactive
  animation, state machine, parallax, or reactive motion.
---

# Interactive Animating Skill

Animation should react, not just play. The best animations respond to user
input — mouse position, scroll, clicks, gestures. That is what makes
experiences feel alive.

---

## Tool Selection Matrix

| Effect | Best Tool | Why |
|--------|-----------|-----|
| Mouse-following element | **Rive** | State machine inputs |
| Eyes that track cursor | **Rive** | lookX/lookY inputs |
| Scroll parallax | **GSAP ScrollTrigger** | Precise scrub control |
| Scroll progress bar | **Framer Motion useScroll** | React integration |
| Character with states | **Rive** | Visual state machine |
| Icon micro-animation | **Lottie** | Pre-made library |
| 3D floating shapes | **R3F + Drei** | Float component |
| Complex timeline | **GSAP** | Best timeline API |
| Layout animations | **Framer Motion** | layout prop |
| Magnetic buttons | **CSS + Framer Motion** | Simple, performant |
| Elastic/spring motion | **Framer Motion** | Physics built-in |
| React Native gestures | **Reanimated + Gesture Handler** | Native performance |

---

## Mouse-Follow Effects

### Eyes That Track Cursor (Rive)

```tsx
import { useRive, useStateMachineInput } from "@rive-app/react-canvas"

export function TrackingEyes() {
  const { rive, RiveComponent } = useRive({
    src: "/animations/eyes.riv",
    stateMachines: "LookAround",
    autoplay: true,
  })

  const lookX = useStateMachineInput(rive, "LookAround", "lookX")
  const lookY = useStateMachineInput(rive, "LookAround", "lookY")

  const handleMouseMove = (e: MouseEvent) => {
    const x = (e.clientX / window.innerWidth) * 200 - 100
    const y = (e.clientY / window.innerHeight) * 200 - 100
    lookX && (lookX.value = x)
    lookY && (lookY.value = y)
  }

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [lookX, lookY])

  return <RiveComponent />
}
```

### Magnetic Button (Framer Motion)

```tsx
const MagneticButton = ({ children }) => {
  const ref = useRef(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    setPosition({
      x: (e.clientX - centerX) * 0.3,
      y: (e.clientY - centerY) * 0.3,
    })
  }

  return (
    <motion.button
      ref={ref}
      animate={position}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setPosition({ x: 0, y: 0 })}
    >
      {children}
    </motion.button>
  )
}
```

### Parallax Layers (GSAP)

```tsx
useGSAP(() => {
  gsap.to(".layer-1", { y: "-20%", scrollTrigger: { scrub: 1 } })
  gsap.to(".layer-2", { y: "-40%", scrollTrigger: { scrub: 1 } })
  gsap.to(".layer-3", { y: "-60%", scrollTrigger: { scrub: 1 } })
})
```

---

## Scroll-Driven Experiences

### Progress Bar (Framer Motion)

```tsx
import { motion, useScroll } from "motion/react"

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  return (
    <motion.div
      className="fixed top-0 left-0 h-1 bg-blue-500 origin-left"
      style={{ scaleX: scrollYProgress }}
    />
  )
}
```

### Pinned Section with Scrub (GSAP)

```tsx
useGSAP(() => {
  gsap.timeline({
    scrollTrigger: {
      trigger: ".container",
      pin: true,
      scrub: 1,
      start: "top top",
      end: "+=200%",
    }
  })
  .to(".card-1", { x: "-100%", opacity: 0 })
  .to(".card-2", { x: 0, opacity: 1 })
  .to(".card-3", { x: 0, opacity: 1 })
})
```

---

## Character Animation (Rive State Machine)

### Mascot States

```
STATES:
- idle: Subtle breathing animation
- wave: Waves when user hovers
- celebrate: Confetti on form success
- sad: When error occurs
- thinking: During loading

IMPLEMENTATION:
1. Design in Rive Editor with state machine
2. Create boolean/trigger inputs for each transition
3. Fire states from React based on app events
```

### Interactive Mascot Template

```tsx
export function Mascot({ mood }: { mood: "idle" | "happy" | "sad" | "thinking" }) {
  const { rive, RiveComponent } = useRive({
    src: "/animations/mascot.riv",
    stateMachines: "MoodMachine",
    autoplay: true,
  })

  const moodInput = useStateMachineInput(rive, "MoodMachine", "mood")

  useEffect(() => {
    if (moodInput) {
      const moodMap = { idle: 0, happy: 1, sad: 2, thinking: 3 }
      moodInput.value = moodMap[mood]
    }
  }, [mood, moodInput])

  return <RiveComponent />
}
```

---

## Cool Effects Reference

### Cursor Glow

```css
.glow-cursor {
  position: fixed;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%);
  pointer-events: none;
  transform: translate(-50%, -50%);
}
```

### Spotlight Effect

```tsx
background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px,
  transparent 0%,
  rgba(0,0,0,0.8) 200px)`
```

### Text Scramble

On hover, letters scramble with random characters then resolve to real text.

### Liquid Button

```css
.liquid-button:hover .blob {
  animation: blob 0.5s ease;
}
@keyframes blob {
  0%, 100% { border-radius: 8px; }
  50% { border-radius: 20px 10px 30px 15px; }
}
```

---

## Animation Categories

| Category | What | Tools |
|----------|------|-------|
| **Passive (Timeline)** | Plays on its own | Lottie, CSS keyframes, GSAP timeline |
| **Reactive (Input-Driven)** | Responds to user input | Rive, GSAP, Framer Motion, R3F |
| **Interactive (State Machine)** | Changes state on conditions | Rive (primary), Lottie (limited) |

---

## Inspiration

| Site | Study |
|------|-------|
| linear.app | Scroll animations, gradients |
| stripe.com | Subtle interactions, polish |
| vercel.com | Dark mode animations |
| raycast.com | Micro-interactions |
| rive.app/community | Interactive examples |

---

## Output Format

```markdown
## Interactive Animation: [Effect Name]

### What It Does
[Description of the experience]

### Tool Recommendation
[Primary tool and why]

### Implementation
[Code snippet]

### Enhancements
[Additional polish ideas]
```
