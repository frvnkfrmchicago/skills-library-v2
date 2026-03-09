---
name: library-update-review
description: Review prompt to audit Skills Library updates. Run after making changes.
last_updated: 2026-01-26
---

# Skills Library Update Review

Use this after updating the library to verify changes are complete, consistent, and integrated.

---

## Session Summary

**Date:** 2026-01-26
**Session Focus:** Content & AI Tools Expansion

---

## What Was Added

### New Skills (7)

| Skill | Type | Path | Status |
|-------|------|------|--------|
| Email Subject Lines | Content | `content/email-subjects/SKILL.md` | ✅ Complete |
| Gemini Gems | Platform | `platforms/gemini-gems/SKILL.md` | ✅ Complete |
| NotebookLM | Platform | `platforms/notebooklm/SKILL.md` | ✅ Complete |
| ChatGPT GPTs | Platform | `platforms/chatgpt-gpts/SKILL.md` | ✅ Complete |
| 3D Prompting | Content | `content/prompting-3d/SKILL.md` | ✅ Complete |
| User Guide | Agent | `agents/user-guide/SKILL.md` | ✅ Complete |
| Project Completion Review | Template | `direct-paths/reviews/project-completion-review.md` | ✅ Complete |

### Upgraded Skills (2)

| Skill | What Changed | Path |
|-------|--------------|------|
| Image Prompting | Style Library, People Styles, Flexible Prompt System | `content/prompting-images/SKILL.md` |
| N8n | Marketing & Content Automation section | `agents/n8n/SKILL.md` |

### Navigation Fixes (2)

| Fix | Location |
|-----|----------|
| "Starting with an Idea?" section | `SKILL-NAVIGATION.md` |
| Documentation skills in nav | `SKILL-NAVIGATION.md` |

### Templates (2)

| Template | Purpose | Path |
|----------|---------|------|
| Library Usability Review | Assess library quality | `direct-paths/reviews/library-usability-review.md` |
| Library Update Review | Review library changes (this file) | `direct-paths/reviews/library-update-review.md` |

---

## Quality Checklist

### Each New Skill

```
For each skill added, verify:
[ ] Has frontmatter (name, description, last_updated)
[ ] Has TL;DR section with table
[ ] Has numbered sections
[ ] Has code examples (where relevant)
[ ] Has checklist at end
[ ] Has Related Skills section
[ ] Links to related skills are valid paths
```

### Navigation

```
[ ] All new skills added to SKILL-NAVIGATION.md
[ ] Correct section (Content, Platform, Agent, etc.)
[ ] Description is accurate
```

### Changelog

```
[ ] New changelog entry added
[ ] Entry is at top of file
[ ] All additions listed
[ ] All upgrades listed
[ ] Date is correct
```

### Cross-References

```
[ ] New skills link to existing skills
[ ] Existing skills updated to link to new skills (if applicable)
[ ] No broken links
```

---

## Integration Test

### Can Find New Content

```
Test: "I want to write email subject lines"
Expected: Find content/email-subjects/SKILL.md
Result: [ ] Pass / [ ] Fail

Test: "I want to use Gemini Gems"
Expected: Find platforms/gemini-gems/SKILL.md
Result: [ ] Pass / [ ] Fail

Test: "I want to create 3D assets"
Expected: Find content/prompting-3d/SKILL.md
Result: [ ] Pass / [ ] Fail

Test: "I need to document my app for users"
Expected: Find agents/user-guide/SKILL.md
Result: [ ] Pass / [ ] Fail
```

### Workflows Still Work

```
Test: IDEA → PLAN → BUILD → TEST → DEPLOY
Result: [ ] Pass / [ ] Fail

Test: Content Brain workflow (Research → Audience → Headlines → Blog)
Result: [ ] Pass / [ ] Fail

Test: Image prompting with new style library
Result: [ ] Pass / [ ] Fail
```

---

## Summary Stats

| Metric | Count |
|--------|-------|
| **Skills added** | 7 |
| **Skills upgraded** | 2 |
| **Navigation fixes** | 2 |
| **Templates added** | 2 |
| **Changelog entries** | 1 |
| **Total library skills** | ~120+ |

---

## Known Issues

| Issue | Severity | Notes |
|-------|----------|-------|
| Lint warnings | Low | Cosmetic markdown formatting (table spacing, blank lines) |
| None blocking | — | Library is production-ready |

---

## Next Session Ideas

- [ ] Add Perplexity integration notes to more skills
- [ ] Expand algorithm skills (TikTok, Instagram, YouTube)
- [ ] Add more app-type blueprints
- [ ] Create more review templates

---

## Approval

```
[ ] All skills complete and documented
[ ] Navigation updated
[ ] Changelog updated
[ ] Ready for use

Reviewed by: _______________
Date: _______________
```

---

## Template: For Future Updates

Copy this for your next library update session:

```markdown
## Session Summary

**Date:** [DATE]
**Session Focus:** [What you're adding/changing]

## What Was Added

### New Skills
| Skill | Type | Path | Status |
|-------|------|------|--------|
| [Name] | [Content/Platform/Agent] | [path] | [ ] Complete |

### Upgraded Skills
| Skill | What Changed | Path |
|-------|--------------|------|
| [Name] | [Changes] | [path] |

## Quality Checklist
[Run the checklists above]

## Approval
[ ] All complete, ready for use
```
