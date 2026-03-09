---
name: github
description: GitHub workflows, Actions, collaboration. Git flow, PRs, CI/CD, releases.
last_updated: 2026-03
owner: Frank
---

# GitHub

Version control, CI/CD, collaboration. Everything ships through GitHub.

> **See also:** `agents/deployment/SKILL.md`, `agents/testing/SKILL.md`

---

## Context Questions

Before setting up GitHub workflows:

1. **What's the team size?** — Solo, small team, enterprise
2. **What's the branching strategy?** — GitHub Flow, Git Flow, trunk-based
3. **What's the CI/CD need?** — None, basic tests, full pipeline
4. **What's the release strategy?** — Continuous, versioned, scheduled
5. **What integrations?** — Vercel, AWS, Slack, Jira

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Complexity** | Basic commits ←→ Full GitOps |
| **Branching** | Single main ←→ Multi-environment |
| **CI/CD** | Manual ←→ Fully automated |
| **Review** | Self-merge ←→ Required approvals |
| **Releases** | Continuous ←→ Versioned/tagged |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Solo dev | GitHub Flow (feature branches → main) |
| Small team | Protected main + PR reviews |
| Enterprise | Environment branches + approvals |
| Open source | Fork workflow + contributor guide |
| Continuous delivery | Trunk-based + feature flags |

---

## TL;DR

| Need | Approach |
|------|----------|
| **Basic workflow** | GitHub Flow |
| **CI tests** | GitHub Actions on push/PR |
| **Deploy on merge** | Actions + platform integration |
| **Versioning** | Semantic releases |
| **Monorepo** | Turborepo + path filters |

---

## Part 1: Git Basics

### Essential Commands

```bash
# Clone
git clone https://github.com/user/repo.git
cd repo

# Create branch
git checkout -b feature/my-feature

# Stage and commit
git add .
git commit -m "feat: add new feature"

# Push branch
git push -u origin feature/my-feature

# Update from main
git checkout main
git pull
git checkout feature/my-feature
git rebase main

# Squash commits before PR
git rebase -i HEAD~3  # Squash last 3 commits
```

### Commit Message Convention

```
type(scope): description

Types:
- feat: new feature
- fix: bug fix
- docs: documentation
- style: formatting
- refactor: code change (no feature/fix)
- test: tests
- chore: maintenance

Examples:
feat(auth): add OAuth login
fix(api): handle null response
docs: update README
```

---

## Part 2: Branching Strategies

### GitHub Flow (Recommended for Most)

```
main (production)
  └── feature/add-login
  └── feature/fix-header
  └── hotfix/security-patch

Rules:
1. main is always deployable
2. Branch from main for work
3. Open PR when ready
4. Merge after review + CI passes
5. Deploy immediately after merge
```

### Git Flow (Versioned Releases)

```
main (production)
develop (integration)
  └── feature/xxx
  └── release/1.0
  └── hotfix/xxx

Rules:
1. Features branch from develop
2. Release branches for versioning
3. Hotfixes go to main AND develop
4. Tags for versions
```

### Trunk-Based (High-Velocity Teams)

```
main (single branch)
  └── short-lived branches (hours, not days)

Rules:
1. Small, frequent commits
2. Feature flags for incomplete work
3. Everyone commits to main daily
4. Continuous deployment
```

---

## Part 3: GitHub Actions

### Basic CI Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest
      
      - name: Install dependencies
        run: bun install
      
      - name: Lint
        run: bun run lint
      
      - name: Type check
        run: bun run type-check
      
      - name: Test
        run: bun run test
```

### Build and Deploy

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: oven-sh/setup-bun@v1
      
      - name: Install and build
        run: |
          bun install
          bun run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Matrix Testing

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20, 22]
        os: [ubuntu-latest, macos-latest]
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm test
```

### Monorepo with Path Filters

```yaml
name: CI

on:
  push:
    paths:
      - 'packages/web/**'
      - 'packages/shared/**'

jobs:
  build-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: cd packages/web && bun install && bun run build
```

---

## Part 4: Pull Request Best Practices

### PR Template

```markdown
<!-- .github/pull_request_template.md -->
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation

## Testing
- [ ] Unit tests pass
- [ ] Manual testing done

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed
- [ ] Comments added for complex logic
- [ ] Documentation updated

## Screenshots (if UI change)
<!-- Add screenshots here -->
```

### Branch Protection Rules

```
Settings → Branches → Add rule

Pattern: main

Enable:
✅ Require pull request before merging
✅ Require approvals (1-2)
✅ Dismiss stale reviews
✅ Require status checks (CI)
✅ Require branches to be up to date
✅ Require conversation resolution

Optional:
✅ Require signed commits
✅ Restrict pushes
```

---

## Part 5: Releases & Versioning

### Semantic Versioning

```
MAJOR.MINOR.PATCH

1.0.0 → 1.0.1  # Patch: bug fixes
1.0.1 → 1.1.0  # Minor: new features (backward compatible)
1.1.0 → 2.0.0  # Major: breaking changes
```

### Automated Releases

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          generate_release_notes: true
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Changesets (Monorepo Versioning)

```bash
bun add -D @changesets/cli
bunx changeset init
```

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      
      - name: Create Release PR or Publish
        uses: changesets/action@v1
        with:
          publish: bun run release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## Part 6: Secrets & Variables

### Repository Secrets

```
Settings → Secrets and variables → Actions

Secrets (encrypted):
- DATABASE_URL
- API_KEY
- VERCEL_TOKEN

Variables (plain text):
- ENVIRONMENT
- LOG_LEVEL
```

### Using in Workflows

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    env:
      DATABASE_URL: ${{ secrets.DATABASE_URL }}
      ENVIRONMENT: ${{ vars.ENVIRONMENT }}
    steps:
      - run: echo "Deploying to $ENVIRONMENT"
```

### Environment-Specific

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production  # Uses production secrets
    steps:
      - run: deploy --url ${{ secrets.PROD_URL }}
```

---

## Part 7: Issue & Project Management

### Issue Templates

```yaml
# .github/ISSUE_TEMPLATE/bug_report.yml
name: Bug Report
description: Report a bug
labels: ["bug"]
body:
  - type: textarea
    id: description
    attributes:
      label: Describe the bug
      placeholder: A clear description...
    validations:
      required: true
  
  - type: textarea
    id: steps
    attributes:
      label: Steps to reproduce
      value: |
        1. Go to '...'
        2. Click on '...'
        3. See error
  
  - type: textarea
    id: expected
    attributes:
      label: Expected behavior
```

### Linking Issues to PRs

```markdown
# In PR description:
Closes #123
Fixes #456
Resolves #789

# In commit message:
fix: resolve login bug (#123)
```

---

## Part 8: Automation

### Dependabot

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    groups:
      development-dependencies:
        patterns:
          - "@types/*"
          - "eslint*"
          - "prettier*"
```

### Auto-Merge Dependabot

```yaml
# .github/workflows/auto-merge.yml
name: Auto-merge Dependabot

on: pull_request

permissions:
  contents: write
  pull-requests: write

jobs:
  auto-merge:
    runs-on: ubuntu-latest
    if: github.actor == 'dependabot[bot]'
    steps:
      - name: Auto-merge minor/patch updates
        run: gh pr merge --auto --squash "$PR_URL"
        env:
          PR_URL: ${{ github.event.pull_request.html_url }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Stale Issues

```yaml
# .github/workflows/stale.yml
name: Close Stale Issues

on:
  schedule:
    - cron: '0 0 * * *'

jobs:
  stale:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/stale@v9
        with:
          stale-issue-message: 'This issue is stale due to inactivity.'
          stale-pr-message: 'This PR is stale due to inactivity.'
          days-before-stale: 30
          days-before-close: 7
```

---

## Part 9: GitHub CLI

```bash
# Install
brew install gh

# Login
gh auth login

# Create repo
gh repo create my-app --public --clone

# Create PR
gh pr create --title "Add feature" --body "Description"

# Check PR status
gh pr status
gh pr checks

# Merge PR
gh pr merge --squash

# Create issue
gh issue create --title "Bug" --body "Description"

# View workflows
gh run list
gh run view <run-id>

# Clone and open
gh repo clone user/repo
gh browse
```

---

## Part 10: Best Practices

### Repository Setup

```
✅ README.md with:
   - Project description
   - Quick start
   - Development setup
   - Contributing guidelines

✅ LICENSE file

✅ .gitignore (use gitignore.io)

✅ PR and issue templates

✅ Branch protection on main

✅ Required status checks

✅ Dependabot enabled
```

### Commit Hygiene

```
✅ Small, focused commits
✅ Meaningful commit messages
✅ Squash before merge
✅ No secrets in history
✅ No large binaries
```

---

## Checklist

- [ ] Repository created
- [ ] README with setup instructions
- [ ] .gitignore configured
- [ ] Branch protection enabled
- [ ] CI workflow running
- [ ] PR template created
- [ ] Dependabot configured
- [ ] Secrets set up
- [ ] Release workflow (if versioned)

---

## Resources

- GitHub Docs: https://docs.github.com
- Actions Marketplace: https://github.com/marketplace
- GitHub CLI: https://cli.github.com

---

## Related Skills

- `agents/deployment/SKILL.md` — CI/CD deployment
- `agents/testing/SKILL.md` — Test automation
- `agents/monorepo/SKILL.md` — Monorepo patterns
