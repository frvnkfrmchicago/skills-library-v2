/* ═══ ADMIN DASHBOARD — Overview stats ═══ */
import { Article, Users, BookOpen, ShoppingBag, Lightning } from '@phosphor-icons/react';
import { getAllPublishedPosts } from '../../content/blog';
import { getMembers } from '../../data/communityData';
import { MODULES } from '../../data/modules';
import { PRODUCTS } from '../../data/products';
import { getDrafts } from '../../data/blogDrafts';
import { getEventCount, EVENTS } from '../../data/analyticsData';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const posts = getAllPublishedPosts();
  const drafts = getDrafts();
  const members = getMembers();
  const blogViews = getEventCount(EVENTS.BLOG_VIEW, 30);
  const courseStarts = getEventCount(EVENTS.COURSE_START, 30);

  const stats = [
    { label: 'Published Posts', value: posts.length, icon: Article, color: 'var(--color-brand-primary)' },
    { label: 'Drafts', value: drafts.length, icon: Article, color: 'var(--color-warning)' },
    { label: 'Members', value: members.length, icon: Users, color: 'var(--color-brand-secondary, #7B61FF)' },
    { label: 'Course Modules', value: MODULES.length, icon: BookOpen, color: 'var(--color-success)' },
    { label: 'Products', value: PRODUCTS.length, icon: ShoppingBag, color: 'var(--color-brand-primary)' },
    { label: 'Blog Views (30d)', value: blogViews, icon: Lightning, color: 'var(--color-warning)' },
    { label: 'Course Starts (30d)', value: courseStarts, icon: Lightning, color: 'var(--color-success)' },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, marginBottom: 'var(--space-xl)' }}>
        Dashboard
      </h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 14rem), 1fr))',
        gap: 'var(--space-md)',
        marginBottom: 'var(--space-2xl)',
      }}>
        {stats.map((s) => (
          <div key={s.label} className="liquid-glass" style={{
            padding: 'var(--space-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-md)',
          }}>
            <div style={{
              width: '2.75rem',
              height: '2.75rem',
              borderRadius: 'var(--radius-md)',
              background: `${s.color}18`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: s.color,
              flexShrink: 0,
            }}>
              <s.icon size={22} weight="duotone" />
            </div>
            <div>
              <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, lineHeight: 1, color: 'var(--color-text-primary)' }}>
                {s.value}
              </p>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: '0.125rem' }}>
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>Quick Actions</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 18rem), 1fr))',
        gap: 'var(--space-md)',
      }}>
        <Link to="/admin/blog/new" className="liquid-glass" style={{
          padding: 'var(--space-lg)',
          textDecoration: 'none',
          color: 'inherit',
          display: 'block',
        }}>
          <h3 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Write a Blog Post</h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Open the editor and start writing</p>
        </Link>

        <Link to="/admin/members" className="liquid-glass" style={{
          padding: 'var(--space-lg)',
          textDecoration: 'none',
          color: 'inherit',
          display: 'block',
        }}>
          <h3 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Manage Members</h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>View, suspend, or promote members</p>
        </Link>

        <Link to="/admin/courses" className="liquid-glass" style={{
          padding: 'var(--space-lg)',
          textDecoration: 'none',
          color: 'inherit',
          display: 'block',
        }}>
          <h3 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Learning Paths</h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Track student progress across courses</p>
        </Link>

        <Link to="/admin/analytics" className="liquid-glass" style={{
          padding: 'var(--space-lg)',
          textDecoration: 'none',
          color: 'inherit',
          display: 'block',
        }}>
          <h3 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>View Analytics</h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Blog, course, and product engagement data</p>
        </Link>
      </div>
    </div>
  );
}
