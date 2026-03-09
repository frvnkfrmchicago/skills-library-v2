---
name: anti-mock-enforcing
description: >
  Scans codebases for mock data, placeholder content, and fake examples that
  could ship to production. Includes grep commands to detect common mock patterns
  (John Doe, lorem ipsum, test@ emails, hardcoded arrays), stage-based policies,
  realistic seed data standards, and the four categories of mock data debt. Use
  when auditing for mock data, before deployment, when reviewing seed files, or
  when user mentions placeholders, fake data, or mock content.
---

# Anti-Mock Enforcing

Ensure no mock data, placeholder content, or fake examples exist in the project
without being explicitly documented. Every displayed value comes from a real
source or is clearly labeled as a placeholder with a replacement timeline.

**Real data or labeled placeholder. No silent fakes.**

---

## STOP — Detect the Project Stage

Before doing any work, determine the project stage. This changes everything.

| Stage | Mock Data Policy |
|-------|-----------------|
| **Pre-Build** | Placeholders allowed but MUST be labeled `[PLACEHOLDER]` |
| **In-Build** | Seed data must be realistic. No "John Doe" or "$99.99" |
| **Production** | Zero mock data. Every value from API, database, or user input |

---

## Mock Data Detection — Scan Commands

Run these commands to find hidden mock data in any codebase:

### General Mock Data Patterns

```bash
grep -rn "John Doe\|Jane Smith\|test@\|example.com\|Lorem ipsum\|placeholder\|TODO.*data\|FIXME.*data\|mock\|dummy" src/
```

### Hardcoded Arrays (Should Be API Calls)

```bash
grep -rn "const.*=.*\[" src/components/ --include="*.tsx" --include="*.ts" | grep -v "import\|export\|type\|interface"
```

### Hardcoded Dollar Amounts

```bash
grep -rn '\$[0-9]' src/components/ --include="*.tsx"
```

### Placeholder Images

```bash
grep -rn "placeholder\.\|picsum\|via\.placeholder\|placehold\.it\|dummyimage" src/ --include="*.tsx" --include="*.ts" --include="*.css"
```

### Test Email Addresses

```bash
grep -rn "test@\|user@example\|foo@bar\|admin@test" src/ --include="*.tsx" --include="*.ts"
```

---

## The Four Categories of Mock Data Debt

### 1. Fake Users

```
WRONG seed data:
├── "John Doe" / "Jane Smith" / "Test User"
├── "test@email.com" / "user@example.com"
├── All users have the same avatar
└── All users created at the same timestamp

RIGHT seed data:
├── Culturally diverse names: "Amara Okafor", "Kenji Tanaka", "Sofia Reyes"
├── Real-format emails: "amara.okafor@gmail.com", "kenji.t@outlook.jp"
├── Varied avatars (UI Avatars API or DiceBear)
└── Staggered creation dates over realistic timeframes
```

### 2. Fake Transactions / Amounts

```
WRONG seed data:
├── $99.99, $49.99, $199.99 (round numbers only)
├── All transactions on the same date
├── Same amount for every transaction
└── No failed transactions in sample data

RIGHT seed data:
├── $127.43, $8.50, $2,341.00 (realistic variety)
├── Spread across weeks/months with patterns
├── Mix of amounts reflecting real user behavior
├── Include declined cards, refunds, partial payments
```

### 3. Fake Content / Messages

```
WRONG seed data:
├── "Lorem ipsum dolor sit amet..."
├── "This is a test message"
├── Same message repeated
├── All messages sent at the same time

RIGHT seed data:
├── Realistic conversation patterns with varied lengths
├── Messages that reference actual feature context
├── Mix of short and long messages
├── Timestamps showing realistic flow (gaps, bursts)
```

### 4. Fake UI State

```
WRONG: Only showing "happy state" (data loaded, everything works)
├── No loading state
├── No error state
├── No empty state
├── No partial data state

RIGHT: Every state designed with real-data representation
├── Loading skeleton that matches content shape
├── Error state with specific message and recovery action
├── Empty state with clear CTA ("No messages yet. Start a conversation.")
├── Partial data (name but no avatar, 3 items out of 100)
```

---

## Realistic Seed Data Standards

### Names
- Use culturally diverse names reflecting your user base
- Include varied lengths (first name only, hyphenated, accented characters)
- Include at least one name with non-ASCII characters to test encoding

### Amounts
- Never use round numbers exclusively ($10, $50, $100)
- Include cents ($127.43, not $127.00)
- Include range from small to large
- Include edge cases: $0.00 (free), negative (refunds), very large

### Dates
- Spread across realistic timeframes (not all today)
- Include weekends and weekdays
- Include different times of day
- Account for timezone differences

### Content
- Vary text lengths (not all same character count)
- Include edge cases: very short (1 word), very long (200+ words)
- Include special characters, emoji, and line breaks

---

## Mock Data Review Gate

Before marking any feature complete, answer:

1. Does any component contain hardcoded data that should come from an API?
2. Are there seed/sample files that could accidentally ship to production?
3. Does the empty state show real copy or placeholder text?
4. Does the loading state match the shape of real content?
5. Are error messages specific to real failure modes?

**If "yes" to 1-2, or "no" to 3-5, the feature is not complete.**

---

## ⛔ STOP GATE

DO NOT mark any deployment as ready without:
1. Running ALL grep scan commands above against the codebase
2. Showing the grep output as evidence
3. Confirming zero instances of "John Doe", "Lorem ipsum", "test@", or "example.com"
4. Verifying all hardcoded arrays are intentional constants (not data that should be API calls)
5. Confirming empty states have real copy, not placeholder text
