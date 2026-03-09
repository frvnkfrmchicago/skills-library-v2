# Agent 2 Handoff — Microservices + DDD

## Context

Skills Library for AI-assisted development. Review identified microservices and DDD as gap blocking 15-25% of senior roles.

**Location:** `/Users/franklawrencejr./Downloads/skills-library-v2 2/`

---

## What to Build

### `agents/microservices/SKILL.md`

**Must cover:**

1. **Service Boundaries**
   - When to split services
   - Single responsibility for services
   - Anti-patterns (distributed monolith)

2. **Inter-Service Communication**
   - REST vs gRPC decision
   - Async messaging (events)
   - API gateways

3. **Service Discovery**
   - Direct calls vs discovery
   - Load balancing patterns

4. **Distributed Tracing**
   - OpenTelemetry patterns
   - Trace correlation IDs
   - Integration with observability

5. **Saga Pattern**
   - Distributed transactions
   - Compensating actions
   - When to use sagas

6. **Domain-Driven Design Basics**
   - Bounded contexts
   - Aggregates and entities
   - Domain events
   - Repository pattern

---

## Format

YAML frontmatter:

```yaml
---
name: microservices
description: Microservices architecture. Service boundaries, communication, DDD, sagas.
last_updated: 2026-03
---
```

Must have:

- TL;DR table
- Numbered parts with code examples
- Checklist at end
- Resources section
- Related Skills section

---

## Style

- Practical patterns, not academic
- TypeScript/Node examples preferred
- Show when NOT to use microservices (monolith-first)

---

## After Building (REQUIRED)

**You MUST update these files after creating skills:**

1. Add to `SKILL-NAVIGATION.md` under appropriate section
2. Add to `tech-stack/SKILL-INDEX.md`
3. Add to `_meta/CHANGELOG.md` with today's date

**Example entries:**

```markdown
# SKILL-NAVIGATION.md
| `agents/microservices/SKILL.md` | Service boundaries, gRPC, DDD, sagas |

# CHANGELOG.md
- `agents/microservices/SKILL.md` — Microservices + DDD patterns
```

---

## Completion Report

When done, provide:

1. Path to created file
2. Confirmation navigation updated
3. Any issues or suggestions
