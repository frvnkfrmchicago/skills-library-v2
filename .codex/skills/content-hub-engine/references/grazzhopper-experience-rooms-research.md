# GrazzHopper Experience Rooms — Research & Legal Landscape

Collected June 2026 from codebase audit + Bing browser research.
Stored as a reference for future sessions working on GrazzHopper v2 features.

## Source Code Files

| File | What it contains |
|------|-----------------|
| `lib/business/experience-room-seed-data.ts` | 17 room definitions with slug, display name, archetype, description |
| `lib/business/experience-room-types.ts` | Full type system: archetypes (Fire/Water/Earth/Air/None), Open CTA, Live CTA, reactions (4 per room), keyword Easter eggs, ambient visual motifs |
| `lib/business/experience-room-reactions.ts` | Cannabis-art sprite reaction definitions per room |
| `lib/live/topic-theme.ts` | 17 topic themes with `openCta` (host starts) and `liveCta` (viewer joins) |
| `lib/topics/topic-copy.ts` | Topic-specific introductory copy and guidance |
| `lib/rooms/room-monetization.ts` | Ticket sales, subscriptions, tips, merch integration, tiered access |
| `app/experience-rooms/page.tsx` | Experience rooms explorer page UI |

## Room Catalog — CTAs & Archetypes

| Room | Open CTA (host) | Live CTA (join) | Archetype | Ambient | Niche |
|------|----------------|-----------------|-----------|---------|-------|
| Smoke Room | Spark a session | Pull up | Air | Smoke | Culture/Social |
| Weedology | Break it down | Sit in | Earth | Terpene highlight | Education/Science |
| Music | Run the aux | Tune in | Fire | Audio bars | Culture/Social |
| Infusion Room | Start an infusion | Watch the cook | Water | Steam | Education/Science |
| Culinary Corner | Fire up the kitchen | Pull a chair | Water | Steam | Education/Science |
| Cannabis 101 | Host a 101 | Learn along | Earth | Parchment | Education/Science |
| Pairing | Pair a strain | Taste along | Earth | Terpene highlight | Education/Science |
| Cloud 9 | Float a vibe | Drift in | Air | Starfield | Culture/Social |
| Rookie Room | Guide a rookie | Get welcomed | Water | Rain | Education/Science |
| Purple Potion | Brew a blend | Sip in | Water | Embers | Culture/Social |
| High Caste | Take the mic | Tune in | Fire | Embers | Commerce/Industry |
| Thought Leaders | Take the floor | Join the talk | Air | Parchment-flutter | Commerce/Industry |
| GHMD | Present a case | Hear the latest | Earth | Parchment | Wellness/Advocacy |
| Decriminalize | Take a stand | Stand with us | Fire | Ember-spark | Wellness/Advocacy |
| GH Tech | Ship a feature | See what's new | None | Audio bars | Commerce/Industry |
| GH News Flash | Break the news | Stay informed | None | Parchment-flutter | Commerce/Industry |
| Strain Review | Break down a strain | Hear the notes | Earth | Terpene highlight | Education/Science |

## 4 Niches Identified

| Niche | Rooms | Users | What They Need |
|-------|-------|-------|----------------|
| Culture/Social | Smoke Room, Music, Cloud 9, Purple Potion | Consumers, creatives | Vibe, identity, self-expression |
| Education/Science | Weedology, Infusion, Culinary, 101, Pairing, Rookie, Strain Review | New consumers, patients, home chefs | Learning, step-by-step, credible info |
| Commerce/Industry | High Caste, Thought Leaders, GH Tech, News Flash | Licensed businesses, brands | Professionalism, credibility, networking |
| Wellness/Advocacy | GHMD, Decriminalize | Medical patients, advocates | Safe space, support, activism |

## Legal Landscape — Cannabis Live Streaming (June 2026)

### Federal (Post-Schedule III)

- Cannabis moved to Schedule III via DEA final order April 2026
- FTC disclosure: sponsored live content must be labeled #ad
- Age gating: 21+ required. NIST SP 800-63-4 sets ID proofing standards
- Section 230 shields platform from UGC liability; must moderate and respond to takedowns
- CBD (<0.3% THC) has fewer advertising restrictions than THC products
- DEA hearing June 29, 2026 on rescheduling implementation

### Virtual Gifting Legality

| Feature | Status | Risk |
|---------|--------|------|
| Free stickers/reactions | Legal | None |
| Virtual gifts (no cash-out) | Likely legal | Low |
| Virtual gifts (cash-out) | Caution | Medium-High — may need MSB registration |
| Tip jar (direct tips) | Caution | Medium — 1099s required |
| Ticket sales for sessions | Likely legal | Low-Medium |
| Product sales during live | Illegal in most states | High |
| Brand sponsorships | Legal with FTC disclosure | Low |

### State Rules (Top Markets)

All require 21+ age gate. Key differences:

- **CA**: DCC requires 71.6% of audience be 21+. No health claims.
- **CO**: Education/brand content OK. No real-time transactions.
- **NY**: Strict on health claims. No cartoon/youth appeal.
- **IL**: Licensed dispensaries only for product content.
- **MI**: Advertising must include license number.
- **OR**: Most permissive for live content.

### What Can/Cannot Be Done in Live Rooms

- CAN: Show products, share menus/COAs, host educational content, screen share lab results
- CANNOT: Sell products via live stream, share purchase links, make health claims
- GRAY AREA: Consumption on camera, virtual gifting with cash-out
- MUST: Age gate to 21+, FTC disclose sponsorships, moderate user content

## Competitive Intel

No major platform has a native cannabis live streaming category:

- **TikTok**: Bans ingestible/smokeable cannabis ads. 18+ for LIVE/gifts. Cannabis content suppressed.
- **Instagram/Meta**: CBD-only ads with LegitScript cert. Cannabis live shadowbanned.
- **YouTube**: Educational cannabis OK. Live product reviews = gray area.
- **Twitch**: No cannabis category. Cannabis streams risk ban.
- **GrazzHopper**: Built for cannabis from day one. 17 themed rooms, custom reactions, compliance layer.

## Sources

- DEA rescheduling order (cannabisregulations.ai)
- FTC 16 CFR Part 255 (disclosure requirements)
- NIST SP 800-63-4 (identity proofing)
- 47 U.S.C. § 230 / Crowell Moring analysis (2025)
- 2018 Farm Bill (CBD/THC threshold)
- ConnectSafely (2025) — TikTok virtual gift age policies
- Fora Soft (2026) — interactive live streaming trends
- Choice Cannabis (2025) — cannabis live events research
- State regulatory bodies: DCC (CA), MED (CO), OCM (NY), IDFPR (IL), MRA (MI), CCC (MA), OLCC (OR), WSLCB (WA)
