import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import {
  calculateScore,
  createRun,
  getDraftOffer,
  isTournamentOver,
  reachedStage,
  simulateMatch
} from "../../../src/game/engine.ts";
import type { FormationId, TacticChoice } from "../../../src/game/types.ts";
import { corsHeaders, json } from "../_shared/cors.ts";

const formations = new Set<FormationId>(["4-3-3","4-2-3-1","4-4-2","3-5-2"]);
const nicknamePattern = /^[\p{L}\p{N}_-]{3,16}$/u;

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

  const body = await request.json();
  if (!nicknamePattern.test(body.nickname) || !formations.has(body.formation) ||
      !Array.isArray(body.pickedPlayerIds) || body.pickedPlayerIds.length !== 11 ||
      new Set(body.pickedPlayerIds).size !== 11 || !Array.isArray(body.lineupOrder) ||
      body.lineupOrder.length !== 11 || new Set(body.lineupOrder).size !== 11 ||
      !body.lineupOrder.every((id: string) => body.pickedPlayerIds.includes(id)) ||
      !Array.isArray(body.matchPlans) || body.matchPlans.length < 3 || body.matchPlans.length > 7) {
    return json({ error: "Invalid run payload" }, 400);
  }

  const admin = createClient(url, serviceKey);
  const today = new Date().toISOString().slice(0, 10);
  const { data: challenge } = await admin.from("daily_challenges").select("id,seed").eq("challenge_date", today).single();
  if (!challenge || challenge.seed !== body.seed) return json({ error: "Unknown challenge" }, 400);
  const { data: attempt } = await admin.from("daily_attempts").select("id,completed_at")
    .eq("user_id", user.id).eq("challenge_id", challenge.id).single();
  if (!attempt || attempt.completed_at) return json({ error: "Daily run already submitted" }, 409);

  let run = createRun("daily", body.formation as FormationId, body.nickname, challenge.seed);
  for (const playerId of body.pickedPlayerIds as string[]) {
    const offeredIds = getDraftOffer(run).candidates.map((player) => player.id);
    if (!offeredIds.includes(playerId)) return json({ error: "Invalid draft selection" }, 400);
    run = {
      ...run,
      pickedPlayerIds: [...run.pickedPlayerIds, playerId],
      round: run.round + 1
    };
  }
  run = { ...run, lineupOrder: body.lineupOrder };
  for (const plan of body.matchPlans as { formation: FormationId; tactic: TacticChoice }[]) {
    if (isTournamentOver(run) || !formations.has(plan.formation) || !plan.tactic ||
        !["possession","press","counter"].includes(plan.tactic.style) ||
        !["low","normal","high"].includes(plan.tactic.intensity)) {
      return json({ error: "Invalid match plan" }, 400);
    }
    run = { ...run, formation: plan.formation };
    const tactic = plan.tactic;
    const result = simulateMatch(run, tactic);
    run = { ...run, matches: [...run.matches, result], fatigue: result.fatigueAfter };
    if (isTournamentOver(run)) break;
  }
  if (!isTournamentOver(run)) return json({ error: "Tournament is not complete" }, 400);
  run = { ...run, completed: true, score: calculateScore(run) };
  const goalDifference = run.matches.reduce((sum, match) => sum + match.goalsFor - match.goalsAgainst, 0);

  await admin.from("profiles").upsert({ user_id: user.id, nickname: body.nickname, updated_at: new Date().toISOString() });
  const { error: runError } = await admin.from("daily_runs").insert({
    user_id: user.id, challenge_id: challenge.id, formation: run.formation,
    stage: reachedStage(run), score: run.score, goal_difference: goalDifference, run_payload: run
  });
  if (runError) return json({ error: runError.message }, runError.code === "23505" ? 409 : 500);
  await admin.from("daily_attempts").update({ completed_at: new Date().toISOString() }).eq("id", attempt.id);
  return json({ score: run.score, stage: reachedStage(run) });
});
