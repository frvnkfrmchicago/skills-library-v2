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
import { AmbientIcon } from '../motion';
import type { AmbientMotion } from '../motion';
import { AuroraField } from '../ui';
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
  /* Which calm idle motion this icon plays. Roles, in plain words:
   *   breathe — slow grow-and-fade (steady places like Forum, Members)
   *   sway    — gentle pendulum tilt (conversation + the Library)
   *   flicker — soft candle jitter (energetic spots like Build, Arcade)
   *   drift   — slow float home (a wayfinding spot like Start Here) */
  motion: AmbientMotion;
}

/* The per-item start delay (in seconds) is the item's index times this step,
 * so icons down the rail are never all in lockstep. A small step keeps the
 * whole rail feeling like one calm place, not a row of separate clocks. */
const STAGGER_STEP = 0.45;

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Community',
    items: [
      { to: '/community', icon: ChatCircle, label: 'Forum', end: true, motion: 'breathe' },
      { to: '/community/chat', icon: ChatsCircle, label: 'Chat', motion: 'sway' },
      { to: '/community/events', icon: CalendarBlank, label: 'Events', motion: 'sway' },
      { to: '/community/members', icon: UsersThree, label: 'Members', motion: 'breathe' },
    ],
  },
  {
    label: 'Learn',
    items: [
      { to: '/community/classroom', icon: GraduationCap, label: 'Library', motion: 'sway' },
      { to: '/community/upgrade-self', icon: TerminalWindow, label: 'Build', motion: 'flicker' },
      { to: '/community/arcade', icon: GameController, label: 'Arcade', motion: 'flicker' },
    ],
  },
  {
    label: 'You',
    items: [
      { to: '/community/portfolio', icon: Briefcase, label: 'Showcase', motion: 'breathe' },
      { to: '/community/start', icon: Compass, label: 'Start Here', motion: 'drift' },
    ],
  },
];

function NavRow({ item, delay, onNavigate }: { item: NavItem; delay: number; onNavigate: () => void }) {
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
          {/* The icon idles with its per-item motion. The active row leads:
              no start delay, the livelier amplitude so it clearly moves, and a
              marker so the CSS can light it. The rest stay calm and stagger by
              their index so the rail never moves in lockstep. */}
          <AmbientIcon
            motion={item.motion}
            amplitude={isActive ? 'lively' : 'calm'}
            delay={isActive ? 0 : delay}
            className={`community__nav-icon ${isActive ? 'community__nav-icon--active' : ''}`}
          >
            <item.icon size={20} weight="duotone" />
          </AmbientIcon>
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
        {/* Real depth behind the rail: a slow, single-tone coral wash drifting
            in place, so the toolbar reads as a living surface and not a flat
            panel. Soft so the controls on top stay legible. It is decorative
            (aria-hidden) and ignores clicks. */}
        <AuroraField intensity="soft" tone="coral" className="community__atmosphere" />

        <div className="community__brand">
          <div className="community__brand-avatar">
            <AmbientIcon motion="breathe" amplitude="lively">
              <Cpu size={22} weight="fill" />
            </AmbientIcon>
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
          {(() => {
            // One running index across every group so the start delays flow
            // smoothly down the whole rail instead of resetting per group.
            let row = 0;
            return NAV_GROUPS.map((group) => (
              <div className="community__nav-group" key={group.label}>
                <span className="community__nav-group-label">{group.label}</span>
                {group.items.map((item) => {
                  const delay = (row++ % 6) * STAGGER_STEP;
                  return (
                    <NavRow key={item.to} item={item} delay={delay} onNavigate={closeDrawer} />
                  );
                })}
              </div>
            ));
          })()}
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
                <AmbientIcon
                  motion="breathe"
                  className={`community__nav-icon ${isActive ? 'community__nav-icon--active' : ''}`}
                >
                  <GearSix size={20} weight="duotone" />
                </AmbientIcon>
                <span className="community__nav-link-label">Group Settings</span>
              </>
            )}
          </NavLink>
        )}

        {profile?.role === 'admin' && (
          <div className="community__creator-center">
            <div className="community__creator-center-header">
              <AmbientIcon motion="flicker">
                <Cpu size={16} weight="duotone" />
              </AmbientIcon>
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
