# Lane 2 — Admin Composer
Status: assigned · Wave: 2 (Author) · % on completion: 55%

## Explainer
Where Frank turns ideas into modules fast. Admin-only. Anatomy-driven editor (Hook · Objective · Context · Resources · Practice · Reflect) with AI-assisted generation per field. List/queue management for drafts.

## Owned scope
`src/pages/admin/Modules.tsx` (list), `src/pages/admin/ModuleEdit.tsx` (composer), `src/components/admin/module-composer/*` (new), `src/components/admin/module-composer/AnatomyEditor.tsx`, `src/components/admin/module-composer/ResourceList.tsx`, `src/components/admin/module-composer/PracticeStep.tsx`, `src/components/admin/module-composer/AiAssistButton.tsx`

## Do not touch
Schema (L1), generator backend (L3), learn-hub frontend (L4).

## Done criteria
- Admin can create/edit/publish module from blank or AI-drafted state
- Each anatomy field has "Regenerate with AI" button
- Bypass mode: writes to local store
- Admin sidebar gets "Modules" + "Module Queue" links
