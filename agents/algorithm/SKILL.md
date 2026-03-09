---
name: Algorithm
description: Social media algorithms (2025-2026). TikTok FYP, Instagram Reels, YouTube retention, LinkedIn B2B.
last_updated: 2026-03
owner: Frank
---

# Social Media Algorithms (2025-2026)

Master platform algorithms to maximize reach and engagement.

> **See also:** `content/social/SKILL.md`, `agents/growth-hacking/SKILL.md`, `content/tiktok/SKILL.md`

---

## Context Questions

Before diving into algorithm optimization:

1. **Which platform is primary?** — TikTok, Instagram, YouTube, LinkedIn, X
2. **What's the content type?** — Short-form, long-form, text, carousel
3. **What's the goal?** — Reach, engagement, conversions, followers
4. **Who's the audience?** — B2C, B2B, Gen Z, professionals
5. **What's the posting capacity?** — Daily, few times/week, weekly

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Platform** | TikTok ←→ LinkedIn (different audiences) |
| **Content Type** | Short video ←→ Long-form text |
| **Engagement** | Vanity metrics ←→ Conversions |
| **Frequency** | Quality (1x/week) ←→ Volume (3x/day) |
| **Authenticity** | Algorithm gaming ←→ Genuine connection |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| B2C consumer product | TikTok + Instagram Reels |
| B2B SaaS | LinkedIn + YouTube |
| Personal brand | X + LinkedIn + YouTube |
| Gen Z audience | TikTok first, then Instagram |
| Educational content | YouTube (long) + TikTok (clips) |
| Quick wins needed | TikTok (highest organic reach) |

---

## TL;DR

| Platform | Key Metric | Best Time to Post | Algorithm Focus |
|----------|------------|-------------------|-----------------|
| **TikTok** | Watch time, completion rate | 6-10am, 7-11pm EST | FYP, engagement velocity |
| **Instagram** | Saves, shares | 11am-1pm, 7-9pm EST | Reels engagement, time spent |
| **YouTube** | CTR, retention | 2-4pm, 9-11pm EST | Session time, watch duration |
| **LinkedIn** | Dwell time, comments | 7-9am, 12-1pm, 5-6pm EST | Professional engagement |
| **Twitter/X** | Retweets, replies | 8-10am, 6-9pm EST | Engagement rate, verified status |

**For vibe coders:** Focus on TikTok (highest organic reach) and LinkedIn (B2B growth).

---

## Part 1: TikTok Algorithm (FYP)

### How the FYP Works

```
User watches video → Algorithm evaluates:
1. Completion rate (did they watch it all?)
2. Re-watches (did they loop it?)
3. Engagement (like, comment, share, save)
4. Profile visits
5. Hashtag relevance
→ Shows to similar users → Repeat
```

### Key Metrics (In Order of Importance)

| Metric | What It Means | How to Optimize |
|--------|---------------|-----------------|
| **Watch Time** | Total seconds watched | Hook in first 3 seconds |
| **Completion Rate** | % who watched to end | Keep videos under 21 seconds |
| **Re-watch Rate** | Loop plays | Make it rewatchable (tutorial, joke) |
| **Engagement** | Likes, comments, shares | End with CTA, ask a question |
| **Profile Visits** | Clicked your profile | Strong bio, pinned video |

### TikTok Best Practices (2025)

```typescript
// Content Strategy
const tikTokStrategy = {
  videoLength: "7-21 seconds (sweet spot)",
  hook: "First 1 second decides 80% of views",
  postingFrequency: "1-3 times/day",
  hashtags: "3-5 relevant (avoid spam tags)",
  sounds: "Use trending sounds within 24-48 hours",
  captions: "Hook in first line (before 'more')",
  engagement: "Reply to comments within first hour",
};

// Avoid These (Algorithm Penalties)
const penalties = [
  "Watermarks (Instagram, YouTube)",
  "Low-quality video (blurry, pixelated)",
  "Recycled content (reposted videos)",
  "Clickbait without delivery",
  "Static images with text",
];
```

### TikTok Algorithm Updates (2025)

- **Longer videos prioritized:** Up to 3 minutes now favored if retention is high
- **Series content:** Multi-part videos get boosted
- **Creator Rewards Program:** Prioritizes videos >1 minute
- **AI detection:** Penalizes AI-generated faces/voices (unless disclosed)

---

## Part 2: Instagram Algorithm

### Reels Algorithm

```
Post Reel → Instagram tests with:
1. Your followers (10-20%)
2. If engagement is high → Non-followers (similar interests)
3. If still high → Explore page
4. If still high → Viral (millions)
```

### Key Metrics

| Metric | Weight | How to Optimize |
|--------|--------|-----------------|
| **Saves** | Highest | Create valuable/educational content |
| **Shares** | Very High | Relatable, shareable moments |
| **Comments** | High | Ask questions, spark discussion |
| **Completion Rate** | High | Hook early, keep it tight |
| **Likes** | Medium | Still matters, but less than saves |

### Instagram Best Practices (2025)

```typescript
// Reels Strategy
const reelsStrategy = {
  length: "7-15 seconds (highest engagement)",
  aspectRatio: "9:16 vertical",
  captions: "Always add (80% watch muted)",
  music: "Trending audio from Reels tab",
  hashtags: "3-5 in caption (not in comments)",
  coverImage: "Eye-catching thumbnail",
  posting: "Reels > Carousels > Single images",
};

// Carousel Strategy
const carouselStrategy = {
  slides: "7-10 slides (swipe-through)",
  firstSlide: "Hook that promises value",
  lastSlide: "CTA or summary",
  captions: "Long-form (Instagram rewards reading time)",
};

// Story Engagement
const storyStrategy = {
  polls: "2-3 per day (boosts reach)",
  questions: "Reply to all (algorithm notices)",
  links: "Swipe-up at 10k followers (or verified)",
  highlights: "Organize by topic (evergreen content)",
};
```

### Instagram Algorithm Changes (2025)

- **Carousels back:** Swipeable posts prioritized again
- **Collab posts:** Reach both audiences simultaneously
- **Notes feature:** High engagement, shown to close friends
- **AI-generated labels:** Disclosed AI content gets separate feed

---

## Part 3: YouTube Algorithm

### How It Works

```
Upload video → YouTube evaluates:
1. Click-Through Rate (CTR): Did thumbnail/title work?
2. Average View Duration (AVD): How long did they watch?
3. Session Time: Did they watch more videos after?
→ Recommends to similar viewers
→ If successful → Broader audience
```

### Key Metrics

| Metric | What It Is | Target |
|--------|------------|--------|
| **CTR** | % who clicked thumbnail | 4-10% (varies by niche) |
| **AVD** | Avg watch time | >50% for long videos, >80% for shorts |
| **Watch Time** | Total minutes watched | Maximize (YouTube's #1 goal) |
| **Session Start** | Did your video start a binge? | High value to YouTube |

### YouTube Best Practices (2025)

```typescript
// Video Strategy
const youtubeStrategy = {
  title: {
    length: "60-70 characters",
    keywords: "Front-load important words",
    curiosity: "Promise + intrigue",
    avoid: "ALL CAPS, excessive emojis",
  },
  thumbnail: {
    text: "3-5 words max, 44pt font minimum",
    faces: "Close-up, emotion, eye contact",
    contrast: "Bright colors, high contrast",
    consistency: "Recognizable brand style",
  },
  description: {
    keywords: "First 150 characters (above fold)",
    timestamps: "Chapters improve retention",
    links: "Pin comment for main CTA",
  },
  tags: {
    count: "5-8 relevant tags",
    priority: "Your actual topic, not spam",
  },
};

// Retention Hacks
const retentionHacks = [
  "Hook in first 8 seconds (pattern interrupt)",
  "Tease the payoff ('more on this at 3:45')",
  "Visual variety (B-roll every 5-7 seconds)",
  "Chapter markers (viewers skip vs leave)",
  "End screen at 90% mark (not 100%)",
];
```

### YouTube Shorts Algorithm (2025)

```typescript
const shortsStrategy = {
  length: "15-60 seconds (under 60 required)",
  format: "Vertical 9:16",
  hook: "First 2 seconds decide everything",
  loop: "End frame loops to start (rewatchability)",
  upload: "Mark as 'Short' (not just vertical video)",
  frequency: "Daily shorts boost channel growth",
};
```

### YouTube Algorithm Updates (2025)

- **Shorts monetization:** Partner program now includes shorts
- **Podcast tab:** Audio-first content gets dedicated feed
- **AI summaries:** YouTube auto-generates summaries (optimize descriptions)
- **Chapters required:** Videos >10min without chapters get penalized

---

## Part 4: LinkedIn Algorithm (B2B Focus)

### How It Works

```
Post → LinkedIn shows to:
1. Your connections (small test)
2. If dwell time >10 seconds → More connections
3. If comments in first hour → Followers of commenters
4. If engagement continues → Viral (millions of impressions)
```

### Key Metrics

| Metric | Weight | How to Optimize |
|--------|--------|-----------------|
| **Dwell Time** | Highest | Write compelling first line |
| **Comments** | Very High | Ask questions, reply to all |
| **Shares** | High | Valuable insights, original takes |
| **Reactions** | Medium | Still matters (shows interest) |

### LinkedIn Best Practices (2025)

```typescript
const linkedInStrategy = {
  postLength: "1300-2000 characters (sweet spot)",
  hook: "First 2 lines (before 'see more')",
  formatting: {
    lineBreaks: "Every 1-2 sentences",
    emojis: "1-3 (not excessive)",
    bullets: "Use • or → for lists",
  },
  contentTypes: {
    personal: "Your learnings, failures (high engagement)",
    data: "Original insights (screenshots, charts)",
    controversial: "Respectful hot takes",
  },
  timing: {
    best: "Tuesday-Thursday 7-9am EST",
    avoid: "Weekends, Monday mornings",
  },
  hashtags: "3-5 max (not required, use sparingly)",
  engagement: "Reply to comments within first hour",
};

// Post Structure That Works
const highEngagementPost = `
[Hook: Bold statement or question]

[Personal story or context]
- Bullet point 1
- Bullet point 2
- Bullet point 3

[Lesson learned or takeaway]

[CTA: What do you think?]
`;
```

### LinkedIn Algorithm Changes (2025)

- **Creator mode:** Now default for all (optimize for followers)
- **Document posts:** PDF carousels get high engagement
- **Newsletter feature:** Notify all followers (use weekly)
- **Verification badges:** Impacts reach (get verified if possible)

---

## Part 5: Twitter/X Algorithm (2025)

### How It Works

```
Post tweet → X evaluates:
1. Engagement rate (likes, retweets, replies)
2. Negative feedback (hides, blocks, reports)
3. Verified status (Blue checkmark = 4x reach)
→ Shows in "For You" tab
```

### Key Metrics

| Metric | Weight | Notes |
|--------|--------|-------|
| **Retweets** | Highest | Amplification signal |
| **Replies** | Very High | Conversation quality matters |
| **Likes** | Medium | Engagement signal |
| **Bookmarks** | High | Shows value (hidden metric) |
| **Verified** | Multiplier | 4x reach boost if blue check |

### X Best Practices (2025)

```typescript
const xStrategy = {
  length: {
    short: "Under 100 characters = higher RT rate",
    threads: "Break into 3-7 tweets for reach",
  },
  media: {
    images: "1-4 images (engagement boost)",
    video: "Native video (not YouTube links)",
    gifs: "High engagement, lower reach",
  },
  timing: {
    best: "8-10am, 6-9pm EST",
    weekends: "Saturday mornings (lower competition)",
  },
  hashtags: "1-2 max (not required)",
  engagement: "Reply to big accounts (visibility hack)",
  verification: "Blue check = worth it for reach",
};

// Tweet Types That Perform
const tweetFormats = {
  list: "7 ways to... (thread or single)",
  hot_take: "Controversial but respectful opinion",
  personal: "Behind-the-scenes, lessons learned",
  quote: "Screenshot your own tweet (quote RT yourself)",
  question: "Ask your audience (engagement bait)",
};
```

### X Algorithm Updates (2025)

- **Long-form posts:** Up to 25,000 characters for verified
- **Community Notes:** Accurate info gets boosted
- **Grok integration:** AI responses surface popular tweets
- **Paid reach:** Blue verified gets 4x reach (confirmed)

---

## Part 6: Best Posting Times (2025 Data)

### Platform-Specific Windows

```typescript
const bestPostingTimes = {
  tiktok: {
    weekdays: ["6-10am EST", "7-11pm EST"],
    weekends: ["9am-1pm EST", "7-11pm EST"],
    avoid: "2-5pm (low engagement)",
  },
  instagram: {
    weekdays: ["11am-1pm EST", "7-9pm EST"],
    weekends: ["10am-2pm EST"],
    avoid: "Late night (3-6am)",
  },
  youtube: {
    upload: "2-4pm EST (indexed before prime time)",
    shorts: "6-9am EST (morning scroll)",
    avoid: "Early morning uploads (lost in feed)",
  },
  linkedin: {
    best: ["7-9am EST", "12-1pm EST", "5-6pm EST"],
    avoid: "Weekends, holidays",
  },
  x: {
    peak: ["8-10am EST", "6-9pm EST"],
    weekends: "Saturday 9am-12pm EST",
  },
};
```

### Time Zone Considerations

```typescript
// If your audience is global
const globalStrategy = {
  approach: "Post 2x per day (US + international windows)",
  tool: "Use scheduling (Buffer, Later, Hootsuite)",
  analytics: "Check audience demographics for peak times",
  repost: "Repost top content at different times (48hr gap)",
};
```

---

## Part 7: How to Go Viral

### Viral Content Patterns

| Pattern | Why It Works | Example |
|---------|--------------|---------|
| **Pattern Interrupt** | Stops scroll | Unexpected visual, sound |
| **High Emotion** | Drives shares | Anger, joy, shock, awe |
| **Relatable** | "This is me" moment | Common experiences |
| **Educational** | Valuable info | "How to" (saved/shared) |
| **Controversy** | Sparks debate | Hot takes (respectful) |
| **Trend Jacking** | Rides wave | Use trending audio/hashtag |

### Viral Formula

```typescript
// The anatomy of a viral post
const viralFormula = {
  hook: "First 1-3 seconds (pattern interrupt)",
  emotion: "Make them feel something (any emotion)",
  value: "Teach, entertain, or inspire",
  cta: "Comment, share, or follow",
  timing: "Post when trend is rising (not peaked)",
};

// Example: Viral TikTok
const viralTikTok = `
0-1s: Shocking visual or statement (hook)
1-7s: Explain the "why" (value)
7-15s: Payoff or punchline (satisfaction)
15-18s: CTA ("Follow for more")
Loop: Ends where it begins (rewatchability)
`;
```

### Avoiding Penalties

```typescript
const algorithmPenalties = {
  tiktok: [
    "Watermarks from other platforms",
    "Reposted content (not original)",
    "Static images with text (not video)",
    "Spam hashtags (#fyp, #foryoupage)",
  ],
  instagram: [
    "Low-quality video (pixelated)",
    "Reposted TikToks (watermark)",
    "Excessive hashtags (>10)",
    "Engagement bait ('Tag someone who...')",
  ],
  youtube: [
    "Clickbait without delivery (low retention)",
    "Copyright strikes (music, clips)",
    "Misleading metadata",
    "External links in first 24hrs (pins comment instead)",
  ],
  linkedin: [
    "External links in post (use first comment)",
    "Too many hashtags (>5)",
    "Engagement bait ('Agree?')",
  ],
  x: [
    "Spam replies",
    "Mass unfollows (flags account)",
    "External links (native content favored)",
  ],
};
```

---

## Part 8: Gaming the Algorithm vs Authentic Growth

### Short-Term Hacks (Risky)

| Tactic | Risk | Alternative |
|--------|------|-------------|
| **Engagement pods** | Ban, fake metrics | Real community building |
| **Buying followers** | Kills engagement rate | Organic growth strategies |
| **Clickbait** | Low retention, penalties | Honest hooks with payoff |
| **Spam hashtags** | Shadowban | Niche-relevant tags |
| **Follow/unfollow** | Account suspension | Engage with target audience |

### Long-Term Strategy (Sustainable)

```typescript
const sustainableGrowth = {
  content: {
    quality: "10 great posts > 100 mediocre",
    consistency: "Post on schedule (algorithm rewards)",
    niche: "Own a topic (become known for X)",
  },
  community: {
    replies: "Engage with your audience (first hour critical)",
    collaborations: "Partner with similar creators",
    value: "Give before you ask (education, entertainment)",
  },
  analytics: {
    track: "What works (double down on winners)",
    test: "Post at different times, formats",
    iterate: "Improve based on data, not guesses",
  },
};
```

---

## Part 9: Algorithm Updates (2025 Edition)

### What Changed in 2025

```typescript
const updates2025 = {
  tiktok: {
    longerVideos: "3-10 minute videos now prioritized (if retention high)",
    creatorRewards: "Monetization for 1+ minute videos",
    aiLabels: "Disclosed AI content (new requirement)",
  },
  instagram: {
    carousels: "Back in favor (over static posts)",
    notes: "High engagement feature (close friends)",
    collabs: "Dual-audience reach (both creators benefit)",
  },
  youtube: {
    shortsMonetization: "Partner program now includes shorts",
    aiSummaries: "Auto-generated descriptions (optimize yours)",
    chapters: "Required for 10+ min videos (or penalty)",
  },
  linkedin: {
    creatorMode: "Default for all (follower focus)",
    newsletter: "Notify all followers (weekly limit)",
    verification: "Impacts reach (worth getting)",
  },
  x: {
    longform: "25k characters for verified",
    grok: "AI surfaces popular content",
    paidReach: "Blue check = 4x reach (confirmed)",
  },
};
```

---

## Part 10: Tools for Algorithm Insights

### Analytics Platforms

```typescript
const analyticTools = {
  native: {
    tiktok: "TikTok Creator Center (free, built-in)",
    instagram: "Instagram Insights (free for business accounts)",
    youtube: "YouTube Studio (free, comprehensive)",
    linkedin: "LinkedIn Analytics (free for creator mode)",
    x: "X Analytics (free for all accounts)",
  },
  thirdParty: {
    allPlatforms: "Sprout Social, Hootsuite (paid)",
    scheduling: "Buffer, Later, Metricool",
    trending: "ExplodingTopics, Google Trends",
    competitors: "Social Blade, HypeAuditor",
  },
};

// Track These Metrics
const metricsToTrack = {
  engagement: "Likes, comments, shares (per post)",
  reach: "Impressions, profile visits",
  growth: "Follower growth rate (weekly)",
  content: "Top-performing posts (analyze why)",
  timing: "Best posting times (your audience)",
};
```

---

## Part 11: Cross-Platform Strategy

### Repurposing Content

```typescript
// Start with one platform, adapt to others
const repurposingFlow = {
  tiktok: {
    create: "TikTok video (vertical 9:16)",
    repost: {
      instagram: "Reels (remove watermark)",
      youtube: "Shorts (native upload)",
      x: "Native video upload (not link)",
    },
  },
  youtube: {
    create: "Long-form video (16:9)",
    repurpose: {
      tiktok: "Cut into 3-7 clips (vertical)",
      instagram: "Reels clips + carousel screenshots",
      linkedin: "Key takeaways as post + link in comments",
      x: "Thread with key points + video clip",
    },
  },
  linkedin: {
    create: "Long-form post (text-based)",
    repurpose: {
      x: "Thread (break into tweets)",
      instagram: "Carousel (visual quotes)",
      youtube: "Talking head video (read post)",
    },
  },
};
```

### Platform Prioritization

```typescript
// Choose based on goals
const platformPriority = {
  b2c: ["TikTok", "Instagram", "YouTube Shorts"],
  b2b: ["LinkedIn", "X", "YouTube Long-form"],
  personal_brand: ["X", "LinkedIn", "YouTube"],
  ecommerce: ["TikTok", "Instagram", "Pinterest"],
  entertainment: ["TikTok", "YouTube", "Instagram"],
};
```

---

## Part 12: Future-Proofing Your Strategy

### What's Coming

```typescript
const algorithmTrends2026 = {
  aiContent: {
    detection: "Platforms labeling AI-generated content",
    regulation: "Disclosure requirements (FTC)",
    recommendation: "Be transparent, focus on authenticity",
  },
  shortForm: {
    trend: "Longer shorts (3-5 minutes) gaining traction",
    reason: "Higher ad revenue for platforms",
    strategy: "Test longer formats if retention holds",
  },
  communityFirst: {
    shift: "From broadcast to conversation",
    features: "Channels, close friends, subscribers",
    strategy: "Build engaged community > large following",
  },
  videoFirst: {
    reality: "Text posts declining on all platforms",
    exception: "X, LinkedIn still text-friendly",
    strategy: "Learn basic video editing (CapCut, etc)",
  },
};
```

---

## When to Use This Skill

- Planning social media content strategy
- Optimizing posts for maximum reach
- Understanding why content isn't performing
- Deciding which platforms to prioritize
- Scheduling posts at optimal times
- Analyzing competitor strategies
- Adapting to algorithm changes

---

## See Also

- `content/social/SKILL.md` - Social content strategy
- `content/tiktok/SKILL.md` - TikTok content creation
- `content/instagram/SKILL.md` - Instagram content
- `content/youtube/SKILL.md` - YouTube strategy
- `agents/growth-hacking/SKILL.md` - Growth tactics
- `agents/analytics/SKILL.md` - Tracking metrics
