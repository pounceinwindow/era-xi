import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import { dailySeed } from "../../../src/game/engine.ts";
import { corsHeaders, json } from "../_shared/cors.ts";

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) return json({ error: "Unauthorized" }, 401);

  const url = Deno.env.get("SUPABASE_URL")!;
  const publishableKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const authClient = createClient(url, publishableKey, { global: { headers: { Authorization: authHeader } } });
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return json({ error: "Unauthorized" }, 401);

  const admin = createClient(url, serviceKey);
  const challengeDate = new Date().toISOString().slice(0, 10);
  const seed = dailySeed(new Date(`${challengeDate}T00:00:00Z`));
  const { data: challenge, error: challengeError } = await admin.from("daily_challenges")
    .upsert({ challenge_date: challengeDate, seed }, { onConflict: "challenge_date" })
    .select("id,seed").single();
  if (challengeError) return json({ error: challengeError.message }, 500);

  const { data: attempt, error: attemptError } = await admin.from("daily_attempts")
    .upsert({ user_id: user.id, challenge_id: challenge.id }, { onConflict: "user_id,challenge_id", ignoreDuplicates: true })
    .select("id,completed_at").single();
  if (attemptError) {
    const existing = await admin.from("daily_attempts").select("id,completed_at")
      .eq("user_id", user.id).eq("challenge_id", challenge.id).single();
    if (existing.error) return json({ error: existing.error.message }, 500);
    return json({ attemptId: existing.data.id, seed: challenge.seed, completed: Boolean(existing.data.completed_at) });
  }
  return json({ attemptId: attempt.id, seed: challenge.seed, completed: Boolean(attempt.completed_at) });
});
