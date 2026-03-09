---
name: performance
description: Web performance optimization for React and Next.js. Core Web Vitals, bundle analysis, lazy loading, image optimization, and profiling.
last_updated: 2026-03
owner: Frank
---

# Performance Optimization

Make your apps fast. Users leave slow sites.

---

## Context Questions

Before optimizing performance:

1. **What's the current state?** — No issues, some complaints, measurably slow
2. **What's the bottleneck?** — LCP, INP, CLS, bundle size, server time
3. **What's the target?** — "Good enough", competitive, best-in-class
4. **What's the content type?** — Text-heavy, image-heavy, interactive, dashboard
5. **What's the hosting?** — Vercel, self-hosted, edge, serverless

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **LCP** | Needs work (>4s) ←→ Good (<2.5s) |
| **INP** | Slow (>500ms) ←→ Fast (<200ms) |
| **Bundle** | Large (>500KB) ←→ Lean (<100KB) |
| **Assets** | Unoptimized ←→ Fully optimized |
| **Caching** | None ←→ Aggressive |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Slow LCP | Optimize hero image, preload fonts, reduce server time |
| High INP | Reduce JS, use web workers, defer non-critical |
| Layout shifting | Reserve space for images/ads, use font-display |
| Large bundle | Dynamic imports, tree-shaking, analyze dependencies |
| Image-heavy | next/image, WebP/AVIF, responsive sizes |
| Dashboard | Virtualize lists, memoize, lazy load charts |

---

## TL;DR

| Metric | Target | How to Improve |
|--------|--------|----------------|
| **LCP** (Largest Contentful Paint) | < 2.5s | Optimize images, preload fonts, reduce server time |
| **INP** (Interaction to Next Paint) | < 200ms | Reduce JS, memoize, use web workers |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Reserve space for images/ads, use font-display |

---

## Core Web Vitals

### What They Measure

```
LCP  → "How fast does the main content load?"
INP  → "How fast does the page respond to interactions?"
CLS  → "How much does the layout shift during load?"
```

### Check Your Scores

```bash
# Lighthouse CLI
npm install -g lighthouse
lighthouse https://yoursite.com --view

# Or use:
# - Chrome DevTools → Lighthouse tab
# - PageSpeed Insights: https://pagespeed.web.dev
# - Web Vitals Chrome Extension
```

---

## Image Optimization

### Next.js Image Component

```tsx
import Image from "next/image";

// ✅ Optimized - lazy loads, responsive, modern formats
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority  // Add for above-the-fold images (LCP)
  sizes="(max-width: 768px) 100vw, 50vw"
/>

// ❌ Avoid
<img src="/hero.jpg" alt="Hero" />
```

### Priority Loading

```tsx
// Above-the-fold images - add priority
<Image src={hero} priority />

// Below-the-fold - default lazy loading is fine
<Image src={thumbnail} />
```

### Responsive Images

```tsx
<Image
  src="/photo.jpg"
  alt="Photo"
  fill
  sizes="(max-width: 640px) 100vw,
         (max-width: 1024px) 50vw,
         33vw"
  className="object-cover"
/>
```

### Image Formats

| Format | Use Case |
|--------|----------|
| WebP | Default for web (30% smaller than JPEG) |
| AVIF | Even smaller (Next.js auto-generates) |
| PNG | Transparency needed |
| SVG | Icons, logos (scales infinitely) |

---

## Code Splitting

### Dynamic Imports

```tsx
import dynamic from "next/dynamic";

// Component only loads when needed
const HeavyChart = dynamic(() => import("@/components/Chart"), {
  loading: () => <ChartSkeleton />,
  ssr: false, // Skip server-side rendering for client-only components
});

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<ChartSkeleton />}>
        <HeavyChart />
      </Suspense>
    </div>
  );
}
```

### Route-Based Splitting

Next.js automatically code-splits by route. Each page only loads its own code.

```
/           → loads index bundle
/dashboard  → loads dashboard bundle
/settings   → loads settings bundle
```

### Lazy Load Libraries

```tsx
// ❌ Imports entire library upfront
import { format, parseISO, differenceInDays } from "date-fns";

// ✅ Import only what you need
import format from "date-fns/format";

// ✅ Or lazy load heavy libraries
const Chart = dynamic(() => import("chart.js").then(m => m.Chart), {
  ssr: false
});
```

---

## Bundle Analysis

### Analyze Bundle Size

```bash
# Install analyzer
pnpm add -D @next/bundle-analyzer

# next.config.js
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
module.exports = withBundleAnalyzer(nextConfig);

# Run analysis
ANALYZE=true pnpm build
```

### Common Culprits

| Library | Size | Alternative |
|---------|------|-------------|
| moment.js | 300KB | date-fns (tree-shakeable) |
| lodash | 70KB | lodash-es or native JS |
| chart.js | 200KB | Recharts or dynamic import |
| react-icons (all) | 100KB+ | Import specific icons |

```tsx
// ❌ Imports all icons
import { FaHome, FaUser } from "react-icons/fa";

// ✅ Import individual icons
import { FaHome } from "react-icons/fa/FaHome";
import { FaUser } from "react-icons/fa/FaUser";
```

---

## React Performance

### Prevent Re-renders

```tsx
// React.memo - Skip re-render if props unchanged
const ExpensiveList = React.memo(function ExpensiveList({ items }) {
  return items.map(item => <Item key={item.id} {...item} />);
});

// useMemo - Cache expensive calculations
function Dashboard({ data }) {
  const processedData = useMemo(() => {
    return expensiveProcess(data);
  }, [data]);

  return <Chart data={processedData} />;
}

// useCallback - Stable function references
function Parent() {
  const handleClick = useCallback((id: string) => {
    console.log("Clicked", id);
  }, []);

  return <Child onClick={handleClick} />;
}
```

### When to Use

| Hook | Use When |
|------|----------|
| `React.memo` | Child re-renders but props haven't changed |
| `useMemo` | Expensive calculation that doesn't need to re-run |
| `useCallback` | Passing callbacks to memoized children |

> **Warning:** Don't memoize everything. Memoization has a cost. Profile first.

### Virtualization for Long Lists

```tsx
import { useVirtualizer } from "@tanstack/react-virtual";

function VirtualList({ items }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // Item height
  });

  return (
    <div ref={parentRef} className="h-[400px] overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {items[virtualItem.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Font Optimization

### Next.js Font

```tsx
// app/layout.tsx
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap", // Prevents FOIT
  variable: "--font-inter",
});

export default function RootLayout({ children }) {
  return (
    <html className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
```

### Font Best Practices

```css
/* Prevent layout shift from fonts */
:root {
  font-family: var(--font-inter), system-ui, sans-serif;
}

/* Always have fallback */
body {
  font-family: "Custom Font", -apple-system, BlinkMacSystemFont, sans-serif;
}
```

---

## Server-Side Optimization

### Caching Strategies

```tsx
// Static generation - fastest
export default async function Page() {
  const data = await getData();
  return <Content data={data} />;
}

// Revalidate periodically
export const revalidate = 3600; // Rebuild every hour

// On-demand revalidation
import { revalidatePath } from "next/cache";

export async function updatePost(id: string) {
  await db.post.update({ where: { id }, data: { ... } });
  revalidatePath(`/posts/${id}`);
}
```

### Database Query Optimization

```typescript
// ❌ N+1 query problem
const posts = await db.post.findMany();
for (const post of posts) {
  const author = await db.user.findUnique({ where: { id: post.authorId } });
}

// ✅ Eager loading
const posts = await db.post.findMany({
  include: { author: true },
});
```

### Parallel Data Fetching

```tsx
// ❌ Sequential (slow)
const user = await getUser();
const posts = await getPosts();
const comments = await getComments();

// ✅ Parallel (fast)
const [user, posts, comments] = await Promise.all([
  getUser(),
  getPosts(),
  getComments(),
]);
```

---

## Third-Party Scripts

### Load Non-Critical Scripts

```tsx
import Script from "next/script";

// Analytics - load after page is interactive
<Script
  src="https://analytics.example.com/script.js"
  strategy="afterInteractive"
/>

// Widget - load when idle
<Script
  src="https://widget.example.com/embed.js"
  strategy="lazyOnload"
/>
```

### Script Strategies

| Strategy | When Loads | Use For |
|----------|------------|---------|
| `beforeInteractive` | Before page hydrates | Critical scripts |
| `afterInteractive` | After page hydrates | Analytics, A/B testing |
| `lazyOnload` | During idle time | Chat widgets, social embeds |

---

## Monitoring

### Web Vitals in Production

```tsx
// app/layout.tsx or pages/_app.tsx
import { useReportWebVitals } from "next/web-vitals";

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Send to your analytics
    console.log(metric);
    
    // Example: Send to Vercel Analytics
    // analyticsEvent(metric.name, metric.value);
  });

  return null;
}
```

### Performance Monitoring Tools

| Tool | Purpose |
|------|---------|
| Vercel Analytics | Real user metrics |
| Sentry Performance | Transaction tracing |
| Lighthouse CI | Automated performance testing |
| WebPageTest | Deep performance analysis |

---

## Quick Wins Checklist

```markdown
## Images
- [ ] Use next/image for all images
- [ ] Add priority to LCP image
- [ ] Use WebP/AVIF formats
- [ ] Set proper sizes attribute

## JavaScript
- [ ] Dynamic import heavy components
- [ ] Analyze and reduce bundle size
- [ ] Remove unused dependencies
- [ ] Use tree-shakeable imports

## Fonts
- [ ] Use next/font
- [ ] Set display: swap
- [ ] Subset to needed characters

## Server
- [ ] Enable caching where possible
- [ ] Use parallel data fetching
- [ ] Fix N+1 queries
- [ ] Use edge functions for low-latency

## Third-Party
- [ ] Lazy load non-critical scripts
- [ ] Self-host fonts if possible
- [ ] Defer analytics loading
```

---

## Resources

- Web Vitals: [web.dev/vitals](https://web.dev/vitals)
- Next.js Performance: [nextjs.org/docs/app/building-your-application/optimizing](https://nextjs.org/docs/app/building-your-application/optimizing)
- React Profiler: [react.dev/reference/react/Profiler](https://react.dev/reference/react/Profiler)
