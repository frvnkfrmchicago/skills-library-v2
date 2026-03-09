---
name: storybook-design-systems
description: Component libraries, visual testing, design consistency. Full Storybook setup with autodocs, visual regression, and design token integration.
last_updated: 2026-03
---

# Storybook & Design Systems Skill

Component libraries, visual testing, design consistency.

---

## Context Questions

Before setting up Storybook, ask:

1. **Is a component library needed?** — Reusable components, single app, multiple apps
2. **What's the design system scope?** — Design tokens only, full component library, visual testing
3. **What's the team size?** — Solo (might be overkill), team (valuable for consistency)
4. **What testing is needed?** — Visual stories only, interaction tests, visual regression
5. **What's the project timeline?** — MVP (<1 week skip), long-term (worth setup)

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| Scope | Simple component docs ←→ Full design system |
| Testing | Visual stories ←→ Full Chromatic regression |
| Documentation | Minimal ←→ Autodocs with examples |
| Integration | Standalone ←→ CI/CD with visual testing |
| Maintenance | Set and forget ←→ Active curation |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| MVP or one-off project | Skip Storybook, ship faster, add later |
| Reusable component library | Full Storybook setup, interaction tests, autodocs |
| Multiple apps sharing design | Central Storybook, design tokens, Chromatic CI |
| Solo dev | Lightweight setup, focus on visual preview |
| Team collaboration | Autodocs, interaction testing, visual regression |
| Design handoff needed | Token stories, component variations, usage examples |

---

## TL;DR

**Setup time with AI (2025):** 20-30 minutes
**Per component:** 5-10 minutes (auto-generated stories)

| Use Case | Tool | Why |
|----------|------|-----|
| **Component library** | Storybook | Visual preview, testing |
| **Visual regression** | Chromatic | Catch UI changes |
| **Design tokens** | Tokens + Storybook | Single source of truth |
| **Iteration speed** | Storybook | Change once, see everywhere |

---

## When to Use Storybook

### Use Storybook If:
- ✅ Building reusable component library
- ✅ Multiple apps sharing design system
- ✅ Need visual testing
- ✅ Want design/dev handoff tool

### Skip Storybook If:
- ❌ One-off MVP (<1 week project)
- ❌ No reusable components
- ❌ Solo dev, simple landing page

---

## Quick Setup

```bash
# Initialize Storybook
npx storybook@latest init

# Run Storybook
npm run storybook
```

**AI auto-generates:**
- Component stories
- Design tokens
- Documentation

---

## Component Stories (Full Pattern)

### Basic Story

```tsx
// components/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Primary button for user actions. Supports multiple variants and sizes.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'destructive'],
      description: 'Visual style variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Button size',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: 'Click me',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Cancel',
    variant: 'secondary',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Learn more',
    variant: 'ghost',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Delete',
    variant: 'destructive',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Submit',
    disabled: true,
  },
};

// Show all variants at once
export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
};

// Show all sizes
export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};
```

### Complex Component Story

```tsx
// components/Card.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './Card';
import { Button } from './Button';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Container component for grouping related content.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Card content goes here.</p>
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  ),
};

export const ProductCard: Story = {
  render: () => (
    <Card className="w-[300px]">
      <img src="/placeholder.jpg" alt="Product" className="w-full h-48 object-cover rounded-t-lg" />
      <CardContent className="p-4">
        <h3 className="font-semibold">Product Name</h3>
        <p className="text-muted-foreground">$49.99</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full">Add to Cart</Button>
      </CardFooter>
    </Card>
  ),
};
```

---

## Interaction Testing

```tsx
// components/LoginForm.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect } from '@storybook/test';
import { LoginForm } from './LoginForm';

const meta: Meta<typeof LoginForm> = {
  title: 'Forms/LoginForm',
  component: LoginForm,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LoginForm>;

export const Empty: Story = {};

export const FilledForm: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Type in email
    await userEvent.type(
      canvas.getByLabelText(/email/i),
      'user@example.com'
    );

    // Type in password
    await userEvent.type(
      canvas.getByLabelText(/password/i),
      'password123'
    );

    // Verify form state
    await expect(canvas.getByLabelText(/email/i)).toHaveValue('user@example.com');
  },
};

export const SubmitForm: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByLabelText(/email/i), 'user@example.com');
    await userEvent.type(canvas.getByLabelText(/password/i), 'password123');

    // Click submit
    await userEvent.click(canvas.getByRole('button', { name: /log in/i }));

    // Check for success (adjust based on your component)
    // await expect(canvas.getByText(/welcome/i)).toBeInTheDocument();
  },
};

export const ValidationError: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Submit without filling form
    await userEvent.click(canvas.getByRole('button', { name: /log in/i }));

    // Check for error message
    await expect(canvas.getByText(/required/i)).toBeInTheDocument();
  },
};
```

---

## Design Tokens

### Token Definition

```typescript
// tokens/index.ts
export const tokens = {
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
    },
    secondary: {
      500: '#8b5cf6',
      600: '#7c3aed',
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      500: '#6b7280',
      900: '#111827',
    },
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
  },
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
  },
  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
  },
  radii: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  },
};
```

### Tokens Story (Visual Reference)

```tsx
// stories/DesignTokens.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { tokens } from '../tokens';

const meta: Meta = {
  title: 'Design System/Tokens',
  tags: ['autodocs'],
};

export default meta;

export const Colors: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold mb-4">Primary</h2>
        <div className="flex gap-2">
          {Object.entries(tokens.colors.primary).map(([key, value]) => (
            <div key={key} className="text-center">
              <div
                className="w-16 h-16 rounded-lg shadow-md"
                style={{ backgroundColor: value }}
              />
              <p className="mt-2 text-sm font-mono">{key}</p>
              <p className="text-xs text-gray-500">{value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  ),
};

export const Typography: StoryObj = {
  render: () => (
    <div className="space-y-4">
      {Object.entries(tokens.typography.fontSize).map(([key, value]) => (
        <div key={key} className="flex items-baseline gap-4">
          <span className="w-16 font-mono text-sm text-gray-500">{key}</span>
          <span style={{ fontSize: value }}>
            The quick brown fox jumps over the lazy dog
          </span>
        </div>
      ))}
    </div>
  ),
};

export const Spacing: StoryObj = {
  render: () => (
    <div className="space-y-4">
      {Object.entries(tokens.spacing).map(([key, value]) => (
        <div key={key} className="flex items-center gap-4">
          <span className="w-16 font-mono text-sm text-gray-500">{key}</span>
          <div
            className="bg-blue-500 h-4"
            style={{ width: value }}
          />
          <span className="text-sm">{value}</span>
        </div>
      ))}
    </div>
  ),
};
```

---

## Visual Regression Testing (Chromatic)

### Setup

```bash
# Install Chromatic
npm install -D chromatic

# Add to package.json scripts
```

```json
{
  "scripts": {
    "chromatic": "chromatic --project-token=$CHROMATIC_PROJECT_TOKEN"
  }
}
```

### CI Integration

```yaml
# .github/workflows/chromatic.yml
name: Chromatic

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  chromatic:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: npm ci
      - run: npm run build-storybook
      - uses: chromaui/action@latest
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
```

### What Chromatic Catches

| Change Type | Detection |
|-------------|-----------|
| Color changes | ✅ Visual diff |
| Layout shifts | ✅ Visual diff |
| Spacing changes | ✅ Visual diff |
| Font changes | ✅ Visual diff |
| Animation issues | ⚠️ Snapshot at rest |

---

## Autodocs Configuration

```typescript
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y', // Accessibility checks
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  docs: {
    autodocs: 'tag', // Auto-generate docs for components with 'autodocs' tag
  },
  staticDirs: ['../public'],
};

export default config;
```

```typescript
// .storybook/preview.ts
import type { Preview } from '@storybook/react';
import '../src/app/globals.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    docs: {
      toc: true, // Table of contents
    },
  },
};

export default preview;
```

---

## Component Documentation Template

Every component should follow this pattern:

```tsx
// ComponentName.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from './ComponentName';

const meta: Meta<typeof ComponentName> = {
  // 1. Category/Name structure
  title: 'Category/ComponentName',
  component: ComponentName,
  
  // 2. Enable autodocs
  tags: ['autodocs'],
  
  // 3. Component description
  parameters: {
    docs: {
      description: {
        component: 'What this component does and when to use it.',
      },
    },
  },
  
  // 4. Document all props
  argTypes: {
    propName: {
      control: 'select',
      options: ['option1', 'option2'],
      description: 'What this prop does',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'option1' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ComponentName>;

// 5. Default/Primary story
export const Default: Story = {
  args: {
    // Default props
  },
};

// 6. Variant stories
export const VariantA: Story = {
  args: {
    variant: 'a',
  },
};

// 7. All variants in one view
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      {/* Render all variants */}
    </div>
  ),
};
```

---

## Consistency Workflow

```
1. Define design tokens (15 min)
2. Build components in Storybook (see instantly)
3. Use components in app (import from library)
4. Change token → all apps update
5. Run Chromatic → catch visual regressions
```

**Time saved:** Massive on second+ project

---

## Checklist

- [ ] Storybook initialized
- [ ] All components have stories
- [ ] Autodocs enabled
- [ ] Design tokens documented
- [ ] Chromatic configured
- [ ] CI pipeline running
- [ ] Accessibility addon enabled

---

## Resources

- **Storybook:** https://storybook.js.org/
- **Chromatic:** https://www.chromatic.com/
- **Design Tokens:** https://storybook.js.org/tutorials/design-systems-for-developers/
- **Interaction Testing:** https://storybook.js.org/docs/writing-tests/interaction-testing

---

## Related Skills

- `workflows/consistency/SKILL.md` - Design system validation
- `workflows/product-spec/SKILL.md` - Design planning
- `agents/testing/SKILL.md` - Testing patterns

