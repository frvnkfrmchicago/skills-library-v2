---
name: design-system
description: Design language systems. Tokens, themes, Figma-to-code, component composition.
last_updated: 2026-03
---

# Design System

Build consistent, scalable UI with design tokens and patterns.

> **See also:** `agents/storybook/SKILL.md`, `agents/tailwind/SKILL.md`

---

## TL;DR

| Concept | Purpose |
|---------|---------|
| **Design Tokens** | Colors, spacing, typography as variables |
| **Themes** | Light/dark mode, brand variants |
| **Component API** | Variants, slots, composition |
| **Figma Sync** | Design-to-code workflow |

---

## Context Questions (Ask Before Recommending)

Before suggesting design system patterns:

1. **What's the brand personality?** (corporate, playful, minimal, bold)
2. **What's the target platform?** (web, mobile, both, desktop app)
3. **Existing design assets?** (Figma files, brand guidelines, color palette)
4. **Team size and skill level?** (solo dev, design/dev team, large org)
5. **Component library preference?** (build from scratch, shadcn/ui, Radix, MUI)

---

## Dimensions (Spectrums to Explore)

| Dimension | Spectrum |
|-----------|----------|
| **Theming** | Single theme ←→ Multi-theme (light/dark/brand) |
| **Token Scope** | Local CSS vars ←→ Design token pipeline (Style Dictionary) |
| **Component Style** | Utility classes ←→ CVA variants ←→ CSS-in-JS |
| **Customization** | Locked down ←→ Highly customizable |
| **Documentation** | Inline comments ←→ Full Storybook |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Solo dev + speed | shadcn/ui + Tailwind tokens |
| Design team + Figma | Figma Tokens → Style Dictionary |
| Enterprise + multi-brand | Full token pipeline + theming |
| Mobile-first | Responsive tokens + touch targets |
| Accessibility focus | High contrast themes + motion preferences |

---

## DIRECTION EXPLORATION (Ask First)

Before applying any design pattern, **present options**.

### Color Directions

| Direction | Vibe | Example |
|-----------|------|---------|
| Dark Navy | Professional, sleek | `bg: hsl(222 47% 11%)`, accent: emerald |
| Warm Dark | Cozy, premium | `bg: hsl(20 14% 10%)`, accent: amber |
| Midnight Purple | Creative, bold | `bg: hsl(270 50% 8%)`, accent: violet |
| Forest | Calm, organic | `bg: hsl(150 30% 10%)`, accent: teal |
| Light Clean | Minimal, airy | `bg: hsl(0 0% 98%)`, accent: slate |

### Layout Directions

| Direction | When | Pattern |
|-----------|------|---------|
| Bento Grid | Dashboards, feature sections | Asymmetric grid, mixed sizes |
| Split Hero | Landing pages, storytelling | 50/50 image + content |
| Masonry | Content-heavy, dynamic | Pinterest-style columns |
| Alternating | Features, comparisons | Zigzag left-right sections |
| Full-Bleed | Impact, immersion | Edge-to-edge sections |

### Animation Directions

| Direction | Intensity | Use |
|-----------|-----------|-----|
| Subtle | Minimal, fast | Enterprise, professional |
| Moderate | Smooth, balanced | Most apps |
| Bold | Dramatic, expressive | Creative, portfolio |

### Typography Directions

| Direction | Style | Example |
|-----------|-------|---------|
| Clean | Sans-serif, even weight | Inter, minimal hierarchy |
| Expressive | Mixed weights, contrast | Bold headlines, light body |
| Editorial | Serif headlines | NYT-style, storytelling |
| Technical | Mono elements, dense | Developer tools, data |

**Always ask which direction before implementing.**

## Part 1: Design Tokens

### CSS Custom Properties

```css
/* styles/tokens.css */
:root {
  /* Colors - Semantic */
  --color-primary: hsl(220 90% 56%);
  --color-primary-hover: hsl(220 90% 46%);
  --color-secondary: hsl(280 80% 60%);
  --color-background: hsl(0 0% 100%);
  --color-foreground: hsl(0 0% 9%);
  --color-muted: hsl(0 0% 96%);
  --color-muted-foreground: hsl(0 0% 45%);
  --color-border: hsl(0 0% 90%);
  --color-destructive: hsl(0 84% 60%);
  --color-success: hsl(142 76% 36%);

  /* Spacing Scale */
  --space-0: 0;
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.5rem;   /* 24px */
  --space-6: 2rem;     /* 32px */
  --space-8: 3rem;     /* 48px */
  --space-10: 4rem;    /* 64px */

  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 2rem;
  --text-4xl: 2.5rem;

  /* Radii */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px hsl(0 0% 0% / 0.05);
  --shadow-md: 0 4px 6px hsl(0 0% 0% / 0.07);
  --shadow-lg: 0 10px 15px hsl(0 0% 0% / 0.1);

  /* Motion */
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 400ms;
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Tailwind Config with Tokens

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "hsl(var(--color-primary))",
          hover: "hsl(var(--color-primary-hover))",
        },
        secondary: "hsl(var(--color-secondary))",
        background: "hsl(var(--color-background))",
        foreground: "hsl(var(--color-foreground))",
        muted: {
          DEFAULT: "hsl(var(--color-muted))",
          foreground: "hsl(var(--color-muted-foreground))",
        },
        border: "hsl(var(--color-border))",
        destructive: "hsl(var(--color-destructive))",
        success: "hsl(var(--color-success))",
      },
      spacing: {
        0: "var(--space-0)",
        1: "var(--space-1)",
        2: "var(--space-2)",
        3: "var(--space-3)",
        4: "var(--space-4)",
        5: "var(--space-5)",
        6: "var(--space-6)",
        8: "var(--space-8)",
        10: "var(--space-10)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        full: "var(--radius-full)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
      transitionDuration: {
        fast: "var(--duration-fast)",
        normal: "var(--duration-normal)",
        slow: "var(--duration-slow)",
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## Part 2: Theme Switching

### Dark Mode Tokens

```css
/* styles/tokens.css */
.dark {
  --color-primary: hsl(220 90% 66%);
  --color-primary-hover: hsl(220 90% 76%);
  --color-background: hsl(0 0% 9%);
  --color-foreground: hsl(0 0% 95%);
  --color-muted: hsl(0 0% 15%);
  --color-muted-foreground: hsl(0 0% 65%);
  --color-border: hsl(0 0% 20%);
}
```

### Theme Provider

```tsx
// components/theme-provider.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored) setTheme(stored);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
```

### Theme Toggle

```tsx
// components/theme-toggle.tsx
"use client";

import { useTheme } from "./theme-provider";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex gap-1 p-1 rounded-lg bg-muted">
      <button
        onClick={() => setTheme("light")}
        className={`p-2 rounded ${theme === "light" ? "bg-background shadow-sm" : ""}`}
      >
        <Sun className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`p-2 rounded ${theme === "dark" ? "bg-background shadow-sm" : ""}`}
      >
        <Moon className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={`p-2 rounded ${theme === "system" ? "bg-background shadow-sm" : ""}`}
      >
        <Monitor className="w-4 h-4" />
      </button>
    </div>
  );
}
```

---

## Part 3: Component Variants (CVA)

### Class Variance Authority

```bash
npm install class-variance-authority
```

```tsx
// components/button.tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Base styles
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary-hover",
        secondary: "bg-secondary text-white hover:opacity-90",
        outline: "border border-border bg-transparent hover:bg-muted",
        ghost: "hover:bg-muted",
        destructive: "bg-destructive text-white hover:opacity-90",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
```

### Usage

```tsx
<Button variant="default" size="lg">Primary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost" size="sm">Ghost</Button>
<Button variant="destructive">Delete</Button>
```

---

## Part 4: Compound Components

### Card Pattern

```tsx
// components/card.tsx
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn("rounded-lg border bg-background shadow-sm", className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: CardProps) {
  return <div className={cn("p-6 pb-0", className)} {...props} />;
}

function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-semibold", className)} {...props} />;
}

function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

function CardContent({ className, ...props }: CardProps) {
  return <div className={cn("p-6", className)} {...props} />;
}

function CardFooter({ className, ...props }: CardProps) {
  return <div className={cn("p-6 pt-0 flex items-center", className)} {...props} />;
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
```

### Usage

```tsx
<Card>
  <CardHeader>
    <CardTitle>Welcome</CardTitle>
    <CardDescription>Get started with your account</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Your dashboard content here.</p>
  </CardContent>
  <CardFooter>
    <Button>Continue</Button>
  </CardFooter>
</Card>
```

---

## Part 5: Slot Pattern

### Primitive with asChild

```tsx
// components/primitive.tsx
import { Slot } from "@radix-ui/react-slot";
import { forwardRef } from "react";

interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

const Box = forwardRef<HTMLDivElement, BoxProps>(
  ({ asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";
    return <Comp ref={ref} {...props} />;
  }
);

Box.displayName = "Box";

export { Box };
```

### Usage

```tsx
// Renders as div
<Box className="p-4">Content</Box>

// Renders as anchor (child takes over)
<Box asChild>
  <a href="/home">Link content</a>
</Box>
```

---

## Part 6: Figma-to-Code Workflow

### Design Handoff Process

1. **Design in Figma**
   - Use auto-layout for spacing
   - Name layers semantically
   - Use components and variants

2. **Extract Tokens**
   - Colors → CSS variables
   - Typography → Font scale
   - Spacing → Space scale

3. **Component Mapping**

| Figma Component | React Component |
|-----------------|-----------------|
| Button/Primary | `<Button variant="default">` |
| Button/Secondary | `<Button variant="secondary">` |
| Card | `<Card>` |
| Input | `<Input>` |

### Token Sync Tools

```bash
# Style Dictionary (tokens from JSON)
npm install style-dictionary

# Figma Tokens plugin → JSON → CSS
```

```json
// tokens.json (from Figma)
{
  "colors": {
    "primary": {
      "value": "#3B82F6",
      "type": "color"
    }
  },
  "spacing": {
    "4": {
      "value": "16px",
      "type": "spacing"
    }
  }
}
```

---

## Part 7: Storybook Integration

### Token Display Story

```tsx
// stories/tokens.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Design System/Tokens",
};

export default meta;

export const Colors: StoryObj = {
  render: () => (
    <div className="grid grid-cols-4 gap-4">
      <div className="p-4 bg-primary text-white rounded">Primary</div>
      <div className="p-4 bg-secondary text-white rounded">Secondary</div>
      <div className="p-4 bg-destructive text-white rounded">Destructive</div>
      <div className="p-4 bg-success text-white rounded">Success</div>
      <div className="p-4 bg-muted rounded">Muted</div>
      <div className="p-4 bg-background border rounded">Background</div>
    </div>
  ),
};

export const Spacing: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-2">
      {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
        <div key={n} className="flex items-center gap-4">
          <span className="w-12 text-sm">--space-{n}</span>
          <div className={`h-4 bg-primary`} style={{ width: `var(--space-${n})` }} />
        </div>
      ))}
    </div>
  ),
};

export const Typography: StoryObj = {
  render: () => (
    <div className="space-y-2">
      <p className="text-xs">text-xs (0.75rem)</p>
      <p className="text-sm">text-sm (0.875rem)</p>
      <p className="text-base">text-base (1rem)</p>
      <p className="text-lg">text-lg (1.125rem)</p>
      <p className="text-xl">text-xl (1.25rem)</p>
      <p className="text-2xl">text-2xl (1.5rem)</p>
      <p className="text-3xl">text-3xl (2rem)</p>
    </div>
  ),
};
```

### Theme Addon

```tsx
// .storybook/preview.tsx
import { ThemeProvider } from "../components/theme-provider";
import "../styles/tokens.css";

export const decorators = [
  (Story) => (
    <ThemeProvider>
      <Story />
    </ThemeProvider>
  ),
];

export const globalTypes = {
  theme: {
    name: "Theme",
    defaultValue: "light",
    toolbar: {
      items: ["light", "dark"],
      showName: true,
    },
  },
};
```

---

## Checklist

```markdown
- [ ] Design tokens defined (colors, spacing, typography)
- [ ] CSS custom properties created
- [ ] Tailwind config uses tokens
- [ ] Dark mode tokens defined
- [ ] Theme provider implemented
- [ ] Theme toggle component
- [ ] Component variants with CVA
- [ ] Compound component patterns
- [ ] Storybook token documentation
```

---

## Resources

- CVA: <https://cva.style/docs>
- Radix Primitives: <https://www.radix-ui.com/primitives>
- Style Dictionary: <https://amzn.github.io/style-dictionary>
- shadcn/ui: <https://ui.shadcn.com/>

---

## Related Skills

- `agents/storybook/SKILL.md` — Component documentation
- `agents/tailwind/SKILL.md` — Utility-first CSS
- `agents/a11y/SKILL.md` — Accessibility
