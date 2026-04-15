/**
 * Repo Context — Profile Loader (JavaScript re-export)
 *
 * JavaScript entry point that delegates to the TypeScript implementation.
 * The workflow engine (ESM .js) imports from this file.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

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

/**
 * Load the AI-FACTORY-v2 profile from disk.
 *
 * Resolution order:
 *   1. AGENT_PROFILE_PATH environment variable
 *   2. ../AI-FACTORY-v2/profile.md relative to repo root
 *   3. Built-in minimal profile (development fallback)
 *
 * @returns {Promise<{ version: string, rules: string, loadedAt: string }>}
 */
export async function loadProfile() {
  const candidates = [
    process.env["AGENT_PROFILE_PATH"],
    path.resolve(__dirname, "..", "..", "AI-FACTORY-v2", "profile.md"),
    path.resolve(__dirname, "..", "AI-FACTORY-v2", "profile.md"),
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      const rules = fs.readFileSync(candidate, "utf8");
      console.log(`✅ AI-FACTORY-v2 profile loaded from: ${candidate}`);
      return { version: "v2", rules, loadedAt: new Date().toISOString() };
    }
  }

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
