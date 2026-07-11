-- ═══ TALK THRU TECH — Events System ═══
-- Migration: create events + registrations tables with RLS

-- ── PROFILES (if not exists) ──
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  avatar_url text,
  cover_url text,
  bio text,
  social_links jsonb DEFAULT '{}',
  level integer DEFAULT 1,
  points integer DEFAULT 0,
  role text DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  joined_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read any profile
CREATE POLICY "Public read profiles" ON profiles
  FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup (handled by trigger below)
CREATE POLICY "Users insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ── EVENTS ──
CREATE TABLE IF NOT EXISTS events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  full_description text,
  date date NOT NULL,
  time text,
  end_time text,
  duration text DEFAULT '60 min',
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'upcoming', 'live', 'past')),
  location_type text DEFAULT 'online' CHECK (location_type IN ('online', 'in-person', 'hybrid')),
  location_name text DEFAULT 'YouTube Live',
  location_address text,
  location_link text,
  cover_image text,
  capacity integer,
  tags text[] DEFAULT '{}',
  guest text,
  youtube_url text,
  host_name text NOT NULL DEFAULT 'Frank Lawrence',
  host_title text,
  host_avatar text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Anyone can read published events (not drafts)
CREATE POLICY "Public read published events" ON events
  FOR SELECT USING (status != 'draft');

-- Admins can read all events including drafts
CREATE POLICY "Admin read all events" ON events
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- Only admins can create events
CREATE POLICY "Admin create events" ON events
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- Only admins can update events
CREATE POLICY "Admin update events" ON events
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- Only admins can delete events
CREATE POLICY "Admin delete events" ON events
  FOR DELETE USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- ── EVENT REGISTRATIONS ──
CREATE TABLE IF NOT EXISTS event_registrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  email text NOT NULL,
  display_name text NOT NULL,
  registered_at timestamptz DEFAULT now(),
  UNIQUE(event_id, email)
);

ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Authenticated users can see their own registrations
CREATE POLICY "Users read own registrations" ON event_registrations
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can see all registrations
CREATE POLICY "Admin read all registrations" ON event_registrations
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- Authenticated users can register for events
CREATE POLICY "Users register for events" ON event_registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can unregister themselves
CREATE POLICY "Users unregister" ON event_registrations
  FOR DELETE USING (auth.uid() = user_id);

-- ── INDEXES ──
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_event_regs_event ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_regs_user ON event_registrations(user_id);

-- ── AUTO PROFILE CREATION TRIGGER ──
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop if exists to avoid duplicates
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── UPDATED_AT TRIGGER ──
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
