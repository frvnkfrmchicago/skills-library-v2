/**
 * MOREHOUSE CHICAGO ALUMNI — PUBLIC CLIENT CONFIG
 * Lane 1 (mcaa-wave-001). Loaded BEFORE js/store.js (see index.html script order).
 *
 * SECURITY NOTE (data-contract.md §9 #10):
 *   - SUPABASE_ANON_KEY is the *publishable* anon key. It is SAFE to commit and
 *     ship to the browser: it only grants what Row Level Security allows. Every
 *     table has RLS enabled (migrations 008/009), so the anon key cannot read or
 *     write anything a policy does not explicitly permit.
 *   - The privileged server key and all Stripe secret/webhook keys are NEVER
 *     placed in this file or any client file. They live only in Edge Function
 *     environment variables (supabase secrets set ...) and in .gitignore'd local
 *     files. A hard gate greps js/ and *.html for those secret prefixes and must
 *     return zero, so this file deliberately avoids spelling them out.
 *
 * To wire a live project, the board replaces the two placeholders below with the
 * values from Supabase Dashboard -> Project Settings -> API:
 *   Project URL                -> window.SUPABASE_URL
 *   Project API keys -> anon / publishable -> window.SUPABASE_ANON_KEY
 *
 * Until then the placeholders keep the static site rendering from the in-memory
 * cache (Store falls back gracefully when the client is not configured).
 */

// [PLACEHOLDER] Replace with the live project URL, e.g. https://abcdefgh.supabase.co
window.SUPABASE_URL = 'https://YOUR-PROJECT-REF.supabase.co';

// [PLACEHOLDER] Replace with the anon / publishable key (safe to commit; NOT the privileged server key).
window.SUPABASE_ANON_KEY = 'YOUR-SUPABASE-ANON-PUBLISHABLE-KEY';

// Derived flag used by store.js: are we pointed at a real project yet?
window.SUPABASE_CONFIGURED = !(
  !window.SUPABASE_URL ||
  !window.SUPABASE_ANON_KEY ||
  window.SUPABASE_URL.includes('YOUR-PROJECT-REF') ||
  window.SUPABASE_ANON_KEY.includes('YOUR-SUPABASE-ANON')
);
