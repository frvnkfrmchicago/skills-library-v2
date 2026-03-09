# Evidence Contract — Wave Skills

## What Counts as "Done"

A librarian is considered converted when:

1. ✅ New `SKILL.md` exists in `.agents/skills/<skill-name>/`
2. ✅ YAML frontmatter has `name` (matches directory) and `description` (1-1024 chars, third person)
3. ✅ Body uses directive language (not vague checklists)
4. ✅ Body is under 500 lines
5. ✅ Copies exist in `.claude/skills/`, `.cursor/skills/`, `.codex/skills/`
6. ✅ Lane brief file updated with completion table

## What Doesn't Count

- ❌ "I converted it" without showing file paths
- ❌ Skill with missing or broken frontmatter
- ❌ Description that says "Helps with X" instead of specifying triggers
- ❌ Body that copy-pastes the librarian with no restructuring

## Validation Command

```bash
# Check frontmatter exists and name matches directory
for dir in .agents/skills/*/; do
  name=$(basename "$dir")
  if ! head -5 "$dir/SKILL.md" | grep -q "name: $name"; then
    echo "❌ $name — frontmatter mismatch or missing"
  else
    echo "✅ $name"
  fi
done
```

## Cross-Platform Verification

```bash
# Verify all platforms have matching skills
for dir in .agents/skills/*/; do
  name=$(basename "$dir")
  for platform in .claude .cursor .codex; do
    if [ ! -f "$platform/skills/$name/SKILL.md" ]; then
      echo "❌ Missing: $platform/skills/$name/SKILL.md"
    fi
  done
done
```
