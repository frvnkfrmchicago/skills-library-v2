import { useRef, useState } from 'react';
import { Image as ImageIcon, Trash2, Upload, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { isBypassActive } from '../../lib/devBypass';
import './CoverImageUpload.css';

interface CoverImageUploadProps {
  /** Current cover image URL or storage path. */
  value?: string;
  /** Slug used to scope the storage filename. */
  slug: string;
  onChange: (url: string | undefined) => void;
}

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPT = 'image/png,image/jpeg,image/webp,image/avif';

/**
 * Cover image upload for blog posts.
 *  - Live mode (Supabase configured + not bypass): uploads to `blog/<slug>-<ts>.<ext>` storage bucket. Returns public URL.
 *  - Bypass mode: stores a data URL in the cover field (lives in localStorage with the draft).
 *
 * Bucket policies are set in Wave 1 migration 20260505100400_create_blog_posts.sql.
 */
export default function CoverImageUpload({ value, slug, onChange }: CoverImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  function pick() {
    inputRef.current?.click();
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-picking same file
    if (!file) return;

    setError('');

    if (!ACCEPT.split(',').includes(file.type)) {
      setError('Use PNG, JPEG, WebP, or AVIF.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(`Max 5 MB. This file is ${(file.size / 1024 / 1024).toFixed(1)} MB.`);
      return;
    }

    setUploading(true);

    try {
      // Bypass mode → data URL into draft (lives in localStorage)
      if (isBypassActive() || !isSupabaseConfigured) {
        const dataUrl = await readAsDataUrl(file);
        onChange(dataUrl);
        return;
      }

      const ext = (file.name.split('.').pop() || 'png').toLowerCase();
      const safeSlug = (slug || 'untitled').replace(/[^a-z0-9-]/g, '-').slice(0, 80);
      const path = `${safeSlug}-${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from('blog')
        .upload(path, file, {
          cacheControl: '31536000',
          upsert: false,
          contentType: file.type,
        });
      if (upErr) throw upErr;

      const { data } = supabase.storage.from('blog').getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (err) {
      console.error('Cover image upload failed:', err);
      const msg = err instanceof Error ? err.message : 'Upload failed.';
      // Detect missing-bucket / unauthorized cases distinctly
      if (msg.toLowerCase().includes('not found')) {
        setError('Storage bucket "blog" missing — push Wave 1 migrations first.');
      } else if (msg.toLowerCase().includes('row-level security') || msg.toLowerCase().includes('unauthorized')) {
        setError('Not authorized — admin role required to upload.');
      } else {
        setError(msg);
      }
    } finally {
      setUploading(false);
    }
  }

  function clear() {
    onChange(undefined);
  }

  return (
    <div className="cover-upload">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={handleFile}
        hidden
      />

      {value ? (
        <div className="cover-upload__preview">
          <img src={value} alt="Cover preview" className="cover-upload__img" />
          <div className="cover-upload__actions">
            <button type="button" className="btn btn--ghost btn--sm" onClick={pick} disabled={uploading}>
              <Upload size={14} /> Replace
            </button>
            <button type="button" className="btn btn--ghost btn--sm cover-upload__remove" onClick={clear} disabled={uploading}>
              <Trash2 size={14} /> Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="cover-upload__dropzone"
          onClick={pick}
          disabled={uploading}
        >
          <ImageIcon size={26} />
          <span className="cover-upload__title">{uploading ? 'Uploading…' : 'Add cover image'}</span>
          <span className="cover-upload__sub">PNG · JPEG · WebP · AVIF — up to 5 MB</span>
        </button>
      )}

      {error && (
        <p className="cover-upload__error" role="alert">
          <AlertCircle size={14} /> {error}
        </p>
      )}
    </div>
  );
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(typeof r.result === 'string' ? r.result : '');
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}
