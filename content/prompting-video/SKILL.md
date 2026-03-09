---
name: prompting-video
description: AI video prompting with Veo 3 and Sora 2. Native audio, B-roll, content creator workflows.
last_updated: 2026-01-26
---

# AI Video Prompting

Generate video content using AI — from B-roll clips to full sequences with native audio.

---

## Context Questions

Before generating video, ask:

1. **What's the use case?** — B-roll, hero clip, explainer, ad creative, social content
2. **Do you need audio?** — Veo 3 has native audio, Runway doesn't
3. **What's the duration?** — Short clips (10s) vs extended sequences (60s+)
4. **What style?** — Cinematic, documentary, abstract, product-focused
5. **What's the aspect ratio?** — 16:9 (YouTube), 9:16 (TikTok/Reels), 1:1 (social)

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| Duration | Short clip (10s) ←→ Extended sequence (60s+) |
| Audio | Silent/music-only ←→ Native dialogue/sound |
| Style | Realistic ←→ Stylized/abstract |
| Complexity | Simple motion ←→ Complex action |
| Integration | Standalone ←→ Part of larger edit |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| B-roll + quick turnaround | Runway Gen-3 (fast), simple motion, 10s clips |
| Hero sequence + cinematic | Veo 3 (quality), native audio, extend to 60s |
| Product ad + conversion | Veo 3 ingredients feature, lifestyle context |
| Social content + trending | 9:16 aspect, hook-first, quick iterations |
| Documentary + authentic | Realistic style, ambient audio, longer takes |

---

## TL;DR

| Tool | Best For | Max Duration | Audio |
|------|----------|--------------|-------|
| **Veo 3** (Google) | Audio-synced clips | 60 sec (extendable to 2.5 min) | ✅ Native |
| **Sora 2** (OpenAI) | Cinematic, characters | 20 sec | ✅ Native |
| **Runway Gen-3** | Quick iterations | 10 sec | ❌ |

---

## 1. Tool Overview

### Veo 3 (Primary — Google DeepMind)

Google's flagship video generation model with native audio.

**Capabilities:**
- Up to 60 seconds at 1080p HD
- Native audio generation (dialogue, sound effects, ambient)
- Lip-sync for conversations
- 24fps, 16:9 or 9:16 aspect ratios
- Extend feature: Up to 148 seconds (2.5 min)

**Creative Features:**
- **Ingredients to Video**: Use reference images for characters/objects
- **Frames to Video**: Start + end frame → seamless transition
- **Scene Extension**: Chain clips for longer videos
- **Insert/Remove**: Add or eliminate elements

**Access Points:**

| Platform | Use Case |
|----------|----------|
| Gemini app | Consumer quick clips |
| Flow | Advanced filmmaking |
| Gemini API | Developer integration |
| Vertex AI | Enterprise production |
| Google Vids | AI avatars for presentations |

**Pricing:**
- Fast mode: $0.15/second
- Standard mode: $0.40/second
- Example: 30-sec clip = $4.50 (fast) to $12 (standard)

### Sora 2 (Secondary — OpenAI)

OpenAI's cinematic video generator with strong character consistency.

**Capabilities:**
- Cinematic quality with synchronized audio
- Improved physics (realistic object behavior)
- World-state persistence across shots
- **Cameo**: Upload your likeness to star in scenes
- **Characters**: Insert people into any environment

**Access:**
- Sora app (iOS/Android)
- ChatGPT Plus (built-in)
- Video API (developer preview)

**Special Partnerships:**
- Disney: 200+ characters (Disney, Pixar, Marvel, Star Wars)

---

## 2. Prompt Anatomy for Video

Structure your prompts:

```
[SCENE] + [CAMERA] + [STYLE] + [ACTION] + [DURATION] + [AUDIO]
```

### Components

| Component | Description | Example |
|-----------|-------------|---------|
| **Scene** | Setting and subjects | "A cozy coffee shop with morning light" |
| **Camera** | Movement and angle | "Slow dolly in, medium shot" |
| **Style** | Visual aesthetic | "Cinematic, warm color grading" |
| **Action** | What happens | "Steam rises from a fresh latte" |
| **Duration** | Clip length | "8 seconds" |
| **Audio** | Sound design (Veo 3) | "Soft café ambiance, espresso machine sounds" |

### Example Prompts

**B-Roll Clip (Veo 3):**
```
A steaming cup of coffee on a wooden table by a rain-streaked window, 
slow zoom in, cinematic lighting, warm tones, drops of rain visible, 
8 seconds, ambient rain sounds and soft café music
```

**YouTube Intro (Veo 3):**
```
Dynamic tech-themed intro sequence, glowing circuit board patterns 
morphing into a logo reveal, energetic camera swoops, futuristic 
blue and purple color scheme, 6 seconds, electronic whoosh sound effects
```

**Product Demo (Sora 2):**
```
Hands unboxing a sleek smartphone, close-up product shots, 
rotating to show all angles, bright studio lighting, 
clean white background, 15 seconds
```

---

## 3. Techniques

### Prompt Chaining (Multi-Scene)

For longer narratives, generate scenes separately then edit together:

```
Scene 1: Wide establishing shot of city skyline at sunset, 4 sec
Scene 2: Cut to busy street level, people walking, 4 sec  
Scene 3: Close-up of main character looking up, 4 sec
Scene 4: POV shot looking at building, slow tilt up, 4 sec
```

### Image-to-Video

Use reference images for consistency:

**Veo 3 Frames to Video:**
```
Start frame: [upload image A]
End frame: [upload image B]
Prompt: Smooth transition between scenes, 6 seconds
```

### Extending Clips

Veo 3 can extend existing clips:
1. Generate initial 8-second clip
2. Use "Extend" feature 
3. Describe what happens next
4. Chain up to 148 seconds total

---

## 4. Content Creator Use Cases

### TikTok/Reels B-Roll (5-15 sec)

```
Satisfying pour shot of cold brew over ice in slow motion, 
close-up, golden hour lighting, condensation on glass, 
ASMR ice clinking sounds, 8 seconds, 9:16 vertical
```

### YouTube Intro/Outro

```
Intro: Dynamic logo animation emerging from particles of light, 
energetic camera movement, subscribe bell animation at end, 
6 seconds, upbeat sound design

Outro: Soft fade to thumbnail grid with "Watch Next" text, 
calm and professional, 4 seconds
```

### Transition Clips

```
Smooth camera push through portal of light, transitioning from 
dark moody environment to bright colorful scene, 
3 seconds, whoosh sound effect
```

### AI Avatars (Google Vids)

For talking head content without recording yourself:
1. Create avatar in Google Vids
2. Input your script
3. AI generates realistic presenter video
4. Customize background and branding

---

## 5. Limitations 2025

### Veo 3

| Limit | Value |
|-------|-------|
| Max duration | 60 sec (148 extended) |
| Max resolution | 1080p |
| Frame rate | 24fps fixed |
| Cost | $0.15-0.40/sec |

### Sora 2

| Limit | Value |
|-------|-------|
| Max duration | 20 sec |
| Character consistency | Good, not perfect |
| Text rendering | Weak |
| Availability | Queue times vary |

### General Limitations

- Physics can still be unreliable
- Hand/finger rendering improving but imperfect
- Text in video still challenging
- Realistic humans require disclosure

---

## 6. Cost Optimization

### Veo 3 Strategy

```
Draft Phase:
- Use Fast mode ($0.15/sec)
- Generate 4-6 second clips only
- Iterate on prompts until satisfied

Final Phase:
- Use Standard mode ($0.40/sec)
- Generate full duration clips
- Extend only the best takes
```

### Cost Calculator

| Length | Fast Mode | Standard Mode |
|--------|-----------|---------------|
| 8 sec | $1.20 | $3.20 |
| 15 sec | $2.25 | $6.00 |
| 30 sec | $4.50 | $12.00 |
| 60 sec | $9.00 | $24.00 |

### When to Use Which Tool

| Use Case | Best Tool |
|----------|-----------|
| Audio-synced content | Veo 3 |
| Character consistency | Sora 2 |
| Quick iterations | Runway Gen-3 |
| Talking heads | Google Vids (Veo 3) |
| Budget production | Fast mode drafts only |

---

## 7. Best Practices 2025-2026

### Disclosure Requirements

| Platform | Requirement |
|----------|-------------|
| **FTC** | Disclose AI content in sponsored posts |
| **YouTube** | "Altered content" label |
| **TikTok** | AI-generated label required |
| **Instagram** | "Made with AI" label |

All Google tools apply SynthID watermarking automatically.

### Workflow Integration

```
AI Video Production Workflow:

1. Script/storyboard the video
2. Generate AI clips for B-roll only
3. Record real A-roll (you talking, interviews)
4. Edit together in CapCut/Premiere
5. Add AI for transitions, intros, backgrounds
6. Apply AI disclosure labels
7. Export and publish
```

### Hybrid Approach (Recommended)

```
Real Footage: Talking head, interviews, reactions
AI Generated: B-roll, transitions, intros, backgrounds

This ratio works well:
- 70% real footage / 30% AI for vlogs
- 50/50 for educational content
- 80% AI / 20% real for abstract/artistic
```

---

## 8. Integration with Content Workflow

### Weekly Content Calendar Example

```
Monday: 
- Generate 5 B-roll clips for week's videos (Veo 3 Fast)
- Total cost: ~$6

Tuesday-Thursday:
- Record real content
- Edit with AI clips

Friday:
- Generate polished transitions (Veo 3 Standard)
- Final exports
```

### Asset Library Organization

```
/ai-video-assets/
  /b-roll/
    - coffee_steam_01.mp4
    - city_timelapse_01.mp4
  /transitions/
    - light_whoosh_01.mp4
    - particle_burst_01.mp4
  /intros/
    - logo_reveal_v1.mp4
```

---

## Checklist

- [ ] Access set up (Gemini / Veo / Sora)
- [ ] Cost budget defined per month
- [ ] Prompt templates for your content types
- [ ] Disclosure policy established
- [ ] Hybrid workflow designed (AI + real footage)
- [ ] Asset organization system in place

---

## Related Skills

- [AI Image Prompting](/content/prompting-images/SKILL.md) — Thumbnails and graphics
- [TikTok Content](/content/tiktok/SKILL.md) — Short-form video
- [YouTube Content](/content/youtube/SKILL.md) — Long-form video
- [Instagram Content](/content/instagram/SKILL.md) — Reels
- [Vision Models](/ai-builder/vision-models/SKILL.md) — API integration
- [Social Strategy](/content/social/SKILL.md) — Cross-platform planning
