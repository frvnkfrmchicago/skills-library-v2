/* ═══ TUTOR — client-side caller for module-tutor Edge Function ═══
 * Bypass mode: deterministic stub so the floating tutor works offline.
 */

import { isBypassActive } from '../lib/devBypass';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface AskOptions {
  moduleSlug: string;
  message: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
}

const FN_PATH = '/functions/v1/module-tutor';

function bypassReply(input: AskOptions): string {
  const trimmed = input.message.trim().slice(0, 80);
  return `(Bypass-mode reply.) On "${trimmed}": short version is — try restating it as a tradeoff. Specifically here, the framing in this module says it's not about doing X better, it's about deciding when X applies. Want a quick example?`;
}

export async function askTutor(input: AskOptions): Promise<{ reply: string; cached?: number }> {
  if (isBypassActive() || !isSupabaseConfigured) {
    await new Promise((r) => setTimeout(r, 500));
    return { reply: bypassReply(input) };
  }

  const { data: sessionRes } = await supabase.auth.getSession();
  const token = sessionRes?.session?.access_token;
  const url =
    (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, '') + FN_PATH;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      module_slug: input.moduleSlug,
      message: input.message,
      history: input.history ?? [],
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`tutor ${res.status}: ${txt.slice(0, 200)}`);
  }
  const json = (await res.json()) as { reply: string; cache_read_tokens?: number };
  return { reply: json.reply, cached: json.cache_read_tokens };
}
