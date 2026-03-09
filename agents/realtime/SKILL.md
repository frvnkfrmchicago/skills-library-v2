---
name: realtime
description: Real-time patterns for React apps. WebSockets, Supabase Realtime, Server-Sent Events, and optimistic updates.
owner: Frank
last_updated: 2026-03
---

# Real-Time Patterns

Live updates, presence, and instant interactions.

## TL;DR

| Pattern | Use When |
|---------|----------|
| **Supabase Realtime** | Database changes, presence, broadcast |
| **WebSockets** | Custom real-time servers, gaming |
| **Server-Sent Events** | One-way updates from server |
| **Optimistic Updates** | Instant UI feedback before server confirms |

---

## Context Questions (Ask Before Recommending)

Before suggesting real-time patterns:

1. **What needs to be real-time?** (chat, notifications, live data, cursors)
2. **Direction of data flow?** (server→client only, bidirectional)
3. **Existing database?** (Supabase, custom, Firebase)
4. **Scale expectations?** (small team, many concurrent users)
5. **Offline support needed?** (optimistic updates, conflict resolution)

---

## Dimensions (Spectrums to Explore)

| Dimension | Spectrum |
|-----------|----------|
| **Protocol** | SSE (simple) ←→ WebSockets (full duplex) |
| **Hosting** | Managed (Supabase) ←→ Custom server |
| **Scope** | Single channel ←→ Many rooms/topics |
| **Presence** | Not needed ←→ Who's online critical |
| **Reliability** | Best effort ←→ Guaranteed delivery |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Chat + Supabase | Supabase Realtime channels |
| Live notifications only | Server-Sent Events |
| Gaming + low latency | WebSockets + custom server |
| Collaborative editing | Supabase presence + broadcast |
| Dashboard + live data | Supabase postgres_changes |
| Need offline + sync | Optimistic updates + TanStack Query |

---

## Supabase Realtime

### Setup

```bash
pnpm add @supabase/supabase-js
```

```typescript
// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### Listen to Database Changes

```tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

function ChatRoom({ roomId }: { roomId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // Initial fetch
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true });
      
      if (data) setMessages(data);
    };
    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  return (
    <div>
      {messages.map((msg) => (
        <div key={msg.id}>{msg.content}</div>
      ))}
    </div>
  );
}
```

### Presence (Who's Online)

```tsx
function OnlineUsers({ roomId }: { roomId: string }) {
  const [users, setUsers] = useState<{ userId: string; name: string }[]>([]);

  useEffect(() => {
    const channel = supabase.channel(`room:${roomId}`, {
      config: { presence: { key: currentUser.id } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const onlineUsers = Object.entries(state).map(([userId, data]) => ({
          userId,
          name: (data[0] as any).name,
        }));
        setUsers(onlineUsers);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            userId: currentUser.id,
            name: currentUser.name,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  return (
    <div>
      <h3>Online ({users.length})</h3>
      {users.map((u) => (
        <span key={u.userId} className="online-dot">{u.name}</span>
      ))}
    </div>
  );
}
```

### Broadcast (Ephemeral Messages)

```tsx
// Live cursors, typing indicators, game events
function CollaborativeCanvas({ roomId }: { roomId: string }) {
  const [cursors, setCursors] = useState<Map<string, { x: number; y: number }>>(new Map());

  useEffect(() => {
    const channel = supabase.channel(`canvas:${roomId}`);

    channel
      .on("broadcast", { event: "cursor" }, ({ payload }) => {
        setCursors((prev) => {
          const next = new Map(prev);
          next.set(payload.userId, { x: payload.x, y: payload.y });
          return next;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    supabase.channel(`canvas:${roomId}`).send({
      type: "broadcast",
      event: "cursor",
      payload: {
        userId: currentUser.id,
        x: e.clientX,
        y: e.clientY,
      },
    });
  }, [roomId]);

  return (
    <div onMouseMove={handleMouseMove}>
      {/* Render other users' cursors */}
      {Array.from(cursors.entries()).map(([userId, pos]) => (
        <div
          key={userId}
          className="cursor-dot"
          style={{ left: pos.x, top: pos.y }}
        />
      ))}
    </div>
  );
}
```

---

## WebSockets

### Native WebSocket

```tsx
function useWebSocket(url: string) {
  const [messages, setMessages] = useState<string[]>([]);
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setStatus("connected");
    ws.onclose = () => setStatus("disconnected");
    
    ws.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.close();
    };
  }, [url]);

  const send = useCallback((data: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(data);
    }
  }, []);

  return { messages, status, send };
}

// Usage
function Chat() {
  const { messages, status, send } = useWebSocket("wss://api.example.com/ws");

  return (
    <div>
      <div>Status: {status}</div>
      {messages.map((msg, i) => (
        <div key={i}>{msg}</div>
      ))}
      <button onClick={() => send("Hello!")}>Send</button>
    </div>
  );
}
```

### With Reconnection

```tsx
function useWebSocketWithRetry(url: string, maxRetries = 5) {
  const [messages, setMessages] = useState<string[]>([]);
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const wsRef = useRef<WebSocket | null>(null);
  const retriesRef = useRef(0);

  const connect = useCallback(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");
      retriesRef.current = 0; // Reset retries on successful connection
    };

    ws.onclose = () => {
      setStatus("disconnected");
      
      // Exponential backoff retry
      if (retriesRef.current < maxRetries) {
        const delay = Math.min(1000 * 2 ** retriesRef.current, 30000);
        retriesRef.current++;
        setTimeout(connect, delay);
      }
    };

    ws.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
    };
  }, [url, maxRetries]);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
    };
  }, [connect]);

  const send = useCallback((data: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(data);
    }
  }, []);

  return { messages, status, send };
}
```

---

## Server-Sent Events

One-way real-time updates from server to client.

### Server (Next.js API Route)

```typescript
// app/api/events/route.ts
export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      // Example: Send updates every 5 seconds
      const interval = setInterval(() => {
        send({ type: "heartbeat", timestamp: Date.now() });
      }, 5000);

      // Or subscribe to your event source
      // const unsubscribe = eventEmitter.on("update", send);

      // Cleanup when client disconnects
      // This is handled by the Request object's signal
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
```

### Client

```tsx
function useSSE(url: string) {
  const [data, setData] = useState<unknown>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        setData(JSON.parse(event.data));
      } catch {
        setData(event.data);
      }
    };

    eventSource.onerror = () => {
      setError(new Error("SSE connection failed"));
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [url]);

  return { data, error };
}

// Usage
function Dashboard() {
  const { data } = useSSE("/api/events");

  return <div>Latest: {JSON.stringify(data)}</div>;
}
```

---

## Optimistic Updates

Show instant feedback before server confirms.

### With TanStack Query

```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";

function TodoList() {
  const queryClient = useQueryClient();

  const addTodo = useMutation({
    mutationFn: async (newTodo: { title: string }) => {
      const res = await fetch("/api/todos", {
        method: "POST",
        body: JSON.stringify(newTodo),
      });
      return res.json();
    },

    // Optimistic update
    onMutate: async (newTodo) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["todos"] });

      // Snapshot current state
      const previousTodos = queryClient.getQueryData(["todos"]);

      // Optimistically add new todo
      queryClient.setQueryData(["todos"], (old: Todo[]) => [
        ...old,
        { 
          id: `temp-${Date.now()}`, 
          title: newTodo.title, 
          completed: false 
        },
      ]);

      // Return snapshot for rollback
      return { previousTodos };
    },

    // Rollback on error
    onError: (err, newTodo, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(["todos"], context.previousTodos);
      }
    },

    // Refetch after success to get real server data
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const title = e.currentTarget.title.value;
        addTodo.mutate({ title });
        e.currentTarget.reset();
      }}
    >
      <input name="title" required />
      <button type="submit">Add</button>
    </form>
  );
}
```

### With Zustand

```tsx
import { create } from "zustand";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  pending?: boolean;
}

interface TodoStore {
  todos: Todo[];
  addTodo: (title: string) => Promise<void>;
}

const useTodoStore = create<TodoStore>((set, get) => ({
  todos: [],

  addTodo: async (title) => {
    const tempId = `temp-${Date.now()}`;

    // 1. Optimistic add
    set((state) => ({
      todos: [
        ...state.todos,
        { id: tempId, title, completed: false, pending: true },
      ],
    }));

    try {
      // 2. Server request
      const res = await fetch("/api/todos", {
        method: "POST",
        body: JSON.stringify({ title }),
      });
      const realTodo = await res.json();

      // 3. Replace temp with real
      set((state) => ({
        todos: state.todos.map((t) =>
          t.id === tempId ? { ...realTodo, pending: false } : t
        ),
      }));
    } catch (error) {
      // 4. Rollback on error
      set((state) => ({
        todos: state.todos.filter((t) => t.id !== tempId),
      }));
      throw error;
    }
  },
}));
```

---

## Patterns Comparison

| Pattern | Pros | Cons | Use Case |
|---------|------|------|----------|
| **Supabase Realtime** | Easy setup, built-in presence | Tied to Supabase | Most real-time apps |
| **WebSockets** | Full duplex, custom protocol | More setup, manage connections | Gaming, custom servers |
| **SSE** | Simple, auto-reconnect | One-way only | Notifications, live feeds |
| **Polling** | Works everywhere | Wastes resources | Fallback only |

---

## Best Practices

### Connection Management

```tsx
// ✅ Cleanup subscriptions
useEffect(() => {
  const channel = supabase.channel("room");
  channel.subscribe();
  
  return () => {
    supabase.removeChannel(channel);
  };
}, []);

// ✅ Handle reconnection
const [isOnline, setIsOnline] = useState(navigator.onLine);

useEffect(() => {
  const handleOnline = () => setIsOnline(true);
  const handleOffline = () => setIsOnline(false);

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}, []);
```

### Batching Updates

```tsx
// ❌ Updates on every message - too many re-renders
ws.onmessage = (event) => {
  setMessages((prev) => [...prev, event.data]);
};

// ✅ Batch updates
const bufferRef = useRef<string[]>([]);

useEffect(() => {
  ws.onmessage = (event) => {
    bufferRef.current.push(event.data);
  };

  const interval = setInterval(() => {
    if (bufferRef.current.length > 0) {
      setMessages((prev) => [...prev, ...bufferRef.current]);
      bufferRef.current = [];
    }
  }, 100); // Flush every 100ms

  return () => clearInterval(interval);
}, []);
```

### Error Handling

```tsx
function useRealtimeWithStatus(channelName: string) {
  const [status, setStatus] = useState<"connecting" | "subscribed" | "error">("connecting");

  useEffect(() => {
    const channel = supabase
      .channel(channelName)
      .on("postgres_changes", { event: "*", schema: "public" }, handleChange)
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setStatus("subscribed");
        } else if (status === "CHANNEL_ERROR") {
          setStatus("error");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelName]);

  return status;
}
```

---

## Resources

- Supabase Realtime: [supabase.com/docs/guides/realtime](https://supabase.com/docs/guides/realtime)
- WebSocket API: [developer.mozilla.org/en-US/docs/Web/API/WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- TanStack Query Optimistic Updates: [tanstack.com/query/latest/docs/react/guides/optimistic-updates](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)
