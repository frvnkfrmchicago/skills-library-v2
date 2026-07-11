/* ═══ MediaPicker — image upload + Tenor GIF picker ═══
 *
 * Drop into any composer. Shows a small media tray that:
 *   - opens a file picker for image upload to Supabase Storage post-media bucket
 *   - opens a Tenor GIF search panel
 *   - emits added URLs via onAdded(url) so the parent can append to media_urls
 *
 * Bypass-safe: file uploads return blob URLs in bypass; GIF search returns
 * stub samples when VITE_TENOR_API_KEY is unset.
 */
import { useEffect, useRef, useState } from 'react';
import { Image as ImageIcon, Smiley, X } from '@phosphor-icons/react';
import { useAuth } from '../../context/useAuth';
import { uploadImage, UploadValidationError } from '../../lib/uploads';
import { searchTenor, BYPASS_TENOR_SAMPLES, type TenorGif } from '../../lib/tenor';
import { isBypassActive } from '../../lib/devBypass';
import './MediaPicker.css';

interface Props {
  onAdded: (url: string) => void;
}

export default function MediaPicker({ onAdded }: Props) {
  const { user, isBypass, bypassRole } = useAuth();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [tenorOpen, setTenorOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TenorGif[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const userId = user?.id ?? (isBypass ? `bypass-${bypassRole ?? 'guest'}` : null);

  useEffect(() => {
    if (!tenorOpen) return;
    let cancelled = false;
    void (async () => {
      setBusy(true);
      let r: TenorGif[] = [];
      try {
        r = await searchTenor(query);
      } catch {
        r = [];
      }
      if (!cancelled) {
        setResults(r.length === 0 && (isBypassActive() || !import.meta.env.VITE_TENOR_API_KEY)
          ? BYPASS_TENOR_SAMPLES
          : r);
        setBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tenorOpen, query]);

  async function handleFile(file: File) {
    if (!userId) {
      setError('Sign in to upload.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      const { url } = await uploadImage({ bucket: 'post-media', userId, file });
      onAdded(url);
    } catch (err) {
      setError(err instanceof UploadValidationError ? err.message : (err instanceof Error ? err.message : 'Upload failed.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mpick">
      <div className="mpick__bar">
        <button
          type="button"
          className="mpick__btn"
          aria-label="Upload image"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
        >
          <ImageIcon size={18} weight="duotone" />
          <span>Image</span>
        </button>
        <button
          type="button"
          className="mpick__btn"
          aria-label="Pick a GIF"
          onClick={() => setTenorOpen((v) => !v)}
          disabled={busy}
        >
          <Smiley size={18} weight="duotone" />
          <span>GIF</span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = '';
          }}
          className="mpick__hidden-input"
          aria-hidden="true"
        />
      </div>

      {error && <p className="mpick__err" role="alert">{error}</p>}

      {tenorOpen && (
        <div className="mpick__tenor">
          <header>
            <input
              type="search"
              placeholder="Search GIFs…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <button onClick={() => setTenorOpen(false)} aria-label="Close">
              <X size={14} />
            </button>
          </header>
          {busy ? (
            <p className="mpick__loading">Loading…</p>
          ) : results.length === 0 ? (
            <p className="mpick__empty">
              {import.meta.env.VITE_TENOR_API_KEY
                ? 'No matches.'
                : 'Set VITE_TENOR_API_KEY to enable GIF search. (Bypass shows samples.)'}
            </p>
          ) : (
            <ul>
              {results.map((g) => (
                <li key={g.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onAdded(g.url);
                      setTenorOpen(false);
                    }}
                    aria-label={`Pick ${g.title}`}
                  >
                    <img src={g.preview_url} alt={g.title} loading="lazy" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
