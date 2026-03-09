---
name: email
description: Transactional and marketing emails with Resend. React templates, drip campaigns, analytics.
last_updated: 2026-03
owner: Frank
---

# Email & Engagement Skill

**Send emails at scale with Resend, drip campaigns, and retention.**

---

## Context Questions

Before implementing email:

1. **What type of emails?** — Transactional, marketing, drip sequence, notifications
2. **What's the volume?** — Under 3K/mo (free), 3K-50K (starter), 50K+ (scale)
3. **What's the design need?** — Plain text, branded HTML, React components
4. **Do you need sequences?** — One-off, automated drip, event-triggered
5. **What tracking?** — None, opens, clicks, conversions

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Type** | Transactional ←→ Marketing ←→ Drip sequence |
| **Design** | Plain text ←→ HTML ←→ React Email |
| **Volume** | Low (free tier) ←→ Medium ←→ High (dedicated IP) |
| **Automation** | Manual ←→ Event-triggered ←→ Full sequences |
| **Personalization** | None ←→ Name/data ←→ Dynamic content |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| MVP/launch | Resend free tier, simple templates |
| SaaS onboarding | Drip sequence, 4-5 emails over 7 days |
| E-commerce | Transactional (receipts) + marketing (promos) |
| B2B | Plain text often converts better |
| Re-engagement | "We miss you" emails after 7+ days inactive |
| Newsletter | Dedicated sender, unsubscribe handling |

---

## TL;DR

```bash
npm install resend
```

| Provider | Cost | Best For |
|----------|------|----------|
| **Resend** | Free (3k/mo) → $20/mo | Modern API, React emails |
| SendGrid | Free (100/day) → $20/mo | Established, reliable |
| Mailgun | $35/mo | High volume |

**For vibe coders:** Resend (best DX, React email templates).

---

## Part 1: Quick Email (Resend)

```typescript
// lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(
  to: string,
  subject: string,
  html: string
) {
  const { data } = await resend.emails.send({
    from: 'noreply@yourapp.com',
    to,
    subject,
    html,
  });
  
  return data?.id;
}
```

**That's it. 10 lines to send email.**

---

## Part 2: React Email Templates

```bash
npm install @react-email/components
```

```tsx
// emails/welcome.tsx
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Heading,
  Text,
  Button,
} from '@react-email/components';

export function WelcomeEmail({ name }: { name: string }) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Trading Journal!</Preview>
      <Body style={{ fontFamily: 'sans-serif' }}>
        <Container>
          <Heading>Hey {name}! 👋</Heading>
          <Text>Thanks for signing up. Let's get you started:</Text>
          <Button href="https://yourapp.com/onboarding">
            Start Tutorial
          </Button>
        </Container>
      </Body>
    </Html>
  );
}
```

```typescript
// Send it
import { render } from '@react-email/render';
import { WelcomeEmail } from '@/emails/welcome';

const html = render(<WelcomeEmail name={user.name} />);
await sendEmail(user.email, 'Welcome!', html);
```

---

## Part 3: Drip Campaigns

```prisma
model EmailSequence {
  id        String   @id @default(cuid())
  userId    String
  sequence  String   // onboarding, trial, churned
  step      Int      @default(0)
  lastSent  DateTime?
  completed Boolean  @default(false)
  
  user      User     @relation(fields: [userId], references: [id])
}
```

```typescript
// Onboarding sequence
const SEQUENCES = {
  onboarding: [
    { day: 0, subject: 'Welcome!', template: 'welcome' },
    { day: 2, subject: 'Quick tip', template: 'tip-1' },
    { day: 5, subject: 'Are you stuck?', template: 'check-in' },
    { day: 7, subject: 'Unlock Pro features', template: 'upgrade' },
  ],
};

// Cron job (runs daily)
export async function sendDripEmails() {
  const sequences = await prisma.emailSequence.findMany({
    where: { completed: false },
    include: { user: true },
  });
  
  for (const seq of sequences) {
    const nextEmail = SEQUENCES[seq.sequence][seq.step];
    if (!nextEmail) continue;
    
    const daysSinceStart = Math.floor(
      (Date.now() - seq.user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceStart >= nextEmail.day && (!seq.lastSent || daysSinceStart > seq.step)) {
      await sendEmail(
        seq.user.email,
        nextEmail.subject,
        await getTemplate(nextEmail.template, seq.user)
      );
      
      await prisma.emailSequence.update({
        where: { id: seq.id },
        data: {
          step: seq.step + 1,
          lastSent: new Date(),
          completed: seq.step + 1 >= SEQUENCES[seq.sequence].length,
        },
      });
    }
  }
}
```

---

## Part 4: Transactional Emails

```typescript
// emails/receipt.tsx
export function ReceiptEmail({ amount, plan }: any) {
  return (
    <Html>
      <Body>
        <Heading>Payment Received</Heading>
        <Text>Thank you for subscribing to {plan}!</Text>
        <Text>Amount: ${amount}</Text>
        <Button href="https://yourapp.com/billing">
          View Invoice
        </Button>
      </Body>
    </Html>
  );
}

// Send on payment
await handleStripeWebhook(/* ... */) {
  const html = render(<ReceiptEmail amount={9.99} plan="Pro" />);
  await sendEmail(user.email, 'Payment Received', html);
}
```

---

## Part 5: Retention Emails

### Re-Engage Inactive Users

```typescript
// Find users inactive for 7 days
const inactiveUsers = await prisma.user.findMany({
  where: {
    lastActiveAt: {
      lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  },
});

for (const user of inactiveUsers) {
  const html = render(<WeHMissYouEmail name={user.name} />);
  await sendEmail(user.email, 'We miss you!', html);
}
```

---

## Part 6: Email Analytics

```typescript
// Track opens/clicks with Resend
await resend.emails.send({
  from: 'noreply@yourapp.com',
  to: user.email,
  subject: 'Welcome!',
  html,
  tags: [
    { name: 'campaign', value: 'onboarding' },
    { name: 'user_id', value: user.id },
  ],
});

// View metrics in Resend dashboard
// Or track via webhooks
```

---

## Part 7: Unsubscribe Handling

```typescript
// app/unsubscribe/route.ts
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('id');
  
  await prisma.user.update({
    where: { id: userId },
    data: { emailOptOut: true },
  });
  
  return new Response('Unsubscribed successfully', { status: 200 });
}

// Add to all emails
<Text style={{ fontSize: 12, color: '#666' }}>
  <a href={`https://yourapp.com/unsubscribe?id=${userId}`}>
    Unsubscribe
  </a>
</Text>
```

---

## Part 8: Email Sequences by Type

| Sequence | Emails | Timeline | Goal |
|----------|--------|----------|------|
| **Onboarding** | 4-5 | 7-14 days | Activation |
| **Trial → Paid** | 3-4 | 7 days | Conversion |
| **Retention** | 2-3 | 14-30 days | Re-engage |
| **Winback** | 2 | 60-90 days | Reactivate churned |

---

## Part 9: Best Practices

**Subject Lines:**
- Keep under 50 chars
- Personalize: "Hey {name}"
- Create urgency: "24 hours left"
- Ask questions: "Need help?"

**Timing:**
- 10am-12pm best open rates
- Tuesday/Wednesday best days
- Avoid weekends (B2B)

**Content:**
- One clear CTA
- Mobile-friendly (60% open on mobile)
- Plain text alt for accessibility

---

## Resources

- **Resend:** https://resend.com/docs
- **React Email:** https://react.email/
- **Email Best Practices:** https://www.reallygoodemails.com/

---

## Related Skills

- `agents/sms/SKILL.md` - SMS campaigns
- `workflows/monetization/SKILL.md` - Trial → paid emails
- `workflows/growth/SKILL.md` - Referral emails
- `agents/analytics/SKILL.md` - Email metrics
