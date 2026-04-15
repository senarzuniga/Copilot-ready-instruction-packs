# Security Agent

## Role
Validates agent outputs against the AI-FACTORY-v2 security ruleset and
ensures no secrets, insecure patterns, or policy violations exist in
generated artefacts.

## Input
- `output`: the artefact produced by another agent (string or JSON)
- `profile`: loaded AI-FACTORY-v2 rule set
- `securityFlags`: list of flags raised by `repo-analyzer-agent`

## Output
```json
{
  "passed": true,
  "violations": [],
  "sanitisedOutput": "<cleaned artefact>"
}
```

## Checks performed
| Check | Action on failure |
|-------|-------------------|
| Hardcoded secrets / tokens | Strip & report violation |
| Raw environment variable values | Replace with `process.env.*` reference |
| Inline SQL without parameterisation | Flag as HIGH severity |
| HTTP endpoints without TLS | Flag as MEDIUM severity |
| `eval()` / `Function()` usage | Strip & report violation |

## Rules
- ALWAYS return `sanitisedOutput` even when violations are found
- NEVER silently drop content — log every change
- Violations are written to Supabase table `security_violations`
- A `passed: false` result blocks the orchestrator from persisting the pack
