REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_staff() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.teaches_course(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_enrolled(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.can_see_course(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.can_see_note(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.in_thread(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, public, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM anon, public, authenticated;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated;
GRANT EXECUTE ON FUNCTION public.teaches_course(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_enrolled(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_see_course(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_see_note(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.in_thread(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  assigned public.app_role;
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (NEW.id, NEW.email,
          COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
          NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;

  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    assigned := 'admin';
  ELSE
    assigned := COALESCE(NULLIF(NEW.raw_user_meta_data->>'requested_role','')::public.app_role, 'student');
    IF assigned = 'admin' THEN assigned := 'student'; END IF;
  END IF;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, assigned)
  ON CONFLICT (user_id, role) DO NOTHING;

  IF assigned = 'student' THEN
    INSERT INTO public.enrollments (course_id, user_id)
    SELECT id, NEW.id FROM public.courses
    ON CONFLICT (course_id, user_id) DO NOTHING;

    INSERT INTO public.submissions (assignment_id, user_id, body, status, submitted_at)
    SELECT a.id, NEW.id,
           'Submitted work for ' || a.title || '.',
           'submitted', a.due_at - interval '6 hours'
    FROM public.assignments a
    WHERE a.due_at < now()
    ON CONFLICT (assignment_id, user_id) DO NOTHING;

    INSERT INTO public.module_progress (module_id, user_id, completed_at)
    SELECT m.id, NEW.id, now() - interval '3 days'
    FROM public.modules m WHERE m.position <= 1
    ON CONFLICT (module_id, user_id) DO NOTHING;
  ELSIF assigned = 'lecturer' THEN
    UPDATE public.courses SET owner_id = NEW.id WHERE owner_id IS NULL;
  END IF;

  RETURN NEW;
END; $$;