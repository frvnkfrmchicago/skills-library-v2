import { Suspense, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  ChatCircle, ChatsCircle, GearSix, SignOut, CalendarBlank, UsersThree,
  GraduationCap, Briefcase, GameController, Cpu, TerminalWindow, Compass, List,
} from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/useAuth';
import { getMembers } from '../../data/communityData';
import { usePresence } from '../../data/presence';
import './community.css';

/* AP-STUDYHALL-REBUILD-2026-06 · Lane 6 — sidebar information architecture.
 * One simple loop a beginner reads at a glance:
 *   LEARN (Classroom) -> DISCUSS (Forum + Chat) -> BUILD (Upgrade.Self)
 *   -> SHOW (Showcase) -> SHIP (Deploy).
 * Three groups, one click to any core feature (Skool-simple). The old
 * Inbox/DM item is gone: direct messages were removed on purpose
 * (see communityData.ts DIRECT MESSAGES note). */
interface NavItem {
  to: string;
  icon: typeof ChatCircle;
  label: string;
  end?: boolean;
}

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Community',
    items: [
      { to: '/community', icon: ChatCircle, label: 'Forum', end: true },
      { to: '/community/chat', icon: ChatsCircle, label: 'Chat' },
      { to: '/community/events', icon: CalendarBlank, label: 'Events' },
      { to: '/community/members', icon: UsersThree, label: 'Members' },
    ],
  },
  {
    label: 'Learn',
    items: [
      { to: '/community/classroom', icon: GraduationCap, label: 'Classroom' },
      { to: '/community/upgrade-self', icon: TerminalWindow, label: 'Build' },
      { to: '/community/arcade', icon: GameController, label: 'Arcade' },
    ],
  },
  {
    label: 'You',
    items: [
      { to: '/community/portfolio', icon: Briefcase, label: 'Showcase' },
      { to: '/community/start', icon: Compass, label: 'Start Here' },
    ],
  },
];

function NavRow({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) => `community__nav-link ${isActive ? 'community__nav-link--active' : ''}`}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.div
              layoutId="activeSidebarPill"
              className="community__nav-active-indicator"
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            />
          )}
          <item.icon size={20} weight="duotone" style={{ position: 'relative', zIndex: 2 }} />
          <span className="community__nav-link-label">{item.label}</span>
        </>
      )}
    </NavLink>
  );
}

export default function CommunityLayout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const members = getMembers();
  const { onlineCount } = usePresence('community-presence');
  const [drawerOpen, setDrawerOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <div className="community">
      {/* Mobile top bar */}
      <header className="community__topbar">
        <button
          className="community__topbar-btn"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
        >
          <List size={22} />
        </button>
        <span className="community__topbar-title">Agentic Study Hall</span>
      </header>

      {/* Scrim behind the mobile drawer */}
      <div
        className={`community__scrim ${drawerOpen ? 'is-visible' : ''}`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      <aside className={`community__sidebar ${drawerOpen ? 'is-open' : ''}`}>
        <div className="community__brand">
          <div className="community__brand-avatar">
            <Cpu size={22} weight="fill" />
          </div>
          <div>
            <h2 className="community__brand-name">Asset Persona</h2>
            <p className="community__brand-sub">Agentic Study Hall</p>
          </div>
        </div>

        <div className="community__stats">
          <div className="community__stat">
            <span className="community__stat-value">{members.length}</span>
            <span className="community__stat-label">Members</span>
          </div>
          <div className="community__stat">
            <span className="community__stat-value community__stat-value--online">{onlineCount}</span>
            <span className="community__stat-label">Online</span>
          </div>
        </div>

        <nav className="community__nav">
          {NAV_GROUPS.map((group) => (
            <div className="community__nav-group" key={group.label}>
              <span className="community__nav-group-label">{group.label}</span>
              {group.items.map((item) => (
                <NavRow key={item.to} item={item} onNavigate={closeDrawer} />
              ))}
            </div>
          ))}
        </nav>

        {profile?.role === 'admin' && (
          <NavLink
            to="/community/settings"
            onClick={closeDrawer}
            className={({ isActive }) => `community__nav-link community__nav-link--admin ${isActive ? 'community__nav-link--active' : ''}`}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarPill"
                    className="community__nav-active-indicator"
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  />
                )}
                <GearSix size={20} weight="duotone" style={{ position: 'relative', zIndex: 2 }} />
                <span className="community__nav-link-label">Group Settings</span>
              </>
            )}
          </NavLink>
        )}

        {profile?.role === 'admin' && (
          <div className="community__creator-center">
            <div className="community__creator-center-header">
              <Cpu size={16} weight="duotone" />
              <span>Creator Center</span>
            </div>
            <div className="community__creator-links">
              <NavLink to="/admin/modules" className="community__creator-link" onClick={closeDrawer}>
                Manage Modules
              </NavLink>
              <NavLink to="/admin/modules/new" className="community__creator-link" onClick={closeDrawer}>
                Create Module
              </NavLink>
              <NavLink to="/admin/modules/queue" className="community__creator-link" onClick={closeDrawer}>
                Publish Queue
              </NavLink>
            </div>
          </div>
        )}

        <div className="community__user">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.display_name} className="community__user-avatar" />
          ) : (
            <div className="community__user-avatar">{profile?.display_name?.charAt(0) ?? '?'}</div>
          )}
          <div className="community__user-info">
            <span className="community__user-name">{profile?.display_name}</span>
            <span className="community__user-level">Level {profile?.level}</span>
          </div>
          <NavLink to="/community/user-settings" className="community__settings-btn" title="Settings" onClick={closeDrawer}>
            <GearSix size={18} />
          </NavLink>
          <button className="community__signout" onClick={handleSignOut} title="Sign out">
            <SignOut size={18} />
          </button>
        </div>
      </aside>

      <main className="community__content">
        <Suspense fallback={
          <div className="community__sub-loader">
            <div className="community__sub-loader-spinner" />
          </div>
        }>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
