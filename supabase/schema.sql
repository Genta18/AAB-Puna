-- ============================================================
-- eKonkursi — Supabase Schema
-- Paste this into Supabase SQL editor (https://supabase.com/dashboard/project/_/sql)
-- ============================================================

-- ---------- ENUMS ----------
do $$ begin
  create type user_role as enum ('kandidat', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type konkurs_status as enum ('aktiv', 'mbyllur', 'shqyrtim');
exception when duplicate_object then null; end $$;

do $$ begin
  create type aplikim_status as enum ('shqyrtim', 'pranuar', 'refuzuar');
exception when duplicate_object then null; end $$;

do $$ begin
  create type rezultat_status as enum ('kaloi', 'refuzuar', 'pritje');
exception when duplicate_object then null; end $$;

do $$ begin
  create type ankesa_status as enum ('shqyrtim', 'zgjidhur', 'refuzuar');
exception when duplicate_object then null; end $$;

do $$ begin
  create type njoftim_tip as enum ('success', 'info', 'warning', 'error');
exception when duplicate_object then null; end $$;

-- ---------- PROFILES ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null,
  role user_role not null default 'kandidat',
  code text unique,
  created_at timestamptz not null default now()
);

-- Auto-create a profile when a new auth user is registered
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role, code)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'kandidat'),
    case
      when coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'kandidat') = 'kandidat'
      then 'K-' || lpad(floor(random()*9000 + 1000)::text, 4, '0')
      else null
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- KONKURSET ----------
create table if not exists public.konkurset (
  id bigserial primary key,
  pozita text not null,
  institucioni text not null,
  afati date not null,
  statusi konkurs_status not null default 'aktiv',
  kategoria text not null,
  vende int not null default 1,
  aplikime int not null default 0,
  paga text,
  pershkrimi text,
  created_at timestamptz not null default now()
);

-- ---------- APLIKIMET ----------
create table if not exists public.aplikimet (
  id bigserial primary key,
  kandidat_id uuid not null references public.profiles(id) on delete cascade,
  konkurs_id bigint not null references public.konkurset(id) on delete cascade,
  data date not null default current_date,
  statusi aplikim_status not null default 'shqyrtim',
  hapi text default 'Pranimi i dosjes',
  pika_testi int,
  pika_intervistes int,
  cv_url text,
  diploma_url text,
  extra_urls text[],
  emri text,
  mbiemri text,
  email text,
  tel text,
  np text,
  arsimi text,
  adresa text,
  created_at timestamptz not null default now()
);

create index if not exists aplikimet_kandidat_idx on public.aplikimet(kandidat_id);
create index if not exists aplikimet_konkurs_idx on public.aplikimet(konkurs_id);

-- Increment konkurs.aplikime when a new aplikim is created
create or replace function public.bump_konkurs_aplikime()
returns trigger language plpgsql as $$
begin
  update public.konkurset set aplikime = aplikime + 1 where id = new.konkurs_id;
  return new;
end;
$$;

drop trigger if exists on_aplikim_insert on public.aplikimet;
create trigger on_aplikim_insert
  after insert on public.aplikimet
  for each row execute procedure public.bump_konkurs_aplikime();

-- ---------- REZULTATET ----------
create table if not exists public.rezultatet (
  id bigserial primary key,
  kodi text not null,
  emri text not null,
  konkurs text not null,
  pika_testi int not null default 0,
  pika_intervistes int not null default 0,
  totali int generated always as (pika_testi + pika_intervistes) stored,
  vendi int,
  statusi rezultat_status not null default 'pritje',
  created_at timestamptz not null default now()
);

-- ---------- ANKESAT ----------
create table if not exists public.ankesat (
  id bigserial primary key,
  kandidat_id uuid not null references public.profiles(id) on delete cascade,
  tema text not null,
  kategoria text not null,
  data date not null default current_date,
  statusi ankesa_status not null default 'shqyrtim',
  pershkrimi text not null,
  konkurs_id bigint references public.konkurset(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists ankesat_kandidat_idx on public.ankesat(kandidat_id);

-- ---------- NJOFTIMET ----------
create table if not exists public.njoftimet (
  id bigserial primary key,
  kandidat_id uuid references public.profiles(id) on delete cascade, -- null = broadcast
  tekst text not null,
  data date not null default current_date,
  lexuar boolean not null default false,
  tip njoftim_tip not null default 'info',
  created_at timestamptz not null default now()
);

create index if not exists njoftimet_kandidat_idx on public.njoftimet(kandidat_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.konkurset enable row level security;
alter table public.aplikimet enable row level security;
alter table public.rezultatet enable row level security;
alter table public.ankesat enable row level security;
alter table public.njoftimet enable row level security;

-- Helper to check admin
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---- PROFILES ----
drop policy if exists "profiles_select_self" on public.profiles;
create policy "profiles_select_self" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin());

-- ---- KONKURSET (publicly readable) ----
drop policy if exists "konkurset_read_all" on public.konkurset;
create policy "konkurset_read_all" on public.konkurset
  for select using (true);

drop policy if exists "konkurset_admin_write" on public.konkurset;
create policy "konkurset_admin_write" on public.konkurset
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- APLIKIMET ----
drop policy if exists "aplikimet_own_read" on public.aplikimet;
create policy "aplikimet_own_read" on public.aplikimet
  for select using (auth.uid() = kandidat_id or public.is_admin());

drop policy if exists "aplikimet_own_insert" on public.aplikimet;
create policy "aplikimet_own_insert" on public.aplikimet
  for insert with check (auth.uid() = kandidat_id);

drop policy if exists "aplikimet_admin_update" on public.aplikimet;
create policy "aplikimet_admin_update" on public.aplikimet
  for update using (public.is_admin());

drop policy if exists "aplikimet_admin_delete" on public.aplikimet;
create policy "aplikimet_admin_delete" on public.aplikimet
  for delete using (public.is_admin());

-- ---- REZULTATET (publicly readable, admin writes) ----
drop policy if exists "rezultatet_read_all" on public.rezultatet;
create policy "rezultatet_read_all" on public.rezultatet
  for select using (true);

drop policy if exists "rezultatet_admin_write" on public.rezultatet;
create policy "rezultatet_admin_write" on public.rezultatet
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- ANKESAT ----
drop policy if exists "ankesat_own_read" on public.ankesat;
create policy "ankesat_own_read" on public.ankesat
  for select using (auth.uid() = kandidat_id or public.is_admin());

drop policy if exists "ankesat_own_insert" on public.ankesat;
create policy "ankesat_own_insert" on public.ankesat
  for insert with check (auth.uid() = kandidat_id);

drop policy if exists "ankesat_admin_update" on public.ankesat;
create policy "ankesat_admin_update" on public.ankesat
  for update using (public.is_admin());

-- ---- NJOFTIMET ----
drop policy if exists "njoftimet_own_read" on public.njoftimet;
create policy "njoftimet_own_read" on public.njoftimet
  for select using (kandidat_id is null or auth.uid() = kandidat_id or public.is_admin());

drop policy if exists "njoftimet_own_update" on public.njoftimet;
create policy "njoftimet_own_update" on public.njoftimet
  for update using (auth.uid() = kandidat_id);

drop policy if exists "njoftimet_admin_write" on public.njoftimet;
create policy "njoftimet_admin_write" on public.njoftimet
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- STORAGE BUCKETS (for CV / Diploma uploads)
-- Run in SQL editor OR create the bucket manually in Storage tab.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('aplikim-dokumente', 'aplikim-dokumente', false)
on conflict (id) do nothing;

drop policy if exists "storage_own_upload" on storage.objects;
create policy "storage_own_upload" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'aplikim-dokumente'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "storage_own_read" on storage.objects;
create policy "storage_own_read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'aplikim-dokumente'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

-- ============================================================
-- SEED DATA (matches legacy DB)
-- ============================================================

insert into public.konkurset (pozita, institucioni, afati, statusi, kategoria, vende, aplikime, paga, pershkrimi) values
  ('Zyrtar i Burimeve Njerëzore','Ministria e Financave','2026-05-28','aktiv','Sherbim Civil',2,34,'600-900€','Menaxhimi i proceseve të rekrutimit dhe burimeve njerëzore në ministri.'),
  ('Asistent Administrativ','Komuna e Prishtinës','2026-06-05','aktiv','Administrativ',3,58,'500-700€','Mbështetja administrative dhe koordinimi i korrespondencës zyrtare.'),
  ('Zyrtar Financiar','Agjencia e Prokurimit','2026-06-12','aktiv','Financa',1,21,'700-1000€','Menaxhimi i buxhetit dhe raporteve financiare të agjencisë.'),
  ('Inspektor i Punës','Ministria e Punës','2026-04-30','mbyllur','Inspektim',4,89,'650-850€','Inspektimi i kushteve të punës dhe zbatimi i legjislacionit.'),
  ('IT Specialist','KRPP','2026-06-20','aktiv','Teknologji',2,12,'800-1200€','Administrimi i sistemeve informatike dhe sigurisë kibernetike.'),
  ('Jurist','Zyra e Kryeministrit','2026-05-15','shqyrtim','Juridik',1,45,'700-950€','Hartimi dhe rishikimi i akteve juridike dhe kontratave.')
on conflict do nothing;

insert into public.rezultatet (kodi, emri, konkurs, pika_testi, pika_intervistes, vendi, statusi) values
  ('K-1025','Arben Krasniqi','IT Specialist – KRPP',72,31,1,'kaloi'),
  ('K-1041','Besarta Morina','IT Specialist – KRPP',68,28,2,'pritje'),
  ('K-1033','Drilon Hoxha','IT Specialist – KRPP',55,22,3,'refuzuar')
on conflict do nothing;
