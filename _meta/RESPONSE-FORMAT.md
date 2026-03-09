# Response Format

How agents should respond. Enables checkpoints and handoffs.

## TL;DR

Every significant response ends with:
```
---
## ✓ Done
- [x] Thing completed

## → Next
- [ ] Thing remaining

## 📋 Handoff
"[One-line context for next agent]"
```

---

## Why This Format

1. **You know what happened** - Clear list of completed work
2. **You know what's left** - No guessing about remaining tasks
3. **Handoff ready** - Copy the handoff line to next agent
4. **Checkpoint built-in** - Every response is a checkpoint

---

## Response Types

### After Building Something

```
[Work output - code, explanation, etc.]

---
## ✓ Done
- [x] Created user authentication flow
- [x] Added login/signup pages
- [x] Integrated Clerk middleware
- [x] Protected dashboard routes

## → Next
- [ ] Add user profile page
- [ ] Implement password reset
- [ ] Add OAuth providers (Google, GitHub)

## 📋 Handoff
"Auth system complete with Clerk. Login/signup working. Dashboard protected. Need profile page and OAuth next."
```

### After Research/Analysis

```
[Analysis or findings]

---
## ✓ Done
- [x] Researched animation library options
- [x] Compared GSAP vs Motion for this use case
- [x] Identified scroll-trigger requirements

## → Next
- [ ] Implement scroll animations
- [ ] Add page transitions
- [ ] Optimize for mobile

## 📋 Handoff
"Decided on GSAP for scroll animations due to ScrollTrigger. Motion for layout animations. Ready to implement."
```

### After Quick Fix

```
[Fix applied]

---
## ✓ Done
- [x] Fixed TypeScript error in Button component

## → Next
- [ ] Continue with original task

## 📋 Handoff
"Fixed TS error. Button component working. Continue with [original task]."
```

---

## When to Include

| Response Type | Include Format? |
|---------------|-----------------|
| Building feature | ✓ Yes |
| Fixing bug | ✓ Yes |
| Research/analysis | ✓ Yes |
| Quick answer/question | ✗ No |
| Clarifying question | ✗ No |
| Conversation | ✗ No |

**Rule:** Include when work was done that should be tracked.

---

## Handoff Usage

### Same Agent, Later
```
"Continue from handoff: [paste handoff line]"
```

### Different Agent
```
"Previous agent completed: [paste handoff line]
Now I need you to: [next task]"
```

### Different Platform
```
"Coming from [Cursor/Claude Code/Anti-Gravity]:
[paste handoff line]
Continue with: [task]"
```

---

## Checkpoint Accumulation

Over a session, checkpoints accumulate:

```
Session Start
    ↓
CP1: Auth system complete
    ↓
CP2: Dashboard layout done
    ↓
CP3: Data tables working
    ↓
CP4: Charts integrated
    ↓
Ship
```

Each response's "Done" section = that checkpoint.

---

## For the Human (Your Workflow)

### Track Progress
Keep a running list of handoff lines:
```
Session: Dashboard Build
1. "Auth complete with Clerk. Protected routes working."
2. "Sidebar + header layout done. Responsive."
3. "User table with search/filter/pagination."
4. "Revenue chart + stat cards."
→ Ready to ship
```

### Resume Sessions
Start new session with:
```
"Last session ended at: [handoff line]
Continue with: [next task]"
```

### Multi-Agent Workflow
```
Claude Code: Heavy refactoring → Handoff
Cursor: Quick iterations → Handoff
Anti-Gravity: Parallel tasks + images → Handoff
```

---

## Example Full Response

```
I've set up the authentication system with Clerk.

Created files:
- `src/middleware.ts` - Route protection
- `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`
- `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`

The dashboard routes are now protected. Unauthenticated users redirect to sign-in.

---
## ✓ Done
- [x] Installed and configured Clerk
- [x] Created auth middleware
- [x] Added sign-in page
- [x] Added sign-up page
- [x] Protected /dashboard/* routes
- [x] Added UserButton to header

## → Next
- [ ] Add user profile settings page
- [ ] Implement organization/team support
- [ ] Add OAuth providers (Google, GitHub)
- [ ] Create onboarding flow for new users

## 📋 Handoff
"Clerk auth complete. Sign-in/up pages working. Dashboard protected. Need profile settings and OAuth providers next."
```

---

## Flexibility

This format is a DEFAULT. Adapt when needed:
- Skip for conversational responses
- Expand for complex handoffs
- Shorten for quick fixes
- Add sections if helpful (warnings, blockers, etc.)

---

## Code Explanation Modes

When asked to explain code:

### Mode 1: Learning (Default)
For when YOU want to understand:
- What the code does (purpose)
- How it works (mechanics)
- Why it's written this way (reasoning)
- Key concepts to know

### Mode 2: For Others
When you say "explain for [non-technical person/client/etc.]":
- Plain English only
- No jargon
- Analogy-based
- Focus on WHAT not HOW
- Skip implementation details

### Trigger Phrases
- "Explain this code" → Learning mode
- "Explain like I'm 5" → For Others mode
- "Explain for my client" → For Others mode
- "What does this do?" → Learning mode (brief)
- "Walk me through this" → Learning mode (detailed)
