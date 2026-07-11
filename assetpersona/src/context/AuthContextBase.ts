import { createContext } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import type { Profile } from '../types/supabase';
import type { BypassRole } from '../lib/devBypass';

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  /** Supabase env not configured — original demo mode (read-only). */
  isDemo: boolean;
  /** Dev bypass active — fake identity injected for fast local testing. */
  isBypass: boolean;
  /** When isBypass is true, which role is being faked. */
  bypassRole: BypassRole | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  /** Reload profile from DB (used by WelcomeModal after writing services_interest). */
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthState | null>(null);
