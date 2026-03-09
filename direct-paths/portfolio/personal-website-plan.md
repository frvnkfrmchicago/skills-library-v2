# Personal Website — Clone & Deploy Plan

## Overview

Clone a premium animated Webflow/Framer site, customize for personal brand, deploy to Vercel as portfolio/personal site.

---

## Target Sites to Clone (Pick One)

Research animated portfolio sites with:
- Smooth scroll animations
- Modern dark/gradient aesthetic
- Project showcase sections
- Clean navigation

**Suggested search**: "best developer portfolio Webflow 2024"
**Or**: Clone sections from assetpersona.com (you own it)

---

## Cloning Process

### Step 1: Clone
```bash
node clone-website.js https://[target-site].com personal-site
cd personal-site
node server.js
# → http://localhost:3000
```

### Step 2: Customize
Using cloning skill workflow:
1. Replace text content (name, bio, projects)
2. Update colors/fonts to personal brand
3. Swap placeholder images
4. Add portfolio project cards

### Step 3: Add Sections
- About section with photo
- Skills/capabilities
- Portfolio projects (link to deployed apps)
- Contact/links

### Step 4: Deploy to Vercel
```bash
npx vercel
```

---

## Content to Include

### Hero
- Name + title
- One-liner value prop
- CTA buttons (Projects, Contact)

### About
- 2-3 paragraph bio
- Photo
- Key skills/tools

### Portfolio Projects
| Project | Description | Link |
|---------|-------------|------|
| RAG Assistant | Chat with my Skills Library | [link] |
| Trading App | Real-time financial dashboard | [link] |
| Skills Library | 153+ AI/dev skills | [link] |

### Contact
- Email
- LinkedIn
- GitHub

---

## Skills to Use

| Task | Skill |
|------|-------|
| Clone site | `workflows/cloning/SKILL.md` |
| Enhance animations | `agents/gsap/SKILL.md` |
| SEO optimization | `agents/seo/SKILL.md` |
| Deploy | `agents/deployment/SKILL.md` |

---

## Timeline

- **Day 1**: Find site to clone, run cloning script
- **Day 2**: Customize content, swap images
- **Day 3**: Deploy to Vercel, test, refine

---

## Next Steps

1. Find target site to clone
2. Run cloning skill
3. Customize with personal content
4. Deploy to Vercel
5. Connect custom domain (optional)
