/* ═══ FAQ store — bypass-aware ═══ */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { isBypassActive } from '../lib/devBypass';

export type FaqCategory =
  | 'getting_started'
  | 'modules'
  | 'community'
  | 'tiers_and_pricing'
  | 'work_with_frank'
  | 'account'
  | 'other';

export interface Faq {
  id: string;
  slug: string;
  category: FaqCategory;
  question: string;
  answer_md: string;
  position: number;
  visible: boolean;
  related_module_slug: string | null;
  created_at: string;
  updated_at: string;
}

const BYPASS_SEED: Faq[] = [
  {
    id: '1',
    slug: 'what-is-asset-persona',
    category: 'getting_started',
    question: 'What is Asset Persona?',
    answer_md:
      "Asset Persona is Frank Lawrence Jr.'s daily AI literacy practice — short concept drops, hands-on drills, and a community that ships.",
    position: 1,
    visible: true,
    related_module_slug: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    slug: 'how-do-modules-work',
    category: 'modules',
    question: 'How do daily modules work?',
    answer_md:
      'A module is a 3–10 minute concept with a hook, an objective, a short context, one practice task, and a reflect question. Finish one a day to keep your streak.',
    position: 2,
    visible: true,
    related_module_slug: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    slug: 'can-i-message-frank',
    category: 'work_with_frank',
    question: 'Can I send Frank a direct message?',
    answer_md:
      "No DMs on purpose. Use the **Ask Frank** form below — it routes straight to his inbox and the admin queue. Or pick a Work With Frank pathway if you're looking to hire.",
    position: 3,
    visible: true,
    related_module_slug: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    slug: 'what-tiers-exist',
    category: 'tiers_and_pricing',
    question: 'What are the membership tiers?',
    answer_md:
      'Asset Class is free. Cohort, Insiders, and Private Lessons are paid tiers — each unlocks more depth + more time with Frank. See the Agentic Study Hall page.',
    position: 4,
    visible: true,
    related_module_slug: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export async function listFaqs(includeHidden = false): Promise<Faq[]> {
  if (isBypassActive() || !isSupabaseConfigured) {
    return includeHidden ? BYPASS_SEED : BYPASS_SEED.filter((f) => f.visible);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any).from('faqs').select('*').order('category').order('position');
  if (!includeHidden) query = query.eq('visible', true);
  const { data } = await query;
  return (data as Faq[]) ?? [];
}

export async function upsertFaq(faq: Partial<Faq> & { question: string; answer_md: string; category: FaqCategory }): Promise<Faq | null> {
  if (isBypassActive() || !isSupabaseConfigured) {
    return null; // bypass: admin UI will show "set up Supabase to persist"
  }
  const slug = faq.slug ?? faq.question.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('faqs')
    .upsert({ ...faq, slug }, { onConflict: 'slug' })
    .select()
    .single();
  if (error) throw error;
  return data as Faq;
}

export async function deleteFaq(id: string): Promise<void> {
  if (isBypassActive() || !isSupabaseConfigured) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from('faqs').delete().eq('id', id);
}

export const FAQ_CATEGORIES: { value: FaqCategory; label: string }[] = [
  { value: 'getting_started',  label: 'Getting started' },
  { value: 'modules',          label: 'Daily modules' },
  { value: 'community',        label: 'Community' },
  { value: 'tiers_and_pricing',label: 'Tiers & pricing' },
  { value: 'work_with_frank',  label: 'Work with Frank' },
  { value: 'account',          label: 'Account' },
  { value: 'other',            label: 'Other' },
];
