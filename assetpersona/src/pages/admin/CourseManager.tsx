/* ═══ COURSE MANAGER — Admin learning path overview ═══ */
import { MODULES, TRACK_LABELS } from '../../data/modules';
import { getCourses } from '../../data/communityData';
import { getAllProgress, getCourseStarters } from '../../data/progressData';

export default function CourseManager() {
  const communityCoursesRaw = getCourses();
  const allProgress = getAllProgress();

  // Combine module-based courses and community-created courses
  const moduleStats = MODULES.map((mod) => {
    const starters = getCourseStarters(mod.id);
    const totalLessons = mod.lessons.length;
    const completers = starters.filter((userId) => {
      const completed = allProgress.filter((p) => p.userId === userId && p.courseId === mod.id).length;
      return completed >= totalLessons;
    });

    return {
      id: mod.id,
      title: mod.title,
      track: TRACK_LABELS[mod.track],
      tier: mod.tier,
      lessons: totalLessons,
      starters: starters.length,
      completers: completers.length,
      completionRate: starters.length > 0 ? Math.round((completers.length / starters.length) * 100) : 0,
    };
  });

  return (
    <div>
      <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, marginBottom: 'var(--space-sm)' }}>
        Courses & Learning Paths
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-xl)' }}>
        Track student engagement and progress across all course modules.
      </p>

      {/* Module courses */}
      <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
        Agentic Study Hall Modules ({MODULES.length})
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginBottom: 'var(--space-2xl)' }}>
        {moduleStats.map((s) => (
          <div key={s.id} className="liquid-glass" style={{
            padding: 'var(--space-md) var(--space-lg)',
            display: 'flex', alignItems: 'center', gap: 'var(--space-lg)', flexWrap: 'wrap',
          }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h3 style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>{s.title}</h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginTop: '0.125rem' }}>
                {s.track} · {s.lessons} lessons · {s.tier}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-lg)', textAlign: 'center', flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>{s.starters}</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>Started</p>
              </div>
              <div>
                <p style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-success)' }}>{s.completers}</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>Completed</p>
              </div>
              <div>
                <p style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>{s.completionRate}%</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>Rate</p>
              </div>
            </div>

            {/* Tier badge */}
            <span style={{
              padding: '0.1875rem 0.625rem', borderRadius: 'var(--radius-full)',
              fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase',
              background: s.tier === 'free' ? 'rgba(52,211,153,0.12)' : 'rgba(255,138,102,0.12)',
              color: s.tier === 'free' ? 'var(--color-success)' : 'var(--color-brand-primary)',
            }}>
              {s.tier}
            </span>
          </div>
        ))}
      </div>

      {/* Community courses */}
      <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
        Community Courses ({communityCoursesRaw.length})
      </h2>

      {communityCoursesRaw.length === 0 ? (
        <div className="liquid-glass" style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          No community courses created yet. Create courses from Community → Settings → Courses.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {communityCoursesRaw.map((c) => (
            <div key={c.id} className="liquid-glass" style={{
              padding: 'var(--space-md) var(--space-lg)',
            }}>
              <h3 style={{ fontWeight: 700 }}>{c.title}</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                {c.description || 'No description'} · {c.lesson_count} lessons
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
