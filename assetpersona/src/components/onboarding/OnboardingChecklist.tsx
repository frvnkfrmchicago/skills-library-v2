import { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Circle, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { track } from '../../lib/analytics';
import AvatarUploader from '../account/AvatarUploader';
import './OnboardingChecklist.css';

interface SaveState {
  status: 'idle' | 'saving' | 'saved' | 'error';
  message?: string;
}

/**
 * Inline 3-step onboarding wizard. Replaces the prior link-list pattern that
 * sent visitors to other routes mid-onboarding. Every step happens in-place:
 *
 *  1. Avatar + bio (inline AvatarUploader + textarea, autosaves on blur)
 *  2. Register for the next live event (anchor link to /talkthrutech, opens
 *     in same tab — value is unambiguous, copy is clear)
 *  3. Drop a hello in the feed (smooth-scrolls to the feed composer on the
 *     same page)
 *
 * Each step auto-marks complete as the visitor actually does it. No
 * "click to mark done" checkbox theatrics.
 */
export default function OnboardingChecklist() {
  const { user, profile, isBypass, refreshProfile } = useAuth();
  const [bio, setBio] = useState(
    ((profile as unknown as { bio?: string })?.bio ?? '') as string
  );
  const [save, setSave] = useState<SaveState>({ status: 'idle' });
  const cardRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!profile) return;
    setBio(((profile as unknown as { bio?: string }).bio ?? '') as string);
  }, [profile]);

  const items = useMemo(() => {
    const step = (profile as unknown as { onboarding_step?: number })?.onboarding_step ?? 0;
    const hasAvatar = !!profile?.avatar_url;
    const hasBio = !!profile?.bio && profile.bio.trim().length > 0;
    const profileDone = hasAvatar && hasBio;
    return [
      {
        id: 'profile',
        label: 'Add an avatar and a one-line bio',
        sub: 'Members with completed profiles get three times the replies in the feed.',
        done: profileDone,
      },
      {
        id: 'event',
        label: 'Register for the next live event',
        sub: 'Talk Thru Tech is where most of the connection happens.',
        done: step >= 2,
      },
      {
        id: 'feed',
        label: 'Drop a hello in the feed',
        sub: 'One sentence is plenty. What you do, what you are working on.',
        done: step >= 3,
      },
    ];
  }, [profile]);

  const completed = items.filter((i) => i.done).length;
  const progress = (completed / items.length) * 100;

  // Hide once everything's done (in real or bypass mode).
  if (completed >= items.length && !isBypass) return null;

  async function saveProfile() {
    if (!user?.id || isBypass || !isSupabaseConfigured) {
      setSave({ status: 'saved' });
      setTimeout(() => setSave({ status: 'idle' }), 1600);
      return;
    }
    setSave({ status: 'saving' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('profiles')
      .update({
        bio: bio.trim(),
        onboarding_step: Math.max(
          (profile as unknown as { onboarding_step?: number })?.onboarding_step ?? 0,
          1
        ),
      })
      .eq('id', user.id);
    if (error) {
      setSave({ status: 'error', message: error.message });
      return;
    }
    track('onboarding_step_completed', { step: 1 });
    await refreshProfile();
    setSave({ status: 'saved' });
    setTimeout(() => setSave({ status: 'idle' }), 1600);
  }

  function scrollToFeedComposer() {
    const composer = document.querySelector<HTMLElement>(
      '[data-onboarding-anchor="feed-composer"], textarea[placeholder*="Share"]'
    );
    if (composer) {
      composer.scrollIntoView({ behavior: 'smooth', block: 'center' });
      composer.focus({ preventScroll: true });
    }
  }

  const hasAvatar = !!profile?.avatar_url;
  const hasBio = !!profile?.bio && profile.bio.trim().length > 0;

  return (
    <aside
      ref={cardRef}
      className="onboarding-checklist"
      aria-label="Get started"
      data-onboarding-anchor="checklist"
    >
      <header className="onboarding-checklist__head">
        <span className="onboarding-checklist__eyebrow">
          <Sparkles size={14} /> Get started
        </span>
        <span className="onboarding-checklist__count">
          {completed} / {items.length}
        </span>
      </header>

      <div
        className="onboarding-checklist__progress"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.span
          className="onboarding-checklist__progress-fill"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ type: 'spring', stiffness: 220, damping: 26 }}
        />
      </div>

      <ol className="onboarding-checklist__list">
        {items.map((item) => (
          <li
            key={item.id}
            className={`onboarding-checklist__item ${item.done ? 'is-done' : ''}`}
          >
            <span className="onboarding-checklist__icon" aria-hidden="true">
              <AnimatePresence mode="wait">
                {item.done ? (
                  <motion.span
                    key="done"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 360, damping: 22 }}
                  >
                    <Check size={16} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="todo"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Circle size={14} />
                  </motion.span>
                )}
              </AnimatePresence>
            </span>

            <div className="onboarding-checklist__body">
              <span className="onboarding-checklist__label">{item.label}</span>
              <span className="onboarding-checklist__sub">{item.sub}</span>

              {item.id === 'profile' && !item.done && (
                <div className="onboarding-checklist__inline">
                  <div className="onboarding-checklist__inline-avatar">
                    <AvatarUploader
                      variant="avatar"
                      currentUrl={profile?.avatar_url ?? null}
                    />
                  </div>
                  <label className="onboarding-checklist__inline-bio">
                    <span>One-line bio</span>
                    <textarea
                      rows={2}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      onBlur={saveProfile}
                      placeholder="One sentence on what you are working on."
                      maxLength={200}
                    />
                    <span className="onboarding-checklist__inline-meta">
                      <span className="onboarding-checklist__inline-counter">
                        {bio.length} / 200
                      </span>
                      {save.status === 'saving' && (
                        <span className="onboarding-checklist__inline-status">
                          <Loader2 size={12} className="spin" /> Saving
                        </span>
                      )}
                      {save.status === 'saved' && (
                        <span className="onboarding-checklist__inline-status is-ok">
                          <Check size={12} /> Saved
                        </span>
                      )}
                      {save.status === 'error' && (
                        <span className="onboarding-checklist__inline-status is-err">
                          {save.message ?? 'Save failed'}
                        </span>
                      )}
                    </span>
                  </label>
                  {hasAvatar && !hasBio && (
                    <p className="onboarding-checklist__inline-hint">
                      Avatar saved. Add a one-line bio to finish this step.
                    </p>
                  )}
                  {hasBio && !hasAvatar && (
                    <p className="onboarding-checklist__inline-hint">
                      Bio saved. Add an avatar to finish this step.
                    </p>
                  )}
                </div>
              )}

              {item.id === 'event' && !item.done && (
                <div className="onboarding-checklist__inline">
                  <a
                    href="/talkthrutech"
                    className="btn btn--ghost btn--sm onboarding-checklist__inline-cta"
                  >
                    See the next session
                  </a>
                  <p className="onboarding-checklist__inline-hint">
                    Open in the same tab. The list shows what is on deck.
                  </p>
                </div>
              )}

              {item.id === 'feed' && !item.done && (
                <div className="onboarding-checklist__inline">
                  <button
                    type="button"
                    onClick={scrollToFeedComposer}
                    className="btn btn--ghost btn--sm onboarding-checklist__inline-cta"
                  >
                    Jump to the composer
                  </button>
                  <p className="onboarding-checklist__inline-hint">
                    The cursor lands in the post box. Type, then post.
                  </p>
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </aside>
  );
}
