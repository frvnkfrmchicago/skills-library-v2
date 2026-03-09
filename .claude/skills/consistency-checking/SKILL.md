---
name: consistency-checking
description: >
  Audits and enforces design consistency across colors, spacing, typography,
  component patterns, and interactive states. Detects token gaps, hardcoded
  values, and visual mismatches. Use when auditing design consistency,
  building a design system, fixing visual inconsistencies, or when user
  mentions consistency, design tokens, or visual mismatch.
---

# Consistency Checking

Inconsistency erodes trust. Every mismatched color, spacing value, or font
variant makes the product feel amateur. This skill finds and fixes them.

---

## Phase 1: Color Consistency Audit

Run:
```bash
# Count CSS variable usage vs hardcoded hex values
grep -rn "var(--" src/ --include="*.css" --include="*.scss" --include="*.tsx" 2>/dev/null | wc -l
grep -rn "#[0-9a-fA-F]\{3,8\}" src/ --include="*.css" --include="*.scss" --include="*.tsx" 2>/dev/null | wc -l

# Find all unique hex colors used
grep -rn -oh "#[0-9a-fA-F]\{3,8\}" src/ --include="*.css" --include="*.scss" --include="*.tsx" 2>/dev/null | sort -u

# Check for inline color values in components
grep -rn "color:\|backgroundColor:\|background:" src/ --include="*.tsx" 2>/dev/null | grep -v "var(--" | head -20
```

If more hardcoded hex values than CSS variables, flag as 🔴 CRITICAL.

### Expected Token Pattern

```css
:root {
  /* Primitive tokens */
  --color-primary-500: #6366f1;
  --color-primary-600: #4f46e5;

  /* Semantic tokens */
  --color-cta: var(--color-primary-500);
  --color-cta-hover: var(--color-primary-600);
  --color-text: var(--color-gray-900);
  --color-text-muted: var(--color-gray-600);
}
```

---

## Phase 2: Spacing Consistency Audit

Run:
```bash
# Find spacing values NOT on the 4px grid
grep -rn -oh "[0-9]\+px" src/ --include="*.css" --include="*.scss" 2>/dev/null | sort | uniq -c | sort -rn | head -30

# Check for non-standard values (10px, 15px, 18px, 22px = NOT on grid)
grep -rn "10px\|15px\|18px\|22px\|13px\|7px\|11px\|14px" src/ --include="*.css" --include="*.scss" 2>/dev/null | head -20
```

### 4px/8px Grid

Every spacing value should be a multiple of 4:
- 4px (0.25rem) — micro gaps
- 8px (0.5rem) — tight spacing
- 16px (1rem) — default
- 24px (1.5rem) — sections
- 32px (2rem) — large gaps
- 48px (3rem) — page sections

Flag any value not on the grid.

---

## Phase 3: Typography Consistency Audit

Run:
```bash
# Find all font-size values
grep -rn -oh "font-size:[^;]*" src/ --include="*.css" --include="*.scss" 2>/dev/null | sort | uniq -c | sort -rn

# Find all font-family values
grep -rn -oh "font-family:[^;]*" src/ --include="*.css" --include="*.scss" 2>/dev/null | sort -u

# Check for inline font styles in components
grep -rn "fontSize\|fontWeight\|fontFamily\|lineHeight" src/ --include="*.tsx" 2>/dev/null | grep -v "var(--" | head -20
```

Flag if: more than 5 unique font sizes without a type scale, inline font styles instead of token references.

---

## Phase 4: Component Pattern Consistency

Run:
```bash
# Button consistency — check for multiple border-radius values
grep -rn "border-radius" src/ --include="*.css" --include="*.scss" 2>/dev/null | grep -i "button\|btn" | head -20

# Card consistency — check for multiple shadow values
grep -rn "box-shadow" src/ --include="*.css" --include="*.scss" 2>/dev/null | head -20

# Input/form consistency — check heights
grep -rn "height.*input\|height.*select" src/ --include="*.css" 2>/dev/null | head -10
```

### Component Checklist

**Buttons:** Same height, padding, border-radius, focus ring, disabled opacity across all instances.
**Cards:** Same border-radius, shadow depth, padding, hover effect.
**Forms:** Same input heights, label styles, error message placement, focus states.

---

## Phase 5: State Consistency Audit

Run:
```bash
# Hover effects
grep -rn ":hover" src/ --include="*.css" --include="*.scss" 2>/dev/null | head -20

# Focus effects
grep -rn ":focus\|:focus-visible" src/ --include="*.css" --include="*.scss" 2>/dev/null | head -20

# Disabled states
grep -rn "disabled\|:disabled\|opacity.*0\." src/ --include="*.css" --include="*.scss" 2>/dev/null | head -20

# Loading states
grep -rn "loading\|spinner\|skeleton" src/ --include="*.tsx" 2>/dev/null | wc -l
```

### State Rules

| State | Must Be Consistent |
|-------|-------------------|
| Hover | Same transform/opacity/color shift everywhere |
| Focus | Same ring style, same color |
| Active | Same pressed effect |
| Disabled | Same opacity (e.g., 50%) |
| Loading | Same spinner/skeleton everywhere |
| Error | Same red, same placement |

---

## When to Break Consistency (Intentional Identity)

✅ Allowed:
- One section breaks the grid — creates visual tension, draws attention
- One unique animation — signature moment
- One typographic treatment — headline only this brand would have

⛔ Red Flags:
- Breaking consistency because "it looked cool" without purpose
- Multiple elements breaking the same rule (chaos, not identity)
- Breaks that confuse navigation or function

---

## ⛔ STOP GATE — Consistency Audit
DO NOT deliver a consistency report without:
1. Running color, spacing, and typography scans
2. Counting hardcoded values vs token references
3. Listing every inconsistency found with file:line

---

## Output Format

```markdown
## Consistency Audit — [Project Name]

### Token Health
| Category | Token Refs | Hardcoded | Health |
|----------|-----------|-----------|--------|
| Colors | X | Y | 🔴/🟡/🟢 |
| Spacing | X | Y | 🔴/🟡/🟢 |
| Typography | X | Y | 🔴/🟡/🟢 |

### Inconsistencies Found
| Component | Issue | Fix |
|-----------|-------|-----|
| [component] | [different border-radius] | Standardize to X |

### Token Gaps
[Missing tokens that need to be created]

### Recommended Fixes (Priority Order)
1. [Fix 1]
2. [Fix 2]
```
