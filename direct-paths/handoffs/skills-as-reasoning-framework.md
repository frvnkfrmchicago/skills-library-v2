# Skills as Reasoning Frameworks — Agent Handoff

**From:** Antigravity (Google AI Code IDE)
**To:** Cursor / Other Agents
**Date:** December 26, 2025
**Purpose:** Align on a new paradigm for how skills should function

---

## The Core Insight

The user has identified that skills are currently functioning as **template libraries** when they should function as **reasoning frameworks**.

### Current Pattern (What's Broken)
```
User mentions something → AI reads skill → AI applies pattern → Output
```

This produces:
- Same outputs regardless of context
- "Consistent" results that miss the point
- Generic implementations that feel boring
- No interrogation of what the user actually needs

### Target Pattern (What We're Building Toward)
```
User mentions something → Skill GROUNDS the context → AI UNDERSTANDS the situation → AI generates CONTEXTUAL PLAN → Plan drives OUTPUT
```

The skill doesn't tell the AI what to do—it gives the AI the **vocabulary and dimensions to think with**.

---

## The Three Pillars

Skills should be:

| Pillar | Meaning | Example |
|--------|---------|---------|
| **Interrogative** | Asks context questions BEFORE offering solutions | "What emotion should users feel? What's the information density?" |
| **Generative** | Derives unique approaches from answers | Not "pick Playful mood" but "derive from high-energy + data-dense + professional = X" |
| **Adaptive** | Different input = different output | Same skill, 10 different projects, 10 different implementations |

---

## Real-World Example: The Trading App Problem

The user is building a trading app. Here's what's happening:

### Issues Cursor Keeps Missing:

1. **Typography is small** — but Cursor says it's "consistent across the board"
2. **Colors are off** — but Cursor doesn't interrogate what "off" means in this context
3. **Features aren't cohesive** — Spy Snapshot doesn't match the rest visually
4. **Unnecessary attribution** — "via FinHub" or "via Alpha Vantage" is showing when it shouldn't
5. **Not interactive/engaging** — has some elements but feels boring overall
6. **"Enhance the design" isn't landing** — because what does "enhance" mean without context?
7. **No content opportunity integration** — videos/images work in other apps but not being suggested here
8. **Missing immersiveness** — user wants Netflix-level engagement feel, not just Shopify-functional

### Why This Happens:

Cursor is applying skills as templates:
- "Design system says use these tokens" ✓ (but tokens don't match trading app energy)
- "Animations are present" ✓ (but they're decorative, not purposeful)
- "Colors are consistent" ✓ (consistent ≠ correct for context)

### What Should Happen:

Before ANY design work, the skill should force these questions:

1. **What's the emotional intent of this app?**
   - Trading app = urgency, precision, confidence, maybe a bit of adrenaline
   - NOT: calm, browsing, leisurely

2. **What's the information density?**
   - Trading = HIGH density, lots of numbers, real-time data
   - Typography needs to be scannable, not "pretty small text"

3. **What's the user's mental state?**
   - Making financial decisions, needs clarity, can't afford confusion
   - Visual hierarchy is critical, not optional

4. **What reference points matter?**
   - User said Netflix, not Shopify
   - Immersive, captivating, pulls you in
   - Not just functional and clean

5. **What content opportunities exist?**
   - Trading = charts, live data, maybe educational tooltips
   - Could there be video explainers? Market summaries? Visual indicators?

---

## Plan Types to Acknowledge

The user works across multiple contexts. Skills need to recognize:

| Plan Type | Context | What the Skill Should Adjust |
|-----------|---------|------------------------------|
| **Feature-level** | Adding a single feature to existing app | Match existing patterns, don't reinvent |
| **Page-level** | Building one page/view | Consider page's role in flow, unique needs |
| **Component-level** | Single UI element | Micro-context, how does this feel to interact with? |
| **App-wide** | Full redesign or new build | Establish the system, then derive everything from it |
| **Enhancement** | "Make this better" | MUST interrogate: better how? For whom? What's missing? |

When user says "enhance the design" — that's not a template application moment. That's a **discovery moment**.

---

## Action Items for Cursor

1. **Stop applying skills as checklists**
   - Don't just verify "animation exists" — ask "does animation serve the content?"

2. **Interrogate before implementing**
   - If user says "enhance," respond with clarifying dimensions
   - "Do you mean: more visual interest? Better hierarchy? More polish? More engagement?"

3. **Use reference points**
   - User mentioned Netflix vs. Shopify
   - Netflix = immersive, bingeable, entertainment energy
   - Shopify = functional, transactional, utilitarian
   - Trading app should lean Netflix (captivating data experience)

4. **Consider content integration**
   - Not every app needs videos, but every app has content opportunities
   - Trading app: animated charts, live indicators, educational overlays, celebration moments on gains

5. **Challenge "consistency"**
   - Consistent doesn't mean correct
   - If the whole app has small typography, it's consistently wrong
   - If colors are consistent but don't evoke the right feeling, they're still wrong

---

## The Flexibility Review Framework

The user has created a review framework at:
`direct-paths/reviews/flexibility-review.md`

Core test for every skill:

- **Choices over defaults?** (presents options vs. prescribes one way)
- **Ideation-enabling?** (helps explore vs. jumps to implementation)
- **Variation potential?** (same skill, different outcomes possible)
- **Context-aware?** (asks about situation before recommending)
- **Building blocks, not recipes?** (components to combine vs. steps to follow)

---

## Next Steps

1. **Acknowledge this paradigm shift** — skills are reasoning frameworks, not template libraries
2. **When the user says "enhance"** — enter discovery mode, not implementation mode
3. **Surface the dimensions** — what could be varied? What's the spectrum?
4. **Ground recommendations in context** — "Given that this is a trading app where users need X, I recommend Y because Z"
5. **Iterate with the user** — this is a conversation, not a one-shot

---

## Key Phrase to Remember

> "Skills act as grounding context → AI uses skills to understand the situation → AI generates a contextual plan → That plan drives output"

Not: Skill → Apply → Done

But: Skill → Interrogate → Understand → Derive → Adapt → Implement

---

**End of Handoff**

*This document establishes shared understanding. Both agents should reference this when working on skill-related tasks or when the user mentions "flexibility," "enhancement," or asks why something feels wrong.*
