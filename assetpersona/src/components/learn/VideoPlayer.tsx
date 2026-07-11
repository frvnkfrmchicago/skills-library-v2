/* ═══ VideoPlayer — lazy-mount video element ═══
 *
 * Wraps a native <video controls preload="metadata"> tag so we get all the
 * accessibility + platform behavior for free (captions menu, picture-in-picture,
 * mobile fullscreen). Lazy-loads via IntersectionObserver: the <video> element
 * doesn't mount its `src` until the wrapper enters the viewport. This keeps
 * a list-of-clips page from issuing a metadata fetch for every clip on first
 * paint.
 *
 * Tokens-only styling. Reduced-motion honored by the CSS (no auto motion).
 */
import { useEffect, useRef, useState } from 'react';
import './VideoPlayer.css';

interface Props {
  /** Direct playable URL (signed URL from `videos` bucket, or an external mp4/webm). */
  videoUrl: string;
  /** Optional poster image while the clip is paused / loading. */
  posterUrl?: string;
  /** Aspect ratio, e.g. '16 / 9' (default) or '9 / 16' for vertical. */
  aspectRatio?: string;
  /** Maximum width in px or CSS units. Default: full container width. */
  maxWidth?: number | string;
  /** Optional accessible title for the video. */
  title?: string;
  /** Optional MIME hint (helps Safari pick the right decoder). */
  mimeType?: string;
}

export default function VideoPlayer({
  videoUrl,
  posterUrl,
  aspectRatio = '16 / 9',
  maxWidth,
  title,
  mimeType,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const node = wrapperRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      // No observer available — just mount eagerly.
      setActive(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setActive(true);
          observer.disconnect();
        }
      },
      { rootMargin: '160px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const style: React.CSSProperties = {
    aspectRatio,
    maxWidth: maxWidth ?? '100%',
  };

  return (
    <div ref={wrapperRef} className="video-player" style={style} aria-label={title}>
      {active ? (
        <video
          className="video-player__el"
          controls
          preload="metadata"
          playsInline
          poster={posterUrl}
          aria-label={title}
        >
          <source src={videoUrl} type={mimeType ?? undefined} />
          Your browser does not support embedded video.
        </video>
      ) : (
        <div
          className="video-player__placeholder"
          role="img"
          aria-label={title ? `${title} (video not yet loaded)` : 'Video preview'}
          style={posterUrl ? { backgroundImage: `url(${posterUrl})` } : undefined}
        >
          <span className="video-player__placeholder-dot" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
