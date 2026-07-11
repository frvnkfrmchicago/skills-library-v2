# Profile Schema Agent 1
Status: assigned · Batch: First · % on completion: 17.5% (cumulative 17.5%)

## Mission
Add the missing profile columns + email_subscribers table; wire WelcomeModal
to write through cleanly; add `bump_onboarding_step()` RPC.

## Owned scope
- `supabase/migrations/2026XXXX_extend_profiles_engagement.sql` (new)
- `supabase/migrations/2026XXXX_create_email_subscribers.sql` (new)
- `src/types/supabase.ts` (extend Profile type)
- `src/components/onboarding/WelcomeModal.tsx` (wire)
- `src/lib/learnLocal.ts` (no-op — bypass continues to work)

## Do not touch
Existing learn migrations · Edge Functions · other admin pages.

## Citations
- **Skills:** `supabase-building`, `onboarding-designing`, `copywriting-enforcing`
- **Librarians:** orchestration-librarian (Pre-Plan Research), multi-agent-librarian (file-bound split)
- **2026:** [SaaS Onboarding Best Practices 2026 — DesignRevision](https://designrevision.com/blog/saas-onboarding-best-practices), [Progressive Profiling 2026 — SSOJet](https://ssojet.com/ciam-qna/progressive-profiling-and-orchestration)

## Done criteria
- Profile chip pick → `services_interest` + `onboarding_step` persist (or localStorage in bypass)
- Email opt-in column live; default false
- `bump_onboarding_step` RPC callable
- `email_subscribers` table with admin-only RLS
- `bunx tsc -b --noEmit` green
