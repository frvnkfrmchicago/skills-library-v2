/* ═══ IMAGE OPTIMIZER — PNG/JPG → WebP ═══
 *
 * Walks `public/images/` and `src/assets/`, finds every PNG/JPG above the
 * threshold, and writes a WebP sibling using `cwebp` (libwebp). Smaller
 * images are skipped so we don't waste bytes on Twitter avatars and the
 * like.
 *
 * Usage (from project root):
 *   bun run scripts/optimize-images.ts
 *
 * Requires `cwebp` on PATH. On macOS:  brew install webp
 * On Linux (apt):                       apt install webp
 *
 * Lossless mode is used for logo-style PNGs (≤ 256KB) to preserve sharp
 * edges; lossy q=82 is used for larger photographic content. This is the
 * same trade-off web.dev recommends in 2026.
 *
 * See:  https://web.dev/articles/serve-images-webp
 *       https://developers.google.com/speed/webp/docs/cwebp
 */

import { readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname, basename, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOTS = [
  'public/images',
  'src/assets',
];

const MIN_BYTES = 50 * 1024; // skip < 50KB — overhead not worth it
const LOSSY_QUALITY = 82; // q=82 is the web.dev recommended sweet spot for photographic content
const LOGO_HINT_BYTES = 64 * 1024; // < 64KB → tiny logo/icon, use mid-quality (q=88) and tight effort

type Stat = { converted: number; skipped: number; savedBytes: number };

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const s = statSync(full);
    if (s.isDirectory()) walk(full, out);
    else if (/\.(png|jpg|jpeg)$/i.test(name)) out.push(full);
  }
  return out;
}

function convertOne(input: string, stat: Stat): void {
  const size = statSync(input).size;
  if (size < MIN_BYTES) {
    stat.skipped++;
    return;
  }
  const out = join(dirname(input), basename(input, extname(input)) + '.webp');
  if (existsSync(out) && statSync(out).mtimeMs >= statSync(input).mtimeMs) {
    stat.skipped++;
    return;
  }
  // Lossy is almost always smaller than lossless for site PNGs at this scale.
  // Tiny logo/icon images get a slightly higher quality (q=88) to preserve
  // sharp edges. Larger photographic content uses the canonical q=82.
  const quality = size <= LOGO_HINT_BYTES ? 88 : LOSSY_QUALITY;
  const args = ['-q', String(quality), '-m', '6', input, '-o', out];
  const r = spawnSync('cwebp', args, { stdio: 'pipe' });
  if (r.status !== 0) {
    console.error(`[optimize-images] cwebp failed for ${input}:`, r.stderr?.toString());
    return;
  }
  const newSize = statSync(out).size;
  stat.savedBytes += size - newSize;
  stat.converted++;
  const pct = ((1 - newSize / size) * 100).toFixed(1);
  console.log(`  ${input}  (${(size / 1024).toFixed(0)}KB → ${(newSize / 1024).toFixed(0)}KB, -${pct}%)`);
}

function main() {
  console.log('[optimize-images] starting…');
  const stat: Stat = { converted: 0, skipped: 0, savedBytes: 0 };
  for (const root of ROOTS) {
    const files = walk(root);
    if (!files.length) {
      console.log(`[optimize-images] no images in ${root}`);
      continue;
    }
    console.log(`[optimize-images] ${root}  (${files.length} candidates)`);
    for (const file of files) convertOne(file, stat);
  }
  console.log('[optimize-images] done.');
  console.log(`  converted: ${stat.converted}`);
  console.log(`  skipped:   ${stat.skipped}`);
  console.log(`  saved:     ${(stat.savedBytes / (1024 * 1024)).toFixed(2)}MB`);
}

main();
