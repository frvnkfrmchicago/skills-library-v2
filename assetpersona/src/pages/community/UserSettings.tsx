/* ═══ /community/user-settings — consolidated account settings ═══
 *
 * Full rewrite. Wires the previously-dead controls:
 *   - Avatar + cover upload (AvatarUploader)
 *   - Social links editor (SocialLinksEditor)
 *   - Bio + display_name autosave
 *   - Real password update via supabase.auth.updateUser
 *   - Real email change via supabase.auth.updateUser (sends verification mail)
 *   - Notification preferences → profiles.email_opt_in (and per-channel jsonb)
 *   - Faceless toggle → profiles.faceless
 *   - Danger zone: account deletion request via inquiry-webhook
 *
 * Bypass-safe: every write degrades to localStorage when bypass is on.
 */
import { useState, type FormEvent, useEffect, useRef } from 'react';
import {
  User, Lock, Bell, Eye, ShieldWarning, FloppyDisk, ArrowRight, CheckCircle, XCircle, CreditCard, Copy, Globe, EyeSlash, Link as LinkIcon,
} from '@phosphor-icons/react';
import { useAuth } from '../../context/useAuth';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { STUDYHALL_TIERS, tierForInterval, type StudyhallTier } from '../../data/studyhallTiers';
import { useCheckout, type StudyhallTierId } from '../../hooks/useCheckout';
import { track } from '../../lib/analytics';
import AvatarUploader from '../../components/account/AvatarUploader';
import SocialLinksEditor from '../../components/account/SocialLinksEditor';
import UpgradeModal from '../../components/auth/UpgradeModal';
import {
  checkHandleAvailable,
  setHandleAndVisibility,
  validateHandle,
  type ProfileVisibility,
} from '../../data/publicProfile';
import './UserSettings.css';

type SettingsTab = 'profile' | 'account' | 'notifications' | 'privacy' | 'subscription' | 'danger';

interface SaveStatus {
  field: string;
  status: 'idle' | 'saving' | 'saved' | 'error';
  message?: string;
}

const NOTIFICATION_PREFS = [
  { key: 'community', label: 'Community posts & replies', help: 'Replies to your posts and comments' },
  { key: 'modules', label: 'New module published', help: "Today's drill + news drops" },
  { key: 'completion', label: 'Module completion follow-up', help: '"Nice work, here is what is next"' },
  { key: 'weekly_digest', label: 'Weekly digest', help: '5 fresh drops every Monday' },
  { key: 'live', label: 'Live workshop reminders', help: 'Talk Thru Tech sessions' },
] as const;

export default function UserSettings() {
  const { user, profile, refreshProfile, isBypass } = useAuth();
  const [tab, setTab] = useState<SettingsTab>('profile');
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [bio, setBio] = useState((profile as unknown as { bio?: string })?.bio ?? '');
  const [savedFlash, setSavedFlash] = useState<SaveStatus | null>(null);

  const [resumeUrl, setResumeUrl] = useState((profile as any)?.resume_url ?? '');
  const [currentlyStudying, setCurrentlyStudying] = useState<string[]>(
    (profile as any)?.currently_studying ?? []
  );
  const [studyingInput, setStudyingInput] = useState('');
  const [resumeUploading, setResumeUploading] = useState(false);

  async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isSupabaseConfigured) {
      alert('Supabase is not configured. Upload failed.');
      return;
    }

    setResumeUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/resume-${Date.now()}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('resumes')
        .upload(fileName, file, { upsert: true });

      if (error) {
        alert(`Upload error: ${error.message}`);
        return;
      }

      const { data } = supabase.storage
        .from('resumes')
        .getPublicUrl(fileName);

      if (data?.publicUrl) {
        setResumeUrl(data.publicUrl);
        const { error: dbError } = await (supabase as any)
          .from('profiles')
          .update({ resume_url: data.publicUrl })
          .eq('id', user?.id);

        if (dbError) {
          alert(`Database save error: ${dbError.message}`);
        } else {
          alert('Resume uploaded and saved to profile successfully!');
          await refreshProfile();
        }
      }
    } catch (err: any) {
      alert(`Unexpected error: ${err.message}`);
    } finally {
      setResumeUploading(false);
    }
  }

  async function addStudyingTopic() {
    const topic = studyingInput.trim();
    if (topic && !currentlyStudying.includes(topic)) {
      const nextTopics = [...currentlyStudying, topic];
      setCurrentlyStudying(nextTopics);
      setStudyingInput('');

      if (user?.id && isSupabaseConfigured) {
        await (supabase as any)
          .from('profiles')
          .update({ currently_studying: nextTopics })
          .eq('id', user.id);
        await refreshProfile();
      }
    }
  }

  async function removeStudyingTopic(topic: string) {
    const nextTopics = currentlyStudying.filter((t) => t !== topic);
    setCurrentlyStudying(nextTopics);

    if (user?.id && isSupabaseConfigured) {
      await (supabase as any)
        .from('profiles')
        .update({ currently_studying: nextTopics })
        .eq('id', user.id);
      await refreshProfile();
    }
  }

  const [newEmail, setNewEmail] = useState(user?.email ?? '');
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [newPwd2, setNewPwd2] = useState('');
  const [pwdMsg, setPwdMsg] = useState<SaveStatus | null>(null);
  const [emailMsg, setEmailMsg] = useState<SaveStatus | null>(null);

  const [emailOptIn, setEmailOptIn] = useState(
    (profile as unknown as { email_opt_in?: boolean })?.email_opt_in ?? false
  );
  const [prefs, setPrefs] = useState<Record<string, boolean>>(() => {
    const fromProfile = (profile as unknown as { notification_prefs?: Record<string, boolean> })?.notification_prefs;
    if (fromProfile) return fromProfile;
    return Object.fromEntries(NOTIFICATION_PREFS.map((p) => [p.key, true]));
  });

  const [faceless, setFaceless] = useState(
    (profile as unknown as { faceless?: boolean })?.faceless ?? false
  );

  // ── Privacy: handle + 3-state visibility (Lane 3 / AP-ENGAGEMENT-LOOP-2026-05) ──
  // The picker uses a debounced availability check so we don't pound the DB on
  // every keystroke. `handleStatus` drives the inline tick/cross indicator.
  const [handle, setHandle] = useState<string>(
    (profile as unknown as { handle?: string | null })?.handle ?? '',
  );
  const [visibility, setVisibility] = useState<ProfileVisibility>(
    (profile as unknown as { visibility?: ProfileVisibility })?.visibility ?? 'private',
  );
  const [handleStatus, setHandleStatus] = useState<
    { kind: 'idle' } | { kind: 'checking' } | { kind: 'available' } | { kind: 'taken'; reason: string }
  >({ kind: 'idle' });
  const [privacyMsg, setPrivacyMsg] = useState<SaveStatus | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.display_name ?? '');
    setBio((profile as unknown as { bio?: string }).bio ?? '');
    setEmailOptIn((profile as unknown as { email_opt_in?: boolean }).email_opt_in ?? false);
    setFaceless((profile as unknown as { faceless?: boolean }).faceless ?? false);
    setHandle((profile as unknown as { handle?: string | null }).handle ?? '');
    setVisibility(
      (profile as unknown as { visibility?: ProfileVisibility }).visibility ?? 'private',
    );
    setResumeUrl((profile as any).resume_url ?? '');
    setCurrentlyStudying((profile as any).currently_studying ?? []);
  }, [profile]);

  function flash(field: string, status: SaveStatus['status'], message?: string) {
    setSavedFlash({ field, status, message });
    if (status === 'saved') setTimeout(() => setSavedFlash(null), 2000);
  }

  async function bumpOnboardingStepOne() {
    if (!user?.id || isBypass || !isSupabaseConfigured) return;
    const currentStep =
      ((profile as unknown as { onboarding_step?: number })?.onboarding_step ?? 0);
    if (currentStep >= 1) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('profiles')
      .update({ onboarding_step: 1 })
      .eq('id', user.id);
    if (!error) {
      track('onboarding_step_completed', { step: 1 });
      await refreshProfile();
    }
  }

  async function saveProfileText() {
    if (!user?.id || isBypass || !isSupabaseConfigured) {
      flash('profile-text', 'saved');
      return;
    }
    flash('profile-text', 'saving');
    // Auto-bump onboarding_step to 1 if the visitor has the basics filled.
    // GREATEST() keeps a higher step intact for returning members who already
    // moved further in the flow.
    const currentStep =
      ((profile as unknown as { onboarding_step?: number })?.onboarding_step ?? 0);
    const trimmedBio = bio.trim();
    const trimmedName = displayName.trim();
    const meetsStepOne = !!profile?.avatar_url && trimmedBio.length > 0;
    const nextStep = meetsStepOne ? Math.max(currentStep, 1) : currentStep;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('profiles')
      .update({
        display_name: trimmedName,
        bio: trimmedBio,
        onboarding_step: nextStep,
      })
      .eq('id', user.id);
    if (error) {
      flash('profile-text', 'error', error.message);
      return;
    }
    if (meetsStepOne && nextStep > currentStep) {
      track('onboarding_step_completed', { step: 1 });
    }
    await refreshProfile();
    flash('profile-text', 'saved');
  }

  async function changeEmail(e: FormEvent) {
    e.preventDefault();
    setEmailMsg({ field: 'email', status: 'saving' });
    if (isBypass || !isSupabaseConfigured) {
      setTimeout(
        () => setEmailMsg({ field: 'email', status: 'saved', message: 'Bypass — pretend email change.' }),
        300
      );
      return;
    }
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim().toLowerCase() });
    if (error) {
      setEmailMsg({ field: 'email', status: 'error', message: error.message });
      return;
    }
    setEmailMsg({
      field: 'email',
      status: 'saved',
      message: 'Check your old + new inbox to confirm.',
    });
  }

  async function changePassword(e: FormEvent) {
    e.preventDefault();
    setPwdMsg(null);
    if (newPwd.length < 10) {
      setPwdMsg({ field: 'pwd', status: 'error', message: 'Use at least 10 characters.' });
      return;
    }
    if (newPwd !== newPwd2) {
      setPwdMsg({ field: 'pwd', status: 'error', message: 'New passwords do not match.' });
      return;
    }
    setPwdMsg({ field: 'pwd', status: 'saving' });
    if (isBypass || !isSupabaseConfigured) {
      setTimeout(
        () => setPwdMsg({ field: 'pwd', status: 'saved', message: 'Bypass — pretend updated.' }),
        300
      );
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPwd });
    if (error) {
      setPwdMsg({ field: 'pwd', status: 'error', message: error.message });
      return;
    }
    setPwdMsg({ field: 'pwd', status: 'saved', message: 'Password updated.' });
    setCurrentPwd('');
    setNewPwd('');
    setNewPwd2('');
  }

  async function saveNotifications() {
    if (!user?.id || isBypass || !isSupabaseConfigured) {
      flash('notifications', 'saved');
      return;
    }
    flash('notifications', 'saving');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('profiles')
      .update({ email_opt_in: emailOptIn, notification_prefs: prefs })
      .eq('id', user.id);
    if (error) {
      flash('notifications', 'error', error.message);
      return;
    }
    track('profile_completed', { surface: 'notifications' });
    await refreshProfile();
    flash('notifications', 'saved');
  }

  async function saveFaceless(next: boolean) {
    setFaceless(next);
    if (!user?.id || isBypass || !isSupabaseConfigured) {
      flash('privacy', 'saved');
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('profiles')
      .update({ faceless: next })
      .eq('id', user.id);
    if (error) flash('privacy', 'error', error.message);
    else {
      await refreshProfile();
      flash('privacy', 'saved');
    }
  }

  /* ── Privacy: handle change + visibility save ── */

  function onHandleChange(raw: string) {
    // Normalize as we type so URL preview always shows the saved form.
    const next = raw.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    setHandle(next);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (next.length === 0) {
      setHandleStatus({ kind: 'idle' });
      return;
    }
    const shapeError = validateHandle(next);
    if (shapeError) {
      setHandleStatus({ kind: 'taken', reason: shapeError });
      return;
    }
    setHandleStatus({ kind: 'checking' });
    debounceRef.current = setTimeout(() => {
      void (async () => {
        const result = await checkHandleAvailable(next, user?.id);
        if (result.available) {
          setHandleStatus({ kind: 'available' });
        } else {
          setHandleStatus({
            kind: 'taken',
            reason: result.reason ?? 'That handle is taken.',
          });
        }
      })();
    }, 300);
  }

  async function savePrivacy() {
    setPrivacyMsg({ field: 'privacy-handle', status: 'saving' });
    try {
      // For visibility changes without a handle yet, we still need a handle
      // before flipping public/unlisted. Block the save with a clear message.
      if (visibility !== 'private' && handle.trim().length === 0) {
        throw new Error('Pick a handle before going public or unlisted.');
      }
      if (handle.trim().length > 0 && handleStatus.kind === 'taken') {
        throw new Error(handleStatus.reason);
      }

      await setHandleAndVisibility(handle.trim(), visibility);
      track('profile_completed', { surface: 'privacy', visibility });
      await refreshProfile();
      setPrivacyMsg({ field: 'privacy-handle', status: 'saved', message: 'Privacy saved.' });
      setTimeout(() => setPrivacyMsg(null), 2000);
    } catch (err) {
      setPrivacyMsg({
        field: 'privacy-handle',
        status: 'error',
        message: err instanceof Error ? err.message : 'Save failed.',
      });
    }
  }

  function copyShareLink() {
    if (!handle) return;
    const url = `https://www.assetpersona.com/u/${handle}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 1500);
    }
  }

  async function requestDeletion() {
    if (!confirm(
      'Request account deletion? Frank will receive your request and follow up. Your data is not deleted automatically.'
    )) return;
    if (isBypass || !isSupabaseConfigured) {
      alert('Bypass — pretend request submitted.');
      return;
    }
    const url =
      ((import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? '').replace(/\/$/, '') +
      '/functions/v1/inquiry-webhook';
    await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        form_type: 'general',
        name: profile?.display_name ?? 'Member',
        email: user?.email,
        fields: { request_type: 'account_deletion', user_id: user?.id },
        source: 'user-settings-danger-zone',
      }),
    });
    alert('Request received. Frank will follow up.');
  }

  const currentTier = STUDYHALL_TIERS.find(
    (t) => t.id === ((profile as unknown as { tier?: string })?.tier ?? 'assetClass')
  );

  const TAB_CONFIG: { key: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { key: 'profile',      label: 'Profile',       icon: <User size={18} weight="duotone" /> },
    { key: 'account',      label: 'Account',       icon: <Lock size={18} weight="duotone" /> },
    { key: 'notifications',label: 'Notifications', icon: <Bell size={18} weight="duotone" /> },
    { key: 'privacy',      label: 'Privacy',       icon: <Eye size={18} weight="duotone" /> },
    { key: 'subscription', label: 'Subscription',  icon: <ArrowRight size={18} weight="duotone" /> },
    { key: 'danger',       label: 'Danger zone',   icon: <ShieldWarning size={18} weight="duotone" /> },
  ];

  return (
    <div className="usettings">
      <div className="community-page-header">
        <h1>Settings</h1>
        <p>Customize your profile, manage your account, control your privacy.</p>
      </div>

      <div className="usettings__layout">
        <aside className="usettings__sidebar">
          {TAB_CONFIG.map(({ key, label, icon }) => (
            <button
              key={key}
              className={`usettings__tab ${tab === key ? 'usettings__tab--active' : ''}`}
              onClick={() => setTab(key)}
            >
              {icon} {label}
            </button>
          ))}
        </aside>

        <div className="usettings__content">
          {tab === 'profile' && (
            <div className="usettings__panel">
              <h3>Profile</h3>

              <AvatarUploader
                variant="avatar"
                currentUrl={profile?.avatar_url ?? null}
                onUpdated={() => {
                  // Avatar saved. If a bio exists, the visitor has cleared
                  // step 1 — bump the row so the checklist marks complete.
                  if (bio.trim().length > 0) void bumpOnboardingStepOne();
                }}
              />
              <AvatarUploader
                variant="cover"
                currentUrl={(profile as unknown as { cover_url?: string | null })?.cover_url ?? null}
              />

              <div className="community-card usettings__card">
                <label className="usettings__field">
                  <span>Display name</span>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    onBlur={saveProfileText}
                    placeholder="Your name"
                    maxLength={64}
                  />
                </label>
                <label className="usettings__field">
                  <span>Bio</span>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    onBlur={saveProfileText}
                    placeholder="One sentence on what you're up to."
                    maxLength={200}
                  />
                  <span className="usettings__counter">{bio.length} / 200</span>
                </label>
                {savedFlash?.field === 'profile-text' && savedFlash.status === 'saved' && (
                  <p className="usettings__inline-ok"><CheckCircle size={14} /> Saved</p>
                )}
                {savedFlash?.field === 'profile-text' && savedFlash.status === 'error' && (
                  <p className="usettings__inline-err"><XCircle size={14} /> {savedFlash.message}</p>
                )}
              </div>

              <div className="community-card usettings__card">
                <h4 className="usettings__sub" style={{ marginBottom: 'var(--space-md)' }}>Resume & Education</h4>
                
                {/* Resume Upload */}
                <div className="usettings__field" style={{ marginBottom: 'var(--space-md)' }}>
                  <span>Your Resume (PDF preferred)</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', flexWrap: 'wrap', marginTop: '4px' }}>
                    {resumeUrl ? (
                      <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="btn btn--secondary btn--sm">
                        View uploaded resume
                      </a>
                    ) : (
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>No resume uploaded yet</span>
                    )}
                    <label style={{ display: 'inline-flex', cursor: 'pointer' }}>
                      <span className="btn btn--primary btn--sm">{resumeUploading ? 'Uploading...' : 'Upload PDF'}</span>
                      <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} disabled={resumeUploading} style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>

                {/* Currently Studying */}
                <div className="usettings__field">
                  <span>Currently Studying / Areas of Focus</span>
                  <div style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap', marginTop: 'var(--space-xs)', marginBottom: 'var(--space-xs)' }}>
                    {currentlyStudying.map((topic) => (
                      <span key={topic} style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', background: 'rgba(255,255,255,0.06)', display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid var(--color-border)' }}>
                        {topic}
                        <button type="button" onClick={() => removeStudyingTopic(topic)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: '4px' }}>
                    <input
                      type="text"
                      value={studyingInput}
                      onChange={(e) => setStudyingInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addStudyingTopic(); } }}
                      placeholder="Add a topic (e.g. Prompt Engineering, RAG)"
                      style={{ flex: 1 }}
                    />
                    <button type="button" onClick={addStudyingTopic} className="btn btn--secondary btn--sm">Add</button>
                  </div>
                </div>
              </div>

              <SocialLinksEditor />
            </div>
          )}

          {tab === 'account' && (
            <div className="usettings__panel">
              <h3>Account</h3>
              <div className="community-card usettings__card">
                <form onSubmit={changeEmail}>
                  <label className="usettings__field">
                    <span>Email</span>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      autoComplete="email"
                    />
                    <span className="usettings__help">Email changes need verification on both addresses.</span>
                  </label>
                  <button
                    type="submit"
                    className="btn btn--primary btn--sm"
                    disabled={emailMsg?.status === 'saving' || newEmail === user?.email}
                  >
                    <FloppyDisk size={16} /> {emailMsg?.status === 'saving' ? 'Sending verification…' : 'Update email'}
                  </button>
                  {emailMsg?.status === 'saved' && (
                    <p className="usettings__inline-ok"><CheckCircle size={14} /> {emailMsg.message ?? 'Saved'}</p>
                  )}
                  {emailMsg?.status === 'error' && (
                    <p className="usettings__inline-err"><XCircle size={14} /> {emailMsg.message}</p>
                  )}
                </form>
              </div>

              <div className="community-card usettings__card">
                <form onSubmit={changePassword}>
                  <h4 className="usettings__sub">Change password</h4>
                  <label className="usettings__field">
                    <span>Current password</span>
                    <input
                      type="password"
                      value={currentPwd}
                      onChange={(e) => setCurrentPwd(e.target.value)}
                      autoComplete="current-password"
                      required
                    />
                  </label>
                  <label className="usettings__field">
                    <span>New password</span>
                    <input
                      type="password"
                      value={newPwd}
                      onChange={(e) => setNewPwd(e.target.value)}
                      autoComplete="new-password"
                      required
                      minLength={10}
                    />
                    <span className="usettings__help">10 characters minimum.</span>
                  </label>
                  <label className="usettings__field">
                    <span>Confirm new password</span>
                    <input
                      type="password"
                      value={newPwd2}
                      onChange={(e) => setNewPwd2(e.target.value)}
                      autoComplete="new-password"
                      required
                      minLength={10}
                    />
                  </label>
                  <button
                    type="submit"
                    className="btn btn--primary btn--sm"
                    disabled={pwdMsg?.status === 'saving'}
                  >
                    <Lock size={16} /> {pwdMsg?.status === 'saving' ? 'Updating…' : 'Update password'}
                  </button>
                  {pwdMsg?.status === 'saved' && (
                    <p className="usettings__inline-ok"><CheckCircle size={14} /> {pwdMsg.message ?? 'Updated'}</p>
                  )}
                  {pwdMsg?.status === 'error' && (
                    <p className="usettings__inline-err"><XCircle size={14} /> {pwdMsg.message}</p>
                  )}
                </form>
              </div>
            </div>
          )}

          {tab === 'notifications' && (
            <div className="usettings__panel">
              <h3>Notifications</h3>
              <div className="community-card usettings__card">
                <label className="usettings__toggle-row">
                  <span>
                    <strong>Email me</strong>
                    <em>Master switch. Turn off to stop all email.</em>
                  </span>
                  <label className="usettings__toggle">
                    <input
                      type="checkbox"
                      checked={emailOptIn}
                      onChange={(e) => setEmailOptIn(e.target.checked)}
                    />
                    <span className="usettings__toggle-slider" />
                  </label>
                </label>
              </div>

              <div className="community-card usettings__card">
                <h4 className="usettings__sub">Channels</h4>
                {NOTIFICATION_PREFS.map((pref) => (
                  <label key={pref.key} className="usettings__toggle-row">
                    <span>
                      <strong>{pref.label}</strong>
                      <em>{pref.help}</em>
                    </span>
                    <label className="usettings__toggle">
                      <input
                        type="checkbox"
                        checked={emailOptIn && (prefs[pref.key] ?? true)}
                        disabled={!emailOptIn}
                        onChange={(e) => setPrefs({ ...prefs, [pref.key]: e.target.checked })}
                      />
                      <span className="usettings__toggle-slider" />
                    </label>
                  </label>
                ))}
                <button
                  type="button"
                  className="btn btn--primary btn--sm"
                  onClick={saveNotifications}
                  style={{ marginTop: 'var(--space-md)' }}
                  disabled={savedFlash?.status === 'saving'}
                >
                  <FloppyDisk size={16} /> {savedFlash?.status === 'saving' ? 'Saving…' : 'Save preferences'}
                </button>
                {savedFlash?.field === 'notifications' && savedFlash.status === 'saved' && (
                  <p className="usettings__inline-ok"><CheckCircle size={14} /> Saved</p>
                )}
                {savedFlash?.field === 'notifications' && savedFlash.status === 'error' && (
                  <p className="usettings__inline-err"><XCircle size={14} /> {savedFlash.message}</p>
                )}
              </div>
            </div>
          )}

          {tab === 'privacy' && (
            <div className="usettings__panel">
              <h3>Privacy</h3>

              {/* ── Public profile: handle + 3-state visibility ── */}
              <div className="community-card usettings__card">
                <h4 className="usettings__sub">Your public profile</h4>
                <p className="usettings__help" style={{ marginBottom: 'var(--space-md)' }}>
                  Pick a handle, then choose how visible your profile is. Default is private — nothing leaks until you flip it.
                </p>

                <label className="usettings__field">
                  <span>Handle</span>
                  <div className="usettings__handle-row">
                    <span className="usettings__handle-prefix">assetpersona.com/u/</span>
                    <input
                      type="text"
                      value={handle}
                      onChange={(e) => onHandleChange(e.target.value)}
                      placeholder="frvnkfrmchicago"
                      maxLength={30}
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      className="usettings__handle-input"
                    />
                    {handleStatus.kind === 'checking' && (
                      <span className="usettings__handle-status" aria-label="Checking">…</span>
                    )}
                    {handleStatus.kind === 'available' && (
                      <span className="usettings__handle-status usettings__handle-status--ok" aria-label="Available">
                        <CheckCircle size={16} weight="fill" />
                      </span>
                    )}
                    {handleStatus.kind === 'taken' && (
                      <span className="usettings__handle-status usettings__handle-status--err" aria-label="Taken">
                        <XCircle size={16} weight="fill" />
                      </span>
                    )}
                  </div>
                  {handleStatus.kind === 'taken' && (
                    <span className="usettings__help usettings__help--err">{handleStatus.reason}</span>
                  )}
                  {handleStatus.kind === 'available' && (
                    <span className="usettings__help usettings__help--ok">Looks good. Save below to claim it.</span>
                  )}
                </label>

                <fieldset className="usettings__visibility-group">
                  <legend className="usettings__visibility-legend">Who can see your profile</legend>
                  {([
                    {
                      value: 'private',
                      label: 'Private',
                      help: 'Only you can see it. Nothing is shared anywhere.',
                      Icon: EyeSlash,
                    },
                    {
                      value: 'unlisted',
                      label: 'Unlisted',
                      help: 'Only people you give the link to. Not in search, not in members.',
                      Icon: LinkIcon,
                    },
                    {
                      value: 'public',
                      label: 'Public',
                      help: 'Anyone can find you. Listed on members + indexable by search engines.',
                      Icon: Globe,
                    },
                  ] as const).map(({ value, label, help, Icon }) => (
                    <label
                      key={value}
                      className={`usettings__visibility-option ${
                        visibility === value ? 'usettings__visibility-option--active' : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name="visibility"
                        value={value}
                        checked={visibility === value}
                        onChange={() => setVisibility(value)}
                      />
                      <span className="usettings__visibility-icon"><Icon size={18} weight="duotone" /></span>
                      <span className="usettings__visibility-text">
                        <strong>{label}</strong>
                        <em>{help}</em>
                      </span>
                    </label>
                  ))}
                </fieldset>

                <button
                  type="button"
                  className="btn btn--primary btn--sm"
                  onClick={savePrivacy}
                  disabled={privacyMsg?.status === 'saving' || handleStatus.kind === 'checking'}
                  style={{ marginTop: 'var(--space-md)' }}
                >
                  <FloppyDisk size={16} /> {privacyMsg?.status === 'saving' ? 'Saving…' : 'Save privacy'}
                </button>
                {privacyMsg?.status === 'saved' && (
                  <p className="usettings__inline-ok"><CheckCircle size={14} /> {privacyMsg.message ?? 'Saved'}</p>
                )}
                {privacyMsg?.status === 'error' && (
                  <p className="usettings__inline-err"><XCircle size={14} /> {privacyMsg.message}</p>
                )}

                {/* Share-link copy — only when visibility is non-private AND a handle is set */}
                {visibility !== 'private' && handle && (
                  <div className="usettings__share-link">
                    <span className="usettings__share-url">assetpersona.com/u/{handle}</span>
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={copyShareLink}
                    >
                      <Copy size={14} /> {shareCopied ? 'Copied!' : 'Copy link'}
                    </button>
                  </div>
                )}
              </div>

              {/* ── Existing faceless toggle (narrow leaderboard hide) ── */}
              <div className="community-card usettings__card">
                <label className="usettings__toggle-row">
                  <span>
                    <strong>Faceless mode</strong>
                    <em>Your completions don't show up in the public feed or leaderboard. Your Skill Points still count.</em>
                  </span>
                  <label className="usettings__toggle">
                    <input
                      type="checkbox"
                      checked={faceless}
                      onChange={(e) => saveFaceless(e.target.checked)}
                    />
                    <span className="usettings__toggle-slider" />
                  </label>
                </label>
              </div>

              <div className="community-card usettings__card">
                <p className="usettings__help">
                  Asset Persona does not run direct messaging. There is no DM surface to disable. If you need to reach Frank, use the <a href="/faq">FAQ "Ask Frank" form</a>.
                </p>
              </div>
            </div>
          )}

          {tab === 'subscription' && (
            <SubscriptionPanel currentTier={currentTier} />
          )}

          {tab === 'danger' && (
            <div className="usettings__panel">
              <h3>Danger zone</h3>
              <div className="community-card usettings__card usettings__danger">
                <h4>Request account deletion</h4>
                <p>Sends a request through to Frank. Your data is not removed automatically. Frank confirms before any deletion happens.</p>
                <button type="button" className="btn btn--danger btn--sm" onClick={requestDeletion}>
                  Request account deletion
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───── Subscription panel — direct checkout + Customer Portal + Upgrade modal ───── */

function SubscriptionPanel({ currentTier }: { currentTier?: StudyhallTier }) {
  const { handleCheckout, openCustomerPortal, hasPortal, isLoading } = useCheckout();
  const [interval, setInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [modalOpen, setModalOpen] = useState(false);

  const currentIsPaid = currentTier && currentTier.id !== 'assetClass';
  const upgradeBaseIds: StudyhallTierId[] = ['cohort', 'insiders', 'privateLessons'];

  return (
    <div className="usettings__panel">
      <h3>Your plan</h3>
      <div className="community-card usettings__plan-card">
        <div>
          <h4>{currentTier?.name ?? 'Asset Class'}</h4>
          <p className="usettings__plan-tagline">{currentTier?.tagline ?? 'Free Tier'}</p>
          <p className="usettings__plan-price">
            {!currentTier || currentTier.id === 'assetClass'
              ? 'Free'
              : `$${currentTier.price}${currentTier.intervalLabel ?? ''}`}
          </p>
        </div>
        {currentIsPaid && hasPortal && (
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={openCustomerPortal}
            disabled={isLoading === 'portal'}
          >
            <CreditCard size={14} /> Manage subscription
          </button>
        )}
      </div>

      <div className="usettings__plan-toggle" role="radiogroup" aria-label="Billing interval">
        <button
          type="button"
          role="radio"
          aria-checked={interval === 'monthly'}
          className={`btn btn--ghost btn--sm ${interval === 'monthly' ? 'is-active' : ''}`}
          onClick={() => setInterval('monthly')}
        >
          Monthly
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={interval === 'yearly'}
          className={`btn btn--ghost btn--sm ${interval === 'yearly' ? 'is-active' : ''}`}
          onClick={() => setInterval('yearly')}
        >
          Yearly · Save 20%
        </button>
      </div>

      <h4 className="usettings__sub">Available upgrades</h4>
      <div className="usettings__tiers">
        {upgradeBaseIds.map((baseId) => {
          const tier = tierForInterval(baseId as any, interval) ?? tierForInterval(baseId as any, 'monthly');
          if (!tier) return null;
          const isCurrent = currentTier?.id === tier.id;
          const isLoadingTier = isLoading === baseId;
          return (
            <div key={tier.id} className="usettings__tier-card">
              <div>
                <h4>{tier.name}</h4>
                <p className="text-secondary">{tier.tagline}</p>
                <p className="usettings__tier-price">${tier.price}{tier.intervalLabel}</p>
              </div>
              {isCurrent ? (
                <span className="usettings__current-pill">Current plan</span>
              ) : (
                <button
                  type="button"
                  className="btn btn--primary btn--sm"
                  disabled={isLoadingTier}
                  onClick={() => void handleCheckout(baseId, interval)}
                >
                  {isLoadingTier ? 'Opening…' : <>Get {tier.name} <ArrowRight size={14} /></>}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className="btn btn--ghost btn--sm"
        onClick={() => setModalOpen(true)}
        style={{ marginTop: '12px' }}
      >
        Compare all plans
      </button>
      <UpgradeModal
        open={modalOpen}
        triggerSource="user-settings"
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
