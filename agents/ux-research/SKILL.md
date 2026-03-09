---
name: ux-research
description: AI-accelerated UX research. Continuous research, interview synthesis, behavioral analytics.
last_updated: 2026-03
owner: Frank
---

# UX Research (AI-First)

AI-accelerated research. Continuous insights while shipping. Real-time synthesis.

> **See also:** `agents/usability-testing/SKILL.md`, `agents/personas/SKILL.md`

---

## Context Questions

Before starting research:

1. **What's the research goal?** — Discovery, validation, optimization
2. **What method fits?** — Interviews, surveys, analytics, testing
3. **What's the timeline?** — Days, weeks, ongoing
4. **Who participates?** — Users, prospects, internal, mixed
5. **How will insights be used?** — Strategy, features, messaging

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Depth** | Quick pulse ←→ Deep qualitative |
| **Scale** | Few interviews ←→ Large survey |
| **Speed** | Rapid (days) ←→ Comprehensive (weeks) |
| **Source** | Behavioral data ←→ Direct feedback |
| **Cadence** | One-off ←→ Continuous |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Early discovery | 5-8 interviews + synthesis |
| Validation needed | Survey with quantitative data |
| Live product | Behavioral analytics + session recordings |
| Quick insights | AI-assisted interview analysis |
| Ongoing program | Continuous research cadence |
| Cross-functional | Research repository + insight cards |

---

## TL;DR

| Research Type | Traditional | AI-First 2025 |
|---------------|-------------|---------------|
| **Interviews** | 2-4 weeks | 3-5 days |
| **Surveys** | 1-2 weeks | 1-3 days |
| **Synthesis** | Days | Hours |
| **Insights** | Manual | AI-generated |

---

## 1. AI-First Research Principles

### Core Shifts

| Traditional | AI-First |
|-------------|----------|
| Separate from development | Integrated with development |
| Before building | Continuous (while shipping) |
| Takes weeks | Takes days |
| Research team only | Whole team participates |

### What AI Handles

```
AI does:
✅ Transcription (real-time)
✅ Tagging and categorization
✅ Theme extraction
✅ Sentiment analysis
✅ Quote identification
✅ Summary generation

Humans do:
✅ Strategy and planning
✅ Nuanced interpretation
✅ Stakeholder communication
✅ Final decision making
✅ Ethical considerations
```

---

## 2. Tools 2025-2026

### Interview & Synthesis

| Tool | AI Features | Best For | Price |
|------|-------------|----------|-------|
| **Dovetail** | Auto-transcribe, themes, insights | Enterprise | $29+/mo |
| **Notably** | AI synthesis, highlight extraction | Mid-market | $25/mo |
| **Looppanel** | Call recording + analysis | Startup | $30/mo |
| **Grain** | Video highlights | Meetings | $19/mo |

### Survey & Quantitative

| Tool | AI Features | Best For |
|------|-------------|----------|
| **Sprig** | In-product surveys, AI analysis | Live product |
| **Typeform** | Conversational forms | Engagement |
| **Maze** | Prototype + survey combo | Design research |

### Behavioral Analytics

| Tool | AI Features | Best For |
|------|-------------|----------|
| **FullStory** | Session replay, frustration detection | Enterprise |
| **PostHog** | Recordings, funnels, AI insights | Product teams |
| **Hotjar** | Heatmaps, recordings | SMB |
| **Amplitude** | Behavioral cohorting | Growth |

---

## 3. Interview Research

### Recruitment

**Sources:**

| Source | Speed | Cost | Quality |
|--------|-------|------|---------|
| **Respondent.io** | 24-48 hrs | $60-100+ per | High |
| **UserInterviews** | 24-72 hrs | $50-200 per | High |
| **Your users** | Variable | Free | Highest |
| **Social media** | Fast | Free-Low | Variable |

**Screener Questions:**

```
Essential:
1. [Qualifying behavior] "How often do you [target action]?"
2. [Exclusions] "Do you work in [exclude industries]?"
3. [Experience level] "How long have you been [using category]?"

Optional:
4. [Competitor usage] "What tools do you currently use for [task]?"
5. [Willingness] "Are you available for a 45-min video call this week?"
```

### Interview Guide Template

```markdown
# Interview Guide: [Research Topic]

## Research Questions
1. [What we're trying to learn]
2. [Another question]

## Participant Criteria
- [Criterion 1]
- [Criterion 2]

---

## Interview Script

### Intro (3 min)
- Thanks for joining
- Recording consent
- Confidentiality
- No right/wrong answers

### Warm-up (5 min)
- Tell me about your role
- Walk me through a typical day when you [relevant activity]

### Main Questions (25 min)

**Topic 1: Current Behavior**
- How do you currently [task]?
- Walk me through the last time you [task]
- What worked well? What was frustrating?

**Topic 2: Pain Points**
- What's the hardest part about [task]?
- Tell me about a time when [task] went wrong
- How did you solve that?

**Topic 3: Ideal State**
- If you could wave a magic wand, what would change?
- What would that enable you to do?

### Prototype/Concept (10 min)
- [Show prototype]
- What's your first impression?
- Walk me through what you see
- What would you do first?

### Wrap-up (5 min)
- Anything else you want to share?
- Can I follow up with questions?
- Would you like to be in future research?
```

### AI Synthesis Workflow

```
1. Record interview (Zoom, Grain, etc.)
2. Auto-transcribe (Dovetail, Otter)
3. Highlight key quotes while reviewing
4. AI extracts themes automatically
5. Review and refine AI themes
6. Generate insight cards
7. Share with team
```

**Claude Synthesis Prompt:**

```
Analyze these interview transcripts and identify:

1. Top 5 themes (with supporting quotes)
2. Pain points (severity: high/medium/low)
3. Jobs to be done
4. Opportunities (what would delight users)
5. Surprises (things that challenged assumptions)

Format each insight as:
[INSIGHT]: One sentence finding
[EVIDENCE]: 2-3 supporting quotes
[IMPLICATION]: What this means for product
```

---

## 4. Survey Research

### When to Use

```
✅ Good for:
- Quantifying qualitative findings
- Prioritizing features
- NPS/CSAT measurement
- Broad audience reach
- Benchmarking over time

❌ Not for:
- Understanding "why"
- Early exploration
- Complex topics
- Nuanced feedback
```

### Survey Best Practices

```
Length: 5-10 minutes max (or <15 questions)
Format: Mobile-friendly
Incentive: $5-20 for 10-min survey

Question Order:
1. Easy warm-up (multiple choice)
2. Core questions (rating scales)
3. Open-ended (limited)
4. Demographics (last)
```

### Question Types

| Type | When to Use | Example |
|------|-------------|---------|
| **Likert scale** | Attitudes, satisfaction | "How easy was it?" 1-5 |
| **Multiple choice** | Behaviors, preferences | "Which do you use most?" |
| **Ranking** | Priorities | "Rank features 1-5" |
| **Open-ended** | Deep insights (use sparingly) | "What would you improve?" |
| **NPS** | Loyalty benchmark | "How likely to recommend?" 0-10 |

### AI Analysis

**Analyzing Open-Ended Responses:**

```
Prompt:
"Categorize these survey responses into themes. 
For each theme, provide:
- Theme name
- Count of responses
- Representative quotes (3 max)
- Sentiment (positive/negative/neutral)

Responses:
[Paste responses]"
```

---

## 5. Behavioral Analytics

### What to Track

```typescript
interface BehavioralMetrics {
  // Engagement
  activeUsers: {
    daily: number
    weekly: number
    monthly: number
  }
  
  // Retention
  retention: {
    day1: number   // % return after 1 day
    day7: number   // % return after 7 days
    day30: number  // % return after 30 days
  }
  
  // Feature adoption
  featureUsage: {
    [feature: string]: {
      users: number
      frequency: number
      completion: number
    }
  }
  
  // Friction
  dropOff: {
    step: string
    rate: number
    reasons?: string[]
  }[]
}
```

### Session Recording Analysis

**What to Look For:**

| Signal | Indicates |
|--------|-----------|
| Rage clicks | Frustration, broken element |
| Dead clicks | Misleading affordance |
| Backtracking | Confusion, wrong navigation |
| Long pauses | Cognitive load, confusion |
| Error states | Technical or UX issues |
| Fast completion | Good flow (or skipping) |

### AI-Powered Insights

PostHog, FullStory, and Amplitude offer:
- Automatic frustration detection
- Anomaly alerts
- Cohort identification
- Predictive analytics
- Natural language querying

---

## 6. Continuous Research

### Research Cadence

```
Weekly:
- Review analytics dashboard (15 min)
- Check session recordings (30 min)
- Scan support tickets (15 min)

Bi-weekly:
- 2-3 user interviews (ongoing recruitment)

Monthly:
- Survey pulse check
- Synthesis session with team
- Update research repository

Quarterly:
- Deep-dive study (larger sample)
- Benchmark survey
- Research roadmap planning
```

### Research Repository

```
/research/
  /interviews/
    /2025-01/
      - participant-001.md
      - participant-002.md
  /surveys/
    /q1-nps.md
    /feature-prioritization.md
  /insights/
    - theme-navigation-confusion.md
    - theme-onboarding-friction.md
  /artifacts/
    - persona-power-user.md
    - journey-map-signup.md
```

### Insight Card Template

```markdown
# Insight: [Title]

## Summary
[One sentence finding]

## Evidence
- Quote: "[Quote 1]" — P01
- Quote: "[Quote 2]" — P03
- Data: [Supporting metric]

## Confidence
- High / Medium / Low
- Based on: [X interviews, Y survey responses]

## Impact
- Affects: [User segment or flow]
- Severity: High / Medium / Low

## Recommendations
1. [Action 1]
2. [Action 2]

## Status
- [ ] Reviewed by team
- [ ] Added to roadmap
- [ ] Shipped
```

---

## 7. Research Operations

### Participant Management

```
Database fields:
- Name, email
- Demographics
- Past participation dates
- Incentive history
- Opt-in preferences
- Notes from sessions

Tools:
- Airtable, Notion (DIY)
- Rally, Great Question (dedicated)
```

### Incentives

| Duration | Incentive | Format |
|----------|-----------|--------|
| 15 min | $20-30 | Gift card |
| 30 min | $40-75 | Gift card |
| 60 min | $100-150 | Gift card |
| Diary study | $150-300 | Gift card |

### Consent & Privacy

```markdown
## Research Consent Template

By participating, you agree:
- Session will be recorded
- Recordings used internally only
- You may stop at any time
- No identifying info in reports
- Data stored securely for [X months]

[Checkbox] I consent to participate
[Checkbox] I consent to be contacted for future research
```

---

## 8. Reporting & Sharing

### Research Debrief Format

```markdown
# Research Debrief: [Study Name]

## Quick Summary (30 sec read)
[3-5 bullets of key findings]

## Methodology
- Method: [Interviews / Survey / Analytics]
- Participants: [N = X, criteria]
- Dates: [Date range]

## Key Findings

### Finding 1: [Title]
- [Evidence]
- [Implication]

### Finding 2: [Title]
- [Evidence]
- [Implication]

## Recommendations
| Priority | Recommendation | Effort |
|----------|---------------|--------|
| P0 | [Fix X] | Low |
| P1 | [Build Y] | Medium |

## Appendix
- Link to full notes
- Link to recordings
- Link to raw data
```

### Sharing Insights

**Atomic Research:**
Break findings into reusable atoms:
- Observations (what you saw)
- Insights (what it means)
- Recommendations (what to do)

**Integration Points:**
- Slack channel for insights
- Weekly standup summary
- Linked in ticket/story creation
- Research repository wiki

---

## Checklist

- [ ] Research tool stack selected
- [ ] Participant recruitment source identified
- [ ] Interview guide template created
- [ ] AI synthesis workflow documented
- [ ] Research repository set up
- [ ] Consent template approved
- [ ] Team training on research access
- [ ] Continuous research cadence established

---

## Related Skills

- [Usability Testing](/agents/usability-testing/SKILL.md) — Tactical testing
- [Analytics](/agents/analytics/SKILL.md) — Quantitative tracking
- [Personas](/agents/personas/SKILL.md) — User archetypes
- [Growth Hacking](/agents/growth-hacking/SKILL.md) — Research for growth
- [A11y](/agents/a11y/SKILL.md) — Inclusive research
