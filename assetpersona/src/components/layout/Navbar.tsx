import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import NotificationBell from '../community/NotificationBell';
import './Navbar.css';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/talkthrutech', label: 'Talk Thru Tech' },
  { to: '/agenticstudyhall', label: 'Agentic Study Hall' },
  { to: '/shop', label: 'Asset Products' },
  { to: '/blog', label: 'Persona Blog' },
  { to: '/about', label: 'About' },
  { to: '/faq', label: 'FAQ' },
];

const CTA_LINK = { to: '/work', label: 'Work With Frank' };

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // The Agentic Study Hall landing runs a dark aurora hero, so the transparent
  // navbar needs light text there until it scrolls into its light pill.
  const onDark = location.pathname === '/agenticstudyhall';

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''} ${onDark ? 'navbar--on-dark' : ''}`}>
      <div className="navbar__inner container">

        {/* LOGO — blue wordmark, no chip */}
        <Link to="/" className="navbar__logo" aria-label="Asset Persona home">
          <img src="/images/about/logo-blue.webp" alt="Asset Persona" className="navbar__logo-img" width={80} height={80} fetchPriority="high" decoding="async" />
        </Link>

        {/* NAV BAR — colored pill containing all links */}
        <div className="navbar__bar">
          {NAV_LINKS.map(({ to, label }) =>
            to.startsWith('#') ? (
              <a
                key={to}
                href={to}
                className="navbar__link"
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.querySelector(to);
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span className="navbar__link-text">{label}</span>
              </a>
            ) : (
              <Link
                key={to}
                to={to}
                className={`navbar__link ${location.pathname === to ? 'navbar__link--active' : ''}`}
              >
                <span className="navbar__link-text">{label}</span>
              </Link>
            )
          )}
        </div>

        {/* Notification bell — only for signed-in members */}
        {user && <NotificationBell />}

        {/* CTA — outside the bar */}
        <Link to={CTA_LINK.to} className="navbar__cta">
          {CTA_LINK.label}
        </Link>
      </div>
    </nav>
  );
}
