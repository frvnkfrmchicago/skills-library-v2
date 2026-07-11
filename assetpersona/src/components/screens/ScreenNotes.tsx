/* ============================================================================
 * ScreenNotes.tsx — per-screen / per-section notes for the /screens tool
 * ----------------------------------------------------------------------------
 * Lane D of WAVE-SCREENS-PRO-2026-05-25 (contract producer). A labeled textarea
 * that autosaves (debounced) to localStorage via `lib/screens/notes-store`,
 * shows a subtle "Saved" affordance when the debounce flushes, and surfaces a
 * mint dirty-dot whenever the note is non-empty.
 *
 * Contract Lane F embeds (LOCKED — do not change the shape):
 *     import { ScreenNotes } from '@/components/ScreenNotes';
 *     <ScreenNotes path={screen.path} section={activeSectionId?} />
 *
 * The note KEY is the screen path, or `path::section` when a section id is
 * given — so the page-level note and each section's note persist independently
 * (matching the store's key family). `useScreenNoteFlag` is re-exported here so
 * Lane F can light a dirty-dot on the "Notes" segmented-filter tab from the same
 * module it imports the component from.
 *
 * Styling is pure design-system: deep-dark glass surfaces via the Contract-2
 * `.gh-glass-inset` material, `#FC8019` (colors.brandGreen) as the single orange
 * accent, the `colors.text.*` warm cream ramp, and motion on the frozen glass
 * duration/ease tokens. No `rounded-full` pills (anti-pill mandate) — the only
 * round elements are status DOTS, which are signal, not chrome. The "Saved"
 * pulse and dirty-dot both degrade to static under `prefers-reduced-motion`.
 * ========================================================================== */

import { useId, useMemo, type CSSProperties } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, NotebookPen } from 'lucide-react';
import { colors, withOpacity } from '@/lib/design-tokens';
import { useScreenNoteFlag as useNoteFlag, useScreenNotes } from '@/lib/screens/notes-store';

/* Lavender text ramp + mint accent — one source of record (lib/design-tokens). */
const MINT = colors.brandGreen;
const TXT_PRIMARY = colors.text.primary;
const TXT_SECONDARY = colors.text.secondary;
const TXT_MUTED = colors.text.muted;
const HAIRLINE = withOpacity(colors.text.primary, 0.08);

/** Compose the storage key: `path` alone, or `path::section` when scoped. */
export function noteKeyFor(path: string, section?: string): string {
  return section ? `${path}::${section}` : path;
}

export interface ScreenNotesProps {
  /** Screen route this note belongs to (e.g. `/strains`). */
  path: string;
  /** Optional detail-section id — scopes the note to that section. */
  section?: string;
  /** Optional className passthrough for the outer wrapper. */
  className?: string;
}

/**
 * Notes editor for one screen (and optionally one of its sections).
 *
 * Trigger: typing in the textarea → debounced (~400ms) autosave.
 * Affordance: a "Saved" chip pulses in for ~1.6s after each flush; a mint dot
 * by the label stays lit while the note is non-empty.
 */
export function ScreenNotes({ path, section, className }: ScreenNotesProps) {
  const key = useMemo(() => noteKeyFor(path, section), [path, section]);
  const { note, setNote, saved } = useScreenNotes(key);
  const reduceMotion = useReducedMotion();
  const textareaId = useId();

  const hasNote = note.trim().length > 0;
  const charCount = note.length;

  const dotStyle: CSSProperties = {
    backgroundColor: MINT,
    boxShadow: hasNote ? `0 0 8px ${withOpacity(MINT, 0.6)}` : 'none',
    opacity: hasNote ? 1 : 0.28,
  };

  return (
    <div className={className}>
      {/* ── Label row: pen glyph · title · live dirty-dot · Saved affordance ── */}
      <div className="mb-2 flex items-center gap-1.5">
        <NotebookPen className="h-3.5 w-3.5" style={{ color: MINT }} aria-hidden />
        <label
          htmlFor={textareaId}
          className="text-[12px] font-bold tracking-tight"
          style={{ color: TXT_SECONDARY }}
        >
          {section ? 'Section notes' : 'Notes'}
        </label>

        {/* Dirty-dot — a signal, not a pill. Lit (mint glow) when non-empty. */}
        <span
          className="h-1.5 w-1.5 rounded-full transition-opacity"
          style={{
            ...dotStyle,
            transitionDuration: reduceMotion ? '0ms' : 'var(--gh-dur-normal)',
          }}
          aria-hidden
        />

        {/* "Saved" affordance — pulses in after the debounced flush, then fades. */}
        <span className="ml-auto flex h-4 items-center" aria-live="polite">
          <AnimatePresence>
            {saved && (
              <motion.span
                key="saved"
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 2, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -2, scale: 0.96 }}
                transition={{ duration: reduceMotion ? 0 : 0.16, ease: [0, 0, 0.2, 1] }}
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold"
                style={{
                  color: MINT,
                  backgroundColor: withOpacity(MINT, 0.14),
                  border: `1px solid ${withOpacity(MINT, 0.3)}`,
                }}
              >
                <Check className="h-2.5 w-2.5" strokeWidth={3} aria-hidden />
                Saved
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      </div>

      {/* ── The note field — inset glass surface, mint focus ring ── */}
      <textarea
        id={textareaId}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Notes on this screen…"
        spellCheck
        rows={4}
        className="gh-glass-inset block w-full resize-y px-3 py-2.5 text-[12.5px] leading-relaxed outline-none transition-shadow"
        style={{
          color: TXT_PRIMARY,
          minHeight: '5.5rem',
          // Inset glass already supplies fill/border/inner-shadow; we only add
          // the mint focus ring on top so focus reads as the one interactive accent.
          ['--tw-ring-color' as string]: withOpacity(MINT, 0.55),
        }}
        onFocus={(e) => {
          e.currentTarget.style.boxShadow = `var(--gh-inset-press), 0 0 0 1px ${withOpacity(
            MINT,
            0.55,
          )}, var(--gh-glow-mint)`;
          e.currentTarget.style.borderColor = withOpacity(MINT, 0.45);
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = '';
          e.currentTarget.style.borderColor = '';
        }}
      />

      {/* ── Footer hint: scope + char count ── */}
      <div className="mt-1.5 flex items-center justify-between text-[10.5px]">
        <span style={{ color: TXT_MUTED }}>
          Saved on this device{section ? ' · this section' : ''}
        </span>
        {charCount > 0 && (
          <span className="font-mono" style={{ color: withOpacity(colors.text.muted, 0.8) }}>
            {charCount}
          </span>
        )}
      </div>

      {/* Decorative hairline so the block reads as its own region in the rail. */}
      <div className="mt-3 h-px w-full" style={{ backgroundColor: HAIRLINE }} aria-hidden />
    </div>
  );
}

/**
 * Re-export the reactive note flag from the same module Lane F imports the
 * component from, so the "Notes" filter tab can light a dirty-dot:
 *
 *     const noteDirty = useScreenNoteFlag(screen.path);
 *
 * `path` here is whatever key the caller wants to test — for the page-level
 * dot pass `screen.path`; for a section dot pass `noteKeyFor(path, section)`.
 */
export function useScreenNoteFlag(path: string): boolean {
  return useNoteFlag(path);
}
