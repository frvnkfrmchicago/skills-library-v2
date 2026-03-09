---
name: sms
description: SMS at scale with Twilio, Telnyx, or MessageBird. Bulk messaging, compliance, delivery tracking.
last_updated: 2026-03
owner: Frank
---

# SMS & Communication Skill

**Send SMS at scale with Twilio, Telnyx, or MessageBird.**

---

## Context Questions

Before implementing SMS:

1. **What's the use case?** — Notifications, marketing, 2FA, alerts
2. **What's the volume?** — Under 1K/mo, 1K-10K, 10K+ (bulk pricing matters)
3. **What's the geography?** — US only, international, specific countries
4. **What's the timing?** — Real-time, scheduled, event-triggered
5. **What compliance is needed?** — TCPA (US), GDPR (EU), opt-in/opt-out

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Volume** | Low ←→ Medium ←→ Bulk (queue needed) |
| **Geography** | US only ←→ North America ←→ Global |
| **Timing** | Real-time ←→ Scheduled ←→ Campaign-based |
| **Type** | Transactional ←→ Marketing ←→ 2FA |
| **Compliance** | Basic opt-out ←→ Full TCPA ←→ Enterprise |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Low volume, US only | Twilio (best docs, easy start) |
| High volume, cost-sensitive | Telnyx (4x cheaper than Twilio) |
| International | MessageBird (global coverage) |
| Bulk campaigns | Queue system (BullMQ), rate limiting |
| 2FA/OTP | Twilio Verify or custom with short codes |
| Marketing | Full TCPA compliance, opt-out handling |

---

## TL;DR

```bash
npm install twilio
# or
npm install telnyx
```

| Provider | Cost/Text (US) | Best For |
|----------|----------------|----------|
| **Telnyx** | $0.004 | Cheapest, great API |
| MessageBird | $0.005 | International |
| Twilio | $0.0102 (with fees) | Most reliable, best docs |

**5,000 texts:**
- Telnyx: $20
- MessageBird: $25
- Twilio: $51

---

## Part 1: Quick SMS (Twilio)

### Setup

```typescript
// lib/sms.ts
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export async function sendSMS(to: string, body: string) {
  const message = await client.messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER!,
    to,
  });
  
  return message.sid;
}
```

### Send One Text

```typescript
// app/api/sms/send/route.ts
import { sendSMS } from '@/lib/sms';

export async function POST(req: Request) {
  const { to, message } = await req.json();
  
  try {
    const sid = await sendSMS(to, message);
    return Response.json({ success: true, sid });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

**That's it. 10 lines to send SMS.**

---

## Part 2: Bulk SMS (Queue System)

### Why You Need a Queue

**Don't do this:**
```typescript
// ❌ Sends all at once, rate limit errors
for (const contact of contacts) {
  await sendSMS(contact.phone, message);
}
```

**Do this:**
```typescript
// ✅ Queue with throttling
import { Queue } from 'bullmq';

const smsQueue = new Queue('sms', {
  connection: { host: 'localhost', port: 6379 }
});

// Add to queue
for (const contact of contacts) {
  await smsQueue.add('send', {
    to: contact.phone,
    body: message,
  });
}
```

### Full Bulk System

```typescript
// lib/sms-bulk.ts
import { Queue, Worker } from 'bullmq';
import { sendSMS } from './sms';

const connection = { host: 'localhost', port: 6379 };

export const smsQueue = new Queue('sms', { connection });

// Process queue (separate file or service)
export const smsWorker = new Worker(
  'sms',
  async (job) => {
    const { to, body, campaignId } = job.data;
    
    try {
      const sid = await sendSMS(to, body);
      
      // Log success
      await prisma.smsLog.create({
        data: {
          campaignId,
          phone: to,
          status: 'sent',
          twilioSid: sid,
        },
      });
      
      return { success: true, sid };
    } catch (error) {
      // Log failure
      await prisma.smsLog.create({
        data: {
          campaignId,
          phone: to,
          status: 'failed',
          error: error.message,
        },
      });
      
      throw error;
    }
  },
  {
    connection,
    limiter: {
      max: 100, // 100 messages
      duration: 1000, // per second
    },
  }
);
```

---

## Part 3: Database Schema

```prisma
model Contact {
  id          String   @id @default(cuid())
  phone       String
  firstName   String?
  lastName    String?
  tags        String[]
  optedOut    Boolean  @default(false)
  createdAt   DateTime @default(now())
  
  messages    SmsLog[]
}

model Campaign {
  id          String   @id @default(cuid())
  name        String
  message     String
  status      String   // draft, sending, sent
  totalCount  Int
  sentCount   Int      @default(0)
  failedCount Int      @default(0)
  scheduledAt DateTime?
  createdAt   DateTime @default(now())
  
  messages    SmsLog[]
}

model SmsLog {
  id          String   @id @default(cuid())
  campaignId  String
  contactId   String?
  phone       String
  message     String
  status      String   // sent, failed, delivered
  twilioSid   String?
  error       String?
  sentAt      DateTime @default(now())
  
  campaign    Campaign @relation(fields: [campaignId], references: [id])
  contact     Contact? @relation(fields: [contactId], references: [id])
}
```

---

## Part 4: Upload CSV

```typescript
// app/api/contacts/import/route.ts
import { parse } from 'csv-parse/sync';

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  
  const text = await file.text();
  const records = parse(text, {
    columns: true,
    skip_empty_lines: true,
  });
  
  // Bulk insert
  await prisma.contact.createMany({
    data: records.map((r: any) => ({
      phone: r.phone,
      firstName: r.firstName,
      lastName: r.lastName,
    })),
    skipDuplicates: true,
  });
  
  return Response.json({ imported: records.length });
}
```

---

## Part 5: Delivery Tracking

### Twilio Webhooks

```typescript
// app/api/webhooks/twilio/route.ts
export async function POST(req: Request) {
  const formData = await req.formData();
  const status = formData.get('MessageStatus');
  const sid = formData.get('MessageSid');
  
  await prisma.smsLog.updateMany({
    where: { twilioSid: sid as string },
    data: { status: status as string },
  });
  
  return Response.json({ ok: true });
}
```

**Set webhook URL in Twilio dashboard:**
```
https://your-app.com/api/webhooks/twilio
```

---

## Part 6: Cost Optimization

### Provider Comparison (2025)

| Provider | Base Cost | Carrier Fees | Total/Text | 5k Texts | Best For |
|----------|-----------|--------------|------------|----------|----------|
| Telnyx | $0.004 | Included | $0.004 | $20 | Bulk, cheapest |
| MessageBird | $0.005 | Included | $0.005 | $25 | International |
| Twilio | $0.0075 | $0.0027 | $0.0102 | $51 | Reliability |

### When to Switch

- **Under 10k/month:** Twilio (ease of use)
- **10k-100k/month:** Telnyx (cost savings)
- **International:** MessageBird (global coverage)

---

## Part 7: Compliance (CRITICAL)

### TCPA Compliance (US Law)

**Required:**
- ✅ Get explicit consent before texting
- ✅ Include opt-out instructions in every message
- ✅ Honor opt-outs immediately
- ✅ Don't text after 9pm local time

**Example message:**
```
"Your order #1234 is ready! Reply STOP to unsubscribe."
```

### Opt-Out Handling

```typescript
// app/api/webhooks/twilio/route.ts
export async function POST(req: Request) {
  const body = formData.get('Body')?.toString().toLowerCase();
  const from = formData.get('From');
  
  if (body === 'stop' || body === 'unsubscribe') {
    await prisma.contact.update({
      where: { phone: from },
      data: { optedOut: true },
    });
    
    // Send confirmation
    await sendSMS(from, 'You have been unsubscribed.');
  }
  
  return Response.json({ ok: true });
}
```

---

## Part 8: Pricing Your Service

### Revenue Models

| Model | How It Works | Example |
|-------|--------------|---------|
| **Per-Message** | Charge per text sent | $0.02/text (4x markup on Telnyx) |
| **Monthly** | Unlimited texts, fixed price | $200/mo for 10k texts |
| **Tiered** | Price based on volume | $50 (0-1k), $150 (1k-5k), $400 (5k+) |

### What to Charge

**For 5,000 texts/month:**
- Your cost (Telnyx): $20
- Charge client: $200-400/mo
- Your margin: $180-380/mo (9-19x markup)

**Or per-message:**
- Your cost: $0.004
- Charge: $0.02
- Margin: $0.016/text (5x markup)
- On 5k texts: $100 revenue, $20 cost = $80 profit

---

## Part 9: Simple Dashboard

### Features Checklist

```markdown
- [ ] Upload CSV of contacts
- [ ] Create campaign (name, message, schedule)
- [ ] Send now or schedule
- [ ] View delivery status
- [ ] Export results
- [ ] Opt-out management
```

**Build time:** 4-6 hours  
**Tech:** Next.js 16.1.1 + Prisma + Twilio + BullMQ

---

## Resources

- **Twilio Docs:** https://www.twilio.com/docs/sms
- **Telnyx Docs:** https://developers.telnyx.com/
- **TCPA Compliance:** https://www.fcc.gov/consumers/guides/stop-unwanted-robocalls-and-texts
- **BullMQ (Queue):** https://docs.bullmq.io/

---

## Related Skills

- `workflows/monetization/SKILL.md` - Pricing models
- `agents/email/SKILL.md` - Email campaigns
- `agents/analytics/SKILL.md` - Track conversions
- `agents/database/SKILL.md` - Contact management
