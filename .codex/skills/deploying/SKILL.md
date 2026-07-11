---
name: deploying
description: >
  Deploys web applications to GitHub Pages, Vercel, Cloudflare Pages, and
  Netlify. Covers platform selection, build configuration, CI/CD pipelines,
  asset management for large files, custom domains, environment variables,
  and troubleshooting failed deploys. Use when deploying a project, setting
  up hosting, configuring GitHub Actions, fixing blank pages, or managing
  deployment pipelines.
---

# Deploying

## Vercel CLI pitfalls
- `npx vercel` may resolve an older cached version that can't find auth tokens — see `references/vercel-cli-auth-workaround.md` for the `--token` extraction pattern.
- `.vercel/project.json` survives remote deletion — local git + project.json still give full deployment access.
- Vercel serves the last successful build indefinitely; failed deploys don't take down the live site.

Deploy web applications to production with confidence. Covers the four major
platforms, asset pipelines, CI/CD, and post-deploy verification.

---

## ⛔ STOP — What Are You Deploying?

Before proceeding, determine:

1. **Project type?** Static site, Vite SPA, Next.js SSR, API, mobile web
2. **Target platform?** GitHub Pages, Vercel, Cloudflare Pages, Netlify
3. **Large assets?** Videos, 3D models, datasets over 10MB
4. **Server-side rendering or API routes needed?**

This determines the entire deployment path.

---

## Platform Decision Tree

```
What are you deploying?
│
├── Static site (HTML/CSS/JS, Vite, React SPA)?
│   ├── Free, GitHub-native → GitHub Pages
│   ├── Free, fastest global CDN → Cloudflare Pages
│   ├── Free, preview deploys per PR → Vercel
│   └── Free, form handling built in → Netlify
│
├── Next.js / server components / API routes?
│   ├── Best native support → Vercel
│   ├── Edge-first with Workers → Cloudflare Pages (with adapter)
│   ├── Serverless functions → Netlify
│   └── NOT suitable → GitHub Pages (no server-side)
│
├── API / backend service?
│   ├── Edge functions → Cloudflare Workers
│   ├── Serverless → Vercel Functions / Netlify Functions
│   └── Containers → Cloud Run / Railway
│
└── Has large media files (videos, 3D, datasets)?
    └── See "Asset Management" section
```

| Platform | Free Tier | SSR | Custom Domain | Preview Deploys | Best For |
|----------|-----------|-----|---------------|-----------------|----------|
| **GitHub Pages** | Unlimited static | No | Yes (CNAME) | No | Portfolios, docs, static |
| **Vercel** | 100GB bandwidth | Yes | Yes | Yes (per PR) | Next.js, React, full-stack |
| **Cloudflare Pages** | Unlimited bandwidth | Yes (Workers) | Yes | Yes (per branch) | Edge-first, static-first |
| **Netlify** | 100GB bandwidth | Yes (Functions) | Yes | Yes (per PR) | JAMstack, forms, identity |

---

## GitHub Pages

### Vite Config (Most Common Issue)

```typescript
// vite.config.ts
export default defineConfig({
  base: '/REPO-NAME/',  // CRITICAL — must match repo name
  build: { outDir: 'dist' }
})
```

**`base` is the #1 reason for blank pages.** Set to `'/'` for custom domains.

### GitHub Actions Deploy (Recommended)

```yaml
# .github/workflows/deploy-pages.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: 'npm' }
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: './dist' }
  deploy:
    environment: { name: github-pages }
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/deploy-pages@v4
```

### SPA Routing Fix

Create `public/404.html` with redirect script — GitHub Pages does not support
client-side routing natively. Redirect all paths to `index.html`.

---

## Vercel

```bash
npm i -g vercel
vercel link          # connect account
vercel               # preview deploy
vercel --prod        # production deploy
```

### Environment Variables

```bash
vercel env add DATABASE_URL production
vercel env add DATABASE_URL preview
vercel env pull .env.local
```

**Rules:**
- `NEXT_PUBLIC_*` / `VITE_*` are exposed to the browser — NEVER put secrets here
- Use separate DB URLs for production vs preview

---

## Cloudflare Pages

```bash
npm i -g wrangler
wrangler login
wrangler pages project create my-project
npm run build
wrangler pages deploy dist
```

### SPA Redirect

```
# public/_redirects
/*    /index.html   200
```

### Edge Headers

```
# public/_headers
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
/assets/*
  Cache-Control: public, max-age=31536000, immutable
```

---

## Asset Management

### Decision Tree

```
Asset under 100MB?
├── Under 10MB → Commit directly
├── 10-100MB → Git LFS
└── Over 100MB → Host externally
    ├── Videos → YouTube (unlisted), Cloudflare Stream, Bunny CDN
    ├── Images → Cloudflare Images, Cloudinary
    └── Datasets → S3, R2, Supabase Storage
```

### Git LFS Setup

```bash
git lfs install
git lfs track "*.mp4" "*.webm" "*.glb"
git add .gitattributes
git commit -m "Configure Git LFS"
```

---

## CI/CD with GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Test and Deploy
on:
  push: { branches: [main] }
  pull_request:
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: 'npm' }
      - run: npm ci
      - run: npm run lint
      - run: npm run build
  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: 'npm' }
      - run: npm ci && npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Environment Variable Security

1. **NEVER** commit `.env` files — add `.env*` to `.gitignore`
2. **NEVER** prefix secrets with `NEXT_PUBLIC_` or `VITE_`
3. **NEVER** share production credentials with preview environments

---

## Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| Blank page | `base` not set | Set `base: '/REPO-NAME/'` in Vite config |
| 404 on refresh | SPA routing | Add `404.html` redirect or `_redirects` |
| CSS/JS missing | Wrong asset paths | Check `base` config |
| Deploy not updating | Cache | Wait 2-5min, hard refresh |
| Build fails CI | Node mismatch | Match `node-version` to local |
| Large file rejected | Over 100MB | Use Git LFS or external hosting |
| Push rejected | Remote ahead | `git pull --rebase origin main` |

## ⛔ STOP GATE

DO NOT mark deployment complete without:
1. Verifying the live URL loads correctly
2. Testing on mobile device or responsive view
3. Confirming environment variables are set for all environments
4. Checking browser console for errors
