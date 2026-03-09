# Project Roadmap Skill

**Auto-generate client-facing roadmaps with 3-tier time estimates.**

---

## Context Questions

Before creating a roadmap, ask:

1. **Who's the audience?** — Client, team, investors, personal tracking
2. **What's the project type?** — SaaS, mobile app, website, internal tool
3. **What's the timeline style?** — Fixed deadline, flexible, milestone-based
4. **What's the estimation approach?** — Traditional, hybrid, vibe coder accelerated
5. **How much scope flexibility?** — Fixed scope, negotiable, evolving

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| Detail | High-level milestones ←→ Task-level breakdown |
| Formality | Internal notes ←→ Client deliverable |
| Flexibility | Fixed timeline ←→ Agile/adaptive |
| Tracking | Manual updates ←→ Automated velocity |
| Communication | Async updates ←→ Regular sync meetings |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Client project | Show both traditional and accelerated timelines |
| Solo dev | Simple Now/Next/Later format, minimal overhead |
| Scope creep risk | Template for scope change requests, impact analysis |
| Fixed deadline | Work backward from deadline, buffer time |
| Team handoff | Detailed milestones, acceptance criteria, dependencies |
| Investor pitch | Focus on key milestones, value delivery timeline |

---

## TL;DR

| Estimate Type | Use For | Formula |
|---------------|---------|---------
| **Traditional** | Client quotes, conservative | Baseline dev time |
| **Hybrid** | Internal planning | 50-70% of traditional |
| **Vibe Coder** | Your actual delivery | 20-40% of traditional + 20% buffer |

**Always show clients 2 timelines: Traditional (quoted) + Your delivery (faster).**

---

## Part 1: 3-Tier Time Estimation

### Feature Examples

| Feature | Traditional | Hybrid | Vibe Coder (You) |
|---------|-------------|--------|------------------|
| User auth (Clerk) | 8-12 hours | 4-6 hours | 2-3 hours |
| Stripe payments | 16-24 hours | 8-12 hours | 4-6 hours |
| Dashboard UI | 40-60 hours | 20-30 hours | 10-15 hours |
| Email system | 12-16 hours | 6-8 hours | 3-4 hours |
| SMS integration | 8-12 hours | 4-6 hours | 2-4 hours |
| Analytics dashboard | 20-30 hours | 10-15 hours | 5-8 hours |

### Project Examples

| Project Type | Traditional | Hybrid | Vibe Coder | Notes |
|--------------|-------------|--------|------------|-------|
| Landing page | 2-3 weeks | 1-2 weeks | 3-5 days | Includes revisions |
| SaaS MVP | 8-12 weeks | 4-6 weeks | 2-4 weeks | Core features only |
| Full dashboard | 12-16 weeks | 6-8 weeks | 4-6 weeks | With payments |
| E-commerce | 20-24 weeks | 10-12 weeks | 6-10 weeks | Full stack |
| Mobile app | 16-20 weeks | 8-10 weeks | 5-8 weeks | React Native |

---

## Part 2: Milestone Tracking

### Milestone Template

```markdown
## Milestone 1: MVP Core
**Target Date:** [Date]
**Phase:** Alpha

### Deliverables
- [ ] User authentication working
- [ ] Core feature complete
- [ ] Database schema finalized
- [ ] Basic UI in place

### Acceptance Criteria
- User can sign up and log in
- User can [perform core action]
- Data persists across sessions
- Mobile responsive

### Dependencies
- Clerk account set up
- Supabase project created
- Domain configured

### Risks
| Risk | Mitigation |
|------|------------|
| API changes | Pin versions |
| Scope creep | Weekly check-ins |
```

### Milestone Phases

| Phase | Purpose | Exit Criteria |
|-------|---------|---------------|
| **Alpha** | Core functionality | It works (ugly ok) |
| **Beta** | Polished + tested | Ready for users |
| **Launch** | Production ready | Monitoring in place |

---

## Part 3: Client-Facing Roadmaps

### Now-Next-Later Format

```markdown
# [Project Name] - Roadmap

## NOW (Weeks 1-X)
✅ **Alpha Phase**
- [ ] Feature A (Est: X days traditional, Y days AI-assisted)
- [ ] Feature B
- [ ] Feature C

**Timeline:** Traditional X weeks | Accelerated: Y weeks
**Deliverable:** Working prototype

## NEXT (Weeks X-Z)
🟡 **Beta Phase**
- [ ] Feature D
- [ ] Feature E
- [ ] Polish & testing

**Timeline:** Traditional X weeks | Accelerated: Y weeks
**Deliverable:** Near-final product

## LATER (Post-Launch)
⚪ **Enhancements**
- [ ] Feature F
- [ ] Feature G

**Timeline:** Based on feedback
```

---

## Part 4: Client Communication Templates

### Weekly Update Template

```markdown
# Weekly Update - [Date]

## Progress This Week
✅ **Completed:**
- Feature A shipped
- Bug fixes deployed
- Design review done

🔄 **In Progress:**
- Feature B (70% complete)
- Testing setup

## Next Week
- Complete Feature B
- Start Feature C
- Client review call

## Timeline Status
🟢 **On Track** | 🟡 At Risk | 🔴 Delayed

## Blockers
None currently (or list them)

## Questions for Client
1. [Any decisions needed]
```

### Milestone Completion Template

```markdown
# Milestone Complete: [Name]

## Delivered
- Feature list
- Live URL: [link]
- Documentation: [link]

## What's Next
- [Next milestone]
- Estimated: [timeline]

## Feedback Needed
- [ ] Review [feature]
- [ ] Approve [design]
- [ ] Test [flow]

**Response needed by:** [Date]
```

---

## Part 5: Scope Creep Handling

### The Rule
**Every new request gets the same treatment:**

1. Acknowledge the request
2. Estimate impact on timeline
3. Present options
4. Get written approval

### Scope Change Template

```markdown
# Scope Change Request

## Request
[Client's request in their words]

## Impact Analysis
| Metric | Before | After |
|--------|--------|-------|
| Timeline | 6 weeks | 7 weeks |
| Cost | $X | $Y |
| Features | 8 | 9 |

## Options

### Option A: Add to Current Phase
- Timeline: +1 week
- Cost: +$X
- Delivers: [date]

### Option B: Replace Existing Feature
- Timeline: Same
- Cost: Same
- Trade-off: [Feature Z moved to Phase 2]

### Option C: Add to Phase 2
- Timeline: After launch
- Cost: Quoted separately
- No current impact

## Recommendation
[Your recommendation with reasoning]

## Approval
- [ ] Client approves Option [X]
- Date: 
- Signed:
```

### Response Script

```
"Great idea! Here's how it would affect the project:
- Timeline impact: +X days
- Cost impact: +$Y

Would you like to:
A) Add it now (extends timeline)
B) Swap it for [other feature]  
C) Add to Phase 2 (post-launch)

Let me know and I'll update the roadmap!"
```

---

## Part 6: Velocity Tracking

### Weekly Velocity Log

```markdown
| Week | Estimated | Completed | Velocity |
|------|-----------|-----------|----------|
| 1 | 20 pts | 18 pts | 90% |
| 2 | 20 pts | 22 pts | 110% |
| 3 | 20 pts | 16 pts | 80% |
| **Avg** | - | - | **93%** |
```

### Adjusting Estimates

```markdown
## Velocity-Based Adjustment

Current average velocity: 93%
Remaining work: 60 pts

**Original estimate:** 3 weeks (20 pts/week)
**Adjusted estimate:** 3.2 weeks (60 ÷ (20 × 0.93))

Round up: ~3.5 weeks
```

### Story Points Reference

| Size | Points | Time (Vibe Coder) |
|------|--------|-------------------|
| Tiny | 1 | < 1 hour |
| Small | 2 | 1-2 hours |
| Medium | 3 | 2-4 hours |
| Large | 5 | 4-8 hours |
| XL | 8 | 1-2 days |
| Epic | 13+ | Break it down |

---

## Part 7: Dual Timeline Strategy

### What Clients See

```markdown
## Project Timeline

### Conservative Estimate (Traditional Development)
**Total:** 12 weeks
- Planning: 1 week
- Development: 8 weeks
- Testing: 2 weeks
- Launch: 1 week

### Accelerated Estimate (AI-Assisted)
**Total:** 5-6 weeks
- Planning: 3 days
- Development: 3-4 weeks
- Testing: 1 week
- Launch: 3 days

**We aim for the accelerated timeline but quote the conservative.**
```

**Why:** Underpromise, overdeliver. Charge traditional, deliver fast.

---

## Part 8: Risk Management

### Risk Register Template

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| API breaks | Low | High | Pin versions, monitor changelog |
| Scope creep | High | Medium | Weekly scope review |
| Client delays | Medium | High | Buffer in timeline |
| Tech issues | Medium | Medium | Backup solutions ready |

### Contingency Buffer

| Project Size | Buffer |
|--------------|--------|
| Small (< 2 weeks) | +2 days |
| Medium (2-6 weeks) | +1 week |
| Large (6+ weeks) | +2 weeks |

---

## Quick Reference

### Timeline Conversation

```
"For this project, traditional development would take 12 weeks.
With my AI-assisted workflow, I can deliver in 5-6 weeks.
I'll quote you the 12-week timeline for safety, but expect
faster delivery. Sound good?"
```

### Scope Creep Response

```
"Love the idea! Quick impact check:
- Current timeline: Week 6 delivery
- With this change: Week 7 delivery
- Cost: +$X

Want me to add it, swap something, or save for Phase 2?"
```

---

## Resources

- Reference: `workflows/product-spec/SKILL.md`
- Time tracking: `agents/analytics/SKILL.md`
- Client emails: `agents/email/SKILL.md`

---

## Related Skills

- `workflows/product-spec/SKILL.md` - Generate specs from ideas
- `workflows/ship-fast/SKILL.md` - Rapid delivery patterns
- `agents/analytics/SKILL.md` - Track actual time spent

