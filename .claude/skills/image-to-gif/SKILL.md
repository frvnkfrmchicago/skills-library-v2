---
name: image-to-gif
description: >
  Turn an arbitrary image (a photo, screenshot, or uploaded PNG/JPEG/WebP) into a
  looping animated GIF for cross-Meta distribution — cut-out, trim-to-art, ambient
  motion, an in-house ffmpeg.wasm GIF encode, and the seamless-loop quality gate —
  end-to-end from the headless terminal. Use when an agent needs to produce one
  looping GIF or batch a directory of images into GIFs without spend, when adding
  ambient motion to a still for a distribution upload, or when wiring the image →
  GIF path onto a feed/story/live/library surface. The GIF-focused twin of
  image-to-sticker; one shared engine core, honest-empty never-fake, no paid
  generation, no third-party GIF API.
---

# Image To GIF

Takes ANY raster image and produces a looping animated GIF — the distribution
twin of the image-to-sticker skill. Where **image-to-sticker** makes the
transparent die-cut master (still by default, animated on request), **image-to-gif**
is ALWAYS animated: the looping GIF is the whole output. Both share one engine
core and one compose seam — this skill is the GIF door over it. No human in the
loop: an agent invokes the runner with flags and reads back the artifacts it
writes (real files + JSON receipts).

```
image bytes  ->  cut-out (rembg)  ->  trim-to-art  ->  ambient motion  ->  encode  ->  gate  ->  artifact
(any photo)      real alpha            die-cut crop      closed loop        WebP+GIF    quality   placement

lib/media/         lib/media/           sharp (.trim,     lib/stickerz/      lib/media/   lib/media/   lib/media/
rembg-client.ts    rembg-client.ts      alpha-aware)      ambient-motion/    gif-encoder  giphy-       produced-
                                                          render.ts          .ts          export-gate  artifact.ts
```

The compose seam is `composeImageSticker(imageBytes, { animate, size, ... })` in
`lib/stickerz/image-to-sticker.ts` — the SAME function image-to-sticker exports.
This skill ALWAYS passes an `animate` preset, so it always asks for the looping
encode. The headless CLI is `scripts/image-to-gif.ts`.

Routes alongside **image-to-sticker**: sticker = the transparent die-cut master
(in-app, true 8-bit alpha WebP); gif = the looping animated export for cross-Meta
distribution (a distribution upload must be a GIF source). Same input, two doors.

---

## When To Use

- "Make a looping GIF out of this photo / screenshot."
- "Batch this folder of images into looping GIFs for distribution."
- "Turn this sticker / still into an ambient looping GIF."
- "Plan the run without producing" (dry-run).
- "What ambient presets can the loop use?" (`--list-presets`).

Route to **image-to-sticker** instead when the output is the transparent die-cut
master rather than a distribution GIF.

---

## The cut-out is real or it is nothing (read first)

A GIF made from an arbitrary image still goes through a real cut-out so the subject
sits on true transparency, not a baked-in background. The cut-out stage is
`removeBackgroundViaService` (`lib/media/rembg-client.ts`), which tries two backends
in order:

| Backend | Env | What it is |
| --- | --- | --- |
| **Self-hosted** | `REMBG_URL` | the free, deterministic, privacy-preserving ONNX remover (preferred for batch) |
| **Hosted fallback** | `REMOVE_BG_API_KEY` | a hosted remover for hard edges, `type=graphic` (tuned for sticker / GIF art) |

With **neither** set the client returns an honest 503 `unconfigured`, so
`composeImageSticker` returns `{ ok: false, reason }` and the CLI records the item
as `skipped-unconfigured` — never a fabricated cut-out, never a flat rectangle
relabelled as transparent.

---

## Trim-to-art (the die cut behind the loop)

The cut-out carries real alpha. `sharp.trim()` reads that alpha to crop the
transparent surround away so the subject fills the frame, then fits it onto a square
transparent canvas at `--size` (default 512, the sticker spec). The surround stays
fully clear (alpha 0), so the animated layer composites over a clean subject. If
`sharp` cannot load in the runtime the item is an honest failure, never a fake.

---

## Ambient motion — always on (`--motion <preset>`, default `breathing-glow`)

A GIF is animated by definition, so this skill ALWAYS drives the closed-loop
living-layer engine `renderAmbientFrames` (`lib/stickerz/ambient-motion/render.ts`)
over the `AMBIENT_PRESETS` set. When `--motion` is omitted it falls back to a
sensible calm default — `breathing-glow`, the breathing purple glow — rather than
refusing. Every preset is driven off `phase = (i/N) * loopCycles * 2π`, so frame 0
equals frame N and the loop is seamless.

The animatable presets (one per ambient kind plus the particle variants):

| Preset id | What it is |
| --- | --- |
| `ember-field` | warm mint ember motes rising and fading at the top |
| `pollen-fall` | soft accent pollen / kief motes settling downward |
| `smoke-motes` | larger faint purple-glow motes curling upward |
| `breathing-glow` | a radial purple glow pulsing in and out (the default) |
| `light-sweep` | a soft mint band translating diagonally and wrapping |
| `cinemagraph-band` | the still frozen, motion only inside a centred lower band |
| `nug-parallax` | a 2.5D depth drift between a subject plane and the plate |

List them live with `--list-presets` (the doc table can drift; the CLI prints the
real set plus the default).

---

## Encode + gate (in-house, honest browser-encode note)

- **GIF** (the distribution output): `encodeFramesToGif`
  (`lib/media/gif-encoder.ts`) — a two-pass per-frame palette so colours stay clean
  and the `-loop 0` NETSCAPE2.0 application-extension block so the GIF loops forever
  in the Meta GIF/sticker bars. Encoded IN-HOUSE by `ffmpeg.wasm`, NEVER a
  third-party GIF API (no GIPHY/Tenor encode key anywhere).
- **WebP** (the master, written alongside): the transparent animated (or still)
  WebP master — smaller than GIF with true 8-bit alpha.
- **GATE**: the looping GIF is validated by `validateGiphySticker`
  (`lib/media/giphy-export-gate.ts`) on the real bytes — transparency floor,
  ≥ 2 frames, ≤ 6s, seamless loop within `6/255`, and the `loop=0` block present —
  before it is returned. A gate fail is an honest failure, never shipped.

### Honest browser-encode note (the headless reality)

The ambient renderer draws on a canvas and the GIF is muxed by `ffmpeg.wasm` — both
need a browser/canvas runtime. In a **pure-Node headless run** (this CLI on its
own) there is NO canvas, so `composeImageSticker` produces the REAL transparent
WebP still and reports the GIF as `pending-browser-encode`. The CLI then records the
item `produced-pending-gif`: it writes the real WebP master and carries the honest
pending note — it NEVER fabricates GIF bytes. The looping GIF is encoded by the
in-browser maker (same engines, canvas present), where the gate verifies the real
bytes. This is the same honest-partial pattern the asset runner uses for its alpha
strip — honest-empty over a fake GIF.

The produced bytes are folded into a `ProducedArtifact`
(`lib/media/produced-artifact.ts`) so `registerProducedArtifact` can verify + place
it onto a feed/story/live/library surface unchanged.

---

## Headless usage — how an agent (Antigravity) invokes it

```bash
# 1. See the animatable presets + the default motion.
bun scripts/image-to-gif.ts --list-presets

# 2. Plan a run with no cut-out call.
bun scripts/image-to-gif.ts --in ./incoming --dry-run

# 3. One image → a looping GIF on the default breathing-glow loop (canvas runtimes;
#    headless produces the WebP master + records produced-pending-gif).
bun scripts/image-to-gif.ts --in ./incoming/nug.jpg

# 4. A whole folder → looping GIFs with a chosen ambient preset.
bun scripts/image-to-gif.ts --in ./incoming --motion ember-field --out ./public/gifs/image/_staging

# 5. Tune the loop length + rate.
bun scripts/image-to-gif.ts --in ./incoming/nug.jpg --motion light-sweep --frames 24 --fps 12

# 6. Resume an interrupted batch — same command; staged inputs are skipped.
bun scripts/image-to-gif.ts --in ./incoming
```

### Env (the cut-out backend, read server-side inside the rembg client only)

```bash
export REMBG_URL=https://your-rembg-host          # preferred, free, deterministic
export REMOVE_BG_API_KEY=your_hosted_key          # hosted fallback for hard edges
```

With neither set, the run is honest-empty (`skippedUnconfigured`). There is no GIF
API key — GIFs are encoded in-house.

### Flags

| Flag | Meaning |
| --- | --- |
| `--in <image\|dir>` | an image file OR a directory of images (required). |
| `--motion <preset>` | ambient-motion preset driving the loop (default `breathing-glow`). |
| `--out <dir>` | output dir (default `public/gifs/image/_staging`). |
| `--size <px>` | square GIF size (default 512). |
| `--frames <n>` | closed-loop frame count. |
| `--fps <n>` | playback rate (1..20). |
| `--force` | regenerate even if an output exists. |
| `--dry-run` | plan only; contact NO cut-out backend. |
| `--list-presets` | print the animatable presets JSON + the default and exit. |

### Artifacts the agent reads back

- `<out>/<stem>.gif` (the looping distribution GIF, when encoded in a canvas
  runtime) and `<out>/<stem>.webp` (the transparent master, ALWAYS written).
- `<out>/<stem>.receipt.json` — per image: status (`produced-gif` /
  `produced-pending-gif` / `skipped-existing` / `skipped-unconfigured` / `failed`),
  the files written, whether a real GIF was encoded (`gifEncoded`), the gate
  measurements when a GIF was produced, and the honest reason for any non-encoded
  item.
- `<out>/_run-summary.json` — overall counts across resumed runs plus the failures
  list. stdout is the same compact summary JSON, so an agent parses one object.

---

## Resumability

Output paths are deterministic (`<out>/<stem>.gif` and `<out>/<stem>.webp`). An
input whose GIF (or, for a prior headless run that left the still pending, whose
WebP master) already exists is skipped unless `--force`, so an interrupted batch
restarts with the identical command and continues where it stopped. A single bad
image is recorded in `failures` and the run keeps going — one failure never loses
the batch.

---

## NEVER

- NEVER call a third-party GIF/sticker/image encode API. The GIF is encoded
  in-house by `ffmpeg.wasm`; GIPHY/Tenor are read-from distribution targets, never
  encode services.
- NEVER fabricate GIF bytes. A canvas-less headless run produces the real WebP
  master and records `produced-pending-gif` — honest-empty over a fake GIF.
- NEVER fabricate, seed, or placeholder a cut-out, or relabel a flat-RGB image as
  transparent. No cut-out backend -> honest 503 `unconfigured`.
- NEVER ship a GIF that fails the seamless-loop gate, or one missing the
  NETSCAPE2.0 `loop=0` block.
- NEVER call a paid AI-video API. There is no video path; motion is the closed-loop
  ambient engine only.
- NEVER read a cut-out env key outside the rembg client, or print one.
- NEVER edit `lib/stickerz/image-to-sticker.ts`, `lib/media/rembg-client.ts`,
  `gif-encoder.ts`, `giphy-export-gate.ts`, `produced-artifact.ts`, or the
  ambient-motion engine from here — they are shared engines, imported read-only.
  This skill owns ONLY `scripts/image-to-gif.ts` and this doc.

---

## Governed by the media-creation librarian

This skill answers to `.claude/skills/media-creation/LIBRARIAN.md` — the rulebook
the whole media-creation family obeys. The rules it applies directly:

- **S1** — the GIF is encoded in-house by `ffmpeg.wasm`; no third-party GIF API.
- **S2** — the cut-out is the rembg client (self-hosted first), honest 503 when
  unconfigured.
- **S3 / S5** — the loop is closed (`phase = (i/N)*loopCycles*2π`) and every GIF
  runs `validateGiphySticker` on real bytes before it is returned.
- **S4 / S6** — size + cap come from `STICKER_SPEC` / the encoder constants, palette
  from `feedColors`; this skill re-declares none of them.
- **S7** — honest-empty: an unconfigured backend, a sharp-missing runtime, a
  canvas-less headless encode, and a gate fail each record a distinct honest state.
- **S10** — the CLI copies the `generate-assets.ts` contract (flags + single JSON
  stdout + per-item receipt + `_run-summary.json`).

If a rule here and a rule in the librarian disagree, the librarian wins.

---

## Citations

- SKILL `frontend-architecting`: the pipeline lives in
  `lib/stickerz/image-to-sticker.ts`; the CLI is a thin typed driver that sequences
  the cut-out / trim / motion / encode / gate / envelope engines via
  `composeImageSticker` — no duplicated logic, no `any` in its surface.
- LIBRARIAN `media-creation-librarian`: the rulebook this skill obeys — encode
  in-house (S1), cut out via the self-hosted remover first (S2), loop seamlessly +
  gate on real bytes (S3/S5), single-source the spec + palette (S4/S6), honest-empty
  never fake (S7), copy the headless CLI contract (S10).
- Source (2026) `github.com/danielgatis/rembg`: the self-hosted ONNX remover is the
  free, deterministic, privacy-preserving default for batch cut-outs, with a hosted
  fallback for hard edges — applied as this pipeline's cut-out stage so the GIF's
  subject sits on real transparency.
- Source (2026) `developers.googleblog.com/build-with-google-antigravity`: agents
  autonomously plan and execute across editor/terminal/browser and run long work in
  the background, communicating through artifacts (files + receipts) an agent reads
  back — this headless command is that terminal surface.
```
