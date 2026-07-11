# Lane H — News / Content Hub
Status: complete · Wave: mcaa-wave-002 · Batch: 2 · Owner: page agent

## Explainer
Brings the orphaned content hub into the platform as "News" — in the nav, live from the real
Morehouse feed, cross-linked, and search-engine friendly.

## TL;DR
- `content.html` in the nav as "News" via `Shell.render({ page: 'news' })`; default type filter
  to news; live `content_items` from Supabase (approved/auto_approved only); cross-link to Events
  ("See what's coming up"); schema.org NewsArticle JSON-LD; breadcrumbs + shell.

---

## Work completed

| Task | Status | Notes |
|---|---|---|
| Wire shared shell (`#site-header`, `#main-content`, `#site-footer`, `js/shell.js`) | Done | `Shell.render({ page: 'news', breadcrumbs: [{ label: 'News' }] })` — shell labels route "News" |
| Default type filter to news | Done | HTML `<option value="news" selected>` + JS `state.filterType = 'news'` synced |
| Cross-link to Events | Done | "See what's coming up" banner links to `events.html` |
| Provenance note with chapter Instagram link-out | Done | Plain `<a target="_blank" rel="noopener noreferrer">` to instagram.com; no widget/scraping |
| Breadcrumbs | Done | `breadcrumbs: [{ label: 'News' }]` — shell auto-prepends Home |
| Approval-status gating | Done | `.in('approval_status', ['approved', 'auto_approved'])` + RLS defence-in-depth |
| Pagination | Done | Previous / Next; page-info span; smooth scroll to grid |
| schema.org NewsArticle JSON-LD | Done | `injectNewsArticleJsonLd()` builds `@graph` of NewsArticle objects from live items; serialised via `textContent` |
| No innerHTML for feed strings | Done | `clearEl()` helper replaces all `container.innerHTML = ""` calls; all cards built via `el()` / `textContent` |
| Remove hand-rolled nav | Done | Old `<nav id="main-nav">` block removed; shell owns nav entirely |
| Removed `Auth.updateNavForSession()` init call | Done | Shell handles nav; call removed from `init()` |
| Remove `js/app.js` load (was unneeded on this page) | Done | Not loaded — content.html only loads store/auth/shell/content |

---

## Files changed

| File | Change |
|---|---|
| `content.html` | Full rewrite — shared shell placeholders; `Shell.render({ page: 'news', breadcrumbs: [{ label: 'News' }] })`; default type filter to news; cross-link banner to events; provenance note with Instagram link-out; tokens-only page styles; accessible markup |
| `js/content.js` | Full rewrite — keeps approval-status gating + pagination; all `innerHTML = ""` replaced with `clearEl()`; adds `injectNewsArticleJsonLd()` for schema.org NewsArticle; `state.filterType` defaults to `'news'`; removes `Auth.updateNavForSession()` call; drops `const`/arrow-function syntax for consistency with rest of codebase |

---

## Hard gate results

| Gate | Status | Evidence |
|---|---|---|
| G1 No Stripe | Pass | `grep -rni "stripe" js/content.js content.html` — zero hits |
| G2 No secrets | Pass | `grep -rn "service_role\|sk_live\|whsec_\|PAYPAL_CLIENT_SECRET\|PAYPAL_WEBHOOK_ID" js/content.js content.html` — zero hits |
| G3 Payments | N/A | Lane H owns no payment surface |
| G4 File ownership | Pass | Edited only `content.html` and `js/content.js` |
| G5 Accessibility | Pass | Base type uses token scale (≥18px); `--touch-target` on select + pagination buttons; skip link from shell; no `innerHTML` for feed strings; underlined source links; `aria-live` on loading state; `aria-label` on all landmark sections |
| G6 Routing | Pass | "News" in nav via shell route key; breadcrumbs present; "See what's coming up" cross-link to events; provenance note links to morehouse.edu news |
| G7 No emojis / no time-language / no A/B/C menus | Pass | None present |
| G8 Citations | Pass | See Citations section below |

---

## Remaining gaps

None for Lane H. The board must supply the real chapter Instagram handle; the provenance note
currently links to `https://www.instagram.com/` — swap in the handle once confirmed.

---

## Citations

### Skills used
- `frontend-architecting` — shell wiring pattern, DOM-build card system, clearEl helper
- `search-building` — filter toolbar (type + relevance), approval-status query construction
- `research-conducting` — Dimension 5 feed/routing findings, provenance note sourcing decisions

### Librarians used
- `frontend-librarian` — page layout tokens, section / card / breadcrumb markup
- `search-librarian` — filter default strategy, select state sync
- `research-librarian` — schema.org NewsArticle structure, JSON-LD progressive-enhancement approach

### 2026 URLs used
- https://schema.org/NewsArticle — NewsArticle type definition used for JSON-LD `@graph`
- https://developers.google.com/search/docs/appearance/structured-data/article — article structured data guidance
- https://supabase.com/docs/guides/database/postgres/row-level-security — RLS defence-in-depth on approval_status filter
- https://www.nngroup.com/articles/information-architecture-study-guide/ — IA rationale for cross-link placement and "News" nav label
- https://news.morehouse.edu/rss.xml — verified Morehouse College RSS feed; source noted in provenance link
