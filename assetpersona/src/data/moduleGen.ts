/* ═══ MODULE GEN — client-side caller for the generate-module Edge Function ═══
 *
 * In bypass mode we short-circuit with a deterministic stub so the composer
 * is testable without the Edge Function being deployed.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { isBypassActive } from '../lib/devBypass';
import type { ModuleAnatomyDraft, LearnerRole, ModuleType } from '../types/learn';

interface GenerateInput {
  source_type: 'url' | 'paste' | 'prompt';
  source: string;
  source_title?: string;
  source_published_at?: string;
  target_role?: LearnerRole;
  type?: ModuleType;
}

const FN_PATH = '/functions/v1/generate-module';

function bypassStub(input: GenerateInput): ModuleAnatomyDraft {
  const trimmed = input.source.trim().slice(0, 60);
  const role = input.target_role ?? 'operator';
  const type = input.type ?? 'concept';

  return {
    hook: `Quick take on: ${trimmed}`,
    title: trimmed.length > 0 ? trimmed : 'Untitled draft',
    objective: `After this you'll be able to explain what "${trimmed}" means and apply it once today.`,
    context_md: `_(Bypass-mode stub. Connect ANTHROPIC_API_KEY + deploy generate-module for real drafts.)_\n\nThis is a placeholder context block describing **${trimmed}**. Replace it with the real explainer.\n\n- Point one\n- Point two\n- Point three`,
    practice_md: `Try the concept once today. Capture what changed in your output.`,
    practice_starter: `You are an expert in ${trimmed}. Your task is to ...`,
    reflect_question: `What surprised you about ${trimmed}?`,
    // Empty resources by default — author adds real links during editing.
    resources: [],
    suggested_tags: type === 'news_drop' ? ['News Drop', trimmed.slice(0, 24)] : ['Concept', 'Foundations'],
    suggested_role: role,
  };
}

export async function generateModule(input: GenerateInput): Promise<ModuleAnatomyDraft> {
  if (isBypassActive() || !isSupabaseConfigured) {
    // Slight delay so the UI shows the loading state
    await new Promise((r) => setTimeout(r, 400));
    return bypassStub(input);
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
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`generate-module ${res.status}: ${txt.slice(0, 200)}`);
  }

  const json = (await res.json()) as { draft: ModuleAnatomyDraft };
  if (!json?.draft) throw new Error('generate-module returned no draft');
  return json.draft;
}
