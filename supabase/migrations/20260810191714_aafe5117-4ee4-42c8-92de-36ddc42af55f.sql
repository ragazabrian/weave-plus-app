ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS color text;

CREATE TABLE IF NOT EXISTS public.agent_chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null default 'New chat',
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_chats TO authenticated;
GRANT ALL ON public.agent_chats TO service_role;
ALTER TABLE public.agent_chats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own chats select" ON public.agent_chats;
CREATE POLICY "own chats select" ON public.agent_chats FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "own chats insert" ON public.agent_chats;
CREATE POLICY "own chats insert" ON public.agent_chats FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "own chats update" ON public.agent_chats;
CREATE POLICY "own chats update" ON public.agent_chats FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "own chats delete" ON public.agent_chats;
CREATE POLICY "own chats delete" ON public.agent_chats FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TRIGGER agent_chats_updated_at BEFORE UPDATE ON public.agent_chats
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.agent_messages ADD COLUMN IF NOT EXISTS chat_id uuid REFERENCES public.agent_chats(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS agent_messages_chat_id_idx ON public.agent_messages(chat_id);