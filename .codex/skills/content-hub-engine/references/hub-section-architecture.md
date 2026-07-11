# Content Hub Section Architecture

How to add a new tab/section to the GrazzHopper Content Hub standalone
dashboard at `~/Documents/Automation Centre/grazzhopper-content-hub/`.

## Files to Edit

| File | What to change |
|------|----------------|
| `gh-content-hub.html` | Tab button + view div |
| `gh-hub.js` | Registry entries + hide-array entries + render function |

## Step-by-Step

### 1. Add tab button in HTML

In `gh-content-hub.html`, find the `#hubTopBar` div (search `hubTopBar`).
Add a new `<button>` inside it, before the closing `</div>`:

```html
<button class="hub-tab" data-sec="yoursection" onclick="ghShowSection('yoursection',this)">Your Label</button>
```

### 2. Add view div in HTML

Find the other view divs (search `viewAssets` or `viewMeetings`). Add after
the last one, before the closing `</div></div>`:

```html
<div id="viewYoursection" class="hub-view hidden"></div>
```

**Naming convention:** `view` + section name with first letter capitalized.
For section name `notes` → `viewNotes`. For `teamops` → `viewTeamops`.

### 3. Register in JS — section maps

In `gh-hub.js`, update both registry objects (around line 206-207):

```js
var GH_SECTION_RENDER = {
  // ...existing entries...
  yoursection: "renderYoursection"
};

var GH_SECTION_TITLE = {
  // ...existing entries...
  yoursection: "Your Section Title"
};
```

### 4. Register in JS — hide arrays

There are TWO hide arrays that must include your view ID. Both live in
`gh-hub.js`:

1. Inside `ghEnsureCompose()` (resets to compose view)
2. Inside `ghShowSection()` (hides all views before showing the target)

Add `"viewYoursection"` to both arrays:

```js
["viewIdeate","viewDiscover","viewContent","viewTeamops","viewReports",
 "viewTeam","viewMeetings","viewAssets","viewYoursection"]
```

### 5. Write the render function

At the end of `gh-hub.js`, add your render function on the `window` object:

```js
window.renderYoursection = function(el) {
  // Build HTML string
  var h = '<div>...your content...</div>';
  el.innerHTML = h;
};
```

The function receives the view div element. Build an HTML string and set
`el.innerHTML`. Follow the existing style:
- Inline styles using the hub's color system (`#33fecc`, `#cc99ff`, `#fde9c3`,
  `#0a0412`, `#0f0818`)
- `font-family: Inter, sans-serif` for body text
- `font-family: Permanent Marker, cursive` for tab-level headings
- Glass panels: `background: rgba(15,8,24,.55)` with `border-radius: 16px`

## Section Name → DOM ID Mapping

| Section name | View div ID | Render function |
|-------------|-------------|-----------------|
| `compose` | `composeArea` (special — not a view div) | N/A (inline) |
| `ideate` | `viewIdeate` | `renderIdeate` |
| `discover` | `viewDiscover` | `renderDiscover` |
| `content` | `viewContent` | `renderContentCenter` |
| `teamops` | `viewTeamops` | `renderTeamOps` |
| `reports` | `viewReports` | `renderReports` |
| `team` | `viewTeam` | `renderTeam` |
| `meetings` | `viewMeetings` | `renderMeetings` |
| `assets` | `viewAssets` | `renderAssets` |
| `notes` | `viewNotes` | `renderNotes` |

## Existing Sections (top nav)

Posts → Content Center → Ideas → Discover → Past Posts → Platform Notes

## Render Function Data Schema

Sections use a `SECTIONS` array of objects. Each object has:

```js
{
  id: "section-name",        // matches data-nid for toggle
  accent: "#hexcolor",       // accent color for headers, borders, bullets
  title: "Display Title",
  sub: "Short description line",
  tldr: ["Bullet point 1", "Bullet point 2", "..."],
  tables: [
    {
      title: "Table Heading",   // rendered as bold label above table
      headers: ["Col1", "Col2"],// table header row
      rows: [                   // array of row arrays
        ["cell1", "cell2"],
        ["cell1", "cell2"]
      ]
    }
  ]
}
```

**Legacy format note:** Some older render functions used `cap` (instead of
`title`), `h` (instead of `headers`), and `r` (instead of `rows`). The
current rendering code handles both via fallback: `(tb.title || tb.cap)`,
`(tb.headers || tb.h || [])`, `(tb.rows || tb.r || [])`. Always use the new
format (`title`/`headers`/`rows`) for new sections.

## Pitfalls

- **Forget one of the two hide arrays** and the old view stays visible when
  switching to your new section. Both `ghEnsureCompose` and `ghShowSection`
  have identical arrays that must match.
- **Wrong view div ID casing.** The convention is `view` + firstCharUpper +
  restLower. `notes` → `viewNotes` (not `viewnotes`).
- **Render function not on `window`.** The dispatcher does
  `window[GH_SECTION_RENDER[name]]` — if you declare with `function` keyword
  inside a module scope instead of `window.xxx = function`, it won't be found.
- **Adding content to the wrong project.** The Content Hub is a standalone
  HTML file, NOT the Next.js app. See the CRITICAL warning in SKILL.md.
- **Bracket mismatch in large inline data blocks.** When a render function
  contains a `SECTIONS` array with 100+ lines of table data, bracket counting
  errors (extra/missing `]` or `}`) cause silent parse failures — the function
  won't load and `typeof window.renderX` returns `undefined`. Fix: count
  brackets over the suspect range with `awk 'NR>=X && NR<=Y' file | tr -cd
  '[{}]' | fold -w1 | sort | uniq -c` to find the mismatch before patching.
  Do NOT read file boundaries in a loop — count first, then do ONE clean
  replacement.
- **Looping on file reads instead of executing.** When patching a large render
  function (100+ lines of inline data), do NOT read file boundaries repeatedly
  trying to find the exact start/end lines. This wastes turns and frustrates
  Frank. Instead: (a) use `patch` with enough surrounding context for a unique
  match, or (b) use `execute_code` with Python to read the file, splice the
  new content by character index, and write it back in ONE operation. If a
  patch fails twice, switch strategies — don't re-read the same lines.
- **Syntax errors cascade.** A bracket mismatch in `renderNotes` (line 2700+)
  will prevent ALL functions defined after it from loading. If
  `typeof window.renderNotes` returns `undefined` in the browser console, the
  JS file has a parse error somewhere above that function. Open the browser
  console for the exact line number before trying file-level fixes.
- **Old format vs new format in render functions.** If a render function's
  loop references `tb.cap`/`tb.h`/`tb.r` but your data uses `title`/`headers`/
  `rows` (or vice versa), the table renders without headers or data. Use
  the fallback pattern: `(tb.title || tb.cap || '')`.
