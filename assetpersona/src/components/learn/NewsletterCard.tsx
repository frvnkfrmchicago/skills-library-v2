/* ═══ NewsletterCard — Learn-hub digest signup ═══
 *
 * Per onboarding-designing + SaaS-onboarding-2026 research: capture email
 * with one field, give a clear value-stat, behavior-confirm. Honeypot for
 * bots, UTM capture, success state, no double-submit.
 *
 * In bypass mode, the form pretends to succeed and stores in localStorage
 * so the dev preview shows the success state.
 */
import { useEffect, useState, type FormEvent } from 'react';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { isBypassActive } from '../../lib/devBypass';
import { isSupabaseConfigured } from '../../lib/supabase';
import { track } from '../../lib/analytics';
import './NewsletterCard.css';

interface NewsletterCardProps {
  source?: string; // 'learn-hub' | 'work-page' | etc.
  heading?: string;
  subhead?: string;
}

const FN_PATH = '/functions/v1/subscribe-email';

export default function NewsletterCard({
  source = 'learn-hub',
  heading = 'A 5-min AI drop, in your inbox.',
  subhead = 'One concept, one drill, one news take. No spam.',
}: NewsletterCardProps) {
  const [email, setEmail] = useState('');
  const [hp, setHp] = useState(''); // honeypot
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  // Capture UTMs once on mount so they ride along on submit
  const [utm, setUtm] = useState<Record<string, string>>({});
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const captured: Record<string, string> = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach((k) => {
      const v = params.get(k);
      if (v) captured[k] = v;
    });
    setUtm(captured);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (hp.trim() !== '') {
      // Honeypot tripped — silent success.
      setStatus('sent');
      return;
    }
    setError('');
    setStatus('sending');

    if (isBypassActive() || !isSupabaseConfigured) {
      // Local store + pretend
      try {
        const raw = localStorage.getItem('ap_dev_subscribers') || '[]';
        const arr = JSON.parse(raw);
        if (!arr.find((s: { email: string }) => s.email === email)) {
          arr.unshift({ email, source, ...utm, ts: new Date().toISOString() });
          localStorage.setItem('ap_dev_subscribers', JSON.stringify(arr.slice(0, 200)));
        }
      } catch {
        /* ignore */
      }
      track('signup', { stage: 'newsletter', source });
      setTimeout(() => setStatus('sent'), 350);
      return;
    }

    try {
      const url =
        (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, '') + FN_PATH;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), source, ...utm }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `subscribe failed (${res.status})`);
      }
      track('signup', { stage: 'newsletter', source });
      setStatus('sent');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Subscription failed.');
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <aside className="newsletter-card newsletter-card--sent">
        <div className="newsletter-card__icon">
          <CheckCircle2 size={26} strokeWidth={1.5} />
        </div>
        <h3>You're in.</h3>
        <p>First drop hits within a day. Watch your inbox.</p>
      </aside>
    );
  }

  return (
    <aside className="newsletter-card">
      <div className="newsletter-card__icon">
        <Mail size={20} />
      </div>
      <div className="newsletter-card__body">
        <h3>{heading}</h3>
        <p>{subhead}</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="newsletter-email" className="visually-hidden">
            Email
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            autoComplete="email"
            disabled={status === 'sending'}
          />
          {/* Honeypot — bots fill it, humans don't see it */}
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={hp}
            onChange={(e) => setHp(e.target.value)}
            className="newsletter-card__hp"
            aria-hidden="true"
          />
          <button type="submit" className="btn btn--primary" disabled={status === 'sending'}>
            {status === 'sending' ? 'Subscribing…' : 'Subscribe'}
          </button>
        </form>
        {status === 'error' && (
          <p className="newsletter-card__err" role="alert">
            <AlertCircle size={14} /> {error}
          </p>
        )}
      </div>
    </aside>
  );
}
