---
name: team-handoffs
description: Meta-skill for handoff patterns across tools. Documentation standards for async teams, status updates, cross-functional collaboration.
---

# Team Handoffs Skill

Make context transfer seamless, not painful.

## TL;DR

```
HANDOFF = Current State + What's Done + What's Left + Key Context + Where to Find Things

"Here's the code" → Useless
"Branch X, files Y, decisions Z, next steps A-B-C" → Actionable
```

---

## Context Questions (Ask Before Handing Off)

Before any handoff:

1. **Who's receiving?** (Same role, different role, external)
2. **What's their context level?** (Full, partial, none)
3. **What's the urgency?** (Immediate pickup, when available)
4. **What's the handoff type?** (Temporary, permanent, collaborative)
5. **What tools are involved?** (Jira, Notion, GitHub, Slack)

---

## Dimensions (Spectrums to Explore)

| Dimension | Spectrum |
|-----------|----------|
| **Formality** | Quick Slack → Full documentation |
| **Duration** | 1 hour → Permanent transfer |
| **Complexity** | Simple task → Multi-week project |
| **Audience** | Same team → Cross-functional |
| **Sync** | Real-time → Fully async |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Quick task handoff | Slack + link to ticket |
| End of day handoff | Ticket comment + status update |
| Going on PTO | Full documentation + backup owner |
| Cross-team handoff | Meeting + written doc + Q&A |
| Project transition | Comprehensive handoff document |
| Code review handoff | PR description + context comments |

---

## Handoff Templates

### Quick Handoff (Slack/Chat)

```
🔄 Handoff: [TICKET-123] [Title]

📍 Status: [Where it stands]
✅ Done: [What's complete]
➡️ Next: [Immediate next step]
📎 Links: [PR/Ticket/Doc]

Let me know if questions!
```

### End of Day Handoff

```markdown
## EOD Handoff: [Date]

### Completed Today
- [x] [TICKET-123] Finished API integration
- [x] [TICKET-124] Fixed validation bug

### In Progress
- [ ] [TICKET-125] Payment flow — PR open, needs review
  - Branch: `feature/payment-flow`
  - Blocked on: Design approval for error states

### For Tomorrow/Next Person
1. Review PR for TICKET-125
2. Address review comments on TICKET-126
3. Start TICKET-127 if time

### Notes
- API rate limiting discovered, added to backlog as TICKET-130
- Meeting with design team moved to Thursday
```

### PTO Handoff

```markdown
# PTO Handoff: [Your Name]

**Out:** [Start Date] - [End Date]
**Backup:** [Backup Person]
**Urgent Contact:** [Only if critical - phone/method]

## Active Work

### [Project/Feature Name]
- **Status:** [Current state]
- **Ticket:** [Link]
- **Branch:** [Branch name if applicable]
- **Next Steps:** [What needs to happen]
- **Key Contacts:** [Who to ask about what]

### [Project/Feature Name]
[Repeat structure]

## Recurring Responsibilities
- [ ] [Daily standup - backup will cover]
- [ ] [Weekly report - postponed until return]

## Pending Decisions
| Decision | Context | Who Can Decide |
|----------|---------|----------------|
| [Decision 1] | [Context] | [Person] |

## Documentation
- [Project wiki](link)
- [Architecture doc](link)
- [Runbook](link)

## When I Return
- Catch-up meeting scheduled with [Backup] on [Date]
- Will review [Slack channel] for updates
```

### Project Transition

```markdown
# Project Transition: [Project Name]

**Transitioning From:** [Your Name]
**Transitioning To:** [New Owner]
**Transition Date:** [Date]
**Transition Period:** [Overlap days for questions]

## Project Overview
[2-3 sentence summary of what this project is]

## Current State
- **Phase:** [Design | Development | Testing | Maintenance]
- **Health:** [Green | Yellow | Red]
- **Timeline:** [On track | At risk | Blocked]

## Key Links
| Resource | Link |
|----------|------|
| Repository | [Link] |
| Jira Board | [Link] |
| Documentation | [Link] |
| Figma Designs | [Link] |
| Staging Environment | [Link] |

## Tech Stack
- Frontend: [Technologies]
- Backend: [Technologies]
- Database: [Technologies]
- Infrastructure: [Technologies]

## Architecture Overview
[Brief architecture description or link to diagram]

## Key Decisions Made
| Decision | Rationale | Date |
|----------|-----------|------|
| [Decision 1] | [Why] | [When] |
| [Decision 2] | [Why] | [When] |

## Known Issues / Tech Debt
- [ ] [Issue 1] - [Impact level]
- [ ] [Issue 2] - [Impact level]

## Stakeholders
| Role | Person | Context |
|------|--------|---------|
| Product Owner | [Name] | [How to work with them] |
| Design Lead | [Name] | [How to work with them] |
| Engineering Lead | [Name] | [How to work with them] |

## Upcoming Milestones
| Milestone | Date | Notes |
|-----------|------|-------|
| [Milestone 1] | [Date] | [Context] |

## Onboarding Checklist for New Owner
- [ ] Repository access granted
- [ ] Added to Jira project
- [ ] Introduced to stakeholders
- [ ] Walked through codebase
- [ ] Reviewed documentation
- [ ] Shadow current owner for [X days]

## Open Questions
- [Question 1]
- [Question 2]
```

---

## Cross-Functional Handoff Patterns

### Design → Engineering

```markdown
## Design Handoff: [Feature Name]

### Figma Links
- [Full designs](link)
- [Component specs](link)
- [Prototype](link)

### Design Decisions
| Element | Decision | Notes |
|---------|----------|-------|
| [Element] | [Choice made] | [Why] |

### Responsive Breakpoints
| Breakpoint | Key Changes |
|------------|-------------|
| Mobile (<640px) | [Changes] |
| Tablet (640-1024px) | [Changes] |
| Desktop (>1024px) | [Changes] |

### Interactions
| Element | Trigger | Behavior |
|---------|---------|----------|
| [Button] | Hover | [Effect] |
| [Modal] | Open | [Animation] |

### Edge Cases Covered
- Empty states: [Link to designs]
- Error states: [Link to designs]
- Loading states: [Link to designs]

### Assets
- [ ] Icons exported (SVG)
- [ ] Images exported (WebP/PNG)
- [ ] Fonts specified

### Open Items
- [Item needing engineering input]
```

### Engineering → QA

```markdown
## QA Handoff: [Feature Name]

### Ready for Testing
- **Environment:** [Staging URL]
- **Branch:** [Branch name]
- **Ticket:** [Link]

### Test Credentials
| User Type | Email | Password |
|-----------|-------|----------|
| Admin | [email] | [password] |
| Regular | [email] | [password] |

### What to Test
- [ ] [Happy path scenario 1]
- [ ] [Happy path scenario 2]
- [ ] [Edge case 1]
- [ ] [Edge case 2]

### Known Limitations
- [Limitation 1] — Will be addressed in [ticket]
- [Limitation 2] — By design

### How to Reproduce Test Data
[Steps to set up test scenarios]

### Out of Scope for This Test
- [Thing not included]
- [Thing not included]
```

### Engineering → Stakeholders

```markdown
## Feature Complete: [Feature Name]

### Summary
[1-2 sentence non-technical summary]

### What Users Can Now Do
- [Capability 1]
- [Capability 2]

### How to Access
- [URL/Path to feature]
- [Any prerequisites]

### Demo Recording
[Link to Loom/video]

### Known Issues
| Issue | Impact | Plan |
|-------|--------|------|
| [Issue] | [Impact] | [When fixed] |

### Rollout Plan
| Phase | Date | Audience |
|-------|------|----------|
| Beta | [Date] | [Who] |
| GA | [Date] | [Who] |

### Support Documentation
- User guide: [Link]
- FAQ: [Link]
```

---

## Async Communication Patterns

### Status Update Format

```
📊 [Project Name] Weekly Update

✅ Completed:
- [Item 1]
- [Item 2]

🔄 In Progress:
- [Item 1] — [% complete or ETA]
- [Item 2] — [% complete or ETA]

🚫 Blocked:
- [Item] — Waiting on [person/thing]

📅 Next Week:
- [Priority 1]
- [Priority 2]

⚠️ Risks:
- [Risk if any]

💬 Need Input On:
- [Question if any]
```

### Blocker Escalation

```
🚨 Blocker: [Brief description]

**Impact:** [What's blocked, timeline affected]
**Blocking Since:** [Date/Time]
**What I've Tried:** [Attempts made]
**What I Need:** [Specific ask]
**Who Can Help:** @[Person]

**Workaround Available:** [Yes/No - if yes, describe]
```

---

## Tool-Specific Patterns

### GitHub PR Description

```markdown
## Summary
[What this PR does in 1-2 sentences]

## Related
- Closes #[issue number]
- Related to #[issue number]

## Changes
- [Change 1]
- [Change 2]
- [Change 3]

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] Edge cases verified

## Screenshots
[If UI changes]

## Deployment Notes
[Any special deployment considerations]

## Reviewer Notes
[What to focus on, areas of uncertainty]
```

### Slack Thread Summary

When a long thread concludes:
```
📝 Thread Summary:

Decision: [What was decided]
Action Items:
- @person1: [Action] by [date]
- @person2: [Action] by [date]

Documented in: [Link to ticket/doc]
```

---

## Related Skills

- [jira](file:///agents/jira/SKILL.md) — Jira-specific patterns
- [notion](file:///agents/notion/SKILL.md) — Notion-specific patterns
- [documentation](file:///agents/documentation/SKILL.md) — Technical writing
- [tech-communication](file:///agents/tech-communication/SKILL.md) — Communication patterns

---

## Quick Reference

| Handoff Type | Include |
|--------------|---------|
| Quick | Status, next step, link |
| EOD | Done, in progress, tomorrow, notes |
| PTO | Active work, backups, contacts, docs |
| Project | Overview, state, decisions, stakeholders |
| Design→Eng | Figma, specs, interactions, assets |
| Eng→QA | Environment, credentials, test cases |
| Blocker | Impact, tried, need, who can help |
