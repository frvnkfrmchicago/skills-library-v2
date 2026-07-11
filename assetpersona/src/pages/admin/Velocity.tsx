/* ═══ ADMIN — Velocity Dashboard ═══
 * Tracks the news → module pipeline. Time-to-publish, drafts/day, accept rate,
 * top reject reasons. Reads from module_drafts_queue + modules.
 */
import { useEffect, useMemo, useState } from 'react';
import { Activity, Sparkles, ThumbsUp, ThumbsDown } from 'lucide-react';
import { listDrafts } from '../../data/learnStore';
import type { ModuleDraftQueueRow } from '../../types/learn';
import './Velocity.css';

interface VelocityStats {
  totalDrafts: number;
  pending: number;
  approved: number;
  rejected: number;
  acceptRate: number;
  draftsLast7Days: number;
  /** minutes from source publish → draft creation; null when no data */
  medianGenLagMin: number | null;
  /** minutes from draft creation → review; null when no data */
  medianReviewLagMin: number | null;
  topRejectReasons: { reason: string; count: number }[];
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function computeStats(rows: ModuleDraftQueueRow[]): VelocityStats {
  const totalDrafts = rows.length;
  const pending = rows.filter((r) => r.status === 'pending').length;
  const approved = rows.filter((r) => r.status === 'approved').length;
  const rejected = rows.filter((r) => r.status === 'rejected').length;
  const reviewedTotal = approved + rejected;
  const acceptRate = reviewedTotal === 0 ? 0 : approved / reviewedTotal;

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const draftsLast7Days = rows.filter(
    (r) => new Date(r.created_at).getTime() >= sevenDaysAgo
  ).length;

  // Generation lag: source_published_at → draft created_at
  const genLags = rows
    .filter((r) => r.source_published_at)
    .map((r) => {
      const a = new Date(r.source_published_at!).getTime();
      const b = new Date(r.created_at).getTime();
      return Math.max(0, (b - a) / 60000);
    });
  const medianGenLagMin = median(genLags);

  // Review lag: draft created_at → reviewed_at
  const reviewLags = rows
    .filter((r) => r.reviewed_at)
    .map((r) => {
      const a = new Date(r.created_at).getTime();
      const b = new Date(r.reviewed_at!).getTime();
      return Math.max(0, (b - a) / 60000);
    });
  const medianReviewLagMin = median(reviewLags);

  // Top reject reasons
  const reasons = new Map<string, number>();
  for (const r of rows) {
    if (r.status === 'rejected' && r.reject_reason?.trim()) {
      const k = r.reject_reason.trim().slice(0, 80);
      reasons.set(k, (reasons.get(k) ?? 0) + 1);
    }
  }
  const topRejectReasons = [...reasons.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([reason, count]) => ({ reason, count }));

  return {
    totalDrafts,
    pending,
    approved,
    rejected,
    acceptRate,
    draftsLast7Days,
    medianGenLagMin,
    medianReviewLagMin,
    topRejectReasons,
  };
}

function fmtMinutes(min: number | null): string {
  if (min == null) return '—';
  if (min < 60) return `${Math.round(min)} min`;
  if (min < 60 * 24) return `${(min / 60).toFixed(1)} hr`;
  return `${(min / 60 / 24).toFixed(1)} days`;
}

export default function VelocityAdminPage() {
  const [rows, setRows] = useState<ModuleDraftQueueRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listDrafts().then((data) => {
      setRows(data);
      setLoading(false);
    });
  }, []);

  const stats = useMemo(() => computeStats(rows), [rows]);

  return (
    <div className="velocity">
      <header className="velocity__head">
        <h1><Activity size={20} /> Velocity</h1>
        <p className="velocity__sub">News → module pipeline health.</p>
      </header>

      {loading ? (
        <p className="velocity__loading">Loading...</p>
      ) : (
        <>
          <section className="velocity__kpis">
            <KpiCard label="Total drafts" value={stats.totalDrafts} icon={<Sparkles size={14} />} />
            <KpiCard label="Last 7 days" value={stats.draftsLast7Days} />
            <KpiCard label="Pending" value={stats.pending} accent="warn" />
            <KpiCard label="Approved" value={stats.approved} accent="ok" icon={<ThumbsUp size={14} />} />
            <KpiCard label="Rejected" value={stats.rejected} accent="danger" icon={<ThumbsDown size={14} />} />
            <KpiCard
              label="Accept rate"
              value={stats.totalDrafts === 0 ? '—' : `${(stats.acceptRate * 100).toFixed(0)}%`}
            />
          </section>

          <section className="velocity__section">
            <h2>Pipeline lag</h2>
            <div className="velocity__lags">
              <div>
                <p className="velocity__lag-label">Median time, news drop → draft generated</p>
                <p className="velocity__lag-value">{fmtMinutes(stats.medianGenLagMin)}</p>
              </div>
              <div>
                <p className="velocity__lag-label">Median time, draft → admin review</p>
                <p className="velocity__lag-value">{fmtMinutes(stats.medianReviewLagMin)}</p>
              </div>
            </div>
          </section>

          <section className="velocity__section">
            <h2>Top reject reasons</h2>
            {stats.topRejectReasons.length === 0 ? (
              <p className="velocity__empty">No rejections yet.</p>
            ) : (
              <ul className="velocity__reasons">
                {stats.topRejectReasons.map((r) => (
                  <li key={r.reason}>
                    <span className="velocity__reason-count">{r.count}×</span>
                    <span>{r.reason}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="velocity__hint">
              Use these to tune the module-gen prompt. The top recurring reason is usually a single
              system-prompt edit away from being eliminated.
            </p>
          </section>
        </>
      )}
    </div>
  );
}

function KpiCard({
  label, value, icon, accent,
}: {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  accent?: 'ok' | 'warn' | 'danger';
}) {
  return (
    <div className={`velocity__kpi velocity__kpi--${accent ?? 'neutral'}`}>
      <p className="velocity__kpi-label">
        {icon} {label}
      </p>
      <p className="velocity__kpi-value">{value}</p>
    </div>
  );
}
