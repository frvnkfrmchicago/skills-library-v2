import { useCallback, useRef, useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import type {
  DesignDraft,
  DesignLayer,
  DesignTool,
  AnnotationLayer,
  AssetKind,
} from '@/lib/design-queue/types';
import { PHONE_FRAME } from '@/lib/design-queue/types';
import {
  createAssetFromFile,
  layerPreviewSrc,
  nextAssetFilename,
} from '@/lib/design-queue/assets';
import { defaultPinLayer, defaultTextLayer } from '@/lib/design-queue/store';

interface Props {
  draft: DesignDraft;
  artboardId: string;
  tool: DesignTool;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChangeLayers: (layers: DesignDraft['layers']) => void;
  onChangeDraft: (patch: Partial<DesignDraft>) => void;
}

function LayerView({
  draft,
  layer,
  selected,
  onSelect,
  onDrag,
  zoomScale,
}: {
  draft: DesignDraft;
  layer: DesignLayer;
  selected: boolean;
  onSelect: () => void;
  onDrag: (dx: number, dy: number) => void;
  zoomScale: number;
}) {
  const drag = useRef<{ x: number; y: number } | null>(null);
  const movedRef = useRef(false);

  const onLayerClick = (e: React.MouseEvent) => {
    // Prevent the canvas background click handler from running after a drag.
    if (movedRef.current) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onSelect();
    movedRef.current = false;
    drag.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const rawDx = e.clientX - drag.current.x;
    const rawDy = e.clientY - drag.current.y;
    movedRef.current = movedRef.current || Math.hypot(rawDx, rawDy) > 2;
    const denom = Math.max(zoomScale, 0.0001);
    const dx = rawDx / denom;
    const dy = rawDy / denom;
    drag.current = { x: e.clientX, y: e.clientY };
    onDrag(dx, dy);
  };

  const onPointerUp = () => {
    drag.current = null;
  };

  const { x, y, width, height } = layer.frame;
  const border = selected ? '2px solid rgba(120, 255, 200, 0.9)' : '1px solid transparent';

  if (layer.type === 'image') {
    const src = layerPreviewSrc(draft, layer.assetId, layer.src);
    return (
      <div
        className="ds-layer-interactive"
        style={{ position: 'absolute', left: x, top: y, width, height, border, cursor: 'move' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={onLayerClick}
      >
        <img
          src={src}
          alt=""
          className="h-full w-full pointer-events-none"
          style={{ objectFit: layer.objectFit ?? 'cover' }}
          draggable={false}
        />
      </div>
    );
  }

  if (layer.type === 'video') {
    const src = layerPreviewSrc(draft, layer.assetId, layer.src);
    return (
      <div
        className="ds-layer-interactive"
        style={{ position: 'absolute', left: x, top: y, width, height, border, cursor: 'move' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={onLayerClick}
      >
        <video
          src={src}
          className="h-full w-full bg-black object-cover"
          controls
          muted={layer.muted ?? true}
          playsInline
        />
      </div>
    );
  }

  if (layer.type === 'audio') {
    const src = layerPreviewSrc(draft, layer.assetId, layer.src);
    return (
      <div
        className="ds-layer-interactive"
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: Math.max(width, 200),
          border,
          cursor: 'move',
          padding: 8,
          background: 'rgba(10,6,16,0.85)',
          borderRadius: 8,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={onLayerClick}
      >
        <audio src={src} controls className="w-full" />
      </div>
    );
  }

  if (layer.type === 'text') {
    return (
      <div
        className="ds-layer-interactive"
        style={{
          position: 'absolute',
          left: x,
          top: y,
          minWidth: width,
          border,
          cursor: 'move',
          fontSize: layer.fontSize,
          fontWeight: layer.fontWeight,
          fontFamily: layer.fontFamily,
          color: layer.color,
          lineHeight: 1.2,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={onLayerClick}
      >
        {layer.content}
      </div>
    );
  }

  const ann = layer as AnnotationLayer;
  if (ann.kind === 'pin') {
    return (
      <div
        className="ds-layer-interactive"
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: '#78ffc8',
          color: '#0a0610',
          fontSize: 11,
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border,
          cursor: 'move',
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={onLayerClick}
      >
        {ann.text}
      </div>
    );
  }

  if (ann.kind === 'arrow' && ann.endX != null && ann.endY != null) {
    const x1 = x + 12;
    const y1 = y + 12;
    return (
      <svg
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: PHONE_FRAME.w,
          height: PHONE_FRAME.h,
          pointerEvents: 'none',
        }}
      >
        <line x1={x1} y1={y1} x2={ann.endX} y2={ann.endY} stroke="#78ffc8" strokeWidth={2} />
      </svg>
    );
  }

  return (
    <div
      className="ds-layer-interactive"
      style={{
        position: 'absolute',
        left: x,
        top: y,
        maxWidth: 220,
        padding: '8px 10px',
        background: 'rgba(10,6,16,0.92)',
        border: selected ? '2px solid rgba(120,255,200,0.9)' : '1px solid rgba(255,255,255,0.2)',
        borderRadius: 8,
        color: '#FFF5EB',
        fontSize: 12,
        cursor: 'move',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onClick={onLayerClick}
    >
      {ann.text}
    </div>
  );
}

export function DesignCanvas({
  draft,
  artboardId,
  tool,
  selectedId,
  onSelect,
  onChangeLayers,
  onChangeDraft,
}: Props) {
  const visibleLayers = draft.layers.filter((l) => l.artboardId === artboardId);
  const fileRef = useRef<HTMLInputElement>(null);
  const [mediaKind, setMediaKind] = useState<AssetKind>('image');
  const [arrowStart, setArrowStart] = useState<{ x: number; y: number } | null>(null);
  const [zoomScale, setZoomScale] = useState(1);

  const moveLayer = useCallback(
    (id: string, dx: number, dy: number) => {
      onChangeLayers(
        draft.layers.map((l) =>
          l.id === id ? { ...l, frame: { ...l.frame, x: l.frame.x + dx, y: l.frame.y + dy } } : l,
        ),
      );
    },
    [draft.layers, onChangeLayers],
  );

  const addLayer = useCallback(
    (layer: DesignLayer) => {
      onChangeLayers([...draft.layers, layer]);
      onSelect(layer.id);
    },
    [draft.layers, onChangeLayers, onSelect],
  );

  const addMediaFromFile = (file: File, kind: AssetKind) => {
    const reader = new FileReader();
    reader.onload = () => {
      const previewSrc = String(reader.result);
      const filename = nextAssetFilename(draft, kind);
      const asset = createAssetFromFile(draft.id, file, kind, previewSrc, filename);
      const assets = [...draft.assets, asset];
      const id = `${kind}-${Date.now().toString(36)}`;
      if (kind === 'image') {
        addLayer({
          type: 'image',
          id,
          artboardId,
          frame: { x: 24, y: 120, width: 342, height: 200 },
          assetId: asset.id,
          src: previewSrc,
          label: file.name,
          objectFit: 'cover',
        });
      } else if (kind === 'video') {
        addLayer({
          type: 'video',
          id,
          artboardId,
          frame: { x: 24, y: 200, width: 342, height: 192 },
          assetId: asset.id,
          src: previewSrc,
          muted: true,
        });
      } else {
        addLayer({
          type: 'audio',
          id,
          artboardId,
          frame: { x: 24, y: 400, width: 280, height: 48 },
          assetId: asset.id,
          src: previewSrc,
          label: file.name,
        });
      }
      onChangeDraft({ assets });
    };
    reader.readAsDataURL(file);
  };

  const handleArtboardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (tool === 'select') {
      onSelect(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === 'text') {
      addLayer(defaultTextLayer(artboardId, x, y));
      return;
    }
    if (tool === 'pin') {
      const n =
        draft.layers.filter(
          (l) => l.artboardId === artboardId && l.type === 'annotation' && l.kind === 'pin',
        ).length + 1;
      addLayer(defaultPinLayer(artboardId, x, y, n));
      return;
    }
    if (tool === 'callout') {
      addLayer({
        type: 'annotation',
        id: `callout-${Date.now().toString(36)}`,
        artboardId,
        frame: { x, y, width: 180, height: 48 },
        kind: 'callout',
        text: 'Annotation',
      });
      return;
    }
    if (tool === 'arrow') {
      if (!arrowStart) {
        setArrowStart({ x, y });
        return;
      }
      addLayer({
        type: 'annotation',
        id: `arrow-${Date.now().toString(36)}`,
        artboardId,
        frame: { x: arrowStart.x, y: arrowStart.y, width: 24, height: 24 },
        kind: 'arrow',
        text: '',
        endX: x,
        endY: y,
      });
      setArrowStart(null);
    }
  };

  const openFilePicker = (kind: AssetKind) => {
    setMediaKind(kind);
    fileRef.current?.click();
  };

  const accept =
    mediaKind === 'image' ? 'image/*' : mediaKind === 'video' ? 'video/*' : 'audio/*';

  return (
    <div className="relative h-full min-h-0 flex-1">
      <input
        ref={fileRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) addMediaFromFile(f, mediaKind);
          e.target.value = '';
        }}
      />
      {(tool === 'image' || tool === 'video' || tool === 'audio') && (
        <button
          type="button"
          className="absolute left-3 top-3 z-20 rounded-lg px-3 py-1.5 text-[12px] font-semibold"
          style={{ background: 'rgba(120,255,200,0.2)', color: '#78ffc8' }}
          onClick={() =>
            openFilePicker(tool === 'image' ? 'image' : tool === 'video' ? 'video' : 'audio')
          }
        >
          Upload {tool}
        </button>
      )}
      <TransformWrapper
        minScale={0.35}
        maxScale={2.5}
        initialScale={0.85}
        centerOnInit
        panning={{ excluded: ['.ds-layer-interactive', 'input', 'textarea', 'select'] }}
        onTransform={(ref) => {
          setZoomScale(ref.state.scale);
        }}
      >
        <TransformComponent
          wrapperClass="!h-full !w-full"
          contentClass="!h-full !w-full flex items-center justify-center"
        >
          <div
            className="relative shadow-2xl"
            style={{
              width: PHONE_FRAME.w,
              height: PHONE_FRAME.h,
              background: '#fff',
              borderRadius: 32,
              boxShadow: '0 24px 80px rgba(0,0,0,0.45)',
            }}
            onClick={handleArtboardClick}
            role="presentation"
          >
            {visibleLayers.map((layer) => (
              <LayerView
                key={layer.id}
                draft={draft}
                layer={layer}
                selected={selectedId === layer.id}
                onSelect={() => onSelect(layer.id)}
                onDrag={(dx, dy) => moveLayer(layer.id, dx, dy)}
                zoomScale={zoomScale}
              />
            ))}
            {arrowStart && (
              <div
                className="pointer-events-none absolute h-3 w-3 rounded-full"
                style={{ left: arrowStart.x - 6, top: arrowStart.y - 6, background: '#78ffc8' }}
              />
            )}
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
