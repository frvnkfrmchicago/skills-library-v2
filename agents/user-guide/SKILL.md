---
name: user-guide
description: Create end-user documentation. Guides, FAQs, onboarding, tutorials.
last_updated: 2026-03
owner: Frank
---

# User Guide Creation

Help users help themselves. Less support tickets. Happier users.

> **See also:** `agents/documentation/SKILL.md`, `content/copy/SKILL.md`

---

## Context Questions

Before creating user docs:

1. **Who's the audience?** — End users, admins, developers
2. **What's the experience level?** — Beginners, power users, mixed
3. **What format works best?** — Text, video, in-app, all
4. **What's the product stage?** — Pre-launch, live, mature
5. **What's the maintenance plan?** — One-time, per release, continuous

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Audience** | Tech-savvy ←→ Non-technical |
| **Format** | Text only ←→ Rich media |
| **Depth** | Quick start ←→ Comprehensive |
| **Location** | External docs ←→ In-app guidance |
| **Maintenance** | Static ←→ Living document |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| New product launch | Getting Started guide first |
| High support tickets | FAQ from actual questions |
| Complex features | Video tutorials + step-by-step |
| SaaS product | In-app tooltips + onboarding tours |
| Developer audience | Code examples + API reference |
| Frequent updates | Release notes process + changelog |

---

## TL;DR

| Doc Type | Purpose | When |
|----------|---------|------|
| **Getting Started** | First-time setup | Day 1 |
| **User Guide** | Core features | Ongoing |
| **FAQ** | Common questions | After launch |
| **Tutorial** | Step-by-step walkthroughs | Complex features |
| **Release Notes** | What's new | Each release |

---

## 1. Getting Started Guide

First thing users see. Make it dead simple.

### Structure

```markdown
# Getting Started with [Product]

## 1. Create Your Account
[Screenshot of signup]
Click "Sign Up" and enter your email...

## 2. Complete Setup (2 minutes)
[Screenshot of onboarding]
1. Choose your workspace name
2. Invite team members (optional)
3. Connect integrations

## 3. Your First [Core Action]
Let's create your first [project/document/etc.]...

## Next Steps
- [Feature Guide 1]
- [Feature Guide 2]
- [FAQ]
```

### Checklist

- [ ] Under 5 minutes to complete
- [ ] Screenshots at each step
- [ ] Clear call-to-action at end
- [ ] No jargon or technical terms
- [ ] Mobile-friendly instructions (if applicable)

---

## 2. Feature Guides

One page per major feature.

### Template

```markdown
# [Feature Name]

> One sentence: what this does and why you'd use it.

## Quick Start
[Fastest path to using this feature]

## How It Works
[Explanation with visuals]

## Common Use Cases
- **[Use case 1]:** [How to do it]
- **[Use case 2]:** [How to do it]

## Settings & Options
| Setting | What it does | Default |
|---------|--------------|---------|
| Option A | Description | On |
| Option B | Description | Off |

## Tips
- Pro tip 1
- Pro tip 2

## Troubleshooting
**Issue:** [Common problem]
**Fix:** [Solution]

## Related
- [Related Feature 1]
- [Related Feature 2]
```

---

## 3. FAQ

Answer before they ask.

### Structure

```markdown
# Frequently Asked Questions

## Getting Started
<details>
<summary>How do I create an account?</summary>

Click "Sign Up" on the homepage...

</details>

<details>
<summary>Do you offer a free trial?</summary>

Yes! 14-day free trial, no credit card required.

</details>

## Billing
<details>
<summary>How do I cancel my subscription?</summary>

Go to Settings > Billing > Cancel subscription...

</details>

## Technical
<details>
<summary>Which browsers are supported?</summary>

Chrome, Firefox, Safari, Edge (latest versions).

</details>
```

### FAQ Best Practices

| Do | Don't |
|----|-------|
| Use actual user questions | Make up theoretical questions |
| Link to detailed guides | Write essays in FAQ |
| Update regularly | Let it go stale |
| Include search | Bury in long lists |

---

## 4. Video Tutorials

When text isn't enough.

### When to Use Video

- Complex multi-step processes
- UI-heavy workflows
- "Show don't tell" moments
- Onboarding new users

### Video Structure

```
0:00 - Hook (what you'll learn)
0:15 - Quick overview
0:30 - Step-by-step walkthrough
2:30 - Recap key points
2:45 - CTA (what to do next)
```

### Recommended Tools

| Tool | Best For | Notes |
|------|----------|-------|
| Loom | Quick walkthroughs | Free tier available |
| Tella | Polished tutorials | Beautiful templates |
| Screen Studio | Mac, pro quality | One-time purchase |
| Vimeo | Hosting | Ad-free embed |

---

## 5. In-App Guidance

Help where they need it.

### Patterns

| Pattern | When | Tool |
|---------|------|------|
| **Tooltips** | First-time feature view | Native, Shepherd.js |
| **Onboarding tour** | Account creation | Intro.js, Shepherd.js |
| **Contextual help** | Complex screens | ? icons, sidebars |
| **Empty states** | No data yet | Built-in content |
| **Inline hints** | Form fields | Placeholder text |

### Example: Empty State

```tsx
// Good empty state
<EmptyState
  icon={<DocumentIcon />}
  title="No documents yet"
  description="Create your first document to get started."
  action={
    <Button onClick={createDoc}>
      Create Document
    </Button>
  }
  helpLink="/docs/getting-started"
/>
```

---

## 6. Release Notes

Keep users informed.

### Template

```markdown
# What's New — [Month Year]

## 🚀 New Features

### [Feature Name]
[Screenshot or GIF]

You can now [what it does]. Perfect for [use case].

[Learn more →](/docs/feature)

## ⚡ Improvements

- **Faster loading:** Dashboard loads 40% faster
- **Better search:** Results now include [X]

## 🐛 Bug Fixes

- Fixed issue where [specific bug]
- Resolved [another bug]

## 🗓️ Coming Soon

Here's what we're working on next...
```

### Distribution

| Channel | Format | Frequency |
|---------|--------|-----------|
| In-app banner | Brief | Each release |
| Email | Summary | Monthly/Major |
| Changelog page | Full | Each release |
| Social | Highlights | Major only |

---

## 7. Writing Style

### Voice Guidelines

| Do | Don't |
|----|-------|
| "Click the Settings icon" | "Navigate to Settings" |
| "You" and "your" | "The user" |
| Short sentences | Long paragraphs |
| Active voice | Passive voice |
| Specific actions | Vague instructions |

### Examples

```
❌ Bad:
"The settings panel can be accessed by clicking on the gear 
icon located in the upper right corner of the interface."

✅ Good:
"Click the ⚙️ gear icon (top right)."
```

```
❌ Bad:
"It is recommended that users familiarize themselves with 
the documentation prior to beginning the setup process."

✅ Good:
"Before you start, check out the Getting Started guide."
```

---

## 8. Content Organization

### Site Structure

```
docs/
├── getting-started/
│   ├── index.md           # Overview
│   ├── account-setup.md   # Create account
│   └── first-project.md   # First action
├── features/
│   ├── feature-a.md
│   ├── feature-b.md
│   └── feature-c.md
├── guides/
│   ├── use-case-1.md      # Workflow guides
│   └── use-case-2.md
├── faq.md
├── troubleshooting.md
└── release-notes/
    └── 2026-01.md
```

### Navigation

```
Sidebar:
- Getting Started ⭐
  - Account Setup
  - Your First Project
- Features
  - [Feature A]
  - [Feature B]
- Guides
  - [Use Case 1]
  - [Use Case 2]
- FAQ
- Troubleshooting
- What's New
```

---

## 9. Doc Tools

| Tool | Best For | Pricing |
|------|----------|---------|
| **Notion** | Internal docs, simple sites | Free - $10/mo |
| **GitBook** | Developer docs | Free - $8/mo |
| **Docusaurus** | Open source, technical | Free |
| **Intercom Articles** | Support integration | Part of Intercom |
| **ReadMe** | API + user docs | Free - $99/mo |
| **Mintlify** | Modern, beautiful | Free - $150/mo |

---

## 10. Maintenance

### Review Cycle

| Frequency | Task |
|-----------|------|
| **Weekly** | Check support tickets for new FAQ items |
| **Each release** | Update affected docs |
| **Monthly** | Review analytics, update low-rated pages |
| **Quarterly** | Full audit, remove outdated content |

### Metrics to Track

| Metric | Goal |
|--------|------|
| Search with no results | Identify gaps |
| Most viewed pages | Prioritize updates |
| Time on page | Engagement |
| Support ticket volume | Measure impact |
| Page ratings (thumbs up/down) | Quality check |

---

## Checklist

- [ ] Getting Started guide created
- [ ] Core feature guides written
- [ ] FAQ seeded with real questions
- [ ] Screenshots are current/branded
- [ ] Search works
- [ ] Mobile-friendly
- [ ] Release notes process defined
- [ ] Review cycle scheduled

---

## Related Skills

- [Documentation](/agents/documentation/SKILL.md) — Technical/code docs
- [Content Support](/content/support/SKILL.md) — Support content
- [Copywriting](/content/copy/SKILL.md) — Writing principles
- [Onboarding](/agents/onboarding/SKILL.md) — In-app flows
