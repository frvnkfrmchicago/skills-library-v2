# Skills Library v2

AI-native development framework for vibe-coders and AI product engineers.

## TL;DR

| What | Where | When |
|------|-------|------|
| Pick your app type | `/app-types/` | Starting a project |
| Talk to a library | `/agents/` | Need deep knowledge |
| Decide tech stack | `/tech-stack/` | Architecture decisions |
| Set checkpoints | `/_checkpoints/` | During build |
| Ship fast | `/workflows/ship-fast/` | Building |
| Review & refactor | `/workflows/review-refactor/` | After shipping |
| Research latest | `/workflows/research/` | Finding solutions |
| Design tokens | `/design-system/` | UI consistency |
| Multi-project org | `/workspace/` | Managing portfolio |

## Philosophy

```
┌─────────────────────────────────────────────────────────┐
│  YOU: Creative director, decision maker, reviewer       │
│  AI:  Builder, researcher, implementer                  │
│                                                         │
│  Speed + Checkpoints = Optimal Velocity                 │
│  Ship first, review after (not blocked by review)       │
│  Learn while building, not before                       │
└─────────────────────────────────────────────────────────┘
```

## Structure

```
skills-library/
├── _meta/                         # How the system works
│   ├── COLLABORATION.md           # Flexibility rules
│   ├── RESPONSE-FORMAT.md         # Checkpoints + Code Explain modes
│   └── YOUR-WORKFLOW.md           # YOUR workflow with agents
├── _security/
│   ├── SECURITY.md                # Coding security, prompt injection
│   └── APP-SECURITY.md            # Auth, data, privacy, GDPR
├── _checkpoints/CHECKPOINTS.md    # Progress tracking
├── packs/PACKS.md                 # Starter packs (file lists per project type)
├── workspace/WORKSPACE.md         # Multi-project organization
├── platforms/                     # IDE-SPECIFIC CAPABILITIES
│   ├── anti-gravity/PLATFORM.md   # Multi-agent, image gen, browser testing
│   ├── cursor/PLATFORM.md         # Tab completion, Visual Editor
│   ├── cursor/stack-master.cursorrules
│   └── claude-code/PLATFORM.md    # CLI-native, skills system
├── agents/                        # LIBRARY DOCUMENTATION (with external links)
│   ├── gsap/SKILL.md              # Animation, scroll effects
│   ├── motion/SKILL.md            # React animation, gestures
│   ├── r3f/SKILL.md               # 3D on the web
│   ├── ai-sdk/SKILL.md            # AI chat/streaming in apps
│   ├── google-ai-studio/SKILL.md  # Nano Banana, Veo 3, Gemini features
│   ├── database/SKILL.md          # Prisma + Supabase
│   ├── tailwind/SKILL.md          # Styling reference
│   └── prompting/SKILL.md         # How to ask AI for specific outputs
├── app-types/
│   ├── dashboard/SKILL.md         # Admin panels, analytics
│   └── mobile/SKILL.md            # Expo → App Store
├── design-system/
│   ├── SKILL.md                   # Tokens, components
│   ├── DESIGN-INNOVATION.md       # Colors, 3D, video, pushing limits
│   └── VIRAL-IMPACT.md            # First impressions, shareability
├── tech-stack/SKILL.md            # Stack decisions
└── workflows/
    ├── pipeline/SKILL.md          # Router → Spec → Build → Publish
    ├── app-status/SKILL.md        # Project summary + value estimation
    ├── brainstorm/SKILL.md        # Ideation mode
    ├── research/SKILL.md          # Finding current info
    ├── ship-fast/SKILL.md         # Build without blocking
    └── review-refactor/SKILL.md   # Post-ship quality
```

## Core Principles

### 1. Agents, Not Static Docs
Documentation agents SEARCH for the latest info. They don't contain frozen knowledge.
```
"Hey GSAP agent, what's the 2025 way to do scroll-triggered animations?"
→ Agent searches gsap.com, GitHub, community posts
→ Returns current best practice
```

### 2. Checkpoints, Not Gates
Checkpoints save progress. They don't block shipping.
```
Checkpoint 1: Core feature works ✓
Checkpoint 2: UI complete ✓
Checkpoint 3: Edge cases → SHIP NOW, handle later
```

### 3. Review is Separate from Build
```
BUILD MODE:  Fast, ship it, working > perfect
REVIEW MODE: After shipping, find improvements, refactor
```

### 4. Plain Language First
Every skill includes:
- TL;DR at top
- Tables for quick reference
- Plain English explanations
- Technical details below

### 5. Learning Embedded
Every interaction teaches:
- What this term means
- Why this matters
- What you should know
- What's commonly missed

---

## Collaboration Principles

**READ: `/_meta/COLLABORATION.md`**

Key points:
- **User instruction > Skill defaults** - You always win
- **Ask only if genuinely confused** - Don't over-question
- **Search for current info** - Don't guess from old data
- **Execute first, explain if asked** - Speed matters
- **Skills are flexible** - Break patterns when needed

If you provide context that conflicts with a skill:
1. AI follows YOUR direction
2. Skills are guides, not laws
3. Innovation is the goal

## Quick Start

### Starting a new project?
1. Go to `/app-types/[type]/`
2. Follow the blueprint
3. Set checkpoints as you go

### Need deep library knowledge?
1. Go to `/agents/[library]/`
2. Ask your question
3. Agent searches for current info

### Deciding on tech?
1. Go to `/tech-stack/`
2. Answer the questions
3. Get recommendations with trade-offs

### Ready to review?
1. Go to `/workflows/review-refactor/`
2. Run the checklist
3. Prioritize improvements

---

## Platform Guides (IMPORTANT)

Each IDE has different capabilities. Load the right guide:

| Platform | Guide | Key Capabilities |
|----------|-------|------------------|
| **Anti-Gravity** | `/platforms/anti-gravity/PLATFORM.md` | Multi-agent, image gen, browser testing |
| **Cursor** | `/platforms/cursor/PLATFORM.md` | Tab completion, Visual Editor, Background Agents |
| **Claude Code** | `/platforms/claude-code/PLATFORM.md` | CLI-native, skills system, long context |

**EVERY PLATFORM SHOULD:**
1. Know what it CAN do (capabilities)
2. Search for current 2025/2026 info
3. Follow collaboration principles (flexibility > rigidity)
4. Adapt to user instructions over skill defaults

## Anti-Patterns (What We DON'T Do)

| Don't | Do Instead |
|-------|------------|
| Record every action | Only log what's asked for |
| Review before shipping | Ship, then review |
| Static documentation | Search for current info |
| One-size-fits-all | App-type specific blueprints |
| Figma mockups | Build the real thing |
| Explain before doing | Do, explain if asked |
| Repeat setup instructions | Reference once, use everywhere |

## Integration Points

### Google Notebooks LM
Your design docs in Notebooks? Skills reference them:
```
"Check my design system notebook for the color tokens"
→ Agent pulls from your notebook
```

### Cursor
Drop `/platforms/cursor/` rules into any project

### Anti-Gravity
Paste `/platforms/anti-gravity/` into system prompts

### Claude Code
```bash
claude --skill ./skills-library-v2/agents/gsap
```

## Security

See `/_security/` for prompt injection protection patterns.

## Checkpoints

See `/_checkpoints/` for the checkpoint system.
