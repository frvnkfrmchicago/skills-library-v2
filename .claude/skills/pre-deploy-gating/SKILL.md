---
name: pre-deploy-gating
description: >
  Final deployment gatekeeper that blocks releases until security, environment
  variables, error handling, documentation, and tests all pass. Includes
  executable scan commands and CI/CD integration templates with evidence
  requirements. Use before deploying to production, when checking deployment
  readiness, or when user mentions deploy, ship, or go live.
---

# Pre-Deploy Gating

Nothing deploys until this passes. Production is sacred. This skill blocks
deployment until every critical check has evidence of passing.

---

## 1. Critical Checks (MUST Pass)

### Security Scan

Run ALL of these commands and show output as evidence:

```bash
# Check for exposed secrets
grep -rn "sk_live\|pk_live\|api_key\|apiKey\|secret\|password" \
  --include="*.ts" --include="*.tsx" --include="*.js" src/

# Check for .env files tracked in git
git ls-files | grep -E "\.env$|\.env\.local$|\.env\.production$"

# Check git history for leaked secrets
git log -p --diff-filter=A | grep -E "sk_live|pk_live|API_KEY|SECRET" | head -20

# Run secretlint (if available)
npx secretlint "**/*"

# Check for console.logs in production code
grep -rn "console.log\|console.error\|console.warn" \
  --include="*.ts" --include="*.tsx" src/
```

### Environment Variables

```bash
# Verify .env.example exists and documents all vars
cat .env.example

# Verify .env files are gitignored
cat .gitignore | grep -E "\.env"

# Verify production env vars are set (platform-specific)
# Vercel: vercel env ls
# Cloudflare: wrangler secret list
```

### Error Handling

Run: `grep -rn "try\|catch\|ErrorBoundary" --include="*.ts" --include="*.tsx" src/`
Verify:
- [ ] API calls have try/catch
- [ ] React Error Boundaries exist
- [ ] User-friendly error messages (not raw exceptions)
- [ ] No unhandled promise rejections

## ⛔ STOP GATE — Critical Checks
DO NOT approve deployment if ANY of these fail:
1. API key found in source code → 🔴 Immediate removal required
2. Missing `.env.example` → 🔴 Must document all env vars
3. No error handling on API calls → 🔴 Add try/catch
4. `.env` file tracked in git → 🔴 Remove and rotate all secrets

---

## 2. Important Checks (SHOULD Pass)

### Documentation

- [ ] README has project description
- [ ] README has setup instructions (`git clone` → `npm install` → `npm run dev`)
- [ ] README has deploy instructions
- [ ] API endpoints documented
- [ ] Environment variables listed in `.env.example`
- [ ] CHANGELOG updated (if versioned)

### Code Quality

```bash
# TypeScript strict mode
npx tsc --noEmit

# Linting
npm run lint

# Tests
npm run test
```

- [ ] TypeScript strict mode passing (zero errors)
- [ ] ESLint/Biome clean
- [ ] No TODO comments for critical features
- [ ] No commented-out code blocks
- [ ] Consistent naming conventions

### Testing

- [ ] Critical paths have tests
- [ ] Tests are passing
- [ ] No skipped tests without documented reason

---

## 3. Polish Checks (NICE to Have)

### Performance

- [ ] Images optimized (WebP, proper sizing)
- [ ] Bundle size checked (`npm run build` output)
- [ ] No `console.log` in production
- [ ] Loading states implemented
- [ ] Error states implemented

### Accessibility

- [ ] Alt text on images
- [ ] Form labels present
- [ ] Focus states visible
- [ ] Color contrast passes WCAG AA

### SEO (if applicable)

- [ ] Meta titles set
- [ ] Meta descriptions set
- [ ] OG images configured
- [ ] Sitemap generated

---

## 4. Deployment Blockers

| Issue | Severity | Action |
|-------|----------|--------|
| API key in code | 🔴 CRITICAL | Immediate removal, rotate key |
| Missing .env.example | 🔴 CRITICAL | Document all env vars |
| No error handling on API calls | 🔴 CRITICAL | Add try/catch |
| `.env` in git history | 🔴 CRITICAL | Remove, rotate all secrets |
| Tests failing | 🟡 IMPORTANT | Fix or document why skipped |
| README missing setup | 🟡 IMPORTANT | Add quick start section |
| No TypeScript strict | 🟡 IMPORTANT | Enable and fix errors |

---

## 5. CI/CD Integration

```yaml
# .github/workflows/pre-deploy.yml
name: Pre-Deployment Check

on:
  pull_request:
    branches: [main]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Check for secrets
        run: npx secretlint "**/*"

      - name: Check for .env files
        run: |
          if git ls-files | grep -E "\.env$|\.env\.local$"; then
            echo "ERROR: .env file found in repo"
            exit 1
          fi

  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1

      - run: bun install
      - run: bun run lint
      - run: bun run type-check
      - run: bun run test

  readme:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check README exists
        run: test -f README.md
      - name: Check .env.example exists
        run: test -f .env.example
```

---

## 6. Deployment Report Template

```markdown
## Pre-Deployment Report: [Project Name]

### Status: ✅ APPROVED / ❌ BLOCKED

### Critical Issues (Must Fix)
- [ ] [Issue 1] — evidence: [scan output]
- [ ] [Issue 2] — evidence: [scan output]

### Warnings (Should Fix)
- [ ] [Warning 1]

### Passed Checks
- [x] No secrets in code — evidence: grep returned 0 results
- [x] Environment variables documented — .env.example present
- [x] Error handling present — ErrorBoundary + try/catch confirmed
- [x] Tests passing — npm test exit code 0

### Environment Variables Verified
| Variable | Status |
|----------|--------|
| DATABASE_URL | ✅ Set |
| STRIPE_KEY | ✅ Set |

### Deployment Approved By
[Only after ALL critical issues resolved with evidence]
```

## ⛔ STOP GATE — Final Approval
DO NOT approve deployment without:
1. ALL critical scan commands run with output shown
2. Zero 🔴 CRITICAL findings remaining
3. Deployment report completed with evidence
4. This skill DOES NOT approve deployments with critical issues. No exceptions.

---

## NEVER

- **NEVER** deploy with secrets in source code
- **NEVER** deploy without `.env.example` documenting all variables
- **NEVER** deploy with failing critical tests
- **NEVER** deploy without error handling on API calls
- **NEVER** approve deployment without running scan commands
- **NEVER** skip evidence requirements — show the grep output
