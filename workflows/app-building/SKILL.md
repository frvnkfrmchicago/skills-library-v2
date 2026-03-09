---
name: app-building-workflow
description: The complete workflow from ideation to implementation. Follow this when starting any new app or feature.
last_updated: 2026-03
owner: Frank
---

# App Building Workflow

Your multi-agent pipeline from research to shipped app.

> **See also:** `workflows/ship-fast/SKILL.md`, `workflows/product-spec/SKILL.md`

---

## Context Questions

Before starting the workflow, ask:

1. **What's the starting point?** — Blank idea, existing prototype, cloning something
2. **What's the complexity?** — Simple landing, standard app, complex feature-rich
3. **What tools are available?** — Which AI tools, which IDE setup
4. **What's the timeline?** — Hours, days, weeks
5. **Solo or team?** — Affects handoff and documentation needs

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Clarity** | Vague idea ←→ Clear spec |
| **Complexity** | Simple page ←→ Full SaaS |
| **Speed** | Thorough ←→ Ship fast |
| **Tools** | Single tool ←→ Multi-agent |
| **Output** | Prototype ←→ Production |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Vague idea | Start at Phase 1: Research |
| Clear spec ready | Skip to Phase 3: Build |
| Raw code exists | Start at Phase 5: Plan |
| Need polish | Go to Phase 7: Refactor |
| Using multiple AI tools | Follow multi-tool-ai workflow |
| Tight timeline | Use ship-fast workflow |

---

## The Flow

```
RESEARCH → PROMPT → BUILD → DOWNLOAD → PLAN → IMPLEMENT → REFACTOR
```

---

## Phase 1: Research
**Where:** Claude, ChatGPT, Cursor (with web search)

**What you're doing:**
- Stack research (what tech to use)
- API/library discovery
- Competitive analysis
- Pattern finding

**Output:** Research notes, technology decisions, reference examples

**Skill reference:** `workflows/research/SKILL.md`

---

## Phase 2: Prompt Creation
**Where:** Claude, ChatGPT, or any AI

**What you're doing:**
- Build the prompt that will generate your app
- Define features, style, structure
- Include your research findings

**Output:** A complete prompt ready for AI Studio

---

## Phase 3: Build App
**Where:** Google AI Studio

**What you're doing:**
- Use your crafted prompt to generate the app
- Iterate until it works as expected
- Test outputs, refine prompt if needed

**Output:** A working app prototype in AI Studio

**Skill reference:** `platforms/google-ai-studio/SKILL.md`

---

## Phase 4: Download
**Where:** Google AI Studio → Local filesystem

**What you're doing:**
- Export/download the actualized app code
- Get it into your local environment

**Output:** App code files on your machine

---

## Phase 5: Plan
**Where:** Claude Code

**What you're doing:**
- Analyze the downloaded code
- Identify what needs enhancement
- Create actionable implementation plan

**Output:** Enhancement/actualization plan document

**Why Claude Code:** Best at deep analysis, multi-file understanding, planning

---

## Phase 6: Implement
**Where:** Antigravity + Cursor

**What you're doing:**
- Execute the enhancement plan
- Make the app production-ready
- Add integrations, polish UI

**Output:** Functional, enhanced app

**Skill references:** 
- `platforms/antigravity/SKILL.md`
- `platforms/cursor/SKILL.md`

---

## Phase 7: Refactor / Edit
**Where:** Antigravity + Cursor + Claude Code

**What you're doing:**
- Add new features
- Refactor for performance
- Edit based on feedback
- Continuous improvement

**Output:** Polished, feature-complete app

---

## Quick Decision Guide

| If you're in... | You should be using... |
|-----------------|------------------------|
| Early ideation, don't know what to build | Research phase → Claude/ChatGPT |
| Know what to build, need the prompt | Prompt Creation → Claude |
| Have prompt, ready to generate | Build → AI Studio |
| Have working prototype | Download → Export from AI Studio |
| Have raw code, need a plan | Plan → Claude Code |
| Have plan, ready to build | Implement → Antigravity/Cursor |
| App works, needs polish | Refactor → All tools as needed |

---

## Phase Triggers

**"I have an idea but don't know how to build it"**
→ Start at Phase 1: Research

**"I know what I want, need to generate it"**
→ Start at Phase 2: Prompt Creation (if you have research) or Phase 3: Build (if prompt is ready)

**"I have code but it's raw"**
→ Start at Phase 5: Plan

**"I need to add features"**
→ Phase 7: Refactor
