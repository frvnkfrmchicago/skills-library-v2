/* ═══ BookmarkButton — optimistic save toggle ═══
 *
 * AP-MODERNIZE-2026-05 · Lane 4
 *
 * Drop-in toggle for any saveable target (post, comment, module, bulletin,
 * blog post). Icon flips outlined → filled when bookmarked. Optimistic state
 * so the click feels instant; rolls back if the server rejects.
 *
 * Reduced-motion friendly: the micro-bounce is gated by a CSS media query.
 */

import { useEffect, useState, useCallback } from 'react';
import { BookmarkSimple } from '@phosphor-icons/react';
import {
  isBookmarked as fetchIsBookmarked,
  addBookmark,
  removeBookmark,
  type BookmarkTargetType,
} from '../../data/bookmarks';
import './BookmarkButton.css';

export interface BookmarkButtonProps {
  targetType: BookmarkTargetType;
  targetId: string;
  /** Icon pixel size. Touch target stays ≥44px regardless. */
  size?: number;
  /** Optional className for layout overrides. */
  className?: string;
  /** Optional onChange so parents can update local counts. */
  onChange?: (saved: boolean) => void;
}

export default function BookmarkButton({
  targetType,
  targetId,
  size = 20,
  className,
  onChange,
}: BookmarkButtonProps) {
  const [saved, setSaved] = useState(false);
  const [bouncing, setBouncing] = useState(false);
  const [busy, setBusy] = useState(false);

  // Initial state — ask the server (or local store) on mount.
  useEffect(() => {
    let cancelled = false;
    fetchIsBookmarked(targetType, targetId)
      .then((result) => {
        if (!cancelled) setSaved(result);
      })
      .catch(() => {
        /* default false — already set */
      });
    return () => {
      cancelled = true;
    };
  }, [targetType, targetId]);

  const handleToggle = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (busy) return;

      // Optimistic flip + micro-bounce trigger
      const next = !saved;
      setSaved(next);
      setBouncing(true);
      setBusy(true);
      onChange?.(next);
      // Clear bounce class so subsequent toggles re-trigger animation
      window.setTimeout(() => setBouncing(false), 320);

      try {
        if (next) {
          await addBookmark(targetType, targetId);
        } else {
          await removeBookmark(targetType, targetId);
        }
      } catch {
        // Roll back optimistic state
        setSaved((prev) => !prev);
        onChange?.(!next);
      } finally {
        setBusy(false);
      }
    },
    [busy, saved, targetType, targetId, onChange],
  );

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={[
        'bookmark-btn',
        saved ? 'bookmark-btn--saved' : '',
        bouncing ? 'bookmark-btn--bouncing' : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from saved' : 'Save for later'}
      title={saved ? 'Saved' : 'Save'}
      disabled={busy}
    >
      <BookmarkSimple
        size={size}
        weight={saved ? 'fill' : 'regular'}
        aria-hidden="true"
      />
    </button>
  );
}
