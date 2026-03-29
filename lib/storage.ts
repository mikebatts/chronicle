import type { GameState } from "./types";

const STORAGE_KEY = "chronicle_state";

export function getDefaultState(): GameState {
  return {
    played: 0,
    wins: 0,
    losses: 0,
    current_streak: 0,
    max_streak: 0,
    total_distance: 0,
    wins_with_distance: 0,
    guess_distribution: {
      "1": 0,
      "2": 0,
      "3": 0,
    },
    last_played: "",
    last_result: "loss",
    last_guess_count: 0,
    last_distance: 0,
  };
}

export function loadState(): GameState {
  if (typeof window === "undefined") return getDefaultState();

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getDefaultState();
    return JSON.parse(stored) as GameState;
  } catch {
    return getDefaultState();
  }
}

export function saveState(state: GameState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage errors
  }
}
