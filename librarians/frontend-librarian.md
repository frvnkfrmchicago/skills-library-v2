---
name: frontend-librarian
description: Frontend architecture guide covering component patterns, state management, rendering strategies, performance budgets, and build tooling. Ensures components are composable, state is predictable, and rendering is optimized for the target platform.
last_updated: 2026-03-06
---

# Frontend Librarian

You are a frontend architect. Your job is to ensure every frontend project has a clear component hierarchy, predictable state management, optimized rendering, and a build pipeline that stays fast as the project grows. You never put business logic in components. You never skip TypeScript interfaces for props.

## TL;DR

| Layer | What | Where |
|-------|------|-------|
| Pages | Route-level compositions | `app/` or `pages/` |
| Features | Domain-specific UI + logic | `features/` |
| Components | Reusable, stateless UI | `components/` |
| Hooks | Shared stateful logic | `hooks/` |
| Utils | Pure functions, helpers | `lib/` or `utils/` |

---

## 1. Component Architecture

### Principles

**Separate presentational components from container logic** BECAUSE components that fetch data, manage state, AND render UI become impossible to test, reuse, or refactor. Presentational components take props and render. Container components manage data and pass it down.

**Every component gets a TypeScript interface for its props** BECAUSE runtime prop errors in production cost more than the 30 seconds it takes to type an interface today.

### Component Pattern

```tsx
// Good — typed, focused, composable
interface UserCardProps {
 name: string
 email: string
 avatar: string
 onEdit?: () => void
}

export function UserCard({ name, email, avatar, onEdit }: UserCardProps) {
 return (
 <div className="flex items-center gap-4 p-4 rounded-lg border">
 <img src={avatar} alt={name} className="w-12 h-12 rounded-full" />
 <div>
 <h3 className="font-medium">{name}</h3>
 <p className="text-sm text-gray-500">{email}</p>
 </div>
 {onEdit && (
 <button onClick={onEdit} className="ml-auto text-sm text-blue-600">
 Edit
 </button>
 )}
 </div>
 )
}
```

```tsx
// Bad — fetches data, manages state, renders UI all in one
export function UserCard({ userId }) {
 const [user, setUser] = useState(null)
 const [loading, setLoading] = useState(true)

 useEffect(() => {
 fetch(`/api/users/${userId}`)
 .then(r => r.json())
 .then(setUser)
 .finally(() => setLoading(false))
 }, [userId])

 if (loading) return <Spinner />
 // Now tied to a specific API, can't reuse, can't test without mocking fetch
}
```

### File Structure Decision Tree

```
How big is this project?
│
├── Small (< 10 components) → Flat structure
│ src/components/
│ src/hooks/
│ src/lib/
│
├── Medium (10-50 components) → Feature-based
│ src/features/auth/
│ src/features/dashboard/
│ src/features/settings/
│ src/components/shared/
│
└── Large (50+ components) → Module-based
 src/modules/auth/
 components/
 hooks/
 api/
 types/
 src/modules/dashboard/
 src/shared/components/
```

---

## 2. State Management

### Decision Tree

```
What kind of state is this?
│
├── UI state (open/close, selected tab)?
│ └── useState or useReducer — local to the component
│
├── Server state (data from API)?
│ ├── React Query / TanStack Query — caching, deduplication, refetching
│ └── SWR — lighter alternative
│
├── Shared state across components?
│ ├── Few components → React Context
│ ├── Complex state → Zustand (minimal API, no boilerplate)
│ └── Very large app → Jotai (atomic state) or Redux Toolkit
│
└── Form state?
 └── React Hook Form — performance-optimized, validation built-in
```

### Zustand Example

```typescript
// Good — minimal, typed store
import { create } from 'zustand'

interface CartStore {
 items: CartItem[]
 addItem: (item: CartItem) => void
 removeItem: (id: string) => void
 clear: () => void
}

export const useCartStore = create<CartStore>((set) => ({
 items: [],
 addItem: (item) => set((state) => ({ items: [...state.items, item] })),
 removeItem: (id) => set((state) => ({
 items: state.items.filter(i => i.id !== id)
 })),
 clear: () => set({ items: [] }),
}))
```

---

## 3. Rendering Strategies

### Next.js Decision Tree

```
When should this render?
│
├── Static content that rarely changes?
│ └── Static Generation (SSG) — build time, fastest
│
├── Content that changes but can be cached?
│ └── Incremental Static Regeneration (ISR) — revalidate every N seconds
│
├── Personalized / auth-required content?
│ └── Server Components (default in App Router) — server-side, no client JS
│
├── Highly interactive UI (forms, real-time)?
│ └── Client Component ('use client') — runs in browser
│
└── Not sure?
 └── Start with Server Component, add 'use client' only when you need:
 - useState, useEffect, useRef
 - onClick, onChange handlers
 - Browser APIs (window, document)
```

---

## 4. Build Tooling

| Tool | Use Case | Note |
|------|----------|------|
| Vite | Standalone React/Vue/Svelte apps | Fastest dev server in 2026 |
| Next.js (Turbopack) | Full-stack React apps | Built-in SSR, API routes |
| Bun | Runtime + bundler, fast installs | Good for scripts, experimental for apps |

### Vite Config Essentials

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
 plugins: [react()],
 build: {
 target: 'es2022',
 rollupOptions: {
 output: {
 manualChunks: {
 vendor: ['react', 'react-dom'],
 }
 }
 }
 },
 server: {
 port: 3000,
 open: true,
 }
})
```

---

## NEVER

- **NEVER** put API calls directly in components — use hooks or server actions
- **NEVER** skip TypeScript interfaces for component props
- **NEVER** use `any` type — use `unknown` if you must be generic
- **NEVER** mutate state directly — always use immutable patterns
- **NEVER** reach for global state management before trying local state
- **NEVER** import server-only code in client components

---

## Pre-Completion Checklist

Before shipping any frontend feature, verify:

- [ ] Components are typed with proper interfaces
- [ ] Business logic is in hooks/utils, not in component render
- [ ] State management follows the decision tree (local first)
- [ ] No `any` types in props or state
- [ ] Build produces no TypeScript errors
- [ ] Bundle size within budget (< 100KB initial JS)
- [ ] Components work at all breakpoints

---

## Related Skills

- [components-librarian](/librarians/components-librarian.md) — component design patterns
- [mobile-first-librarian](/librarians/mobile-first-librarian.md) — responsive design
- [performance-librarian](/librarians/performance-librarian.md) — performance optimization
- [testing-librarian](/librarians/testing-librarian.md) — component testing
