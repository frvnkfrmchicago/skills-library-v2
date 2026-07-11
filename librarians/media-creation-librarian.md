---
name: media-creation-librarian
description: >
  The governing rulebook for GrazzHopper's media-creation skill family — the
  standards every media skill obeys, the shared engines they all reuse, and the
  routing table that maps each request ("turn this into a sticker", "bake a
  filter", "make this a GIF", "animate this SVG") to the one skill that owns it.
  Read this FIRST when adding, changing, or routing any sticker / GIF / filter /
  scene-card / motion work, so a new skill reuses the existing encoder, cut-out,
  and motion engines instead of duplicating them, and obeys the in-house /
  honest-empty / seamless-loop standards the whole family is built on.
---

# Media Creation — the librarian (the rulebook)

GrazzHopper makes its own visual content: die-cut stickers, looping GIFs and
animated WebP, color filters, and big animated scene-cards. This is the ONE
rulebook the whole media-creation skill family answers to. It does three things:

1. **States the standards** every media skill obeys (encode in-house, cut out
   with the self-hosted remover first, loop seamlessly, honest-empty never fake,
   brand palette from one source).
2. **Maps the engines** — the shared `lib/` modules that do the real work, which
   every skill imports read-only and none re-implements.
3. **Routes the skills** — given a request, which one skill owns it, with a
   one-line "when to use" each.

Read this before writing or changing a media skill. If a rule here and a rule in
a single skill disagree, this rulebook wins.

---

## Part 1 — The standards (every media skill obeys these)

### S1. Encode in-house. No third-party GIF/sticker/image API.

Every GIF and animated WebP is encoded ON OUR side, in the browser, by
`ffmpeg.wasm`. There is **no** GIPHY-encode key, no Tenor key, no hosted
"make-a-GIF" service in any encode path. The ffmpeg core loads free from a CDN
the first time a user presses generate, so the multi-MB wasm never bloats first
paint. WebP is the in-app master sticker format (true 8-bit alpha, smaller than
GIF); GIF is produced only for cross-Meta distribution, which requires a GIF
source upload.

- The encoder lives in `lib/media/gif-encoder.ts`. No skill writes a second one.
- GIPHY/Tenor are **distribution targets read FROM**, never encode services we
  call. Tenor is explicitly not a target (Google shuts the public Tenor API down
  June 30 2026).

### S2. Cut out via the self-hosted remover first; honest-empty if unconfigured.

A real die-cut sticker needs real 8-bit alpha. Two honest ways to get it, in
order:

1. **Server-side cut-out** — `removeBackgroundViaService` in
   `lib/media/rembg-client.ts` prefers the self-hosted ONNX remover (`REMBG_URL`,
   free, deterministic, keeps source bytes private), then the hosted fallback
   (`REMOVE_BG_API_KEY`, `type=graphic`) for hard edges.
2. **Chromakey** — for generated stills the model renders the subject on an exact
   `#00FF00` field with a thin white outline, and we key that green to true alpha
   (the generation pipeline's alpha strip).

When **neither** cut-out backend is configured, the client returns
`{ ok: false, status: 503, reason: 'unconfigured' }`. The caller surfaces an
honest 503 — it **never** fabricates a cut-out and **never** returns the original
bytes pretending the background was removed. A produced cut-out is a real one or
none at all.

### S3. Seamless loop is required for every animated sticker / GIF.

An animated sticker that jumps at the loop seam reads as broken. So every frame
list this family produces is **closed-loop**: frame 0 is the seamless
continuation of the last frame. The motion engine guarantees this by driving
every layer off `phase = (i / frameCount) * loopCycles * 2π` with an integer
`loopCycles`, so the phase at the notional frame N equals the phase at frame 0.
No bare `i/N` ramp, no random walk that doesn't close.

The seam is then **measured on the real bytes** by the quality gate (S5): last
frame within `6/255` mean per-channel delta of the first, plus a NETSCAPE2.0
`loop=0` block so the GIF loops forever in the Meta GIF bars. A seam that fails
the gate is a fail — the skill does not ship it.

### S4. The die-cut sticker spec is fixed and single-sourced.

Every sticker targets `STICKER_SPEC` (`lib/media/delivery-formats.ts`):

- **512×512** square, die-cut friendly (matches the encoder default).
- Loop forever (`loop: 0`).
- Hard cap **6s** animation length.
- Soft target **under 500KB**.
- Animated WebP carries the **ANIM/ANMF** chunks a still can't fake — the flag
  the verifier checks.
- For the GIPHY distribution export only: the first frame must be **≥ 20%**
  fully transparent, and the frame count snaps to a **multiple of 4**
  (`giphyFrameCount`) so the closed loop lands cleanly on its seam.

These numbers are declared once in `STICKER_SPEC` and the encoder constants
(`DEFAULT_STICKER_SIZE`, `MAX_CLIP_SECONDS`, `MIN_FPS`, `MAX_FPS`). A skill reads
them; it never re-declares its own size or cap.

### S5. Run every animated output through the quality gate.

Before an animated sticker/GIF is offered for distribution it must pass
`validateGiphySticker` in `lib/media/giphy-export-gate.ts` — OUR quality bar,
measured on decoded bytes (no stub, no heuristic): GIF source, ≥ 20% transparent
first frame, ≥ 2 frames, ≤ 6s, seamless loop within `6/255`, and the NETSCAPE2.0
`loop=0` block present. (Ignore the file's `giphy` name — a rename to a neutral
`sticker-export-gate` is pending; the bar is ours, not a vendor's.)

### S6. Brand palette comes from `design-tokens`, one source of record.

Colors are token NAMES resolved through `@/lib/design-tokens`
(`feedColors.brandGreenRgb` = mint `#33fecc`, `feedColors.brandPurpleRgb`
= `#A222B0`, `feedColors.feedMainRgb` = `#25012e`, `feedColors.feedAccentRgb`).
No raw hex literal in a renderer, no parallel palette vocabulary. The motion
engine resolves color ONLY through `feedColors` token names; a new preset or
filter does the same.

### S7. Honest-empty, never fake.

If a real binary cannot be produced without a browser/encoder/cut-out service
that is not present, the skill builds the **production code path** plus an honest
empty/503 — it never writes a fabricated, seeded, or placeholder asset. Examples
the family already ships honestly:

- No cut-out backend -> 503 `unconfigured`, never a relabelled flat image (S2).
- A generated still with no alpha is marked pending the in-browser cut-out,
  never "done" (the generation pipeline measures alpha from real bytes).
- A filter `.cube` baked headless has no WebP thumbnail (a thumbnail needs a
  canvas-bound encoder) -> the receipt carries a thumbnail **plan**, not a fake
  WebP; the in-browser maker encodes the real one.
- A scene-card's raster WebP isn't baked headless -> an honest `raster` plan; the
  canvas maker bakes the real bytes.

### S8. No paid AI-video. No hand-coded decorative animation.

Scene motion has exactly three honest sources: a **vector** Lottie/dotLottie
precomp, a **raster** canvas-procedural WebP, or an **owned** looping clip the
author supplies. A paid AI-video API is never called for motion, and there is no
video-decode-to-frames path anywhere. A GPU LUT (a filter) is image processing,
not decorative animation, and is allowed. No hand-coded CSS/SVG decorative
animation as a stand-in for the real motion engine.

### S9. Verify real bytes before placement.

A produced artifact is wrapped in the ONE `ProducedArtifact` envelope and handed
to the ONE placer, which verifies the real bytes (animated WebP carries
ANIM/ANMF and clears the transparency floor; a filter has a correctly-sized cube
or a real thumbnail) BEFORE it appears on any surface. A studio never writes
straight to a feed/story/live surface, and the registry never registers an
artifact whose bytes were not produced.

### S10. The headless CLI contract is copied, not reinvented.

Every headless producer mirrors `scripts/generate-assets.ts` exactly:
`--in/--out/--dry-run/--list/--force` flags, a single compact JSON on stdout, a
per-item `<id>.receipt.json`, a `_run-summary.json`, and honest-empty over a
fabricated binary. An agent verifies through these **artifacts** (files +
receipts), not raw logs.

---

## Part 2 — The engines (shared `lib/`, imported read-only by every skill)

These modules do the real work. A media skill **imports** them; it never
duplicates an encoder, a cut-out client, or a motion engine.

| Engine | File | What it gives you |
| --- | --- | --- |
| **In-house encoder** | `lib/media/gif-encoder.ts` | `encodeFramesToWebP(frames, opts)` (transparent animated WebP, the in-app master) and `encodeFramesToGif(frames, opts)` (GIF89a, two-pass palette, NETSCAPE2.0 `loop=0`). ffmpeg.wasm, lazy CDN core, no API. Plus `giphyFrameCount`, `DEFAULT_STICKER_SIZE`, `MIN_FPS`/`MAX_FPS`, `MAX_CLIP_SECONDS`. |
| **Cut-out client** | `lib/media/rembg-client.ts` | `removeBackgroundViaService(bytes, contentType, opts)` — self-hosted rembg first, hosted fallback, honest 503 `unconfigured` when neither is set. Server-side; reads keys off the browser. `isBackgroundRemovalConfigured()` to gate UI. |
| **Ambient motion** | `lib/stickerz/ambient-motion/render.ts` + `presets.ts` + `types.ts` | `renderAmbientFrames(still, preset, opts)` -> closed-loop `HTMLCanvasElement[]` (frame 0 == frame N). `AMBIENT_PRESETS` = the five seam-safe presets (ember/pollen/smoke particles, breathing purple glow, light sweep, cinemagraph, 2.5D parallax). Reduced-motion bakes one honest settled frame. Produces canvases only — the caller owns the encode call. |
| **Quality gate** | `lib/media/giphy-export-gate.ts` | `validateGiphySticker(bytes)` -> `{ ok, reasons, measured }` decoded from real GIF bytes. OUR sticker bar (S5). |
| **Sticker spec** | `lib/media/delivery-formats.ts` | `STICKER_SPEC` (512 / loop 0 / 6s / 500KB / requires ANIM chunks) + `DeliveryContext` (in-app vs giphy_source vs imessage vs messenger vs vector-UI). The single-source size + cap (S4). |
| **Artifact envelope** | `lib/media/produced-artifact.ts` | `ProducedArtifact` — the one versioned envelope (`sticker` / `scene` / `filter` / `story-template`), `ArtifactSource` (url or verified bytes), and the down-casts back to each surface's row shape. |
| **The placer** | `lib/media/placement-registry.ts` | `registerProducedArtifact(artifact)` — verifies real bytes, then fans the artifact out to every eligible declared surface (`SURFACES_BY_KIND`  and  `placements`). The ONE place step (S9). |
| **Generation pipeline** | `lib/media/generation/` | `provider-registry.ts` `generateAsset(prompt, opts)` (role-routed multi-provider stills + the only motion path), `brand-seed.ts` (`buildPrompt`, the eight brand elements), `concept-corpus.ts` (`CONCEPT_CORPUS`), `strip-node.ts` (server chromakey -> real alpha via `sharp`). Keys are read server-side INSIDE the adapters only. |
| **SVG providers + raster** | `lib/media/generation/svg-raster.ts` + `providers/` | `extractSvg` / `cleanSvg` (narrow a model's text answer to ONE safe self-contained `<svg>`, strip scripts/handlers/refs) and `rasterizeSvg` (resvg-js, native Rust, NO headless browser) so a vector asset can feed the ambient-motion engine as a still base layer. The provider adapters (`minimax` / `gemini` / `claude`) sit behind the registry's role router — no caller imports an adapter directly. |
| **Filter core** | `lib/filters/op-stack.ts` + `lut.ts` + `webgl-lut-pass.ts` | `bakeToLut` (evaluate the authored op chain at every cube grid point, zero spend), `writeCubeLut` (serialize the Adobe `.cube`), `applyLutToImageData` / `sampleLutTrilinear` (the CPU reference a real thumbnail samples). Pure deterministic color math. |
| **Scene core** | `lib/stickerz/scene-model.ts` + `motion-registry.ts` | `validateScene` (staggered entrance, ≥ 2 depth planes, named idle loop, byte budget) and the named cannabis scene registry the scene-card producer reads. |

---

## Part 3 — The skills (what each owns, when to use it)

One request, one owning skill. Route by what the input is and what the output
should be.

| Skill | When to use it |
| --- | --- |
| **asset-generation** | "Generate / batch / resume the brand sticker pack or the animated arcs from the concept corpus." Concept -> brand-seeded prompt -> provider router -> real-alpha cut-out -> staged file + receipt. The headless brand-package producer. |
| **stickerz-creation** | "Bake a color FILTER from an op-stack" or "package / validate a big animated SCENE-CARD." The two headless producers (filter baker + scene-card builder) plus the create -> produce -> place flow that lands a verified artifact on a surface. |
| **filters** | "Author / preview / apply a single creatable color filter." The op-stack -> `.cube` LUT authoring path and the unified apply seam, focused on one filter at a time (the per-filter studio door of the filter core). |
| **image-to-sticker** | "Turn THIS uploaded image into a die-cut sticker (optionally animated)." Cut out via the rembg client -> optionally drive an ambient preset -> encode a transparent WebP (and GIF). Exports `composeImageSticker(imageBytes, { animate?, size? })` from `@/lib/stickerz/image-to-sticker`, returning `{ webp, gif?, artifact }` or an honest `{ ok: false, reason }`. |
| **image-to-gif** | "Turn THIS image (or a sticker) into a looping GIF for distribution." Reuses `image-to-sticker`'s `composeImageSticker` for the cut-out + frames, then `encodeFramesToGif` + the quality gate for the cross-Meta GIF export. The distribution-GIF door over the same engines. |
| **svg-ambient-motion** | "Animate THIS SVG / vector into a looping sticker." `cleanSvg` -> `rasterizeSvg` to a still base -> an ambient preset -> encode. The vector-input door into the same closed-loop motion + encode engines. |

**Routing at a glance**
- Input is a **concept from the corpus** -> asset-generation.
- Input is an **op-stack / a named scene** -> stickerz-creation (filter or scene-card); a single filter -> filters.
- Input is an **uploaded raster image** -> image-to-sticker (sticker) or image-to-gif (distribution GIF).
- Input is an **SVG / vector** -> svg-ambient-motion.

All six share the same engines in Part 2 and obey the same standards in Part 1.

---

## NEVER (the family-wide bars)

- NEVER call a third-party GIF/sticker/image encode API. GIFs and WebP are
  encoded in-house by `ffmpeg.wasm`; GIPHY/Tenor are read-from distribution
  targets, never encode services.
- NEVER fabricate a cut-out or relabel a flat image as transparent. No cut-out
  backend -> honest 503 `unconfigured` (the chromakey path stays available for
  generated stills).
- NEVER ship an animated sticker/GIF that fails the seamless-loop gate, or one
  missing the NETSCAPE2.0 `loop=0` block.
- NEVER write a fabricated, seeded, or placeholder asset. Honest-empty +
  production code path instead.
- NEVER call a paid AI-video API for motion, and never hand-code a CSS/SVG
  decorative animation as a stand-in for the motion engine.
- NEVER register an artifact on a surface before its real bytes are verified by
  the placer.
- NEVER re-declare the sticker size / cap / palette in a skill — read
  `STICKER_SPEC`, the encoder constants, and `feedColors`.
- NEVER duplicate an engine. Import the encoder, cut-out client, motion engine,
  gate, and placer read-only; extend the catalogues (presets, concepts,
  op-stacks, scenes), not the engines.

---

## Citations

- SKILL `asset-generation`: one repeatable, agent-drivable producer per item
  type that turns a declared catalogue into real validated artifacts (or
  honest-empty), with receipts and a dry-run — the CLI contract this rulebook
  makes family-wide (S10).
- SKILL `stickerz-creation`: one engine core, two front doors (headless CLI +
  in-app maker), zero paid-video spend, honest-empty never-fake — the
  create -> produce -> place flow this rulebook generalizes to S9.
- LIBRARIAN `frontend-librarian`: one declarative shape drives live + published
  + headless to byte-identical output; format follows content origin (raster ->
  WebP, vector -> Lottie/raster); a 3D-LUT expresses what a five-channel grade
  can't — the basis for routing skills by input/output in Part 3.
- LIBRARIAN `api-integration-librarian`: secret keys server-side only, one typed
  client per integration, every upstream response narrowed before use — applied
  to the cut-out client, the provider adapters, and the SVG extract step.
- Source (2026) `developers.googleblog.com/build-with-google-antigravity`: agents
  plan and execute headless across editor/terminal and verify through tangible
  ARTIFACTS (staged files + JSON receipts), running long work in the background —
  the reason every media skill is artifact-driven, not log-driven (S10).
- Source (2026) `github.com/danielgatis/rembg`: the self-hosted ONNX remover runs
  as a free, deterministic, privacy-preserving HTTP service — the reason the
  cut-out standard (S2) prefers it before any hosted fallback.
