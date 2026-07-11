import { useEffect, useMemo, useState } from 'react';
import { Mail, Filter, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { supabase } from '../../lib/supabase';
import {
  isBypassActive,
  readBypassInquiries,
  updateBypassInquiry,
  type BypassInquiry,
} from '../../lib/devBypass';
import './Inquiries.css';

type Status = 'new' | 'contacted' | 'qualified' | 'won' | 'lost';
const STATUSES: { id: Status; label: string }[] = [
  { id: 'new', label: 'New' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'qualified', label: 'Qualified' },
  { id: 'won', label: 'Won' },
  { id: 'lost', label: 'Lost' },
];

const FORM_TYPES = ['consult', 'speaking', 'training', 'marketing', 'general'] as const;

interface Row {
  id: string;
  form_type: string;
  status: Status;
  name: string;
  email: string;
  company: string | null;
  message: string | null;
  fields: Record<string, string> | null;
  lead_score: number;
  source: string | null;
  created_at: string;
}

function bypassToRow(b: BypassInquiry): Row {
  return {
    id: b.id,
    form_type: b.form_type,
    status: b.status,
    name: b.name,
    email: b.email,
    company: b.company,
    message: b.message,
    fields: b.fields,
    lead_score: b.lead_score,
    source: b.source,
    created_at: b.created_at,
  };
}

export default function InquiriesAdmin() {
  const { isBypass } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      if (isBypassActive()) {
        const local = readBypassInquiries().map(bypassToRow);
        if (!cancelled) {
          setRows(local);
          setLoading(false);
        }
        return;
      }
      // Real DB read — admin RLS in Wave 1 grants this.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);
      if (cancelled) return;
      if (!error && data) setRows(data as Row[]);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [isBypass]);

  const filtered = useMemo(() => {
    if (filter === 'all') return rows;
    return rows.filter((r) => r.form_type === filter);
  }, [rows, filter]);

  const grouped = useMemo(() => {
    const out: Record<Status, Row[]> = {
      new: [],
      contacted: [],
      qualified: [],
      won: [],
      lost: [],
    };
    for (const r of filtered) {
      out[r.status]?.push(r);
    }
    return out;
  }, [filtered]);

  async function setStatus(row: Row, status: Status) {
    if (isBypassActive()) {
      const updated = updateBypassInquiry(row.id, { status });
      if (updated) {
        setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status } : r)));
      }
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('inquiries')
      .update({ status })
      .eq('id', row.id);
    if (!error) {
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status } : r)));
    }
  }

  const replyMailto = (row: Row) => {
    const subject = encodeURIComponent(
      `Re: your ${row.form_type} inquiry — Asset Persona`
    );
    const body = encodeURIComponent(
      `Hi ${row.name.split(' ')[0]},\n\nThanks for reaching out about ${row.form_type}.`
    );
    return `mailto:${row.email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="inquiries">
      <header className="inquiries__header">
        <div>
          <h1>Inquiries</h1>
          <p className="inquiries__sub">
            {rows.length} total {isBypass && <span className="inquiries__badge">dev bypass — local</span>}
          </p>
        </div>

        <div className="inquiries__filter">
          <Filter size={14} />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All form types</option>
            {FORM_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </header>

      {loading ? (
        <p className="inquiries__loading">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="inquiries__empty">
          <p>No inquiries yet.</p>
          {isBypass && (
            <p className="inquiries__empty-sub">
              Submit one of the /work forms in another tab to test — it'll
              appear here without needing the live database.
            </p>
          )}
        </div>
      ) : (
        <div className="inquiries__board">
          {STATUSES.map((col) => (
            <section key={col.id} className="inquiries__column">
              <header className="inquiries__col-head">
                <span>{col.label}</span>
                <span className="inquiries__col-count">{grouped[col.id].length}</span>
              </header>
              <div className="inquiries__col-list">
                {grouped[col.id].map((row) => (
                  <article key={row.id} className="inquiry-card">
                    <header className="inquiry-card__head">
                      <span className="inquiry-card__type">{row.form_type}</span>
                      <span className={`inquiry-card__score score-${scoreBucket(row.lead_score)}`}>
                        {row.lead_score}
                      </span>
                    </header>
                    <h3 className="inquiry-card__name">{row.name}</h3>
                    <p className="inquiry-card__email">{row.email}</p>
                    {row.company && (
                      <p className="inquiry-card__company">{row.company}</p>
                    )}
                    {row.message && (
                      <p className="inquiry-card__msg">{row.message}</p>
                    )}
                    <footer className="inquiry-card__foot">
                      <a
                        href={replyMailto(row)}
                        className="inquiry-card__reply"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Mail size={12} /> Reply
                      </a>
                      <select
                        className="inquiry-card__status"
                        value={row.status}
                        onChange={(e) => setStatus(row, e.target.value as Status)}
                      >
                        {STATUSES.map((s) => (
                          <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                      </select>
                    </footer>
                  </article>
                ))}
                {grouped[col.id].length === 0 && (
                  <p className="inquiries__col-empty">—</p>
                )}
              </div>
            </section>
          ))}
        </div>
      )}

      <div className="inquiries__legend">
        <ExternalLink size={12} />
        <span>
          Score colors: <strong className="score-hot">≥70 hot</strong>{' '}
          · <strong className="score-warm">40-69 warm</strong>{' '}
          · <strong className="score-cold">&lt;40 cold</strong>
        </span>
      </div>
    </div>
  );
}

function scoreBucket(score: number): 'hot' | 'warm' | 'cold' {
  if (score >= 70) return 'hot';
  if (score >= 40) return 'warm';
  return 'cold';
}
