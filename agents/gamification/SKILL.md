---
name: gamification
description: Gamification patterns. XP systems, achievements, streaks, leaderboards.
last_updated: 2026-03
owner: Frank
---

# Gamification Skill

**Add game-like elements (XP, achievements, streaks) to any app.**

---

## Context Questions

Before adding gamification:

1. **What's the core behavior to encourage?** — Daily use, actions, milestones
2. **Is competition appropriate?** — Leaderboards (social) vs personal progress
3. **What rewards are possible?** — Virtual (XP) vs real (features, discounts)
4. **User base size?** — Solo app vs community
5. **Retention focus?** — Streaks (daily) vs achievements (milestones)

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Competition** | Solo progress ←→ Leaderboards |
| **Frequency** | One-time achievements ←→ Daily streaks |
| **Complexity** | Simple XP ←→ Full progression system |
| **Rewards** | Virtual badges ←→ Unlockable features |
| **Visibility** | Private stats ←→ Public profiles |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Daily habit app | Streaks (primary), XP (secondary) |
| Learning platform | XP + levels + achievements |
| Social app | Leaderboards + public profiles |
| Productivity tool | Achievements + subtle XP |
| Fitness/health | All elements (high gamification) |
| B2B SaaS | Light touch (progress bars, milestones) |

---

## TL;DR

Make non-game apps addictive through:
- XP & Leveling (progress feedback)
- Achievements (milestone markers)
- Streaks (habit building)
- Leaderboards (competition)
- Rewards (motivation)

```typescript
// Quick integration
import { addXp, checkAchievements, updateStreak } from '@/lib/gamification';
```

---

## Core Elements

| Element | Purpose | When to Use |
|---------|---------|-------------|
| **XP/Points** | Progress feedback | Any action-based app |
| **Levels** | Milestone markers | Long-term engagement |
| **Achievements** | Goal completion | Specific accomplishments |
| **Streaks** | Habit building | Daily/regular use apps |
| **Leaderboards** | Competition | Multi-user apps |
| **Rewards** | Motivation | Unlock features/content |

---

## XP & Leveling System

```typescript
// types/gamification.ts
interface UserProgress {
  xp: number;
  level: number;
  totalXp: number;
}

// XP thresholds for each level
const LEVEL_THRESHOLDS = [
  0,      // Level 1
  100,    // Level 2
  300,    // Level 3
  600,    // Level 4
  1000,   // Level 5
  1500,   // Level 6
  2100,   // Level 7
  2800,   // Level 8
  3600,   // Level 9
  4500,   // Level 10
];

function addXp(current: UserProgress, amount: number): UserProgress {
  const newTotalXp = current.totalXp + amount;
  const newLevel = calculateLevel(newTotalXp);
  const xpForCurrentLevel = LEVEL_THRESHOLDS[newLevel - 1] || 0;
  const xpForNextLevel = LEVEL_THRESHOLDS[newLevel] || Infinity;
  
  return {
    xp: newTotalXp - xpForCurrentLevel,
    level: newLevel,
    totalXp: newTotalXp,
  };
}

function calculateLevel(totalXp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

function getProgressToNextLevel(progress: UserProgress): number {
  const currentThreshold = LEVEL_THRESHOLDS[progress.level - 1] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[progress.level] || currentThreshold;
  const xpInLevel = progress.totalXp - currentThreshold;
  const xpNeeded = nextThreshold - currentThreshold;
  return xpNeeded > 0 ? xpInLevel / xpNeeded : 1;
}
```

---

## Achievement System

```typescript
// types/achievements.ts
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (stats: UserStats) => boolean;
  xpReward: number;
}

interface UserStats {
  tradesLogged: number;
  consecutiveLogins: number;
  totalProfit: number;
  winRate: number;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_trade',
    name: 'First Steps',
    description: 'Log your first trade',
    icon: '🎯',
    condition: (stats) => stats.tradesLogged >= 1,
    xpReward: 10,
  },
  {
    id: 'ten_trades',
    name: 'Getting Serious',
    description: 'Log 10 trades',
    icon: '📊',
    condition: (stats) => stats.tradesLogged >= 10,
    xpReward: 50,
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Log in 7 days in a row',
    icon: '🔥',
    condition: (stats) => stats.consecutiveLogins >= 7,
    xpReward: 100,
  },
  {
    id: 'profitable',
    name: 'In The Green',
    description: 'Reach $1,000 total profit',
    icon: '💰',
    condition: (stats) => stats.totalProfit >= 1000,
    xpReward: 200,
  },
];

function checkAchievements(
  stats: UserStats, 
  unlockedIds: string[]
): Achievement[] {
  return ACHIEVEMENTS.filter(
    (a) => !unlockedIds.includes(a.id) && a.condition(stats)
  );
}
```

---

## Streak System

```typescript
// utils/streaks.ts
interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastLoginDate: string | null;
}

function updateStreak(streak: StreakData): StreakData {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (streak.lastLoginDate === today) {
    // Already logged in today
    return streak;
  }

  if (streak.lastLoginDate === yesterday) {
    // Continuing streak
    const newStreak = streak.currentStreak + 1;
    return {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, streak.longestStreak),
      lastLoginDate: today,
    };
  }

  // Streak broken or first login
  return {
    currentStreak: 1,
    longestStreak: Math.max(1, streak.longestStreak),
    lastLoginDate: today,
  };
}

// Streak rewards
const STREAK_REWARDS = {
  3: { xp: 25, message: '3-day streak! 🔥' },
  7: { xp: 100, message: 'Week streak!  🎯' },
  14: { xp: 250, message: '2-week streak! 💪' },
  30: { xp: 500, message: 'Month streak! 🏆' },
};
```

---

## Leaderboard

```typescript
// With Supabase
const getLeaderboard = async (limit = 10) => {
  const { data } = await supabase
    .from('profiles')
    .select('username, total_xp, level')
    .order('total_xp', { ascending: false })
    .limit(limit);
  
  return data?.map((user, index) => ({
    rank: index + 1,
    ...user,
  }));
};

// With Prisma
const getLeaderboard = async (limit = 10) => {
  return prisma.user.findMany({
    select: { username: true, totalXp: true, level: true },
    orderBy: { totalXp: 'desc' },
    take: limit,
  });
};
```

---

## Progress Bar Component

```tsx
// components/ProgressBar.tsx
interface ProgressBarProps {
  current: number;
  max: number;
  label?: string;
  showText?: boolean;
}

export function ProgressBar({ current, max, label, showText = true }: ProgressBarProps) {
  const percentage = Math.min((current / max) * 100, 100);

  return (
    <div className="w-full">
      {label && <p className="text-sm text-gray-400 mb-1">{label}</p>}
      <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showText && (
        <p className="text-xs text-gray-500 mt-1">
          {current} / {max}
        </p>
      )}
    </div>
  );
}
```

---

## Database Schema (Prisma)

```prisma
model User {
  id              String   @id @default(cuid())
  email           String   @unique
  username        String?
  
  // Gamification
  xp              Int      @default(0)
  totalXp         Int      @default(0)
  level           Int      @default(1)
  currentStreak   Int      @default(0)
  longestStreak   Int      @default(0)
  lastLoginDate   DateTime?
  
  achievements    UserAchievement[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model UserAchievement {
  id            String   @id @default(cuid())
  userId        String
  achievementId String
  unlockedAt    DateTime @default(now())
  
  user          User     @relation(fields: [userId], references: [id])
  
  @@unique([userId, achievementId])
}
```

---

## When to Use Gamification

| App Type | Gamification Level | Elements |
|----------|-------------------|----------|
| SaaS Dashboard | Medium | XP, achievements |
| Fitness/Health | High | Streaks, XP, leaderboards, rewards |
| Learning Platform | High | All elements |
| Trading Journal | Medium | Streaks, achievements |
| Social Platform | High | Levels, leaderboards, rewards |
| E-commerce | Low | Points/rewards only |

---

## Related Skills

- `agents/gaming/SKILL.md` - Build actual games
- `agents/database/SKILL.md` - Store gamification data
- `agents/realtime/SKILL.md` - Real-time leaderboards
- `agents/stripe/SKILL.md` - Monetize with in-app rewards
