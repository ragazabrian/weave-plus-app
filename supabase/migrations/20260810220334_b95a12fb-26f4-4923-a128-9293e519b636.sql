-- 1) Restrict SECURITY DEFINER helper not used by any policy or app code
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated;

-- 2) note_folders: owner-scoped reads
DROP POLICY IF EXISTS "Members can read folders" ON public.note_folders;
CREATE POLICY "Owners read their folders"
  ON public.note_folders FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.is_admin());

-- 3) profiles: self, admin, or people sharing a course/thread
CREATE OR REPLACE FUNCTION public.shares_context(_other_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.enrollments me
    JOIN public.enrollments them ON them.course_id = me.course_id
    WHERE me.user_id = auth.uid() AND them.user_id = _other_id
  )
  OR EXISTS (
    SELECT 1 FROM public.courses c
    WHERE (c.owner_id = auth.uid() AND EXISTS (
             SELECT 1 FROM public.enrollments e WHERE e.course_id = c.id AND e.user_id = _other_id))
       OR (c.owner_id = _other_id AND EXISTS (
             SELECT 1 FROM public.enrollments e WHERE e.course_id = c.id AND e.user_id = auth.uid()))
  )
  OR EXISTS (
    SELECT 1
    FROM public.thread_participants me
    JOIN public.thread_participants them ON them.thread_id = me.thread_id
    WHERE me.user_id = auth.uid() AND them.user_id = _other_id
  );
$$;

REVOKE ALL ON FUNCTION public.shares_context(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.shares_context(uuid) TO authenticated, service_role;

DROP POLICY IF EXISTS "profiles readable by authenticated" ON public.profiles;
CREATE POLICY "profiles readable by self admin or shared context"
  ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_admin() OR public.shares_context(id));