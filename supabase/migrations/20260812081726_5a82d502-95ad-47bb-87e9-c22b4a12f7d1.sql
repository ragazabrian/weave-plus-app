-- 1. Spread assignment due dates across the next ~7 weeks with varied times
with ordered as (
  select id, (row_number() over (order by course_id, created_at, id) - 1)::int as rn
  from public.assignments
)
update public.assignments a
set due_at = date_trunc('day', now())
    + make_interval(days => (((o.rn * 3 + (o.rn % 5)) % 48) + 1)::int)
    + make_interval(hours => (9 + (o.rn % 5) * 2)::int, mins => ((o.rn % 4) * 15)::int)
from ordered o
where o.id = a.id;

-- 2. Seed chat: one space per course plus a few direct messages, all with
--    every existing member as a participant so everyone can read and post.
do $$
declare
  admin_id uuid;
  c record;
  t_id uuid;
  d record;
  i int;
  authors uuid[];
  bodies text[] := array[
    'Morning everyone, notes for this week are up in the vault.',
    'Reminder: the next milestone is due at the end of the week.',
    'I pushed the starter repo, ping me if the build fails.',
    'Great questions in class today, I added a short summary note.',
    'Office hours moved an hour later tomorrow.',
    'Submission window is open, please attach your write up.',
    'Feedback for the last batch is now in the gradebook.',
    'Anyone free to pair on the debugging exercise?'
  ];
begin
  select user_id into admin_id from public.user_roles where role = 'admin' limit 1;
  if admin_id is null then return; end if;
  select array_agg(id) into authors from public.profiles;

  for c in select id, code, title from public.courses order by code loop
    select id into t_id from public.threads
      where course_id = c.id and subject = c.code || ' space' limit 1;
    if t_id is null then
      insert into public.threads (subject, course_id, created_by, created_at, updated_at)
      values (c.code || ' space', c.id, admin_id, now() - interval '30 days', now())
      returning id into t_id;
    end if;

    insert into public.thread_participants (thread_id, user_id)
    select t_id, p.id from public.profiles p
    where not exists (
      select 1 from public.thread_participants tp
      where tp.thread_id = t_id and tp.user_id = p.id
    );

    if not exists (select 1 from public.messages where thread_id = t_id) then
      for i in 0..5 loop
        insert into public.messages (thread_id, body, author_id, created_at)
        values (
          t_id,
          bodies[1 + ((i + length(c.code)) % array_length(bodies, 1))],
          authors[1 + (i % array_length(authors, 1))],
          now() - make_interval(days => (6 - i)::int, hours => (3 + i)::int)
        );
      end loop;
    end if;
  end loop;

  for d in select unnest(array[
      'Grading plan for this term',
      'Capstone panel scheduling',
      'Vault clean up and tagging'
    ]) as subject loop
    select id into t_id from public.threads
      where course_id is null and subject = d.subject limit 1;
    if t_id is null then
      insert into public.threads (subject, course_id, created_by, created_at, updated_at)
      values (d.subject, null, admin_id, now() - interval '10 days', now())
      returning id into t_id;
    end if;

    insert into public.thread_participants (thread_id, user_id)
    select t_id, p.id from public.profiles p
    where not exists (
      select 1 from public.thread_participants tp
      where tp.thread_id = t_id and tp.user_id = p.id
    );

    if not exists (select 1 from public.messages where thread_id = t_id) then
      for i in 0..3 loop
        insert into public.messages (thread_id, body, author_id, created_at)
        values (
          t_id,
          bodies[1 + ((i + length(d.subject)) % array_length(bodies, 1))],
          authors[1 + (i % array_length(authors, 1))],
          now() - make_interval(days => (4 - i)::int, hours => (2 + i * 2)::int)
        );
      end loop;
    end if;
  end loop;
end $$;
