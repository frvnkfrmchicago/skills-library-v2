# Decision Trees

**Visual guides for common choices.**

---

## 1. Which Animation Library?

```
Need animation?
│
├─ Simple transitions only?
│  └─→ CSS + Tailwind ✓
│
├─ React component animations?
│  │
│  ├─ Gesture-heavy (drag, swipe)?
│  │  └─→ Motion (Framer Motion) ✓
│  │
│  └─ Timeline/scroll animations?
│     └─→ GSAP + useGSAP ✓
│
├─ 3D / WebGL?
│  └─→ R3F (React Three Fiber) ✓
│
└─ Not sure?
   └─→ Start with Motion, upgrade to GSAP if needed
```

---

## 2. Which Database?

```
What are you building?
│
├─ MVP / Side project?
│  └─→ Supabase (Postgres) ✓
│
├─ SaaS with auth?
│  │
│  ├─ Simple auth needs?
│  │  └─→ Supabase + RLS ✓
│  │
│  └─ Complex auth (orgs, roles)?
│     └─→ Supabase + Clerk ✓
│
├─ Real-time heavy?
│  │
│  ├─ Chat / presence?
│  │  └─→ Supabase Realtime ✓
│  │
│  └─ Gaming / low latency?
│     └─→ Redis + Supabase ✓
│
├─ Global / edge performance?
│  └─→ Turso (SQLite edge) ✓
│
└─ Not sure?
   └─→ Start with Supabase, always
```

---

## 3. Which State Management?

```
How complex is your state?
│
├─ Just server data?
│  └─→ TanStack Query only ✓
│
├─ Small client state?
│  └─→ React useState/useContext ✓
│
├─ Medium complexity?
│  │
│  ├─ Simple global state?
│  │  └─→ Zustand ✓
│  │
│  └─ Server + client?
│     └─→ TanStack Query + Zustand ✓
│
├─ Complex state logic?
│  └─→ XState (state machines) ✓
│
└─ Not sure?
   └─→ TanStack Query + Zustand (covers 90% of apps)
```

---

## 4. Which Deployment?

```
What type of app?
│
├─ Next.js app?
│  │
│  ├─ Simple, fast deploy?
│  │  └─→ Vercel ✓
│  │
│  ├─ Need containers?
│  │  └─→ Google Cloud Run ✓
│  │
│  └─ Self-hosted required?
│     └─→ Docker + Railway ✓
│
├─ Static site?
│  │
│  ├─ Simple?
│  │  └─→ Vercel or Netlify ✓
│  │
│  └─ With Firebase backend?
│     └─→ Firebase Hosting ✓
│
├─ Mobile app?
│  │
│  ├─ React Native?
│  │  └─→ EAS (Expo) ✓
│  │
│  └─ PWA?
│     └─→ Vercel + PWA config ✓
│
└─ Not sure?
   └─→ Vercel (free tier, zero config)
```

---

## 5. Which Payment Setup?

```
What's your model?
│
├─ One-time purchase?
│  └─→ Stripe Checkout (hosted) ✓
│
├─ Subscription?
│  │
│  ├─ Simple tiers (2-3 plans)?
│  │  └─→ Stripe Checkout + Portal ✓
│  │
│  └─ Complex (usage, metered)?
│     └─→ Stripe Billing API ✓
│
├─ Marketplace (split payments)?
│  └─→ Stripe Connect ✓
│
├─ Free trial?
│  └─→ Stripe Checkout + trial_period ✓
│
└─ Not sure?
   └─→ Stripe Checkout (80% of cases)
```

---

## 6. Which Monitoring?

```
What do you need to track?
│
├─ Errors only?
│  └─→ Sentry ✓
│
├─ Errors + performance?
│  └─→ Sentry + Vercel Analytics ✓
│
├─ User behavior?
│  │
│  ├─ Basic analytics?
│  │  └─→ PostHog ✓
│  │
│  └─ Session replay?
│     └─→ PostHog (with replay) ✓
│
├─ Logs + traces?
│  └─→ Axiom ✓
│
└─ Full observability?
   └─→ Sentry + PostHog + Axiom ✓
```

---

## 7. Which CMS?

```
What content are you managing?
│
├─ Blog / marketing pages?
│  │
│  ├─ Simple, free?
│  │  └─→ Sanity (free tier) ✓
│  │
│  └─ Developer-first?
│     └─→ Sanity or Contentful ✓
│
├─ Product content (e-commerce)?
│  └─→ Sanity + e-commerce schema ✓
│
├─ Full control / self-hosted?
│  └─→ Payload CMS ✓
│
└─ Not sure?
   └─→ Sanity (generous free tier, great DX)
```

---

## Quick Decision Matrix

| Need | Decision |
|------|----------|
| Animation | Motion (simple) → GSAP (complex) |
| Database | Supabase (always start here) |
| State | TanStack Query + Zustand |
| Deploy | Vercel (default) |
| Payments | Stripe Checkout |
| Errors | Sentry |
| Analytics | PostHog |
| CMS | Sanity |
