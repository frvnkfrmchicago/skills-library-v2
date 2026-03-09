---
name: usability-testing
description: AI-first usability testing. Rapid iteration, Maze AI, heuristic evaluation, A/B testing for AI features.
last_updated: 2026-03
owner: Frank
---

# Usability Testing

Test real prototypes immediately. AI-assisted analysis. Rapid iteration.

> **See also:** `agents/ux-research/SKILL.md`, `agents/analytics/SKILL.md`

---

## Context Questions

Before testing:

1. **What's the test type?** — Unmoderated, moderated, heuristic, A/B
2. **What's the prototype fidelity?** — Wireframe, mockup, functional, live
3. **How many participants?** — Quick 3-5, standard 5-8, statistical 30+
4. **What are success metrics?** — Task completion, time, satisfaction
5. **How fast do you need results?** — Same day, week, full study

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Speed** | Rapid (hours) ←→ Rigorous (weeks) |
| **Depth** | Surface heuristics ←→ Deep qualitative |
| **Scale** | Few participants ←→ Statistical sample |
| **Assistance** | AI-automated ←→ Human-moderated |
| **Fidelity** | Paper prototype ←→ Production code |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Quick validation needed | Unmoderated test in Maze, 5 users |
| Deep insights needed | Moderated sessions with follow-ups |
| No prototype yet | Heuristic evaluation + Attention Insight |
| High traffic product | A/B test with statistical significance |
| Testing AI features | Include output variability + trust metrics |
| Same-day iteration | Morning build → afternoon test → evening fix |

---

## TL;DR

| Method | Speed | Depth | AI Assist |
|--------|-------|-------|-----------|
| **Unmoderated Testing** | Fast | Medium | High |
| **Moderated Testing** | Slow | Deep | Medium |
| **Heuristic Eval** | Very Fast | Surface | High |
| **A/B Testing** | Medium | Quantitative | High |

---

## 1. AI-First Principles

### Traditional vs AI-First

| Traditional | AI-First 2025 |
|-------------|---------------|
| Plan extensively | Build → Test immediately |
| Recruit for weeks | Test within hours |
| Analyze manually | AI summarizes findings |
| Report after weeks | Fix same day |
| Research team only | Whole team participates |

### Speed Advantages

```
AI handles:
✅ Real-time transcription
✅ Automatic summarization
✅ Friction pattern detection
✅ Fix suggestions

Humans focus on:
✅ Strategy and interpretation
✅ Nuanced insights
✅ Product decisions
✅ Stakeholder communication
```

---

## 2. Tools 2025-2026

### Unmoderated Testing

| Tool | AI Features | Best For | Price |
|------|-------------|----------|-------|
| **Maze AI** | Auto-summarize, friction detection | Quick prototype tests | $99+/mo |
| **UserTesting** | AI Insights, video highlights | Enterprise | $$$$ |
| **PlaybookUX** | Transcription, sentiment | Mixed methods | $99/mo |
| **Sprig** | In-product surveys, replays | Live product | $175+/mo |

### Heuristic Evaluation

| Tool | AI Features | Best For |
|------|-------------|----------|
| **Attention Insight** | Heatmap prediction | Visual design |
| **UXtweak** | Behavioral ML | Live site analysis |
| **Claude/ChatGPT** | Heuristic review | Quick checks |

### A/B Testing

| Tool | AI Features | Best For |
|------|-------------|----------|
| **PostHog** | Session replay + analytics | Product teams |
| **Statsig** | Auto-analysis | Feature flags |
| **Amplitude** | AI insights | Enterprise |
| **Optimizely** | Full experimentation | Enterprise |

---

## 3. Unmoderated Testing

### When to Use

```
✅ Good for:
- Task completion testing
- Navigation and findability
- First-click testing
- Preference testing
- Quick feedback on prototypes

❌ Not for:
- Complex emotional insights
- "Why" questions
- Exploratory research
```

### Maze AI Workflow

```
1. Upload prototype (Figma, URL, or images)
2. Define tasks and success paths
3. Write clear task prompts
4. Set completion criteria
5. Launch (results in 1-24 hours)
6. AI summarizes findings
7. Fix issues same day
8. Retest
```

**Task Prompt Template:**

```
You are booking a flight for next Friday.

Starting from the homepage, find a flight from 
New York to Los Angeles and complete the booking.

When you're done, click "Task Complete."
```

### Key Metrics

| Metric | What It Means |
|--------|---------------|
| **Task Completion** | % who finished successfully |
| **Time on Task** | How long it took |
| **Misclick Rate** | Wrong clicks before right one |
| **Drop-off Points** | Where users gave up |
| **Direct Success** | First-try success rate |

---

## 4. Moderated Testing

### When to Use

```
✅ Good for:
- Complex flows
- Sensitive topics
- Need follow-up questions
- Exploratory research
- Early concept testing
```

### AI Assistance During Sessions

| Before | During | After |
|--------|--------|-------|
| Generate discussion guide | Real-time transcription | Auto-summarize |
| Screen participant | AI note suggestions | Theme extraction |
| Schedule sessions | Auto-tagging moments | Highlight reel |

### Tools

- **Lookback** — AI-powered note taking
- **Zoom + Otter.ai** — Transcription
- **Dovetail** — Analysis and synthesis
- **UserZoom** — Enterprise moderated

### Session Script Template

```markdown
## Intro (2 min)
- Thanks for joining
- Recording notice + consent
- No right/wrong answers
- Think aloud

## Warm-up (3 min)
- Tell me about your experience with [domain]
- How do you currently [solve problem]?

## Tasks (20-30 min)
- Task 1: [Scenario and goal]
  - Probing: What did you expect to happen?
  - Follow-up: What would make this easier?

- Task 2: [Scenario and goal]
  - ...

## Wrap-up (5 min)
- Overall impression?
- Anything confusing?
- What would you change?
- Any questions for me?
```

---

## 5. Heuristic Evaluation

### Nielsen's 10 Heuristics (Quick Reference)

| # | Heuristic | Question to Ask |
|---|-----------|-----------------|
| 1 | Visibility of status | Does user know what's happening? |
| 2 | Match real world | Does language match expectations? |
| 3 | User control | Can user undo/escape? |
| 4 | Consistency | Same patterns throughout? |
| 5 | Error prevention | Are mistakes prevented? |
| 6 | Recognition over recall | Is everything visible/discoverable? |
| 7 | Flexibility | Shortcuts for experts? |
| 8 | Aesthetic minimalism | Is it cluttered? |
| 9 | Error recovery | Clear error messages? |
| 10 | Help | Documentation available? |

### AI-Enhanced Workflow

```
1. Screenshot prototype
2. Run through Attention Insight (heatmap prediction)
3. Identify attention gaps
4. Ask Claude for heuristic review:

   "Review this UI screenshot against Nielsen's 10 
   usability heuristics. For each issue found, rate 
   severity (1-4) and suggest a fix."

5. Prioritize fixes by severity
6. Test with real users to validate
```

---

## 6. A/B Testing

### When to Use

```
✅ Good for:
- Quantitative validation
- High-traffic features
- Before major launches
- Comparing two clear options

❌ Not for:
- Low traffic (no statistical power)
- Radically different concepts
- When you need "why" insights
```

### Implementation (PostHog)

```typescript
// Feature flag setup
import { usePostHog } from 'posthog-js/react'

function CheckoutButton() {
  const posthog = usePostHog()
  
  // Get variant
  const variant = posthog.getFeatureFlag('checkout-button-experiment')
  
  if (variant === 'control') {
    return <button>Checkout</button>
  }
  
  if (variant === 'treatment') {
    return <button className="bg-green-500">Complete Purchase →</button>
  }
}

// Track conversion
function handlePurchase() {
  posthog.capture('purchase_completed', {
    revenue: cart.total,
    items: cart.items.length,
  })
}
```

### Statistical Significance

```
Minimum sample size = 16 × (p × (1-p)) / MDE²

Where:
- p = baseline conversion rate
- MDE = minimum detectable effect

Example:
- 5% baseline conversion
- Want to detect 10% improvement (0.5% absolute)
- Need ~6,000 per variant
```

---

## 7. Testing AI Features

### Unique Considerations

| Challenge | How to Test |
|-----------|-------------|
| Output variability | Test same prompt multiple times |
| Hallucinations | Verify claims, show sources |
| Speed | Measure time to first response |
| Trust | Ask trust/confidence ratings |
| Error recovery | Test when AI fails |

### What to Measure

```typescript
interface AIFeatureMetrics {
  // Task success
  taskCompletion: number       // % who achieved goal
  timeToComplete: number       // Seconds
  aiAssistUsage: number        // % who used AI feature
  
  // Quality
  outputAccuracy: number       // % correct outputs
  userSatisfaction: number     // 1-5 rating
  trustScore: number           // "I trust this AI" 1-5
  
  // Error handling
  errorRate: number            // % that showed errors
  errorRecoveryRate: number    // % who recovered
  
  // Comparison
  aiVsManual: {
    speed: number              // AI time / manual time
    accuracy: number           // AI accuracy / manual accuracy
  }
}
```

### Test Scenarios

```
1. Happy Path
   - AI gives correct answer first try
   - User achieves goal quickly

2. Partial Success
   - AI gives mostly correct answer
   - User needs to edit/refine

3. AI Failure
   - AI gives wrong or no answer
   - Can user recover?

4. Edge Cases
   - Unusual inputs
   - Long/short prompts
   - Ambiguous requests
```

---

## 8. Rapid Iteration Protocol

### Same-Day Cycle

```
Morning:
09:00 → Build/fix prototype
11:00 → Set up test in Maze (5 min)
11:05 → Recruit panel or share link

Afternoon:
14:00 → First results available
14:30 → AI summarizes findings
15:00 → Review and prioritize fixes
16:00 → Fix top 3 issues

Evening:
17:00 → Deploy fixes
17:30 → Set up retest
```

### Week-Long Sprint

```
Monday:    Build prototype + launch test
Tuesday:   Review results + fix critical issues
Wednesday: Retest + fix moderate issues
Thursday:  Moderated sessions (deeper insights)
Friday:    Final fixes + launch
```

---

## 9. Reporting

### AI-Generated Reports

Use Claude/ChatGPT to synthesize:

```
Prompt:
"Summarize these usability test findings into an 
executive summary. Include:
- Top 3 issues (severity, impact, frequency)
- Evidence (quotes, task completion rates)
- Recommended fixes (prioritized)
- What worked well

Findings:
[Paste raw notes or transcripts]"
```

### Report Template

```markdown
# Usability Test Report: [Feature/Product]

## Overview
- **Test dates:** [Date range]
- **Method:** [Unmoderated/Moderated]
- **Participants:** [N] users matching [criteria]
- **Tool:** [Maze/UserTesting/etc.]

## Key Findings

### Critical (Fix before launch)
1. [Issue] — [Severity] — [% affected]
   - Evidence: "[Quote]"
   - Recommendation: [Fix]

### Major (Fix soon)
2. ...

### Minor (Backlog)
3. ...

## What Worked
- [Positive finding 1]
- [Positive finding 2]

## Metrics
| Task | Completion | Avg Time | Direct Success |
|------|------------|----------|----------------|
| 1    | 85%        | 45s      | 70%            |
| 2    | 60%        | 90s      | 40%            |

## Next Steps
- [ ] Fix [critical issue]
- [ ] Retest [date]
```

---

## Checklist

- [ ] Testing tool selected (Maze, UserTesting, etc.)
- [ ] First prototype ready to test
- [ ] Task scenarios written
- [ ] Participant criteria defined
- [ ] AI summarization enabled
- [ ] Reporting template ready
- [ ] Iteration workflow documented
- [ ] Stakeholder communication plan

---

## Related Skills

- [UX Research](/agents/ux-research/SKILL.md) — Broader research methods
- [Analytics](/agents/analytics/SKILL.md) — Quantitative tracking
- [A11y](/agents/a11y/SKILL.md) — Accessibility testing
- [Testing](/agents/testing/SKILL.md) — Automated testing
- [Growth Hacking](/agents/growth-hacking/SKILL.md) — A/B testing for growth
