---
name: tech-communication
description: Communicate technical topics to stakeholders. Proposals, tradeoffs, status updates, async patterns.
last_updated: 2026-03
owner: Frank
---

# Technical Communication

Explain complex things simply. Get buy-in. Move projects forward.

> **See also:** `agents/documentation/SKILL.md`, `agents/technical-leadership/SKILL.md`

---

## Context Questions

Before communicating:

1. **Who's the audience?** — Engineers, PMs, executives, external clients
2. **What's the goal?** — Inform, get approval, request resources, escalate
3. **How complex is it?** — Simple update, tradeoff decision, major proposal
4. **What's the urgency?** — FYI, needs response, blocking, critical
5. **What channel?** — Slack, email, doc, meeting, PR comment

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Audience** | Technical ←→ Non-technical |
| **Urgency** | FYI ←→ Critical escalation |
| **Detail** | TL;DR ←→ Full proposal |
| **Formality** | Casual Slack ←→ Executive email |
| **Action** | Informational ←→ Decision required |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Executive audience | BLUF (Bottom Line Up Front), business impact |
| Engineering peer | Technical details, code examples, diagrams |
| Needs approval | 3-option framework, clear recommendation |
| Status update | Done/Doing/Blocked format |
| Escalation needed | Context → Impact → Ask template |
| Async decision | Set deadline, propose default action |

---

## TL;DR

| Situation | Template |
|-----------|----------|
| **Propose a change** | Problem → Options → Recommendation |
| **Status update** | Done → Doing → Blocked |
| **Explain tradeoff** | Option A vs B with clear criteria |
| **Escalate issue** | Context → Impact → Ask |

---

## Part 1: Technical Proposals

### Proposal Template

```markdown
# Proposal: [Title]

**Author:** @yourname
**Date:** 2026-01-26
**Status:** Draft | Under Review | Approved | Rejected

## Summary

One paragraph: What are you proposing and why?

## Problem

- What's the current pain point?
- What's the impact if we don't solve it?
- Who is affected?

## Proposed Solution

What are you recommending? Be specific.

### How It Works

1. Step one
2. Step two
3. Step three

### Effort Estimate

| Task | Time |
|------|------|
| Implementation | 3 days |
| Testing | 1 day |
| Documentation | 0.5 days |

**Total: ~5 days**

## Alternatives Considered

### Option A: [Name]
- Pros: X, Y
- Cons: Z

### Option B: [Name]
- Pros: A, B
- Cons: C

### Why This Solution

[Explain why your recommendation is better than alternatives]

## Risks

| Risk | Mitigation |
|------|------------|
| Risk 1 | How to handle |
| Risk 2 | How to handle |

## Next Steps

- [ ] Review with team
- [ ] Get stakeholder approval
- [ ] Create implementation plan
```

### Proposal Tips

| Do | Don't |
|----|-------|
| Lead with the problem | Start with the solution |
| Show alternatives you considered | Present only one option |
| Include effort estimates | Leave timeline vague |
| Be clear about tradeoffs | Hide downsides |

---

## Part 2: Explaining Tradeoffs

### Tradeoff Matrix Template

```markdown
## Database Choice: Supabase vs PlanetScale

| Criteria | Supabase | PlanetScale | Winner |
|----------|----------|-------------|--------|
| Setup time | 10 min | 15 min | Supabase |
| Built-in auth | ✅ Yes | ❌ No | Supabase |
| Branching | ❌ No | ✅ Yes | PlanetScale |
| Real-time | ✅ Yes | ❌ No | Supabase |
| Price (our usage) | $25/mo | $39/mo | Supabase |
| Team familiarity | High | Low | Supabase |

**Recommendation:** Supabase

**Rationale:** Built-in auth and real-time save 2+ weeks of development. Branching is nice-to-have, not critical for our workflow.
```

### Tradeoff Presentation Framework

1. **State the decision clearly** — "We need to choose between X and Y"
2. **Define criteria that matter** — What's important for this project?
3. **Score objectively** — Don't hide weaknesses
4. **Make a recommendation** — Don't make stakeholders decide
5. **Explain your reasoning** — Why does this tradeoff make sense?

### When Stakeholders Push Back

```
"I hear your concern about [their point]. 

Here's what we'd trade off if we go that direction:
- [Concrete impact 1]
- [Concrete impact 2]

I still recommend [your choice] because [key reason], 
but I'm open to [alternative] if [condition]."
```

---

## Part 3: Status Updates

### Weekly Status Template

```markdown
# Week of Dec 23, 2025

## ✅ Completed
- Shipped user onboarding flow
- Fixed checkout bug affecting 5% of users
- Deployed monitoring dashboards

## 🔄 In Progress
- Payment integration (70% complete)
- Performance optimization sprint

## 🚧 Blocked
- **API rate limits** — Waiting on vendor response (ETA: Dec 27)

## 📊 Metrics
- Users: 1,234 (+12% WoW)
- Revenue: $5.6K (+8% WoW)
- Uptime: 99.9%

## 🎯 Next Week
- Complete payment integration
- Start user testing for new dashboard
```

### Status Update Rules

| Include | Skip |
|---------|------|
| Completed work | Technical details |
| Blockers with ETA | Solved problems |
| Key metrics | Vanity metrics |
| Next priorities | Everything in backlog |

### Escalation vs Status Update

| Escalation | Status Update |
|------------|---------------|
| Needs action NOW | Informational |
| Ask is specific | No ask |
| Impact is clear | Progress report |
| Has deadline | Regular cadence |

---

## Part 4: Async Communication

### Slack/Message Best Practices

```
❌ Bad:
"Hey, got a sec?"

✅ Good:
"Question about the auth flow:
- Currently: Users get 401 on page refresh
- Tried: Token refresh on mount
- Stuck on: Race condition with multiple tabs

Can you take a look when you have 10 min?"
```

### Message Structure

```
[Context in 1 line]
- [Bullet point 1]
- [Bullet point 2]
- [Bullet point 3]

[Clear ask or next step]
```

### When to Use Each Channel

| Channel | Use For |
|---------|---------|
| Slack/Chat | Quick questions, FYIs |
| Email | External stakeholders, formal decisions |
| Doc/Notion | Proposals, specs, decisions |
| Meeting | Brainstorming, conflict resolution |
| PR comment | Code-specific feedback |

### Async Decision Making

```markdown
## Decision: [Topic]

**Deadline:** Friday 5pm

### Context
[Brief background]

### Options
1. **Option A** — [Description]
2. **Option B** — [Description]
3. **Option C** — [Description]

### My Recommendation
[Your pick with rationale]

### Please Reply With
- ✅ Agree with recommendation
- 🔄 Prefer different option (say which)
- ❓ Need more info (ask specific question)

If no response by deadline, moving forward with recommendation.
```

---

## Part 5: Presenting Options

### Three-Option Rule

Always present 3 options:

1. **Conservative** — Lowest risk, slowest
2. **Recommended** — Best balance
3. **Aggressive** — Fastest, highest risk

```markdown
## How to Launch Feature X

### Option 1: Full Testing (4 weeks)
- Complete regression testing
- User acceptance testing
- Staged rollout
- **Risk:** Low
- **Tradeoff:** Launch delayed

### Option 2: Targeted Testing (2 weeks) ⭐ Recommended
- Critical path testing only
- 10% rollout first
- Full rollout week 2
- **Risk:** Medium
- **Tradeoff:** Some edge cases may surface

### Option 3: Ship Now (0 weeks)
- Feature flag to 5% of users
- Fix issues as they come
- **Risk:** High
- **Tradeoff:** Potential user impact
```

### Make Recommendations Clear

```
"My recommendation is Option 2 because:
1. [Reason 1]
2. [Reason 2]

Happy to go with Option 1 if [condition]
or Option 3 if [condition]."
```

---

## Part 6: When to Escalate

### Escalation Template

```markdown
## 🚨 Escalation: [Issue Title]

**Severity:** High | Critical
**Reported by:** @yourname
**Date:** 2026-01-26

### What's Happening
[1-2 sentences describing the issue]

### Impact
- [Who/what is affected]
- [Revenue/user impact if quantifiable]
- [Timeline: How long has this been happening? When does it get worse?]

### What We've Tried
1. [Action 1]
2. [Action 2]
3. [Action 3]

### What We Need
[Specific ask: Decision? Resources? Expertise?]

### Deadline
[When do you need a response?]
```

### Escalation Decision Tree

```
Is there user/revenue impact?
├─ Yes → Is it getting worse?
│   ├─ Yes → Escalate NOW
│   └─ No → Can you fix in 24h?
│       ├─ Yes → Fix it, then inform
│       └─ No → Escalate with timeline
└─ No → Is it blocking your work?
    ├─ Yes → Ask for help, not escalation
    └─ No → Add to backlog
```

### Escalation Etiquette

| Do | Don't |
|----|-------|
| State impact clearly | Panic without data |
| Propose solutions | Just dump the problem |
| Give a deadline | Leave it open-ended |
| Follow up if no response | Assume they saw it |

---

## Part 7: Templates Gallery

### Quick Decision Ask

```
Need a decision on [topic]:

**Context:** [1 sentence]
**Options:** A or B
**Recommendation:** A because [reason]
**Deadline:** [date]

Reply with ✅ or 🔄 to proceed.
```

### Blocking Issue Report

```
🚧 Blocked on [task]

**Blocker:** [description]
**Impact:** Can't proceed with [downstream work]
**Need:** [specific ask — approval, access, decision]
**By when:** [deadline]
```

### Meeting Request

```
Meeting request: [topic] (30 min)

**Goal:** [specific outcome]
**Prep needed:** [link to doc or "none"]
**Attendees:** [who and why they're needed]

Proposing: [date/time] or [date/time]
```

### Post-Mortem Summary

```
## Incident: [Title]

**Date:** 2026-01-26
**Duration:** 2 hours
**Impact:** [users/revenue affected]

### Timeline
- HH:MM — Issue detected
- HH:MM — Root cause identified
- HH:MM — Fix deployed
- HH:MM — Verified resolved

### Root Cause
[1-2 sentences]

### Action Items
- [ ] [Preventative measure 1]
- [ ] [Preventative measure 2]
```

---

## Checklist

Before sending:

- [ ] Lead with the point (inverted pyramid)
- [ ] Clear ask or next step
- [ ] Right channel for the message
- [ ] Deadline if action needed
- [ ] Proofread for clarity

---

## Resources

- [Writing Well](https://www.amazon.com/Writing-Well-Classic-Guide-Nonfiction/dp/0060891548)
- [Basecamp's Guide to Internal Communication](https://basecamp.com/guides/how-we-communicate)
- [Loom](https://loom.com) — Async video updates

---

## Related Skills

- `documentation/SKILL.md` — Written docs
- `roadmap/SKILL.md` — Project timelines
- `product-spec/SKILL.md` — Feature specs
