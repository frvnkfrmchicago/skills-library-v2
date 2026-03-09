---
name: app-type-landing
description: Landing page blueprint for marketing sites, product launches, waitlists. Fast, SEO-focused, conversion-driven. Most common starting point for projects.
last_updated: 2026-03
---

# Landing Page Blueprint

Fast, beautiful, converts. Ship in hours, not days.

## TL;DR

| Phase | Time | Output |
|-------|------|--------|
| Setup | 10 min | Project scaffolded |
| Hero | 30 min | Above-the-fold done |
| Sections | 1-2 hrs | Full page built |
| Polish | 30 min | Animations, mobile |
| Deploy | 5 min | Live on Vercel |

**Total: 2-4 hours to shipped landing page**

---

## Variation Mode (Breaking the Template)

> Activate when user wants "identity," "unique," or "not like every other landing page"

### THIS FILE IS A BASELINE TO BREAK

The structure below is functional. But functional is not memorable.

### WHEN VARIED, REJECT:

- Standard section order (Hero, Features, Testimonials, Pricing, Footer)
- Centered headline with subheadline and two buttons
- bento grid features section
- Carousel testimonials
- Three-column pricing tables

### ALTERNATIVE STRUCTURES

| Standard | Varied Alternative |
|----------|-------------------|
| Hero → Features → Testimonials | IMPACT → IMMERSION → REVEAL |
| Feature cards | Interactive explorer |
| Testimonial carousel | Scroll-triggered theater |
| Pricing table | Conversational pricing |
| Footer | Brand signature / Easter eggs |

### THE SCREENSHOT TEST

Before shipping, ask: "Would someone screenshot any part of this?"
If no, activate `/librarians/experience-designer-librarian.md`

Reference: `/agents/anti-template/SKILL.md`

---

## Stack Options

### Option A: Next.js (Full Control)
```
Framework:    Next.js 16.1.1 (App Router)
Styling:      Tailwind + shadcn/ui
Animation:    GSAP or Motion
Icons:        lucide-react
Fonts:        next/font + Google Fonts
Deploy:       Vercel
```

### Option B: Astro (Maximum Speed)
```
Framework:    Astro
Styling:      Tailwind
Animation:    CSS + vanilla JS
Islands:      React components where needed
Deploy:       Vercel or Cloudflare
```

**When to use which:**
| Need | Use |
|------|-----|
| Interactive components, forms, auth later | Next.js |
| Pure marketing, maximum speed, SEO focus | Astro |
| Not sure | Next.js (more flexible) |

---

## File Structure (Next.js)

```
src/
├── app/
│   ├── page.tsx           # Landing page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   ├── sections/
│   │   ├── hero.tsx
│   │   ├── features.tsx
│   │   ├── testimonials.tsx
│   │   ├── pricing.tsx
│   │   ├── faq.tsx
│   │   ├── cta.tsx
│   │   └── footer.tsx
│   └── ui/                # shadcn components
└── lib/
    └── utils.ts
```

---

## Quick Start

### 1. Create Project
```bash
npx create-next-app@latest landing --typescript --tailwind --app
cd landing
```

### 2. Setup shadcn
```bash
npx shadcn@latest init
npx shadcn@latest add button card badge accordion
```

### 3. Add Animation (Pick One)
```bash
# GSAP (complex animations)
pnpm add gsap @gsap/react

# Motion (simpler, React-native)
pnpm add motion
```

### 4. Add Font
```tsx
// app/layout.tsx
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

---

## Section Patterns

### Hero (50% of effort goes here)

```tsx
// components/sections/hero.tsx
export function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-4xl text-center space-y-8">
        {/* Badge */}
        <Badge variant="outline" className="px-4 py-1">
          ✨ Now in public beta
        </Badge>
        
        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          Build apps faster with
          <span className="text-primary"> AI assistance</span>
        </h1>
        
        {/* Subheadline */}
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Ship production-ready apps in hours, not weeks. 
          Your AI copilot for the entire development lifecycle.
        </p>
        
        {/* CTA */}
        <div className="flex gap-4 justify-center">
          <Button size="lg">Get Started Free</Button>
          <Button size="lg" variant="outline">Watch Demo</Button>
        </div>
        
        {/* Social Proof */}
        <p className="text-sm text-muted-foreground">
          Trusted by 10,000+ developers
        </p>
      </div>
    </section>
  )
}
```

### Features (Bento Grid)

```tsx
// components/sections/features.tsx
const features = [
  {
    title: "Lightning Fast",
    description: "Build and ship in hours, not weeks",
    icon: Zap,
  },
  // ... more features
]

export function Features() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-16">
          Everything you need to ship
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="p-6">
              <feature.icon className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-semibold text-xl mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
```

### Testimonials

```tsx
// components/sections/testimonials.tsx
const testimonials = [
  {
    quote: "Shipped my SaaS in 2 weeks instead of 2 months.",
    author: "Alex Chen",
    role: "Indie Founder",
    avatar: "/avatars/alex.jpg"
  },
  // ... more
]

export function Testimonials() {
  return (
    <section className="py-24 px-4 bg-muted/50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-16">
          Loved by builders
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <Card key={t.author} className="p-6">
              <p className="text-lg mb-4">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <img src={t.avatar} className="w-10 h-10 rounded-full" />
                <div>
                  <p className="font-semibold">{t.author}</p>
                  <p className="text-sm text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
```

### Pricing

```tsx
// components/sections/pricing.tsx
const plans = [
  {
    name: "Free",
    price: "$0",
    description: "For side projects",
    features: ["5 projects", "Community support", "Basic analytics"],
    cta: "Start Free",
    popular: false
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For serious builders",
    features: ["Unlimited projects", "Priority support", "Advanced analytics", "Custom domains"],
    cta: "Start Pro Trial",
    popular: true
  },
]

export function Pricing() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">
          Simple pricing
        </h2>
        <p className="text-center text-muted-foreground mb-16">
          Start free, upgrade when you need to
        </p>
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.name} className={`p-8 ${plan.popular ? 'border-primary' : ''}`}>
              {plan.popular && <Badge className="mb-4">Most Popular</Badge>}
              <h3 className="text-2xl font-bold">{plan.name}</h3>
              <div className="my-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
              </div>
              <p className="text-muted-foreground mb-6">{plan.description}</p>
              <ul className="space-y-2 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                {plan.cta}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
```

### FAQ

```tsx
// components/sections/faq.tsx
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  { q: "How does the free trial work?", a: "You get 14 days of full access..." },
  { q: "Can I cancel anytime?", a: "Yes, cancel with one click..." },
  // ... more
]

export function FAQ() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-16">
          Frequently asked questions
        </h2>
        <Accordion type="single" collapsible>
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger>{faq.q}</AccordionTrigger>
              <AccordionContent>{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
```

### CTA (Final Section)

```tsx
// components/sections/cta.tsx
export function CTA() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-4xl mx-auto text-center bg-primary text-primary-foreground rounded-3xl p-12">
        <h2 className="text-3xl font-bold mb-4">
          Ready to ship faster?
        </h2>
        <p className="text-lg opacity-90 mb-8">
          Join 10,000+ developers building with AI
        </p>
        <Button size="lg" variant="secondary">
          Get Started Free →
        </Button>
      </div>
    </section>
  )
}
```

---

## Assemble the Page

```tsx
// app/page.tsx
import { Hero } from "@/components/sections/hero"
import { Features } from "@/components/sections/features"
import { Testimonials } from "@/components/sections/testimonials"
import { Pricing } from "@/components/sections/pricing"
import { FAQ } from "@/components/sections/faq"
import { CTA } from "@/components/sections/cta"
import { Footer } from "@/components/sections/footer"

export default function LandingPage() {
  return (
    <main>
      <Hero />
      <Features />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  )
}
```

---

## SEO Essentials

```tsx
// app/layout.tsx
export const metadata = {
  title: "Your Product - Tagline Here",
  description: "Build apps faster with AI assistance. Ship in hours, not weeks.",
  openGraph: {
    title: "Your Product",
    description: "Build apps faster with AI assistance",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
  },
}
```

---

## Animation (Quick Wins)

### Fade In on Scroll (GSAP)

```tsx
"use client"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function AnimatedSection({ children }) {
  const ref = useRef(null)
  
  useGSAP(() => {
    gsap.from(ref.current, {
      opacity: 0,
      y: 50,
      duration: 1,
      scrollTrigger: {
        trigger: ref.current,
        start: "top 80%",
      }
    })
  }, [])
  
  return <div ref={ref}>{children}</div>
}
```

### Staggered Cards

```tsx
useGSAP(() => {
  gsap.from(".feature-card", {
    opacity: 0,
    y: 30,
    stagger: 0.1,
    duration: 0.6,
    scrollTrigger: {
      trigger: ".features-grid",
      start: "top 80%",
    }
  })
}, [])
```

---

## Deploy

```bash
# Deploy to Vercel
vercel --prod
```

---

## Common Additions

| Addition | How |
|----------|-----|
| Waitlist form | Supabase or Resend |
| Analytics | Vercel Analytics or PostHog |
| Dark mode | next-themes |
| Blog | MDX or Contentlayer |
| Auth (later) | Add Clerk |

---

## Checklist

Before shipping:
- [ ] Mobile responsive
- [ ] Meta tags set
- [ ] OG image created
- [ ] Favicon added
- [ ] Links work
- [ ] Fast load time (<3s)
- [ ] No console errors
