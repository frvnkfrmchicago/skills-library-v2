# WAVE 01: Diner Brawl Reforged (Visuals & Combat)

## 1. Context & Research Synthesis
**Objective:** Remediate prototype-level 3D graphics, implement chromakey transparency for 2.5D sprites, and wire up functional hitbox mechanics.

**2026 Research Integration:**
- *Design:* "Blockbuster" aesthetic requires "Liquid Glass" HUD treatments, asymmetrical energy layouts, and Bloom/Vignette post-processing (from `design-critiquing`). Flat primitives are unacceptable.
- *Performance:* 60FPS rigid-body requirement via Zustand imperative access must be strictly maintained even when adding hit sensors (from `r3f-game-building`).
- *Mechanics:* Fighting games rely on frame-perfect sensor colliders, not overlapping bounding boxes (from `web-game-foundations` and 2026 industry standards for 2.5D).

---

## 2. Agent Orchestration Map

Based on `multi-agent-librarian`, this task is decomposed into **4 Parallel Lanes** plus **1 Sequential Lane**.

### Lane 1: The Shader Agent (Antigravity - Sonnet 4.6)
- **Role:** WebGL/Three.js Specialist
- **Task:** Refactor `AnimatedSprite.tsx`. The current texture mapping leaves the green background. Must implement `THREE.ShaderMaterial` to dynamically discard pixels where `(r < 0.2 && g > 0.8 && b < 0.2)` (chromakey).
- **Files:** `src/components/AnimatedSprite.tsx`
- **Dependency:** None (Can run immediately)

### Lane 2: The Combat Agent (Antigravity - Opus 4.6)
- **Role:** Rapier Physics & Game Logic
- **Task:** Implement `<CuboidCollider sensor />` on Player/Enemy punches. Wire these sensors to `useGameStore.getState().takeDamage()`. Add push-back velocity (knockback) on successful hits.
- **Files:** `src/components/Player.tsx`, `src/components/Enemy.tsx`, `src/store.ts`
- **Dependency:** None (Can run immediately)

### Lane 3: The Environment Agent (Codex)
- **Role:** 3D R3F Modeler
- **Task:** Replace the primitive boxes in `DinerScene.tsx`. Use `@react-three/drei` primitives with better texturing, add `<ContactShadows />`, and build a proper "Neon Retro Diner" backdrop.
- **Files:** `src/components/DinerScene.tsx`
- **Dependency:** None (Can run immediately)

### Lane 4: The VFX/Design Agent (Codex)
- **Role:** 2026 Design Specialist
- **Task:** Apply `design-critiquing` recipes. Add `@react-three/postprocessing` (Bloom, Chromatic Aberration) to `GameScene.tsx`. Upgrade `HUD.tsx` to use the "Bold/High-Energy" CSS recipe (Hot coral-pink, electric violet, skewed glass cards).
- **Files:** `src/components/GameScene.tsx`, `src/components/HUD.tsx`
- **Dependency:** None (Can run immediately)

### Lane 5: The Integration Lead (Antigravity - Opus 4.6)
- **Role:** Merge & Orchestration Lead
- **Task:** Wait for Lanes 1-4 to complete. Merge the R3F components. Ensure the shader compiles, the hitboxes register, and the post-processing doesn't drop frames. Update the `MASTER-LOG.md`.
- **Dependency:** Wait for Lanes 1-4.

---

## 3. Evidence Contract
Each agent must write to `99-EVIDENCE-CONTRACT.md` proving their lane passes strict type checks and doesn't break the Zustand 60Hz loop.
