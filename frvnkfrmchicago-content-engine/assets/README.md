# Asset Persona — Brand Assets

> Asset organization guide and file mapping for the content engine.

---

## Proposed Folder Structure

```
assetpersona-assets/
├── logos/              Favicons, brand marks, watermarks
├── templates/          Post templates, news templates
├── backgrounds/        Smoke bg, gradients, abstract art
├── generated/          AI-generated imagery (ChatGPT, Gemini, etc.)
├── portfolio/          Professional shots, site screenshots, decks
├── video/              Content videos, promos, behind-the-scenes
├── audio/              Music tracks, voice clips
└── n8n/                Workflow screenshots, architecture diagrams
```

---

## File Naming Convention

```
{brand}-{type}-{descriptor}-{version}.{ext}

Examples:
  ap-logo-primary-v1.png
  ap-template-news-post-v2.png
  ap-bg-smoke-v1.png
  ap-gen-ai-abstract-001.png
  ap-portfolio-site-screenshot-v1.png
```

---

## Image Format Recommendations

| Use Case | Format | Max Size | Dimensions |
|----------|--------|----------|------------|
| Logos & icons | PNG (transparent bg) | 500KB | Variable |
| Social post images | JPEG (90% quality) | 1MB | 1080×1080 (square) |
| LinkedIn images | JPEG | 1MB | 1200×628 (landscape) |
| Instagram stories | JPEG/PNG | 1MB | 1080×1920 (portrait) |
| Web assets | WebP | 200KB | Variable |
| Master files | PSD/AI | No limit | Full resolution |

---

## Size Guidelines by Platform

| Platform | Feed Post | Story/Reel | Profile Pic | Cover |
|----------|----------|-----------|-------------|-------|
| LinkedIn | 1200×628 | N/A | 400×400 | 1584×396 |
| Threads | 1080×1080 | N/A | 320×320 | N/A |
| Instagram | 1080×1080 or 1080×1350 | 1080×1920 | 320×320 | N/A |
| TikTok | 1080×1920 | 1080×1920 | 200×200 | N/A |
| Facebook | 1200×630 | 1080×1920 | 170×170 | 851×315 |

---

## Asset Versioning

- Use `v1`, `v2`, etc. suffix for iterations of the same asset
- Keep master PSD/AI files for any branded asset
- Store originals in Google Drive with "originals" subfolder
- Generated images get sequential numbers: `001`, `002`, etc.

---

## Current Asset Locations

All assets currently reside in `~/Downloads/`. See `manifest.json` for
the complete mapping of each file to its target folder and content types.

### Quick Inventory

| Category | Count | Key Files |
|----------|-------|-----------|
| Logos & Branding | 12+ | GHFAVICON.png, GHFAVI2.png, GHal420 series |
| Content Templates | 15+ | News Post Template series, Repost News series |
| Generated Images | 60+ | ChatGPT Image, Generated Image, Gemini series |
| Portfolio | 5+ | FrankSite.png, Portfolio Design, Executive Summary |
| Video | 8+ | Silkex.mp4, HairScience, Vid1/Vid2 |
| Audio/Music | 8+ | Diamond Vision, Golden Hustle, Black Like Samurai |
| N8N | 4+ | N8N.png, N8N (1-3).png |

---

## Usage Notes

- **AP-branded assets** (GHal420, GHFAVICON, etc.) are legacy Asset Persona assets — review
  for compatibility before using in Asset Persona posts
- **Generated images** can be used across brands with appropriate captions
- **Music files** are original Frank productions — use freely on all platforms
- **Portfolio images** are for PERSONAL_BRAND content only
- **N8N screenshots** are for AI_TECH "how I build" content
