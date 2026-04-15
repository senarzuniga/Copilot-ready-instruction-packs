# Profile Loader Agent

## Role
Loads the AI-FACTORY-v2 agent profile and makes it available to every
other agent in the pipeline.  **This agent MUST be invoked first.**

## Input
- `profilePath` (optional): override path to the profile file.
  Default: `../AI-FACTORY-v2/profile.md`

## Output
```json
{
  "version": "v2",
  "rules": "<full profile Markdown content>",
  "loadedAt": "2024-01-01T00:00:00Z"
}
```

## Load order
1. Check `AGENT_PROFILE_PATH` environment variable
2. Fall back to `../AI-FACTORY-v2/profile.md`
3. If neither exists, throw `AgentProfileMissingError` — **do not continue**

## Rules
- Profile is READ-ONLY — never modify it
- Expose `rules` as a plain string to downstream agents
- Cache result in memory for the duration of the workflow run
- Log profile version to console on successful load
