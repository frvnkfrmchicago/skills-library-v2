# Content Calendar Schema

Data model and view specification for the content hub calendar.

## Calendar Data Model

The calendar does not maintain a separate table. It derives its view from the
`posts` table using these fields:

| Field | Source | Purpose |
|---|---|---|
| `created_at` | posts.created_at | When the post was created |
| `published_at` | posts.published_at | When the post went live |
| `scheduled_for` | posts.scheduled_for | Target publish date (nullable) |
| `system` | posts.system | Content segment for color coding |
| `status` | posts.status | Pending / Approved / Published |
| `headline` | posts.headline | Preview text on calendar cell |
| `img` | posts.img | Thumbnail on calendar cell |
| `assignee` | posts.assignee | Team member avatar overlay |

### Scheduled Post Extension

If the brand uses scheduled publishing (rather than manual or cron-only), add
this column to the posts table:

```sql
ALTER TABLE posts ADD COLUMN scheduled_for timestamptz;
```

Posts with `scheduled_for` set appear on the calendar at the scheduled date.
The n8n cron workflow checks `scheduled_for <= now()` AND `status = 'approved'`
when selecting the next post to publish.

## Segment Color Map

Each content segment maps to a color for visual differentiation on the
calendar grid.

```json
{
  "news":       { "bg": "rgba(51,254,204,0.15)", "border": "#33fecc", "label": "News" },
  "engage":     { "bg": "rgba(204,153,255,0.15)", "border": "#cc99ff", "label": "Engage" },
  "facts":      { "bg": "rgba(253,233,195,0.15)", "border": "#fde9c3", "label": "Facts" },
  "regulation": { "bg": "rgba(255,107,107,0.15)", "border": "#ff6b6b", "label": "Regulation" },
  "studies":    { "bg": "rgba(100,200,255,0.15)", "border": "#64c8ff", "label": "Studies" }
}
```

Replace segment IDs and colors with brand-specific values from the brand
config.

## Calendar View Specification

### Month Grid Layout

```
+------+------+------+------+------+------+------+
| Mon  | Tue  | Wed  | Thu  | Fri  | Sat  | Sun  |
+------+------+------+------+------+------+------+
|      | [N]  | [F]  |      | [R]  | [E]  |      |  Week 1
|      |  2   |  1   |      |  1   |  1   |      |
+------+------+------+------+------+------+------+
| [R]  | [N]  | [F]  | [N]  | [R]  | [E]  |      |  Week 2
|  1   |  1   |  1   |  1   |  2   |  1   |      |
+------+------+------+------+------+------+------+
```

Each cell shows:
- Segment badge(s) with color coding: `[N]` = News, `[E]` = Engage, etc.
- Post count per segment
- Post thumbnail strip (up to 3 thumbnails, overflow shows `+N`)

### Cell Interactions

| Action | Result |
|---|---|
| Click cell | Expand to show all posts for that day in a popover |
| Click post in popover | Open the Detail Modal for that post |
| Drag post to different cell | Reschedule (update `scheduled_for`) |
| Click empty cell + "Add" | Open the Creator with the date pre-set |

### Navigation

- Month/Week toggle
- Previous/Next month arrows
- "Today" button
- Segment filter (show/hide specific segments)

## Cron Schedule Template

Map content segments to publishing days. The n8n cron triggers are set to
match this schedule.

```yaml
schedule:
  monday:
    - segment: regulation
      time: "10:00 EST"
  tuesday:
    - segment: news
      time: "10:00 EST"
  wednesday:
    - segment: facts
      time: "10:00 EST"
  thursday:
    - segment: news
      time: "10:00 EST"
  friday:
    - segment: regulation
      time: "10:00 EST"
  saturday:
    - segment: engage
      time: "12:00 EST"
  sunday: []  # no scheduled posts
```

## Calendar State Machine

Each post on the calendar moves through these states:

```
[Draft] --> [Scheduled] --> [Approved] --> [Published]
   |             |              |
   v             v              v
[Deleted]   [Rescheduled]  [Failed]
                                |
                                v
                           [Retry Queue]
```

- **Draft**: Created but no schedule date. Shows in "Pending" tab only.
- **Scheduled**: Has a `scheduled_for` date. Appears on calendar at that date.
- **Approved**: Editor has approved. Cron will pick it up at scheduled time.
- **Published**: Successfully posted to all platforms.
- **Failed**: At least one platform returned an error. Stored in
  `publish_result` for review.
- **Retry Queue**: Failed posts queued for manual or automatic retry.

## Supabase Query Patterns

### Fetch posts for a calendar month

```javascript
const { data } = await supabase
  .from('posts')
  .select('id, headline, img, system, status, assignee, scheduled_for, published_at, created_at')
  .or(`scheduled_for.gte.${monthStart},published_at.gte.${monthStart}`)
  .or(`scheduled_for.lte.${monthEnd},published_at.lte.${monthEnd}`)
  .order('scheduled_for', { ascending: true });
```

### Reschedule a post (drag-and-drop)

```javascript
await supabase
  .from('posts')
  .update({ scheduled_for: newDate })
  .eq('id', postId);
```

### Fetch the next post for cron publishing

```javascript
const { data } = await supabase
  .from('posts')
  .select('*')
  .eq('system', segmentId)
  .eq('status', 'approved')
  .lte('scheduled_for', new Date().toISOString())
  .order('scheduled_for', { ascending: true })
  .limit(1)
  .single();
```
