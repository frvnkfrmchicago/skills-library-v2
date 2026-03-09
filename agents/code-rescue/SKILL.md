---
name: code-rescue
description: Inherit and modernize legacy codebases. Technical debt, refactoring strategies, security audits, and incremental modernization.
last_updated: 2026-03
owner: Frank
---

# Code Rescue

Inherit a nightmare codebase. Make it maintainable. Ship improvements without breaking production.

> **See also:** `agents/testing/SKILL.md`, `agents/security/SKILL.md`

---

## Context Questions

Before diving into a legacy codebase, ask:

1. **What's the business context?** — Active product, maintenance mode, migration target
2. **What's the tech stack?** — Languages, frameworks, databases, deployment
3. **What's the test coverage?** — None, minimal, comprehensive
4. **What's the team knowledge?** — Original devs gone, some docs, tribal knowledge
5. **What's the timeline?** — Quick fix, gradual improvement, full rewrite

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Approach** | Quick patch ←→ Incremental refactor ←→ Full rewrite |
| **Risk Tolerance** | Zero downtime ←→ Planned maintenance windows |
| **Documentation** | None ←→ Outdated ←→ Comprehensive |
| **Test Coverage** | 0% ←→ Critical paths ←→ Full coverage |
| **Tech Debt** | Cosmetic ←→ Architectural ←→ Foundational |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| No tests, active production | Add characterization tests before any changes |
| Unclear behavior | Map dependencies, trace request flows |
| Security concerns | Immediate audit, prioritize vulnerabilities |
| Performance issues | Profile first, optimize bottlenecks |
| Need quick fix | Minimal change, add tests for that fix |
| Major tech debt | Strangler fig pattern, incremental replacement |
| Database issues | Blue-green migrations, backward-compatible changes |

---

## TL;DR

| Strategy | When to Use |
|----------|-------------|
| **Strangler Fig** | Gradually replace monolith with new services |
| **Characterization Tests** | Capture current behavior before refactoring |
| **Boy Scout Rule** | Leave code cleaner than you found it |
| **Dependency Mapping** | Understand what connects to what |
| **Technical Debt Register** | Track and prioritize debt items |

---

## Part 1: Codebase Audit Methodology

### First 48 Hours Checklist

```markdown
Day 1 - Discovery:
- [ ] Clone repo, get it running locally
- [ ] Review README, docs, wiki
- [ ] Identify entry points (main, index, app)
- [ ] List all dependencies (package.json, requirements.txt)
- [ ] Check for environment variables
- [ ] Find database schemas/migrations
- [ ] Identify CI/CD pipeline

Day 2 - Analysis:
- [ ] Run static analysis tools
- [ ] Check test coverage (if any)
- [ ] Map high-level architecture
- [ ] Identify obvious pain points
- [ ] Talk to anyone with context
- [ ] Document initial findings
```

### Dependency Mapping

```python
# Python: Generate dependency graph
# pip install pipdeptree
# pipdeptree --graph-output png > dependencies.png

# Node.js: Analyze package dependencies
# npx depcheck
# npx madge --image graph.png src/
```

### File Analysis Script

```python
import os
from collections import Counter
from pathlib import Path

def analyze_codebase(root: str) -> dict:
    """Quick codebase statistics."""
    extensions = Counter()
    large_files = []
    old_files = []
    
    for path in Path(root).rglob("*"):
        if path.is_file() and not any(p in str(path) for p in ["node_modules", ".git", "__pycache__"]):
            extensions[path.suffix] += 1
            
            # Flag large files (> 500 lines)
            if path.suffix in [".py", ".js", ".ts", ".tsx"]:
                lines = len(path.read_text().splitlines())
                if lines > 500:
                    large_files.append((str(path), lines))
    
    return {
        "file_types": dict(extensions.most_common(10)),
        "large_files": sorted(large_files, key=lambda x: -x[1])[:20],
    }
```

---

## Part 2: Technical Debt Identification

### Code Complexity Analysis

```bash
# Python - Radon for complexity metrics
uv add radon
radon cc src/ -a -s  # Cyclomatic complexity
radon mi src/ -s     # Maintainability index

# JavaScript/TypeScript - ESLint complexity
npx eslint src/ --rule 'complexity: ["error", 10]'

# Multi-language - SonarQube (self-hosted or cloud)
docker run -d --name sonarqube -p 9000:9000 sonarqube
```

### Common Tech Debt Patterns

| Pattern | Symptom | Priority |
|---------|---------|----------|
| **God Objects** | Classes with 50+ methods, 1000+ lines | High |
| **Circular Dependencies** | Import loops, tight coupling | High |
| **Copy-Paste Code** | Duplicate logic across files | Medium |
| **Dead Code** | Unreachable, unused functions | Low |
| **Magic Numbers** | Hardcoded values without context | Low |
| **No Error Handling** | Bare try/catch, swallowed errors | High |
| **SQL Injection Risk** | String concatenation in queries | Critical |
| **Outdated Dependencies** | Major versions behind, CVEs | High |

### Technical Debt Register Template

```markdown
## Technical Debt Register

| ID | Description | Location | Impact | Effort | Priority |
|----|-------------|----------|--------|--------|----------|
| TD-001 | No input validation on user API | `api/users.py` | Security | 2h | P0 |
| TD-002 | Duplicate auth logic | `auth/`, `api/` | Maintainability | 4h | P1 |
| TD-003 | N+1 queries in dashboard | `views/dashboard.py` | Performance | 3h | P1 |
| TD-004 | No tests for payment flow | `payments/` | Risk | 8h | P0 |
```

---

## Part 3: Characterization Tests

Before changing legacy code, capture its current behavior.

### What Are Characterization Tests?

> "Tests that characterize the actual behavior of a piece of code, not the intended behavior."

### Writing Characterization Tests

```python
# Legacy function with unclear behavior
def calculate_discount(price, customer_type, quantity):
    # 200 lines of spaghetti code...
    pass

# Characterization test - capture actual output
def test_calculate_discount_characterization():
    """Captures actual behavior - update if intentionally changed."""
    
    # Document known behavior
    assert calculate_discount(100, "regular", 1) == 100
    assert calculate_discount(100, "premium", 1) == 90  # 10% off?
    assert calculate_discount(100, "regular", 10) == 850  # bulk discount?
    assert calculate_discount(100, "premium", 10) == 765  # both discounts?
    
    # Edge cases discovered
    assert calculate_discount(0, "regular", 1) == 0
    assert calculate_discount(-100, "regular", 1) == -100  # Bug? Feature?
```

### Golden Master Testing

```python
import json
from pathlib import Path

def golden_master_test(function, inputs: list, golden_file: str):
    """Compare function output against saved 'golden' results."""
    
    golden_path = Path(golden_file)
    results = [function(*args) for args in inputs]
    
    if not golden_path.exists():
        # First run: save the golden master
        golden_path.write_text(json.dumps(results, indent=2))
        print(f"Golden master saved to {golden_file}")
    else:
        # Compare against golden master
        expected = json.loads(golden_path.read_text())
        assert results == expected, "Behavior changed! Review changes."
```

---

## Part 4: Refactoring Strategies

### The Strangler Fig Pattern

Gradually replace legacy system piece by piece.

```
┌─────────────────────────────────────────────┐
│              Load Balancer / API Gateway     │
└─────────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │ Legacy   │  │ New      │  │ New      │
  │ Monolith │  │ Service  │  │ Service  │
  │ (shrink) │  │ Users    │  │ Payments │
  └──────────┘  └──────────┘  └──────────┘
```

### Implementation Steps

1. **Identify seam** — Find a module with clear boundaries
2. **Create facade** — Wrap legacy code with clean interface
3. **Build new service** — Implement same interface with new code
4. **Route traffic** — Gradually shift requests to new service
5. **Deprecate legacy** — Remove old code when fully migrated

### The Boy Scout Rule

> "Always leave the campground cleaner than you found it."

```python
# Before: Touching this file to fix a bug
def get_user(id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = " + str(id))  # SQL injection!
    result = cursor.fetchone()
    conn.close()
    return result

# After: Fix the bug AND clean up
def get_user(user_id: int) -> User | None:
    """Fetch user by ID."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()
        return User.from_row(row) if row else None
```

### Safe Refactoring Workflow

```bash
# 1. Create branch
git checkout -b refactor/user-service

# 2. Add characterization tests
# 3. Make small, focused changes
# 4. Run tests after each change
# 5. Commit frequently with clear messages

git commit -m "refactor(users): extract validation logic"
git commit -m "refactor(users): add type hints"
git commit -m "fix(users): remove SQL injection vulnerability"
```

---

## Part 5: Security Vulnerability Scanning

### Dependency Audits

```bash
# Python
pip-audit                          # Scan for known vulnerabilities
safety check                       # Alternative scanner

# Node.js
npm audit                          # Built-in audit
npx snyk test                      # More comprehensive

# Multi-language
docker run --rm -v $(pwd):/app aquasec/trivy fs /app
```

### Common Security Issues in Legacy Code

| Issue | How to Find | Fix |
|-------|-------------|-----|
| SQL Injection | Grep for string concatenation in queries | Parameterized queries |
| XSS | Grep for `innerHTML`, unescaped output | Sanitize, escape |
| Hardcoded Secrets | Grep for `password`, `secret`, `key` | Environment variables |
| Insecure Dependencies | `npm audit`, `pip-audit` | Update or replace |
| No HTTPS | Check config, network calls | Force HTTPS |
| Weak Auth | Check session handling, password storage | Implement proper auth |

### Quick Security Grep

```bash
# Find potential secrets
grep -rn "password\|secret\|api_key\|token" --include="*.py" --include="*.js"

# Find potential SQL injection
grep -rn "execute.*%" --include="*.py"
grep -rn "query.*\+" --include="*.js"

# Find potential XSS
grep -rn "innerHTML\|dangerouslySetInnerHTML" --include="*.js" --include="*.tsx"
```

---

## Part 6: Database Migration Patterns

### Blue-Green Migrations

1. **Expand** — Add new column/table (backward compatible)
2. **Migrate** — Copy/transform data
3. **Switch** — Update application to use new structure
4. **Contract** — Remove old column/table

```sql
-- Step 1: Expand (add new column, keep old)
ALTER TABLE users ADD COLUMN full_name VARCHAR(255);

-- Step 2: Migrate (backfill data)
UPDATE users SET full_name = CONCAT(first_name, ' ', last_name);

-- Step 3: Switch (deploy app using full_name)

-- Step 4: Contract (remove old columns - after verification)
ALTER TABLE users DROP COLUMN first_name;
ALTER TABLE users DROP COLUMN last_name;
```

### Safe Migration Checklist

- [ ] Migration is reversible (has down migration)
- [ ] Tested in staging with production-like data
- [ ] Application handles both old and new schema during deploy
- [ ] Indexes added for new columns used in queries
- [ ] Large table migrations happen in batches
- [ ] Backup taken before migration

---

## Part 7: AI-Powered Code Analysis

### Using LLMs for Code Understanding

```python
from anthropic import Anthropic

client = Anthropic()

def explain_legacy_code(code: str) -> str:
    """Use Claude to explain unclear legacy code."""
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1000,
        messages=[{
            "role": "user",
            "content": f"""Analyze this legacy code and explain:
1. What it does
2. Any bugs or issues you see
3. Suggested improvements

```
{code}
```"""
        }]
    )
    return response.content[0].text
```

### AI-Assisted Refactoring Workflow

1. **Understand** — Feed code to LLM, get explanation
2. **Document** — Generate missing docstrings
3. **Test** — Generate characterization tests
4. **Refactor** — Get refactoring suggestions
5. **Review** — Human validates all changes

---

## Part 8: Documentation Patterns

### Minimal Viable Documentation

```markdown
# System Overview

## Architecture
[Diagram or description of main components]

## Key Flows
1. User Registration: `api/auth.py` → `services/user.py` → `db/users`
2. Payment Processing: `api/payments.py` → `services/stripe.py` → webhooks

## Environment Variables
| Name | Description | Required |
|------|-------------|----------|
| DATABASE_URL | PostgreSQL connection string | Yes |
| STRIPE_KEY | Stripe API key | Yes |

## Running Locally
1. Clone repo
2. Copy `.env.example` to `.env`
3. Run `docker-compose up`
4. Visit `http://localhost:3000`

## Known Issues
- [ ] Dashboard slow with >1000 users (N+1 query)
- [ ] Email sending occasionally fails (retry logic needed)
```

### Decision Log (ADR Pattern)

```markdown
# ADR-001: Replace jQuery with React

## Status
Accepted

## Context
Dashboard uses jQuery spaghetti, hard to maintain, no component reuse.

## Decision
Incrementally migrate to React using strangler fig pattern.

## Consequences
- New features built in React
- jQuery pages migrated when touched
- Bundle size temporarily increases
- Team needs React training
```

---

## Checklist

Initial Assessment:
- [ ] Repo cloned and running locally
- [ ] Dependencies documented
- [ ] Architecture mapped
- [ ] Pain points identified
- [ ] Test coverage measured

Before Changes:
- [ ] Characterization tests added
- [ ] Security audit completed
- [ ] Dependencies updated (if safe)
- [ ] Backup/rollback plan

During Refactoring:
- [ ] Small, focused commits
- [ ] Tests passing after each change
- [ ] Boy Scout Rule applied
- [ ] Documentation updated

Production:
- [ ] Staged rollout plan
- [ ] Monitoring in place
- [ ] Rollback tested
- [ ] Team trained on new patterns

---

## Related Skills

- `agents/testing/SKILL.md` — Test patterns
- `agents/security/SKILL.md` — Security practices
- `ai-builder/docker/SKILL.md` — Containerization
- `agents/deployment/SKILL.md` — CI/CD patterns
