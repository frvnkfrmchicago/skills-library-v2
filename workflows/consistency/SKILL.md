# Consistency & Design System Checker

**Validate UI consistency across projects automatically.**

---

## Context Questions

Before running consistency checks, ask:

1. **What's the project scope?** — Single project, design system, multiple apps
2. **What inconsistencies are suspected?** — Colors, typography, spacing, component usage
3. **What's the enforcement level?** — Audit only, pre-commit hooks, CI blocking
4. **What's the design token source?** — Figma, code-first, Tailwind config
5. **What's the team size?** — Solo (minimal checks), team (strict enforcement)

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| Scope | Single file ←→ Multi-project |
| Enforcement | Manual review ←→ Automated CI |
| Strictness | Warnings only ←→ Block on violations |
| Coverage | Core tokens ←→ Full design system |
| Automation | Scripts ←→ ESLint plugins |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Solo dev, MVP | Light checks, focus on shipping, standardize later |
| Team project | Pre-commit hooks, design tokens, consistent review |
| Multiple apps | Central design system, Storybook, automated validation |
| Colors drifting | Color validator script, ESLint no-hardcoded-colors |
| Components inconsistent | Component inventory, Storybook visual regression |
| Pre-deploy check | Full consistency audit, Chromatic visual testing |

---

## TL;DR

**Problem:** Colors, fonts, spacing drift across pages/projects

**Solution:** Automated checks + design tokens

| Check | Tool | Frequency |
|-------|------|-----------|
| **Color usage** | Script | Every deploy |
| **Typography** | ESLint plugin | On save |
| **Spacing** | Script | Every deploy |
| **Component usage** | Storybook | Manual review |

---

## Part 1: Design Tokens (Source of Truth)

```typescript
// design-system/tokens.ts
export const tokens = {
  colors: {
    // Brand
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#ec4899',
    
    // Neutrals
    background: '#ffffff',
    surface: '#f9fafb',
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
      tertiary: '#9ca3af',
    },
    
    // Semantic
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
  },
  
  typography: {
    fonts: {
      sans: 'Inter, system-ui, sans-serif',
      mono: 'Fira Code, monospace',
    },
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
    },
  },
  
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
};
```

---

## Part 2: Automated Consistency Checks

### Color Validator

```typescript
// scripts/check-colors.ts
import { tokens } from '../design-system/tokens';
import glob from 'glob';
import fs from 'fs';

const validColors = Object.values(tokens.colors).flat();

glob('**/*.tsx', (err, files) => {
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    
    // Find hex colors
    const hexColors = content.match(/#[0-9a-f]{6}/gi) || [];
    
    hexColors.forEach(color => {
      if (!validColors.includes(color.toLowerCase())) {
        console.error(`❌ ${file}: Invalid color ${color}`);
        console.log(`   Use tokens.colors instead`);
      }
    });
  });
});
```

**Run:** `npm run check:colors` before deploy

---

## Part 3: ESLint Rules

```javascript
// .eslintrc.js
module.exports = {
  rules: {
    'no-hardcoded-colors': {
      create(context) {
        return {
          Literal(node) {
            if (typeof node.value === 'string' && /^#[0-9a-f]{6}$/i.test(node.value)) {
              context.report({
                node,
                message: 'Use design tokens instead of hardcoded colors',
              });
            }
          },
        };
      },
    },
  },
};
```

---

## Part 4: Component Inventory

```typescript
// scripts/component-inventory.ts
/**
 * Scans codebase for component usage
 * Outputs: Which components are used where
 */

import glob from 'glob';
import fs from 'fs';

const components = new Map<string, string[]>();

glob('app/**/*.tsx', (err, files) => {
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    
    // Find component imports
    const imports = content.match(/import.*from ['"]@\/components\/(.*)['"]/g) || [];
    
    imports.forEach(imp => {
      const component = imp.match(/components\/(.*)['"]/)?.[1];
      if (component) {
        if (!components.has(component)) {
          components.set(component, []);
        }
        components.get(component)?.push(file);
      }
    });
  });
  
  console.log('Component Usage:\n');
  components.forEach((files, component) => {
    console.log(`${component}: ${files.length} files`);
  });
});
```

---

## Part 5: Storybook Integration

### Visual Regression Testing

```bash
npm install @storybook/test-runner playwright
```

```typescript
// .storybook/test-runner.ts
import type { TestRunnerConfig } from '@storybook/test-runner';

const config: TestRunnerConfig = {
  async postRender(page) {
    // Take screenshot
    await page.screenshot({ path: `screenshots/${page.url()}.png` });
  },
};

export default config;
```

**Run:** `npm run test-storybook` → catches visual changes

---

## Part 6: Pre-Commit Hooks

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run check:colors && npm run check:typography"
    }
  }
}
```

**Prevents:** Committing inconsistent code

---

## Part 7: Consistency Checklist

```markdown
## Before Every Deploy

- [ ] Run color validator
- [ ] Run typography checker
- [ ] Review component inventory
- [ ] Check Storybook visual diffs
- [ ] Verify design tokens up to date

## Weekly

- [ ] Audit for hardcoded values
- [ ] Update component documentation
- [ ] Review unused components

## Per Project

- [ ] Import design tokens
- [ ] Reference Storybook components
- [ ] Setup ESLint rules
```

---

## Part 8: Quick Fix Script

```typescript
// scripts/fix-colors.ts
import { tokens } from '../design-system/tokens';
import glob from 'glob';
import fs from 'fs';

const colorMap = {
  '#6366f1': 'tokens.colors.primary',
  '#ffffff': 'tokens.colors.background',
  // Add all your colors
};

glob('**/*.tsx', (err, files) => {
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf-8');
    
    Object.entries(colorMap).forEach(([hex, token]) => {
      content = content.replace(new RegExp(hex, 'gi'), `{${token}}`);
    });
    
    fs.writeFileSync(file, content);
  });
});
```

---

## Resources

- Design Tokens: https://github.com/design-tokens/community-group
- ESLint Custom Rules: https://eslint.org/docs/developer-guide/working-with-rules

---

## Related Skills

- `workflows/storybook/SKILL.md` - Component library
- `agents/google-workspace/SKILL.md` - Tokens in Sheets
- `workflows/ship-fast/SKILL.md` - Consistency in MVP
