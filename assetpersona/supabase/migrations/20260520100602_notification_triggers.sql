-- ═══════════════════════════════════════════════
-- AP-ENGAGEMENT-LOOP-2026-05 · Lane 6 · Step 3 of 3
-- Two notification triggers (publish fan-out + completion milestones)
-- ═══════════════════════════════════════════════
-- Both triggers run AFTER the source-table commit so a failed notification
-- write does not roll back the user-visible action (module publish or
-- module completion). Both functions are SECURITY DEFINER with an explicit
-- search_path so they can write notifications rows on behalf of the actor
-- regardless of the actor's RLS context — same pattern as
-- parse_mentions_and_notify() from 20260519101100_create_notifications.sql.
--
-- TRIGGER 1 — notify_followers_on_module_publish()
--   AFTER UPDATE OF status ON public.modules
--   WHEN OLD.status IS DISTINCT FROM 'published' AND NEW.status = 'published'
--   For each profile (except author and admins), insert a `module_published`
--   notification row IFF the recipient's notification_prefs.new_modules
--   preference is not explicitly false. Absent keys default TRUE — that's
--   the contract documented on profiles.notification_prefs.
--
-- TRIGGER 2 — notify_on_milestone()
--   AFTER INSERT ON public.module_completions
--   Counts the user's total completions and current_count from streaks,
--   then inserts achievement_earned rows for: first-ever completion,
--   10 and 50 completion milestones, and 3 / 7 / 30 day streak milestones.
--   The streak column is `current_count` (per
--   20260505200100_create_progress.sql, line 37) — NOT `current`. The
--   completion trigger uses current_count.
-- ═══════════════════════════════════════════════

-- ── Trigger 1: module published → fan-out notify members ──
CREATE OR REPLACE FUNCTION public.notify_followers_on_module_publish()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'published' AND (OLD.status IS DISTINCT FROM 'published') THEN
    INSERT INTO public.notifications (recipient_id, actor_id, kind, payload)
    SELECT p.id,
           NEW.author_id,
           'module_published'::public.notification_kind,
           jsonb_build_object(
             'module_id', NEW.id,
             'slug', NEW.slug,
             'title', NEW.title,
             'actor_name', (SELECT display_name FROM public.profiles WHERE id = NEW.author_id)
           )
      FROM public.profiles p
     WHERE p.id <> COALESCE(NEW.author_id, '00000000-0000-0000-0000-000000000000'::uuid)
       AND (p.notification_prefs->>'new_modules')::boolean IS NOT FALSE  -- absent → TRUE
       AND COALESCE(p.role::text, '') <> 'admin';                        -- admins published it
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.notify_followers_on_module_publish() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.notify_followers_on_module_publish() TO authenticated;

DROP TRIGGER IF EXISTS trg_modules_publish_notify ON public.modules;
CREATE TRIGGER trg_modules_publish_notify
  AFTER UPDATE OF status ON public.modules
  FOR EACH ROW EXECUTE FUNCTION public.notify_followers_on_module_publish();

-- ── Trigger 2: module completion → milestone achievement notification ──
CREATE OR REPLACE FUNCTION public.notify_on_milestone()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_completions integer;
  v_current_streak    integer;
BEGIN
  -- Total completions for this user (including the row just inserted).
  SELECT count(*) INTO v_total_completions
    FROM public.module_completions
   WHERE user_id = NEW.user_id;

  -- Current streak length. NOTE: schema column is `current_count`, not `current`.
  SELECT current_count INTO v_current_streak
    FROM public.streaks
   WHERE user_id = NEW.user_id
   LIMIT 1;

  -- First-ever completion → 'first_drill' badge.
  IF v_total_completions = 1 THEN
    INSERT INTO public.notifications (recipient_id, kind, payload)
    VALUES (
      NEW.user_id,
      'achievement_earned'::public.notification_kind,
      jsonb_build_object(
        'badge', 'first_drill',
        'message', 'First module complete. The streak begins.'
      )
    );
  END IF;

  -- 10 / 50 completion milestones.
  IF v_total_completions IN (10, 50) THEN
    INSERT INTO public.notifications (recipient_id, kind, payload)
    VALUES (
      NEW.user_id,
      'achievement_earned'::public.notification_kind,
      jsonb_build_object(
        'badge', CASE WHEN v_total_completions = 10 THEN 'ten_modules' ELSE 'fifty_modules' END,
        'message', v_total_completions || ' modules complete.'
      )
    );
  END IF;

  -- Streak milestones (3 / 7 / 30 day).
  IF v_current_streak IS NOT NULL AND v_current_streak IN (3, 7, 30) THEN
    INSERT INTO public.notifications (recipient_id, kind, payload)
    VALUES (
      NEW.user_id,
      'achievement_earned'::public.notification_kind,
      jsonb_build_object(
        'badge', CASE v_current_streak
                   WHEN 3  THEN 'three_in_a_row'
                   WHEN 7  THEN 'week_streak'
                   ELSE         'month_streak'
                 END,
        'message', v_current_streak || '-day streak'
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.notify_on_milestone() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.notify_on_milestone() TO authenticated;

DROP TRIGGER IF EXISTS trg_completions_milestone_notify ON public.module_completions;
CREATE TRIGGER trg_completions_milestone_notify
  AFTER INSERT ON public.module_completions
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_milestone();
