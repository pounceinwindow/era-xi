export type Position =
  | "GK" | "LB" | "CB" | "RB" | "LWB" | "RWB"
  | "DM" | "CM" | "AM" | "LM" | "RM" | "LW" | "RW" | "ST";

export type FormationId = "4-3-3" | "4-2-3-1" | "4-4-2" | "3-5-2";
export type PlayMode = "daily" | "training";
export type TacticStyle = "possession" | "press" | "counter";
export type Intensity = "low" | "normal" | "high";
export type TournamentStage = "group" | "r16" | "qf" | "sf" | "final" | "champion";

export interface Player {
  id: string;
  name: string;
  country: string;
  positions: Position[];
  rating: number;
  attack: number;
  midfield: number;
  defense: number;
  goalkeeping: number;
  clubIds: string[];
  preferredFormations: FormationId[];
  wikiTitle: string;
}

export interface ClubEra {
  id: string;
  clubId: string;
  clubName: string;
  season: string;
  formation: FormationId;
  roster: string[];
  colors: [string, string];
}

export interface Formation {
  id: FormationId;
  slots: Position[];
}

export interface LineupAssignment {
  slot: Position;
  playerId: string;
  fit: number;
}

export interface TacticChoice {
  style: TacticStyle;
  intensity: Intensity;
}

export interface Opponent {
  name: string;
  rating: number;
  formation: FormationId;
  style: TacticStyle;
  stars: string[];
}

export interface MatchResult {
  stage: TournamentStage;
  formation: FormationId;
  opponent: Opponent;
  goalsFor: number;
  goalsAgainst: number;
  penaltiesFor?: number;
  penaltiesAgainst?: number;
  won: boolean;
  tactic: TacticChoice;
  fatigueAfter: number;
  note: string;
  analysis?: string[];
}

export interface DraftRun {
  id: string;
  mode: PlayMode;
  seed: string;
  nickname: string;
  formation: FormationId;
  pickedPlayerIds: string[];
  round: number;
  fatigue: number;
  matches: MatchResult[];
  completed: boolean;
  score?: number;
  startedAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  nickname: string;
  score: number;
  stage: TournamentStage;
  goalDifference: number;
  formation: FormationId;
  completedAt: string;
}
