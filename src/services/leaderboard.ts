import { createClient } from "@supabase/supabase-js";
import { calculateScore, reachedStage } from "../game/engine";
import type { DraftRun, LeaderboardEntry } from "../game/types";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const supabase = url && key ? createClient(url, key) : null;
const localKey = "era-xi-leaderboard";

const demo: LeaderboardEntry[] = [
  { rank: 1, nickname: "regista", score: 9180, stage: "champion", goalDifference: 12, formation: "4-3-3", completedAt: new Date().toISOString() },
  { rank: 2, nickname: "pressing77", score: 8740, stage: "final", goalDifference: 9, formation: "3-5-2", completedAt: new Date().toISOString() },
  { rank: 3, nickname: "trequartista", score: 8210, stage: "sf", goalDifference: 7, formation: "4-2-3-1", completedAt: new Date().toISOString() }
];

function localEntries(): LeaderboardEntry[] {
  try { return JSON.parse(localStorage.getItem(localKey) ?? "[]") as LeaderboardEntry[]; }
  catch { return []; }
}

export async function startDailyAttempt(): Promise<string | undefined> {
  if (!supabase) return undefined;
  const session = await supabase.auth.getSession();
  if (!session.data.session) await supabase.auth.signInAnonymously();
  const { data, error } = await supabase.functions.invoke("start-daily");
  if (error) throw error;
  return data.seed as string;
}

export async function submitRun(run: DraftRun): Promise<void> {
  if (run.mode !== "daily") return;
  if (supabase) {
    const session = await supabase.auth.getSession();
    if (!session.data.session) await supabase.auth.signInAnonymously();
    const { error } = await supabase.functions.invoke("submit-run", {
      body: {
        nickname: run.nickname, seed: run.seed, formation: run.formation,
        pickedPlayerIds: run.pickedPlayerIds,
        matchPlans: run.matches.map((match) => ({
          formation: match.formation,
          tactic: match.tactic
        }))
      }
    });
    if (error) throw error;
    return;
  }
  const entry: LeaderboardEntry = {
    rank: 0, nickname: run.nickname, score: calculateScore(run),
    stage: reachedStage(run),
    goalDifference: run.matches.reduce((sum, match) => sum + match.goalsFor - match.goalsAgainst, 0),
    formation: run.formation, completedAt: new Date().toISOString()
  };
  const next = [...localEntries().filter((item) => item.nickname !== entry.nickname), entry]
    .sort((left, right) => right.score - left.score).slice(0, 100);
  localStorage.setItem(localKey, JSON.stringify(next));
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  if (supabase) {
    const { data, error } = await supabase.from("all_time_leaderboard").select("*")
      .order("score", { ascending: false }).limit(100);
    if (!error && data) return data.map((row, index) => ({
      rank: index + 1, nickname: row.nickname, score: row.score, stage: row.stage,
      goalDifference: row.goal_difference, formation: row.formation, completedAt: row.completed_at
    }));
  }
  return [...localEntries(), ...demo]
    .sort((left, right) => right.score - left.score)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export const isCloudLeaderboard = Boolean(supabase);
