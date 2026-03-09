---
name: edge-cases
description: Comprehensive edge case handling. Error patterns, validation, graceful degradation.
owner: Frank
last_updated: 2026-03
---

# Edge Cases

Handle the weird stuff before it breaks production.

> **See also:** `agents/testing/SKILL.md` for test strategies

---

## Context Questions

Before handling edge cases:

1. **What's the input source?** — User forms, APIs, file uploads, webhooks
2. **What's the failure mode?** — Silent fail, error message, graceful degradation
3. **What's the risk level?** — Low (UI) vs high (payments, data loss)
4. **Who handles errors?** — User retry, auto-retry, admin intervention
5. **What's the recovery strategy?** — Rollback, compensating action, manual fix

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Input** | Trusted (internal) ←→ Untrusted (public) |
| **Failure** | Silent degradation ←→ Explicit error |
| **Recovery** | Auto-retry ←→ Manual intervention |
| **Logging** | Minimal ←→ Full audit trail |
| **UX** | Error message ←→ Graceful fallback |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| User-facing forms | Validation + inline errors |
| Payment flows | Retry with backoff + idempotency |
| API integrations | Timeout + fallback + circuit breaker |
| Real-time data | Stale data handling + optimistic UI |
| File uploads | Size limits + type validation + malware scan |
| Auth tokens | Expiry handling + silent refresh |

---

## TL;DR

| Category | Pattern |
|----------|---------|
| **Input** | Validation, sanitization |
| **Network** | Timeouts, retries, fallbacks |
| **State** | Race conditions, stale data |
| **Auth** | Token expiry, permission denied |
| **Data** | Empty, null, malformed |

---


## Part 1: Input Edge Cases

### Empty / Null Input

```typescript
function processInput(input: string | null | undefined): string {
  // Guard clause pattern
  if (!input?.trim()) {
    return "default value";
  }
  return input.trim();
}

// With Zod validation
import { z } from "zod";

const schema = z.object({
  email: z.string().email().min(1),
  name: z.string().min(1).max(100),
  age: z.number().int().positive().optional(),
});

function validateInput(data: unknown) {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(result.error.issues);
  }
  return result.data;
}
```

### Boundary Values

```typescript
// Always check boundaries
function paginate(page: number, limit: number) {
  const safePage = Math.max(1, Math.floor(page));
  const safeLimit = Math.min(100, Math.max(1, Math.floor(limit)));
  
  return { page: safePage, limit: safeLimit };
}

// String length
function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 3) + "...";
}
```

---

## Part 2: Network Edge Cases

### Timeouts

```typescript
async function fetchWithTimeout<T>(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 5000
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    
    if (!response.ok) {
      throw new HttpError(response.status, await response.text());
    }
    
    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}
```

### Retries with Backoff

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on client errors
      if (error instanceof HttpError && error.status < 500) {
        throw error;
      }
      
      // Exponential backoff with jitter
      const delay = baseDelayMs * Math.pow(2, attempt) * (0.5 + Math.random() * 0.5);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}
```

### Fallbacks

```typescript
async function getDataWithFallback<T>(
  primary: () => Promise<T>,
  fallback: () => Promise<T>,
  cache?: T
): Promise<T> {
  try {
    return await primary();
  } catch (error) {
    console.warn("Primary failed, trying fallback:", error);
    
    try {
      return await fallback();
    } catch (fallbackError) {
      console.error("Fallback failed:", fallbackError);
      
      if (cache !== undefined) {
        console.warn("Using cached data");
        return cache;
      }
      
      throw fallbackError;
    }
  }
}
```

---

## Part 3: State Edge Cases

### Race Conditions

```typescript
// Abort previous request when new one starts
let abortController: AbortController | null = null;

async function search(query: string) {
  // Cancel previous request
  abortController?.abort();
  abortController = new AbortController();
  
  try {
    const results = await fetch(`/api/search?q=${query}`, {
      signal: abortController.signal,
    });
    return results.json();
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return null; // Silently ignore aborted requests
    }
    throw error;
  }
}
```

### Stale Data

```typescript
// React Query handles this well
import { useQuery } from "@tanstack/react-query";

function useData(id: string) {
  return useQuery({
    queryKey: ["data", id],
    queryFn: () => fetchData(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: true,
    retry: 3,
  });
}
```

### Optimistic Updates Gone Wrong

```typescript
const mutation = useMutation({
  mutationFn: updateItem,
  onMutate: async (newItem) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ["items"] });
    
    // Snapshot previous value
    const previous = queryClient.getQueryData(["items"]);
    
    // Optimistically update
    queryClient.setQueryData(["items"], (old) => [...old, newItem]);
    
    return { previous };
  },
  onError: (err, newItem, context) => {
    // Rollback on error
    queryClient.setQueryData(["items"], context?.previous);
    toast.error("Failed to save. Changes reverted.");
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ["items"] });
  },
});
```

---

## Part 4: Auth Edge Cases

### Token Expiry

```typescript
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  let token = getAccessToken();
  
  // Check if token is expired
  if (isTokenExpired(token)) {
    try {
      token = await refreshToken();
    } catch {
      // Refresh failed - redirect to login
      redirectToLogin();
      throw new AuthError("Session expired");
    }
  }
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
  
  // Handle 401 even if token wasn't expired (server invalidated)
  if (response.status === 401) {
    clearTokens();
    redirectToLogin();
    throw new AuthError("Unauthorized");
  }
  
  return response;
}
```

### Permission Denied

```typescript
// Check permissions before action
function ProtectedButton({ 
  permission, 
  children, 
  onClick 
}: {
  permission: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  const { hasPermission } = useAuth();
  
  if (!hasPermission(permission)) {
    return null; // Or disabled button with tooltip
  }
  
  return <button onClick={onClick}>{children}</button>;
}

// Server-side check
async function protectedAction(userId: string, action: string) {
  const canPerform = await checkPermission(userId, action);
  
  if (!canPerform) {
    throw new ForbiddenError(`User cannot perform: ${action}`);
  }
  
  // Proceed with action
}
```

---

## Part 5: Data Edge Cases

### Empty Collections

```tsx
function ItemList({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={<FolderIcon />}
        title="No items yet"
        description="Create your first item to get started"
        action={<CreateButton />}
      />
    );
  }
  
  return (
    <ul>
      {items.map(item => <ItemRow key={item.id} item={item} />)}
    </ul>
  );
}
```

### Malformed Data

```typescript
function safeParseJSON<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    console.warn("Failed to parse JSON, using fallback");
    return fallback;
  }
}

// Handle unexpected API responses
function parseApiResponse<T>(response: unknown, schema: z.ZodSchema<T>): T {
  const result = schema.safeParse(response);
  
  if (!result.success) {
    console.error("API response validation failed:", result.error);
    throw new ApiError("Invalid response from server");
  }
  
  return result.data;
}
```

---

## Part 6: LLM/AI Edge Cases

### API Failures

```python
from openai import OpenAI
from tenacity import retry, stop_after_attempt, wait_exponential

client = OpenAI()

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=4, max=60),
)
async def get_completion(prompt: str) -> str:
    try:
        response = await client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            timeout=30,
        )
        return response.choices[0].message.content or ""
    except openai.RateLimitError:
        # Switch to fallback model
        return await get_completion_fallback(prompt)
    except openai.APIError as e:
        raise LLMError(f"API error: {e}")
```

### Unexpected Output

```python
def parse_llm_json(response: str) -> dict:
    # Try to extract JSON from response
    import json
    import re
    
    # Look for JSON in code blocks
    json_match = re.search(r'```json?\s*([\s\S]*?)\s*```', response)
    if json_match:
        response = json_match.group(1)
    
    # Try to parse
    try:
        return json.loads(response)
    except json.JSONDecodeError:
        # Try to fix common issues
        response = response.strip()
        response = re.sub(r',\s*}', '}', response)  # Trailing commas
        response = re.sub(r',\s*]', ']', response)
        
        try:
            return json.loads(response)
        except:
            raise LLMOutputError("Could not parse JSON from LLM response")
```

---

## Part 7: Edge Case Checklist by Feature

### Forms
```markdown
- [ ] Empty submission
- [ ] Invalid email/phone format
- [ ] Max length exceeded
- [ ] Required fields missing
- [ ] Duplicate submission (double click)
- [ ] Network failure mid-submit
```

### Payments
```markdown
- [ ] Card declined
- [ ] Insufficient funds
- [ ] 3D Secure timeout
- [ ] Webhook failure
- [ ] Duplicate charge prevention
- [ ] Refund after partial fulfillment
```

### File Upload
```markdown
- [ ] Wrong file type
- [ ] File too large
- [ ] Upload interrupted
- [ ] Malicious file
- [ ] Filename with special characters
- [ ] Zero-byte file
```

### Real-time/WebSocket
```markdown
- [ ] Connection dropped
- [ ] Reconnection handling
- [ ] Message ordering
- [ ] Duplicate messages
- [ ] Stale connection
```

---

## Checklist

```markdown
- [ ] Input validation on all user inputs
- [ ] Network timeouts configured
- [ ] Retry logic with backoff
- [ ] Fallback strategies defined
- [ ] Auth token refresh handling
- [ ] Empty state UI for collections
- [ ] Error boundaries in React
- [ ] LLM output parsing hardened
- [ ] Feature-specific edge cases documented
```

---

## Resources

- Zod: <https://zod.dev/>
- React Query: <https://tanstack.com/query>
- Tenacity (Python retries): <https://tenacity.readthedocs.io/>

---

## Related Skills

- `agents/testing/SKILL.md` — Test strategies
- `agents/error-handling/SKILL.md` — Error patterns
- `ai-builder/responsible-ai/SKILL.md` — AI failure modes
