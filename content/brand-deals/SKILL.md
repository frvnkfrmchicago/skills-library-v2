---
name: brand-deals
description: Brand deals and sponsorships. Finding brands, negotiating, contracts, FTC disclosure, affiliate marketing.
last_updated: 2026-03
---

# Advertising & Brand Deals

Run ads. Get brand deals. Monetize your audience.

> **See also:** `app-types/creator-platform/SKILL.md`, `workflows/monetization/SKILL.md`

---

## Context Questions

Before pursuing brand deals, ask:

1. **What's your audience size?** — Micro (1K-10K), mid (10K-100K), macro (100K+)
2. **What's your niche?** — Tech, lifestyle, fitness, gaming, business
3. **What platforms do you monetize on?** — YouTube, TikTok, Instagram, newsletter, podcast
4. **What's your content style?** — Integrated mentions, dedicated videos, affiliate links
5. **What's your rate/value?** — CPM, flat fee, performance-based

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| Integration | Subtle mention ←→ Dedicated sponsorship |
| Payment | Affiliate/CPA ←→ Flat fee upfront |
| Relationship | One-off ←→ Long-term ambassador |
| Control | Brand-scripted ←→ Creator-controlled |
| Disclosure | Minimal ←→ Prominent |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Small audience + starting out | Affiliate programs, product-for-post, build portfolio |
| Mid-tier + engaged audience | Flat fee + affiliate hybrid, 30-60 day exclusivity |
| Large audience + authority | Higher rates, creative control, long-term partnerships |
| Tech/B2B niche | Higher CPMs, SaaS sponsorships, webinar collabs |
| Lifestyle/consumer | Product-focused, PR packages, ambassador programs |

---

## TL;DR

| Type | Who It's For | Revenue Model |
|------|--------------|---------------|
| **Running Ads** | Apps, products, SaaS | Pay to acquire users |
| **Brand Deals** | Content creators | Get paid to promote |
| **Sponsorships** | Podcasts, newsletters, events | Get paid for ad slots |
| **Affiliates** | Anyone with audience | Commission on sales |

---

## Part 1: Running Ads (For Apps/Products)

### Platform Overview 2025-2026

| Platform | Best For | Min Budget | Avg CPC |
|----------|----------|------------|---------|
| **Google Ads** | High-intent search | $10/day | $1-5 |
| **Meta Ads** | B2C, visual products | $5/day | $0.50-2 |
| **TikTok Ads** | Gen Z, viral potential | $20/day | $0.50-1.50 |
| **LinkedIn Ads** | B2B, high-ticket | $50/day | $5-15 |
| **Reddit Ads** | Niche communities | $5/day | $0.50-3 |
| **X (Twitter) Ads** | Tech, crypto, news | $10/day | $0.50-3 |

### Google Ads

```markdown
## Campaign Types

1. **Search** — Text ads on Google search
   - High intent (people searching for solutions)
   - Keyword bidding
   - Best for: SaaS, services

2. **Display** — Banner ads across the web
   - Brand awareness, retargeting
   - Lower intent, lower CPC
   - Best for: Remarketing

3. **YouTube** — Video ads
   - Pre-roll, mid-roll, discovery
   - CPV (cost per view) model
   - Best for: Demos, brand awareness

4. **Performance Max** — AI-optimized across all channels
   - Let Google optimize placement
   - Requires conversion tracking
   - Best for: E-commerce, leads

## Setup Checklist
- [ ] Google Ads account created
- [ ] Billing set up
- [ ] Conversion tracking (Google Tag)
- [ ] Google Analytics linked
- [ ] Keywords researched
- [ ] Ad copy written (3 headlines, 2 descriptions)
- [ ] Landing page ready
```

### Meta Ads (Facebook + Instagram)

```markdown
## Ad Types

1. **Image Ads** — Single image + copy
2. **Video Ads** — Short video (15-60 sec)
3. **Carousel Ads** — Multiple images/videos
4. **Stories Ads** — Full-screen vertical
5. **Reels Ads** — In-feed Reels placement

## Advantage+ Campaigns (2025)

Meta's AI-optimized campaigns:
- Advantage+ Shopping: E-commerce
- Advantage+ App: App installs
- Advantage+ Leads: Lead generation

Let Meta's AI:
- Find audiences automatically
- Optimize creative combinations
- Adjust bidding in real-time

## Setup Checklist
- [ ] Business Manager account
- [ ] Meta Pixel installed
- [ ] Conversions API set up (server-side)
- [ ] Custom audiences created
- [ ] Lookalike audiences ready
- [ ] Creative assets (images, video)
- [ ] Ad copy variations (3-5)
```

### TikTok Ads

```markdown
## Ad Types

1. **In-Feed Ads** — Native feed placement
2. **TopView** — First ad users see when opening
3. **Spark Ads** — Boost organic content (best ROI)
4. **Branded Hashtag Challenge** — Enterprise only

## Spark Ads Strategy

Use existing viral content as ads:
1. Find organic post with good engagement
2. Convert to Spark Ad
3. Target similar audiences
4. Lower CPM than created ads

## Creative Best Practices

- First 1 second = hook (pattern interrupt)
- UGC style outperforms polished
- Show product in use
- Include CTA text overlay
- Native captions (80% watch muted)
- Trending sounds (when appropriate)

## Setup Checklist
- [ ] TikTok Ads Manager account
- [ ] TikTok Pixel installed
- [ ] Events API set up
- [ ] Spark Ads authorization
- [ ] Target audience defined
- [ ] Creative (vertical 9:16)
```

### LinkedIn Ads

```markdown
## Ad Types

1. **Sponsored Content** — In-feed posts
2. **Message Ads** — Direct to inbox
3. **Dynamic Ads** — Personalized (follower, spotlight)
4. **Lead Gen Forms** — In-platform forms (high conversion)

## Targeting Options

LinkedIn's strength = professional targeting:
- Job title
- Company size
- Industry
- Seniority level
- Skills
- Groups
- Account lists (ABM)

## Best Practices

- Long-form copy works (unlike other platforms)
- Document ads (PDF carousels) = high engagement
- Lead Gen Forms > Website traffic (lower friction)
- Retarget website visitors
- Average CAC: $50-200 for B2B SaaS

## Setup Checklist
- [ ] LinkedIn Campaign Manager account
- [ ] Insight Tag installed
- [ ] Company page set up
- [ ] Target audience segments
- [ ] Creative assets
- [ ] Lead gen form created
```

### Ad Strategy Framework

```typescript
// Budget allocation by stage
const AD_BUDGET_ALLOCATION = {
  awareness: {
    budget: 0.20, // 20% of spend
    objective: 'reach',
    platforms: ['tiktok', 'youtube', 'display'],
    metrics: ['impressions', 'reach', 'cpm'],
  },
  consideration: {
    budget: 0.30, // 30%
    objective: 'traffic',
    platforms: ['meta', 'google_search', 'linkedin'],
    metrics: ['cpc', 'ctr', 'landing_page_views'],
  },
  conversion: {
    budget: 0.40, // 40%
    objective: 'conversions',
    platforms: ['meta', 'google_search', 'google_pmax'],
    metrics: ['cpa', 'roas', 'conversion_rate'],
  },
  retention: {
    budget: 0.10, // 10%
    objective: 'retargeting',
    platforms: ['meta', 'google_display'],
    metrics: ['ltv', 'repeat_purchase_rate'],
  },
}

// A/B testing matrix
const AB_TEST_PRIORITY = [
  { element: 'headline', impact: 'high', effort: 'low' },
  { element: 'image_video', impact: 'high', effort: 'medium' },
  { element: 'cta', impact: 'medium', effort: 'low' },
  { element: 'audience', impact: 'high', effort: 'medium' },
  { element: 'landing_page', impact: 'high', effort: 'high' },
]
```

### Retargeting

```markdown
## Retargeting Audiences

1. **Website Visitors**
   - All visitors (last 30 days)
   - Specific page visitors
   - Cart abandoners

2. **Engagement**
   - Video viewers (25%, 50%, 75%, 95%)
   - Post engagers
   - Page followers

3. **Customer Lists**
   - Email subscribers
   - Past purchasers
   - High-value customers

## Retargeting Flow

Awareness → Consideration → Conversion
  ↓            ↓              ↓
Didn't visit → Didn't engage → Didn't buy
  ↓            ↓              ↓
Brand video → Product demo → Discount offer
```

### Metrics & Tracking

```typescript
// Key metrics to track
interface AdMetrics {
  // Top of funnel
  impressions: number
  reach: number
  cpm: number // cost per 1000 impressions

  // Middle of funnel
  clicks: number
  ctr: number // click-through rate
  cpc: number // cost per click

  // Bottom of funnel
  conversions: number
  cvr: number // conversion rate
  cpa: number // cost per acquisition
  roas: number // return on ad spend

  // Quality metrics
  frequencyCap: number // how often same person sees ad
  relevanceScore: number // platform quality score
}

// Benchmarks by industry (2025)
const BENCHMARKS = {
  saas: { ctr: 0.02, cvr: 0.03, cpa: 100 },
  ecommerce: { ctr: 0.015, cvr: 0.025, cpa: 30 },
  mobile_app: { ctr: 0.01, cvr: 0.02, cpi: 2 },
  b2b: { ctr: 0.008, cvr: 0.01, cpa: 200 },
}
```

---

## Part 2: Brand Deals (For Creators)

### Finding Brands

```markdown
## Marketplaces

| Platform | Best For | Commission |
|----------|----------|------------|
| AspireIQ | All creators | Varies |
| Grin | Mid-size+ | Platform fee |
| Creator.co | Micro-influencers | 20% |
| Collabstr | Direct deals | 0% |
| Hashtag Paid | Canadian creators | 15% |
| Billo | UGC content | Per project |

## Direct Outreach

Email template:
```

```
Subject: Partnership with [Brand] × [Your Name]

Hi [Name],

I'm [Your Name], a [niche] creator with [X followers] on [platforms].

I've been using [product] for [timeframe] and my audience loves it.
My last sponsored post for [similar brand] got [results].

I'd love to explore a partnership. Are you open to a quick call?

Portfolio: [link]
Media kit: [link]

Best,
[Your Name]
```

```markdown
## Agencies

When to get representation:
- 100K+ followers
- Consistent brand interest
- Want to scale deals
- Need contract negotiation help

Commission: 15-25% of deals

Top agencies:
- Viral Nation
- Gleam Futures
- Select Management
- Digital Brand Architects
```

### Pricing Your Content

```markdown
## Rate Calculation

Base formula:
- $10-50 per 1,000 followers (varies by niche)
- Multiply by engagement rate
- Add platform premium

## By Platform (2025)

| Platform | Rate per 10K followers |
|----------|------------------------|
| TikTok | $100-300 |
| Instagram Reels | $150-400 |
| Instagram Feed | $100-250 |
| YouTube (dedicated) | $500-2000 |
| YouTube (integration) | $200-800 |
| Twitter/X | $50-150 |
| LinkedIn | $200-500 |

## Niche Multipliers

| Niche | Multiplier |
|-------|------------|
| Finance/Investing | 2-3x |
| Tech/SaaS | 1.5-2x |
| Beauty/Fashion | 1x |
| Gaming | 0.8-1x |
| Lifestyle | 0.8-1x |

## Example Calculation

Creator: 50K followers, 5% engagement, Tech niche
Base: 50 × $20 = $1,000
Engagement bonus: × 1.25 (above average)
Niche premium: × 1.5
Total: $1,875 per post
```

### Negotiating Deals

```markdown
## Deliverables to Define

- Number of posts/videos
- Platforms included
- Content type (static, video, Stories)
- Timeline (creation + posting)
- Draft review rounds (limit to 2)
- Posting date/time
- Caption requirements

## Usage Rights

| Right | Standard | Premium (+%) |
|-------|----------|--------------|
| Organic only | Included | — |
| Paid ads (whitelisting) | +25-50% | 30 days |
| Website/email use | +25% | 6-12 months |
| In perpetuity | +100-200% | Forever |
| Exclusivity | +25-50% | Competitor block |

## Payment Terms

Standard:
- 50% upfront, 50% on delivery
- Net 30 after delivery
- Kill fee: 25-50% if canceled

Red flags:
- 100% on completion only
- Net 60+ payment terms
- No kill fee
```

### Contract Essentials

```markdown
## Must-Have Clauses

1. **Scope of Work**
   - Exact deliverables
   - Platform(s)
   - Timeline

2. **Compensation**
   - Total fee
   - Payment schedule
   - Payment method

3. **Usage Rights**
   - What they can do with content
   - Duration
   - Channels (organic, paid, website)

4. **Exclusivity**
   - Category exclusivity
   - Duration (30-90 days typical)
   - Competitors defined

5. **Revisions**
   - Number of rounds (max 2)
   - What constitutes a revision
   - Additional fee for extras

6. **FTC Compliance**
   - Both parties agree to disclose
   - Platform-specific requirements

7. **Termination**
   - Kill fee amount
   - Notice period
   - Content removal (if any)

## Red Flags

- Unlimited revisions
- Perpetual usage for flat fee
- Exclusivity without premium
- Payment after 60+ days
- No kill fee
- Unclear deliverables
```

### FTC Disclosure Requirements 2025-2026

```markdown
## Federal Requirements

**What requires disclosure:**
- Paid partnerships
- Free products (gifted)
- Affiliate links
- Any "material connection"

**How to disclose:**

Text:
- #ad or #sponsored (clear, not buried)
- "Paid partnership with [brand]"
- First line, not at end

Video:
- Verbal disclosure early in video
- On-screen text
- "This video is sponsored by..."

**Where to place:**
- Before "see more" cutoff
- Beginning of video (not just end)
- Each platform (Stories too)

## Platform-Specific

| Platform | Method |
|----------|--------|
| Instagram | "Paid partnership" tag + #ad |
| TikTok | "Branded content" toggle + #ad |
| YouTube | "Includes paid promotion" checkbox |
| Twitter/X | #ad in tweet |
| LinkedIn | "Sponsored by" in first line |

## Penalties

- FTC fines (up to $50,000 per violation)
- Platform penalties (reduced reach)
- Account suspension
- Brand reputation damage
```

### Performance Tracking

```markdown
## Metrics Brands Care About

1. **Reach**
   - Impressions
   - Unique viewers

2. **Engagement**
   - Likes, comments, shares, saves
   - Engagement rate (vs. benchmark)

3. **Traffic**
   - Link clicks (UTM tracked)
   - Swipe-ups
   - Bio link clicks

4. **Conversions**
   - Discount code uses
   - Affiliate sales
   - Sign-ups

## Reporting Template

```

```markdown
# Campaign Report: [Brand] × [Creator]

## Overview
- Campaign: [Name]
- Dates: [Start] - [End]
- Platform(s): [Platforms]

## Deliverables
| Content | Date | Link |
|---------|------|------|
| IG Reel | MM/DD | [URL] |
| Story set | MM/DD | [Expired] |

## Performance
| Metric | Result | Benchmark |
|--------|--------|-----------|
| Impressions | 150,000 | — |
| Engagement | 12,500 | — |
| Engagement Rate | 8.3% | 5% avg |
| Link Clicks | 2,300 | — |
| Code Redemptions | 45 | — |

## Key Takeaways
- [What worked]
- [Audience feedback]
- [Recommendations for future]

## Assets
- [Link to raw content]
- [Screenshots of analytics]
```

---

## Part 3: Sponsorships

### Types of Sponsorships

```markdown
## Podcast

| Position | Length | Avg Rate (per 1K downloads) |
|----------|--------|------------------------------|
| Pre-roll | 15-30 sec | $15-25 |
| Mid-roll | 60 sec | $25-50 |
| Post-roll | 15-30 sec | $10-15 |
| Host-read | Any | 1.5-2x rates |

Platforms:
- Podcorn (marketplace)
- Gumball (Headgum)
- AdvertiseCast
- Direct sales

## YouTube

| Type | Avg Rate |
|------|----------|
| Dedicated video | $5,000-50,000 |
| Integration (30-60 sec) | $2,000-20,000 |
| Shoutout (10-15 sec) | $500-5,000 |

## Newsletter

| Position | Avg Rate (per subscriber) |
|----------|---------------------------|
| Header ad | $0.01-0.05 |
| Inline ad | $0.02-0.10 |
| Dedicated email | $0.05-0.20 |
| Footer | $0.005-0.02 |

Platforms:
- SparkLoop
- Swapstack
- beehiiv ad network
- ConvertKit Sponsor Network

## Events

- Speaking fees
- Booth sponsorship
- Branded workshops
- VIP dinners
```

### Pricing Models

```markdown
## Common Models

| Model | Best For | Example |
|-------|----------|---------|
| **Flat Fee** | Predictable budgets | $5,000/video |
| **CPM** | Large audiences | $25 per 1K impressions |
| **CPA** | Performance-focused | $50 per signup |
| **Rev Share** | Long-term partnerships | 20% of sales |
| **Hybrid** | Balanced risk | $2,000 + 10% of sales |

## When to Use Each

**Flat Fee:**
- You have consistent reach
- Brand wants awareness
- Simpler accounting

**CPM:**
- Large, variable audience
- Brand comparison shopping
- Podcasts, newsletters

**CPA/Affiliate:**
- You trust conversion rate
- Product fits audience well
- Long-term relationship

**Rev Share:**
- Deep partnership
- Product integration
- Co-branded content
```

### Sponsorship Best Practices

```markdown
## Integration Tips

1. **Authenticity**
   - Only promote products you'd use
   - Tell personal stories
   - Be honest about limitations

2. **Natural Placement**
   - Host-read > pre-recorded
   - Integration in content > interrupt
   - Show product in use

3. **Clear CTA**
   - Unique discount code
   - Custom landing page
   - Easy-to-remember URL

4. **Tracking**
   - Unique codes per campaign
   - UTM parameters
   - Attribution windows (30-60 days)

## Tracking Implementation

```

```typescript
// Generate unique tracking
function createSponsorshipTracking(sponsor: string, creator: string) {
  return {
    discountCode: `${creator.toUpperCase()}${Math.random().toString(36).slice(2, 6)}`,
    utmParams: {
      utm_source: 'sponsorship',
      utm_medium: 'podcast', // or newsletter, youtube, etc.
      utm_campaign: sponsor.toLowerCase(),
      utm_content: creator.toLowerCase(),
    },
    landingPage: `${sponsor}.com/${creator}`,
  }
}

// Example output:
// {
//   discountCode: "FRANK2A4F",
//   utmParams: { ... },
//   landingPage: "brand.com/frank"
// }
```

---

## Part 4: Affiliate Marketing

### Getting Started

```markdown
## Affiliate Networks

| Network | Best For | Commission Range |
|---------|----------|------------------|
| Amazon Associates | General products | 1-10% |
| ShareASale | Variety of brands | 5-30% |
| CJ Affiliate | Enterprise brands | 5-20% |
| Impact | SaaS, D2C | 10-40% |
| PartnerStack | B2B SaaS | 15-30% recurring |
| Refersion | Shopify brands | Varies |

## Direct Programs

Higher commissions, direct relationship:
- Stripe (25% for 1 year)
- Notion (100% first month)
- ConvertKit (30% recurring)
- Webflow (50% first year)
- Figma (varies by deal)

## Disclosure Requirements

Same as brand deals:
- #affiliate or #ad
- "I may earn a commission"
- Before link, not after
```

### Affiliate Strategy

```markdown
## Content Types

1. **Reviews**
   - In-depth product review
   - Pros/cons
   - Comparison to alternatives

2. **Tutorials**
   - How to use product
   - Solve specific problem
   - Natural affiliate integration

3. **Round-ups**
   - "Best tools for X"
   - Multiple affiliate links
   - Honest recommendations

4. **Case Studies**
   - Your results using product
   - Before/after
   - ROI calculation

## Best Practices

- Disclose early and clearly
- Only promote products you use
- Track conversions per content piece
- Test different link placements
- Build email list (less algorithm dependent)
```

---

## Part 5: Tools & Resources

### For Running Ads

| Tool | Purpose | Price |
|------|---------|-------|
| Meta Ads Manager | Facebook/Instagram ads | Free |
| Google Ads | Search, YouTube, display | Free |
| TikTok Ads Manager | TikTok ads | Free |
| Triple Whale | Attribution, analytics | $$$$ |
| AdSpy | Competitor research | $149/mo |
| BigSpy | Ad library | $99/mo |
| Foreplay | Ad inspiration | $49/mo |

### For Brand Deals

| Tool | Purpose | Price |
|------|---------|-------|
| Notion | Deal tracking | Free |
| HoneyBook | Contracts, invoicing | $19/mo |
| DocuSign | E-signatures | $15/mo |
| Wave | Invoicing (free) | Free |
| QuickBooks | Accounting | $30/mo |
| Canva | Media kit design | Free |

### For Sponsorships

| Tool | Purpose | Price |
|------|---------|-------|
| Podcorn | Podcast sponsorships | Commission |
| Gumball | Podcast ads | Commission |
| SparkLoop | Newsletter sponsors | Commission |
| beehiiv | Newsletter + ads | $0-99/mo |
| Streamlabs | Stream overlays | Free |

---

## Checklist

### For Running Ads
```markdown
- [ ] Pixel/conversion tracking installed
- [ ] Custom audiences created
- [ ] Lookalike audiences built
- [ ] Creative assets ready (3+ variations)
- [ ] Landing pages optimized
- [ ] A/B test plan documented
- [ ] Budget allocated
- [ ] ROAS targets defined
```

### For Brand Deals
```markdown
- [ ] Media kit created
- [ ] Rate card prepared
- [ ] Portfolio of past work
- [ ] Contract template ready
- [ ] Invoicing system set up
- [ ] Disclosure practices clear
- [ ] Analytics access for reporting
```

### For Sponsorships
```markdown
- [ ] Sponsor deck created
- [ ] Pricing tiers defined
- [ ] Tracking system (codes, UTMs)
- [ ] Reporting template ready
- [ ] Payment processing set up
```

---

## Resources

- FTC Endorsement Guides: https://www.ftc.gov/business-guidance/resources/disclosures-101-social-media-influencers
- Meta Ads Guide: https://www.facebook.com/business/ads-guide
- Google Ads Help: https://support.google.com/google-ads
- TikTok Ads Help: https://ads.tiktok.com/help

---

## Related Skills

- `app-types/creator-platform/SKILL.md` — Building apps for creators
- `workflows/monetization/SKILL.md` — Pricing strategies
- `agents/analytics/SKILL.md` — Tracking metrics
- `agents/growth-hacking/SKILL.md` — Organic growth
- `content/social/SKILL.md` — Content strategy
- `agents/algorithm/SKILL.md` — Platform algorithms
