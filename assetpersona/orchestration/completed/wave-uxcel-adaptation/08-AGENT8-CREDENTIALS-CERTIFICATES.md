# Agent 8 — Credentials & Certificate Showcase
Status: completed
Wave: wave-uxcel-adaptation
Owner: Agent 8

## Explainer
Build the verified credentials system, emulating the certificate setup from Uxcel. Passkeys or completion hashes are stored in the database. Users can access public share links displaying certificate cards, verify credentials, download PDFs, or share to LinkedIn.

## Proposed Scope & Outcomes
1. **Public Verification Route (`src/pages/community/CredentialDetail.tsx`)**:
   - Renders a credential page for certificate verification code search or share.
   - Shows badge icon, course or test name, completion score/percentile, issue date, and recipient's public profile info.
   - Embeds "Add to LinkedIn" (using standard LinkedIn sharing URL structures) and "Download PDF" (using `html2canvas` + `jspdf` browser export).
2. **Dashboard Badge Grid**:
   - Integrate badge collections directly onto the profile page dashboard.

## Files to Create/Modify
- [NEW] `src/pages/community/CredentialDetail.tsx`
- [NEW] `src/pages/community/CredentialDetail.css`
- [NEW] `src/data/credentialsStore.ts`
