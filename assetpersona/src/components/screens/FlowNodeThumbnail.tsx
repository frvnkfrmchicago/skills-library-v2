/**
 * FlowNodeThumbnail — tiny live iframe preview inside a FlowChart node.
 */

import { useEffect, useMemo, useRef } from 'react';
import { useLiveReload } from './LiveReload';

interface Props {
  path: string;
}

const PHONE_W = 390;
const PHONE_H = 844;
const THUMB_W = 70;
const THUMB_H = Math.round((PHONE_H / PHONE_W) * THUMB_W);

export function FlowNodeThumbnail({ path }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { registerIframe, unregisterIframe } = useLiveReload();

  useEffect(() => {
    registerIframe(iframeRef);
    return () => unregisterIframe(iframeRef);
  }, [registerIframe, unregisterIframe]);

  const src = useMemo(() => {
    const params = new URLSearchParams({ screen: path });
    return `/index.html?${params.toString()}`;
  }, [path]);

  const scale = THUMB_W / PHONE_W;

  return (
    <div
      className="shrink-0 overflow-hidden rounded"
      style={{
        width: THUMB_W,
        height: THUMB_H,
        background: '#000',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 6,
      }}
    >
      <iframe
        ref={iframeRef}
        src={src}
        title={path}
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
  );
}
