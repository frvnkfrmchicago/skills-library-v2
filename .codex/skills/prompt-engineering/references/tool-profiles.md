# Tool Profiles

Detailed profiles for every tool in the prompt engineering stack.
Use this to shape prompts for the specific tool that will execute them.

---

## Antigravity IDE

The primary development environment. Agent-first code editor with full
codebase access and MCP integrations.

### Models

| Model | When to Use | Reasoning | Speed |
|-------|------------|-----------|-------|
| **Opus 4.6** | Complex architecture, deep reasoning, multi-file refactors | Highest | Slower |
| **Sonnet 4.6** | Standard coding, feature builds, reviews | Near-Opus | Fast |
| **Gemini 3.1 Pro** | Bulk edits, large-context analysis, 1M token tasks | Good | Fastest |
| **Gemini 3 Flash** | Quick questions, simple tasks, validation | Basic | Instant |

### Capabilities
- Full codebase visibility (reads any file in the workspace)
- MCP integrations: Firebase, Prisma, GitHub, Supabase, Browser tools, Chrome DevTools
- Multi-agent: Each agent gets unique file scopes (no overlap)
- Subagent spawning for parallel research and execution
- Browser automation via browser subagent

### Rate Limits (Ultra tier)
- 1,500 Thinking prompts/day
- 12,500 AI credits/month (Videos 5K, Images 2.5K, Flow/Whisk 2.5K, Reserve 2.5K)
- Rate limits refresh every **5 hours**, not daily
- Multi-account rotation available (Primary Ultra + Pro overflow)

### Prompt Style
- **Do**: Reference specific file paths, use detailed system context, leverage
  Thinking mode for complex reasoning, scope agents to specific files
- **Don't**: Send vague instructions, assume the model knows your conventions,
  overlap file scopes between agents

---

## Claude Code

Terminal-based AI coding agent. Deep reasoning with no GUI — everything
through the command line.

### Models

| Model | When to Use |
|-------|------------|
| **Sonnet 4.6** | Standard coding, fast turnaround |
| **Opus 4.7** | Deep reasoning, complex plans |
| **Opus 4.8** | Frontier reasoning, architectural decisions |

### Capabilities
- 200K context window
- Terminal-based (no GUI, no visual previews)
- Reads/writes files, runs commands, manages git
- Strong at plan generation and spec execution
- Supports the SAD prompt and orchestration managing skill natively

### Prompt Style
- **Do**: Write specification-style prompts, include full file paths,
  provide structured output formats, use the SAD approach for complex work
- **Don't**: Expect visual output, send image-dependent tasks, rely on
  browser automation

### Best For
- Plan generation and architectural reasoning
- Deep code analysis and refactoring
- Running the SAD approach with full gate compliance
- Writing and executing tests

---

## Codex

Cloud-side execution with git worktrees. Agents run in isolated sandboxes
and cannot communicate during execution.

### Key Constraints
- Agents **CANNOT ask questions mid-task** — briefs must be fully self-contained
- Each agent gets its own git worktree (isolated branch)
- No inter-agent communication during execution
- Results merge via git after completion

### Prompt Style
- **Do**: Write completely self-contained task briefs, include ALL context
  the agent needs, specify exact file paths and expected output format,
  define "done" clearly
- **Don't**: Leave ambiguity, reference other agents' work, assume shared
  context, use vague completion criteria

### Self-Contained Brief Template
```markdown
## Task
[Complete description — agent cannot ask for clarification]

## Context
[Everything the agent needs to know about the codebase]

## Files to Create/Modify
[Exact paths — NO overlap with other Codex agents]

## Expected Output
[Precisely what the finished work looks like]

## Constraints
[Hard rules the agent must follow]

## Done When
[Specific, verifiable completion criteria]
```

### Best For
- Parallel task execution (multiple agents, each on different files)
- Isolated, well-scoped tasks with clear boundaries
- Test writing, documentation, and utility generation
- Batch processing where agents don't need to coordinate

---

## Hermes

Custom AI agent infrastructure on a GCP virtual machine. Provides
authenticated browser automation, multi-platform session management,
and specialized models.

### Infrastructure
- GCP VM at `34.28.216.185`
- `~/.hermes/` directory with session files for 13+ platforms
- Playwright + Camoufox (anti-fingerprint browsing)
- Agent profiles: agent-gem, big-venture, hecthor
- `api_tracker.py` for prediction markets, economics, news

### Models

| Model | When to Use |
|-------|------------|
| **GLM 5.2** | Backup lane, offline work, specific model capabilities |
| **MiniMax M3** | Terminal-based, model-agnostic tasks |

### Authenticated Platforms
ChatGPT, Google, YouTube, NotebookLM, Dribbble, Kling, Mobbin, LinkedIn,
Medium, Uxcel, Threads, Wix (via Playwright storage state JSONs)

### MCP Servers
notebooklm, mobbin, blender, rive

### Prompt Style
- **Do**: Write compact, explicit instructions, account for model-specific
  quirks, leverage platform sessions for authenticated tasks
- **Don't**: Expect Opus-level reasoning, send architecturally complex tasks,
  rely on large context windows

### Best For
- Authenticated web scraping and automation
- Platform-specific tasks (Threads posting, Mobbin scanning, etc.)
- Backup execution when primary tools hit rate limits
- Tasks requiring anti-fingerprint browsing (Cloudflare-protected sites)
