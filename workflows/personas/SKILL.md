---
name: personas
description: Build user personas for product development. Research, interview patterns, persona templates, and validation.
last_updated: 2026-03
owner: Frank
---

# User Personas

Understand who you're building for.

> **See also:** `workflows/product-spec/SKILL.md` for turning personas into specs

---

## Context Questions

Before creating personas, ask:

1. **What's the research stage?** — Starting, have some data, validating
2. **How many personas needed?** — Primary only, 2-3, full segmentation
3. **What data sources?** — Interviews, surveys, analytics, secondary
4. **What's the goal?** — Product direction, marketing, feature priority
5. **What's the timeline?** — Quick (1 day), standard (1 week), thorough (1 month)

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Depth** | Assumptions ←→ Research-backed |
| **Scope** | Single persona ←→ Full segments |
| **Source** | Secondary research ←→ Primary interviews |
| **Speed** | Quick profile ←→ Validated persona |
| **Use** | Internal guide ←→ Team alignment doc |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| No user data | Start with assumptions + quick research |
| Some analytics | Build from behavioral patterns |
| Need validation | User interviews (5-8 minimum) |
| Marketing focus | Add messaging + channels |
| Enterprise B2B | Include buying committee roles |
| Consumer B2C | Focus on psychographics |

---

## TL;DR

| Component | Purpose |
|-----------|---------|
| **Research** | Gather real user data |
| **Persona Template** | Standardize user profiles |
| **Jobs-to-be-Done** | What users actually need |
| **Validation** | Confirm with real users |

---

## Part 1: Why Personas Matter

```
Without personas:
- Building features nobody wants
- "Everyone is our customer" → nobody is
- Guessing at priorities

With personas:
- Clear target user
- Feature decisions backed by data
- Marketing that resonates
```

---

## Part 2: Research Methods

### Quick Research (1-2 hours)

```markdown
## Sources
1. Reddit/Twitter threads about the problem
2. App store reviews of competitors
3. Google "why I hate [competitor]"
4. ProductHunt comments on similar products

## What to Look For
- Repeated complaints
- Workarounds people use
- Emotional language ("I HATE when...")
- Feature requests
```

### User Interviews (2-4 hours)

```markdown
## Interview Script (15-20 min)

**Intro (2 min)**
"I'm building [X] and want to understand your experience with [problem]."

**Current State (5 min)**
1. "Walk me through how you currently handle [problem]."
2. "What tools do you use?"
3. "What's the most frustrating part?"

**Pain Points (5 min)**
4. "What would make this 10x better?"
5. "What have you tried that didn't work?"
6. "How much time/money does this cost you?"

**Validation (5 min)**
7. "If I built [solution], would you use it?"
8. "What would stop you from using it?"
9. "What would you pay for this?"

**Close (2 min)**
10. "Anyone else I should talk to?"
```

### Survey (Async)

```markdown
## Quick Survey Template (5 questions max)

1. What's your role? [Dropdown]
2. How often do you deal with [problem]? [Daily/Weekly/Monthly/Rarely]
3. What's your current solution? [Open text]
4. Rate your satisfaction with current solution [1-10]
5. What would make you switch? [Open text]

## Distribution
- Twitter/LinkedIn post
- Email to beta list
- Reddit (if appropriate)
- Slack/Discord communities
```

---

## Part 3: Persona Template

```markdown
# Persona: [Name]

## Demographics
- **Age:** 28-35
- **Role:** Senior Developer
- **Company Size:** 10-50 employees
- **Income:** $120K-$180K
- **Location:** Remote, US timezone

## Psychographics
- **Tech Savvy:** High
- **Risk Tolerance:** Medium (will try new tools)
- **Decision Authority:** Can buy tools under $100/mo without approval

## Goals
1. Ship features faster without sacrificing quality
2. Reduce time spent on repetitive tasks
3. Look competent to leadership

## Frustrations
1. Context switching between tools
2. Documentation is always outdated
3. AI tools hallucinate and waste time

## Behaviors
- Uses CLI over GUIs
- Has 10+ VS Code extensions
- Reads Hacker News daily
- Active on Twitter/X tech community

## Quote
"I don't need another tool. I need the tools I have to work better together."

## Jobs-to-be-Done
- When I'm [starting a new feature]
- I want to [quickly understand the codebase]
- So I can [ship without breaking things]

## How They'd Find You
- Hacker News post
- Twitter thread
- Colleague recommendation
- VS Code extension marketplace
```

---

## Part 4: Jobs-to-be-Done Framework

### JTBD Statement

```
When [situation],
I want to [motivation],
So I can [outcome].
```

### Examples

```markdown
## Developer Persona

When I'm debugging a production issue at 2am,
I want to quickly find the root cause,
So I can fix it and go back to sleep.

When I'm onboarding to a new codebase,
I want to understand the architecture fast,
So I can contribute without asking dumb questions.

When I'm building a new feature,
I want to reuse existing patterns,
So I can ship faster and maintain consistency.
```

### Priority Matrix

| Job | Frequency | Importance | Current Satisfaction |
|-----|-----------|------------|---------------------|
| Debug production | Weekly | Critical | Low |
| Onboard to codebase | Monthly | High | Medium |
| Build new features | Daily | High | Medium |

**Focus on:** High frequency + Low satisfaction

---

## Part 5: Validation

### Smoke Test

```markdown
## Landing Page Test

1. Create simple landing page (1 hour)
2. Describe the solution
3. Add email signup
4. Drive traffic ($50-100 ads or organic)
5. Measure signup rate

## Success Metrics
- <1% signup: Problem not painful enough
- 1-5% signup: Worth exploring
- >5% signup: Strong signal
```

### Fake Door Test

```markdown
## Test Demand Without Building

1. Add button for feature that doesn't exist
2. When clicked, show "Coming soon, join waitlist"
3. Track click rate

## Interpretation
- Low clicks: Users don't want this
- High clicks + low signups: Messaging problem
- High clicks + high signups: Build it
```

### Concierge MVP

```markdown
## Manual First

Before building automation:
1. Do the task manually for 5-10 users
2. Charge money (validates willingness to pay)
3. Learn exactly what they need
4. Then automate

## Example
- AI coding assistant: You code for them via screen share
- Scheduling app: You schedule manually via email
- Data pipeline: You run scripts manually
```

---

## Part 6: Anti-Personas

Define who you're NOT building for:

```markdown
## Anti-Persona: Enterprise Emily

**Why NOT:**
- Requires SOC 2, HIPAA, SSO
- 6-month sales cycle
- Legal review for every contract
- Needs dedicated account manager

**Decision:**
We're building for indie devs and small teams.
Enterprise can wait until Series A.

---

## Anti-Persona: Freeloader Fred

**Why NOT:**
- Only uses free tier
- Complains about pricing
- High support burden
- Never converts

**Decision:**
No free tier. Free trial → paid only.
```

---

## Part 7: Persona to Feature Mapping

```markdown
## Feature Prioritization

| Feature | Persona A | Persona B | Priority |
|---------|-----------|-----------|----------|
| CLI interface | ✅ Must | ❌ Doesn't want | HIGH |
| Team collaboration | ❌ Solo | ✅ Must | MEDIUM |
| AI autocomplete | ✅ Wants | ✅ Wants | HIGH |
| Mobile app | ❌ Never | ⚠️ Nice to have | LOW |

## Decision Rule
- Both personas want it: Build first
- Primary persona wants it: Build second
- Neither wants it: Don't build
```

---

## Part 8: Updating Personas

```markdown
## Monthly Review

1. What new feedback came in?
2. Any surprises in user behavior?
3. Are we attracting the target persona?
4. Should we adjust?

## Signals to Watch
- Support tickets by topic
- Feature request patterns
- Churn reasons
- NPS by segment
```

---

## Checklist

```markdown
- [ ] Identified 2-3 primary personas
- [ ] Conducted 5+ user interviews
- [ ] Defined Jobs-to-be-Done
- [ ] Created anti-personas
- [ ] Validated with smoke test
- [ ] Mapped features to personas
- [ ] Documented in product spec
```

---

## Resources

- Jobs-to-be-Done: https://jtbd.info
- User Interviews: https://www.userinterviews.com
- Persona Template: https://www.nngroup.com/articles/persona/

---

## Related Skills

- `workflows/product-spec/SKILL.md` — Turn personas into specs
- `workflows/research/SKILL.md` — Deep market research
- `workflows/monetization/SKILL.md` — Pricing for personas
- `workflows/growth/SKILL.md` — Acquisition by persona
