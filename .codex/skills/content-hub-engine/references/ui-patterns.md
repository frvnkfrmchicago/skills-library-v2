# UI Patterns

Layout specifications and interaction patterns for the content hub curation
interface. Use the `component-building` and `experience-designing` skills to
implement these patterns.

## Overall Layout

```
+--sidebar--+--main-area-----------------------------------+
|            |                                               |
|  [Logo]    |  [Header: View tabs + User menu]             |
|            |                                               |
|  Compose   |  +--status-tabs-----------------------------+ |
|  Calendar  |  | Pending | Approved | Published           | |
|  Ideate    |  +------------------------------------------+ |
|  Listen    |  |                                          | |
|  Discover  |  |  [Post Grid]                             | |
|  Measure   |  |  +------+ +------+ +------+ +------+    | |
|  Inbox     |  |  | Card | | Card | | Card | | Card |    | |
|  Reports   |  |  +------+ +------+ +------+ +------+    | |
|  Team      |  |  +------+ +------+ +------+ +------+    | |
|  Tasks     |  |  | Card | | Card | | Card | | Card |    | |
|  Meetings  |  |  +------+ +------+ +------+ +------+    | |
|  Assets    |  |                                          | |
|            |  +------------------------------------------+ |
+------------+-----------------------------------------------+
```

### Sidebar

- Fixed left panel, 240px wide
- Dark surface background with brand accent on active item
- Navigation items with icon + label
- "Generate Posts" action button at top (opens Batch Generator modal)
- "New Post" action button (opens Creator modal)
- Collapsible on mobile (hamburger menu)

### Header Bar

- Horizontal tab row for view switching
- User avatar + name dropdown (right-aligned)
- Notification bell with unread count

## Post Card Component

Each card in the grid displays a post preview.

```
+--card (180px x 260px)----+
|                           |
|  [Baked Image]            |
|  (full width, 60% height)|
|                           |
|  [Segment Badge]  [Time] |
|  [Headline Preview]      |
|  (2 lines, truncated)    |
|                           |
|  [Avatar] [Assignee]     |
|  [Status dot]            |
+---------------------------+
```

### Card States

| State | Visual Treatment |
|---|---|
| Pending | Default card, amber status dot |
| Approved | Subtle mint border glow, green status dot |
| Published | Full mint border, checkmark icon, green dot |
| Selected (bulk) | Purple border, checkbox visible |
| Hover | Lift shadow, scale 1.02, cursor pointer |

### Card Interactions

| Action | Result |
|---|---|
| Click | Open Detail Modal |
| Long press / right-click | Show context menu (Edit, Delete, Assign, Change Status) |
| Checkbox click | Toggle bulk selection |
| Drag | Reorder within grid (optional) |

## Detail Modal

Split-panel modal overlay with post preview and editing controls.

```
+--modal (90vw x 85vh)----------------------------------------------+
|  [Back button]                                                      |
|                                                                     |
|  +--left-panel (50%)--+  +--right-panel (50%)-------------------+  |
|  |                     |  |                                      |  |
|  |  [Full Post Image]  |  |  [Status Badge]  [Edit in Creator]  |  |
|  |  (aspect-fit)       |  |                                      |  |
|  |                     |  |  Headline: [editable field]          |  |
|  |                     |  |  Caption:  [editable textarea]       |  |
|  |                     |  |  Tags:     [editable field]          |  |
|  |                     |  |  Segment:  [dropdown]                |  |
|  |                     |  |  Assignee: [dropdown]                |  |
|  |                     |  |                                      |  |
|  |                     |  |  [Image Prompt] (collapsible)        |  |
|  |                     |  |                                      |  |
|  |                     |  |  +--actions-row--+                   |  |
|  |                     |  |  | Approve | Reject | Publish |     |  |
|  |                     |  |  +----------------+                  |  |
|  |                     |  |                                      |  |
|  |                     |  |  +--comments--+                      |  |
|  |                     |  |  | [Comment 1] |                     |  |
|  |                     |  |  | [Comment 2] |                     |  |
|  |                     |  |  | [Add comment input] |             |  |
|  |                     |  |  +--------------+                    |  |
|  +---------------------+  +--------------------------------------+  |
+---------------------------------------------------------------------+
```

### Status Actions

| Current Status | Available Actions |
|---|---|
| Pending | Approve, Delete, Edit in Creator |
| Approved | Publish, Reject (back to Pending), Edit in Creator |
| Published | View publish results, Re-publish |

### Publish Flow

When the editor clicks "Publish":

1. Show confirmation dialog with platform checklist
2. On confirm, POST to the social webhook with post ID
3. Show a progress spinner per platform
4. Update status to "Published" on success
5. Show per-platform results (success/error) in the publish_result section

## Visual Creator (Canvas)

Full-screen modal with live preview and editing controls.

### Canvas Area (Left 60%)

```
+--canvas-area------------------------------+
|                                             |
|  +--post-frame (variable dimensions)-----+ |
|  |                                        | |
|  |  [Background Image]  (draggable)       | |
|  |                                        | |
|  |  [Gradient Overlay]                    | |
|  |                                        | |
|  |  [Brand Handle] (@handle)             | |
|  |                                        | |
|  |  [Logo]  (draggable)                  | |
|  |                                        | |
|  |  [Headline Text]  (draggable +        | |
|  |   contenteditable, double-click word  | |
|  |   to toggle accent highlight)         | |
|  |                                        | |
|  +----------------------------------------+ |
|                                             |
+---------------------------------------------+
```

### Canvas Interactions

| Element | Drag | Click | Double-click | Scroll |
|---|---|---|---|---|
| Background | Move position | -- | -- | Resize (scale) |
| Logo | Move position | -- | -- | -- |
| Headline wrapper | Move position | -- | -- | -- |
| Headline text | -- | Place cursor | Toggle word highlight | -- |

### Controls Panel (Right 40%)

Two tabs: Design and AI.

**Design Tab:**

```
[Segment dropdown]

Dimensions:
[1:1] [4:5] [16:9] [9:16]
[Center logo and headline button]

Background:
[Upload area (click, paste, or drop)]
[Or paste URL field]

Image Prompt:
[Image focus: Auto | Person | Product | Place | Scene]
[Prompt textarea (auto-fills from post)]
[Make Image in ChatGPT] [Make Image in Gemini]
[Different option button]

Headline:
[Headline textarea (syncs with canvas)]
[Suggest a different title button]
[Word highlight picker (tap words to toggle)]
[Font size slider: 16px - 60px]

Caption:
[Caption textarea]
[Preview Threads version button]

Hashtags:
[Search field with curated suggestion chips]
[Tag input field (comma-separated)]
[Tag preview strip]

Image Scale:
[Scale slider: 50% - 250%]

Gradient:
[Color: Purple | Black | Custom picker]
[Darkness slider: 0% - 100%]
[Height slider: 20% - 90%]

[Save and Queue for Review button]
```

**AI Tab:**

```
[One-Click Full Post section]
  [Topic input field]
  [Generate Full Post button]
  [Open ChatGPT side-dock button]

[AI Chat section]
  [Chat header: AI Assistant - Model badge]
  [Message history (scrollable)]
  [Quick action buttons: Headlines | Caption | Hashtags | News]
  [Chat input + Send button]
```

## Batch Generator Modal

Overlay modal for generating multiple posts at once.

```
+--batch-modal (520px wide)--------------------+
|  [Close button]                               |
|                                               |
|  "Generate Posts"                              |
|  [Subtitle: description]                      |
|                                               |
|  [Topic input: free text field]               |
|                                               |
|  "Or tap topics"                              |
|  [Topic category chips]                       |
|    [Legislation] [Market Data] [Culture]      |
|    [Science] [Events] [Social Equity]         |
|    [Terpenes] [Beverages] [Banking]           |
|                                               |
|  "Assign to"                                  |
|  [Assignee dropdown]                          |
|                                               |
|  "How many"                                   |
|  [1] [5] [10] [20] [Custom input]             |
|                                               |
|  [Progress bar] (hidden until generating)     |
|  [Progress text: "Generating post X of N"]    |
|                                               |
|  [Generated post tray] (hidden until done)    |
|  +--post-card--+ +--post-card--+              |
|  | [Thumbnail] | | [Thumbnail] |              |
|  | [Headline]  | | [Headline]  |              |
|  | [Accept]    | | [Accept]    |              |
|  +-------------+ +-------------+              |
|                                               |
|  [Generate button] [Cancel button]            |
+-----------------------------------------------+
```

### Batch Progress States

| State | UI |
|---|---|
| Idle | Generate button enabled, progress hidden |
| Generating | Button disabled + "Generating...", progress bar visible |
| Per-post update | "Generating post X of N", bar width = X/N * 100% |
| Complete | Progress text: "Done! Generated X posts", tray shows results |
| Error (partial) | "Generated X of N (Y failed)", failed posts show error |
| Cancelled | "Cancelled. X posts generated before stopping." |

## Bulk Selection Bar

Appears when one or more posts are selected via checkbox.

```
+--bulk-bar (sticky, bottom of grid)---------------------------------+
| [X selected] [Select All] [Delete Selected] [Clear Selection]      |
+--------------------------------------------------------------------+
```

## Responsive Behavior

| Breakpoint | Layout Change |
|---|---|
| Desktop (1200px+) | Full sidebar + grid layout |
| Tablet (768-1199px) | Collapsed sidebar (icons only), fewer grid columns |
| Mobile (below 768px) | Sidebar becomes bottom nav, single column grid |
| Creator mobile | Controls panel below canvas (stacked), scrollable |
| Detail modal mobile | Left/right panels stack vertically |

## Micro-Interactions

Apply these using the `animation-designing` skill:

| Element | Interaction | Animation |
|---|---|---|
| Post card | Hover | translateY(-2px), box-shadow increase, 200ms ease |
| Status change | Click approve/reject | Button pulse, status dot color transition 300ms |
| Field auto-fill | AI applies content | Green glow box-shadow flash, 1200ms fade |
| Batch progress | Each post completes | Bar width transition 300ms, count text update |
| Modal open | Click card | Fade in overlay 200ms, scale content 0.95 to 1.0 |
| Modal close | Click backdrop/back | Reverse of open |
| Hashtag chip | Click to add | Scale 0.9 to 1.0, slight bounce |
| Canvas drag | Mousedown | Cursor changes to "grabbing" |
| Word highlight | Double-click | Word wraps in accent-color span, instant |

## Empty States

| View | Empty State Content |
|---|---|
| Post grid (no posts) | "No posts yet. Click Generate Posts to create content with AI." |
| Comments (no comments) | "No comments yet. Be the first to share feedback." |
| Calendar (empty day) | Click to add a post |
| Search (no results) | "No posts match your search." |
