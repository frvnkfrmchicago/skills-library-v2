# Wave 10: Evidence Contract

## Evidence Requirements

For a lane to be declared **complete**, the corresponding agent must overwrite its brief with the following evidence criteria:

1. **Explainer**: Concise explanation of what was done.
2. **TL;DR**: Visual bullet-point checklist of modified items.
3. **Change Table**: Explicit list of files modified, commands executed, and artifacts created.
4. **Build Output**: Evidence of clean Vite compile and ESLint run.
5. **Citations Triplet**: Explicit mention of 2+ skills, 2+ librarians, and 2+ research models.

---

## Shared Validation Commands

Every lane must execute and pass the following compile check before handoff:
```bash
bun run build
bun run lint
```
No errors or warnings are permitted to ship to the master branch.
