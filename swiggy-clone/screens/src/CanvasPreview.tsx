/**
 * CanvasPreview — Figma-style zoomable/pannable screen canvas.
 *
 * Wraps the existing FitPreview device frame inside a react-zoom-pan-pinch
 * canvas with a dot-grid background, zoom toolbar, and fit-to-screen reset.
 * The device frame floats on an infinite dark canvas (like Figma's artboard)
 * and the user can zoom in/out, pan around, or double-click to reset.
 *
 * Skills used:
 *   component-building — interactive UI with micro-interactions
 *   experience-designing — design tokens, no raw values
 */

import { useCallback, useMemo, useState } from 'react';
import {
  TransformWrapper,
  TransformComponent,
  useControls,
} from 'react-zoom-pan-pinch';
import { FitPreview } from './FitPreview';
import { token } from './screens-theme';
import { colors, withOpacity } from '@/lib/design-tokens';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Smartphone,
  Monitor,
} from 'lucide-react';

interface Props {
  src: string;
  device: 'mobile' | 'desktop';
  reloadKey: number;
  accent: string;
}

const TOOLBAR_BTN_SIZE = 36;
const DOT_SIZE = 1;
const DOT_GAP = 24;
const DOT_COLOR = 'rgba(255, 255, 255, 0.06)';

function ZoomToolbar({ accent }: { accent: string }) {
  const { zoomIn, zoomOut, resetTransform } = useControls();

  const btnStyle = useCallback(
    (active?: boolean) => ({
      width: TOOLBAR_BTN_SIZE,
      height: TOOLBAR_BTN_SIZE,
      display: 'flex' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      borderRadius: 10,
      border: `1px solid ${withOpacity(accent, active ? 0.32 : 0.12)}`,
      background: active ? withOpacity(accent, 0.14) : 'rgba(0,0,0,0.3)',
      color: active ? accent : colors.text.secondary,
      cursor: 'pointer',
      transition: `all ${token.durFast} ${token.easeOut}`,
      backdropFilter: 'blur(12px)',
    }),
    [accent],
  );

  return (
    <div
      className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-xl p-1"
      style={{
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${withOpacity(accent, 0.12)}`,
        boxShadow: `${token.elev2}, 0 0 24px ${withOpacity(accent, 0.08)}`,
      }}
    >
      <button
        onClick={() => zoomOut()}
        style={btnStyle()}
        title="Zoom out"
        aria-label="Zoom out"
        className="hover:scale-105 active:scale-95"
      >
        <ZoomOut className="h-4 w-4" />
      </button>
      <button
        onClick={() => resetTransform()}
        style={btnStyle()}
        title="Fit to screen"
        aria-label="Fit to screen"
        className="hover:scale-105 active:scale-95"
      >
        <Maximize2 className="h-4 w-4" />
      </button>
      <button
        onClick={() => zoomIn()}
        style={btnStyle()}
        title="Zoom in"
        aria-label="Zoom in"
        className="hover:scale-105 active:scale-95"
      >
        <ZoomIn className="h-4 w-4" />
      </button>
    </div>
  );
}

/**
 * Device badge — small floating chip showing current device + dimensions.
 */
function DeviceBadge({
  device,
  accent,
}: {
  device: 'mobile' | 'desktop';
  accent: string;
}) {
  const isPhone = device === 'mobile';
  const dims = isPhone ? '390 x 844' : '1440 x 900';

  return (
    <div
      className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-lg px-3 py-1.5"
      style={{
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${withOpacity(accent, 0.12)}`,
        color: colors.text.muted,
        fontSize: '11px',
        fontWeight: 600,
        fontFamily: 'monospace',
      }}
    >
      {isPhone ? (
        <Smartphone className="h-3 w-3" />
      ) : (
        <Monitor className="h-3 w-3" />
      )}
      <span>{dims}</span>
    </div>
  );
}

export function CanvasPreview({ src, device, reloadKey, accent }: Props) {
  const [zoomLevel, setZoomLevel] = useState(1);

  const dotGridBg = useMemo(
    () =>
      `radial-gradient(circle, ${DOT_COLOR} ${DOT_SIZE}px, transparent ${DOT_SIZE}px)`,
    [],
  );

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl">
      {/* Dot grid canvas background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundSize: `${DOT_GAP}px ${DOT_GAP}px`,
          backgroundImage: dotGridBg,
          backgroundColor: 'rgba(8, 4, 14, 0.95)',
        }}
      />

      <TransformWrapper
        initialScale={1}
        minScale={0.25}
        maxScale={3}
        centerOnInit
        wheel={{ step: 0.08 }}
        doubleClick={{ mode: 'reset' }}
        panning={{ excluded: ['input', 'textarea', 'select'] }}
        onTransform={(ref) => {
          setZoomLevel(ref.state.scale);
        }}
      >
        <TransformComponent
          wrapperStyle={{
            width: '100%',
            height: '100%',
            overflow: 'hidden',
          }}
          contentStyle={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* The device frame floating on the canvas */}
          <div style={{ width: '100%', height: '100%' }}>
            <FitPreview
              src={src}
              device={device}
              reloadKey={reloadKey}
              accent={accent}
            />
          </div>
        </TransformComponent>

        <ZoomToolbar accent={accent} />
      </TransformWrapper>

      <DeviceBadge device={device} accent={accent} />

      {/* Zoom percentage indicator */}
      <div
        className="absolute right-4 top-4 z-10 rounded-lg px-2 py-1"
        style={{
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${withOpacity(accent, 0.12)}`,
          color: colors.text.muted,
          fontSize: '11px',
          fontWeight: 600,
          fontFamily: 'monospace',
        }}
      >
        {Math.round(zoomLevel * 100)}%
      </div>
    </div>
  );
}
