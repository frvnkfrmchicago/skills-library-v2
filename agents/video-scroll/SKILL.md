# Video Scroll Effects

**Scroll-triggered video playback and frame scrubbing for cinematic web experiences.**

---

## Context Questions

1. **What's the effect?** — Video plays on scroll, frame scrub, or background?
2. **How much control?** — Full frame-by-frame or just trigger segments?
3. **Performance target?** — Mobile must work or desktop-only?

---

## TL;DR

| Technique | Best For |
|-----------|----------|
| **ScrollTrigger scrub** | Frame-by-frame control |
| **Intersection Observer** | Play video when visible |
| **Scroll-locked sections** | Apple-style product reveals |
| **Video as background** | Ambient hero sections |

---

## How Scroll Video Works

### The Concept

Normal video: plays at 30/60fps automatically.
Scroll video: **video.currentTime is tied to scroll position.**

As user scrolls down → video advances.
As user scrolls up → video reverses.

### Video Format Tips

```markdown
For best scroll scrubbing:
- Use MP4 (H.264) for compatibility
- 30fps is enough (more = larger file)
- Compress aggressively (Handbrake)
- Consider WebM for Chrome/Firefox
- Duration: 3-10 seconds is ideal
- Resolution: Match your container, not viewport
```

---

## Implementation Patterns

### Pattern 1: GSAP ScrollTrigger (Recommended)

```tsx
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function ScrollVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    // Wait for video metadata
    video.addEventListener('loadedmetadata', () => {
      ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true, // Ties animation to scroll
        onUpdate: (self) => {
          // self.progress goes from 0 to 1
          video.currentTime = video.duration * self.progress;
        }
      });
    });

    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, []);

  return (
    <div ref={containerRef} style={{ height: '300vh' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh' }}>
        <video
          ref={videoRef}
          src="/video.mp4"
          muted
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    </div>
  );
}
```

### Pattern 2: Play on Visibility

```tsx
import { useRef, useEffect } from 'react';

export function PlayOnView() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play();
        } else {
          video.pause();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video ref={videoRef} src="/video.mp4" muted playsInline loop />
  );
}
```

### Pattern 3: Scroll-Locked Section

```tsx
// Video plays only within a "locked" scroll section
// User scrolls but page doesn't move — video advances

export function LockedScrollVideo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    video.addEventListener('loadedmetadata', () => {
      ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: `+=${video.duration * 100}`, // 100px per second
        pin: true, // Locks the section
        scrub: 0.5,
        onUpdate: (self) => {
          video.currentTime = video.duration * self.progress;
        }
      });
    });
  }, []);

  return (
    <div ref={containerRef}>
      <video ref={videoRef} src="/product-reveal.mp4" muted playsInline />
    </div>
  );
}
```

---

## The Apple Effect

Apple uses scroll video for product pages:

1. **Sticky container** — Video stays in viewport
2. **Tall trigger section** — Scroll distance controls duration
3. **Frame scrub** — Video tied to scroll progress
4. **Text overlays** — Appear at specific progress points

```tsx
// Adding text overlays at scroll progress points
useEffect(() => {
  gsap.timeline({
    scrollTrigger: {
      trigger: container,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
    }
  })
  .to('.headline-1', { opacity: 1 }, 0.2)  // Show at 20% scroll
  .to('.headline-1', { opacity: 0 }, 0.4)  // Hide at 40%
  .to('.headline-2', { opacity: 1 }, 0.5)  // Show next at 50%
  .to('.headline-2', { opacity: 0 }, 0.7);
}, []);
```

---

## Performance Optimization

```markdown
## Critical for Mobile

□ Preload video: `<video preload="auto">`
□ Lazy load if below fold
□ Use poster image while loading
□ Compress video (Handbrake, FFmpeg)
□ Consider image sequence for very short clips

## Video Compression (FFmpeg)

```bash
ffmpeg -i input.mp4 -vcodec libx264 -crf 28 -preset slow output.mp4
```
```

---

## When NOT to Use Scroll Video

| Don't Use When | Alternative |
|----------------|-------------|
| Mobile performance is critical | Image sequence |
| Video > 10 seconds | Regular video player |
| Need sound | Traditional player |
| Very long scroll distance | Trigger-based segments |

---

## Related Skills

- `agents/gsap/SKILL.md` — GSAP patterns
- `agents/motion/SKILL.md` — Motion library
- `librarians/animation-librarian.md` — Animation patterns
- `design-innovation/DESIGN-INNOVATION.md` — Innovative visual effects and patterns
