import { useState } from 'react';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import './InquiryForm.css';

const INQUIRY_TYPES = [
  { value: '', label: 'What are you reaching out about?' },
  { value: 'ai-training', label: 'AI Literacy Training' },
  { value: 'ai-integration', label: 'AI Integration for My Business' },
  { value: 'vibe-coding', label: 'Vibe Coding Project' },
  { value: 'marketing', label: 'Marketing and Content' },
  { value: 'speaking', label: 'Speaking or Workshop' },
  { value: 'partnership', label: 'Partnership or Collaboration' },
  { value: 'general', label: 'General Question' },
];

type FormStatus = 'idle' | 'sending' | 'sent' | 'error';

export default function InquiryForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [inquiryType, setInquiryType] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    if (!isSupabaseConfigured) {
      console.warn('Contact submission skipped: Supabase not configured', { name, email, inquiryType });
      setStatus('sent');
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from('contact_submissions').insert({
        name,
        email,
        inquiry_type: inquiryType,
        message,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;
      setStatus('sent');
      setName('');
      setEmail('');
      setInquiryType('');
      setMessage('');
    } catch (err) {
      console.error('Contact form error:', err);
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <div className="inquiry__success">
        <CheckCircle size={40} />
        <h3>Got it.</h3>
        <p>We will be in touch soon.</p>
        <button
          className="btn btn--secondary"
          onClick={() => setStatus('idle')}
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form className="inquiry__form" onSubmit={handleSubmit}>
      <div className="inquiry__row">
        <div className="inquiry__field">
          <label htmlFor="contact-name">Name</label>
          <input
            id="contact-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>
        <div className="inquiry__field">
          <label htmlFor="contact-email">Email</label>
          <input
            id="contact-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
          />
        </div>
      </div>

      <div className="inquiry__field">
        <label htmlFor="contact-type">Topic</label>
        <select
          id="contact-type"
          required
          value={inquiryType}
          onChange={(e) => setInquiryType(e.target.value)}
        >
          {INQUIRY_TYPES.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.value === ''}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="inquiry__field">
        <label htmlFor="contact-message">Message</label>
        <textarea
          id="contact-message"
          required
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us what you need"
        />
      </div>

      {status === 'error' && (
        <div className="inquiry__error">
          <AlertCircle size={16} />
          Something went wrong. Try again or email us directly.
        </div>
      )}

      <button
        type="submit"
        className="btn btn--primary inquiry__submit"
        disabled={status === 'sending'}
      >
        {status === 'sending' ? 'Sending...' : 'Send Message'}
        <Send size={16} />
      </button>
    </form>
  );
}
