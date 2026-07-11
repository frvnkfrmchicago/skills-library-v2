---
name: notebooklm-librarian
description: NotebookLM CLI (nlm) operations guide. Covers authentication, notebook management, source ingestion, querying, content generation (podcasts, reports, quizzes, slides, video), research discovery, batch operations, cross-notebook queries, and agent integration patterns. Use when interacting with NotebookLM programmatically, querying research notebooks, generating study materials, or building knowledge pipelines.
last_updated: 2026-03-23
version: v1
protocol: anti-skimming-v3
---

# NotebookLM Librarian

**Role**: You manage NotebookLM operations through the `nlm` CLI. You know how to authenticate, find notebooks, query sources, generate content, and build knowledge pipelines — all without opening a browser.

**Context**: NotebookLM indexes uploaded sources (URLs, YouTube, text, Drive docs) and lets you query, summarize, and generate content from them. The `nlm` CLI makes this programmable. Sessions expire in ~20 minutes. Rate limiting applies.

**Binary location**: `~/.local/share/uv/tools/notebooklm-mcp-cli/bin/nlm`

> [!IMPORTANT]
> If `nlm` isn't on PATH, either use the full path above or add it:
> `export PATH="$HOME/.local/share/uv/tools/notebooklm-mcp-cli/bin:$PATH"` in `~/.zshrc`

---

## TL;DR

| Task | Command |
|------|---------|
| List notebooks | `nlm notebook list` |
| Query a notebook | `nlm notebook query <id> "question"` |
| Add source URL | `nlm source add <id> --url "https://..."` |
| Add YouTube | `nlm source add <id> --url "https://youtube.com/..."` |
| Generate podcast | `nlm audio create <id> --confirm` |
| Generate report | `nlm report create <id> --confirm` |
| Research web | `nlm research start "query" --notebook-id <id>` |
| Batch query | `nlm batch query "question" --notebooks "id1,id2"` |
| Check status | `nlm studio status <id>` |

---

## 1. Authentication

**Sessions expire in ~20 minutes.** Re-run `nlm login` when commands fail with auth errors.

```bash
nlm login                          # Browser-based OAuth (primary method)
nlm login --check                  # Validate current session
nlm login --profile work           # Named profile for multiple accounts
nlm login switch <profile>         # Switch active profile
nlm login profile list             # List all profiles
```

### Multi-Profile Support
Each profile gets its own browser session. Supports Chrome, Arc, Brave, Edge, Chromium. If using MCP tools, switch profiles via CLI: `nlm login switch <name>`.

---

## 2. Notebook Operations

```bash
nlm notebook list                  # List all notebooks (JSON)
nlm notebook list --quiet          # IDs only
nlm notebook create "Title"        # Create, returns ID
nlm notebook get <id>              # Details
nlm notebook describe <id>         # AI-generated summary
nlm notebook query <id> "question" # One-shot Q&A (DO NOT use nlm chat start)
nlm notebook rename <id> "Title"   # Rename
nlm notebook delete <id> --confirm # Permanent deletion
```

> [!CAUTION]
> **NEVER use `nlm chat start`** — it opens an interactive REPL that agents cannot control. Use `nlm notebook query` for one-shot Q&A instead.

---

## 3. Source Management

```bash
# Add sources
nlm source add <id> --url "https://..."              # Web page
nlm source add <id> --url "https://youtube.com/..."   # YouTube
nlm source add <id> --text "content" --title "Title"  # Pasted text
nlm source add <id> --drive <doc-id> --type doc       # Google Drive

# List and inspect
nlm source list <id>              # Table of all sources
nlm source describe <source-id>   # AI summary + keywords
nlm source content <source-id>    # Raw text content

# Manage
nlm source delete <source-id> --confirm
```

---

## 4. Content Generation

All require `--confirm` or `-y`. Add `--source-ids` to limit to specific sources.

| Type | Command | Key Options |
|------|---------|-------------|
| Podcast | `nlm audio create <id> --confirm` | `--format` deep_dive/brief/critique/debate, `--length` short/default/long |
| Report | `nlm report create <id> --confirm` | `--format` "Briefing Doc"/"Study Guide"/"Blog Post"/"Create Your Own" |
| Quiz | `nlm quiz create <id> --confirm` | `--count N --difficulty 1-5` |
| Flashcards | `nlm flashcards create <id> --confirm` | `--difficulty` easy/medium/hard |
| Mind Map | `nlm mindmap create <id> --confirm` | `--title "Topic"` |
| Slides | `nlm slides create <id> --confirm` | `--format` detailed/presenter, `--length` short/default |
| Infographic | `nlm infographic create <id> --confirm` | `--orientation --detail --style` |
| Video | `nlm video create <id> --confirm` | `--format` explainer/brief, `--style` whiteboard/anime/etc |
| Data Table | `nlm data-table create <id> "description" --confirm` | Description required |

### Download Artifacts

```bash
nlm download audio <id> --output podcast.mp3
nlm download report <id> --output report.md
nlm download slide-deck <id> --output slides.pptx --format pptx
nlm download video <id> --output video.mp4
```

---

## 5. Research Discovery

Research finds NEW sources from the web or Google Drive and imports them into notebooks.

```bash
# Start research (--notebook-id is REQUIRED)
nlm research start "query" --notebook-id <id>              # Fast (~30s)
nlm research start "query" --notebook-id <id> --mode deep  # Deep (~5min)
nlm research start "query" --notebook-id <id> --source drive  # Drive

# Check and import
nlm research status <id>                    # Poll until done
nlm research import <id> <task-id>          # Import all found sources
nlm research import <id> <task-id> --indices 0,2,5  # Import specific
```

---

## 6. Batch & Cross-Notebook

```bash
# Batch same action across notebooks
nlm batch query "What are key takeaways?" --notebooks "id1,id2"
nlm batch query "Summarize" --tags "ai,research"
nlm batch studio --type audio --tags "research" --confirm

# Cross-notebook query (aggregated answer with per-notebook citations)
nlm cross query "Compare approaches" --notebooks "id1,id2"
nlm cross query "Summarize everything" --all
```

---

## 7. Aliases & Tags

```bash
# Aliases — shorthand for UUIDs
nlm alias set myproject <uuid>
nlm alias list
nlm notebook query myproject "question"  # Use alias anywhere

# Tags — organize notebooks
nlm tag add <id> --tags "ai,research"
nlm tag list
nlm tag select "ai research"
```

---

## 8. Agent Integration Patterns

### Pattern: Research → Knowledge Pipeline

```bash
nlm notebook create "Topic Research"        # Create notebook
nlm alias set topic <id>
nlm research start "query" --notebook-id topic --mode deep
nlm research status topic --max-wait 300
nlm research import topic <task-id>
nlm notebook query topic "Summarize key findings"
nlm report create topic --format "Briefing Doc" --confirm
nlm download report topic --output findings.md
```

### Pattern: Parse JSON Answer in Scripts

```bash
nlm notebook query <id> "question" 2>&1 | python3 -c \
  "import sys,json; data=json.load(sys.stdin); print(data['answer'])"
```

### Agent Gotchas (Learned from Practice)

| Issue | Cause | Fix |
|-------|-------|-----|
| `nlm: command not found` | Not on PATH | Use full path or add to `.zshrc` |
| Query returns massive JSON | Default output is verbose | Parse with `jq '.answer'` or python |
| Query takes 30-60 seconds | Normal for NLM processing | Don't retry — wait |
| Inconsistent output format | `list` → JSON, `source list` → table | Use `--json` flag for consistency |
| Session expired | ~20 min timeout | Re-run `nlm login` |

---

## NEVER

- **NEVER** use `nlm chat start` — it opens an interactive REPL agents can't control
- **NEVER** skip `--confirm` on generation commands — they'll silently fail
- **NEVER** forget `--notebook-id` on research commands — it's required, not positional
- **NEVER** make rapid successive calls — respect rate limits (2s between operations)
- **NEVER** delete without asking the user first — deletions are irreversible

---

## Pre-Completion Checklist

- [ ] Authenticated (`nlm login --check`)
- [ ] Correct notebook ID identified
- [ ] Sources listed and verified before querying
- [ ] Output format specified (JSON for parsing, default for reading)
- [ ] Artifacts downloaded after generation completes
- [ ] Aliases set for frequently used notebooks

---

## Related Skills

- [google-ai-librarian](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/librarians/google-ai-librarian.md) — Google AI ecosystem
- [research-librarian](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/librarians/research-librarian.md) — research methodology
- [search-librarian](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/librarians/search-librarian.md) — targeted information retrieval

## Skill Reference

- [nlm-skill](file:///Users/franklawrencejr./.gemini/antigravity/skills/nlm-skill/SKILL.md) — Full NLM CLI & MCP reference (710 lines)
