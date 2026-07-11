# Code-First Visual Audit Grep Patterns

Session-derived from GrazzHopper Landing audit (June 2026). These patterns
find the most common causes of "mobile and desktop look like two different
platforms" without capturing a single screenshot.

---

## 1. `min-h-screen` Epidemic

```bash
# Count instances (GrazzHopper had 96)
grep -rn 'min-h-screen' app/ components/ --include='*.tsx' | grep -v node_modules | wc -l

# List files with counts
grep -rn 'min-h-screen' app/ components/ --include='*.tsx' | grep -v node_modules | cut -d: -f1 | sort | uniq -c | sort -rn
```

**What it means:** `min-height: 100vh` — breaks on mobile Safari dynamic URL bar.
**Fix:** `min-h-dvh` or `var(--app-height)` from route-shells.

---

## 2. Hardcoded Dimension Cascading

```bash
# Find chained breakpoint heights
grep -rn 'h-\[.*px\].*sm:h-\[' app/ components/ --include='*.tsx'
grep -rn 'min-h-\[.*px\].*sm:min-h-\[' app/ components/ --include='*.tsx'

# Find any component with 3+ hardcoded height variants
grep -rn 'min-h-\[' app/ components/ --include='*.tsx' | grep -E '(sm:|md:|lg:)' | head -30
```

**What it means:** Component sizes jump at breakpoints instead of scaling fluidly.
**Fix:** `clamp()` for sizing, container queries for layout changes.

---

## 3. `max-width` Media Query Violations

```bash
# Desktop-first anti-pattern in CSS
grep -n '@media.*max-width' app/globals.css styles/*.css
```

**What it means:** Desktop-first overrides — mobile downloads desktop styles + overrides.
**Fix:** Invert to `min-width` (mobile-first).

---

## 4. Container Query Absence

```bash
# Should return results for any mature app
grep -rn 'container-type\|@container\|container-name' app/ components/ --include='*.css' --include='*.tsx'
```

**What it means:** If zero results, components can't adapt to their container — only to viewport.
**Fix:** Add `container-type: inline-size` to card/panel wrappers.

---

## 5. Fluid Sizing Coverage

```bash
# clamp() usage in key components
grep -rn 'clamp(' app/page.tsx components/LegalMap.tsx components/NewsRSSFeed.tsx
```

**What it means:** If zero results in high-visibility components, typography/dimensions jump at breakpoints.
**Fix:** Replace hardcoded sizes with `clamp()` expressions.

---

## 6. Token Adoption Rate

```bash
# Raw hex in components vs token refs
grep -rn '#[0-9a-fA-F]{3,8}' components/ --include='*.tsx' | grep -v node_modules | wc -l
grep -rn 'var(--' components/ app/page.tsx --include='*.tsx' --include='*.css' | grep -v node_modules | wc -l
```

**What it means:** Ratio of hardcoded values to token references. Under 50% token adoption = critical debt.

---

## 7. Data Layer Completeness (Map Apps)

```bash
# For cannabis/legal-status maps: verify all categories exist
grep -c "status: 'decriminalized'" lib/cannabis-data.ts
grep 'FilterType' lib/cannabis-data.ts
```

**What it means:** If a legal status category has 0 entries AND is missing from the filter type, the map literally cannot display that category regardless of data accuracy.
