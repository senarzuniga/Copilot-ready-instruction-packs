/**
 * Edge Function: generate-pack
 *
 * Triggers the Copilot instruction generation pipeline and persists
 * the result.  Accepts a POST with { repo, task }.
 *
 * Deploy with:
 *   supabase functions deploy generate-pack
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  let body: { repo: string; task?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!body.repo) {
    return new Response(
      JSON.stringify({ error: "Field 'repo' is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Store the generation request — the node workflow engine handles execution
  const { data, error } = await supabase
    .from("ai_generated_instructions")
    .insert([
      {
        type: "generation_request",
        payload: {
          repo: body.repo,
          task: body.task ?? "generate_copilot_instructions",
          status: "queued",
        },
      },
    ])
    .select("id")
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({ message: "Generation queued", id: data.id }),
    { status: 202, headers: { "Content-Type": "application/json" } }
  );
});
