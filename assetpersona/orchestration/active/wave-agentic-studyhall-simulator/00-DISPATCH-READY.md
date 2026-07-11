# wave-agentic-studyhall-simulator — Dispatch Ready

## Mission
Build out the **AgenticStudyHall** learning platform inside `assetpersona` and integrate the **Paper Candle** drone simulator dashboard and cockpit HUD view inside `paper-candle`. This wave replaces stubs with functional interactive elements, wires dynamic data, sets up the Upgrade.Self ingestion parser and visualizer system, implements the outside certificate points trigger, and organizes these configurations under separate repository structures using Bun.

---

## Production Cadence (no time language)

| Wave | Name | % on completion | Status |
|------|------|-----------------|--------|
| 1 | Infrastructure, Parser, and SVG HUD | 30% | active |
| 2 | Classroom UI and Cockpit Integration | 65% | not started |
| 3 | Upgrade.Self Visualizer & Cheatsheets | 85% | not started |
| 4 | Certificate Uploads & Points Wiring | 100% | not started |

Current production: **30%**. Next: **Wave 1 — Infrastructure, Parser, and SVG HUD**.

---

## Audit-Driven Inputs

The implementation plan identified the following critical gaps:

| Repo | File | Gap | Address in Lane |
|---|---|---|---|
| `assetpersona` | `src/pages/community/Classroom.tsx` | "Coming Soon" stub with no learning pathway selector. | Lane 2 |
| `paper-candle` | `src/components/paperview/MobilePaperView.tsx` | Needs dynamic HUD animated preview of cockpit. | Lane 3 |
| `assetpersona` | `src/lib/upgrade-self/parser.ts` | Missing file parser module for Upgrade.Self (spelled with a dot). | Lane 4 |
| `assetpersona` | `src/components/upgrade-self/MindMap.tsx` | Missing interactive `@xyflow/react` node chart. | Lane 5 |
| `assetpersona` | `src/pages/community/Portfolio.tsx` | Missing portfolio outside credential upload. | Lane 6 |
| `assetpersona` | `src/pages/guides/ResourceHub.tsx` | Missing NonProfitHub-inspired semantic guides. | Lane 7 |

---

## Mode
**Multi-Primary Agent (declared)**. Lead orchestrator is this chat. Each lane runs as its own sub-agent invocation.

---

## Skills and Librarians Referenced

| Resource | Used By | Purpose |
|----------|---------|---------|
| `orchestration-librarian` | Lead | Lifecycle management. |
| `multi-agent-librarian` | All | Exclusivity of files. |
| `experience-designing` | Lane 2, Lane 3 | Color tokens and amber indicators. |
| `gamification-motion-design` | Lane 2 | Gamified node locks and streaks. |
| `animation-designing` | Lane 3 | Looping dashboard background transitions. |
| `database-designing` | Lane 6 | Certificate table schema design. |
| `frontend-architecting` | Lane 5 | `@xyflow/react` node graphs. |
| `api-integrating` | Lane 4 | NotebookLM-style file parsing. |
| `cloning` | Lane 2, Lane 7 | Layout replication from Skool and NonProfitHub. |
| `mobile-first-enforcing` | Lane 3 | Viewport sizing and touch states. |
| `performance-tuning` | Lane 5 | Canvas state performance tuning. |
| `typography-enforcing` | Lane 2, Lane 3 | Clash Display + Satoshi fonts. |
| `anti-mock-enforcing` | Lane 3 | Live ticker quotes instead of placeholders. |
| `code-auditing` | Lane 1 | Vite/Next build check. |
| `security-auditing` | Lane 6 | Credential upload validation filters. |
| `copywriting-enforcing` | Lane 2 | Drafting terminal logs narrative copy. |
| `interactive-animating` | Lane 3 | SVG reticle rotation animations. |
| `anti-glitch-debugging` | Lane 3 | Smoothing out panel drags. |
| `testing-enforcing` | Lane 1 | Bun runtime testing. |
| `supabase-building` | Lane 6 | Supabase tables and RLS rules. |
| `deployment-librarian` | Lane 1 | Next / Vite configuration. |

---

## Lane Decomposition (file-bound, no overlap)

### Agent 1: Infrastructure & Bun Configurations
- **Repo ownership**: Both (exclusive configuration files).
- **Files Owned**: `assetpersona/vite.config.ts`, `paper-candle/next.config.ts`.
- **Tasks**: Configure Vite PWA plugin, configure Next.js parameters, verify Bun dependencies compile cleanly.

### Agent 2: AgenticStudyHall Classroom Interface
- **Repo ownership**: `assetpersona`.
- **Files Owned**: `assetpersona/src/pages/community/Classroom.tsx`, `assetpersona/src/pages/community/Classroom.css`.
- **Tasks**: Implement the terminal-like course dashboard showing the "humans snuck in due to a bug" theme.

### Agent 3: Paper Candle Animated Cockpit HUD
- **Repo ownership**: `paper-candle`.
- **Files Owned**: `paper-candle/public/images/paper_candle_hud.svg`, `paper-candle/src/components/paperview/MobilePaperView.tsx`.
- **Tasks**: Write the animated SVG HUD cockpit, rendering live market ticks and interactive flight coordinates.

### Agent 4: Upgrade.Self Parser Engine
- **Repo ownership**: `assetpersona`.
- **Files Owned**: `assetpersona/src/lib/upgrade-self/parser.ts`, `assetpersona/supabase/migrations/20260602220000_upgrade_self.sql`.
- **Tasks**: Write the ingestion text/markdown parser and Supabase migrations.

### Agent 5: Upgrade.Self `@xyflow` Visualizer
- **Repo ownership**: `assetpersona`.
- **Files Owned**: `assetpersona/src/components/upgrade-self/MindMap.tsx`, `assetpersona/src/pages/community/UpgradeSelf.tsx`.
- **Tasks**: Build interactive node mapping charts using `@xyflow/react`.

### Agent 6: Outside Credentials & Points Trigger
- **Repo ownership**: `assetpersona`.
- **Files Owned**: `assetpersona/src/components/profile/CertUpload.tsx`, `assetpersona/src/pages/community/Portfolio.tsx`.
- **Tasks**: Write the file upload modal and portfolio PX rewards triggers.

### Agent 7: SEO Semantic Guides
- **Repo ownership**: `assetpersona`.
- **Files Owned**: `assetpersona/src/pages/guides/ResourceHub.tsx`, `assetpersona/src/pages/guides/ResourceHub.css`.
- **Tasks**: Build guides checklists and audio player modules.

---

## Evidence Contract
Completions must align with `99-EVIDENCE-CONTRACT.md` rules. Every lane must rewrite its file with exact delivery summaries, files changed, commands run, and citations triplet (Skill + Librarian + 2026 URL).
