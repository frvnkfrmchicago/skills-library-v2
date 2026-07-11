/* ═══ MobileTabBar — bottom thumb-reach nav for /community/* ═══
 *
 * Per pattern-referencing IAAA against Duolingo + Brilliant + Mobbin edtech:
 *   - 4 tabs (sweet spot per Apple HIG / Material)
 *   - Bottom-anchored, safe-area-aware, mobile-only (hidden ≥ 768px)
 *   - Active state visible at a glance
 *   - 44pt touch targets minimum
 *
 * Mounts only on /community routes. Doesn't replace the desktop top nav.
 */
import { NavLink, useLocation } from 'react-router-dom';
import { House, BookOpen, GraduationCap, User } from '@phosphor-icons/react';
import './MobileTabBar.css';

interface TabDef {
  to: string;
  label: string;
  icon: typeof House;
  exact?: boolean;
}

const TABS: TabDef[] = [
  { to: '/community', label: 'Feed', icon: House, exact: true },
  { to: '/community/learn', label: 'Learn', icon: BookOpen },
  { to: '/community/classroom', label: 'Study Hall', icon: GraduationCap },
  { to: '/community/profile/me', label: 'You', icon: User },
];

export default function MobileTabBar() {
  const { pathname } = useLocation();
  if (!pathname.startsWith('/community')) return null;

  return (
    <nav className="ap-tabbar" aria-label="Community sections">
      <ul>
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <li key={t.to}>
              <NavLink
                to={t.to}
                end={t.exact}
                className={({ isActive }) =>
                  `ap-tabbar__link ${isActive ? 'is-active' : ''}`
                }
              >
                <Icon size={22} weight="duotone" />
                <span>{t.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
