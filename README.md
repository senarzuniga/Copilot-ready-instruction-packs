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

1. **Install Node.js and npm**:
   - Download and install Node.js from [nodejs.org](https://nodejs.org/).
   - Verify installation:
     ```bash
     node -v
     npm -v
     ```

2. **Install Python**:
   - Download and install Python from [python.org](https://www.python.org/).
   - Verify installation:
     ```bash
     python --version
     ```

3. **Install Supabase CLI (optional)**:
   - Follow the instructions on the [Supabase CLI GitHub page](https://github.com/supabase/cli) to install.
   - Verify installation:
     ```bash
     supabase --version
     ```

4. **Install project dependencies**:
   ```bash
   npm install
   ```

5. **Apply the database schema**:
   - Run the SQL in `supabase/storage.schema.sql` via the Supabase dashboard or CLI.

6. **Configure environment variables**:
   - Ensure your `.env.local` file is set up with the required variables.

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
- If Node.js or Python commands are not recognized, ensure they are added to your system's PATH.

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
