# Mixtape Planner

A lightweight React + Vite starter that lets you experiment with project and track organisation right in the browser.  
It now ships with an optional [Supabase](https://supabase.com) backend (free tier) so you can persist accounts, projects, and uploaded tracks beyond `localStorage`.

## Project Structure

- `src/App.jsx` – the entire UI and state management in one file
- `src/App.css` – a single stylesheet with approachable, plain CSS
- `src/index.css` – minimal global resets

## Requirements

- Node.js 18 or newer
- npm (bundled with Node)

## Getting Started

```bash
npm install
npm run dev
```

Open the printed URL (typically http://localhost:5173) to start adding projects and tracks.  
By default data is stored in `localStorage`, so it survives page refreshes in the same browser.  
Connect Supabase to sync across devices.

## Connect Supabase (Free)

1. Create a Supabase project (free tier is enough) and copy the **project URL** and **anon key**.
2. Create a public storage bucket named `mixtape-tracks`.
3. Run the SQL below in the Supabase SQL editor to create the tables:

```sql
create table if not exists profiles (
  id uuid primary key,
  email text unique not null,
  name text not null
);

create table if not exists projects (
  id uuid primary key,
  user_id uuid references profiles(id) on delete cascade,
  name text not null,
  owner text not null,
  cover_gradient text,
  created_at timestamptz default now()
);

create table if not exists tracks (
  id uuid primary key,
  project_id uuid references projects(id) on delete cascade,
  title text not null,
  file_url text not null,
  storage_path text not null,
  file_size bigint,
  duration double precision,
  created_at timestamptz default now()
);
```

4. Copy `.env.example` → `.env` and fill in:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_STORAGE_BUCKET=mixtape-tracks
```

Restart `npm run dev` so Vite picks up the env file.  
When env vars are missing the app gracefully falls back to purely local storage.

## Build For Production

```bash
npm run build
```

The optimised output is placed in `dist/`.

## Ideas To Extend

1. Persist projects to your own API instead of `localStorage`.
2. Add waveform or spectrum visualisers for uploaded tracks.
3. Export all project data as JSON for sharing with collaborators.
