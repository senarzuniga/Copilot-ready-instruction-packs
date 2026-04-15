# AI Copilot Instruction Factory

> An AI Agent–driven system that generates GitHub Copilot instruction packs,
> governed by a strict agent profile (AI-FACTORY-v2) and backed by a shared
> Supabase infrastructure with **zero copy-paste secrets**.

---

## Purpose

This repository runs AI agents that produce:

- **GitHub Copilot instruction sets** (`.github/copilot-instructions.md`)
- App scaffolding prompts
- Repository-level coding standards
- Task execution blueprints

Every output is enforced against the **AI-FACTORY-v2** agent profile and
persisted to Supabase automatically.

---

## Repository structure

```
ai-copilot-instruction-factory/
│
├── agents/
│   ├── orchestrator.agent.md          ← CEO agent — coordinates the pipeline
│   ├── copilot-instruction-agent.md   ← Generates Copilot instruction packs
│   ├── copilot-instruction-agent.js   ← Agent implementation
│   ├── repo-analyzer-agent.md         ← Inspects repository structure
│   ├── security-agent.md              ← Validates & sanitises outputs
│   └── profile-loader.agent.md        ← Loads AI-FACTORY-v2 rules (runs first)
│
├── core/
│   ├── workflow-engine.js             ← Orchestrator entry point
│   ├── agent-runtime.js               ← Repo analyser + security validator
│   ├── prompt-engine.js               ← Structured prompt builders
│   └── instruction-builder.js         ← Renders & writes instruction packs
│
├── supabase/
│   ├── client.js                      ← Shared Supabase client (no hardcoded tokens)
│   ├── sync.ts                        ← Project link + .env.local distribution
│   ├── storage.schema.sql             ← Database schema (run once)
│   └── edge-functions/
│       ├── save-instructions/         ← Edge function: persist instructions
│       └── generate-pack/             ← Edge function: queue generation requests
│
├── workflows/
│   ├── create-copilot-pack.yaml       ← Full instruction-generation pipeline
│   ├── analyze-repo.yaml              ← Repository analysis only
│   └── generate-agent-profile.yaml   ← Generate a custom agent profile
│
├── launcher/
│   └── launcher.py                    ← Entry point (loads env, starts engine)
│
├── shared/
│   ├── env.loader.ts                  ← Env loader + variable validation
│   ├── repo-context.ts                ← Profile loader (AI-FACTORY-v2)
│   └── agent-guardrails.ts            ← Runtime guardrail wrapper for agents
│
├── scripts/
│   ├── bootstrap.ps1                  ← One-time project setup
│   ├── deploy_functions.ps1           ← Deploy Supabase Edge Functions
│   ├── supabase_sync.ps1              ← Link project + sync .env.local
│   └── run_agents.ps1                 ← Run the agent workflow
│
├── .env.local.example                 ← Template — copy to .env.local
├── package.json
├── tsconfig.json
└── README.md
```

---

## Quick start

### 1. Prerequisites

- Node.js ≥ 18
- Python ≥ 3.9
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- PowerShell ≥ 7 (Windows/macOS/Linux)

### 2. Bootstrap

```powershell
powershell ./scripts/bootstrap.ps1
```

This installs Node.js and Python dependencies and verifies your environment.

### 3. Configure environment

```bash
cp .env.local.example .env.local
# Edit .env.local with your Supabase URL, anon key, and project ID
```

Set `SUPABASE_ACCESS_TOKEN` as a **persistent machine variable** (not in `.env.local`):

```powershell
# Windows
setx SUPABASE_ACCESS_TOKEN "sbp_xxx"

# macOS / Linux
export SUPABASE_ACCESS_TOKEN="sbp_xxx"
```

### 4. Apply database schema

Run `supabase/storage.schema.sql` once in the Supabase SQL editor or via migration.

### 5. Deploy Edge Functions

```powershell
npm run supabase:deploy
```

No tokens are passed as arguments — the script reads `SUPABASE_ACCESS_TOKEN`
from the machine environment automatically.

### 6. Run the factory

```bash
npm run start
```

Or, to run just the agent pipeline:

```powershell
powershell ./scripts/run_agents.ps1
```

---

## How it works

```
npm run start
    │
    ▼
launcher/launcher.py
    │  loads .env.local
    │  validates env vars
    ▼
core/workflow-engine.js
    │
    ├─► shared/repo-context.ts      → load AI-FACTORY-v2 profile
    ├─► core/agent-runtime.js       → analyzeRepo()
    ├─► agents/copilot-instruction-agent.js → generate instructions
    ├─► core/agent-runtime.js       → validateOutput() (security gate)
    └─► supabase/client.js          → saveToSupabase()
```

### Security gate

The security agent checks every generated artefact for:

| Risk | Action |
|------|--------|
| `eval()` / `new Function()` | Strip & report violation |
| Non-TLS HTTP endpoints | Flag as MEDIUM |
| Hardcoded secrets/tokens | Strip & report violation |

A `passed: false` result **blocks** persistence and throws an error.

---

## Agent profile (AI-FACTORY-v2)

Every agent **must** load the profile before generating output.
Place your profile at `../AI-FACTORY-v2/profile.md` or set:

```bash
AGENT_PROFILE_PATH=/path/to/your/profile.md
```

If no profile is found, a minimal built-in ruleset is used with a warning.

---

## Supabase — no copy-paste secrets

| Variable | Where it lives |
|----------|---------------|
| `SUPABASE_URL` | `.env.local` |
| `SUPABASE_ANON_KEY` | `.env.local` |
| `SUPABASE_PROJECT_ID` | `.env.local` |
| `SUPABASE_ACCESS_TOKEN` | Machine env (never in files) |

`.env.local` is gitignored and **never committed**.

---

## Extending the factory

| Goal | What to add |
|------|-------------|
| New agent | Add `agents/my-agent.md` + `agents/my-agent.js`, wire into `workflow-engine.js` |
| New workflow | Add `workflows/my-workflow.yaml` |
| New Edge Function | Add `supabase/edge-functions/my-fn/index.ts`, redeploy |
| LLM integration | Replace stub logic in `agents/copilot-instruction-agent.js` with LLM API calls, using prompts from `core/prompt-engine.js` |
