# Updates & Changelog Skill

**Track AI model changes, tool updates, skill deltas, and deprecations to keep your workflow current.**

---

## Context Questions

Before checking for updates, ask:

1. **What triggered the check?** — Something broke, scheduled monthly audit, new project setup
2. **What categories matter?** — AI models, tools, packages, skills library, all
3. **What's the update priority?** — Security critical, breaking changes, new features, all
4. **What's the action scope?** — Audit only, update docs, update dependencies, full migration
5. **What's the risk tolerance?** — Conservative (wait), standard (follow guides), aggressive (early adopt)

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| Scope | Single dependency ←→ Full ecosystem audit |
| Urgency | Routine check ←→ Critical security fix |
| Action | Monitor only ←→ Immediate update |
| Documentation | Internal notes ←→ Public changelog |
| Testing | Trust it works ←→ Full regression testing |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Security vulnerability | Update immediately, skip waiting period |
| Model deprecated | Update before sunset date, test prompts |
| Package major version | Read migration guide, update affected skills |
| Tool sunset | Update WORKFLOW-GUIDE.md, find alternative |
| Monthly routine | Check all changelogs, update TIME-AWARENESS.md |
| Something broke | Check recent updates, review regressions log |

---

## TL;DR

Check these sources monthly (or when things break):

| Category | Where to Check | What to Look For |
|----------|----------------|------------------|
| AI Models | Provider changelogs | New capabilities, deprecations, pricing |
| AI Tools | Release notes | Breaking changes, new features |
| Skills Library | `_meta/CHANGELOG.md` | Skill updates, new skills |
| Packages | `npm outdated` | Security fixes, breaking changes |

---

## Part 1: AI Model Updates

### Models to Track

| Provider | Model | Changelog URL |
|----------|-------|---------------|
| Anthropic | Claude 3.5/4 | https://docs.anthropic.com/en/release-notes |
| OpenAI | GPT-4.5/5 | https://platform.openai.com/docs/changelog |
| Google | Gemini 2.0+ | https://ai.google.dev/gemini-api/docs/changelog |

### What Changes Matter

**Capability Updates:**
- New context windows (affects prompting strategy)
- New modalities (vision, audio, code execution)
- New features (tool use, structured outputs)

**Behavior Shifts:**
- Reasoning improvements (less hand-holding needed)
- Safety tuning (may break edge case prompts)
- Speed/latency changes (affects streaming UX)

**Deprecations:**
- Model version sunsets (legacy → current)
- API version changes (check `apiVersion` in code)
- Feature removals

### Monthly Model Audit

```markdown
## Model Status Check - [Month Year]

### Claude
- Current: claude-3-5-sonnet-20241022
- Changes: [None / List]
- Affected Skills: [None / List]

### GPT
- Current: gpt-4o-2024-11-20
- Changes: [None / List]
- Affected Skills: [None / List]

### Gemini
- Current: gemini-2.0-flash-exp
- Changes: [None / List]
- Affected Skills: [None / List]
```

---

## Part 2: AI Tool Updates

### Tools to Track

| Tool | Purpose | Where to Check |
|------|---------|----------------|
| **Anti-Gravity** | Primary IDE agent | In-app updates |
| **Cursor** | Tab completion, chat | https://cursor.sh/changelog |
| **Claude Code** | CLI coding | https://docs.anthropic.com/en/docs/claude-code |
| **Jules** | Async background agent | Google announcements |
| **Stitch** | Multi-modal prototyping | In-app updates |
| **Google AI Studio** | Prototyping, testing | https://ai.google.dev/updates |
| **v0** | UI generation | https://v0.dev/changelog |

### What to Watch For

**Breaking Changes:**
- New file format requirements (.mdc, .cursorrules)
- API key/auth changes
- Rate limit changes
- Credit/pricing model changes

**New Features:**
- New tools added (affects WORKFLOW-GUIDE.md)
- New context sources (codebase indexing)
- New output formats

**Workflow Impacts:**
- Tool removed/sunset → update WORKFLOW-GUIDE.md
- New tool emerged → evaluate for workflow
- Capability overlap changed → update "which tool when"

### Tool Update Template

```markdown
## Tool Update - [Tool Name] - [Date]

**Version:** X.Y.Z
**Type:** Feature / Breaking / Deprecation

**What Changed:**
- 

**Affected Skills:**
- 

**Action Required:**
- [ ] Update WORKFLOW-GUIDE.md
- [ ] Update agents/[tool]/SKILL.md
- [ ] Update TOOLS_INVENTORY.md
- [ ] Test existing workflows
```

---

## Part 3: Skill Deltas

### When Skills Need Updates

| Trigger | Action |
|---------|--------|
| Package major version bump | Review affected skill |
| API deprecated | Update skill examples |
| New best practice emerged | Add to skill |
| Bug discovered in skill | Fix and document |
| Model behavior changed | Adjust prompting patterns |

### Skill Update Checklist

```markdown
## Skill Update - [skill-name]/SKILL.md

**Reason:** [Package update / Model change / Bug fix / Enhancement]

**Changes Made:**
- [ ] Updated version numbers
- [ ] Updated code examples
- [ ] Updated prompting patterns
- [ ] Added new sections
- [ ] Removed deprecated patterns
- [ ] Updated related skill references

**Testing:**
- [ ] Code examples run without errors
- [ ] Prompts produce expected results
- [ ] Links to other skills work
```

### Skills Most Likely to Need Updates

| Skill | Why | Check Frequency |
|-------|-----|-----------------|
| `ai-sdk/SKILL.md` | Vercel AI SDK moves fast | Monthly |
| `agents/motion/SKILL.md` | Package renamed recently | Quarterly |
| `agents/stripe/SKILL.md` | API versions change | Quarterly |
| `platforms/WORKFLOW-GUIDE.md` | Tools change constantly | Monthly |
| `_meta/TIME-AWARENESS.md` | Version table | Quarterly |

---

## Part 4: Prompt Pattern Updates

### When Prompts Need Revision

| Trigger | Example | Action |
|---------|---------|--------|
| Model got smarter | Less step-by-step needed | Simplify prompts |
| Model got dumber at X | Worse at specific task | Add more guidance |
| New capability | Tool use, vision | Update prompt-craft |
| Behavior shift | Safety refusals | Rephrase approach |

### Prompt Pattern Changelog

Track in `prompt-craft/CHANGELOG.md`:

```markdown
## [Date] - Prompt Pattern Updates

### Changed
- `ANIMATION.md`: Simplified timing prompts (Claude 4 handles better)
- `RESOURCES.md`: Added vision-first patterns for UI generation

### Deprecated
- Chain-of-thought verbose mode (models do this natively now)

### Added
- Structured output patterns for tool use
```

---

## Part 5: Package & Dependency Updates

### Monthly Dependency Audit

```bash
# Check for outdated packages
npm outdated

# Check for security issues
npm audit

# Update all minor/patch versions
npm update

# Check for major version changes (manual review)
npx npm-check-updates
```

### High-Priority Packages

| Package | Why It Matters | Update Strategy |
|---------|----------------|-----------------|
| `next` | Framework core | Wait 1 week after major |
| `react` | UI core | Wait 1 week after major |
| `@clerk/nextjs` | Auth | Update same day (security) |
| `stripe` | Payments | Update same day (security) |
| `prisma` | Database | Test migrations carefully |
| `gsap` | Animation | Check for breaking changes |

### When Major Versions Drop

1. **Read the migration guide** before updating
2. **Update skills** that reference the package
3. **Update TIME-AWARENESS.md** version table
4. **Update TOOLS_INVENTORY.md** if package renamed
5. **Run hygiene check** after updates

---

## Part 6: Centralized Changelog

Create and maintain `_meta/CHANGELOG.md`:

```markdown
# Skills Library Changelog

## [2026-01-26]

### Added
- `workflows/project-hygiene/SKILL.md` - File system hygiene checks
- `workflows/updates/SKILL.md` - This file

### Changed
- Updated all Next.js 14 → 15 references
- Updated all Node 20 → 22 references
- Updated React 18+ → React 19+ references
- Fixed TIME-AWARENESS.md table formatting

### Fixed
- Removed corrupted `{_meta,_security...}` folder
- Clarified framer-motion as legacy in motion skill

### Deprecated
- None

---

## [2026-01-25]

### Added
- Initial Skills Library v2 structure
- 25 agent skills
- 9 workflow skills
- 3 app-type blueprints
```

---

## Part 7: Update Workflow

### Monthly Update Ritual

```markdown
## Monthly Skills Library Update - [Month Year]

### 1. Model Check
- [ ] Check Anthropic changelog
- [ ] Check OpenAI changelog
- [ ] Check Google AI changelog
- [ ] Note any behavior changes

### 2. Tool Check
- [ ] Check Cursor changelog
- [ ] Check Anti-Gravity updates
- [ ] Check Google AI Studio updates
- [ ] Update WORKFLOW-GUIDE.md if needed

### 3. Package Check
- [ ] Run `npm outdated` in active projects
- [ ] Note major version bumps
- [ ] Update affected skills

### 4. Skill Audit
- [ ] Run project-hygiene checks
- [ ] Check for outdated version references
- [ ] Test 2-3 critical skills

### 5. Document
- [ ] Update _meta/CHANGELOG.md
- [ ] Update _meta/TIME-AWARENESS.md if versions changed
- [ ] Update tech-stack/TOOLS_INVENTORY.md if tools changed
```

---

## Part 8: What Broke / What Improved

### Tracking Regressions

When something stops working:

```markdown
## Regression Report - [Date]

**Skill:** [path/to/SKILL.md]
**Issue:** [What broke]
**Cause:** [Model change / Package update / Tool change]
**Fix:** [How to resolve]
**Status:** [ ] Fixed / [ ] Workaround / [ ] Blocked
```

### Tracking Improvements

When something gets better:

```markdown
## Improvement Report - [Date]

**Skill:** [path/to/SKILL.md]
**What Improved:** [Description]
**Cause:** [Model got smarter / New feature / Better pattern]
**Action:** [Simplified prompts / Added new examples / No action needed]
```

---

## Quick Reference

### Update Priority Matrix

| Update Type | Priority | Action Timeline |
|-------------|----------|-----------------|
| Security fix | 🔴 Critical | Same day |
| Model deprecation | 🔴 Critical | Before sunset |
| Breaking change | 🟡 High | Within 1 week |
| New feature | 🟢 Normal | Monthly review |
| Performance improvement | 🟢 Normal | Monthly review |
| Documentation update | ⚪ Low | Quarterly |

### Files to Update When...

| Event | Update These Files |
|-------|-------------------|
| New AI model | `_meta/TIME-AWARENESS.md`, `ai-sdk/SKILL.md` |
| Tool sunset | `platforms/WORKFLOW-GUIDE.md` |
| Package renamed | `tech-stack/TOOLS_INVENTORY.md` |
| Version bumps | `_meta/TIME-AWARENESS.md`, affected skills |
| New tool added | `TOOLS_INVENTORY.md`, `WORKFLOW-GUIDE.md` |
| Skill added | `SKILL-NAVIGATION.md`, `_meta/CHANGELOG.md` |

---

## Related Skills

- `_meta/TIME-AWARENESS.md` - Current version requirements
- `tech-stack/TOOLS_INVENTORY.md` - Tool reference
- `platforms/WORKFLOW-GUIDE.md` - Tool usage patterns
- `workflows/project-hygiene/SKILL.md` - Post-update checks
