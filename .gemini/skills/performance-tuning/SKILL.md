---
name: performance-tuning
description: >
  Optimizes Core Web Vitals (LCP, INP, CLS), bundle size, rendering
  strategy, image and font loading, caching, and database query performance
  for Next.js, Vite, React, and Python backends. Use when optimizing
  performance, reducing load time, fixing slow pages, analyzing bundle
  size, or when user mentions performance, speed, Lighthouse, or Web Vitals.
---

# Performance Tuning

Fast apps win. Performance is UX. Performance is SEO. Performance is
conversion. Slow kills.

---

## Phase 1: Core Web Vitals Measurement

### Targets (2026)

| Metric | Good | Needs Work | Poor |
|--------|------|------------|------|
| **LCP** (Largest Contentful Paint) | < 2.5s | 2.5-4s | > 4s |
| **INP** (Interaction to Next Paint) | < 200ms | 200-500ms | > 500ms |
| **CLS** (Cumulative Layout Shift) | < 0.1 | 0.1-0.25 | > 0.25 |

Run:
```bash
# Lighthouse audit (local)
npx lighthouse http://localhost:3000 --output json --output-path report.json 2>/dev/null

# Or in Chrome: DevTools → Lighthouse → Analyze page load
```

---

## Phase 2: Bundle Size Analysis

Run:
```bash
# Next.js bundle analysis
ANALYZE=true npm run build 2>/dev/null

# Vite bundle analysis
npx vite-bundle-visualizer 2>/dev/null

# Check largest JS chunks
ls -lhS .next/static/chunks/*.js 2>/dev/null | head -10
ls -lhS dist/assets/*.js 2>/dev/null | head -10

# Find largest dependencies
npx cost-of-modules 2>/dev/null | head -20

# Unused dependencies
npx depcheck 2>/dev/null | head -20
```

### Bundle Size Targets

| Category | Target | Action if Over |
|----------|--------|---------------|
| Total JS | < 200KB gzip | Code split aggressively |
| First Load | < 100KB gzip | Defer non-critical |
| Largest chunk | < 50KB gzip | Dynamic import |

### Common Bloat Sources

| Dependency | Size | Alternative |
|-----------|------|-------------|
| `moment.js` | 300KB | `date-fns` or `dayjs` (2KB) |
| `lodash` (full) | 72KB | `lodash-es` or native JS |
| `chart.js` | 200KB | Import only needed modules |
| `three.js` | 600KB | Import only: `import { Scene } from 'three'` |

Run to detect:
```bash
# Tree shaking violations
grep -rn "import .* from 'lodash'" src/ --include="*.ts" --include="*.tsx" 2>/dev/null
grep -rn "require('lodash')" src/ --include="*.ts" --include="*.js" 2>/dev/null
```

---

## Phase 3: Image & Font Optimization

Run:
```bash
# Find large images
find src/ public/ -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" 2>/dev/null | xargs ls -lhS 2>/dev/null | head -20

# Check for next/image usage
grep -rn "next/image\|Image" src/ --include="*.tsx" 2>/dev/null | wc -l

# Check for lazy loading
grep -rn "loading=\"lazy\"\|loading=\"eager\"" src/ --include="*.tsx" 2>/dev/null | wc -l

# Check font loading
grep -rn "next/font\|@font-face\|font-display" src/ app/ --include="*.tsx" --include="*.css" 2>/dev/null
```

### Image Targets

| Image Type | Max Size | Format | Loading |
|-----------|----------|--------|---------|
| Hero/banner | 200KB | WebP/AVIF | `eager`, `fetchpriority="high"` |
| Card thumbnails | 50KB | WebP | `lazy` |
| Icons | 5KB | SVG (inline) | Inline |
| Backgrounds | 100KB | WebP | CSS lazy |

Flag if: images > 200KB, no `next/image` usage, no `font-display: swap`.

---

## Phase 4: Rendering Strategy

### Decision Tree

| Page Type | Strategy | Why |
|-----------|----------|-----|
| Marketing/Landing | SSG + ISR | Fast, cacheable, SEO |
| Blog/Content | SSG with on-demand ISR | Changes, needs SEO |
| Dashboard | CSR or Streaming SSR | Personalized, real-time |
| E-commerce Product | ISR (1-60 sec) | Changes often, SEO matters |
| Search Results | Server Components | Dynamic, personalized |

Run:
```bash
# Check rendering strategy in Next.js
grep -rn "export const dynamic\|export const revalidate\|getStaticProps\|getServerSideProps" app/ src/ --include="*.ts" --include="*.tsx" 2>/dev/null

# Check for code splitting
grep -rn "React.lazy\|dynamic(\|lazy(" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l
```

Flag if: no dynamic imports for heavy components, all pages use the same rendering strategy.

---

## Phase 5: Database Query Performance

Run:
```bash
# N+1 query patterns (ORM)
grep -rn "findMany\|findAll\|\.all()" src/ lib/ --include="*.ts" --include="*.py" 2>/dev/null
grep -rn "include:\|select:\|prefetch_related\|select_related" src/ lib/ --include="*.ts" --include="*.py" 2>/dev/null

# Missing pagination
grep -rn "take\|limit\|offset\|skip\|paginate\|LIMIT" src/ lib/ --include="*.ts" --include="*.py" 2>/dev/null | wc -l
```

Flag if: `findMany`/`findAll` without `include` (N+1), no pagination on list queries.

---

## Phase 6: Caching Strategy

Run:
```bash
# Check for caching headers
grep -rn "Cache-Control\|s-maxage\|stale-while-revalidate\|unstable_cache" src/ app/ --include="*.ts" --include="*.tsx" 2>/dev/null

# Check for ISR configuration
grep -rn "revalidate" app/ --include="*.ts" --include="*.tsx" 2>/dev/null
```

Flag if: no caching on static assets, no ISR for dynamic content, no API response caching.

---

## ⛔ STOP GATE — Performance
DO NOT mark performance as optimized without:
1. Running Lighthouse or equivalent measurement
2. Showing bundle size analysis results
3. Confirming Core Web Vitals meet "Good" thresholds

---

## Output Format

```markdown
## Performance Report — [Project Name]

### Current State
| Metric | Score | Target | Gap |
|--------|-------|--------|-----|
| LCP | Xs | < 2.5s | Xs |
| INP | Xms | < 200ms | Xms |
| CLS | X | < 0.1 | X |
| Bundle Size | XKB | < 200KB | XKB |

### Issues Found (Priority Order)
1. 🔴 [Critical — directly impacts user experience]
2. 🟡 [Medium — impacts at scale]
3. 🟢 [Nice to have]

### Optimization Plan
1. [Fix 1] — Expected impact: X
2. [Fix 2] — Expected impact: X
```
