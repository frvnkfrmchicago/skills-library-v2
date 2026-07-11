/* ══════════════════════════════════════════
   STUDIO TYPES
   TypeScript interfaces for the visual page editor.
   ══════════════════════════════════════════ */

/** A single editable field value stored in a block */
export type StudioFieldValue = string | number | boolean | null;

/** Puck-compatible page data (JSON structure) */
export interface PuckData {
  content: PuckContent[];
  root: Record<string, StudioFieldValue>;
}

export interface PuckContent {
  type: string;
  props: Record<string, StudioFieldValue>;
}

/** Metadata for a saved studio page */
export interface StudioPageMeta {
  id: string;
  slug: string;
  title: string;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}

/** Full studio page: metadata + Puck layout data */
export interface StudioPage extends StudioPageMeta {
  puck_data: PuckData;
}

/** Shape of a row in the Supabase `studio_pages` table */
export interface StudioPageRow {
  id: string;
  slug: string;
  title: string;
  status: string;
  puck_data: unknown; // JSONB from Supabase, cast to PuckData on read
  created_at: string;
  updated_at: string;
}

/** Input for creating a new page */
export interface CreatePageInput {
  title: string;
  slug: string;
  puck_data: PuckData;
  status?: 'draft' | 'published';
}

/** Input for updating an existing page */
export interface UpdatePageInput {
  title?: string;
  slug?: string;
  puck_data?: PuckData;
  status?: 'draft' | 'published';
}

/** Result of an image upload */
export interface UploadResult {
  url: string;
  path: string;
}
