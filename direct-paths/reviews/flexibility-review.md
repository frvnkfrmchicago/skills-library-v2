# Skills Library Flexibility Review

**Purpose:** Test every skill for flexibility vs. prescriptive patterns. The library should enable ideation and iteration, not force defaults.

---

## The Flexibility Test

For each skill, ask:

### 1. Does it offer CHOICES or DEFAULTS?

| Prescriptive (Bad) | Flexible (Good) |
|-------------------|-----------------|
| "Use this color palette" | "Here are dimensions to explore" |
| "Apply this animation" | "Match animation to content type" |
| "Use this layout" | "Layout options based on content density" |
| "Follow this pattern" | "Patterns available, context determines choice" |

### 2. Does it enable IDEATION?

- [ ] Asks context questions before recommending
- [ ] Presents multiple directions, not one answer
- [ ] Allows mixing and iteration
- [ ] References building blocks, not recipes

### 3. Does it have VARIATION potential?

- [ ] Same prompt could produce different outputs
- [ ] User can influence direction
- [ ] Not locked to one aesthetic/approach
- [ ] Encourages exploration

---

## Review Checklist (Run Against Each Skill)

```
SKILL: [skill-name]

FLEXIBILITY SCORE:
[ ] Choices over defaults
[ ] Ideation-enabling
[ ] Variation potential
[ ] Context-aware recommendations
[ ] Building blocks, not recipes

RED FLAGS:
[ ] Hardcoded values (specific colors, specific easings)
[ ] "Use this" language without alternatives
[ ] Single recommended approach
[ ] No context questions
[ ] Prescriptive categories instead of spectrums

ACTION NEEDED:
- [ ] Add context questions
- [ ] Convert categories to spectrums
- [ ] Add variation options
- [ ] Remove hardcoded values
- [ ] Add "mix and match" guidance
```

---

## Skills to Review

### Design & Visual
- [ ] `design-system/SKILL.md`
- [ ] `prompting-images/SKILL.md`
- [ ] `tailwind/SKILL.md`
- [ ] `micro-interactions/SKILL.md`
- [ ] `touch-interactions/SKILL.md`
- [ ] `a11y/SKILL.md`

### Animation & Motion
- [ ] `gsap/SKILL.md`
- [ ] `motion/SKILL.md`
- [ ] `r3f/SKILL.md`

### Backend & Data
- [ ] `database/SKILL.md`
- [ ] `backend-patterns/SKILL.md`
- [ ] `nosql/SKILL.md`
- [ ] `realtime/SKILL.md`
- [ ] `microservices/SKILL.md`

### AI & ML
- [ ] `prompting/SKILL.md`
- [ ] `ai-sdk/SKILL.md`

### Infrastructure
- [ ] `deployment/SKILL.md`
- [ ] `cloud-aws/SKILL.md`
- [ ] `cloud-firebase/SKILL.md`
- [ ] `security/SKILL.md`
- [ ] `monitoring/SKILL.md`

### Growth & Business
- [ ] `growth-hacking/SKILL.md`
- [ ] `analytics/SKILL.md`
- [ ] `seo/SKILL.md`
- [ ] `b2b-b2c/SKILL.md`

### Content
- [ ] `content/youtube/SKILL.md`
- [ ] `content/tiktok/SKILL.md`
- [ ] `content/instagram/SKILL.md`

---

## Missing Skills Identified

### User Management (MISSING)
**Need:** Admin dashboards, user CRUD, roles/permissions, user analytics, moderation tools

Should cover:
- User list/search/filter
- User detail views
- Role and permission management
- User actions (ban, verify, upgrade)
- User analytics (activity, retention)
- Moderation workflows
- Self-service vs. admin actions

### Other Gaps to Check
- [ ] Authentication patterns (beyond Clerk setup)
- [ ] Dashboard patterns (admin vs. user)
- [ ] Notification management
- [ ] Settings/preferences patterns

---

## How to Run This Review

1. Open each skill file
2. Run through the checklist
3. Note RED FLAGS
4. Propose fixes
5. Update the skill
6. Re-test

**Goal:** Every skill should enable ideation, present options, and produce varied outputs based on context — not default to the same patterns every time.
