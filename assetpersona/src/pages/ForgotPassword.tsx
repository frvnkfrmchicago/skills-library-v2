import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import './auth.css';

export default function ForgotPassword() {
  const { resetPassword, isBypass } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setStatus('sending');

    if (isBypass) {
      // Pretend it sent — never blocks the dev flow
      await new Promise((r) => setTimeout(r, 300));
      setStatus('sent');
      return;
    }

    const res = await resetPassword(email.trim().toLowerCase());
    if (res.error) {
      setError(res.error);
      setStatus('error');
      return;
    }
    setStatus('sent');
  }

  if (status === 'sent') {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-card__success">
            <CheckCircle2 size={44} strokeWidth={1.5} />
            <h1>Check your email.</h1>
            <p>
              {isBypass
                ? '(Bypass mode — pretend an email arrived.) Click "Reset Password" below to test the form.'
                : `If an account exists for ${email}, you'll get a password reset link.`}
            </p>
            <Link to="/login" className="btn btn--secondary">
              Back to sign in
            </Link>
            {isBypass && (
              <Link to="/reset-password?token=dev-bypass-token" className="auth-card__hint">
                → Test reset form
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/login" className="auth-card__back">
          <ArrowLeft size={16} /> Back to sign in
        </Link>

        <h1 className="auth-card__title">Forgot your password?</h1>
        <p className="auth-card__subtitle">
          Enter the email you signed up with. I'll send a reset link.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-form__field">
            <span>Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              autoComplete="email"
              autoFocus
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
            disabled={status === 'sending'}
          >
            {status === 'sending' ? 'Sending...' : 'Send reset link'}
          </button>
        </form>
      </div>
    </div>
  );
}
