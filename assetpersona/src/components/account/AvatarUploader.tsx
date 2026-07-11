/* ═══ AvatarUploader — drop-in for Account Settings ═══
 *
 * Two modes: 'avatar' (square 128px) and 'cover' (banner 1500×500).
 * Validates type + size, shows inline error, calls setProfileImage on success,
 * and runs refreshProfile so other surfaces re-render without a reload.
 *
 * Per supabase-building + mobile-first-enforcing: per-user folder policy,
 * 44pt touch targets.
 */
import { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { uploadImage, setProfileImage, UploadValidationError } from '../../lib/uploads';
import './AvatarUploader.css';

interface AvatarUploaderProps {
  variant: 'avatar' | 'cover';
  currentUrl: string | null;
  onUpdated?: (url: string) => void;
}

const COPY = {
  avatar: {
    label: 'Avatar',
    hint: 'PNG/JPG/WebP/GIF · max 2MB · square works best',
    cta: 'Change avatar',
    Icon: Camera,
  },
  cover: {
    label: 'Cover banner',
    hint: 'PNG/JPG/WebP · max 4MB · 1500×500 works best',
    cta: 'Change cover',
    Icon: ImageIcon,
  },
} as const;

export default function AvatarUploader({ variant, currentUrl, onUpdated }: AvatarUploaderProps) {
  const { user, refreshProfile, isBypass } = useAuth();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const meta = COPY[variant];

  async function handleFile(file: File) {
    setError('');
    setSaved(false);

    const userId = user?.id ?? (isBypass ? 'bypass-user' : null);
    if (!userId) {
      setError('Sign in to upload.');
      return;
    }

    setBusy(true);
    try {
      const { url } = await uploadImage({
        bucket: variant === 'avatar' ? 'avatars' : 'covers',
        userId,
        file,
      });
      setPreviewUrl(url);
      const field = variant === 'avatar' ? 'avatar_url' : 'cover_url';
      if (user?.id) await setProfileImage(user.id, field, url);
      await refreshProfile();
      onUpdated?.(url);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      if (err instanceof UploadValidationError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : 'Upload failed.');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`avatar-up avatar-up--${variant}`}>
      <div className="avatar-up__head">
        <span className="avatar-up__label">{meta.label}</span>
        <span className="avatar-up__hint">{meta.hint}</span>
      </div>

      <div className="avatar-up__preview">
        {previewUrl ? (
          variant === 'cover' ? (
            <img src={previewUrl} alt={`${meta.label} preview`} />
          ) : (
            <img src={previewUrl} alt="Avatar preview" />
          )
        ) : (
          <div className="avatar-up__placeholder" aria-hidden="true">
            <meta.Icon size={28} />
          </div>
        )}
      </div>

      <div className="avatar-up__actions">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = '';
          }}
          className="avatar-up__hidden-input"
          aria-hidden="true"
        />
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
        >
          <meta.Icon size={14} /> {busy ? 'Uploading…' : meta.cta}
        </button>
        {saved && (
          <span className="avatar-up__saved" role="status">
            <CheckCircle2 size={14} /> Saved
          </span>
        )}
        {error && (
          <span className="avatar-up__err" role="alert">
            <AlertCircle size={14} /> {error}
          </span>
        )}
      </div>
    </div>
  );
}
