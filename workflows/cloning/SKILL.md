---
name: cloning
description: Clone any website into fully editable local files. Webflow, Framer, static sites. One command, full control.
last_updated: 2026-03
owner: Frank
---

# Website Cloning Skill

**One command to clone any website into fully editable local files.**

> **Owner Context:** This is a core part of Frank's rapid prototyping workflow. Clone → customize → deploy. Use when starting projects or adapting design references.

---

## Context Questions

Before cloning a website, ask:

1. **What's the purpose?** — Rebrand, use as template, learn from structure, create variations
2. **What parts are needed?** — Full site, single page, just styles, specific components
3. **What will be modified?** — Content only, full rebrand, structural changes, everything
4. **What's the deployment target?** — Static host, Vercel, local only, multiple destinations
5. **What's the legal context?** — Own property, licensed, learning reference, client work
6. **What's the source platform?** — Webflow, Framer, WordPress, custom static, React-based

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| Scope | Single page ←→ Full multi-page site |
| Modification | Minor edits ←→ Complete rebrand |
| Assets | Essential only ←→ All images/fonts/media |
| Automation | One-time clone ←→ Repeatable template |
| Fidelity | Approximate ←→ Pixel-perfect |
| Platform | Simple static ←→ Complex SPA (Webflow/Framer) |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Rebrand existing site | Clone full site, document all brand assets, systematic replacement |
| Template for clients | Clone once, create base, duplicate for each client |
| Learning structure | Clone, study original files, experiment freely |
| Quick landing page | Clone similar site, swap content/images, deploy |
| Component extraction | Clone, extract specific CSS/JS, integrate into project |
| A/B testing | Clone base, create variations, deploy separately |
| **Webflow site** | May need additional CSS extraction, check for webflow.js interactions |
| **Framer site** | Check for React components, may need manual recreation of interactions |
| **Animated site** | Document GSAP/Lottie animations used, clone animation files separately |

---

## Related Skills

- [gsap/SKILL.md](file:///agents/gsap/SKILL.md) — Enhance/modify cloned animations
- [seo/SKILL.md](file:///agents/seo/SKILL.md) — Optimize cloned site for search
- [deployment/SKILL.md](file:///agents/deployment/SKILL.md) — Deploy to Vercel/Netlify
- [design-system/SKILL.md](file:///agents/design-system/SKILL.md) — Extract design tokens from cloned styles
- [build-in-public/SKILL.md](file:///content/build-in-public/SKILL.md) — Document cloning journey

---

## TL;DR

```bash
node clone-website.js https://example.com my-project
cd my-project
node server.js
# → http://localhost:3000 - Edit anything
```

---

## Primary Objective
Download **[INSERT_WEBSITE_URL]** as fully editable, local files that you can freely modify, rebrand, and reuse without limitations.

## Core Philosophy
1. **Get the files fast** - Automated download process
2. **Get them clean** - Organized, readable structure
3. **Get full control** - No auto-fixes that limit your options
4. **Get out of your way** - Tools are for initial clone only, then you own it

---

## Quick Start: One Command Clone

```bash
node clone-website.js https://example.com my-project
```

That's it. Everything downloads, gets organized, server created. Then **you have complete control**.

---

## Master Clone Tool

### `clone-website.js` - All-in-One Downloader

```javascript
#!/usr/bin/env node

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

class WebsiteCloner {
  constructor(targetUrl, projectName) {
    this.targetUrl = targetUrl.replace(/\/$/, ''); // Remove trailing slash
    this.projectName = projectName;
    this.baseDir = path.join(process.cwd(), projectName);
    this.domain = new URL(targetUrl).origin;

    this.downloaded = {
      html: [],
      css: [],
      js: [],
      images: [],
      fonts: [],
      other: []
    };

    this.assetMap = new Map(); // Original URL -> Local path
  }

  async clone() {
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║      Website Cloner 3.0 - Full Control    ║');
    console.log('╚════════════════════════════════════════════╝\n');
    console.log(`🎯 Target: ${this.targetUrl}`);
    console.log(`📂 Output: ${this.projectName}\n`);

    const startTime = Date.now();

    try {
      // Step 1: Create project structure
      this.createStructure();

      // Step 2: Download and analyze homepage
      console.log('📥 Downloading homepage...');
      const html = await this.fetchUrl(this.targetUrl);
      fs.writeFileSync(path.join(this.baseDir, 'original-index.html'), html);

      // Step 3: Extract and download assets
      console.log('🔍 Extracting assets...\n');
      const assets = this.extractAssets(html);

      console.log('📥 Downloading assets...\n');
      await this.downloadAssets(assets);

      // Step 4: Discover and download pages
      console.log('\n🔗 Discovering internal pages...');
      const pages = this.extractPages(html);
      await this.downloadPages(pages);

      // Step 5: Create local version with updated paths
      console.log('\n🔧 Creating editable local version...');
      this.createLocalVersion();

      // Step 6: Generate server
      console.log('🚀 Generating server...\n');
      this.generateServer();

      // Step 7: Create documentation
      this.generateDocs(assets, pages);

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

      console.log('\n╔════════════════════════════════════════════╗');
      console.log('║              ✅ CLONE COMPLETE!            ║');
      console.log('╚════════════════════════════════════════════╝\n');

      this.printSummary(elapsed);

    } catch (error) {
      console.error('\n❌ Error:', error.message);
      process.exit(1);
    }
  }

  createStructure() {
    const dirs = [
      this.baseDir,
      path.join(this.baseDir, 'assets'),
      path.join(this.baseDir, 'assets', 'css'),
      path.join(this.baseDir, 'assets', 'js'),
      path.join(this.baseDir, 'assets', 'images'),
      path.join(this.baseDir, 'assets', 'fonts'),
      path.join(this.baseDir, 'pages')
    ];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  extractAssets(html) {
    const assets = {
      css: [],
      js: [],
      images: [],
      fonts: []
    };

    // Extract CSS
    const cssRegex = /<link[^>]*href=["']([^"']*\.css[^"']*)["'][^>]*>/gi;
    let match;
    while ((match = cssRegex.exec(html)) !== null) {
      const url = this.makeAbsolute(match[1]);
      if (!this.isThirdPartyCDN(url)) {
        assets.css.push(url);
      }
    }

    // Extract JS
    const jsRegex = /<script[^>]*src=["']([^"']*\.js[^"']*)["'][^>]*>/gi;
    while ((match = jsRegex.exec(html)) !== null) {
      const url = this.makeAbsolute(match[1]);
      if (!this.isThirdPartyCDN(url)) {
        assets.js.push(url);
      }
    }

    // Extract Images
    const imgRegex = /<img[^>]*src=["']([^"']*)["'][^>]*>/gi;
    while ((match = imgRegex.exec(html)) !== null) {
      const url = this.makeAbsolute(match[1]);
      if (!url.startsWith('data:')) {
        assets.images.push(url);
      }
    }

    // Extract background images from inline styles
    const bgRegex = /url\(['"]?([^'"()]+)['"]?\)/gi;
    while ((match = bgRegex.exec(html)) !== null) {
      const url = this.makeAbsolute(match[1]);
      if (!url.startsWith('data:') && !assets.images.includes(url)) {
        assets.images.push(url);
      }
    }

    return assets;
  }

  extractPages(html) {
    const pages = new Set();
    const linkRegex = /<a[^>]*href=["']([^"']*)["'][^>]*>/gi;
    let match;

    while ((match = linkRegex.exec(html)) !== null) {
      const href = match[1];
      if (this.isInternalPage(href)) {
        const url = this.makeAbsolute(href);
        pages.add(url);
      }
    }

    return Array.from(pages);
  }

  async downloadAssets(assets) {
    // Download CSS
    for (const url of assets.css) {
      const filename = this.urlToFilename(url, 'css');
      const localPath = path.join(this.baseDir, 'assets', 'css', filename);
      await this.download(url, localPath);
      this.assetMap.set(url, `assets/css/${filename}`);
      this.downloaded.css.push(filename);
    }

    // Download JS
    for (const url of assets.js) {
      const filename = this.urlToFilename(url, 'js');
      const localPath = path.join(this.baseDir, 'assets', 'js', filename);
      await this.download(url, localPath);
      this.assetMap.set(url, `assets/js/${filename}`);
      this.downloaded.js.push(filename);
    }

    // Download Images (first 50 to prevent massive downloads)
    const imageLimit = Math.min(assets.images.length, 50);
    for (let i = 0; i < imageLimit; i++) {
      const url = assets.images[i];
      const filename = this.urlToFilename(url, 'image');
      const localPath = path.join(this.baseDir, 'assets', 'images', filename);
      await this.download(url, localPath);
      this.assetMap.set(url, `assets/images/${filename}`);
      this.downloaded.images.push(filename);
    }

    if (assets.images.length > 50) {
      console.log(`   ⚠️  Limited to first 50 images (${assets.images.length} found)`);
    }
  }

  async downloadPages(pages) {
    const pageLimit = Math.min(pages.length, 20); // Limit to prevent excessive downloads

    for (let i = 0; i < pageLimit; i++) {
      const url = pages[i];
      const filename = this.pageUrlToFilename(url);
      const localPath = path.join(this.baseDir, 'pages', filename);

      const html = await this.fetchUrl(url);
      if (html) {
        fs.writeFileSync(localPath, html);
        this.downloaded.html.push(filename);
        console.log(`   ✓ ${url}`);
      }
    }

    if (pages.length > 20) {
      console.log(`   ⚠️  Limited to first 20 pages (${pages.length} found)`);
      console.log(`   💡 Add more pages manually if needed`);
    }
  }

  createLocalVersion() {
    // Process homepage
    let html = fs.readFileSync(path.join(this.baseDir, 'original-index.html'), 'utf8');
    html = this.replaceAssetPaths(html, 0);
    fs.writeFileSync(path.join(this.baseDir, 'index.html'), html);
    console.log('   ✓ Created editable index.html');

    // Process downloaded pages
    const pagesDir = path.join(this.baseDir, 'pages');
    if (fs.existsSync(pagesDir)) {
      const files = fs.readdirSync(pagesDir);
      files.forEach(file => {
        if (file.endsWith('.html')) {
          let pageHtml = fs.readFileSync(path.join(pagesDir, file), 'utf8');
          pageHtml = this.replaceAssetPaths(pageHtml, 1); // Depth 1 for pages/ directory
          const newName = file.replace('.html', '-local.html');
          fs.writeFileSync(path.join(pagesDir, newName), pageHtml);
        }
      });
      console.log('   ✓ Created editable page files');
    }
  }

  replaceAssetPaths(html, depth) {
    const prefix = '../'.repeat(depth);

    // Replace each mapped asset
    this.assetMap.forEach((localPath, originalUrl) => {
      const adjustedPath = prefix + localPath;
      // Try to replace both absolute and relative versions
      html = html.replace(new RegExp(this.escapeRegex(originalUrl), 'g'), adjustedPath);

      // Also try without domain
      const relativePath = originalUrl.replace(this.domain, '');
      html = html.replace(new RegExp(this.escapeRegex(relativePath), 'g'), adjustedPath);
    });

    return html;
  }

  generateServer() {
    const serverCode = `const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4'
};

const server = http.createServer((req, res) => {
  let filePath = '.' + req.url;

  // Default to index
  if (filePath === './') {
    filePath = './index.html';
  }

  // Handle clean URLs
  if (!path.extname(filePath)) {
    filePath += '.html';
  }

  const extname = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404);
        res.end('404 - Not Found');
      } else {
        res.writeHead(500);
        res.end('Server Error: ' + error.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(\`\\n🚀 Server running at http://localhost:\${PORT}\\n\`);
});
`;

    fs.writeFileSync(path.join(this.baseDir, 'server.js'), serverCode);
    console.log('   ✓ Created server.js');
  }

  generateDocs(assets, pages) {
    const readme = `# ${this.projectName}

**Cloned from:** ${this.targetUrl}
**Date:** ${new Date().toLocaleDateString()}

## 🚀 Quick Start

\`\`\`bash
node server.js
\`\`\`

Visit **http://localhost:3000**

## 📁 Project Structure

\`\`\`
${this.projectName}/
├── index.html              ← EDIT THIS (your homepage)
├── original-index.html     ← Original (for reference)
├── server.js               ← Local dev server
├── pages/
│   ├── *-local.html        ← EDIT THESE (your pages)
│   └── *.html              ← Originals (for reference)
├── assets/
│   ├── css/                ← EDIT THESE (your styles)
│   ├── js/                 ← EDIT THESE (your scripts)
│   ├── images/             ← REPLACE THESE (your images)
│   └── fonts/              ← Your fonts
└── README.md               ← This file
\`\`\`

## ✏️ Editing Guide

### Change Content
Edit \`index.html\` and files in \`pages/\` directly. All HTML is fully editable.

### Modify Styles
Edit CSS files in \`assets/css/\`. Changes apply immediately.

### Update JavaScript
Edit JS files in \`assets/js/\`. Refresh browser to see changes.

### Swap Images
Replace files in \`assets/images/\` with your own (keep same filename or update HTML).

### Rebrand
1. Search/replace company names in HTML files
2. Update colors in CSS files
3. Replace logo images
4. Modify text content throughout

### Use as Template
1. Duplicate the entire project folder
2. Edit content for new use case
3. Deploy anywhere (static hosting)

## 📊 Downloaded Assets

- **CSS Files:** ${this.downloaded.css.length}
- **JS Files:** ${this.downloaded.js.length}
- **Images:** ${this.downloaded.images.length}
- **Pages:** ${this.downloaded.html.length + 1}

## 🎯 What You Can Do Now

✅ Edit all HTML, CSS, and JavaScript
✅ Swap out any content or images
✅ Modify animations and interactions
✅ Rebrand completely (colors, fonts, text)
✅ Use as template for multiple projects
✅ Deploy to any static host
✅ Add new pages following same structure
✅ Remove pages you don't need

## 💡 Tips

- **Original files** (starting with "original-") are kept for reference
- **Local files** (index.html, *-local.html) are what you edit
- Test changes by refreshing your browser
- No build process needed - direct file editing
- All paths are relative - easy to deploy anywhere

## 🚢 Deployment

This is now a static site. Deploy to:
- Netlify (drag & drop)
- Vercel
- GitHub Pages
- Any static host

Just upload all files. The server.js is only for local dev.

## 📝 Notes

- Some features may need the original domain (API calls, etc.)
- Third-party CDN resources (Bootstrap, jQuery, etc.) still load from CDN
- You now own these files - modify freely without restrictions
`;

    fs.writeFileSync(path.join(this.baseDir, 'README.md'), readme);

    // Create ASSETS.md with detailed asset inventory
    const assetDoc = `# Asset Inventory

## CSS Files (${this.downloaded.css.length})

${this.downloaded.css.map(f => `- \`assets/css/${f}\``).join('\n')}

## JavaScript Files (${this.downloaded.js.length})

${this.downloaded.js.map(f => `- \`assets/js/${f}\``).join('\n')}

## Images (${this.downloaded.images.length})

${this.downloaded.images.slice(0, 20).map(f => `- \`assets/images/${f}\``).join('\n')}
${this.downloaded.images.length > 20 ? `\n... and ${this.downloaded.images.length - 20} more` : ''}

## Pages (${this.downloaded.html.length})

${this.downloaded.html.map(f => `- \`pages/${f}\``).join('\n')}

---

**All assets are fully editable and yours to modify.**
`;

    fs.writeFileSync(path.join(this.baseDir, 'ASSETS.md'), assetDoc);
  }

  printSummary(elapsed) {
    console.log(`⏱️  Time: ${elapsed}s`);
    console.log(`📂 Location: ./${this.projectName}\n`);
    console.log('📦 Downloaded:');
    console.log(`   • ${this.downloaded.css.length} CSS files`);
    console.log(`   • ${this.downloaded.js.length} JS files`);
    console.log(`   • ${this.downloaded.images.length} images`);
    console.log(`   • ${this.downloaded.html.length + 1} HTML pages\n`);
    console.log('✏️  Everything is now editable!');
    console.log('📖 Check README.md for editing guide\n');
    console.log('🚀 Start server:');
    console.log(`   cd ${this.projectName}`);
    console.log(`   node server.js\n`);
  }

  // Utility methods

  async fetchUrl(url) {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;

      client.get(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          return this.fetchUrl(res.headers.location).then(resolve).catch(reject);
        }

        if (res.statusCode !== 200) {
          console.log(`   ⚠️  Failed to fetch ${url} (${res.statusCode})`);
          resolve(null);
          return;
        }

        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      }).on('error', (err) => {
        console.log(`   ❌ Error: ${err.message}`);
        resolve(null);
      });
    });
  }

  async download(url, outputPath) {
    return new Promise((resolve) => {
      const client = url.startsWith('https') ? https : http;

      client.get(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          return this.download(res.headers.location, outputPath).then(resolve);
        }

        if (res.statusCode !== 200) {
          console.log(`   ⚠️  Skipped: ${path.basename(outputPath)} (${res.statusCode})`);
          resolve(false);
          return;
        }

        const file = fs.createWriteStream(outputPath);
        res.pipe(file);

        file.on('finish', () => {
          file.close();
          console.log(`   ✓ ${path.basename(outputPath)}`);
          resolve(true);
        });
      }).on('error', () => {
        console.log(`   ⚠️  Skipped: ${path.basename(outputPath)}`);
        resolve(false);
      });
    });
  }

  makeAbsolute(url) {
    if (url.startsWith('http')) return url;
    if (url.startsWith('//')) return 'https:' + url;
    if (url.startsWith('/')) return this.domain + url;
    return this.domain + '/' + url;
  }

  isThirdPartyCDN(url) {
    const cdnPatterns = [
      'cdn.', 'cdnjs', 'jsdelivr', 'unpkg', 'googleapis',
      'gstatic', 'bootstrapcdn', 'cloudflare', 'fontawesome'
    ];
    return cdnPatterns.some(pattern => url.includes(pattern));
  }

  isInternalPage(href) {
    if (!href || href.startsWith('#') || href.startsWith('mailto:') ||
        href.startsWith('tel:') || href.startsWith('javascript:')) {
      return false;
    }

    if (href.startsWith('http')) {
      return href.startsWith(this.domain);
    }

    // Exclude common file extensions
    const fileExts = ['.pdf', '.zip', '.doc', '.docx', '.xls', '.xlsx'];
    return !fileExts.some(ext => href.endsWith(ext));
  }

  urlToFilename(url, type) {
    const urlObj = new URL(url);
    let filename = urlObj.pathname.split('/').pop();

    if (!filename || filename === '') {
      filename = 'file-' + Date.now();
    }

    // Remove query params but keep extension
    filename = filename.split('?')[0];

    // Ensure proper extension
    const ext = path.extname(filename);
    if (!ext) {
      const extMap = {
        'css': '.css',
        'js': '.js',
        'image': '.jpg'
      };
      filename += extMap[type] || '';
    }

    return filename;
  }

  pageUrlToFilename(url) {
    const urlObj = new URL(url);
    let filename = urlObj.pathname.replace(/^\//, '').replace(/\//g, '-');

    if (!filename || filename === '' || filename === '-') {
      filename = 'page';
    }

    if (!filename.endsWith('.html')) {
      filename += '.html';
    }

    return filename;
  }

  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help') {
    console.log(\`
Website Cloner 3.0 - Maximum Control

Usage:
  node clone-website.js <url> [project-name]

Examples:
  node clone-website.js https://example.com
  node clone-website.js https://example.com my-site

After cloning:
  - Edit all HTML, CSS, JS files directly
  - Swap images and content freely
  - Use as template for multiple projects
  - Deploy anywhere as static site
\`);
    process.exit(0);
  }

  const targetUrl = args[0];
  const projectName = args[1] || 'cloned-site';

  const cloner = new WebsiteCloner(targetUrl, projectName);
  cloner.clone();
}

module.exports = { WebsiteCloner };
```

---

## What Makes This Version Better for Your Needs

### ✅ Maximum Post-Clone Flexibility

1. **All Files Are Yours**
   - Edit any HTML, CSS, JS directly
   - No build process to worry about
   - No transpilation or compilation
   - Direct file editing = instant changes

2. **Clean File Organization**
   ```
   index.html          ← Edit this
   original-index.html ← Reference only
   ```
   - Clear separation between editable and reference files
   - Original files kept for comparison
   - But they don't interfere with your edits

3. **Easy Content Swapping**
   - Replace images: just swap the file
   - Change text: edit HTML directly
   - Update styles: modify CSS
   - All paths are relative and portable

4. **Reusable as Template**
   - Copy entire folder for new project
   - Edit content for different purposes
   - Same structure, different content
   - No dependencies or configurations to manage

5. **No Lock-In**
   - Static files = deploy anywhere
   - No special hosting requirements
   - No build tools needed
   - Works with any editor

### ❌ What Was Removed

- **No backups** - Clutters your workspace, use git if needed
- **No auto-fixes** - You decide what to fix and how
- **No complex validation** - If it works, it works
- **No excessive automation** - Just download and get out of your way

### 🎯 Usage Scenarios

**Scenario 1: Rebrand a site**
```bash
node clone-website.js https://competitor.com rebranded
cd rebranded
# Edit index.html - replace company name
# Edit assets/css/*.css - change colors
# Replace assets/images/logo.png
```

**Scenario 2: Use as template for multiple clients**
```bash
node clone-website.js https://template-site.com base-template
cp -r base-template client-1
cp -r base-template client-2
# Edit each separately
```

**Scenario 3: Learn from and modify existing site**
```bash
node clone-website.js https://cool-site.com learning
cd learning
# Study the original files
# Modify and experiment
# See changes instantly
```

**Scenario 4: Create variations**
```bash
node clone-website.js https://site.com base
# Make version A
cp -r base version-a
# Make version B
cp -r base version-b
# Edit each differently for A/B testing
```

---

## Simplified Workflow

```
1. Clone:    node clone-website.js https://site.com
              ↓
2. Edit:     Open files, make changes
              ↓
3. Test:     node server.js → see changes
              ↓
4. Deploy:   Upload to any host
```

**No build steps. No compilation. No restrictions.**

---

## Key Features

✅ **One file, one tool** - Everything in clone-website.js
✅ **Fast execution** - Downloads essentials only
✅ **Clean output** - Organized and readable
✅ **Fully editable** - HTML/CSS/JS are yours
✅ **No auto-modifications** - You control all changes
✅ **Template-ready** - Duplicate and reuse freely
✅ **Deploy anywhere** - Pure static files
✅ **No dependencies** - Just Node.js built-ins

---

## Advanced Editing Examples

### Change All Colors
```bash
# Find and replace across CSS files
cd assets/css
sed -i '' 's/#FF0000/#00FF00/g' *.css
```

### Swap Logo Site-Wide
```bash
# Replace logo file
cp ~/new-logo.png assets/images/logo.png
# Or update all references
grep -r "old-logo.png" . --files-with-matches | xargs sed -i '' 's/old-logo.png/new-logo.png/g'
```

### Add New Page
```bash
# Copy existing page structure
cp pages/about-local.html pages/new-page-local.html
# Edit content
# Link from index.html
```

### Remove Sections
```bash
# Just delete the HTML elements you don't want
# Edit index.html and remove <section> tags
```

---

## Deployment Options

All these work with zero configuration:

- **Netlify**: Drag folder to web interface
- **Vercel**: `vercel --prod`
- **GitHub Pages**: Push to gh-pages branch
- **Cloudflare Pages**: Connect git repo
- **Surge**: `surge .` from project directory
- **Any FTP host**: Upload all files

The `server.js` is only for local development. Production doesn't need it.

---

## Philosophy

**Tools should empower, not restrict.**

This cloner:
- Gets you started quickly ✅
- Gives you complete control ✅
- Doesn't force a workflow ❌
- Doesn't auto-fix your code ❌
- Doesn't create dependencies ❌
- Doesn't require maintenance ❌

After running the clone command, you have static files. That's it. Do whatever you want with them.

---

## The [INSERT_WEBSITE_URL] Pattern

Just like before, paste any URL:

```bash
node clone-website.js [INSERT_WEBSITE_URL] my-project
```

Works with:
- Static sites ✅
- Webflow sites ✅
- WordPress sites ✅
- Marketing pages ✅
- Landing pages ✅
- Portfolio sites ✅
- Any publicly accessible website ✅

---

**Simple. Fast. Yours to control.**
