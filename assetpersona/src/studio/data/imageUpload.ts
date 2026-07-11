/* ══════════════════════════════════════════
   IMAGE UPLOAD
   Upload/delete images via Supabase Storage.
   ══════════════════════════════════════════ */

import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { UploadResult } from './types';

const BUCKET = 'studio-assets';

/** Upload an image file to Supabase Storage. Returns the public URL and storage path. */
export async function uploadImage(file: File): Promise<UploadResult> {
  if (!isSupabaseConfigured) {
    // Dev fallback: create an object URL for local preview
    const url = URL.createObjectURL(file);
    return { url, path: `local/${file.name}` };
  }

  const ext = file.name.split('.').pop() ?? 'png';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const storagePath = `uploads/${filename}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    console.error('[Studio] Upload error:', uploadError);
    throw uploadError;
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(storagePath);

  return {
    url: urlData.publicUrl,
    path: storagePath,
  };
}

/** Delete an image from Supabase Storage by its storage path. */
export async function deleteImage(path: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  if (path.startsWith('local/')) return; // dev fallback, nothing to delete

  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([path]);

  if (error) {
    console.error('[Studio] Delete image error:', error);
    throw error;
  }
}
