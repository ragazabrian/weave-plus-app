CREATE TABLE public.note_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.note_folders TO authenticated;
GRANT ALL ON public.note_folders TO service_role;

ALTER TABLE public.note_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read folders" ON public.note_folders
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Owners manage their folders" ON public.note_folders
  FOR ALL TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

ALTER TABLE public.notes ADD COLUMN folder_id uuid REFERENCES public.note_folders(id) ON DELETE SET NULL;

CREATE INDEX notes_folder_id_idx ON public.notes (folder_id);