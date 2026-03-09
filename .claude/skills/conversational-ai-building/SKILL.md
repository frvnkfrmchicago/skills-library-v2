---
name: conversational-ai-building
description: >
  Builds chatbots, assistants, and conversational interfaces with proper context
  management, memory strategies, tool integration, human handoff, and voice
  support. Use when designing conversation flows, adding memory to a chat agent,
  integrating tools into a chatbot, implementing human escalation, or building
  voice interfaces.
---

# Conversational AI Building

Build production-quality conversational AI with proper context management,
memory, tool integration, and graceful failure modes. Conversations are more
than Q&A.

---

## Before You Build — Answer These

1. **Use case?** Support bot, personal assistant, lead gen, internal tool?
2. **Channels?** Web chat, mobile, voice, Slack, WhatsApp?
3. **Memory?** Stateless, session, long-term user profiles?
4. **Integrations?** CRM, calendar, knowledge base, APIs, payments?
5. **Human escalation?** When and how to hand off?

DO NOT start building without answers to all five.

---

## Conversation Design Patterns

### Turn-Taking Structure

```
User speaks → Bot processes → Bot responds → User speaks...
```

### Context Management

Track what the user is trying to do, what information has been collected, and
the conversation state.

```typescript
interface ConversationContext {
  currentIntent: string | null
  collectedSlots: Record<string, any>
  state: 'gathering_info' | 'confirming' | 'executing' | 'complete'
  recentMessages: Message[]
  userProfile?: UserProfile
}
```

### Graceful Failure — Escalating Responses

```typescript
function handleUnknown(context: ConversationContext): string {
  const attempts = context.unknownAttempts || 0

  if (attempts === 0) {
    return "I'm not sure I understood. Could you rephrase that?"
  } else if (attempts === 1) {
    return "I'm still not getting it. Here's what I can help with: [options]"
  } else {
    return "Let me connect you with a human who can better assist."
  }
}
```

---

## Memory Strategies

### Session Memory (Redis or In-Memory)

```typescript
const sessionStore = new Map<string, Message[]>()

function addToSession(sessionId: string, message: Message) {
  const history = sessionStore.get(sessionId) || []
  history.push(message)
  sessionStore.set(sessionId, history.slice(-50))
}
```

### Long-Term Memory (User Profiles)

```typescript
interface UserProfile {
  userId: string
  facts: string[]              // "User prefers dark mode"
  preferences: Record<string, any>
  pastInteractions: Summary[]
  lastSeen: Date
}

function buildPromptWithMemory(profile: UserProfile): string {
  return `
    About this user:
    ${profile.facts.join('\n')}

    Their preferences:
    ${JSON.stringify(profile.preferences)}

    Use this context to personalize responses.
  `
}
```

---

## Tool Integration

Define tools with typed parameters and execution functions:

```typescript
const tools = {
  lookupOrder: {
    description: "Look up order status by order ID",
    parameters: z.object({ orderId: z.string() }),
    execute: async ({ orderId }) => {
      const order = await db.orders.find(orderId)
      return { status: order.status, eta: order.eta }
    }
  },
  scheduleAppointment: {
    description: "Book appointment with available times",
    parameters: z.object({
      date: z.string(),
      time: z.string(),
      service: z.string()
    }),
    execute: async (params) => {
      return await calendar.createBooking(params)
    }
  }
}
```

---

## Human Handoff

Escalate when sentiment drops, turn count exceeds threshold, or user requests it:

```typescript
interface EscalationTrigger {
  sentimentThreshold: number   // < -0.5
  maxTurns: number             // > 10
  keywords: string[]           // ["speak to human", "manager"]
  userRequested: boolean
}

async function checkEscalation(context: ConversationContext): Promise<boolean> {
  if (context.sentiment < -0.5) return true
  if (context.turnCount > 10 && !context.resolved) return true
  if (context.userRequestedHuman) return true
  return false
}

async function escalate(conversationId: string) {
  const summary = await generateSummary(conversationId)
  await notifyAgent(summary)
  return "I'm connecting you with a specialist. They'll be with you shortly."
}
```

---

## Voice Integration

### Text-to-Speech (ElevenLabs)

```typescript
const audio = await elevenlabs.generate({
  voice: "Rachel",
  text: response,
  model_id: "eleven_multilingual_v2"
})
```

### Speech-to-Text (Whisper via Groq)

```typescript
const transcription = await groq.audio.transcriptions.create({
  file: audioFile,
  model: "whisper-large-v3"
})
```

---

## Design Checklist

Before shipping any conversational AI, verify:

1. Bot sets expectations about what it can and cannot do
2. Off-topic messages handled gracefully (not ignored)
3. Bot confirms before taking destructive actions
4. Escape hatches exist (talk to human option always available)
5. Responses are concise (no walls of text)
6. Edge cases and failure modes tested
7. Conversation metrics tracked (resolution rate, escalation rate, avg turns)

---

## ⛔ STOP GATE

DO NOT ship a conversational AI without:
1. Testing the full conversation flow end-to-end
2. Verifying graceful failure after 3+ unknown inputs
3. Confirming human escalation works
4. Validating memory persists across sessions (if applicable)
5. Testing with real user language, not synthetic prompts
