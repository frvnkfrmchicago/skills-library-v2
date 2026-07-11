# Brand Voice Template

Use this template to calibrate the AI system prompt for any brand's content
hub. Every field marked `[CONFIGURE]` must be replaced with brand-specific
values before the system goes live.

## Voice Profile

```yaml
brand_name: "[CONFIGURE]"
brand_handle: "[CONFIGURE]"  # e.g., @brandhandle
brand_description: "[CONFIGURE]"  # one-line mission or tagline
brand_hashtag: "[CONFIGURE]"  # e.g., #BrandName

voice_archetype: "[CONFIGURE]"
# Options:
#   "trade-insider"    — Write like a trade publication journalist
#   "community-elder"  — Write like a respected community voice
#   "analyst"          — Write like a market research analyst
#   "advocate"         — Write like a policy advocate with data
#   "culture-curator"  — Write like a cultural commentator

tone_spectrum:
  formal: 7      # 1-10 scale (10 = most formal)
  technical: 6
  passionate: 8
  authoritative: 9
  conversational: 5

banned_tone:
  - marketing bot
  - corporate press release
  - casual social media influencer
  - AI-generated filler
```

## Terminology Rules

```yaml
primary_term: "[CONFIGURE]"  # The main industry/product term
# e.g., "cannabis" for cannabis industry

approved_synonyms:
  - "[CONFIGURE]"  # e.g., "the plant"
  - "[CONFIGURE]"  # e.g., "the industry"
  - "[CONFIGURE]"  # e.g., "the market"
  - "[CONFIGURE]"  # e.g., "the sector"

banned_casual_terms:
  - "[CONFIGURE]"  # e.g., "weed"
  - "[CONFIGURE]"  # e.g., "pot"

coded_terms_for_restricted_platforms:
  platform: "[CONFIGURE]"  # e.g., "tiktok"
  primary_codes:
    - "[CONFIGURE]"  # e.g., "flower"
    - "[CONFIGURE]"  # e.g., "the green"
    - "[CONFIGURE]"  # e.g., "the leaf"

coded_terms_for_image_prompts:
  - "[CONFIGURE]"  # e.g., "botanical green"
  - "[CONFIGURE]"  # e.g., "amber glass apothecary jar"
  - "[CONFIGURE]"  # e.g., "modern apothecary retail interior"
```

## AI Filler Ban List

These words and patterns are banned from ALL generated content. They signal
AI-generated text and reduce audience trust.

**Banned words:**
delve, comprehensive, landscape, revolutionize, harness, robust, seamless,
cutting-edge, paradigm, synergy, leverage, elevate, empower, streamline,
holistic, groundbreaking, transformative, innovative, dynamic, proactive,
best-in-class, world-class, next-generation, game-changing, mission-critical

**Banned punctuation patterns:**
- Em dashes ( -- or the em dash character)
- Semicolons in captions
- Excessive exclamation marks (more than one per post)

**Banned sentence structures:**
- "In today's [adjective] [noun]..."
- "It's no secret that..."
- "At the end of the day..."
- "When it comes to..."
- "In the world of..."
- "[Topic] is more than just..."

## Headline Voice Calibration

```yaml
max_words: 10
case: UPPERCASE
ending_punctuation: none  # no period at the end

verb_strength: high
# Approved strong verbs: APPROVES, BANS, SURGES, LAUNCHES, CRACKS DOWN,
# CLEARS, SUES, PULLS, KILLS, DROPS, BLOCKS, PASSES, DEFIES, SLASHES

specificity: required
# Every headline must contain at least ONE of:
#   - A proper noun (person, place, company, agency)
#   - A number (dollar amount, percentage, count)
#   - A time reference (date, quarter, year)

shape_rotation:
  - news_lead: "WHO DID WHAT"
  - number_stakes: "NUMBER + CONSEQUENCE"
  - tension: "FORCE A vs FORCE B"
  - why_how: "WHY/HOW + SURPRISING THING"
  - what_it_means: "WHAT X MEANS FOR Y"

banned_pattern: "Generic statements without specifics"
# Example of banned: "INDUSTRY SEES CHANGES IN 2026"
# Example of strong: "ILLINOIS PULLS 12 DISPENSARY LICENSES OVERNIGHT"
```

## Caption Voice Calibration

```yaml
min_sentences: 4
max_sentences: 8

source_citation: required
# Every caption MUST cite at least one source by name.
# Approved citation patterns:
#   "According to [Publication]..."
#   "A report from [Organization] shows..."
#   "Per [Data Provider] data..."
#   "[Organization] confirmed that..."

seo_keywords:
  - "[CONFIGURE]"  # e.g., "legalization"
  - "[CONFIGURE]"  # e.g., "dispensary"
  - "[CONFIGURE]"  # e.g., "THC"
  - "[CONFIGURE]"  # e.g., "compliance"
  - "[CONFIGURE]"  # e.g., "regulation"

accuracy_rule: >
  Base every claim on real, current developments. Never fabricate statistics,
  counts, dollar amounts, percentages, or dates. If you do not have a real
  sourced number, leave it out. A truthful plain statement beats an
  impressive false one.
```

## Hashtag Voice Calibration

```yaml
min_tags: 8
max_tags: 11
rotation: required  # never the same set twice

broad_pool:
  - "[CONFIGURE]"  # e.g., "#Cannabis"
  - "[CONFIGURE]"  # e.g., "#CannabisCommunity"
  - "[CONFIGURE]"  # e.g., "#CannabisCulture"
  - "[CONFIGURE]"  # e.g., "#CannabisIndustry"

niche_examples:
  - "[CONFIGURE]"  # e.g., "#HempBeverages"
  - "[CONFIGURE]"  # e.g., "#CannabisBanking"
  - "[CONFIGURE]"  # e.g., "#SocialEquity"

always_include:
  - "[CONFIGURE]"  # brand hashtag, e.g., "#GrazzHopper"

banned_tags:
  - "[CONFIGURE]"  # e.g., "#weedporn"
  - "[CONFIGURE]"  # e.g., "#stoner"
```

## Image Prompt Voice Calibration

```yaml
word_count: "50-75"
format: "single paragraph, no bullet list, no labels"

brand_colors:
  color_1:
    name: "[CONFIGURE]"  # e.g., "cosmic purple"
    hex: "[CONFIGURE]"   # e.g., "#25012e"
  color_2:
    name: "[CONFIGURE]"  # e.g., "mint accent"
    hex: "[CONFIGURE]"   # e.g., "#33fecc"

color_binding_rule: >
  Bind both brand colors to TWO specific objects in frame, never to
  the whole image. Name the object and the hex code explicitly.

location_style: "real, specific places with neighborhood names"

lighting_style: >
  Name time of day + direction + quality. Example: "late golden-hour
  light pouring through a west-facing storefront window, long warm shadows."

camera_closer: >
  Shot on Hasselblad X2D, Kodak Portra 400 film grain, natural skin
  texture, visible pores, no retouching, no studio lighting.

subject_diversity:
  default_to_person: false
  vary_demographics: true
  avoid_generic_groups: true
  # When people appear: specific age, hair, garment. Authentically
  # diverse. Never default to a young woman.
```

## Approval Detection Phrases

When the user says any of these in the AI chat, the system auto-applies the
last AI response to the corresponding field:

```
use that, yes, approved, that works, go with that, perfect,
let's go, lock it in, do it, good, love it, bet, say less,
fire, yep, yeah, cool, run it, send it, solid, lets go, use it
```

## Content Segment Definitions

Define the content segments (categories) for the brand's posting schedule.

```yaml
segments:
  - id: "[CONFIGURE]"
    label: "[CONFIGURE]"
    cron_days: "[CONFIGURE]"  # e.g., "tue,thu"
    tone_notes: "[CONFIGURE]"  # e.g., "authoritative, sourced, specific"
    topic_pool:
      - "[CONFIGURE]"
      - "[CONFIGURE]"

  - id: "[CONFIGURE]"
    label: "[CONFIGURE]"
    cron_days: "[CONFIGURE]"
    tone_notes: "[CONFIGURE]"
    topic_pool:
      - "[CONFIGURE]"
      - "[CONFIGURE]"
```
