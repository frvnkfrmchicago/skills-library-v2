---
name: testing-enforcing
description: >
  Enforces comprehensive test strategy including unit tests, integration
  tests, E2E tests, and coverage targets for Vitest, Jest, Playwright,
  and pytest projects. Provides test patterns, setup guides, and coverage
  gap analysis. Use when adding tests, reviewing test coverage, setting
  up a testing framework, or when user mentions testing, TDD, coverage,
  or QA.
---

# Testing Enforcing

Tests are documentation. Tests are safety nets. Tests enable speed.
Untested code is broken code waiting to happen.

---

## Phase 1: Context Assessment

Before writing tests, determine:

Run:
```bash
# What framework?
test -f next.config.ts -o -f next.config.js && echo "Next.js detected"
test -f vite.config.ts && echo "Vite detected"
test -f app.json && echo "Expo/React Native detected"
test -f manage.py && echo "Django detected"
test -f requirements.txt && grep -q "fastapi\|flask" requirements.txt 2>/dev/null && echo "FastAPI/Flask detected"

# Current test setup?
test -f vitest.config.ts && echo "Vitest configured" || echo "No Vitest config"
test -f jest.config.ts -o -f jest.config.js && echo "Jest configured" || echo "No Jest config"
test -f playwright.config.ts && echo "Playwright configured" || echo "No Playwright config"
test -f pytest.ini -o -f pyproject.toml && echo "pytest may be configured"

# Existing tests?
find src/ -name "*.test.*" -o -name "*.spec.*" 2>/dev/null | wc -l
find . -name "test_*.py" -o -name "*_test.py" 2>/dev/null | grep -v venv | wc -l
```

---

## Phase 2: Coverage Gap Analysis

Run:
```bash
# Node.js coverage
npx vitest run --coverage 2>/dev/null || npx jest --coverage 2>/dev/null

# Python coverage
pytest --cov 2>/dev/null || python -m pytest --cov 2>/dev/null

# Find files WITHOUT corresponding test files
for f in $(find src/ -name "*.ts" -o -name "*.tsx" | grep -v "test\|spec\|__tests__\|\.d\.ts"); do
  base=$(basename "$f" | sed 's/\.tsx\?//')
  dir=$(dirname "$f")
  if ! find "$dir" -name "${base}.test.*" -o -name "${base}.spec.*" 2>/dev/null | grep -q .; then
    echo "❌ NO TEST: $f"
  fi
done
```

### Coverage Targets

| App Maturity | Unit | Integration | E2E |
|--------------|------|-------------|-----|
| MVP | 50% | 30% | Critical paths only |
| Production | 70% | 50% | All user flows |
| Enterprise | 80%+ | 70% | Full coverage |

---

## Phase 3: What to Test (Priority Order)

### 🔴 Always Test (Block ship without these)
- Authentication flows (login, logout, signup, password reset)
- Payment processing (charges, refunds, webhooks)
- Data validation (API input/output schemas)
- Error handling (what users see on failure)
- API endpoints (response shapes, status codes)

### 🟡 Usually Test
- Form submissions and validation
- Navigation flows and routing
- State management (stores, contexts)
- User permissions and role-based access

### 🟢 Nice to Have
- UI animations and transitions
- Edge cases (empty states, max length inputs)
- Performance benchmarks

---

## Phase 4: Test Patterns

### Unit Test (Vitest / Jest)

```typescript
import { describe, it, expect, vi } from 'vitest'
import { calculatePrice } from './pricing'

describe('calculatePrice', () => {
  it('applies discount correctly', () => {
    expect(calculatePrice(100, 0.1)).toBe(90)
  })

  it('handles zero discount', () => {
    expect(calculatePrice(100, 0)).toBe(100)
  })

  it('throws on negative price', () => {
    expect(() => calculatePrice(-1, 0)).toThrow()
  })
})
```

### Component Test (React Testing Library)

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click</Button>)
    fireEvent.click(screen.getByText('Click'))
    expect(onClick).toHaveBeenCalledOnce()
  })
})
```

### API Integration Test

```typescript
import { describe, it, expect } from 'vitest'

describe('POST /api/users', () => {
  it('creates user with valid data', async () => {
    const res = await fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', name: 'Test' }),
    })
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data).toHaveProperty('id')
  })

  it('rejects invalid email', async () => {
    const res = await fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify({ email: 'invalid', name: 'Test' }),
    })
    expect(res.status).toBe(400)
  })
})
```

### E2E Test (Playwright)

```typescript
import { test, expect } from '@playwright/test'

test.describe('Checkout flow', () => {
  test('completes purchase', async ({ page }) => {
    await page.goto('/products/123')
    await page.click('button:has-text("Add to Cart")')
    await page.click('a:has-text("Checkout")')
    await page.fill('[name="email"]', 'test@example.com')
    await page.click('button:has-text("Pay Now")')
    await expect(page).toHaveURL('/order-confirmation')
  })
})
```

### Python Unit Test (pytest)

```python
import pytest
from app.pricing import calculate_price

def test_applies_discount():
    assert calculate_price(100, 0.1) == 90

def test_handles_zero_discount():
    assert calculate_price(100, 0) == 100

def test_raises_on_negative_price():
    with pytest.raises(ValueError):
        calculate_price(-1, 0)
```

---

## Phase 5: Quick Setup

### Vitest (Node.js)

```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

### Playwright (E2E)

```bash
pnpm add -D @playwright/test
npx playwright install
```

### pytest (Python)

```bash
pip install pytest pytest-cov pytest-asyncio
```

---

## ⛔ STOP GATE — Test Coverage
DO NOT mark testing as complete without:
1. Running the coverage gap analysis
2. Listing untested critical paths (auth, payments, API endpoints)
3. Achieving at minimum the MVP coverage targets

---

## Output Format

```markdown
## Testing Report — [Project Name]

### Coverage Summary
| Category | Current | Target | Gap |
|----------|---------|--------|-----|
| Unit | X% | Y% | Z% |
| Integration | X% | Y% | Z% |
| E2E | X paths | Y paths | Z paths |

### Critical Tests Needed
- [ ] [Test 1 — what it validates]
- [ ] [Test 2 — what it validates]

### Test Plan (Priority Order)
1. [Priority 1: auth flow tests]
2. [Priority 2: API endpoint tests]
3. [Priority 3: component tests]
```
