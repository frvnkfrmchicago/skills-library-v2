# Library Rules

**Standards and practices for using this Skills Library.**

---

## Rule 1: Always Give the Pathway

When referencing any skill or resource, **always provide the full path**.

```
✅ Good: "See ai-builder/langchain/SKILL.md for agent patterns"
❌ Bad: "Check the LangChain skill"
```

---

## Rule 2: Skills Are Copy-Paste Ready

Every code example in a skill should:
- Work when pasted directly
- Use modern syntax (2025-2026)
- Include necessary imports
- Not require additional setup unless noted

---

## Rule 3: Update Navigation When Adding

When adding a new skill:
1. Add to `SKILL-NAVIGATION.md`
2. Add to `tech-stack/SKILL-INDEX.md` (if applicable)
3. Add to `_meta/CHANGELOG.md`
4. Update parent `OVERVIEW.md` (if in a wing)

---

## Rule 4: Format Consistency

Every skill must have:
- YAML frontmatter (name, description, last_updated)
- TL;DR table
- Numbered parts with code examples
- Checklist at end
- Resources section
- Related Skills section

---

## Rule 5: Vibe Coder First

Skills should:
- Prioritize shipping over perfection
- Work for solo devs
- Scale to enterprise when needed (but not forced)
- Avoid academic explanations

---

## Rule 6: Handoffs Stay in Library

Agent handoff prompts go in `direct-paths/handoffs/`.
Review prompts go in `direct-paths/reviews/`.
Don't scatter these in external directories.

---

## Rule 7: Version Everything

- Include versions in code examples when relevant
- Update `last_updated` in frontmatter when editing
- Log changes in `_meta/CHANGELOG.md`

---

## Rule 8: Cross-Reference Related Skills

Every skill should link to related skills:
```markdown
## Related Skills

- `ai-builder/langchain/SKILL.md` — Agent patterns
- `agents/database/SKILL.md` — Data storage
```

---

## Rule 9: Brutal Self-Review

When building skills, ask:
- Would I actually use this?
- Can I copy-paste and ship?
- Is this current (2025-2026)?
- What's missing?

---

## Rule 10: The Library Is the Source of Truth

Everything for building goes in the library.
No hunting through external directories.
If it's needed, it's here.

---

## Rule 11: Ideation Over Defaults

**Skills should open possibilities, not close them.**

DO:
- Present a SPECTRUM of options (2-3 directions)
- Ask questions before giving answers
- Enable exploration, then commitment
- Show tradeoffs between approaches

DO NOT:
- Default to one visual style without asking
- Apply patterns automatically without direction
- Give rigid prescriptive output
- Kill innovation with cookie-cutter results

Example (WRONG):
```
User: "Build dashboard"
AI: [applies Bento grid, dark navy, same animations]
Result: Same as every other dashboard
```

Example (RIGHT):
```
User: "Build dashboard"
AI: "Direction options:
1. Editorial — Asymmetric, bold type, minimal
2. Technical — Dense data, precision, glass effects  
3. Playful — Rounded, gradients, micro-interactions
Which vibe?"
Result: Innovation through exploration
```

**This is the most important rule for creativity.**
