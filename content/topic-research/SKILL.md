---
name: topic-research
description: Research-first content workflow. Active search, topic breakdown, competitor analysis, structured output.
last_updated: 2026-03
---

# Topic Research

Research before writing. Grounded insights with active search.

---

## Context Questions

Before researching, ask:

1. **What's the research goal?** — Blog content, product decision, market analysis, trend piece
2. **How time-sensitive is this?** — Evergreen, current news, breaking trend
3. **What's your authority level?** — Expert in topic, learning, outsider perspective
4. **Who's the target audience?** — B2B, B2C, developers, general
5. **What depth is needed?** — Quick overview, comprehensive deep-dive, data-heavy

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| Depth | Surface scan ←→ Comprehensive analysis |
| Timeliness | Evergreen ←→ Real-time/trending |
| Sources | AI knowledge ←→ Active web grounding |
| Competition | Blue ocean ←→ Saturated SERP |
| Data Needs | Opinion-based ←→ Stats-required |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Blog + SEO focus | SERP analysis, gap identification, keyword research |
| Trending topic + speed | Quick grounding, social signals, news sources |
| Data-heavy + authority | Academic sources, industry reports, expert quotes |
| Saturated SERP + differentiation | Unique angle, underserved audience, format innovation |
| Evergreen + comprehensive | Deep structure, multiple subtopics, resource linking |

---

## TL;DR

| Step | Action | Output |
|------|--------|--------|
| **1. Input** | Topic, URL, or keyword | Research brief |
| **2. Ground** | Active search | Current data |
| **3. Analyze** | Competitor + gap analysis | Topic breakdown |
| **4. Map** | Audience segmentation | Angle recommendations |
| **5. Output** | Structured findings | TL;DR + tables |

---

## 1. Research Inputs

### Input Types

| Input | How to Use |
|-------|-----------|
| **Topic** | "AI image generation tools 2025" |
| **URL** | Existing article to expand/respond to |
| **Keyword** | SEO target to research around |
| **Question** | "What are the best X for Y?" |
| **Trend** | Emerging topic from social/news |

### Research Brief Template

```markdown
## Research Brief

**Topic:** [Your topic]
**Purpose:** [Blog, social, newsletter]
**Target Audience:** [B2B, B2C, Gen Z, etc.]
**Competitors to Analyze:** [3-5 URLs]
**Deadline:** [Date]

### Questions to Answer
1. [Key question 1]
2. [Key question 2]
3. [Key question 3]

### Success Criteria
- [ ] Current data (2024-2025)
- [ ] 3+ authoritative sources
- [ ] Audience-specific angles
```

---

## 2. Active Search Grounding

### When to Ground

```
✅ Ground when:
- Topic has recent developments
- Data/statistics needed
- Competitor landscape matters
- Trends are time-sensitive
- E-E-A-T compliance required

❌ Skip grounding when:
- Evergreen how-to (basic concepts)
- Personal opinion pieces
- Speed over accuracy needed
```

### Grounding Tools

| Tool | Best For | Access |
|------|----------|--------|
| **Gemini (grounded)** | Real-time search in generation | Google AI Studio |
| **Perplexity** | Research with citations | perplexity.ai |
| **SerpAPI** | SERP data programmatically | API |
| **Google Search** | Manual deep research | Browser |
| **Exa.ai** | Neural search for similar content | API |

### Grounding Prompt

```
Research [TOPIC] for a blog post.

Search the web for:
1. Latest statistics (2024-2025)
2. Expert opinions and quotes
3. Recent news or updates
4. Top-ranking content on this topic

Provide:
- Key findings with source URLs
- Gaps in existing content
- Recommended angles
- Data points with dates

Format as structured markdown.
```

---

## 3. Competitor Analysis

### SERP Analysis

```markdown
## Top 10 SERP Analysis for [KEYWORD]

| Rank | Title | Domain | Word Count | Gap |
|------|-------|--------|------------|-----|
| 1 | [Title] | domain.com | 2,400 | Outdated stats |
| 2 | [Title] | domain.com | 1,800 | No examples |
| 3 | [Title] | domain.com | 3,200 | Too technical |
...

### Common Themes
- All cover [X]
- Most mention [Y]
- None address [Z] ← opportunity

### Gaps to Exploit
1. [Gap 1] — Your angle
2. [Gap 2] — Your angle
```

### Content Gap Finder

```
Questions to ask:
- What are they NOT covering?
- Where is data outdated?
- What audience are they ignoring?
- What format could work better?
- What perspective is missing?
```

---

## 4. Topic Breakdown

### Output Format

```markdown
## Topic Breakdown: [TOPIC]

### TL;DR
| Key Point | Summary |
|-----------|---------|
| [Point 1] | [Brief] |
| [Point 2] | [Brief] |
| [Point 3] | [Brief] |

### Core Concepts
1. **[Concept 1]** — [1-2 sentence explanation]
2. **[Concept 2]** — [1-2 sentence explanation]
3. **[Concept 3]** — [1-2 sentence explanation]

### Key Data Points
| Stat | Source | Date |
|------|--------|------|
| [Stat 1] | [Source] | 2025 |
| [Stat 2] | [Source] | 2024 |

### Expert Quotes
> "[Quote]" — [Name], [Title] ([Source])

### Related Topics
- [Related 1]
- [Related 2]
- [Related 3]
```

---

## 5. Audience Mapping

### Audience Segment Matrix

| Segment | Interest Level | Best Angle | Content Type |
|---------|----------------|------------|--------------|
| **B2B Decision Makers** | High/Med/Low | ROI, efficiency | Case study |
| **B2C Consumers** | High/Med/Low | Benefits, how-to | Guide |
| **Gen Z** | High/Med/Low | Trends, authentic | Short-form |
| **Developers** | High/Med/Low | Technical depth | Tutorial |
| **General** | High/Med/Low | Educational | Explainer |

### Angle by Audience

```markdown
## Topic: AI Image Generation

### B2B (Marketing Teams)
- **Angle:** "Cut design costs by 80% with AI images"
- **Hooks:** ROI, speed, team efficiency
- **Format:** Case study with results

### B2C (Creators)
- **Angle:** "Create stunning thumbnails in seconds"
- **Hooks:** Quality, ease of use, examples
- **Format:** How-to tutorial

### Gen Z
- **Angle:** "This AI tool is going viral on TikTok"
- **Hooks:** Trends, cool factor, social proof
- **Format:** Quick tips, carousel

### Developers
- **Angle:** "Implementing Imagen 3 API in production"
- **Hooks:** Code examples, performance, cost
- **Format:** Technical tutorial
```

---

## 6. Full Research Output Template

```markdown
# Research: [TOPIC]

## TL;DR

| Key Finding | Implication |
|-------------|-------------|
| [Finding 1] | [What it means] |
| [Finding 2] | [What it means] |
| [Finding 3] | [What it means] |

---

## Topic Overview

[2-3 paragraph summary of the topic]

---

## Key Data

| Metric | Value | Source |
|--------|-------|--------|
| [Metric 1] | [Value] | [Source, Year] |
| [Metric 2] | [Value] | [Source, Year] |

---

## Competitor Analysis

| Competitor | Strength | Weakness | Our Angle |
|------------|----------|----------|-----------|
| [URL 1] | [X] | [Y] | [Opportunity] |
| [URL 2] | [X] | [Y] | [Opportunity] |

---

## Audience Breakdown

| Audience | Interest | Recommended Angle |
|----------|----------|-------------------|
| B2B | High | [Angle] |
| B2C | Medium | [Angle] |
| Gen Z | Low | [Skip or adapt] |

---

## Recommended Headlines

### Blog
1. [Headline option 1]
2. [Headline option 2]

### Social Carousel
1. [Hook slide option 1]
2. [Hook slide option 2]

---

## Sources

- [Source 1](URL)
- [Source 2](URL)
- [Source 3](URL)

---

## Next Steps

- [ ] Choose angle and audience
- [ ] Outline content
- [ ] Write with grounding
```

---

## Checklist

- [ ] Research brief completed
- [ ] Active search performed
- [ ] Top 10 SERP analyzed
- [ ] Gaps identified
- [ ] Audience segments mapped
- [ ] Data with dates collected
- [ ] Sources documented
- [ ] TL;DR output created

---

## Related Skills

- [Blog Writing](/content/blog/SKILL.md) — E-E-A-T compliant writing
- [Headlines](/content/headlines/SKILL.md) — Title formulas
- [Audience Mapping](/content/audience-mapping/SKILL.md) — Deep persona work
- [Viral Content](/content/viral/SKILL.md) — Trend sourcing
- [SEO](/agents/seo/SKILL.md) — Search optimization
