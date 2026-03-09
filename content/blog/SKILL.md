---
name: blog-writing
description: SEO-optimized blog writing. Article structure, headlines, keywords, internal linking, AI assistance.
last_updated: 2026-03
---

# Blog Writing

Write SEO-optimized blog content that ranks and converts.

> **See also:** `agents/seo/SKILL.md`, `content/copy/SKILL.md`, `agents/cms/SKILL.md`

---

## Context Questions

Before writing, ask:

1. **What's the primary goal?** — SEO traffic, thought leadership, lead gen, sales
2. **Who's the target reader?** — Beginners, experts, decision-makers, developers
3. **What's the search intent?** — Informational, transactional, navigational
4. **What's your E-E-A-T angle?** — Personal experience, credentials, data
5. **What's the content format?** — How-to, listicle, comparison, case study, opinion

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| Length | Short (800 words) ←→ Long-form (3000+) |
| Depth | Surface overview ←→ Comprehensive deep-dive |
| SEO Focus | Reader-first ←→ Keyword-optimized |
| Voice | Brand/corporate ←→ Personal/authentic |
| AI Usage | AI-assisted draft ←→ Fully human-written |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| SEO traffic + competitive keyword | Long-form (2000+), heavy internal linking, E-E-A-T |
| Thought leadership + authority | Personal stories, original data, contrarian takes |
| Lead gen + funnel | Strong CTAs, gated content offers, clear next steps |
| Developer audience | Code examples, technical depth, skip the fluff |
| Quick turnaround + volume | AI-assisted drafts, template structure, edit for voice |

---

## TL;DR

| Element | Best Practice | Why |
|---------|---------------|-----|
| **Headline** | 60 characters, keyword front-loaded | SEO + click-through |
| **Intro** | 100-150 words, hook + promise | Keeps readers engaged |
| **Structure** | H2/H3 headings every 300 words | Readability, SEO |
| **Word Count** | 1500-2500 words (long-form) | Ranks better |
| **Keywords** | 1-2% density, natural placement | SEO without spam |
| **E-E-A-T** | Experience, Expertise, Authority, Trust | Google ranking factor |
| **CTA** | End + middle of post | Conversions |
| **Internal Links** | 3-5 per post | SEO, engagement |

**For vibe coders:** Use AI (Claude, GPT) for drafts, then edit for voice and accuracy.

---

## E-E-A-T Compliance (2025-2026 Critical)

### What is E-E-A-T?

Google's quality raters use E-E-A-T to evaluate content:

| Component | What It Means | How to Demonstrate |
|-----------|---------------|-------------------|
| **Experience** | First-hand knowledge | "I tested X", personal stories, screenshots |
| **Expertise** | Skill/knowledge in topic | Credentials, technical depth, data |
| **Authoritativeness** | Recognition as source | Backlinks, expert quotes, brand mentions |
| **Trustworthiness** | Reliable and safe | Sources, transparency, accuracy |

### E-E-A-T Implementation

```markdown
## Experience Signals
✅ First-person narratives: "When I built my SaaS..."
✅ Case studies: "Here's how we increased conversions by 40%"
✅ Screenshots/videos: Proof you actually did the thing
✅ Specific details: Exact numbers, dates, tools used
✅ Failures included: "What didn't work (and why)"

## Expertise Signals
✅ Author bio: Credentials, experience, links to work
✅ Technical depth: Go beyond surface-level
✅ Data citations: Link to studies, statistics
✅ Proprietary insights: Original research, surveys
✅ Nuanced takes: Acknowledge complexity

## Authoritativeness Signals
✅ Expert quotes: Interview or cite authorities
✅ Backlinks: Earn links from reputable sites
✅ Media mentions: Press, podcasts, guest posts
✅ Industry recognition: Awards, certifications
✅ About page: Company history, team bios

## Trustworthiness Signals
✅ Sources cited: Link to original data
✅ Updated dates: Show content freshness
✅ Author byline: Real name, photo, bio link
✅ Contact info: How to reach you
✅ Corrections: Acknowledge and fix errors
✅ Disclosure: Affiliate links, sponsorships
```

### E-E-A-T Checklist

- [ ] Author has relevant experience/credentials
- [ ] Content includes first-hand insights
- [ ] Sources are cited and linked
- [ ] Author bio is complete with photo
- [ ] "Last updated" date is visible
- [ ] Affiliate/sponsored content disclosed
- [ ] About page explains who you are
- [ ] Contact information available

---

## Grounding with Active Search

### Why Grounding Matters

```
Traditional AI writing = Stale training data
Grounded AI writing = Real-time web search + fresh data

Result: More accurate, current, and trustworthy content
```

### Search Grounding Workflow

```
1. INPUT: Topic or keyword
      ↓
2. GROUND: Search for current data
   - Google search (via Gemini grounding)
   - Competitor SERP analysis
   - Recent news/updates
      ↓
3. ANALYZE: Identify key points
   - What's ranking now?
   - What's missing from top results?
   - What's the latest data?
      ↓
4. WRITE: Generate with citations
   - Include source links
   - Cite statistics with dates
   - Reference authoritative sources
      ↓
5. VERIFY: Fact-check claims
   - Cross-reference sources
   - Check dates (nothing stale)
   - Verify quotes
```

### Grounding Tools

| Tool | Use Case | Integration |
|------|----------|-------------|
| **Gemini Grounding** | Real-time search in generation | Google AI Studio |
| **Perplexity** | Research with citations | API or direct |
| **SerpAPI** | SERP analysis | Programmatic |
| **Google Search** | Manual research | Browser |

### Grounded Writing Prompt

```
Write a blog section on [TOPIC].

Before writing:
1. Search for the latest data (2024-2025)
2. Find 2-3 authoritative sources
3. Note any recent updates or changes

Include:
- Citations with source links
- Current statistics (with dates)
- "As of [month] 2025" for time-sensitive claims

Do NOT include:
- Outdated information
- Unverifiable claims
- Made-up statistics
```

### Citation Format

```markdown
## In-Text Citations

According to [Ahrefs research (2025)](link), 95% of pages get zero organic traffic.

[HubSpot's 2025 Marketing Report](link) found that blog posts over 2,000 words generate 3x more traffic.

## Source Block (End of Section)

**Sources:**
- [Ahrefs: SEO Statistics 2025](link)
- [HubSpot: State of Marketing 2025](link)
- [Google: Helpful Content Update Guidelines](link)
```

## Part 1: Article Structure

### The Winning Template

```markdown
# Headline (H1)
[60 characters, keyword-rich, curiosity gap]

## Introduction (100-150 words)
- Hook (question, stat, bold statement)
- Problem statement (what reader will learn)
- Promise (what they'll gain by reading)

## Main Content (Body)

### Section 1: [H2 Heading]
[300-500 words]
- Subheading (H3) if needed
- Bullet points for scannability
- Images/screenshots

### Section 2: [H2 Heading]
[300-500 words]
- Example code blocks
- Quote blocks
- CTA (mid-article)

### Section 3: [H2 Heading]
[300-500 words]

## Conclusion (100-150 words)
- Summary of key points
- Final CTA (subscribe, download, buy)

## FAQ (Optional H2)
- Common questions (good for SEO)
```

### Blog Post Types

| Type | Structure | Best For |
|------|-----------|----------|
| **How-to** | Problem → Steps → Result | Tutorials, guides |
| **Listicle** | Intro → Items → Conclusion | Quick wins, tools |
| **Opinion** | Thesis → Arguments → Conclusion | Thought leadership |
| **Case Study** | Challenge → Solution → Results | Trust, authority |
| **Comparison** | Intro → Item A vs B → Winner | Product reviews |

---

## Part 2: Headline Formulas

### High-Performing Templates

```typescript
const headlineFormulas = {
  howTo: "How to [Achieve Goal] in [Timeframe]",
  // Example: "How to Rank #1 on Google in 90 Days"

  list: "[Number] [Adjective] Ways to [Achieve Goal]",
  // Example: "7 Proven Ways to Boost Your Email Open Rates"

  question: "Why [Problem]? [Solution]",
  // Example: "Why Your Blog Isn't Ranking? Fix These 5 SEO Mistakes"

  ultimate: "The Ultimate Guide to [Topic]",
  // Example: "The Ultimate Guide to Content Marketing in 2025"

  secret: "[Number] [Topic] Secrets [Authority] Don't Want You to Know",
  // Example: "5 SEO Secrets Google Doesn't Want You to Know"

  comparison: "[A] vs [B]: Which [Outcome] in 2025?",
  // Example: "WordPress vs Webflow: Which Builds Faster Sites in 2025?"

  beginner: "[Topic] for Beginners: [Promise]",
  // Example: "SEO for Beginners: Rank in 30 Days"
};
```

### Headline Checklist

- [ ] Under 60 characters (Google displays ~60)
- [ ] Keyword in first 5 words
- [ ] Number (if listicle)
- [ ] Emotional trigger (curiosity, fear, excitement)
- [ ] Year (2025/2026) for freshness
- [ ] Promise clear outcome

---

## Part 3: SEO Writing

### Keyword Research

```typescript
// Tools for finding keywords
const keywordTools = {
  free: [
    "Google Keyword Planner",
    "Google Search Console (your site)",
    "Answer the Public",
    "Reddit, Quora (what people ask)",
  ],
  paid: [
    "Ahrefs ($99/mo)",
    "SEMrush ($119/mo)",
    "Clearscope ($170/mo, AI-powered)",
  ],
};

// Keyword selection criteria
const goodKeyword = {
  searchVolume: ">500/month",
  difficulty: "<40 (for new sites)",
  intent: "Informational (how-to, what is)",
  relevance: "Matches your niche",
};
```

### Keyword Placement

```markdown
✅ **Where to put keywords:**
1. H1 (headline)
2. First 100 words (intro)
3. At least one H2 heading
4. URL slug (mysite.com/keyword-here)
5. Meta description (150 characters)
6. Image alt text

❌ **Avoid:**
- Keyword stuffing (sounds robotic)
- Exact match overuse (use variations)
- Forcing keywords where they don't fit
```

### SEO Metadata

```html
<!-- Good meta tags -->
<title>How to Rank #1 on Google in 90 Days (2025 Guide)</title>
<meta name="description" content="Learn proven SEO strategies to rank your website #1 on Google in 90 days. Step-by-step guide with real examples from 2025." />

<!-- Open Graph (social sharing) -->
<meta property="og:title" content="How to Rank #1 on Google in 90 Days" />
<meta property="og:description" content="Proven SEO strategies to rank your site in 90 days." />
<meta property="og:image" content="https://mysite.com/og-image.png" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="How to Rank #1 on Google in 90 Days" />
```

---

## Part 4: Content Outline (AI-Assisted)

### Using AI for Outlines

```typescript
// Prompt for Claude/GPT
const outlinePrompt = `
Write a detailed blog post outline for:
Title: "How to Build a SaaS App in 30 Days"

Target audience: Non-technical founders
Target word count: 2000 words
Include:
- 5-7 H2 sections
- H3 subsections where needed
- Suggested examples or code snippets
- FAQ section (3-5 questions)
- SEO keyword: "build SaaS app"

Format as markdown.
`;

// AI will return structured outline
// Then write each section yourself or with AI assistance
```

### Outline Template

```markdown
# How to Build a SaaS App in 30 Days

## 1. Introduction (150 words)
- Hook: "Most people think building a SaaS takes 6 months. Here's how to do it in 30 days."
- Promise: Step-by-step roadmap
- Keyword: "build SaaS app"

## 2. Planning Your SaaS (Week 1)
### 2.1 Validate Your Idea
- [Talk to 10 potential users]
### 2.2 Define MVP Features
- [Must-have vs nice-to-have]

## 3. Tech Stack Selection (Day 3-4)
- [Next.js, Supabase, Stripe]
- [Link to tech stack guide]

## 4. Building Core Features (Week 2-3)
### 4.1 Authentication
### 4.2 Dashboard
### 4.3 Payment Integration

## 5. Launch & Marketing (Week 4)
- [ProductHunt, Twitter, Reddit]

## 6. Conclusion (100 words)
- Recap steps
- CTA: "Download our SaaS checklist"

## FAQ
- How much does it cost to build a SaaS?
- Do I need to code?
- What if I don't have users yet?
```

---

## Part 5: Writing the Draft

### AI-Assisted Writing

```typescript
// Using Claude/GPT for sections
const sectionPrompt = `
Write 500 words for this blog section:

Heading: "Planning Your SaaS (Week 1)"
Target audience: Non-technical founders
Tone: Conversational, actionable
Include:
- 2-3 subsections
- Real examples
- Bullet points for clarity
- Keyword: "build SaaS app" (1-2 times, naturally)

Write in active voice, short sentences, and use "you" to address the reader.
`;

// Then edit for:
// - Accuracy (AI hallucinates sometimes)
// - Brand voice
// - Personal stories
// - Updated info (AI may use old data)
```

### Writing Best Practices

```typescript
const writingRules = {
  sentences: {
    length: "15-20 words average",
    variety: "Mix short and long (rhythm)",
    active: "Use active voice (not passive)",
  },
  paragraphs: {
    length: "2-4 sentences max",
    oneIdea: "One idea per paragraph",
    whiteSpace: "Break up text visually",
  },
  tone: {
    conversational: "Write like you talk",
    you: "Use 'you' (not 'one' or 'people')",
    contractions: "Don't avoid them (sounds natural)",
  },
  clarity: {
    jargon: "Explain or avoid",
    examples: "Show, don't just tell",
    transitions: "Use 'However,' 'Therefore,' 'For example'",
  },
};
```

---

## Part 6: Internal Linking Strategy

### Why Internal Links Matter

```
Benefits:
1. SEO: Helps Google understand site structure
2. User engagement: Keeps readers on site longer
3. Authority flow: Passes "link juice" between pages
```

### Internal Linking Pattern

```markdown
<!-- Link to related posts -->
As we discussed in our [guide to SEO for beginners](link), keyword research is critical. Here's how to apply it to blog writing.

<!-- Link to product/service -->
If you're building a SaaS, check out our [Next.js starter kit](link) to launch faster.

<!-- Link to pillar content -->
For more on content marketing, read our [ultimate guide to content strategy](link).

<!-- Footer links (every post) -->
Related articles:
- [How to Write Headlines That Convert](link)
- [SEO Checklist for 2025](link)
- [Content Calendar Template](link)
```

### Internal Link Checklist

- [ ] 3-5 internal links per post
- [ ] Link to older posts (boosts their SEO)
- [ ] Link to pillar content (main guides)
- [ ] Use descriptive anchor text (not "click here")
- [ ] Open in same tab (keeps readers on site)

---

## Part 7: CTA Placement

### Types of CTAs

| CTA Type | Placement | Example |
|----------|-----------|---------|
| **Newsletter** | End, mid-article | "Subscribe for weekly tips" |
| **Lead Magnet** | End | "Download our free checklist" |
| **Product** | Mid-article, end | "Try our tool free for 14 days" |
| **Social** | End | "Share this on Twitter" |
| **Related Content** | End | "Read next: [Article Title]" |

### CTA Examples

```markdown
<!-- Mid-article CTA (email signup) -->
> **Want more content like this?** Subscribe to our newsletter for weekly SEO tips delivered to your inbox.

<!-- End CTA (lead magnet) -->
## Ready to Rank #1?
Download our **free SEO checklist** (2025 edition) and start ranking today.

[Download Now (Free)](link)

<!-- Product CTA (SaaS) -->
If you're serious about SEO, try **[Your Tool]**. We'll help you find keywords, track rankings, and optimize content—all in one place.

[Start Free Trial](link)
```

---

## Part 8: Niche Content (Cannabis Industry Example)

### Cannabis Blog Strategy

```typescript
// Cannabis content requires special considerations
const cannabisContentRules = {
  compliance: {
    avoid: ["Medical claims (unless licensed)", "Underage targeting"],
    include: ["Age gates (21+)", "State-specific disclaimers"],
  },
  seo: {
    keywords: [
      "cannabis dispensary near me",
      "best strains for [condition]",
      "how to grow cannabis legally",
      "CBD vs THC",
    ],
    localSEO: "State-specific content (CA, CO, NY, etc.)",
  },
  topics: {
    educational: [
      "Strain reviews",
      "Growing guides",
      "Legal updates by state",
      "Consumption methods",
    ],
    business: [
      "How to start a dispensary",
      "Cannabis marketing (within limits)",
      "Compliance guides",
    ],
  },
  platforms: {
    restricted: ["Google Ads (limited)", "Facebook Ads (banned)"],
    allowed: ["SEO (organic)", "Email", "Reddit (subreddits)"],
  },
};
```

### Cannabis Blog Post Example

```markdown
# Best Cannabis Strains for Anxiety (2025 Guide)

## Introduction
Millions of people use cannabis to manage anxiety. But which strains actually work? Based on user reviews and terpene profiles, here are the top 5 strains for anxiety relief in 2025.

**Disclaimer:** This content is for educational purposes only. Consult a healthcare professional before using cannabis for medical purposes. Must be 21+ to purchase.

## 1. Granddaddy Purple (Indica)
- **THC:** 17-23%
- **Terpenes:** Myrcene, Pinene
- **Effects:** Deep relaxation, stress relief
- **Best for:** Evening use, sleep

[Link to dispensary locator: "Find Granddaddy Purple near you"]

## 2. [Continue with other strains...]

## FAQ
**Q: Is cannabis legal in my state?**
A: Check our [state-by-state guide](link) for current laws.

## Conclusion
Remember: Start low, go slow. What works for others may not work for you. Always purchase from licensed dispensaries.

[CTA: "Join our email list for strain reviews and legal updates"]
```

---

## Part 9: Long-Form vs Short-Form

### When to Go Long

```typescript
const longFormBlog = {
  wordCount: "1500-3000 words",
  bestFor: [
    "Pillar content (ultimate guides)",
    "SEO (ranks better for competitive keywords)",
    "Authority building (comprehensive = expert)",
    "Evergreen topics (timeless content)",
  ],
  structure: {
    toc: "Table of contents (jump links)",
    sections: "Clear H2/H3 headings",
    media: "Images, videos, infographics",
  },
};

const shortFormBlog = {
  wordCount: "500-800 words",
  bestFor: [
    "News/updates (timely content)",
    "Quick tips (actionable lists)",
    "Personal opinions (hot takes)",
    "Supporting content (link from pillar posts)",
  ],
  structure: {
    hook: "Strong intro (get to point fast)",
    skimmable: "Bullets, short paragraphs",
  },
};
```

---

## Part 10: Repurposing Blog to Social

### Blog → Social Content

```typescript
const repurposingStrategy = {
  twitter: {
    thread: "Break blog into 7-10 tweets",
    quote: "Pull best quotes (text as image)",
    teaser: "Tweet link with hook",
  },
  linkedin: {
    post: "First 300 words + 'Read more' link",
    carousel: "Key points as slides (PDF)",
  },
  instagram: {
    carousel: "Visual quotes from blog",
    story: "Behind-the-scenes writing process",
  },
  tiktok: {
    video: "Top 3 tips from blog (30s)",
    voiceover: "Read summary over B-roll",
  },
  youtube: {
    video: "Talking head (expand on blog)",
    shorts: "Quick tip (vertical video)",
  },
};

// Example: Blog → Twitter Thread
const blogToThread = `
1/ Just published: "How to Rank #1 on Google in 90 Days"

Here are the 7 most important lessons (thread) 🧵

2/ Lesson 1: Keyword research isn't optional
Most people skip this and wonder why they don't rank. Use [tool] to find low-competition keywords.

[Continue through 7 lessons]

8/ Full guide (with examples): [link to blog]

Bookmark this for later 🔖
`;
```

---

## Part 11: AI Writing Assistance (2025)

### Best AI Tools

| Tool | Best For | Price |
|------|----------|-------|
| **Claude** | Long-form, technical accuracy | Free / $20/mo |
| **ChatGPT** | Outlines, brainstorming | Free / $20/mo |
| **Jasper** | SEO-focused blog posts | $49/mo |
| **Copy.ai** | Headlines, intros | $36/mo |
| **Clearscope** | SEO optimization (scores content) | $170/mo |

### AI Writing Workflow

```typescript
const aiWorkflow = {
  step1: "Generate outline (AI)",
  step2: "Write first draft (AI, section by section)",
  step3: "Edit for accuracy (human)",
  step4: "Add personal stories (human)",
  step5: "SEO optimize (AI tool like Clearscope)",
  step6: "Final proofread (Grammarly + human)",
};

// Example prompt for Claude
const draftPrompt = `
Write 500 words for this blog section:

Heading: "How to Write Headlines That Convert"
Target audience: Content marketers
Tone: Expert but approachable
Include:
- 3 headline formulas
- Examples for each
- Bullet points for clarity
- Keyword: "write headlines" (use 2x naturally)

Write in active voice, short sentences, and include a CTA at the end to download a headline swipe file.
`;
```

### AI Editing Checklist

After AI writes draft:

- [ ] Fact-check (AI hallucinates)
- [ ] Check for repetition (AI repeats phrases)
- [ ] Add brand voice (AI sounds generic)
- [ ] Insert personal anecdotes (AI can't do this)
- [ ] Update examples (AI may use outdated info)
- [ ] Verify links (AI makes up URLs)
- [ ] Run through plagiarism checker (Copyscape)

---

## Part 12: Publishing Checklist

### Pre-Publish

```markdown
- [ ] Headline <60 characters
- [ ] Keyword in first 100 words
- [ ] Meta description (150 characters)
- [ ] URL slug (keyword-rich, short)
- [ ] Featured image (1200x630px)
- [ ] Alt text for all images
- [ ] Internal links (3-5)
- [ ] External links (2-3, credible sources)
- [ ] CTA (mid-article + end)
- [ ] Proofread (Grammarly)
- [ ] Plagiarism check (Copyscape)
- [ ] Mobile preview (50% of readers)
```

### Post-Publish

```markdown
- [ ] Share on social (Twitter, LinkedIn)
- [ ] Email newsletter (if applicable)
- [ ] Submit to Google Search Console (index faster)
- [ ] Add to content calendar (for repurposing)
- [ ] Monitor analytics (week 1, month 1)
- [ ] Update older posts with internal links to new post
- [ ] Repurpose to social content (thread, carousel)
```

---

## Part 13: Blog Performance Metrics

### What to Track

| Metric | What It Means | Target |
|--------|---------------|--------|
| **Organic Traffic** | Visitors from Google | +10% month-over-month |
| **Avg. Time on Page** | Engagement level | >3 minutes (long-form) |
| **Bounce Rate** | Left without clicking | <70% |
| **CTR (Search)** | % who clicked in Google | >3% |
| **Conversions** | Email signups, sales | >2% of readers |
| **Keyword Ranking** | Position in Google | Top 10 (first page) |

### Tools

```typescript
const analyticsTools = {
  traffic: "Google Analytics 4 (free)",
  seo: "Google Search Console (free)",
  keywords: "Ahrefs, SEMrush (paid)",
  heatmaps: "Hotjar (see where users click)",
  conversions: "Plausible, Fathom (privacy-friendly)",
};
```

---

## When to Use This Skill

- Writing SEO-optimized blog posts
- Creating content for company blog
- Repurposing long-form content to social
- Building authority in niche (cannabis, tech, etc.)
- Driving organic traffic (Google)
- Generating leads (newsletter, downloads)
- Using AI to speed up writing process

---

## See Also

- `agents/seo/SKILL.md` - Search engine optimization
- `content/copy/SKILL.md` - Copywriting frameworks
- `agents/cms/SKILL.md` - Content management (Sanity)
- `content/social/SKILL.md` - Social content strategy
- `agents/analytics/SKILL.md` - Tracking blog performance
