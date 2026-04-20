# Copilot-ready Instruction Packs

Governed by a strict agent profile (from your AI-FACTORY-v2) and backed by a shared Supabase infrastructure.

## Table of Contents
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Setup](#setup)
- [Running](#running)
- [Database Schema](#database-schema)
- [Scripts](#scripts)
- [Troubleshooting](#troubleshooting)
- [Examples](#examples)

## Project Structure

```
├── agents/                    # AI agent definitions
│   └── copilot-instruction-agent.js
├── core/                      # Core engine logic
│   └── workflow-engine.js
├── launcher/                  # Entry point launcher
│   └── launcher.py
├── scripts/                   # PowerShell deployment scripts
│   ├── deploy_functions.ps1
│   └── supabase_sync.ps1
├── shared/                    # Shared utilities
│   └── repo-context.js
├── supabase/                  # Supabase client and schema
│   ├── client.js
│   └── storage.schema.sql
├── .env.local                 # Local environment variables (not committed)
├── package.json
└── tsconfig.json
```

## Prerequisites

- Node.js >= 20
- Python >= 3.8
- Supabase project

## Environment Variables

Create a `.env.local` file in the project root (not committed to git) with:

```env
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_ACCESS_TOKEN=your-supabase-access-token
SUPABASE_PROJECT_ID=your-supabase-project-id
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Apply the database schema to your Supabase project by running the SQL in `supabase/storage.schema.sql` via the Supabase dashboard or CLI.

3. Configure your `.env.local` with the required environment variables.

## Running

Start via npm:
```bash
npm run start
```

Or via the Python launcher:
```bash
python launcher/launcher.py
```

## Database Schema

The system uses a `ai_generated_instructions` table with the following columns:

| Column       | Type        | Description                        |
|--------------|-------------|------------------------------------|
| `id`         | uuid        | Primary key (auto-generated)       |
| `type`       | text        | Instruction type/category          |
| `payload`    | jsonb       | Instruction data as JSON           |
| `created_at` | timestamptz | Timestamp of creation (auto-set)   |

## Scripts

- `scripts/deploy_functions.ps1` — Deploy Supabase Edge Functions
- `scripts/supabase_sync.ps1` — Sync database schema to Supabase

## Troubleshooting

- Ensure all environment variables are correctly set in `.env.local`.
- Check Supabase project settings if database sync fails.

## Examples

- Example command to start the project:
  ```bash
  npm run start
  ```
- Example database schema application:
  ```sql
  -- Example SQL command
  SELECT * FROM ai_generated_instructions;
  ```
