---
name: emblem-sticker
description: >-
  Make an ANIMATED cannabis/brand EMBLEM sticker that moves like the nav icons —
  author a clean LAYERED vector SVG (subject / accent / particle groups) and run it
  through the ambient-design engine (svg-ambient-motion) to get a self-contained
  looping animated .svg. Use for emblem / icon / glyph / logo-style stickers (a
  cannabis leaf, a nug, a jar, a joint, a flame, a wordmark). The right input is a
  FEW-LAYER vector, never a traced photoreal raster. For detailed photoreal
  characters use image-to-sticker / the raster subject-motion engine instead.
---

# emblem-sticker — animated layered-vector stickers (the nav-icon look)

## The one lesson that makes this work

The ambient-design engine (`svg-ambient-motion`) animates **layers** — it sways the
subject, flickers the accents, drifts the particles. So it needs **clean, few-layer
VECTOR art**, exactly like the nav icons. That is the whole trick.

- **DO:** author the emblem as an SVG with a handful of named groups. Output is tiny
  (a real cannabis leaf = ~3.5 KB / 3 layers) and animates beautifully.
- **DO NOT:** feed it a detailed photoreal raster PNG. Tracing one explodes into
  thousands of fragment-paths (a real budtender PNG traced to **23,760 layers /
  19.5 MB** — useless). A flat raster has no layers to move, so it falls back to a
  glow overlay, which is NOT an animated sticker.

If the art is a detailed character/photo, it is the wrong medium for this skill — use
`image-to-sticker` (raster cut-out + whole-cutout subject motion) instead.

## The layer convention (this is what the splitter reads)

Group your SVG by semantic role using `<g id="...">`. Each role gets a default motion:

| Group | What goes in it | Default motion |
| --- | --- | --- |
| `subject` | the main silhouette (the leaf, the nug, the character) | sway / breathe |
| `accent` | secondary detail (veins, highlights, inner fills) | flicker / breathe |
| `particle` | small repeated motes (embers, pollen, smoke flecks) | drift |
| `background` | a backdrop plate behind everything (optional) | slow parallax |

Keep the total element count low and the paths clean. Reuse a single `<path id="...">`
via `<use href="#..." transform="...">` to build symmetry (e.g. 7 leaflets from one
leaflet path) — small file, clean layers.

## Brand palette (generation palette, from lib/media/generation/brand-seed.ts)

purple `#7C3AED` · purpleLight `#A78BFA` · purpleDeep `#5B21B6` · mintLed `#00F0FF` ·
mintGlow `#5EEAD4` · tealSoft `#2DD4BF`. Subject = purple gradient; accent veins =
mintLed; particles = mintGlow.

## The pipeline

1. **Author** `emblem.svg` (layered, per the convention above). A worked cannabis-leaf
   reference lives at `public/stickers/emblem/cannabis-leaf.svg` — copy its 7-leaflet
   `<use>` pattern + subject/accent/particle groups.
2. **Animate** it through ambient-design:
   ```
   bun scripts/svg-ambient-motion.ts --in emblem.svg --motion purple-breathe --out emblem.ambient.svg
   ```
   Motions: `gentle-sway` · `flame-flicker` · `smoke-drift` · `purple-breathe` ·
   `parallax-float` · `smil-sway`. `--list-presets` prints the registry; `--emit css|smil`
   overrides the carrier; `--role-map <role=needle>` overrides a layer's role.
3. **Verify** the receipt JSON: `traced: false` (it was already vector — good), a small
   byte size (under ~50 KB), and a sensible `layers` breakdown (subject/accent/particle
   each ≥1, NOT thousands). Thousands of layers = you fed it a raster; stop and author
   vector instead.
4. The output `.svg` is self-contained and loops seamlessly in any browser with no
   runtime (CSS `@keyframes`, or SMIL `<animateTransform>` with `--emit smil`).

## Agent runbook (Antigravity / headless)

- The agent AUTHORS the layered SVG (or, once `ANTHROPIC_API_KEY` is set, the Claude-SVG
  generator `lib/media/generation/providers/claude.ts` can mass-produce clean vector
  glyphs to feed in). Then run the CLI in step 2.
- Inputs the agent provides: the subject concept (leaf / nug / jar / joint / flame), the
  motion preset, the brand colors above.
- Acceptance: `traced:false`, small file, low layer counts, loops, transparent
  background. Reject any output that traced a raster (huge file / thousands of layers).

## When to use which sticker engine

- **emblem / icon / glyph / logo** (clean shapes) → THIS skill (vector + ambient-design).
- **detailed photoreal / cartoon character** (the budtender) → `image-to-sticker`
  (raster cut-out) + the raster subject-motion engine (whole-cutout bounce/wobble/sway).
- Distribution as a looping transparent GIF/WebP for cross-Meta is a separate step
  (`image-to-gif`); GIPHY is only a distribution rail, not how the sticker is made.

## Worked example

`public/stickers/emblem/cannabis-leaf.svg` → `cannabis-leaf.ambient.svg`: a 7-serrated-
leaflet cannabis leaf (one `#leaflet` path reused 7× via rotate/scale), mint center
veins (accent), three mint motes (particle). Output: 3 layers, ~3.5 KB, breathes
seamlessly. That is the target — clean, layered, alive.
