# Multi-Agent Plan: Wave 5 — Creator Economy & AI-First UX

**Created:** December 2025
**Status:** 🔄 In Progress

---

## Objective

Build 8 critical skills to address gaps identified in the Comprehensive Review:

1. **AI Content Generation** — Image (Nano Banana Pro) + Video (Veo 3.1, Sora 2) prompting
2. **Platform Coverage** — Twitch + LinkedIn dedicated skills
3. **Creator Economy** — Creator platform blueprint + advertising/brand deals
4. **AI-First UX** — Usability testing + UX research with AI acceleration

---

## Agent Assignments

| Agent | Builds | Paths | Status |
|-------|--------|-------|--------|
| Agent 1 | AI Image & Video Prompting | `content/prompting-images/SKILL.md`, `content/prompting-video/SKILL.md` | ⏳ Pending |
| Agent 2 | Platform Content (Twitch + LinkedIn) | `content/twitch/SKILL.md`, `content/linkedin/SKILL.md` | ⏳ Pending |
| Agent 3 | Creator Economy | `app-types/creator-platform/SKILL.md`, `agents/advertising/SKILL.md` | ⏳ Pending |
| Agent 4 | AI-First UX | `agents/usability-testing/SKILL.md`, `agents/ux-research/SKILL.md` | ⏳ Pending |

---

## Execution Order

- [x] **Parallel:** All 4 agents work simultaneously (no dependencies)

---

## Handoff Prompts

---

### Agent 1 Prompt: AI Content Generation (Images + Video)

```
# Agent 1 — AI Image & Video Prompting

## Skills to Build

1. **AI Image Prompting** (`content/prompting-images/SKILL.md`)
2. **AI Video Prompting** (`content/prompting-video/SKILL.md`)

---

## Skill 1: AI Image Prompting

**Path:** `content/prompting-images/SKILL.md`

**Focus:** Nano Banana Pro (Google's Gemini 3 Pro Image) as primary tool.

### Part 1: Tool Overview

Cover Nano Banana Pro:
- Gemini 3 Pro Image model from Google DeepMind
- 2K and 4K resolution (vs 1024x1024 on original Nano Banana)
- Legible text in multiple languages (mockups, posters)
- Advanced creative controls (camera angles, lighting, depth of field, color grading)
- Web-searching capabilities
- SynthID watermarking (AI detection)

Access points:
- Gemini app (default image generator)
- AI Mode in Google Search
- NotebookLM
- Google Workspace (Slides, Vids)
- Flow, Mixboard
- Vertex AI, AI Studio, Stitch
- Adobe Firefly, Photoshop (integration)
- Figma, Canva (integration)

Free tier limits:
- Limited generations on free subscription
- Falls back to original Nano Banana after limit
- Pro subscription for unlimited

### Part 2: Prompt Anatomy

Structure:
- Subject: What you want to generate
- Style: Art style, aesthetic, medium
- Lighting: Natural, studio, dramatic, soft
- Composition: Framing, angle, perspective
- Mood: Emotional tone, atmosphere
- Details: Specific elements to include

Examples:
- Product photography prompts
- Social media graphic prompts
- Brand asset prompts (logos need multiple iterations)
- Marketing material prompts

### Part 3: Text in Images

Nano Banana Pro specialty:
- Legible text rendering (unlike most AI models)
- Multiple language support
- Best practices for text placement
- When to use AI text vs overlay in editing

Use cases:
- Social media quote graphics
- Promotional banners
- Mockups with readable labels
- Infographic elements

### Part 4: 4K Workflow

Resolution options:
- 2K generation (default Pro)
- 4K upscaling workflow
- When to use which resolution
- File size considerations for web vs print

### Part 5: Use Cases for Content Creators

Cover with prompts for each:
- Instagram post graphics (1:1, 4:5)
- TikTok/Reels thumbnails (9:16)
- YouTube thumbnails (16:9)
- Blog featured images
- Newsletter headers
- Product mockups
- Brand consistency (style references)

### Part 6: Best Practices 2025-2026

Disclosure:
- FTC requirements for AI-generated content
- Platform policies (Instagram, TikTok)
- SynthID watermarking (automatic in Google tools)

Avoiding issues:
- Copyright considerations
- Brand safety
- Photorealistic human generation policies

### Part 7: Comparison

Brief mention (but Nano Banana Pro is PRIMARY):
- Midjourney (still good for art styles)
- ChatGPT Images 2.0 (OpenAI)
- Ideogram (text rendering alternative)
- When Nano Banana Pro is better/worse

### Part 8: Integration with Content Workflow

Connect to other skills:
- Generate image → Use in Instagram carousel
- Generate thumbnail → Use in YouTube video
- Generate blog header → Use in SEO article
- Batch generation for content calendar

---

## Skill 2: AI Video Prompting

**Path:** `content/prompting-video/SKILL.md`

**Focus:** Google Veo 3.1 (primary) + OpenAI Sora 2 (secondary)

### Part 1: Tool Overview

**Veo 3.1 (Primary - Google DeepMind):**
- Released October 2025
- Up to 60 seconds at 1080p HD
- Native audio generation:
  - Natural conversations with lip-sync
  - Synchronized sound effects
  - Ambient environmental audio
- Frame rates: 24fps fixed
- Aspect ratios: 16:9 (landscape), 9:16 (portrait)
- Duration options: 4, 6, 8 seconds from prompt
- Extend feature: Up to 148 seconds (2.5 minutes)

Veo 3.1 Creative Features:
- "Ingredients to Video": Multiple reference images for characters/objects/style
- "Frames to Video": Start + end image → seamless transition
- Scene extension: Longer videos by chaining clips
- Insert: Add objects/characters to existing scenes
- Remove: Eliminate unwanted elements

Veo 3.1 Access:
- Gemini app (consumer)
- Flow (advanced filmmaking)
- Gemini API (developers)
- Vertex AI (enterprise)
- Google Vids (Workspace - AI avatars)

Veo 3.1 Pricing:
- $0.15/second (Fast mode)
- $0.40/second (Standard mode)

**Sora 2 (Secondary - OpenAI):**
- Released September 2025
- Cinematic video with synchronized audio, dialogue, effects
- Improved physics (basketball rebounds correctly, etc.)
- World-state persistence across shots
- "Cameo" feature: Upload your likeness to star in scenes
- Characters feature: Insert yourself/others into any environment

Sora 2 Access:
- Sora iOS/Android app
- ChatGPT Plus (via Sora feature)
- Video API (developer preview)

Disney Partnership:
- 200+ Disney characters available (Disney, Pixar, Marvel, Star Wars)
- $1B Disney investment (December 2025)

### Part 2: Prompt Anatomy for Video

Structure:
- Scene description: What happens, who's in it
- Camera movement: Pan, zoom, tracking, static
- Style: Cinematic, anime, realistic, documentary
- Action: What's happening frame-by-frame
- Duration: How long the clip should be
- Audio cues: Dialogue, music, ambient sounds (Veo 3.1)

Veo 3.1 specific:
- Native audio prompting (describe the sound)
- Lip-sync for dialogue
- Ambient sound descriptions

Sora 2 specific:
- Character consistency prompts
- Multi-shot sequences
- Physics-aware descriptions

### Part 3: Techniques

Prompt chaining:
- Multi-scene videos
- Consistent characters across clips
- Story arcs in AI video

Image-to-video:
- Reference frame usage
- Veo 3.1 "Frames to Video" feature
- Maintaining brand consistency

Extending clips:
- Veo 3.1 extend feature (up to 148 sec)
- Scene continuation best practices

### Part 4: Use Cases for Content Creators

With specific prompts for each:
- TikTok/Reels B-roll (5-15 sec clips)
- YouTube intros/outros
- Product demos
- Explainer video segments
- Transition clips
- Background footage
- AI avatars for talking heads (Veo 3.1 in Google Vids)

### Part 5: Limitations 2025

Veo 3.1:
- 60 second max (extendable to 148 sec)
- 1080p max resolution
- 24fps fixed
- Cost per second adds up

Sora 2:
- Character consistency improving but not perfect
- Text rendering still weak
- High demand = queue times

General:
- AI video disclosure requirements
- Platform detection and labeling
- Hybrid workflows recommended (AI + real footage)

### Part 6: Cost Optimization

Veo 3.1 pricing strategy:
- Fast mode ($0.15/sec) for drafts
- Standard mode ($0.40/sec) for final
- Calculate cost before generating

Sora 2 pricing:
- Included in ChatGPT Plus
- API pricing for developers

When to use which:
- Veo 3.1 for audio-heavy clips
- Sora 2 for character consistency
- Cost-benefit for different use cases

### Part 7: Best Practices 2025-2026

Disclosure:
- FTC requirements for AI video
- Platform auto-detection (SynthID, ContentCredentials)
- Labeling AI-generated content

Workflow:
- Generate clips → Edit in CapCut/Premiere
- AI for B-roll, humans for A-roll
- Quality control before publishing

### Part 8: Integration with Content Workflow

Connect to other skills:
- Generate B-roll → Use in TikTok
- Generate intro → Use in YouTube
- Generate product demo → Use in Instagram Reels
- Batch generation for content calendar

---

## Cross-References to Include

Both skills should link to:
- `content/social/SKILL.md`
- `content/tiktok/SKILL.md`
- `content/instagram/SKILL.md`
- `content/youtube/SKILL.md`
- `ai-builder/vision-models/SKILL.md`
- `agents/algorithm/SKILL.md`

---

## Resources to Include

Nano Banana Pro:
- https://blog.google/technology/ai/nano-banana-pro/
- https://gemini.google/overview/image-generation/
- https://deepmind.google/models/gemini-image/pro/

Veo 3.1:
- https://deepmind.google/models/veo/
- https://developers.googleblog.com/introducing-veo-3-1-and-new-creative-capabilities-in-the-gemini-api/
- https://blog.google/technology/ai/veo-updates-flow/

Sora 2:
- https://openai.com/index/sora-2/
- https://platform.openai.com/docs/guides/video-generation
- https://help.openai.com/en/articles/9957612-generating-videos-on-sora

---

## After Building (REQUIRED)

1. Add to `SKILL-NAVIGATION.md` section 11 (Content)
2. Add to `tech-stack/SKILL-INDEX.md` under "AI Features"
3. Add to `_meta/CHANGELOG.md`
4. Update cross-references in `ai-builder/vision-models/SKILL.md`

---

## Completion Report

1. Paths to created files
2. Confirmation navigation updated
3. Any issues
```

---

### Agent 2 Prompt: Platform Content (Twitch + LinkedIn)

```
# Agent 2 — Twitch & LinkedIn Content Skills

## Skills to Build

1. **Twitch Content** (`content/twitch/SKILL.md`)
2. **LinkedIn Content** (`content/linkedin/SKILL.md`)

---

## Skill 1: Twitch Content Strategy

**Path:** `content/twitch/SKILL.md`

### Part 1: TL;DR

| Component | Purpose |
|-----------|---------|
| **Stream Setup** | OBS, Streamlabs, StreamElements |
| **Go-Live Strategy** | Timing, categories, tags |
| **Monetization** | Subs, bits, ads, sponsorships |
| **Community** | Discord, mods, raids |
| **VOD Strategy** | Clips, highlights, repurposing |

### Part 2: Stream Setup

Software comparison:
- OBS Studio (free, customizable)
- Streamlabs Desktop (all-in-one, alerts built-in)
- StreamElements OBS.Live (browser-based widgets)

Hardware basics:
- Microphone (USB vs XLR)
- Camera (1080p minimum)
- Lighting (key light, fill light)
- Green screen (optional)
- Stream deck (optional)

Encoding settings:
- Bitrate for Twitch (6000kbps max)
- Resolution (1080p60 vs 720p60)
- Encoder (NVENC vs x264)

### Part 3: Twitch-Specific Features

Raids:
- How to raid others
- Getting raided (alerts, welcome messages)
- Raid etiquette
- Raid trains for growth

Clips:
- Enabling clip creation
- Auto-clip tools
- Using clips for YouTube/TikTok
- Clip strategy for discoverability

Channel Points:
- Custom rewards
- Engagement drivers
- Gamification

Extensions:
- Useful extensions (loyalty, games, overlays)
- Interactive extensions
- Monetization extensions

### Part 4: Monetization

Twitch Partner vs Affiliate:
- Requirements for each
- Revenue differences
- Path from zero to Partner

Revenue streams:
- Subscriptions (Tier 1/2/3)
- Bits (Cheering)
- Ads (pre-roll, mid-roll)
- Sponsorships
- Merchandise
- Donations (third-party)

Sponsorship tips:
- Media kit creation
- Rate negotiation
- Brand safety
- Disclosure requirements

### Part 5: Discoverability

Tags:
- Choosing effective tags
- Trending tags
- Niche tags

Categories:
- Category selection strategy
- Just Chatting vs game-specific
- Category timing

Going live times:
- When to stream (avoiding saturation)
- Consistent schedule
- Time zone considerations

Twitch algorithm 2025:
- How recommendations work
- What boosts discoverability
- Common mistakes

### Part 6: Community Building

Discord integration:
- Linking Discord to Twitch
- Discord bot setup
- Community engagement

Moderation:
- Mod recruitment
- AutoMod settings
- Chat rules
- Timeout vs ban

VIPs and regulars:
- VIP management
- Building core community
- Rewarding loyalty

### Part 7: VOD Strategy

Highlights:
- Creating highlights from VODs
- Highlight reel best practices
- Auto-publish settings

YouTube repurposing:
- VOD to YouTube workflow
- Editing for YouTube (different pacing)
- SEO for YouTube uploads

TikTok/Shorts from streams:
- Clip extraction workflow
- Vertical cropping
- Hook-first editing

### Part 8: Twitch 2025-2026 Updates

DJ Program:
- Music licensing for streams
- Soundtrack by Twitch
- DMCA avoidance

Recent changes:
- Revenue share updates
- Simulcasting rules
- New features

### Part 9: Analytics

Key metrics:
- Average viewers (crucial for growth)
- Peak concurrent viewers
- Chat activity rate
- Follower conversion
- Sub conversion rate

Tools:
- Twitch Analytics dashboard
- StreamElements analytics
- Sullygnome (competitive analysis)

### Part 10: Checklist

- [ ] OBS/Streamlabs configured
- [ ] Alerts set up
- [ ] Channel points customized
- [ ] Discord linked
- [ ] Mod team recruited
- [ ] Streaming schedule set
- [ ] Clip-to-social workflow ready

---

## Skill 2: LinkedIn Content Strategy

**Path:** `content/linkedin/SKILL.md`

### Part 1: TL;DR

| Component | Purpose |
|-----------|---------|
| **Post Formats** | Text, document, video, newsletter |
| **Algorithm** | Dwell time, comments, early engagement |
| **B2B Focus** | Thought leadership, lead gen |
| **Creator Tools** | Newsletters, audio events, creator mode |

### Part 2: LinkedIn Algorithm 2025-2026

How it works:
- Dwell time (how long people read)
- Early engagement (first 60 minutes)
- Comments over reactions
- Shares to external = penalty
- Native content > links

Algorithm signals:
- High: Comments, dwell time, saves
- Medium: Reactions, shares within LinkedIn
- Low: External link clicks
- Negative: Hides, unfollows, spam reports

Creator Mode:
- Now default for all users
- Follower focus vs connection focus
- Impact on reach

Verification:
- Getting verified on LinkedIn
- Impact on reach
- Professional vs personal verification

### Part 3: Post Formats

**Text Posts (Highest Reach):**
- 1300-2000 characters sweet spot
- First 2 lines = hook (before "see more")
- Line breaks every 1-2 sentences
- Emojis: 1-3 max
- Bullets: • or → for lists

**Document Posts (High Engagement):**
- PDF carousels
- 7-10 slides optimal
- Design tips (readability, branding)
- Cover slide = hook
- Final slide = CTA

**Video (Growing):**
- Native upload only (no YouTube links)
- 30-90 seconds optimal
- Captions required (80% watch muted)
- Talking head + overlay text
- LinkedIn Live for longer content

**Newsletters:**
- Weekly publishing (notify all followers)
- SEO value (indexed by Google)
- Building subscriber base
- Newsletter vs article (newsletter wins)

**Articles:**
- Long-form SEO content
- Less reach than posts
- Evergreen reference material

### Part 4: Content Strategy

Content pillars for B2B:
- Industry insights
- Personal journey/lessons
- How-to/tutorials
- Contrarian takes
- Behind-the-scenes

Posting frequency:
- 3-5x per week minimum
- Daily if building presence
- Consistency > frequency

Best times (EST):
- 7-9am (pre-work)
- 12-1pm (lunch)
- 5-6pm (after work)
- Avoid weekends

### Part 5: Post Structure

Hook patterns:
- Bold statement opening
- Question hook
- Contrarian take
- Story hook
- Data/stat hook

Post formula:
```
[Hook: Bold statement or question]

[Space]

[Personal story or context]

• Point 1
• Point 2
• Point 3

[Space]

[Lesson/takeaway]

[CTA: Question to drive comments]
```

### Part 6: Engagement Tactics

First hour:
- Respond to every comment
- Ask follow-up questions
- Tag relevant people

Comment strategy:
- Comment on others' posts (visibility)
- Thoughtful comments > generic
- Comment on big accounts = visibility

DM strategy:
- Warm outreach (engage first, DM second)
- Voice messages (stand out)
- No pitch in first message

### Part 7: Lead Generation

Profile optimization:
- Headline = value proposition
- Banner image = CTA
- About section = story + offer
- Featured section = lead magnets

Funnel:
- Content → Profile visit → Follow → DM/Newsletter → Lead

Lead magnets:
- Free PDF in featured section
- Newsletter signup
- Calendly link

### Part 8: LinkedIn Live

Setup:
- Requirements (verified, follower count)
- Streaming software (Restream, StreamYard)
- Promotion before going live

Best practices:
- Announce 24-48 hours ahead
- Engage with comments live
- Repurpose as video clips

Audio Events:
- LinkedIn's audio rooms
- Hosting vs joining
- Building authority

### Part 9: Analytics

Key metrics:
- Impressions
- Engagement rate
- Profile views
- Follower growth
- Newsletter subscribers
- Post performance trends

Tracking:
- LinkedIn Analytics (native)
- Shield App (third-party)
- AuthoredUp (scheduling + analytics)

### Part 10: Tools

| Tool | Purpose |
|------|---------|
| Shield | Analytics deep-dive |
| AuthoredUp | Scheduling, formatting |
| Taplio | Content scheduling |
| Crystal | Personality insights |
| Notion | Content calendar |

### Part 11: Checklist

- [ ] Profile optimized (headline, banner, about)
- [ ] Creator mode enabled
- [ ] First 5 posts drafted
- [ ] Posting schedule set
- [ ] Engagement time blocked (1 hour/day)
- [ ] Newsletter created
- [ ] Analytics tracking enabled

---

## Cross-References to Include

Both skills should link to:
- `content/social/SKILL.md`
- `agents/algorithm/SKILL.md`
- `workflows/growth/SKILL.md`
- `agents/b2b-b2c/SKILL.md` (especially LinkedIn)
- `agents/growth-hacking/SKILL.md`

---

## After Building (REQUIRED)

1. Add to `SKILL-NAVIGATION.md` section 11 (Content)
2. Add to `tech-stack/SKILL-INDEX.md`
3. Add to `_meta/CHANGELOG.md`

---

## Completion Report

1. Paths to created files
2. Confirmation navigation updated
3. Any issues
```

---

### Agent 3 Prompt: Creator Economy

```
# Agent 3 — Creator Economy Skills

## Skills to Build

1. **Creator Platform Blueprint** (`app-types/creator-platform/SKILL.md`)
2. **Advertising & Brand Deals** (`agents/advertising/SKILL.md`)

---

## Skill 1: Creator Platform Blueprint

**Path:** `app-types/creator-platform/SKILL.md`

**Description:** Build apps FOR content creators (tools, platforms, marketplaces)

### Part 1: TL;DR

| Feature | Examples |
|---------|----------|
| **Link-in-bio** | Linktree, Beacons, Bio.fm |
| **Memberships** | Patreon, Buy Me a Coffee, Ko-fi |
| **Courses** | Teachable, Podia, Gumroad |
| **All-in-one** | Kajabi, Circle, Mighty Networks |

### Part 2: Core Features

**Audience Management:**
- Fan database (CRM for creators)
- Segmentation (super fans, casuals, subscribers)
- Communication tools (DMs, email, SMS)
- Analytics (who engages, when, where)

**Monetization:**

Direct:
- Subscriptions (tiered memberships)
- Digital products (courses, templates, presets)
- Tips/donations (Buy Me a Coffee model)
- Exclusive content

Indirect:
- Brand deals (see advertising skill)
- Affiliate marketing
- Sponsored content

Platform-specific:
- TikTok Creator Fund
- YouTube AdSense
- Twitch subs
- Instagram/Facebook bonuses
- LinkedIn Creator Accelerator

**Content Management:**
- Multi-platform publishing
- Content calendar
- Asset library (templates, music, stock)
- Collaboration tools (teams, editors, managers)

**Analytics:**
- Cross-platform metrics aggregation
- Revenue tracking
- Engagement insights
- Trend alerts

### Part 3: Tech Stack 2025-2026

**Frontend:**
- Next.js 16.1.1 (React 19)
- Tailwind CSS
- Shadcn/ui (dashboard components)
- React Query (data fetching)

**Backend:**
- Supabase (auth, database, storage, realtime)
- OR Prisma + PostgreSQL
- Inngest (background jobs)

**Payments:**
- Stripe Subscriptions (creator memberships)
- Stripe Connect (marketplace payouts to creators)
- Stripe Tax (global tax compliance)

**Email/Communication:**
- Resend (transactional + campaigns)
- Twilio (SMS)

**Storage:**
- Cloudflare R2 (cheap media storage)
- Uploadthing (easy file uploads)

**Platform APIs:**
- TikTok API (analytics, posting)
- Instagram Graph API (insights, publishing)
- YouTube Data API (stats, uploads)
- Twitch API (stream data, subs)
- LinkedIn API (posts, analytics)

### Part 4: Platform Integrations

**TikTok API:**
- OAuth flow
- Video upload
- Analytics endpoints
- Rate limits (strict)

**Instagram Graph API:**
- Business/Creator account required
- Insights endpoints
- Publishing (scheduled posts)
- Rate limits

**YouTube Data API:**
- OAuth 2.0
- Channel analytics
- Video upload
- Quota system

**Twitch API:**
- Helix API
- EventSub (webhooks)
- Stream data, clips, subs

Handling rate limits:
- Queue system
- Caching strategy
- Graceful degradation

### Part 5: Monetization Implementation

**Stripe Subscriptions:**
- Tier setup (Free, Pro, VIP)
- Billing portal
- Webhook handling
- Proration

**Stripe Connect (Marketplace):**
- Creator onboarding
- Platform fee collection
- Payout scheduling
- Tax document generation (1099)

**Digital Products:**
- File delivery system
- Download protection
- License key generation
- Refund handling

### Part 6: Unique Challenges

**Platform API Limits:**
- TikTok: Very strict rate limits
- Instagram: Requires app review
- YouTube: Quota system
- Solution: Queue + cache + graceful fallback

**Monetization Complexity:**
- Taxes (1099s for US creators)
- International payments
- VAT/GST handling
- Stripe Tax integration

**Compliance:**
- FTC disclosure rules
- Platform-specific rules
- COPPA (if minors)
- GDPR (EU creators/fans)

**Content Moderation:**
- UGC moderation
- DMCA safe harbor
- Community guidelines
- Reporting system

### Part 7: Example Architectures

**Link-in-Bio Clone (Linktree):**
- Simple: User auth, link editor, analytics
- Stack: Next.js + Supabase + Vercel

**Membership Platform (Patreon):**
- Complex: Tiers, content gating, Stripe Connect
- Stack: Next.js + Supabase + Stripe Connect + R2

**Creator Dashboard (Cross-Platform):**
- Advanced: API aggregation, unified analytics
- Stack: Next.js + Supabase + Queue + Multiple APIs

### Part 8: Checklist

- [ ] Auth with Clerk or Supabase Auth
- [ ] Database schema for creators + fans
- [ ] Stripe integration (subscriptions or Connect)
- [ ] At least one platform API connected
- [ ] Analytics dashboard
- [ ] Email system (welcome, transactions)
- [ ] Content delivery (if applicable)

---

## Skill 2: Advertising & Brand Deals

**Path:** `agents/advertising/SKILL.md`

**Description:** Running ads + getting brand deals + sponsorships

### Part 1: TL;DR

| Type | Who It's For |
|------|--------------|
| **Running Ads** | Apps, products, SaaS |
| **Brand Deals** | Content creators |
| **Sponsorships** | Podcasts, newsletters, events |

### Part 2: Running Ads (For Apps/Products)

**Platforms 2025-2026:**

Google Ads:
- Search ads
- Display network
- YouTube ads
- Performance Max campaigns

Meta Ads (Facebook + Instagram):
- Feed ads
- Stories ads
- Reels ads
- Advantage+ campaigns (AI-optimized)

TikTok Ads:
- In-feed ads
- TopView
- Spark Ads (boost organic)
- TikTok Shop integration

LinkedIn Ads:
- Sponsored content
- Message ads
- Lead gen forms
- B2B focus

Reddit Ads:
- Promoted posts
- Niche targeting by subreddit
- Underrated for specific audiences

X (Twitter) Ads:
- Promoted tweets
- Video ads
- Blue subscriber advantage

**Ad Types:**
- Search (Google, Bing)
- Social (Meta, TikTok, LinkedIn)
- Display (banners, retargeting)
- Native (Outbrain, Taboola)
- Video (YouTube, TikTok)

**Strategy:**

Targeting:
- Demographics
- Interests
- Lookalike audiences
- Retargeting (pixel-based)

Creative best practices 2025:
- UGC-style performs best
- Testimonials
- AI-generated creative (Nano Banana Pro, Veo 3.1)
- Mobile-first design

Budget allocation:
- Start small ($20-50/day)
- Test multiple creatives
- Scale winners
- ROAS tracking

A/B testing:
- Headlines
- Images/videos
- CTAs
- Audiences

Retargeting:
- Pixel setup (Meta, Google)
- Audience creation
- Funnel-based messaging

**Metrics:**

| Metric | Target |
|--------|--------|
| CTR | >1% (varies by platform) |
| CPC | Industry dependent |
| ROAS | >3x for profitability |
| CAC | < LTV / 3 |

### Part 3: Brand Deals (For Creators)

**Finding Brands:**

Marketplaces:
- AspireIQ
- Grin
- Creator.co
- Collabstr
- Hashtag Paid

Direct outreach:
- Email templates
- DM strategy
- Media kit essentials

Agencies:
- When to use an agency
- Finding representation
- Commission structures (15-20%)

**Negotiating Deals:**

Pricing models:
- CPM (cost per thousand views)
- Flat fee
- Affiliate (commission on sales)
- Hybrid (fee + affiliate)

Calculating rates:
- $10-50 per 1K followers (varies by niche)
- Engagement rate multiplier
- Platform premium (TikTok > Instagram)

Deliverables:
- Number of posts
- Stories vs Reels vs Feed
- Exclusivity period
- Usage rights

Negotiation points:
- Usage rights (can brand repost? Run as ads? Duration?)
- Exclusivity (competitor clauses)
- Payment terms (50% upfront, 50% on delivery)
- Revisions (limit to 2)

**Contracts:**

Template elements:
- Scope of work
- Deliverables and timeline
- Payment terms
- Usage rights
- Exclusivity
- FTC disclosure requirements
- Termination clause

Red flags:
- Unlimited revisions
- Perpetual usage rights
- Low pay for scope
- No kill fee

**Disclosure Requirements 2025-2026:**

FTC:
- #ad or #sponsored must be clear
- "Paid partnership" label on platforms
- Disclosure in first line, not buried
- Voice disclosure in videos

Platform-specific:
- Instagram: "Paid partnership with [brand]"
- TikTok: "Branded content" toggle
- YouTube: "Includes paid promotion" checkbox

Penalties:
- FTC fines
- Platform penalties (reduced reach)
- Account suspension

**Performance Tracking:**

Metrics brands care about:
- Reach (impressions)
- Engagement rate
- Click-through rate
- Conversion/sales (if affiliate)
- Brand lift (awareness)

Reporting:
- Screenshot analytics
- Google Sheets template
- Notion dashboard

Case studies:
- How to document ROI
- Before/after metrics
- Testimonials from brands

### Part 4: Sponsorships

**Types:**
- Podcast (pre-roll, mid-roll, post-roll)
- YouTube (dedicated segments)
- Newsletter (header, inline, footer)
- Events (conferences, workshops)
- Livestream (Twitch, YouTube Live)

**Platforms:**

Podcasts:
- Podcorn
- Gumball
- AdvertiseCast
- Direct outreach

YouTube:
- Grapevine (now part of Later)
- Direct outreach
- MCN partnerships

Newsletters:
- SparkLoop
- Swapstack
- beehiiv ad network
- Direct sales

**Pricing Models:**

| Model | Best For |
|-------|----------|
| CPM | Large audiences, awareness |
| Flat fee | Predictable budgets |
| Affiliate | Performance-focused |
| Rev share | Ongoing partnerships |

**Sponsorship Best Practices:**

Integration:
- Host-read ads > pre-recorded
- Authentic endorsement
- Personal story about product
- Natural placement

Tracking:
- Unique discount codes
- UTM parameters
- Dedicated landing pages
- Attribution windows

### Part 5: Tools

**For Running Ads:**
- Meta Ads Manager
- Google Ads
- TikTok Ads Manager
- AdSpy, BigSpy (competitor research)
- Triple Whale (attribution)

**For Brand Deals:**
- Notion (deal tracking)
- DocuSign (contracts)
- Wave/QuickBooks (invoicing)
- Media kit templates (Canva)

**For Sponsorships:**
- Transistor, Buzzsprout (podcast hosting with analytics)
- beehiiv, ConvertKit (newsletter with sponsorship features)
- Streamlabs (livestream sponsorship overlays)

### Part 6: Checklist

**For Running Ads:**
- [ ] Pixel installed (Meta, Google)
- [ ] Conversion tracking set up
- [ ] Audience segments created
- [ ] Creative variants ready
- [ ] Budget allocated
- [ ] A/B test plan documented

**For Brand Deals:**
- [ ] Media kit created
- [ ] Rate card prepared
- [ ] Contract template ready
- [ ] Invoicing system set up
- [ ] Disclosure practices clear

---

## Cross-References to Include

Both skills should link to:
- `agents/analytics/SKILL.md`
- `agents/stripe/SKILL.md`
- `workflows/monetization/SKILL.md`
- `agents/growth-hacking/SKILL.md`
- `content/social/SKILL.md`
- `agents/algorithm/SKILL.md`

---

## After Building (REQUIRED)

1. Add to `SKILL-NAVIGATION.md`:
   - creator-platform under app-types
   - advertising under agents
2. Add to `tech-stack/SKILL-INDEX.md`
3. Add to `_meta/CHANGELOG.md`

---

## Completion Report

1. Paths to created files
2. Confirmation navigation updated
3. Any issues
```

---

### Agent 4 Prompt: AI-First UX

```
# Agent 4 — AI-First UX Skills

## Skills to Build

1. **Usability Testing (AI-First)** (`agents/usability-testing/SKILL.md`)
2. **UX Research (AI-First)** (`agents/ux-research/SKILL.md`)

---

## Skill 1: Usability Testing (AI-First)

**Path:** `agents/usability-testing/SKILL.md`

**Philosophy:** Test real prototypes immediately. AI-assisted analysis. Rapid iteration (test → fix → test same day).

### Part 1: TL;DR

| Method | Speed | Depth | AI Assist |
|--------|-------|-------|-----------|
| **Unmoderated Testing** | Fast | Medium | High |
| **Moderated Testing** | Slow | Deep | Medium |
| **Heuristic Eval** | Very Fast | Surface | High |
| **A/B Testing** | Medium | Quantitative | High |

### Part 2: AI-First Principles

Traditional:
- Plan → Recruit → Test → Analyze → Report → Iterate (weeks)

AI-First 2025:
- Build → Test immediately → AI analyzes → Fix same day → Retest

Speed advantages:
- AI transcribes sessions in real-time
- AI summarizes findings automatically
- AI identifies friction patterns
- AI suggests fixes

### Part 3: Tools 2025-2026

**Unmoderated Testing:**

| Tool | AI Features | Best For |
|------|-------------|----------|
| Maze AI | Auto-summarize, friction detection | Quick prototype tests |
| UserTesting AI Insights | Instant summaries | Enterprise |
| PlaybookUX | AI transcription, sentiment | Mixed methods |
| Lookback | AI note-taking | Moderated remote |

**Heuristic Evaluation:**

| Tool | AI Features | Best For |
|------|-------------|----------|
| Neurons Predict AI | Attention prediction (95% accuracy) | Before building |
| UXtweak Smart Analytics | Behavioral ML | Live site analysis |
| Attention Insight | Heatmap prediction | Visual design |

**A/B Testing:**

| Tool | AI Features | Best For |
|------|-------------|----------|
| PostHog | Session replay + analytics | Product teams |
| Statsig | Auto-analysis | Feature flags |
| Amplitude Experiment | AI insights | Enterprise |

### Part 4: Test Real Prototypes Immediately

Prototype tools that enable instant testing:
- Figma prototypes → Maze AI
- v0.dev prototypes → Deploy → UserTesting
- Lovable MVPs → Live user testing

Workflow:
1. Build prototype (AI-assisted: v0, Lovable, Cursor)
2. Create test in Maze (5 minutes)
3. Get results (1-24 hours)
4. AI summarizes findings
5. Fix in code (same day)
6. Retest

### Part 5: Unmoderated Testing Setup

**Maze AI Workflow:**

Task setup:
- Define success paths
- Write clear task prompts
- Set completion criteria

AI features:
- Auto-generate test questions
- Summarize participant responses
- Identify recurring friction
- Suggest improvements

Metrics:
- Task completion rate
- Time on task
- Misclick rate
- Drop-off points

**UserTesting Workflow:**

Screener setup:
- Demographics
- Behavior qualifiers
- Quota settings

AI Insights:
- Video highlight reels (auto-generated)
- Sentiment analysis
- Theme extraction

### Part 6: Moderated Testing

When to use:
- Complex flows
- Sensitive topics
- Need follow-up questions
- Exploratory research

AI assistance during sessions:
- Real-time transcription
- AI note suggestions
- Auto-tagging moments
- Post-session summaries

Tools:
- Lookback (AI notes)
- Zoom + Otter.ai (transcription)
- Dovetail (analysis)

### Part 7: Heuristic Evaluation

Traditional heuristics:
- Nielsen's 10 heuristics
- Cognitive walkthrough
- Expert review

AI-enhanced 2025:
- Neurons Predict AI: Upload screenshot → Attention heatmap
- ChatGPT/Claude: Paste UI description → Heuristic review
- Attention Insight: Predict click patterns

Workflow:
1. Screenshot prototype
2. Run through Neurons Predict
3. Identify attention gaps
4. Ask Claude for heuristic review
5. Prioritize fixes
6. Test with real users

### Part 8: A/B Testing

When to use:
- Quantitative validation
- High-traffic features
- Before major launches

AI features in 2025 tools:
- Auto-detect statistical significance
- Predict winning variant
- Segment analysis
- Anomaly detection

Implementation:
- PostHog feature flags
- Statsig experiments
- Amplitude Experiment

A/B testing for AI features:
- Test prompt variations
- Test model outputs
- Test UI for AI interactions
- Measure task completion

### Part 9: Testing AI Features Specifically

Unique considerations:
- AI output variability
- Prompt testing
- Error state testing
- Hallucination detection

What to test:
- Does user understand AI output?
- Can user recover from AI errors?
- Is AI fast enough?
- Does user trust the AI?

Metrics for AI UX:
- Task success with AI
- Time to complete with AI
- Trust ratings
- Error recovery rate

### Part 10: Rapid Iteration Protocol

Same-day testing cycle:
```
Morning:   Build/fix prototype
Noon:      Launch unmoderated test (Maze)
Afternoon: AI analyzes results
Evening:   Fix issues
Next AM:   Retest
```

Week-long iteration:
```
Mon: Prototype + test
Tue: Fix + retest
Wed: Fix + retest
Thu: Moderated sessions (deeper)
Fri: Fix + launch
```

### Part 11: Reporting with AI

Auto-generated reports:
- Maze AI summaries
- Dovetail theme extraction
- Claude synthesis of findings

What to include:
- Key findings (top 3)
- Evidence (video clips, quotes)
- Recommendations (prioritized)
- Metrics dashboard

Stakeholder communication:
- AI-generated executive summary
- Video highlight reel
- Action items with owners

### Part 12: Checklist

- [ ] Testing tool selected (Maze, UserTesting, etc.)
- [ ] First prototype ready to test
- [ ] Task scenarios written
- [ ] Participant criteria defined
- [ ] AI summarization enabled
- [ ] Reporting template ready
- [ ] Iteration workflow documented

---

## Skill 2: UX Research (AI-First)

**Path:** `agents/ux-research/SKILL.md`

**Philosophy:** AI-accelerated research. Continuous research while shipping. Real-time feedback on real prototypes.

### Part 1: TL;DR

| Research Type | Traditional | AI-First 2025 |
|---------------|-------------|---------------|
| **Interviews** | 2-4 weeks | 3-5 days |
| **Surveys** | 1-2 weeks | 1-3 days |
| **Synthesis** | Days | Hours |
| **Insights** | Manual | AI-generated |

### Part 2: AI-First Research Principles

Traditional research:
- Separate from development
- Happens before building
- Takes weeks
- Research team only

AI-First 2025:
- Integrated with development
- Continuous (research while shipping)
- Takes days
- Whole team participates

Core shifts:
- AI handles transcription, tagging, synthesis
- Humans focus on strategy and interpretation
- Faster cycles enable more iteration
- Real prototypes tested, not mockups

### Part 3: Tools 2025-2026

**Interview & Synthesis:**

| Tool | AI Features | Best For |
|------|-------------|----------|
| Dovetail | AI summaries, themes, tags | Interview analysis |
| Notably | Auto-tag, insight extraction | Qualitative data |
| Looppanel | AI transcription, analysis | Remote interviews |
| Grain | AI highlights, clips | Meeting insights |

**Survey & Quantitative:**

| Tool | AI Features | Best For |
|------|-------------|----------|
| Typeform | AI question suggestions | Beautiful surveys |
| SurveyMonkey | AI analysis | Enterprise |
| Maze | AI survey analysis | Integrated with testing |

**Behavioral:**

| Tool | AI Features | Best For |
|------|-------------|----------|
| Hotjar | AI-generated insights | Heatmaps, recordings |
| FullStory | AI session analysis | Deep behavior |
| PostHog | Session replay + analytics | Product teams |

### Part 4: AI-Accelerated Interview Research

**Before interviews:**
- AI generates discussion guide
- AI recruits participants (UserInterviews, Respondent)
- AI schedules sessions

**During interviews:**
- AI transcribes in real-time (Otter, Grain)
- AI suggests follow-up questions
- AI tags key moments

**After interviews:**
- AI summarizes each session (Dovetail)
- AI extracts themes across sessions
- AI generates insight report

Workflow:
1. Define research question
2. AI drafts discussion guide (Claude)
3. Recruit 5-8 participants
4. Run interviews with AI transcription
5. Upload to Dovetail → AI synthesizes
6. Review AI findings, add human interpretation
7. Share with team

### Part 5: Continuous Research

Research while shipping:
- Always-on feedback channels
- In-product surveys
- Session recordings
- Customer support mining

Implementation:
- Hotjar/FullStory always running
- Intercom/Zendesk feedback tagged
- Weekly research synthesis (AI-assisted)
- Monthly research readouts

In-product research:
- Micro-surveys (1 question)
- Feedback widgets
- Feature-specific surveys
- NPS/CSAT tracking

### Part 6: Survey Research

AI-enhanced survey design:
- AI suggests questions
- AI predicts response rates
- AI analyzes open-ended responses

Best practices 2025:
- Short (5-10 questions max)
- Mobile-first design
- Mix of closed + open
- AI analyzes open text responses

Workflow:
1. Define what you need to learn
2. AI drafts questions (Claude)
3. Review and refine
4. Launch to segment
5. AI analyzes responses
6. Generate insights report

### Part 7: Behavioral Research

Session recordings:
- Hotjar, FullStory, PostHog
- AI identifies rage clicks
- AI flags confusion patterns
- AI generates highlight reels

Analytics + research:
- Quantitative (what) + Qualitative (why)
- Segment analysis
- Funnel breakdown
- Cohort behavior

AI pattern detection:
- Unusual drop-offs
- Repeated friction points
- Power user behaviors
- Churn signals

### Part 8: Research Repository

Why:
- Avoid repeating research
- Build organizational knowledge
- Share insights across teams

Tools:
- Dovetail (research repository)
- Notion (lightweight)
- Confluence (enterprise)

AI features:
- Searchable transcripts
- Auto-tagged insights
- Related research suggestions
- Knowledge graphs

### Part 9: AI-Generated Insights

What AI can do:
- Summarize interviews
- Extract themes
- Identify patterns
- Generate quotes
- Create highlight reels

What humans must do:
- Interpret meaning
- Connect to strategy
- Make recommendations
- Decide actions
- Validate AI findings

Balance:
- AI = 70% of grunt work
- Human = 100% of interpretation
- Review AI output critically
- AI can miss nuance

### Part 10: Research for AI Products

Testing AI features:
- Does AI meet user expectations?
- How do users recover from AI errors?
- What's the trust level?
- When does AI help vs. hinder?

Research questions:
- Mental models of AI
- Expectations of AI capability
- Trust calibration
- Error handling preferences

Methods:
- Wizard of Oz testing
- A/B test AI variations
- Think-aloud with AI features
- Longitudinal trust studies

### Part 11: Rapid Research Protocol

3-Day Sprint:
```
Day 1:
- Define question
- AI drafts guide
- Recruit participants

Day 2:
- Run 4-6 interviews
- AI transcribes

Day 3:
- AI synthesizes
- Human interprets
- Share findings
```

Weekly continuous:
```
Mon: Review last week's data (AI-analyzed)
Tue: Customer call / interview
Wed: Synthesis
Thu: Share with team
Fri: Update research backlog
```

### Part 12: Checklist

- [ ] Research repository set up (Dovetail/Notion)
- [ ] Transcription tool selected
- [ ] Participant pipeline established
- [ ] In-product feedback widgets live
- [ ] Session recording enabled
- [ ] Weekly research ritual scheduled
- [ ] AI synthesis workflow documented

---

## Cross-References to Include

Both skills should link to:
- `agents/analytics/SKILL.md`
- `agents/a11y/SKILL.md`
- `workflows/personas/SKILL.md`
- `agents/design-system/SKILL.md`
- `agents/growth-hacking/SKILL.md`

---

## After Building (REQUIRED)

1. Add to `SKILL-NAVIGATION.md` section 5 (TEST)
2. Add to `tech-stack/SKILL-INDEX.md` under "Testing & Quality"
3. Add to `_meta/CHANGELOG.md`

---

## Completion Report

1. Paths to created files
2. Confirmation navigation updated
3. Any issues
```

---

## After Completion

- [ ] All 8 skills created
- [ ] Navigation updated (SKILL-NAVIGATION.md)
- [ ] SKILL-INDEX.md updated
- [ ] CROSS-REFERENCES.md updated
- [ ] CHANGELOG.md updated with Wave 5
- [ ] Review run on new content

---

## Completion Report Template

When all agents complete:

```markdown
## Wave 5 Completion Report

### Skills Created
| Agent | Skills | Paths | Status |
|-------|--------|-------|--------|
| 1 | AI Prompting | content/prompting-images, content/prompting-video | ✅ |
| 2 | Platform Content | content/twitch, content/linkedin | ✅ |
| 3 | Creator Economy | app-types/creator-platform, agents/advertising | ✅ |
| 4 | AI-First UX | agents/usability-testing, agents/ux-research | ✅ |

### Navigation Updates
- [x] SKILL-NAVIGATION.md updated
- [x] SKILL-INDEX.md updated
- [x] CROSS-REFERENCES.md updated
- [x] CHANGELOG.md updated

### Issues
[Any issues encountered]

### Follow-Up Suggestions
[Suggestions for Wave 6]
```
