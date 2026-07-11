import {
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Profile } from '../types/supabase';
import type { User, Session } from '@supabase/supabase-js';
import { DEMO_PROFILE } from './demoProfile';
import { AuthContext } from './AuthContextBase';
import {
  getBypassRole,
  makeBypassUser,
  makeBypassProfile,
} from '../lib/devBypass';

export function AuthProvider({ children }: { children: ReactNode }) {
  const isDemo = !isSupabaseConfigured;
  const bypassRole = getBypassRole();
  const isBypass = bypassRole !== null;

  // Pre-seed state from bypass so first paint already has identity.
  const [user, setUser] = useState<User | null>(
    isBypass ? makeBypassUser(bypassRole!) : null
  );
  const [profile, setProfile] = useState<Profile | null>(
    isBypass
      ? makeBypassProfile(bypassRole!)
      : isDemo
        ? DEMO_PROFILE
        : null
  );
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(!isDemo && !isBypass);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) setProfile(data as Profile);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (isBypass) {
      // Re-derive from current bypass role so any in-memory tweaks persist.
      const r = getBypassRole();
      if (r) setProfile(makeBypassProfile(r));
      return;
    }
    if (!user) return;
    await fetchProfile(user.id);
  }, [isBypass, user, fetchProfile]);

  useEffect(() => {
    if (isDemo || isBypass) return;

    /* Get initial session */
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) fetchProfile(s.user.id);
      setLoading(false);
    });

    /* Listen for auth changes — always cleanup */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) fetchProfile(s.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, [isDemo, isBypass, fetchProfile]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (isDemo || isBypass) return { error: null };
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error?.message ?? null };
    },
    [isDemo, isBypass]
  );

  const signUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      if (isDemo || isBypass) return { error: null, needsConfirmation: false };
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: displayName },
          // Wave 1 trigger reads full_name from raw_user_meta_data, so we no
          // longer client-side INSERT a profile row (avoids the race).
        },
      });
      // When email confirmation is enabled on the backend, Supabase returns a
      // user without an active session. The UI uses this flag to show the
      // "Check your email" panel instead of routing forward.
      const needsConfirmation = !!data?.user && !data.session;
      return { error: error?.message ?? null, needsConfirmation };
    },
    [isDemo, isBypass]
  );

  const signInWithGoogle = useCallback(async () => {
    if (isDemo || isBypass) return { error: null };
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
    return { error: error?.message ?? null };
  }, [isDemo, isBypass]);

  const resetPassword = useCallback(
    async (email: string) => {
      if (isDemo || isBypass) return { error: null };
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error: error?.message ?? null };
    },
    [isDemo, isBypass]
  );

  const signOut = useCallback(async () => {
    if (isDemo) return;
    if (isBypass) {
      // Don't actually clear the bypass — that's controlled by the banner.
      return;
    }
    await supabase.auth.signOut();
  }, [isDemo, isBypass]);

  const value = useMemo(
    () => ({
      user,
      profile,
      session,
      loading,
      isDemo,
      isBypass,
      bypassRole,
      signIn,
      signUp,
      signInWithGoogle,
      resetPassword,
      signOut,
      refreshProfile,
    }),
    [
      user,
      profile,
      session,
      loading,
      isDemo,
      isBypass,
      bypassRole,
      signIn,
      signUp,
      signInWithGoogle,
      resetPassword,
      signOut,
      refreshProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
