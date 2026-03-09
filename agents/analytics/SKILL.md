---\nname: analytics\ndescription: Analytics and tracking patterns. Mixpanel, PostHog, conversion tracking, and event tracking.\nlast_updated: 2026-01\nowner: Frank\n---\n\n# Analytics & Tracking Skill\n\n**Know what's working with Mixpanel, PostHog, and conversion tracking.**

> **See also:** `tech-stack/CROSS-REFERENCES.md` for related skills (observability, monitoring, growth)

---

## TL;DR

| Tool | Best For | Price | Setup Time |
|------|----------|-------|------------|
| **PostHog** | All-in-one (analytics + A/B + session replay) | Free → $200/mo | 1 hour |
| **Mixpanel** | Product analytics, funnels | Free → $25/mo | 1 hour |
| **Plausible** | Privacy-focused, simple | $9/mo | 30 min |
| **Google Analytics 4** | Free, basic | Free | 1 hour |

**For vibe coders:** PostHog (all-in-one, open source option).

---

## Context Questions (Ask Before Recommending)

Before suggesting analytics patterns:

1. **What do you want to learn?** (user behavior, conversions, errors)
2. **Privacy requirements?** (GDPR, no cookies, standard)
3. **Budget?** (free tier, paid, enterprise)
4. **Features needed?** (basic pageviews, funnels, A/B testing, session replay)
5. **Existing stack?** (already using something?)

---

## Dimensions (Spectrums to Explore)

| Dimension | Spectrum |
|-----------|----------|
| **Complexity** | Simple pageviews ←→ Full product analytics |
| **Privacy** | Standard tracking ←→ Privacy-first (Plausible) |
| **Features** | Basic ←→ A/B testing + session replay |
| **Cost** | Free (GA4) ←→ Enterprise (Amplitude) |
| **Self-hosted** | SaaS ←→ Self-hosted (PostHog) |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Simple + privacy-focused | Plausible |
| Product analytics + A/B | PostHog |
| Free + basic | Google Analytics 4 |
| Enterprise + deep funnels | Mixpanel or Amplitude |
| Self-hosted requirement | PostHog (self-hosted) |
| Already using something | Keep it, don't switch |

---

## Part 1: PostHog Setup

```bash
npm install posthog-js
```

```typescript
// lib/posthog.ts
import posthog from 'posthog-js';

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
  });
}

export { posthog };
```

```tsx
// app/layout.tsx
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { posthog } from '@/lib/posthog';

export function Analytics() {
  const pathname = usePathname();
  
  useEffect(() => {
    posthog.capture('$pageview');
  }, [pathname]);
  
  return null;
}
```

---

## Part 2: Event Tracking

```typescript
// Track any user action
posthog.capture('created_project', {
  project_type: 'dashboard',
  template_used: true,
});

posthog.capture('upgraded_to_pro', {
  plan: 'pro',
  price: 9.99,
});

posthog.capture('sent_sms_campaign', {
  message_count: 5000,
  cost: 20,
});
```

---

## Part 3: Identify Users

```typescript
// When user signs up/logs in
posthog.identify(user.id, {
  email: user.email,
  plan: user.plan,
  created_at: user.createdAt,
});
```

---

## Part 4: Conversion Funnels

**Track:** Signup → Trial → Paid

```typescript
// Step 1: Signup
posthog.capture('signup_completed', {
  source: 'landing_page',
});

// Step 2: Trial started
posthog.capture('trial_started', {
  plan: 'pro',
});

// Step 3: Paid
posthog.capture('subscription_created', {
  plan: 'pro',
  amount: 9.99,
});
```

**View funnel in PostHog dashboard** → See where users drop off.

---

## Part 5: A/B Testing

```typescript
// Test pricing: $9.99 vs $14.99
const variant = posthog.getFeatureFlag('pricing_test');

const price = variant === 'high' ? 14.99 : 9.99;

// Track which converts better
posthog.capture('viewed_pricing', { variant, price });
```

---

## Part 6: Revenue Tracking

```typescript
// Track all revenue events
export async function trackRevenue(
  userId: string,
  amount: number,
  type: string
) {
  posthog.capture('revenue', {
    user_id: userId,
    amount,
    type, // subscription, one-time, usage
  });
  
  // Also store in DB
  await prisma.revenue.create({
    data: { userId, amount, type },
  });
}
```

---

## Part 7: Key Metrics to Track

```typescript
// Track these for any app
const EVENTS = {
  // Acquisition
  'visited_site': {},
  'signed_up': { source: string },
  
  // Activation
  'completed_onboarding': {},
  'created_first_project': {},
  
  // Revenue
  'started_trial': { plan: string },
  'upgraded_to_paid': { plan: string, amount: number },
  
  // Retention
  'daily_active_user': {},
  'weekly_active_user': {},
  
  // Referral
  'invited_friend': {},
  'referral_converted': {},
};
```

---

## Part 8: Dashboard Queries

```typescript
// Get conversion rate
export async function getConversionRate() {
  const signups = await prisma.user.count();
  const paid = await prisma.user.count({
    where: { plan: { not: 'free' } },
  });
  
  return {
    signups,
    paid,
    rate: (paid / signups) * 100,
  };
}

// Get MRR (Monthly Recurring Revenue)
export async function getMRR() {
  const subscriptions = await prisma.user.findMany({
    where: { plan: { not: 'free' } },
    select: { plan: true },
  });
  
  const revenue = subscriptions.reduce((sum, sub) => {
    const price = sub.plan === 'pro' ? 9.99 : 49.99;
    return sum + price;
  }, 0);
  
  return revenue;
}
```

---

## Part 9: Session Replay (PostHog)

**See exactly what users do:**

```typescript
// Auto-enabled with PostHog
// View in dashboard: see mouse movements, clicks, scrolls
```

**Use to:**
- Debug user issues
- See where users get stuck
- Understand behavior

---

## Resources

- **PostHog:** https://posthog.com/docs
- **Mixpanel:** https://developer.mixpanel.com/
- **Metrics Guide:** https://www.ycombinator.com/library/5z-a-guide-to-saas-metrics

---

## Related Skills

- `workflows/monetization/SKILL.md` - Track revenue
- `workflows/growth/SKILL.md` - Track viral loops
- `agents/email/SKILL.md` - Email analytics
