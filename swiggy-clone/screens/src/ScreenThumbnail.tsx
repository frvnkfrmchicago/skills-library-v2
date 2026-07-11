/**
 * ScreenThumbnail — scrollable Figma-like preview for the sidebar.
 * Parent unmounts this entirely when previews are hidden (text-only rows).
 */

import { useEffect, useMemo, useRef, type CSSProperties } from 'react';
import { colors, withOpacity } from '@/lib/design-tokens';
import { useLiveReload } from './LiveReload';

interface Props {
  path: string;
  isActive: boolean;
  accent: string;
}

const PHONE_W = 390;
const PHONE_H = 844;
const THUMB_W = 52;
const VIEWPORT_H = 112;
const scale = THUMB_W / PHONE_W;
const SCALED_H = Math.ceil(PHONE_H * scale);

export function ScreenThumbnail({ path, isActive, accent }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { registerIframe, unregisterIframe } = useLiveReload();

  useEffect(() => {
    registerIframe(iframeRef);
    return () => unregisterIframe(iframeRef);
  }, [registerIframe, unregisterIframe]);

  const src = useMemo(() => {
    const params = new URLSearchParams({ screen: path });
    return `http://localhost:8080/index.html?${params.toString()}`;
  }, [path]);

  const frameStyle: CSSProperties = {
    width: THUMB_W,
    height: VIEWPORT_H,
    border: `1px solid ${isActive ? withOpacity(accent, 0.4) : withOpacity(colors.text.primary, 0.1)}`,
    background: '#000',
    boxShadow: isActive ? `0 0 8px ${withOpacity(accent, 0.3)}` : 'none',
    transition: 'all 160ms cubic-bezier(0, 0, 0.2, 1)',
    scrollbarWidth: 'thin',
  };

  return (
    <div
      className="relative shrink-0 overflow-y-auto overflow-x-hidden rounded-md"
      style={frameStyle}
    >
      <div style={{ width: THUMB_W, height: SCALED_H, position: 'relative' }}>
        <iframe
          ref={iframeRef}
          src={src}
          title={`Preview of ${path}`}
          style={{
            width: PHONE_W,
            height: PHONE_H,
            border: 'none',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            pointerEvents: 'none',
            background: '#000',
            display: 'block',
          }}
        />
      </div>
    </div>
  );
}
