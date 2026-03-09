# Agent 3 Handoff — NoSQL Databases

## Context

Skills Library for AI-assisted development. Review identified NoSQL as gap blocking 10-15% of roles.

**Location:** `/Users/franklawrencejr./Downloads/skills-library-v2 2/`

---

## What to Build

### `agents/nosql/SKILL.md`

**Must cover:**

1. **When to Use NoSQL**
   - SQL vs NoSQL decision tree
   - Document stores vs key-value vs wide-column
   - CAP theorem simplified

2. **MongoDB Patterns**
   - Connection with Mongoose (Node.js)
   - Schema design for documents
   - Indexes and queries
   - Aggregation pipeline basics

3. **DynamoDB Patterns**
   - AWS setup with boto3/SDK
   - Single-table design
   - Partition key strategies
   - Global secondary indexes

4. **Redis as NoSQL**
   - Beyond caching
   - Sets, hashes, sorted sets
   - Pub/sub for real-time

5. **Migration Patterns**
   - SQL to NoSQL considerations
   - Gradual migration strategies

---

## Format

YAML frontmatter:

```yaml
---
name: nosql
description: NoSQL databases. MongoDB, DynamoDB, Redis. When to use, patterns, migrations.
last_updated: 2026-03
---
```

Must have:

- TL;DR table
- Numbered parts with code examples
- Decision tree for SQL vs NoSQL
- Checklist at end
- Resources section
- Related Skills section

---

## Style

- Production-ready examples
- TypeScript and Python examples
- Practical, ship-fast focus

---

## After Building (REQUIRED)

**You MUST update these files after creating skills:**

1. Add to `SKILL-NAVIGATION.md` under "4. DATA & DATABASE"
2. Add to `tech-stack/SKILL-INDEX.md` under "Need: Database"
3. Add to `_meta/CHANGELOG.md` with today's date

**Example entries:**

```markdown
# SKILL-NAVIGATION.md
| `agents/nosql/SKILL.md` | MongoDB, DynamoDB, Redis patterns |

# CHANGELOG.md
- `agents/nosql/SKILL.md` — NoSQL database patterns
```

---

## Completion Report

When done, provide:

1. Path to created file
2. Confirmation navigation updated
3. Any issues or suggestions
