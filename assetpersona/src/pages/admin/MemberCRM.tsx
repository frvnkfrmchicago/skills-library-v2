/* ═══ MEMBER CRM — Admin member management ═══ */
import { useState } from 'react';
import {
  getMembers,
  removeMember,
  suspendMember,
  reactivateMember,
  updateMemberRole,
  getLevelName,
} from '../../data/communityData';
import type { Profile } from '../../types/supabase';
import { MagnifyingGlass, Trash, ShieldCheck, ShieldSlash } from '@phosphor-icons/react';

export default function MemberCRM() {
  const [members, setMembers] = useState<Profile[]>(() => getMembers());
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | Profile['role']>('all');

  const filtered = members.filter((m) => {
    const matchesSearch = m.display_name.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  function refresh() {
    setMembers(getMembers());
  }

  function handleRemove(id: string, name: string) {
    if (!confirm(`Remove ${name} from the community? This will also delete their posts and comments.`)) return;
    removeMember(id);
    refresh();
  }

  function handleSuspend(id: string) {
    suspendMember(id);
    refresh();
  }

  function handleReactivate(id: string) {
    reactivateMember(id);
    refresh();
  }

  function handleRoleChange(id: string, role: Profile['role']) {
    updateMemberRole(id, role);
    refresh();
  }

  return (
    <div>
      <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, marginBottom: 'var(--space-lg)' }}>
        Members ({members.length})
      </h1>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)', flexWrap: 'wrap' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
          padding: '0.5rem 0.75rem', background: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', flex: 1, minWidth: '200px',
        }}>
          <MagnifyingGlass size={16} style={{ color: 'var(--color-text-tertiary)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members..."
            style={{
              border: 'none', outline: 'none', background: 'transparent',
              color: 'var(--color-text-primary)', flex: 1, fontSize: 'var(--text-sm)',
            }}
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
          style={{
            padding: '0.5rem 0.75rem', background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
            color: 'var(--color-text-primary)', fontSize: 'var(--text-sm)',
          }}
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="moderator">Moderator</option>
          <option value="member">Member</option>
        </select>
      </div>

      {/* Member list */}
      {filtered.length === 0 ? (
        <div className="liquid-glass" style={{ padding: 'var(--space-2xl)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          {members.length === 0
            ? 'No members yet. Members appear here as people join the community.'
            : 'No members match your search.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {filtered.map((m) => (
            <div key={m.id} className="liquid-glass" style={{
              padding: 'var(--space-md) var(--space-lg)',
              display: 'flex', alignItems: 'center', gap: 'var(--space-md)', flexWrap: 'wrap',
            }}>
              {/* Avatar */}
              {m.avatar_url ? (
                <img src={m.avatar_url} alt={m.display_name}
                  style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{
                  width: '2.5rem', height: '2.5rem', borderRadius: '50%',
                  background: 'var(--color-brand-primary-subtle, rgba(255,138,102,0.15))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, color: 'var(--color-brand-primary)',
                }}>
                  {m.display_name.charAt(0)}
                </div>
              )}

              {/* Info */}
              <div style={{ flex: 1, minWidth: '150px' }}>
                <p style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{m.display_name}</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                  Lvl {m.level} · {getLevelName(m.level)} · {m.points} pts
                  {m.status === 'suspended' && (
                    <span style={{ color: 'var(--color-error, #ef4444)', fontWeight: 700, marginLeft: '0.5rem' }}>
                      SUSPENDED
                    </span>
                  )}
                </p>
              </div>

              {/* Role badge */}
              <span style={{
                padding: '0.1875rem 0.625rem', borderRadius: 'var(--radius-full)',
                fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase',
                background: m.role === 'admin' ? 'rgba(255,138,102,0.15)' : m.role === 'moderator' ? 'rgba(123,97,255,0.15)' : 'rgba(255,255,255,0.06)',
                color: m.role === 'admin' ? 'var(--color-brand-primary)' : m.role === 'moderator' ? 'var(--color-brand-secondary, #7B61FF)' : 'var(--color-text-secondary)',
              }}>
                {m.role}
              </span>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.375rem' }}>
                <select
                  value={m.role}
                  onChange={(e) => handleRoleChange(m.id, e.target.value as Profile['role'])}
                  title="Change role"
                  style={{
                    padding: '0.25rem 0.5rem', fontSize: 'var(--text-xs)',
                    background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)', color: 'var(--color-text-primary)', cursor: 'pointer',
                  }}
                >
                  <option value="member">Member</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>

                {m.status === 'suspended' ? (
                  <button onClick={() => handleReactivate(m.id)} title="Reactivate"
                    style={{
                      padding: '0.25rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem',
                      background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)',
                      borderRadius: 'var(--radius-sm)', color: 'var(--color-success)',
                      fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer',
                    }}>
                    <ShieldCheck size={14} /> Activate
                  </button>
                ) : (
                  <button onClick={() => handleSuspend(m.id)} title="Suspend"
                    style={{
                      padding: '0.25rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem',
                      background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)',
                      borderRadius: 'var(--radius-sm)', color: 'var(--color-warning)',
                      fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer',
                    }}>
                    <ShieldSlash size={14} /> Suspend
                  </button>
                )}

                <button onClick={() => handleRemove(m.id, m.display_name)} title="Remove"
                  style={{
                    padding: '0.25rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem',
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: 'var(--radius-sm)', color: 'var(--color-error, #ef4444)',
                    fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer',
                  }}>
                  <Trash size={14} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
