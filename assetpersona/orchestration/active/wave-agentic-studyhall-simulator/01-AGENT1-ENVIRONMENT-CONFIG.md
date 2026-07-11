# 01-AGENT1: Environment & Multi-Repo Config

Status: dispatch-ready
Wave: wave-agentic-studyhall-simulator

## Explainer
Configure the standalone configurations for both repositories running under Bun. Setup the Vite PWA asset caching manifest in `assetpersona` and configure Next.js parameters in `paper-candle`.

## Required Scope
- **Files Owned**: `assetpersona/vite.config.ts`, `paper-candle/next.config.ts`.
- **Tasks**:
  - Configure `vite-plugin-pwa` in `assetpersona`'s `vite.config.ts` to cache classroom, portfolio, and guides page routes.
  - Verify that compilation under Bun (`bun run build`) passes in both repositories.

## Dispatch Checklists
- [ ] Add PWA configuration to `vite.config.ts`.
- [ ] Configure routes caching in PWA service worker settings.
- [ ] Validate compilation under Bun.

## Citations
- Skill: `.agents/skills/mobile-first-enforcing/SKILL.md`
- Librarian: `.agents/skills/code-auditing/SKILL.md`
- 2026 URL: https://vite-pwa-org.netlify.app/
