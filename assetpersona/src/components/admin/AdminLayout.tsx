/* ═══ ADMIN LAYOUT — Sidebar + Outlet ═══ */
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  ChartBar, FileText, Users, BookOpen, ShoppingBag,
  CalendarBlank, Lightning, ArrowLeft, EnvelopeSimple, Brain, Pulse, MagnifyingGlass,
  ShieldCheck, Question, Megaphone, CellSignalFull,
} from '@phosphor-icons/react';
import './AdminLayout.css';

const NAV_ITEMS = [
  { to: '/admin', icon: ChartBar, label: 'Dashboard', end: true },
  { to: '/admin/inquiries', icon: EnvelopeSimple, label: 'Inquiries', end: false },
  { to: '/admin/moderation', icon: ShieldCheck, label: 'Moderation', end: false },
  { to: '/admin/faq', icon: Question, label: 'FAQs', end: false },
  { to: '/admin/modules', icon: Brain, label: 'Modules', end: false },
  { to: '/admin/content-hub', icon: Megaphone, label: 'Content Hub', end: false },
  /* AP-ENGAGEMENT-LOOP-2026-05 · Lane 7 — multi-platform broadcasts monitor */
  { to: '/admin/content-hub/broadcasts', icon: Megaphone, label: 'Broadcasts', end: false },
  /* Feed Intel — Threads For You feed monitor */
  { to: '/admin/feed-intel', icon: CellSignalFull, label: 'Feed Intel', end: false },
  { to: '/admin/strategy', icon: Brain, label: 'Strategy & Voice', end: false },
  { to: '/admin/velocity', icon: Pulse, label: 'Velocity', end: false },
  { to: '/admin/learners', icon: MagnifyingGlass, label: 'Learners', end: false },
  { to: '/admin/blog', icon: FileText, label: 'Content Studio', end: false },
  { to: '/admin/events', icon: CalendarBlank, label: 'Events', end: false },
  { to: '/admin/members', icon: Users, label: 'Members', end: false },
  { to: '/admin/courses', icon: BookOpen, label: 'Courses', end: false },
  { to: '/admin/products', icon: ShoppingBag, label: 'Products', end: false },
  { to: '/admin/analytics', icon: Lightning, label: 'Analytics', end: false },
];

export default function AdminLayout() {
  const navigate = useNavigate();

  return (
    <div className="admin-layout">
      <div className="admin-layout__mobile-notice" role="status" aria-live="polite">
        <strong>Admin tools are designed for desktop.</strong>
        <span> Some features may not work well on mobile.</span>
      </div>
      <aside className="admin-layout__sidebar">
        <div className="admin-layout__brand">
          <button className="admin-layout__back" onClick={() => navigate('/')}>
            <ArrowLeft size={16} /> Back to Site
          </button>
          <h2 className="admin-layout__title">Command Center</h2>
        </div>

        <nav className="admin-layout__nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `admin-layout__link ${isActive ? 'admin-layout__link--active' : ''}`
              }
            >
              <item.icon size={20} weight="duotone" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="admin-layout__content">
        <Outlet />
      </main>
    </div>
  );
}
