# Lane C — Assets Index + Rendering

## Outcome
Replace hardcoded Assets lists with **real** asset indexing from connected apps, and render it in the Assets panel.

## Ownership Boundaries
- Owns: asset directory discovery rules, API for listing assets, preview strategy, UI wiring in `AssetsPanel`.
- Does NOT own: core scanning adapter interface (Lane B), or Notes/Tasks UX (Lane D).

## Deliverables (rewrite THIS file on completion)
- Asset index endpoint that returns categories + file metadata for active app.
- UI that supports:
  - images (thumbnail)
  - videos (file listed; preview optional if lightweight)
  - content files (copy path / open link)
- Evidence tables per `99-EVIDENCE-CONTRACT.md`.

## Acceptance Criteria
- Assets panel shows actual files for SocialStakes (`/assets/*`) and Swiggy (as available).
- Clicking an asset provides a clear affordance (copy path and/or open).
- Performance guardrails: pagination / caps for huge directories.
