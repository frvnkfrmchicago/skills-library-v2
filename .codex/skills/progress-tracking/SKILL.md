---
name: progress-tracking
description: >
  Tracks project health with version control, feature completion, technical
  debt, quality metrics, changelogs, and milestone management. Generates
  status reports in TLDR-first format with tables. Use when tracking project
  progress, generating status reports, managing changelogs, bumping versions,
  tracking technical debt, or when user asks "what's the status".
---

# Progress Tracking

Track project health across code quality, feature progress, technical debt,
and deployment readiness. Ship with confidence.

---

## Semantic Versioning

```
MAJOR.MINOR.PATCH
  │     │     └── Bug fixes, patches (1.0.1)
  │     └──────── New features, backward compatible (1.1.0)
  └────────────── Breaking changes (2.0.0)
```

| Change | Bump | Example |
|--------|------|---------|
| Fix typo / bug | Patch | 1.0.0 → 1.0.1 |
| Add feature | Minor | 1.0.1 → 1.1.0 |
| Breaking API change | Major | 1.1.0 → 2.0.0 |
| Internal refactor | None | Keep current |

---

## Status Report Format

Reports MUST follow this structure:

```markdown
## Project Status: [Name]

### TLDR
- [2-3 bullet executive summary]
- [Current stage: Building / Refining]
- [Key blocker or next milestone]

### Feature Progress

| Feature | Status | Progress |
|---------|--------|----------|
| [Feature A] | ✅ Complete | 100% |
| [Feature B] | 🔄 In Progress | 70% |
| [Feature C] | 📋 Planned | 0% |

### Quality Metrics

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| TypeScript | 100% | 100% | ✅ |
| Test Coverage | 72% | 80% | ⚠️ |
| Lint Errors | 0 | 0 | ✅ |
| Bundle Size | 245kb | <300kb | ✅ |

### Technical Debt

| Item | Priority | Effort |
|------|----------|--------|
| [Debt item 1] | 🔴 High | 4h |
| [Debt item 2] | 🟡 Medium | 2h |

### Recent Deploys

| Date | Version | Type | Notes |
|------|---------|------|-------|
| [date] | [ver] | [type] | [notes] |
```

---

## Quality Tracking Commands

Run these to gather metrics:

```bash
# TypeScript check
npx tsc --noEmit

# Lint check
npm run lint

# Find TODOs and debt markers
grep -rn "TODO\|FIXME\|HACK\|XXX" --include="*.ts" --include="*.tsx" src/

# Count lines of code
find src -name "*.ts" -o -name "*.tsx" | xargs wc -l

# Bundle size (Vite)
npm run build && du -sh dist/

# Test coverage (if configured)
npm test -- --coverage
```

---

## Changelog Format

Follow [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
# Changelog

## [Unreleased]

### Added
- New feature in progress

## [1.2.3] - 2026-01-12

### Fixed
- Login redirect on Safari
- Form validation error message

## [1.2.0] - 2026-01-10

### Added
- Billing portal with Stripe
- Invoice history page

### Changed
- Updated pricing structure
```

Categories: **Added**, **Changed**, **Deprecated**, **Removed**, **Fixed**, **Security**

---

## Technical Debt Log

```markdown
## Technical Debt

### 🔴 High Priority (Blocks next release)
| ID | Description | Added | Estimate |
|----|-------------|-------|----------|
| TD-001 | Refactor auth logic | Jan 5 | 4h |

### 🟡 Medium Priority (Next sprint)
| ID | Description | Added | Estimate |
|----|-------------|-------|----------|
| TD-002 | Remove deprecated API | Jan 8 | 2h |

### 🟢 Low Priority (When time permits)
| ID | Description | Added | Estimate |
|----|-------------|-------|----------|
| TD-003 | Add loading skeletons | Jan 10 | 1h |
```

---

## Pre-Release Checklist

Run before any version bump:

```bash
# 1. All tests pass
npm test

# 2. Build succeeds
npm run build

# 3. No lint errors
npm run lint

# 4. Types pass
npx tsc --noEmit

# 5. No critical TODOs
grep -rn "TODO.*CRITICAL\|FIXME.*CRITICAL" --include="*.ts" src/
```

Then:
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json
- [ ] README updated (if new features)
- [ ] Git tag created: `git tag v1.2.3 && git push --tags`

---

## ⛔ STOP GATE

DO NOT generate a status report without:
1. Running the quality tracking commands above
2. Including actual metrics (not placeholders)
3. TLDR at the top, tables for data, explanations after
