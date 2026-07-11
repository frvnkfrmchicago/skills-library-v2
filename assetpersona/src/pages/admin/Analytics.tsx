/* ═══ ANALYTICS DASHBOARD ═══
 * Reads real numbers from `learner_events` + `user_events` via the async
 * helpers in `data/analyticsData.ts`. When Supabase is unconfigured OR
 * dev-bypass is active, the helpers return synthetic-but-labeled data
 * and we render a clear notice so Frank knows the numbers are demo.
 */
import { useEffect, useState } from 'react';
import {
  getSignupCount7dAsync,
  getModuleCompletions7dAsync,
  getDailyActiveUsersAsync,
  getTopContentAsync,
  getEventCountAsync,
  getEventTimelineAsync,
  SERVER_EVENTS,
} from '../../data/analyticsData';
import { getAllPublishedPosts } from '../../content/blog';
import { MODULES } from '../../data/modules';

interface MetricNumber {
  value: number;
  synthetic: boolean;
}
interface MetricList {
  value: { id: string; views: number }[];
  synthetic: boolean;
}
interface MetricTimeline {
  value: { date: string; count: number }[];
  synthetic: boolean;
}
interface MetricDau {
  value: { date: string; users: number }[];
  synthetic: boolean;
}

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [anySynthetic, setAnySynthetic] = useState(false);

  const [signups, setSignups] = useState<MetricNumber>({ value: 0, synthetic: false });
  const [completions, setCompletions] = useState<MetricNumber>({ value: 0, synthetic: false });
  const [postViews, setPostViews] = useState<MetricNumber>({ value: 0, synthetic: false });
  const [moduleViews, setModuleViews] = useState<MetricNumber>({ value: 0, synthetic: false });
  const [inquiries, setInquiries] = useState<MetricNumber>({ value: 0, synthetic: false });

  const [topPosts, setTopPosts] = useState<MetricList>({ value: [], synthetic: false });
  const [topModules, setTopModules] = useState<MetricList>({ value: [], synthetic: false });

  const [postTimeline, setPostTimeline] = useState<MetricTimeline>({ value: [], synthetic: false });
  const [dau, setDau] = useState<MetricDau>({ value: [], synthetic: false });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [
        signupRes,
        completionRes,
        postViewRes,
        moduleViewRes,
        inquiryRes,
        topPostRes,
        topModuleRes,
        timelineRes,
        dauRes,
      ] = await Promise.all([
        getSignupCount7dAsync(7),
        getModuleCompletions7dAsync(7),
        getEventCountAsync(SERVER_EVENTS.POST_VIEW, 30),
        getEventCountAsync(SERVER_EVENTS.MODULE_VIEW, 30),
        getEventCountAsync(SERVER_EVENTS.INQUIRY_SUBMITTED, 30),
        getTopContentAsync('post_view', 5, 30),
        getTopContentAsync('module_view', 5, 30),
        getEventTimelineAsync(SERVER_EVENTS.POST_VIEW, 14),
        getDailyActiveUsersAsync(7),
      ]);
      if (cancelled) return;

      const syntheticAny =
        signupRes.__synthetic ||
        completionRes.__synthetic ||
        postViewRes.__synthetic ||
        moduleViewRes.__synthetic ||
        inquiryRes.__synthetic ||
        topPostRes.__synthetic ||
        topModuleRes.__synthetic ||
        timelineRes.__synthetic ||
        dauRes.__synthetic;

      setSignups({ value: signupRes.value, synthetic: signupRes.__synthetic });
      setCompletions({ value: completionRes.value, synthetic: completionRes.__synthetic });
      setPostViews({ value: postViewRes.value, synthetic: postViewRes.__synthetic });
      setModuleViews({ value: moduleViewRes.value, synthetic: moduleViewRes.__synthetic });
      setInquiries({ value: inquiryRes.value, synthetic: inquiryRes.__synthetic });
      setTopPosts({ value: topPostRes.value, synthetic: topPostRes.__synthetic });
      setTopModules({ value: topModuleRes.value, synthetic: topModuleRes.__synthetic });
      setPostTimeline({ value: timelineRes.value, synthetic: timelineRes.__synthetic });
      setDau({ value: dauRes.value, synthetic: dauRes.__synthetic });
      setAnySynthetic(syntheticAny);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Resolve IDs to human-readable names
  const allPosts = getAllPublishedPosts();
  const postMap = new Map(allPosts.map((p) => [p.slug, p.title]));
  const moduleMap = new Map(MODULES.map((m) => [m.id, m.title]));

  const stats = [
    { label: 'Signups', value: signups.value, sub: 'Last 7 days' },
    { label: 'Module Completions', value: completions.value, sub: 'Last 7 days' },
    { label: 'Blog Views', value: postViews.value, sub: 'Last 30 days' },
    { label: 'Module Views', value: moduleViews.value, sub: 'Last 30 days' },
    { label: 'Inquiries', value: inquiries.value, sub: 'Last 30 days' },
  ];

  return (
    <div>
      {/* Skeleton pulse — scoped to this page so we don't depend on a global keyframe. */}
      <style>{`@keyframes apAnalyticsSkeletonPulse { 0%,100% { opacity: 1 } 50% { opacity: 0.45 } }`}</style>
      <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, marginBottom: 'var(--space-sm)' }}>
        Analytics
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-md)' }}>
        Real numbers from the server-side event log. Updates as visitors interact with the site.
      </p>

      {anySynthetic && (
        <div
          role="status"
          className="liquid-glass"
          style={{
            padding: 'var(--space-md)',
            marginBottom: 'var(--space-xl)',
            borderLeft: '3px solid var(--color-warning)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
          }}
        >
          <strong style={{ color: 'var(--color-text-primary)' }}>Demo data shown.</strong>{' '}
          Configure Supabase (or turn off <code>?dev=…</code> bypass) to see real engagement.
        </div>
      )}

      {/* Stats grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 12rem), 1fr))',
          gap: 'var(--space-md)',
          marginBottom: 'var(--space-2xl)',
        }}
      >
        {stats.map((s) => (
          <div key={s.label} className="liquid-glass" style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>
            {loading ? (
              <StatSkeleton />
            ) : (
              <>
                <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>{s.value}</p>
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {s.label}
                </p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>{s.sub}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Blog views chart */}
      <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
        Blog Views (14 days)
      </h2>
      <div className="liquid-glass" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
        {loading ? (
          <ChartSkeleton />
        ) : postTimeline.value.every((d) => d.count === 0) ? (
          <EmptyState message="No blog views recorded. Views land here as visitors read posts." />
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '80px' }}>
            {(() => {
              const max = Math.max(...postTimeline.value.map((x) => x.count), 1);
              return postTimeline.value.map((d) => {
                const height = Math.max(2, (d.count / max) * 100);
                return (
                  <div
                    key={d.date}
                    style={{
                      flex: 1,
                      height: `${height}%`,
                      borderRadius: '2px 2px 0 0',
                      background: 'var(--color-brand-primary)',
                      opacity: 0.8,
                    }}
                    title={`${d.date}: ${d.count} views`}
                  />
                );
              });
            })()}
          </div>
        )}
      </div>

      {/* Daily Active Users */}
      <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
        Daily Active Users (7 days)
      </h2>
      <div className="liquid-glass" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
        {loading ? (
          <ChartSkeleton />
        ) : dau.value.every((d) => d.users === 0) ? (
          <EmptyState message="No active users recorded. DAU counts distinct signed-in visitors per day." />
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '80px' }}>
            {(() => {
              const max = Math.max(...dau.value.map((x) => x.users), 1);
              return dau.value.map((d) => {
                const height = Math.max(2, (d.users / max) * 100);
                return (
                  <div
                    key={d.date}
                    style={{
                      flex: 1,
                      height: `${height}%`,
                      borderRadius: '2px 2px 0 0',
                      background: 'var(--color-brand-secondary, #7B61FF)',
                      opacity: 0.8,
                    }}
                    title={`${d.date}: ${d.users} active users`}
                  />
                );
              });
            })()}
          </div>
        )}
      </div>

      {/* Top content */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 20rem), 1fr))',
          gap: 'var(--space-lg)',
        }}
      >
        <TopList
          title="Top Blog Posts"
          loading={loading}
          items={topPosts.value}
          nameMap={postMap}
        />
        <TopList
          title="Most Viewed Modules"
          loading={loading}
          items={topModules.value}
          nameMap={moduleMap}
        />
      </div>

      {/* Writing ideas */}
      <div className="liquid-glass" style={{ padding: 'var(--space-lg)', marginTop: 'var(--space-2xl)' }}>
        <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-sm)' }}>Writing Ideas from Your Data</h3>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
          {topModules.value.length > 0
            ? `Your most-viewed module topics could make great blog posts. Consider writing about "${
                moduleMap.get(topModules.value[0]?.id) || 'your top module'
              }" to drive more engagement.`
            : 'Once visitors start engaging with your blog and modules, this section will surface writing ideas based on what your audience clicks most.'}
        </p>
      </div>
    </div>
  );
}

function StatSkeleton() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
      }}
    >
      <div
        style={{
          width: '3rem',
          height: '2rem',
          borderRadius: '0.25rem',
          background: 'var(--color-surface-elevated, rgba(255,255,255,0.06))',
          animation: 'apAnalyticsSkeletonPulse 1.4s ease-in-out infinite',
        }}
      />
      <div
        style={{
          width: '5rem',
          height: '0.75rem',
          borderRadius: '0.25rem',
          background: 'var(--color-surface-elevated, rgba(255,255,255,0.06))',
          animation: 'apAnalyticsSkeletonPulse 1.4s ease-in-out infinite',
        }}
      />
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div
      style={{
        height: '80px',
        borderRadius: '0.25rem',
        background: 'var(--color-surface-elevated, rgba(255,255,255,0.06))',
        animation: 'apAnalyticsSkeletonPulse 1.4s ease-in-out infinite',
      }}
    />
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <p
      style={{
        color: 'var(--color-text-tertiary)',
        textAlign: 'center',
        fontSize: 'var(--text-sm)',
        padding: 'var(--space-md) 0',
      }}
    >
      {message}
    </p>
  );
}

function TopList({
  title,
  loading,
  items,
  nameMap,
}: {
  title: string;
  loading: boolean;
  items: { id: string; views: number }[];
  nameMap: Map<string, string>;
}) {
  return (
    <div className="liquid-glass" style={{ padding: 'var(--space-lg)' }}>
      <h3 style={{ fontWeight: 700, fontSize: 'var(--text-base)', marginBottom: 'var(--space-md)' }}>{title}</h3>
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                height: '1rem',
                borderRadius: '0.25rem',
                background: 'var(--color-surface-elevated, rgba(255,255,255,0.06))',
                animation: 'apAnalyticsSkeletonPulse 1.4s ease-in-out infinite',
              }}
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)' }}>No data yet</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {items.map((item, i) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: 'var(--text-sm)',
              }}
            >
              <span style={{ color: 'var(--color-text-primary)' }}>
                {i + 1}. {nameMap.get(item.id) || item.id}
              </span>
              <span style={{ fontWeight: 700, color: 'var(--color-text-secondary)' }}>{item.views}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
