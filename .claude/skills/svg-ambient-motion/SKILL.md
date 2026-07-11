---
name: svg-ambient-motion
description: >
  Turn a still SVG icon/sticker into a MOVING SVG — layered ambient motion baked
  into a self-contained animated `.svg` that loops seamlessly in any browser with
  no runtime. Splits the SVG into semantic layers (subject / accent / particle /
  background) and wraps each in a looping motion (sway / flicker / drift / breathe /
  parallax) via embedded CSS `@keyframes` or SMIL `<animateTransform>`. Use when
  making a feed/nav icon or sticker feel alive, animating a model-generated SVG, or
  tracing a raster sticker to a moving vector from the terminal. One engine, one CLI,
  honest-empty never-fake, the same motion vocabulary as the raster ambient engine.
---

# SVG Ambient Motion — the "moving SVG"

This skill takes a STILL SVG and gives it life — layered ambient motion baked into a
**self-contained animated `.svg`** that loops seamlessly in any browser with no
React, no framer-motion, no runtime. It is the vector twin of the raster
ambient-motion engine (`lib/stickerz/ambient-motion/*`): same motion vocabulary,
same seamless-loop discipline, but the carrier is the SVG file itself.

The animated nav/feed icons are the motion-style ground truth — `FlameHeartIcon`
sways and flickers, `SmokyMessageIcon` ripples, `CannabisHazeOverlay` drifts and
breathes. Those are framer-motion React components. This skill bakes that SAME
vocabulary into a portable file an agent (or the in-app maker) can produce headless.

> This is a hand-authored layered SVG-icon/sticker motion skill. That is exactly
> what is wanted here — it is **distinct** from the Stickerz-feed "no hand-coded
> decorative CSS/SVG animation" rule, which governs the raster scene-card producer.
> A moving SVG icon is a vector artifact, authored on purpose.

---

## When to use

- "Make this SVG icon move / feel alive."
- "Animate this model-generated SVG sticker."
- "Trace this raster sticker to a moving vector."
- "Give me a looping `.svg` I can drop in a file / `<img>` / inline."
- "Plan the layer split without writing" (dry-run).

---

## The two pieces

| Piece | What it is |
| --- | --- |
| **Engine** | `lib/media/svg-ambient-motion.ts` — pure, DOM-free. Split → wrap → emit. |
| **CLI** | `scripts/svg-ambient-motion.ts` — flag-driven headless driver over the engine. |

The engine is pure string work (no DOM parser, like `lib/media/generation/svg-raster.ts`),
so it runs identically in the edge runtime, a bun/node script, or the browser. All
motion math lives there; the CLI is a thin typed driver.

---

## The locked motion rules (read first)

1. **Seamless loop is the whole point.** Every emitted `@keyframes` (and every SMIL
   `values` list) starts and ends on the SAME value — `0% === 100%` — under
   `animation-iteration-count: infinite` / `repeatCount="indefinite"`. The cycle
   returns to its start with no visible seam. This is the CSS-domain twin of the
   raster engine's `phase = (i/N)*loopCycles*2π` seam guarantee.
2. **Transform / opacity / filter only.** Motion never animates geometry
   (`width`/`x`/`d`) — only `transform` and `opacity`, so it stays on the
   compositor. Capped layer budget; no per-frame JS.
3. **Reduced motion is the accessible default.** The CSS carrier embeds
   `@media (prefers-reduced-motion: reduce) { animation: none }` so the icon settles
   to its still pose — itself, just not moving. Never a fabricated frame.
4. **Tokens, not hex.** Any tint a motion paints resolves through `feedColors`
   (`@/lib/design-tokens`) — the one source of record. No raw colour literal in the
   output. "purple glow", never the banned term.
5. **Honest-empty, never fake.** A raster input with no tracer (or no decoder) is
   recorded as a skip with a reason — the CLI writes NO `.svg`. A model-generated
   SVG is the documented happy path that needs no trace.

---

## The motion vocabulary (mirrors the raster `AmbientKind`)

| Motion | Feel | Ground-truth icon |
| --- | --- | --- |
| `sway` | gentle pendulum rotate about the layer base + a touch of vertical scale | `FlameHeartIcon` at 100+ likes |
| `flicker` | rapid opacity + vertical-scale jitter | `FlameFlickerBurst` tongues |
| `drift` | a slow translate loop that rises and disperses, wrapping to origin | `CannabisHazeOverlay` plumes |
| `breathe` | a scale + opacity pulse on the `0.18 + 0.12` glow amplitude | the kief-backdrop bloom |
| `parallax` | opposed-phase horizontal drift of subject vs. background — gentle 2.5D | the `nug-parallax` preset |

A LAYER ROLE drives its default motion: `subject` sways, `accent` flickers,
`particle` drifts, `background` breathes/parallaxes. A preset overrides per role.

---

## The layer split

`splitSvgLayers(svg)` walks the SVG inner content (tolerant string scan, tag-depth
matched — not a DOM parse) and lifts each TOP-LEVEL drawable element as one layer.
`<defs>` / `<style>` / gradients / filters are carried through as preamble (not
animated). Each layer is assigned a semantic role:

- **id/class hints win** — a layer whose id/class contains `bg`/`background`,
  `particle`/`mote`/`ember`/`smoke`, `subject`/`main`/`hero`, or
  `accent`/`highlight`/`glow` is tagged accordingly.
- **geometry heuristics** otherwise — a first frame-filling `<rect>` → `background`;
  small repeated `<circle>`/`<ellipse>` → `particle`; the first `<g>` → `subject`;
  everything else → `accent`.
- A `subject` is always guaranteed so the composite reads as alive.

Override the split explicitly with `--role-map <role>=<needle>` (CLI) or the
`roleMap` option (engine) when a model labels its groups.

---

## CLI — `scripts/svg-ambient-motion.ts`

Copies the house contract from `scripts/generate-assets.ts`: flag-driven, single
JSON on stdout, a per-item `<out>.receipt.json`, a merged `_run-summary.json`, a
`--dry-run` plan, and honest-empty.

```
bun scripts/svg-ambient-motion.ts --in <file> --motion <preset> [flags]

  --in <path>            input .svg OR raster (.png/.jpg/.jpeg/.webp)
  --motion <presetId>    ambient preset id (see --list-presets)
  --out <path>           output .svg (default: <in-stem>.<motion>.svg)
  --emit <css|smil>      override the preset carrier
  --role-map <r=needle>  force a layer role by id/class substring (repeatable)
  --dry-run              plan only (split + pick preset); write nothing
  --list-presets         print the preset registry JSON and exit
```

### Examples

```sh
# Enumerate presets
bun scripts/svg-ambient-motion.ts --list-presets

# Make a model-generated SVG sway (the happy path — no trace)
bun scripts/svg-ambient-motion.ts --in flame-heart.svg --motion gentle-sway

# Plan the layer split without writing
bun scripts/svg-ambient-motion.ts --in nug.svg --motion smoke-drift --dry-run

# Force a role map, emit SMIL so it animates in a bare <img>
bun scripts/svg-ambient-motion.ts --in jar.svg --motion smil-sway \
  --role-map particle=fleck --role-map background=bg --emit smil

# Raster sticker → trace → moving SVG (needs sharp + imagetracerjs)
bun scripts/svg-ambient-motion.ts --in sticker.png --motion smoke-drift
```

---

## Inputs: SVG (happy path) vs. raster (traced)

- **SVG input** — a hand-authored or **model-generated** `.svg` is used directly.
  This is the documented happy path: a model emits a clean layered SVG, the engine
  splits it and bakes the motion. No trace, no extra dependency.
- **Raster input** — a `.png/.jpg/.webp` is decoded to raw RGBA via a lazily
  imported `sharp` (already in `package.json`) and traced to SVG via a lazily
  imported `imagetracerjs`. **`imagetracerjs` is added by the lead at closeout**;
  until then a raster run is honest-empty (`reason: 'tracer_unavailable'`), and the
  CLI tells the caller to supply a `.svg` instead. The trace path is real code,
  never a fabricated vector.

`imagetracerjs` is the in-house, free, browser/worker raster→SVG tracer (no API, no
spend) — `imagedataToSVG(imageData, options)` for a decoded raster. The engine calls
that path so it stays runtime-agnostic; the CLI does the `sharp` decode first.

---

## The presets

`--list-presets` prints these; each maps layer ROLES to motions:

| id | feel |
| --- | --- |
| `gentle-sway` | the subject sways like a living flame; accents flicker softly (the everyday "make it alive") |
| `flame-flicker` | flame-tongue flicker on subject + accents — a candle that lives |
| `smoke-drift` | particles rise and disperse like smoke; the subject breathes underneath |
| `purple-breathe` | a purple-glow breathe over the whole composite |
| `parallax-float` | subject + backdrop drift on opposed phases for a 2.5D float |
| `smil-sway` | gentle sway carried by SMIL — animates in a bare `<img>` |

---

## Output

A self-contained `<svg>` string with:
- the original `<defs>`/gradients/filters preserved as preamble;
- each layer wrapped in a `<g>` with `transform-box: fill-box; transform-origin:
  center` so it rotates/scales about its OWN bbox;
- an embedded `<style>` with one `@keyframes` per layer (seamless 0%/100%), a
  per-layer animation rule with a negative delay (so layers aren't lockstep), and a
  `prefers-reduced-motion` settle — OR, for the `smil` carrier, SMIL `<animate*>`
  elements nested in each layer group (no `<style>`, animates in a bare `<img>`).

The `.svg` drops straight into a file, an `<img src>`, an `<object>`, or inline JSX.

---

## How it relates to the rest of the media stack

- **Raster ambient motion** (`lib/stickerz/ambient-motion/*`) is the canvas-frame
  twin — same motion names, `HTMLCanvasElement[]` output for the WebP/GIF encoders.
  This skill is the vector twin: same vocabulary, `.svg` output, no encoder needed.
- **Encoders** (`lib/media/gif-encoder.ts`) and the **sticker quality gate**
  (`lib/media/giphy-export-gate.ts`) act on RASTER frames. A moving SVG that must
  ship as a GIF/WebP is first rasterized (`lib/media/generation/svg-raster.ts`
  `rasterizeSvg` → frames) and then encoded + gated — this skill produces the vector
  master; the raster path consumes it when a raster artifact is required.
- **Image → sticker** — the Batch-2 image-to-sticker lane
  (`composeImageSticker` from `@/lib/stickerz/image-to-sticker`) is the raster
  sticker producer; this skill is its vector counterpart for SVG/icon sources.

---

## Verification gate

- `--list-presets` returns the six presets as JSON.
- `--dry-run` on a real SVG prints the per-role layer counts and the would-write
  path, writing nothing.
- A real run on a model-generated SVG writes a `.svg` whose `@keyframes` 0% and 100%
  stops are identical (open it — the loop has no seam) and which carries a
  `prefers-reduced-motion` block.
- A raster input with no tracer installed records `traced: false, reason:
  'tracer_unavailable'` and writes NO file — honest-empty, never a faked vector.
