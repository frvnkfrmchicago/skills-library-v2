---
name: gamification-design
description: >
  Enforces game mechanics, behavioral reward loops, and social platform safety.
  Covers the Hook framework, variable reward schedules (critical hit rates), and
  restricted 18+ safety gating (slider verification tracks, press-to-peek blur media).
  Use when designing streaks, progression points, reward loops, or age-restricted spaces.
---

# Gamification Design Skill

Gamification is the application of game-design elements and principles in non-game contexts. Effective gamification relies on behavioral psychology, structured reward loops, and user consent gates to drive engagement without causing fatigue.

Use this skill when implementing reward mechanics, user progression systems, variable loops, or social gating boundaries (especially in 18+ adult-restricted platforms).

---

## 1. The Hook Framework & Behavioral Loops

Gamified interactions must align with the Hook model to transition external triggers into self-sustaining internal habits.

```
       +---------------------------------------------+
       |                 1. Trigger                  |
       |  Internal (Curiosity) or External (Alert)   |
       +----------------------┬----------------------+
                              │
                              ▼
       +---------------------------------------------+
       |                 2. Action                   |
       |  Simplest user response: Scroll, Like, Tap  |
       +----------------------┬----------------------+
                              │
                              ▼
       +---------------------------------------------+
       |            3. Variable Reward               |
       | Random visual reactions, Katakana, criticals |
       +----------------------┬----------------------+
                              │
                              ▼
       +---------------------------------------------+
       |                4. Investment                |
       | User adds value (customizing profiles, data)|
       +---------------------------------------------+
```

1.  **Trigger:** An external trigger (notification, badge alert, visual cue) or internal trigger (boredom, desire for social validation) initiates action.
2.  **Action:** The minimal user behavior required in anticipation of a reward (e.g. hitting a button, scrolling past a threshold).
3.  **Variable Reward:** Providing a randomized, unpredictable payoff to stimulate dopamine spikes (see reward schedules below).
4.  **Investment:** A gesture where the user puts something back into the product (e.g. customizing a profile, inviting a friend, or saving a setting), increasing their likelihood of returning.

---

## 2. Variable Reward Schedules: The "Critical Hit" Likeloop

Predictable interactions lead to fast habituation and user boredom. To make standard social actions (like posts, comments, shares) engaging:

*   **Common Reaction (80% probability):** Standard, clean micro-bounce with color shift.
*   **Rare Reaction (15% probability):** Small floating particle splash (e.g., 5–8 floating Katakana symbols or bubbles).
*   **Critical Reaction (5% probability):** Screen shake, massive symbol explosion (30+ characters), and visual sound-effect canvas pop.

```javascript
function handleInteractionLike(x, y, particleEmitterInstance) {
  const roll = Math.random();
  
  if (roll < 0.80) {
    // Common: standard spring card bounce
    triggerCardBounce();
  } else if (roll < 0.95) {
    // Rare: small floating particle splash
    particleEmitterInstance.emit(x, y, ['ハ', 'ワ', 'オ'], 8);
  } else {
    // Critical: screen shake and massive symbol explosion
    triggerScreenShake();
    particleEmitterInstance.emit(x, y, ['笑', '爆', '神', '極', '🔥', '✨'], 30);
  }
}
```

---

## 3. User Fatigue Controls: The Motion & Telemetry Toggle

Constant animations and reward flashes can overwhelm users or exhaust device performance. All gamified loops MUST respect a global motion toggle.

*   If the user has enabled a "Reduce Motion" setting, or system-level prefers-reduced-motion is active, disable all active background loops, particle triggers, and canvas animations.

```javascript
let animationsEnabled = true;

function checkMotionPreference() {
  const userPref = localStorage.getItem('ap_disable_animations') === 'true';
  const systemPref = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  animationsEnabled = !(userPref || systemPref);
  document.documentElement.classList.toggle('disable-motion', !animationsEnabled);
}

// Check before running requestAnimationFrame loops
function updateParticles() {
  if (!animationsEnabled) return;
  // ... run emitter updates
  requestAnimationFrame(updateParticles);
}
```

---

## 4. Adult & Age-Gated Social Platforms (18+ Guardrails)

Adult social spaces require specific design rules that maintain privacy, consent, and discreet browsing.

### A. Visual Safety: The "Press-to-Peek" Media Shroud
Do not reveal sensitive content with a simple click toggle. Instead, use a **Press-to-Peek** gesture (continuous press to reveal, releasing immediately re-blurs) to keep browsing secure in semi-public locations.

```javascript
class PeekMedia {
  constructor(container) {
    this.container = container;
    this.overlay = container.querySelector('.safety-blur-overlay');
    this.media = container.querySelector('.sensitive-content');

    this.initGestures();
  }

  initGestures() {
    // Desktop Events
    this.container.addEventListener('mousedown', () => this.peekStart());
    window.addEventListener('mouseup', () => this.peekEnd());

    // Mobile Touch Events
    this.container.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.peekStart();
    }, { passive: false });
    window.addEventListener('touchend', () => this.peekEnd());
  }

  peekStart() {
    this.overlay.classList.add('peeking');
    this.media.classList.add('revealed');
  }

  peekEnd() {
    this.overlay.classList.remove('peeking');
    this.media.classList.remove('revealed');
  }
}
```

```css
.safety-blur-overlay {
  backdrop-filter: blur(45px);
  -webkit-backdrop-filter: blur(45px);
  transition: opacity 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}

.safety-blur-overlay.peeking {
  opacity: 0.15;
  backdrop-filter: blur(4px);
}
```

### B. Interactive Age Gating (Slider Verification)
Replace standard year-selection inputs or text fields with an interactive verify slider. Swiping the unlock slider from left to right triggers spring-based verification.

```javascript
class AgeSlider {
  constructor(trackId, thumbId, onComplete) {
    this.track = document.getElementById(trackId);
    this.thumb = document.getElementById(thumbId);
    this.onComplete = onComplete;
    this.isDragging = false;
    this.startX = 0;
    
    this.thumb.addEventListener('mousedown', (e) => this.dragStart(e));
    window.addEventListener('mousemove', (e) => this.drag(e));
    window.addEventListener('mouseup', () => this.dragEnd());
  }
  
  dragStart(e) {
    this.isDragging = true;
    this.startX = e.clientX - this.thumb.offsetLeft;
  }
  
  drag(e) {
    if (!this.isDragging) return;
    const maxOffset = this.track.clientWidth - this.thumb.clientWidth - 8;
    let x = e.clientX - this.startX;
    x = Math.max(0, Math.min(x, maxOffset));
    
    this.thumb.style.transform = `translateX(${x}px)`;
    
    if (x >= maxOffset - 2) {
      this.isDragging = false;
      this.onComplete();
    }
  }
  
  dragEnd() {
    if (!this.isDragging) return;
    this.isDragging = false;
    // Spring snap back to start on release
    this.thumb.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
    this.thumb.style.transform = 'translateX(0px)';
    setTimeout(() => this.thumb.style.transition = '', 400);
  }
}
```

---

## 5. Discrete Sandboxing & Telemetry Throttling

To allow discreet usage, provide a "safe mode" that limits data footprint and tracking:
*   **WebSockets Throttling:** Switch real-time event updates to static pull intervals to limit continuous traffic analysis.
*   **Storage Isolation:** Store all temporary user state in closed variable loops or volatile `sessionStorage` rather than `localStorage` or persistent cookies. Clear all volatile memory immediately on tab defocus or window exit.

---

## 6. Leaderboard & Ranking System Design

Leaderboards are the most visible gamification surface. A broken leaderboard damages trust faster than any other feature because it publicly displays the system's logic — or lack of it.

### Category Naming

Every scoring category name must be **domain-native**. Generic names ("Signal", "Engagement", "Top Buys") signal the system was built for no one in particular.

| Domain | Good Pattern | Bad Pattern |
|--------|-------------|-------------|
| Cannabis social | "Plug In" for referrals, "Loud in the Habitat" for engagement, "Bag Talk" for purchases | "Higher Connect", "Habitat Engagement", "Top Buys" |
| Fitness | "Streak", "PR", "Grind" | "Consistency Score", "Activity Points" |
| Creator economy | "Viral Moment", "Fan Reach", "Collab Score" | "Content Virality", "Audience Engagement", "Partnership Metric" |

**Rules:**
1. Names come from how the community talks, not from engineering docs
2. If a name sounds like a Google Analytics metric, rename it
3. Maximum 3 words per category name
4. Every name must pass the "would a user say this out loud" test

### Handle Attribution

The `@handle` is the user's identity on the platform. Display rules:

1. `@handle` appears **inline with the display name**, not as secondary subtext below it
2. The handle is the attributed identifier — it's how users know and tag each other
3. Display name + `@handle` on the same visual line, handle in a muted accent
4. Never bury `@handle` in a smaller font row under the name — it reads as an afterthought

**Correct:**
```
Frank @frvnkfrmchicago
```

**Wrong:**
```
Frank
        @frvnkfrmchicago
```

### Dimensional Grouping

Never present 9+ flat categories as equal tabs. Group into 3-4 dimensional clusters:

```
Social: Plug In, Loud in the Habitat, Stopped By
Commerce: Bag Talk, Notes
Live: In the Room, On Air
Culture: Strain Maker
```

Groups reduce cognitive load and make the leaderboard scannable. The group names themselves should be domain-native.

### Never Ship TBD Categories

If a category has no scoring logic ("TBD metric"), it does not appear on the leaderboard. Period. A live leaderboard advertising a placeholder category erodes trust in every other category.

### Community Voice Alignment

The leaderboard copy (masthead, scope labels, empty states, metric previews) must match the platform's community voice — not corporate engagement language. Avoid words like "signal", "engagement", "score" in user-facing copy. Use the community's own vocabulary.

### Pitfall: Generic Leaderboard Copy

The most common failure mode is copying fantasy sports or fitness leaderboard patterns into a social platform. Cannabis lounges, creator communities, and niche social spaces each have distinct vocabularies. Audit every user-facing string against the community's actual language.

---

## Reference Files

| File | Purpose |
|------|---------|
| `references/leaderboard-audit-checklist.md` | Full audit checklist for leaderboard copy, categorization, handle attribution, and design token compliance |

---

## ⛔ STOP GATE — Gamification Security Audit

Before submitting code:
- [ ] Ensure all reward rates (critical loops) are dynamically configured via a settings object, not hardcoded.
- [ ] Verify that a prefers-reduced-motion query successfully overrides particle explosions.
- [ ] Confirm all `PeekMedia` listeners correctly trigger on mobile touch coordinates.
- [ ] Confirm `sessionStorage` sandboxes are wiped when a discrete browsing session closes.
