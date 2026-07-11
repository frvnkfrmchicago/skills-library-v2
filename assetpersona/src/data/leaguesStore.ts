import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { isBypassActive } from '../lib/devBypass';
import { getMembers, getLevelForPoints } from './communityData';
import { getLocalStreak, listLocalCompletions } from '../lib/learnLocal';
import type { UserStreak } from '../types/learn';

export interface StreakDetails extends UserStreak {
  calendar_days: string[];
}

export interface LeagueLeaderboardEntry {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  level: number;
  points: number;
  weekly_px: number;
  current_rank: number;
  league_tier: string;
  league_bracket_id: string;
  is_user: boolean;
}

function shouldUseRemote(): boolean {
  return isSupabaseConfigured && !isBypassActive();
}

function getWeekString(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-${String(weekNo).padStart(2, '0')}`;
}

export async function getStreakDetails(userId: string): Promise<StreakDetails> {
  if (!shouldUseRemote()) {
    const localStreak = getLocalStreak(userId);
    const completions = listLocalCompletions(userId);
    const calendar_days = Array.from(
      new Set(completions.map((c) => c.completed_at.slice(0, 10)))
    ).sort((a, b) => b.localeCompare(a));

    return {
      ...localStreak,
      calendar_days,
    };
  }

  // Fetch streak info
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: streak } = await (supabase as any)
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  // Fetch calendar logs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: logs } = await (supabase as any)
    .from('streak_logs')
    .select('completed_date')
    .eq('user_id', userId)
    .order('completed_date', { ascending: false });

  const calendar_days = (logs ?? []).map((l: any) => l.completed_date);

  const defaultStreak: UserStreak = {
    user_id: userId,
    current_count: 0,
    longest_count: 0,
    last_completed_on: null,
    freeze_days_used: 0,
    freeze_days_available: 1,
    updated_at: new Date().toISOString(),
  };

  return {
    ...(streak ?? defaultStreak),
    calendar_days,
  };
}

export async function getLeagueLeaderboard(userId: string, tier: string): Promise<LeagueLeaderboardEntry[]> {
  if (!shouldUseRemote()) {
    // Local storage bypass fallback:
    // Fetch registered members, calculate deterministic mock scores for other users, and use local value for active user.
    const members = getMembers();
    const localWeeklyPxKey = `ap_user_weekly_px_${userId}`;
    const userWeeklyPx = Number(localStorage.getItem(localWeeklyPxKey) ?? '0');

    const entries: LeagueLeaderboardEntry[] = members.map((m) => {
      const is_user = m.id === userId;
      let weekly_px = 0;
      if (is_user) {
        weekly_px = userWeeklyPx;
      } else {
        // Deterministic hash based on ID
        let hash = 0;
        for (let i = 0; i < m.id.length; i++) {
          hash = (hash * 31 + m.id.charCodeAt(i)) | 0;
        }
        weekly_px = Math.abs(hash) % 250; // mock PX up to 250
      }

      return {
        user_id: m.id,
        display_name: m.display_name,
        avatar_url: m.avatar_url,
        level: m.level,
        points: m.points,
        weekly_px,
        current_rank: 1,
        league_tier: tier,
        league_bracket_id: 'local-bracket',
        is_user,
      };
    });

    // Ensure current user is in the list
    if (!entries.some((e) => e.user_id === userId)) {
      entries.push({
        user_id: userId,
        display_name: 'You',
        avatar_url: null,
        level: 1,
        points: 0,
        weekly_px: userWeeklyPx,
        current_rank: 1,
        league_tier: tier,
        league_bracket_id: 'local-bracket',
        is_user: true,
      });
    }

    entries.sort((a, b) => b.weekly_px - a.weekly_px);
    entries.forEach((e, idx) => {
      e.current_rank = idx + 1;
    });

    return entries;
  }

  // Remote Database Flow:
  // 1. Get user's current bracket ID for this tier
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: userLeague } = await (supabase as any)
    .from('user_leagues')
    .select('league_bracket_id')
    .eq('user_id', userId)
    .eq('league_tier', tier)
    .maybeSingle();

  const weekStr = getWeekString(new Date());
  const defaultBracketId = `bracket-${tier}-${weekStr}`;
  const bracketId = userLeague?.league_bracket_id ?? defaultBracketId;

  // 2. Fetch rankings in this bracket
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rankings } = await (supabase as any)
    .from('user_leagues')
    .select(`
      user_id,
      league_tier,
      weekly_px,
      current_rank,
      league_bracket_id,
      profiles:user_id (
        id,
        display_name,
        avatar_url,
        level,
        points
      )
    `)
    .eq('league_bracket_id', bracketId)
    .eq('league_tier', tier)
    .order('weekly_px', { ascending: false });

  const entries: LeagueLeaderboardEntry[] = (rankings ?? []).map((r: any) => {
    const prof = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
    return {
      user_id: r.user_id,
      display_name: prof?.display_name ?? 'Anonymous Learner',
      avatar_url: prof?.avatar_url ?? null,
      level: prof?.level ?? 1,
      points: prof?.points ?? 0,
      weekly_px: r.weekly_px,
      current_rank: r.current_rank,
      league_tier: r.league_tier,
      league_bracket_id: r.league_bracket_id,
      is_user: r.user_id === userId,
    };
  });

  // Ensure current user is in the list even if they just joined and have 0 weekly px
  if (!entries.some((e) => e.user_id === userId)) {
    // Fetch profile info for self
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: selfProfile } = await (supabase as any)
      .from('profiles')
      .select('id, display_name, avatar_url, level, points')
      .eq('id', userId)
      .single();

    if (selfProfile) {
      entries.push({
        user_id: userId,
        display_name: selfProfile.display_name,
        avatar_url: selfProfile.avatar_url,
        level: selfProfile.level,
        points: selfProfile.points,
        weekly_px: 0,
        current_rank: entries.length + 1,
        league_tier: tier,
        league_bracket_id: bracketId,
        is_user: true,
      });
    }
  }

  // Sort and update ranks locally just in case
  entries.sort((a, b) => b.weekly_px - a.weekly_px);
  entries.forEach((e, idx) => {
    e.current_rank = idx + 1;
  });

  return entries;
}

export async function earnPoints(
  userId: string,
  px: number
): Promise<{ dailyGoalMet: boolean; totalDailyPx: number }> {
  if (!shouldUseRemote()) {
    // Increment local weekly px
    const localWeeklyPxKey = `ap_user_weekly_px_${userId}`;
    const oldWeekly = Number(localStorage.getItem(localWeeklyPxKey) ?? '0');
    const newWeekly = oldWeekly + px;
    localStorage.setItem(localWeeklyPxKey, String(newWeekly));

    // Update community profiles points so levels recalculate
    const members = getMembers();
    const idx = members.findIndex((m) => m.id === userId);
    if (idx >= 0) {
      members[idx].points += px;
      members[idx].level = getLevelForPoints(members[idx].points);
      localStorage.setItem('ap_community_members', JSON.stringify(members));
    }

    // Check daily goal
    const localCompletions = listLocalCompletions(userId);
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayCompletions = localCompletions.filter(
      (c) => c.completed_at.slice(0, 10) === todayStr
    );
    const totalDailyPx = todayCompletions.reduce((sum, c) => sum + c.xp_earned, 0) + px;
    const dailyGoalMet = totalDailyPx >= 100;

    return { dailyGoalMet, totalDailyPx };
  }

  // Remote Database Flow:
  // 1. Update points (profiles.points + profiles.xp via rpc or query)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).rpc('bump_xp_and_role', { p_user_id: userId, p_delta: px });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('points')
    .eq('id', userId)
    .single();

  if (profile) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('profiles')
      .update({ points: (profile.points ?? 0) + px })
      .eq('id', userId);
  }

  // 2. Update user_leagues weekly_px
  const weekStr = getWeekString(new Date());
  const tier = 'Quartz'; // Default tier
  const bracketId = `bracket-${tier}-${weekStr}`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: ul } = await (supabase as any)
    .from('user_leagues')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (ul) {
    const isSameBracket = ul.league_bracket_id === bracketId;
    const newPx = isSameBracket ? (ul.weekly_px + px) : px;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('user_leagues')
      .update({
        weekly_px: newPx,
        league_bracket_id: bracketId,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('user_leagues')
      .insert({
        user_id: userId,
        league_tier: tier,
        weekly_px: px,
        league_bracket_id: bracketId,
        current_rank: 1,
      });
  }

  // 3. Fetch today's total completions PX
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: completions } = await (supabase as any)
    .from('module_completions')
    .select('xp_earned')
    .eq('user_id', userId)
    .gte('completed_at', todayStart.toISOString());

  const totalDailyPx = (completions ?? []).reduce((sum: number, c: any) => sum + (c.xp_earned ?? 0), 0) + px;
  const dailyGoalMet = totalDailyPx >= 100;

  return { dailyGoalMet, totalDailyPx };
}
