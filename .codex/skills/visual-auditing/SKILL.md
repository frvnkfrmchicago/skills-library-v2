---
name: visual-auditing
description: >
  Audits UI/UX visual quality including consistency across pages, responsive
  design at all breakpoints, WCAG accessibility compliance, motion polish,
  typography hierarchy, and edge states. Includes screenshot-comparison
  directives and the Screenshot Test for brand identity. Use when reviewing
  visual consistency, checking responsive layouts, auditing accessibility,
  verifying design system token usage, or when user mentions visual audit,
  design review, consistency check, or polish.
---

## Responsive Parity Check (2026)

Add this to any visual audit. Desktop and mobile should look like the SAME product at different scales, not two different platforms.

Checks:
- grep for min-h-screen or h-screen — should be 0 (all should be min-h-dvh / h-dvh)
- grep for @media (max-width: — should be 0 (all should be min-width)
- grep for hardcoded h-[NNNpx] — each one is a candidate for clamp() replacement
- grep for multi-breakpoint height cascades (sm:min-h / md:min-h / lg:min-h) — should be collapsed into single clamp()
- Verify at least some @container rules exist for component-level responsiveness

If mobile and desktop screenshots look like different designs, the cause is almost always hardcoded heights with no fluid sizing.

# Visual Auditing Skill

The eye catches inconsistency before the brain names it. A visual audit finds
what feels "off" before it hurts conversion.

---

## ⛔ STOP — Code-First, Not Screenshot-First

**NEVER start a visual audit with screenshots.** Screenshots confirm problems
already found in code — they do not discover them. Nobody codes based on
screenshots. Audit tokens, components, data sources, and CSS architecture FIRST.
Capture screenshots only to verify that code-level fixes render correctly.

### Code-First Audit Sequence

1. **Token scan** — grep for hardcoded hex, raw px, `min-h-screen` in components
2. **Media-query audit** — grep for `max-width` violations (must be `min-width`)
3. **Dimension audit** — grep for hardcoded height cascades (`h-[Xpx] sm:h-[Ypx]`)
4. **Container query check** — verify `@container` usage exists for cards/panels
5. **Viewport unit check** — grep for `100vh`/`min-h-screen` (must use `dvh` or `var(--app-height)`)
6. **Reduced-motion check** — grep for `prefers-reduced-motion` coverage
7. **THEN** capture screenshots to validate code-level findings at both viewports

### Why Code-First

| Screenshot-first (wrong) | Code-first (right) |
|--------------------------|---------------------|
| "The hero looks tall on mobile" | "`min-h-[700px]` on line 589 — should use `clamp()`" |
| "The map seems off" | "`FilterType` missing `'decriminalized'` — zero states mapped" |
| "Colors don't match" | "409 `var(--` refs but 96 `min-h-screen` break on Safari" |
| Subjective, slow to fix | Specific file:line, immediate remediation |

For ready-to-run grep commands for each audit step, see
`references/code-first-grep-patterns.md`.

---

## Screenshot-Comparison Directives

### Step 1: Capture Screenshots

Take screenshots of 5 key pages at each breakpoint:

```bash
# Recommended breakpoints for screenshot comparison:
# 375px  — iPhone SE (smallest iOS)
# 768px  — iPad Mini (tablet)
# 1280px — Standard desktop
# 1440px — Large desktop
```

### Step 2: Side-by-Side Comparison

Place all 5 screenshots side-by-side and ask:
**"Do these look like the same product?"**

Flag every difference in:
- Colors (hex values not matching tokens)
- Spacing (inconsistent gaps)
- Font sizes (hierarchy breaks)
- Button styles (variant inconsistency)
- Component patterns (different card styles)
- Shadow depths (mixed elevation levels)
- Border radius (varying roundness)

### Step 3: Cross-Page Token Scan

```bash
# Find raw values that should be tokens
grep -rn "#[0-9a-fA-F]\{3,8\}" src/ --include="*.css" --include="*.tsx" | grep -v "var(--" | grep -v "tokens"
grep -rn "font-size:.*px" src/ --include="*.css" | grep -v "var(--"
grep -rn "padding:.*px\|margin:.*px" src/ --include="*.css" | grep -v "var(--"
```

Every match is a consistency violation. Replace with token reference.

---

## Audit Checklists

### Consistency

- [ ] Colors match design tokens across ALL pages
- [ ] Button styles identical everywhere (same variant = same look)
- [ ] Card styles consistent (radius, shadow, padding)
- [ ] Spacing follows rhythm (4px/8px grid from tokens)
- [ ] Font sizes match type hierarchy from token scale
- [ ] Icons same style and weight throughout
- [ ] Shadows consistent depth (one elevation system)
- [ ] Border radius uniform per component type

### Responsive Design

- [ ] 375px — looks intentional, not broken
- [ ] 768px — no awkward stretching or wasted space
- [ ] 1024px — balanced layout, proper grid
- [ ] 1440px+ — max-width containers prevent ultra-wide text
- [ ] No horizontal scroll at any width
- [ ] Touch targets ≥ 44px on mobile
- [ ] Text readable at all sizes (≥ 16px body on mobile)

### Accessibility

- [ ] Color contrast ≥ 4.5:1 for text, ≥ 3:1 for UI
- [ ] Focus states visible on all interactive elements
- [ ] Alt text on all images
- [ ] Form labels connected to inputs
- [ ] Keyboard navigation works through all interactive elements
- [ ] Skip link for main content
- [ ] No color-only information conveyed
- [ ] `prefers-reduced-motion` respected

### Motion & Interaction

- [ ] Hover states on all clickable elements
- [ ] Loading states during async operations
- [ ] Feedback on form submission (success/error)
- [ ] Animations enhance, never distract
- [ ] No jarring or unexpected movement
- [ ] Consistent animation timing (using motion tokens)

### Typography & Spacing

- [ ] Clear visual hierarchy (H1 > H2 > H3 > body)
- [ ] Line height ≥ 1.5 for body text
- [ ] Max width for readability (≤ 65ch for prose)
- [ ] Whitespace used intentionally (not random)
- [ ] No orphaned words in headlines

### Edge States

- [ ] Empty states designed (helpful message + CTA)
- [ ] Error states helpful (specific error + recovery action)
- [ ] Loading states use skeletons (not just spinners)
- [ ] Long text handled (truncation or proper wrapping)
- [ ] No-content state graceful

---

## Identity Audit (The Screenshot Test)

Beyond consistency, check for memorability. Consistent but forgettable = failure.

### Screenshot Test Questions

1. Would someone screenshot this to share?
2. Is there at least ONE memorable visual moment?
3. Does this look like it could ONLY be this brand?
4. Is anything surprising or unexpected?
5. Does any section break the grid intentionally?

### Identity Checklist

1. Could I remove the logo and still know it's this brand?
2. Is the typography treatment unique — or system defaults?
3. Are animations choreographed — or just fade-up everything?
4. Is there a visual signature (color, shape, motion)?
5. Does this deserve attention in a feed of content?

### Verdict

If consistency passes but identity fails:

> 🟡 **"Consistent but forgettable — needs identity layer."**
> Activate `experience-designing` for elevation.

---

## Output Format

```markdown
## Visual Audit Report: [Project/Page Name]

### Screenshot Assessment
[What was reviewed, at what breakpoints]

### Issues Found

| Page | Issue | Severity | Fix |
|------|-------|----------|-----|
| [page] | [description] | 🔴/🟡/🟢 | [specific fix] |

### Consistency Check

| Element | Variations Found | Standard |
|---------|-----------------|----------|
| Buttons | [N] styles | Use [token] |
| Cards | [N] shadow depths | Use [token] |

### Responsive Issues
[Breakpoint-specific problems]

### Accessibility Issues
[WCAG violations with fix suggestions]

### Identity Score
[Pass/Fail on Screenshot Test]

### Recommendations
[Priority-ordered improvements]
```

---

## ⛔ STOP GATE — Audit Completion

DO NOT mark visual audit complete without:

1. Screenshots captured at 375px, 768px, 1280px
2. Side-by-side comparison performed
3. Token scan run (grep commands above)
4. All 5 audit checklists reviewed
5. Screenshot Test performed
6. Issues documented with severity and fix
