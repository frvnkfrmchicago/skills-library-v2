# Workspace Organization

Manage multiple projects efficiently.

## TL;DR

| Folder | Contains |
|--------|----------|
| `~/projects/` | All your projects |
| `~/projects/active/` | Currently working on |
| `~/projects/shipped/` | Deployed and stable |
| `~/projects/archive/` | Old/abandoned |
| `~/templates/` | Reusable starters |
| `~/skills-library/` | This skills library |

---

## Recommended Structure

```
~/
├── projects/
│   ├── active/              # Currently building
│   │   ├── app-name-1/
│   │   ├── app-name-2/
│   │   └── app-name-3/
│   ├── shipped/             # Live and maintained
│   │   ├── saas-product/
│   │   ├── client-dashboard/
│   │   └── marketing-site/
│   └── archive/             # No longer active
│       └── old-project/
├── templates/               # Reusable starters
│   ├── nextjs-saas/
│   ├── nextjs-dashboard/
│   ├── expo-mobile/
│   └── landing-page/
├── skills-library/          # This library
└── _workspace/              # Temp files, experiments
```

---

## Project Naming

### Convention

```
[type]-[name]
```

**Types:**
- `saas-` → SaaS products
- `dash-` → Dashboards
- `site-` → Marketing/content sites
- `app-` → General applications
- `api-` → Backend services
- `mobile-` → Mobile apps
- `exp-` → Experiments (disposable)

**Examples:**
- `saas-analytics`
- `dash-inventory`
- `site-portfolio`
- `app-task-manager`
- `mobile-fitness`
- `exp-ai-chat` (experiment, might trash)

---

## Project Lifecycle

```
~/projects/active/exp-new-idea      # Start here
        ↓ (becomes real)
~/projects/active/saas-new-idea     # Rename with type
        ↓ (shipped)
~/projects/shipped/saas-new-idea    # Move here
        ↓ (abandoned/replaced)
~/projects/archive/saas-new-idea    # Move here
```

### Commands

```bash
# Start new project
cd ~/projects/active
npx create-next-app@latest exp-my-idea

# Promote to real project
mv exp-my-idea saas-my-idea

# Ship (move to shipped)
mv ~/projects/active/saas-my-idea ~/projects/shipped/

# Archive
mv ~/projects/shipped/old-project ~/projects/archive/
```

---

## Template System

### Creating Templates

When you build something reusable:

```bash
# Copy project to templates
cp -r ~/projects/shipped/saas-product ~/templates/nextjs-saas

# Clean it
cd ~/templates/nextjs-saas
rm -rf .git node_modules .next .env.local
rm -rf prisma/migrations

# Reset package.json name
# Reset README
# Remove project-specific code
```

### Using Templates

```bash
# Copy template to new project
cp -r ~/templates/nextjs-saas ~/projects/active/saas-new-project
cd ~/projects/active/saas-new-project

# Initialize
git init
pnpm install
cp .env.example .env.local
# Edit .env.local with new values
```

---

## Shared Resources

### Global Config Files

```
~/.cursorrules          # Global Cursor rules
~/.gitconfig            # Git config
~/.zshrc or ~/.bashrc   # Shell config
```

### Shared Dependencies

Consider a monorepo if:
- Multiple projects share code
- Want consistent versions
- Building related products

```
~/projects/monorepo/
├── apps/
│   ├── web/
│   ├── mobile/
│   └── api/
├── packages/
│   ├── ui/            # Shared components
│   ├── utils/         # Shared utilities
│   └── config/        # Shared config
├── turbo.json
└── package.json
```

---

## Quick Navigation

### Shell Aliases

Add to `~/.zshrc` or `~/.bashrc`:

```bash
# Project navigation
alias pa="cd ~/projects/active"
alias ps="cd ~/projects/shipped"
alias pt="cd ~/templates"
alias sk="cd ~/skills-library"

# Quick project access
alias proj="cd ~/projects/active && ls"

# New project
function newproj() {
  cd ~/projects/active
  npx create-next-app@latest $1 --typescript --tailwind --app
  cd $1
  code .
}
```

### VS Code Workspaces

Create `~/projects.code-workspace`:

```json
{
  "folders": [
    { "path": "projects/active", "name": "🔥 Active" },
    { "path": "projects/shipped", "name": "🚀 Shipped" },
    { "path": "templates", "name": "📦 Templates" },
    { "path": "skills-library", "name": "🧠 Skills" }
  ]
}
```

---

## Project README Template

Every project should have:

```markdown
# Project Name

One-line description.

## Status
- [ ] In development
- [ ] Shipped
- [ ] Archived

## Stack
- Framework: 
- Database: 
- Auth: 
- Deploy: 

## Quick Start
\`\`\`bash
pnpm install
cp .env.example .env.local
pnpm dev
\`\`\`

## Deploy
\`\`\`bash
vercel --prod
\`\`\`

## Links
- Production: [url]
- Staging: [url]
- Docs: [url]
```

---

## Cleanup Routine

### Weekly (5 min)

```bash
# Remove node_modules from inactive projects
find ~/projects/archive -name "node_modules" -type d -prune -exec rm -rf {} +

# Remove .next from old builds
find ~/projects -name ".next" -type d -prune -exec rm -rf {} +
```

### Monthly (15 min)

- Review `active/` - move shipped projects
- Review `shipped/` - archive dead projects
- Update templates with improvements
- Clean `_workspace/` experiments

---

## Integration with Skills Library

### Per-Project Skills

```
project/
├── .cursorrules           # From skills-library/platforms/cursor/
├── src/
└── ...
```

### Reference in Cursor

```
# .cursorrules
# Import shared rules
@import ~/skills-library/platforms/cursor/stack-master.cursorrules
```

### Claude Code

```bash
claude --skill ~/skills-library/skills/stack-master
```

---

## Multiple Machines

### Git-based Sync

```bash
# skills-library as git repo
cd ~/skills-library
git init
git remote add origin [your-repo]
git push

# On other machine
git clone [your-repo] ~/skills-library
```

### Cloud Sync

- Use Dropbox/iCloud for `~/skills-library`
- Or use GitHub private repo
- Keep `.env` files local (not synced)
