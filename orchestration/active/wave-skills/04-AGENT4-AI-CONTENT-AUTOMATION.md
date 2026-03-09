# Agent 4 — AI, Content & Automation Lane

## Mission
Convert 10 AI/content/automation librarians into proper Agent Skills with auto-discovery.

## Before You Start
**Read `agents/upgrade-library/SKILL.md`** — it contains the SKILL.md format spec, frontmatter requirements, and conversion steps.

## Your Librarians (10)

| # | Source File | Skill Name |
|---|-----------|------------|
| 1 | `librarians/google-ai-librarian.md` | `google-ai-integrating` |
| 2 | `librarians/conversational-ai-librarian.md` | `conversational-ai-building` |
| 3 | `librarians/fine-tuning-librarian.md` | `model-fine-tuning` |
| 4 | `librarians/prompt-librarian.md` | `prompt-engineering` |
| 5 | `librarians/multi-agent-librarian.md` | `multi-agent-designing` |
| 6 | `librarians/orchestration-librarian.md` | `orchestration-managing` |
| 7 | `librarians/n8n-librarian.md` | `n8n-automating` |
| 8 | `librarians/copywriting-librarian.md` | `copywriting-enforcing` |
| 9 | `librarians/anti-mock-data-librarian.md` | `anti-mock-enforcing` |
| 10 | `librarians/research-librarian.md` | `research-conducting` |

## For Each Librarian

1. **Read** the source librarian file
2. **Create** `.agents/skills/<skill-name>/SKILL.md` with:
   - YAML frontmatter: `name` (matches directory), `description` (1-1024 chars, third person, includes WHAT + WHEN + trigger keywords)
   - Directive language
   - Body under 500 lines
3. **Copy** the skill directory into:
   - `.claude/skills/<skill-name>/SKILL.md`
   - `.cursor/skills/<skill-name>/SKILL.md`
   - `.codex/skills/<skill-name>/SKILL.md`

## Special Instructions for This Lane

- AI skills should reference Google AI Studio, Gemini API, and Vertex AI patterns
- `prompt-engineering` should include prompt templates and anti-patterns
- `anti-mock-enforcing` is critical — must include grep commands to scan for mock/placeholder data
- `copywriting-enforcing` should include the AI language ban list
- `n8n-automating` should include workflow templates and node references
- `multi-agent-designing` and `orchestration-managing` — be careful not to duplicate the existing `agents/orchestration/SKILL.md`; these should complement it

## Completion Evidence

- [x] Table of all 10 skills created with file paths
- [x] Confirmation all have valid frontmatter
- [x] Confirmation all copied to `.claude/`, `.cursor/`, `.codex/`
- [x] Any skills that exceeded 500 lines and how you handled overflow

### Skills Created

| # | Skill Name | Primary Path | Lines | Frontmatter |
|---|-----------|--------------|-------|-------------|
| 1 | `google-ai-integrating` | `.agents/skills/google-ai-integrating/SKILL.md` | 160 | ✅ |
| 2 | `conversational-ai-building` | `.agents/skills/conversational-ai-building/SKILL.md` | 214 | ✅ |
| 3 | `model-fine-tuning` | `.agents/skills/model-fine-tuning/SKILL.md` | 192 | ✅ |
| 4 | `prompt-engineering` | `.agents/skills/prompt-engineering/SKILL.md` | 198 | ✅ |
| 5 | `multi-agent-designing` | `.agents/skills/multi-agent-designing/SKILL.md` | 167 | ✅ |
| 6 | `orchestration-managing` | `.agents/skills/orchestration-managing/SKILL.md` | 83 | ✅ |
| 7 | `n8n-automating` | `.agents/skills/n8n-automating/SKILL.md` | 137 | ✅ |
| 8 | `copywriting-enforcing` | `.agents/skills/copywriting-enforcing/SKILL.md` | 188 | ✅ |
| 9 | `anti-mock-enforcing` | `.agents/skills/anti-mock-enforcing/SKILL.md` | 185 | ✅ |
| 10 | `research-conducting` | `.agents/skills/research-conducting/SKILL.md` | 182 | ✅ |

### Cross-Platform Distribution

| Platform | Status |
|----------|--------|
| `.claude/skills/` | ✅ All 10 copied |
| `.cursor/skills/` | ✅ All 10 copied |
| `.codex/skills/` | ✅ All 10 copied |

### Line Count Note

No skills exceeded 500 lines. All bodies range from 83-214 lines. No overflow to `references/` was needed.

### Special Instructions Compliance

- ✅ `google-ai-integrating` references Google AI Studio, Gemini API, Vertex AI, model selection, MCP integrations
- ✅ `prompt-engineering` includes platform-specific templates (PRD, code gen, design brief) and anti-patterns table
- ✅ `anti-mock-enforcing` includes 5 grep scan commands for detecting mock patterns
- ✅ `copywriting-enforcing` includes full AI language ban list (words, punctuation, sentence patterns)
- ✅ `n8n-automating` includes 4 workflow templates and node selection guide
- ✅ `multi-agent-designing` focuses on task decomposition and agent selection — complements (not duplicates) orchestration
- ✅ `orchestration-managing` is a thin management layer pointing to `agents/orchestration/SKILL.md`
