/* ═══ SharePrompt — mint a learning_post + post to feed + redirect ═══
 *
 * Lane 2 of AP-ENGAGEMENT-LOOP-2026-05. Drops onto the Module completion
 * screen as the primary CTA: the member writes a 140-char takeaway, the
 * component creates the learning_posts row, posts to the community feed,
 * and navigates to /learned/:shareId so they see the celebration card +
 * can copy the share link off-platform.
 *
 * Copy follows copywriting-enforcing rules — no AI tells, no time language.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, X, Share2, AlertTriangle } from 'lucide-react';
import {
  createLearningPost,
  type CreateLearningPostInput,
} from '../../data/learningPosts';
import { track } from '../../lib/analytics';
import './SharePrompt.css';

const SOFT_HINT = 140;
const HARD_CAP = 280;

interface SharePromptProps {
  moduleId: string;
  moduleSlug: string;
  moduleTitle: string;
  /** Optional placeholder seed — defaults to the brand copy. */
  placeholder?: string;
  /** If true, the textarea opens focused (used by the email deep-link path). */
  autoFocus?: boolean;
  /** Fires when the member taps Skip — Module.tsx hides the prompt afterward. */
  onSkip?: () => void;
}

function clampCount(n: number): number {
  if (n < 0) return 0;
  if (n > HARD_CAP) return HARD_CAP;
  return n;
}

export default function SharePrompt({
  moduleId,
  moduleSlug,
  moduleTitle,
  placeholder = 'Today I learned…',
  autoFocus = false,
  onSkip,
}: SharePromptProps) {
  const navigate = useNavigate();
  const [takeaway, setTakeaway] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skipped, setSkipped] = useState(false);

  const remaining = useMemo(() => HARD_CAP - takeaway.length, [takeaway]);
  const overSoft = takeaway.length > SOFT_HINT;
  const overHard = takeaway.length > HARD_CAP;
  const canSubmit = takeaway.trim().length > 0 && !overHard && !busy;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      const input: CreateLearningPostInput = {
        moduleId,
        takeaway: takeaway.trim(),
        module: { title: moduleTitle, slug: moduleSlug },
      };
      const { shareId } = await createLearningPost(input);
      track('feed_post', {
        kind: 'learning_share',
        module_id: moduleId,
        module_slug: moduleSlug,
        share_id: shareId,
        takeaway_length: takeaway.trim().length,
      });
      navigate(`/learned/${shareId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save. Try again.');
      setBusy(false);
    }
  }, [canSubmit, moduleId, moduleSlug, moduleTitle, navigate, takeaway]);

  const handleSkip = useCallback(() => {
    track('feed_post', {
      kind: 'learning_share_skipped',
      module_id: moduleId,
      module_slug: moduleSlug,
    });
    setSkipped(true);
    onSkip?.();
  }, [moduleId, moduleSlug, onSkip]);

  useEffect(() => {
    if (!autoFocus) return;
    const el = document.getElementById('share-prompt-textarea');
    el?.focus();
  }, [autoFocus]);

  if (skipped) return null;

  return (
    <section
      className="share-prompt"
      role="region"
      aria-labelledby="share-prompt-heading"
    >
      <header className="share-prompt__head">
        <span className="share-prompt__badge">
          <Share2 size={14} aria-hidden="true" /> Share what you learned
        </span>
        <h3 id="share-prompt-heading" className="share-prompt__title">
          One sentence. Real takeaway.
        </h3>
        <p className="share-prompt__sub">
          The post lands on your feed and as a public card anyone can open — no
          login required to read it.
        </p>
      </header>

      <label htmlFor="share-prompt-textarea" className="share-prompt__sr">
        Your takeaway
      </label>
      <textarea
        id="share-prompt-textarea"
        className="share-prompt__textarea"
        value={takeaway}
        onChange={(e) => setTakeaway(e.target.value.slice(0, HARD_CAP))}
        placeholder={placeholder}
        maxLength={HARD_CAP}
        rows={4}
        disabled={busy}
        aria-describedby="share-prompt-counter share-prompt-error"
      />

      <div className="share-prompt__meta">
        <span
          id="share-prompt-counter"
          className={`share-prompt__counter ${overSoft ? 'is-soft' : ''} ${overHard ? 'is-hard' : ''}`}
          aria-live="polite"
        >
          {clampCount(remaining)} left
          {overSoft && !overHard && (
            <span className="share-prompt__counter-hint"> · shorter cards travel further</span>
          )}
        </span>
        <span className="share-prompt__module">on {moduleTitle}</span>
      </div>

      {error && (
        <p id="share-prompt-error" className="share-prompt__error" role="alert">
          <AlertTriangle size={14} aria-hidden="true" /> {error}
        </p>
      )}

      <div className="share-prompt__actions">
        <button
          type="button"
          className="btn btn--ghost share-prompt__skip"
          onClick={handleSkip}
          disabled={busy}
        >
          <X size={14} aria-hidden="true" /> Skip
        </button>
        <button
          type="button"
          className="btn btn--primary share-prompt__submit"
          onClick={handleSubmit}
          disabled={!canSubmit}
          aria-disabled={!canSubmit}
        >
          <Send size={14} aria-hidden="true" />
          {busy ? 'Sharing…' : 'Share what I learned'}
        </button>
      </div>
    </section>
  );
}
