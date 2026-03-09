---
name: business-operations
description: Business operations for SaaS. Licensing, tax, compliance, legal boilerplate.
last_updated: 2026-03
owner: Frank
---

# Business Operations

The boring stuff that keeps you out of trouble.

> **See also:** `workflows/monetization/SKILL.md`, `agents/stripe/SKILL.md`

---

## Context Questions

Before dealing with business ops, ask:

1. **What's the business stage?** — Pre-launch, launched, scaling
2. **Where are customers?** — US only, international, EU
3. **What's the revenue level?** — <$10K, $10-50K, $50K+
4. **Who's the customer?** — B2C, B2B, enterprise
5. **What compliance is needed?** — Basic, SOC 2, HIPAA

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Stage** | Pre-revenue ←→ Enterprise-ready |
| **Geography** | US only ←→ Global |
| **Compliance** | Basic ←→ SOC 2/HIPAA |
| **Legal** | Templates ←→ Lawyer-reviewed |
| **Tax** | Simple ←→ Multi-jurisdiction |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Just launching | ToS + Privacy Policy, Stripe Tax on |
| Selling to EU | GDPR compliance + cookie consent |
| Over $50K revenue | Get proper tax/legal advice |
| Enterprise customers | SOC 2 roadmap + DPA ready |
| International sales | VAT/GST registration checks |
| Open source product | Dual licensing strategy |

---

## TL;DR

| Topic | Key Points |
|-------|------------|
| **Licensing** | MIT for OSS, proprietary for SaaS |
| **Tax** | Stripe Tax, nexus tracking, VAT/GST |
| **Compliance** | SOC 2, GDPR, CCPA basics |
| **Legal** | ToS, Privacy Policy, DPA templates |

---

## Part 1: Licensing Models

### Open Source Licenses

| License | Permissive | Copyleft | Commercial Use |
|---------|------------|----------|----------------|
| **MIT** | ✅ Very | ❌ | ✅ |
| **Apache 2.0** | ✅ | ❌ | ✅ Patent protection |
| **BSD 3-Clause** | ✅ | ❌ | ✅ |
| **GPL v3** | ⚠️ | ✅ Strong | ✅ But derivatives must be GPL |
| **LGPL** | ⚠️ | ✅ Weak | ✅ For libraries |
| **AGPL** | ⚠️ | ✅ Network | ✅ SaaS must share source |

### MIT (Recommended for OSS)

```markdown
MIT License

Copyright (c) [year] [fullname]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### SaaS Terms (Proprietary)

```markdown
## Key Clauses for SaaS

1. **License Grant**
   - Right to access and use the service
   - Not a perpetual license, subscription-based
   - No ownership transfer

2. **Restrictions**
   - No reverse engineering
   - No reselling without permission
   - No scraping or automated access
   - No competitive use

3. **Data Rights**
   - Customer owns their data
   - Service provider has usage rights for operation
   - Data retention on termination

4. **Liability**
   - Cap at fees paid (12 months typical)
   - No consequential damages
   - SLA exclusions
```

### Pricing Models

| Model | Best For | Example |
|-------|----------|---------|
| **Per-seat** | Team collaboration tools | Slack, Notion |
| **Usage-based** | API, infrastructure | AWS, Stripe |
| **Flat-rate** | Simple products | Netflix |
| **Freemium** | Consumer + viral growth | Spotify |
| **Tiered** | Most SaaS | Most SaaS |
| **Pay-once** | Tools, utilities | One-time license |

### Dual Licensing

```markdown
## Strategy
1. Open source under AGPL (copyleft)
2. Commercial license for proprietary use
3. Enterprise features as paid add-ons

## Examples
- MongoDB (SSPL + Commercial)
- Elasticsearch (SSPL)
- Qt (LGPL + Commercial)

## When to Use
- Infrastructure/database products
- Want open source adoption + commercial revenue
- Enterprise customers need IP clarity
```

---

## Part 2: Tax Basics

### SaaS Tax Nexus (US)

```markdown
## What Creates Nexus
- Physical presence (office, employees)
- Economic nexus (revenue threshold)
- Remote employees in state
- Affiliate relationships

## Economic Nexus Thresholds (Common)
- $100,000 in sales OR
- 200+ transactions
- Varies by state — track carefully
```

### Stripe Tax Setup

```typescript
// Stripe Tax integration
const checkout = await stripe.checkout.sessions.create({
  line_items: [{
    price: 'price_xxx',
    quantity: 1,
  }],
  mode: 'subscription',
  automatic_tax: { enabled: true },  // Enable Stripe Tax
  customer_update: {
    address: 'auto',  // Capture for tax calculation
  },
});

// Registration setup in Dashboard
// Stripe Dashboard → Tax → Registrations
// Add each state/country where registered
```

### International VAT/GST

| Region | Rate | Threshold | Notes |
|--------|------|-----------|-------|
| **EU** | 19-27% | €10,000 (OSS) | VAT OSS for single registration |
| **UK** | 20% | £85,000 | Post-Brexit separate |
| **Australia** | 10% GST | AUD $75,000 | Register over threshold |
| **Canada** | 5-15% | CAD $30,000 | GST + provincial |
| **Japan** | 10% | JPY ¥10M | JCT registration |

### When to Get Help

```markdown
## Get a Tax Professional When:
- Revenue > $50,000/year
- Selling to multiple countries
- Unsure about nexus
- First sales tax registration
- Audit notification
- Employee in new jurisdiction

## Service Recommendations
- Pilot (bookkeeping + tax for startups)
- Avalara (tax compliance software)
- Stripe Tax (built-in)
- Local CPA for state nexus
```

---

## Part 3: Compliance

### SOC 2 Readiness

```markdown
## Trust Service Criteria
1. **Security** — Protect against unauthorized access
2. **Availability** — System available per SLA
3. **Processing Integrity** — Data processed correctly
4. **Confidentiality** — Data protected
5. **Privacy** — PII handled per policy

## Minimum Controls for Type 1
- Access control (who can access what)
- Encryption at rest and in transit
- Logging and monitoring
- Incident response plan
- Security awareness training
- Vendor management
- Change management process
- Background checks

## Timeline
- 6-12 months preparation
- Type 1: Point-in-time (faster)
- Type 2: Period review (6+ months observation)
```

### GDPR Requirements

```markdown
## Core Requirements
1. **Legal Basis** — Consent or legitimate interest
2. **Data Minimization** — Only collect what you need
3. **Purpose Limitation** — Use data only for stated purpose
4. **Rights** — Access, rectification, erasure, portability
5. **Breach Notification** — 72 hours to authority
6. **DPO** — Required if processing at scale

## User Rights to Implement
- Right to access (export data)
- Right to rectification (edit profile)
- Right to erasure (delete account)
- Right to restrict processing
- Right to data portability (JSON export)
- Right to object

## Implementation
// Account settings page
<PrivacySettings>
  <DownloadDataButton /> // Right to access
  <DeleteAccountButton /> // Right to erasure
  <MarketingOptOut />     // Right to object
  <CookiePreferences />   // Consent management
</PrivacySettings>
```

### CCPA/CPRA Requirements

```markdown
## California Consumer Privacy Act
- Applies if: $25M revenue OR 100K consumers OR 50% revenue from data

## Requirements
1. "Do Not Sell My Personal Information" link
2. Privacy policy updates
3. Consumer request handling (45 days)
4. Non-discrimination
5. Sensitive data consent

## Footer Link Required
<footer>
  <a href="/privacy">Privacy Policy</a>
  <a href="/do-not-sell">Do Not Sell My Personal Information</a>
</footer>
```

### Cookie Consent

```typescript
// Cookie consent banner
const CookieBanner = () => {
  const { consent, setConsent } = useCookieConsent();
  
  if (consent !== null) return null;
  
  return (
    <Banner position="bottom">
      <p>We use cookies for analytics and personalization.</p>
      <div>
        <Button onClick={() => setConsent('essential')}>
          Essential Only
        </Button>
        <Button onClick={() => setConsent('all')}>
          Accept All
        </Button>
        <Link href="/cookies">Manage Preferences</Link>
      </div>
    </Banner>
  );
};

// Conditional script loading
{cookieConsent === 'all' && (
  <>
    <GoogleAnalytics />
    <Intercom />
    <HotJar />
  </>
)}
```

### Data Residency

```markdown
## Requirements by Region
- **EU** — Strong preference for EU hosting
- **Germany** — Often requires German hosting
- **Australia** — Government data must stay
- **China** — Complex regulations, local partner needed

## Implementation
1. Choose region-aware hosting (Vercel, AWS)
2. Database regions (Supabase, PlanetScale)
3. Edge compute for latency
4. Document data flows
```

---

## Part 4: Legal Boilerplate

### Terms of Service Template

```markdown
# Terms of Service

Last updated: [Date]

## 1. Acceptance of Terms
By accessing [Service], you agree to these Terms.

## 2. Description of Service
[Service] provides [description].

## 3. User Accounts
- You must provide accurate information
- You are responsible for account security
- One account per person
- Age 13+ (16+ for EU GDPR)

## 4. Acceptable Use
You agree not to:
- Violate laws
- Infringe intellectual property
- Transmit malware
- Abuse or harass others
- Scrape or reverse engineer

## 5. Payment Terms
- Prices in USD unless stated
- Subscriptions renew automatically
- Cancel anytime, access until period ends
- Refunds per our Refund Policy

## 6. Intellectual Property
- We own the Service and its content
- You own your data
- You grant us license to display your content

## 7. Privacy
Your use is also governed by our Privacy Policy.

## 8. Disclaimers
THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES.

## 9. Limitation of Liability
Our liability is limited to fees paid in last 12 months.

## 10. Termination
We may terminate accounts violating these Terms.

## 11. Changes to Terms
We may update Terms with 30 days notice.

## 12. Governing Law
[State/Country] law applies.

## 13. Contact
[support@yourcompany.com]
```

### Privacy Policy Template

```markdown
# Privacy Policy

Last updated: [Date]

## Information We Collect
- Account info (email, name)
- Usage data (pages visited, features used)
- Technical data (IP, browser, device)

## How We Use Information
- Provide and improve service
- Send service communications
- Marketing (with consent)
- Analytics

## Information Sharing
We do not sell data. We share with:
- Service providers (hosting, analytics)
- Legal requirements
- Business transfers

## Your Rights
- Access your data
- Correct inaccuracies
- Delete your account
- Export your data
- Opt-out of marketing

## Data Retention
We keep data while your account is active.
Deleted data removed within 30 days.

## Security
We use encryption, access controls, and monitoring.

## Children's Privacy
Service not intended for under 13 (16 in EU).

## Changes
We'll notify you of material changes.

## Contact
[privacy@yourcompany.com]
For EU: [dpo@yourcompany.com]
```

### DPA Template

```markdown
# Data Processing Agreement

Between:
Customer ("Controller")
[Company] ("Processor")

## 1. Definitions
Personal Data, Processing, Sub-processor as per GDPR.

## 2. Processing Instructions
Processor acts only on Controller's documented instructions.

## 3. Confidentiality
Processor ensures personnel are bound by confidentiality.

## 4. Security
Processor implements appropriate technical and organizational measures.

## 5. Sub-processors
Current sub-processors listed in Annex.
30 days notice for changes.

## 6. Data Subject Rights
Processor assists Controller in responding to requests.

## 7. Breach Notification
Notify without undue delay (within 48 hours).

## 8. Return of Data
Upon termination, return or delete data per Controller's choice.

## 9. Audits
Controller may audit with reasonable notice.

## Annex A: Sub-processors
- AWS (hosting)
- Stripe (payments)
- Vercel (hosting)
- [List all]
```

### Refund Policy

```markdown
# Refund Policy

## Subscriptions
- Cancel anytime, no refund for current period
- Access continues until period ends
- Annual plans: Pro-rated refund within 14 days

## One-time Purchases
- 30-day money-back guarantee
- Refund processed within 5-7 business days

## Exceptions
- Abuse of refund policy
- Excessive usage before refund request
- Enterprise custom contracts

## How to Request
Email [support@company.com] with order details.
```

### DMCA Safe Harbor

```markdown
## DMCA Notice Procedure

### How to Submit a Takedown
Send to: [dmca@company.com]

Include:
1. Signature (electronic OK)
2. Description of copyrighted work
3. Location of infringing material (URL)
4. Your contact information
5. Good faith statement
6. Statement of accuracy under penalty of perjury

### Counter-Notice
If you believe removal was in error:
1. Send counter-notice to same address
2. Include statement of good faith belief
3. Consent to jurisdiction
4. Your contact information

### Repeat Infringer Policy
We terminate accounts of repeat infringers.
```

---

## Checklist

### Launching SaaS

- [ ] Terms of Service published
- [ ] Privacy Policy published
- [ ] Cookie banner (if EU users)
- [ ] CCPA link (if CA users)
- [ ] Stripe Tax enabled
- [ ] Basic security in place
- [ ] Data export feature
- [ ] Account deletion feature

### Scaling (Post-PMF)

- [ ] SOC 2 Type 1 roadmap
- [ ] DPA available for enterprise
- [ ] Tax registrations where needed
- [ ] Legal review of terms
- [ ] Refund policy documented
- [ ] DMCA procedure if UGC

---

## Resources

- [Stripe Atlas Guides](https://stripe.com/atlas/guides)
- [Terms of Service Generator](https://termsofservice.com/)
- [SOC 2 Compliance Guide](https://www.vanta.com/guide/soc-2)
- [GDPR Checklist](https://gdpr.eu/checklist/)

---

## Related Skills

- `stripe/SKILL.md` — Payment integration
- `analytics/SKILL.md` — GDPR-compliant tracking
- `documentation/SKILL.md` — Policy publishing
