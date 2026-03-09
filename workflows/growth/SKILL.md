# Growth & Distribution Skill

**Get users through SEO, viral loops, and referrals.**

---

## Context Questions

Before implementing growth strategies, ask:

1. **What's the growth stage?** — Pre-launch, early traction, scaling
2. **What's the budget?** — Zero budget, small spend, significant investment
3. **What's the timeline?** — Need users now, sustainable long-term, both
4. **What's the product type?** — SaaS, consumer app, tool, content platform
5. **What's the viral potential?** — Naturally shareable, needs incentive, hard to share

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| Cost | Free (time investment) ←→ Paid (ad spend) |
| Speed | Slow build (SEO) ←→ Fast growth (viral/paid) |
| Sustainability | One-time spike ←→ Compounding growth |
| Effort | Low-touch ←→ High-touch |
| Scalability | Manual ←→ Automated |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Zero budget + time | SEO + content marketing, slow but free |
| Need users fast | Viral loops + referrals, code-based growth |
| B2B product | SEO + content + outreach, longer sales cycle |
| Consumer app | Viral sharing + social proof, network effects |
| Has product-market fit | Paid ads to scale proven conversion |
| Pre-product-market fit | Focus on product, not growth hacks |

---

## TL;DR

| Channel | Cost | Speed | Best For |
|---------|------|-------|----------|
| **SEO** | Free (time) | Slow (3-6 mo) | Long-term, B2B |
| **Viral loops** | Free | Medium (weeks) | Social, tools |
| **Referrals** | % of revenue | Fast (days) | SaaS, B2C |
| **Paid ads** | $$$  | Fast (hours) | Testing, scale |

**For vibe coders:** Start with viral loops + referrals (code-based growth).

---

## Part 1: Viral Loops

### Share to Unlock Pattern

```typescript
// User shares → Gets premium feature
export async function unlockViaShare(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!user.hasShared) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        hasShared: true,
        creditsEarned: user.creditsEarned + 10,
      },
    });
  }
}
```

```tsx
// components/ShareToUnlock.tsx
export function ShareToUnlock({ feature }: { feature: string }) {
  const shareUrl = `https://yourapp.com?ref=${user.id}`;
  
  async function handleShare() {
    await navigator.share({
      title: 'Check out this tool',
      url: shareUrl,
    });
    
    await fetch('/api/unlock-share');
  }
  
  return (
    <div>
      <p>Share to unlock {feature}</p>
      <Button onClick={handleShare}>Share Now</Button>
    </div>
  );
}
```

---

## Part 2: Referral System

### Basic Referral

```prisma
model User {
  id            String  @id @default(cuid())
  referralCode  String  @unique
  referredBy    String?
  credits       Int     @default(0)
}
```

```typescript
// lib/referrals.ts
export async function trackReferral(code: string, newUserId: string) {
  const referrer = await prisma.user.findUnique({
    where: { referralCode: code },
  });
  
  if (!referrer) return;
  
  // Give both users credits
  await prisma.user.update({
    where: { id: referrer.id },
    data: { credits: referrer.credits + 10 },
  });
  
  await prisma.user.update({
    where: { id: newUserId },
    data: {
      referredBy: referrer.id,
      credits: 5,
    },
  });
}
```

---

## Part 3: SEO (2025 Patterns)

### Next.js 16.1.1 Metadata

```typescript
// app/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trading Journal - Track Your Trades',
  description: 'Simple, powerful trading journal. Log trades, analyze performance, improve results.',
  openGraph: {
    title: 'Trading Journal',
    description: 'Track trades, boost performance',
    url: 'https://yourapp.com',
    siteName: 'Trading Journal',
    images: [{
      url: 'https://yourapp.com/og.png',
      width: 1200,
      height: 630,
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trading Journal',
    description: 'Track trades, boost performance',
    images: ['https://yourapp.com/og.png'],
  },
};
```

### Dynamic OG Images

```typescript
// app/og/route.tsx
import { ImageResponse } from 'next/og';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title');
  
  return new ImageResponse(
    (
      <div style={{
        fontSize: 60,
        background: 'linear-gradient(to bottom, #1e40af, #7c3aed)',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
      }}>
        {title}
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
```

---

## Part 4: Invite System

```typescript
// app/api/invite/route.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { email, inviterName } = await req.json();
  
  await resend.emails.send({
    from: 'invites@yourapp.com',
    to: email,
    subject: `${inviterName} invited you to join`,
    html: `
      <p>${inviterName} thinks you'd love our app!</p>
      <a href="https://yourapp.com/signup?ref=${userId}">
        Join Now (Get 10 credits)
      </a>
    `,
  });
  
  return Response.json({ success: true });
}
```

---

## Part 5: Content Marketing (AI-Powered)

### Auto-Generate Blog Posts

```typescript
//  lib/content.ts
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

export async function generateBlogPost(topic: string) {
  const { text } = await generateText({
    model: google('gemini-2.0-flash-001'),
    prompt: `Write a 500-word blog post about: ${topic}. Make it SEO-friendly with clear headings.`,
  });
  
  return text;
}

// Auto-publish to your blog
await prisma.post.create({
  data: {
    title: topic,
    content: text,
    slug: slugify(topic),
    published: true,
  },
});
```

---

## Part 6: Growth Metrics

```typescript
// Track key metrics
export async function getGrowthMetrics() {
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const newUsers = await prisma.user.count({
    where: { createdAt: { gte: thirtyDaysAgo } },
  });
  
  const referralSignups = await prisma.user.count({
    where: {
      createdAt: { gte: thirtyDaysAgo },
      referredBy: { not: null },
    },
  });
  
  const viralCoefficient = referralSignups / newUsers;
  
  return {
    newUsers,
    referralSignups,
    viralCoefficient, // > 1 = exponential growth
  };
}
```

---

## Resources

- **OG Image Generator:** https://vercel.com/docs/functions/og-image-generation
- **Referral Best Practices:** https://www.rewardful.com/
- **SEO for Next.js:** https://nextjs.org/learn/seo

---

## Related Skills

- `agents/seo/SKILL.md` - Deep SEO patterns
- `agents/email/SKILL.md` - Drip campaigns
- `workflows/monetization/SKILL.md` - Referral revenue
- `agents/analytics/SKILL.md` - Track viral loops
