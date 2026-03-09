---
name: twitch
description: Twitch streaming strategy. OBS setup, raids, clips, channel points, monetization, community building.
last_updated: 2026-01-26
---

# Twitch Content

Build and grow a Twitch streaming presence.

---

## Context Questions

Before streaming, ask:

1. **What's your content category?** — Gaming, Just Chatting, creative, music, IRL
2. **What's your streaming schedule?** — Consistency matters more than frequency
3. **What's your monetization goal?** — Affiliate, Partner, sponsorships, donations
4. **What makes you unique?** — Personality, skill level, community vibe, niche game
5. **What's your production level?** — Webcam only vs overlays/alerts/multi-camera

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| Production | Basic (webcam + mic) ←→ High production (overlays, multi-cam) |
| Engagement | Gameplay-focused ←→ Chat-focused |
| Schedule | Flexible/casual ←→ Strict/professional |
| Monetization | Hobby (donations) ←→ Business (sponsors, merch) |
| Community | Broad appeal ←→ Tight-knit niche |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| New streamer + growth | Consistent schedule, niche category, heavy networking |
| Gaming + competitive | Skill showcase, highlight clips, tournament participation |
| Just Chatting + personality | Chat engagement, events, community-driven content |
| Monetization priority | Affiliate requirements first, then sponsorships |
| Low time + hobby | 2-3 streams/week, focus on enjoyment over metrics |

---

## TL;DR

| Component | Purpose |
|-----------|---------|
| **Stream Setup** | OBS, Streamlabs, encoding settings |
| **Go-Live Strategy** | Timing, categories, tags |
| **Monetization** | Subs, bits, ads, sponsorships |
| **Community** | Discord, mods, raids |
| **VOD Strategy** | Clips, highlights, repurposing |

---

## 1. Stream Setup

### Software Comparison

| Software | Best For | Cost |
|----------|----------|------|
| **OBS Studio** | Full control, plugins | Free |
| **Streamlabs Desktop** | All-in-one, easy alerts | Free/$19/mo |
| **StreamElements OBS.Live** | Browser widgets | Free |

### Hardware Basics

| Item | Budget | Mid-Range | Pro |
|------|--------|-----------|-----|
| **Mic** | Blue Yeti ($99) | Shure MV7 ($249) | Shure SM7B ($399) |
| **Camera** | Logitech C920 ($70) | Elgato Facecam ($150) | Sony ZV-E10 ($700) |
| **Lighting** | Ring light ($30) | Elgato Key Light ($180) | Full kit ($400+) |
| **Stream Deck** | Mini ($80) | Standard ($150) | XL ($250) |

### Encoding Settings (Twitch Optimized)

```
Resolution: 1920x1080 or 1280x720
Frame Rate: 60fps (or 30 if CPU limited)
Bitrate: 6000 kbps (Twitch max for non-partners)
Encoder: NVENC (GPU) preferred over x264 (CPU)
Keyframe: 2 seconds
Rate Control: CBR
```

For partners/affiliates with transcoding:
```
Bitrate: 8000 kbps (partner max)
```

---

## 2. Twitch-Specific Features

### Raids

**Sending Raids:**
```
/raid [channel_name]
```
- Raids send your viewers to another stream when you end
- Minimum 2 viewers to raid
- Builds community connections

**Receiving Raids:**
- Set up raid alerts (Streamlabs/StreamElements)
- Welcome message automation
- Thank raiders verbally

**Raid Strategy:**
- Raid similar-sized streamers for relationship building
- Participate in raid trains (coordinated community raids)
- Raid up (larger streamers) occasionally for visibility

### Clips

**Enable Clips:**
- Dashboard → Settings → Stream → Enable clips
- Allow anyone or followers only

**Clip Strategy:**
- Auto-clip tools: MeldStudio, Eklipse AI
- Best moments become TikTok/Shorts content
- Clips boost discoverability (shared in category)

### Channel Points

**Custom Rewards Ideas:**

| Points | Reward |
|--------|--------|
| 500 | Choose next game |
| 1000 | Highlight my message |
| 5000 | VIP for a day |
| 10000 | Name a character |
| 50000 | Gaming session with streamer |

### Extensions

| Extension | Purpose |
|-----------|---------|
| Streamloots | Interactive cards/sounds |
| Crowd Control | Let chat control the game |
| Loyalty bots | Points, gambling, games |
| Predictions | Built-in betting |

---

## 3. Monetization

### Affiliate vs Partner

| Requirement | Affiliate | Partner |
|-------------|-----------|---------|
| Followers | 50+ | 75+ |
| Stream days | 7 in 30 days | 12 in 30 days |
| Hours | 8+ hours | 25+ hours |
| Avg viewers | 3+ | 75+ |
| Revenue share | 50% | 70% (negotiable) |

### Revenue Streams

| Stream | How It Works |
|--------|--------------|
| **Subscriptions** | $4.99/$9.99/$24.99 tiers (you get 50-70%) |
| **Bits** | Virtual cheering ($0.01/bit, you get 100%) |
| **Ads** | Pre-roll, mid-roll ($2-10 CPM) |
| **Donations** | Third-party (StreamElements, Ko-fi) |
| **Sponsors** | Direct brand deals |
| **Merch** | StreamElements Merch, Fourthwall |

### Subscription Management

```
Tier 1: $4.99/mo → You get ~$2.50
Tier 2: $9.99/mo → You get ~$5.00
Tier 3: $24.99/mo → You get ~$12.50

Gift subs: Same split, gifted by viewers
Prime subs: Included with Amazon Prime, same split
```

### Ad Strategy

```
Disable pre-roll by running ads:
- Run 90 seconds of ads → 30 min pre-roll free
- Run 180 seconds → 60 min pre-roll free

Mid-roll timing:
- During breaks (bathroom, food)
- Between matches/games
- Use ad manager for scheduling
```

---

## 4. Discoverability

### Tags

- Use all 10 tag slots
- Mix popular + niche tags
- Check trending tags weekly
- Language tags expand reach

### Category Selection

| Strategy | When to Use |
|----------|-------------|
| **Popular game** | High competition, need differentiation |
| **Mid-tier game** | Sweet spot: viewers exist, less saturation |
| **Just Chatting** | Personality-driven, requires audience |
| **New releases** | First 48 hours = discovery boost |

### Stream Timing

```
Avoid peak hours when starting:
- 6-10 PM (your timezone) = maximum competition

Better times for new streamers:
- 10 AM - 2 PM (less competition)
- Late night (11 PM - 3 AM)
- Match when YOUR target audience is free
```

### Algorithm 2025

What boosts discoverability:
- Average viewer count (most important)
- Chat activity rate
- Watch time duration
- Clips created and shared
- Category-specific engagement

---

## 5. Community Building

### Discord Integration

1. Create Discord server for community
2. Link Twitch to Discord (Settings → Connections)
3. Use Twitch subscriber roles
4. Cross-promote live notifications

**Recommended Bots:**
- MEE6 or Nightbot for moderation
- StreamElements for Twitch integration
- Sesh for scheduling

### Moderation

**Mod Team:**
- 1 mod per 50-100 viewers (rule of thumb)
- Recruit from loyal regulars
- Create mod guidelines document

**AutoMod Settings:**
```
Dashboard → Settings → Moderation → AutoMod

Recommended levels:
- Discrimination: Level 4
- Hostility: Level 3
- Sexual: Level 3
- Profanity: Level 1-2
```

**Chat Rules Template:**
```
1. Be respectful to everyone
2. No spam or self-promotion
3. No harassment or hate speech
4. English only (or specify language)
5. Listen to moderators
6. Have fun!
```

### VIP Management

- 10 VIP slots (increases with subs)
- Reward most active community members
- VIPs: Chat during slow mode, special badge

---

## 6. VOD Strategy

### Highlight Creation

1. Review VOD after stream
2. Mark best moments (funny, impressive, dramatic)
3. Create 1-5 min highlight reels
4. Auto-publish to Twitch channel

### YouTube Repurposing

```
VOD → YouTube Workflow:
1. Download VOD from Twitch
2. Cut into topical segments (15-30 min)
3. Add intro/outro branded for YouTube
4. Optimize title/thumbnail for YouTube SEO
5. Upload with proper tags

Timing:
- Upload within 24-48 hours of stream
- Make exclusive to YouTube (different content than clips)
```

### TikTok/Shorts from Streams

```
1. Use auto-clipper (Eklipse, MeldStudio)
2. Select vertical crop (9:16)
3. Add captions (CapCut auto-captions)
4. Hook in first 0.5 seconds
5. Post across TikTok/YouTube Shorts/Instagram Reels
```

---

## 7. Twitch 2025-2026 Updates

### DJ Program (Music Licensing)

- **Soundtrack by Twitch**: Pre-cleared music
- Separate audio track (strips from VOD)
- DMCA-safe for live streaming

**Alternatives:**
- StreamBeats (free, royalty-free)
- Pretzel Rocks (Twitch-friendly)
- No DMCA music channels on Spotify

### Recent Changes

| Update | Details |
|--------|---------|
| Revenue share | 70/30 for partners on first $100k |
| Simulcasting | Allowed for non-partners |
| Clips+ | Enhanced clip creation tools |
| Discovery Feed | New browse experience |

---

## 8. Analytics

### Key Metrics

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| **Avg Viewers** | Growth trend | Primary algorithm signal |
| **Chat Rate** | 10+ msg/min | Engagement indicator |
| **Follow Conversion** | 10%+ of new viewers | Growth efficiency |
| **Sub Conversion** | 1-3% of followers | Monetization health |
| **Watch Time** | 20+ min average | Content quality |

### Analytics Tools

| Tool | Purpose |
|------|---------|
| Twitch Analytics | Official dashboard |
| StreamElements | Enhanced metrics |
| SullyGnome | Competitive analysis |
| TwitchTracker | Historical data |

---

## Checklist

- [ ] OBS/Streamlabs configured with optimized settings
- [ ] Alerts and overlays set up
- [ ] Channel points customized
- [ ] Discord server created and linked
- [ ] Mod team recruited (at least 1)
- [ ] Streaming schedule set and consistent
- [ ] Clip-to-social workflow automated
- [ ] DMCA-safe music library ready

---

## Related Skills

- [YouTube Content](/content/youtube/SKILL.md) — VOD repurposing
- [TikTok Content](/content/tiktok/SKILL.md) — Clips to short-form
- [Social Strategy](/content/social/SKILL.md) — Cross-platform presence
- [Growth Hacking](/agents/growth-hacking/SKILL.md) — Audience building
- [Brand Deals](/content/brand-deals/SKILL.md) — Sponsorships
