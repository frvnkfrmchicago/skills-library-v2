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
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
await page.setUserAgent(
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
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
