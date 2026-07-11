# SAD Grounding Checklist

The user's recurring correction: plans that look authoritative but
ship on assertion are rejected. Plans with every non-trivial rule
grounded by a cited 2024-2026 source are approved.

This file is the durable artifact for SAD Gate 2/3 grounding. Pair
with `writing-plans` and `plan` skills.

## The pairing (every non-trivial rule)

1. The rule statement (what the plan requires).
2. A cited source — real URL, skill, librarian, prior review, or
   local file:line — with the rule extracted and applied to this
   build.

A link with no extracted principle is not a citation. A rule with
no link is a claim. The pairing is the standard.

## Sources, ordered by strength

1. Real 2024-2026 product reference with a named feature.
   Example: "TradingView Bar Replay supports 9 replay speeds,
   step-by-step, jump-to-live, drawing preservation. Applied:
   simulator transport has play/pause/step/1x-2x-4x-8x/jump."
   https://www.tradingview.com/support/solutions/43000712747-bar-replay-how-and-why-to-test-a-strategy-in-the-past/

2. Real 2024-2026 academic / framework reference.
   Example: "Kolb Experiential Learning Cycle = 4 stages (Concrete
   Experience, Reflective Observation, Abstract Conceptualization,
   Active Experimentation). Applied: lesson page has 4 named steps
   in this order."
   https://www.simplypsychology.org/learning-kolb.html

3. Real 2024-2026 standard / accessibility / regulation.
   Example: "WCAG 2.2 SC 2.5.8 requires 24x24 touch targets at AA;
   Apple HIG and Material Design recommend 44x44. Applied: every
   interactive pads to 44x44 on 320px viewport."
   https://www.w3.org/TR/wcag2mobile-22/

4. Real 2024-2026 product research / case study.
   Example: "Duolingo streak freeze users stay 17.19 days vs 11.62
   without, 48% longer. Applied: daily-drill streak system ships
   with a freeze token."

5. Library skill + librarian pair.
   Example: "animation-designing: GPU-composited transforms only,
   never `width`/`height`/`top`. Applied: float-up reveal uses
   `translateY` and `opacity` only."

6. Local file:line.
   Example: "Existing 10 stocks scenarios at
   `src/lib/simulator/scenarios/stocks/` already declare
   `decisionPoints[]` with `score`/`rationale` per choice. Applied:
   lane 2 reuses these as the click-through-outcome drill library."

## Anti-patterns

- Generic product name with no extracted rule ("Robinhood does
  it"). Force the citation to name the specific feature and the
  application.
- "According to research" with no URL. The user calls this out:
  "are you running research?"
- Real product named incorrectly. The user is a practitioner.
- Ungrounded rules hidden in prose. Mark `[ungrounded]` and surface.
- The same URL cited for 10 different rules. That URL grounds one
  rule, possibly two; the rest need different sources.

## The no-time-estimates rule

Banned phrases in plan documents: "1 hour", "30 min", "2-3 days",
"X days", "X weeks", "Effort:". Plans describe shape. Cadence is
the user's call. If asked for an estimate, give one. Otherwise omit.

## The user's actual tests (real session quotes)

1. "the first build was ass and not specific. so i had to refactor."
2. "are these instructions clear?"
3. "did you improve new plan?"
4. "I need my rules and outlines for each page to be CLEAR and
   supported in grounded context and research so we can build"
5. "use this and give a few references and citations to each point
   in a full proof upgrade plan."
6. "are you running research? we had research on them before!"

The pattern: a plan that asserts rules is rejected; a plan that
grounds rules with cited research is approved. Cite, name, ground.

## Cross-references

- `writing-plans` skill body (Step 1.5 grounding + Step 1.6
  no-time-estimates)
- `plan` skill body (user-grade rule section)
- `paper-candle-platform` skill body (no-time-estimates pitfall +
  one-prompt handoff pitfall)
- `subagent-driven-development` skill body (one-prompt handoff
  pattern)
- `sad-librarian` SKILL.md (Pitfall 8 — "the plan was ass" diagnosis)
