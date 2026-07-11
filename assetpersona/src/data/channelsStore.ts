/* ═══ CHANNELS STORE — forum channel taxonomy + project discussion ═══
 *
 * AP-STUDYHALL-REBUILD-2026-06 · Lane 1
 *
 * The forum (Feed.tsx) already has posts, comments, reactions, realtime,
 * and a `category` column. What it lacked was (1) a presentation-rich
 * channel taxonomy — the way Circle groups Spaces and Discord groups
 * channels — and (2) per-project discussion threads so members can "chat
 * about a specific project."
 *
 * This store provides:
 *   - CHANNELS: the channel catalog, grouped, with descriptions + accents.
 *     Keys align with communityData.ts CATEGORIES ids so the existing
 *     `category` column drives channel routing with no data migration.
 *   - listProjectThread / postToProject: the per-project discussion layer,
 *     built on the new posts.project_id column (20260613100200).
 *
 * Lane 4 (Feed) consumes the catalog; Lane 6 (Portfolio) links a project
 * to its discussion thread.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { isBypassActive } from '../lib/devBypass';
import type { CategoryId } from './communityData';

function shouldUseRemote(): boolean {
  return isSupabaseConfigured && !isBypassActive();
}

export interface Channel {
  /** Matches communityData CATEGORIES id (the posts.category value). */
  id: Exclude<CategoryId, 'all'>;
  label: string;
  description: string;
  /** lucide-react icon name, resolved in the Feed. */
  icon: string;
  accentVar: string;
  group: 'Start here' | 'Build together' | 'Get help';
}

export const CHANNELS: Channel[] = [
  {
    id: 'introductions',
    label: 'Introductions',
    description: 'New here? Say hello and tell us what you are building.',
    icon: 'HandHeart',
    accentVar: 'var(--ap-rose-100)',
    group: 'Start here',
  },
  {
    id: 'general',
    label: 'General',
    description: 'Open floor — ideas, thoughts, and anything AI.',
    icon: 'MessageCircle',
    accentVar: 'var(--ap-sky-400)',
    group: 'Start here',
  },
  {
    id: 'wins',
    label: 'Wins',
    description: 'Shipped something? Share it. We celebrate progress here.',
    icon: 'Trophy',
    accentVar: 'var(--color-gold)',
    group: 'Build together',
  },
  {
    id: 'resources',
    label: 'Resources',
    description: 'Tools, threads, and references worth passing on.',
    icon: 'BookOpen',
    accentVar: 'var(--ap-ocean-700)',
    group: 'Build together',
  },
  {
    id: 'questions',
    label: 'Questions',
    description: 'Stuck on something? Ask — no question is too basic.',
    icon: 'HelpCircle',
    accentVar: 'var(--ap-berry-500)',
    group: 'Get help',
  },
];

/** Channels grouped for the sidebar/rail, preserving CHANNELS order. */
export function channelsByGroup(): { group: Channel['group']; channels: Channel[] }[] {
  const order: Channel['group'][] = ['Start here', 'Build together', 'Get help'];
  return order.map((group) => ({
    group,
    channels: CHANNELS.filter((c) => c.group === group),
  }));
}

export function getChannel(id: string): Channel | undefined {
  return CHANNELS.find((c) => c.id === id);
}

/* ════════════════════ Per-project discussion ════════════════════ */

export interface ProjectPost {
  id: string;
  project_id: string;
  author_id: string;
  body: string;
  created_at: string;
}

const LS_KEY = 'ap_project_posts';

function readLocal(): ProjectPost[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]') as ProjectPost[];
  } catch {
    return [];
  }
}

function writeLocal(rows: ProjectPost[]): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(rows.slice(0, 500)));
  } catch {
    /* ignore */
  }
}

/** The discussion thread attached to one member project. */
export async function listProjectThread(projectId: string): Promise<ProjectPost[]> {
  if (!shouldUseRemote()) {
    return readLocal()
      .filter((p) => p.project_id === projectId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('posts')
    .select('id, project_id, author_id, body, created_at')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  return (data as ProjectPost[]) ?? [];
}

export async function postToProject(
  projectId: string,
  authorId: string,
  body: string,
): Promise<ProjectPost> {
  const trimmed = body.trim();
  if (!trimmed) throw new Error('Say something first.');
  const row: ProjectPost = {
    id: crypto.randomUUID(),
    project_id: projectId,
    author_id: authorId,
    body: trimmed,
    created_at: new Date().toISOString(),
  };
  if (!shouldUseRemote()) {
    const all = readLocal();
    all.unshift(row);
    writeLocal(all);
    return row;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('posts')
    .insert({ project_id: projectId, author_id: authorId, body: trimmed, category: 'general' })
    .select('id, project_id, author_id, body, created_at')
    .single();
  if (error) throw error;
  return data as ProjectPost;
}
