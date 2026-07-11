# Agent 3 — Building & Architecture Lane

## Mission
Convert 10 building/architecture librarians into proper Agent Skills with auto-discovery.

## Before You Start
**Read `agents/upgrade-library/SKILL.md`** — it contains the SKILL.md format spec, frontmatter requirements, and conversion steps.

## Your Librarians (10)

| # | Source File | Skill Name |
|---|-----------|------------|
| 1 | `librarians/backend-librarian.md` | `backend-hardening` |
| 2 | `librarians/frontend-librarian.md` | `frontend-architecting` |
| 3 | `librarians/database-librarian.md` | `database-designing` |
| 4 | `librarians/api-integration-librarian.md` | `api-integrating` |
| 5 | `librarians/supabase-librarian.md` | `supabase-building` |
| 6 | `librarians/flow-librarian.md` | `flow-designing` |
| 7 | `librarians/implementation-librarian.md` | `implementation-guiding` |
| 8 | `librarians/onboarding-librarian.md` | `onboarding-designing` |
| 9 | `librarians/playmaster-librarian.md` | `web-game-foundations`, `r3f-game-building`, `three-webgl-game-building`, `playmaster`, `web-3d-asset-pipeline` |
| 10 | `librarians/pre-deployment-librarian.md` | `pre-deploy-gating` |

## For Each Librarian

1. **Read** the source librarian file
2. **Create** `.agents/skills/<skill-name>/SKILL.md` with:
   - YAML frontmatter: `name` (matches directory), `description` (1-1024 chars, third person, includes WHAT + WHEN + trigger keywords)
   - Directive language
   - Body under 500 lines
3. **Copy** the skill directory into:
   - `.claude/skills/<skill-name>/SKILL.md`
   - `.cursor/skills/<skill-name>/SKILL.md`
   - `.codex/skills/<skill-name>/SKILL.md`

## Special Instructions for This Lane

- `backend-hardening` must include a **Security Gate** section with auth/CORS/rate-limit/secrets enforcement
- `pre-deploy-gating` must include deployment blockers with evidence requirements
- `database-designing` should reference Prisma, Drizzle, and raw SQL patterns
- `supabase-building` should include Supabase-specific auth, RLS, and realtime patterns
- Architecture skills should include technology decision trees where appropriate

## Completion Evidence ✅

### All 10 Skills Created

| # | Skill Name | File Path | Lines | Frontmatter |
|---|-----------|-----------|-------|-------------|
| 1 | `backend-hardening` | `.agents/skills/backend-hardening/SKILL.md` | 225 | ✅ valid |
| 2 | `frontend-architecting` | `.agents/skills/frontend-architecting/SKILL.md` | 226 | ✅ valid |
| 3 | `database-designing` | `.agents/skills/database-designing/SKILL.md` | 289 | ✅ valid |
| 4 | `api-integrating` | `.agents/skills/api-integrating/SKILL.md` | 225 | ✅ valid |
| 5 | `supabase-building` | `.agents/skills/supabase-building/SKILL.md` | 258 | ✅ valid |
| 6 | `flow-designing` | `.agents/skills/flow-designing/SKILL.md` | 228 | ✅ valid |
| 7 | `implementation-guiding` | `.agents/skills/implementation-guiding/SKILL.md` | 180 | ✅ valid |
| 8 | `onboarding-designing` | `.agents/skills/onboarding-designing/SKILL.md` | 129 | ✅ valid |
| 9 | `web-game-foundations` | `.agents/skills/web-game-foundations/SKILL.md` | 355 | ✅ valid |
| 9b | `r3f-game-building` | `.agents/skills/r3f-game-building/SKILL.md` | 376 | ✅ valid |
| 9c | `three-webgl-game-building` | `.agents/skills/three-webgl-game-building/SKILL.md` | 370 | ✅ valid |
| 9d | `playmaster` | `.agents/skills/playmaster/SKILL.md` | 350 | ✅ valid |
| 9e | `web-3d-asset-pipeline` | `.agents/skills/web-3d-asset-pipeline/SKILL.md` | 400 | ✅ valid |
| 10 | `pre-deploy-gating` | `.agents/skills/pre-deploy-gating/SKILL.md` | 248 | ✅ valid |

- [x] All 10 skills have valid YAML frontmatter (`name` matches directory, `description` is third person with WHAT + WHEN + trigger keywords)
- [x] All 10 skills copied to `.claude/skills/`, `.cursor/skills/`, `.codex/skills/`
- [x] All SKILL.md bodies are under 500 lines

### Special Requirements Met

- [x] `backend-hardening` — includes **Security Gate** section with auth/CORS/rate-limit/secrets enforcement + STOP gates
- [x] `pre-deploy-gating` — includes deployment blockers with evidence requirements + executable scan commands
- [x] `database-designing` — references Prisma, Drizzle ORM, and raw SQL with decision trees
- [x] `supabase-building` — covers auth, RLS policies, realtime channels, storage, edge functions
- [x] Architecture skills include technology decision trees

### Overflow Handling

`flow-librarian.md` was **629 lines** (exceeded 500-line limit). Split into:
- `SKILL.md` (228 lines) — core audit method, effort scoring, dual-path method, templates
- `references/AUTH-FLOW.md` — sign-up, login, password reset, MFA checklists
- `references/PAYMENT-FLOW.md` — checkout, IAP, regional methods, monetization compliance
- `references/GAME-FLOW.md` — game session, chaos paths, retention mechanics
