import type { Profile } from '../types/supabase';

/* Intent: fallback identity when Supabase isn’t configured. */
export const DEMO_PROFILE: Profile = {
  id: 'demo-user-001',
  display_name: 'Frank Lawrence',
  avatar_url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Frank',
  cover_url: null,
  bio: 'Building with AI. Teaching AI literacy. Creating digital brands.',
  social_links: {},
  level: 1,
  points: 0,
  role: 'admin',
  joined_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

