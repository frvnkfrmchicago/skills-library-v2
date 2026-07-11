/* ═══ ADMIN — Learner Explorer ═══
 * Search by email, get a per-learner timeline + drift score.
 * Bypass-aware: in bypass mode, reads localStorage events instead of Supabase.
 */
import { useEffect, useState, type FormEvent } from 'react';
import {
  Search, AlertCircle, User, Activity, ExternalLink,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { isBypassActive } from '../../lib/devBypass';
import { readLocalEvents } from '../../lib/analytics';
import './LearnerExplorer.css';

interface TimelineEvent {
  event_type: string;
  payload: Record<string, unknown> | null;
  path: string | null;
  created_at: string;
}

interface TimelineResult {
  user_id: string | null;
  display_name: string | null;
  email: string;
  drift_score: number;
  events: TimelineEvent[];
  source: 'remote' | 'local';
}

function driftBadgeClass(score: number): string {
  if (score >= 70) return 'is-hot';
  if (score >= 40) return 'is-warm';
  return 'is-cold';
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

export default function LearnerExplorerPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<TimelineResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // In bypass mode, surface the local ring on mount as a sanity check
  useEffect(() => {
    if (!isBypassActive()) return;
    const events = readLocalEvents();
    if (events.length === 0) return;
    setResult({
      user_id: 'bypass-admin',
      display_name: 'Dev Admin (bypass)',
      email: 'dev-admin@assetpersona.local',
      drift_score: 0,
      events: events.map((e) => ({
        event_type: e.event,
        payload: e.props,
        path: (e.props.path as string) ?? null,
        created_at: e.ts,
      })),
      source: 'local',
    });
  }, []);

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!query.trim()) return;
    setBusy(true);

    if (isBypassActive() || !isSupabaseConfigured) {
      // Bypass: simulate by filtering localStorage events
      const events = readLocalEvents();
      setResult({
        user_id: 'bypass-search',
        display_name: query.split('@')[0] || query,
        email: query,
        drift_score: 0,
        events: events.map((e) => ({
          event_type: e.event,
          payload: e.props,
          path: (e.props.path as string) ?? null,
          created_at: e.ts,
        })),
        source: 'local',
      });
      setBusy(false);
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcErr } = await (supabase as any).rpc('admin_learner_timeline', {
        search_email: query.trim().toLowerCase(),
        event_limit: 100,
      });
      if (rpcErr) throw rpcErr;

      if (!data || data.length === 0) {
        setResult(null);
        setError(`No learner found for ${query}.`);
      } else {
        const row = data[0];
        setResult({
          user_id: row.user_id,
          display_name: row.display_name,
          email: row.email,
          drift_score: row.drift_score,
          events: (row.events as TimelineEvent[]) ?? [],
          source: 'remote',
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="learner-explorer">
      <header className="learner-explorer__head">
        <div>
          <h1><Activity size={20} /> Learner Explorer</h1>
          <p className="learner-explorer__sub">
            Search a learner's email — see their full timeline + drift score.
            {isBypassActive() && ' DEV BYPASS · reading local event ring.'}
          </p>
        </div>
        <form onSubmit={handleSearch} className="learner-explorer__search">
          <Search size={16} />
          <input
            type="email"
            placeholder="learner@email.com"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search learner email"
          />
          <button type="submit" className="btn btn--primary btn--sm" disabled={busy}>
            {busy ? 'Searching…' : 'Search'}
          </button>
        </form>
      </header>

      {error && (
        <p className="learner-explorer__err">
          <AlertCircle size={14} /> {error}
        </p>
      )}

      {!result ? (
        <div className="learner-explorer__empty">
          <User size={28} />
          <p>Search a learner to see their timeline.</p>
        </div>
      ) : (
        <>
          <section className="learner-explorer__profile">
            <div className="learner-explorer__avatar">
              {(result.display_name ?? result.email).slice(0, 1).toUpperCase()}
            </div>
            <div>
              <h2>{result.display_name ?? '(unnamed)'}</h2>
              <p>{result.email}</p>
              <p className="learner-explorer__source">
                Source: {result.source === 'remote' ? 'learner_events table' : 'local event ring'}
              </p>
            </div>
            <div className={`learner-explorer__drift ${driftBadgeClass(result.drift_score)}`}>
              <span>{result.drift_score}</span>
              <small>drift score</small>
            </div>
          </section>

          {result.events.length === 0 ? (
            <p className="learner-explorer__no-events">No events recorded for this learner yet.</p>
          ) : (
            <ol className="learner-explorer__timeline">
              {result.events.map((e, i) => (
                <li key={i}>
                  <time>{formatTime(e.created_at)}</time>
                  <span className="learner-explorer__event-type">{e.event_type}</span>
                  {e.path && (
                    <a href={e.path} className="learner-explorer__path" target="_blank" rel="noopener noreferrer">
                      {e.path} <ExternalLink size={10} />
                    </a>
                  )}
                  {e.payload && Object.keys(e.payload).length > 0 && (
                    <code className="learner-explorer__payload">{JSON.stringify(e.payload)}</code>
                  )}
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </div>
  );
}
