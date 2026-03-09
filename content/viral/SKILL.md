---
name: viral-content
description: Find and adapt trending content. Trend prediction, competitor analysis, content curation, rights/attribution.
last_updated: 2026-03
---

# Viral Content Sourcing

Find, analyze, and adapt trending content before it peaks.

> **See also:** `agents/algorithm/SKILL.md`, `content/social/SKILL.md`, `content/tiktok/SKILL.md`

---

## Context Questions

Before trend-chasing, ask:

1. **What's your niche?** — Can you adapt trends to your topic authentically?
2. **What's your turnaround time?** — Can you create content within 24-48 hours?
3. **What platforms are you targeting?** — TikTok trends ≠ LinkedIn trends
4. **What's your risk tolerance?** — Controversial trends can backfire
5. **Original or remix?** — Creating new trends vs riding existing ones

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| Timing | Early adopter (risky) ←→ Late majority (safe) |
| Adaptation | Direct copy ←→ Creative remix |
| Niche Fit | Force-fit ←→ Natural alignment |
| Risk | Safe/brand-friendly ←→ Edgy/controversial |
| Effort | Quick turnaround ←→ High production |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| New account + growth | Jump on trends early, high volume, direct adaptation |
| Established brand + reputation | Wait for trend validation, brand-safe remix only |
| B2B + professional | LinkedIn/Twitter trends, thought leadership angles |
| Entertainment + personality | TikTok sounds, duets, reaction content |
| Low capacity + quality focus | Cherry-pick 1-2 trends/week, high-effort remix |

---

## TL;DR

| Tool | Purpose | Best For | Price |
|------|---------|----------|-------|
| **TikTok Creative Center** | Trending sounds, hashtags | TikTok content | Free |
| **Instagram Reels Trends** | Trending audio, effects | Instagram content | Free |
| **ExplodingTopics** | Early trend detection | Blog, YouTube | $39/mo |
| **SparkToro** | Audience insights | Content strategy | Free / $50/mo |
| **BuzzSumo** | Trending content by topic | Competitor analysis | $99/mo |
| **Google Trends** | Search trend analysis | Topic validation | Free |

**For vibe coders:** Start with free tools (TikTok Creative Center, Google Trends), then upgrade if needed.

---

## Part 1: Finding Trending Content

### Platform-Specific Discovery

```typescript
const trendDiscovery = {
  tiktok: {
    creativeCenter: "https://ads.tiktok.com/business/creativecenter",
    features: [
      "Trending sounds (last 7 days)",
      "Trending hashtags (by location)",
      "Top creators (by niche)",
      "Viral videos (sortable by industry)",
    ],
  },
  instagram: {
    reelsTab: "Instagram app → Reels → Trending audio",
    explore: "Explore page (personalized to interests)",
    hashtags: "Search hashtags → Recent (find rising content)",
  },
  youtube: {
    trending: "YouTube → Trending tab",
    googleTrends: "Search interest over time",
    vidIQ: "Browser extension (trending scores)",
  },
  x: {
    trending: "Trending tab (location-specific)",
    tweetDeck: "Advanced search, custom feeds",
    hashtagify: "Hashtag trends and correlations",
  },
  linkedin: {
    explore: "Limited trending features",
    competitors: "Follow top creators in niche",
    engagement: "Posts with high comments = trending",
  },
};
```

### TikTok Creative Center Deep Dive

```typescript
// How to use TikTok Creative Center
const tikTokTrends = {
  step1: "Go to ads.tiktok.com/business/creativecenter",
  step2: "Select 'Trending' tab",
  step3: {
    sounds: "See top 100 sounds (updated daily)",
    hashtags: "Filter by country, industry",
    videos: "Sort by views, engagement",
    creators: "Find creators in your niche",
  },
  strategy: {
    earlyAdoption: "Use sounds within 24-48 hours (highest reach)",
    remix: "Don't copy—add your unique twist",
    combine: "Trending sound + trending format = viral",
  },
};

// Example: Trending sound sourcing
const trendingSoundWorkflow = `
1. Check TikTok Creative Center daily (9am)
2. Find sound with 10k-100k uses (rising, not peaked)
3. Watch top 10 videos using that sound
4. Identify common format (dance, POV, tutorial)
5. Create your version (unique angle)
6. Post within 24 hours
`;
```

---

## Part 2: Trend Prediction Methods

### Early Trend Detection

```typescript
const trendPrediction = {
  signals: {
    velocity: "Content growing 50%+ day-over-day",
    crossPlatform: "Trending on 2+ platforms simultaneously",
    influencerAdoption: "3+ influencers post similar content within 48hrs",
    searchVolume: "Google Trends shows 'Breakout' status",
    redditDiscussion: "Subreddit posts with 1k+ upvotes",
  },
  tools: {
    explodingTopics: {
      url: "explodingtopics.com",
      features: "Detects trends 6-12 months early",
      use: "Blog topics, product ideas",
    },
    googleTrends: {
      url: "trends.google.com",
      features: "Search interest over time",
      use: "Validate trend timing (rising vs declining)",
    },
    sparkToro: {
      url: "sparktoro.com",
      features: "What your audience follows/reads",
      use: "Content gap analysis",
    },
  },
};

// Example: Early trend workflow
const earlyTrendWorkflow = `
Monday:
- Check ExplodingTopics for rising topics in niche
- Validate with Google Trends (is it rising?)
- Search Reddit for discussions (genuine interest?)

Tuesday:
- Create content around trend
- Post before peak (early mover advantage)

Friday:
- Check performance
- If working: create 2-3 more pieces
`;
```

### Trend vs Fad

| Trend | Fad |
|-------|-----|
| Sustainable growth (months/years) | Spike, then decline (days/weeks) |
| Multiple use cases (broad application) | One-off event (narrow) |
| Cross-industry adoption | Niche-specific |
| Google Trends: Steady rise | Google Trends: Sharp peak, decline |

```typescript
// Example: Trend vs Fad analysis
const aiTrend = {
  topic: "AI content generation",
  googleTrends: "Steady rise since 2022",
  crossPlatform: "TikTok, LinkedIn, YouTube",
  verdict: "TREND (create content)",
};

const dabFad = {
  topic: "Dab dance",
  googleTrends: "Peaked 2016, now flat",
  crossPlatform: "Dead on all platforms",
  verdict: "FAD (don't create)",
};
```

---

## Part 3: Competitor Analysis

### What to Track

```typescript
const competitorTracking = {
  identify: {
    direct: "Same niche, same audience",
    indirect: "Adjacent niche, overlapping audience",
    aspirational: "Where you want to be in 12 months",
  },
  track: {
    contentTypes: "Video, carousel, blog?",
    postingFrequency: "How often?",
    topPosts: "What performs best? (saves, shares)",
    hashtags: "Which hashtags do they use?",
    engagement: "Comments, shares, saves",
    growth: "Follower growth rate (Social Blade)",
  },
  tools: {
    socialBlade: "Track follower growth (YouTube, TikTok)",
    notJustAnalytics: "Instagram, TikTok analytics",
    buzzSumo: "Top content by domain/topic",
    similarWeb: "Website traffic (competitors)",
  },
};

// Example: Competitor content audit
const competitorAudit = `
Competitor: @example_creator

Top 5 Posts (Last 30 Days):
1. "How to [X]" tutorial (50k likes, 2k saves) → Format: Voiceover + screen record
2. "5 mistakes [niche]" (40k likes, 1.5k saves) → Format: Text overlay + stock footage
3. "[Trend] but make it [niche]" (60k likes, 3k shares) → Format: Trending sound remix

Insights:
- Educational content (how-to, mistakes) performs best
- Text overlays > talking head
- Uses trending sounds (within 48hrs of release)

Action:
- Create 3 "how-to" videos this week
- Use trending sounds from TikTok Creative Center
- Add text overlays (not just captions)
`;
```

### Competitive Content Gap Analysis

```typescript
// Find what competitors aren't covering
const gapAnalysis = {
  step1: "List top 10 competitors",
  step2: "Export their last 30 posts (manual or tool)",
  step3: "Categorize by topic (how-to, opinion, news, etc.)",
  step4: "Find gaps (what they're NOT talking about)",
  step5: "Create content for those gaps",
};

// Example
const exampleGap = {
  niche: "SaaS marketing",
  competitorTopics: [
    "SEO",
    "Content marketing",
    "Email marketing",
  ],
  gaps: [
    "Product-led growth (no one covering)",
    "AI in marketing (1 competitor, not deep)",
    "Pricing page optimization (untapped)",
  ],
  action: "Create pillar content for gaps → early authority",
};
```

---

## Part 4: Content Curation Tools

### Discovery Platforms

```typescript
const curationTools = {
  reddit: {
    use: "Find genuine discussions, trending topics",
    subreddits: [
      "r/entrepreneur (business)",
      "r/SaaS (software)",
      "r/marketing (marketing)",
      "r/dataisbeautiful (data viz)",
    ],
    strategy: "Sort by 'Top - This Week' → Find what's hot",
  },
  quora: {
    use: "Find questions people are asking",
    strategy: "Follow topics in niche → Answer questions → Repurpose to blog",
  },
  productHunt: {
    use: "New products, tools (tech niche)",
    strategy: "Daily digest → Review/compare products → Content",
  },
  hackerNews: {
    use: "Tech trends, developer discussions",
    strategy: "Front page → Summarize/analyze → Twitter thread",
  },
  mediumDigest: {
    use: "Trending articles (all niches)",
    strategy: "Daily Top Stories → Reaction/expansion post",
  },
};

// Example: Reddit → Content workflow
const redditToContent = `
1. Browse r/entrepreneur (sort: Top - This Week)
2. Find post with 1k+ upvotes
3. Read comments (real pain points)
4. Create content addressing those pain points
5. Link to original post (attribution)
6. Share on LinkedIn, X, TikTok

Example:
Reddit post: "I made $10k MRR in 6 months, here's how"
→ Your content: "I analyzed the top SaaS launch stories on Reddit. Here are 5 patterns that predict success."
`;
```

---

## Part 5: Remake vs Original Decision

### When to Remake Viral Content

```typescript
const remakeDecision = {
  remake: {
    when: [
      "Trending format with 100+ variations (not original anymore)",
      "Educational content (can add your expertise)",
      "Niche-specific spin (make it relevant to your audience)",
      "Outdated content (update with 2025 info)",
    ],
    how: {
      addValue: "Don't just copy—add insight, examples, data",
      credit: "Mention original if it's clear inspiration",
      timing: "Post within 48hrs (trend window)",
    },
  },
  original: {
    when: [
      "No one in your niche has covered it",
      "You have unique data/experience",
      "Trend is too early (be the first)",
      "You can't add value to existing content",
    ],
    how: {
      research: "Spend 2x the time (has to be exceptional)",
      quality: "Production matters (stand out)",
      distribution: "Seed to communities (no algorithm help yet)",
    },
  },
};

// Example: Remake flowchart
const shouldIRemake = `
Is this format trending? (100+ versions exist)
→ YES: Remake (add your unique angle)
→ NO: Original (or skip)

Can I add significant value?
→ YES: Remake (educational, data-driven)
→ NO: Skip (don't add noise)

Is the trend in my niche?
→ YES: Remake (relevant to audience)
→ NO: Skip (confuses brand)
`;
```

---

## Part 6: Rights and Attribution

### Legal Considerations

```typescript
const copyrightRules = {
  music: {
    tiktok: "Use sounds from TikTok library (pre-cleared)",
    instagram: "Use audio from Reels library (licensed)",
    youtube: "Use YouTube Audio Library or license music",
    avoid: "Copyrighted music (DMCA takedown risk)",
  },
  video: {
    stockFootage: "Pexels, Unsplash (free, commercial use)",
    userContent: "Ask permission (DM creator)",
    fairUse: "Commentary, criticism, education (gray area)",
    avoid: "Reposting without credit (copyright strike)",
  },
  images: {
    free: "Unsplash, Pexels, Pixabay",
    paid: "Shutterstock, Getty Images",
    attribution: "Check license (some require credit)",
  },
};

// Attribution best practices
const attribution = {
  tiktok: {
    duet: "Use TikTok's Duet feature (auto-credits)",
    stitch: "Use Stitch feature (links to original)",
    caption: "Credit in caption: 'Inspired by @creator'",
  },
  instagram: {
    collab: "Use Collab feature (dual-post)",
    caption: "Tag creator in caption and image",
  },
  youtube: {
    description: "Link to original in description",
    verbal: "Mention creator by name in video",
  },
  x: {
    quote: "Quote tweet (auto-credits)",
    mention: "Tag creator in tweet",
  },
};
```

### Fair Use (Educational)

```typescript
// Fair use for commentary/education (US law)
const fairUse = {
  commentary: {
    allowed: "Analyze, critique, or discuss content",
    example: "Review a viral video, add your take",
    howMuch: "Use as little as needed (clips, not full video)",
  },
  education: {
    allowed: "Teach using existing content",
    example: "'Here's why this TikTok went viral' (breakdown)",
    howMuch: "Transformative (add value, not just repost)",
  },
  parody: {
    allowed: "Satirical remake",
    example: "Parody of viral trend",
    howMuch: "Must be clearly parody",
  },
  notFairUse: {
    repost: "Uploading someone's content as-is",
    compilation: "Compilation videos without commentary",
    commercial: "Using content to sell your product",
  },
};
```

---

## Part 7: Speed to Trend

### Why Timing Matters

```
Trend lifecycle:
1. Emerging (0-48hrs): Early adopters, low competition, HIGH REACH
2. Rising (2-7 days): Mainstream adoption, medium competition, MEDIUM REACH
3. Peaked (1-2 weeks): Saturated, high competition, LOW REACH
4. Declining (2+ weeks): Dead, no reach

Best time to post: Within 48 hours of trend emerging
```

### Fast Content Creation Workflow

```typescript
const fastWorkflow = {
  morningRoutine: {
    time: "9am daily",
    tasks: [
      "Check TikTok Creative Center (trending sounds)",
      "Browse Instagram Reels (trending audio)",
      "Scan Reddit r/[niche] (top posts this week)",
      "Google Trends (breakout topics)",
    ],
    duration: "30 minutes",
  },
  contentCreation: {
    time: "10am-12pm",
    tasks: [
      "Pick 1-2 trends from morning scan",
      "Script content (15 min per trend)",
      "Film (30 min per trend)",
      "Edit (30 min per trend)",
    ],
    duration: "2 hours (2 videos)",
  },
  posting: {
    time: "2pm",
    tasks: [
      "Upload to TikTok, Instagram, YouTube Shorts",
      "Cross-post to X (native video)",
      "Share link on LinkedIn (context post)",
    ],
    duration: "30 minutes",
  },
};

// Tools for speed
const speedTools = {
  scriptwriting: "Claude/GPT (draft scripts in 2 min)",
  videoEditing: "CapCut (auto-captions, trending templates)",
  scheduling: "Later, Buffer (batch schedule)",
  repurposing: "Repurpose.io (auto cross-post)",
};
```

---

## Part 8: Trend Archives

### Build Your Swipe File

```typescript
// Save trends for future reference
const trendArchive = {
  format: "Notion database or Google Sheet",
  columns: [
    "Date discovered",
    "Platform (TikTok, IG, etc.)",
    "Trend type (sound, format, hashtag)",
    "Example links (3-5 top posts)",
    "My version (link to your post)",
    "Performance (views, likes, saves)",
    "Notes (what worked, what didn't)",
  ],
  use: "Reference when creating new content",
};

// Example entry
const exampleEntry = {
  date: "2025-01-15",
  platform: "TikTok",
  trend: "Get Ready With Me (GRWM) + Life Update",
  examples: [
    "tiktok.com/example1",
    "tiktok.com/example2",
  ],
  myVersion: "tiktok.com/mypost",
  performance: "50k views, 2k likes, 300 saves",
  notes: "Voiceover performed better than on-camera. Next time: add text overlays.",
};
```

### Seasonal Trend Planning

```typescript
const seasonalTrends = {
  january: ["New Year goals", "Dry January", "Meal prep"],
  february: ["Valentine's Day", "Black History Month"],
  march: ["Spring cleaning", "March Madness", "St. Patrick's Day"],
  april: ["Taxes", "Earth Day", "Spring fashion"],
  may: ["Mother's Day", "Memorial Day", "Graduation"],
  june: ["Father's Day", "Pride Month", "Summer travel"],
  july: ["Fourth of July", "Summer sales"],
  august: ["Back to school", "Summer ending"],
  september: ["Fall fashion", "Labor Day", "Pumpkin spice"],
  october: ["Halloween", "Fall decor", "Breast Cancer Awareness"],
  november: ["Thanksgiving", "Black Friday", "Cyber Monday"],
  december: ["Holidays", "Gift guides", "Year in Review"],
};

// Plan 30 days ahead
const seasonalPlanning = `
December 1: Plan January content (New Year, resolutions)
December 15: Create January content (batch 10-15 posts)
December 20: Schedule January posts (post 1/day)
`;
```

---

## Part 9: AI Trend Detection

### Using AI to Find Trends

```typescript
// AI-powered trend tools (2025)
const aiTrendTools = {
  trends: {
    tool: "ExplodingTopics (AI-powered)",
    use: "Detects trends before they peak",
    price: "$39/mo",
  },
  contentIdeas: {
    tool: "Glimpse (Google Trends AI)",
    use: "Predicts trending searches",
    price: "Free beta",
  },
  socialListening: {
    tool: "Brand24, Mention",
    use: "Track brand mentions, trending topics in niche",
    price: "$49-99/mo",
  },
};

// AI prompt for trend analysis
const trendAnalysisPrompt = `
I'm in the [niche] industry. Analyze these 10 Reddit posts from r/[subreddit] this week and identify:

1. Common themes (what are people talking about?)
2. Pain points (what problems do they have?)
3. Gaps (what's NOT being discussed that should be?)
4. Content opportunities (3-5 topics I should create content about)

[Paste Reddit posts]
`;
```

---

## Part 10: Cross-Platform Trend Translation

### Adapting Trends Between Platforms

```typescript
const crossPlatformAdaptation = {
  tiktokToInstagram: {
    change: "Remove TikTok watermark (penalized)",
    tool: "SnapTik, SaveTok (download without watermark)",
    optimize: "Re-edit in CapCut or Instagram Reels",
  },
  tiktokToYouTubeShorts: {
    keep: "Vertical format, fast pacing",
    add: "YouTube-specific keywords in description",
    avoid: "TikTok branding (confuses algorithm)",
  },
  linkedinToX: {
    shorten: "LinkedIn posts are long, X posts are short",
    format: "Break into thread (7-10 tweets)",
    adapt: "More casual tone on X",
  },
  blogToSocial: {
    tiktok: "Top 3 tips (voiceover + B-roll)",
    instagram: "Carousel (key points as slides)",
    x: "Thread (summary + link)",
    linkedin: "First 300 words + 'Read more' link",
  },
};

// Example: TikTok trend → LinkedIn
const tikTokToLinkedIn = `
TikTok trend: "Get Ready With Me" (GRWM)
→ LinkedIn adaptation: "What I'm Working On This Week (Startup Edition)"

TikTok: Casual, fast-paced, trending sound
→ LinkedIn: Professional, slower, no music (or subtle)

TikTok: 15 seconds
→ LinkedIn: 60-90 seconds (longer attention span)
`;
```

---

## Part 11: Ethical Trend Sourcing

### Do's and Don'ts

```typescript
const ethicalSourcing = {
  do: [
    "Credit original creator (tag, mention, link)",
    "Add your unique value (don't just copy)",
    "Use platform features (Duet, Stitch, Collab)",
    "Ask permission for user-generated content",
    "License music, stock footage properly",
  ],
  dont: [
    "Repost without credit (copyright strike risk)",
    "Claim content as original when it's not",
    "Use copyrighted music (DMCA takedown)",
    "Steal small creators' content (bad karma)",
    "Ignore attribution requirements (license violations)",
  ],
};

// Example: Ethical trend remake
const ethicalRemake = `
Original: "Day in the life of a software engineer" (viral format)
→ Your version: "Day in the life of a cannabis industry marketer" (niche-specific)

Credit:
- Caption: "Inspired by the 'Day in the Life' trend, here's my version"
- Tag creators (if direct inspiration)
- Use your own footage (don't reuse others' clips)

Result: Trending format + your unique angle = ethical + effective
`;
```

---

## Part 12: Performance Tracking

### Metrics to Track

```typescript
const viralMetrics = {
  reach: {
    views: "Total impressions",
    followerGrowth: "New followers from viral post",
  },
  engagement: {
    saves: "Highest signal (Instagram, TikTok)",
    shares: "Virality indicator",
    comments: "Engagement quality",
  },
  conversion: {
    linkClicks: "If CTA included",
    emailSignups: "Lead gen from viral content",
    sales: "Revenue attributed to viral post",
  },
  timing: {
    trendPeak: "Did I post before or after peak?",
    timeToViral: "Hours until 10k views",
  },
};

// Post-mortem template
const viralPostMortem = `
Post: [Link]
Platform: TikTok
Date: 2025-01-20

Performance:
- 500k views (10x my average)
- 20k likes, 1k shares, 500 saves
- 1,200 new followers

What worked:
- Posted within 24 hours of trend emerging
- Niche-specific angle (cannabis industry)
- High-quality production (auto-captions, good lighting)

What didn't:
- CTA was weak (could've driven more link clicks)

Next time:
- Stronger CTA ("Link in bio")
- Post at 7am (vs 2pm) for better timing
`;
```

---

## When to Use This Skill

- Finding trending content to adapt
- Predicting trends before they peak
- Analyzing what competitors are doing
- Sourcing viral formats for your niche
- Building a content swipe file
- Cross-posting trends between platforms
- Ethically remixing viral content
- Tracking trend performance

---

## See Also

- `agents/algorithm/SKILL.md` - Platform algorithms (how to go viral)
- `content/social/SKILL.md` - Social content strategy
- `content/tiktok/SKILL.md` - TikTok content creation
- `content/instagram/SKILL.md` - Instagram content
- `content/youtube/SKILL.md` - YouTube strategy
- `agents/growth-hacking/SKILL.md` - Growth tactics
- `agents/analytics/SKILL.md` - Tracking metrics
