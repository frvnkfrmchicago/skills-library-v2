---
name: security-auditing
description: >
  Audits API authentication, CORS, rate limiting, secrets exposure, input
  validation, prompt injection, and dependency vulnerabilities for FastAPI,
  Express, Next.js, Django, and Flask backends. Use when reviewing backend
  code, before deployment, when backend/ or server/ files change, or when
  user mentions security, production readiness, or vulnerability scanning.
---

# Security Auditing

Comprehensive security audit skill for AI-assisted codebases. Converts every
checklist item into a scan-and-verify directive — no guessing, no skipping.

---

## Phase 1: Secrets Scan

### Node.js / Next.js

Run:
```bash
grep -rn --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.env" --include="*.json" \
  -E "(sk-|sk_live|sk_test|pk_live|pk_test|api_key|apiKey|API_KEY|secret|SECRET|password|PASSWORD|token|TOKEN|PRIVATE_KEY|aws_access|STRIPE)" \
  src/ app/ pages/ components/ lib/ utils/ 2>/dev/null
```

Verify `.gitignore` protects secrets:
```bash
grep -n "\.env" .gitignore 2>/dev/null || echo "🔴 CRITICAL: No .env entry in .gitignore"
```

Check client-side exposure (Next.js — only `NEXT_PUBLIC_*` should be client-accessible):
```bash
grep -rn "process.env\." src/ app/ pages/ components/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "NEXT_PUBLIC\|VITE_\|NODE_ENV"
```

### Python / FastAPI / Django

Run:
```bash
grep -rn --include="*.py" --include="*.env" --include="*.yaml" --include="*.yml" \
  -E "(sk-|api_key|API_KEY|secret|SECRET|password|PASSWORD|token|TOKEN|PRIVATE_KEY|aws_access|DATABASE_URL)" \
  . 2>/dev/null | grep -v "venv/\|\.venv/\|node_modules/\|__pycache__/"
```

Check for hardcoded credentials in settings:
```bash
grep -rn --include="*.py" "SECRET_KEY\|DB_PASSWORD\|API_KEY" . 2>/dev/null | grep -v "os.environ\|os.getenv\|settings\.\|config\."
```

If any secret pattern is found hardcoded in source, flag as 🔴 CRITICAL.

### ⛔ STOP GATE — Secrets
DO NOT mark this phase passed without:
1. Running BOTH Node.js and Python scan commands above
2. Showing the grep output as evidence
3. Listing every exposed secret found (or confirming zero results)

---

## Phase 2: Prompt Injection Protection

Scan for AI/LLM integration points:
```bash
grep -rn "openai\|anthropic\|gemini\|langchain\|ai-sdk\|generateText\|streamText\|chat.completions" \
  src/ lib/ app/ --include="*.ts" --include="*.tsx" --include="*.py" 2>/dev/null
```

Check if user input flows directly to AI without sanitization:
```bash
grep -rn "prompt\|messages\|content.*user" src/ lib/ --include="*.ts" --include="*.py" 2>/dev/null \
  | grep -i "request\|req\.\|body\.\|params\.\|query\."
```

Verify injection pattern blocking exists. Search for:
```bash
grep -rn "ignore previous\|disregard\|system prompt\|jailbreak\|act as\|pretend" src/ lib/ --include="*.ts" --include="*.py" 2>/dev/null
```

If user input reaches an LLM call without sanitization or delimiter tags, flag as 🔴 CRITICAL.

---

## Phase 3: Authentication & Authorization

### Route Protection Scan (Node.js)

```bash
find src/ app/ pages/ -name "route.ts" -o -name "route.js" -o -name "*.api.ts" 2>/dev/null | while read f; do
  if ! grep -l "auth\|session\|getServerSession\|currentUser\|requireAuth\|middleware" "$f" > /dev/null 2>&1; then
    echo "🔴 UNPROTECTED: $f"
  fi
done
```

### Route Protection Scan (Python / FastAPI)

```bash
grep -rn --include="*.py" "APIRouter\|@app\.\|@router\." . 2>/dev/null
grep -rn --include="*.py" "Depends.*auth\|Depends.*verify\|login_required\|permission_classes" . 2>/dev/null
```

Compare outputs. Any endpoint without auth dependency = 🔴 CRITICAL.

### Route Protection Scan (Django)

```bash
grep -rn --include="*.py" "path(\|url(\|re_path(" . 2>/dev/null | grep -v "admin\|static\|media"
grep -rn --include="*.py" "@login_required\|@permission_required\|IsAuthenticated" . 2>/dev/null
```

### Session Security

```bash
grep -rn "httpOnly\|secure\|sameSite\|maxAge\|cookie" src/ app/ lib/ --include="*.ts" --include="*.tsx" --include="*.py" 2>/dev/null
```

If any protected route lacks auth middleware, flag as 🔴 CRITICAL.

### ⛔ STOP GATE — Auth
DO NOT mark this phase passed without:
1. Listing every API route/endpoint found
2. Listing which ones have auth middleware
3. Flagging every unprotected route

---

## Phase 4: Input Validation

### SQL / NoSQL Injection

```bash
# Raw SQL queries (should use parameterized queries)
grep -rn "raw\|rawQuery\|\$queryRaw\|\$executeRaw" src/ lib/ --include="*.ts" --include="*.tsx" 2>/dev/null

# Python raw SQL
grep -rn --include="*.py" "execute(\|raw(\|RawSQL\|cursor\." . 2>/dev/null | grep -v "venv/"

# String concatenation in queries
grep -rn "SELECT.*+\|INSERT.*+\|UPDATE.*+\|DELETE.*+" src/ lib/ --include="*.ts" --include="*.py" 2>/dev/null
```

### XSS (Cross-Site Scripting)

```bash
grep -rn "dangerouslySetInnerHTML\|innerHTML\|__html" src/ app/ components/ --include="*.tsx" --include="*.ts" 2>/dev/null
grep -rn "eval(\|new Function(" src/ --include="*.ts" --include="*.tsx" --include="*.js" 2>/dev/null

# Python: Jinja2 unescaped output
grep -rn --include="*.html" --include="*.jinja" "| safe\|Markup(\|mark_safe" . 2>/dev/null
```

### Zod / Pydantic Validation Check

```bash
# Node: Check for Zod schema validation on API inputs
grep -rn "z\.\|zod\|zodResolver" src/ app/ --include="*.ts" --include="*.tsx" 2>/dev/null | head -20

# Python: Check for Pydantic models on API inputs
grep -rn --include="*.py" "BaseModel\|Field(\|validator\|field_validator" . 2>/dev/null | head -20
```

If user input reaches a database query without validation, flag as 🔴 CRITICAL.

---

## Phase 5: CORS & Rate Limiting

### CORS Check

```bash
grep -rn "allow_origins\|CORSMiddleware\|cors\|Access-Control" src/ app/ lib/ --include="*.ts" --include="*.tsx" --include="*.py" 2>/dev/null
```

If origins contain `"*"` (wildcard), flag as 🔴 CRITICAL.
If origins are hardcoded strings (not read from env var), flag as 🟡 WARNING.

### Rate Limiting Check

```bash
grep -rn "rateLimit\|rate_limit\|throttle\|RateLimiter\|slowapi\|limiter" src/ app/ lib/ --include="*.ts" --include="*.py" 2>/dev/null
```

If no rate limiting is found on auth or AI endpoints, flag as 🟡 WARNING.

---

## Phase 6: Dependency Audit

```bash
# Node.js
npm audit --audit-level=high 2>/dev/null || echo "npm audit not available"

# Python
pip audit 2>/dev/null || echo "pip audit not available — install: pip install pip-audit"
safety check 2>/dev/null || echo "safety not available — install: pip install safety"

# Lock file present
test -f package-lock.json && echo "✅ package-lock.json exists" || echo "🟡 No package-lock.json"
test -f requirements.txt && echo "✅ requirements.txt exists" || echo "Checking for pyproject.toml..."
test -f pyproject.toml && echo "✅ pyproject.toml exists" || true
```

---

## Phase 7: Information Leakage

```bash
# Console output that might leak data
grep -rn "console.log\|console.debug" src/ app/ components/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "node_modules\|\.test\.\|\.spec\." | wc -l

# Python print statements in production code
grep -rn --include="*.py" "print(" . 2>/dev/null | grep -v "venv/\|test_\|__pycache__/" | wc -l

# Source maps in production
find .next/ dist/ build/ out/ -name "*.map" 2>/dev/null | head -10
```

---

## Phase 8: Pre-Deploy Security Gate

```bash
# Run all checks in sequence
npm audit 2>/dev/null
grep -rn "\.env" .gitignore 2>/dev/null
grep -rn --include="*.ts" --include="*.tsx" --include="*.py" "console.log\|print(" src/ app/ 2>/dev/null | grep -v test | wc -l
```

### ⛔ STOP GATE — Pre-Deploy
DO NOT clear for deployment without:
1. Zero 🔴 CRITICAL findings remaining
2. All auth routes verified with middleware
3. `npm audit` or `pip audit` showing no critical vulnerabilities
4. No secrets in source code

---

## Output Format

```markdown
## Security Audit Report — [Project Name]

### Summary
| Category | Issues | Severity |
|----------|--------|----------|
| Secrets Exposure | X | 🔴/🟢 |
| Prompt Injection | X | 🔴/🟡/🟢 |
| Auth & Authorization | X | 🔴/🟡/🟢 |
| Input Validation | X | 🔴/🟡/🟢 |
| CORS & Rate Limiting | X | 🔴/🟡/🟢 |
| Dependencies | X | 🔴/🟡/🟢 |
| Information Leakage | X | 🔴/🟡/🟢 |

### 🔴 Critical Issues (Fix Before Deploy)

#### [Issue N]
**Type:** [Secret Exposure / Injection / Auth Bypass / etc.]
**Location:** [file:line]
**Risk:** [What could happen]
**Fix:** [Exact solution]

### 🟡 Warnings (Fix Before Ship)
[Same format]

### ✅ Passed Checks
[What's secured correctly]
```
