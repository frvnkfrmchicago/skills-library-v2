# Content Hub Post Lifecycle

## Status Flow (4 States)

```
Draft → Approved → Scheduled → Published
  ↑        ↑           ↑
  |        |           └── Only admin (Frank) can set this
  |        └── Team "Approve for publishing" button
  └── "Save for later" or "Move back to drafts"
```

Failed posts normalize to scheduled (retry path). There is no "failed" tab.

**Frank's hard rule (2026-06-09):** Four DISTINCT states. Tab labels MUST match
state names exactly. Never rename tabs to "Publishing", "Ready", "Publishing
Queue", or any other synonym. The tabs are: Drafts | Approved | Scheduled | Published.

## ghState() Normalization (gh-hub.js ~line 308)

Source of truth. Every status check goes through `ghState()`, never raw `p.status`.

| Raw `p.status`  | Has `platformPostIds`? | ghState returns | Notes |
|------------------|------------------------|-----------------|-------|
| `undefined`/`null`/`"pending"` | any | `"draft"` | Legacy pending = draft |
| `"draft"`        | any                    | `"draft"`       | |
| `"approved"`     | any                    | `"approved"`    | Team approved, awaiting admin |
| `"scheduled"`    | any                    | `"scheduled"`   | Admin armed it, in publish queue |
| `"failed"`       | any                    | `"scheduled"`   | Failed = retry, same bucket |
| `"published"`    | yes (non-empty keys)   | `"published"`   | Confirmed by platform |
| `"published"`    | no / missing           | `"scheduled"`   | Fake published, never confirmed |
| anything else    | any                    | `"draft"`       | Catch-all |

Key insight: `"published"` without platformPostIds is fake — the webhook
never confirmed delivery. These posts get normalized back to `"scheduled"`
and show as "Queued".

## ghStateLabel() Display Labels

| ghState     | Has scheduledFor date? | Label shown  | CSS class     |
|-------------|------------------------|--------------|---------------|
| draft       | —                      | "Draft"      | .st-draft     |
| approved    | —                      | "Approved"   | .st-approved  |
| scheduled   | no                     | "Queued"     | .st-scheduled |
| scheduled   | yes                    | "Scheduled"  | .st-scheduled |
| published   | —                      | "Published"  | .st-published |

## Tab Labels

Sub-tab buttons in the main content area:

| Label      | sfilt value | Active class |
|------------|-------------|--------------|
| Drafts     | draft       | first tab    |
| Approved   | approved    |              |
| Scheduled  | scheduled   |              |
| Published  | published   |              |

Sub-tabs only narrow the "open" lists (all, mine_queue), not status-specific
sidebar buckets. When a sidebar bucket is selected (approved/scheduled/published),
the sub-tab filter is skipped so the bucket shows its full contents.

## Button Matrix by Role × Status

### openDetail() — Right Panel Buttons

| Status    | Admin sees                                                        | Team sees                                                        |
|-----------|-------------------------------------------------------------------|------------------------------------------------------------------|
| draft     | Publish now, Schedule, Edit, Assign, Download, Delete            | Approve for publishing, Edit, Assign, Download, Delete           |
| approved  | "Approved — waiting for admin" banner, Publish now, Schedule, Move back to drafts, Assign, Download, Delete | "Approved — waiting for admin" banner, Move back to drafts, Assign, Download, Delete |
| scheduled | "Queued/Scheduled" banner, Feedback line, Cancel — move back to drafts, Assign, Download, Delete | Same as admin                                                     |
| published | "✓ Published [timestamp]" banner, Unpublish, Download, Delete     | Same minus Unpublish                                              |

Key: Scheduled posts have NO Edit button. They're in the live publish queue
and editing mid-queue causes data loss.

### savePost() — Creator Footer

| Action      | Admin                     | Team                        |
|-------------|---------------------------|-----------------------------|
| Publish now | → scheduled + webhook     | → approved (no webhook)     |
| Schedule    | → scheduled + date        | → scheduled + date          |
| Save later  | → draft                   | → draft                     |

## Publish Feedback Pattern

When admin hits "Publish now" from detail modal (btnPublish handler):

1. Set `status:"scheduled"`, save, render immediately.
2. Show "Sending to publisher..." (blue) in `#publishFeedback`.
3. Fire N8N webhook via fetch().
4. On 2xx: "✓ Sent to publisher — goes out within ~5 min." (green #33fecc).
5. On non-2xx: "⚠ Publisher returned [status] — queued locally, will retry." (orange #ff9a3c).
6. On network error: "⚠ Publisher unreachable — queued locally, will retry." (orange).
7. No webhook configured: "Queued locally — publisher not configured." (orange).
8. Detail modal closes after 1.8s via `setTimeout(closeDetail, 1800)`.

Same webhook firing in savePost() creator path — all four code paths (Supabase
update, local fallback, Supabase create, local create) include the fetch when
`publishNow && isAdmin && N8N_SOCIAL_WEBHOOK`.

## Sidebar Filters

| ID           | Label       | filter value  | Visible to       |
|--------------|-------------|---------------|------------------|
| navAllPosts  | All Posts   | all           | everyone         |
| navQueue     | All drafts  | mine_queue    | admin only       |
| navApproved  | Approved    | approved      | everyone         |
| navScheduled | Scheduled   | scheduled     | everyone         |
| navCalendar  | Calendar    | calendar      | everyone         |
| navPublished | Published   | published     | everyone         |

## State Transition Buttons

| Button                  | From → To                | Who           |
|-------------------------|--------------------------|---------------|
| btnApprove              | draft → approved         | Team only     |
| btnPublish              | draft/approved → scheduled | Admin only  |
| btnScheduleAt           | draft/approved → scheduled (with date) | Admin only |
| btnUnapprove            | approved → draft         | Everyone      |
| btnUnschedule           | scheduled → draft        | Everyone      |
| btnUnpublish            | published → draft        | Admin only    |

## Pitfalls (learned the hard way)

1. **Dangling JS references.** When removing or renaming sidebar nav items,
   ALL JS variable references must be updated. The `nApp` crash (June 2026)
   happened because `navApproved` was removed from HTML but `if(nApp)` was
   still in `login()` — `nApp` was never declared, causing `ReferenceError`.
   Fix: always declare the variable with `$("navId")` even if the nav item
   might not exist.

2. **Never collapse states.** The June 8 session merged `approved` into
   `scheduled` and renamed tabs to "Publishing" / "Ready". Frank rejected this
   explicitly: four states, matching names, no creative renaming. When in doubt,
   tab label = capitalized state name.

3. **No Edit on scheduled.** Scheduled posts are armed for publishing. Opening
   the editor mid-queue risks the auto-publisher grabbing stale data. The Edit
   button guard is `_st!=="published"&&_st!=="scheduled"`.

4. **Sub-tab filter bypass for buckets.** The sfilt filter must be skipped when
   sidebar is on a status bucket (approved/scheduled/published). Otherwise
   clicking "Drafts" sub-tab while on "Scheduled" sidebar empties the grid.
   Current guard: `if(sfilt!=="all"&&filt!=="approved"&&filt!=="scheduled"&&filt!=="published")`.

## Files Modified

- `gh-hub.js`: ghState() normalization (4 distinct returns), ghStateLabel(),
  openDetail() approved-state buttons, btnUnapprove handler, edit guard for
  scheduled, render() approved filter + count + grid section, sidebar
  navApproved declaration + visibility, sub-tab filter bypass for approved.
- `gh-content-hub.html`: "Approved" tab button, "Scheduled" tab button
  (was "Publishing"), "Approved" sidebar item (was "Ready to Publish"),
  "Scheduled" sidebar label (was "Publishing Queue"), creatorFooterHint text.
