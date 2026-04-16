/**
 * Env Loader
 *
 * Loads .env.local and validates required variables at startup.
 * Call this once at the top of any entrypoint that isn't started via
 * launcher.py (which already loads the env).
 */

import { config } from "dotenv";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const REQUIRED_VARS = ["SUPABASE_URL", "SUPABASE_ANON_KEY"];

/**
 * Load .env.local from the repository root and assert required variables.
 *
 * @param {string} [rootDir] - Override the root directory (defaults to repo root)
 */
export function loadEnv(rootDir?: string): void {
  const root = rootDir ?? resolve(__dirname, "..");
  const envPath = resolve(root, ".env.local");

  const result = config({ path: envPath });

  if (result.error) {
    console.warn(`⚠️  Could not load ${envPath} — relying on shell environment`);
  } else {
    console.log(`✅ Environment loaded from ${envPath}`);
  }

  const missing = REQUIRED_VARS.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}. ` +
        "Set them in .env.local or your shell."
    );
  }
}
