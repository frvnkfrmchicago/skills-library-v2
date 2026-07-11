/**
 * CanvasPreview — Figma-style zoomable/pannable screen canvas.
 *
 * Wraps the FitPreview device frame in a manually-implemented zoom canvas
 * (no react-zoom-pan-pinch). Uses state + wheel events for zoom, drag-to-pan
 * when zoomed in, double-click to reset. Features a dot-grid background,
 * glass zoom toolbar, device badge, and zoom percentage indicator.
 *
 * All styling uses inline styles or `screens-canvas-` prefixed classes to
 * avoid collisions with the broader Asset Persona stylesheet.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type WheelEvent as ReactWheelEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import FitPreview from './FitPreview';
import {
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  ArrowsInSimple,
  DeviceMobile,
  Desktop,
} from '@phosphor-icons/react';

/* ── Constants ──────────────────────────────────────────────────── */
const ZOOM_MIN = 0.25;
const ZOOM_MAX = 2.5;
const ZOOM_STEP = 0.15;
const CANVAS_BG = '#080a0e';
const TOOLBAR_BTN = 36;

const VIEWPORTS = {
  mobile:  { w: 390,  h: 844 },
  tablet:  { w: 768,  h: 1024 },
  desktop: { w: 1200, h: 800 },
} as const;

/* ── Props ──────────────────────────────────────────────────────── */
interface CanvasPreviewProps {
  src: string;
  device: 'mobile' | 'desktop' | 'tablet';
  title?: string;
  iframeKey?: number;
}

/* ── Clamp helper ───────────────────────────────────────────────── */
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/* ── Component ──────────────────────────────────────────────────── */
export default function CanvasPreview({
  src,
  device,
  title,
  iframeKey,
}: CanvasPreviewProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);



  /* ── Zoom via ctrl/meta + wheel ──────────────────────────────── */
  const handleWheel = useCallback(
    (e: ReactWheelEvent<HTMLDivElement>) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setZoomLevel((z) => clamp(z + delta, ZOOM_MIN, ZOOM_MAX));
    },
    [],
  );

  /* Prevent native pinch-zoom on the container */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const prevent = (e: globalThis.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) e.preventDefault();
    };
    el.addEventListener('wheel', prevent, { passive: false });
    return () => el.removeEventListener('wheel', prevent);
  }, []);

  /* ── Drag-to-pan ─────────────────────────────────────────────── */
  const handleMouseDown = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      // Only start panning if zoomed in and on the canvas background
      if (zoomLevel <= 1) return;
      isPanning.current = true;
      lastMouse.current = { x: e.clientX, y: e.clientY };
    },
    [zoomLevel],
  );

  const handleMouseMove = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (!isPanning.current) return;
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      lastMouse.current = { x: e.clientX, y: e.clientY };
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
    },
    [],
  );

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  /* ── Double-click resets ─────────────────────────────────────── */
  const handleDoubleClick = useCallback(() => {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  }, []);

  /* ── Toolbar actions ─────────────────────────────────────────── */
  const zoomIn = useCallback(() => {
    setZoomLevel((z) => clamp(z + ZOOM_STEP, ZOOM_MIN, ZOOM_MAX));
  }, []);

  const zoomOut = useCallback(() => {
    setZoomLevel((z) => clamp(z - ZOOM_STEP, ZOOM_MIN, ZOOM_MAX));
  }, []);

  const fitToScreen = useCallback(() => {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  }, []);

  /* ── Viewport dimensions text ────────────────────────────────── */
  const vp = VIEWPORTS[device];
  const dimsText = `${vp.w} × ${vp.h}`;
  const DeviceIcon = device === 'desktop' ? Desktop : DeviceMobile;

  /* ── Shared glass chip style ─────────────────────────────────── */
  const chipStyle: React.CSSProperties = {
    background: 'rgba(0,0,0,0.50)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid var(--screens-border, rgba(255,255,255,0.05))',
    color: 'var(--screens-text-muted, #9d8190)',
    fontSize: 11,
    fontWeight: 600,
    fontFamily: 'monospace',
  };

  const toolbarBtnStyle: React.CSSProperties = {
    width: TOOLBAR_BTN,
    height: TOOLBAR_BTN,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    border: '1px solid var(--screens-border, rgba(255,255,255,0.05))',
    background: 'rgba(0,0,0,0.30)',
    color: 'var(--screens-text-muted, #9d8190)',
    cursor: 'pointer',
    transition: 'all 0.18s ease',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    padding: 0,
  };

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <div
      ref={containerRef}
      className="screens-canvas-root"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        borderRadius: 12,
        cursor: zoomLevel > 1 ? (isPanning.current ? 'grabbing' : 'grab') : 'default',
        userSelect: 'none',
      }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDoubleClick={handleDoubleClick}
    >
      {/* ── Solid background ─────────────────────────────────── */}
      <div
        className="screens-canvas-dots"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: CANVAS_BG,
        }}
      />

      {/* ── Zoomable content area ────────────────────────────── */}
      <div
        className="screens-canvas-transform"
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`,
          transition: isPanning.current ? 'none' : 'transform 0.22s cubic-bezier(0.16,1,0.3,1)',
          transformOrigin: 'center center',
          willChange: 'transform',
        }}
      >
        {/* FitPreview device frame floating on the canvas */}
        <div style={{ width: '100%', height: '100%' }}>
          <FitPreview
            src={src}
            device={device}
            title={title}
            iframeKey={iframeKey}
          />
        </div>
      </div>

      {/* ── Device badge (top-left) ──────────────────────────── */}
      <div
        className="screens-canvas-device-badge"
        style={{
          ...chipStyle,
          position: 'absolute',
          left: 16,
          top: 16,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          borderRadius: 8,
          padding: '6px 12px',
        }}
      >
        <DeviceIcon size={14} weight="bold" />
        <span>{dimsText}</span>
      </div>

      {/* ── Zoom percentage (top-right) ──────────────────────── */}
      <div
        className="screens-canvas-zoom-pct"
        style={{
          ...chipStyle,
          position: 'absolute',
          right: 16,
          top: 16,
          zIndex: 10,
          borderRadius: 8,
          padding: '6px 10px',
        }}
      >
        {Math.round(zoomLevel * 100)}%
      </div>

      {/* ── Zoom toolbar (bottom-right) ──────────────────────── */}
      <div
        className="screens-canvas-toolbar"
        style={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          borderRadius: 12,
          padding: 4,
          background: 'rgba(0,0,0,0.50)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--screens-border, rgba(255,255,255,0.05))',
          boxShadow: 'var(--screens-elev-2, 0 4px 12px rgba(0,0,0,0.5))',
        }}
      >
        <button
          onClick={(e) => { e.stopPropagation(); zoomIn(); }}
          style={toolbarBtnStyle}
          title="Zoom in"
          aria-label="Zoom in"
          className="screens-canvas-toolbar-btn"
        >
          <MagnifyingGlassPlus size={16} weight="bold" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); zoomOut(); }}
          style={toolbarBtnStyle}
          title="Zoom out"
          aria-label="Zoom out"
          className="screens-canvas-toolbar-btn"
        >
          <MagnifyingGlassMinus size={16} weight="bold" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); fitToScreen(); }}
          style={toolbarBtnStyle}
          title="Fit to screen"
          aria-label="Fit to screen"
          className="screens-canvas-toolbar-btn"
        >
          <ArrowsInSimple size={16} weight="bold" />
        </button>
      </div>
    </div>
  );
}
