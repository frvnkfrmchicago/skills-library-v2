# Version Control Skill

**Git workflows, branching, PRs, and team collaboration.**

---

## Context Questions

Before choosing a git workflow, ask:

1. **What's the team size?** — Solo, small team (2-5), large team (5+)
2. **What's the release cadence?** — Continuous deploy, scheduled releases, feature releases
3. **What's the environment setup?** — Just production, staging + production, multiple environments
4. **What's the review requirement?** — No reviews (solo), optional, mandatory
5. **What's the collaboration style?** — Async, sync, mixed

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| Complexity | Simple (GitHub Flow) ←→ Complex (GitFlow) |
| Branches | Just main ←→ Multiple long-lived branches |
| Reviews | No reviews ←→ Mandatory approvals |
| Releases | Continuous ←→ Scheduled versions |
| Automation | Manual ←→ Full CI/CD |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Solo dev, fast shipping | GitHub Flow (main + feature branches) |
| Team with staging | GitHub Flow + develop branch for staging |
| Scheduled releases | GitFlow with release branches |
| Hotfix needed | Hotfix branch from main, merge back |
| PR conflicts common | Smaller PRs, rebase frequently, communicate |
| New team member | Document workflow, PR templates, review checklist |

---

## TL;DR

| Branch | Purpose | Merge To |
|--------|---------|----------|
| **main** | Production | - |
| **develop** | Staging | main |
| **feature/** | New features | develop |
| **hotfix/** | Urgent fixes | main |

**For solo devs:** Just use `main` + feature branches.

---

## Part 1: Branch Strategies

### GitHub Flow (Simple - Recommended for Solo/Small Teams)

```
main ──────●──────●──────●──────●──── (production)
            \    /      \    /
             feature-1   feature-2
```

**Rules:**
1. `main` is always deployable
2. Create feature branch from `main`
3. Open PR when ready
4. Merge and deploy

```bash
# Start feature
git checkout main
git pull origin main
git checkout -b feature/user-auth

# Work, commit, push
git add .
git commit -m "feat: add user authentication"
git push -u origin feature/user-auth

# Open PR on GitHub, merge, delete branch
```

### GitFlow (Complex - For Larger Teams)

```
main ────────────●──────────────●───── (production)
                  \            /
hotfix ────────────●──────────/
                              \
develop ──────●──────●──────●──●───── (staging)
              \    /        /
               feature-1   /
                    \     /
                     feature-2
```

**Use when:**
- Multiple developers
- Scheduled releases
- Need staging environment

---

## Part 2: Commit Messages

### Conventional Commits

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

| Type | Use For |
|------|---------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Formatting |
| `refactor` | Code restructure |
| `test` | Tests |
| `chore` | Deps, config |

**Examples:**

```bash
feat(auth): add Google OAuth login
fix(checkout): prevent double submission
docs: update README with setup instructions
refactor(api): extract validation middleware
chore: update dependencies
```

### Quick Commit Template

```bash
# Add to ~/.gitconfig
[commit]
  template = ~/.gitmessage

# ~/.gitmessage
# feat/fix/docs/refactor/chore(scope): description
#
# - Why this change?
# - What does it do?
# - Breaking changes?
```

---

## Part 3: Pull Request Templates

### Create Template

```markdown
<!-- .github/pull_request_template.md -->

## What Changed
<!-- Brief description of changes -->

## Why
<!-- Reason for changes -->

## Type of Change
- [ ] 🐛 Bug fix
- [ ] ✨ New feature
- [ ] 💥 Breaking change
- [ ] 📝 Documentation
- [ ] 🔧 Refactor

## Testing
- [ ] Tested locally
- [ ] Tests pass
- [ ] Tested on mobile

## Screenshots
<!-- If UI changes, add screenshots -->

## Checklist
- [ ] Code follows project style
- [ ] Self-reviewed
- [ ] Comments added for complex code
- [ ] No console.logs left
```

### Good PR Examples

**Title:** `feat(checkout): add Apple Pay support`

**Description:**
```markdown
## What Changed
Added Apple Pay as a payment option in checkout.

## Why
Users requested alternative payment methods. Apple Pay has
30% higher conversion on mobile.

## Testing
- ✅ Safari on Mac
- ✅ Safari on iOS
- ✅ Falls back gracefully on non-Apple browsers
```

---

## Part 4: Code Review Checklist

### For Reviewer

```markdown
## Code Review Checklist

### Functionality
- [ ] Code does what the PR claims
- [ ] Edge cases handled
- [ ] Error handling present

### Security
- [ ] No hardcoded secrets
- [ ] Input validated
- [ ] Auth checks present
- [ ] SQL injection safe

### Performance
- [ ] No N+1 queries
- [ ] Large lists paginated
- [ ] Images optimized

### Code Quality
- [ ] Clear naming
- [ ] No unnecessary complexity
- [ ] DRY (not too DRY)
- [ ] TypeScript types correct

### Breaking Changes
- [ ] API changes documented
- [ ] Migration provided if needed
- [ ] Backwards compatible (or noted)
```

### Review Comments Style

```markdown
# Good
"Consider extracting this into a hook for reuse in UserProfile too"

# Bad
"This is wrong"

# Good
"This could cause N+1 queries. Maybe use prisma include here?"

# Bad
"Performance issue"
```

---

## Part 5: Merge Conflict Resolution

### Common Scenarios

**Both changed same line:**
```bash
git checkout feature/my-branch
git fetch origin
git rebase origin/main

# Resolve conflicts in editor
# Accept current (yours) or incoming (theirs)

git add .
git rebase --continue
```

**package.json conflicts:**
```bash
# After resolving
npm install
git add package.json package-lock.json
git rebase --continue
```

### Prevention

1. **Pull frequently:** `git pull --rebase origin main`
2. **Small PRs:** Less overlap
3. **Communicate:** "I'm working on auth"
4. **Lock files:** Commit lock files

---

## Part 6: Git Config

### Recommended Setup

```bash
# ~/.gitconfig
[user]
  name = Your Name
  email = you@example.com

[core]
  editor = code --wait
  autocrlf = input

[pull]
  rebase = true

[push]
  default = current

[alias]
  co = checkout
  br = branch
  ci = commit
  st = status
  unstage = reset HEAD --
  last = log -1 HEAD
  lg = log --oneline --graph --decorate -20
```

### Useful Aliases

```bash
# Quick commit
alias gc="git add . && git commit -m"

# New feature branch
alias gnb="git checkout -b"

# Update from main
alias gup="git fetch origin && git rebase origin/main"

# Push new branch
alias gpush="git push -u origin HEAD"
```

---

## Part 7: Git Commands Cheatsheet

### Daily Use

```bash
# Start of day
git checkout main
git pull

# Start feature
git checkout -b feature/name

# Work
git add .
git commit -m "feat: description"

# Push
git push -u origin feature/name

# After PR approved
git checkout main
git pull
git branch -d feature/name
```

### Fixing Mistakes

```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Change last commit message
git commit --amend -m "new message"

# Forgot to add file
git add forgotten-file.ts
git commit --amend --no-edit

# Wrong branch? Cherry-pick
git checkout correct-branch
git cherry-pick <commit-hash>
```

### Clean Up

```bash
# Delete merged local branches
git branch --merged | grep -v main | xargs git branch -d

# Prune remote branches
git fetch --prune

# Interactive rebase (squash commits)
git rebase -i HEAD~3
```

---

## Part 8: Workflow for Teams

### Daily Standup Git Commands

```bash
# What did I work on yesterday?
git log --oneline --author="Your Name" --since="yesterday"

# What's in progress?
git branch -vv

# What's waiting for review?
# Check GitHub PRs
```

### Release Workflow

```bash
# 1. Create release branch
git checkout -b release/v1.2.0 develop

# 2. Version bump
npm version minor

# 3. Merge to main
git checkout main
git merge release/v1.2.0

# 4. Tag
git tag v1.2.0
git push origin v1.2.0

# 5. Merge back to develop
git checkout develop
git merge release/v1.2.0
```

---

## Quick Reference

### Branch Naming

```
feature/user-auth
fix/checkout-bug
hotfix/security-patch
chore/update-deps
docs/api-reference
```

### Commit Prefixes

```
feat: ✨ new feature
fix: 🐛 bug fix
docs: 📝 documentation
style: 💄 formatting
refactor: ♻️ restructure
test: ✅ tests
chore: 🔧 maintenance
```

---

## Resources

- Git docs: https://git-scm.com/doc
- GitHub flow: https://docs.github.com/en/get-started/quickstart/github-flow
- Conventional commits: https://www.conventionalcommits.org/

---

## Related Skills

- `agents/deployment/SKILL.md` - CI/CD integration
- `agents/monorepo/SKILL.md` - Multi-package repos
- `workflows/ship-fast/SKILL.md` - Rapid deployment
