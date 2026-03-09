---
name: app-a-day
description: Ship an app every day. Rapid prototyping, daily shipping cadence, portfolio building.
last_updated: 2026-03
owner: Frank
---

# App-a-Day

Ship something every single day. Build your portfolio, skills, and momentum.

> **See also:** `workflows/ship-fast/SKILL.md` for shipping mindset, `workflows/ai-prototype-to-build/SKILL.md` for AI workflow

---

## Context Questions

Before starting a daily shipping practice, ask:

1. **What's your goal?** — Portfolio, learning, content, product ideas
2. **How much time daily?** — 2-4 hours is typical
3. **What's your stack?** — Stick to one you know well
4. **Who's your audience?** — Twitter, LinkedIn, yourself
5. **What counts as "shipped"?** — Live URL, demo video, GitHub

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Scope** | Micro (1 feature) ←→ Mini (full MVP) |
| **Polish** | Rough prototype ←→ Production-ready |
| **Sharing** | Private ←→ Build in public |
| **Stack** | Same every day ←→ Explore new tech |
| **Purpose** | Learning ←→ Portfolio/clients |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Limited time (2-3 hrs) | Single-feature micro apps |
| Building portfolio | Polish UI, document well |
| Learning new tech | Accept rougher output |
| Content creation | Focus on shareable demos |
| Finding product ideas | Test many, double down on winners |
| Burnout risk | Batch prep, skip weekends |

---

## TL;DR

| Phase | Duration | Focus |
|-------|----------|-------|
| **Idea** | 10 min | Pick from list or prompt AI |
| **Scope** | 10 min | Cut to 1 core feature |
| **Build** | 2-3 hrs | Ship, don't perfect |
| **Ship** | 15 min | Deploy, screenshot, post |
| **Reflect** | 5 min | Log learnings |

---

## Part 1: The Daily Rhythm

### Morning Prep (5 min)

1. Check your idea backlog
2. Pick ONE app to build today
3. Write the single user story:
   - "As a [user], I can [action] to [benefit]"

### Build Session (2-3 hours)

| Time | Activity |
|------|----------|
| 0:00 | Scaffold project |
| 0:15 | Core UI layout |
| 0:45 | Main functionality |
| 1:30 | Integration (API, DB) |
| 2:00 | Polish + edge cases |
| 2:30 | Deploy |
| 2:45 | Screenshot + post |

### Ship Checklist

- [ ] Live URL works
- [ ] Mobile responsive (good enough)
- [ ] No console errors
- [ ] Screenshot captured
- [ ] Tweet/post drafted
- [ ] Logged in tracker

---

## Part 2: Idea Generation

### Idea Sources

| Source | Example |
|--------|---------|
| **Pain points** | "I wish I had a tool that..." |
| **Trending topics** | Wrap existing API in nice UI |
| **Clones** | Rebuild famous app feature |
| **Prompts** | Ask AI for 10 app ideas |
| **Challenges** | 1-hour coding challenge |
| **API-first** | Find cool API, build UI for it |

### AI Prompt for Ideas

```
Generate 10 small app ideas I can build in 2-3 hours:
- Should use web tech (React/Next.js)
- Single core feature
- Can use free APIs
- Visually interesting for portfolio
- Mix of practical and fun
```

### Idea Complexity Tiers

| Tier | Time | Example |
|------|------|---------|
| **Micro** | 1-2 hrs | Random quote generator, color palette tool |
| **Mini** | 2-3 hrs | Todo with AI, expense tracker |
| **Sprint** | 3-4 hrs | Multi-page app, auth flow |

---

## Part 3: Speed Stack

### Recommended Stack (Maximum Speed)

```bash
# The speed stack
npx create-next-app@latest my-app --typescript --tailwind --app
cd my-app
npm install lucide-react
# Optional: npm install @vercel/ai openai
```

| Layer | Choice | Why |
|-------|--------|-----|
| **Framework** | Next.js 16 | App router, server actions |
| **Styling** | Tailwind | No CSS files |
| **Components** | shadcn/ui | Copy-paste, customizable |
| **Icons** | Lucide | Consistent, tree-shakeable |
| **Deployment** | Vercel | Git push = live |
| **Database** | Supabase or none | Quick setup |
| **AI** | Vercel AI SDK | Streaming built-in |

### Templates to Fork

Keep templates ready:

```
~/templates/
├── micro-app/        # Single-page, no backend
├── mini-app/         # With Supabase auth/db
├── ai-app/           # With OpenAI integration
└── api-wrapper/      # Wraps external API
```

---

## Part 4: Scoping for Speed

### The One-Feature Rule

❌ "A full task management app"
✅ "A task list with AI-generated subtasks"

❌ "An expense tracker"
✅ "A receipt scanner that extracts totals"

❌ "A social media scheduler"
✅ "A tweet thread preview tool"

### Cut Ruthlessly

| Keep | Cut |
|------|-----|
| Core feature | Auth (use demo mode) |
| Basic UI | Settings page |
| Primary flow | Edge cases |
| Desktop | Mobile perfection |
| One API call | Multiple integrations |

### Timebox Everything

```
If it's not working in 30 minutes, pivot.
If it's 75% done at 2.5 hours, ship it.
If you're stuck, ask AI or skip.
```

---

## Part 5: The Streak

### Maintaining Momentum

| Strategy | Implementation |
|----------|----------------|
| **Streak tracker** | Public counter, spreadsheet |
| **Batch prep** | 10 ideas Sunday, pick daily |
| **Lower bar** | "Shipped" = demo video if needed |
| **Rest days** | Weekends off is okay |
| **Stack days** | Skip a day? Ship 2 next day |

### When to Break the Streak

It's okay to pause for:
- Bigger project (build for 1 week)
- Client work
- Burnout prevention
- Life happens

Just restart the streak after.

### Tracking Template

```markdown
## Day [X] — [Date]

**App:** [Name]
**Idea:** One-liner description
**Time:** X hours
**Stack:** Next.js, Tailwind, [etc]
**URL:** [link]
**Post:** [tweet link]

**Learnings:**
- What worked
- What to improve

**Tomorrow's idea:** [prep for next day]
```

---

## Part 6: Build in Public

### The Daily Post Template

```
Day [X] of #AppADay 🚀

Built: [App Name]
What it does: [One line]
Time: [X] hours

[Screenshot or Loom]

Try it: [URL]

Tomorrow: [Teaser]
```

### Platforms

| Platform | Format |
|----------|--------|
| **Twitter/X** | Thread + screenshot |
| **LinkedIn** | Longer story + learnings |
| **YouTube** | Speed-build videos |
| **TikTok** | 60-sec demo |
| **Indie Hackers** | Journey posts |

### Content Multiplication

One app = multiple pieces:
1. Build video (timelapse)
2. Tweet thread
3. LinkedIn post
4. Portfolio entry
5. Blog tutorial (if interesting)

---

## Part 7: From Daily to Product

### Signals to Double Down

| Signal | Action |
|--------|--------|
| Lots of retweets | Expand the app |
| People ask for features | Build them |
| You keep using it | Productize it |
| Solves real pain | Charge for it |

### Graduation Path

```
Day 1-30: Daily shipping (build muscle)
Day 31-60: Pick 3 winners, expand each for 1 week
Day 61-90: Pick 1, build for real
```

---

## Checklist

Daily:
- [ ] Idea selected
- [ ] Scope cut to 1 feature
- [ ] Built in < 3 hours
- [ ] Deployed to live URL
- [ ] Screenshot captured
- [ ] Posted on social
- [ ] Logged in tracker

Weekly:
- [ ] 10 new ideas added to backlog
- [ ] Review best performers
- [ ] Replenish templates if needed

---

## Related Skills

- `workflows/ship-fast/SKILL.md` — Shipping mindset
- `workflows/ai-prototype-to-build/SKILL.md` — AI workflow
- `agents/growth-hacking/SKILL.md` — Growing audience
- `workflows/build-in-public/SKILL.md` — Public building
