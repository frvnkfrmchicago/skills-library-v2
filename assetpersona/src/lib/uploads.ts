/* ═══ uploads.ts — shared Supabase Storage helpers ═══
 *
 * Used by AvatarUploader, SocialLinksEditor (no — that's URL-only), MediaPicker
 * (Rich Content Agent 5), and any future surface that uploads a user-owned file.
 *
 * Bypass-safe: in dev bypass we return a `blob:` URL so the UI still renders
 * something without ever hitting Supabase.
 */

import { supabase, isSupabaseConfigured } from './supabase';
import { isBypassActive } from './devBypass';

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2 MB
const MAX_COVER_BYTES = 4 * 1024 * 1024; // 4 MB
const MAX_POST_MEDIA_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED_MIME = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
]);

export interface UploadResult {
  url: string;
  path: string;
}

interface UploadOptions {
  bucket: 'avatars' | 'covers' | 'post-media';
  userId: string;
  file: File;
  /** Optional override for the destination filename (defaults to a uuid + ext) */
  filename?: string;
}

function extFromMime(mime: string): string {
  switch (mime) {
    case 'image/jpeg': return 'jpg';
    case 'image/png':  return 'png';
    case 'image/webp': return 'webp';
    case 'image/gif':  return 'gif';
    default: return 'bin';
  }
}

function bucketLimit(bucket: UploadOptions['bucket']): number {
  if (bucket === 'avatars') return MAX_AVATAR_BYTES;
  if (bucket === 'covers') return MAX_COVER_BYTES;
  return MAX_POST_MEDIA_BYTES;
}

export class UploadValidationError extends Error {
  reason: 'too_big' | 'wrong_type' | 'no_user';
  constructor(reason: 'too_big' | 'wrong_type' | 'no_user', message: string) {
    super(message);
    this.reason = reason;
  }
}

export async function uploadImage({ bucket, userId, file, filename }: UploadOptions): Promise<UploadResult> {
  if (!userId) throw new UploadValidationError('no_user', 'Sign in to upload.');

  if (!ALLOWED_MIME.has(file.type)) {
    throw new UploadValidationError('wrong_type', 'PNG, JPG, WebP, or GIF only.');
  }
  if (file.size > bucketLimit(bucket)) {
    throw new UploadValidationError(
      'too_big',
      `Max ${(bucketLimit(bucket) / 1024 / 1024).toFixed(0)}MB.`
    );
  }

  const name = filename ?? `${crypto.randomUUID()}.${extFromMime(file.type)}`;
  const path = `${userId}/${name}`;

  if (isBypassActive() || !isSupabaseConfigured) {
    // Bypass mode — surface a blob URL the UI can render without hitting Supabase.
    const url = URL.createObjectURL(file);
    return { url, path };
  }

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type,
  });
  if (error) throw error;

  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: pub.publicUrl, path };
}

/** Update profile column with a single shot. */
export async function setProfileImage(
  userId: string,
  field: 'avatar_url' | 'cover_url',
  url: string
): Promise<void> {
  if (isBypassActive() || !isSupabaseConfigured) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from('profiles')
    .update({ [field]: url })
    .eq('id', userId);
}
