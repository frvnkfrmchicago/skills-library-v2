# Starter Packs

Pre-grouped skills to load before starting a project type.

## TL;DR

| Building | Load This Pack |
|----------|----------------|
| **Any Design Work** | Prompt Craft Pack |
| Dashboard | Dashboard Pack |
| SaaS | SaaS Pack |
| Mobile App | Mobile Pack |
| Landing Page | Landing Pack |
| 3D/WebGL | 3D Pack |
| Animation-Heavy | Animation Pack |
| AI Product | AI Pack |

---

## How to Use

### Option 1: Tell the Agent
```
"I'm building a dashboard. Load the Dashboard Pack files, then let's build [description]"
```

### Option 2: Reference Specific Files
```
"Read these files first:
- /platforms/cursor/PLATFORM.md
- /app-types/dashboard/SKILL.md
Then build [description]"
```

### Option 3: NotebookLM
Add pack files to a NotebookLM notebook, reference in conversation.

---

## Pack: Prompt Craft (Design Language)

**For:** ANY design work - prompting AI for UI, implementing patterns, reviewing output

**Files to read:**
```
/prompt-craft/SKILL.md
/prompt-craft/ANIMATION.md
/prompt-craft/STYLING.md
/prompt-craft/TYPOGRAPHY.md
/prompt-craft/LAYOUT.md
/prompt-craft/RESOURCES.md
```

**NotebookLM Integration:** Upload these + your trend research + Gen Z research + brand guidelines. Ask: "I'm building an app about [topic], give me design direction using these sources."

**Quick context:** How to speak to AI about design. Works with Cursor, Claude, any AI coding tool.

---

## Pack: Dashboard

**For:** Admin panels, analytics, internal tools

**Files to read:**
```
/platforms/[your-platform]/PLATFORM.md
/app-types/dashboard/SKILL.md
/agents/database/SKILL.md
/agents/tailwind/SKILL.md
/design-system/SKILL.md
/_meta/COLLABORATION.md
/_meta/RESPONSE-FORMAT.md
```

**Quick context:** Next.js + Prisma + Clerk + shadcn/ui + Recharts

---

## Pack: SaaS

**For:** Software products with auth, payments, users

**Files to read:**
```
/platforms/[your-platform]/PLATFORM.md
/agents/database/SKILL.md
/agents/ai-sdk/SKILL.md
/agents/google-ai-studio/SKILL.md
/design-system/SKILL.md
/_security/APP-SECURITY.md
/workflows/pipeline/SKILL.md
/_meta/COLLABORATION.md
/_meta/RESPONSE-FORMAT.md
```

**Quick context:** Next.js + Prisma + Clerk + Stripe + security-first

---

## Pack: Mobile App

**For:** iOS and Android apps via Expo

**Files to read:**
```
/platforms/[your-platform]/PLATFORM.md
/app-types/mobile/SKILL.md
/agents/database/SKILL.md
/agents/tailwind/SKILL.md
/_meta/COLLABORATION.md
/_meta/RESPONSE-FORMAT.md
```

**Quick context:** Expo + NativeWind + Clerk + EAS Build → App Store

---

## Pack: Landing Page

**For:** Marketing pages, product launches, viral sites

**Files to read:**
```
/platforms/[your-platform]/PLATFORM.md
/agents/gsap/SKILL.md
/agents/motion/SKILL.md
/design-system/DESIGN-INNOVATION.md
/design-system/VIRAL-IMPACT.md
/_meta/COLLABORATION.md
```

**Quick context:** Animation-heavy, scroll effects, first impressions

---

## Pack: 3D / WebGL

**For:** 3D experiences, product showcases, interactive art

**Files to read:**
```
/platforms/[your-platform]/PLATFORM.md
/agents/r3f/SKILL.md
/agents/gsap/SKILL.md
/design-system/DESIGN-INNOVATION.md
/_meta/COLLABORATION.md
/_meta/RESPONSE-FORMAT.md
```

**Quick context:** React Three Fiber + Drei + GSAP for non-3D motion

---

## Pack: Animation-Heavy

**For:** Sites with lots of motion, scroll effects, micro-interactions

**Files to read:**
```
/platforms/[your-platform]/PLATFORM.md
/agents/gsap/SKILL.md
/agents/motion/SKILL.md
/design-system/DESIGN-INNOVATION.md
/_meta/COLLABORATION.md
```

**Quick context:** GSAP for complex/scroll, Motion for React-native feel

---

## Pack: AI Product

**For:** Apps with AI chat, AI features, LLM integration

**Files to read:**
```
/platforms/[your-platform]/PLATFORM.md
/agents/ai-sdk/SKILL.md
/agents/database/SKILL.md
/design-system/SKILL.md
/_security/SECURITY.md
/_meta/COLLABORATION.md
/_meta/RESPONSE-FORMAT.md
```

**Quick context:** Vercel AI SDK + streaming + multiple providers

---

## Pack: Brainstorm / Ideation

**For:** When you want to explore ideas before building

**Files to read:**
```
/workflows/brainstorm/SKILL.md
/design-system/VIRAL-IMPACT.md
/_meta/COLLABORATION.md
```

**Quick context:** Conversation mode, not execution mode

---

## NotebookLM Setup

Create these notebooks for quick access:

| Notebook Name | Sources to Add |
|---------------|----------------|
| **Design Intelligence** | Prompt Craft files, 2025/2026 trend research, Gen Z preferences, brand guidelines |
| **UI & Styling** | Tailwind docs, shadcn docs, Radix docs |
| **Animation** | GSAP docs, Motion docs, Lottie docs |
| **3D** | Three.js docs, R3F docs, Drei docs |
| **AI/LLM** | Vercel AI SDK docs, Anthropic docs, Google AI Studio docs |
| **Database** | Prisma docs, Supabase docs |
| **Mobile** | Expo docs, React Native docs |
| **My Design System** | Your tokens, components, decisions |

### Design Intelligence Workflow

1. Create "Design Intelligence" notebook in NotebookLM
2. Upload:
   - All `/prompt-craft/` files
   - 2025-2026 design trend articles
   - Gen Z preferences research
   - Your brand guidelines
3. Before building, open Gemini/Anti-Gravity
4. Add notebook to conversation
5. Ask: "I'm building an app about [topic]. Give me design direction grounded in these sources."
6. Get specific, sourced design recommendations

---

## Creating Custom Packs

```markdown
# My Custom Pack: [Name]

**For:** [What type of project]

**Files to read:**
```
[List the skill files relevant to your project]
```

**Quick context:** [One-line summary of stack/approach]
```
