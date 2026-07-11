import { useState, type FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/useAuth';
import './auth.css';

/**
 * Handles the password reset email link. Supabase delivers users here with a
 * recovery session pre-set; we just take a new password and update.
 */
export default function ResetPassword() {
  const { isBypass } = useAuth();
  const navigate = useNavigate();
  const [pwd, setPwd] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');
  const [hasRecoverySession, setHasRecoverySession] = useState(isBypass);

  useEffect(() => {
    if (isBypass) {
      setHasRecoverySession(true);
      return;
    }
    // Supabase auth client picks up the recovery session from the URL hash
    // automatically. We just confirm we have it.
    supabase.auth.getSession().then(({ data }) => {
      setHasRecoverySession(!!data.session);
    });
  }, [isBypass]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (pwd.length < 10) {
      setError('Use at least 10 characters.');
      return;
    }
    if (pwd !== pwd2) {
      setError('Passwords do not match.');
      return;
    }

    setStatus('saving');

    if (isBypass) {
      await new Promise((r) => setTimeout(r, 300));
      setStatus('done');
      setTimeout(() => navigate('/login', { replace: true }), 1000);
      return;
    }

    const { error: updateErr } = await supabase.auth.updateUser({ password: pwd });
    if (updateErr) {
      setError(updateErr.message);
      setStatus('error');
      return;
    }
    setStatus('done');
    setTimeout(() => navigate('/community', { replace: true }), 1000);
  }

  if (!hasRecoverySession && !isBypass) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-card__title">Link expired or invalid</h1>
          <p className="auth-card__subtitle">
            Your reset link is no longer valid. Request a new one to continue.
          </p>
          <Link to="/forgot-password" className="btn btn--primary auth-form__submit">
            Get a new link
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'done') {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-card__success">
            <CheckCircle2 size={44} strokeWidth={1.5} />
            <h1>Password updated.</h1>
            <p>Redirecting...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-card__title">Set a new password</h1>
        <p className="auth-card__subtitle">
          Use at least 10 characters. Mix it up.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-form__field">
            <span>New password</span>
            <input
              type="password"
              required
              minLength={10}
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              autoFocus
              autoComplete="new-password"
            />
          </label>

          <label className="auth-form__field">
            <span>Confirm new password</span>
            <input
              type="password"
              required
              minLength={10}
              value={pwd2}
              onChange={(e) => setPwd2(e.target.value)}
              autoComplete="new-password"
            />
          </label>

          {error && (
            <div className="auth-form__error" role="alert">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn--primary auth-form__submit"
            disabled={status === 'saving'}
          >
            {status === 'saving' ? 'Saving...' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
}
