---
name: tech-advising
description: >
  Provides research-backed technology stack recommendations using a
  multi-factor evaluation framework. Covers audience fit, team alignment,
  ecosystem maturity, future output, and current 2026 benchmarks. Includes
  research methodology, evidence-based scoring, and structured comparison
  output. Use when choosing a tech stack, evaluating frameworks, comparing
  tools, researching current trends, or when user asks "what should I use".
---

# Tech Advising

Research-backed tech stack recommendations. Every recommendation is backed
by current data, not assumptions.

---

## ⛔ STOP — Context Lock First

Before ANY recommendation, fill this:

```markdown
## Project Context

**Building:** [What the project is]
**Industry:** [Domain/vertical]
**Target Users:** [Audience profile]
**Team Skills:** [What team knows vs needs to learn]
**Timeline:** [Days / Weeks / Months]
**Budget:** [Free tier / $X/month / Enterprise]
**Scale:** [Expected users, data volume, growth]
**Special Needs:** [Compliance, integrations, legacy]
```

DO NOT skip this. Recommendations without context are guesses.

---

## Evaluation Framework

Score each option across these dimensions:

| Factor | Weight | What to Evaluate |
|--------|--------|-----------------|
| **Audience Fit** | High | Does the stack serve your users? (Gen Z ≠ Enterprise) |
| **Team Alignment** | High | Learning curve? Can the team ship with this? |
| **Ecosystem Maturity** | Medium | Package ecosystem, community, StackOverflow answers |
| **Future Output** | High | How easy to add features? Scale? Pivot? |
| **Update Complexity** | Medium | Upgrade path, breaking changes, LTS availability |
| **Methodology Fit** | Medium | Agile-friendly? MVP-capable? Enterprise patterns? |
| **Current Data** | High | What do 2026 benchmarks, Reddit, HN say right now? |

---

## Research Methodology

### Step 1: Define Search Queries

For each option, run these searches:

| Query Type | Template |
|------------|----------|
| Benchmarks | "[framework] performance benchmarks 2026" |
| Community | "[tool] reddit developer review 2026" |
| Production | "[tool] production experience large scale" |
| Comparison | "[tool A] vs [tool B] 2026" |
| Pain points | "[tool] problems issues migration" |

### Step 2: Cross-Reference Sources

| Confidence | Criteria | Action |
|------------|----------|--------|
| **High** | 3+ independent sources agree | Present as fact |
| **Medium** | 2 sources agree | Present with attribution |
| **Low** | 1 source only | Present with caveat |
| **Conflict** | Sources disagree | Present both sides |

### Step 3: Score and Compare

Use the evaluation framework to score each option 1-5 per factor.
Total score determines recommendation ranking.

---

## Output Format

```markdown
## Tech Stack Recommendation: [Project Name]

### Context Summary
Building [X] for [Y] with [constraints].

### TLDR
- [3-5 bullet recommendation summary]

### Options Evaluated

| Stack | Audience | Team | Future | Ecosystem | Score |
|-------|----------|------|--------|-----------|-------|
| **Option A** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 18/20 |
| Option B | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 16/20 |
| Option C | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | 14/20 |

### Recommended: [Option A]

**Framework:** [X] — [Why]
**Database:** [X] — [Why]
**Auth:** [X] — [Why]
**Hosting:** [X] — [Why]

### Why Not the Others?

**Option B:** [Limitation for this project]
**Option C:** [Limitation for this project]

### Research Sources (2026)
1. [Source] — [Key insight]
2. [Source] — [Key insight]

### Risks & Mitigations
- [Risk 1] → [Mitigation]
- [Risk 2] → [Mitigation]

### Next Steps
1. [First action]
2. [Second action]
```

---

## Industry-Specific Considerations

| Industry | Special Factors |
|----------|----------------|
| **Cannabis Tech** | State regulations, age verification, payment complexity |
| **FinTech** | Security, compliance, audit trails |
| **Healthcare** | HIPAA, data privacy, reliability |
| **E-commerce** | Performance, SEO, payment integrations |
| **B2B SaaS** | Enterprise auth, multi-tenancy, long-term support |
| **Consumer App** | Mobile-first, real-time, social features |

---

## Common Stack Combinations (2026)

| Use Case | Stack | Why |
|----------|-------|-----|
| **MVP / Indie** | Next.js + Supabase + Clerk | Fast, free tier, batteries included |
| **Enterprise** | .NET + Azure SQL + Azure AD | Microsoft ecosystem, compliance |
| **Mobile-first** | Expo + Supabase + Clerk | Cross-platform, real-time |
| **AI Product** | Next.js + Vercel AI SDK + OpenAI | Streaming, edge functions |
| **Content Site** | Astro + MDX + Cloudflare | Maximum performance, SSG |
| **Real-time** | Next.js + Convex + Clerk | Built-in reactivity |

---

## ⛔ STOP GATE

DO NOT deliver a recommendation without:
1. Project context locked (all 8 fields filled)
2. At least 3 options evaluated
3. Scoring matrix with per-factor scores
4. Research sources cited with dates
5. Risks documented with mitigations
