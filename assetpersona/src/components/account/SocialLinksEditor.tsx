/* ═══ SocialLinksEditor — Twitter/LinkedIn/YouTube/Site/etc. ═══
 *
 * Shaped as fixed services + optional "site" free-form. Stored in
 * profiles.social_links jsonb. URL-only — never embeds, never crawls.
 */
import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { isBypassActive } from '../../lib/devBypass';
import './SocialLinksEditor.css';

const SERVICES = [
  { key: 'twitter',  label: 'X / Twitter',  placeholder: 'https://x.com/yourhandle' },
  { key: 'linkedin', label: 'LinkedIn',     placeholder: 'https://linkedin.com/in/yourhandle' },
  { key: 'youtube',  label: 'YouTube',      placeholder: 'https://youtube.com/@yourhandle' },
  { key: 'instagram',label: 'Instagram',    placeholder: 'https://instagram.com/yourhandle' },
  { key: 'github',   label: 'GitHub',       placeholder: 'https://github.com/yourhandle' },
  { key: 'site',     label: 'Personal site',placeholder: 'https://you.example' },
] as const;

type ServiceKey = (typeof SERVICES)[number]['key'];

interface SocialLinksEditorProps {
  onSaved?: () => void;
}

export default function SocialLinksEditor({ onSaved }: SocialLinksEditorProps) {
  const { user, profile, refreshProfile } = useAuth();
  const initial = (profile?.social_links ?? {}) as Record<string, string>;
  const [links, setLinks] = useState<Record<string, string>>(initial);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [error, setError] = useState('');

  // If profile loads after mount (refreshProfile finishes), seed once.
  useEffect(() => {
    if (Object.keys(links).length === 0 && Object.keys(initial).length > 0) {
      setLinks(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.social_links]);

  function update(key: ServiceKey, val: string) {
    setLinks((prev) => ({ ...prev, [key]: val }));
  }

  function remove(key: ServiceKey) {
    setLinks((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  async function persist(key: ServiceKey) {
    setError('');
    const url = (links[key] ?? '').trim();
    // Empty just removes
    const next: Record<string, string> = { ...links };
    if (url === '') delete next[key];
    else if (!/^https?:\/\//i.test(url)) {
      setError(`Use a full URL starting with https:// for ${key}.`);
      return;
    } else next[key] = url;

    if (!user?.id || isBypassActive() || !isSupabaseConfigured) {
      setLinks(next);
      setSavedKey(key);
      setTimeout(() => setSavedKey(null), 1600);
      onSaved?.();
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: e } = await (supabase as any)
      .from('profiles')
      .update({ social_links: next })
      .eq('id', user.id);
    if (e) {
      setError(e.message);
      return;
    }
    setLinks(next);
    setSavedKey(key);
    setTimeout(() => setSavedKey(null), 1600);
    await refreshProfile();
    onSaved?.();
  }

  return (
    <fieldset className="social-links">
      <legend className="social-links__legend">Social links</legend>
      <p className="social-links__hint">Show up on your profile. URLs only — leave blank to hide.</p>

      <ul>
        {SERVICES.map((svc) => {
          const value = links[svc.key] ?? '';
          const hasValue = value.trim().length > 0;
          return (
            <li key={svc.key}>
              <label htmlFor={`social-${svc.key}`}>{svc.label}</label>
              <div className="social-links__row">
                <input
                  id={`social-${svc.key}`}
                  type="url"
                  value={value}
                  placeholder={svc.placeholder}
                  onChange={(e) => update(svc.key, e.target.value)}
                  onBlur={() => persist(svc.key)}
                />
                {hasValue && (
                  <button
                    type="button"
                    className="social-links__remove"
                    onClick={() => {
                      remove(svc.key);
                      void persist(svc.key);
                    }}
                    aria-label={`Remove ${svc.label}`}
                  >
                    <X size={14} />
                  </button>
                )}
                {savedKey === svc.key && <span className="social-links__saved">saved</span>}
              </div>
            </li>
          );
        })}
      </ul>

      {error && (
        <p className="social-links__err" role="alert">{error}</p>
      )}

      <p className="social-links__add-hint">
        <Plus size={12} /> Add a service by pasting its URL above. Save fires on blur.
      </p>
    </fieldset>
  );
}
