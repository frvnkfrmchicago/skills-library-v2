/* ═══ DEV BYPASS — fast local testing of auth-gated, DB-backed, and webhook flows ═══
 *
 * Why this exists:
 *   While Wave 1 migrations and Wave 2 Edge Function are pending deploy, every
 *   auth-gated, RLS-gated, or webhook-fed UI is unreachable. This bypass gives
 *   you a fake admin/member/guest identity so you can click through onboarding,
 *   the Inquiries Kanban, the welcome modal, and gated routes without ANY
 *   remote dependencies.
 *
 * Activation:
 *   - URL: append `?dev=admin`, `?dev=member`, `?dev=guest`, or `?dev=off`
 *   - localStorage: `ap_dev_bypass` = 'admin' | 'member' | 'guest'
 *   - env: `VITE_DEV_BYPASS=admin|member|guest`
 *
 * Hard guard: bypass is only readable when `import.meta.env.DEV === true`.
 *   Production builds NEVER honor any of these. The check below is in one place.
 *   If you want to test prod-built bundles too, set
 *   `VITE_ALLOW_DEV_BYPASS_IN_PROD=true` (use only when intentional).
 */

import type { Profile } from '../types/supabase';

export type BypassRole = 'admin' | 'member' | 'guest';

const LS_KEY = 'ap_dev_bypass';

const ALLOWED = !!(
  import.meta.env.DEV ||
  import.meta.env.VITE_ALLOW_DEV_BYPASS_IN_PROD === 'true'
);

function readUrlRole(): BypassRole | 'off' | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const v = params.get('dev');
  if (v === 'admin' || v === 'member' || v === 'guest') return v;
  if (v === 'off' || v === 'clear' || v === 'false') return 'off';
  return null;
}

function readLs(): BypassRole | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = localStorage.getItem(LS_KEY);
    if (v === 'admin' || v === 'member' || v === 'guest') return v;
  } catch {
    /* ignore */
  }
  return null;
}

function readEnv(): BypassRole | null {
  const v = import.meta.env.VITE_DEV_BYPASS as string | undefined;
  if (v === 'admin' || v === 'member' || v === 'guest') return v;
  return null;
}

/**
 * Pull the active bypass role, applying URL → localStorage → env precedence.
 * Returns null when bypass is not active (or not allowed in this build).
 */
export function getBypassRole(): BypassRole | null {
  if (!ALLOWED) return null;

  // URL has the highest precedence — and it persists into localStorage so the
  // role survives navigation. `?dev=off` clears.
  const urlRole = readUrlRole();
  if (urlRole === 'off') {
    try {
      localStorage.removeItem(LS_KEY);
    } catch {
      /* ignore */
    }
    return null;
  }
  if (urlRole) {
    try {
      localStorage.setItem(LS_KEY, urlRole);
    } catch {
      /* ignore */
    }
    return urlRole;
  }

  return readLs() ?? readEnv();
}

export function setBypassRole(role: BypassRole | null) {
  if (!ALLOWED) return;
  try {
    if (role) localStorage.setItem(LS_KEY, role);
    else localStorage.removeItem(LS_KEY);
  } catch {
    /* ignore */
  }
}

export function isBypassActive(): boolean {
  return getBypassRole() !== null;
}

/** Stable fake identities used wherever code expects a User / Profile shape. */
export const BYPASS_IDS: Record<BypassRole, string> = {
  admin: '00000000-0000-4000-8000-00000000ad11',
  member: '00000000-0000-4000-8000-0000000000a2',
  guest: '00000000-0000-4000-8000-0000000000a3',
};

export const BYPASS_EMAILS: Record<BypassRole, string> = {
  admin: 'dev-admin@assetpersona.local',
  member: 'dev-member@assetpersona.local',
  guest: 'dev-guest@assetpersona.local',
};

export function makeBypassUser(role: BypassRole) {
  return {
    id: BYPASS_IDS[role],
    email: BYPASS_EMAILS[role],
    aud: 'authenticated',
    role: 'authenticated',
    app_metadata: {},
    user_metadata: {
      full_name: role === 'admin' ? 'Dev Admin' : role === 'member' ? 'Dev Member' : 'Dev Guest',
      bypass: true,
    },
    created_at: new Date().toISOString(),
  } as unknown as import('@supabase/supabase-js').User;
}

export function makeBypassProfile(role: BypassRole): Profile {
  return {
    id: BYPASS_IDS[role],
    display_name:
      role === 'admin' ? 'Dev Admin' : role === 'member' ? 'Dev Member' : 'Dev Guest',
    avatar_url: null,
    cover_url: null,
    bio:
      role === 'admin'
        ? 'Local dev-bypass admin. Every gated UI is reachable.'
        : 'Local dev-bypass member. Onboarding + community visible.',
    social_links: {},
    level: role === 'admin' ? 10 : 1,
    points: role === 'admin' ? 9999 : 0,
    role: role === 'admin' ? 'admin' : 'member',
    status: 'active',
    joined_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    // Wave 1 extension fields — added to Profile type when types are regenerated.
    // We cast through unknown so the bypass works whether or not types are live.
  } as unknown as Profile;
}

/* ── Local "DB" for inquiries when bypass is on ── */

const LS_INQUIRIES = 'ap_dev_inquiries';

export interface BypassInquiry {
  id: string;
  form_type: string;
  status: 'new' | 'contacted' | 'qualified' | 'won' | 'lost';
  name: string;
  email: string;
  company: string | null;
  message: string | null;
  fields: Record<string, string>;
  lead_score: number;
  source: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
}

export function readBypassInquiries(): BypassInquiry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LS_INQUIRIES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function appendBypassInquiry(payload: Omit<BypassInquiry, 'id' | 'status' | 'created_at'>): BypassInquiry {
  const row: BypassInquiry = {
    ...payload,
    id: crypto.randomUUID(),
    status: 'new',
    created_at: new Date().toISOString(),
  };
  const all = readBypassInquiries();
  all.unshift(row);
  try {
    localStorage.setItem(LS_INQUIRIES, JSON.stringify(all.slice(0, 200)));
  } catch {
    /* ignore */
  }
  return row;
}

export function updateBypassInquiry(id: string, patch: Partial<BypassInquiry>): BypassInquiry | null {
  const all = readBypassInquiries();
  const idx = all.findIndex((i) => i.id === id);
  if (idx < 0) return null;
  all[idx] = { ...all[idx], ...patch };
  try {
    localStorage.setItem(LS_INQUIRIES, JSON.stringify(all));
  } catch {
    /* ignore */
  }
  return all[idx];
}

export function clearBypassInquiries() {
  try {
    localStorage.removeItem(LS_INQUIRIES);
  } catch {
    /* ignore */
  }
}

/* ── Local welcome / onboarding state ── */

const LS_WELCOME = 'ap_dev_welcome_done';

export function isWelcomeDone(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return localStorage.getItem(LS_WELCOME) === '1';
  } catch {
    return true;
  }
}

export function markWelcomeDone() {
  try {
    localStorage.setItem(LS_WELCOME, '1');
  } catch {
    /* ignore */
  }
}

export function clearWelcomeDone() {
  try {
    localStorage.removeItem(LS_WELCOME);
  } catch {
    /* ignore */
  }
}
