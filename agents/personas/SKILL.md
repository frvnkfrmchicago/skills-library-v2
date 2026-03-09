---
name: personas
description: User personas. JTBD, journey mapping, empathy maps, AI-generated personas.
last_updated: 2026-03
owner: Frank
---

# User Personas

Understand your users to build what they actually need.

> **See also:** `workflows/product-spec/SKILL.md`, `agents/analytics/SKILL.md`

---

## Context Questions

Before creating personas:

1. **What's the project stage?** — Pre-launch (assumptions), post-launch (data-driven)
2. **Who are you building for?** — B2C consumers, B2B buyers, internal users
3. **What decisions will personas inform?** — Features, marketing, pricing, UX
4. **How many user types exist?** — Single persona, multi-segment, marketplace
5. **What research exists?** — Interviews, surveys, analytics, nothing yet

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Data Source** | Assumption-based ←→ Research-validated |
| **Granularity** | Broad segments ←→ Specific archetypes |
| **Focus** | Demographics ←→ Behaviors/Goals |
| **Count** | Single persona ←→ Multi-persona matrix |
| **Update Frequency** | Static ←→ Continuously refined |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Pre-launch, no users | Proto-personas from assumptions + interviews |
| Post-launch with data | Behavioral segmentation from analytics |
| B2C product | Focus on goals, frustrations, media habits |
| B2B product | Focus on role, buying power, objections |
| Feature prioritization | Use persona scoring matrix |
| Marketing campaigns | Lead with demographics + channels |

---

## TL;DR

| Framework | Purpose |
|-----------|---------|
| **Personas** | Who is your user? |
| **JTBD** | What are they trying to accomplish? |
| **Journey Map** | What's their experience over time? |
| **Empathy Map** | What do they think/feel/do? |

---

## Part 1: Persona Creation Framework

### Research Methods

| Method | Best For | Effort |
|--------|----------|--------|
| **User Interviews** | Deep insights | High |
| **Surveys** | Quantitative data | Medium |
| **Analytics** | Behavioral patterns | Low |
| **Support Tickets** | Pain points | Low |
| **Social Listening** | Unfiltered opinions | Medium |

### Interview Questions

```markdown
## Discovery Interview Script

### Background (5 min)
1. Tell me about yourself and your role.
2. How long have you been doing [activity]?

### Current Behavior (10 min)
3. Walk me through the last time you [did task].
4. What tools do you currently use?
5. What's frustrating about your current process?

### Goals (5 min)
6. What would success look like for you?
7. If you could wave a magic wand, what would change?

### Closing (5 min)
8. Anything else I should know?
9. Would you be open to testing our solution?
```

### Synthesis Process

1. **Collect notes** from 5-10 interviews minimum
2. **Affinity mapping** — Group similar quotes/insights
3. **Find patterns** — What do multiple users say?
4. **Create segments** — Group users by behavior, not demographics
5. **Build personas** — One per segment

---

## Part 2: Persona Template

### B2C Persona Template

```markdown
# Persona: Sarah the Side Hustler

![Placeholder: 30s woman, professional casual](avatar)

## Demographics
- **Age:** 28-35
- **Location:** Urban, US
- **Income:** $50-80k from day job
- **Tech savvy:** High

## Bio
Sarah works a 9-5 marketing job but runs an Etsy shop on the side. 
She dreams of going full-time on her business but needs to 
increase revenue consistently first.

## Goals
- Grow side business to match salary
- Automate repetitive tasks
- Make data-driven decisions
- Eventually quit day job

## Frustrations
- Not enough time after work
- Overwhelmed by tools and options
- Hard to track what's working
- Feels alone in the journey

## Behaviors
- Checks phone 50+ times/day
- Heavy Instagram/TikTok user
- Listens to business podcasts
- Takes online courses

## Quote
"I just need something that works so I can focus on creating."

## How We Help
- Simple dashboard, not 50 features
- Quick wins visible immediately
- Mobile-first (she's always on phone)
- Community of other creators
```

### B2B Persona Template

```markdown
# Persona: Mike the Engineering Manager

## Role
- **Title:** Engineering Manager
- **Company size:** 50-200 employees
- **Team size:** 5-12 engineers
- **Reports to:** VP of Engineering

## Responsibilities
- Sprint planning and delivery
- Hiring and team growth
- Technical decisions
- Developer productivity

## Goals
- Ship faster without sacrificing quality
- Keep developers happy (retention)
- Reduce technical debt
- Look good to leadership

## Pain Points
- Too many meetings
- Context switching
- Unclear requirements from product
- Legacy code slowing team down

## Buying Behavior
- Tries free tier first
- Needs to prove ROI to VP
- Wants case studies from similar companies
- 30-day evaluation typical

## Objections
- "We already have a tool for this"
- "My team won't adopt it"
- "What about security/compliance?"

## Quote
"I need to show my VP that this will actually save us time."
```

---

## Part 3: Jobs-to-be-Done (JTBD)

### JTBD vs Personas

| Personas | JTBD |
|----------|------|
| Who is the user? | What are they trying to accomplish? |
| Static attributes | Situational context |
| "Sarah is 28, uses iPhone" | "When I want to grow my business, I want to automate tasks" |

### Job Statement Format

```
When [situation], I want to [motivation], so I can [outcome].
```

### Examples

```markdown
## Job: Manage Side Business Revenue

When I'm trying to grow my side business while working full-time,
I want to see all my revenue and expenses in one place,
So I can know if I'm actually making money and when I can quit.

## Related Jobs
- Track time spent on business vs reward
- Identify best-selling products
- Know when to raise prices
- Celebrate milestones

## Pains
- Currently using 5 different tools
- Numbers don't match up
- Takes 2 hours to do monthly review

## Gains
- Instant dashboard
- Automatic categorization
- "Quit your job" countdown
```

### When to Use JTBD vs Personas

- **Personas:** When designing for WHO (marketing, messaging)
- **JTBD:** When designing for WHAT (features, product)
- **Both:** Most comprehensive understanding

---

## Part 4: User Journey Mapping

### Journey Map Template

```
┌──────────────────────────────────────────────────────────────────┐
│ STAGE:     Aware    Consider    Try      Buy      Use    Advocate│
├──────────────────────────────────────────────────────────────────┤
│ DOING:     Research Compare   Sign up   Pay    Onboard   Share  │
│            options  features  free      cancel  use      refer  │
├──────────────────────────────────────────────────────────────────┤
│ THINKING:  "What    "Is this  "Hope    "Worth  "How do  "My     │
│            options  the right  this     it?"    I..."    friend │
│            exist?"  one?"     works"                     needs" │
├──────────────────────────────────────────────────────────────────┤
│ FEELING:   Curious  Anxious   Hopeful  Nervous Happy    Proud   │
│            😊       😰        🤞       😬      😊       🎉      │
├──────────────────────────────────────────────────────────────────┤
│ TOUCHPTS:  Google   Website   App      Email   Support  Social  │
│            TikTok   Reviews   Demo     Chat    Docs     Refer   │
├──────────────────────────────────────────────────────────────────┤
│ PAIN PTS:  Too many Confusing Can't    Too     Steep    None    │
│            options  pricing   find X   expensive curve  provided│
└──────────────────────────────────────────────────────────────────┘
```

### Moments of Truth

1. **First Impression** — Website/app load
2. **Aha Moment** — First value delivered
3. **Commitment** — Payment decision
4. **Recovery** — After something goes wrong

---

## Part 5: Empathy Maps

### Template

```
           ┌─────────────────────────────────────┐
           │              SAYS                   │
           │  "I don't have time for this"       │
           │  "Just make it simple"              │
           │  "I tried X, it didn't work"        │
           └─────────────────────────────────────┘
┌─────────────────────┐         ┌─────────────────────┐
│       THINKS        │         │        DOES         │
│ "Am I wasting time?"│         │ Opens 10 tabs       │
│ "This better work"  │  USER   │ Asks friends        │
│ "Competition ahead" │         │ Starts and stops    │
└─────────────────────┘         └─────────────────────┘
           ┌─────────────────────────────────────┐
           │              FEELS                  │
           │  Overwhelmed by options             │
           │  Anxious about making wrong choice  │
           │  Excited about potential            │
           └─────────────────────────────────────┘
```

### Pains and Gains

```markdown
## Pains (What frustrates them)
- Too many steps to accomplish task
- Can't find what they need
- Feels judged for not knowing
- Previous solutions failed them

## Gains (What delights them)
- Quick wins visible immediately
- Feels smart using the product
- Saves time for important things
- Gets compliments on results
```

---

## Part 6: Behavioral Segments

### Data-Driven Personas

```python
# Clustering users by behavior
from sklearn.cluster import KMeans

features = [
    'login_frequency',
    'feature_usage_score',
    'time_to_first_value',
    'support_tickets',
    'referrals_made'
]

# Cluster into 3-5 segments
kmeans = KMeans(n_clusters=4)
user_segments = kmeans.fit_predict(user_data[features])
```

### Segment Examples

| Segment | Behavior | Need |
|---------|----------|------|
| **Power Users** | Daily use, many features | Advanced features, shortcuts |
| **Casual Users** | Weekly, core features only | Simplicity, reminders |
| **At-Risk** | Declining usage | Re-engagement, check-in |
| **Champions** | High referrals | Ambassador program |

---

## Part 7: AI Persona Generation

### Using AI for Research Synthesis

```markdown
## Prompt: Synthesize Interview Notes

I conducted 8 user interviews. Here are my notes:

[paste notes]

Please:
1. Identify 3-4 distinct user segments
2. For each segment, create a persona with:
   - Name and demographic
   - Goals and motivations
   - Pain points
   - Behaviors
   - Quote that represents them
3. Note any surprising patterns
```

### AI-Generated Persona Validation

```markdown
## Prompt: Validate Persona

Here's a persona I created:

[paste persona]

Please critique:
1. Is this specific enough? Or too generic?
2. What assumptions am I making?
3. What questions should I ask to validate?
4. What's missing that would help product decisions?
```

### Bias Considerations

- AI reflects training data biases
- Always validate with real users
- Don't rely solely on AI-generated insights
- Use AI as starting point, not final answer

---

## Part 8: Personas in Development

### User Stories from Personas

```markdown
## Bad User Story
"As a user, I want to log in."

## Good User Story (Persona-based)
"As Sarah (side hustler), I want to see my revenue dashboard 
immediately after opening the app so I can check my progress 
during my lunch break."
```

### Acceptance Criteria

```markdown
## Feature: Quick Stats Widget

### Persona: Sarah (time-constrained)

**Given** Sarah opens the app
**When** the dashboard loads
**Then** she sees today's revenue within 2 seconds
**And** can compare to yesterday with one tap
**And** feels confident business is on track
```

### Feature Prioritization

| Feature | Sarah Score | Mike Score | Priority |
|---------|-------------|------------|----------|
| Mobile app | 10 | 3 | High (core user) |
| Team permissions | 2 | 10 | High (B2B) |
| Export to Excel | 5 | 8 | Medium |
| Dark mode | 7 | 5 | Low |

---

## Checklist

```markdown
- [ ] 5+ user interviews completed
- [ ] Affinity mapping done
- [ ] 2-4 personas created
- [ ] JTBD statements written
- [ ] Journey map for main flow
- [ ] Empathy map for primary persona
- [ ] Personas shared with team
- [ ] Features mapped to personas
```

---

## Resources

- Jobs-to-be-Done: <https://jtbd.info/>
- Empathy Map: <https://www.nngroup.com/articles/empathy-mapping/>
- Journey Map: <https://www.nngroup.com/articles/journey-mapping-101/>
- User Interviews: <https://www.userinterviews.com/>

---

## Related Skills

- `workflows/product-spec/SKILL.md` — PRDs from personas
- `agents/analytics/SKILL.md` — Behavioral data
- `content/copy/SKILL.md` — Writing for personas
