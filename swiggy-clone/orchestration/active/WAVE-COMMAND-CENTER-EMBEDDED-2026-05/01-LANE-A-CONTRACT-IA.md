# Lane A — Contract + IA (Embedded Command Center)

## Outcome
Define the **embed-mode contract** and information architecture so Command Center can be dropped into any connected app and populate itself from scan outputs.

## Ownership Boundaries
- Owns: contract spec, IA, user flows, edge states, acceptance gates.
- Does NOT touch: scanning implementation, API middleware, UI implementation beyond spec.

## Inputs
- Code: `swiggy-clone/screens/src/lib/asset-resolver.ts`, `swiggy-clone/screens/src/lib/command-center/*`
- Skills: `.codex/skills/ux-designing/SKILL.md`, `.codex/skills/pattern-referencing/SKILL.md`

## Deliverables (must be written back into THIS file on completion)
- Contract: `AppScannerAdapter` inputs/outputs, required/optional manifests, error/empty behavior.
- IA: navigation, primary CTAs, what is “above the fold” for embedded mode.
- State coverage table: loading/empty/error/success/offline for each panel.
- Evidence tables per `99-EVIDENCE-CONTRACT.md`.

## Acceptance Criteria
- A first-time user can answer (5-second test):
  - what this is, what to do first, and how to run the app.
- Labels are plain-language (no invented jargon).
- Edge cases documented: app not running, missing manifest, missing assets directory, permission errors.
