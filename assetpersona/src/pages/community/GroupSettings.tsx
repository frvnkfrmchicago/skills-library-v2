import { useState } from 'react';
import { LEVELS, addCourse, getCourses } from '../../data/communityData';
import type { Level, Course } from '../../types/supabase';
import { Plus, FloppyDisk, Gear, Users, Trophy } from '@phosphor-icons/react';
import './GroupSettings.css';

type SettingsTab = 'general' | 'members' | 'levels' | 'courses';

export default function GroupSettings() {
  const [tab, setTab] = useState<SettingsTab>('general');
  const [levels, setLevels] = useState<Level[]>(LEVELS);
  const [courses, setCourses] = useState<Course[]>(() => getCourses());

  /* ── Course creation state ── */
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [courseAccess, setCourseAccess] = useState<'open' | 'level' | 'private'>('open');
  const [courseAccessLevel, setCourseAccessLevel] = useState(2);

  function handleCreateCourse() {
    if (!courseTitle.trim()) return;
    const newCourse: Course = {
      id: crypto.randomUUID(),
      title: courseTitle.trim(),
      description: courseDesc.trim() || null,
      thumbnail_url: null,
      lesson_count: 0,
      created_at: new Date().toISOString(),
      completion_pct: 0,
    };
    const updated = addCourse(newCourse);
    setCourses(updated);
    setCourseTitle('');
    setCourseDesc('');
    setShowCourseForm(false);
  }

  const TAB_CONFIG: { key: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { key: 'general', label: 'General', icon: <Gear size={18} /> },
    { key: 'members', label: 'Members', icon: <Users size={18} /> },
    { key: 'levels', label: 'Levels', icon: <Trophy size={18} /> },
    { key: 'courses', label: 'Courses', icon: <FloppyDisk size={18} /> },
  ];

  return (
    <div className="gsettings">
      <div className="community-page-header">
        <h1>Admin Settings</h1>
        <p>Manage your community</p>
      </div>

      <div className="gsettings__layout">
        {/* Sidebar */}
        <aside className="gsettings__sidebar">
          {TAB_CONFIG.map(({ key, label, icon }) => (
            <button
              key={key}
              className={`gsettings__tab ${tab === key ? 'gsettings__tab--active' : ''}`}
              onClick={() => setTab(key)}
            >
              {icon} {label}
            </button>
          ))}
        </aside>

        {/* Content */}
        <div className="gsettings__content">
          {tab === 'general' && (
            <div className="community-card gsettings__panel">
              <h3>General</h3>
              <label className="gsettings__field">
                <span>Community Name</span>
                <input type="text" defaultValue="Asset Persona" />
              </label>
              <label className="gsettings__field">
                <span>Description</span>
                <textarea rows={3} defaultValue="AI Community ,  Build, Learn, Ship." />
              </label>
              <button className="btn btn--primary btn--sm"><FloppyDisk size={16} /> Save</button>
            </div>
          )}

          {tab === 'members' && (
            <div className="community-card gsettings__panel">
              <h3>Member Management</h3>
              <p className="gsettings__help">
                Member invites, role assignment, and removals will connect to Supabase when configured.
              </p>
              <label className="gsettings__field">
                <span>Invite by Email</span>
                <input type="email" placeholder="someone@example.com" />
              </label>
              <button className="btn btn--primary btn--sm">Send Invite</button>
            </div>
          )}

          {tab === 'levels' && (
            <div className="community-card gsettings__panel">
              <h3>Levels Configuration</h3>
              <div className="gsettings__levels">
                {levels.map((lvl) => (
                  <div key={lvl.level} className="gsettings__level-row">
                    <span className="gsettings__level-num">Lvl {lvl.level}</span>
                    <input
                      type="text"
                      value={lvl.name}
                      onChange={(e) => {
                        setLevels(
                          levels.map((l) =>
                            l.level === lvl.level ? { ...l, name: e.target.value } : l
                          )
                        );
                      }}
                    />
                    <input
                      type="number"
                      value={lvl.points_required}
                      onChange={(e) => {
                        setLevels(
                          levels.map((l) =>
                            l.level === lvl.level
                              ? { ...l, points_required: Number(e.target.value) }
                              : l
                          )
                        );
                      }}
                      className="gsettings__points-input"
                    />
                    <span className="gsettings__pts-label">pts</span>
                  </div>
                ))}
              </div>
              <button className="btn btn--primary btn--sm"><FloppyDisk size={16} /> Save Levels</button>
            </div>
          )}

          {/* ── COURSES TAB ,  Skool-style content creation ── */}
          {tab === 'courses' && (
            <div className="community-card gsettings__panel">
              <div className="gsettings__panel-header">
                <h3>Courses</h3>
                <button className="btn btn--primary btn--sm" onClick={() => setShowCourseForm(true)}>
                  <Plus size={16} weight="bold" /> New Course
                </button>
              </div>

              {showCourseForm && (
                <div className="gsettings__course-form">
                  <label className="gsettings__field">
                    <span>Course Name</span>
                    <input
                      type="text"
                      placeholder="e.g. AI Fundamentals"
                      value={courseTitle}
                      onChange={(e) => setCourseTitle(e.target.value)}
                      autoFocus
                    />
                  </label>
                  <label className="gsettings__field">
                    <span>Description</span>
                    <textarea
                      rows={3}
                      placeholder="What will members learn?"
                      value={courseDesc}
                      onChange={(e) => setCourseDesc(e.target.value)}
                    />
                  </label>
                  <label className="gsettings__field">
                    <span>Access</span>
                    <select value={courseAccess} onChange={(e) => setCourseAccess(e.target.value as 'open' | 'level' | 'private')}>
                      <option value="open">Open ,  All members</option>
                      <option value="level">Level Unlock</option>
                      <option value="private">Private ,  Invite only</option>
                    </select>
                  </label>
                  {courseAccess === 'level' && (
                    <label className="gsettings__field">
                      <span>Required Level</span>
                      <select value={courseAccessLevel} onChange={(e) => setCourseAccessLevel(Number(e.target.value))}>
                        {LEVELS.map((l) => (
                          <option key={l.level} value={l.level}>Level {l.level} ,  {l.name}</option>
                        ))}
                      </select>
                    </label>
                  )}
                  <div className="gsettings__form-actions">
                    <button className="btn btn--primary btn--sm" onClick={handleCreateCourse} disabled={!courseTitle.trim()}>
                      <FloppyDisk size={16} /> Create Course
                    </button>
                    <button className="btn btn--ghost btn--sm" onClick={() => setShowCourseForm(false)}>Cancel</button>
                  </div>
                </div>
              )}

              {/* Existing courses list */}
              {courses.length === 0 && !showCourseForm && (
                <p className="gsettings__help">No courses yet. Click "+ New Course" to create one.</p>
              )}

              {courses.length > 0 && (
                <div className="gsettings__course-list">
                  {courses.map((course) => (
                    <div key={course.id} className="gsettings__course-item">
                      <div>
                        <h4>{course.title}</h4>
                        <p>{course.description || 'No description'}</p>
                        <span className="gsettings__course-meta">{course.lesson_count} lessons</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
