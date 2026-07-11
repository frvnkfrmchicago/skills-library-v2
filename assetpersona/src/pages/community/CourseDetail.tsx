import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Circle, PlayCircle, BookOpen } from '@phosphor-icons/react';
import { getCourses, getLessons } from '../../data/communityData';
import { useState } from 'react';
import './CourseDetail.css';

export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const courses = getCourses();
  const allLessons = getLessons();
  const course = courses.find((c) => c.id === courseId);
  const lessons = allLessons.filter((l) => l.course_id === courseId);
  const [activeLesson, setActiveLesson] = useState(lessons[0] ?? null);

  /* AP-LAUNCH-READY-2026-05 · Lane 5 · Engagement Closure
     Courses are descoped from this launch. Show an honest message instead of a
     blank shell when no course matches (the classroom nav is hidden for
     public visitors but a saved link could still land here). */
  if (!course) {
    return (
      <div className="course-detail">
        <Link to="/community" className="course-detail__back">
          <ArrowLeft size={20} /> Back to the community
        </Link>
        <div className="community-card" style={{ textAlign: 'center', padding: 'var(--space-2xl) var(--space-lg)' }}>
          <BookOpen size={48} weight="duotone" style={{ color: 'var(--color-brand-primary)' }} />
          <h2 style={{ marginTop: 'var(--space-md)' }}>Courses are coming soon.</h2>
          <p style={{ marginTop: 'var(--space-sm)', color: 'var(--color-text-secondary)', maxWidth: '44ch', margin: '0 auto' }}>
            Structured tracks land in a future wave. Until then, the feed and live sessions are where the action is.
          </p>
        </div>
      </div>
    );
  }

  const sections = [...new Set(lessons.map((l) => l.section))];

  return (
    <div className="course-detail">
      <Link to="/community/classroom" className="course-detail__back"><ArrowLeft size={20} /> Back to Classroom</Link>
      <h1 className="course-detail__title">{course.title}</h1>
      <p className="course-detail__desc">{course.description}</p>

      {lessons.length === 0 && (
        <div className="community-card feed__empty" style={{ marginTop: '16px' }}>
          <h3>No lessons yet</h3>
          <p>This course doesn't have any lessons yet.</p>
        </div>
      )}

      {lessons.length > 0 && (
        <div className="course-detail__layout">
          <aside className="course-detail__sidebar">
            {sections.map((section) => (
              <div key={section} className="course-detail__section">
                <h3 className="course-detail__section-title">{section}</h3>
                {lessons.filter((l) => l.section === section).map((lesson) => (
                  <button
                    key={lesson.id}
                    className={`course-detail__lesson ${activeLesson?.id === lesson.id ? 'course-detail__lesson--active' : ''}`}
                    onClick={() => setActiveLesson(lesson)}
                  >
                    {lesson.completed ? <CheckCircle size={18} weight="fill" className="course-detail__check" /> : <Circle size={18} />}
                    {lesson.title}
                  </button>
                ))}
              </div>
            ))}
          </aside>

          {activeLesson && (
            <div className="course-detail__main">
              <div className="course-detail__video">
                <PlayCircle size={64} weight="duotone" />
                <p>Video player</p>
              </div>
              <h2 className="course-detail__lesson-title">{activeLesson.title}</h2>
              <p className="course-detail__lesson-desc">{activeLesson.description}</p>
              {activeLesson.action_items.length > 0 && (
                <div className="course-detail__actions">
                  <h3>Action Items</h3>
                  <ul>{activeLesson.action_items.map((item, i) => <li key={i}>{item}</li>)}</ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
