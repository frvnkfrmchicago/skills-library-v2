# Lane B — Scan Adapters (Vite + Expo)

## Outcome
Implement adapter layer that generates `AppProfile` (and related scan artifacts) from a connected app root path.

## Ownership Boundaries
- Owns: adapter interface + Vite/Expo adapter implementations + registry wiring.
- Does NOT own: Notes/Tasks UX, compliance UX, report UX copy.

## Inputs
- Code: `swiggy-clone/screens/src/lib/asset-resolver.ts`
- Server: Vite plugin middleware (Node FS access)

## Deliverables (rewrite THIS file on completion)
- `AppScannerAdapter` interface and adapters for:
  - `vite-react` (swiggy-clone)
  - `expo-router` (socialstakes)
- Server endpoints to run scans and return structured outputs.
- Evidence tables per `99-EVIDENCE-CONTRACT.md`.

## Acceptance Criteria
- `CONNECTED_APPS` hardcoding removed or relegated to fallback only.
- Scan produces: app metadata, token summary (best-effort), screen manifest summary (best-effort), asset directory index (best-effort).
- Safe path rules enforced (no arbitrary filesystem read outside registered app roots).
