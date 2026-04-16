/**
 * Repo Context — Profile Loader
 *
 * Loads the AI-FACTORY-v2 agent profile that governs every agent in
 * the pipeline.  Every agent MUST call loadProfile() before generating
 * any output.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export interface AgentProfile {
  version: string;
  rules: string;
  loadedAt: string;
}

/**
 * Load the AI-FACTORY-v2 profile from disk.
 *
 * Resolution order:
 *   1. `AGENT_PROFILE_PATH` environment variable
 *   2. `../AI-FACTORY-v2/profile.md` relative to repo root
 *   3. A bundled minimal profile (development fallback)
 *
 * @throws {Error} If no profile can be found
 */
export async function loadProfile(): Promise<AgentProfile> {
  const candidates = [
    process.env["AGENT_PROFILE_PATH"],
    path.resolve(__dirname, "..", "..", "AI-FACTORY-v2", "profile.md"),
    path.resolve(__dirname, "..", "AI-FACTORY-v2", "profile.md"),
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      const rules = fs.readFileSync(candidate, "utf8");
      const profile: AgentProfile = {
        version: "v2",
        rules,
        loadedAt: new Date().toISOString(),
      };
      console.log(`✅ AI-FACTORY-v2 profile loaded from: ${candidate}`);
      return profile;
    }
  }

  // Development fallback — warns clearly but allows the pipeline to run
  console.warn(
    "⚠️  AI-FACTORY-v2 profile not found. Using built-in minimal ruleset.\n" +
      "   To use your own profile, set AGENT_PROFILE_PATH or place it at\n" +
      "   ../AI-FACTORY-v2/profile.md"
  );

  return {
    version: "v2-minimal",
    rules: MINIMAL_PROFILE,
    loadedAt: new Date().toISOString(),
  };
}

// NOTE: The runtime implementation lives in shared/repo-context.js (ESM JavaScript).
// This TypeScript file provides type declarations and the same logic
// for TypeScript consumers. Keep MINIMAL_PROFILE and the warning message
// in sync with repo-context.js.

const MINIMAL_PROFILE = `# AI-FACTORY-v2 Minimal Profile

## Core Rules
- Generate production-ready code only
- No hardcoded secrets or tokens
- Use shared infrastructure clients (Supabase) exclusively
- All outputs must be validated by the security agent
- Enforce modular, maintainable architecture
- Never use eval() or new Function()
- Handle all async errors explicitly
`;
