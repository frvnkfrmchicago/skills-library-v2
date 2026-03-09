---
name: project-completion-review
description: Review prompt for finished projects. User guide, code docs, deployment readiness.
last_updated: 2026-01-26
---

# Project Completion Review

Use this after a project is **built and working** to verify it's truly done.

---

## Quick Status

| Item | Status | Notes |
|------|--------|-------|
| **Core Features** | ◯ | All working? |
| **User Guide** | ◯ | End-user docs ready? |
| **Code Docs** | ◯ | README, API docs, comments? |
| **Deployment** | ◯ | Production-ready? |
| **Handoff** | ◯ | Can someone else maintain it? |

---

## 1. Feature Completion

### Checklist

```
[ ] All planned features implemented
[ ] Edge cases handled
[ ] Error states have user-friendly messages
[ ] Loading states exist
[ ] Empty states designed
[ ] Mobile responsive (if applicable)
[ ] Forms validate correctly
[ ] Success/error feedback clear
```

### Questions

```
- Can a user complete the core workflow end-to-end?
- What happens if something fails?
- Is anything "MVP only" that should be noted?
```

---

## 2. User Documentation

### Required

| Doc | Status | Path |
|-----|--------|------|
| Getting Started Guide | ◯ | |
| Feature Guides | ◯ | |
| FAQ | ◯ | |
| Troubleshooting | ◯ | |

### Checklist

```
[ ] Screenshots are current
[ ] Instructions work when followed exactly
[ ] No broken links
[ ] Search works (if applicable)
[ ] Mobile-friendly
[ ] Written for actual users, not developers
```

### Where Are Docs?

```
Location: [e.g., /docs, Notion link, GitBook URL]
Entry point: [main documentation URL]
```

---

## 3. Code Documentation

### Required

| Doc | Status | Notes |
|-----|--------|-------|
| README.md | ◯ | Quick start works? |
| API docs | ◯ | OpenAPI or inline? |
| Env variables | ◯ | All documented? |
| Architecture | ◯ | ADRs or overview? |

### README Checklist

```
[ ] One-line description
[ ] Quick start (actually works copy-paste)
[ ] Environment variables listed
[ ] How to run locally
[ ] How to deploy
[ ] Tech stack mentioned
[ ] License specified
```

### Code Quality

```
[ ] Complex functions have comments
[ ] Types are clear (TypeScript)
[ ] Naming is self-documenting
[ ] No commented-out dead code
[ ] No console.logs in production code
```

---

## 4. Deployment Readiness

### Environment

| Item | Status | Value/Notes |
|------|--------|-------------|
| Production URL | ◯ | |
| Staging URL | ◯ | |
| Environment variables set | ◯ | |
| SSL/HTTPS | ◯ | |
| Domain configured | ◯ | |

### Checklist

```
[ ] Production build works
[ ] All env vars documented and set
[ ] Database migrations run
[ ] Assets optimized (images, fonts)
[ ] Error tracking set up (Sentry, etc.)
[ ] Analytics configured
[ ] Monitoring in place
[ ] Backup strategy defined
```

---

## 5. Testing

### Status

| Type | Status | Coverage |
|------|--------|----------|
| Unit tests | ◯ | ___% |
| Integration tests | ◯ | ___% |
| E2E tests | ◯ | Core flows? |
| Manual testing | ◯ | Edge cases? |

### Browser/Device Testing

```
[ ] Chrome (latest)
[ ] Safari (latest)
[ ] Firefox (latest)
[ ] Mobile Safari (iOS)
[ ] Chrome Mobile (Android)
```

---

## 6. Security

### Checklist

```
[ ] Authentication works correctly
[ ] Authorization rules in place
[ ] No sensitive data exposed in client
[ ] API routes protected
[ ] SQL injection prevented
[ ] XSS mitigated
[ ] CORS configured properly
[ ] Secrets not in code/repo
```

### Review

```
Last security review: [date]
Reviewer: [name]
Issues found: [count]
Issues resolved: [count]
```

---

## 7. Performance

### Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| LCP | <2.5s | |
| FID | <100ms | |
| CLS | <0.1 | |
| Bundle size | <200KB | |

### Optimizations

```
[ ] Images optimized (WebP, lazy load)
[ ] Code splitting implemented
[ ] Caching configured
[ ] Database queries optimized
[ ] No N+1 queries
```

---

## 8. Handoff Readiness

Can someone else maintain this?

### Checklist

```
[ ] Code is understandable without you
[ ] All credentials documented (not in code)
[ ] Key contacts/accounts listed
[ ] Known issues documented
[ ] Future improvements noted
[ ] CI/CD pipeline documented
```

### Handoff Document

```markdown
## Project: [Name]

### Quick Info
- **Repo:** [URL]
- **Production:** [URL]
- **Staging:** [URL]
- **Docs:** [URL]

### Tech Stack
[List of technologies]

### Key Accounts
| Service | Account | Owner |
|---------|---------|-------|
| Vercel | [email] | [name] |
| Supabase | [email] | [name] |
| Stripe | [email] | [name] |

### Known Issues
- [Issue 1]
- [Issue 2]

### Future Improvements
- [Improvement 1]
- [Improvement 2]
```

---

## 9. Final Scoring

| Category | Score (0-10) | Notes |
|----------|--------------|-------|
| Feature Complete | /10 | |
| User Docs | /10 | |
| Code Docs | /10 | |
| Deployment | /10 | |
| Testing | /10 | |
| Security | /10 | |
| Performance | /10 | |
| Handoff Ready | /10 | |
| **TOTAL** | /80 | |

### Grading

| Score | Grade | Meaning |
|-------|-------|---------|
| 70-80 | A | Ship it, it's solid |
| 60-69 | B | Minor gaps, ship with notes |
| 50-59 | C | Notable gaps, review needed |
| 40-49 | D | Significant issues |
| <40 | F | Not ready |

---

## Summary Template

```markdown
## Completion Review: [Project Name]

**Date:** [date]
**Reviewer:** [name]
**Score:** [X]/80 ([grade])

### ✅ Ready
- [What's complete and working]

### ⚠️ Needs Attention
- [What's incomplete or concerning]

### 📝 Suggested Next Steps
1. [Action 1]
2. [Action 2]

### 📄 Documentation Status
- User Guide: [status + location]
- Code Docs: [status + location]
- Handoff Doc: [status + location]

### 🚀 Can Ship? [YES/NO]
[Brief justification]
```

---

## Related

- [User Guide](/agents/user-guide/SKILL.md) — End-user documentation
- [Documentation](/agents/documentation/SKILL.md) — Technical docs
- [Testing](/agents/testing/SKILL.md) — Test coverage
- [DevOps](/agents/devops/SKILL.md) — Deployment
- [Security](/agents/security/SKILL.md) — Security practices
