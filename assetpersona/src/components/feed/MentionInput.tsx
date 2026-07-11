/* ═══ MentionInput — drop-in textarea with @autocomplete ═══
 *
 * A controlled textarea that watches the cursor for an `@<term>` token. When
 * the user types `@` (with a leading space or at line start), an autocomplete
 * listbox opens showing up to 5 matching profiles. ArrowUp / ArrowDown move
 * the selection, Enter or Tab inserts the chosen handle, Escape closes the
 * dropdown.
 *
 * Match strategy:
 *   - In live mode: `profiles` table query, `display_name ILIKE %term%`
 *     limited to 5, ordered by display_name. Cached for 30s per term so
 *     rapid retypes don't hammer the DB.
 *   - In bypass / unconfigured mode: matches the local synthetic profile
 *     stash registered via `communityData.registerMember()`. Falls back to a
 *     tiny seed so the dev experience is never empty.
 *
 * The inserted token uses the format `@<DisplayName-no-spaces>` so the
 * server-side `parse_mentions_and_notify()` regex `@[A-Za-z0-9_.]{2,40}`
 * resolves cleanly against `regexp_replace(display_name, '\s+', '', 'g')`.
 *
 * Accessibility:
 *   - The listbox follows the WAI-ARIA combobox-with-listbox-popup pattern.
 *   - `role="combobox"` on the textarea + `aria-expanded` + `aria-controls`
 *     pointing at the listbox, with `aria-activedescendant` pointing at the
 *     currently highlighted option.
 *   - The listbox itself has `role="listbox"` and each option `role="option"`
 *     with `aria-selected`.
 *   - Reduced motion respected via `prefers-reduced-motion` in the CSS file.
 */

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ChangeEvent, KeyboardEvent, TextareaHTMLAttributes } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { isBypassActive } from '../../lib/devBypass';
import './MentionInput.css';

export interface MentionMatch {
  id: string;
  display_name: string;
  avatar_url?: string | null;
}

export interface MentionInputProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value'> {
  value: string;
  onChange: (next: string) => void;
  /** Override the matcher (testing / custom data sources). */
  resolveMentions?: (term: string) => Promise<MentionMatch[]>;
  /** Max suggestions to show. Default 5. */
  maxSuggestions?: number;
  /** Optional label for screen readers (textarea has no visible label). */
  ariaLabel?: string;
}

const TOKEN_RE = /(^|\s)@([A-Za-z0-9_.]{0,40})$/;

/* ── Default matcher (Supabase profiles, with local cache + bypass fallback) ── */

const SEARCH_CACHE = new Map<string, { ts: number; rows: MentionMatch[] }>();
const CACHE_TTL_MS = 30_000;

async function defaultResolveMentions(term: string): Promise<MentionMatch[]> {
  const key = term.toLowerCase();
  const cached = SEARCH_CACHE.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) return cached.rows;

  if (!isSupabaseConfigured || isBypassActive()) {
    const seed = readLocalMembers();
    const filtered = key
      ? seed.filter((m) => m.display_name.toLowerCase().includes(key)).slice(0, 5)
      : seed.slice(0, 5);
    SEARCH_CACHE.set(key, { ts: Date.now(), rows: filtered });
    return filtered;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('profiles')
    .select('id, display_name, avatar_url')
    .ilike('display_name', `%${term}%`)
    .order('display_name', { ascending: true })
    .limit(5);
  if (error) {
    // Soft failure — return empty so the UI just shows "no matches".
    return [];
  }
  const rows = ((data as MentionMatch[]) ?? []).filter((m) => !!m.display_name);
  SEARCH_CACHE.set(key, { ts: Date.now(), rows });
  return rows;
}

function readLocalMembers(): MentionMatch[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('ap_community_members');
    if (!raw) return seedLocalMembers();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return seedLocalMembers();
    const rows = parsed
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((p: any) => ({
        id: String(p.id ?? ''),
        display_name: String(p.display_name ?? ''),
        avatar_url: p.avatar_url ?? null,
      }))
      .filter((m) => m.id && m.display_name);
    return rows.length > 0 ? rows : seedLocalMembers();
  } catch {
    return seedLocalMembers();
  }
}

function seedLocalMembers(): MentionMatch[] {
  return [
    { id: 'seed-frank', display_name: 'frvnkfrmchicago', avatar_url: null },
    { id: 'seed-dev-admin', display_name: 'Dev Admin', avatar_url: null },
    { id: 'seed-dev-member', display_name: 'Dev Member', avatar_url: null },
    { id: 'seed-grazz', display_name: 'Grazzhopper Team', avatar_url: null },
  ];
}

/* ── Component ── */

export const MentionInput = forwardRef<HTMLTextAreaElement, MentionInputProps>(
  function MentionInput(
    {
      value,
      onChange,
      resolveMentions = defaultResolveMentions,
      maxSuggestions = 5,
      ariaLabel,
      onKeyDown,
      onBlur,
      className,
      ...rest
    },
    ref
  ) {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const listboxId = useId();
    const optionIdPrefix = useId();
    const [open, setOpen] = useState(false);
    const [term, setTerm] = useState('');
    const [matches, setMatches] = useState<MentionMatch[]>([]);
    const [highlight, setHighlight] = useState(0);
    const requestSeq = useRef(0);

    // Forward inner ref to outer ref (object or callback).
    const setRefs = useCallback(
      (node: HTMLTextAreaElement | null) => {
        textareaRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
      },
      [ref]
    );

    /** Look at the text up to the cursor and return the active mention term, if any. */
    const detectTerm = useCallback(
      (text: string, cursor: number): string | null => {
        const upToCursor = text.slice(0, cursor);
        const m = upToCursor.match(TOKEN_RE);
        if (!m) return null;
        return m[2] ?? '';
      },
      []
    );

    /** Run the matcher with debouncing built in. */
    useEffect(() => {
      if (!open) return;
      const seq = ++requestSeq.current;
      let cancelled = false;
      const handle = window.setTimeout(() => {
        void (async () => {
          try {
            const rows = await resolveMentions(term);
            if (cancelled || seq !== requestSeq.current) return;
            setMatches(rows.slice(0, maxSuggestions));
            setHighlight((h) => Math.min(h, Math.max(0, rows.length - 1)));
          } catch {
            if (!cancelled) setMatches([]);
          }
        })();
      }, 120);
      return () => {
        cancelled = true;
        window.clearTimeout(handle);
      };
    }, [term, open, resolveMentions, maxSuggestions]);

    /** Insert the chosen match into the textarea, replacing the active token. */
    const insertMention = useCallback(
      (match: MentionMatch) => {
        const el = textareaRef.current;
        if (!el) return;
        const cursor = el.selectionStart ?? value.length;
        const before = value.slice(0, cursor);
        const after = value.slice(cursor);
        const tokenMatch = before.match(TOKEN_RE);
        if (!tokenMatch) return;
        const tokenStart = tokenMatch.index! + tokenMatch[1].length; // position of `@`
        const compact = match.display_name.replace(/\s+/g, '');
        const insert = `@${compact} `;
        const next = `${value.slice(0, tokenStart)}${insert}${after}`;
        onChange(next);
        setOpen(false);
        setTerm('');
        setMatches([]);
        // Restore caret right after the inserted mention.
        requestAnimationFrame(() => {
          const pos = tokenStart + insert.length;
          if (textareaRef.current) {
            textareaRef.current.selectionStart = pos;
            textareaRef.current.selectionEnd = pos;
            textareaRef.current.focus();
          }
        });
      },
      [onChange, value]
    );

    const handleChange = useCallback(
      (e: ChangeEvent<HTMLTextAreaElement>) => {
        const next = e.target.value;
        onChange(next);
        const cursor = e.target.selectionStart ?? next.length;
        const detected = detectTerm(next, cursor);
        if (detected !== null) {
          setTerm(detected);
          setOpen(true);
          setHighlight(0);
        } else if (open) {
          setOpen(false);
        }
      },
      [onChange, detectTerm, open]
    );

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (open && matches.length > 0) {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlight((h) => (h + 1) % matches.length);
            return;
          }
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlight((h) => (h - 1 + matches.length) % matches.length);
            return;
          }
          if (e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            insertMention(matches[highlight]);
            return;
          }
          if (e.key === 'Escape') {
            e.preventDefault();
            setOpen(false);
            return;
          }
        }
        onKeyDown?.(e);
      },
      [open, matches, highlight, insertMention, onKeyDown]
    );

    const activeDescendant = useMemo(() => {
      if (!open || matches.length === 0) return undefined;
      return `${optionIdPrefix}-${highlight}`;
    }, [open, matches.length, highlight, optionIdPrefix]);

    return (
      <div className="mention-input">
        <textarea
          {...rest}
          ref={setRefs}
          className={`mention-input__textarea${className ? ` ${className}` : ''}`}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={(e) => {
            // Delay so a mouse click on an option lands before close.
            window.setTimeout(() => setOpen(false), 120);
            onBlur?.(e);
          }}
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-activedescendant={activeDescendant}
          aria-label={ariaLabel ?? rest['aria-label']}
        />

        {open && matches.length > 0 && (
          <ul
            id={listboxId}
            role="listbox"
            className="mention-input__listbox"
            aria-label="Mention suggestions"
          >
            {matches.map((m, idx) => {
              const initial = m.display_name?.charAt(0) ?? '?';
              const selected = idx === highlight;
              return (
                <li
                  key={m.id}
                  id={`${optionIdPrefix}-${idx}`}
                  role="option"
                  aria-selected={selected}
                  className={`mention-input__option${
                    selected ? ' mention-input__option--active' : ''
                  }`}
                  onMouseDown={(e) => {
                    // Prevent textarea blur before we can insert.
                    e.preventDefault();
                    insertMention(m);
                  }}
                  onMouseEnter={() => setHighlight(idx)}
                >
                  {m.avatar_url ? (
                    <img
                      src={m.avatar_url}
                      alt=""
                      className="mention-input__avatar"
                    />
                  ) : (
                    <span className="mention-input__avatar mention-input__avatar--initial" aria-hidden="true">
                      {initial}
                    </span>
                  )}
                  <span className="mention-input__name">{m.display_name}</span>
                </li>
              );
            })}
          </ul>
        )}

        {open && matches.length === 0 && term.length > 0 && (
          <div className="mention-input__empty" role="status">
            No members match @{term}
          </div>
        )}
      </div>
    );
  }
);

export default MentionInput;
