---
name: app-status
description: Project summary and value estimation. Use to understand what a project IS, what it's worth, and what's left to do.
---

# App Status

What is this project? What's it worth?

## TL;DR

```
"What's the status of [project]?"
→ Summary, timeline, value estimate, next steps
```

---

## Context Questions

Before generating a status report, ask:

1. **What's the audience?** — Personal tracking, client update, team sync, investor report
2. **What level of detail?** — Quick status, full report, value estimation included
3. **What's the project stage?** — Ideation, building, MVP, shipped, iterating
4. **What metrics matter?** — Progress %, features done, timeline, value, blockers
5. **What decisions are needed?** — None (info only), prioritization, go/no-go, scope changes

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| Detail | Quick status ←→ Full report with value estimate |
| Audience | Personal notes ←→ Formal client deliverable |
| Focus | What's built ←→ What's the value |
| Timing | Real-time check ←→ Milestone review |
| Action | Information only ←→ Decision required |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Quick check during work | Quick Status format (5 lines) |
| End of session | Full Status Report with next steps |
| Client billing | Include Value Calculation with hourly breakdown |
| Team handoff | Emphasize tech stack, blockers, and next steps |
| Investor/stakeholder | Focus on milestones, timeline, and value proposition |
| Personal project tracking | Simple progress % and immediate next task |

---

## Status Report Template

```markdown
# [Project Name] - Status Report

**Generated:** [Date]
**Version:** [X.Y.Z]
**Stage:** [Ideation / Building / MVP / Shipped / Iterating]

---

## What It Is
[One paragraph: what the app does, who it's for, core value prop]

## Tech Stack
- Framework: [Next.js / Expo / etc.]
- Database: [Prisma + Supabase / etc.]
- Auth: [Clerk / etc.]
- Styling: [Tailwind + shadcn / etc.]
- Special: [GSAP, R3F, AI SDK, etc.]

## What's Built
| Feature | Status | Notes |
|---------|--------|-------|
| [Feature 1] | ✅ Done | |
| [Feature 2] | 🚧 In Progress | [blocker if any] |
| [Feature 3] | ⏳ Planned | |

## Timeline
| Date | Milestone |
|------|-----------|
| [Date] | Project started |
| [Date] | [Milestone] |
| [Date] | Current state |

## Value Estimate
[See Value Calculation section below]

## Next Steps
1. [Immediate next task]
2. [Following task]
3. [After that]

## Blockers
- [Any blockers or decisions needed]
```

---

## Value Calculation

### Framework

```
BASE VALUE = Traditional Hours × Hourly Rate

COMPLEXITY MULTIPLIERS:
+ AI/ML integration:     +25%
+ Real-time features:    +15%
+ Payment processing:    +20%
+ Mobile (App Store):    +25%
+ Custom animations:     +15%
+ Auth/security:         +10%
+ Third-party APIs:      +10%

ADJUSTED VALUE = Base × (1 + sum of multipliers)
```

### Rate Reference

| Developer Level | Hourly Rate |
|-----------------|-------------|
| Junior | $50-75 |
| Mid | $100-150 |
| Senior | $150-250 |
| Specialist | $200-400 |

**For vibe coders:** Use $150/hr as baseline (you're shipping, not learning).

### Example Calculation

```
Project: Waxland (worry-to-candle app)

Traditional Estimate:
- E-commerce base:        4 hours
- Burn animation:         4 hours
- PWA conversion:         2 hours
- Branding/design:        3 hours
- Testing/polish:         1 hour
                        --------
Total Traditional:        14 hours

Base Value: 14 × $150 = $2,100

Complexity:
+ Custom animations:      +15%
+ PWA:                   +10%
                        --------
Multiplier:              1.25

Adjusted Value: $2,100 × 1.25 = $2,625

Your Time: 3 hours
Efficiency: 4.7x faster
```

### What to Charge

| Pricing Model | When to Use | Formula |
|---------------|-------------|---------|
| **Value-based** | Client work, custom builds | Adjusted Value |
| **Project flat rate** | Defined scope | Adjusted Value × 0.8 |
| **Hourly** | Ongoing/unclear scope | Your Rate × Hours |
| **Productized** | Repeatable service | Market rate |

**Rule:** Never charge hourly for AI-assisted work. Charge for outcome.

---

## Quick Status Check

When asked "what's the status?", provide:

```
## [Project] Quick Status

**Stage:** [Building/MVP/Shipped]
**Progress:** [X]% complete
**Blockers:** [None / List them]
**Next:** [Immediate next step]
**Est. Value:** $[Amount]
```

---

## Stripe Integration Notes

If project has payments:

```markdown
## Payment Status

**Provider:** Stripe
**Mode:** [Test / Live]
**Products:** [List products/prices]
**Webhooks:** [Configured / Not configured]

### Stripe Checklist
- [ ] Products created in Stripe dashboard
- [ ] Prices attached to products
- [ ] Checkout session flow works
- [ ] Webhook endpoint configured
- [ ] Webhook events handled (checkout.session.completed)
- [ ] Customer portal enabled (for subscriptions)
- [ ] Test mode → Live mode switch ready
```

---

## Generating Status

### From Codebase

Look at:
- `package.json` → dependencies = tech stack
- File structure → what features exist
- Git history → timeline
- README → intended purpose

### From Conversation

Track:
- What was built this session
- What decisions were made
- What's blocked or unclear

### Automated (Future)

Could build a script that:
1. Reads package.json
2. Counts components/pages
3. Checks for common patterns (auth, db, etc.)
4. Generates status report

---

## Status Triggers

Say any of these:
- "What's the status?"
- "Summarize this project"
- "What have we built?"
- "What's this worth?"
- "Give me an overview"
- "Project status"

---

## Example Full Report

```markdown
# Waxland - Status Report

**Generated:** Dec 26, 2024
**Version:** 1.0.0
**Stage:** MVP

---

## What It Is
Waxland is a meditative web app where users type their worries and watch them transform into a candle that burns away. It's a digital ritual for letting go. Target: mindfulness-curious people who want quick, visual stress relief.

## Tech Stack
- Framework: Next.js 16.1.1 (App Router)
- Database: None (client-side only for MVP)
- Auth: None (MVP)
- Styling: Tailwind + custom
- Special: GSAP (burn animation), PWA-ready

## What's Built
| Feature | Status | Notes |
|---------|--------|-------|
| Worry input | ✅ Done | Character-limited textarea |
| Text-to-candle morph | ✅ Done | GSAP animation |
| Candle burn animation | ✅ Done | 8-second timeline |
| Reset/new worry | ✅ Done | |
| PWA manifest | ✅ Done | Installable |
| AI-generated candle image | ⏳ Planned | Nano Banana Pro |
| Sound effects | ⏳ Planned | |
| Share result | ⏳ Planned | |

## Timeline
| Date | Milestone |
|------|-----------|
| Dec 25 | Project started (as Cinematic Hearth) |
| Dec 25 | Rebranded to Waxland |
| Dec 26 | MVP complete |

## Value Estimate
- Traditional: 14 hours × $150 = $2,100
- Complexity: +25% (animation + PWA)
- **Adjusted Value: $2,625**
- Your time: ~3 hours
- Efficiency: 4.7x

## Next Steps
1. Add AI-generated candle image (Nano Banana Pro)
2. Add ambient sound
3. Add share functionality
4. Consider user accounts for saved worries

## Blockers
- None currently
```
