---
name: cloning
description: >
  Clones any website into fully editable local files with full JavaScript
  rendering, CSS animations, and asset extraction. Handles static sites,
  SPAs, Webflow, Framer, Squarespace, and JS-rendered pages using SingleFile
  CLI and Puppeteer. Use when cloning a website, downloading a site for
  editing, rebranding, creating templates, or when user mentions clone,
  download site, or copy site.
last_updated: 2026-04
owner: Frank
---

# Website Cloning

**Clone any website — static or dynamic — into a faithful, working local copy.**

> **Owner Context:** Core rapid prototyping workflow. Clone → customize → deploy. Works on everything: static HTML, WordPress, Webflow, Framer, Squarespace, React SPAs, and JS-rendered sites with animations.

---

## ⛔ STOP — Before Cloning

Determine:

1. **URL?** — The exact page or site to clone
2. **Purpose?** — Rebrand, template, learn, extract components, A/B test
3. **Scope?** — Full site, single page, just styles, specific sections
4. **Legal context?** — Own property, licensed, learning reference, client work

---

## Strategy Decision Tree

```
What do you need?
│
├── Single page, pixel-perfect, working offline?
│   └── STRATEGY A: SingleFile CLI (single faithful HTML file)
│
├── Full multi-page site, all pages cloned?
│   └── STRATEGY A with --crawl-links=true
│
├── Editable separate files (CSS/JS/images split out)?
│   └── STRATEGY B: Puppeteer Resource Capture
│
├── Simple static site, fast grab?
│   └── STRATEGY C: wget mirror
│
└── Not sure?
    └── Start with Strategy A. It works on everything.
```

| Strategy | Tool | Renders JS? | Captures Animations? | Output |
|----------|------|-------------|---------------------|--------|
| **A: SingleFile** | SingleFile CLI | ✅ Yes | ✅ Yes | Single self-contained HTML per page |
| **B: Puppeteer Capture** | Custom Puppeteer script | ✅ Yes | ✅ Yes | Separate HTML/CSS/JS/image files |
| **C: wget** | GNU wget | ❌ No | ⚠️ CSS only | Mirrored file structure |

---

## Strategy A: SingleFile CLI (Recommended)

**The gold standard.** Launches a real browser, renders the full page including
all JavaScript, waits for animations and lazy-loaded content, then saves a
**faithful, working copy** as a single HTML file with all CSS, JS, images, and
fonts embedded.

### Install (One-Time)

```bash
# Install via npm (requires Deno + Chrome/Chromium installed)
npm install -g single-file-cli

# Or run without installing
npx single-file-cli --help
```

> **Requires:** Deno runtime (`brew install deno` on macOS) and Chrome/Chromium
> installed in the default location. If Chrome is elsewhere, use
> `--browser-executable-path=/path/to/chrome`.

### Clone a Single Page

```bash
npx single-file-cli \
  "https://www.rihannanow.com" \
  rihanna-homepage.html \
  --browser-wait-until=networkidle0 \
  --browser-wait-delay=3000
```

This produces ONE self-contained HTML file that:
- Renders identically to the live site
- All CSS is inlined (including animations, @keyframes, transitions)
- All images are embedded as data URIs
- All fonts are embedded
- All JS is captured
- Works offline — just open the file in a browser

### Clone an Entire Site (Crawl Internal Pages)

```bash
npx single-file-cli \
  "https://www.rihannanow.com" \
  --crawl-links=true \
  --crawl-inner-links-only=true \
  --crawl-max-depth=2 \
  --crawl-rewrite-rule="^(.*)\?.*$ $1" \
  --browser-wait-until=networkidle0 \
  --browser-wait-delay=3000 \
  --dump-content=false
```

This produces one HTML file per page, named by URL path. Each file is
self-contained and works independently.

### Key Options

| Option | Purpose |
|--------|---------|
| `--browser-wait-until=networkidle0` | Wait for all network requests to finish |
| `--browser-wait-delay=3000` | Extra delay (ms) after load for animations/lazy content |
| `--crawl-links=true` | Follow and clone internal links |
| `--crawl-inner-links-only=true` | Stay on the same domain |
| `--crawl-max-depth=2` | How deep to follow links |
| `--dump-content=false` | Save to files instead of stdout |
| `--browser-executable-path=...` | Path to Chrome if not in default location |
| `--crawl-rewrite-rule="^(.*)\?.*$ $1"` | Strip query params from URLs |

### Verify the Clone

```bash
# Open directly
open rihanna-homepage.html

# Or serve with a local server (better for multi-page crawls)
npx -y serve .
```

**If the page looks identical to the original — the clone is complete.**

---

## Strategy B: Puppeteer Resource Capture (Editable Files)

When you need separate, editable CSS/JS/image files instead of a single
monolithic HTML. Uses Puppeteer to render the page in a real browser, intercepts
every network response, and saves each resource to disk with proper directory
structure. Then rewrites all URLs in the HTML to point to local files.

### Setup (One-Time)

```bash
mkdir -p ~/tools/site-cloner && cd ~/tools/site-cloner
npm init -y
npm install puppeteer cheerio fs-extra
```

### The Clone Script

Create `clone-editable.mjs`:

```javascript
#!/usr/bin/env node
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import fsExtra from 'fs-extra';
import path from 'path';
import { URL } from 'url';
import crypto from 'crypto';

const targetUrl = process.argv[2];
const projectName = process.argv[3] || 'cloned-site';

if (!targetUrl) {
  console.log('Usage: node clone-editable.mjs <url> [project-name]');
  process.exit(0);
}

const outputDir = path.resolve(projectName);
const assetsDir = path.join(outputDir, 'assets');
await fsExtra.ensureDir(assetsDir);

console.log(`\n🎯 Cloning: ${targetUrl}`);
console.log(`📂 Output:  ${projectName}\n`);

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
await page.setUserAgent(
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
);

// ── Intercept and save all responses ─────────────────────
const urlToLocal = new Map();

page.on('response', async (response) => {
  const url = response.url();
  const status = response.status();
  if (status < 200 || status >= 300) return;

  const contentType = response.headers()['content-type'] || '';
  // Skip non-asset content types
  if (contentType.includes('text/html')) return;

  try {
    const buffer = await response.buffer();
    const urlObj = new URL(url);
    let filename = urlObj.pathname.split('/').pop() || 'asset';
    // Deduplicate with hash if needed
    if (urlToLocal.has(url)) return;
    const hash = crypto.createHash('md5').update(url).digest('hex').slice(0, 8);
    const ext = path.extname(filename) || guessExt(contentType);
    filename = `${path.basename(filename, ext)}-${hash}${ext}`;

    const localPath = path.join(assetsDir, filename);
    await fsExtra.writeFile(localPath, buffer);
    urlToLocal.set(url, `assets/${filename}`);
    console.log(`   ✓ ${filename}`);
  } catch {
    // Some responses can't be buffered (e.g., streaming)
  }
});

// ── Navigate and wait ────────────────────────────────────
console.log('⏳ Loading page in headless browser...\n');
await page.goto(targetUrl, { waitUntil: 'networkidle0', timeout: 60000 });

// Scroll to trigger lazy content
await page.evaluate(async () => {
  await new Promise((resolve) => {
    let total = 0;
    const timer = setInterval(() => {
      window.scrollBy(0, 300);
      total += 300;
      if (total >= document.body.scrollHeight) {
        clearInterval(timer);
        resolve();
      }
    }, 100);
  });
});
await new Promise((r) => setTimeout(r, 3000)); // Wait for lazy assets

// ── Get the fully rendered HTML ──────────────────────────
let html = await page.content();
await browser.close();

// ── Rewrite asset URLs to local paths ────────────────────
const $ = cheerio.load(html);

// Rewrite src, href, srcset, poster, data-src attributes
const attrs = ['src', 'href', 'srcset', 'poster', 'data-src', 'data-lazy-src'];
$('*').each((_, el) => {
  for (const attr of attrs) {
    const val = $(el).attr(attr);
    if (val && urlToLocal.has(val)) {
      $(el).attr(attr, urlToLocal.get(val));
    }
  }
});

// Rewrite url() in inline styles
$('[style]').each((_, el) => {
  let style = $(el).attr('style');
  for (const [orig, local] of urlToLocal) {
    style = style.replaceAll(orig, local);
  }
  $(el).attr('style', style);
});

// Rewrite url() in <style> blocks
$('style').each((_, el) => {
  let css = $(el).html();
  for (const [orig, local] of urlToLocal) {
    css = css.replaceAll(orig, local);
  }
  $(el).html(css);
});

html = $.html();
await fsExtra.writeFile(path.join(outputDir, 'index.html'), html);

// ── Summary ──────────────────────────────────────────────
const assets = await fsExtra.readdir(assetsDir);
const countExt = (ext) => assets.filter((f) => f.endsWith(ext)).length;

console.log(`
╔══════════════════════════════════════════════╗
║              ✅ CLONE COMPLETE               ║
╚══════════════════════════════════════════════╝

📂 ${projectName}/
├── index.html       ← EDIT THIS
└── assets/          ← ${assets.length} files
    CSS:    ${countExt('.css')}
    JS:     ${countExt('.js')}
    Images: ${countExt('.png') + countExt('.jpg') + countExt('.svg') + countExt('.webp') + countExt('.gif')}
    Fonts:  ${countExt('.woff') + countExt('.woff2') + countExt('.ttf') + countExt('.otf')}

🚀 Preview:  npx -y serve ${projectName}
`);

function guessExt(ct) {
  if (ct.includes('css')) return '.css';
  if (ct.includes('javascript')) return '.js';
  if (ct.includes('png')) return '.png';
  if (ct.includes('jpeg') || ct.includes('jpg')) return '.jpg';
  if (ct.includes('svg')) return '.svg';
  if (ct.includes('webp')) return '.webp';
  if (ct.includes('gif')) return '.gif';
  if (ct.includes('woff2')) return '.woff2';
  if (ct.includes('woff')) return '.woff';
  if (ct.includes('ttf') || ct.includes('font')) return '.ttf';
  if (ct.includes('json')) return '.json';
  return '';
}
```

### Run

```bash
cd ~/tools/site-cloner
node clone-editable.mjs https://www.rihannanow.com rihanna-clone
```

### Result

```
rihanna-clone/
├── index.html       ← Fully rendered HTML with local asset paths
└── assets/          ← All CSS, JS, images, fonts as separate files
```

Every asset is a separate editable file. The HTML references them via
relative `assets/` paths.

---

## Strategy C: wget Mirror (Static Sites Only)

For simple static sites where HTML contains the actual content.

```bash
wget --mirror \
     --convert-links \
     --adjust-extension \
     --page-requisites \
     --no-parent \
     --no-host-directories \
     --directory-prefix=my-clone \
     -e robots=off \
     -U "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" \
     https://example.com
```

**If the result looks empty or broken**, the site is JS-rendered.
Switch to Strategy A or B.

---

## Post-Clone: Editing for Rebrand

### Replace Names

```bash
cd my-clone
find . -type f \( -name "*.html" -o -name "*.css" -o -name "*.js" \) \
  -exec sed -i '' 's/Original Name/Your Name/g' {} \;
```

### Replace Colors

```bash
find . -name "*.css" -o -name "*.html" | \
  xargs sed -i '' 's/#OLD_HEX/#NEW_HEX/g'
```

### Swap Images

```bash
# Find all image references
grep -roh 'src="[^"]*\.\(png\|jpg\|svg\|webp\)"' *.html | sort -u

# Replace specific images
cp ~/your-logo.png assets/logo.png
```

### Strip Tracking Scripts

```bash
grep -n "google-analytics\|gtag\|fbq\|hotjar\|intercom" *.html
# Remove the matched script blocks
```

---

## Animation Extraction (After Clone)

```bash
# Detect what animation libraries the site uses
grep -rl "gsap\|TweenMax\|ScrollTrigger" assets/ 2>/dev/null && echo "→ GSAP"
grep -rl "lottie\|bodymovin" assets/ 2>/dev/null && echo "→ Lottie"
grep -rl "@keyframes" assets/ 2>/dev/null && echo "→ CSS Animations"
grep -rl "IntersectionObserver\|scrollY" assets/ 2>/dev/null && echo "→ Scroll Effects"
```

---

## Anti-Bot Escalation

```
Clone blocked?
│
├── 403 / Empty? → Add --browser-args="--proxy-server=..."
├── Cloudflare? → SingleFile handles most challenges automatically
├── CAPTCHA? → Manual: open in browser → Cmd+S "Webpage, Complete"
└── Rate limited? → Add --browser-wait-delay=5000 between pages
```

---

## Deploy the Clone

| Platform | Command |
|----------|---------|
| **Vercel** | `vercel --prod` |
| **Cloudflare Pages** | `wrangler pages deploy my-clone` |
| **Netlify** | Drag folder to web interface |
| **GitHub Pages** | Push to `gh-pages` branch |

---

## ⛔ STOP GATE — Clone Verification

DO NOT consider a clone complete without:

1. **Open the file** — it renders in a browser
2. **Visual match** — layout, colors, fonts, images match the original
3. **Animations work** — CSS transitions, hover effects, scroll animations play
4. **Navigation works** — internal links load (for multi-page crawls)
5. **Content present** — all text, images, sections visible (not empty divs)

If any check fails, the wrong strategy was used. Escalate.

---

## Related Skills

- [animation-designing](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.agents/skills/animation-designing/SKILL.md) — Modify cloned animations
- [experience-designing](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.agents/skills/experience-designing/SKILL.md) — Extract design tokens
- [deploying](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.agents/skills/deploying/SKILL.md) — Deploy to production
- [code-cleaning](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.agents/skills/code-cleaning/SKILL.md) — Clean up cloned code

---

## Quick Reference

```bash
# Clone single page (faithful copy, everything embedded)
npx single-file-cli "https://example.com" clone.html --browser-wait-until=networkidle0

# Clone entire site (one file per page)
npx single-file-cli "https://example.com" --crawl-links=true --crawl-inner-links-only=true --dump-content=false

# Clone with editable separate files
node clone-editable.mjs https://example.com my-clone

# Static site fast clone
wget --mirror --convert-links --page-requisites --no-parent -P my-clone https://example.com
```
