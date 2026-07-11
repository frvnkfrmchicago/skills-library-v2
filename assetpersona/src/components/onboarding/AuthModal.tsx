import { useEffect, useState, useCallback, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Mail, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { track } from '../../lib/analytics';
import './AuthModal.css';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  /** Where to send the visitor after a successful auth. */
  redirectTo?: string;
  /** Initial mode. Visitors hitting a gated route default to signup. */
  initialMode?: 'signin' | 'signup';
}

type Mode = 'signin' | 'signup';
type Phase = 'form' | 'check-email';

/**
 * Inline auth surface. Replaces the prior `/login` page navigation for the
 * common gated-route case. Mounts on top of the current route, supports
 * email + password and Google OAuth, and shows a "Check your email" panel
 * after signup when Supabase email confirmation is enabled.
 *
 * Done criteria:
 *   - No page navigation (modal overlay only)
 *   - Closes on Escape, backdrop click, or X button
 *   - Post-signup confirmation screen with a clear next action
 *   - Microcopy passes the AI-tell ban list
 */
export default function AuthModal({
  open,
  onClose,
  redirectTo,
  initialMode = 'signup',
}: AuthModalProps) {
  const { signIn, signUp, signInWithGoogle, isDemo, isBypass } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>(initialMode);
  const [phase, setPhase] = useState<Phase>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  // Reset form state when the modal closes so a re-open starts clean.
  useEffect(() => {
    if (!open) {
      setError('');
      setSubmitting(false);
      setPhase('form');
    }
  }, [open]);

  const close = useCallback(() => {
    onClose();
  }, [onClose]);

  // Escape closes the modal.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  // If a demo or bypass session is active, the modal short-circuits so testers
  // don't get blocked by a useless auth wall.
  useEffect(() => {
    if (open && (isDemo || isBypass) && redirectTo) {
      navigate(redirectTo, { replace: true });
    }
  }, [open, isDemo, isBypass, redirectTo, navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (mode === 'signin') {
      const res = await signIn(email, password);
      if (res.error) {
        setError(res.error);
        setSubmitting(false);
        return;
      }
      track('signup', { method: 'email-signin' });
      finishAuth();
      return;
    }

    if (password.length < 10) {
      setError('Passwords need at least 10 characters.');
      setSubmitting(false);
      return;
    }

    const fallbackName = email.split('@')[0]?.replace(/[._-]+/g, ' ').trim() || 'Study Hall member';
    const res = await signUp(email, password, fallbackName);
    if (res.error) {
      setError(res.error);
      setSubmitting(false);
      return;
    }

    track('signup', { method: 'email' });

    if (res.needsConfirmation) {
      setSubmittedEmail(email);
      setPhase('check-email');
      setSubmitting(false);
      return;
    }

    finishAuth();
  }

  function finishAuth() {
    setSubmitting(false);
    if (redirectTo) {
      navigate(redirectTo, { replace: true });
    } else {
      navigate('/community', { replace: true });
    }
  }

  async function handleGoogle() {
    setError('');
    const res = await signInWithGoogle();
    if (res.error) setError(res.error);
    // OAuth handles its own redirect via Supabase.
  }

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
      >
        <motion.div
          className="auth-modal__backdrop"
          onClick={close}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
        <motion.div
          className="auth-modal__card"
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        >
          <button
            type="button"
            className="auth-modal__close"
            onClick={close}
            aria-label="Close"
          >
            <X size={18} />
          </button>

          {phase === 'form' ? (
            <>
              <h2 id="auth-modal-title" className="auth-modal__title">
                {mode === 'signin' ? 'Welcome back' : 'Join the Agentic Study Hall'}
              </h2>
              <p className="auth-modal__sub">
                {mode === 'signin'
                  ? 'Sign in to keep going.'
                  : 'Free account. Feed access, live events, weekly drops.'}
              </p>

              <button
                type="button"
                className="auth-modal__google"
                onClick={handleGoogle}
                disabled={submitting}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="auth-modal__google-icon"
                >
                  <path
                    fill="#EA4335"
                    d="M12 11v3.4h4.8c-.2 1.3-1.5 3.7-4.8 3.7-2.9 0-5.3-2.4-5.3-5.4S9.1 7.3 12 7.3c1.6 0 2.7.7 3.4 1.3l2.3-2.2C16.4 5.1 14.4 4.2 12 4.2c-4.4 0-8 3.6-8 8s3.6 8 8 8c4.6 0 7.7-3.2 7.7-7.8 0-.5-.1-1-.1-1.4z"
                  />
                </svg>
                Continue with Google
              </button>

              <div className="auth-modal__divider">
                <span>or</span>
              </div>

              <form className="auth-modal__form" onSubmit={handleSubmit}>
                <label className="auth-modal__field">
                  <span>Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </label>

                <label className="auth-modal__field">
                  <span>Password</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={
                      mode === 'signup' ? '10 characters or more' : 'Your password'
                    }
                    autoComplete={
                      mode === 'signup' ? 'new-password' : 'current-password'
                    }
                    minLength={mode === 'signup' ? 10 : 6}
                    required
                  />
                </label>

                {error && <p className="auth-modal__error">{error}</p>}

                <button
                  type="submit"
                  className="btn btn--primary auth-modal__submit"
                  disabled={submitting}
                >
                  {submitting
                    ? 'Working...'
                    : mode === 'signin'
                      ? 'Sign in'
                      : 'Create free account'}
                </button>
              </form>

              <p className="auth-modal__toggle">
                {mode === 'signin' ? (
                  <>
                    No account yet?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signup');
                        setError('');
                      }}
                    >
                      Sign up free
                    </button>
                  </>
                ) : (
                  <>
                    Already a member?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signin');
                        setError('');
                      }}
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </>
          ) : (
            <motion.div
              className="auth-modal__confirm"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24 }}
            >
              <motion.span
                className="auth-modal__confirm-icon"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.05, type: 'spring', stiffness: 260, damping: 18 }}
              >
                <Mail size={36} />
              </motion.span>
              <h2 className="auth-modal__title">Check your inbox</h2>
              <p className="auth-modal__sub">
                A verification link is on the way to{' '}
                <strong>{submittedEmail}</strong>. Open it to finish setting up
                your account. Once verified, come back here and sign in.
              </p>
              <ul className="auth-modal__confirm-tips">
                <li>
                  <CheckCircle2 size={14} /> Link expires in roughly an hour.
                  Send another from the sign-in screen if it lapses.
                </li>
                <li>
                  <CheckCircle2 size={14} /> Spam folder? It happens. Search for
                  "Asset Persona" or "Supabase".
                </li>
              </ul>
              <button
                type="button"
                className="btn btn--ghost auth-modal__confirm-back"
                onClick={() => {
                  setPhase('form');
                  setMode('signin');
                }}
              >
                Back to sign in
              </button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
