# Agent 1 — Gamification System & Streak Engine
Status: completed
Wave: wave-uxcel-adaptation
Owner: Agent 1

## Explainer
Implemented database migrations, triggers, and state queries for the weekly leagues and daily streak logs. Users progress through tier-based leagues (Quartz, Sapphire, Emerald, Diamond) by earning PX, and their streaks are tracked dynamically with calendar activity grids.

## Scope & Outcomes

### 1. Database Migration
Created `supabase/migrations/20260521000000_uxcel_gamification.sql`:
- **streak_logs**: Tracks unique calendar days of user learning events.
- **user_leagues**: Tracks `user_id`, `league_tier`, `weekly_px`, `league_bracket_id`, and `current_rank`.
- **Triggers**:
  - `recalculate_league_ranks`: Automatically updates rankings inside brackets on PX updates.
  - `module_completions_gamification`: Triggers upon module completions to log the active day, assign/tally bracket weekly PX, and verify daily goal thresholds.
- **RLS & Policies**: Row Level Security configured with full access policies for admins and context-appropriate read/write policies for authenticated users.

### 2. Data Actions (`src/data/leaguesStore.ts`)
Created the data store with full bypass fallbacks:
- `getStreakDetails(userId)`: Fetches active streak counts, freeze counts, and complete history of calendar days (via `streak_logs` in remote mode or local completions in bypass mode).
- `getLeagueLeaderboard(userId, tier)`: Retrieves bracket rankings. In bypass mode, returns a deterministic active mock player roster combined with the user's local score.
- `earnPoints(userId, px)`: Increments user points/XP and tracks daily goal (100 PX) threshold completions.

### 3. UI Components Updated
- **StreakCard (`src/components/learn/StreakCard.tsx` & `.css`)**: Integrated `getStreakDetails` and rendered a weekly 7-day activity calendar strip showing completed days and today's status.
- **Leaderboard (`src/pages/community/Leaderboard.tsx` & `.css`)**: Added a main toggle switch between the "Community" and "Weekly Leagues" boards. Weekly Leagues renders tier selectors (Quartz, Sapphire, Emerald, Diamond) and lists ranks with highlighted self row.

## Verification
- Local bypass fallbacks verified and fully operational.
- Database migrations, RLS policies, triggers, and state mutations match database-designing and supabase-building standards.
