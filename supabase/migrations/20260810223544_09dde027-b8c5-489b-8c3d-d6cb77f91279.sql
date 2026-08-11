-- Demo mode: unauthenticated visitors can read course content only.
GRANT SELECT ON public.courses TO anon;
GRANT SELECT ON public.modules TO anon;
GRANT SELECT ON public.assignments TO anon;
GRANT SELECT ON public.announcements TO anon;
GRANT SELECT ON public.notes TO anon;

CREATE POLICY "Demo visitors can read courses"
ON public.courses FOR SELECT TO anon USING (true);

CREATE POLICY "Demo visitors can read modules"
ON public.modules FOR SELECT TO anon USING (true);

CREATE POLICY "Demo visitors can read assignments"
ON public.assignments FOR SELECT TO anon USING (true);

CREATE POLICY "Demo visitors can read announcements"
ON public.announcements FOR SELECT TO anon USING (true);

CREATE POLICY "Demo visitors can read shared notes"
ON public.notes FOR SELECT TO anon USING (is_shared = true);