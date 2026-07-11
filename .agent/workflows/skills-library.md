# Skills Library Rules

## Location
The skills library is at: `/Users/franklawrencejr./Downloads/skills-library-v2 2/`

## When to Use
When the user mentions any of these keywords, reference the skills library:
- "use skills"  
- "check skills"
- "skills library"
- "START-HERE"
- Or any explicit skill path like `agents/stripe/SKILL.md`

## How to Use

1. **START-HERE.md first** — For any significant task, read `START-HERE.md` and follow the reasoning protocol
2. **Navigate to specific skill** — Use `SKILL-NAVIGATION.md` to find the right pattern
3. **TL;DR tables** — Always surface the TL;DR table from skills when applicable for quick decisions

## Output Preferences

- **Use TL;DR tables** — When referencing skills, show the TL;DR table for quick context
- **Progress tables** — For multi-step work, use tables to show status
- **Concise summaries** — Don't dump entire skills, extract what's relevant

## Browser & Recording Rules

> [!IMPORTANT]
> **NO browser recordings or playbacks** unless the user explicitly requests:
> - "record this"
> - "show me in browser"
> - "visual demo"
> - "screenshot"

This saves time and tokens. Only use `browser_subagent` when explicitly asked.

## Trigger Phrases

| User says... | Action |
|--------------|--------|
| "use skills for X" | Read START-HERE → navigate to skill → apply |
| "check skills" | Show relevant skill TL;DR |
| "what skill covers X" | Search skills library, show options |
| "plan X" | START-HERE reasoning → use relevant workflow skill |
| "build X" | START-HERE → tech-stack routing → implementation |
