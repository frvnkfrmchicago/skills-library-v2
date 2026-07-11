# 04-AGENT4: Upgrade.Self Parser Engine

Status: dispatch-ready
Wave: wave-agentic-studyhall-simulator

## Explainer
Create the ingestion parser engine for **Upgrade.Self** (always spelled with a dot). This module parses markdown, links, and text resources to extract structured node keys for rendering visual mind maps.

## Required Scope
- **Files Owned**: `assetpersona/src/lib/upgrade-self/parser.ts`, `assetpersona/supabase/migrations/20260602220000_upgrade_self.sql`.
- **Tasks**:
  - Implement a TypeScript text parsing helper that splits files into title, description, and list of nested concepts.
  - Write a Supabase migration file declaring tables `upgrade_self_sources` and `upgrade_self_nodes`.

## Dispatch Checklists
- [ ] Create Supabase sql migration file for sources and nodes.
- [ ] Implement text parsing logic in parser.ts.
- [ ] Export type bindings for node nodes.

## Citations
- Skill: `.agents/skills/api-integrating/SKILL.md`
- Librarian: `.agents/skills/database-designing/SKILL.md`
- 2026 URL: https://supabase.com/docs
