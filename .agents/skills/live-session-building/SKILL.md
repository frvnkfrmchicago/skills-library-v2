---
name: live-session-building
description: >
  Architects and implements real-time live session features including audience
  requesting, joining, going live, spectator modes, real-time reactions,
  session state machines, WebRTC/WebSocket infrastructure, reconnection
  handling, and game-session lifecycle management. Covers LiveKit, Supabase
  Realtime, custom WebSocket servers, and React Native performance patterns.
  Use when building go-live features, audience participation flows, live
  game sessions, watch parties, streaming rooms, or when user mentions
  live, audience, session, broadcast, spectator, or real-time multiplayer.
---

# Live Session Building

Live features are the hardest thing to build and the easiest thing to fake.
A "Go Live" button that opens a screen is not a live feature. A live feature
is a synchronized state machine where every participant sees the same truth
at the same time, recovers from disconnection without losing context, and
degrades gracefully when the network betrays them.

If your live feature works on localhost with one user, it does not work.

---

## STOP — Comprehension Gate

Before writing any live session code, answer:

1. **What is "live" in this context?** Video/audio streaming, real-time game state, text chat, reactions, or a combination?
2. **How many concurrent participants?** 2 (1v1), 2-10 (small group), 10-100 (audience), 100+ (broadcast)?
3. **Is this peer-to-peer or server-authoritative?** Who owns the truth?
4. **What happens when someone disconnects mid-session?** Pause? Continue without them? Rejoin where they left off?
5. **What platform?** React Native (Expo), web, or both?

**Do not proceed without clear answers. Vague answers produce vague architecture.**

---

## Architecture Decision Tree

```
Start
├─ Need video/audio streaming?
│  ├─ YES → LiveKit or WebRTC + SFU
│  │        ├─ Audience < 50 → LiveKit Room (direct)
│  │        ├─ Audience 50-1000 → LiveKit SFU + egress to LL-HLS
│  │        └─ Audience 1000+ → LiveKit ingest → MoQ/LL-HLS delivery
│  └─ NO → Continue
│
├─ Need real-time game state sync?
│  ├─ YES → WebSocket (authoritative server)
│  │        ├─ Simple state → Supabase Realtime (presence + broadcast)
│  │        ├─ Complex state → Custom WebSocket + event sourcing
│  │        └─ Competitive → Custom server + tick rate + anti-cheat
│  └─ NO → Continue
│
├─ Need reactions/chat only?
│  ├─ YES → Supabase Realtime channels
│  └─ NO → You don't need a live feature
│
└─ What about reconnection?
   ├─ Casual (reactions/chat) → Supabase handles reconnection
   ├─ Important (game state) → Event replay from sequence number
   └─ Critical (competitive) → Server snapshot + delta replay + validation
```

---

## The Session State Machine

Every live session has exactly these states. If your code doesn't handle
all of them, your feature is broken — you just haven't found the bug yet.

```
                    ┌──────────────────────┐
                    │      CREATING        │
                    │  Host configures     │
                    │  game, privacy,      │
                    │  audience settings   │
                    └──────────┬───────────┘
                               │ host confirms
                    ┌──────────▼───────────┐
                    │      WAITING         │
                    │  Session exists,     │
                    │  waiting for guests  │
                    │  or audience to join │
                    └──────────┬───────────┘
                               │ minimum participants met
                    ┌──────────▼───────────┐
                    │     COUNTDOWN        │
                    │  Brief countdown     │
                    │  before session      │
                    │  starts (3...2...1)  │
                    └──────────┬───────────┘
                               │ countdown ends
                    ┌──────────▼───────────┐
                    │       LIVE           │
                    │  Active session      │
                    │  Game running        │
                    │  Audience watching   │
                    └──────┬───────┬───────┘
                           │       │
            host ends      │       │ game completes
            or disconnects │       │ naturally
                    ┌──────▼───────▼───────┐
                    │     FINISHING         │
                    │  Results shown        │
                    │  Reactions collected  │
                    │  Score recorded       │
                    └──────────┬───────────┘
                               │ cleanup done
                    ┌──────────▼───────────┐
                    │      ENDED           │
                    │  Session archived    │
                    │  Resources freed     │
                    └──────────────────────┘

    INTERRUPTED (can happen from WAITING, COUNTDOWN, or LIVE)
    ┌─────────────────────────┐
    │  Connection lost,       │
    │  app backgrounded,     │
    │  or force quit         │
    │                        │
    │  → Attempt reconnect   │
    │  → If reconnect: resume│
    │  → If timeout: END     │
    └─────────────────────────┘
```

### Implementing the State Machine

```typescript
// session-state-machine.ts
type SessionState =
  | 'CREATING'
  | 'WAITING'
  | 'COUNTDOWN'
  | 'LIVE'
  | 'FINISHING'
  | 'ENDED'
  | 'INTERRUPTED';

type SessionEvent =
  | { type: 'CONFIGURE_COMPLETE' }
  | { type: 'MINIMUM_PARTICIPANTS_MET' }
  | { type: 'COUNTDOWN_FINISHED' }
  | { type: 'GAME_COMPLETE'; results: GameResults }
  | { type: 'HOST_ENDED' }
  | { type: 'CONNECTION_LOST' }
  | { type: 'RECONNECTED' }
  | { type: 'RECONNECT_TIMEOUT' }
  | { type: 'CLEANUP_DONE' };

const VALID_TRANSITIONS: Record<SessionState, SessionEvent['type'][]> = {
  CREATING:    ['CONFIGURE_COMPLETE'],
  WAITING:     ['MINIMUM_PARTICIPANTS_MET', 'HOST_ENDED', 'CONNECTION_LOST'],
  COUNTDOWN:   ['COUNTDOWN_FINISHED', 'HOST_ENDED', 'CONNECTION_LOST'],
  LIVE:        ['GAME_COMPLETE', 'HOST_ENDED', 'CONNECTION_LOST'],
  FINISHING:   ['CLEANUP_DONE'],
  ENDED:       [], // terminal
  INTERRUPTED: ['RECONNECTED', 'RECONNECT_TIMEOUT'],
};

function transition(current: SessionState, event: SessionEvent): SessionState {
  const allowed = VALID_TRANSITIONS[current];
  if (!allowed.includes(event.type)) {
    console.error(`Illegal transition: ${current} + ${event.type}`);
    return current; // Do NOT switch to an undefined state
  }

  switch (event.type) {
    case 'CONFIGURE_COMPLETE':      return 'WAITING';
    case 'MINIMUM_PARTICIPANTS_MET': return 'COUNTDOWN';
    case 'COUNTDOWN_FINISHED':      return 'LIVE';
    case 'GAME_COMPLETE':           return 'FINISHING';
    case 'HOST_ENDED':              return 'FINISHING';
    case 'CONNECTION_LOST':         return 'INTERRUPTED';
    case 'RECONNECTED':             return current; // Return to pre-interrupt state
    case 'RECONNECT_TIMEOUT':       return 'ENDED';
    case 'CLEANUP_DONE':            return 'ENDED';
    default:                        return current;
  }
}
```

**BECAUSE** without a state machine, your session transitions are scattered
across 15 useEffect hooks, and the first time a user backgrounds the app
during a game, your state becomes undefined and your UI renders nothing.

---

## The Audience Architecture

Participants in a live session are NOT all equal. Define roles explicitly.

### Role Hierarchy

| Role | Can Send Data | Can Receive Data | Can End Session | Capacity |
|------|:---:|:---:|:---:|---|
| **Host** | ✅ All | ✅ All | ✅ | 1 |
| **Guest** | ✅ Game actions | ✅ All | ❌ | 1-4 |
| **Audience** | ✅ Reactions only | ✅ Public state | ❌ | 0-∞ |
| **Moderator** | ✅ Admin actions | ✅ All + reports | ✅ | 0-2 |

### Audience Request Flow

```
User taps "Request Audience" on a live session card
    │
    ├─ Is session full? → Show "Session Full" with waitlist option
    │
    ├─ Is session private? → Show "Request Sent" pending host approval
    │     │
    │     ├─ Host approves → Transition to JOINING
    │     └─ Host denies → Show "Request Declined" with grace
    │
    └─ Is session public? → Start JOINING immediately
          │
          ├─ Establish WebSocket/Realtime connection
          │     │
          │     ├─ Connection succeeds → Subscribe to session channel
          │     │     │
          │     │     ├─ Receive current session state (snapshot)
          │     │     ├─ Begin receiving live events
          │     │     └─ Show session UI with "Joined" confirmation
          │     │
          │     └─ Connection fails → Retry with exponential backoff
          │           │
          │           ├─ Retry 1: 1s delay
          │           ├─ Retry 2: 2s delay
          │           ├─ Retry 3: 4s delay
          │           └─ Max retries → Show "Connection Failed" + manual retry
          │
          └─ User taps "Leave" at any point → Clean disconnect + UI reset
```

### What Vibe-Coded Audience Flows Get Wrong

1. **No capacity check** — user joins, overloads the channel, reactions lag
2. **No connection state** — button says "Join" but connection is still establishing
3. **No snapshot on join** — late joiner sees blank screen until next event fires
4. **No leave cleanup** — user closes app, participant count never decrements
5. **No reconnection** — phone locks for 30 seconds, user is permanently disconnected
6. **Host disconnect = undefined** — host closes app, guests see frozen UI forever
7. **Optimistic join** — UI shows "you're in" before connection is confirmed

---

## Reconnection Protocol

### The Reality of Mobile Networks

On mobile, connections drop constantly. Wi-Fi to cellular handoff, elevator
rides, app backgrounding, low battery mode — these are not edge cases, they
are the default experience for 40% of your users.

### Reconnection Strategy

```typescript
class SessionReconnector {
  private sessionId: string;
  private lastEventSequence: number = 0;
  private reconnectAttempts: number = 0;
  private maxAttempts: number = 5;
  private previousState: SessionState;

  async onDisconnect(previousState: SessionState) {
    this.previousState = previousState;
    this.reconnectAttempts = 0;
    await this.attemptReconnect();
  }

  private async attemptReconnect() {
    while (this.reconnectAttempts < this.maxAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 16000);

      await sleep(delay);

      try {
        // 1. Re-establish connection
        const connection = await this.connect();

        // 2. Check if session still exists and is active
        const sessionStatus = await this.getSessionStatus(this.sessionId);
        if (sessionStatus.state === 'ENDED') {
          // Session ended while we were gone — show results, don't rejoin
          this.showSessionEndedScreen(sessionStatus.results);
          return;
        }

        // 3. Request missed events since our last sequence number
        const missedEvents = await this.getMissedEvents(
          this.sessionId,
          this.lastEventSequence
        );

        // 4. Replay missed events to catch up local state
        for (const event of missedEvents) {
          this.applyEvent(event);
          this.lastEventSequence = event.sequence;
        }

        // 5. Resume live event subscription
        this.subscribeLive();

        // 6. Announce reconnection to session
        this.announceReconnection();

        return; // Success
      } catch (error) {
        console.warn(`Reconnect attempt ${this.reconnectAttempts} failed`);
      }
    }

    // All attempts exhausted
    this.showReconnectFailed();
  }
}
```

**BECAUSE** if you don't track event sequence numbers, a reconnected user
either sees stale state, misses events, or gets duplicate events. All three
are worse than showing a "reconnecting..." screen.

---

## Real-Time Reactions

### The Performance Reality

Reactions seem simple until 200 audience members all tap the fire emoji at
once and your UI thread drops to 8fps because you're rendering 200
individual floating animations.

### Throttling and Batching

```typescript
class ReactionManager {
  private buffer: Map<string, number> = new Map(); // emoji → count
  private flushInterval: NodeJS.Timeout;
  private maxFloatingReactions: number = 15; // Screen cap
  private activeAnimations: number = 0;

  constructor() {
    // Batch reactions every 200ms instead of firing on every event
    this.flushInterval = setInterval(() => this.flush(), 200);
  }

  receive(emoji: string) {
    const current = this.buffer.get(emoji) || 0;
    this.buffer.set(emoji, current + 1);
  }

  private flush() {
    if (this.buffer.size === 0) return;

    for (const [emoji, count] of this.buffer) {
      // Show a SINGLE floating animation with a count badge, not N animations
      if (this.activeAnimations < this.maxFloatingReactions) {
        this.spawnReaction(emoji, count);
        this.activeAnimations++;
      }
    }

    this.buffer.clear();
  }

  private spawnReaction(emoji: string, count: number) {
    // Single requestAnimationFrame-driven animation
    // NOT individual Reanimated animations for each reaction
    // Animation removes itself and decrements activeAnimations on complete
  }

  destroy() {
    clearInterval(this.flushInterval);
  }
}
```

**BECAUSE** every AI-generated reaction system creates one animation per
emoji event. At scale, that's a memory leak and a jank factory.

---

## Supabase Realtime Pattern (For Non-Video Live Sessions)

When you don't need media streaming, Supabase Realtime channels are the
fastest path to a working live session.

```typescript
import { supabase } from './supabase';

// CORRECT — channel per session, not per user
const channel = supabase.channel(`session:${sessionId}`, {
  config: {
    broadcast: { self: false }, // Don't echo your own events back
    presence: { key: userId },  // Track who's in the session
  },
});

// Track presence (who's watching)
channel.on('presence', { event: 'sync' }, () => {
  const state = channel.presenceState();
  const participantCount = Object.keys(state).length;
  updateParticipantUI(participantCount);
});

// Listen for game state changes (from host/server)
channel.on('broadcast', { event: 'game_state' }, ({ payload }) => {
  applyGameState(payload);
});

// Listen for reactions
channel.on('broadcast', { event: 'reaction' }, ({ payload }) => {
  reactionManager.receive(payload.emoji);
});

// CRITICAL: Subscribe and track status
channel.subscribe((status) => {
  if (status === 'SUBSCRIBED') {
    // NOW announce your presence
    channel.track({ userId, role, joinedAt: Date.now() });
  }
  if (status === 'CHANNEL_ERROR') {
    // Handle — do NOT silently ignore
    handleChannelError();
  }
  if (status === 'TIMED_OUT') {
    // Reconnection attempt
    handleTimeout();
  }
});

// CLEANUP — the thing vibe code always forgets
function leaveSession() {
  channel.untrack();            // Remove from presence
  channel.unsubscribe();        // Stop receiving events
  supabase.removeChannel(channel); // Free resources
}
```

### What Gets Vibe-Coded Wrong with Supabase Realtime

1. **No cleanup** — channels leak, presence ghosts persist, memory usage climbs
2. **Self-echo** — `broadcast.self: true` by default, user sees their own
   reactions bouncing back
3. **No subscribe status check** — code sends events before channel is subscribed,
   events silently disappear
4. **Channel per user** — creating `session:${sessionId}:${userId}` channels
   instead of one shared channel with presence tracking
5. **No untrack** — user leaves, presence count stays inflated forever

---

## LiveKit Pattern (For Video/Audio Sessions)

```typescript
import { Room, RoomEvent, Track } from 'livekit-client';

// CORRECT — manual lifecycle, not component-driven
const room = new Room({
  adaptiveStream: true,      // Auto-adjust quality based on viewport
  dynacast: true,            // Only send tracks that someone is viewing
  disconnectOnPageHide: false, // React Native: don't kill on background
});

// Define ALL event handlers BEFORE connecting
room.on(RoomEvent.ParticipantConnected, (participant) => {
  updateParticipantList();
});

room.on(RoomEvent.ParticipantDisconnected, (participant) => {
  if (participant.identity === hostId) {
    // Host disconnected — this is not the same as "session over"
    // Show "Host disconnected" with 30s reconnect window
    startHostReconnectTimer();
  }
  updateParticipantList();
});

room.on(RoomEvent.Disconnected, (reason) => {
  // YOUR connection dropped
  if (reason === 'SIGNAL_DISCONNECTED') {
    attemptReconnect();
  }
});

room.on(RoomEvent.Reconnecting, () => {
  showReconnectingOverlay();
});

room.on(RoomEvent.Reconnected, () => {
  hideReconnectingOverlay();
  // Re-sync game state that may have changed during disconnect
  requestStateSnapshot();
});

// Connect with token from your backend
await room.connect(LIVEKIT_URL, token);

// CLEANUP
async function leaveRoom() {
  await room.disconnect();
  room.removeAllListeners(); // Prevent memory leaks
}
```

---

## Game Session Lifecycle

For apps like Play4Keeps where the live session IS a game:

### Pre-Session (CREATING → WAITING)

```typescript
interface SessionConfig {
  gameId: string;           // Which game to play
  hostId: string;           // Who created the session
  maxGuests: number;        // How many active players (not audience)
  maxAudience: number;      // How many spectators
  isAnonymous: boolean;     // Hide real names?
  privacyMode: 'public' | 'friends' | 'invite_only';
  estimatedDuration: number; // Minutes, for audience expectation
}

// VALIDATE before creating
function validateSessionConfig(config: SessionConfig): string[] {
  const errors: string[] = [];
  if (!config.gameId) errors.push('Game not selected');
  if (!config.hostId) errors.push('No host identity');
  if (config.maxGuests < 1) errors.push('Need at least 1 guest');
  if (config.maxAudience < 0) errors.push('Invalid audience cap');
  return errors;
}
```

### During Session (LIVE)

```typescript
// Server-authoritative game state
interface GameState {
  sessionId: string;
  state: SessionState;
  currentRound: number;
  totalRounds: number;
  scores: Record<string, number>;
  currentPrompt: string | null;
  timeRemaining: number;
  lastEventSequence: number;
}

// Events flow ONE direction: Server → All Clients
// Player actions flow: Client → Server (validated) → Broadcast
// NEVER let a client set game state directly
```

### Post-Session (FINISHING → ENDED)

```typescript
async function endSession(sessionId: string, results: GameResults) {
  // 1. Broadcast final results to all participants
  await channel.send({
    type: 'broadcast',
    event: 'game_complete',
    payload: results,
  });

  // 2. Persist results to database
  await supabase.from('game_sessions').update({
    state: 'ENDED',
    results: results,
    ended_at: new Date().toISOString(),
  }).eq('id', sessionId);

  // 3. Update player stats
  for (const [playerId, score] of Object.entries(results.scores)) {
    await updatePlayerStats(playerId, score);
  }

  // 4. Wait for result screen acknowledgment (5 second minimum)
  await sleep(5000);

  // 5. Clean up all connections
  channel.untrack();
  channel.unsubscribe();
  supabase.removeChannel(channel);
}
```

---

## Vibe-Code Detector — Live Session Edition

Run these checks on any live session implementation:

```bash
# 1. Does the session have a state machine?
grep -rn "CREATING\|WAITING\|COUNTDOWN\|LIVE\|FINISHING\|ENDED" src/ --include="*.ts" --include="*.tsx" | wc -l
# If 0: There's no state machine. The session flow is useState spaghetti.

# 2. Is there reconnection handling?
grep -rn "reconnect\|RECONNECT\|onDisconnect\|Disconnected" src/ --include="*.ts" --include="*.tsx" | wc -l
# If 0: Users who lose connection are permanently kicked.

# 3. Is there channel cleanup?
grep -rn "unsubscribe\|removeChannel\|untrack\|disconnect" src/ --include="*.ts" --include="*.tsx" | wc -l
# If 0: Channels/rooms leak. Memory usage climbs until crash.

# 4. Is there reaction throttling?
grep -rn "throttle\|debounce\|batch\|buffer\|maxFloating\|MAX_REACTIONS" src/ --include="*.ts" --include="*.tsx" | wc -l
# If 0: 200 reactions = 200 animations = UI death.

# 5. Are game actions server-validated?
grep -rn "validate\|authorize\|server.*action\|authoritative" src/ --include="*.ts" --include="*.tsx" | wc -l
# If 0: Client can cheat by sending fabricated game events.

# 6. Is there a host-disconnect handler?
grep -rn "host.*disconnect\|host.*left\|host.*gone\|HOST_ENDED" src/ --include="*.ts" --include="*.tsx" | wc -l
# If 0: When host closes app, audience sees frozen UI forever.

# 7. Is there an audience capacity check?
grep -rn "maxAudience\|capacity\|max.*participants\|isFull" src/ --include="*.ts" --include="*.tsx" | wc -l
# If 0: Unlimited joins will overload the channel.
```

---

## Performance Budgets

| Metric | Target | Unacceptable |
|--------|--------|-------------|
| Session join time | < 2s from tap | > 5s |
| Event latency (send → receive) | < 200ms | > 1s |
| Reaction animation FPS | 60fps | < 30fps |
| Reconnection time | < 3s (auto) | Manual refresh required |
| Memory per session | < 30MB | > 100MB (leak) |
| Max concurrent floating reactions | 15 | Unlimited (jank) |
| Host disconnect grace period | 30s | 0s (instant end) |
| Channel cleanup after leave | Immediate | Never |

---

## Database Schema

```sql
-- Session table
CREATE TABLE live_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES auth.users(id) NOT NULL,
  game_id TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'CREATING'
    CHECK (state IN ('CREATING','WAITING','COUNTDOWN','LIVE','FINISHING','ENDED','INTERRUPTED')),
  config JSONB NOT NULL DEFAULT '{}',
  results JSONB,
  participant_count INT DEFAULT 0,
  audience_count INT DEFAULT 0,
  max_guests INT DEFAULT 1,
  max_audience INT DEFAULT 50,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Anyone can read active sessions, only host can update
ALTER TABLE live_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active sessions are public"
  ON live_sessions FOR SELECT
  USING (state NOT IN ('CREATING', 'ENDED'));

CREATE POLICY "Host controls session"
  ON live_sessions FOR UPDATE
  USING (auth.uid() = host_id);
```

---

## NEVER

- **NEVER** let the client set game state directly — server is the authority
- **NEVER** create a channel per user — one channel per session with presence
- **NEVER** skip the INTERRUPTED state — mobile disconnections are not optional
- **NEVER** render unlimited floating reactions — cap and batch
- **NEVER** forget channel cleanup on leave — ghosts break presence counts
- **NEVER** assume the host is always connected — build the host-gone handler
- **NEVER** fire events before confirming channel subscription — they vanish silently
- **NEVER** skip the countdown state — it gives the system time to sync and gives users time to prepare

---

## Related Skills

| Skill | When to use |
|-------|-------------|
| `web-game-foundations` | Game architecture: engine, game loop, scene states |
| `r3f-game-building` | R3F game runtime (if React-hosted) |
| `three-webgl-game-building` | Three.js game runtime (if standalone) |
| `supabase-building` | Realtime channel setup and RLS |
| `backend-hardening` | API security for session endpoints |
| `anti-glitch-debugging` | Performance issues during live sessions |
| `flow-designing` | Validating the audience request → join → live user flow |
| `component-building` | Building the reaction overlay and session cards |

---

## Output Format

```markdown
## Live Session Architecture: [Feature Name]

### Session Type
[Video/Audio | Game State | Chat/Reactions | Hybrid]

### State Machine
[States defined, transitions mapped, edge cases handled]

### Infrastructure
[Which tools: LiveKit / Supabase Realtime / Custom WS]

### Roles
[Host / Guest / Audience / Moderator definitions and permissions]

### Reconnection Strategy
[Event sequence tracking, snapshot + replay, grace periods]

### Performance
[Reaction throttling, animation caps, memory budgets]

### Vibe-Code Scan Results
[Output from detector commands above]
```
