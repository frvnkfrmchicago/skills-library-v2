# Platform Language Rules

Complete reference for platform-specific language compliance. Every piece of
content must pass through the appropriate language filter before publishing.

## Three Language Modes

The content hub operates in three distinct language modes depending on the
target platform and content type.

### Mode 1 — Direct Language (Threads, Instagram, Facebook, LinkedIn)

Use the primary industry term directly. These platforms do not suppress
the word "cannabis" in text posts. It is the normal, searchable term.

**Use directly:**
- cannabis

**Vary naturally with:**
- the plant
- the industry
- the market
- the sector
- the space

**Avoid (too casual / unprofessional):**
- weed
- pot
- dope
- Mary Jane
- ganja

**Tone**: Professional, authoritative, insider. Write like a trade publication
journalist, not a consumer brand.

### Mode 2 — Coded Language (TikTok)

TikTok aggressively suppresses cannabis content. All TikTok posts use an
established "gardening" code that cannabis creators and brands have
standardized on. TikTok content is generated with a SEPARATE system prompt
and kept OUT of the main publishing cron.

**Primary code words:**
- flower / the flower / top-shelf flower
- green / that green / fresh green / the green
- the leaf

**Writing style**: Enthusiast talking about flower and green. Describe the
look, the aroma, the quality, the vibe. Never explicitly name the substance
or tell anyone to consume anything. Keep it playful and ambiguous.

**Banned words (instant suppression on TikTok):**
- cannabis
- marijuana
- weed
- pot
- THC
- CBD
- dispensary
- joint
- blunt
- dab
- smoke / smoking
- high
- stoned
- 420

**Banned hashtags on TikTok:**
- #Cannabis
- #Marijuana
- #Weed
- #THC
- #CBD
- #420

**Approved TikTok hashtags:**
- #Flower
- #TopShelf
- #GreenLife
- #FlowerPower
- #TheGreen
- #BrandHashtag (always include)

**TikTok caption rules:**
- Short and punchy: 2-4 sentences
- First-person community voice
- End every caption with a SOURCES line: `Sources: [Publication], [Publication]`
- No em dashes, no semicolons, no parentheses, no brackets in the body

### Mode 3 — Coded Botanical Language (Image Generation Prompts)

Image generation models (Gemini Imagen, ChatGPT Images 2.0, Midjourney) flag and reject
prompts containing explicit cannabis terminology. All image prompts use coded
botanical language regardless of the target platform.

**Approved coded terms for image prompts:**
- botanical green
- lifestyle leaf garden
- amber glass apothecary jar
- modern apothecary retail interior
- dried herb in glass jar
- evening wellness ritual
- lush leafy greens
- herbal tincture bottles
- artisanal botanical display

**Banned words in image prompts:**
- cannabis
- marijuana
- weed
- joint
- smoking
- dispensary
- blunt
- dab
- budtender
- flower (in cannabis context)
- bud

**Additional image prompt forbidden terms:**
- stock photo
- corporate
- polished
- plastic
- 4k
- masterpiece
- trending on artstation
- perfect skin
- smooth skin
- beautiful lighting
- professional

## Platform-Specific Rules

### Threads

| Rule | Value |
|---|---|
| Character limit | 500 |
| Hashtag position | Inline at end of caption |
| Hashtag count | 5-8 (fewer than IG due to char limit) |
| Image | Attach via URL (required) |
| Link previews | Not supported via API |
| Language mode | Direct (Mode 1) |
| Special | Shorter caption version may be needed |

### Instagram

| Rule | Value |
|---|---|
| Character limit | 2200 |
| Hashtag position | End of caption, after line breaks |
| Hashtag count | 8-11 (avoid spam territory of 20+) |
| Image | Required, attach via URL |
| Alt text | Required for accessibility |
| Language mode | Direct (Mode 1) |
| Special | SEO-forward keywords in first 125 chars (preview cutoff) |

### Facebook

| Rule | Value |
|---|---|
| Character limit | 63206 |
| Hashtag position | End of caption |
| Hashtag count | 3-5 (minimal, Facebook deprioritizes hashtag-heavy posts) |
| Image | Attach via URL |
| Link previews | Supported |
| Language mode | Direct (Mode 1) |
| Special | Can include longer form content and external links |

### LinkedIn

| Rule | Value |
|---|---|
| Character limit | 3000 |
| Hashtag position | End of post |
| Hashtag count | 3-5 professional tags |
| Image | Attach via URL |
| Language mode | Direct (Mode 1) |
| Special | No casual language. B2B tone. Industry analysis framing. |

### TikTok

| Rule | Value |
|---|---|
| Character limit | 2200 |
| Hashtag position | End of caption |
| Hashtag count | 4-6 coded tags only |
| Media | Video required (not static images) |
| Language mode | Fully coded (Mode 2) |
| Special | Separate system prompt, separate publishing workflow |

## Headline Rules (All Platforms Except TikTok)

- UPPERCASE, 10 words max, no ending period
- Use "cannabis" directly in headlines
- Lead with the most surprising concrete fact
- Use specifics: real names, places, dollar amounts, percentages, dates
  (ONLY when real and verifiable, never invented)
- One strong active verb: APPROVES, BANS, SURGES, LAUNCHES, CRACKS DOWN,
  CLEARS, SUES
- Build a curiosity gap or real stakes, never clickbait

**Headline shape rotation** (vary across posts):

1. News lead (WHO-DID-WHAT): `NEW JERSEY APPROVES HEMP THC DRINKS IN LIQUOR STORES`
2. Number / stakes: `CANNABIS SALES HIT 4 BILLION AS PRICES CRASH 30 PERCENT`
3. Tension: `FEDS WANT CONTROL, STATES REFUSE TO WAIT`
4. Why / how: `WHY DISPENSARIES ARE QUIETLY DROPPING THC LIMITS`
5. What-it-means: `WHAT RESCHEDULING REALLY MEANS FOR YOUR DISPENSARY`

**Banned headline pattern**: Generic statements without specifics.
`CANNABIS INDUSTRY SEES CHANGES IN 2026` is weak and banned.

## Caption Rules (All Platforms)

- ACCURACY FIRST: base every claim on real, current developments
- Never fabricate statistics, dispensary counts, dollar amounts, percentages,
  or dates
- If you do not have a real sourced number, leave it out
- Must cite the source by name (e.g., "According to Marijuana Moment...",
  "A report from New Frontier Data shows...", "Per BDSA data...")
- Minimum 4 sentences (except TikTok: 2-4)
- SEO keywords included naturally
- No em dashes
- No semicolons
- No AI filler words: delve, comprehensive, landscape, revolutionize,
  harness, robust, seamless, cutting-edge, paradigm, synergy

## Hashtag Rules (All Platforms Except TikTok)

- 8 to 11 hashtags per post
- Mix: 3-4 broad searchable + 4-6 niche topic-specific
- Rotate every post (never the same set twice)
- Always include the brand hashtag

**Broad searchable pool:**
#Cannabis, #CannabisCommunity, #CannabisCulture, #CannabisIndustry,
#THC, #CBD, #Legalization

**Niche / topic tags (rotate by post):**
#HempBeverages, #CannabisBanking, #Terpenes, #SocialEquity,
#DispensaryLife, #CannabisNews, #IllinoisCannabis, #NJWeed,
#Edibles, #Concentrates, #Microdose, #Expungement, #WomenInWeed,
#CannaBiz, #PlantMedicine

**Reach-killing spam tags (never use):**
#weedporn, #stoner, #high, bare #420

## Image Prompt Rules

Format: ONE descriptive paragraph, 50-75 words. No bullet list, no labels.

**Structure order:**
1. Named subject with cultural specificity
2. Action / moment
3. Location with proper-noun grounding
4. Composition: framing, lens, angle
5. Lighting
6. Style closer

**Subject focus selection** (do NOT default to a person):
- Product or object close-up
- Storefront, counter, or city/place detail
- Document, sign, ballot, or news-moment scene
- Cultural object or setting
- ONE person (only when genuinely relevant to the story)

When a person fits: vary them across posts (man or woman, range of ages
and looks, authentically Black or visibly diverse, specific age, hair,
and garment). Avoid generic "diverse group" / "multicultural" / "inclusive"
scenes.

**Location**: Real, specific places. Use neighborhood / region names:
South Side Chicago, Bronzeville stoop, Brooklyn brownstone block,
West Oakland corner store.

**Brand color binding**: Bind the two brand hex colors to TWO specific
objects in frame, never to the whole image. Example: "deep cosmic-purple
#25012e velvet runner across the counter, single mint #33fecc ceramic pot
beside the register."

**Lighting**: Name time of day + direction + quality. Example: "late
golden-hour light pouring through a west-facing storefront window, long
warm shadows." Never use generic "natural lighting."

**Style closer** (end every image prompt with this exact phrase):
"Shot on Hasselblad X2D, Kodak Portra 400 film grain, natural skin texture,
visible pores, no retouching, no studio lighting."
