# App Store & Play Store Compliance

## Apple App Store (2025/2026)

### Current Requirements

| Requirement | Details | Effective |
|---|---|---|
| **Xcode 26 + latest SDK** | All submissions must use Xcode 26 | April 2026 |
| **AI data sharing disclosure** | Disclose third-party AI data sharing, get consent | Nov 2025 |
| **Privacy labels** | Accurately describe all data collection | Ongoing |
| **44px tap targets** | Apple HIG mandates 44×44pt minimum | Ongoing |
| **Age-rated content** | Verify/declare age for content exceeding rating | Nov 2025 |
| **No copycat apps** | No unauthorized brand/icon use | Nov 2025 |

### Top Rejection Reasons

```
1. Privacy violations (40%)
   ├── Missing/unclear privacy policy
   ├── Collecting data without permission
   └── Not explaining data usage

2. Incomplete information (25%)
   ├── Placeholder content or broken links
   ├── Inaccurate description
   └── Missing demo credentials

3. Crashes and bugs (20%)

4. Design guideline violations (15%)
```

### Submission Checklist

- [ ] Privacy policy URL live, public, linked in app
- [ ] All data collection disclosed in privacy labels
- [ ] AI features disclose third-party data sharing
- [ ] Demo account provided for App Review
- [ ] No placeholder content
- [ ] App handles no-network gracefully
- [ ] All tap targets ≥ 44×44pt
- [ ] Current SDK and Xcode version
- [ ] No mentions of other platforms in screenshots
- [ ] Screenshots show current app, not mockups

---

## Google Play Store (2025/2026)

### Current Requirements

| Requirement | Details | Effective |
|---|---|---|
| **Target API 35** | Apps must target Android 15+ | Aug 2025 |
| **Developer verification** | All devs verify identity | Sep 2026 |
| **Data Safety form** | Complete in Play Console | Ongoing |
| **Privacy policy** | Public URL (not PDF), linked in app | Ongoing |
| **Scoped Storage** | Use app-specific dirs or MediaStore | 2025 |
| **Financial declaration** | ALL apps must complete | Oct 2025 |

### Data Safety Form

Disclose:
- Types of data collected (and purpose)
- Whether shared with third parties
- Security practices (encryption, deletion)
- Whether app follows Families Policy

---

## Privacy Compliance

### Regulatory Frameworks

| Framework | Region | Key Requirements | Penalties |
|---|---|---|---|
| GDPR | EU/EEA | Consent, deletion, portability | €20M or 4% revenue |
| CCPA/CPRA | California | Know, delete, opt-out | $2,500-$7,500 per violation |
| COPPA | US (children) | Parental consent | $50,120 per violation |

### Apple ATT (App Tracking Transparency)

Required since iOS 14.5. Must request permission before tracking.

**Tracking = linking user data with third-party data for ads.**
**NOT tracking = first-party analytics, fraud detection.**

### Privacy Nutrition Labels

Both Apple and Google require disclosure of all data practices in a
standardized "nutrition label" format in their respective consoles.

### Implementation Checklist

- [ ] Privacy policy hosted on live public URL
- [ ] Privacy policy linked from within app
- [ ] ATT prompt implemented (iOS) with clear purpose string
- [ ] Google Data Safety form completed accurately
- [ ] Apple Privacy Labels completed accurately
- [ ] Consent mechanism for data collection (opt-in)
- [ ] Data deletion endpoint available to users
- [ ] Data encrypted in transit (HTTPS) and at rest (AES-256)
- [ ] Minimum permissions requested
- [ ] Third-party SDKs audited for data collection
- [ ] GDPR consent banner for EU users
