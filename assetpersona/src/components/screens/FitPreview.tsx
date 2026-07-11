/**
 * FitPreview — scale-to-fit LIVE + INTERACTIVE screen preview in a premium
 * glass device frame.
 *
 * Renders the screen at a real device viewport (Phone 390×844 / Desktop
 * 1200×800) and CSS-scales it to "contain" inside the available area. The
 * scaled iframe stays fully interactive — clicks map to the content, links
 * navigate inside the frame — so it reads like the real device, just sized
 * to fit.
 *
 * The frame is glass material: brushed-metal body, bezel specular ring,
 * diagonal glass reflection sweep, and brand-tinted ambient glow — all
 * driven by Asset Persona's --screens-* CSS custom properties.
 */

import { useEffect, useRef, useState } from 'react';

/* ── Device presets ─────────────────────────────────────────────── */
const DEVICE = {
  mobile:  { w: 390, h: 844,  label: 'Phone' },
  tablet:  { w: 768, h: 1024, label: 'Tablet' },
  desktop: { w: 1200, h: 800, label: 'Desktop' },
} as const;

/* ── Props ──────────────────────────────────────────────────────── */
interface FitPreviewProps {
  src: string;
  device: 'mobile' | 'desktop' | 'tablet';
  title?: string;
  /** Bump to force the iframe to remount/reload. */
  iframeKey?: number;
}

/* ── Elevation / specular tokens (inline, no external theme file) ─ */
const elev3 = '0 8px 24px rgba(0,0,0,0.6), 0 32px 80px rgba(0,0,0,0.6)';
const elev4 = '0 12px 32px rgba(0,0,0,0.7), 0 48px 100px rgba(0,0,0,0.65)';
const specular      = 'inset 0 1px 0 rgba(255,255,255,0.10)';
const specularStrong = 'inset 0 1px 0 rgba(255,255,255,0.16)';
const insetPress     = 'inset 0 0 0 1px rgba(0,0,0,0.4), inset 0 2px 4px rgba(0,0,0,0.5)';

/* ── Brand accent (Asset Persona teal) ─────────────────────────── */
const ACCENT = '#389bc1';

function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  if (h.length !== 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* ── Component ──────────────────────────────────────────────────── */
export default function FitPreview({
  src,
  device,
  title = 'Screen preview',
  iframeKey,
}: FitPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });

  /* Observe available space so we can compute contain-fit scale */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      for (const e of entries) {
        setBox({ w: e.contentRect.width, h: e.contentRect.height });
      }
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

  // Phone can scale up to fill panel height; desktop barely upscales.
  const maxScale = isPhone ? 2.4 : 1.1;
  const scale = box.w
    ? Math.min((box.w - pad * 2) / totalW, (box.h - pad * 2) / totalH, maxScale)
    : 0;

  /* Brand-tinted hairline + ambient glow */
  const accentEdge = withAlpha(ACCENT, 0.22);
  const accentGlow = withAlpha(ACCENT, 0.18);

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <div
      ref={containerRef}
      className="screens-fit-container"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {scale > 0 ? (
        <div
          className="screens-fit-scaled-wrapper"
          style={{
            width: totalW * scale,
            height: totalH * scale,
            flexShrink: 0,
          }}
        >
          {/* ── Device body (brushed-metal / glass) ────────────── */}
          <div
            className="screens-fit-body"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              width: totalW,
              height: totalH,
              position: 'relative',
              background: isPhone
                ? 'linear-gradient(155deg, rgba(60,52,80,0.95) 0%, rgba(20,12,30,0.98) 46%, rgba(8,4,14,1) 100%)'
                : 'linear-gradient(160deg, rgba(34,26,48,0.96), rgba(10,4,18,1))',
              borderRadius: isPhone ? 58 : 14,
              padding: bezel,
              border: `1px solid ${accentEdge}`,
              boxShadow: isPhone
                ? `${elev4}, ${specularStrong}, 0 0 0 1px ${withAlpha(ACCENT, 0.1)}, 0 0 60px ${accentGlow}`
                : `${elev3}, ${specular}, 0 0 48px ${accentGlow}`,
            }}
          >
            {/* Inner bezel ring */}
            <div
              className="screens-fit-bezel"
              style={{
                position: 'absolute',
                inset: bezel - 2,
                borderRadius: isPhone ? 46 : 9,
                pointerEvents: 'none',
                boxShadow: insetPress,
                zIndex: 1,
              }}
            />

            {/* Diagonal glass reflection sweep */}
            <div
              className="screens-fit-reflection"
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

            {/* ── Desktop chrome bar ──────────────────────────── */}
            {!isPhone && (
              <div
                className="screens-fit-chrome"
                style={{
                  position: 'absolute',
                  top: bezel,
                  left: bezel,
                  right: bezel,
                  height: 36,
                  background: 'rgba(22,18,32,0.92)',
                  borderRadius: '7px 7px 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 14px',
                  gap: 8,
                  zIndex: 5,
                  borderBottom: '1px solid var(--screens-border, rgba(255,255,255,0.05))',
                }}
              >
                {/* Traffic-light dots */}
                {(['#ff5f57', '#febc2e', '#28c840'] as const).map((c, i) => (
                  <div
                    key={i}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: c,
                      opacity: 0.85,
                      marginRight: i === 2 ? 12 : 0,
                    }}
                  />
                ))}
                {/* URL bar */}
                <div
                  style={{
                    flex: 1,
                    height: 22,
                    borderRadius: 6,
                    background: 'rgba(0,0,0,0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 10px',
                    fontSize: 10,
                    fontFamily: 'monospace',
                    color: 'var(--screens-text-muted, #9d8190)',
                    letterSpacing: '0.02em',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {src}
                </div>
              </div>
            )}

            {/* ── Iframe (interactive, not pointer-events: none) ─ */}
            <iframe
              key={iframeKey}
              src={src}
              title={title}
              style={{
                width: d.w,
                height: isPhone ? d.h : d.h - 36,
                border: 'none',
                borderRadius: isPhone ? 44 : '0 0 7px 7px',
                background: '#000',
                display: 'block',
                marginTop: isPhone ? 0 : 36,
              }}
            />

            {/* ── Phone-only decorations ─────────────────────── */}
            {isPhone && (
              <>
                {/* Dynamic Island pill */}
                <div
                  className="screens-fit-island"
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
                {/* Home indicator bar */}
                <div
                  className="screens-fit-home-indicator"
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
                {/* Side button (power) — physical material detail */}
                <div
                  className="screens-fit-side-btn"
                  style={{
                    position: 'absolute',
                    top: 168,
                    right: -2,
                    width: 3,
                    height: 64,
                    borderRadius: 2,
                    background:
                      'linear-gradient(180deg, rgba(80,70,98,0.9), rgba(30,22,40,0.9))',
                    zIndex: 2,
                  }}
                />
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
