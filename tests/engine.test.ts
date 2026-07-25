import { describe, expect, it } from "vitest";
import { clubEras, formations, playerById, players } from "../src/data/football";
import {
  calculateScore, chemistry, createRun, getDraftOffer, optimizeLineup,
  positionFit, shuffle, simulateMatch, squadMetrics
} from "../src/game/engine";
import type { DraftRun, TacticChoice } from "../src/game/types";

describe("football data", () => {
  it("contains 24 eras and a deep unique player pool", () => {
    expect(clubEras).toHaveLength(24);
    expect(players.length).toBeGreaterThanOrEqual(90);
    expect(new Set(players.map((player) => player.id)).size).toBe(players.length);
  });

  it("only references known players", () => {
    for (const era of clubEras) {
      expect(era.roster.length).toBeGreaterThanOrEqual(5);
      era.roster.forEach((id) => expect(playerById.has(id)).toBe(true));
    }
  });
});

describe("deterministic draft", () => {
  it("returns the same order for the same seed", () => {
    expect(shuffle([1,2,3,4,5], "same")).toEqual(shuffle([1,2,3,4,5], "same"));
  });

  it("offers five unpicked players", () => {
    const run = createRun("daily", "4-3-3", "tester", "fixed-seed");
    const first = getDraftOffer(run);
    expect(first.candidates).toHaveLength(5);
    const next = getDraftOffer({ ...run, pickedPlayerIds: [first.candidates[0].id], round: 1 });
    expect(next.candidates.map((player) => player.id)).not.toContain(first.candidates[0].id);
  });
});

describe("lineup and chemistry", () => {
  const ids = ["casillas","r-carlos","maldini","nesta","lahm","xavi","iniesta","zidane","messi","ronaldo","henry"];

  it("optimizes all eleven unique slots", () => {
    const lineup = optimizeLineup(ids, "4-3-3");
    expect(lineup).toHaveLength(11);
    expect(new Set(lineup.map((item) => item.playerId)).size).toBe(11);
  });

  it("applies exact, secondary and goalkeeper penalties", () => {
    const messi = playerById.get("messi")!;
    expect(positionFit(messi, "RW")).toBe(1);
    expect(positionFit(messi, "ST")).toBe(.94);
    expect(positionFit(messi, "GK")).toBe(.25);
  });

  it("keeps metrics in a readable range", () => {
    const metrics = squadMetrics(ids, "4-3-3");
    expect(metrics.overall).toBeGreaterThan(65);
    expect(chemistry(ids, "4-3-3")).toBeLessThanOrEqual(100);
  });
});

describe("match engine", () => {
  const ids = ["casillas","r-carlos","maldini","nesta","lahm","xavi","iniesta","zidane","messi","ronaldo","henry"];
  const tactic: TacticChoice = { style: "press", intensity: "normal" };
  const base = { ...createRun("daily","4-3-3","tester","match-seed"), pickedPlayerIds: ids, round: 11 } as DraftRun;

  it("replays an identical score from identical inputs", () => {
    expect(simulateMatch(base, tactic)).toEqual(simulateMatch(base, tactic));
  });

  it("accumulates fatigue and calculates a final score", () => {
    let run = base;
    for (let index = 0; index < 3; index += 1) {
      const result = simulateMatch(run, { style: "possession", intensity: "high" });
      run = { ...run, matches: [...run.matches, result], fatigue: result.fatigueAfter };
    }
    expect(run.fatigue).toBe(36);
    expect(calculateScore(run)).toBeGreaterThan(0);
  });
});

describe("formations", () => {
  it("all formations contain eleven slots and a goalkeeper", () => {
    Object.values(formations).forEach((formation) => {
      expect(formation.slots).toHaveLength(11);
      expect(formation.slots[0]).toBe("GK");
    });
  });
});
