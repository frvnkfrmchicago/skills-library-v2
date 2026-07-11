/* ═══ tenor.ts — minimal Tenor v2 client ═══
 *
 * Search + featured. We never embed Tenor's player — we lift the thumb URL
 * and store it in our own post media list, so deletion stays in our control.
 *
 * Set VITE_TENOR_API_KEY to enable. Without a key, returns an empty list.
 */

const API_BASE = 'https://tenor.googleapis.com/v2';

export interface TenorGif {
  id: string;
  title: string;
  url: string;          // small mp4/gif preview
  preview_url: string;  // tinier still
  width: number;
  height: number;
}

interface TenorSearchResponse {
  results: Array<{
    id: string;
    title?: string;
    media_formats: Record<
      string,
      { url: string; dims: number[] }
    >;
  }>;
  next?: string;
}

function pickFormat(formats: TenorSearchResponse['results'][0]['media_formats']): {
  url: string;
  preview: string;
  w: number;
  h: number;
} | null {
  // Prefer mediumgif → tinygif → gif → webm fallback
  const mid = formats.mediumgif ?? formats.gif ?? formats.tinygif;
  const tiny = formats.tinygif ?? formats.nanogif ?? mid;
  if (!mid) return null;
  return {
    url: mid.url,
    preview: tiny?.url ?? mid.url,
    w: mid.dims?.[0] ?? 240,
    h: mid.dims?.[1] ?? 200,
  };
}

export async function searchTenor(query: string, limit = 16): Promise<TenorGif[]> {
  const key = import.meta.env.VITE_TENOR_API_KEY as string | undefined;
  if (!key) return [];
  const path = query.trim()
    ? `/search?q=${encodeURIComponent(query)}&key=${key}&limit=${limit}&media_filter=mediumgif,tinygif,gif`
    : `/featured?key=${key}&limit=${limit}&media_filter=mediumgif,tinygif,gif`;
  try {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) return [];
    const data = (await res.json()) as TenorSearchResponse;
    return (data.results ?? [])
      .map((r) => {
        const fmt = pickFormat(r.media_formats);
        if (!fmt) return null;
        return {
          id: r.id,
          title: r.title ?? 'GIF',
          url: fmt.url,
          preview_url: fmt.preview,
          width: fmt.w,
          height: fmt.h,
        };
      })
      .filter((g): g is TenorGif => g !== null);
  } catch {
    return [];
  }
}

/** Bypass-friendly fallback. Static GIF samples for testing without an API key. */
export const BYPASS_TENOR_SAMPLES: TenorGif[] = [
  {
    id: 'bypass-1',
    title: 'Sample GIF 1',
    url: 'https://media.tenor.com/sample-1/medium.gif',
    preview_url: 'https://media.tenor.com/sample-1/tiny.gif',
    width: 240,
    height: 180,
  },
  {
    id: 'bypass-2',
    title: 'Sample GIF 2',
    url: 'https://media.tenor.com/sample-2/medium.gif',
    preview_url: 'https://media.tenor.com/sample-2/tiny.gif',
    width: 220,
    height: 220,
  },
];
