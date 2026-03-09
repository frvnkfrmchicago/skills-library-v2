---
name: growth-hacking
description: Growth hacking. Viral loops, Gen Z marketing, PLG, launch strategies, engagement hooks.
last_updated: 2026-03
---

# Growth Hacking

Ship fast, grow faster.

> **See also:** `workflows/growth/SKILL.md` for SEO and general growth

---

## TL;DR

| Strategy | Impact | Effort |
|----------|--------|--------|
| **Referral program** | High | Medium |
| **Product Hunt launch** | Medium | Low |
| **Viral loops** | Very High | High |
| **Community (Discord)** | High | Medium |
| **Onboarding optimization** | High | Medium |

---

## Context Questions (Ask Before Recommending)

Before suggesting growth strategies:

1. **What stage is the product?** (pre-launch, early, scaling)
2. **Target audience?** (B2B, B2C, Gen Z, enterprise)
3. **Current traction?** (0 users, 100, 10K+)
4. **Budget for growth?** (bootstrapped, funded)
5. **Product type?** (SaaS, marketplace, content, mobile app)

---

## Dimensions (Spectrums to Explore)

| Dimension | Spectrum |
|-----------|----------|
| **Acquisition** | Paid ads ←→ Organic/viral |
| **Community** | None ←→ Discord/Slack ←→ Full ambassador |
| **Virality** | No loop ←→ Invite incentives ←→ Built-in sharing |
| **Launch Style** | Soft launch ←→ Big bang (Product Hunt) |
| **Monetization** | Free ←→ Freemium ←→ Premium |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Pre-launch | Build in public + waitlist |
| Early stage (< 100 users) | Personal outreach + community |
| Scaling (1K+ users) | Referral program + viral loops |
| B2B | LinkedIn + cold outreach + content |
| Gen Z / consumer | TikTok + Discord + memes |
| Marketplace | Focus on supply first |

---

## Part 1: Viral Loops

### K-Factor Formula

```
K = i × c

i = invites sent per user
c = conversion rate of invites

K > 1 = viral growth
K < 1 = paid/organic needed
```

### Referral Mechanics

```typescript
// Referral system schema
interface ReferralProgram {
  referrerId: string
  refereeId: string
  rewardType: 'credits' | 'discount' | 'feature'
  rewardAmount: number
  status: 'pending' | 'qualified' | 'rewarded'
  qualifyingAction: 'signup' | 'purchase' | 'subscription'
}

// Double-sided rewards work best
const REFERRAL_CONFIG = {
  referrer: { credits: 500, message: 'You got $5!' },
  referee: { discount: 0.20, message: '20% off first month' },
  qualifyingAction: 'first_purchase',
  maxReferrals: 50,
}
```

### Classic Examples

| Company | Loop | Why It Worked |
|---------|------|---------------|
| **Dropbox** | Give space, get space | Both sides win |
| **Notion** | Free for teams | Network effects |
| **Calm** | Gift a free month | Low friction |
| **Cash App** | $5 each | Instant gratification |

### Invite Flow

```tsx
// Simple share flow
import { Share } from 'react-native'

async function shareInvite(code: string) {
  await Share.share({
    message: `Join me on [App]! Use my code ${code} for 20% off: https://app.com/invite/${code}`,
  })
  
  // Track share attempt
  analytics.track('invite_shared', { code })
}
```

---

## Part 2: Engagement Hooks

### Variable Rewards (Dopamine)

```typescript
// Slot machine effect - unpredictable rewards
const REWARD_WEIGHTS = [
  { type: 'common', weight: 70, value: 10 },
  { type: 'rare', weight: 25, value: 50 },
  { type: 'jackpot', weight: 5, value: 500 },
]

function spinReward(): Reward {
  const random = Math.random() * 100
  let cumulative = 0
  
  for (const reward of REWARD_WEIGHTS) {
    cumulative += reward.weight
    if (random <= cumulative) {
      return reward
    }
  }
}
```

### Streaks

```typescript
// Streak system
interface UserStreak {
  currentStreak: number
  longestStreak: number
  lastActiveDate: Date
}

function updateStreak(user: UserStreak): UserStreak {
  const today = startOfDay(new Date())
  const lastActive = startOfDay(user.lastActiveDate)
  const daysSince = differenceInDays(today, lastActive)
  
  if (daysSince === 0) {
    return user // Already active today
  }
  
  if (daysSince === 1) {
    // Streak continues
    return {
      currentStreak: user.currentStreak + 1,
      longestStreak: Math.max(user.longestStreak, user.currentStreak + 1),
      lastActiveDate: today,
    }
  }
  
  // Streak broken
  return {
    currentStreak: 1,
    longestStreak: user.longestStreak,
    lastActiveDate: today,
  }
}
```

### Social Proof

```tsx
// Real-time social proof
function LiveActivity() {
  const [activity, setActivity] = useState<string[]>([])
  
  useEffect(() => {
    const ws = new WebSocket('wss://api.app.com/live')
    ws.onmessage = (e) => {
      const event = JSON.parse(e.data)
      setActivity(prev => [
        `${event.name} just ${event.action}`,
        ...prev.slice(0, 4)
      ])
    }
    return () => ws.close()
  }, [])
  
  return (
    <div className="fixed bottom-4 left-4">
      {activity.map((a, i) => (
        <Toast key={i} message={a} />
      ))}
    </div>
  )
}
```

### FOMO Mechanics

```tsx
// Urgency elements
<Badge>Only 3 left in stock</Badge>
<Badge>47 people viewing now</Badge>
<Countdown endTime={saleEnds} />
<Badge>Offer expires in 2:34:12</Badge>
```

---

## Part 3: Onboarding Optimization

### Time-to-Value

```
Goal: Get user to "Aha!" moment ASAP

Bad: Sign up → Verify email → Complete profile → Tutorial → Dashboard
Good: Sign up → Immediately see value → Verify email later
```

### Progressive Disclosure

```tsx
// Don't overwhelm new users
const ONBOARDING_STEPS = [
  { step: 1, required: true, action: 'Create first project' },
  { step: 2, required: false, action: 'Invite team', showAfter: 'first_project' },
  { step: 3, required: false, action: 'Connect integrations', showAfter: 'day_2' },
]

function OnboardingChecklist() {
  const { completedSteps, currentStep } = useOnboarding()
  
  return (
    <div className="space-y-2">
      {ONBOARDING_STEPS.filter(s => shouldShow(s)).map(step => (
        <Step 
          key={step.step}
          completed={completedSteps.includes(step.step)}
          current={currentStep === step.step}
        >
          {step.action}
        </Step>
      ))}
    </div>
  )
}
```

### Activation Metrics

| Metric | What to Track |
|--------|---------------|
| **Time to first value** | How long to "Aha!" |
| **Activation rate** | % completing key action |
| **Onboarding completion** | % finishing steps |
| **Day 1 retention** | % returning next day |

---

## Part 4: A/B Testing

### What to Test First

1. **CTA button text** — High impact, low effort
2. **Pricing page** — Direct revenue impact
3. **Onboarding flow** — Activation rate
4. **Landing page headline** — Conversion rate
5. **Email subject lines** — Open rates

### Statistical Significance

```typescript
// Minimum sample size calculator
function minSampleSize(
  baseConversion: number,    // Current: 0.05 (5%)
  minDetectableEffect: number, // Want to detect: 0.2 (20% lift)
  power: number = 0.8,
  significance: number = 0.05
): number {
  // Simplified formula
  const p1 = baseConversion
  const p2 = baseConversion * (1 + minDetectableEffect)
  const pooled = (p1 + p2) / 2
  
  const z_alpha = 1.96  // 95% confidence
  const z_beta = 0.84   // 80% power
  
  const n = (2 * pooled * (1 - pooled) * Math.pow(z_alpha + z_beta, 2)) /
            Math.pow(p2 - p1, 2)
  
  return Math.ceil(n)
}

// Example: 5% conversion, want to detect 20% lift
// Need ~3,000 visitors per variant
```

### Tools

| Tool | Best For | Price |
|------|----------|-------|
| **PostHog** | Product analytics + A/B | Free tier |
| **Amplitude** | Enterprise analytics | $$$ |
| **Statsig** | Feature flags + experiments | Free tier |
| **LaunchDarkly** | Feature flags | $$$ |

---

## Part 5: Pirate Metrics (AARRR)

```
┌─────────────────────────────────────────────────────┐
│  ACQUISITION → How do users find you?               │
│  └─ Channels: SEO, ads, referrals, social          │
├─────────────────────────────────────────────────────┤
│  ACTIVATION → Do they have good first experience?   │
│  └─ Metric: % completing key action                │
├─────────────────────────────────────────────────────┤
│  RETENTION → Do they come back?                     │
│  └─ Metric: DAU/MAU, cohort retention              │
├─────────────────────────────────────────────────────┤
│  REVENUE → Do they pay?                             │
│  └─ Metric: Conversion rate, LTV                   │
├─────────────────────────────────────────────────────┤
│  REFERRAL → Do they tell others?                    │
│  └─ Metric: K-factor, NPS                          │
└─────────────────────────────────────────────────────┘
```

### North Star Metric

| Company Type | North Star |
|--------------|------------|
| **Marketplace** | Weekly transactions |
| **SaaS** | Weekly active users |
| **Subscription** | Monthly active subscribers |
| **Content** | Daily active consumers |

---

## Part 6: Gen Z Marketing

### Platform Preferences

| Platform | Gen Z Usage | Content Type |
|----------|-------------|--------------|
| **TikTok** | Primary | Short video, trends |
| **Instagram** | High | Stories, Reels |
| **Discord** | High | Community |
| **YouTube** | High | Long + Shorts |
| **BeReal** | Growing | Authenticity |
| **Twitter/X** | Medium | Commentary |
| **Facebook** | Low | Skip it |

### Language & Tone

```
❌ Don't: "Leverage our synergistic platform to optimize your workflow"
✅ Do: "Stop wasting time. Ship faster."

❌ Don't: "Dear Valued Customer"
✅ Do: "Hey! Quick update:"

❌ Don't: Polished corporate video
✅ Do: Authentic behind-the-scenes, memes, chaos
```

### Content That Works

1. **Behind-the-scenes** — Building in public
2. **Memes** — Relevant, not cringe
3. **User content** — Repost and celebrate
4. **Duets/Stitches** — Engage with trends
5. **Hot takes** — Opinions drive engagement

### Influencer Partnerships

```typescript
// Influencer tier strategy
const INFLUENCER_TIERS = {
  nano: { followers: '1K-10K', cost: '$ or free product', engagement: 'Highest' },
  micro: { followers: '10K-100K', cost: '$$', engagement: 'High' },
  macro: { followers: '100K-1M', cost: '$$$', engagement: 'Medium' },
  mega: { followers: '1M+', cost: '$$$$', engagement: 'Lower' },
}

// Best ROI: Nano + Micro influencers with high engagement
```

---

## Part 7: Community Building

### Discord Server Structure

```
📢 announcements (read-only)
📋 rules
👋 introductions

💬 general
❓ help
💡 feature-requests
🐛 bug-reports

🏆 showcase
🎉 wins
```

### Community-Led Growth

1. **Ambassador program** — Power users spread the word
2. **User-generated content** — Templates, tutorials
3. **Community events** — AMAs, challenges
4. **Exclusive access** — Beta features for active members

---

## Part 8: Product-Led Growth (PLG)

### Freemium Model

```typescript
const PRICING_TIERS = {
  free: {
    projects: 3,
    teamMembers: 1,
    features: ['basic'],
    cta: 'Start free',
  },
  pro: {
    price: 10,
    projects: 'unlimited',
    teamMembers: 5,
    features: ['basic', 'advanced', 'integrations'],
    cta: 'Go Pro',
  },
  team: {
    price: 25,
    projects: 'unlimited',
    teamMembers: 'unlimited',
    features: ['all'],
    cta: 'Contact sales',
  },
}
```

### In-Product Upgrade Prompts

```tsx
// Contextual upgrade prompts
function FeatureGate({ feature, children }: Props) {
  const { plan, canAccess } = usePlan()
  
  if (canAccess(feature)) {
    return children
  }
  
  return (
    <div className="relative">
      <div className="opacity-50 pointer-events-none">{children}</div>
      <UpgradeOverlay 
        message={`Unlock ${feature} with Pro`}
        cta="Upgrade"
      />
    </div>
  )
}
```

---

## Part 9: Launch Strategies

### Product Hunt Playbook

```
2 weeks before:
- [ ] Prepare assets (logo, screenshots, video)
- [ ] Write compelling tagline (< 60 chars)
- [ ] Draft description (first sentence is key)
- [ ] Line up hunters and supporters

Launch day:
- [ ] Launch at 12:01 AM PST (not midnight)
- [ ] Post in communities (don't spam)
- [ ] Engage with EVERY comment
- [ ] Share behind-the-scenes on Twitter
- [ ] Email your list

After:
- [ ] Thank supporters
- [ ] Follow up with leads
- [ ] Write retrospective
```

### Twitter/X Launch Strategy

```
1. Build in public for 2-4 weeks before
2. Tease launch date
3. Launch thread formula:
   - Hook: Problem statement
   - Solution: Your product
   - Features: 3-5 key points
   - Social proof: Early users
   - CTA: Link with urgency
4. Engage with every reply
5. Quote tweet the best responses
```

### Reddit Marketing

```
DO:
- Be genuine member first
- Share value, not promotions
- Answer questions honestly
- Post in relevant subreddits

DON'T:
- Drop links and run
- Obvious self-promotion
- Ignore negative feedback
- Use multiple accounts
```

---

## Part 10: Growth Experiments

### Experiment Template

```markdown
## Experiment: [Name]

### Hypothesis
If we [change], then [metric] will [improve] by [amount]
because [reason].

### Metrics
- Primary: [conversion rate, activation, etc.]
- Secondary: [supporting metrics]

### Design
- Control: [current experience]
- Variant: [new experience]
- Sample size: [calculated minimum]
- Duration: [2 weeks minimum]

### Results
- [Pending/Win/Loss/Inconclusive]
- Statistical significance: [p-value]
- Effect size: [% change]

### Learnings
- [What we learned regardless of outcome]
```

### Learning Loops

```
Idea → Hypothesis → Experiment → Data → Learning → New Idea
                                         ↓
                              Document everything
```

---

## Checklist

- [ ] North star metric defined
- [ ] Activation metric identified
- [ ] Onboarding optimized for time-to-value
- [ ] Referral program live
- [ ] A/B testing infrastructure ready
- [ ] Analytics tracking key events
- [ ] Launch plan documented
- [ ] Community channel created

---

## Resources

- Reforge: https://www.reforge.com/
- Lenny's Newsletter: https://www.lennysnewsletter.com/
- Product Hunt: https://www.producthunt.com/

---

## Related Skills

- `workflows/growth/SKILL.md` — SEO, general growth
- `workflows/monetization/SKILL.md` — Pricing, revenue
- `agents/analytics/SKILL.md` — PostHog, tracking
