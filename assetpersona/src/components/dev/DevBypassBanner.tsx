import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Zap, X, Cpu } from 'lucide-react';
import {
  getBypassRole,
  setBypassRole,
  type BypassRole,
} from '../../lib/devBypass';
import './DevBypassBanner.css';

/**
 * Floating circular FAB in the bottom right corner.
 * Hidden on '/screens' path.
 * Click opens a compact, elegant glassmorphic floating controller panel.
 */
export default function DevBypassBanner() {
  const location = useLocation();
  const [role, setRole] = useState<BypassRole | null>(getBypassRole());
  const [isOpen, setIsOpen] = useState(false);

  // Re-check on mount + whenever URL changes
  useEffect(() => {
    setRole(getBypassRole());
    const onPop = () => setRole(getBypassRole());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Hide completely on screens page
  if (location.pathname === '/screens' || location.pathname === '/agenticstudyhall/screens') return null;
  if (!role) return null;

  function pick(next: BypassRole | null) {
    setBypassRole(next);
    setRole(next);
    // Hard reload so AuthContext re-derives identity from scratch
    window.location.reload();
  }

  return (
    <div className="dev-bypass-container">
      {/* Floating Control Panel */}
      {isOpen && (
        <div className="dev-bypass-panel" role="region" aria-label="Dev bypass panel">
          <div className="dev-bypass-panel__header">
            <span className="dev-bypass-panel__title">
              <Zap size={14} className="icon-glow" /> DEV CONTROLS
            </span>
            <button
              type="button"
              className="dev-bypass-panel__close"
              onClick={() => setIsOpen(false)}
              aria-label="Close panel"
            >
              <X size={14} />
            </button>
          </div>
          
          <div className="dev-bypass-panel__current">
            Active Bypass: <strong className="glow-role">{role}</strong>
          </div>

          <div className="dev-bypass-panel__actions">
            {(['admin', 'member', 'guest'] as BypassRole[]).map((r) => (
              <button
                key={r}
                type="button"
                className={`dev-role-btn ${role === r ? 'is-active' : ''}`}
                onClick={() => pick(r)}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
            <button
              type="button"
              className="dev-role-btn dev-role-btn--off"
              onClick={() => pick(null)}
            >
              Bypass Off
            </button>
          </div>
        </div>
      )}

      {/* Sleek Circular FAB */}
      <button
        type="button"
        className={`dev-bypass-fab ${isOpen ? 'fab-active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle dev bypass panel"
      >
        {isOpen ? <X size={20} /> : <Cpu size={20} />}
        {!isOpen && <span className="dev-bypass-fab__badge">{role.charAt(0).toUpperCase()}</span>}
      </button>
    </div>
  );
}
