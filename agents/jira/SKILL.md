---
name: jira
description: Project tracking, sprint planning, ticket management, and team workflow patterns. Integrates with development workflow for seamless handoffs.
---

# Jira Skill

Project tracking that actually works with how you build.

## TL;DR

```
TICKET STRUCTURE: [Type] + [Clear Title] + [Acceptance Criteria] + [Context]

"Fix bug" → Vague, useless
"BUG: Login fails when email contains '+' - Expected: login success, Actual: 400 error" → Actionable
```

---

## Context Questions (Ask Before Setting Up Jira Workflow)

Before structuring tickets or sprints:

1. **What's the team size?** (Solo → simple, 5+ → structured)
2. **What methodology?** (Scrum sprints, Kanban flow, hybrid)
3. **What's the release cadence?** (Weekly, bi-weekly, continuous)
4. **Who needs visibility?** (Just devs, PM, stakeholders)
5. **What integrations exist?** (GitHub, Slack, CI/CD)

---

## Dimensions (Spectrums to Explore)

| Dimension | Spectrum |
|-----------|----------|
| **Formality** | Lightweight notes ←→ Full acceptance criteria |
| **Tracking** | Simple status ←→ Story points + velocity |
| **Visibility** | Dev-only ←→ Stakeholder dashboards |
| **Integration** | Manual updates ←→ Automated via GitHub |
| **Scope** | Single project ←→ Multi-team program |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Solo developer | Minimal process, kanban board, no story points |
| Small team (2-5) | Simple sprints, clear acceptance criteria, lightweight |
| Larger team (5+) | Full scrum, story points, velocity tracking |
| Client-facing | Status reports, stakeholder-friendly boards |
| Async/remote | Detailed descriptions, context in tickets |
| Integrated with GitHub | Automate status via branch naming + PRs |

---

## Ticket Writing Patterns

### Story Template

```markdown
## User Story
As a [user type], I want to [action] so that [benefit].

## Acceptance Criteria
- [ ] Given [context], when [action], then [expected result]
- [ ] Given [context], when [action], then [expected result]

## Technical Notes
- Related to: [linked tickets]
- Dependencies: [what must be done first]
- API changes: [if applicable]

## Definition of Done
- [ ] Code complete + reviewed
- [ ] Tests passing
- [ ] Documentation updated
```

### Bug Template

```markdown
## Bug Summary
[One-line description]

## Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Environment
- Browser/Device: [e.g., Chrome 120, iPhone 15]
- Environment: [staging/production]
- User type: [if relevant]

## Screenshots/Logs
[Attach evidence]

## Priority
[Critical/High/Medium/Low] - [Why this priority]
```

### Task Template

```markdown
## Task
[Clear action item]

## Context
[Why this needs to be done]

## Deliverables
- [ ] [Specific output 1]
- [ ] [Specific output 2]

## Time Estimate
[X hours/days]
```

---

## Sprint Planning Patterns

### Sprint Goal Template

```
Sprint [X]: [One sentence outcome]
Example: "Sprint 12: Users can complete checkout with Stripe"
```

### Capacity Planning

| Team Member | Available Hours | Notes |
|-------------|-----------------|-------|
| [Name] | [X hours] | [PTO, meetings, etc.] |

### Sprint Scope Checklist

- [ ] Sprint goal is clear and achievable
- [ ] All stories have acceptance criteria
- [ ] Dependencies are identified
- [ ] No story is larger than 1/3 of sprint
- [ ] Team has reviewed and committed

---

## GitHub Integration

### Branch Naming Convention

```
[ticket-id]-[short-description]

Examples:
PROJ-123-add-stripe-webhook
PROJ-456-fix-login-validation
```

### Commit Message Format

```
[PROJ-123] Add Stripe webhook handler

- Implemented webhook signature verification
- Added handling for payment_intent.succeeded
- Tests added for all event types
```

### PR Title Format

```
[PROJ-123] Add Stripe webhook integration
```

### Automatic Status Updates

Configure Jira + GitHub integration to:
- Move to "In Progress" when branch created
- Move to "In Review" when PR opened
- Move to "Done" when PR merged

---

## Board Views

### Kanban Board Columns

```
Backlog → Ready → In Progress → In Review → Done
```

### Scrum Board Columns

```
To Do → In Progress → In Review → Testing → Done
```

### Recommended Filters

| Filter | Purpose |
|--------|---------|
| My Issues | What I'm working on |
| Blocked | Issues needing attention |
| Ready for Review | Code review queue |
| This Sprint | Current sprint scope |

---

## Status Updates & Handoffs

### Daily Standup Format

```
Yesterday: [What was completed]
Today: [What's planned]
Blockers: [What's stopping progress]
```

### Async Standup (For Remote Teams)

Post in Slack/channel daily:
```
🟢 Done: [PROJ-123] Completed Stripe integration
🔵 Today: [PROJ-124] Starting email notifications
🔴 Blocked: Waiting on API credentials from [person]
```

### Handoff Documentation

When handing off a ticket:
```markdown
## Handoff: [PROJ-123]

### Current Status
[Where things stand]

### What's Done
- [x] [Completed item]
- [x] [Completed item]

### What's Remaining
- [ ] [Remaining item]
- [ ] [Remaining item]

### Key Decisions Made
- [Decision 1]: [Rationale]
- [Decision 2]: [Rationale]

### Important Context
[Anything the next person needs to know]

### Files/Branches
- Branch: `PROJ-123-feature-name`
- Key files: `src/components/Feature.tsx`
```

---

## Common Patterns

### Epic Structure

```
Epic: User Authentication
├── Story: User can register with email
├── Story: User can login with email/password
├── Story: User can reset password
├── Story: User can login with Google OAuth
└── Story: User can enable 2FA
```

### Labels to Use

| Label | Meaning |
|-------|---------|
| `priority-critical` | Production down, blocking release |
| `priority-high` | Important, schedule soon |
| `tech-debt` | Refactoring, cleanup |
| `needs-design` | Waiting on design input |
| `needs-review` | Ready for code review |
| `blocked` | Cannot proceed |

---

## Related Skills

- [documentation](file:///agents/documentation/SKILL.md) — Technical writing patterns
- [tech-communication](file:///agents/tech-communication/SKILL.md) — Cross-functional communication
- [team-handoffs](file:///agents/team-handoffs/SKILL.md) — Handoff patterns across tools
- [enterprise](file:///agents/enterprise/SKILL.md) — Enterprise workflow patterns

---

## Quick Reference

| Writing | Include |
|---------|---------|
| User Story | Who, what, why, acceptance criteria |
| Bug Report | Steps, expected, actual, evidence |
| Task | Action, context, deliverables |
| Sprint Goal | One outcome sentence |
| Handoff | Status, done, remaining, context |
