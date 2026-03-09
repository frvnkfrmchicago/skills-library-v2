---
name: accessibility
description: ARIA patterns, keyboard navigation, focus management, and screen reader support.
last_updated: 2026-03
owner: Frank
---

# Accessibility (a11y)

Build for everyone.

---

## Context Questions

Before implementing accessibility:

1. **What's the user base?** — General public, enterprise, government
2. **What's the compliance level?** — Best effort, WCAG AA, WCAG AAA
3. **What components exist?** — Modals, tabs, menus, forms
4. **What's the testing setup?** — Manual, axe-core, screen reader
5. **What's the framework?** — Radix (built-in a11y), custom (need patterns)

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Compliance** | Best effort ←→ WCAG AA ←→ WCAG AAA |
| **Keyboard** | Basic tab ←→ Full arrow key support |
| **Screen Reader** | Alt text only ←→ Full ARIA |
| **Motion** | Full animations ←→ Reduced motion support |
| **Testing** | Manual ←→ Automated (axe-core) |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Government/enterprise | WCAG AA mandatory |
| Using Radix/Headless UI | A11y mostly handled |
| Custom components | Add ARIA roles, keyboard handlers |
| Modals/dialogs | Focus trap, escape key, aria-modal |
| Forms | Labels, error states, aria-describedby |
| Motion-heavy | prefers-reduced-motion support |

---

## TL;DR

| Requirement | Standard |
|-------------|----------|
| **Color contrast** | 4.5:1 for text, 3:1 for large text |
| **Keyboard navigation** | All interactive elements focusable |
| **Screen readers** | Proper ARIA labels and roles |
| **Focus management** | Visible focus, logical order |
| **Motion** | Respect prefers-reduced-motion |

---

## Quick Wins

### 1. Semantic HTML First

```tsx
// ❌ Bad
<div onClick={handleClick}>Click me</div>
<div class="header">Navigation</div>

// ✅ Good
<button onClick={handleClick}>Click me</button>
<nav aria-label="Main navigation">...</nav>
```

### 2. Always Add Alt Text

```tsx
// ❌ Bad
<img src="/hero.jpg" />

// ✅ Good - Informative
<img src="/hero.jpg" alt="Team collaborating in modern office" />

// ✅ Good - Decorative
<img src="/decorative-line.svg" alt="" role="presentation" />
```

### 3. Label All Inputs

```tsx
// ❌ Bad
<input type="email" placeholder="Email" />

// ✅ Good - Visible label
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// ✅ Good - Hidden label (if design requires)
<label htmlFor="email" className="sr-only">Email</label>
<input id="email" type="email" placeholder="Email" />
```

### 4. Announce Dynamic Content

```tsx
// Region that updates (search results, notifications)
<div role="status" aria-live="polite">
  {searchResults.length} results found
</div>

// Urgent announcements
<div role="alert">
  Your session will expire in 5 minutes
</div>
```

---

## Screen Reader Only Text

```css
/* Tailwind includes this as 'sr-only' */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

```tsx
// Usage
<button>
  <TrashIcon />
  <span className="sr-only">Delete item</span>
</button>
```

---

## ARIA Patterns

### Buttons

```tsx
// Icon-only button
<button aria-label="Close dialog">
  <XIcon aria-hidden="true" />
</button>

// Toggle button
<button
  aria-pressed={isPressed}
  onClick={() => setIsPressed(!isPressed)}
>
  {isPressed ? 'Mute' : 'Unmute'}
</button>

// Loading button
<button disabled={isLoading} aria-busy={isLoading}>
  {isLoading ? 'Saving...' : 'Save'}
</button>
```

### Links

```tsx
// External link
<a 
  href="https://example.com" 
  target="_blank" 
  rel="noopener noreferrer"
>
  Visit Example
  <span className="sr-only">(opens in new tab)</span>
</a>

// Link with icon
<a href="/download">
  Download
  <DownloadIcon aria-hidden="true" />
</a>
```

### Form Fields

```tsx
// Required field
<label htmlFor="name">
  Name <span aria-hidden="true">*</span>
</label>
<input 
  id="name" 
  type="text" 
  required 
  aria-required="true"
/>

// Field with error
<label htmlFor="email">Email</label>
<input 
  id="email" 
  type="email" 
  aria-invalid={!!error}
  aria-describedby={error ? "email-error" : undefined}
/>
{error && (
  <p id="email-error" role="alert">
    {error}
  </p>
)}

// Field with description
<label htmlFor="password">Password</label>
<input 
  id="password" 
  type="password" 
  aria-describedby="password-hint"
/>
<p id="password-hint" className="text-sm text-gray-500">
  Must be at least 8 characters
</p>
```

### Navigation

```tsx
// Main navigation
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/" aria-current={isHome ? "page" : undefined}>Home</a></li>
    <li><a href="/about" aria-current={isAbout ? "page" : undefined}>About</a></li>
  </ul>
</nav>

// Breadcrumbs
<nav aria-label="Breadcrumb">
  <ol className="flex">
    <li><a href="/">Home</a></li>
    <li aria-hidden="true">/</li>
    <li><a href="/products">Products</a></li>
    <li aria-hidden="true">/</li>
    <li aria-current="page">Widget</li>
  </ol>
</nav>
```

---

## Interactive Components

### Modal/Dialog

```tsx
'use client'

import { useEffect, useRef } from 'react'

interface DialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Dialog({ isOpen, onClose, title, children }: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<Element | null>(null)

  useEffect(() => {
    if (isOpen) {
      // Store current focus
      previousActiveElement.current = document.activeElement
      // Focus dialog
      dialogRef.current?.focus()
    } else {
      // Restore focus
      (previousActiveElement.current as HTMLElement)?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50"
      aria-modal="true"
      role="dialog"
      aria-labelledby="dialog-title"
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50"
        aria-hidden="true"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 max-w-md w-full"
      >
        <h2 id="dialog-title" className="text-xl font-semibold">
          {title}
        </h2>
        {children}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4"
        >
          <XIcon />
        </button>
      </div>
    </div>
  )
}
```

### Tabs

```tsx
'use client'

import { useState } from 'react'

interface Tab {
  id: string
  label: string
  content: React.ReactNode
}

export function Tabs({ tabs }: { tabs: Tab[] }) {
  const [activeTab, setActiveTab] = useState(tabs[0].id)

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let newIndex = index
    
    if (e.key === 'ArrowRight') {
      newIndex = (index + 1) % tabs.length
    } else if (e.key === 'ArrowLeft') {
      newIndex = (index - 1 + tabs.length) % tabs.length
    } else if (e.key === 'Home') {
      newIndex = 0
    } else if (e.key === 'End') {
      newIndex = tabs.length - 1
    } else {
      return
    }
    
    e.preventDefault()
    setActiveTab(tabs[newIndex].id)
    document.getElementById(`tab-${tabs[newIndex].id}`)?.focus()
  }

  return (
    <div>
      <div role="tablist" aria-label="Content tabs" className="flex border-b">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`px-4 py-2 ${
              activeTab === tab.id ? 'border-b-2 border-blue-500' : ''
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${tab.id}`}
          hidden={activeTab !== tab.id}
          tabIndex={0}
          className="p-4"
        >
          {tab.content}
        </div>
      ))}
    </div>
  )
}
```

### Dropdown Menu

```tsx
'use client'

import { useState, useRef, useEffect } from 'react'

export function DropdownMenu({ trigger, items }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex(prev => 
          prev < items.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : items.length - 1
        )
        break
      case 'Escape':
        setIsOpen(false)
        triggerRef.current?.focus()
        break
      case 'Enter':
      case ' ':
        if (focusedIndex >= 0) {
          items[focusedIndex].onClick()
          setIsOpen(false)
        }
        break
    }
  }

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        {trigger}
      </button>
      
      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-orientation="vertical"
          onKeyDown={handleKeyDown}
          className="absolute mt-2 bg-white shadow-lg rounded"
        >
          {items.map((item, index) => (
            <button
              key={item.id}
              role="menuitem"
              tabIndex={focusedIndex === index ? 0 : -1}
              onClick={() => {
                item.onClick()
                setIsOpen(false)
              }}
              className={`block w-full px-4 py-2 text-left ${
                focusedIndex === index ? 'bg-gray-100' : ''
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## Keyboard Navigation

### Focus Management

```tsx
// Trap focus within a component
import { useEffect, useRef } from 'react'

export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isActive) return

    const container = containerRef.current
    if (!container) return

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    firstElement?.focus()

    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [isActive])

  return containerRef
}
```

### Skip Links

```tsx
// Add to layout
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:shadow"
>
  Skip to main content
</a>

// Target
<main id="main-content" tabIndex={-1}>
  ...
</main>
```

### Focus Visible

```css
/* Only show focus ring for keyboard navigation */
:focus {
  outline: none;
}

:focus-visible {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}

/* Tailwind */
.focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
```

---

## Motion & Animation

### Respect User Preferences

```css
/* CSS */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

```tsx
// React hook
function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return prefersReducedMotion
}

// Usage
function AnimatedComponent() {
  const prefersReducedMotion = usePrefersReducedMotion()
  
  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
    >
      Content
    </motion.div>
  )
}
```

---

## Color & Contrast

### Contrast Requirements

| Element | Minimum Ratio |
|---------|---------------|
| Normal text | 4.5:1 |
| Large text (18px+ bold, 24px+ regular) | 3:1 |
| UI components, icons | 3:1 |
| Non-text (graphs, charts) | 3:1 |

### Don't Rely on Color Alone

```tsx
// ❌ Bad - Color only
<span className={isError ? 'text-red-500' : 'text-green-500'}>
  {status}
</span>

// ✅ Good - Color + icon + text
<span className={isError ? 'text-red-500' : 'text-green-500'}>
  {isError ? <XIcon /> : <CheckIcon />}
  {isError ? 'Error: Invalid input' : 'Success'}
</span>
```

---

## Testing Accessibility

### Automated Testing

```bash
# Install axe-core for Playwright
npm install -D @axe-core/playwright
```

```typescript
// e2e/a11y.spec.ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility', () => {
  test('homepage has no a11y violations', async ({ page }) => {
    await page.goto('/')
    
    const results = await new AxeBuilder({ page }).analyze()
    
    expect(results.violations).toEqual([])
  })

  test('login page has no a11y violations', async ({ page }) => {
    await page.goto('/login')
    
    const results = await new AxeBuilder({ page })
      .exclude('.third-party-widget') // Exclude if needed
      .analyze()
    
    expect(results.violations).toEqual([])
  })
})
```

### Manual Testing Checklist

```
□ Navigate entire page with Tab key only
□ Activate all buttons/links with Enter/Space
□ Use arrow keys in menus, tabs, etc.
□ Close modals with Escape key
□ Test with screen reader (VoiceOver, NVDA)
□ Test at 200% zoom
□ Test with high contrast mode
□ Test with prefers-reduced-motion
```

### Browser Tools

- **Chrome DevTools** → Lighthouse → Accessibility
- **axe DevTools** extension
- **WAVE** extension
- **Accessibility Insights** extension

---

## Review Checklist

- [ ] **All images have alt text** - Informative or empty for decorative
- [ ] **All inputs have labels** - Visible or sr-only
- [ ] **Color contrast passes** - 4.5:1 minimum
- [ ] **Keyboard navigation works** - All interactive elements reachable
- [ ] **Focus visible** - Clear focus indicator
- [ ] **Skip links present** - For keyboard users
- [ ] **ARIA used correctly** - Not overused, semantic HTML first
- [ ] **Motion respects preference** - prefers-reduced-motion
- [ ] **Automated tests pass** - axe-core or similar

---

## Prompt Examples

```
"Add proper ARIA labels to this navigation component"

"Make this modal accessible with focus trapping and keyboard support"

"Add accessibility to this dropdown menu with keyboard navigation"

"Create an accessible tab component with proper ARIA roles"

"Add skip links and focus management to this layout"
```
