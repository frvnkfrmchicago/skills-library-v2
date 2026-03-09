# Skills to Create - Future Agent Handoffs

**Created:** 2026-01-26 (Library Validation Review)
**Purpose:** Document skill gaps identified during review. Do NOT create during review — log for future agents.

---

## Priority 1: Critical Gaps

These skills address major missing use cases or complete existing wings.

| Skill | Path | Description | Estimated Effort |
|-------|------|-------------|------------------|
| **In-App Ads** | `agents/in-app-ads/SKILL.md` | Ad SDK integration (AdMob, Meta Audience Network, Unity Ads), ad formats (banner, interstitial, rewarded video, native), placement UX, eCPM optimization, mediation, GDPR/CCPA consent, ad-free premium patterns, React Native implementation | Medium |
| **Streaming Platform** | `app-types/streaming/SKILL.md` | Live streaming app architecture (Twitch, Kick, YouTube Live patterns), WebRTC/HLS/RTMP, chat systems, donations/tips, subscriptions, VOD, emerging tech (low-latency, AI moderation, co-streaming) | Large |
| **Twitch Content** | `content/twitch/SKILL.md` | Streaming content strategy, OBS setup, raids, clips, channel points, monetization, community building, VOD repurposing | Medium |
| **LinkedIn Content** | `content/linkedin/SKILL.md` | B2B content strategy, post formats, algorithm 2025-2026, newsletters, lead generation | Medium |
| **AI Image Prompting** | `content/prompting-images/SKILL.md` | Nano Banana Pro (Gemini 3 Pro Image), 4K generation, text rendering, use cases for content creators | Small |
| **AI Video Prompting** | `content/prompting-video/SKILL.md` | Veo 3.1 (primary), Sora 2 (secondary), native audio, creative features, use cases | Medium |

---

## Priority 2: High Value

These skills fill important gaps in the AI Builder and UX wings.

| Skill | Path | Description | Estimated Effort |
|-------|------|-------------|------------------|
| **Usability Testing** | `agents/usability-testing/SKILL.md` | AI-first testing (Maze AI, UserTesting), rapid iteration, heuristic evaluation, A/B testing for AI features | Medium |
| **UX Research** | `agents/ux-research/SKILL.md` | AI-accelerated research (Dovetail, Notably), continuous research, interview synthesis, behavioral analytics | Medium |
| **Vector Databases** | `agents/vector-db/SKILL.md` | Pinecone, Weaviate, Chroma, pgvector — currently scattered across AI skills, needs dedicated skill | Medium |
| **LLM Fine-Tuning** | `ai-builder/llm-fine-tuning/SKILL.md` | LoRA, QLoRA, OpenAI fine-tuning API, dataset preparation | Medium |

---

## Priority 3: Platform Coverage

These skills complete platform and blueprint coverage.

| Skill | Path | Description | Estimated Effort |
|-------|------|-------------|------------------|
| **Cursor IDE** | `platforms/cursor/SKILL.md` | Cursor-specific workflows, rules, composer patterns | Small |
| **GitHub Copilot** | `platforms/copilot/SKILL.md` | Copilot patterns, chat, workspace agents | Small |
| **Marketplace Blueprint** | `app-types/marketplace/SKILL.md` | Two-sided marketplace patterns (Uber, Airbnb) | Large |
| **Community Blueprint** | `app-types/community/SKILL.md` | Discord-like, forum, social features | Large |

---

## Emerging Tech to Cover

Track these for future inclusion as technology matures.

| Area | What to Include | When to Add |
|------|-----------------|-------------|
| **AI Video** | Veo 3.1, Sora 2, real-time generation | Q1 2026 |
| **AI Audio** | ElevenLabs, voice cloning, podcast automation | Q1 2026 |
| **Spatial Computing** | Apple Vision Pro, Meta Quest development | When adoption increases |
| **AI Agents** | Computer use, browser automation, MCP | Q1 2026 |
| **Low-Latency Streaming** | Sub-second latency, WebRTC at scale | With streaming blueprint |
| **AI Moderation** | Real-time content moderation, toxicity detection | With streaming/community blueprints |

---

## Implementation Notes

### For Future Agents

When creating these skills:

1. **Follow the template** — Use existing skills as reference (see `agents/database/SKILL.md` for good example)
2. **Include TL;DR table** — Quick reference at the top
3. **Code examples** — Copy-paste ready, not pseudocode
4. **2025-2026 current** — No deprecated APIs, correct versions
5. **Cross-references** — Link to related skills
6. **Checklist at end** — Actionable items for implementation

### Suggested Agent Assignments

| Agent | Skills to Create |
|-------|------------------|
| Agent A (Platform/Content) | LinkedIn Content, Twitch Content, AI Image Prompting, AI Video Prompting |
| Agent B (AI/ML) | Vector Databases, LLM Fine-Tuning |
| Agent C (UX) | Usability Testing, UX Research |
| Agent D (Blueprints) | Streaming Platform, Marketplace, Community |
| Agent E (Platform Tools) | Cursor IDE, GitHub Copilot, In-App Ads |

---

## Tracking

- [ ] Priority 1 skills created
- [ ] Priority 2 skills created
- [ ] Priority 3 skills created
- [ ] All skills added to SKILL-NAVIGATION.md
- [ ] All skills added to CHANGELOG.md
