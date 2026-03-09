---
name: legal
description: Privacy policies, terms of service, and legal agreements for apps.
last_updated: 2026-03
---

# Legal Documents

Privacy, terms, and agreements.

---

## Context Questions

Before generating legal documents, ask:

1. **What type of product/service?** — SaaS, mobile app, e-commerce, marketplace, content platform
2. **What data are you collecting?** — Personal info, payment data, usage analytics, none
3. **Where are your users?** — US only, EU (GDPR), California (CCPA), global
4. **What's your business model?** — Free, subscription, one-time purchase, freemium
5. **Do users create content?** — User-generated content, uploads, comments, none

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| Jurisdiction | Single region ←→ Global compliance |
| Data Handling | Minimal collection ←→ Extensive tracking |
| User Content | No UGC ←→ Full UGC platform |
| Liability | Simple disclaimer ←→ Comprehensive indemnification |
| Formality | Startup-friendly ←→ Enterprise-grade |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| SaaS + EU users | GDPR sections required, DPA, legal basis for processing |
| E-commerce + payments | Refund policy essential, payment terms, PCI reference |
| UGC platform + global | Extensive ToS, content policies, DMCA, moderation rights |
| Simple app + US only | Basic privacy + terms, CCPA if California users |
| B2B enterprise | DPA, SLA, data processing addendum, security commitments |

---

## TL;DR

| Document | When You Need It |
|----------|-----------------|
| **Privacy Policy** | Collecting ANY user data |
| **Terms of Service** | Users create accounts or use your service |
| **Cookie Policy** | Using cookies or tracking |
| **Refund Policy** | Selling anything |
| **Acceptable Use** | User-generated content |

---

## IMPORTANT DISCLAIMER

⚠️ **This is NOT legal advice.**

These templates are starting points. For production apps:
- Have a lawyer review your policies
- Consider using services like Termly, Iubenda, or TermsFeed
- Laws vary by jurisdiction (GDPR, CCPA, etc.)

---

## Privacy Policy

### What to Include

| Section | What It Covers |
|---------|----------------|
| **What we collect** | Data types you gather |
| **How we use it** | Purpose of collection |
| **How we share it** | Third parties, if any |
| **How we protect it** | Security measures |
| **Your rights** | Access, delete, opt-out |
| **Contact** | How to reach you |

### Template Structure

```markdown
# Privacy Policy

Last updated: [DATE]

## Overview
[COMPANY] ("we", "us", "our") operates [PRODUCT]. This policy 
explains how we collect, use, and protect your information.

## Information We Collect

### Information you provide
- Account information (email, name)
- Payment information (processed by Stripe)
- Content you create

### Information collected automatically
- Usage data (pages visited, features used)
- Device information (browser, OS)
- IP address

## How We Use Your Information
- To provide and improve our service
- To process payments
- To communicate with you
- To ensure security

## How We Share Your Information
We do not sell your data. We share with:
- Payment processors (Stripe)
- Analytics providers (if applicable)
- As required by law

## Data Security
We use industry-standard security measures including 
encryption in transit and at rest.

## Your Rights
You can:
- Access your data
- Request deletion
- Opt out of marketing
- Export your data

## Data Retention
We retain your data while your account is active. 
Upon deletion request, data is removed within 30 days.

## Children's Privacy
Our service is not intended for users under 13.

## Changes to This Policy
We will notify you of significant changes via email.

## Contact Us
[EMAIL]
[ADDRESS if applicable]
```

### GDPR Additions (EU Users)

```markdown
## For EU Users (GDPR)

### Legal Basis for Processing
- Contractual necessity (providing the service)
- Legitimate interests (improving the product)
- Consent (marketing communications)

### Data Transfers
Your data may be transferred to the US. We use 
Standard Contractual Clauses to protect your data.

### Data Protection Officer
Contact: [DPO EMAIL]

### Supervisory Authority
You have the right to lodge a complaint with your 
local data protection authority.
```

### CCPA Additions (California Users)

```markdown
## For California Users (CCPA)

You have the right to:
- Know what personal information we collect
- Request deletion of your information
- Opt out of sale of personal information (we do not sell)
- Non-discrimination for exercising your rights

To exercise these rights, contact [EMAIL].
```

---

## Terms of Service

### Template Structure

```markdown
# Terms of Service

Last updated: [DATE]

## Agreement to Terms
By using [PRODUCT], you agree to these terms. If you 
don't agree, don't use the service.

## Description of Service
[PRODUCT] is [DESCRIPTION]. We reserve the right to 
modify or discontinue the service at any time.

## User Accounts
- You must provide accurate information
- You are responsible for your account security
- You must be 13+ to use this service
- One account per person

## Acceptable Use
You agree not to:
- Violate any laws
- Infringe on others' rights
- Upload malicious content
- Attempt to access others' accounts
- Use the service to spam or harass

## Payment Terms
- Prices are in USD unless otherwise stated
- Subscriptions renew automatically
- You can cancel anytime
- Refunds per our refund policy

## Intellectual Property
- We own the service and its content
- You retain ownership of your content
- You grant us license to use your content to provide the service

## User Content
- You are responsible for your content
- We may remove content that violates these terms
- We do not claim ownership of your content

## Termination
We may terminate your account if you violate these terms.
You may terminate your account at any time.

## Disclaimers
THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES 
OF ANY KIND.

## Limitation of Liability
TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE ARE NOT 
LIABLE FOR INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES.

## Indemnification
You agree to indemnify us against claims arising from 
your use of the service or violation of these terms.

## Governing Law
These terms are governed by the laws of [STATE/COUNTRY].

## Changes to Terms
We may update these terms. Continued use constitutes 
acceptance of changes.

## Contact
[EMAIL]
```

---

## Refund Policy

### Template

```markdown
# Refund Policy

## One-Time Purchases
- Refunds available within 14 days of purchase
- Product must not be substantially used
- Contact [EMAIL] for refund requests

## Subscriptions
- Cancel anytime, access continues until period ends
- No partial refunds for unused time
- Refunds for billing errors processed within 5-7 days

## How to Request a Refund
Email [EMAIL] with:
- Your account email
- Purchase date
- Reason for refund

We process refunds within 5-7 business days.
```

---

## Cookie Policy

### Template

```markdown
# Cookie Policy

## What Are Cookies
Cookies are small files stored on your device that help 
us improve your experience.

## Cookies We Use

### Essential Cookies
Required for the service to function. Cannot be disabled.
- Authentication
- Security
- Preferences

### Analytics Cookies
Help us understand how you use the service.
- Page views
- Feature usage
- Performance metrics

### Marketing Cookies
Used to show relevant content (if applicable).

## Managing Cookies
You can control cookies through your browser settings.
Note that disabling essential cookies may break the service.

## Third-Party Cookies
We use:
- [Analytics Provider] for usage analytics
- [Payment Provider] for secure payments

## Contact
Questions? Contact [EMAIL].
```

---

## SaaS Specific Clauses

### Service Level Agreement (SLA)

```markdown
## Service Level

### Uptime Commitment
We target 99.9% uptime, excluding scheduled maintenance.

### Scheduled Maintenance
Announced 24 hours in advance via email.

### Support Response Times
- Critical issues: 4 hours
- Standard issues: 24 hours
- Questions: 48 hours
```

### Data Processing Agreement (DPA)

For B2B SaaS handling customer data:

```markdown
## Data Processing

### Roles
- You are the Data Controller
- We are the Data Processor

### Processing Purpose
We process data only as necessary to provide the service.

### Sub-processors
Current sub-processors:
- AWS (hosting)
- Stripe (payments)
- [Others]

### Security Measures
- Encryption at rest and in transit
- Access controls
- Regular security audits
```

---

## Where to Put Legal Pages

```
/app
  /privacy/page.tsx      # Privacy Policy
  /terms/page.tsx        # Terms of Service
  /cookies/page.tsx      # Cookie Policy (if needed)
  /refunds/page.tsx      # Refund Policy (if selling)
```

### Footer Links

```tsx
<footer>
  <a href="/privacy">Privacy</a>
  <a href="/terms">Terms</a>
  <a href="/cookies">Cookies</a>
</footer>
```

---

## Prompt Examples

```
"Create a privacy policy for a SaaS app that collects 
email, usage data, and processes payments through Stripe"

"Write terms of service for a subscription-based product 
with user-generated content"

"Create a refund policy for a digital product with 
14-day money-back guarantee"

"Add GDPR and CCPA compliance sections to this privacy policy"
```

---

## Review Checklist

- [ ] **Last updated date** - Current and visible
- [ ] **Company info** - Correct name and contact
- [ ] **Data collected** - Accurate and complete
- [ ] **Third parties** - All services listed
- [ ] **User rights** - GDPR/CCPA if applicable
- [ ] **Links work** - Contact emails, etc.
- [ ] **Accessible** - Easy to find in footer
- [ ] **Lawyer reviewed** - For production apps

---

## Services That Generate Legal Docs

| Service | What It Does |
|---------|--------------|
| **Termly** | Privacy, terms, cookie policies |
| **Iubenda** | GDPR-compliant policies |
| **TermsFeed** | Policy generator |
| **Clerk** | Auth + ToS acceptance built-in |

These services auto-update for legal changes and are often better than DIY for production apps.
