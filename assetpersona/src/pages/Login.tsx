import { useState, type FormEvent } from 'react';
import { Link, useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { Mail, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { track } from '../lib/analytics';
import './Login.css';

export default function Login() {
  const { signIn, signUp, signInWithGoogle, isDemo, isBypass } = useAuth();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const redirectTo = searchParams.get('redirect');
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  /* Demo mode + dev bypass — skip auth entirely, route forward */
  if (isDemo || isBypass) {
    return <Navigate to={redirectTo || '/community'} replace />;
  }

  /** Determine where to send the user after auth */
  async function resolvePostAuthRoute(): Promise<string> {
    if (redirectTo) return redirectTo;

    const { supabase } = await import('../lib/supabase');
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      if ((profile as { role?: string } | null)?.role === 'admin') return '/admin';
    }

    return '/community';
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (mode === 'login') {
      const res = await signIn(email, password);
      if (res.error) {
        setError(res.error);
        setSubmitting(false);
        return;
      }
      const dest = await resolvePostAuthRoute();
      navigate(dest, { replace: true });
    } else {
      const fallbackName = email.split('@')[0]?.replace(/[._-]+/g, ' ').trim() || 'Study Hall member';
      const res = await signUp(email, password, fallbackName);
      if (res.error) {
        setError(res.error);
        setSubmitting(false);
        return;
      }
      track('signup', { method: 'email' });
      if (res.needsConfirmation) {
        setCheckEmail(true);
        setSubmitting(false);
        return;
      }
      const dest = await resolvePostAuthRoute();
      navigate(dest, { replace: true });
    }

    setSubmitting(false);
  }

  async function handleGoogle() {
    setError('');
    const res = await signInWithGoogle();
    if (res.error) setError(res.error);
    // OAuth redirect handles navigation; nothing else to do here.
  }

  if (checkEmail) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-confirm">
            <span className="login-confirm__icon" aria-hidden="true">
              <Mail size={36} />
            </span>
            <h1 className="login-card__title">Check your inbox</h1>
            <p className="login-card__subtitle">
              A verification link is on the way to <strong>{email}</strong>. Open it
              to finish setting up your account. Once verified, come back and sign in.
            </p>
            <ul className="login-confirm__tips">
              <li>
                <CheckCircle2 size={14} /> Link expires in roughly an hour. Send another
                from the sign-in screen if it lapses.
              </li>
              <li>
                <CheckCircle2 size={14} /> Spam folder? Search for "Asset Persona" or "Supabase".
              </li>
            </ul>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                setCheckEmail(false);
                setMode('login');
              }}
            >
              Back to sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-card__title">
          {mode === 'login' ? 'Welcome Back' : 'Join the Agentic Study Hall'}
        </h1>
        <p className="login-card__subtitle">
          {mode === 'login'
            ? 'Sign in to your Asset Persona account.'
            : 'Create your free account and start learning AI this week.'}
        </p>

        {/* What you get — signup only */}
        {mode === 'signup' && (
          <ul className="login-card__perks">
            <li>✓ Community feed access</li>
            <li>✓ AI news & industry updates</li>
            <li>✓ Intro AI literacy modules</li>
            <li>✓ Talk Thru Tech event registration</li>
          </ul>
        )}

        {/* Google OAuth — fastest path */}
        <button
          type="button"
          className="login-google"
          onClick={handleGoogle}
          disabled={submitting}
        >
          <svg className="login-google__icon" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#EA4335" d="M12 11v3.4h4.8c-.2 1.3-1.5 3.7-4.8 3.7-2.9 0-5.3-2.4-5.3-5.4S9.1 7.3 12 7.3c1.6 0 2.7.7 3.4 1.3l2.3-2.2C16.4 5.1 14.4 4.2 12 4.2c-4.4 0-8 3.6-8 8s3.6 8 8 8c4.6 0 7.7-3.2 7.7-7.8 0-.5-.1-1-.1-1.4z"/>
          </svg>
          Continue with Google
        </button>

        <div className="login-divider">
          <span>or</span>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-form__field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="login-form__field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'Min 10 characters' : 'Your password'}
              minLength={mode === 'signup' ? 10 : 6}
              required
            />
          </label>

          {error && <p className="login-form__error">{error}</p>}

          <button
            type="submit"
            className="btn btn--primary login-form__submit"
            disabled={submitting}
          >
            {submitting
              ? 'Working...'
              : mode === 'login'
                ? 'Sign In'
                : 'Create Free Account'}
          </button>
        </form>

        <div className="login-card__links">
          {mode === 'login' && (
            <Link to="/forgot-password" className="login-card__forgot">
              Forgot password?
            </Link>
          )}
          <p className="login-card__toggle">
            {mode === 'login' ? (
              <>
                No account?{' '}
                <button onClick={() => setMode('signup')}>Sign up free</button>
              </>
            ) : (
              <>
                Already a member?{' '}
                <button onClick={() => setMode('login')}>Sign in</button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
