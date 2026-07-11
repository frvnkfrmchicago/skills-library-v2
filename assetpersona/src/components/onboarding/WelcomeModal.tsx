import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Mic2,
  GraduationCap,
  Sparkles,
  X,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { supabase } from '../../lib/supabase';
import { isWelcomeDone, markWelcomeDone } from '../../lib/devBypass';
import { track } from '../../lib/analytics';
import './WelcomeModal.css';

interface ChipDef {
  id: string;
  icon: typeof Briefcase;
  label: string;
  routes_to: string;
  description: string;
}

const CHIPS: ChipDef[] = [
  {
    id: 'hire',
    icon: Briefcase,
    label: 'Hire Frank',
    routes_to: '/work/consulting',
    description: 'Bring AI consulting into your business.',
  },
  {
    id: 'speaking',
    icon: Mic2,
    label: 'Book a Talk',
    routes_to: '/work/speaking',
    description: 'Speaker for an event, panel, or offsite.',
  },
  {
    id: 'training',
    icon: GraduationCap,
    label: 'Train My Team',
    routes_to: '/work/training',
    description: 'Upskill a team or run a workshop.',
  },
  {
    id: 'learn',
    icon: Sparkles,
    label: 'Just Learning',
    routes_to: '/community',
    description: 'Following along, attending events, reading posts.',
  },
];

/**
 * First-paint chip picker on `/community` (or anywhere with ?welcome=1).
 * A single click writes services_interest, bumps onboarding_step, and routes
 * via `useNavigate()` — no full page reload, no mid-flow flash of white.
 *
 * On click, the picked chip gets a brief checkmark celebration before the
 * route swap so the visitor sees the choice land before the surface changes.
 */
export default function WelcomeModal() {
  const { user, profile, isBypass, refreshProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [picking, setPicking] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<string | null>(null);

  useEffect(() => {
    // Only show on /community (where signups land) or with explicit ?welcome=1.
    const search = new URLSearchParams(location.search);
    const onCommunity = location.pathname.startsWith('/community');
    const forced = search.get('welcome') === '1';
    if (!onCommunity && !forced) {
      setOpen(false);
      return;
    }

    if (isBypass) {
      setOpen(!isWelcomeDone());
      return;
    }
    if (!profile) return;
    const step = (profile as unknown as { onboarding_step?: number }).onboarding_step ?? 0;
    setOpen(step < 1);
  }, [profile, isBypass, location.pathname, location.search]);

  if (!open) return null;

  async function pick(chip: ChipDef) {
    setPicking(chip.id);

    if (isBypass) {
      markWelcomeDone();
    } else if (user && profile) {
      // One round-trip: RPC handles services_interest + onboarding_step + email opt-in.
      // Falls back to a direct UPDATE if the RPC isn't deployed yet (transitional).
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any).rpc('set_services_interest', {
          interest: chip.id,
          opt_in_email: false,
        });
        if (error) throw error;
      } catch {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any)
            .from('profiles')
            .update({ services_interest: chip.id, onboarding_step: 1 })
            .eq('id', user.id);
        } catch {
          /* swallow — flow must always complete */
        }
      }
      await refreshProfile();
    }

    track('welcome_completed', { intent: chip.id });

    // Brief celebration so the visitor sees the click land before route swap.
    setConfirmed(chip.id);
    await new Promise((resolve) => setTimeout(resolve, 360));

    setOpen(false);
    setPicking(null);
    setConfirmed(null);

    // Route via the router — no full page reload. Keep the visitor on
    // /community if they picked "Just Learning" since that IS the destination.
    if (chip.routes_to !== location.pathname) {
      navigate(chip.routes_to, { replace: true });
    }
  }

  function skip() {
    if (isBypass) markWelcomeDone();
    track('welcome_completed', { intent: 'skipped' });
    setOpen(false);
  }

  return (
    <div className="welcome-modal" role="dialog" aria-modal="true" aria-labelledby="welcome-modal-title">
      <div className="welcome-modal__backdrop" onClick={skip} />
      <div className="welcome-modal__card">
        <div className="welcome-modal__drag-handle" />
        <button
          type="button"
          className="welcome-modal__close"
          onClick={skip}
          aria-label="Skip for now"
        >
          <X size={18} />
        </button>

        <p className="welcome-modal__eyebrow">Welcome, one question</p>
        <h2 id="welcome-modal-title" className="welcome-modal__title">
          What brought you to Asset Persona?
        </h2>
        <p className="welcome-modal__sub">
          Pick the one that fits. The next view changes to match. You can switch this later.
        </p>

        <div className="welcome-modal__chips">
          {CHIPS.map((chip) => {
            const Icon = chip.icon;
            const isLoading = picking === chip.id && confirmed !== chip.id;
            const isConfirmed = confirmed === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                className={`welcome-modal__chip ${isConfirmed ? 'is-confirmed' : ''}`}
                disabled={picking !== null}
                onClick={() => pick(chip)}
              >
                <span className="welcome-modal__chip-icon">
                  <Icon size={20} />
                </span>
                <span className="welcome-modal__chip-body">
                  <span className="welcome-modal__chip-label">{chip.label}</span>
                  <span className="welcome-modal__chip-desc">{chip.description}</span>
                </span>
                {isLoading && <span className="welcome-modal__chip-spinner" />}
                <AnimatePresence>
                  {isConfirmed && (
                    <motion.span
                      key="confirm"
                      className="welcome-modal__chip-confirm"
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 360, damping: 20 }}
                    >
                      <Check size={20} strokeWidth={3} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="welcome-modal__skip"
          onClick={skip}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
