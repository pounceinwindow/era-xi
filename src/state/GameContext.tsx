import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { calculateScore, createRun, isTournamentOver, simulateMatch } from "../game/engine";
import type { DraftRun, FormationId, PlayMode, TacticChoice } from "../game/types";

interface GameState {
  run: DraftRun | null;
  nickname: string;
  setNickname: (value: string) => void;
  start: (mode: PlayMode, formation: FormationId, seed?: string) => void;
  pick: (playerId: string) => void;
  changeFormation: (formation: FormationId) => void;
  play: (tactic: TacticChoice) => void;
  clear: () => void;
}

const Context = createContext<GameState | null>(null);
const storageKey = "era-xi-active-run";

export function GameProvider({ children }: { children: ReactNode }) {
  const [run, setRun] = useState<DraftRun | null>(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) ?? "null") as DraftRun | null; }
    catch { return null; }
  });
  const [nickname, setNicknameState] = useState(() => localStorage.getItem("era-xi-nickname") ?? "");

  useEffect(() => {
    if (run) localStorage.setItem(storageKey, JSON.stringify(run));
    else localStorage.removeItem(storageKey);
  }, [run]);

  const value = useMemo<GameState>(() => ({
    run,
    nickname,
    setNickname(value) {
      setNicknameState(value);
      localStorage.setItem("era-xi-nickname", value);
    },
    start(mode, formation, seed) {
      setRun(createRun(mode, formation, nickname.trim(), seed));
    },
    pick(playerId) {
      setRun((current) => {
        if (!current || current.pickedPlayerIds.includes(playerId) || current.pickedPlayerIds.length >= 11) return current;
        return {
          ...current,
          pickedPlayerIds: [...current.pickedPlayerIds, playerId],
          round: current.round + 1
        };
      });
    },
    changeFormation(formation) {
      setRun((current) => current ? { ...current, formation } : current);
    },
    play(tactic) {
      setRun((current) => {
        if (!current || current.completed) return current;
        const result = simulateMatch(current, tactic);
        const next = { ...current, fatigue: result.fatigueAfter, matches: [...current.matches, result] };
        if (isTournamentOver(next)) return { ...next, completed: true, score: calculateScore(next) };
        return next;
      });
    },
    clear() { setRun(null); }
  }), [nickname, run]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

// The provider and its small hook intentionally live together.
// eslint-disable-next-line react-refresh/only-export-components
export function useGame() {
  const state = useContext(Context);
  if (!state) throw new Error("useGame must be used inside GameProvider");
  return state;
}
