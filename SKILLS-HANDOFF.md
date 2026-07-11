# How to Install Skills Library Librarians into Google Antigravity

> This is an instructional prompt. Paste it to an Antigravity agent or follow it yourself to install all librarians from the Skills Library as Antigravity skills.

---

## What This Is

The Skills Library (`skills-library-v2`) contains 51 librarian files in the `librarians/` directory. Each librarian has been converted into an Agent Skill (`SKILL.md` format) that Antigravity can read and activate automatically.

The converted skills live in `.agents/skills/` at the workspace root. When an Antigravity agent opens this workspace, it scans that directory and loads every skill into its context.

---

## The Layout

```
skills-library-v2/
├── librarians/                    ← 51 source librarian files (.md)
│   ├── computer-lab-librarian.md
│   ├── orchestration-librarian.md
│   ├── multi-agent-librarian.md
│   ├── ... (48 more)
│   └── README.md
│
├── .agents/skills/                ← 50 Antigravity skills (SKILL.md)
│   ├── lab-orchestrating/SKILL.md
│   ├── orchestration-managing/SKILL.md
│   ├── multi-agent-designing/SKILL.md
│   ├── ... (47 more)
│   └── each skill has YAML frontmatter + directive body
│
├── agents/                        ← Extended agent packages
│   ├── orchestration/SKILL.md     ← Full orchestration package with references
│   └── ... (100+ agent folders)
│
└── SKILLS-HANDOFF.md              ← This file
```

---

## How Antigravity Picks Up Skills

Antigravity scans this pattern at the workspace root:

```
.agents/skills/*/SKILL.md
```

Each file needs:
- YAML frontmatter with `name:` matching the directory name
- A `description:` field (1-1024 characters, third person, ending with "Use when...")
- Body under 500 lines with directive language

If the agent opens a **subdirectory** instead of the workspace root, it will NOT see `.agents/skills/`. Always open the agent at the root.

---

## Install Instructions

### If you are an Antigravity agent reading this:

You already have access to the skills. They are loaded in your context under `<skills>Available skills:`. To use one, read it:

```
view_file .agents/skills/<skill-name>/SKILL.md
```

### If you are installing skills into a DIFFERENT project:

Copy the skills directory from this library into your project:

```bash
# Set your project path
PROJECT="/path/to/your/project"

# Copy all 50 skills
cp -r ".agents/skills/"* "$PROJECT/.agents/skills/"

# Or copy specific skills
cp -r ".agents/skills/lab-orchestrating"       "$PROJECT/.agents/skills/"
cp -r ".agents/skills/orchestration-managing"   "$PROJECT/.agents/skills/"
cp -r ".agents/skills/multi-agent-designing"    "$PROJECT/.agents/skills/"
```

### Verify installation:

```bash
ls "$PROJECT/.agents/skills/" | wc -l
# Should show 50 (or however many you copied)
```

---

## Librarian → Skill Name Mapping

The naming convention drops `-librarian` and uses gerund form:

| Librarian File | Skill Directory |
|---------------|-----------------|
| `computer-lab-librarian.md` | `lab-orchestrating/` |
| `orchestration-librarian.md` | `orchestration-managing/` |
| `multi-agent-librarian.md` | `multi-agent-designing/` |
| `security-librarian.md` | `security-auditing/` |
| `hacker-attacker-librarian.md` | `hacker-scanning/` |
| `code-scrutinizer-librarian.md` | `code-scrutinizing/` |
| `experience-designer-librarian.md` | `experience-designing/` |
| `deployment-librarian.md` | `deploying/` |
| `backend-librarian.md` | `backend-hardening/` |
| `frontend-librarian.md` | `frontend-architecting/` |
| `database-librarian.md` | `database-designing/` |
| `code-audit-librarian.md` | `code-auditing/` |
| `code-cleaner-librarian.md` | `code-cleaning/` |
| `testing-librarian.md` | `testing-enforcing/` |

---

## The 3 Orchestration Skills

These drive the multi-agent build system:

### 1. `lab-orchestrating` (← computer-lab-librarian)
6-stage pipeline: Discover → Design → Build → Quality → Secure → Ship.
Supports full-auto, checkpoint, and variation modes.

### 2. `orchestration-managing` (← orchestration-librarian)
Wave packet lifecycle: dispatch, evidence, lead review, master log, archive.
File-driven, not chat-driven. One active wave at a time.

### 3. `multi-agent-designing` (← multi-agent-librarian)
Task decomposition, agent strength mapping, context handoff protocol, merge order.
Split by file boundaries, never by lines within a file.

---

## Rules

- Use **bun**, never npm
- Skills in `.agents/skills/` are the source of truth — do not modify without reason
- Librarians in `librarians/` are the readable reference — keep them in sync with skills
- Each librarian has a `skill_ref:` in its YAML frontmatter pointing to its skill
- When updating a skill, also update its corresponding librarian (and vice versa)
