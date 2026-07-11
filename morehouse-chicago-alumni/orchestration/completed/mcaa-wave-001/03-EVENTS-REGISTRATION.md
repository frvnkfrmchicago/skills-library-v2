# Lane 3 — Event Registration + Paid Events
Status: done (lead-verified)
Wave: mcaa-wave-001
Owner: Batch 1 agent (build completed; lead documented the brief after verifying on-disk artifacts directly)
Single source of truth: this file only.

## Explainer
This lane upgraded the events experience to run on the real backend while keeping the
polished look. Events and RSVPs now read and write to Supabase instead of the browser.
Events can be free, paid, or members-only; capacity is enforced and overflow goes to a
waitlist; paid events hand the visitor to Stripe checkout. Each event page now publishes
search-engine-friendly structured data and an add-to-calendar action, and attendee names
are rendered safely.

## TL;DR
- `js/events.js` rewritten onto `window.supabaseClient` (Events.* + RSVPs.*) with capacity + waitlist logic and a clean paid-event seam into `create-checkout-session`.
- `event-detail.html` handles free (direct insert) and paid (checkout redirect) registration, publishes JSON-LD Event structured data, renders all user-controlled strings via `textContent`, and the stray `js/admin.js` include was removed.
- `events.html` shows free/paid/member-only badges; `docs/event-flow.md` maps happy + chaos paths.

| Field | Value |
|---|---|
| Mission | Production event registration UI against the contract schema, design preserved. |
| Result | Done. All owned files present and verified against the contract. Not run against a live backend (credential boundary). |

## Completed work
| # | Item | Status |
|---|---|---|
| 1 | `js/events.js` repointed to Supabase (22 `supabaseClient` calls); Events.* + RSVPs.* async | done |
| 2 | Capacity + waitlist logic (status `waitlisted` when capacity reached and waitlist open) | done |
| 3 | Paid-event seam: inserts pending registration, calls `create-checkout-session`, returns `{ checkoutUrl }` | done |
| 4 | `event-detail.html`: free + paid RSVP, post-checkout banner, attendee handling via `textContent` | done |
| 5 | JSON-LD Event structured data (schema.org Event + offers + eventStatus) | done |
| 6 | Removed stray `js/admin.js` include from `event-detail.html` | done |
| 7 | `js/calendar.js` async month view, `textContent` + `CSS.escape` | done |
| 8 | `events.html` free/paid/member-only badges | done |
| 9 | `docs/event-flow.md` happy + chaos paths, status model | done |

## Files changed
| Path | What |
|---|---|
| `js/events.js` | Events/RSVPs on Supabase; capacity/waitlist; checkout seam. innerHTML used only to clear containers. |
| `js/calendar.js` | Async data; textContent rendering. |
| `events.html` | Free/paid/member-only badges, capacity/deadline. |
| `event-detail.html` | Free+paid RSVP, JSON-LD, add-to-calendar, attendee gating, admin.js include removed. |
| `docs/event-flow.md` | Registration status model + chaos paths. |

## Commands run (lead verification)
| Command | Result |
|---|---|
| `grep -c supabaseClient js/events.js` | 22 (repointed off localStorage) |
| `grep -n create-checkout-session js/events.js` | present (seam at the function-invoke; success/cancel URLs set) |
| `grep -n ld+json\|schema.org event-detail.html` | JSON-LD Event present |
| `grep admin.js event-detail.html` | none (stray include removed) |
| `grep -n innerHTML js/events.js` | only `= ""` container clears; rendering via textContent |
| secrets grep on js/ + html | ZERO |
| emoji scan | none |

## Remaining gaps
- Live run requires Lane 1's Supabase project connected (credential boundary). Flows are coded, not executed against a live DB.
- The paid-event checkout call must match Lane 2's `create-checkout-session` input schema in `docs/data-contract.md` §7 (`purpose:'event_ticket'`, `event_id`, `guest_count`, success/cancel URLs). Lane 2 implements the matching contract; Lane 7 verifies the end-to-end seam.

## Artifacts
`js/events.js`, `js/calendar.js`, `events.html`, `event-detail.html`, `docs/event-flow.md`.

## Task-sheet update row
| Wave | Lane | Owner | Status | Summary | Doc path |
|---|---|---|---|---|---|
| mcaa-wave-001 | 03-EVENTS-REGISTRATION | Batch 1 agent | accepted | Events/RSVP on Supabase; free+paid+member-only; capacity/waitlist; JSON-LD; safe rendering | orchestration/active/mcaa-wave-001/03-EVENTS-REGISTRATION.md |

## Citations
- Skills: `flow-designing`, `api-integrating`, `testing-enforcing`, `frontend-architecting`.
- Librarians: `flow-librarian`, `ux-design-librarian`, `testing-librarian`, `frontend-librarian`.
- 2026 docs: developers.google.com/search/docs/appearance/structured-data/event; supabase.com/docs/reference/javascript/select and /insert; iCalendar RFC 5545.
