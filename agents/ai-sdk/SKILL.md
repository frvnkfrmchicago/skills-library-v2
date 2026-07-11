---
name: ai-sdk-agent
description: Vercel AI SDK - Add AI chat/features to your apps. Use when building AI-powered products, chatbots, or any AI integration.
---

# AI SDK Agent (Vercel AI SDK)

Add AI to your apps. Chat, streaming, multiple providers.

## TL;DR - What This Does

| Want | AI SDK Does It |
|------|----------------|
| Chat with AI in your app | ✓ Yes |
| Streaming responses (like ChatGPT) | ✓ Yes |
| Use Claude, GPT, Gemini | ✓ All of them |
| AI-generated content | ✓ Yes |
| Tool use / function calling | ✓ Yes |

---

## Context Questions (Ask Before Recommending)

Before suggesting AI patterns:

1. **What's the use case?** (chat, generation, summarization, code assist)
2. **Streaming needed?** (real-time typing feel vs. complete response)
3. **Which provider preferred?** (Claude, GPT, Gemini, cost considerations)
4. **Tools/function calling needed?** (AI executing actions)
5. **Context length requirements?** (short prompts vs. long documents)

---

## Dimensions (Spectrums to Explore)

| Dimension | Spectrum |
|-----------|----------|
| **Interaction** | Single prompt ←→ Multi-turn conversation |
| **Response** | Complete (generateText) ←→ Streaming (streamText) |
| **Control** | Simple prompt ←→ System prompt + tools |
| **Provider** | Budget (Gemini Flash) ←→ Premium (Claude/GPT-4) |
| **Complexity** | Text only ←→ Multi-modal (text + tools) |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Chat interface | useChat hook + streamText |
| One-off generation | generateText (no streaming) |
| Need actions | Add tools parameter |
| Cost-sensitive | Gemini Flash or GPT-3.5 |
| High quality needed | Claude Sonnet or GPT-4o |
| Long context | Claude (200K) or Gemini (1M) |

---

## Plain English

**Without AI SDK:** You'd write different code for Claude, different code for GPT, handle streaming yourself, manage state yourself. Messy.

**With AI SDK:** One way to do it. Works with any AI. Handles streaming. Handles state.

---

## Setup (Copy This)

```bash
# Core
pnpm add ai

# Pick your AI provider(s)
pnpm add @ai-sdk/anthropic   # Claude
pnpm add @ai-sdk/openai      # GPT
pnpm add @ai-sdk/google      # Gemini
```

```env
# .env.local
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_GENERATIVE_AI_API_KEY=...
```

---

## Quick Start: Chat App

### 1. API Route (Backend)

```tsx
// app/api/chat/route.ts
import { anthropic } from "@ai-sdk/anthropic"
import { streamText } from "ai"

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    messages,
  })

  return result.toDataStreamResponse()
}
```

### 2. Chat Component (Frontend)

```tsx
// components/chat.tsx
"use client"

import { useChat } from "ai/react"

export function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat()

  return (
    <div className="flex flex-col h-screen">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "text-right" : "text-left"}>
            <span className={`inline-block p-3 rounded-lg ${
              m.role === "user" ? "bg-blue-500 text-white" : "bg-gray-100"
            }`}>
              {m.content}
            </span>
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Type a message..."
          className="w-full p-3 border rounded-lg"
          disabled={isLoading}
        />
      </form>
    </div>
  )
}
```

**That's it.** You now have a streaming AI chat.

---

## Switch AI Providers (Easy)

```tsx
// Just change this line:
import { anthropic } from "@ai-sdk/anthropic"
model: anthropic("claude-sonnet-4-20250514")

// To this:
import { openai } from "@ai-sdk/openai"
model: openai("gpt-4o")

// Or this:
import { google } from "@ai-sdk/google"
model: google("gemini-2.0-flash")
```

Same code, different AI. That's the point.

---

## Common Patterns

### Generate Text (Not Chat)

```tsx
import { generateText } from "ai"
import { anthropic } from "@ai-sdk/anthropic"

const { text } = await generateText({
  model: anthropic("claude-sonnet-4-20250514"),
  prompt: "Write a product description for a smart water bottle",
})

console.log(text)
```

### Generate with System Prompt

```tsx
const result = streamText({
  model: anthropic("claude-sonnet-4-20250514"),
  system: "You are a helpful product assistant for an e-commerce store. Be concise and friendly.",
  messages,
})
```

### AI with Tools (Function Calling)

```tsx
import { tool } from "ai"
import { z } from "zod"

const result = streamText({
  model: anthropic("claude-sonnet-4-20250514"),
  messages,
  tools: {
    getWeather: tool({
      description: "Get weather for a location",
      parameters: z.object({
        city: z.string(),
      }),
      execute: async ({ city }) => {
        // Call weather API
        return { temperature: 72, condition: "sunny" }
      },
    }),
  },
})
```

---

## useChat Options

```tsx
const {
  messages,        // Array of messages
  input,           // Current input value
  handleInputChange, // For input onChange
  handleSubmit,    // For form onSubmit
  isLoading,       // Is AI responding?
  error,           // Any error
  reload,          // Retry last message
  stop,            // Stop generation
  setMessages,     // Manually set messages
} = useChat({
  api: "/api/chat",           // Your API route
  initialMessages: [],         // Start with messages
  onFinish: (message) => {},   // When AI finishes
  onError: (error) => {},      // On error
})
```

---

## Decision Tree

```
Adding AI to your app?
│
├── Chat interface → useChat + streamText
├── One-off generation → generateText
├── Need tools/actions → Add tools parameter
├── Multiple AI providers → Just switch the import
└── Streaming UI → Already built-in
```

---

## Tips

1. **Always stream** - Better UX than waiting for full response
2. **Use system prompts** - Control AI behavior
3. **Handle errors** - Show user-friendly messages
4. **Rate limit** - Protect your API costs
5. **Cache when possible** - Don't regenerate same content

---

## Official Resources

### Links
- **Docs:** https://sdk.vercel.ai/docs
- **Examples:** https://sdk.vercel.ai/examples
- **GitHub:** https://github.com/vercel/ai

### What's New (2025)
- Tool/function calling simplified
- Better streaming support
- More provider adapters
- Improved TypeScript types

### Provider Docs
- **Anthropic:** https://docs.anthropic.com
- **OpenAI:** https://platform.openai.com/docs
- **Google:** https://ai.google.dev/docs

### For Image Generation
**Note:** AI SDK is for TEXT/CHAT. For images, use:
- Google AI Studio (Nano Banana Pro) - see `/agents/google-ai-studio/SKILL.md`
- OpenAI ChatGPT Images 2.0
- Replicate

### Search For More
```
"vercel ai sdk [feature] 2025"
"ai sdk [provider] integration"
```
