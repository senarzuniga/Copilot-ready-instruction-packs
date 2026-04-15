-- Supabase Storage Schema
-- Run this once against your Supabase project (SQL editor or migration)

-- AI-generated Copilot instruction packs
create table if not exists ai_generated_instructions (
  id          uuid        primary key default gen_random_uuid(),
  type        text        not null,
  payload     jsonb       not null,
  created_at  timestamptz not null default now()
);

-- Index for fast lookup by repo (stored inside the JSONB payload)
create index if not exists idx_instructions_repo
  on ai_generated_instructions ((payload->>'repo'));

-- Security violations raised by the security agent
create table if not exists security_violations (
  id            uuid        primary key default gen_random_uuid(),
  instruction_id uuid       references ai_generated_instructions(id) on delete cascade,
  severity      text        not null check (severity in ('HIGH', 'MEDIUM', 'LOW')),
  message       text        not null,
  created_at    timestamptz not null default now()
);

-- Row-level security: service role only (no anonymous writes)
alter table ai_generated_instructions enable row level security;
alter table security_violations       enable row level security;

create policy "service_role_all_instructions"
  on ai_generated_instructions
  for all
  using (auth.role() = 'service_role');

create policy "service_role_all_violations"
  on security_violations
  for all
  using (auth.role() = 'service_role');
