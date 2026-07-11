# WAVE-STUDIO — Dispatch Ready

## Mission
Build "Persona Studio," a Canva-like visual page editor embedded in Asset Persona's admin panel. Users drag/drop sections, edit text inline, swap/resize images, change colors, and apply effects. Pages save as JSON to Supabase and render as live public pages.

## Technology Decision (2026 Research)

| Evaluated | Type | Verdict |
|-----------|------|---------|
| **Puck Editor** | React page builder, component-based, open-source | **Selected.** React-native, outputs JSON, inline editing, AI page gen, plugin system. Best DX-to-feature ratio in 2026. |
| Craft.js | React framework, unopinionated | Rejected. Requires building entire UI from scratch. More effort, similar result. |
| GrapesJS | Framework-agnostic web builder | Rejected. Not React-native, requires iframes, heavier runtime. |
| Fabric.js | Canvas-based graphics editor | Rejected. Better for image editing, overkill for page building. |
| dnd-kit | Low-level drag-and-drop primitives | Rejected. Weeks of work to match what Puck provides out of the box. |

## Skills and Librarians Referenced

| Skill | Referenced By | Purpose |
|-------|---------------|---------|
| `experience-designing` | Agent 2, Agent 3 | Design token architecture, zero raw values |
| `frontend-architecting` | Agent 2, Agent 5 | Component hierarchy, state management (Zustand), TypeScript interfaces |
| `component-building` | Agent 3 | Token enforcement, micro-interactions, accessibility STOP gates |
| `interactive-animating` | Agent 3, Agent 4 | Tool selection matrix for effects (Framer Motion for layout, GSAP for scroll) |
| `database-designing` | Agent 1 | Schema design, migration workflows |
| `supabase-building` | Agent 1 | Storage policies, RLS |
| `multi-agent-designing` | All | Task decomposition, file boundaries, merge order, handoff protocol |
| `orchestration` (core) | Lead | Wave packet lifecycle, evidence contract, lane brief rewrite rule |
| `lab-orchestrating` | Lead | 6-stage pipeline context, checkpoint mode |

## Wave Structure

| Agent | Lane | Theme | Dependencies |
|-------|------|-------|-------------|
| Agent 1 | Infrastructure + Data | Supabase schema, storage, types, CRUD API | None (builds first) |
| Agent 2 | Core Editor Engine | Puck integration, config, provider, save/load | Agent 1 types + storage |
| Agent 3 | Editable Block Components | 7+ visual blocks with editable props | Agent 2 registry |
| Agent 4 | Editor UI Chrome + Effects | Toolbar, property panel, color picker, image uploader, device preview | Agent 2 context |
| Agent 5 | Integration + Routing | App routes, page list, live render, auth gate | Agents 1-4 |

## Evidence Contract

Each agent must produce:

1. Working code at the file paths listed in their lane brief
2. `bun run build` passes with zero errors
3. Lane brief rewritten in place with completion evidence per `references/lane-completion-template.md`
4. Completion evidence includes: Explainer, TL;DR, Tables (files changed, commands run, artifact paths, remaining gaps), task-sheet update row

## Merge Order

```
1. Agent 1 (Infrastructure) — types and storage first
2. Agent 2 (Core Editor) — depends on Agent 1
3. Agent 3 (Blocks) + Agent 4 (UI Chrome) — parallel, both depend on Agent 2
4. Agent 5 (Integration) — depends on all previous
```

## Status

| Lane | Status |
|------|--------|
| Agent 1 — Infrastructure + Data | assigned |
| Agent 2 — Core Editor Engine | assigned |
| Agent 3 — Editable Block Components | assigned |
| Agent 4 — Editor UI Chrome + Effects | assigned |
| Agent 5 — Integration + Routing | assigned |
