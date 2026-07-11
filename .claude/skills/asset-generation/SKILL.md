---
name: asset-generation
description: >
  Produce GrazzHopper's brand-seeded visual assets (die-cut stickers and animated
  motion clips) end-to-end from the concept corpus. Use when generating, batch-
  producing, or resuming the sticker/GIF brand package, when an agent needs to run
  asset generation headlessly from the terminal, or when wiring a new provider or
  concept pack into the generation pipeline. Drives concept-corpus -> brand-seed
  -> multi-provider router -> alpha strip -> stage, repeatably and without spend
  in dry-run.
---

# Asset Generation

One repeatable, agent-drivable pipeline that turns the GrazzHopper concept corpus
into real, on-brand, transparent-cut assets in a staging directory. No human in
the loop: an agent invokes the runner with flags and reads back the artifacts it
writes (staged files + JSON receipts).

The pipeline is a fixed sequence, each stage owned by one module — nothing is
re-implemented here:

```
concept corpus  ->  brand seed         ->  provider router      ->  alpha strip        ->  stage + receipt
(what to make)      (8-element prompt)     (who renders it)         (real transparency)    (resumable disk)

lib/media/generation/   lib/media/generation/   lib/media/generation/   lib/media/generation/   scripts/
  concept-corpus.ts        brand-seed.ts            provider-registry.ts    strip-node.ts           generate-assets.ts
                                                    + providers/*.ts        (+ browser:
                                                                              alpha-pipeline.ts)
```

---

## When To Use

- "Generate the sticker pack / the GIFs / the brand assets."
- "Resume the asset run — it stopped partway."
- "Produce just the `the-plant` pack" / "just one concept by id."
- "Plan the run without spending" (dry-run).
- "Add a provider / a concept pack to the generator."

---

## The Eight-Element Brand Seed (why output stays on-brand)

An image/video model only produces on-brand GrazzHopper output when every prompt
carries the SAME eight elements the brand guide locks
(`docs/brand-visual-style-2026-06-17.md`): **subject, lighting pattern (A-F),
environment trope, style set, palette accent, brand Easter eggs, composition
rule, output spec.** Drop one and the output drifts to generic stock cannabis.

`lib/media/generation/brand-seed.ts` makes those eight a TYPE (`BrandSeed`) and
`buildPrompt(seed)` composes them into the single prompt string a provider
consumes. `lib/media/generation/concept-corpus.ts` fills a `BrandSeed` for every
concept transcribed from the three concept docs (~250 stickers across 10 packs +
60 animated arcs across 4 packs = the full `CONCEPT_CORPUS`), so the runner never
re-reads a doc — it reads `job.prompt`, already composed.

Read these before changing a prompt:

- `lib/media/generation/brand-seed.ts` — the seed type + `buildPrompt`.
- `lib/media/generation/concept-corpus.ts` — `CONCEPT_CORPUS`, `jobsForPack`,
  `jobsOfKind`, `jobById`, `summarizeCorpus`, the `ConceptPack` ids.

---

## Provider Router (multi-provider, capability-routed)

`lib/media/generation/provider-registry.ts` exposes `generateAsset(prompt, opts)`
— the one call. It routes by `role` to a capable, configured provider and returns
a provider-agnostic `{ provider, role, assets }`, where each `GeneratedAsset`
carries real base64 bytes (never a fabricated asset). Routing:

| Role          | Preferred -> fallback    | Kind      |
| ------------- | ------------------------ | --------- |
| `photoreal`   | Gemini Imagen -> MiniMax | image     |
| `product`     | Gemini Imagen -> MiniMax | image     |
| `typographic` | Gemini                   | image     |
| `sticker`     | Gemini -> MiniMax        | image     |
| `motion`      | MiniMax (async video)    | animation |

The runner derives the role from each concept's kind + style set:
`animation -> motion`; `photoreal-product-macro -> product`;
`photoreal-cinematic -> photoreal`; `holographic-ui -> typographic`; every other
style (cartoon / street / neon / 90s / pixel) `-> sticker`. Pin a provider with
`--provider` to bypass routing. If no capable provider is configured for a role,
the concept is recorded `skipped: unconfigured` — honest empty, never a fake.

Secret keys are read server-side INSIDE the adapters; this skill / runner never
touches a key.

---

## Transparency (real alpha, never relabelled flat RGB)

Providers emit FLAT RGB — no alpha channel. The honest die-cut path is to render
the subject on an exact `#00FF00` chroma-green field with a thin white outline
(the seed appends this directive automatically for sticker output), then key that
green to true 8-bit alpha. There are two strip paths, by runtime:

- **Server-side (the runner):** `lib/media/generation/strip-node.ts` keys with
  `sharp` (HSV detect -> transparent + de-spill -> PNG) and re-measures the
  written bytes (`verifyAlphaBuffer`) so the receipt reflects disk, not a claim.
- **Browser forge (read-only here):** `lib/media/alpha-pipeline.ts`
  (`routeToAlphaWebP`) does the same in-canvas and is also the path for the
  animated die-cut WebP. The runner stages the motion mp4 as the real source; the
  forge produces the animated WebP.

If `sharp` cannot load, the runner does NOT fake alpha: it stages the raw
on-green still and marks it `alpha: pending-browser-forge` for the browser path.

---

## Environment It Needs

Run from `grazzhopper-landing/` so `.env.local` and `node_modules` resolve (bun
auto-loads `.env.local`). Keys are read server-side by the adapters:

| Var               | Powers                                | If missing                                            |
| ----------------- | ------------------------------------- | ----------------------------------------------------- |
| `GEMINI_API_KEY`  | Gemini Imagen / multimodal stills     | photoreal/product/typographic/sticker fall to MiniMax |
| `MINIMAX_API_KEY` | MiniMax stills + the only motion path | motion roles record `unconfigured`                    |

`sharp` (already a dependency) powers the server-side alpha strip; absent, the
runner stages raw-on-green for the browser forge. No other setup.

---

## How An Agent Invokes It (headless)

```
bun scripts/generate-assets.ts [flags]
```

| Flag                           | Effect                                                                 |
| ------------------------------ | ---------------------------------------------------------------------- |
| `--kind <sticker\|animation>`  | Only that kind.                                                        |
| `--pack <packId>`              | Only that concept pack (see `ConceptPack`).                            |
| `--id <conceptId>`             | A single concept by slug id.                                           |
| `--provider <minimax\|gemini>` | Pin a provider (bypass role routing).                                  |
| `--limit <n>`                  | Cap concepts this run processes.                                       |
| `--count <n>`                  | Variations per concept (default 1).                                    |
| `--out <dir>`                  | Staging dir (default `public/stickers/cannabis/_staging`, gitignored). |
| `--force`                      | Regenerate even if an output already exists.                           |
| `--dry-run`                    | Plan + print what WOULD run; contact NO provider.                      |
| `--list`                       | Print the corpus summary JSON and exit.                                |

Recipes:

```bash
# 1. See the plan with no spend — what runs, which provider, configured or not.
bun scripts/generate-assets.ts --dry-run

# 2. Know the corpus shape (counts per pack) before deciding scope.
bun scripts/generate-assets.ts --list

# 3. Produce one pack of stickers.
bun scripts/generate-assets.ts --pack the-plant

# 4. Produce one concept, pinned to a provider, 3 variations.
bun scripts/generate-assets.ts --id nug-trichome-glazed --provider gemini --count 3

# 5. Produce the animated set (motion routes to MiniMax).
bun scripts/generate-assets.ts --kind animation

# 6. Resume an interrupted run — same command; staged concepts are skipped.
bun scripts/generate-assets.ts --pack the-plant
```

### Artifacts the agent reads back

Per the 2026 agentic pattern, an agent verifies through tangible **artifacts**,
not raw logs:

- `<out>/<id>.png` (die-cut still) or `<out>/<id>.mp4` (motion source). Multiple
  variations get a `.NN` suffix.
- `<out>/<id>.receipt.json` — per concept: `provider`, `role`, the files written,
  and a measured `alpha` report per file (`stripped` / `matte-passthrough` /
  `pending-browser-forge` / `not-applicable`).
- `<out>/_run-summary.json` — overall counts across resumed runs
  (generated / skipped-existing / skipped-unconfigured / failed /
  pending-browser-forge) plus the failures list.

stdout is the same compact summary as JSON, so an agent parses one object.

---

## Resumability

Output paths are deterministic (`<out>/<id>[.NN].<ext>`). A concept whose first
variation already exists is skipped unless `--force`, so an interrupted batch is
restarted with the identical command and continues where it stopped. A single bad
concept is recorded in `failures` and the run keeps going — one failure never
loses the batch.

---

## Extending The Pipeline

- **Add a concept / pack:** add rows to `lib/media/generation/concept-corpus.ts`
  (each row keeps its doc `sourceRef`); the runner picks it up via `CONCEPT_CORPUS`.
  No runner change.
- **Add a provider:** implement the `ProviderAdapter` contract in
  `lib/media/generation/providers/`, export it from `providers/index.ts`, and
  register it + its role preference in `provider-registry.ts`. The runner is
  provider-agnostic and needs no change.

---

## NEVER

- NEVER fabricate, seed, or placeholder an asset. Honest empty (`unconfigured` /
  `failed`) over a fake file.
- NEVER relabel a flat-RGB still as transparent. Alpha is measured from real
  bytes; a still with no alpha is `pending-browser-forge`, not "done".
- NEVER read a provider key outside an adapter, or print one.
- NEVER call a provider during a `--dry-run`.
- NEVER edit `lib/media/alpha-pipeline.ts`, `gif-encoder.ts`, or `bg-removal.ts`
  from here — they are shared engines, imported read-only.

---

## Citations

- SKILL `frontend-architecting`: logic lives in `lib/`; the runner is a thin
  typed driver that sequences the corpus/router/strip — no duplicated logic, no
  `any` in its own surface.
- LIBRARIAN `api-integration-librarian`: keys server-side only; every provider
  result is the narrowed `GeneratedAsset`; unconfigured/transient failures are
  handled at the call site (skip-or-record), with provider retry/fallback in the
  registry.
- Source (2026) `developers.googleblog.com/build-with-google-antigravity`: agents
  autonomously plan and execute across editor/terminal/browser and run
  long-running work in the background, communicating through artifacts — this
  runner is that terminal surface, flag-driven and producing artifacts (staged
  files + receipts) an agent reads back.
