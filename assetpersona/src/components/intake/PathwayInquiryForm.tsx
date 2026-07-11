import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { isBypassActive, appendBypassInquiry } from '../../lib/devBypass';
import { track } from '../../lib/analytics';
import './PathwayInquiryForm.css';

/**
 * Form type drives Edge Function routing + Gmail template.
 * Keep in sync with public.inquiry_form_type enum (Wave 1 migration).
 */
export type PathwayFormType =
  | 'consult'
  | 'speaking'
  | 'training'
  | 'marketing'
  | 'general';

export type FieldType =
  | 'text'
  | 'email'
  | 'tel'
  | 'select'
  | 'textarea'
  | 'date';

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  half?: boolean; // pair two halves into a single row
  rows?: number;
}

export interface PathwayFormProps {
  formType: PathwayFormType;
  /** Form-type-specific fields. Shown after the always-present Name/Email pair. */
  fields: FieldDef[];
  /** Headline shown above the form. */
  heading: string;
  /** Sub-line below the heading. */
  subhead: string;
  /** Optional pre-form content (perks list, value stat, etc.). */
  intro?: ReactNode;
  /** Override the success copy. */
  successTitle?: string;
  successBody?: string;
  /** Optional Cal.com link shown as "skip the form" alternative. */
  calLink?: string;
  /** Submit button label. */
  submitLabel?: string;
}

type Status = 'idle' | 'sending' | 'sent' | 'error';

const WEBHOOK_URL =
  import.meta.env.VITE_INQUIRY_WEBHOOK_URL ||
  // Default to the Supabase Edge Function URL if the project URL is set.
  (import.meta.env.VITE_SUPABASE_URL
    ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/inquiry-webhook`
    : '');

function captureUtm(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  for (const key of [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
  ]) {
    const v = params.get(key);
    if (v) out[key] = v;
  }
  return out;
}

export default function PathwayInquiryForm({
  formType,
  fields,
  heading,
  subhead,
  intro,
  successTitle,
  successBody,
  calLink,
  submitLabel = 'Send Inquiry',
}: PathwayFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [extra, setExtra] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [inquiryId, setInquiryId] = useState<string | null>(null);

  const honeypotRef = useRef<HTMLInputElement>(null);
  const utm = useMemo(captureUtm, []);

  // Pre-fill name + email if user is signed in
  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!active || !user) return;
      if (user.email) setEmail((prev) => prev || user.email!);
      const meta = (user.user_metadata ?? {}) as Record<string, string>;
      if (meta.full_name) setName((prev) => prev || meta.full_name);
    });
    return () => {
      active = false;
    };
  }, []);

  function onExtraChange(field: string, value: string) {
    setExtra((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    // Bot trap — silently succeed if filled
    if (honeypotRef.current?.value) {
      setStatus('sent');
      return;
    }

    setStatus('sending');
    setErrorMsg('');

    // Dev bypass: persist locally, simulate the webhook, surface in /admin/inquiries.
    if (isBypassActive()) {
      const row = appendBypassInquiry({
        form_type: formType,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        company: extra.company ?? extra.org_name ?? null,
        message:
          extra.goal ?? extra.context ?? extra.outcomes ?? extra.message ?? extra.topic ?? null,
        fields: extra,
        lead_score: 50,
        source: typeof window !== 'undefined' ? window.location.pathname : '',
        utm_source: utm.utm_source ?? null,
        utm_medium: utm.utm_medium ?? null,
        utm_campaign: utm.utm_campaign ?? null,
      });
      setInquiryId(row.id);
      track('inquiry_submitted', { form_type: formType, bypass: true });
      // Tiny delay so the UI shows the sending state, not jarring instant flip
      await new Promise((r) => setTimeout(r, 300));
      setStatus('sent');
      return;
    }

    if (!WEBHOOK_URL) {
      console.warn('VITE_INQUIRY_WEBHOOK_URL not set; inquiry not delivered');
      setStatus('sent');
      return;
    }

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form_type: formType,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          fields: extra,
          source: typeof window !== 'undefined' ? window.location.pathname : '',
          ...utm,
          // Anti-bot honeypot — server checks too
          _hp: '',
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || `HTTP ${res.status}`);
      }
      const data: { id?: string } = await res.json().catch(() => ({}));
      if (data.id) setInquiryId(data.id);
      track('inquiry_submitted', { form_type: formType });
      setStatus('sent');
    } catch (err) {
      console.error('Inquiry submit failed:', err);
      setErrorMsg('Something went wrong. Try again or email flawrence.d@gmail.com directly.');
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="pathway-form pathway-form--success">
        <div className="pathway-form__success-icon">
          <CheckCircle2 size={44} strokeWidth={1.5} />
        </div>
        <h2 className="pathway-form__success-title">
          {successTitle ?? 'Got it. I will be in touch.'}
        </h2>
        <p className="pathway-form__success-body">
          {successBody ??
            'Your inquiry just landed in my inbox. Expect a personal reply with the next step.'}
        </p>
        {inquiryId && (
          <p className="pathway-form__ref">Reference: {inquiryId.slice(0, 8)}</p>
        )}
        <button
          type="button"
          className="btn btn--secondary"
          onClick={() => {
            setStatus('idle');
            setName('');
            setEmail('');
            setExtra({});
            setInquiryId(null);
          }}
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <section className="pathway-form">
      <header className="pathway-form__header">
        <h1 className="pathway-form__heading">{heading}</h1>
        <p className="pathway-form__subhead">{subhead}</p>
      </header>

      {intro && <div className="pathway-form__intro">{intro}</div>}

      {calLink && (
        <a
          href={calLink}
          target="_blank"
          rel="noopener noreferrer"
          className="pathway-form__cal"
        >
          Skip the form — book a 15-minute call <ArrowRight size={16} />
        </a>
      )}

      <form className="pathway-form__form" onSubmit={handleSubmit} noValidate>
        {/* Honeypot — invisible to humans, attractive to bots */}
        <input
          ref={honeypotRef}
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          className="pathway-form__honeypot"
          aria-hidden="true"
        />

        <div className="pathway-form__row">
          <div className="pathway-form__field">
            <label htmlFor="pf-name">Name</label>
            <input
              id="pf-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
            />
          </div>
          <div className="pathway-form__field">
            <label htmlFor="pf-email">Email</label>
            <input
              id="pf-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              autoComplete="email"
            />
          </div>
        </div>

        {/* Render schema-driven fields */}
        <div className="pathway-form__fields">
          {(() => {
            const rows: ReactNode[] = [];
            let i = 0;
            while (i < fields.length) {
              const f = fields[i];
              const next = fields[i + 1];
              if (f.half && next?.half) {
                rows.push(
                  <div className="pathway-form__row" key={f.name}>
                    <div className="pathway-form__field">
                      {renderField(f, extra[f.name] ?? '', onExtraChange)}
                    </div>
                    <div className="pathway-form__field">
                      {renderField(next, extra[next.name] ?? '', onExtraChange)}
                    </div>
                  </div>
                );
                i += 2;
              } else {
                rows.push(
                  <div className="pathway-form__field" key={f.name}>
                    {renderField(f, extra[f.name] ?? '', onExtraChange)}
                  </div>
                );
                i += 1;
              }
            }
            return rows;
          })()}
        </div>

        {status === 'error' && (
          <div className="pathway-form__error" role="alert">
            <AlertCircle size={16} />
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          className="btn btn--primary pathway-form__submit"
          disabled={status === 'sending'}
        >
          {status === 'sending' ? 'Sending...' : submitLabel}
          <ArrowRight size={16} />
        </button>

        <p className="pathway-form__privacy">
          I read every inquiry personally. I never sell or share your info.
        </p>
      </form>
    </section>
  );
}

function renderField(
  f: FieldDef,
  value: string,
  onChange: (n: string, v: string) => void
) {
  const id = `pf-${f.name}`;
  const common = {
    id,
    required: f.required,
    placeholder: f.placeholder,
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      onChange(f.name, e.target.value),
  };

  return (
    <>
      <label htmlFor={id}>{f.label}{f.required && <span className="pathway-form__required" aria-hidden="true"> *</span>}</label>
      {f.type === 'textarea' ? (
        <textarea {...common} rows={f.rows ?? 5} />
      ) : f.type === 'select' ? (
        <select {...common}>
          <option value="" disabled>{f.placeholder ?? 'Select one'}</option>
          {f.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : (
        <input type={f.type} autoComplete="off" {...common} />
      )}
    </>
  );
}
