# Common Skill Combinations

**Last Updated:** March 2026

Pre-built skill combinations for common project types. Mix and match as needed.

---

## Quick Combos by Project Type

| Project Type | Blueprint | + Core Skills | + Optional |
|--------------|-----------|---------------|------------|
| **SaaS MVP** | dashboard | stripe, deployment | observability, seo |
| **Marketing Site** | landing | gsap OR motion, seo | analytics |
| **Mobile App** | mobile | realtime, deployment | pwa |
| **AI Chat App** | (custom) | ai-sdk, realtime, state-management | observability |
| **E-commerce** | ecommerce | stripe, database, seo | i18n, performance |
| **Portfolio/Blog** | landing | seo, performance | motion, cms |

---

## 1. Landing Page (Fast Ship)

**Goal:** Ship a beautiful marketing site in 2-4 hours

### Minimal Stack
```
Blueprint: app-types/landing/SKILL.md
```

### Standard Stack
```
Blueprint:  app-types/landing/SKILL.md
Animation:  agents/gsap/SKILL.md OR agents/motion/SKILL.md
Planning:   workflows/animation-planning/SKILL.md (plan first!)
SEO:        agents/seo/SKILL.md
Deploy:     agents/deployment/SKILL.md
```

### Premium Stack (Add to Standard)
```
+ agents/performance/SKILL.md (Core Web Vitals)
+ Analytics (Vercel Analytics or PostHog)
+ Email capture (via Resend - see workflows/app-cost/SKILL.md)
```

**Timeline:** 2-4 hours (minimal), 4-8 hours (standard), 8-12 hours (premium)

---

## 2. SaaS Dashboard

**Goal:** Ship a production SaaS MVP with auth, billing, and monitoring

### Minimal Stack
```
Blueprint: app-types/dashboard/SKILL.md (includes auth, database, UI)
Payments:  agents/stripe/SKILL.md
Deploy:    agents/deployment/SKILL.md
```

### Production Stack
```
Blueprint:    app-types/dashboard/SKILL.md
State:        agents/state-management/SKILL.md
Payments:     agents/stripe/SKILL.md
Testing:      agents/testing/SKILL.md
Errors:       agents/error-handling/SKILL.md
Deploy:       agents/deployment/SKILL.md
Observability: agents/observability/SKILL.md
```

### Enterprise Stack (Add to Production)
```
+ agents/enterprise/SKILL.md (RBAC, audit logs, multi-tenant)
+ agents/typescript-advanced/SKILL.md (complex types)
+ agents/performance/SKILL.md
+ agents/i18n/SKILL.md (if global)
+ agents/monorepo/SKILL.md (if multiple apps)
```

**Timeline:** 3-6 hours (minimal), 12-20 hours (production), 30-40 hours (enterprise)

---

## 3. AI-Native App

**Goal:** Build an app around LLM features (chat, generation, analysis)

### Stack
```
Core:      agents/ai-sdk/SKILL.md
AI Tools:  agents/google-ai-studio/SKILL.md OR agents/prompting/SKILL.md
State:     agents/state-management/SKILL.md
Realtime:  agents/realtime/SKILL.md (streaming responses)
Database:  agents/database/SKILL.md
Deploy:    agents/deployment/SKILL.md
```

### Add If Needed
```
+ agents/cloud-aws/SKILL.md (if using Lambda for serverless)
+ agents/observability/SKILL.md (monitor AI costs/latency)
+ agents/error-handling/SKILL.md (handle API failures gracefully)
```

**Timeline:** 8-16 hours for MVP

---

## 4. E-commerce Site

**Goal:** Sell products online with cart, checkout, inventory

### Stack
```
Blueprint:  app-types/ecommerce/SKILL.md ⭐ (NEW - dedicated e-commerce blueprint)
Database:   agents/database/SKILL.md
Payments:   agents/stripe/SKILL.md
SEO:        agents/seo/SKILL.md
Performance: agents/performance/SKILL.md
Deploy:     agents/deployment/SKILL.md
```

### Add If Needed
```
+ agents/i18n/SKILL.md (multi-country)
+ agents/realtime/SKILL.md (live inventory updates)
+ agents/observability/SKILL.md (track conversions)
+ agents/cms/SKILL.md (product content management)
+ Email marketing (see workflows/app-cost/SKILL.md)
```

**Timeline:** 12-20 hours

---

## 5. Mobile App (iOS + Android)

**Goal:** Ship to App Store and Google Play

### Stack
```
Blueprint: app-types/mobile/SKILL.md
State:     agents/state-management/SKILL.md
Deploy:    agents/deployment/SKILL.md (EAS Build)
```

### Add If Needed
```
+ agents/realtime/SKILL.md (push notifications, live updates)
+ agents/pwa/SKILL.md (if also web version)
+ Auth via Clerk (mobile SDK)
+ agents/testing/SKILL.md (especially E2E on devices)
```

**Timeline:** 8-16 hours to first build, 2-4 hours for app store submission

---

## 6. Portfolio / Blog

**Goal:** Personal brand site with content

### Stack
```
Blueprint:    app-types/landing/SKILL.md
OR:           Astro (mentioned in landing blueprint)
Animation:    agents/motion/SKILL.md (subtle, not GSAP)
CMS:          agents/cms/SKILL.md (for blog content)
SEO:          agents/seo/SKILL.md
Performance:  agents/performance/SKILL.md
Deploy:       agents/deployment/SKILL.md
```

### Add If Needed
```
+ MDX or Contentlayer (for blog posts)
+ Analytics
+ Email newsletter
```

**Timeline:** 4-8 hours

---

## 7. Internal Tool / Admin Panel

**Goal:** Team-facing dashboard, not public

### Stack
```
Blueprint: app-types/dashboard/SKILL.md
Database:  agents/database/SKILL.md
Testing:   agents/testing/SKILL.md (important for team tools)
Deploy:    agents/deployment/SKILL.md
```

### Add If Needed
```
+ agents/enterprise/SKILL.md (RBAC if multiple teams)
+ agents/realtime/SKILL.md (if collaborative)
+ agents/observability/SKILL.md (track usage)
```

**Timeline:** 6-12 hours

---

## 8. Animation-Heavy Site

**Goal:** Showcase, creative, or interactive experience

### Stack
```
Blueprint:   app-types/landing/SKILL.md
Planning:    workflows/animation-planning/SKILL.md ⭐ (CRITICAL - plan first!)
Animation:   agents/gsap/SKILL.md
3D:          agents/r3f/SKILL.md (if needed)
Performance: agents/performance/SKILL.md (animations can be heavy)
Deploy:      agents/deployment/SKILL.md
```

### Add If Needed
```
+ Lottie or Rive (from TOOLS_INVENTORY.md)
+ Theatre.js for timeline editing
+ agents/motion/SKILL.md for simpler UI transitions
```

**Timeline:** 12-24 hours (animation complexity varies)

---

## 9. Real-Time Collaborative App

**Goal:** Multiple users, live updates (e.g., whiteboard, doc editor)

### Stack
```
Blueprint:    app-types/dashboard/SKILL.md OR custom
Database:     agents/database/SKILL.md (Supabase recommended)
Realtime:     agents/realtime/SKILL.md
State:        agents/state-management/SKILL.md
Testing:      agents/testing/SKILL.md (critical for sync bugs)
Observability: agents/observability/SKILL.md
Deploy:       agents/deployment/SKILL.md
```

**Timeline:** 16-30 hours

---

## 10. PWA (Progressive Web App)

**Goal:** Web app that feels native, works offline

### Stack
```
Blueprint: app-types/landing/SKILL.md OR dashboard
PWA:       agents/pwa/SKILL.md
Database:  agents/database/SKILL.md (with offline sync)
Testing:   agents/testing/SKILL.md (test offline mode)
Deploy:    agents/deployment/SKILL.md
```

**Timeline:** 8-16 hours

---

## Skill Layers (How to Stack)

Think of skills in layers that build on each other:

### Layer 1: Foundation (Pick One)
```
Blueprint:
- app-types/landing/SKILL.md
- app-types/dashboard/SKILL.md
- app-types/mobile/SKILL.md
- OR start from scratch with STACK-DISCOVERY.md
```

### Layer 2: Core Features (Pick 2-4)
```
Must-haves for your project:
- agents/database/SKILL.md (if storing data)
- agents/stripe/SKILL.md (if payments)
- agents/ai-sdk/SKILL.md (if AI features)
- agents/realtime/SKILL.md (if live updates)
```

### Layer 3: Polish (Pick 1-3)
```
Make it production-ready:
- agents/seo/SKILL.md
- agents/performance/SKILL.md
- agents/a11y/SKILL.md
- agents/testing/SKILL.md
```

### Layer 4: Ship & Monitor (Always)
```
Deploy + observe:
- agents/deployment/SKILL.md
- agents/error-handling/SKILL.md
- agents/observability/SKILL.md
```

### Layer 5: Scale (Add Later)
```
When you need it:
- agents/enterprise/SKILL.md
- agents/monorepo/SKILL.md
- agents/cloud-aws/SKILL.md
- agents/i18n/SKILL.md
```

---

## Workflow Combos

Combine workflows with implementation skills:

### Research → Plan → Build
```
1. workflows/research/SKILL.md (find references)
2. workflows/animation-planning/SKILL.md (if animation-heavy)
3. Relevant agent skill (implement)
4. workflows/review-refactor/SKILL.md (polish)
```

### Prototype → Production
```
1. workflows/ai-prototype-to-build/SKILL.md (Stitch/v0 → code)
2. Add testing, error handling, observability
3. workflows/ship-fast/SKILL.md (deploy checklist)
```

### Multi-IDE Workflow
```
See: platforms/WORKFLOW-GUIDE.md for Anti-Gravity + Cursor + Claude Code orchestration
```

---

## Anti-Patterns (Don't Do This)

❌ **Using every skill on every project**
- Pick 3-7 skills max for MVP
- Add more as needed

❌ **Skipping planning for animations**
- Always use workflows/animation-planning/SKILL.md first
- Generic prompts = generic animations

❌ **Building before deciding stack**
- Start with STACK-ROUTER.md or STACK-DISCOVERY.md
- Don't guess

❌ **Production without testing/monitoring**
- Always include: testing + error-handling + deployment + observability
- Minimum for production

❌ **Monorepo from day 1**
- Start simple, add monorepo when you have 2+ apps
- Premature optimization

---

## Quick Decision Trees

### "What animation library?"
```
Simple hover/transitions → tailwindcss-animate
UI component animations → agents/motion/SKILL.md
Complex timelines/scroll → agents/gsap/SKILL.md
3D animations → agents/r3f/SKILL.md
```

### "What state management?"
```
Server data (API) → TanStack Query (in agents/state-management/SKILL.md)
UI state (modals) → Zustand (in agents/state-management/SKILL.md)
Form inputs → react-hook-form
URL state → nuqs or searchParams
```

### "What database?"
```
Prototype/MVP → Supabase (agents/database/SKILL.md)
Production SaaS → Prisma + Postgres (agents/database/SKILL.md)
Enterprise → Prisma + custom (agents/cloud-aws/SKILL.md)
```

### "What deployment?"
```
Next.js app → Vercel (agents/deployment/SKILL.md)
Full control → Railway or Fly.io (agents/deployment/SKILL.md)
Enterprise → AWS (agents/cloud-aws/SKILL.md)
```

---

## 9. SMS/Email Business Tool

**Goal:** Build a bulk messaging service for clients

### Stack
```
SMS:          agents/sms/SKILL.md
Email:        agents/email/SKILL.md
Auth:         Clerk (in blueprints)
Database:     agents/database/SKILL.md
Payments:     agents/stripe/SKILL.md
Deploy:       agents/deployment/SKILL.md
Security:     agents/security/SKILL.md
```

### Add for Production
```
+ agents/analytics/SKILL.md (track usage)
+ workflows/monetization/SKILL.md (usage-based pricing)
+ agents/observability/SKILL.md
```

**Timeline:** 4-6 hours (minimal), 12-16 hours (production)

---

## 10. Design System / Component Library

**Goal:** Reusable components across projects

### Stack
```
Planning:     workflows/storybook/SKILL.md
Consistency:  workflows/consistency/SKILL.md
Styling:      agents/tailwind/SKILL.md
TypeScript:   agents/typescript-advanced/SKILL.md
```

### Setup
```bash
npx storybook@latest init
```

**Timeline:** 30 min (setup), 2-3 hours (full system)

---

## Resources

- **Start here:** `SKILL-NAVIGATION.md` (full index)
- **Stack selection:** `tech-stack/STACK-ROUTER.md` and `tech-stack/STACK-DISCOVERY.md`
- **Full tool list:** `tech-stack/TOOLS_INVENTORY.md`
- **Cross-reference:** `tech-stack/SKILL-INDEX.md` (need-based lookup)
