# Skill Index - Quick Lookup by Need

**Last Updated:** March 2026

When you know what you need, find the right skills here. Organized by problem, not technology.

**See also:**
- `tech-stack/CROSS-REFERENCES.md` — Skill dependency map (if X → also Y)
- `tech-stack/DECISION-TREES.md` — Visual guides for common choices
- `ai-builder/OVERVIEW.md` — Building AI systems (agents, models, MLOps)

---

## Quick Lookup Format

```
"I need [X]" → Use skills: [A, B, C] in this order
```

---

## Authentication & Users

| Need | Skills | Order |
|------|--------|-------|
| User login/signup | Clerk (in blueprints) | 1. Add to blueprint |
| Social auth (Google, GitHub) | Clerk | 1. Configure providers |
| Role-based access | `agents/enterprise/SKILL.md` | 1. RBAC section |
| Magic link auth | Clerk or custom | 1. Clerk settings |
| Multi-tenant SaaS | `agents/enterprise/SKILL.md` | 1. Multi-tenancy section |

---

## Payments & Billing

| Need | Skills | Order |
|------|--------|-------|
| One-time payment | `agents/stripe/SKILL.md` | 1. Checkout section |
| Subscriptions | `agents/stripe/SKILL.md` | 1. Subscriptions section |
| Usage-based billing | `agents/stripe/SKILL.md` | 1. Metered billing |
| Invoices | `agents/stripe/SKILL.md` | 1. Invoicing section |
| Marketplace payments | `agents/stripe/SKILL.md` | 1. Stripe Connect |
| Payment method management | `agents/stripe/SKILL.md` | 1. Payment intents |

---

## Data & Database

| Need | Skills | Order |
|------|--------|-------|
| Store user data | `agents/database/SKILL.md` | 1. Prisma setup |
| Real-time updates | `agents/realtime/SKILL.md` → `agents/database/SKILL.md` | 1. Supabase realtime, 2. Database setup |
| File uploads | `agents/database/SKILL.md` | 1. Storage section (Supabase) |
| Search functionality | `agents/database/SKILL.md` | 1. Full-text search |
| Database migrations | `agents/database/SKILL.md` → `agents/deployment/SKILL.md` | 1. Prisma migrations, 2. CI/CD migrations |
| Backup strategy | `agents/database/SKILL.md` → `agents/observability/SKILL.md` | 1. Backup setup, 2. Monitoring |
| Multi-region data | `agents/cloud-aws/SKILL.md` OR `agents/cloud-firebase/SKILL.md` | 1. Choose cloud provider |

---

## State Management

| Need | Skills | Order |
|------|--------|-------|
| Server data (API calls) | `agents/state-management/SKILL.md` | 1. TanStack Query section |
| UI state (modals, tabs) | `agents/state-management/SKILL.md` | 1. Zustand section |
| Form state | `agents/state-management/SKILL.md` | 1. react-hook-form section |
| URL state (filters) | `agents/state-management/SKILL.md` | 1. URL state section (nuqs) |
| Global auth state | Clerk handles this | 1. Use Clerk hooks |
| Complex async flows | `agents/state-management/SKILL.md` → `agents/typescript-advanced/SKILL.md` | 1. TanStack Query, 2. Advanced types |

---

## Animation & Motion

| Need | Skills | Order |
|------|--------|-------|
| **ANY animation** | `workflows/animation-planning/SKILL.md` → (choice) | **1. PLAN FIRST**, 2. Pick library |
| Simple hover effects | Tailwind classes | 1. Use tailwindcss-animate |
| Component transitions | `agents/motion/SKILL.md` | 1. Basic transitions |
| Scroll-triggered | `agents/gsap/SKILL.md` | 1. ScrollTrigger section |
| Complex timeline | `agents/gsap/SKILL.md` | 1. Timeline section |
| Text animation | `agents/gsap/SKILL.md` | 1. SplitText plugin |
| SVG morphing | `agents/gsap/SKILL.md` | 1. MorphSVG plugin |
| 3D animations | `agents/r3f/SKILL.md` → `agents/gsap/SKILL.md` | 1. R3F basics, 2. GSAP for complex |
| Parallax scrolling | `agents/gsap/SKILL.md` | 1. ScrollTrigger + parallax |
| Drag interactions | `agents/gsap/SKILL.md` | 1. Draggable plugin |

---

## 3D & Graphics

| Need | Skills | Order |
|------|--------|-------|
| 3D models | `agents/r3f/SKILL.md` | 1. Model loading |
| 3D product viewer | `agents/r3f/SKILL.md` → `agents/gsap/SKILL.md` | 1. R3F setup, 2. Animations |
| Interactive 3D | `agents/r3f/SKILL.md` | 1. Interactions section |
| WebGL effects | `agents/r3f/SKILL.md` | 1. Shaders section |
| Animated timeline | `agents/r3f/SKILL.md` → Theatre.js (TOOLS_INVENTORY) | 1. R3F, 2. Theatre.js |

---

## AI Features

| Need | Skills | Order |
|------|--------|-------|
| Chat interface | `agents/ai-sdk/SKILL.md` → `agents/state-management/SKILL.md` | 1. AI SDK chat, 2. State mgmt |
| Streaming responses | `agents/ai-sdk/SKILL.md` → `agents/realtime/SKILL.md` | 1. AI SDK streams, 2. Realtime patterns |
| Image generation | `agents/google-ai-studio/SKILL.md` | 1. Imagen section |
| Prompt engineering | `agents/prompting/SKILL.md` → `prompt-craft/` | 1. Basics, 2. Specific patterns |
| Multi-modal (text+image) | `agents/google-ai-studio/SKILL.md` OR `agents/ai-sdk/SKILL.md` | 1. Choose provider |
| RAG (document search) | `agents/ai-sdk/SKILL.md` → `agents/database/SKILL.md` | 1. Embeddings, 2. Vector storage |
| AI agent workflows | `agents/ai-sdk/SKILL.md` → `agents/prompting/SKILL.md` | 1. Tool calling, 2. Agent patterns |

---

## SMS & Email

| Need | Skills | Order |
|------|--------|-------|
| Send SMS | `agents/sms/SKILL.md` | 1. Twilio/Telnyx setup |
| Bulk SMS campaigns | `agents/sms/SKILL.md` | 1. Queue system |
| SMS compliance (TCPA) | `agents/sms/SKILL.md` | 1. Compliance section |
| Email campaigns | `agents/email/SKILL.md` | 1. Resend setup |
| Drip sequences | `agents/email/SKILL.md` | 1. Drip section |
| Transactional emails | `agents/email/SKILL.md` | 1. Templates section |

---

## Security & Protection

| Need | Skills | Order |
|------|--------|-------|
| DDoS protection | `agents/security/SKILL.md` | 1. Cloudflare setup |
| Rate limiting | `agents/security/SKILL.md` | 1. Upstash section |
| CAPTCHA/Anti-spam | `agents/security/SKILL.md` | 1. Turnstile section |
| Input validation | `agents/security/SKILL.md` | 1. Zod patterns |
| CSRF protection | `agents/security/SKILL.md` | 1. CSRF section |

---

## Business & Growth

| Need | Skills | Order |
|------|--------|-------|
| Pricing strategy | `workflows/monetization/SKILL.md` | 1. Pricing models |
| Paywalls | `workflows/monetization/SKILL.md` | 1. Feature gating |
| Upsells | `workflows/monetization/SKILL.md` | 1. Upgrade prompts |
| User analytics | `agents/analytics/SKILL.md` | 1. PostHog setup |
| Conversion funnels | `agents/analytics/SKILL.md` | 1. Funnel tracking |
| Viral loops | `workflows/growth/SKILL.md` | 1. Share-to-unlock |
| Referral system | `workflows/growth/SKILL.md` | 1. Referrals section |
| SEO automation | `workflows/growth/SKILL.md` | 1. Content generation |

---

## Performance & Optimization

| Need | Skills | Order |
|------|--------|-------|
| Slow page load | `agents/performance/SKILL.md` | 1. Core Web Vitals |
| Large images | `agents/performance/SKILL.md` → Next.js Image | 1. Image optimization |
| Slow animations | `agents/gsap/SKILL.md` → `agents/performance/SKILL.md` | 1. Will-change, 2. Perf profiling |
| Bundle too large | `agents/performance/SKILL.md` → `agents/monorepo/SKILL.md` | 1. Code splitting, 2. Shared packages |
| Slow database queries | `agents/database/SKILL.md` → `agents/observability/SKILL.md` | 1. Query optimization, 2. Monitoring |
| Memory leaks | `agents/performance/SKILL.md` → `agents/testing/SKILL.md` | 1. Profiling, 2. E2E tests |

---

## Testing & Quality

| Need | Skills | Order |
|------|--------|-------|
| Unit tests | `agents/testing/SKILL.md` | 1. Vitest section |
| E2E tests | `agents/testing/SKILL.md` | 1. Playwright section |
| Component tests | `agents/testing/SKILL.md` | 1. React Testing Library |
| Test animations | `agents/testing/SKILL.md` → `agents/gsap/SKILL.md` | 1. E2E for animations |
| Accessibility testing | `agents/a11y/SKILL.md` → `agents/testing/SKILL.md` | 1. A11y patterns, 2. Automated tests |
| Visual regression | `agents/testing/SKILL.md` | 1. Playwright screenshots |
| API testing | `agents/testing/SKILL.md` | 1. API test section |

---

## Deployment & DevOps

| Need | Skills | Order |
|------|--------|-------|
| Deploy Next.js | `agents/deployment/SKILL.md` | 1. Vercel section |
| CI/CD pipeline | `agents/deployment/SKILL.md` | 1. GitHub Actions |
| Environment variables | `agents/deployment/SKILL.md` | 1. Env management |
| Preview deployments | `agents/deployment/SKILL.md` | 1. Preview section |
| Rollbacks | `agents/deployment/SKILL.md` | 1. Rollback strategies |
| Database migrations in CI | `agents/deployment/SKILL.md` → `agents/database/SKILL.md` | 1. CI migrations, 2. Safe migration patterns |
| Deploy to AWS | `agents/cloud-aws/SKILL.md` | 1. AWS deployment |
| Docker deployment | `agents/deployment/SKILL.md` | 1. Railway or Fly.io |
| Mobile app deployment | `app-types/mobile/SKILL.md` | 1. EAS Build + Submit |

---

## Monitoring & Errors

| Need | Skills | Order |
|------|--------|-------|
| Error tracking | `agents/error-handling/SKILL.md` → `agents/observability/SKILL.md` | 1. Error boundaries, 2. Sentry |
| Performance monitoring | `agents/observability/SKILL.md` | 1. Monitoring setup |
| Logging | `agents/observability/SKILL.md` | 1. Logging section |
| Alerts | `agents/observability/SKILL.md` | 1. Alerting section |
| User analytics | `agents/observability/SKILL.md` OR Vercel Analytics | 1. Analytics setup |
| API monitoring | `agents/observability/SKILL.md` → `agents/deployment/SKILL.md` | 1. Monitoring, 2. Health checks |
| Cost tracking | `workflows/app-cost/SKILL.md` → `agents/observability/SKILL.md` | 1. Cost analysis, 2. Usage monitoring |

---

## SEO & Marketing

| Need | Skills | Order |
|------|--------|-------|
| Google rankings | `agents/seo/SKILL.md` | 1. On-page SEO |
| Meta tags | `agents/seo/SKILL.md` | 1. Metadata section |
| Sitemap | `agents/seo/SKILL.md` | 1. Sitemap generation |
| Schema markup | `agents/seo/SKILL.md` | 1. Structured data |
| Social sharing | `agents/seo/SKILL.md` | 1. OG tags |
| Page speed (SEO) | `agents/performance/SKILL.md` → `agents/seo/SKILL.md` | 1. Core Web Vitals, 2. SEO impact |

---

## Accessibility

| Need | Skills | Order |
|------|--------|-------|
| Screen reader support | `agents/a11y/SKILL.md` | 1. ARIA section |
| Keyboard navigation | `agents/a11y/SKILL.md` | 1. Keyboard section |
| Color contrast | `agents/a11y/SKILL.md` | 1. Visual accessibility |
| Focus management | `agents/a11y/SKILL.md` → `agents/motion/SKILL.md` | 1. Focus patterns, 2. Focus animations |
| WCAG compliance | `agents/a11y/SKILL.md` → `agents/testing/SKILL.md` | 1. Standards, 2. Automated tests |

---

## Internationalization

| Need | Skills | Order |
|------|--------|-------|
| Multiple languages | `agents/i18n/SKILL.md` | 1. i18n setup |
| Date/currency formatting | `agents/i18n/SKILL.md` | 1. Formatting section |
| RTL languages | `agents/i18n/SKILL.md` | 1. RTL support |
| Translation management | `agents/i18n/SKILL.md` | 1. Translation files |

---

## Enterprise Features

| Need | Skills | Order |
|------|--------|-------|
| Role-based access (RBAC) | `agents/enterprise/SKILL.md` | 1. RBAC section |
| Audit logs | `agents/enterprise/SKILL.md` | 1. Audit logging |
| Multi-tenancy | `agents/enterprise/SKILL.md` | 1. Multi-tenant patterns |
| SSO (SAML) | `agents/enterprise/SKILL.md` OR Clerk Enterprise | 1. Choose solution |
| Compliance (HIPAA, SOC 2) | `agents/enterprise/SKILL.md` → `_security/` | 1. Compliance patterns, 2. Security |
| White-labeling | `agents/enterprise/SKILL.md` | 1. Theming section |

---

## Mobile-Specific

| Need | Skills | Order |
|------|--------|-------|
| iOS + Android app | `app-types/mobile/SKILL.md` | 1. Expo setup |
| Native features | `app-types/mobile/SKILL.md` | 1. Expo modules |
| Push notifications | `app-types/mobile/SKILL.md` → `agents/realtime/SKILL.md` | 1. Expo notifications, 2. Backend |
| App Store submission | `app-types/mobile/SKILL.md` | 1. Submission section |
| Deep linking | `app-types/mobile/SKILL.md` | 1. Expo Router |
| Offline mode | `app-types/mobile/SKILL.md` → `agents/pwa/SKILL.md` | 1. AsyncStorage, 2. Offline patterns |

---

## PWA Features

| Need | Skills | Order |
|------|--------|-------|
| Install prompt | `agents/pwa/SKILL.md` | 1. Install section |
| Offline functionality | `agents/pwa/SKILL.md` → `agents/database/SKILL.md` | 1. Service workers, 2. Local storage |
| Background sync | `agents/pwa/SKILL.md` | 1. Background sync |
| Push notifications (web) | `agents/pwa/SKILL.md` | 1. Web push |

---

## Code Organization

| Need | Skills | Order |
|------|--------|-------|
| Multiple apps (monorepo) | `agents/monorepo/SKILL.md` | 1. Turborepo setup |
| Shared components | `agents/monorepo/SKILL.md` | 1. Shared packages |
| Advanced TypeScript | `agents/typescript-advanced/SKILL.md` | 1. Advanced patterns |
| Code splitting | `agents/performance/SKILL.md` → `agents/monorepo/SKILL.md` | 1. Dynamic imports, 2. Package org |

---

## Problem-Based Lookup

### "My app is slow"
```
1. agents/performance/SKILL.md (diagnose)
2. agents/observability/SKILL.md (measure)
3. Specific skill based on bottleneck:
   - Database: agents/database/SKILL.md
   - Animations: agents/gsap/SKILL.md
   - Bundle: agents/performance/SKILL.md (code splitting)
```

### "I keep getting errors in production"
```
1. agents/error-handling/SKILL.md (error boundaries)
2. agents/observability/SKILL.md (Sentry setup)
3. agents/testing/SKILL.md (prevent regressions)
4. agents/deployment/SKILL.md (health checks, rollbacks)
```

### "I need to ship fast"
```
1. tech-stack/STACK-ROUTER.md (pick blueprint)
2. workflows/ship-fast/SKILL.md (checklist)
3. Minimal combo from tech-stack/COMMON-COMBOS.md
4. agents/deployment/SKILL.md (deploy)
```

### "I need enterprise features"
```
1. agents/enterprise/SKILL.md (RBAC, multi-tenant, audit)
2. agents/typescript-advanced/SKILL.md (type safety)
3. agents/testing/SKILL.md (quality assurance)
4. agents/observability/SKILL.md (monitoring)
5. agents/cloud-aws/SKILL.md OR agents/cloud-firebase/SKILL.md
```

### "I want amazing animations"
```
1. workflows/animation-planning/SKILL.md (PLAN FIRST!)
2. agents/gsap/SKILL.md OR agents/motion/SKILL.md (implement)
3. agents/performance/SKILL.md (optimize)
4. agents/testing/SKILL.md (E2E visual tests)
```

### "I'm building an AI app"
```
1. agents/ai-sdk/SKILL.md (core AI features)
2. agents/google-ai-studio/SKILL.md OR agents/prompting/SKILL.md (prompts)
3. agents/realtime/SKILL.md (streaming)
4. agents/state-management/SKILL.md (chat state)
5. agents/observability/SKILL.md (monitor costs)
```

---

## Workflow Integration

### Pre-Development
```
1. tech-stack/STACK-ROUTER.md → Pick blueprint
2. workflows/research/SKILL.md → Find references
3. workflows/animation-planning/SKILL.md → If animation-heavy
4. tech-stack/COMMON-COMBOS.md → Identify skill combo
```

### Development
```
1. Relevant agent skills for implementation
2. workflows/ship-fast/SKILL.md → Track progress
3. workflows/review-refactor/SKILL.md → Polish code
```

### Post-Development
```
1. agents/testing/SKILL.md → Test
2. agents/deployment/SKILL.md → Deploy
3. agents/observability/SKILL.md → Monitor
4. workflows/app-status/SKILL.md → Document state
```

---

## Cross-Reference with COMMON-COMBOS.md

This index shows **individual needs** → **specific skills**

For **complete project stacks**, see:
- `tech-stack/COMMON-COMBOS.md` - Pre-built skill combinations by project type

For **tool discovery**, see:
- `tech-stack/TOOLS_INVENTORY.md` - Full list of 80+ tools
- `tech-stack/STACK-DISCOVERY.md` - Question-based discovery

For **navigation**, see:
- `SKILL-NAVIGATION.md` - Full library overview
- `tech-stack/STACK-ROUTER.md` - Blueprint routing

---

## Using This Index

**Pattern:**
```
1. Find your need in the tables above
2. Note the skills and order
3. Read skills in the specified order
4. Cross-reference with COMMON-COMBOS.md if building a full project
```

**Example:**
```
Need: "Real-time collaborative whiteboard"

From this index:
- Real-time updates: agents/realtime/SKILL.md → agents/database/SKILL.md
- Canvas interactions: agents/gsap/SKILL.md (Draggable)
- State management: agents/state-management/SKILL.md

From COMMON-COMBOS.md:
- Project Type: "Real-Time Collaborative App" combo
- Full stack: dashboard blueprint + database + realtime + state + testing + observability + deploy

Result: Use combo as base, add GSAP for canvas interactions
```

---

## AI Building (New Wing)

| Need | Skills | Order |
|------|--------|-------|
| Build AI agents | `ai-builder/langchain/SKILL.md` | 1. Chains, 2. Agents |
| Multi-agent systems | `ai-builder/agentic-workflows/SKILL.md` | 1. Patterns |
| Fine-tune models | `ai-builder/huggingface/SKILL.md` | 1. LoRA setup |
| Deploy models | `ai-builder/ml-ops/SKILL.md` | 1. Serving |
| Containerize apps | `ai-builder/docker/SKILL.md` | 1. Dockerfile |
| Data pipelines | `ai-builder/data-pipelines/SKILL.md` | 1. ETL |
| Python for AI | `ai-builder/python/SKILL.md` | 1. Setup |
| Go for AI backends | `ai-builder/golang/SKILL.md` | 1. API |
| AI governance | `ai-builder/responsible-ai/SKILL.md` | 1. Safety |

**Start here:** `ai-builder/OVERVIEW.md`
