---
name: hacker-scanning
description: >
  Performs offensive security scanning of a workspace like an attacker would.
  Runs secrets grep, dependency audit, route protection analysis, injection
  testing, and HTTP header verification for Node.js, Python, FastAPI, Django,
  and React Native projects. Use when scanning for vulnerabilities, before
  deploying to production, when user mentions hacking, penetration testing,
  attack surface, or offensive security review.
---

# Hacker Scanning

Offensive security auditor that actively scans the workspace for
vulnerabilities the way an attacker would. Does not read checklists — runs
commands, inspects files, and reports findings with exact file paths and
line numbers.

---

## STOP — Environment Detection

Before running any scan, determine the environment:

**Local Development indicators:**
- Running on localhost or 127.0.0.1
- `.env.local` file present
- Development server running (`npm run dev`, `expo start`, `python manage.py runserver`)

**Deployed/Production indicators:**
- Running on a public domain (`https://...`)
- SSL certificate active
- Environment variables set via hosting platform

**State which environment you are auditing before running any scans.**

---

## Phase 1: Secrets Scan (Run First, Always)

### Find Exposed API Keys

Run:
```bash
grep -rn --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.env" --include="*.json" \
  -E "(sk-|sk_live|sk_test|pk_live|pk_test|api_key|apiKey|API_KEY|secret|SECRET|password|PASSWORD|token|TOKEN|PRIVATE_KEY|aws_access|STRIPE)" \
  src/ app/ pages/ components/ lib/ utils/ 2>/dev/null
```

Run (Python):
```bash
grep -rn --include="*.py" --include="*.env" --include="*.yaml" --include="*.yml" \
  -E "(sk-|api_key|API_KEY|secret|SECRET|password|PASSWORD|token|TOKEN|PRIVATE_KEY|aws_access|DATABASE_URL)" \
  . 2>/dev/null | grep -v "venv/\|\.venv/\|node_modules/\|__pycache__/"
```

Verify `.gitignore` protects secrets:
```bash
grep -n "\.env" .gitignore 2>/dev/null || echo "🔴 CRITICAL: No .env entry in .gitignore"
```

Check git history for accidentally committed secrets:
```bash
git log --all --diff-filter=A -- "*.env" "*.env.*" 2>/dev/null | head -20
```

### Check Client-Side Exposure

Run:
```bash
# Next.js: only NEXT_PUBLIC_* should be client-accessible
grep -rn "process.env\." src/ app/ pages/ components/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "NEXT_PUBLIC\|VITE_\|NODE_ENV"

# Vite: only VITE_ prefixed vars are exposed
grep -rn "import.meta.env\." src/ --include="*.ts" --include="*.tsx" 2>/dev/null

# API keys in client-side fetch calls
grep -rn "Authorization\|Bearer\|x-api-key" src/ components/ --include="*.ts" --include="*.tsx" --include="*.py" 2>/dev/null
```

**Severity: 🔴 CRITICAL. Any finding here is a stop-everything fix.**

### ⛔ STOP GATE — Secrets
DO NOT proceed to Phase 2 without:
1. Running ALL grep commands above and showing output
2. Listing every exposed secret with file:line
3. Confirming `.gitignore` protects `.env` files

---

## Phase 2: Dependency Audit

Run:
```bash
# Node.js
npm audit --audit-level=high 2>/dev/null
npm list --depth=0 2>/dev/null

# Python
pip audit 2>/dev/null || echo "Install: pip install pip-audit"
```

### Lock File Integrity

Run:
```bash
test -f package-lock.json && echo "✅ Lock file exists" || echo "🔴 CRITICAL: No lock file"
grep "resolved" package-lock.json 2>/dev/null | grep -v "registry.npmjs.org" | head -10
```

If any resolved URL points to an unexpected registry, flag as 🔴 CRITICAL.

### Supply Chain Attack Vectors

Run:
```bash
# Pre/post install scripts in dependencies (common attack vector)
find node_modules -name "package.json" -maxdepth 2 -exec grep -l "preinstall\|postinstall" {} \; 2>/dev/null | head -20

# Recently added dependencies
git diff HEAD~10 package.json 2>/dev/null | grep "^+" | grep -v "version\|resolved\|integrity"

# Known supply chain attack packages
npm list --depth=0 2>/dev/null | grep -i "colors\|faker\|event-stream\|ua-parser-js\|coa\|rc"
```

---

## Phase 3: Authentication & Authorization

### Route Protection Scan

Run (Node.js / Next.js):
```bash
find src/ app/ pages/ -name "route.ts" -o -name "route.js" -o -name "*.api.ts" 2>/dev/null | while read f; do
  if ! grep -l "auth\|session\|getServerSession\|currentUser\|requireAuth\|middleware" "$f" > /dev/null 2>&1; then
    echo "🔴 UNPROTECTED: $f"
  fi
done
```

Run (Next.js server actions):
```bash
grep -rn "use server" app/ src/ --include="*.ts" --include="*.tsx" 2>/dev/null | while read line; do
  file=$(echo "$line" | cut -d: -f1)
  if ! grep -l "auth\|session\|currentUser" "$file" > /dev/null 2>&1; then
    echo "🔴 UNPROTECTED SERVER ACTION: $file"
  fi
done
```

Run (Python / FastAPI):
```bash
grep -rn --include="*.py" "APIRouter\|@app\.\|@router\." . 2>/dev/null
grep -rn --include="*.py" "Depends.*auth\|Depends.*verify\|Depends.*get_current" . 2>/dev/null
```

Run (Django):
```bash
grep -rn --include="*.py" "path(\|url(" . 2>/dev/null | grep -v "admin\|static"
grep -rn --include="*.py" "@login_required\|@permission_required\|IsAuthenticated" . 2>/dev/null
```

Compare outputs. Any endpoint without auth = 🔴 CRITICAL.

### Admin Routes Without Role Checking

Run:
```bash
grep -rn "admin\|dashboard" app/ src/ pages/ --include="*.ts" --include="*.tsx" --include="*.py" -l 2>/dev/null | while read f; do
  if ! grep -l "role\|isAdmin\|permission\|authorize\|is_staff\|is_superuser" "$f" > /dev/null 2>&1; then
    echo "🔴 NO ROLE CHECK: $f"
  fi
done
```

### ⛔ STOP GATE — Auth
DO NOT proceed without listing every route and its auth status.

---

## Phase 4: Input Validation & Injection

### SQL / NoSQL Injection

Run:
```bash
# Raw SQL (Node.js)
grep -rn "raw\|rawQuery\|\$queryRaw\|\$executeRaw" src/ lib/ --include="*.ts" --include="*.tsx" 2>/dev/null

# Raw SQL (Python)
grep -rn --include="*.py" "execute(\|raw(\|RawSQL\|cursor\.\|text(" . 2>/dev/null | grep -v "venv/"

# String concatenation in queries
grep -rn "SELECT.*+\|INSERT.*+\|UPDATE.*+\|DELETE.*+" src/ lib/ --include="*.ts" --include="*.py" 2>/dev/null

# NoSQL injection
grep -rn "\$where\|\$regex\|\$gt\|\$lt\|\$ne" src/ lib/ --include="*.ts" 2>/dev/null
```

### XSS (Cross-Site Scripting)

Run:
```bash
grep -rn "dangerouslySetInnerHTML\|innerHTML\|__html" src/ app/ components/ --include="*.tsx" --include="*.ts" 2>/dev/null
grep -rn "eval(\|new Function(" src/ --include="*.ts" --include="*.tsx" --include="*.js" 2>/dev/null
grep -rn --include="*.html" --include="*.jinja" "| safe\|Markup(\|mark_safe" . 2>/dev/null
```

### File Upload Risks

Run:
```bash
grep -rn "upload\|multer\|formidable\|busboy\|File\|Blob\|UploadFile" src/ app/ --include="*.ts" --include="*.tsx" --include="*.py" 2>/dev/null
grep -rn "mimetype\|content-type\|file.type\|accept=" src/ --include="*.ts" --include="*.tsx" --include="*.py" 2>/dev/null
```

---

## Phase 5: Information Leakage

Run:
```bash
# Console output leaking data
grep -rn "console.log\|console.debug\|console.info" src/ app/ components/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "node_modules\|\.test\.\|\.spec\." | wc -l

# Python print statements
grep -rn --include="*.py" "print(" . 2>/dev/null | grep -v "venv/\|test_\|__pycache__/" | wc -l

# Debug code left behind
grep -rn "TODO\|FIXME\|HACK\|XXX\|DEBUG\|TEMP" src/ app/ --include="*.ts" --include="*.tsx" --include="*.py" 2>/dev/null

# Source maps in production
find .next/ dist/ build/ out/ -name "*.map" 2>/dev/null | head -10

# Stack traces exposed
grep -rn "stack\|stackTrace\|Error(" src/ app/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -i "response\|res\.\|json\|send"
```

---

## Phase 6: 2026 AI-Specific Threats

### Prompt Injection

Run:
```bash
grep -rn "openai\|anthropic\|gemini\|langchain\|ai-sdk\|generateText\|streamText\|chat.completions" \
  src/ lib/ app/ --include="*.ts" --include="*.tsx" --include="*.py" 2>/dev/null
```

Verify: does user input flow directly to AI without sanitization?
```bash
grep -rn "prompt\|messages\|content.*user" src/ lib/ --include="*.ts" --include="*.py" 2>/dev/null \
  | grep -i "request\|req\.\|body\.\|params\.\|query\."
```

### Mobile-Specific (React Native / Expo)

Run:
```bash
# Hardcoded URLs
grep -rn "http://\|https://" src/ app/ --include="*.ts" --include="*.tsx" 2>/dev/null \
  | grep -v "node_modules\|localhost\|127.0.0.1\|schema.org\|w3.org\|fonts.googleapis"

# Sensitive data in AsyncStorage (not encrypted)
grep -rn "AsyncStorage\|SecureStore\|Keychain" src/ --include="*.ts" --include="*.tsx" 2>/dev/null

# Deep link handling without validation
grep -rn "Linking\|deepLink\|universal.*link\|expo-linking" src/ --include="*.ts" --include="*.tsx" 2>/dev/null
```

---

## Phase 7: HTTP Headers (Deployed Only)

Only run against a deployed URL — not applicable to localhost.

Run:
```bash
curl -sI https://YOUR-DOMAIN.com | grep -iE "strict-transport|x-frame|x-content-type|content-security|referrer-policy|permissions-policy"
```

Verify these headers exist:
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `X-Frame-Options: DENY` or `SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Content-Security-Policy: default-src 'self'; ...`
- `Referrer-Policy: strict-origin-when-cross-origin`

---

## Output Format

```markdown
## Hacker Attacker Report — [Project Name]

### Environment
[Local / Deployed] — [URL or localhost:PORT]

### 🔴 Critical Findings (Fix Immediately)

#### [Finding N]
- **Type:** [Secret Exposure / Injection / Auth Bypass / etc.]
- **File:** [exact/path/to/file.ts:LINE]
- **Evidence:** [What was found]
- **Impact:** [What an attacker could do]
- **Fix:** [Exact steps to remediate]

### 🟡 Warnings (Fix Before Ship)
[Same format]

### ✅ Passed Scans
- [x] No secrets in source code
- [x] Dependencies up to date
- [x] Auth on all protected routes
- [x] Input validation present

### Attack Surface Summary
| Surface | Exposure Level |
|---------|---------------|
| API Endpoints | [count] endpoints, [count] unprotected |
| Client-Side Secrets | [count] found |
| Dependencies | [count] critical, [count] high |
| AI Integration Points | [count] — [count] sanitized |
```
