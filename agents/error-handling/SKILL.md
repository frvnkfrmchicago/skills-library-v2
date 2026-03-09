---
name: error-handling
description: Error handling patterns. Custom errors, handlers, user feedback, recovery.
last_updated: 2026-03
owner: Frank
---

# Error Handling

Handle errors gracefully across your stack.

> **See also:** `agents/edge-cases/SKILL.md` for specific failure modes

---

## Context Questions

Before implementing error handling:

1. **What layer?** — API routes, server actions, client components
2. **Who sees the error?** — Developer (logs), user (toast/message)
3. **What's the recovery path?** — Retry, redirect, fallback UI
4. **What's the monitoring need?** — Basic logs, Sentry, structured logging
5. **Production vs development?** — Hide details in prod, show in dev

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Verbosity** | Silent fail ←→ Toast ←→ Full error page |
| **Recovery** | None ←→ Retry ←→ Fallback ←→ Graceful degradation |
| **Logging** | Console ←→ Structured ←→ External (Sentry) |
| **Typing** | Generic Error ←→ Custom error classes |
| **Boundaries** | None ←→ Per-component ←→ Global |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| API routes | Global error handler wrapper |
| Server actions | Result type (success/error discriminated union) |
| Client components | Error boundaries + toast |
| Payment/auth | Detailed error codes + logging |
| Production | Hide stack traces, log to external |
| Development | Verbose errors, show details |

---

## TL;DR

| Layer | Pattern |
|-------|---------|
| **Backend** | Custom error classes, global handler |
| **Frontend** | Error boundaries, toast notifications |
| **API** | Consistent error response format |
| **Logging** | Structured logs with context |

---

## Part 1: Custom Error Classes

```typescript
// lib/errors.ts

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super("validation_error", message, 400, details);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super("not_found", id ? `${resource} ${id} not found` : `${resource} not found`, 404);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super("unauthorized", message, 401);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super("forbidden", message, 403);
    this.name = "ForbiddenError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super("conflict", message, 409);
    this.name = "ConflictError";
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter?: number) {
    super("rate_limited", "Too many requests", 429, { retryAfter });
    this.name = "RateLimitError";
  }
}
```

---

## Part 2: Global Error Handler (Next.js)

### API Routes

```typescript
// lib/api-handler.ts
import { NextRequest, NextResponse } from "next/server";
import { AppError } from "./errors";

type Handler = (req: NextRequest, context?: any) => Promise<NextResponse>;

export function withErrorHandler(handler: Handler): Handler {
  return async (req, context) => {
    try {
      return await handler(req, context);
    } catch (error) {
      console.error("API Error:", error);

      if (error instanceof AppError) {
        return NextResponse.json(
          {
            error: error.code,
            message: error.message,
            ...(error.details && { details: error.details }),
          },
          { status: error.statusCode }
        );
      }

      // Unexpected error
      return NextResponse.json(
        {
          error: "internal_error",
          message: process.env.NODE_ENV === "production" 
            ? "An unexpected error occurred" 
            : (error as Error).message,
        },
        { status: 500 }
      );
    }
  };
}

// Usage
export const POST = withErrorHandler(async (req) => {
  const body = await req.json();
  
  if (!body.name) {
    throw new ValidationError("Name is required");
  }
  
  const item = await createItem(body);
  return NextResponse.json(item, { status: 201 });
});
```

### Server Actions

```typescript
// lib/action-handler.ts
import { AppError } from "./errors";

type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string; code: string };

export function withActionHandler<T, Args extends unknown[]>(
  action: (...args: Args) => Promise<T>
) {
  return async (...args: Args): Promise<ActionResult<T>> => {
    try {
      const data = await action(...args);
      return { success: true, data };
    } catch (error) {
      console.error("Action Error:", error);

      if (error instanceof AppError) {
        return {
          success: false,
          error: error.message,
          code: error.code,
        };
      }

      return {
        success: false,
        error: "An unexpected error occurred",
        code: "internal_error",
      };
    }
  };
}

// Usage
export const createItem = withActionHandler(async (data: CreateItemInput) => {
  if (!data.name) {
    throw new ValidationError("Name is required");
  }
  return await db.items.create({ data });
});
```

---

## Part 3: React Error Boundaries

```tsx
// components/error-boundary.tsx
"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error Boundary:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <h2 className="font-bold text-red-800">Something went wrong</h2>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 text-red-600 underline"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## Part 4: Toast Notifications

```tsx
// Using sonner (recommended)
import { toast } from "sonner";

// Success
toast.success("Item created successfully");

// Error
toast.error("Failed to create item");

// With description
toast.error("Failed to create item", {
  description: "Please check your input and try again",
});

// Promise toast
toast.promise(createItem(data), {
  loading: "Creating item...",
  success: "Item created!",
  error: (err) => err.message || "Failed to create item",
});
```

---

## Part 5: Consistent Error Response Format

```typescript
// Consistent error response
interface ErrorResponse {
  error: string;       // Machine-readable code
  message: string;     // Human-readable message
  details?: {          // Optional field-level errors
    [field: string]: string;
  };
  requestId?: string;  // For debugging
}

// Examples
// { "error": "validation_error", "message": "Invalid request body" }
// { "error": "not_found", "message": "Item abc123 not found" }
```

---

## Checklist

```markdown
- [ ] Custom error classes defined
- [ ] Global API error handler
- [ ] Server action error wrapper
- [ ] React error boundaries
- [ ] Toast notifications configured
- [ ] Consistent error response format
- [ ] Error logging with context
```

---

## Resources

- sonner (toasts): <https://sonner.emilkowal.ski/>
- pino (logging): <https://getpino.io/>
- Zod: <https://zod.dev/>

---

## Related Skills

- `agents/edge-cases/SKILL.md` — Specific failure modes
- `agents/openapi/SKILL.md` — API error responses
- `agents/testing/SKILL.md` — Testing error paths
