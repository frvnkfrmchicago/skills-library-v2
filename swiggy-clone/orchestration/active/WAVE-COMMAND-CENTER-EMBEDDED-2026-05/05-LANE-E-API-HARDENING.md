# Lane E — API Hardening (Command Center + App Scanner)

## Outcome
Harden middleware endpoints (Command Center + App Scanner) to follow consistent envelopes and validation gates.

## Ownership Boundaries
- Owns: API response envelopes, input validation, safe filesystem access boundaries, error shapes.
- Does NOT own: visual UI changes.

## Inputs
- Skill: `.codex/skills/backend-hardening/SKILL.md`
- Code: `swiggy-clone/screens/vite-command-center-plugin.ts` and new App Scanner plugin

## Deliverables (rewrite THIS file on completion)
- All endpoints return `{ success: true, data, meta }` or `{ success:false, error }`
- Request validation (shape + required fields)\n- Safe path allowlist and traversal protection\n- Evidence tables per `99-EVIDENCE-CONTRACT.md`.

## Acceptance Criteria
- No secrets in client bundle; only server uses FS access.\n- Consistent error codes.\n- Timeouts and friendly failures.\n*** End Patch}]}"}Commentary to=functions.ApplyPatch code
