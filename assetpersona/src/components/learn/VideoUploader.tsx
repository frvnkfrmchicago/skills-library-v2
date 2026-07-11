/* ═══ VideoUploader — Supabase Storage video upload ═══
 *
 * Drag-and-drop or click to upload a video file to the `videos` storage bucket
 * created by Lane 6's 20260518100500_storage_videos_bucket.sql migration.
 *
 * On success this component:
 *   1. Uploads to `videos/<auth.uid()>/<uuid>.<ext>` (RLS-enforced path)
 *   2. Inserts a row in `public.video_assets` with the storage path + metadata
 *   3. Calls `onUploaded(asset)` with the inserted row
 *
 * Bypass-safe: in dev bypass we return an object-URL stub asset so the parent
 * UI still renders something without hitting Supabase.
 *
 * Accessibility: file input is keyboard-triggerable via the visible button.
 * Progress is announced through an aria-live region.
 *
 * Tokens: every visual is wired to existing CSS variables in tokens.css. No
 * raw hex values, no inline styles for colors.
 */
import { useCallback, useRef, useState, type DragEvent, type KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadSimple, VideoCamera, X, CheckCircle, Warning } from '@phosphor-icons/react';
import { useAuth } from '../../context/useAuth';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { isBypassActive } from '../../lib/devBypass';
import './VideoUploader.css';

/* ── Constants ── */
const MAX_VIDEO_BYTES = 500 * 1024 * 1024; // 500 MB cap per the lane brief
const ALLOWED_MIME = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime', // .mov
]);

/* ── Shape returned to the caller ── */
export interface VideoAsset {
  id: string;
  owner_id: string;
  storage_path: string;
  poster_path: string | null;
  duration_seconds: number | null;
  mime_type: string | null;
  size_bytes: number | null;
  status: 'processing' | 'ready' | 'failed' | 'deleted';
  created_at: string;
  /** Convenience: signed URL the browser can play immediately. */
  playback_url?: string;
}

interface Props {
  /** Called with the inserted video_assets row + playback URL when upload finishes. */
  onUploaded: (asset: VideoAsset) => void;
  /** Optional: tighten the cap (in bytes). Defaults to 500 MB. */
  maxBytes?: number;
  /** Optional accessible label override. */
  label?: string;
}

type UploadState =
  | { phase: 'idle' }
  | { phase: 'validating' }
  | { phase: 'uploading'; percent: number; filename: string }
  | { phase: 'inserting' }
  | { phase: 'done'; filename: string }
  | { phase: 'error'; message: string };

function extFromMime(mime: string): string {
  switch (mime) {
    case 'video/mp4': return 'mp4';
    case 'video/webm': return 'webm';
    case 'video/quicktime': return 'mov';
    default: return 'bin';
  }
}



export default function VideoUploader({ onUploaded, maxBytes = MAX_VIDEO_BYTES, label = 'Upload a video' }: Props) {
  const { user, isBypass, bypassRole } = useAuth();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [state, setState] = useState<UploadState>({ phase: 'idle' });
  const [isDragging, setIsDragging] = useState(false);

  const userId = user?.id ?? (isBypass ? `bypass-${bypassRole ?? 'guest'}` : null);

  const handleFile = useCallback(async (file: File) => {
    /* ── Validate ── */
    setState({ phase: 'validating' });

    if (!userId) {
      setState({ phase: 'error', message: 'Sign in to upload a video.' });
      return;
    }

    if (!ALLOWED_MIME.has(file.type)) {
      setState({ phase: 'error', message: 'MP4, WebM, or MOV only.' });
      return;
    }

    if (file.size > maxBytes) {
      setState({
        phase: 'error',
        message: `Video too large. Max ${(maxBytes / 1024 / 1024).toFixed(0)} MB.`,
      });
      return;
    }

    const assetId = crypto.randomUUID();
    const filename = `${assetId}.${extFromMime(file.type)}`;
    const storagePath = `${userId}/${filename}`;

    /* ── Bypass / unconfigured: short-circuit with an object URL ── */
    if (isBypassActive() || !isSupabaseConfigured) {
      setState({ phase: 'uploading', percent: 100, filename: file.name });
      const playback_url = URL.createObjectURL(file);
      const stub: VideoAsset = {
        id: assetId,
        owner_id: userId,
        storage_path: storagePath,
        poster_path: null,
        duration_seconds: null,
        mime_type: file.type,
        size_bytes: file.size,
        status: 'ready',
        created_at: new Date().toISOString(),
        playback_url,
      };
      setState({ phase: 'done', filename: file.name });
      onUploaded(stub);
      return;
    }

    /* ── Real Supabase upload ── */
    setState({ phase: 'uploading', percent: 0, filename: file.name });

    try {
      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        setState({ phase: 'error', message: uploadError.message });
        return;
      }

      setState({ phase: 'uploading', percent: 100, filename: file.name });
      setState({ phase: 'inserting' });

      /* ── Insert metadata row ── */
      const insertPayload = {
        id: assetId,
        owner_id: userId,
        storage_path: storagePath,
        mime_type: file.type,
        size_bytes: file.size,
        status: 'ready' as const,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: inserted, error: insertError } = await (supabase as any)
        .from('video_assets')
        .insert(insertPayload)
        .select()
        .single();

      if (insertError) {
        // Best-effort cleanup of the orphaned upload — ignore failures.
        await supabase.storage.from('videos').remove([storagePath]).catch(() => undefined);
        setState({ phase: 'error', message: insertError.message });
        return;
      }

      /* ── Sign a playback URL so the caller can render immediately ── */
      const { data: signed } = await supabase.storage
        .from('videos')
        .createSignedUrl(storagePath, 60 * 60 * 6); // 6 hour playback window

      const asset: VideoAsset = {
        ...(inserted as VideoAsset),
        playback_url: signed?.signedUrl,
      };

      setState({ phase: 'done', filename: file.name });
      onUploaded(asset);
    } catch (err) {
      setState({
        phase: 'error',
        message: err instanceof Error ? err.message : 'Upload failed.',
      });
    }
  }, [userId, maxBytes, onUploaded]);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  }, [handleFile]);

  function handleKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  }

  const busy = state.phase === 'validating' || state.phase === 'uploading' || state.phase === 'inserting';

  return (
    <div className="video-uploader">
      <div
        role="button"
        tabIndex={0}
        aria-label={label}
        aria-busy={busy}
        className={`video-uploader__zone ${isDragging ? 'video-uploader__zone--dragging' : ''} ${busy ? 'video-uploader__zone--busy' : ''}`}
        onClick={() => !busy && inputRef.current?.click()}
        onKeyDown={handleKey}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
            e.target.value = '';
          }}
          className="video-uploader__input"
          aria-hidden="true"
          tabIndex={-1}
        />

        <AnimatePresence mode="wait">
          {state.phase === 'idle' && (
            <motion.div
              key="idle"
              className="video-uploader__cta"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <VideoCamera size={36} weight="duotone" />
              <h3>{label}</h3>
              <p>Drag a clip in, or click to choose. MP4, WebM, or MOV. Up to {(maxBytes / 1024 / 1024).toFixed(0)} MB.</p>
              <span className="video-uploader__cta-btn">
                <UploadSimple size={16} weight="bold" /> Choose file
              </span>
            </motion.div>
          )}

          {(state.phase === 'validating' || state.phase === 'uploading' || state.phase === 'inserting') && (
            <motion.div
              key="busy"
              className="video-uploader__busy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="video-uploader__busy-name">
                {state.phase === 'uploading' ? state.filename : 'Preparing upload…'}
              </p>
              <div
                className="video-uploader__progress"
                role="progressbar"
                aria-live="polite"
                aria-valuenow={state.phase === 'uploading' ? state.percent : undefined}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <motion.span
                  className="video-uploader__progress-fill"
                  initial={false}
                  animate={{
                    width: state.phase === 'uploading'
                      ? `${state.percent}%`
                      : state.phase === 'inserting'
                        ? '100%'
                        : '20%',
                  }}
                  transition={{ type: 'spring', stiffness: 180, damping: 28 }}
                />
              </div>
              <p className="video-uploader__busy-label" aria-live="polite">
                {state.phase === 'validating' && 'Checking the file…'}
                {state.phase === 'uploading' && `Uploading ${state.percent}%`}
                {state.phase === 'inserting' && 'Saving to your library…'}
              </p>
            </motion.div>
          )}

          {state.phase === 'done' && (
            <motion.div
              key="done"
              className="video-uploader__done"
              role="status"
              aria-live="polite"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 24 }}
            >
              <CheckCircle size={32} weight="duotone" />
              <p><strong>{state.filename}</strong> is uploaded.</p>
              <button
                type="button"
                className="video-uploader__reset"
                onClick={() => setState({ phase: 'idle' })}
              >
                Upload another
              </button>
            </motion.div>
          )}

          {state.phase === 'error' && (
            <motion.div
              key="error"
              className="video-uploader__error"
              role="alert"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Warning size={28} weight="duotone" />
              <p>{state.message}</p>
              <button
                type="button"
                className="video-uploader__reset"
                onClick={() => setState({ phase: 'idle' })}
              >
                <X size={14} /> Try again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="video-uploader__hint">
        Uploads go to your private bucket. Viewers see a fresh signed link, not a public URL.
      </p>
    </div>
  );
}
