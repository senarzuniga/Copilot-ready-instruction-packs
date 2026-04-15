/**
 * Supabase Client
 *
 * Single shared Supabase instance for the entire factory.
 * Credentials are read exclusively from environment variables —
 * NO tokens are ever hardcoded or copy-pasted.
 */

import { createClient } from "@supabase/supabase-js";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        "Ensure .env.local is loaded or the variable is set in your shell."
    );
  }
  return value;
}

const url = requireEnv("SUPABASE_URL");
const key = requireEnv("SUPABASE_ANON_KEY");

export const supabase = createClient(url, key);

/**
 * Persist an agent-generated artefact to the `ai_generated_instructions` table.
 *
 * @param {object} data
 * @param {string} data.type    - e.g. "copilot_instructions"
 * @param {object} data.payload - Arbitrary JSON payload
 */
export async function saveToSupabase(data) {
  const { error } = await supabase
    .from("ai_generated_instructions")
    .insert([{ type: data.type, payload: data.payload }]);

  if (error) {
    throw new Error(`Supabase write failed: ${error.message}`);
  }
}

/**
 * Retrieve the most recent instruction packs for a given repo.
 *
 * @param {string} repo
 * @param {number} [limit=10]
 */
export async function fetchInstructions(repo, limit = 10) {
  const { data, error } = await supabase
    .from("ai_generated_instructions")
    .select("*")
    .eq("payload->>repo", repo)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Supabase read failed: ${error.message}`);
  }

  return data;
}
