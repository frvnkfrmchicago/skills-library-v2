# Game Flow Reference

Detailed audit checklists for game session flows.

---

## Game Session Flow

```
Entry → Play → Score → Outcome → Decision
├── Entry
│   ├── < 3 taps from app launch to gameplay
│   ├── Matchmaking / level selection is fast (< 5s)
│   └── Loading screen has progress indicator or tips
├── Play
│   ├── Controls responsive (< 100ms input lag)
│   ├── Tutorial is OPTIONAL or contextual (not 10 screens of text)
│   ├── Pause works correctly (state preserved)
│   ├── App backgrounding doesn't lose game state
│   └── Low network tolerance (< 200ms latency OK for turn-based)
├── Score
│   ├── Clear win/lose state
│   ├── Stats meaningful and visible
│   └── Score animation is satisfying (not just a number)
├── Outcome
│   ├── Reward is immediate and visible
│   ├── Progress toward larger goal shown (XP bar, rank)
│   └── Social share option available
└── Decision
    ├── Replay button prominent and FAST (< 2s to restart)
    ├── Return to menu without losing progress
    ├── Matchmaking for next game already preloading
    └── Exit is clean (no guilt mechanics)
```

---

## Game-Specific Chaos Paths

```
Test these specifically:
├── Player exits mid-game (phone call, notification) — state persists?
├── Player loses network during multiplayer — what happens?
├── Player force-quits app — can they resume?
├── Player goes AFK for 5 minutes — timeout handling?
├── Opponent disconnects — how is this resolved?
├── Device rotates during gameplay — layout ok?
├── Two simultaneous matches on different devices — handled?
└── Player exploits (double-tap, rapid mashing) — protected?
```

---

## Retention Mechanics Checklist

- [ ] Daily login reward or streak system
- [ ] Achievement/trophy system with unlock animations
- [ ] Leaderboard (friends + global)
- [ ] Push notification for challenges/events (not spam)
- [ ] Progressive difficulty curve
- [ ] Loss aversion design (protecting streaks, reclaiming progress)
- [ ] Social features (invite, challenge a friend, share result)
