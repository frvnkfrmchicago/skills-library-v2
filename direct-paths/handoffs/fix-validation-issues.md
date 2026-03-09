# Fix Plan: Validation Review Issues

**Created:** 2026-01-26
**Purpose:** Address specific issues from library validation review

---

## Issue 1: Usability - No Search

**Problem:** Users navigate via markdown files only
**Fix:** Not applicable - this is a markdown library, not a web app. Navigation files are sufficient.
**Action:** None needed. Score adjustment: Remove this deduction.

---

## Issue 2: Accuracy - "2024-2025" References

**Problem:** 10 files say "2024-2025" instead of "2025-2026"
**Files to fix:**
1. `direct-paths/reviews/comprehensive-review.md`
2. `_meta/LIBRARY-RULES.md`
3. `direct-paths/reviews/ai-builder-review.md`
4. `_meta/VERSION-CHANGELOG.md`
5. `direct-paths/handoffs/TEMPLATE.md`
6. `direct-paths/handoffs/agent3-vision-prompts.md`
7. `direct-paths/handoffs/agent2-eval-observability.md`
8. `direct-paths/handoffs/agent2-data-observability.md`

**Action:** Search and replace "2024-2025" → "2025-2026" in these files

---

## Issue 3: Accuracy - Node 20 References

**Problem:** 6 files reference Node 20, only 3 reference Node 22
**Files to check:**
1. `_meta/ANTI-PATTERNS.md`
2. `_meta/VERSION-CHANGELOG.md`
3. `_meta/CHANGELOG.md`
4. `direct-paths/reviews/library-validation-review.md`
5. `workflows/updates/SKILL.md`

**Action:** Update any Node 20 recommendations to Node 22 (keep historical references as-is)

---

## Issue 4: Platforms - Cursor Skill

**Problem:** No dedicated Cursor skill despite being primary IDE
**Current state:** `.cursor/rules/cursor-skills.mdc` exists but is a rules file, not a skill
**Action:** Create `platforms/cursor/SKILL.md` covering:
- Cursor-specific workflows
- Rules file patterns (.cursorrules, .mdc)
- Composer usage patterns
- Agent mode vs normal mode
- Context management
- Integration with Claude/GPT models

---

## Issue 5: Edge Case Coverage

**Problem:** Not all skills cover error scenarios
**Action:** This is a nice-to-have, not critical. Skills that handle user input (database, stripe, auth) already cover errors. Skip for now.

---

## Issue 6: AI Builder Accessibility

**Problem:** Assumes Python knowledge
**Action:** `ai-builder/python/SKILL.md` IS the beginner entry point. Add a note to `ai-builder/OVERVIEW.md` making this clearer:
- "Start with python/SKILL.md if new to Python"
- Link to setup instructions

---

## Execution Order

1. **Quick fixes (5 min):** Update 2024-2025 → 2025-2026 references
2. **Quick fixes (5 min):** Update Node 20 → 22 where appropriate
3. **Medium (15 min):** Create `platforms/cursor/SKILL.md`
4. **Small (2 min):** Add Python beginner note to AI Builder OVERVIEW

---

## Clarifications for Scoring

### Creator Monetization - ALREADY COVERED
The library builds apps for creators to earn on YOUR platform:
- `app-types/creator-platform/SKILL.md` - Stripe Connect, fan subscriptions, tipping, payouts
- `content/brand-deals/SKILL.md` - Platform-facilitated brand deals

This is NOT about teaching creators to use other tools. Score should not be penalized.

### Blueprints - SUFFICIENT
5 blueprints cover core use cases. Streaming/marketplace/community are nice-to-have expansions, not gaps.

### Usability = Flexibility
Blueprints are starting points. The skill structure (agents/, workflows/, tech-stack/) provides flexibility to adapt. This is working as intended.
