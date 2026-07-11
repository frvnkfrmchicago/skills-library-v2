import { useState, useMemo, useEffect } from 'react';
import { getMembers, getLevelName } from '../../data/communityData';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { isBypassActive } from '../../lib/devBypass';
import { Trophy, Shield } from '@phosphor-icons/react';
import { useAuth } from '../../context/useAuth';
import { getLeagueLeaderboard } from '../../data/leaguesStore';
import type { LeagueLeaderboardEntry } from '../../data/leaguesStore';
import type { Profile } from '../../types/supabase';
import SubTabs from '../../components/community/SubTabs';
import './Leaderboard.css';

const COMMUNITY_TABS = [
  { to: '/community', label: 'Discussion', end: true },
  { to: '/community/leaderboard', label: 'Leaderboard' },
  { to: '/community/members', label: 'Members' },
  { to: '/community/calendar', label: 'Calendar' },
];

type Period = 'week' | 'month' | 'all';

interface LearnerEventRow {
  user_id: string | null;
  event_type: string;
  created_at: string;
}

interface ScoredMember {
  member: Profile;
  points: number;
}

const EVENT_WEIGHTS: Record<string, number> = {
  post_created: 5,
  comment_created: 2,
  reaction_added: 1,
  module_completed: 10,
  module_started: 1,
};

function weightFor(eventType: string): number {
  return EVENT_WEIGHTS[eventType] ?? 1;
}

function periodCutoffIso(period: Exclude<Period, 'all'>): string {
  const days = period === 'week' ? 7 : 30;
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return cutoff.toISOString();
}

function shouldUseRemote(): boolean {
  return isSupabaseConfigured && !isBypassActive();
}

export default function Leaderboard() {
  const { user, isBypass, bypassRole } = useAuth();
  const uid = user?.id ?? (isBypass ? `bypass-${bypassRole}` : null);

  const [view, setView] = useState<'community' | 'league'>('community');

  // Community Leaderboard States
  const [period, setPeriod] = useState<Period>('all');
  const members = getMembers();
  const [eventScores, setEventScores] = useState<Record<string, number>>({});
  const [loadingPeriod, setLoadingPeriod] = useState(false);

  // League Leaderboard States
  const [selectedTier, setSelectedTier] = useState<string>('Quartz');
  const [leagueEntries, setLeagueEntries] = useState<LeagueLeaderboardEntry[]>([]);
  const [loadingLeague, setLoadingLeague] = useState(false);

  // Community Leaderboard Effect
  useEffect(() => {
    if (view !== 'community') return;
    if (period === 'all') {
      setEventScores({});
      return;
    }

    let cancelled = false;
    setLoadingPeriod(true);

    async function loadPeriod() {
      if (!shouldUseRemote()) {
        if (!cancelled) {
          setEventScores({});
          setLoadingPeriod(false);
        }
        return;
      }

      const cutoff = periodCutoffIso(period as Exclude<Period, 'all'>);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('learner_events')
        .select('user_id, event_type, created_at')
        .gte('created_at', cutoff)
        .not('user_id', 'is', null)
        .limit(5000);

      if (cancelled) return;

      if (error || !data) {
        setEventScores({});
        setLoadingPeriod(false);
        return;
      }

      const tally: Record<string, number> = {};
      for (const row of data as LearnerEventRow[]) {
        if (!row.user_id) continue;
        tally[row.user_id] = (tally[row.user_id] ?? 0) + weightFor(row.event_type);
      }
      setEventScores(tally);
      setLoadingPeriod(false);
    }

    void loadPeriod();
    return () => {
      cancelled = true;
    };
  }, [period, view]);

  // League Leaderboard Effect
  useEffect(() => {
    if (view !== 'league' || !uid) return;
    let cancelled = false;
    setLoadingLeague(true);

    getLeagueLeaderboard(uid, selectedTier)
      .then((data) => {
        if (!cancelled) {
          setLeagueEntries(data);
          setLoadingLeague(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLeagueEntries([]);
          setLoadingLeague(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [view, uid, selectedTier]);

  const rankedCommunity = useMemo<ScoredMember[]>(() => {
    if (period === 'all') {
      return [...members]
        .sort((a, b) => b.points - a.points)
        .map((m) => ({ member: m, points: m.points }));
    }

    return Object.entries(eventScores)
      .map(([userId, points]) => {
        const member = members.find((m) => m.id === userId);
        if (!member) return null;
        return { member, points };
      })
      .filter((x): x is ScoredMember => x !== null)
      .sort((a, b) => b.points - a.points);
  }, [period, members, eventScores]);

  const medals = ['#1', '#2', '#3'];
  const tiers = ['Quartz', 'Sapphire', 'Emerald', 'Diamond'];

  return (
    <div className="leaderboard">
      <SubTabs tabs={COMMUNITY_TABS} />
      <div className="community-page-header">
        <h1>
          <Trophy size={28} weight="duotone" /> Leaderboard
        </h1>
        <p>Compare points, climb tiers, and dominate learning brackets</p>
      </div>

      {/* Main View Toggle */}
      <div className="leaderboard-view-toggle">
        <button
          className={`leaderboard-toggle-btn ${view === 'community' ? 'active' : ''}`}
          onClick={() => setView('community')}
        >
          <Trophy size={16} /> Community
        </button>
        <button
          className={`leaderboard-toggle-btn ${view === 'league' ? 'active' : ''}`}
          onClick={() => setView('league')}
        >
          <Shield size={16} /> Weekly Leagues
        </button>
      </div>

      {view === 'community' ? (
        <>
          <div className="community-tabs">
            {(['week', 'month', 'all'] as Period[]).map((p) => (
              <button
                key={p}
                className={`community-tab ${period === p ? 'community-tab--active' : ''}`}
                onClick={() => setPeriod(p)}
                aria-pressed={period === p}
              >
                {p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : 'All Time'}
              </button>
            ))}
          </div>

          {loadingPeriod && (
            <div className="community-card feed__empty">
              <p>Loading {period === 'week' ? 'this week' : 'this month'}…</p>
            </div>
          )}

          {!loadingPeriod && rankedCommunity.length === 0 && (
            <div className="community-card feed__empty">
              <h3>
                {period === 'all'
                  ? 'No activity yet'
                  : period === 'week'
                    ? 'No activity this week'
                    : 'No activity this month'}
              </h3>
              <p>Start posting and engaging to climb the leaderboard.</p>
            </div>
          )}

          <div className="leaderboard__list">
            {rankedCommunity.map(({ member, points }, i) => (
              <div key={member.id} className="community-card leaderboard__row">
                <span className="leaderboard__rank">{i < 3 ? medals[i] : `#${i + 1}`}</span>
                {member.avatar_url ? (
                  <img src={member.avatar_url} alt={member.display_name} className="avatar avatar--md" />
                ) : (
                  <div className={`avatar avatar--md avatar--${(member.id.charCodeAt(member.id.length - 1) % 5) + 1}`}>
                    {member.display_name.charAt(0)}
                  </div>
                )}
                <div className="leaderboard__info">
                  <span className="leaderboard__name">{member.display_name}</span>
                  <span className="level-badge">Lvl {member.level} · {getLevelName(member.level)}</span>
                </div>
                <span className="leaderboard__points">{points} pts</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="league-tiers">
            {tiers.map((t) => (
              <button
                key={t}
                className={`league-tier-btn ${selectedTier === t ? 'league-tier-btn--active' : ''}`}
                onClick={() => setSelectedTier(t)}
              >
                {t}
              </button>
            ))}
          </div>

          {loadingLeague && (
            <div className="community-card feed__empty">
              <p>Loading {selectedTier} league…</p>
            </div>
          )}

          {!loadingLeague && leagueEntries.length === 0 && (
            <div className="community-card feed__empty">
              <h3>No league entries yet</h3>
              <p>Be the first to complete a module to join the bracket!</p>
            </div>
          )}

          <div className="leaderboard__list">
            {leagueEntries.map((entry) => (
              <div
                key={entry.user_id}
                className={`community-card leaderboard__row ${entry.is_user ? 'leaderboard__row--self' : ''}`}
              >
                <span className="leaderboard__rank">
                  {entry.current_rank <= 3 ? medals[entry.current_rank - 1] : `#${entry.current_rank}`}
                </span>
                {entry.avatar_url ? (
                  <img src={entry.avatar_url} alt={entry.display_name} className="avatar avatar--md" />
                ) : (
                  <div className={`avatar avatar--md avatar--${(entry.user_id.charCodeAt(entry.user_id.length - 1) % 5) + 1}`}>
                    {entry.display_name.charAt(0)}
                  </div>
                )}
                <div className="leaderboard__info">
                  <span className="leaderboard__name">
                    {entry.display_name} {entry.is_user && <span className="self-tag">(You)</span>}
                  </span>
                  <span className="level-badge">Lvl {entry.level} · {getLevelName(entry.level)}</span>
                </div>
                <span className="leaderboard__points">{entry.weekly_px} Skill Points</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

