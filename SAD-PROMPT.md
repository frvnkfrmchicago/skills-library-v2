# SAD Prompt

The reusable prompt to paste **after** stating your goal. State what you want in your own words
("we need to analyze X and build Y, research accordingly"), then paste the block below — it binds
the run to that goal and drives it through the five SAD gates.

Only thing that ever changes run-to-run is the goal you type above it. The block stays fixed.

---

```
Run SAD (Sequential Agentic Development) on what I described above. Read these IN FULL first, then follow them exactly:
• ~/Downloads/skills-library-v2/librarians/sad-librarian.md            (5 gates + Gate-1 graphify map + grounding)
• ~/Downloads/skills-library-v2/librarians/orchestration-librarian.md  (Gates 4–5: multi-agent waves)
• ~/Downloads/skills-library-v2/.claude/skills/orchestration-managing/SKILL.md
• ~/Downloads/skills-library-v2/.claude/skills/multi-agent-designing/SKILL.md
• Every domain skill + librarian that matches the task (via SKILL-NAVIGATION.md)

Gate 1 — open with `graphify update <repo>`, drive the 5-surface scan off the graph (file:line), classify real/mock/broken. Readiness % from the build probe, never node counts. graphify = wiring, not function.
Gate 2/3 — GROUND, don't scrape. For every source (2026 URL, skill, librarian), distill the actual concept/principle/trait and state how it applies to THIS build. A link with no extracted, applied rule transfers nothing.
Gate 4 — decompose into as many file-exclusive lanes as the work needs — no cap on agent count, file-exclusivity is the only governor (use `graphify affected` so lanes never collide). Dispatch them all as parallel agents in dependency-ordered batches.

Hold at Gate 4 — present the plan, no code until I approve. Confirm each gate before the next.
Every lane: cites AND applies ≥1 skill + ≥1 librarian + ≥1 2026 source, semantic commit, ships or dropped-with-reason.
Pick the obvious default and ship — no A/B/C menus. No internal build output in UI (no hashes/models/graphify IDs).

Be extensive in the plan. Ship, don't defer.
```

---

## What the block leans on (so it can stay short)

- **The gates, self-assessment, confirm-gate rules, citations, file-ownership, commit discipline** all live in the
  skills the block tells the agent to read — no need to restate them inline.
- **Grounding** (distill the concept + apply it, never staple a link) is enforced in `sad-librarian.md` Gate 2/3.
- **No agent cap** — lanes scale to the work; file-exclusivity is the only governor (Gate 4 + orchestration modes).
- **graphify** is the Gate-1 wiring map and Gate-4 blast-radius tool (`affected`).
- Behavioral rules (no deferral, always commit, no time estimates, no emojis, best-outcome, no internal output in UI)
  are carried by the operator's standing memory and the skills' tone rules.
