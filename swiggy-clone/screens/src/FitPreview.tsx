/**
 * FitPreview — scale-to-fit LIVE + INTERACTIVE screen preview in a premium
 * glass device frame.
 *
 * Frank's requirement: the previewed screen must FIT in the panel (no
 * scrolling the canvas box to see it) AND stay clickable so he can "feel the
 * experience." So we render the screen at a real device viewport (Phone
 * 390×844 / Desktop 1440×900) and CSS-scale it to "contain" inside the
 * available area. A scaled iframe is still fully interactive — clicks map to
 * the content, links navigate inside the frame — so it reads like the real
 * device, just sized to fit. The screen's own content can still scroll inside
 * the frame (like a real phone), but the FRAME never makes the panel scroll.
 *
 * The frame itself is glass material: the body edge, bezel specular, and
 * ambient brand glow are composed from Contract-2 tokens (screens-theme.ts) so
 * the device reads as a real, premium object rather than a flat black rect. The
 * `state` query already lives on `src` (the parent appends `&state=<id>`), so a
 * state switch flows straight through to the iframe.
 */

import { useEffect, useRef, useState } from 'react';
import { token } from './screens-theme';
import { useLiveReload } from './LiveReload';

const DEVICE = {
  mobile: { w: 390, h: 844, label: 'Phone' },
  desktop: { w: 1440, h: 900, label: 'Desktop' },
} as const;

interface Props {
  src: string;
  device: 'mobile' | 'desktop';
  /** Bump to force the iframe to reload. */
  reloadKey: number;
  accent: string;
}

export function FitPreview({ src, device, reloadKey, accent }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { registerIframe, unregisterIframe } = useLiveReload();
  const [box, setBox] = useState({ w: 0, h: 0 });

  useEffect(() => {
    registerIframe(iframeRef);
    return () => unregisterIframe(iframeRef);
  }, [registerIframe, unregisterIframe]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      for (const e of entries) setBox({ w: e.contentRect.width, h: e.contentRect.height });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const d = DEVICE[device];
  const isPhone = device === 'mobile';
  const bezel = isPhone ? 14 : 6;
  const totalW = d.w + bezel * 2;
  const totalH = d.h + bezel * 2;
  const pad = 16;
  // Let the phone scale UP to fill the panel height (it was too small capped at
  // 1×). Desktop barely upscales. Still "contain" so it never overflows/scrolls.
  const maxScale = isPhone ? 2.4 : 1.1;
  const scale = box.w
    ? Math.min((box.w - pad * 2) / totalW, (box.h - pad * 2) / totalH, maxScale)
    : 0;

  /* Brand-tinted hairline + ambient glow, both from the glass mint token. */
  const accentEdge = withAlpha(accent, 0.22);
  const accentGlow = withAlpha(accent, 0.18);

  const iframe = (
    <iframe
      ref={iframeRef}
      key={reloadKey}
      src={src}
      title="Screen preview"
      style={{
        width: d.w,
        height: d.h,
        border: 'none',
        borderRadius: isPhone ? 44 : 7,
        background: '#000',
        display: 'block',
      }}
    />
  );

  return (
    <div ref={ref} className="flex h-full w-full items-center justify-center overflow-hidden">
      {scale > 0 ? (
        <div style={{ width: totalW * scale, height: totalH * scale, flexShrink: 0 }}>
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              width: totalW,
              height: totalH,
              position: 'relative',
              // Brushed-metal/glass body edge: a lit top-left gradient over the
              // deep dark base so the frame catches light like real material.
              background: isPhone
                ? 'linear-gradient(155deg, rgba(60,52,80,0.95) 0%, rgba(20,12,30,0.98) 46%, rgba(8,4,14,1) 100%)'
                : 'linear-gradient(160deg, rgba(34,26,48,0.96), rgba(10,4,18,1))',
              borderRadius: isPhone ? 58 : 14,
              padding: bezel,
              border: `1px solid ${accentEdge}`,
              // Layered depth (token elevation) + inner specular (the premium
              // tell) + a brand-tinted ambient glow halo, all tokenized.
              boxShadow: isPhone
                ? `${token.elev4}, ${token.specularStrong}, 0 0 0 1px ${withAlpha(accent, 0.1)}, 0 0 60px ${accentGlow}`
                : `${token.elev3}, ${token.specular}, 0 0 48px ${accentGlow}`,
            }}
          >
            {/* Inner bezel ring — separates the lit body from the black screen. */}
            <div
              style={{
                position: 'absolute',
                inset: bezel - 2,
                borderRadius: isPhone ? 46 : 9,
                pointerEvents: 'none',
                boxShadow: token.insetPress,
                zIndex: 1,
              }}
            />
            {/* Diagonal glass reflection sweep across the body. */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: isPhone ? 58 : 14,
                pointerEvents: 'none',
                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.02) 22%, transparent 46%)',
                zIndex: 3,
                mixBlendMode: 'screen',
              }}
            />
            {iframe}
            {isPhone ? (
              <>
                {/* Dynamic island */}
                <div
                  style={{
                    position: 'absolute',
                    top: bezel + 9,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 116,
                    height: 30,
                    background: '#000',
                    borderRadius: 18,
                    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
                    zIndex: 4,
                  }}
                />
                {/* Home indicator */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: bezel + 8,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 132,
                    height: 5,
                    background: 'rgba(255,255,255,0.55)',
                    borderRadius: 3,
                    zIndex: 4,
                  }}
                />
                {/* Side button (power) — physical material detail on the edge. */}
                <div
                  style={{
                    position: 'absolute',
                    top: 168,
                    right: -2,
                    width: 3,
                    height: 64,
                    borderRadius: 2,
                    background: 'linear-gradient(180deg, rgba(80,70,98,0.9), rgba(30,22,40,0.9))',
                    zIndex: 2,
                  }}
                />
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Add an alpha channel to a #rrggbb hex. Local helper so the frame's
 * brand-tinted edges derive from the single `accent` token passed in (no raw
 * color values introduced here).
 */
function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  if (h.length !== 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
