import { clubEras, formations, playerById, players } from "../data/football.ts";
import type {
  DraftRun, FormationId, Intensity, LineupAssignment, MatchResult,
  Opponent, Player, Position, TacticChoice, TacticStyle, TournamentStage
} from "./types.ts";

export function hashString(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function createRng(seed: string) {
  let state = hashString(seed);
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: T[], seed: string): T[] {
  const result = [...items];
  const random = createRng(seed);
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

export function dailySeed(date = new Date()): string {
  return `era-xi-${date.toISOString().slice(0, 10)}`;
}

export function createRun(mode: DraftRun["mode"], formation: FormationId, nickname: string, seed?: string): DraftRun {
  const resolvedSeed = seed ?? (mode === "daily" ? dailySeed() : `training-${crypto.randomUUID()}`);
  return {
    id: crypto.randomUUID(), mode, seed: resolvedSeed, nickname, formation,
    pickedPlayerIds: [], round: 0, fatigue: 0, matches: [], completed: false,
    startedAt: new Date().toISOString()
  };
}

export function getDraftOffer(run: DraftRun): { era: typeof clubEras[number]; candidates: Player[] } {
  const eraOrder = shuffle(clubEras, `${run.seed}:eras`);
  const era = eraOrder[run.round % eraOrder.length];
  const position = formations[run.formation].slots[run.round];
  const available = players.filter((player) =>
    player.positions.includes(position) && !run.pickedPlayerIds.includes(player.id)
  );
  return {
    era,
    candidates: shuffle(available, `${run.seed}:round:${run.round}:${position}`).slice(0, 5)
  };
}

const defense = new Set<Position>(["LB","CB","RB","LWB","RWB"]);
const midfield = new Set<Position>(["DM","CM","AM","LM","RM"]);
const attack = new Set<Position>(["LW","RW","ST"]);

function sameLine(first: Position, second: Position): boolean {
  return (defense.has(first) && defense.has(second)) ||
    (midfield.has(first) && midfield.has(second)) ||
    (attack.has(first) && attack.has(second));
}

export function positionFit(player: Player, slot: Position): number {
  if (player.positions[0] === slot) return 1;
  if (player.positions.slice(1).includes(slot)) return 0.94;
  if (slot === "GK" || player.positions[0] === "GK") return 0.25;
  if (sameLine(player.positions[0], slot)) return 0.84;
  return 0.68;
}

export function optimizeLineup(playerIds: string[], formationId: FormationId): LineupAssignment[] {
  const selected = playerIds.map((id) => playerById.get(id)).filter((player): player is Player => Boolean(player));
  const slots = formations[formationId].slots;
  const memo = new Map<string, { score: number; picks: number[] }>();
  const solve = (slotIndex: number, usedMask: number): { score: number; picks: number[] } => {
    if (slotIndex === Math.min(slots.length, selected.length)) return { score: 0, picks: [] };
    const key = `${slotIndex}:${usedMask}`;
    const cached = memo.get(key);
    if (cached) return cached;
    let best = { score: -Infinity, picks: [] as number[] };
    selected.forEach((player, index) => {
      if ((usedMask & (1 << index)) !== 0) return;
      const tail = solve(slotIndex + 1, usedMask | (1 << index));
      const score = player.rating * positionFit(player, slots[slotIndex]) + tail.score;
      if (score > best.score) best = { score, picks: [index, ...tail.picks] };
    });
    memo.set(key, best);
    return best;
  };
  return solve(0, 0).picks.map((playerIndex, slotIndex) => ({
    slot: slots[slotIndex],
    playerId: selected[playerIndex].id,
    fit: positionFit(selected[playerIndex], slots[slotIndex])
  }));
}

export function chemistry(playerIds: string[], formationId: FormationId): number {
  const selected = playerIds.map((id) => playerById.get(id)).filter((player): player is Player => Boolean(player));
  const lineup = optimizeLineup(playerIds, formationId);
  const averageFit = lineup.reduce((sum, item) => sum + item.fit, 0) / Math.max(1, lineup.length);
  let links = 0;
  for (let left = 0; left < selected.length; left += 1) {
    for (let right = left + 1; right < selected.length; right += 1) {
      if (selected[left].clubIds.some((id) => selected[right].clubIds.includes(id))) links += 2.2;
      if (selected[left].country === selected[right].country) links += 0.8;
    }
  }
  const familiar = selected.filter((player) => player.preferredFormations.includes(formationId)).length;
  const systemBonus = familiar >= 3 ? 5 + Math.min(5, familiar - 3) : 0;
  return Math.round(Math.min(100, averageFit * 58 + Math.min(32, links) + systemBonus));
}

export function squadMetrics(playerIds: string[], formationId: FormationId) {
  const lineup = optimizeLineup(playerIds, formationId);
  const picked = lineup.map((assignment) => ({
    assignment,
    player: playerById.get(assignment.playerId)!
  }));
  const weighted = (key: "attack" | "midfield" | "defense" | "goalkeeping") =>
    picked.reduce((sum, item) => sum + item.player[key] * item.assignment.fit, 0) / Math.max(1, picked.length);
  const chem = chemistry(playerIds, formationId);
  const overall = picked.reduce((sum, item) => sum + item.player.rating * item.assignment.fit, 0) / Math.max(1, picked.length);
  return {
    attack: weighted("attack"), midfield: weighted("midfield"),
    defense: weighted("defense"), goalkeeping: weighted("goalkeeping"),
    chemistry: chem, overall: Math.round(overall * 0.78 + chem * 0.22)
  };
}

const styleAdvantage: Record<TacticStyle, TacticStyle> = {
  press: "possession", possession: "counter", counter: "press"
};
const tacticNames: Record<TacticStyle, string> = {
  possession: "контроль мяча", press: "высокий пресс", counter: "контратака"
};
const intensityMultiplier: Record<Intensity, number> = { low: 0.97, normal: 1, high: 1.05 };
const intensityNames: Record<Intensity, string> = { low: "низкая", normal: "обычная", high: "высокая" };
const fatigueDelta: Record<Intensity, number> = { low: -8, normal: 4, high: 12 };
const stages: TournamentStage[] = ["group","group","group","r16","qf","sf","final"];
const opponentPrefixes = ["Aurora","Atlas","Union","Royal","Olympic","Dynamo","Racing","Sporting"];

export function nextStage(run: DraftRun): TournamentStage | null {
  if (run.completed) return null;
  if (run.matches.length < 3) return "group";
  if (run.matches.length === 3) {
    const points = run.matches.reduce((sum, match) => sum + (match.won ? 3 : match.goalsFor === match.goalsAgainst ? 1 : 0), 0);
    const difference = run.matches.reduce((sum, match) => sum + match.goalsFor - match.goalsAgainst, 0);
    return points >= 4 || (points === 3 && difference >= 0) ? "r16" : null;
  }
  const previous = run.matches.at(-1);
  if (previous && !previous.won) return null;
  return stages[run.matches.length] ?? null;
}

export function generateOpponent(run: DraftRun, stage: TournamentStage): Opponent {
  const index = run.matches.length;
  const random = createRng(`${run.seed}:opponent:${index}`);
  const excluded = new Set(run.pickedPlayerIds);
  const pool = shuffle(players.filter((player) => !excluded.has(player.id)), `${run.seed}:opponent-pool:${index}`);
  const stageBoost = stage === "group" ? 0 : ({ r16: 2, qf: 4, sf: 6, final: 8, champion: 8 }[stage]);
  const stars = pool.sort((left, right) => right.rating - left.rating + (random() - 0.5) * 10).slice(0, 3).map((player) => player.id);
  const formationIds = Object.keys(formations) as FormationId[];
  const styles: TacticStyle[] = ["possession","press","counter"];
  return {
    name: `${opponentPrefixes[Math.floor(random() * opponentPrefixes.length)]} XI`,
    rating: Math.round(81 + index * 1.5 + stageBoost + random() * 3),
    formation: formationIds[Math.floor(random() * formationIds.length)],
    style: styles[Math.floor(random() * styles.length)],
    stars
  };
}

function poisson(lambda: number, random: () => number): number {
  const threshold = Math.exp(-lambda);
  let product = 1;
  let count = 0;
  do { count += 1; product *= random(); } while (product > threshold);
  return count - 1;
}

export function simulateMatch(run: DraftRun, tactic: TacticChoice): MatchResult {
  const stage = nextStage(run) ?? "group";
  const opponent = generateOpponent(run, stage);
  const metrics = squadMetrics(run.pickedPlayerIds, run.formation);
  const random = createRng(`${run.seed}:match:${run.matches.length}:${tactic.style}:${tactic.intensity}`);
  const tacticEdge = styleAdvantage[tactic.style] === opponent.style ? 4 :
    styleAdvantage[opponent.style] === tactic.style ? -4 : 0;
  const fatiguePenalty = run.fatigue * 0.08;
  const userPower = metrics.overall * intensityMultiplier[tactic.intensity] + tacticEdge - fatiguePenalty;
  const attackDelta = (userPower - opponent.rating) / 24;
  const expectedGoalsFor = Math.max(0.35, Math.min(3.2, 1.35 + attackDelta));
  const expectedGoalsAgainst = Math.max(0.3, Math.min(3, 1.2 - attackDelta * 0.75));
  let goalsFor = poisson(expectedGoalsFor, random);
  let goalsAgainst = poisson(expectedGoalsAgainst, random);
  let penaltiesFor: number | undefined;
  let penaltiesAgainst: number | undefined;
  if (stage !== "group" && goalsFor === goalsAgainst) {
    const extraTimeRoll = random();
    if (extraTimeRoll < 0.29) goalsFor += 1;
    else if (extraTimeRoll < 0.58) goalsAgainst += 1;
    else {
      penaltiesFor = 3 + Math.floor(random() * 3);
      penaltiesAgainst = 3 + Math.floor(random() * 3);
      if (penaltiesFor === penaltiesAgainst) {
        if (random() > 0.5) penaltiesFor += 1;
        else penaltiesAgainst += 1;
      }
    }
  }
  const won = goalsFor > goalsAgainst || (goalsFor === goalsAgainst && (penaltiesFor ?? 0) > (penaltiesAgainst ?? 0));
  const fatigueAfter = Math.max(0, Math.min(100, run.fatigue + fatigueDelta[tactic.intensity]));
  const powerDifference = userPower - opponent.rating;
  const isDraw = goalsFor === goalsAgainst && penaltiesFor === undefined;
  const note = won
    ? powerDifference >= 3 ? "Преимущество по игре превратилось в заслуженную победу." : "В равном матче команда лучше реализовала свои моменты."
    : isDraw
      ? powerDifference >= 3 ? "Команда была сильнее по игре, но не реализовала преимущество." : "Силы оказались близки, и матч завершился вничью."
      : powerDifference <= -3 ? "Соперник создал игровое преимущество и закономерно победил." : "Равный матч был проигран из-за реализации моментов.";
  const intensityEffect = metrics.overall * (intensityMultiplier[tactic.intensity] - 1);
  const tacticAnalysis = tacticEdge > 0
    ? `Тактика: ${tacticNames[tactic.style]} дала преимущество против стиля «${tacticNames[opponent.style]}» (+${tacticEdge} к силе).`
    : tacticEdge < 0
      ? `Тактика: стиль соперника «${tacticNames[opponent.style]}» оказался сильнее выбранного плана (−${Math.abs(tacticEdge)} к силе).`
      : "Тактика: ни одна из команд не получила прямого преимущества по стилю.";
  const intensityEffectText = intensityEffect > 0
    ? `+${intensityEffect.toFixed(1)}`
    : intensityEffect < 0 ? `−${Math.abs(intensityEffect).toFixed(1)}` : "без бонуса";
  const penaltiesText = penaltiesFor === undefined ? "" : `, пенальти ${penaltiesFor}:${penaltiesAgainst}`;
  const analysis = [
    `Сила: ваш состав ${metrics.overall}, соперник ${opponent.rating}; итоговая сила на матч ${userPower.toFixed(1)}.`,
    tacticAnalysis,
    `Физика: ${intensityNames[tactic.intensity]} интенсивность — ${intensityEffectText}; усталость ${run.fatigue}% дала штраф ${fatiguePenalty.toFixed(1)}, после матча — ${fatigueAfter}%.`,
    `Моменты: ожидаемый счёт ${expectedGoalsFor.toFixed(1)}:${expectedGoalsAgainst.toFixed(1)}, фактический — ${goalsFor}:${goalsAgainst}${penaltiesText}.`
  ];
  return {
    stage,
    formation: run.formation,
    opponent,
    goalsFor,
    goalsAgainst,
    penaltiesFor,
    penaltiesAgainst,
    won,
    tactic,
    fatigueAfter,
    note,
    analysis
  };
}

export function isTournamentOver(run: DraftRun): boolean {
  if (run.matches.length === 0) return false;
  if (run.matches.length === 3 && nextStage(run) === null) return true;
  if (run.matches.length > 3 && run.matches.at(-1)?.won === false) return true;
  return run.matches.length >= 7;
}

export function reachedStage(run: DraftRun): TournamentStage {
  if (run.matches.length >= 7 && run.matches.at(-1)?.won) return "champion";
  return run.matches.at(-1)?.stage ?? "group";
}

export function calculateScore(run: DraftRun): number {
  const metrics = squadMetrics(run.pickedPlayerIds, run.formation);
  const group = run.matches.slice(0, 3);
  const groupPoints = group.reduce((sum, match) => sum + (match.won ? 3 : match.goalsFor === match.goalsAgainst ? 1 : 0), 0);
  const wins = run.matches.filter((match) => match.won).length;
  const goalDifference = run.matches.reduce((sum, match) => sum + match.goalsFor - match.goalsAgainst, 0);
  const stageBonus: Record<TournamentStage, number> = { group: 0, r16: 300, qf: 800, sf: 1500, final: 2500, champion: 4000 };
  return Math.round(metrics.overall * 20 + groupPoints * 150 + wins * 400 +
    stageBonus[reachedStage(run)] + Math.max(-10, Math.min(20, goalDifference)) * 20);
}
