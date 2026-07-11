/* ═══ /faq — public FAQ page + Ask Frank form ═══ */

import { useEffect, useMemo, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChevronDown, Search, MessageCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import SEOHead from '../components/seo/SEOHead';
import { listFaqs, FAQ_CATEGORIES, type Faq, type FaqCategory } from '../data/faqStore';
import { isBypassActive } from '../lib/devBypass';
import './Faq.css';

const FN_PATH = '/functions/v1/inquiry-webhook';

export default function FaqPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Ask Frank form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [question, setQuestion] = useState('');
  const [hp, setHp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    listFaqs().then((rows) => {
      if (cancelled) return;
      setFaqs(rows);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter(
      (f) => f.question.toLowerCase().includes(q) || f.answer_md.toLowerCase().includes(q)
    );
  }, [faqs, query]);

  const grouped = useMemo(() => {
    const map = new Map<FaqCategory, Faq[]>();
    for (const f of filtered) {
      const list = map.get(f.category) ?? [];
      list.push(f);
      map.set(f.category, list);
    }
    return map;
  }, [filtered]);

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    if (hp.trim()) { setSubmitted(true); return; } // honeypot
    setError('');
    setSubmitting(true);

    if (isBypassActive()) {
      await new Promise((r) => setTimeout(r, 350));
      setSubmitted(true);
      setSubmitting(false);
      return;
    }

    try {
      const url =
        ((import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? '').replace(/\/$/, '') + FN_PATH;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          form_type: 'qa',
          name,
          email,
          fields: { question },
          source: 'faq-ask-frank',
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `submit failed (${res.status})`);
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <SEOHead
        title="FAQ · Asset Persona"
        description="Frequently asked questions about Asset Persona. Daily AI modules, community, work with Frank, account."
        path="/faq"
      />
      <main className="faq-page">
        <header className="faq-page__head">
          <p className="faq-page__eyebrow">FAQ</p>
          <h1>Frequently asked.</h1>
          <p>Everything in one place. Or paste your question at the bottom.</p>
          <div className="faq-page__search">
            <Search size={16} />
            <input
              type="search"
              placeholder="Search the FAQ…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search FAQs"
            />
          </div>
        </header>

        {loading ? (
          <p className="faq-page__loading">Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="faq-page__empty">
            <p>No matches. Try a different word, or ask Frank directly below.</p>
          </div>
        ) : (
          <div className="faq-page__sections">
            {FAQ_CATEGORIES.map((cat) => {
              const items = grouped.get(cat.value) ?? [];
              if (items.length === 0) return null;
              return (
                <section key={cat.value} className="faq-page__section">
                  <h2>{cat.label}</h2>
                  <ul>
                    {items.map((f) => {
                      const isOpen = openId === f.id;
                      return (
                        <li key={f.id} className={isOpen ? 'is-open' : ''}>
                          <button
                            type="button"
                            className="faq-page__q"
                            onClick={() => setOpenId(isOpen ? null : f.id)}
                            aria-expanded={isOpen}
                          >
                            <span>{f.question}</span>
                            <ChevronDown size={18} className="faq-page__chev" />
                          </button>
                          {isOpen && (
                            <div className="faq-page__a">
                              <Markdown remarkPlugins={[remarkGfm]}>{f.answer_md}</Markdown>
                              {f.related_module_slug && (
                                <p>
                                  <a href={`/community/learn/${f.related_module_slug}`}>
                                    Related module →
                                  </a>
                                </p>
                              )}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </div>
        )}

        <section className="faq-ask">
          <header>
            <MessageCircle size={20} />
            <h2>Didn't see your question?</h2>
            <p>Send it. Frank reads every one.</p>
          </header>

          {submitted ? (
            <div className="faq-ask__sent">
              <CheckCircle2 size={32} />
              <h3>Got it.</h3>
              <p>Frank reads these personally. He'll get back to you, and the question may turn into a module.</p>
            </div>
          ) : (
            <form onSubmit={handleAsk} className="faq-ask__form">
              <div className="faq-ask__row">
                <label>
                  <span>Your name</span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                  />
                </label>
                <label>
                  <span>Email</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </label>
              </div>
              <label>
                <span>Question</span>
                <textarea
                  rows={4}
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask anything: workflow, model picks, getting started, work with Frank…"
                />
              </label>
              {/* Honeypot */}
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={hp}
                onChange={(e) => setHp(e.target.value)}
                className="faq-ask__hp"
                aria-hidden="true"
              />
              {error && (
                <p className="faq-ask__err" role="alert">
                  <AlertCircle size={14} /> {error}
                </p>
              )}
              <button type="submit" className="btn btn--primary" disabled={submitting}>
                {submitting ? 'Sending…' : 'Ask Frank'}
              </button>
            </form>
          )}
        </section>
      </main>
    </>
  );
}
