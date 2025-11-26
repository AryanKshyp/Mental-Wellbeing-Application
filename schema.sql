-- Campus Connect Supabase Schema
-- Run with a service role so auth schema inserts/policies succeed.

begin;

-- Extensions -----------------------------------------------------------------
create extension if not exists "pgcrypto";

-- Custom Types ----------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('student', 'senior', 'alumni', 'professor');
  end if;

  if not exists (select 1 from pg_type where typname = 'chat_status') then
    create type public.chat_status as enum ('active', 'closed');
  end if;

  if not exists (select 1 from pg_type where typname = 'availability_status') then
    create type public.availability_status as enum ('online', 'offline');
  end if;
end $$;

-- Helper Function -------------------------------------------------------------
create or replace function public.ensure_auth_user(
  p_email text,
  p_full_name text,
  p_password text default 'CampusConnect!234'
)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid;
begin
  select id into v_user_id from auth.users where email = lower(p_email);

  if v_user_id is null then
    v_user_id := gen_random_uuid();

    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    values (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      lower(p_email),
      crypt(p_password, gen_salt('bf')),
      now(),
      jsonb_build_object('provider', 'email'),
      jsonb_build_object('full_name', p_full_name),
      now(),
      now()
    );
  end if;

  return v_user_id;
end;
$$;

grant execute on function public.ensure_auth_user(text, text, text) to authenticated, anon;

-- Tables ----------------------------------------------------------------------
create or replace function public.set_timestamps()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  phone text,
  college_name text,
  year text,
  role public.user_role not null default 'student',
  interests text[] default '{}',
  stress_level int check (stress_level between 1 and 10),
  goals text[] default '{}',
  felt_overwhelmed boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_users_updated_at
before update on public.users
for each row
execute procedure public.set_timestamps();

create table if not exists public.mentors (
  user_id uuid primary key references public.users(id) on delete cascade,
  expertise_tags text[] not null default '{}',
  availability_status public.availability_status not null default 'offline',
  bio_tagline text,
  created_at timestamptz not null default now()
);

create table if not exists public.communities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.community_messages (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_community_messages_comm_created
  on public.community_messages (community_id, created_at desc);

create table if not exists public.direct_chats (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.users(id) on delete cascade,
  mentor_id uuid not null references public.users(id) on delete cascade,
  status public.chat_status not null default 'active',
  created_at timestamptz not null default now()
);

create unique index if not exists idx_direct_chats_pair
  on public.direct_chats (student_id, mentor_id) include (status);

create table if not exists public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.direct_chats(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_direct_messages_chat_created
  on public.direct_messages (chat_id, created_at);

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  streak_count int not null default 0,
  completed_dates date[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.journals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  content text not null,
  audio_url text,
  mood_score int check (mood_score between 1 and 10),
  created_at timestamptz not null default now()
);

-- RLS Policies ----------------------------------------------------------------
alter table public.users enable row level security;
alter table public.mentors enable row level security;
alter table public.communities enable row level security;
alter table public.community_messages enable row level security;
alter table public.direct_chats enable row level security;
alter table public.direct_messages enable row level security;
alter table public.habits enable row level security;
alter table public.journals enable row level security;

create policy "Users can view self"
  on public.users
  for select
  using (auth.uid() = id);

create policy "Users manage self"
  on public.users
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Everyone can view mentors"
  on public.mentors
  for select
  using (true);

create policy "Mentors manage own profile"
  on public.mentors
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Communities readable"
  on public.communities
  for select
  using (true);

create policy "Community messages readable"
  on public.community_messages
  for select
  using (true);

create policy "Community messages insert"
  on public.community_messages
  for insert
  with check (auth.uid() = user_id);

create policy "Direct chats readable"
  on public.direct_chats
  for select
  using (auth.uid() in (student_id, mentor_id));

create policy "Direct chats insert"
  on public.direct_chats
  for insert
  with check (auth.uid() = student_id or auth.uid() = mentor_id);

create policy "Direct chats update"
  on public.direct_chats
  for update
  using (auth.uid() in (student_id, mentor_id))
  with check (auth.uid() in (student_id, mentor_id));

create policy "Direct messages readable"
  on public.direct_messages
  for select
  using (
    auth.uid() in (
      select student_id from public.direct_chats where id = chat_id
      union
      select mentor_id from public.direct_chats where id = chat_id
    )
  );

create policy "Direct messages insert"
  on public.direct_messages
  for insert
  with check (
    auth.uid() in (
      select student_id from public.direct_chats where id = chat_id
      union
      select mentor_id from public.direct_chats where id = chat_id
    ) and auth.uid() = sender_id
  );

create policy "Habits owner access"
  on public.habits
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Journals owner access"
  on public.journals
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Seed Data -------------------------------------------------------------------
insert into public.communities (name, description) values
  ('Academic Stress', 'Share tips to manage assignments, exams, and expectations.'),
  ('Emotional Wellbeing', 'A safe space to vent and feel heard.'),
  ('Career Confusion', 'Talk about internships, placements, and future plans.')
on conflict (name) do update set description = excluded.description;

with senior_user as (
  select public.ensure_auth_user('sara.senior@campusconnect.app', 'Sara Menon', 'CampusConnect!234') as id
),
alumni_user as (
  select public.ensure_auth_user('arjun.alumni@campusconnect.app', 'Arjun Patel', 'CampusConnect!234') as id
),
prof_user as (
  select public.ensure_auth_user('prof.liang@campusconnect.app', 'Dr. Mei Liang', 'CampusConnect!234') as id
),
upserts as (
  insert into public.users (id, email, full_name, phone, college_name, year, role, interests, stress_level, goals, felt_overwhelmed)
  select
    id,
    case when source = 'senior' then 'sara.senior@campusconnect.app'
         when source = 'alumni' then 'arjun.alumni@campusconnect.app'
         else 'prof.liang@campusconnect.app'
    end as email,
    case when source = 'senior' then 'Sara Menon'
         when source = 'alumni' then 'Arjun Patel'
         else 'Dr. Mei Liang'
    end as full_name,
    case when source = 'senior' then '+1-555-1001'
         when source = 'alumni' then '+1-555-2002'
         else '+1-555-3003'
    end as phone,
    'Springfield University' as college_name,
    case when source = 'prof' then 'Faculty' else 'Class of 2024' end as year,
    case when source = 'senior' then 'senior'
         when source = 'alumni' then 'alumni'
         else 'professor'
    end::public.user_role,
    case when source = 'senior' then array['academic stress','project planning']
         when source = 'alumni' then array['placements','career pivot']
         else array['research mentoring','mental wellness']
    end::text[],
    3,
    array['support students','share experience'],
    false
  from (
    select id, 'senior' as source from senior_user
    union all
    select id, 'alumni' from alumni_user
    union all
    select id, 'prof' from prof_user
  ) s
  on conflict (id) do update
    set email = excluded.email,
        full_name = excluded.full_name,
        role = excluded.role
  returning id, source
)
insert into public.mentors (user_id, expertise_tags, availability_status, bio_tagline)
select
  id,
  case when source = 'senior' then array['labs','exam prep','study circles']
       when source = 'alumni' then array['placements','product management','startups']
       else array['emotional resilience','research methods','faculty insights']
  end,
  'online',
  case when source = 'senior' then 'Final year CS mentor for projects & burnout prevention.'
       when source = 'alumni' then 'PM at a YC startup, happy to talk careers & pivots.'
       else 'Psychology professor focusing on mindfulness for STEM majors.'
  end
from upserts
on conflict (user_id) do update
  set expertise_tags = excluded.expertise_tags,
      availability_status = excluded.availability_status,
      bio_tagline = excluded.bio_tagline;

commit;

