/* ═══ ModeratorGuard — admin OR moderator passes ═══
 * Wraps admin-style routes that mods should also be able to use
 * (specifically: /admin/moderation). Bypass admin-role passes through.
 */
import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../../context/useAuth';

interface Props { children: ReactNode }

export default function ModeratorGuard({ children }: Props) {
  const { profile, loading, isBypass, bypassRole } = useAuth();

  if (loading) {
    return (
      <div className="guard-loading">
        <div className="guard-loading__spinner" />
      </div>
    );
  }

  if (isBypass && bypassRole === 'admin') {
    // Bypass admins pass; bypass members + guests are blocked from moderation.
    return <>{children}</>;
  }

  const role = profile?.role;
  if (role === 'admin' || role === 'moderator') return <>{children}</>;

  return <Navigate to="/community" replace />;
}
