---
name: state-management
description: State management patterns for React apps. Zustand for client state, TanStack Query for server state. When to use what, patterns, and examples.
last_updated: 2026-03
---

# State Management

Simple rules: Server state → TanStack Query. Client state → Zustand.

## TL;DR

| State Type | Tool | Example |
|------------|------|---------|
| Server data (API, database) | TanStack Query | User list, posts, products |
| UI state (modals, tabs) | Zustand | isOpen, activeTab |
| Form state | react-hook-form | Form inputs |
| URL state | nuqs or next router | Filters, pagination |

**Don't overthink it.** Most apps need only TanStack Query + small Zustand store.

---

## Context Questions (Ask Before Recommending)

Before suggesting state management:

1. **Where does the data come from?** (API, local, URL, form input)
2. **How often does it change?** (rarely, on user action, real-time)
3. **Who needs access?** (one component, siblings, entire app)
4. **Should it persist?** (session only, localStorage, URL)
5. **Complexity level?** (simple CRUD, complex workflows)

---

## Dimensions (Spectrums to Explore)

| Dimension | Spectrum |
|-----------|----------|
| **Source** | Server (TanStack Query) ←→ Client (Zustand) |
| **Scope** | Local state ←→ Global store |
| **Persistence** | Memory only ←→ localStorage ←→ URL |
| **Complexity** | useState ←→ Zustand ←→ XState |
| **Caching** | None ←→ Aggressive (stale-while-revalidate) |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| API data + caching needed | TanStack Query |
| UI state shared across components | Zustand store |
| Form with validation | react-hook-form + zod |
| Filters/pagination in URL | nuqs |
| Simple local state | useState |
| Complex async workflows | XState (rare) |
| Need persistence | Zustand persist middleware |

---

## Decision Tree

```
Is this data from an API/database?
├── YES → TanStack Query
└── NO → Is it form input?
    ├── YES → react-hook-form
    └── NO → Is it URL state (filters, pages)?
        ├── YES → nuqs or searchParams
        └── NO → Zustand
```

---

## TanStack Query (Server State)

### Install

```bash
pnpm add @tanstack/react-query
```

### Setup

```tsx
// app/providers.tsx
"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

```tsx
// app/layout.tsx
import { Providers } from "./providers"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

### Fetching Data

```tsx
// hooks/use-users.ts
import { useQuery } from "@tanstack/react-query"

async function getUsers() {
  const res = await fetch("/api/users")
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  })
}
```

```tsx
// In component
function UserList() {
  const { data: users, isLoading, error } = useUsers()

  if (isLoading) return <Skeleton />
  if (error) return <Error message={error.message} />

  return (
    <ul>
      {users.map(user => <li key={user.id}>{user.name}</li>)}
    </ul>
  )
}
```

### Mutating Data

```tsx
// hooks/use-create-user.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { name: string; email: string }) => {
      const res = await fetch("/api/users", {
        method: "POST",
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to create")
      return res.json()
    },
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}
```

```tsx
// In component
function CreateUserForm() {
  const createUser = useCreateUser()

  const onSubmit = (data) => {
    createUser.mutate(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* ... */}
      <Button disabled={createUser.isPending}>
        {createUser.isPending ? "Creating..." : "Create User"}
      </Button>
    </form>
  )
}
```

### Common Patterns

```tsx
// Dependent queries (fetch user, then their posts)
const { data: user } = useQuery({
  queryKey: ["user", id],
  queryFn: () => getUser(id),
})

const { data: posts } = useQuery({
  queryKey: ["posts", user?.id],
  queryFn: () => getPosts(user.id),
  enabled: !!user, // Only run when user exists
})

// Pagination
const { data } = useQuery({
  queryKey: ["users", page],
  queryFn: () => getUsers(page),
})

// Infinite scroll
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ["posts"],
  queryFn: ({ pageParam = 1 }) => getPosts(pageParam),
  getNextPageParam: (lastPage) => lastPage.nextCursor,
})
```

---

## Zustand (Client State)

### Install

```bash
pnpm add zustand
```

### Basic Store

```tsx
// stores/ui-store.ts
import { create } from "zustand"

interface UIState {
  sidebarOpen: boolean
  theme: "light" | "dark"
  toggleSidebar: () => void
  setTheme: (theme: "light" | "dark") => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  theme: "dark",
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
}))
```

### Using in Components

```tsx
// In component
function Sidebar() {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen)
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)

  if (!sidebarOpen) return null

  return (
    <aside>
      <button onClick={toggleSidebar}>Close</button>
      {/* ... */}
    </aside>
  )
}
```

### With Persistence

```tsx
// stores/settings-store.ts
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface SettingsState {
  currency: string
  locale: string
  setCurrency: (currency: string) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      currency: "USD",
      locale: "en-US",
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: "settings-storage", // localStorage key
    }
  )
)
```

### Multiple Slices (Larger Apps)

```tsx
// stores/index.ts
import { create } from "zustand"

// UI slice
const createUISlice = (set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
})

// Cart slice
const createCartSlice = (set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  clearCart: () => set({ items: [] }),
})

// Combined store
export const useStore = create((...a) => ({
  ...createUISlice(...a),
  ...createCartSlice(...a),
}))
```

---

## URL State (nuqs)

For filters, pagination, search that should persist in URL:

### Install

```bash
pnpm add nuqs
```

### Usage

```tsx
"use client"
import { useQueryState } from "nuqs"

function ProductFilters() {
  const [category, setCategory] = useQueryState("category")
  const [sort, setSort] = useQueryState("sort", { defaultValue: "newest" })
  const [page, setPage] = useQueryState("page", { 
    parse: (v) => parseInt(v) || 1,
    serialize: String 
  })

  return (
    <div>
      <select 
        value={category || ""} 
        onChange={(e) => setCategory(e.target.value || null)}
      >
        <option value="">All</option>
        <option value="electronics">Electronics</option>
        <option value="clothing">Clothing</option>
      </select>

      <button onClick={() => setPage(page + 1)}>Next Page</button>
    </div>
  )
}
```

URL becomes: `/products?category=electronics&sort=newest&page=2`

---

## What NOT to Do

| Anti-Pattern | Why | Do Instead |
|--------------|-----|------------|
| Put server data in Zustand | Loses caching, refetching benefits | Use TanStack Query |
| Create global state for everything | Unnecessary complexity | Start local, lift when needed |
| Use Context for frequent updates | Re-renders entire tree | Use Zustand |
| Skip loading/error states | Bad UX | Always handle them |

---

## Typical App Setup

```
src/
├── hooks/
│   ├── use-users.ts          # TanStack Query hook
│   ├── use-products.ts       # TanStack Query hook
│   └── use-create-order.ts   # Mutation hook
├── stores/
│   ├── ui-store.ts           # Zustand for UI
│   └── cart-store.ts         # Zustand for cart (if e-commerce)
└── app/
    └── providers.tsx         # QueryClientProvider
```

---

## Quick Reference

| Task | Code |
|------|------|
| Fetch data | `useQuery({ queryKey, queryFn })` |
| Mutate data | `useMutation({ mutationFn, onSuccess })` |
| Invalidate cache | `queryClient.invalidateQueries({ queryKey })` |
| Create store | `create((set) => ({ ... }))` |
| Update store | `set({ key: value })` or `set((state) => ({ ... }))` |
| Select from store | `useStore((state) => state.value)` |
| Persist store | `persist((set) => ({ ... }), { name: "key" })` |
| URL state | `useQueryState("param")` |

---

## When to Add More

Start simple. Add complexity only when needed:

| Signal | Action |
|--------|--------|
| Need to cache API responses | Already using TanStack Query ✓ |
| Multiple components need same UI state | Create Zustand store |
| State should survive refresh | Add persist middleware |
| State should be in URL | Use nuqs |
| Complex async workflows | Consider XState (rare) |
