---
name: testing
description: Unit testing, component testing, and E2E testing patterns for production apps.
last_updated: 2026-03
owner: Frank
---

# Testing

Tests that matter, patterns that work.

---

## Context Questions

Before implementing tests:

1. **What's the app type?** — MVP, production SaaS, enterprise, open source
2. **What's the testing maturity?** — None, some unit tests, CI/CD integrated
3. **What needs coverage?** — Critical paths, full coverage, regression prevention
4. **What's the test environment?** — Local, CI, multiple browsers, mobile
5. **What's the development pace?** — Move fast / break things, vs. stability-first

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Type** | Unit ←→ Integration ←→ E2E |
| **Coverage** | Critical paths only ←→ High coverage (80%+) |
| **Speed** | Fast (unit) ←→ Slow (E2E) |
| **Confidence** | Low (mocked) ←→ High (real environment) |
| **Maintenance** | Low effort ←→ High effort |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| MVP/prototype | Unit tests for utils only, skip E2E |
| Production SaaS | 80% coverage, critical path E2E |
| Enterprise | 90%+ coverage, multi-browser E2E |
| Open source | High coverage, CI required for PRs |
| Rapid iteration | Focus on integration tests |
| Payment/auth flows | Always E2E test |

---

## TL;DR

| Test Type | Tool | What It Tests |
|-----------|------|---------------|
| **Unit** | Vitest | Functions, hooks, utilities |
| **Component** | Testing Library | React components in isolation |
| **Integration** | Testing Library | Components working together |
| **E2E** | Playwright | Full user flows in real browser |

---

## Setup

### Install Testing Stack

```bash
# Unit + Component testing
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom

# E2E testing
npm install -D @playwright/test
npx playwright install
```

### Vitest Config

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### Test Setup File

```typescript
// tests/setup.ts
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Cleanup after each test
afterEach(() => {
  cleanup()
})
```

### Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## Unit Testing

### Testing Pure Functions

```typescript
// utils/format.ts
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
```

```typescript
// utils/format.test.ts
import { describe, it, expect } from 'vitest'
import { formatCurrency, slugify } from './format'

describe('formatCurrency', () => {
  it('formats positive numbers', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56')
  })

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00')
  })

  it('formats negative numbers', () => {
    expect(formatCurrency(-50)).toBe('-$50.00')
  })
})

describe('slugify', () => {
  it('converts to lowercase', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('replaces spaces with dashes', () => {
    expect(slugify('my blog post')).toBe('my-blog-post')
  })

  it('removes special characters', () => {
    expect(slugify('Hello! World?')).toBe('hello-world')
  })

  it('trims leading/trailing dashes', () => {
    expect(slugify('--hello--')).toBe('hello')
  })
})
```

### Testing Async Functions

```typescript
// api/users.ts
export async function fetchUser(id: string) {
  const res = await fetch(`/api/users/${id}`)
  if (!res.ok) throw new Error('User not found')
  return res.json()
}
```

```typescript
// api/users.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchUser } from './users'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('fetchUser', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('returns user data on success', async () => {
    const mockUser = { id: '1', name: 'John' }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUser),
    })

    const user = await fetchUser('1')
    expect(user).toEqual(mockUser)
    expect(mockFetch).toHaveBeenCalledWith('/api/users/1')
  })

  it('throws on error response', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false })

    await expect(fetchUser('999')).rejects.toThrow('User not found')
  })
})
```

### Testing Custom Hooks

```typescript
// hooks/useCounter.ts
import { useState, useCallback } from 'react'

export function useCounter(initial = 0) {
  const [count, setCount] = useState(initial)
  
  const increment = useCallback(() => setCount(c => c + 1), [])
  const decrement = useCallback(() => setCount(c => c - 1), [])
  const reset = useCallback(() => setCount(initial), [initial])
  
  return { count, increment, decrement, reset }
}
```

```typescript
// hooks/useCounter.test.ts
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useCounter } from './useCounter'

describe('useCounter', () => {
  it('starts with initial value', () => {
    const { result } = renderHook(() => useCounter(10))
    expect(result.current.count).toBe(10)
  })

  it('increments', () => {
    const { result } = renderHook(() => useCounter(0))
    act(() => result.current.increment())
    expect(result.current.count).toBe(1)
  })

  it('decrements', () => {
    const { result } = renderHook(() => useCounter(5))
    act(() => result.current.decrement())
    expect(result.current.count).toBe(4)
  })

  it('resets to initial', () => {
    const { result } = renderHook(() => useCounter(10))
    act(() => {
      result.current.increment()
      result.current.increment()
      result.current.reset()
    })
    expect(result.current.count).toBe(10)
  })
})
```

---

## Component Testing

### Basic Component Test

```typescript
// components/Button.tsx
interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary'
}

export function Button({ 
  children, 
  onClick, 
  disabled = false,
  variant = 'primary' 
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  )
}
```

```typescript
// components/Button.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    
    render(<Button onClick={handleClick}>Click</Button>)
    await user.click(screen.getByRole('button'))
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    
    render(<Button onClick={handleClick} disabled>Click</Button>)
    await user.click(screen.getByRole('button'))
    
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('applies variant class', () => {
    render(<Button variant="secondary">Click</Button>)
    expect(screen.getByRole('button')).toHaveClass('btn-secondary')
  })
})
```

### Testing Forms

```typescript
// components/LoginForm.tsx
import { useState } from 'react'

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('All fields required')
      return
    }
    onSubmit(email, password)
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <p role="alert">{error}</p>}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        aria-label="Email"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        aria-label="Password"
      />
      <button type="submit">Login</button>
    </form>
  )
}
```

```typescript
// components/LoginForm.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { LoginForm } from './LoginForm'

describe('LoginForm', () => {
  it('submits with email and password', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn()
    
    render(<LoginForm onSubmit={handleSubmit} />)
    
    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Login' }))
    
    expect(handleSubmit).toHaveBeenCalledWith('test@example.com', 'password123')
  })

  it('shows error when fields are empty', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn()
    
    render(<LoginForm onSubmit={handleSubmit} />)
    await user.click(screen.getByRole('button', { name: 'Login' }))
    
    expect(screen.getByRole('alert')).toHaveTextContent('All fields required')
    expect(handleSubmit).not.toHaveBeenCalled()
  })
})
```

### Testing with Context/Providers

```typescript
// test-utils.tsx
import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'

// Add your providers here
function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    // <ThemeProvider>
    //   <AuthProvider>
        {children}
    //   </AuthProvider>
    // </ThemeProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }
```

---

## E2E Testing (Playwright)

### Playwright Config

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### E2E Test Examples

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('user can sign up', async ({ page }) => {
    await page.goto('/signup')
    
    await page.fill('[name="email"]', 'newuser@example.com')
    await page.fill('[name="password"]', 'SecurePass123!')
    await page.fill('[name="confirmPassword"]', 'SecurePass123!')
    await page.click('button[type="submit"]')
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('h1')).toContainText('Welcome')
  })

  test('user can log in', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL('/dashboard')
  })

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('[name="email"]', 'wrong@example.com')
    await page.fill('[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    
    await expect(page.locator('[role="alert"]')).toContainText('Invalid credentials')
    await expect(page).toHaveURL('/login')
  })

  test('user can log out', async ({ page }) => {
    // Assume logged in (use beforeEach with auth state)
    await page.goto('/dashboard')
    
    await page.click('button:has-text("Logout")')
    
    await expect(page).toHaveURL('/login')
  })
})
```

### Testing User Flows

```typescript
// e2e/checkout.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Checkout Flow', () => {
  test('complete purchase flow', async ({ page }) => {
    // 1. Browse products
    await page.goto('/products')
    await page.click('[data-testid="product-card"]:first-child')
    
    // 2. Add to cart
    await page.click('button:has-text("Add to Cart")')
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1')
    
    // 3. Go to cart
    await page.click('[data-testid="cart-icon"]')
    await expect(page).toHaveURL('/cart')
    
    // 4. Proceed to checkout
    await page.click('button:has-text("Checkout")')
    
    // 5. Fill shipping
    await page.fill('[name="address"]', '123 Test St')
    await page.fill('[name="city"]', 'Test City')
    await page.fill('[name="zip"]', '12345')
    await page.click('button:has-text("Continue")')
    
    // 6. Complete payment (test mode)
    await page.fill('[name="cardNumber"]', '4242424242424242')
    await page.fill('[name="expiry"]', '12/25')
    await page.fill('[name="cvc"]', '123')
    await page.click('button:has-text("Pay")')
    
    // 7. Confirmation
    await expect(page).toHaveURL(/\/order\//)
    await expect(page.locator('h1')).toContainText('Order Confirmed')
  })
})
```

### Page Object Pattern

```typescript
// e2e/pages/login.page.ts
import { Page, Locator } from '@playwright/test'

export class LoginPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.emailInput = page.locator('[name="email"]')
    this.passwordInput = page.locator('[name="password"]')
    this.submitButton = page.locator('button[type="submit"]')
    this.errorMessage = page.locator('[role="alert"]')
  }

  async goto() {
    await this.page.goto('/login')
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }
}
```

```typescript
// e2e/login.spec.ts
import { test, expect } from '@playwright/test'
import { LoginPage } from './pages/login.page'

test('login with page object', async ({ page }) => {
  const loginPage = new LoginPage(page)
  
  await loginPage.goto()
  await loginPage.login('test@example.com', 'password123')
  
  await expect(page).toHaveURL('/dashboard')
})
```

---

## Testing Server Components (Next.js)

```typescript
// For server components, test the rendered output
// app/users/page.tsx
export default async function UsersPage() {
  const users = await fetchUsers()
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

```typescript
// app/users/page.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import UsersPage from './page'

// Mock the fetch function
vi.mock('./actions', () => ({
  fetchUsers: vi.fn(() => Promise.resolve([
    { id: '1', name: 'Alice' },
    { id: '2', name: 'Bob' },
  ])),
}))

describe('UsersPage', () => {
  it('renders user list', async () => {
    render(await UsersPage())
    
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })
})
```

---

## Mocking Patterns

### Mock Modules

```typescript
// Mock entire module
vi.mock('@/lib/api', () => ({
  fetchData: vi.fn(() => Promise.resolve({ data: 'mocked' })),
}))

// Mock specific export
vi.mock('@/lib/utils', async () => {
  const actual = await vi.importActual('@/lib/utils')
  return {
    ...actual,
    specificFunction: vi.fn(),
  }
})
```

### Mock Network Requests (MSW)

```typescript
// mocks/handlers.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: '1', name: 'John' },
      { id: '2', name: 'Jane' },
    ])
  }),
  
  http.post('/api/users', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ id: '3', ...body }, { status: 201 })
  }),
]
```

```typescript
// tests/setup.ts
import { setupServer } from 'msw/node'
import { handlers } from './mocks/handlers'

const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

---

## Coverage Thresholds

### Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      // Enforce thresholds - fail CI if not met
      thresholds: {
        statements: 80,
        branches: 70,
        functions: 80,
        lines: 80,
      },
      // What to include/exclude
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.stories.{ts,tsx}',
        'src/**/*.test.{ts,tsx}',
        'src/types/**',
        'src/**/*.d.ts',
      ],
    },
  },
})
```

### Coverage Targets by App Type

| App Type | Statement | Branch | Function | Notes |
|----------|-----------|--------|----------|-------|
| **MVP/Prototype** | 50% | 40% | 50% | Focus on critical paths |
| **Production SaaS** | 80% | 70% | 80% | Solid coverage |
| **Enterprise** | 90% | 85% | 90% | High reliability needed |
| **Open Source Lib** | 95% | 90% | 95% | Public trust required |

### Running Coverage

```bash
# Generate coverage report
npm run test:coverage

# View HTML report
open coverage/index.html

# CI-friendly output
npm run test:coverage -- --reporter=json
```

### Coverage Badge

```markdown
<!-- Add to README.md -->
![Coverage](https://img.shields.io/codecov/c/github/username/repo)
```

---

## CI/CD Integration

### GitHub Actions - Unit Tests

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npm run typecheck

      - name: Run unit tests
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: true
```

### GitHub Actions - E2E Tests

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Build application
        run: npm run build

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### GitHub Actions - Full Pipeline

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint-and-type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck

  unit-tests:
    needs: lint-and-type-check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info

  e2e-tests:
    needs: lint-and-type-check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/

  deploy:
    needs: [unit-tests, e2e-tests]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Database Testing in CI

```yaml
# Add to your test job
services:
  postgres:
    image: postgres:16
    env:
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
      POSTGRES_DB: test
    ports:
      - 5432:5432
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5

steps:
  - name: Setup database
    run: npx prisma db push
    env:
      DATABASE_URL: postgresql://test:test@localhost:5432/test

  - name: Run tests
    run: npm test
    env:
      DATABASE_URL: postgresql://test:test@localhost:5432/test
```

### Pre-commit Hooks

```bash
# Install husky
npm install -D husky lint-staged
npx husky init
```

```javascript
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "vitest related --run"
    ]
  }
}
```

```bash
# .husky/pre-commit
npm run lint-staged
```

---

## What to Test

### Test Priority (High to Low)

1. **Critical user paths** - Login, checkout, core features
2. **Data transformations** - Formatters, validators, calculators
3. **Complex logic** - State machines, business rules
4. **Edge cases** - Empty states, errors, boundaries
5. **Integration points** - API calls, database queries

### What NOT to Test

- Implementation details (internal state, private methods)
- Third-party libraries (they have their own tests)
- Trivial code (simple getters, pass-through functions)
- Styling (unless behavior depends on it)

---

## Review Checklist

- [ ] **Unit tests for utilities** - Pure functions covered
- [ ] **Component tests for UI** - User interactions work
- [ ] **E2E for critical paths** - Full flows tested
- [ ] **Error cases covered** - Failures handled gracefully
- [ ] **Tests run in CI** - Automated on every PR
- [ ] **Coverage reasonable** - 70-80% is good target

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Testing implementation | Test behavior instead |
| Too many mocks | Use real implementations when possible |
| Flaky tests | Use proper async handling, avoid timing |
| Testing everything | Focus on critical paths |
| No error tests | Always test failure cases |

---

## Prompt Examples

```
"Write unit tests for this utility function using Vitest"

"Create component tests for this form with validation"

"Write E2E test for the checkout flow using Playwright"

"Add tests for error handling in this API route"

"Set up MSW handlers for mocking these API endpoints"
```
