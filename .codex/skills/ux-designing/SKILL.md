---
name: ux-designing
description: >
  Designs user experiences including flow mapping, information architecture,
  interaction patterns, accessibility compliance, and usability validation.
  Covers user journey mapping, WCAG compliance, keyboard navigation, screen
  reader support, and edge state design. Use when designing user flows,
  reviewing UX patterns, planning information architecture, checking
  accessibility, or when user mentions UX, user flow, accessibility, or
  usability.
---

# UX Designing Skill

Design for the user, not the screen. Every UX decision must be backed by
user intent, validated with accessibility, and tested for edge cases.

---

## ⛔ STOP GATE — Before Designing

1. Who is the user? (demographics, tech comfort, context of use)
2. What is their primary goal? (job to be done)
3. What platform? (web, iOS, Android, cross-platform)
4. What are the constraints? (performance, accessibility, offline support)

DO NOT begin design without answering these.

---

## User Flow Mapping

### Step 1: Define the Happy Path

Map the ideal user journey from entry to goal completion:

```
Entry → Step 1 → Step 2 → ... → Goal
```

For each step, document:
- **Screen name** and purpose
- **User action** required
- **Data involved** (inputs, API calls)
- **Exit points** (where users might abandon)

### Step 2: Map Edge Cases

For every step in the happy path, ask:
- What if the user goes back?
- What if the network fails?
- What if the input is invalid?
- What if the data is empty?
- What if the user is interrupted and returns later?

### Step 3: Decision Flow

```markdown
## Flow: [Name]

### Happy Path
1. [Screen] → User does [action] → navigates to [next]
2. [Screen] → User does [action] → navigates to [next]
3. [Screen] → Goal achieved → [success state]

### Edge Cases
| Step | Edge Case | Handling |
|------|-----------|----------|
| 1 | Network failure | Show offline banner, cache previous data |
| 2 | Invalid input | Inline validation with specific error message |
| 3 | Empty state | Helpful empty state with CTA |
```

---

## Information Architecture

### Hierarchy Rules

1. **Primary content** → Immediately visible, above the fold
2. **Secondary content** → Visible on scroll or one tap away
3. **Tertiary content** → Accessible via navigation or search
4. **Settings/Admin** → Buried in settings, not in main flow

### Navigation Decision Tree

```
How many primary destinations?
├── 2-5 → Bottom tab bar
├── 6-10 → Bottom bar (4-5) + hamburger for rest
├── Content-focused → Top header + search
└── Complex app → Bottom bar mobile + sidebar desktop
```

### Content Priority Matrix

| Content | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Primary CTA | Full width, prominent | Prominent | Standard |
| Navigation | Bottom tabs | Side tabs | Sidebar |
| Secondary info | Collapsed/hidden | Visible | Visible |
| Help/support | Settings menu | Settings | Footer |

---

## Interaction Patterns

### Feedback for Every Action

Every user action MUST have visible feedback:

| Action | Feedback | Timing |
|--------|----------|--------|
| Tap/click | Visual press state | Immediate (< 100ms) |
| Form submit | Loading indicator | Immediate |
| Success | Confirmation message/animation | < 1s |
| Error | Inline error with fix suggestion | Immediate |
| Long operation | Progress indicator with % | Continuous |

### State Design — MANDATORY

Design every screen for ALL states:

| State | Requirements |
|-------|-------------|
| **Loading** | Skeleton shimmer (not spinner). Match layout of loaded content. |
| **Empty** | Helpful message + CTA. Never just "No data." |
| **Error** | Specific error + recovery action. Never just "Error." |
| **Success** | Confirmation + next step. Don't dead-end the user. |
| **Offline** | Cached content + banner. Graceful degradation. |
| **Partial** | Show what you have. Progressive loading. |

---

## Accessibility Enforcement

### WCAG AA Compliance — MANDATORY

#### Color Contrast

```bash
# Check all text contrast ratios
# Text: 4.5:1 minimum contrast ratio
# Large text (≥ 24px or ≥ 18.5px bold): 3:1 minimum
# UI components: 3:1 minimum
```

#### Keyboard Navigation

- [ ] All interactive elements reachable via Tab
- [ ] Focus order matches visual order
- [ ] Focus indicator visible (not browser default)
- [ ] Escape closes modals/dropdowns
- [ ] Enter/Space activates buttons
- [ ] Arrow keys navigate within components (tabs, menus)

#### Screen Reader Support

- [ ] All images have descriptive `alt` text
- [ ] Form inputs have associated `<label>` elements
- [ ] ARIA labels on icon-only buttons
- [ ] Live regions for dynamic content updates
- [ ] Heading hierarchy is logical (h1 → h2 → h3, no skipping)
- [ ] Skip link to main content

#### Focus Management

```tsx
// When opening a modal, move focus to it
useEffect(() => {
  if (isOpen) modalRef.current?.focus();
}, [isOpen]);

// When closing, return focus to trigger element
const handleClose = () => {
  setIsOpen(false);
  triggerRef.current?.focus();
};
```

---

## Usability Validation

### The 5-Second Test

Show a user the screen for 5 seconds, then ask:
1. What is this page about?
2. What would you do first?
3. Who is this for?

If answers don't match intent, redesign.

### Task Completion Check

For the primary user flow:
- Can a first-time user complete it without instructions?
- Are there fewer than 3 steps to the primary goal?
- Is the CTA immediately obvious?
- Can the user undo mistakes?

### Cognitive Load Audit

- [ ] No more than 7±2 items in any list or menu
- [ ] Progressive disclosure (show only what's needed now)
- [ ] Consistent patterns across screens
- [ ] Familiar icons and labels

---

## Pitfall: Handle Attribution in Ranked Lists

In social platforms with leaderboards, ranked lists, or member directories, the `@handle` is the user's platform identity — not an afterthought.

**Wrong:** Display name large and prominent, `@handle` in a smaller muted row below it.
**Right:** Display name and `@handle` on the same line, handle in a muted accent color, both equally scannable.

Users find each other by handle. Burying the handle below the name in a secondary text row makes it invisible at scan speed. The handle must read as the user's **attributed identity**, not decorative metadata.

---

## ⛔ STOP GATE — UX Completion

DO NOT mark UX design complete without:

1. Happy path flow mapped with all screens
2. Edge cases documented (empty, error, offline, loading)
3. Accessibility checklist passed (keyboard, screen reader, contrast)
4. State design for ALL screens (loading, empty, error, success)
5. Navigation pattern selected and documented

---

## Output Format

```markdown
## UX Design: [Feature/Flow Name]

### User Flow
[Diagram or step description]

### Key Screens
1. [Screen] — [Purpose]
2. [Screen] — [Purpose]

### States
| Screen | Loading | Empty | Error | Success |
|--------|---------|-------|-------|---------|
| [Name] | [desc]  | [desc]| [desc]| [desc]  |

### Accessibility
- Keyboard: [navigation plan]
- Screen reader: [labeling plan]
- Contrast: [verified ✓/✗]

### Interaction Patterns
- [Pattern and rationale]
```
