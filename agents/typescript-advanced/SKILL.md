---
name: typescript-advanced
description: Advanced TypeScript patterns for production apps. Generics, utility types, discriminated unions, Zod integration, and type-safe API clients.
last_updated: 2026-03
owner: Frank
---

# TypeScript Advanced Patterns

Beyond basic types - the patterns that make TypeScript powerful.

---

## Context Questions

Before applying advanced TypeScript:

1. **What's the team's TS experience?** — Junior (keep simple), senior (full patterns)
2. **What's the codebase maturity?** — New (set strict from start), legacy (gradual adoption)
3. **What's the validation need?** — API boundaries (Zod), internal only (types)
4. **What's the reuse level?** — Generics for reusable, specific types for one-off
5. **What's the inference priority?** — Explicit types vs. inferred

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Type Strictness** | Loose (any) ←→ Strict (unknown + guards) |
| **Generics** | None ←→ Simple ←→ Constrained ←→ Advanced |
| **Validation** | Compile-time only ←→ Runtime (Zod) |
| **Complexity** | Utility types ←→ Conditional types ←→ Template literals |
| **API Safety** | Manual types ←→ Schema-first ←→ tRPC |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Junior team | Stick to utility types, avoid complex generics |
| API boundary | Zod for runtime validation + type inference |
| Reusable components | Generics with constraints |
| State machine | Discriminated unions |
| ID confusion risk | Branded types |
| Large forms | Zod + react-hook-form |

---

## TL;DR

| Pattern | When to Use |
|---------|-------------|
| **Generics** | Reusable functions/components that work with multiple types |
| **Utility Types** | Transform existing types (Partial, Pick, Omit, etc.) |
| **Discriminated Unions** | Model states where value depends on a "type" field |
| **Zod** | Runtime validation + type inference |
| **Type Guards** | Narrow types at runtime |
| **Branded Types** | Prevent mixing similar primitive types |

---

## Generics

### Basic Pattern

```typescript
// ❌ Loses type information
function getFirst(arr: any[]): any {
  return arr[0];
}

// ✅ Preserves type
function getFirst<T>(arr: T[]): T | undefined {
  return arr[0];
}

const num = getFirst([1, 2, 3]);     // number | undefined
const str = getFirst(["a", "b"]);    // string | undefined
```

### With Constraints

```typescript
// T must have a length property
function getLength<T extends { length: number }>(item: T): number {
  return item.length;
}

getLength("hello");      // ✅
getLength([1, 2, 3]);    // ✅
getLength(123);          // ❌ number has no length
```

### Generic React Components

```typescript
// Generic table component
interface TableProps<T> {
  data: T[];
  columns: {
    key: keyof T;
    header: string;
    render?: (value: T[keyof T], row: T) => React.ReactNode;
  }[];
}

function Table<T extends Record<string, unknown>>({ 
  data, 
  columns 
}: TableProps<T>) {
  return (
    <table>
      <thead>
        <tr>
          {columns.map(col => (
            <th key={String(col.key)}>{col.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {columns.map(col => (
              <td key={String(col.key)}>
                {col.render 
                  ? col.render(row[col.key], row)
                  : String(row[col.key])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Usage - fully typed
<Table
  data={users}
  columns={[
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "createdAt", header: "Joined", render: (v) => formatDate(v) }
  ]}
/>
```

---

## Utility Types

### Most Used

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

// Partial<T> - All properties optional
type UserUpdate = Partial<User>;
// { id?: string; name?: string; ... }

// Required<T> - All properties required
type RequiredUser = Required<Partial<User>>;

// Pick<T, K> - Select properties
type PublicUser = Pick<User, "id" | "name">;
// { id: string; name: string }

// Omit<T, K> - Exclude properties
type UserWithoutPassword = Omit<User, "password">;
// { id: string; name: string; email: string; createdAt: Date }

// Readonly<T> - Immutable
type ImmutableUser = Readonly<User>;
// All properties are readonly

// Record<K, V> - Object with specific keys
type UsersByRole = Record<"admin" | "user" | "guest", User[]>;
// { admin: User[]; user: User[]; guest: User[] }

// NonNullable<T> - Remove null/undefined
type DefinitelyString = NonNullable<string | null | undefined>;
// string
```

### Combining Utility Types

```typescript
// Create new user (no id/createdAt, everything else required)
type CreateUserInput = Omit<User, "id" | "createdAt">;

// Update user (everything optional except id)
type UpdateUserInput = Partial<Omit<User, "id">> & Pick<User, "id">;

// API response
type ApiResponse<T> = {
  data: T;
  meta: {
    timestamp: Date;
    requestId: string;
  };
};
```

---

## Discriminated Unions

### Basic Pattern

```typescript
// State machine for async operations
type AsyncState<T> = 
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error };

function useAsync<T>(): AsyncState<T> {
  // ...
}

// Usage - TypeScript narrows automatically
const state = useAsync<User>();

switch (state.status) {
  case "idle":
    // state is { status: "idle" }
    break;
  case "loading":
    // state is { status: "loading" }
    break;
  case "success":
    // state is { status: "success"; data: User }
    console.log(state.data.name); // ✅ TypeScript knows data exists
    break;
  case "error":
    // state is { status: "error"; error: Error }
    console.log(state.error.message);
    break;
}
```

### API Response Pattern

```typescript
type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

async function fetchUser(id: string): Promise<ApiResult<User>> {
  try {
    const res = await fetch(`/api/users/${id}`);
    if (!res.ok) throw new Error("Failed");
    return { success: true, data: await res.json() };
  } catch (e) {
    return { 
      success: false, 
      error: { code: "FETCH_ERROR", message: (e as Error).message } 
    };
  }
}

// Usage
const result = await fetchUser("123");
if (result.success) {
  console.log(result.data.name); // ✅
} else {
  console.log(result.error.code); // ✅
}
```

### Exhaustiveness Checking

```typescript
type Action =
  | { type: "INCREMENT" }
  | { type: "DECREMENT" }
  | { type: "SET"; value: number };

function reducer(state: number, action: Action): number {
  switch (action.type) {
    case "INCREMENT":
      return state + 1;
    case "DECREMENT":
      return state - 1;
    case "SET":
      return action.value;
    default:
      // This ensures all cases are handled
      const _exhaustive: never = action;
      return _exhaustive;
  }
}
```

---

## Zod Integration

### Schema-First Types

```typescript
import { z } from "zod";

// Define schema
const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.enum(["admin", "user", "guest"]),
  settings: z.object({
    theme: z.enum(["light", "dark"]).default("light"),
    notifications: z.boolean().default(true),
  }).optional(),
});

// Infer type from schema
type User = z.infer<typeof userSchema>;
/*
{
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "guest";
  settings?: {
    theme: "light" | "dark";
    notifications: boolean;
  };
}
*/

// Validate at runtime
function validateUser(data: unknown): User {
  return userSchema.parse(data); // Throws on invalid
}

// Safe validation
const result = userSchema.safeParse(data);
if (result.success) {
  console.log(result.data.name);
} else {
  console.log(result.error.issues);
}
```

### Form Validation

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const signupSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string()
    .min(8, "Must be 8+ characters")
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[0-9]/, "Must contain number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupForm = z.infer<typeof signupSchema>;

function SignupForm() {
  const form = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register("email")} />
      {form.formState.errors.email?.message}
      {/* ... */}
    </form>
  );
}
```

### API Request/Response

```typescript
// Server action with Zod
const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export async function createUser(formData: FormData) {
  "use server";
  
  const validated = createUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });

  if (!validated.success) {
    return { error: validated.error.flatten() };
  }

  const user = await db.user.create({
    data: validated.data,
  });

  return { data: user };
}
```

---

## Type-Safe API Clients

### Pattern 1: Generic Fetch Wrapper

```typescript
import { z, ZodType } from "zod";

async function typedFetch<T>(
  url: string,
  schema: ZodType<T>,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return schema.parse(data);
}

// Usage
const userSchema = z.object({
  id: z.string(),
  name: z.string(),
});

const user = await typedFetch("/api/user/123", userSchema);
// user is fully typed as { id: string; name: string }
```

### Pattern 2: API Route Map

```typescript
const apiRoutes = {
  users: {
    list: () => "/api/users" as const,
    get: (id: string) => `/api/users/${id}` as const,
    create: () => "/api/users" as const,
  },
  posts: {
    list: (userId: string) => `/api/users/${userId}/posts` as const,
  },
} as const;

// Type-safe route building
const url = apiRoutes.users.get("123"); // "/api/users/123"
```

### Pattern 3: TanStack Query Integration

```typescript
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
});

type User = z.infer<typeof userSchema>;

// Typed query hook
function useUser(id: string) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: async (): Promise<User> => {
      const res = await fetch(`/api/users/${id}`);
      const data = await res.json();
      return userSchema.parse(data);
    },
  });
}

// Usage
const { data: user } = useUser("123");
user?.name; // ✅ Fully typed
```

---

## Branded Types

Prevent accidentally mixing primitive types:

```typescript
// Create branded types
type UserId = string & { readonly __brand: "UserId" };
type PostId = string & { readonly __brand: "PostId" };

// Factory functions
function createUserId(id: string): UserId {
  return id as UserId;
}

function createPostId(id: string): PostId {
  return id as PostId;
}

// API functions use branded types
function getUser(id: UserId): Promise<User> { /* ... */ }
function getPost(id: PostId): Promise<Post> { /* ... */ }

// Usage
const userId = createUserId("user_123");
const postId = createPostId("post_456");

getUser(userId); // ✅
getUser(postId); // ❌ Type error - can't use PostId as UserId
getUser("raw");  // ❌ Type error - must use branded type
```

---

## Type Guards

```typescript
// Custom type guard
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "name" in obj
  );
}

// With Zod
function isValidUser(data: unknown): data is User {
  return userSchema.safeParse(data).success;
}

// Usage
function processInput(input: unknown) {
  if (isUser(input)) {
    console.log(input.name); // ✅ TypeScript knows it's User
  }
}
```

---

## `satisfies` Operator

Validate type while preserving literal types:

```typescript
// Without satisfies - loses literal types
const config1: Record<string, string> = {
  theme: "dark",
  locale: "en",
};
config1.theme; // string (not "dark")

// With satisfies - keeps literal types
const config2 = {
  theme: "dark",
  locale: "en",
} satisfies Record<string, string>;
config2.theme; // "dark" (literal type preserved)
```

---

## tsconfig.json Recommendations

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler"
  }
}
```

---

## Anti-Patterns

| ❌ Avoid | ✅ Instead |
|----------|-----------|
| Using `any` | Use `unknown` and narrow |
| Type assertions (`as`) | Use type guards |
| `// @ts-ignore` | Fix the actual type issue |
| Ignoring null checks | Enable `strictNullChecks` |
| Huge union types | Break into smaller discriminated unions |

---

## Resources

- TypeScript Handbook: [typescriptlang.org/docs](https://typescriptlang.org/docs)
- Total TypeScript: [totaltypescript.com](https://totaltypescript.com)
- Zod Docs: [zod.dev](https://zod.dev)
