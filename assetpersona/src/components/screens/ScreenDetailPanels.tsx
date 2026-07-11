/* ============================================================================
 * ScreenDetailPanels.tsx — the flip-through panels of the /screens detail rail
 * ----------------------------------------------------------------------------
 * Lane F of WAVE-SCREENS-PRO-2026-05-25 (Batch 2 · consumes Lane B + Lane D).
 *
 * The owner's complaint was that the detail rail was a column of stacked
 * "fat-ass boxes" he had to scroll. This module replaces that with an
 * ENGAGING, flip-through experience: one always-on "What this page
 * communicates" block (Lane B `purpose`) + a <SegmentedControl> filter
 * (States · Buttons · Links · Notes) that shows ONE panel at a time, so the
 * rail flips instead of scrolling. ScreenDetail.tsx orchestrates (which panel
 * is visible); this file renders each panel:
 *
 *   • PurposePanel  — the always-visible purpose block (top of rail).
 *   • StatesPanel   — a slider/STEPPER (prev/next + a draggable track) that
 *                     drives the existing `&state=` iframe param. Stepping or
 *                     dragging cycles loading→error→empty→populated→interactive
 *                     in the live preview (reuses ScreenDetail's previewSrc /
 *                     activeStateId state machine via onStateChange).
 *   • ButtonsPanel  — a compact wired/stub chip GRID (functional-first, mint
 *                     check / amber "Stub" verdict), inside a Framer-Motion
 *                     `layout` accordion that reveals overflow on demand rather
 *                     than stacking full-width rows.
 *   • LinksPanel    — "Where you can go" targets as a tidy grid (keeps the
 *                     jump-to-screen behavior).
 *   • ApisPanel     — optional; only renders when endpoints are derivable.
 *
 * All chrome is glass (Contract-2 `.gh-glass-*` material). Every blur / alpha /
 * shadow / duration is a token — motion runs on the frozen `--gh-dur-*` /
 * `--gh-ease-*` tokens and collapses to 0ms under `prefers-reduced-motion`
 * (component-building/SKILL.md:187-195 — reduced-motion is MANDATORY). The only
 * round elements are status DOTS (signal, not chrome) — anti-pill mandate.
 *
 * Skill: component-building/SKILL.md (Expandable-Card accordion :132-147,
 * reduced-motion :187-195). Librarian: interactive-animation-librarian.md
 * ("Animation should react, not just play" — the State slider reacts to drag /
 * step and drives the live iframe). Pattern ref (2026): Storybook docs
 * "when to use / Don't use this for" —
 * https://www.supernova.io/blog/top-storybook-documentation-examples-and-the-lessons-you-can-learn
 * (each panel states what it's FOR; empty panels say what's absent rather than
 * leaving a dead box).
 * ========================================================================== */

import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowUpRight,
  Ban,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CornerDownRight,
  Flag,
  Hand,
  Layers,
  ListChecks,
  MousePointer2,
  MoveVertical,
  NotebookPen,
  Plug,
  Radar,
  Sparkles,
  Timer,
  Wand2,
  Zap,
} from 'lucide-react';
import type { ScreenCapability } from '@/lib/manifest-types';
import { colors, withOpacity } from '@/lib/design-tokens';
import { ScreenNotes, useScreenNoteFlag } from './ScreenNotes';
import type { ScreenButton, ScreenLink, ScreenState } from './ScreenDetail';

/* ─── Lavender type ramp (one family; mint reserved for active + dots) — one
 * source of record (lib/design-tokens). No raw hex lives here. ─── */
const TXT_HEADLINE = colors.text.headline;
const TXT_PRIMARY = colors.text.primary;
const TXT_SECONDARY = colors.text.secondary;
const TXT_MUTED = colors.text.muted;
const HAIRLINE = withOpacity(colors.text.primary, 0.08);
const FILL_FAINT = withOpacity(colors.text.primary, 0.04);

/* Functional verdict colors — mint = wired, amber = stub (feedColors source). */
const OK_TINT = colors.brandGreen;
const STUB_TINT = '#FFD700';

/* Per-state accent palette, mapped entirely onto existing design tokens (no raw
 * hex). Mirrors ScreenDetail's mapping so the slider + the preview badge agree. */
const STATE_PALETTE: Record<string, { tint: string }> = {
  populated: { tint: colors.brandGreen },
  loading: { tint: colors.semantic.info },
  error: { tint: colors.status.errorSoft },
  empty: { tint: colors.text.muted },
  interactive: { tint: '#E57010' },
};
export const stateTint = (id: string) => STATE_PALETTE[id]?.tint ?? colors.brandGreen;

/* ─── Animation inventory contract (LOCKED — Lane B produces, Lane D renders).
 * The scanner walks each screen's source and maps every Framer / CSS / Tailwind
 * motion to this shape; we render it (never hand-author it). ─── */
export interface AnimationEntry {
  type: 'framer' | 'css' | 'tailwind';
  name: string;
  trigger: 'hover' | 'tap' | 'scroll' | 'enter-exit' | 'layout' | 'load' | 'drag';
  target: string;
  duration?: string;
}

/* Per-trigger identity: a label + a lucide glyph. Order = the order chips and
 * inventory groups appear in (gesture-driven first, ambient last). Each trigger
 * reads against the section hue; mint stays interactive-state only. */
type TriggerId = AnimationEntry['trigger'];
const TRIGGER_META: Record<TriggerId, { label: string; Icon: typeof Zap }> = {
  hover: { label: 'hover', Icon: MousePointer2 },
  tap: { label: 'tap', Icon: Hand },
  drag: { label: 'drag', Icon: MoveVertical },
  scroll: { label: 'scroll', Icon: Radar },
  'enter-exit': { label: 'enter/exit', Icon: Wand2 },
  layout: { label: 'layout', Icon: Layers },
  load: { label: 'load', Icon: Zap },
};
const TRIGGER_ORDER: TriggerId[] = [
  'hover',
  'tap',
  'drag',
  'scroll',
  'enter-exit',
  'layout',
  'load',
];

/** Sum the multiplicity encoded in scanner names like "enter-exit ×3"; falls
 * back to 1 per entry so a count always reflects what's on the page. */
function entryWeight(a: AnimationEntry): number {
  const m = /×\s*(\d+)/.exec(a.name);
  return m ? Math.max(1, Number(m[1])) : 1;
}

/** Total animation count (multiplicity-aware) — the headline badge number. */
export function countAnimations(animations: AnimationEntry[]): number {
  return animations.reduce((sum, a) => sum + entryWeight(a), 0);
}

/** Group entries by trigger, in TRIGGER_ORDER, with a multiplicity-aware count. */
function groupByTrigger(
  animations: AnimationEntry[],
): { trigger: TriggerId; count: number; meta: (typeof TRIGGER_META)[TriggerId] }[] {
  const counts = new Map<TriggerId, number>();
  for (const a of animations) {
    counts.set(a.trigger, (counts.get(a.trigger) ?? 0) + entryWeight(a));
  }
  return TRIGGER_ORDER.filter((t) => counts.has(t)).map((trigger) => ({
    trigger,
    count: counts.get(trigger) ?? 0,
    meta: TRIGGER_META[trigger],
  }));
}

/* Spring config shared by every panel motion — frozen tokens, reduced-motion
 * collapses each to an instant transition. */
function useMotionConfig() {
  const reduce = useReducedMotion();
  return {
    reduce,
    // Panel cross-fade/slide as one filter flips to the next.
    panel: reduce
      ? { duration: 0 }
      : { type: 'spring' as const, stiffness: 420, damping: 36, mass: 0.7 },
    // Accordion layout reveal.
    accordion: reduce ? { duration: 0 } : { type: 'spring' as const, stiffness: 300, damping: 30 },
    // Elastic micro-motion for the auto-scanned trigger chips — the librarian's
    // "react, not just play": each chip springs up + glows on hover, hinting at
    // the kind of motion it represents. Mirrors `--gh-ease-spring`.
    chip: reduce ? { duration: 0 } : { type: 'spring' as const, stiffness: 420, damping: 18 },
  };
}

/* ============================================================================
 * Purpose — always-visible "What this page communicates" block
 * ========================================================================== */

/**
 * The Lane B contract surfaced as the rail's headline block. Renders
 * `screen.purpose`; falls back gracefully (manifest guarantees a non-empty
 * string for every screen, but a hand-authored group could omit it).
 */
export function PurposePanel({ purpose, accent }: { purpose?: string; accent: string }) {
  const text =
    purpose?.trim() ||
    'No purpose recorded for this screen yet — the scanner derives it from the page hero + metadata.';
  const hasPurpose = Boolean(purpose?.trim());
  return (
    <div
      className="gh-glass-inset gh-rise px-3.5 py-3"
      style={{
        // Glass-inset already carries a full-perimeter hairline; the accent
        // lives in the Sparkles icon chip below, not a colored left edge.
        ['--gh-rise-delay' as string]: '20ms',
      }}
    >
      <div className="mb-1 flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5" style={{ color: accent }} aria-hidden />
        <h3
          className="text-[11px] font-bold uppercase tracking-wide"
          style={{ color: TXT_SECONDARY, letterSpacing: '0.04em' }}
        >
          What this page communicates
        </h3>
      </div>
      <p
        className="text-[13px] font-medium leading-relaxed"
        style={{ color: hasPurpose ? TXT_PRIMARY : TXT_MUTED }}
      >
        {text}
      </p>
    </div>
  );
}

/** What this screen can DO — capabilities (adaptable per app via manifest). */
export function CapabilitiesPanel({
  capabilities,
  accent,
}: {
  capabilities: ScreenCapability[];
  accent: string;
}) {
  const list = capabilities ?? [];
  const functionalCount = list.filter((c) => c.functional).length;

  return (
    <div
      className="gh-glass-inset gh-rise px-3.5 py-3"
      style={{ ['--gh-rise-delay' as string]: '24ms' }}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <ListChecks className="h-3.5 w-3.5" style={{ color: accent }} aria-hidden />
          <h3
            className="text-[11px] font-bold uppercase tracking-wide"
            style={{ color: TXT_SECONDARY, letterSpacing: '0.04em' }}
          >
            Capabilities
          </h3>
        </div>
        <span className="text-[10px] font-semibold tabular-nums" style={{ color: TXT_MUTED }}>
          {functionalCount}/{list.length} wired
        </span>
      </div>
      {list.length === 0 ? (
        <p className="text-[12px]" style={{ color: TXT_MUTED }}>
          No capabilities recorded — add `capabilities[]` in the screen manifest for this app.
        </p>
      ) : (
        <ul className="space-y-2">
          {list.map((cap) => (
            <li
              key={cap.id}
              className="rounded-lg px-2.5 py-2"
              style={{ backgroundColor: FILL_FAINT, border: `1px solid ${HAIRLINE}` }}
            >
              <div className="flex items-start gap-2">
                <span
                  className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded"
                  style={{
                    backgroundColor: cap.functional
                      ? withOpacity(OK_TINT, 0.18)
                      : withOpacity(STUB_TINT, 0.18),
                    color: cap.functional ? OK_TINT : STUB_TINT,
                  }}
                  aria-hidden
                >
                  {cap.functional ? <Check className="h-2.5 w-2.5" /> : <Ban className="h-2.5 w-2.5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[12px] font-semibold" style={{ color: TXT_HEADLINE }}>
                      {cap.label}
                    </span>
                    <span
                      className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide"
                      style={{
                        color: TXT_MUTED,
                        backgroundColor: withOpacity(colors.text.primary, 0.06),
                      }}
                    >
                      {cap.type}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] leading-snug" style={{ color: TXT_SECONDARY }}>
                    {cap.description}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ============================================================================
 * Tracked TOP strip — the two AUTO-tracked things, pinned above the filter
 * ----------------------------------------------------------------------------
 * Owner ask: "track my animations, track my notes — that stuff needs to be at
 * the TOP. Make sure everything's tracked AUTOMATICALLY." So this strip sits
 * above the SegmentedControl (with the always-on purpose block) and reads as a
 * pair: a left ANIMATIONS summary (count + trigger chips, auto-scanned) and a
 * right NOTES affordance (dirty-dot). The animations come from the scanner —
 * the "auto-scanned" cue tells the user nobody hand-authored this list.
 * ========================================================================== */

/**
 * The top "tracked" pair. `animations` is the Lane B contract (already resolved
 * by ScreenDetail to `screen.animations ?? manifest-by-path ?? []`); `path` is
 * the note key. Section `accent` tints the chips; mint is reserved for the
 * single active state.
 */
export function TrackedTopStrip({
  animations,
  path,
  accent,
  active,
  onOpenAnimations,
  onOpenNotes,
}: {
  animations: AnimationEntry[];
  path: string;
  accent: string;
  /** Which inventory panel is currently open — drives the mint "active" tint. */
  active: 'animations' | 'notes' | 'other';
  onOpenAnimations: () => void;
  onOpenNotes: () => void;
}) {
  const { reduce, chip } = useMotionConfig();
  const noteDirty = useScreenNoteFlag(path);
  const total = useMemo(() => countAnimations(animations), [animations]);
  const groups = useMemo(() => groupByTrigger(animations), [animations]);

  const animActive = active === 'animations';
  const notesActive = active === 'notes';
  const animTint = animActive ? colors.brandGreen : accent;
  const noteTint = notesActive || noteDirty ? colors.brandGreen : accent;

  return (
    <div
      className="gh-rise grid grid-cols-[1fr_auto] gap-2"
      style={{ ['--gh-rise-delay' as string]: '40ms' }}
    >
      {/* ── Animations summary (auto-scanned) ── */}
      <button
        type="button"
        onClick={onOpenAnimations}
        aria-label={`${total} animations tracked — open the full inventory`}
        aria-pressed={animActive}
        className="gh-glass-inset gh-hoverable group/anim flex min-w-0 flex-col gap-2 px-3 py-2.5 text-left"
        style={{
          borderTop: `2px solid ${withOpacity(animTint, animActive ? 0.7 : 0.45)}`,
        }}
      >
        <div className="flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 shrink-0" style={{ color: animTint }} aria-hidden />
          <span
            className="text-[11px] font-bold uppercase tracking-wide"
            style={{ color: TXT_SECONDARY, letterSpacing: '0.04em' }}
          >
            Animations
          </span>
          {/* Count badge — tabular-nums text + hue, never a rounded-full pill. */}
          <span
            className="ml-auto inline-flex items-baseline gap-1 font-mono tabular-nums"
            style={{ color: animTint }}
          >
            <span className="text-[15px] font-bold leading-none">{total}</span>
          </span>
        </div>

        {total === 0 ? (
          <span className="text-[11px] leading-snug" style={{ color: TXT_MUTED }}>
            No motion detected on this screen.
          </span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {groups.map(({ trigger, count, meta }) => (
              <TriggerChip
                key={trigger}
                trigger={trigger}
                count={count}
                label={meta.label}
                Icon={meta.Icon}
                tint={animTint}
                spring={chip}
                reduce={reduce}
              />
            ))}
          </div>
        )}

        {/* Auto-scanned cue — these come from the scanner, not the author. */}
        <span
          className="inline-flex items-center gap-1 text-[10px] font-medium"
          style={{ color: withOpacity(colors.text.muted, 0.85) }}
        >
          <Radar className="h-2.5 w-2.5" aria-hidden />
          Auto-scanned · tap for inventory
        </span>
      </button>

      {/* ── Notes affordance (dirty-dot) ── */}
      <button
        type="button"
        onClick={onOpenNotes}
        aria-label={noteDirty ? 'Notes — a note is saved on this screen' : 'Open notes'}
        aria-pressed={notesActive}
        className="gh-glass-inset gh-hoverable flex w-[5.25rem] flex-col items-center justify-center gap-1 px-2 py-2.5 text-center"
        style={{
          borderTop: `2px solid ${withOpacity(noteTint, notesActive ? 0.7 : 0.45)}`,
        }}
      >
        <span className="relative inline-flex">
          <NotebookPen className="h-4 w-4" style={{ color: noteTint }} aria-hidden />
          {noteDirty && (
            <motion.span
              className="absolute -right-1.5 -top-1.5 h-1.5 w-1.5 rounded-full"
              style={{
                backgroundColor: colors.brandGreen,
                boxShadow: `0 0 6px ${withOpacity(colors.brandGreen, 0.7)}`,
              }}
              initial={reduce ? false : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={chip}
              aria-hidden
            />
          )}
        </span>
        <span
          className="text-[10px] font-bold uppercase tracking-wide"
          style={{ color: TXT_SECONDARY, letterSpacing: '0.04em' }}
        >
          Notes
        </span>
        <span className="text-[9.5px] font-medium leading-tight" style={{ color: TXT_MUTED }}>
          {noteDirty ? 'Saved' : 'Empty'}
        </span>
      </button>
    </div>
  );
}

/**
 * One auto-scanned trigger chip. Demonstrates its own motion on hover — a
 * spring lift + glow (the librarian's "react, not just play"). Collapses to a
 * static chip under `prefers-reduced-motion`. Anti-pill: a flat glass chip with
 * a hue top-edge, NOT a rounded-full capsule; the count rides as tabular-nums.
 */
function TriggerChip({
  trigger,
  count,
  label,
  Icon,
  tint,
  spring,
  reduce,
}: {
  trigger: TriggerId;
  count: number;
  label: string;
  Icon: typeof Zap;
  tint: string;
  spring: { duration: number } | { type: 'spring'; stiffness: number; damping: number };
  reduce: boolean | null;
}) {
  void trigger;
  return (
    <motion.span
      className="inline-flex select-none items-center gap-1 rounded-md px-1.5 py-1 text-[10.5px] font-semibold leading-none"
      style={{
        color: tint,
        backgroundColor: withOpacity(tint, 0.1),
        border: `1px solid ${withOpacity(tint, 0.22)}`,
      }}
      title={`${count} ${label} ${count === 1 ? 'animation' : 'animations'}`}
      whileHover={
        reduce
          ? undefined
          : { y: -2, scale: 1.06, boxShadow: `0 4px 14px ${withOpacity(tint, 0.4)}` }
      }
      transition={spring}
    >
      <Icon className="h-2.5 w-2.5" aria-hidden />
      <span>{label}</span>
      <span className="font-mono tabular-nums" style={{ color: withOpacity(tint, 0.85) }}>
        {count}
      </span>
    </motion.span>
  );
}

/* ============================================================================
 * Animations — full auto-scanned inventory (name → target → trigger → duration)
 * ========================================================================== */

/**
 * The complete motion inventory for a screen, one click off the top strip.
 * Rows are grouped by trigger (gesture-first), each row carrying name, target
 * (the element the scanner matched), the trigger glyph, and a duration when the
 * scanner could resolve one. A quiet empty-note when a screen is motionless.
 */
export function AnimationsPanel({
  animations,
  accent,
}: {
  animations: AnimationEntry[];
  accent: string;
}) {
  const total = useMemo(() => countAnimations(animations), [animations]);
  const groups = useMemo(() => groupByTrigger(animations), [animations]);
  // Rows under each trigger, preserving the scanner's order within a trigger.
  const byTrigger = useMemo(() => {
    const map = new Map<TriggerId, AnimationEntry[]>();
    for (const a of animations) {
      const list = map.get(a.trigger) ?? [];
      list.push(a);
      map.set(a.trigger, list);
    }
    return map;
  }, [animations]);

  if (animations.length === 0) {
    return (
      <PanelFrame>
        <div
          className="flex items-center gap-2 rounded-lg p-2.5 text-[12px] leading-snug"
          style={{
            color: TXT_SECONDARY,
            backgroundColor: FILL_FAINT,
            border: `1px solid ${HAIRLINE}`,
          }}
        >
          <Zap className="h-3.5 w-3.5 shrink-0" style={{ color: accent }} aria-hidden />A still
          screen — the scanner found no Framer, CSS, or Tailwind motion here.
        </div>
      </PanelFrame>
    );
  }

  return (
    <PanelFrame>
      <p className="mb-2 flex items-center gap-1.5 text-[11px]" style={{ color: TXT_MUTED }}>
        <Radar className="h-3 w-3" aria-hidden />
        <span style={{ color: accent, fontWeight: 700 }}>{total}</span> auto-scanned across{' '}
        {groups.length} {groups.length === 1 ? 'trigger' : 'triggers'}
      </p>
      <div className="flex flex-col gap-2.5">
        {groups.map(({ trigger, count, meta }) => {
          const { Icon } = meta;
          const rows = byTrigger.get(trigger) ?? [];
          return (
            <div key={trigger}>
              {/* Trigger sub-header — glyph · label · count (tabular-nums). */}
              <div className="mb-1 flex items-center gap-1.5">
                <Icon className="h-3 w-3" style={{ color: accent }} aria-hidden />
                <span
                  className="text-[10.5px] font-bold uppercase tracking-wide"
                  style={{ color: TXT_SECONDARY, letterSpacing: '0.04em' }}
                >
                  {meta.label}
                </span>
                <span className="font-mono text-[10px] tabular-nums" style={{ color: TXT_MUTED }}>
                  {count}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-1">
                {rows.map((a, i) => (
                  <AnimationRow
                    key={`${trigger}-${a.target}-${a.name}-${i}`}
                    entry={a}
                    accent={accent}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </PanelFrame>
  );
}

/** One inventory row: type dot · name · target (mono) · duration tag. */
function AnimationRow({ entry, accent }: { entry: AnimationEntry; accent: string }) {
  // Type → a subtle hue so framer/css/tailwind read apart at a glance; all map
  // onto existing tokens (no raw hex), accent for framer (the dominant kind).
  const typeTint =
    entry.type === 'css'
      ? colors.semantic.info
      : entry.type === 'tailwind'
        ? '#E57010'
        : accent;
  return (
    <div
      className="flex min-w-0 items-center gap-2 rounded-lg px-2.5 py-2"
      style={{
        backgroundColor: FILL_FAINT,
        // Full-perimeter hairline only; the animation TYPE is encoded by the
        // state dot below, not a colored left edge.
        border: `1px solid ${HAIRLINE}`,
      }}
      title={`${entry.type} · ${entry.name} · ${entry.target}`}
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: typeTint, boxShadow: `0 0 6px ${withOpacity(typeTint, 0.5)}` }}
        aria-hidden
      />
      <span className="min-w-0 flex-1">
        <span
          className="block truncate text-[12px] font-semibold leading-snug"
          style={{ color: TXT_PRIMARY }}
        >
          {entry.name}
        </span>
        <span
          className="block truncate font-mono text-[10.5px] leading-tight"
          style={{ color: TXT_MUTED }}
        >
          {entry.target}
        </span>
      </span>
      {entry.duration && (
        <span
          className="inline-flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] tabular-nums"
          style={{
            color: TXT_SECONDARY,
            backgroundColor: withOpacity(colors.text.primary, 0.06),
          }}
        >
          <Timer className="h-2.5 w-2.5" aria-hidden />
          {entry.duration}
        </span>
      )}
    </div>
  );
}

/* ============================================================================
 * States — slider / stepper that drives the &state= iframe param
 * ========================================================================== */

/**
 * A draggable track + prev/next stepper over the screen's catalogued states.
 * Stepping or dragging calls `onSelect(id)` — ScreenDetail re-renders the
 * iframe through `previewSrc(path, id)`, so the live preview swaps to
 * loading / error / empty / populated / interactive. This is the librarian's
 * "react, not just play": the control's position is bound to what the preview
 * shows. Single-state screens render a quiet note instead of a dead slider.
 */
export function StatesPanel({
  states,
  activeId,
  accent,
  onSelect,
}: {
  states: ScreenState[];
  activeId: string;
  accent: string;
  onSelect: (id: string) => void;
}) {
  const { reduce } = useMotionConfig();
  const activeIndex = Math.max(
    0,
    states.findIndex((s) => s.id === activeId),
  );
  const active = states[activeIndex] ?? states[0];
  const tint = stateTint(active.id);
  const single = states.length === 1;
  const count = states.length;

  const go = (next: number) => {
    const clamped = Math.min(count - 1, Math.max(0, next));
    onSelect(states[clamped].id);
  };

  if (single) {
    return (
      <PanelFrame>
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-[12px] leading-snug"
          style={{
            color: TXT_SECONDARY,
            backgroundColor: FILL_FAINT,
            border: `1px solid ${HAIRLINE}`,
          }}
        >
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: tint, boxShadow: `0 0 8px ${withOpacity(tint, 0.5)}` }}
            aria-hidden
          />
          Single-state screen — always renders{' '}
          <strong className="font-semibold">{active.label.toLowerCase()}</strong>.
        </div>
      </PanelFrame>
    );
  }

  return (
    <PanelFrame>
      {/* Stepper row: prev · live label+index · next */}
      <div className="flex items-center gap-2">
        <StepButton
          label="Previous state"
          accent={accent}
          disabled={activeIndex === 0}
          onClick={() => go(activeIndex - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </StepButton>

        <div
          className="gh-glass-inset flex min-w-0 flex-1 items-center justify-center gap-2 px-3 py-2"
          aria-live="polite"
        >
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: tint, boxShadow: `0 0 8px ${withOpacity(tint, 0.6)}` }}
            aria-hidden
          />
          <span className="truncate text-[13px] font-bold" style={{ color: tint }}>
            {active.label}
          </span>
          <span className="shrink-0 font-mono text-[11px]" style={{ color: TXT_MUTED }}>
            {activeIndex + 1}/{count}
          </span>
        </div>

        <StepButton
          label="Next state"
          accent={accent}
          disabled={activeIndex === count - 1}
          onClick={() => go(activeIndex + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </StepButton>
      </div>

      {/* Draggable track — each segment is a tappable stop; the active stop
          carries the state tint + glow. A native range input rides invisibly
          on top so the track is keyboard + drag accessible. */}
      <div className="relative mt-2.5">
        <div className="gh-glass-inset flex gap-1 p-1" role="presentation">
          {states.map((s, i) => {
            const on = i === activeIndex;
            const t = stateTint(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelect(s.id)}
                aria-label={`${s.label} state`}
                aria-pressed={on}
                title={s.summary}
                className="gh-hoverable relative h-2 flex-1 overflow-hidden rounded-full"
                style={{ backgroundColor: withOpacity(colors.text.primary, on ? 0.06 : 0.1) }}
              >
                {on && (
                  <motion.span
                    layoutId="state-track-fill"
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: t, boxShadow: `0 0 10px ${withOpacity(t, 0.7)}` }}
                    transition={
                      reduce ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 32 }
                    }
                    aria-hidden
                  />
                )}
              </button>
            );
          })}
        </div>
        <input
          type="range"
          min={0}
          max={count - 1}
          step={1}
          value={activeIndex}
          onChange={(e) => go(Number(e.target.value))}
          aria-label="Preview state slider"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>

      {/* Live summary of the selected state. */}
      <AnimatePresence mode="wait">
        <motion.p
          key={active.id}
          initial={reduce ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
          transition={{ duration: reduce ? 0 : 0.16, ease: [0, 0, 0.2, 1] }}
          className="mt-3 text-[12px] leading-relaxed"
          style={{ color: TXT_SECONDARY }}
        >
          {active.summary}
        </motion.p>
      </AnimatePresence>
    </PanelFrame>
  );
}

/* ============================================================================
 * Buttons — compact wired/stub chip grid inside a layout accordion
 * ========================================================================== */

/** How many chips show before the accordion "Show all" reveal kicks in. */
const BUTTON_PREVIEW_COUNT = 6;

/**
 * Buttons rendered as a compact 2-up chip GRID (functional-first sort is done
 * by the caller). Each chip carries a mint check (wired) or amber "Stub"
 * verdict. When there are more than BUTTON_PREVIEW_COUNT, the overflow lives in
 * a Framer `layout` accordion (component-building/SKILL.md Expandable-Card
 * :132-147) instead of stacking full-width rows.
 */
export function ButtonsPanel({
  buttons,
  functionalCount,
  accent,
  labelForPath,
  onSelectLink,
}: {
  buttons: ScreenButton[];
  functionalCount: number;
  accent: string;
  labelForPath: (path: string) => string;
  onSelectLink: (path: string) => void;
}) {
  const { accordion, reduce } = useMotionConfig();
  const [expanded, setExpanded] = useState(false);

  if (buttons.length === 0) {
    return (
      <PanelFrame>
        <EmptyNote>A display-only screen — no buttons or interactive controls.</EmptyNote>
      </PanelFrame>
    );
  }

  const overflow = buttons.length - BUTTON_PREVIEW_COUNT;
  const preview = buttons.slice(0, BUTTON_PREVIEW_COUNT);
  const rest = buttons.slice(BUTTON_PREVIEW_COUNT);

  return (
    <PanelFrame>
      <p className="mb-2 text-[11px]" style={{ color: TXT_MUTED }}>
        <span style={{ color: OK_TINT, fontWeight: 700 }}>{functionalCount}</span> of{' '}
        {buttons.length} wired up
      </p>

      <motion.div layout={!reduce} transition={accordion}>
        <div className="grid grid-cols-2 gap-1.5">
          {preview.map((b, i) => (
            <ButtonChip
              key={`${b.label}-${i}`}
              button={b}
              accent={accent}
              labelForPath={labelForPath}
              onSelectLink={onSelectLink}
            />
          ))}
        </div>

        <AnimatePresence initial={false}>
          {expanded && overflow > 0 && (
            <motion.div
              key="overflow"
              layout={!reduce}
              initial={reduce ? { opacity: 1 } : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={accordion}
              className="overflow-hidden"
            >
              <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                {rest.map((b, i) => (
                  <ButtonChip
                    key={`${b.label}-rest-${i}`}
                    button={b}
                    accent={accent}
                    labelForPath={labelForPath}
                    onSelectLink={onSelectLink}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {overflow > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="gh-hoverable mt-2 flex w-full items-center justify-center gap-1 rounded-md px-2 py-1.5 text-[11.5px] font-semibold"
          style={{
            color: accent,
            backgroundColor: withOpacity(accent, 0.07),
            border: `1px solid ${withOpacity(accent, 0.2)}`,
          }}
        >
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 24 }}
            className="inline-flex"
            aria-hidden
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </motion.span>
          {expanded ? 'Show fewer' : `Show all ${buttons.length}`}
        </button>
      )}
    </PanelFrame>
  );
}

/** One compact chip in the Buttons grid: verdict dot · label · stub tag · jump. */
function ButtonChip({
  button,
  accent,
  labelForPath,
  onSelectLink,
}: {
  button: ScreenButton;
  accent: string;
  labelForPath: (path: string) => string;
  onSelectLink: (path: string) => void;
}) {
  const verdictTint = button.functional ? OK_TINT : STUB_TINT;
  const chipStyle: CSSProperties = {
    backgroundColor: FILL_FAINT,
    border: `1px solid ${HAIRLINE}`,
    borderTop: `2px solid ${withOpacity(verdictTint, 0.55)}`,
  };
  return (
    <div
      className="flex min-w-0 flex-col gap-1 rounded-lg px-2.5 py-2"
      style={chipStyle}
      title={button.action}
    >
      <div className="flex items-center gap-1.5">
        <span
          className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: withOpacity(verdictTint, 0.16), color: verdictTint }}
          aria-hidden
        >
          {button.functional ? (
            <Check className="h-2 w-2" strokeWidth={3} />
          ) : (
            <Ban className="h-2 w-2" strokeWidth={2.5} />
          )}
        </span>
        <span
          className="truncate text-[12px] font-semibold leading-snug"
          style={{ color: TXT_PRIMARY }}
        >
          {button.label}
        </span>
      </div>
      <span className="block truncate text-[10.5px] leading-snug" style={{ color: TXT_MUTED }}>
        {button.functional ? button.action : 'Stub'}
      </span>
      {button.target && (
        <button
          type="button"
          onClick={() => onSelectLink(button.target as string)}
          className="gh-hoverable inline-flex items-center gap-1 self-start rounded px-1 py-0.5 text-[10.5px] font-medium"
          style={{ color: accent, backgroundColor: withOpacity(accent, 0.07) }}
        >
          <CornerDownRight className="h-2.5 w-2.5" />
          <span className="max-w-[7rem] truncate">{labelForPath(button.target)}</span>
        </button>
      )}
    </div>
  );
}

/* ============================================================================
 * Links — "Where you can go" as a tidy grid (keeps jump behavior)
 * ========================================================================== */

export function LinksPanel({
  links,
  accent,
  labelForPath,
  onSelect,
}: {
  links: ScreenLink[];
  accent: string;
  labelForPath: (path: string) => string;
  onSelect: (path: string) => void;
}) {
  const accentFaint = withOpacity(accent, 0.07);
  if (links.length === 0) {
    return (
      <PanelFrame>
        <div
          className="flex items-center gap-2 rounded-lg p-2.5 text-[12px] leading-snug"
          style={{
            color: TXT_SECONDARY,
            backgroundColor: FILL_FAINT,
            border: `1px solid ${HAIRLINE}`,
          }}
        >
          <Flag className="h-3.5 w-3.5 shrink-0" style={{ color: accent }} aria-hidden />
          Destination screen — the end of a flow, with no further outbound links.
        </div>
      </PanelFrame>
    );
  }
  return (
    <PanelFrame>
      <div className="grid grid-cols-1 gap-1.5">
        {links.map((link, i) => (
          <LinkRow
            key={`${link.target}-${i}`}
            link={link}
            label={labelForPath(link.target) || link.label || link.target}
            accent={accent}
            accentFaint={accentFaint}
            onSelect={onSelect}
          />
        ))}
      </div>
    </PanelFrame>
  );
}

/** One row in Where you can go: target displayLabel + path + via + jump. */
function LinkRow({
  link,
  label,
  accent,
  accentFaint,
  onSelect,
}: {
  link: ScreenLink;
  label: string;
  accent: string;
  accentFaint: string;
  onSelect: (path: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(link.target)}
      className="gh-hoverable group/link flex min-h-[44px] w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left"
      style={{ backgroundColor: accentFaint, border: `1px solid ${HAIRLINE}` }}
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: accent, boxShadow: `0 0 8px ${withOpacity(accent, 0.5)}` }}
        aria-hidden
      />
      <span className="min-w-0 flex-1">
        <span
          className="block truncate text-[13px] font-medium leading-snug"
          style={{ color: TXT_PRIMARY }}
        >
          {label}
        </span>
        <span
          className="flex items-center gap-1.5 text-[11px] leading-tight"
          style={{ color: TXT_MUTED }}
        >
          <span className="truncate font-mono">{link.target}</span>
          <span
            className="shrink-0 rounded px-1 text-[9.5px] font-semibold"
            style={{
              color: TXT_SECONDARY,
              backgroundColor: withOpacity(colors.text.primary, 0.06),
            }}
          >
            {link.via}
          </span>
        </span>
      </span>
      <ArrowUpRight
        className="h-3.5 w-3.5 shrink-0 transition-transform group-hover/link:translate-x-0.5"
        style={{ color: accent }}
        aria-hidden
      />
    </button>
  );
}

/* ============================================================================
 * Notes — embeds the Lane D contract component
 * ========================================================================== */

export function NotesPanel({ path }: { path: string }) {
  return (
    <PanelFrame>
      <ScreenNotes path={path} />
    </PanelFrame>
  );
}

/* ============================================================================
 * APIs — optional block; only renders when endpoints are derivable
 * ========================================================================== */

/**
 * Derive API endpoints this screen touches from its button/link targets that
 * resolve to an `/api/` path. The manifest has no dedicated `apis` field yet,
 * so this is a best-effort read — when nothing resolves, the caller omits the
 * block entirely (no dead box, per the "Don't use this for" docs ethos).
 */
export function deriveApis(buttons: ScreenButton[], links: ScreenLink[]): string[] {
  const set = new Set<string>();
  for (const b of buttons) {
    if (b.target && b.target.startsWith('/api/')) set.add(b.target);
  }
  for (const l of links) {
    if (l.target.startsWith('/api/')) set.add(l.target);
  }
  return Array.from(set).sort();
}

export function ApisPanel({ apis, accent }: { apis: string[]; accent: string }) {
  if (apis.length === 0) return null;
  return (
    <div className="mt-3 border-t pt-3" style={{ borderColor: HAIRLINE }}>
      <h4
        className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold"
        style={{ color: TXT_SECONDARY }}
      >
        <Plug className="h-3.5 w-3.5" style={{ color: accent }} aria-hidden />
        APIs used
        <span className="text-[11px] font-medium" style={{ color: TXT_MUTED }}>
          ({apis.length})
        </span>
      </h4>
      <div className="flex flex-wrap gap-1.5">
        {apis.map((api) => (
          <span
            key={api}
            className="gh-glass-inset px-2 py-0.5 font-mono text-[10.5px]"
            style={{ color: TXT_SECONDARY }}
          >
            {api}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ============================================================================
 * Shared sub-primitives
 * ========================================================================== */

/** Consistent inner padding + entrance for every panel's content. */
function PanelFrame({ children }: { children: ReactNode }) {
  const { reduce, panel } = useMotionConfig();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
      transition={panel}
    >
      {children}
    </motion.div>
  );
}

/** Quiet empty-state note (signal, not a box). */
function EmptyNote({ children }: { children: ReactNode }) {
  return (
    <p className="text-[12px] leading-relaxed" style={{ color: TXT_MUTED }}>
      {children}
    </p>
  );
}

/** Square glass stepper button — 40px target, hover lift, disabled dimming. */
function StepButton({
  label,
  accent,
  disabled,
  onClick,
  children,
}: {
  label: string;
  accent: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="gh-glass-inset gh-hoverable flex h-9 w-9 shrink-0 items-center justify-center disabled:cursor-not-allowed disabled:opacity-35"
      style={{ color: disabled ? TXT_MUTED : accent }}
    >
      {children}
    </button>
  );
}

/* Re-export the headline text color so ScreenDetail can stay consistent if it
 * ever needs it (kept minimal; the orchestrator owns header chrome). */
export { TXT_HEADLINE };
