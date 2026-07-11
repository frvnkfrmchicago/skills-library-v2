import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { useState, type ReactNode } from 'react';
import AuthModal from '../onboarding/AuthModal';

interface GuardProps {
  children: ReactNode;
}

/**
 * Inline auth gate. Renders the protected children only when authenticated.
 * If the visitor is unauthenticated, the page stays mounted (so route context
 * is preserved) and an `AuthModal` overlays the surface. Closing the modal
 * sends the visitor home rather than leaving an unauthenticated user staring
 * at a gated UI shell.
 *
 * Replaces the prior hard redirect to the standalone login page. No more
 * page-level jumps for the most common drop-off in onboarding.
 */
export function AuthGuard({ children }: GuardProps) {
  const { user, loading, isDemo } = useAuth();
  const location = useLocation();
  const [bailed, setBailed] = useState(false);

  // Dev mode: skip auth entirely
  if (import.meta.env.DEV) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="guard-loading">
        <div className="guard-loading__spinner" />
      </div>
    );
  }

  if (!user && !isDemo) {
    if (bailed) {
      return <Navigate to="/" replace />;
    }
    // Mount the modal on top of an inert background. The protected children
    // stay unmounted to avoid leaking data, but the route URL stays intact so
    // post-auth resolution sends the visitor exactly where they tried to go.
    return (
      <>
        <div className="guard-loading" aria-hidden="true" />
        <AuthModal
          open
          onClose={() => setBailed(true)}
          redirectTo={`${location.pathname}${location.search}`}
        />
      </>
    );
  }

  return <>{children}</>;
}

/** Redirects to /community if user is not an admin */
export function AdminGuard({ children }: GuardProps) {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="guard-loading">
        <div className="guard-loading__spinner" />
      </div>
    );
  }

  if (profile?.role !== 'admin') {
    return <Navigate to="/community" replace />;
  }

  return <>{children}</>;
}
