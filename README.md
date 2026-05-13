# eKonkursi — Next.js + Supabase

Albanian public-sector competitions transparency platform.

## Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** + CSS variables for light/dark theming
- **Supabase** (Auth, Postgres with RLS, Storage)
- **Chart.js** via `react-chartjs-2`

## Project structure

```
src/
  app/
    layout.tsx                Root layout + providers
    page.tsx                  Landing (login/register/forgot)
    auth/callback/route.ts    Supabase auth callback
    (candidate)/              Candidate-only routes (layout guards)
      dashboard/page.tsx
      konkurset/page.tsx
      apliko/page.tsx
      rezultatet/page.tsx
      ankesat/page.tsx
    (admin)/                  Admin-only routes (layout guards)
      admin/page.tsx
      admin/konkurset/page.tsx
      admin/aplikimet/page.tsx
      admin/ankesat/page.tsx
  components/
    providers/                AuthProvider, ThemeProvider, ToastProvider
    layout/                   Header, Sidebar, AppShell
    ui/                       Modal, StatusBadge, ThemeToggle
    chat/                     ChatBot
  lib/
    supabase/                 client.ts, server.ts, middleware.ts
    types.ts                  Domain types
    utils.ts                  formatDate, getCountdown, getStatusInfo
middleware.ts                 Route protection by role
supabase/schema.sql           Full DB schema + RLS + seed data
```

## Setup

### 1. Install dependencies

```powershell
npm install
```

### 2. Create a Supabase project

Go to <https://supabase.com/dashboard> and create a new project.

### 3. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

Find these in Supabase Dashboard → Settings → API.

### 4. Run the database schema

In Supabase Dashboard → SQL editor, paste the entire contents of
`supabase/schema.sql` and run it. This will create:

- Enums (`user_role`, `konkurs_status`, etc.)
- Tables (`profiles`, `konkurset`, `aplikimet`, `rezultatet`, `ankesat`, `njoftimet`)
- Triggers (auto-create profile on signup; bump aplikime counter)
- Row Level Security policies
- A private storage bucket `aplikim-dokumente` for CV/diploma uploads
- Seed competitions + sample results

### 5. (Optional) Disable email confirmation for dev

Supabase Dashboard → Authentication → Providers → Email → uncheck
"Confirm email" so new accounts can sign in immediately.

### 6. Create an admin account

1. Register an account at `/` and choose "Admin" tab.
2. Supabase Dashboard → Table editor → `profiles` → set `role = 'admin'`
   for that user (the trigger defaults new admins to `kandidat` if the
   metadata isn't passed correctly — easiest is to update manually).

### 7. Run the dev server

```powershell
npm run dev
```

Open <http://localhost:3000>.

## Roles

- **Kandidat** — can apply for competitions, view their own applications,
  submit complaints, view results.
- **Admin** — manages all competitions, approves/rejects applications,
  resolves complaints, sees system-wide statistics.

Routes are protected both server-side (in `middleware.ts`) and client-side
(in each route-group `layout.tsx`).

## Storage

CVs and diplomas are uploaded to the private `aplikim-dokumente` bucket
under the path `{user_id}/{timestamp}-{label}-{filename}`. RLS policies
restrict reads to the owner and admins.

## Notes

- The legacy vanilla HTML/CSS/JS version is backed up at
  `%TEMP%\opencode\puna-legacy-backup` (outside the workspace).
- All UI strings are in Albanian (Shqip), matching the original.
- The chatbot is a static rule-based assistant (same knowledge base as
  the legacy `chat.js`). Wire it to an LLM later if desired.
