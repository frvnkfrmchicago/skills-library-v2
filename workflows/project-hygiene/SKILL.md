# Project Hygiene Skill

**Run this after major changes to catch common filesystem and code quality issues.**

---

## Context Questions

Before running hygiene checks, ask:

1. **What triggered this check?** — Major refactor, before deploy, weekly maintenance, something broke
2. **What's the project state?** — Active development, stable, legacy, new setup
3. **What issues are suspected?** — Corrupted files, outdated versions, broken links, general cleanup
4. **What's the fix tolerance?** — Auto-fix everything, review before fixing, audit only
5. **What's the scope?** — Full project, specific directory, just changed files

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| Scope | Quick scan ←→ Full audit |
| Action | Report only ←→ Auto-fix everything |
| Frequency | One-time ←→ Scheduled routine |
| Depth | Surface issues ←→ Deep validation |
| Risk | Safe changes only ←→ Aggressive cleanup |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Before deployment | Full hygiene check + version audit |
| After major refactor | Corrupted folders + empty directories + broken links |
| Weekly maintenance | Quick check (junk files, outdated versions) |
| Something suddenly broke | Check for corrupted files, broken symlinks first |
| New team member setup | Full audit + document findings |
| CI/CD pipeline | Automated hygiene script in pre-deploy |

---

## TL;DR

Quick commands to audit your project:

```bash
# Run all hygiene checks
./hygiene-check.sh

# Or run individually:
# 1. Find corrupted folder names (glob patterns as folders)
find . -type d -name '*{*' -o -name '*}*' -o -name '*,*' 2>/dev/null

# 2. Find orphan files (common junk)
find . -name '.DS_Store' -o -name 'Thumbs.db' -o -name '*.swp' -o -name '*~' 2>/dev/null

# 3. Find empty directories
find . -type d -empty 2>/dev/null

# 4. Find duplicate SKILL.md files (should be 1 per folder)
find . -name "SKILL.md" -exec dirname {} \; | sort | uniq -d

# 5. Find broken symlinks
find . -type l ! -exec test -e {} \; -print 2>/dev/null
```

---

## Common Issues to Check

### 1. Corrupted Folder Names

**Cause:** Glob patterns (`{a,b,c}`) interpreted as literal folder names.

```bash
# FIND: Folders with braces or commas (usually wrong)
find . -type d \( -name '*{*' -o -name '*}*' -o -name '*,*' \) 2>/dev/null

# FIX: Delete them (after confirming they're junk)
# rm -rf "path/to/corrupted/folder"
```

**Prevention:** Always quote paths in scripts. Use `"$variable"` not `$variable`.

---

### 2. Orphan System Files

**Cause:** macOS/Windows create hidden files automatically.

```bash
# FIND
find . -name '.DS_Store' -o -name 'Thumbs.db' -o -name '*.swp' -o -name '*~' -o -name '.AppleDouble' 2>/dev/null

# FIX: Delete all
find . -name '.DS_Store' -delete
find . -name 'Thumbs.db' -delete
find . -name '*.swp' -delete

# PREVENT: Add to .gitignore
echo ".DS_Store
Thumbs.db
*.swp
*~
.AppleDouble" >> .gitignore
```

---

### 3. Empty Directories

**Cause:** Files deleted but folder remains.

```bash
# FIND
find . -type d -empty 2>/dev/null

# FIX: Delete empty dirs
find . -type d -empty -delete
```

---

### 4. Duplicate or Misplaced Files

**Cause:** Copy/paste errors, failed moves.

```bash
# FIND: Files with "copy" or numbers in name
find . -name "*copy*" -o -name "* (1)*" -o -name "* (2)*" 2>/dev/null

# FIND: Multiple package.json (should be 1 per package)
find . -name "package.json" | head -20

# FIND: Nested node_modules (usually wrong)
find . -path "*/node_modules/*/node_modules" -type d 2>/dev/null | head -5
```

---

### 5. Case Sensitivity Issues

**Cause:** macOS is case-insensitive by default, Linux is not.

```bash
# FIND: Files that differ only by case
find . -type f | sort -f | uniq -di

# COMMON PROBLEMS:
# README.md vs readme.md
# Component.tsx vs component.tsx
```

---

### 6. Path Length Issues

**Cause:** Windows max path is 260 chars.

```bash
# FIND: Paths longer than 200 chars (warning zone)
find . -type f | awk 'length > 200 { print length, $0 }' | sort -rn | head -10
```

---

### 7. Broken Internal Links (Markdown)

**Cause:** Files moved but links not updated.

```bash
# FIND: All .md files with relative links
grep -r "\[.*\](\./" --include="*.md" . | head -20

# Manual check: Verify each link target exists
```

---

### 8. Outdated References

**Cause:** Versions updated in some files but not all.

```bash
# FIND: Old Next.js versions
grep -r "Next.js 14" --include="*.md" .
grep -r "Next.js 13" --include="*.md" .

# FIND: Old React versions  
grep -r "React 18" --include="*.md" . | grep -v "18+"

# FIND: Old Node versions in CI
grep -r "node-version: '20'" --include="*.yml" --include="*.yaml" .
grep -r "node-version: 20" --include="*.yml" --include="*.yaml" .
```

---

## Full Hygiene Check Script

Save as `hygiene-check.sh` in project root:

```bash
#!/bin/bash

echo "=== PROJECT HYGIENE CHECK ==="
echo ""

# 1. Corrupted folder names
echo "🔍 Checking for corrupted folder names..."
CORRUPTED=$(find . -type d \( -name '*{*' -o -name '*}*' \) 2>/dev/null | grep -v node_modules | grep -v .git)
if [ -n "$CORRUPTED" ]; then
    echo "❌ FOUND corrupted folders:"
    echo "$CORRUPTED"
else
    echo "✅ No corrupted folders"
fi
echo ""

# 2. Empty directories
echo "🔍 Checking for empty directories..."
EMPTY=$(find . -type d -empty 2>/dev/null | grep -v node_modules | grep -v .git)
if [ -n "$EMPTY" ]; then
    echo "⚠️  FOUND empty directories:"
    echo "$EMPTY"
else
    echo "✅ No empty directories"
fi
echo ""

# 3. System junk files
echo "🔍 Checking for system junk..."
JUNK=$(find . -name '.DS_Store' -o -name 'Thumbs.db' 2>/dev/null | grep -v node_modules | head -5)
if [ -n "$JUNK" ]; then
    echo "⚠️  FOUND junk files (first 5):"
    echo "$JUNK"
else
    echo "✅ No junk files"
fi
echo ""

# 4. Outdated version references
echo "🔍 Checking for outdated versions..."
OLD_NEXT=$(grep -r "Next.js 14" --include="*.md" . 2>/dev/null | grep -v node_modules | head -3)
OLD_NODE=$(grep -r "node-version: '20'" --include="*.yml" --include="*.yaml" . 2>/dev/null | head -3)
if [ -n "$OLD_NEXT" ] || [ -n "$OLD_NODE" ]; then
    echo "❌ FOUND outdated references:"
    [ -n "$OLD_NEXT" ] && echo "$OLD_NEXT"
    [ -n "$OLD_NODE" ] && echo "$OLD_NODE"
else
    echo "✅ No outdated version references"
fi
echo ""

# 5. Broken symlinks
echo "🔍 Checking for broken symlinks..."
BROKEN=$(find . -type l ! -exec test -e {} \; -print 2>/dev/null | grep -v node_modules)
if [ -n "$BROKEN" ]; then
    echo "❌ FOUND broken symlinks:"
    echo "$BROKEN"
else
    echo "✅ No broken symlinks"  
fi
echo ""

# Summary
echo "=== HYGIENE CHECK COMPLETE ==="
```

Make executable: `chmod +x hygiene-check.sh`

---

## When to Run

| Trigger | Action |
|---------|--------|
| After major refactor | Full hygiene check |
| Before git commit | Quick: corrupted folders + junk files |
| Before deployment | Full hygiene check + version audit |
| Weekly (if active) | Full hygiene check |

---

## Integration with AI Workflows

Add to your prompts:

```
"Before we finish, run a hygiene check:
1. find . -type d -name '*{*' (corrupted folders)
2. grep -r 'Next.js 14' --include='*.md' . (outdated versions)
3. find . -type d -empty (empty dirs)"
```

Or add to `WORKFLOW-GUIDE.md`:

```
## End-of-Session Checklist
- [ ] Run hygiene-check.sh
- [ ] Verify no corrupted folder names
- [ ] Check for outdated version references
- [ ] Delete junk files (.DS_Store, etc.)
```

---

## Quick Reference

| Issue | Find Command | Fix |
|-------|--------------|-----|
| Corrupted folders | `find . -type d -name '*{*'` | `rm -rf "path"` |
| Junk files | `find . -name '.DS_Store'` | `find . -name '.DS_Store' -delete` |
| Empty dirs | `find . -type d -empty` | `find . -type d -empty -delete` |
| Old Next.js | `grep -r "Next.js 14" --include="*.md" .` | Manual update |
| Old Node | `grep -r "node-version: '20'" .` | Update to '22' |
| Broken links | `find . -type l ! -exec test -e {} \; -print` | Remove or fix target |

---

## Related Skills

- `agents/deployment/SKILL.md` - CI/CD configuration
- `workflows/pipeline/SKILL.md` - Pre-deploy checklists
- `_meta/TIME-AWARENESS.md` - Version requirements
