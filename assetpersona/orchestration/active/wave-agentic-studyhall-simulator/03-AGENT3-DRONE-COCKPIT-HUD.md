# 03-AGENT3: Drone Cockpit HUD

Status: dispatch-ready
Wave: wave-agentic-studyhall-simulator

## Explainer
Integrate the premium, animated SVG HUD cockpit into the `paper-candle` project. The HUD simulates a drone flying forward at sunset over Chicago, displaying real-time updating monitor panels for the user's Watchlist, Today's Setup, and Readiness metrics.

## Required Scope
- **Files Owned**: `paper-candle/public/images/paper_candle_hud.svg`, `paper-candle/src/components/paperview/MobilePaperView.tsx`.
- **Tasks**:
  - Integrate the animated SVG as a background viewport layer in `MobilePaperView.tsx` or as a background overlay inside the simulator cockpit tab.
  - Ensure the SVG coordinates and status updates reflect real live trends instead of static placeholders.

## Dispatch Checklists
- [ ] Place the animated SVG in public images.
- [ ] Mount the HUD SVG within the PaperView cockpit viewport.
- [ ] Connect state signals to toggle target engagement states.

## Citations
- Skill: `.agents/skills/animation-designing/SKILL.md`
- Librarian: `.agents/skills/interactive-animating/SKILL.md`
- 2026 URL: https://threejs.org/
