-- ═══════════════════════════════════════════════
-- AP-MODERNIZE-2026-05 · Lane 3 · @Mentions + Notifications
-- notifications table + parse_mentions_and_notify() trigger
-- ═══════════════════════════════════════════════
-- The single most effective re-engagement mechanic in modern social apps is
-- the notification bell with an unread badge. This migration provisions the
-- backend half of that mechanic:
--
--   1. `notification_kind` ENUM — mention, comment_reply, post_reaction,
--      dm_received, tier_change, system. The ENUM lets us add fan-in surfaces
--      later (every DM, every reply, every payment event) without re-modeling.
--
--   2. `notifications` table — recipient_id is the only mandatory FK; actor_id
--      is null for system events; payload is jsonb so different kinds can
--      carry different routing keys (post_id, comment_id, thread_id, …).
--      read_at being null is the unread signal — partial index makes that
--      lookup O(log n) on the recipient's inbox size, not the global table.
--
--   3. RLS — recipient owns SELECT and UPDATE (mark read). Any authenticated
--      user can INSERT (the trigger function below relies on this when it
--      fires under the actor's identity).
--
--   4. `parse_mentions_and_notify()` trigger — fires AFTER INSERT on posts +
--      post_comments. Regex-extracts `@<word>` tokens, matches against
--      profiles.display_name (case-insensitive, spaces tolerated by collapsing
--      to slugs), inserts one notification row per resolved match, skipping
--      self-mentions. SECURITY DEFINER so it can write notification rows on
--      behalf of the actor regardless of insert-side RLS gymnastics.
--
-- Because no `handle` column exists on profiles yet, the matcher works
-- against `display_name` with whitespace collapsed (so `@FrankLawrence`
-- resolves to a profile named "Frank Lawrence"). When a `handle` column ships
-- in a later lane, the resolver can be swapped one place — inside this
-- function — without touching frontend code.
-- ═══════════════════════════════════════════════

-- ── notification_kind enum ──
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_kind') THEN
    CREATE TYPE public.notification_kind AS ENUM (
      'mention',
      'comment_reply',
      'post_reaction',
      'dm_received',
      'tier_change',
      'system'
    );
  END IF;
END $$;

-- ── notifications table ──
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  kind public.notification_kind NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── Indexes ──
-- Unread badge query — `WHERE recipient_id = me AND read_at IS NULL`. Partial
-- on read_at IS NULL keeps the index small even when the inbox has 10k+ read rows.
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_unread
  ON public.notifications (recipient_id, read_at)
  WHERE read_at IS NULL;

-- Full inbox query — `WHERE recipient_id = me ORDER BY created_at DESC`.
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_created
  ON public.notifications (recipient_id, created_at DESC);

-- ── RLS ──
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Notifications own read" ON public.notifications;
CREATE POLICY "Notifications own read"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Notifications own update" ON public.notifications;
CREATE POLICY "Notifications own update"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

-- INSERT: any authenticated user (the trigger below runs as the actor; future
-- Edge Functions writing DM / tier_change notifications also use the user's JWT).
DROP POLICY IF EXISTS "Notifications insert authenticated" ON public.notifications;
CREATE POLICY "Notifications insert authenticated"
  ON public.notifications
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Recipients delete their own notifications (e.g. swipe to dismiss).
DROP POLICY IF EXISTS "Notifications own delete" ON public.notifications;
CREATE POLICY "Notifications own delete"
  ON public.notifications
  FOR DELETE
  USING (auth.uid() = recipient_id);

-- ═══════════════════════════════════════════════
-- parse_mentions_and_notify() — extracts @<token> mentions and inserts
-- one notification row per resolved recipient. Used by AFTER INSERT triggers
-- on posts and post_comments below.
-- ═══════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.parse_mentions_and_notify()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_body text;
  v_actor uuid;
  v_kind public.notification_kind;
  v_payload jsonb;
  v_token text;
  v_resolved_id uuid;
  v_post_id uuid;
  v_comment_id uuid;
BEGIN
  -- ── Branch on which table fired ──
  IF TG_TABLE_NAME = 'posts' THEN
    v_body := NEW.body;
    v_actor := NEW.author_id;
    v_kind := 'mention';
    v_post_id := NEW.id;
    v_comment_id := NULL;
    v_payload := jsonb_build_object('post_id', NEW.id);
  ELSIF TG_TABLE_NAME = 'post_comments' THEN
    v_body := NEW.body;
    v_actor := NEW.author_id;
    v_kind := 'mention';
    v_post_id := NEW.post_id;
    v_comment_id := NEW.id;
    v_payload := jsonb_build_object('post_id', NEW.post_id, 'comment_id', NEW.id);
  ELSE
    RETURN NEW;
  END IF;

  IF v_body IS NULL OR length(trim(v_body)) = 0 THEN
    RETURN NEW;
  END IF;

  -- ── Extract @<word> tokens. The regex grabs letters/digits/underscores/dots,
  -- which covers MentionInput-inserted display names with whitespace stripped.
  FOR v_token IN
    SELECT DISTINCT lower((match)[1])
      FROM regexp_matches(v_body, '@([A-Za-z0-9_.]{2,40})', 'g') AS match
  LOOP
    -- Resolve token to a profile.id by case-insensitive match against
    -- display_name with whitespace collapsed. So `@FrankLawrence` matches a
    -- profile named "Frank Lawrence".
    SELECT p.id
      INTO v_resolved_id
      FROM public.profiles p
     WHERE lower(regexp_replace(p.display_name, '\s+', '', 'g')) = v_token
     LIMIT 1;

    IF v_resolved_id IS NULL THEN
      CONTINUE;
    END IF;

    -- Skip self-mentions — Frank pinging himself is noise.
    IF v_resolved_id = v_actor THEN
      CONTINUE;
    END IF;

    INSERT INTO public.notifications (recipient_id, actor_id, kind, payload)
    VALUES (v_resolved_id, v_actor, v_kind, v_payload);
  END LOOP;

  -- ── Comment-reply notification: if this is a reply to another comment,
  -- the parent comment's author also gets a comment_reply notification.
  IF TG_TABLE_NAME = 'post_comments' AND NEW.parent_id IS NOT NULL THEN
    SELECT pc.author_id
      INTO v_resolved_id
      FROM public.post_comments pc
     WHERE pc.id = NEW.parent_id
     LIMIT 1;

    IF v_resolved_id IS NOT NULL AND v_resolved_id <> v_actor THEN
      INSERT INTO public.notifications (recipient_id, actor_id, kind, payload)
      VALUES (
        v_resolved_id,
        v_actor,
        'comment_reply',
        jsonb_build_object(
          'post_id', v_post_id,
          'comment_id', v_comment_id,
          'parent_comment_id', NEW.parent_id
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.parse_mentions_and_notify() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.parse_mentions_and_notify() TO authenticated;

-- ── Triggers ──
DROP TRIGGER IF EXISTS posts_parse_mentions ON public.posts;
CREATE TRIGGER posts_parse_mentions
  AFTER INSERT ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.parse_mentions_and_notify();

DROP TRIGGER IF EXISTS post_comments_parse_mentions ON public.post_comments;
CREATE TRIGGER post_comments_parse_mentions
  AFTER INSERT ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION public.parse_mentions_and_notify();
