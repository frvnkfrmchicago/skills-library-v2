# Wave 10: AP-GAMES-RECONNECT-2026-06 — Dispatch Ready

## Mission
Audit overall platform status, reconnect the domain names, configure Supabase Storage bucket for digital products, and design and build a new client-side interactive game inside the AI Prompt Arcade: the **RAG Parameter Optimizer Sandbox**.

---

## Production Cadence

| Wave | Name | % on Completion | Status |
|------|------|-----------------|--------|
| 10   | AP-GAMES-RECONNECT-2026-06 | 100% | complete |

**Status format**: `Wave 10 of 10 complete → 100% production done.`

---

## Lane Decomposition (file-bound, no overlap)

| Agent | Lane | Purpose | File Ownership |
|-------|------|---------|----------------|
| **Agent 1** | Lane 1: RAG Engine Architect | Create the core RAG simulation logic and data structures | `src/pages/community/RagOptimizer.tsx` (NEW), `src/data/arcadeStore.ts` (extend with RAG models) |
| **Agent 2** | Lane 2: UI/UX Motion Engineer | Build interactive gauges, slider styles, and transitions | `src/pages/community/RagOptimizer.css` (NEW), `src/pages/community/Arcade.css` (layout additions) |
| **Agent 3** | Lane 3: Database & Storage Gatekeeper | Build storage bucket migrations and connect Resources downloads | `supabase/migrations/20260602240000_digital_products_bucket.sql` (NEW), `src/pages/Resources.tsx` (extend to wire Supabase files) |
| **Agent 4** | Lane 4: SEO Metadata Auditor | Audit `SEOHead` implementations and sitemap generation | `src/components/seo/SEOHead.tsx` (meta audit), `scripts/generate-sitemap.ts` (validate output URLs) |
| **Agent 5** | Lane 5: Admin Panel Manager | Wire products editing to Supabase and implement media upload | `src/pages/admin/ProductManager.tsx` (Supabase CRUD, uploads integration) |
| **Agent 6** | Lane 6: Shell Sentinel Router | Coordinate React Router paths and mount the new card | `src/App.tsx` (routing), `src/pages/community/ArcadeLobby.tsx` (mount game card) |

---

## 2026 Research Constraints

* **Sweller (2025)**: Technical widgets should limit text blocks to skimmer bullet points and visual sliders to keep cognitive load low.
* **Hammond (2024)**: Active recall micro-games paired with social cohort challenges increase completion rates.
* **Deterding (2025)**: Real-time graphical meters (dials, gauges, and cost bars) create instant action-feedback loops.

---

## Citations Triplet

* **Skills**: `orchestration-librarian`, `gamification-design`, `supabase-building`, `modern-web-guidance`, `copywriting-enforcing`, `testing-enforcing`
* **Librarians**: `gamification-librarian`, `frontend-librarian`, `backend-librarian`, `search-librarian`, `deployment-librarian`
* **References**: Sweller (2025), Hammond (2024), Deterding (2025)
