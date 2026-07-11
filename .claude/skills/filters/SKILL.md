---
name: filters
description: >
  Author and bake GrazzHopper color FILTERS — a professional op-stack (per-channel
  + master tone curves, HSL band rotation, lift/gamma/gain, histogram stretch,
  master saturation) baked into a portable .cube 3D-LUT — end-to-end from the
  headless terminal or the in-app /studio/filters maker. Use when authoring an
  op-stack, baking a .cube via scripts/generate-filters.ts, wiring the one apply
  seam (applyAuthoredFilter) so a look renders identically across camera, stories,
  and live, or round-tripping a baked .cube through DaVinci / Premiere / ComfyUI.
  Pure deterministic color math, ZERO provider spend, honest-empty never-fake.
---

# Filters

A GrazzHopper filter is a color GRADE that an author builds once and applies
everywhere. It has two layers:

1. The five-channel **grade** (`AuthoredFilterConfig` in `lib/filters/filter-types.ts`)
   — warmth / tint / saturation / contrast / vignette — the cheap, live-tunable
   wash the camera and live rooms can re-touch per frame.
2. The PRO **op-stack** (`OpStack` in `lib/filters/op-stack.ts`) — ordered,
   professional color operations a five-slider grade cannot express, baked into a
   portable `.cube` 3D-LUT that travels into the app AND out to a real editor.

This skill documents the op-stack -> `.cube` baker, its two front doors (the
headless CLI and `/studio/filters`), the one apply seam every surface consumes,
and the `.cube` interchange that round-trips with DaVinci Resolve, Premiere, and
ComfyUI. The whole bake is **pure deterministic color math — no network, no
provider, no key, ZERO spend.** A real artifact or a documented production code
path, never a fabricated binary.

---

## The locked rules (read first)

- **ZERO spend.** Baking a filter contacts no provider, no role, no key. The op
  chain is evaluated once at every grid point and that is the entire produce step.
  A `.cube` is byte-identical whether baked here, in a worker, or in the browser.
- **Engines are read-only.** `lib/filters/op-stack.ts`, `lut.ts`, `lut-engine.ts`,
  `webgl-lut-pass.ts`, `apply-authored-filter.ts` are the shared engine core — the
  CLI and the maker IMPORT them, never duplicate or edit the color math.
- **Honest-empty over fake.** A `.cube` can be baked headless (pure math); a WebP
  thumbnail cannot (it needs a raster encoder bound to a canvas), so the headless
  baker emits a thumbnail PLAN, never a fabricated thumbnail. A missing input dir
  bakes nothing and reports `planned: 0` — never a seeded look.
- **A GPU LUT is image processing, not decoration** — explicitly allowed. No
  hand-coded CSS/SVG decorative animation; no mock/placeholder/seeded asset.

---

## When To Use

- "Author an op-stack" / "build a pro color grade beyond the five sliders."
- "Bake a filter from this op-stack" / "produce the `.cube` LUTs."
- "Plan the bake without writing" (dry-run = validate + clamp report).
- "Apply this look to the camera / a story / a live room — one look everywhere."
- "Export the `.cube` so I can grade in DaVinci / Premiere / ComfyUI."
- "Surface the maker on the consumer path" (`/studio/filters`).

---

## The op-stack — the authoring document

An `OpStack` (`lib/filters/op-stack.ts`) is the ordered, named document the pro
panel edits and the baker collapses. Ops apply top -> bottom over a normalized RGB
triplet; every op clamps internally so a bad value can never break a cube.

| `type` | What it does | Shape |
| --- | --- | --- |
| `curves` | per-channel + master tone curves, monotone (Fritsch–Carlson) cubic — no overshoot, no banding | `{ master?, red?, green?, blue?: { x, y }[] }`, points in 0..1; empty = identity |
| `hsl` | hue-band rotation/adjust with cosine falloff to the band edge | `{ bands: { hue 0..360, range, hueShift -180..180, satScale 0..2, lightShift -1..1 }[] }` |
| `lgg` | lift / gamma / gain — the colorist three-way (lift lifts shadows, gain scales highlights, gamma bends midtones) | `{ lift, gamma, gain: [r,g,b] }`; gamma 1 = unchanged |
| `histogram` | levels stretch: remap `[blackPoint, whitePoint] -> [0,1]` with a midtone gamma | `{ blackPoint, whitePoint, midtone }`, all 0..1-ish; white > black |
| `saturation` | Rec.709 luma-preserving master saturation/vibrance | `{ amount }` — 0 greyscale, 1 unchanged, 2 doubled |

### The op-stack JSON shape

One `OpStack` per file (a file, or a directory of them). `name` flows into the
`.cube` TITLE; `size` is the cube edge length (`17 | 32 | 64`, default 32). A
**zero-op stack bakes the identity cube** — a valid, honest no-op artifact, never
a fabricated look.

```json
{
  "name": "Purple Punch",
  "size": 32,
  "ops": [
    { "type": "curves", "master": [{ "x": 0.2, "y": 0.16 }, { "x": 0.8, "y": 0.86 }] },
    { "type": "hsl", "bands": [{ "hue": 280, "range": 40, "hueShift": -8, "satScale": 1.2, "lightShift": 0.04 }] },
    { "type": "lgg", "lift": [0.02, 0.0, 0.05], "gamma": [1.0, 1.0, 1.05], "gain": [1.0, 1.0, 1.04] },
    { "type": "histogram", "blackPoint": 0.03, "whitePoint": 0.97, "midtone": 1.0 },
    { "type": "saturation", "amount": 1.12 }
  ]
}
```

The PRO panel never hand-codes a cube — it edits an `OpStack` and the engine
bakes. `bakeToLut(stack, size)` (op-stack.ts) evaluates `evalOpStack` at every one
of the `size^3` grid points; `writeCubeLut(lut)` (lut.ts) serializes the Adobe
`.cube`. Brand-preset starting points live in `lib/filters/brand-presets.ts`; op
factory defaults (`defaultCurveOp`, `defaultHslOp`, ...) seed a no-op op the author
then edits.

---

## Bake — `scripts/generate-filters.ts`

The headless, agent-drivable baker. It re-implements NONE of the color math — it
is the thin typed driver that sequences **read JSON -> validate/clamp -> bake ->
write -> receipt**, copying the house CLI contract from `scripts/generate-assets.ts`
exactly (flag-driven, single-JSON-stdout + per-item receipt + `_run-summary.json`,
a `--dry-run` plan, honest-empty never-fake).

Because nothing contacts a provider, **`--dry-run` is a VALIDATE/CLAMP report**,
not a spend guard (there is no spend to guard): it parses each input, runs the same
clamp `bakeToLut` would, reports what WOULD be written and any clamp correction, and
writes no `.cube` bytes.

### Invoke

```
bun scripts/generate-filters.ts [flags]
```

| Flag | Effect |
| --- | --- |
| `--in <path>` | op-stack JSON file OR a directory of them (default `filters/op-stacks`). |
| `--name <name>` | Pin the artifact name (single-file input). |
| `--size <17\|32\|64>` | Override the cube edge length. |
| `--out <dir>` | Artifact dir (default `public/filters`). |
| `--force` | Re-bake even if a `.cube` for this id already exists. |
| `--dry-run` | Validate + clamp report; write NO `.cube` bytes. |
| `--list` | Print discovered op-stack inputs as JSON and exit. |

```bash
# Validate + clamp report for every authored op-stack (writes nothing).
bun scripts/generate-filters.ts --dry-run

# Bake every op-stack in the input dir to .cube artifacts.
bun scripts/generate-filters.ts

# Bake one named filter at a 64-cube.
bun scripts/generate-filters.ts --in filters/op-stacks/purple-punch.json --size 64
```

Artifacts read back: `<out>/<id>.cube` (the LUT), `<out>/<id>.receipt.json` (cube
size + `size^3` points + bytes, the thumbnail plan, parse/clamp notes),
`<out>/_run-summary.json` (counts merged across runs), an honest self-describing
`<out>/README.md`, and the compact JSON object on stdout. An unknown op type or an
out-of-range size is **clamped, not dropped silently** — the receipt's `notes` say
exactly what the clamp corrected.

### The thumbnail seam (load-bearing, honest-empty)

The `app/api/media/filters` POST route **hard-requires a WebP thumbnail File**. A
`.cube` is not a thumbnail, and a real WebP needs a raster encoder bound to a canvas
(the in-app maker). So the headless baker does **not** fabricate a thumbnail binary
— each receipt carries a `thumbnail` plan naming the CPU reference the maker samples
(`applyLutToImageData` in `lib/filters/webgl-lut-pass.ts`, which calls
`sampleLutTrilinear` from `lib/filters/lut.ts`) over a swatch grid, plus the
`STICKER_SPEC`-class WebP target. The in-app maker encodes + POSTs the real WebP.
Honest-empty over a fake thumbnail.

---

## The in-app door — `/studio/filters`

`app/studio/filters/page.tsx` is the public, consumer-facing maker (mirrors
`/studio/stickers`): `ProtectedRoute` + `SmokeBackground`, design tokens only
(`feedColors` from `@/lib/design-tokens`), mobile-first 320–430px single column.
It surfaces `<FilterMaker/>` (the F1..F30 brand-preset gallery grouped by
Mood / Product / Scene / Brand via the anti-pill `SegmentedControl`, a live
preview, the grade sliders, background tint, a face glyph) and a "My filters" grid
that hydrates from `GET /api/media/filters` via `lib/filters/authored-filter-store.ts`
so a freshly saved filter shows immediately.

Both doors consume the SAME engine core, so a headless bake and an in-browser bake
of the same op-stack are byte-identical. When there are no saved filters, the grid
shows an honest "Load a brand preset above, tweak it, and hit Save." prompt — no
placeholder thumbnails.

---

## The apply seam — one look, everywhere

`applyAuthoredFilter(ctx, input, width, height)` in
`lib/filters/apply-authored-filter.ts` is the ONE pure, context-only seam that
grades every surface. Hand it any 2D context already holding the frame to grade,
plus either a full `AuthoredFilterConfig` or a `{ lut }` envelope, and it mutates
the context in place. It is landmark-free and camera-free — it grades whatever
pixels are on the context (a composited live frame, a captured photo, a story
canvas, a flattened export), so a filter authored once renders **identically across
live rooms, camera capture, and stories.**

```ts
import { applyAuthoredFilter } from '@/lib/filters/apply-authored-filter';

// A baked-LUT-only look (the published artifact path):
applyAuthoredFilter(ctx, { lut }, width, height);

// A full authored config: the baked LUT (if present) is sampled FIRST as the
// precise authored transform, then the cheap warmth/tint/vignette grade rides on
// top as the live-tunable layer.
applyAuthoredFilter(ctx, authoredConfig, width, height);
```

The LUT sample is delegated to `applyLutToContext` (`lib/filters/lut-engine.ts`),
which picks the **WebGL2 trilinear pass** (`webgl-lut-pass.ts`, exported
`applyLutWebGl`) when `canUseBackgroundProcessors()` is true, and falls back to the
**CPU trilinear path** (`sampleLutTrilinear`, the same reference math the shader
mirrors) on iOS Safari and any WebGL2-less browser. The cube uploads as a 2D STRIP
texture (`size x size*size`), not a 3D texture, for maximum mobile-Safari WebGL2
compatibility. An identity / empty LUT is a no-op, so a grade-only config never
pays for the LUT pass. The `segment` (selfie-segmentation tint) and `overlay`
(face-anchored glyph) extras need a live camera + MediaPipe landmarks and are owned
by `FilterMakerEngine`, NOT this full-frame seam.

A baked filter persists as the `config` jsonb of `gh_user_filters`: a 17-cube
inline, a 32/64-cube as a bucket URI per the artifact contract; absent for
grade-only looks.

---

## The `.cube` round-trips with real editors

The on-disk format (`lib/filters/lut.ts`) is the Adobe Cube LUT spec — plain ASCII,
LF-terminated, `TITLE` + `LUT_3D_SIZE N` + `DOMAIN_MIN/MAX` + `N^3` red-major rows.
That is the universal interchange a baked GrazzHopper look uses to leave the app:

- **DaVinci Resolve** — drop the `.cube` into the LUT folder (Project Settings ->
  Color Management -> Open LUT Folder), then apply it as a node LUT in Color.
- **Premiere Pro / After Effects** — load it in the Lumetri Color panel's "Creative
  -> Look" or "Basic Correction -> Input LUT".
- **ComfyUI** — feed it to a `.cube`/3D-LUT apply node so the same grade lands on a
  rendered frame or a diffusion output.

`parseCubeLut` reads a `.cube` back into `LutData` (honoring `TITLE` + `LUT_3D_SIZE`,
normalizing the domain to 0..1, rejecting 1D cubes, throwing on a row-count
mismatch so a truncated file never silently round-trips as a different look), so a
look authored in DaVinci can come back IN. The cube is the portable artifact in
BOTH directions.

---

## Create -> Produce -> Place

1. **CREATE** — the pro panel (or an agent authoring JSON) emits a DRAFT `OpStack`.
2. **PRODUCE** — `bakeToLut -> writeCubeLut` lands a real, verified `.cube`. The CLI
   is the headless door; `/studio/filters` + the standalone `maker-studio` are the
   self-serve door. Both consume the SAME engine, so the bytes are identical.
3. **PLACE** — a verified `.cube` is handed to ONE typed routing step that fans it
   out by surface (story-tray, camera, live-picker, sticker-library). A studio
   never writes straight to a surface.

```ts
import { registerProducedArtifact } from '@/lib/media/placement-registry';
import type { ProducedArtifact } from '@/lib/media/produced-artifact';
```

After a CLI writes a real `.cube`, the place step builds the `ProducedArtifact`
envelope from the receipt and calls `registerProducedArtifact(artifact)` —
**only after the real bytes are verified.** The highest-leverage first wire: route
the baked filter `.cube` (plus F1–F30 + authored configs) through the registry into
the story-tray + camera, which makes "create a filter once, place it in story +
live + camera" real. Never register an artifact whose bytes were not produced.

---

## NEVER

- NEVER spend during a filter bake — it is pure deterministic color math, no
  provider, no role, no key, no network.
- NEVER fabricate, seed, or placeholder a `.cube` or a thumbnail. A missing input
  dir is `planned: 0`; an un-encoded thumbnail is a documented plan, not a file.
- NEVER edit the shared engines (`op-stack.ts`, `lut.ts`, `lut-engine.ts`,
  `webgl-lut-pass.ts`, `apply-authored-filter.ts`) from a CLI — they are imported
  read-only; the color math has one home.
- NEVER reach a color grade to the screen by any path other than
  `applyAuthoredFilter` — one seam, one look, identical across camera/stories/live.
- NEVER hand-code CSS/SVG decorative animation. (A GPU LUT is image processing —
  allowed.)
- NEVER register an artifact in the placement registry before its real bytes exist.

---

## Citations

- SKILL `asset-generation`: one repeatable, agent-drivable producer per item type
  that turns a declared catalogue (authored op-stacks) into real validated
  artifacts (or an honest-empty plan), with receipts and a dry-run, no human in the
  loop.
- SKILL `frontend-architecting`: the color math lives in `lib/filters/*`; the CLI
  is a thin typed driver that sequences bake + serialize with no `any` in its own
  surface and no duplicated logic.
- LIBRARIAN `frontend-librarian`: one declarative shape (`OpStack`) drives the live
  + published + headless paths to byte-identical output; a 3D-LUT expresses what a
  five-channel grade can't, and a GPU LUT is image processing, not decoration.
- Source (2026) `developers.googleblog.com/build-with-google-antigravity`: an agent
  plans + executes headless across editor/terminal and verifies through tangible
  ARTIFACTS (the `.cube` files + JSON receipts), not raw logs — and never a paid
  call sits in the loop.
