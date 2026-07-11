/** Design Studio + agent queue contract v2 (machine + human handoff). */

export type QueueStatus = 'draft' | 'ready' | 'in_build' | 'shipped' | 'archived';

export type DesignTool =
  | 'select'
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'pin'
  | 'arrow'
  | 'callout';

export type AssetKind = 'image' | 'video' | 'audio';

export const PHONE_FRAME = { w: 390, h: 844 } as const;

export interface ArtboardDef {
  id: string;
  label: string;
}

export interface LayerFrame {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

/** On-disk asset under design-queue/<draftId>/assets/ */
export interface AssetRef {
  id: string;
  /** Repo-relative path, e.g. design-queue/foo/assets/hero.png */
  path: string;
  mime: string;
  kind: AssetKind;
  originalName: string;
  /** Local preview only (data URL); omitted from exported spec */
  previewSrc?: string;
}

export interface ImageLayer {
  type: 'image';
  id: string;
  artboardId: string;
  frame: LayerFrame;
  assetId: string;
  /** Preview src or path for canvas */
  src: string;
  label?: string;
  objectFit?: 'cover' | 'contain';
}

export interface VideoLayer {
  type: 'video';
  id: string;
  artboardId: string;
  frame: LayerFrame;
  assetId: string;
  src: string;
  posterAssetId?: string;
  autoplay?: boolean;
  muted?: boolean;
}

export interface AudioLayer {
  type: 'audio';
  id: string;
  artboardId: string;
  frame: LayerFrame;
  assetId: string;
  src: string;
  label?: string;
}

export interface TextLayer {
  type: 'text';
  id: string;
  artboardId: string;
  frame: LayerFrame;
  content: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  fontFamily?: string;
  fontTokenId?: string;
}

export interface AnnotationLayer {
  type: 'annotation';
  id: string;
  artboardId: string;
  frame: LayerFrame;
  kind: 'pin' | 'arrow' | 'callout';
  text: string;
  endX?: number;
  endY?: number;
}

export type DesignLayer = ImageLayer | VideoLayer | AudioLayer | TextLayer | AnnotationLayer;

export type AiMessageRole = 'user' | 'assistant' | 'system';

export interface AiMessage {
  id: string;
  role: AiMessageRole;
  content: string;
  createdAt: string;
  cardId?: string;
}

export type CopilotCardId =
  | 'scope'
  | 'considerations'
  | 'next-screen'
  | 'agent-handoff'
  | 'challenge';

export interface DesignDraft {
  id: string;
  title: string;
  status: QueueStatus;
  targetPath: string;
  targetExists: boolean;
  flowPathId?: string;
  artboards: ArtboardDef[];
  layers: DesignLayer[];
  assets: AssetRef[];
  designerNotes: string;
  acceptance: string[];
  aiThread: AiMessage[];
  createdAt: string;
  updatedAt: string;
  lastSavedAt?: string;
}

export interface DesignQueueIndex {
  version: 2;
  items: Array<{
    id: string;
    title: string;
    status: QueueStatus;
    targetPath: string;
    updatedAt: string;
  }>;
}

export interface DesignSpecExport {
  id: string;
  status: QueueStatus;
  title: string;
  target: { path: string; exists: boolean };
  flowPathId?: string;
  artboards: ArtboardDef[];
  layers: DesignLayer[];
  assets: Array<Omit<AssetRef, 'previewSrc'>>;
  designerNotes: string;
  acceptance: string[];
  aiSummary?: string;
  meta: { createdAt: string; updatedAt: string; galleryVersion: '2' };
}
