---
name: notion
description: Knowledge management, documentation systems, team wikis, databases, and personal productivity. Build systems that scale.
---

# Notion Skill

Build knowledge systems that actually get used.

## TL;DR

```
STRUCTURE: Database → Views → Templates → Automation

Random pages → Chaos
Linked database with templates → Scalable system
```

---

## Context Questions (Ask Before Building)

Before setting up Notion:

1. **Who's using it?** (Solo, small team, whole org)
2. **What's the primary use?** (Docs, project tracking, wiki, personal)
3. **What's the update frequency?** (Daily, weekly, as-needed)
4. **What needs to be searchable?** (Everything, specific categories)
5. **What's the source of truth?** (Notion alone, synced with tools)

---

## Dimensions (Spectrums to Explore)

| Dimension | Spectrum |
|-----------|----------|
| **Structure** | Flat pages ←→ Relational databases |
| **Complexity** | Simple notes ←→ Full project management |
| **Audience** | Personal ←→ Org-wide |
| **Integration** | Standalone ←→ Connected to other tools |
| **Maintainability** | One-time setup ←→ Ongoing curation |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Personal notes | Simple pages, quick capture, minimal structure |
| Team wiki | Database-backed, templates, clear navigation |
| Project management | Linked databases, views, status tracking |
| Client work | Shared spaces, permissions, templates |
| Knowledge base | Search-optimized, categorized, cross-linked |
| Documentation | Version control thinking, templates, ownership |

---

## Database Patterns

### When to Use Databases vs Pages

| Use Case | Choice |
|----------|--------|
| One-off content | Page |
| Repeating items | Database |
| Needs filtering/sorting | Database |
| Has status/metadata | Database |
| Will grow over time | Database |

### Core Database Properties

| Property Type | Use For |
|---------------|---------|
| **Title** | Main identifier |
| **Select** | Single category (Status, Type) |
| **Multi-select** | Tags, labels, skills |
| **Date** | Due dates, created dates |
| **Person** | Owner, assignee, reviewer |
| **Relation** | Link to other databases |
| **Rollup** | Aggregate from relations |
| **Formula** | Calculated fields |
| **Checkbox** | Done/not done |
| **URL** | External links |

### Example: Project Database Schema

```
Projects Database
├── Name (Title)
├── Status (Select): Planning | In Progress | Review | Done
├── Priority (Select): High | Medium | Low
├── Owner (Person)
├── Due Date (Date)
├── Tasks (Relation → Tasks DB)
├── Task Count (Rollup: count from Tasks)
├── Completed Tasks (Rollup: count where Status = Done)
├── Progress (Formula: Completed / Total)
├── Tags (Multi-select)
└── Notes (Text)
```

---

## View Patterns

### Essential Views for Any Database

| View | Purpose | Filter/Sort |
|------|---------|-------------|
| All | Everything | None |
| My Items | Personal focus | Owner = Me |
| Active | Current work | Status ≠ Done |
| This Week | Time-boxed | Due Date = This Week |
| By Status | Board view | Group by Status |

### Board View Setup

```
Columns: To Do → In Progress → Review → Done
Group by: Status property
Show: Title, Owner, Due Date
Sub-items: Show unchecked tasks
```

### Calendar View Setup

```
Date property: Due Date
Show: Title, Status badge
Color by: Priority or Project
```

### Table View Setup

```
Columns: Name, Status, Owner, Due Date, Priority
Sort: Due Date (ascending)
Filter: Status ≠ Done (for active view)
```

---

## Template Patterns

### Page Template: Meeting Notes

```markdown
# Meeting: [Title]

**Date:** [Date]
**Attendees:** [Names]
**Type:** [Standup | Planning | Retro | 1:1 | Client]

## Agenda
- [ ] [Topic 1]
- [ ] [Topic 2]

## Notes
[Notes go here]

## Action Items
- [ ] [Person]: [Action] — Due: [Date]
- [ ] [Person]: [Action] — Due: [Date]

## Decisions Made
- [Decision 1]
- [Decision 2]

## Follow-ups
- [What needs to happen next]
```

### Page Template: PRD (Product Requirements Doc)

```markdown
# [Feature Name] PRD

**Status:** [Draft | In Review | Approved]
**Owner:** [Name]
**Last Updated:** [Date]

## Problem Statement
[What problem are we solving?]

## User Stories
- As a [user type], I want to [action] so that [benefit]

## Requirements

### Must Have
- [ ] [Requirement 1]
- [ ] [Requirement 2]

### Nice to Have
- [ ] [Requirement 3]

### Out of Scope
- [What we're explicitly NOT doing]

## Technical Considerations
[Technical constraints, dependencies, architecture notes]

## Success Metrics
- [Metric 1]: [Target]
- [Metric 2]: [Target]

## Timeline
| Phase | Dates | Deliverables |
|-------|-------|--------------|
| Design | [Dates] | [What] |
| Build | [Dates] | [What] |
| Launch | [Date] | [What] |

## Open Questions
- [Question 1]
- [Question 2]
```

### Database Template: Weekly Review

```markdown
# Week of [Date Range]

## Wins 🎉
- [Win 1]
- [Win 2]

## Challenges 😅
- [Challenge 1]
- [Challenge 2]

## Learnings 💡
- [Learning 1]
- [Learning 2]

## Next Week Priorities
1. [Priority 1]
2. [Priority 2]
3. [Priority 3]

## Notes
[Additional context]
```

---

## Workspace Structure

### Recommended Top-Level Organization

```
Workspace
├── 🏠 Home (Dashboard)
├── 📋 Projects (Database)
├── 📝 Meeting Notes (Database)
├── 📚 Knowledge Base
│   ├── Engineering
│   ├── Product
│   ├── Design
│   └── Operations
├── 🗂️ Templates
├── 📊 Reports
└── 🗄️ Archive
```

### Navigation Patterns

| Pattern | When to Use |
|---------|-------------|
| Sidebar links | Top-level navigation |
| Linked databases | Show related items |
| Breadcrumbs | Deep nested content |
| Callout links | Important destinations |
| Toggle headers | Long pages |

---

## Integration with Development Workflow

### Dev Documentation Database

```
Docs Database
├── Title
├── Type (Select): Architecture | API | How-To | Decision
├── Status (Select): Draft | Review | Published
├── Owner (Person)
├── Last Updated (Date)
├── Related Project (Relation → Projects)
├── Tags (Multi-select)
└── Content (Page content)
```

### Decision Log Pattern

```
Decisions Database
├── Decision (Title)
├── Date (Date)
├── Status (Select): Proposed | Accepted | Superseded
├── Context (Text): Why this came up
├── Decision (Text): What was decided
├── Consequences (Text): What this means
├── Related Docs (Relation)
└── Decided By (Person)
```

### Sprint Notes

```markdown
# Sprint [X] Notes

**Dates:** [Start] - [End]
**Goal:** [Sprint goal]

## Committed
@[Database view: This Sprint's tickets]

## Daily Notes

### Day 1
- [Notes]

### Day 2
- [Notes]

## Retro Notes
**What went well:**
**What could improve:**
**Action items:**
```

---

## Formulas Reference

### Common Formulas

```javascript
// Days until due
dateBetween(prop("Due Date"), now(), "days")

// Status emoji
if(prop("Status") == "Done", "✅", 
  if(prop("Status") == "In Progress", "🔵", 
    if(prop("Status") == "Blocked", "🔴", "⚪")))

// Progress percentage
round(prop("Completed") / prop("Total") * 100) + "%"

// Overdue check
if(prop("Due Date") < now() and prop("Status") != "Done", true, false)

// Priority score
if(prop("Priority") == "High", 3, 
  if(prop("Priority") == "Medium", 2, 1))
```

---

## Related Skills

- [documentation](file:///agents/documentation/SKILL.md) — Technical writing patterns
- [jira](file:///agents/jira/SKILL.md) — Project tracking (for Jira users)
- [team-handoffs](file:///agents/team-handoffs/SKILL.md) — Handoff patterns
- [ux-research](file:///agents/ux-research/SKILL.md) — Research documentation

---

## Quick Reference

| Building | Include |
|---------|---------|
| Database | Properties, views, templates |
| Template | Structure, placeholders, guidance |
| Wiki Page | Navigation, cross-links, search terms |
| Dashboard | Linked views, quick actions, status |
| Meeting Note | Agenda, notes, action items, decisions |
