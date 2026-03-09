---
name: exit-gating
description: >
  Final ship checklist with STOP gates that block deployment until all
  critical checks pass. Verifies security sign-off, code audit, secret
  scanning, auth coverage, build health, and production readiness. Use
  before deploying to production, before launches, when user says "ship it",
  or when checking if a project is ready to go live.
---

# Exit Gating

The final checkpoint before shipping. Nothing deploys until Exit says go.

---

## ⛔ STOP GATE — Critical (Cannot Ship Without)

Run each check. If ANY fails, deployment is **BLOCKED**.

### 1. Security Audit

Run:
```bash
grep -rn "sk_live\|sk_test\|password\s*=\|api_key\s*=" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.env*" src/ app/
```
If any hardcoded secrets found → 🔴 **BLOCKED**

Run:
```bash
npm audit --audit-level=critical
```
If critical vulnerabilities found → 🔴 **BLOCKED**

### 2. Auth Coverage

Run:
```bash
grep -rn "APIRouter\|router\.\|app\.\(get\|post\|put\|delete\)" --include="*.ts" --include="*.py" src/ app/ api/
```
Run:
```bash
grep -rn "auth\|middleware\|protect\|verify\|session" --include="*.ts" --include="*.py" src/ app/ api/
```
Compare outputs. Any endpoint without auth middleware → 🔴 **BLOCKED**

### 3. Environment Variables

Run:
```bash
grep -rn "NEXT_PUBLIC_\|VITE_" --include="*.ts" --include="*.tsx" src/ app/ | grep -i "secret\|key\|password\|token"
```
If secrets are exposed to client → 🔴 **BLOCKED**

Verify `.env` files are in `.gitignore`:
```bash
grep -n "\.env" .gitignore
```

### 4. Build Health

Run:
```bash
npm run build
```
If build fails → 🔴 **BLOCKED**

Run (if TypeScript):
```bash
npx tsc --noEmit
```
If type errors → 🔴 **BLOCKED**

---

## ⛔ STOP GATE — Important (Should Have)

### 5. Code Quality

Run:
```bash
npm run lint
```
Fix all errors. Warnings are acceptable for ship.

Run:
```bash
grep -rn "console\.\(log\|debug\|warn\)" --include="*.ts" --include="*.tsx" src/ app/ | grep -v "// keep" | head -20
```
Remove all non-intentional console statements.

### 6. Dead Code

Run:
```bash
grep -rn "TODO\|FIXME\|HACK\|XXX" --include="*.ts" --include="*.tsx" src/ app/
```
Address HIGH-priority items. Document LOW-priority in tech debt log.

### 7. Error Handling

Verify:
- [ ] API calls have try/catch or error boundaries
- [ ] Loading states exist for async operations
- [ ] User-facing error messages are helpful, not technical
- [ ] 404 and error pages exist

---

## 🟢 Nice to Have

### 8. Polish

- [ ] README is current with setup instructions
- [ ] CHANGELOG updated for this release
- [ ] Performance baseline captured (Lighthouse score)
- [ ] Responsive design tested on mobile
- [ ] Cross-browser tested (Chrome, Safari, Firefox)

---

## Pre-Ship Quick Checks

Run these in sequence:

```bash
# 1. Build passes
npm run build

# 2. Types pass (TypeScript)
npx tsc --noEmit

# 3. Lint passes
npm run lint

# 4. No secrets in code
grep -rn "sk_live\|password\s*=" --include="*.ts" --include="*.tsx" src/

# 5. Preview deploy works
# Deploy to preview URL and test manually
```

---

## Exit Status Report Template

```markdown
## Exit Status Report

### Project: [Name]
### Date: [Date]
### Version: [Version]

### Gate Results

| Gate | Status | Evidence |
|------|--------|----------|
| Security Audit | ✅/🔴 | [npm audit output, grep results] |
| Auth Coverage | ✅/🔴 | [endpoint count vs auth count] |
| Env Var Safety | ✅/🔴 | [grep results] |
| Build Health | ✅/🔴 | [build output] |
| Code Quality | ✅/🟡 | [lint output] |
| Dead Code | ✅/🟡 | [TODO count] |
| Error Handling | ✅/🟡 | [checklist results] |

### Critical Issues
[Any blockers listed here]

### Ship Decision
✅ **Ready to ship** / 🔴 **BLOCKED — [reason]**
```

---

## ⛔ FINAL STOP GATE

DO NOT mark this project as ship-ready without:
1. Running ALL critical gate commands above
2. Showing grep/command output as evidence
3. Documenting every finding in the Exit Status Report
4. Getting explicit "ship it" confirmation from the project owner
