# Skill Cross-Reference Map

**Quick lookup: "If you're using X, you probably need Y"**

---

## Payment & Business

```
monetization/ ─────┬──→ agents/stripe/
                   ├──→ agents/analytics/
                   └──→ workflows/app-cost/

stripe/ ───────────┬──→ agents/database/
                   ├──→ agents/email/
                   └──→ workflows/monetization/

growth/ ───────────┬──→ agents/seo/
                   ├──→ agents/analytics/
                   └──→ agents/email/
```

---

## Monitoring & Quality

```
analytics/ ────────┬──→ agents/observability/
                   ├──→ agents/monitoring/
                   └──→ agents/performance/

monitoring/ ───────┬──→ agents/observability/
                   ├──→ agents/error-handling/
                   └──→ agents/backend-patterns/

testing/ ──────────┬──→ agents/deployment/
                   ├──→ workflows/storybook/
                   └──→ workflows/version-control/
```

---

## Animation & UI

```
gsap/ ─────────────┬──→ prompt-craft/ANIMATION.md
                   ├──→ workflows/animation-planning/
                   └──→ agents/r3f/

motion/ ───────────┬──→ prompt-craft/ANIMATION.md
                   ├──→ workflows/animation-planning/
                   └──→ agents/tailwind/

storybook/ ────────┬──→ agents/testing/
                   ├──→ workflows/consistency/
                   └──→ design-system/
```

---

## Data & Backend

```
database/ ─────────┬──→ agents/backend-patterns/
                   ├──→ agents/realtime/
                   └──→ agents/security/

backend-patterns/ ─┬──→ agents/monitoring/
                   ├──→ agents/deployment/
                   └──→ agents/database/

realtime/ ─────────┬──→ agents/database/
                   ├──→ agents/state-management/
                   └──→ agents/observability/
```

---

## Communication

```
email/ ────────────┬──→ agents/sms/
                   ├──→ workflows/growth/
                   └──→ agents/analytics/

sms/ ──────────────┬──→ agents/email/
                   ├──→ agents/security/ (compliance)
                   └──→ agents/backend-patterns/ (queues)
```

---

## Deployment

```
deployment/ ───────┬──→ agents/monitoring/
                   ├──→ agents/security/
                   └──→ workflows/version-control/

cloud-google/ ─────┬──→ agents/deployment/
                   ├──→ agents/monitoring/
                   └──→ agents/firebase/
```

---

## Quick Reference Table

| If Using | Also Consider |
|----------|---------------|
| `stripe` | `database`, `email`, `analytics` |
| `database` | `backend-patterns`, `security` |
| `gsap` | `animation-planning`, `r3f` |
| `analytics` | `observability`, `monitoring` |
| `deployment` | `monitoring`, `version-control` |
| `email` | `sms`, `growth`, `backend-patterns` |
| `cms` | `seo`, `deployment`, `performance` |
| `ecommerce` | `stripe`, `email`, `analytics`, `seo` |

---

## Pattern: Feature to Skills

| Building | Start With | Then Add |
|----------|------------|----------|
| Auth | Clerk (in blueprints) | `security`, `database` |
| Payments | `stripe` | `email`, `analytics` |
| Notifications | `email` + `sms` | `backend-patterns` |
| Dashboard | `app-types/dashboard` | `database`, `analytics` |
| Store | `app-types/ecommerce` | `stripe`, `cms`, `seo` |
| API | `backend-patterns` | `security`, `monitoring` |
