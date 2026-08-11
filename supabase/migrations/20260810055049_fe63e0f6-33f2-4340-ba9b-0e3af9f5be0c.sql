-- ENUMS
CREATE TYPE public.app_role AS ENUM ('admin', 'lecturer', 'student');
CREATE TYPE public.subject_category AS ENUM ('lavender', 'mint', 'powder', 'solar');
CREATE TYPE public.submission_status AS ENUM ('draft', 'submitted', 'graded', 'returned');

-- UTIL
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- USER ROLES
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin');
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','lecturer'));
$$;

-- COURSES
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  category public.subject_category NOT NULL DEFAULT 'powder',
  subject TEXT,
  owner_id UUID,
  starts_on DATE,
  ends_on DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.courses TO authenticated;
GRANT ALL ON public.courses TO service_role;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (course_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.enrollments TO authenticated;
GRANT ALL ON public.enrollments TO service_role;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.teaches_course(_course_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.courses WHERE id = _course_id AND owner_id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.is_enrolled(_course_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.enrollments WHERE course_id = _course_id AND user_id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.can_see_course(_course_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_admin() OR public.teaches_course(_course_id) OR public.is_enrolled(_course_id);
$$;

-- MODULES
CREATE TABLE public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT,
  body TEXT,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.modules TO authenticated;
GRANT ALL ON public.modules TO service_role;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.module_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  completed_at TIMESTAMPTZ,
  UNIQUE (module_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.module_progress TO authenticated;
GRANT ALL ON public.module_progress TO service_role;
ALTER TABLE public.module_progress ENABLE ROW LEVEL SECURITY;

-- ASSIGNMENTS
CREATE TABLE public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  instructions TEXT,
  points INT NOT NULL DEFAULT 100,
  due_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assignments TO authenticated;
GRANT ALL ON public.assignments TO service_role;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  body TEXT,
  status public.submission_status NOT NULL DEFAULT 'draft',
  submitted_at TIMESTAMPTZ,
  grade NUMERIC,
  feedback TEXT,
  graded_at TIMESTAMPTZ,
  graded_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (assignment_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.submissions TO authenticated;
GRANT ALL ON public.submissions TO service_role;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  author_id UUID,
  title TEXT NOT NULL,
  body TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- NOTES
CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT 'Untitled',
  content TEXT NOT NULL DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_shared BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notes TO authenticated;
GRANT ALL ON public.notes TO service_role;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.note_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  UNIQUE (source_id, target_id)
);
GRANT SELECT, INSERT, DELETE ON public.note_links TO authenticated;
GRANT ALL ON public.note_links TO service_role;
ALTER TABLE public.note_links ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.note_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  title TEXT NOT NULL,
  edited_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.note_versions TO authenticated;
GRANT ALL ON public.note_versions TO service_role;
ALTER TABLE public.note_versions ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.can_see_note(_note_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.notes n WHERE n.id = _note_id
      AND (n.owner_id = auth.uid() OR n.is_shared OR public.is_admin())
  );
$$;

-- CANVASES
CREATE TABLE public.canvases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT 'Untitled canvas',
  snapshot JSONB,
  is_shared BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.canvases TO authenticated;
GRANT ALL ON public.canvases TO service_role;
ALTER TABLE public.canvases ENABLE ROW LEVEL SECURITY;

-- INBOX
CREATE TABLE public.threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.threads TO authenticated;
GRANT ALL ON public.threads TO service_role;
ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.thread_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  UNIQUE (thread_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.thread_participants TO authenticated;
GRANT ALL ON public.thread_participants TO service_role;
ALTER TABLE public.thread_participants ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.threads(id) ON DELETE CASCADE,
  author_id UUID,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.in_thread(_thread_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.thread_participants WHERE thread_id = _thread_id AND user_id = auth.uid());
$$;

-- AGENT
CREATE TABLE public.agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  kind TEXT NOT NULL,
  prompt TEXT,
  result TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.agent_runs TO authenticated;
GRANT ALL ON public.agent_runs TO service_role;
ALTER TABLE public.agent_runs ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.agent_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.agent_messages TO authenticated;
GRANT ALL ON public.agent_messages TO service_role;
ALTER TABLE public.agent_messages ENABLE ROW LEVEL SECURITY;

-- POLICIES
CREATE POLICY "profiles readable by authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles self insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles self update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "roles self or staff read" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_staff());

CREATE POLICY "courses visible when permitted" ON public.courses FOR SELECT TO authenticated
  USING (public.is_admin() OR owner_id = auth.uid() OR public.is_enrolled(id));
CREATE POLICY "courses insert by staff" ON public.courses FOR INSERT TO authenticated
  WITH CHECK (public.is_staff() AND (owner_id = auth.uid() OR public.is_admin()));
CREATE POLICY "courses update by owner or admin" ON public.courses FOR UPDATE TO authenticated
  USING (public.is_admin() OR owner_id = auth.uid());
CREATE POLICY "courses delete by admin" ON public.courses FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "enrollments visible" ON public.enrollments FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin() OR public.teaches_course(course_id));
CREATE POLICY "enrollments managed by staff" ON public.enrollments FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() OR public.teaches_course(course_id));
CREATE POLICY "enrollments removed by staff" ON public.enrollments FOR DELETE TO authenticated
  USING (public.is_admin() OR public.teaches_course(course_id));

CREATE POLICY "modules visible" ON public.modules FOR SELECT TO authenticated USING (public.can_see_course(course_id));
CREATE POLICY "modules write by staff" ON public.modules FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() OR public.teaches_course(course_id));
CREATE POLICY "modules update by staff" ON public.modules FOR UPDATE TO authenticated
  USING (public.is_admin() OR public.teaches_course(course_id));
CREATE POLICY "modules delete by staff" ON public.modules FOR DELETE TO authenticated
  USING (public.is_admin() OR public.teaches_course(course_id));

CREATE POLICY "progress visible" ON public.module_progress FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_staff());
CREATE POLICY "progress own insert" ON public.module_progress FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "progress own update" ON public.module_progress FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "progress own delete" ON public.module_progress FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "assignments visible" ON public.assignments FOR SELECT TO authenticated USING (public.can_see_course(course_id));
CREATE POLICY "assignments insert by staff" ON public.assignments FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() OR public.teaches_course(course_id));
CREATE POLICY "assignments update by staff" ON public.assignments FOR UPDATE TO authenticated
  USING (public.is_admin() OR public.teaches_course(course_id));
CREATE POLICY "assignments delete by staff" ON public.assignments FOR DELETE TO authenticated
  USING (public.is_admin() OR public.teaches_course(course_id));

CREATE POLICY "submissions visible" ON public.submissions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin()
    OR EXISTS (SELECT 1 FROM public.assignments a WHERE a.id = assignment_id AND public.teaches_course(a.course_id)));
CREATE POLICY "submissions own insert" ON public.submissions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "submissions update own or grader" ON public.submissions FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_admin()
    OR EXISTS (SELECT 1 FROM public.assignments a WHERE a.id = assignment_id AND public.teaches_course(a.course_id)));

CREATE POLICY "announcements visible" ON public.announcements FOR SELECT TO authenticated USING (public.can_see_course(course_id));
CREATE POLICY "announcements insert by staff" ON public.announcements FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() OR public.teaches_course(course_id));
CREATE POLICY "announcements update by staff" ON public.announcements FOR UPDATE TO authenticated
  USING (public.is_admin() OR public.teaches_course(course_id));
CREATE POLICY "announcements delete by staff" ON public.announcements FOR DELETE TO authenticated
  USING (public.is_admin() OR public.teaches_course(course_id));

CREATE POLICY "notes visible" ON public.notes FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR is_shared OR public.is_admin());
CREATE POLICY "notes own insert" ON public.notes FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "notes update" ON public.notes FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR (is_shared AND public.is_staff()) OR public.is_admin());
CREATE POLICY "notes delete own" ON public.notes FOR DELETE TO authenticated
  USING (owner_id = auth.uid() OR public.is_admin());

CREATE POLICY "note links visible" ON public.note_links FOR SELECT TO authenticated USING (public.can_see_note(source_id));
CREATE POLICY "note links insert" ON public.note_links FOR INSERT TO authenticated WITH CHECK (public.can_see_note(source_id));
CREATE POLICY "note links delete" ON public.note_links FOR DELETE TO authenticated USING (public.can_see_note(source_id));

CREATE POLICY "note versions visible" ON public.note_versions FOR SELECT TO authenticated USING (public.can_see_note(note_id));
CREATE POLICY "note versions insert" ON public.note_versions FOR INSERT TO authenticated WITH CHECK (public.can_see_note(note_id));

CREATE POLICY "canvases visible" ON public.canvases FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR is_shared OR public.is_admin());
CREATE POLICY "canvases insert own" ON public.canvases FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "canvases update" ON public.canvases FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR is_shared OR public.is_admin());
CREATE POLICY "canvases delete own" ON public.canvases FOR DELETE TO authenticated
  USING (owner_id = auth.uid() OR public.is_admin());

CREATE POLICY "threads visible" ON public.threads FOR SELECT TO authenticated USING (public.in_thread(id) OR public.is_admin());
CREATE POLICY "threads insert" ON public.threads FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "threads update" ON public.threads FOR UPDATE TO authenticated USING (public.in_thread(id));

CREATE POLICY "participants visible" ON public.thread_participants FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.in_thread(thread_id) OR public.is_admin());
CREATE POLICY "participants insert" ON public.thread_participants FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.in_thread(thread_id));
CREATE POLICY "participants delete" ON public.thread_participants FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "messages visible" ON public.messages FOR SELECT TO authenticated USING (public.in_thread(thread_id));
CREATE POLICY "messages insert" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid() AND public.in_thread(thread_id));

CREATE POLICY "agent runs visible" ON public.agent_runs FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_staff());
CREATE POLICY "agent runs insert" ON public.agent_runs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "agent messages own" ON public.agent_messages FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "agent messages insert" ON public.agent_messages FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "agent messages delete" ON public.agent_messages FOR DELETE TO authenticated USING (user_id = auth.uid());

-- UPDATED_AT TRIGGERS
CREATE TRIGGER t_profiles_upd BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_courses_upd BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_modules_upd BEFORE UPDATE ON public.modules FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_assignments_upd BEFORE UPDATE ON public.assignments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_submissions_upd BEFORE UPDATE ON public.submissions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_notes_upd BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_canvases_upd BEFORE UPDATE ON public.canvases FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_threads_upd BEFORE UPDATE ON public.threads FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- NEW USER BOOTSTRAP: profile, role (first user = admin), demo enrollment
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
  ELSIF assigned = 'lecturer' THEN
    UPDATE public.courses SET owner_id = NEW.id WHERE owner_id IS NULL;
  END IF;

  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- REALTIME
ALTER TABLE public.notes REPLICA IDENTITY FULL;
ALTER TABLE public.canvases REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.canvases;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;