# 06-AGENT6: Outside Credentials & Portfolio Points

Status: dispatch-ready
Wave: wave-agentic-studyhall-simulator

## Explainer
Create a certificate upload modal on the portfolio page. Users can submit outside cert files (e.g. AWS, Google) which awards +200 PX points to their league total.

## Required Scope
- **Files Owned**: `assetpersona/src/components/profile/CertUpload.tsx`, `assetpersona/src/pages/community/Portfolio.tsx`.
- **Tasks**:
  - Build the upload form (accepts image/pdf files) gated behind local validator filters.
  - Wire submission to award +200 PX points, triggering a confetti burst and profile points update.

## Dispatch Checklists
- [ ] Implement CertUpload.tsx file selector and upload button.
- [ ] Connect submission flow to increment profile score on success.
- [ ] Mount the trigger button in Portfolio.tsx.

## Citations
- Skill: `.agents/skills/supabase-building/SKILL.md`
- Librarian: `.agents/skills/security-auditing/SKILL.md`
- 2026 URL: https://react-dropzone.js.org/
