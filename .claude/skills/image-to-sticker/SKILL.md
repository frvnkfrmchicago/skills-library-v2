---
name: image-to-sticker
description: >
  Turn an arbitrary image (a photo, screenshot, or uploaded PNG/JPEG/WebP) into a
  real die-cut sticker — cut-out, trim-to-art, transparent WebP, and an optional
  closed-loop animated GIF — end-to-end from the headless terminal. Use when an
  agent needs to produce one sticker or batch-produce a directory of images into
  die-cut stickers without spend, when adding ambient motion to a still, or when
  wiring the image → sticker path onto a feed/story/live/library surface. One
  shared engine core, honest-empty never-fake, no paid generation.
---

# Image To Sticker

Takes ANY raster image and produces a real die-cut sticker. No human in the loop:
an agent invokes the runner with flags and reads back the artifacts it writes
(real files + JSON receipts). The pipeline is a fixed sequence, each stage owned
by one existing engine — nothing is re-implemented here:

```
image bytes  ->  cut-out (rembg)  ->  trim-to-art  ->  [ambient motion]  ->  encode  ->  gate  ->  artifact
(any photo)      real alpha            die-cut crop      closed loop          WebP+GIF    quality   placement

lib/media/         lib/media/           sharp (.trim,     lib/stickerz/        lib/media/   lib/media/   lib/media/
rembg-client.ts    rembg-client.ts      alpha-aware)      ambient-motion/      gif-encoder  giphy-       produced-
                                                          render.ts            .ts          export-gate  artifact.ts
```

The compose seam is `composeImageSticker(imageBytes, opts)` in
`lib/stickerz/image-to-sticker.ts`. The headless CLI `scripts/image-to-sticker.ts`
drives it; the image-to-gif lane imports the same `composeImageSticker`.

---

## When To Use

- "Make a sticker out of this photo / screenshot."
- "Batch this folder of images into die-cut stickers."
- "Add a breathing-glow / ember loop to this still."
- "Plan the run without producing" (dry-run).
- "What ambient presets can I animate with?" (`--list-presets`).

---

## The cut-out is real or it is nothing (read first)

A transparent sticker needs a GENUINE alpha channel. A flat-RGB rectangle saved
under a sticker's name is a fake. The cut-out stage is `removeBackgroundViaService`
(`lib/media/rembg-client.ts`), which tries two backends in order:

| Backend | Env | What it is |
| --- | --- | --- |
| **Self-hosted** | `REMBG_URL` | the free, deterministic, privacy-preserving ONNX remover (preferred for batch) |
| **Hosted fallback** | `REMOVE_BG_API_KEY` | a hosted remover for hard edges, `type=graphic` (tuned for sticker art) |

With **neither** set the client returns an honest 503 `unconfigured`, so
`composeImageSticker` returns `{ ok: false, reason }` and the CLI records the item
as `skippedUnconfigured` — never a fabricated cut-out, never a flat rectangle
relabelled as a die cut.

---

## Trim-to-art (the die cut)

The cut-out carries real alpha. `sharp.trim()` reads that alpha to crop the
transparent surround away so the subject fills the frame (the essence of a die
cut), then fits it onto a square transparent sticker canvas at `--size` (default
512, the sticker spec). The surround stays fully clear (alpha 0). If `sharp`
cannot load in the runtime the item is an honest failure, never a fake.

---

## Ambient motion (optional, `--animate <preset>`)

Motion is the closed-loop living-layer engine `renderAmbientFrames`
(`lib/stickerz/ambient-motion/render.ts`) over the `AMBIENT_PRESETS` set — every
preset is driven off `phase = (i/N) * loopCycles * 2π`, so frame 0 equals frame N
and the loop is seamless. That engine draws on a canvas, so the **animated path
runs where a canvas exists** (the in-app / browser maker). In a **headless**
runtime (the CLI) the real die-cut still WebP is produced and the item is recorded
`produced-pending-animation` — the same honest-partial pattern the asset runner
uses for its alpha strip — never a fabricated GIF. List the presets with
`--list-presets`.

Motion is NEVER a paid AI-video API. There is no video path anywhere in this
pipeline (Frank's no-video directive).

---

## Encode + gate

- **WebP** (always): the transparent die-cut master. Still-only inputs encode via
  `sharp`; animated inputs encode the canvas frames via `encodeFramesToWebP`
  (`lib/media/gif-encoder.ts`, ffmpeg.wasm, alpha preserved).
- **GIF** (animated only): `encodeFramesToGif` with the `-loop 0` NETSCAPE2.0
  forever-loop block. The GIF is the distribution-source upload.
- **GATE**: an animated GIF is validated by `validateGiphySticker`
  (`lib/media/giphy-export-gate.ts`) on the real bytes — transparency floor,
  ≥ 2 frames, ≤ 6s, seamless loop, loop=0 — before it is returned. A gate fail is
  an honest failure, never shipped.

The produced bytes are folded into a `ProducedArtifact` (kind `'sticker'`,
`lib/media/produced-artifact.ts`) so `registerProducedArtifact` can verify + place
it onto a feed/story/live/library surface unchanged.

---

## Headless usage — how an agent (Antigravity) invokes it

```bash
# 1. See the animatable presets.
bun scripts/image-to-sticker.ts --list-presets

# 2. Plan a run with no cut-out call.
bun scripts/image-to-sticker.ts --in ./incoming --dry-run

# 3. One image → a static die-cut sticker.
bun scripts/image-to-sticker.ts --in ./incoming/nug.jpg

# 4. A whole folder → die-cut stickers.
bun scripts/image-to-sticker.ts --in ./incoming --out ./public/stickers/image/_staging

# 5. One image → a breathing-glow animated sticker (canvas runtimes; headless
#    produces the still + records produced-pending-animation).
bun scripts/image-to-sticker.ts --in ./incoming/nug.jpg --animate breathing-glow --frames 24 --fps 12

# 6. Resume an interrupted batch — same command; staged inputs are skipped.
bun scripts/image-to-sticker.ts --in ./incoming
```

### Env (the cut-out backend, read server-side inside the rembg client only)

```bash
export REMBG_URL=https://your-rembg-host          # preferred, free, deterministic
export REMOVE_BG_API_KEY=your_hosted_key          # hosted fallback for hard edges
```

With neither set, the run is honest-empty (`skippedUnconfigured`).

### Flags

| Flag | Meaning |
| --- | --- |
| `--in <image\|dir>` | an image file OR a directory of images (required). |
| `--animate <preset>` | ambient-motion preset id (omit = static sticker). |
| `--out <dir>` | output dir (default `public/stickers/image/_staging`). |
| `--size <px>` | square sticker size (default 512). |
| `--frames <n>` | closed-loop frame count for `--animate`. |
| `--fps <n>` | playback rate for `--animate` (1..20). |
| `--force` | regenerate even if an output exists. |
| `--dry-run` | plan only; contact NO cut-out backend. |
| `--list-presets` | print the animatable presets JSON and exit. |

### Artifacts the agent reads back

- `<out>/<stem>.webp` (the die-cut master) and, for a passed animated loop,
  `<out>/<stem>.gif` (the distribution source).
- `<out>/<stem>.receipt.json` — per image: status (`produced` /
  `produced-pending-animation` / `skipped-existing` / `skipped-unconfigured` /
  `failed`), the files written, the gate measurements when animated, and the
  honest reason for any non-produced item.
- `<out>/_run-summary.json` — overall counts across resumed runs plus the failures
  list. stdout is the same compact summary JSON, so an agent parses one object.

---

## Resumability

Output paths are deterministic (`<out>/<stem>.webp`). An input whose webp already
exists is skipped unless `--force`, so an interrupted batch restarts with the
identical command and continues where it stopped. A single bad image is recorded
in `failures` and the run keeps going — one failure never loses the batch.

---

## NEVER

- NEVER fabricate, seed, or placeholder a sticker. Honest-empty
  (`skippedUnconfigured` / `failed`) over a fake file.
- NEVER relabel a flat-RGB image as transparent. The cut-out is a real remover or
  the item is honest-empty.
- NEVER call a paid generation/video API. There is no video path; motion is the
  closed-loop ambient engine only.
- NEVER read a cut-out env key outside the rembg client, or print one.
- NEVER edit `lib/media/rembg-client.ts`, `gif-encoder.ts`, `giphy-export-gate.ts`,
  `produced-artifact.ts`, or the ambient-motion engine from here — they are shared
  engines, imported read-only.

---

## Citations

- SKILL `frontend-architecting`: the pipeline lives in `lib/stickerz/image-to-sticker.ts`;
  the CLI is a thin typed driver that sequences the cut-out / trim / motion /
  encode / gate / envelope engines — no duplicated logic, no `any` in its surface.
- LIBRARIAN `anti-mock-data-librarian`: an unconfigured cut-out backend, a sharp-
  missing runtime, a headless animated request, and a gate fail each record a
  distinct honest state; the runner never writes a fabricated binary or poses a
  flat image as a die cut.
- Source (2026) `philschmid.de/generate-stickers` + `github.com/danielgatis/rembg`:
  a real transparent sticker needs a genuine alpha channel (a remover/key), never
  a flattened RGB rectangle; the self-hosted ONNX remover is the free,
  deterministic, privacy-preserving default for batch cut-outs, with a hosted
  fallback for hard edges. This pipeline applies both as its cut-out stage.
- Source (2026) `developers.googleblog.com/build-with-google-antigravity`: agents
  autonomously plan and execute across editor/terminal/browser and run long work
  in the background, communicating through artifacts (files + receipts) an agent
  reads back — this headless command is that terminal surface.
```
