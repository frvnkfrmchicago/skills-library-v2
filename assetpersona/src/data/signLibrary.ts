/* ═══ SIGN LIBRARY — data model, presets, and CRUD for neon signs ═══
 *
 * GRASSHOPPER-SIGNS-2026-07 · Lane 1
 *
 * localStorage-first with Supabase-ready pattern (mirrors communityData.ts).
 * Each sign is a serializable JSON object that captures every visual property
 * needed to reconstruct the NeonSign component.
 *
 * The preset library ships with 12 built-in signs matching the style of the
 * reference images (Be Cool, We're Open, Good Vibes Only, Pizza, Slay Queen, etc.).
 */

import type { NeonColor, NeonBackdrop, NeonAnimation, NeonSize, NeonFontId } from '../components/ui/NeonSign';

/* ── Types ── */

export interface SignData {
  id: string;
  text: string;
  color: NeonColor;
  customHex?: string;
  font: NeonFontId;
  backdrop: NeonBackdrop;
  animation: NeonAnimation;
  size: NeonSize;
  createdAt: string;
  updatedAt: string;
  /** User who created the sign. Null for presets. */
  authorId: string | null;
  /** Whether this is a built-in preset or user-created. */
  isPreset: boolean;
  /** Tags for filtering in the library. */
  tags: string[];
}

export type SignCategory = 'all' | 'vibes' | 'business' | 'food' | 'quotes' | 'custom';

export const SIGN_CATEGORIES: { id: SignCategory; label: string }[] = [
  { id: 'all', label: 'All Signs' },
  { id: 'vibes', label: 'Vibes' },
  { id: 'business', label: 'Business' },
  { id: 'food', label: 'Food & Drink' },
  { id: 'quotes', label: 'Quotes' },
  { id: 'custom', label: 'My Signs' },
];

/* ── Preset Signs ── */

const PRESETS: SignData[] = [
  {
    id: 'preset-be-cool',
    text: 'Be Cool',
    color: 'blue',
    font: 'neonderthaw',
    backdrop: 'dark',
    animation: 'breathe',
    size: 'lg',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z',
    authorId: null,
    isPreset: true,
    tags: ['vibes', 'quotes'],
  },
  {
    id: 'preset-open',
    text: "We're Open\nCome In",
    color: 'pink',
    font: 'lobster',
    backdrop: 'dark',
    animation: 'flicker',
    size: 'md',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z',
    authorId: null,
    isPreset: true,
    tags: ['business'],
  },
  {
    id: 'preset-good-vibes',
    text: 'Good Vibes\nOnly',
    color: 'violet',
    font: 'pacifico',
    backdrop: 'gradient',
    animation: 'breathe',
    size: 'lg',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z',
    authorId: null,
    isPreset: true,
    tags: ['vibes', 'quotes'],
  },
  {
    id: 'preset-pizza',
    text: 'Pizza',
    color: 'white',
    font: 'neonderthaw',
    backdrop: 'brick',
    animation: 'breathe',
    size: 'xl',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z',
    authorId: null,
    isPreset: true,
    tags: ['food'],
  },
  {
    id: 'preset-slay-queen',
    text: 'Slay\nQueen',
    color: 'pink',
    font: 'neonderthaw',
    backdrop: 'dark',
    animation: 'breathe',
    size: 'lg',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z',
    authorId: null,
    isPreset: true,
    tags: ['vibes', 'quotes'],
  },
  {
    id: 'preset-dream-big',
    text: 'Dream Big',
    color: 'blue',
    font: 'pacifico',
    backdrop: 'concrete',
    animation: 'warm-up',
    size: 'lg',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z',
    authorId: null,
    isPreset: true,
    tags: ['vibes', 'quotes'],
  },
  {
    id: 'preset-cheers',
    text: 'Cheers!',
    color: 'green',
    font: 'lobster',
    backdrop: 'wood',
    animation: 'flicker',
    size: 'lg',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z',
    authorId: null,
    isPreset: true,
    tags: ['food', 'vibes'],
  },
  {
    id: 'preset-hustle',
    text: 'Hustle',
    color: 'pink',
    font: 'permanent-marker',
    backdrop: 'brick',
    animation: 'breathe',
    size: 'xl',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z',
    authorId: null,
    isPreset: true,
    tags: ['vibes', 'business'],
  },
  {
    id: 'preset-cafe',
    text: 'Café',
    color: 'white',
    font: 'neonderthaw',
    backdrop: 'wood',
    animation: 'breathe',
    size: 'lg',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z',
    authorId: null,
    isPreset: true,
    tags: ['food', 'business'],
  },
  {
    id: 'preset-love',
    text: 'Love',
    color: 'pink',
    font: 'neonderthaw',
    backdrop: 'dark',
    animation: 'breathe',
    size: 'xl',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z',
    authorId: null,
    isPreset: true,
    tags: ['vibes'],
  },
  {
    id: 'preset-game-on',
    text: 'Game On',
    color: 'green',
    font: 'orbitron',
    backdrop: 'dark',
    animation: 'warm-up',
    size: 'lg',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z',
    authorId: null,
    isPreset: true,
    tags: ['vibes'],
  },
  {
    id: 'preset-vip',
    text: 'V.I.P.',
    color: 'violet',
    font: 'orbitron',
    backdrop: 'gradient',
    animation: 'flicker',
    size: 'lg',
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z',
    authorId: null,
    isPreset: true,
    tags: ['business', 'vibes'],
  },
];

/* ── Storage ── */

const STORAGE_KEY = 'gh_sign_library';

function loadUserSigns(): SignData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUserSigns(signs: SignData[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(signs));
}

/* ── Public API ── */

/** Get all signs (presets + user-created), newest first. */
export function getAllSigns(): SignData[] {
  const user = loadUserSigns();
  return [...user, ...PRESETS].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/** Get only preset signs. */
export function getPresets(): SignData[] {
  return [...PRESETS];
}

/** Get only user-created signs. */
export function getUserSigns(): SignData[] {
  return loadUserSigns().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/** Get a sign by ID (checks user signs first, then presets). */
export function getSignById(id: string): SignData | undefined {
  const user = loadUserSigns();
  return user.find(s => s.id === id) ?? PRESETS.find(s => s.id === id);
}

/** Filter signs by tag. */
export function getSignsByTag(tag: string): SignData[] {
  return getAllSigns().filter(s => s.tags.includes(tag));
}

/** Filter signs by category. */
export function getSignsByCategory(category: SignCategory): SignData[] {
  if (category === 'all') return getAllSigns();
  if (category === 'custom') return getUserSigns();
  return getAllSigns().filter(s => s.tags.includes(category));
}

/** Create a new user sign. Returns the complete sign list. */
export function createSign(sign: Omit<SignData, 'id' | 'createdAt' | 'updatedAt' | 'isPreset'>): SignData[] {
  const signs = loadUserSigns();
  const newSign: SignData = {
    ...sign,
    id: `sign-${crypto.randomUUID()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPreset: false,
  };
  signs.unshift(newSign);
  saveUserSigns(signs);
  return signs;
}

/** Update an existing user sign. Presets cannot be modified. */
export function updateSign(id: string, updates: Partial<SignData>): SignData[] {
  const signs = loadUserSigns();
  const idx = signs.findIndex(s => s.id === id);
  if (idx === -1) return signs;
  signs[idx] = {
    ...signs[idx],
    ...updates,
    id: signs[idx].id,
    isPreset: false,
    updatedAt: new Date().toISOString(),
  };
  saveUserSigns(signs);
  return signs;
}

/** Delete a user sign. Presets cannot be deleted. */
export function deleteSign(id: string): SignData[] {
  const signs = loadUserSigns().filter(s => s.id !== id);
  saveUserSigns(signs);
  return signs;
}

/** Duplicate a sign (preset or user) as a new user sign. */
export function duplicateSign(id: string): SignData[] {
  const source = getSignById(id);
  if (!source) return loadUserSigns();
  return createSign({
    text: source.text,
    color: source.color,
    customHex: source.customHex,
    font: source.font,
    backdrop: source.backdrop,
    animation: source.animation,
    size: source.size,
    authorId: null,
    tags: [...source.tags, 'custom'],
  });
}
