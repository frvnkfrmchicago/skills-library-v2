/* ═══ CompletionTicker — public completion feed ═══
 *
 * Real completions from module_completions; faceless users
 * (profile.faceless = true) are filtered upstream.
 *
 * Subscribes to module_completions inserts via Supabase realtime.
 * Empty state: renders nothing if there are no completions yet.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import './CompletionTicker.css';

interface TickerEntry {
  id: string;
  display_name: string;
  module_title: string;
  module_slug: string;
  completed_at: string;
}

function timeAgo(iso: string): string {
  const sec = (Date.now() - Date.parse(iso)) / 1000;
  if (sec < 60) return 'just now';
  if (sec < 3600) return `${Math.round(sec / 60)} min ago`;
  if (sec < 86400) return `${Math.round(sec / 3600)} hr ago`;
  return `${Math.round(sec / 86400)} d ago`;
}

export default function CompletionTicker() {
  const [entries, setEntries] = useState<TickerEntry[]>([]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // No backend configured — render empty state.
      return;
    }

    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('module_completions')
        .select('id, completed_at, module:modules(title, slug), user:profiles!module_completions_user_id_fkey(display_name, faceless)')
        .order('completed_at', { ascending: false })
        .limit(20);
      if (cancelled) return;

      const rows: TickerEntry[] = (data ?? [])
        .filter((r: { user?: { faceless?: boolean } }) => !r.user?.faceless)
        .slice(0, 6)
        .map((r: {
          id: string;
          completed_at: string;
          module?: { title: string; slug: string };
          user?: { display_name: string };
        }) => ({
          id: r.id,
          display_name: r.user?.display_name ?? 'Someone',
          module_title: r.module?.title ?? 'a module',
          module_slug: r.module?.slug ?? '',
          completed_at: r.completed_at,
        }));
      setEntries(rows);

      // Live updates — append on insert, kick off oldest.
      channel = supabase
        .channel('completion-ticker')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'module_completions' },
          (_payload) => {
            // Re-fetch on any insert (cheap; runs at most a few times per minute).
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (supabase as any)
              .from('module_completions')
              .select('id, completed_at, module:modules(title, slug), user:profiles!module_completions_user_id_fkey(display_name, faceless)')
              .order('completed_at', { ascending: false })
              .limit(6)
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .then(({ data: fresh }: any) => {
                if (!fresh) return;
                setEntries(
                  fresh
                    .filter((r: { user?: { faceless?: boolean } }) => !r.user?.faceless)
                    .map((r: {
                      id: string;
                      completed_at: string;
                      module?: { title: string; slug: string };
                      user?: { display_name: string };
                    }) => ({
                      id: r.id,
                      display_name: r.user?.display_name ?? 'Someone',
                      module_title: r.module?.title ?? 'a module',
                      module_slug: r.module?.slug ?? '',
                      completed_at: r.completed_at,
                    }))
                );
              });
          }
        )
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  if (entries.length === 0) return null;

  return (
    <aside className="completion-ticker" aria-label="Live completions">
      <header>
        <Trophy size={14} />
        <span>Live wins</span>
      </header>
      <ul>
        {entries.slice(0, 5).map((e) => (
          <li key={e.id}>
            <strong>{e.display_name}</strong> finished{' '}
            <Link to={`/community/learn/${e.module_slug}`}>{e.module_title}</Link>
            <time dateTime={e.completed_at}>· {timeAgo(e.completed_at)}</time>
          </li>
        ))}
      </ul>
    </aside>
  );
}
