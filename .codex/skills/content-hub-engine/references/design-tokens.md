# Design Tokens

Token architecture for the content hub interface. These tokens are extracted
from the Grazzhopper Content Hub implementation. Replace values with your
brand's design system using the `experience-designing` skill.

## Color Tokens

### Surface Colors

```css
:root {
  /* Backgrounds */
  --surface-base:     #0a0412;   /* Page background */
  --surface-raised:   #0f0818;   /* Cards, modals */
  --surface-overlay:  rgba(37, 1, 46, 0.5);  /* Inputs, dropdowns */
  --surface-sidebar:  rgba(15, 8, 24, 0.95);  /* Sidebar panel */
  --surface-glass:    rgba(88, 54, 116, 0.42); /* Glassmorphism inputs */

  /* Brand Colors */
  --brand-primary:    #25012e;   /* Deep cosmic purple */
  --brand-accent:     #33fecc;   /* Mint accent */
  --brand-secondary:  #cc99ff;   /* Lavender */
  --brand-warm:       #fde9c3;   /* Warm cream (text on dark) */

  /* Status Colors */
  --status-pending:   #f5a623;   /* Amber */
  --status-approved:  #33fecc;   /* Mint (matches brand accent) */
  --status-published: #33fecc;   /* Mint with full border */
  --status-failed:    #ff6b6b;   /* Red */

  /* Segment Colors */
  --segment-news:       #33fecc;
  --segment-engage:     #cc99ff;
  --segment-facts:      #fde9c3;
  --segment-regulation: #ff6b6b;
  --segment-studies:    #64c8ff;
}
```

### Interactive State Colors

```css
:root {
  /* Borders */
  --border-default:   rgba(204, 153, 255, 0.12);
  --border-hover:     rgba(204, 153, 255, 0.25);
  --border-focus:     rgba(51, 254, 204, 0.3);
  --border-active:    rgba(51, 254, 204, 0.5);

  /* Text */
  --text-primary:     #fde9c3;
  --text-secondary:   rgba(204, 153, 255, 0.6);
  --text-muted:       rgba(204, 153, 255, 0.4);
  --text-accent:      #33fecc;
  --text-label:       #cc99ff;

  /* Shadows */
  --shadow-card:      0 4px 20px rgba(0, 0, 0, 0.3);
  --shadow-modal:     0 20px 60px rgba(0, 0, 0, 0.6);
  --shadow-glow-mint: 0 0 15px rgba(51, 254, 204, 0.3);
  --shadow-glow-purple: 0 0 15px rgba(204, 153, 255, 0.3);
}
```

## Typography Tokens

```css
:root {
  /* Font Families */
  --font-display:   'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-body:      'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono:      'JetBrains Mono', 'Fira Code', monospace;

  /* Font Sizes */
  --text-xs:    10px;
  --text-sm:    11px;
  --text-base:  13px;
  --text-md:    14px;
  --text-lg:    16px;
  --text-xl:    18px;
  --text-2xl:   22px;
  --text-3xl:   28px;
  --text-hero:  34px;   /* Default headline size on canvas */

  /* Font Weights */
  --weight-normal:   400;
  --weight-medium:   500;
  --weight-semibold: 600;
  --weight-bold:     700;
  --weight-black:    800;

  /* Line Heights */
  --leading-tight:   1.2;
  --leading-normal:  1.4;
  --leading-relaxed: 1.6;

  /* Letter Spacing */
  --tracking-tight:  -0.01em;
  --tracking-normal: 0;
  --tracking-wide:   0.5px;
  --tracking-caps:   1px;    /* For uppercase labels */
}
```

## Spacing Tokens

```css
:root {
  --space-1:   4px;
  --space-2:   6px;
  --space-3:   8px;
  --space-4:   10px;
  --space-5:   12px;
  --space-6:   14px;
  --space-7:   16px;
  --space-8:   18px;
  --space-9:   20px;
  --space-10:  24px;
  --space-12:  28px;
  --space-14:  32px;
  --space-16:  40px;
}
```

## Border Radius Tokens

```css
:root {
  --radius-sm:    6px;
  --radius-md:    8px;
  --radius-lg:    10px;
  --radius-xl:    12px;
  --radius-2xl:   16px;
  --radius-full:  50%;
}
```

## Motion Tokens

```css
:root {
  /* Durations */
  --duration-fast:    150ms;
  --duration-normal:  200ms;
  --duration-slow:    300ms;
  --duration-flash:   1200ms;  /* Field auto-fill flash */

  /* Easings */
  --ease-default:     ease;
  --ease-in-out:      cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring:      cubic-bezier(0.34, 1.56, 0.64, 1);  /* Bounce */

  /* Transitions */
  --transition-base:  all var(--duration-normal) var(--ease-default);
  --transition-fast:  all var(--duration-fast) var(--ease-default);
}
```

## Z-Index Scale

```css
:root {
  --z-base:     1;
  --z-card:     10;
  --z-sidebar:  100;
  --z-header:   200;
  --z-modal:    1000;
  --z-overlay:  999;
  --z-creator:  1100;
  --z-toast:    2000;
}
```

## Component Token Mappings

### Post Card

```css
.post-card {
  background: var(--surface-raised);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  transition: var(--transition-base);
  /* Dimensions: 180px wide, auto height */
}
.post-card:hover {
  transform: translateY(-2px);
  border-color: var(--border-hover);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
}
```

### Button Variants

```css
.btn-mint {
  background: var(--brand-accent);
  color: var(--surface-base);
  font-weight: var(--weight-black);
  border: none;
  border-radius: var(--radius-lg);
  padding: var(--space-5) var(--space-7);
  transition: var(--transition-fast);
}
.btn-purple {
  background: rgba(204, 153, 255, 0.12);
  color: var(--brand-secondary);
  border: 1px solid rgba(204, 153, 255, 0.3);
  border-radius: var(--radius-lg);
  padding: var(--space-5) var(--space-7);
  transition: var(--transition-fast);
}
.btn-ghost {
  background: none;
  color: var(--text-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-5) var(--space-7);
  transition: var(--transition-fast);
}
```

### Input Fields

```css
.input-field {
  background: var(--surface-glass);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  color: var(--text-primary);
  font-size: var(--text-base);
  padding: var(--space-5) var(--space-6);
  font-family: var(--font-body);
  transition: var(--transition-fast);
}
.input-field:focus {
  border-color: var(--border-focus);
  outline: none;
  box-shadow: 0 0 0 2px rgba(51, 254, 204, 0.1);
}
```

### Section Labels

```css
.section-label {
  font-size: var(--text-xs);
  font-weight: var(--weight-black);
  color: var(--text-label);
  text-transform: uppercase;
  letter-spacing: var(--tracking-caps);
  margin-bottom: var(--space-3);
}
```

### Segment Badges

```css
.badge-news       { background: rgba(51, 254, 204, 0.15); color: #33fecc; }
.badge-engage     { background: rgba(204, 153, 255, 0.15); color: #cc99ff; }
.badge-facts      { background: rgba(253, 233, 195, 0.15); color: #fde9c3; }
.badge-regulation { background: rgba(255, 107, 107, 0.15); color: #ff6b6b; }
.badge-studies    { background: rgba(100, 200, 255, 0.15); color: #64c8ff; }

.badge {
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
}
```

### Canvas Tokens (Creator)

```css
.post-frame {
  background: #000;
  border-radius: var(--radius-xl);
  overflow: hidden;
  position: relative;
}
.headline-text {
  font-family: var(--font-display);
  font-weight: var(--weight-black);
  color: white;
  text-transform: uppercase;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
  line-height: var(--leading-tight);
  /* Default size: var(--text-hero) = 34px, adjustable via slider */
}
.headline-text .hl {
  color: var(--brand-secondary);  /* #cc99ff — highlighted words */
}
.post-gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  /* Default: linear-gradient(to top, rgba(10,1,15,0.985) 0%,
     rgba(16,1,22,0.85) 45%, transparent 100%) */
}
```

## Field Auto-Fill Flash

When the AI assistant populates a field, apply this flash animation:

```css
.field-flash {
  box-shadow: 0 0 16px rgba(51, 254, 204, 0.6),
              inset 0 0 8px rgba(51, 254, 204, 0.15);
  transition: box-shadow var(--duration-fast) var(--ease-default);
}
/* Remove after 1200ms */
```

## Dark Mode

The content hub is dark-mode only by default (dark surface base). If the
brand requires a light mode option, invert the surface and text token
values using a `[data-theme="light"]` selector on `:root`.
