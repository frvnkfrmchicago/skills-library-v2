---
name: support
description: FAQ, help docs, support flows, and user assistance.
last_updated: 2026-03
---

# Support & FAQ

Help users help themselves.

---

## Context Questions

Before building support content, ask:

1. **What's the product complexity?** — Simple tool, feature-rich SaaS, technical platform
2. **Who are your users?** — Technical, non-technical, mixed, enterprise
3. **What support channels exist?** — Self-serve only, email, chat, phone
4. **What's your team size?** — Solo founder, small team, dedicated support
5. **What are the top pain points?** — Billing, onboarding, features, bugs

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| Support Model | Self-serve only ←→ White-glove support |
| Documentation | Minimal FAQ ←→ Comprehensive knowledge base |
| Response Time | Async (48h) ←→ Real-time chat |
| Technical Depth | User-friendly ←→ Developer-focused |
| Automation | Human-first ←→ Bot-first |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Solo founder + SaaS | FAQ-heavy, canned responses, async email |
| Enterprise + complex product | Full knowledge base, SLA-backed response times |
| Developer tool + technical users | Code examples in docs, GitHub issues, Discord |
| Consumer app + non-technical | Visual guides, in-app tooltips, chat widget |
| High churn + onboarding issues | Onboarding tours, empty states, proactive help |

---

## TL;DR

| Support Type | When to Use |
|--------------|-------------|
| **FAQ** | Common questions, quick answers |
| **Help Docs** | How-to guides, features |
| **In-App Help** | Contextual guidance |
| **Support Flow** | When self-service fails |

---

## FAQ Structure

### Organization

```
FAQ Categories:
├── Getting Started
│   ├── How do I sign up?
│   ├── What's included in free?
│   └── How do I upgrade?
├── Features
│   ├── How do I [feature]?
│   └── What are the limits?
├── Billing
│   ├── How do I update payment?
│   ├── How do I cancel?
│   └── Refund policy?
├── Account
│   ├── How do I reset password?
│   ├── How do I delete account?
│   └── How do I export data?
└── Troubleshooting
    ├── Why isn't [X] working?
    └── How do I report a bug?
```

### FAQ Writing Tips

**Good FAQ answer:**
- Starts with direct answer
- Provides steps if needed
- Links to relevant docs
- Offers next step

**Example:**

```markdown
## How do I upgrade to Pro?

Go to Settings → Billing → Choose Plan. Select Pro and 
enter your payment details. Your upgrade takes effect immediately.

Need help deciding? [Compare plans](/pricing)
```

### Common FAQ Questions (Templates)

**Billing:**
```markdown
## How do I cancel my subscription?

Go to Settings → Billing → Cancel Subscription. Your access 
continues until the end of your current billing period.

You can resubscribe anytime from the same page.
```

```markdown
## How do I update my payment method?

Go to Settings → Billing → Payment Methods → Update. 
Enter your new card details.

We accept Visa, Mastercard, and American Express.
```

```markdown
## Can I get a refund?

Yes, within 14 days of purchase. Email [EMAIL] with your 
account email and we'll process it within 5-7 business days.

See our full [refund policy](/refunds).
```

**Account:**
```markdown
## How do I reset my password?

1. Go to the login page
2. Click "Forgot password"
3. Enter your email
4. Check your inbox for reset link
5. Create new password

Link expires in 1 hour. Didn't get it? Check spam or [contact us](/contact).
```

```markdown
## How do I delete my account?

Go to Settings → Account → Delete Account. This is permanent 
and removes all your data within 30 days.

Want to export first? Go to Settings → Data → Export.
```

```markdown
## How do I export my data?

Go to Settings → Data → Export. We'll email you a download 
link within 24 hours.

Export includes: [list what's included]
```

---

## Help Docs Structure

### Information Architecture

```
/help
├── getting-started/
│   ├── quick-start.md
│   ├── your-first-project.md
│   └── interface-overview.md
├── features/
│   ├── feature-1.md
│   ├── feature-2.md
│   └── feature-3.md
├── integrations/
│   ├── integration-1.md
│   └── integration-2.md
├── billing/
│   ├── plans.md
│   └── payments.md
├── account/
│   ├── settings.md
│   └── security.md
└── troubleshooting/
    ├── common-issues.md
    └── contact.md
```

### Help Doc Template

```markdown
# [Feature Name]

[One sentence explanation of what this feature does]

## Overview
[Brief context - why this feature exists, who it's for]

## How to [Do The Thing]

1. Step one
   - Detail if needed
2. Step two
3. Step three

## Options & Settings

| Option | What it does |
|--------|--------------|
| Option A | Description |
| Option B | Description |

## Tips
- Tip for better usage
- Common gotcha to avoid

## Related
- [Related Feature 1](/help/related-1)
- [Related Feature 2](/help/related-2)

## Still need help?
[Contact support](/contact)
```

---

## In-App Help Patterns

### Tooltips

```tsx
<Tooltip content="This setting controls...">
  <InfoIcon />
</Tooltip>
```

**When to use:**
- New features
- Complex settings
- Potentially confusing UI

### Empty States with Guidance

```tsx
<EmptyState>
  <h3>No projects yet</h3>
  <p>Create your first project to get started</p>
  <Button>Create Project</Button>
  <Link href="/help/getting-started">Learn more</Link>
</EmptyState>
```

### Onboarding Tours

```
Step 1: "This is your dashboard. Here you'll see all your projects."
Step 2: "Click here to create a new project."
Step 3: "Use this sidebar to navigate between features."
Step 4: "Need help? Click here anytime."
```

### Contextual Help

```tsx
<SettingRow>
  <Label>API Rate Limit</Label>
  <Input />
  <HelpText>
    Requests per minute. Free: 60, Pro: 1000. 
    <Link href="/help/rate-limits">Learn more</Link>
  </HelpText>
</SettingRow>
```

---

## Support Flow

### Escalation Path

```
1. In-App Help → Tooltips, empty states, onboarding
      ↓ (if not solved)
2. FAQ → Common questions
      ↓ (if not solved)
3. Help Docs → Detailed guides
      ↓ (if not solved)
4. Search → Full-text search across docs
      ↓ (if not solved)
5. Contact Form → Human support
```

### Contact Form

**Minimum fields:**
```
- Email (required)
- Subject (dropdown: Bug, Feature Request, Billing, Other)
- Message (required)
- Attachments (optional)
```

**Smart form:**
```
1. User types question
2. Show relevant FAQ/docs before submit
3. "Did this help?" 
   - Yes → Done
   - No → Show form
```

### Support Ticket Categories

| Category | Priority | Response Target |
|----------|----------|-----------------|
| Can't access account | High | 4 hours |
| Billing issue | High | 4 hours |
| Bug report | Medium | 24 hours |
| Feature request | Low | 48 hours |
| General question | Low | 48 hours |

---

## Canned Responses

### Acknowledgment

```
Hi [Name],

Thanks for reaching out! I've received your message and 
will get back to you within [timeframe].

In the meantime, you might find these helpful:
- [Relevant doc 1]
- [Relevant doc 2]

Best,
[Your name]
```

### Feature Request

```
Hi [Name],

Thanks for the suggestion! We're always looking for ways 
to improve.

I've added this to our feature requests list. While I can't 
promise a timeline, we review these regularly.

In the meantime, here's a workaround that might help:
[Workaround if applicable]

Best,
[Your name]
```

### Bug Report

```
Hi [Name],

Thanks for reporting this! I've reproduced the issue and 
our team is looking into it.

I'll update you when we have a fix. In the meantime:
[Workaround if applicable]

Best,
[Your name]
```

### Refund Request

```
Hi [Name],

I've processed your refund. You should see it in your 
account within 5-7 business days.

We're sorry to see you go! If you'd like to share what 
could have been better, we'd love to hear.

Best,
[Your name]
```

---

## Knowledge Base Tools

| Tool | Best For |
|------|----------|
| **Notion** | Simple docs, free |
| **GitBook** | Developer docs |
| **Intercom** | Help + chat |
| **Zendesk** | Full support system |
| **Crisp** | Chat + knowledge base |
| **Plain** | Modern support |

### Self-Hosted Options

```
/app/help/[slug]/page.tsx  - MDX-based help docs
Use: next-mdx-remote or contentlayer
```

---

## Prompt Examples

```
"Create FAQ section with 10 common questions for a SaaS product"

"Write help doc for [feature name] with steps and screenshots"

"Create support email templates for common issues"

"Design in-app onboarding flow for new users"

"Write empty state copy for [feature] with guidance"
```

---

## Review Checklist

- [ ] **FAQ covers basics** - Signup, billing, common features
- [ ] **Answers are direct** - Lead with the answer
- [ ] **Steps are numbered** - Easy to follow
- [ ] **Links work** - Internal and external
- [ ] **Contact is easy** - Clear path to human help
- [ ] **Search works** - If you have docs
- [ ] **Mobile friendly** - Help works on phone
- [ ] **Up to date** - Matches current product
