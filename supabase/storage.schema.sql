-- Supabase storage schema for Copilot-ready instruction packs

create table if not exists ai_generated_instructions (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);
