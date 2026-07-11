# WAVE 02: Roster Ascension & Superpower Overdrive

This Orchestration Wave manages the systematic refactoring of the Diner Brawl 3D game to implement full character sizing parity, flawless 4x4 consistent animations, dynamic superpowers, and a high-fidelity selection menu.

## 1. Reference Context & Decision Making Framework

To ensure visual and mechanical excellence, this wave strictly references the following three core pillars from your `skills-library-v2` and recent research:

### A. Skills Referenced
1. **`sprite-pipeline`**: Enforces strict center-bottom `(0.5, 1.0)` grounding anchors for all character meshes and uniform canvas sizing across walk, punch, kick, block, and fireball states.
2. **`animation-designing`**: Standardizes frame durations, transitions, and loops to prevent clipping and stutter.
3. **`r3f-game-building`**: Drives the 3D-to-2D physics layer, coordinate translations, camera tracking, and post-processing bloom.
4. **`component-building`**: Outlines standards for highly interactive, tactile buttons and responsive layout containers.
5. **`consistency-checking`**: Audits and matches values (sizes, scaling factors, physics parameters) between Player and Enemy entities.

### B. Librarians Activated
1. **`animation-librarian`**: Guides state machine mechanics, preventing stale animation lockups.
2. **`components-librarian`**: Governs structural layouts, focus management, and accessibility standards for selection menus.
3. **`three-webgl-game-librarian`**: Ensures the custom chromakey shader remains performant at 60fps and works flawlessly with lighting.
4. **`sprite-pipeline-librarian`**: Audits the grid coordinate offsets for the 4x4 (16-frame) character sheets.
5. **`flow-librarian`**: Validates the user journey from character select into gameplay and victory screens.

### C. 2026 Research Paradigms
1. **"Safe is Failure" Design Aesthetics**: Visual honesty over generic placeholders. Spanning rich color schemes, crisp typography, and real game data.
2. **Liquid Glass UI Styling**: Glassmorphic backdrops, glowing borders (`1px solid rgba(255,255,255,0.15)`), intense backdrop-filters, and soft bento grid elevations.
3. **Fighting Game "Juiciness" & Feel**: Implementing:
   - *Hit-Stop*: A brief 0.08s time-scale pause when a hit registers to create heavy impact.
   - *Camera Shake*: Directional camera perturbation on landing punch, kick, or superpower.
   - *Active Hitboxes*: Aligning physical sensors directly with the active frames of the animation.

---

## 2. Multi-Agent Lane Briefs

These lanes will execute in logical sequence to prevent git merge conflicts, but are structured for independent verification.

### Lane 1: Animation & Roster Agent
*   **Target Files:** `src/components/AnimatedSprite.tsx`, `src/roster.ts`
*   **Mission:** Expand `AnimatedSprite.tsx` to handle the true `4x4` (16 frame) layout. Introduce all character sprite paths.
*   **Verification:** Ensure no frame clipping or bleeding between rows.

### Lane 2: Physical Size Normalization Agent
*   **Target Files:** `src/components/Player.tsx`, `src/components/Enemy.tsx`
*   **Mission:** Normalize physical dimensions. Match `CapsuleCollider` bounds, group scales, and plane offsets so player and enemy are visually and physically identical in size. Ground feet exactly to the floor.
*   **Verification:** Footing overlap test under motion.

### Lane 3: Combat Engine & Superpowers Agent
*   **Target Files:** `src/components/Fireball.tsx`, `src/components/Player.tsx`, `src/components/Enemy.tsx`, `src/components/GameScene.tsx`, `src/store.ts`
*   **Mission:** Implement Block mechanics (reduces damage, disables hitstun), fireball projectile casting (consumed special energy, flies as a physical sensor body across screen), hit-stop impact freezes, and dynamic camera shake.
*   **Verification:** Fireball hit triggers visual blast, deducts HP, and triggers screen rumble.

### Lane 4: Premium Select HUD Agent
*   **Target Files:** `src/components/HUD.tsx`, `src/store.ts`
*   **Mission:** Author an incredible Liquid Glass Select Screen overlay at launch. Displays bento cards of characters with interactive stats.
*   **Verification:** Fully responsive, accessible, mouse-friendly character loadouts.
