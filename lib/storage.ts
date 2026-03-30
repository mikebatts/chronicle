import type { GameState, TodaySession, SlotState, GamePhase } from "./types";

const STORAGE_KEY = "chronicle_state";
const SESSION_KEY = "chronicle_today";

export function getDefaultState(): GameState {
  return {
    played: 0,
    wins: 0,
    losses: 0,
    current_streak: 0,
    max_streak: 0,
    guess_distribution: {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
    },
    last_played: "",
    last_result: "loss",
    last_guess_count: 0,
  };
}

export function getDefaultSlotState(): SlotState {
  return {
    guesses: [],
    phase: "playing",
    digitFeedback: [],
  };
}

export function getDefaultSession(): TodaySession {
  return {
    puzzle_date: "",
    slots: {
      0: getDefaultSlotState(),
      1: getDefaultSlotState(),
      2: getDefaultSlotState(),
    },
    highest_unlocked_slot: 0,
  };
}

export function loadState(): GameState {
  if (typeof window === "undefined") return getDefaultState();

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getDefaultState();
    const parsed = JSON.parse(stored);
    if (parsed.guess_distribution && !("4" in parsed.guess_distribution)) {
      parsed.guess_distribution["4"] = 0;
    }
    return parsed as GameState;
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

export function loadSession(): TodaySession | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    // Handle legacy format (single puzzle)
    if (!parsed.slots) {
      // Migrate legacy session to new format
      return {
        puzzle_date: parsed.puzzle_date || "",
        slots: {
          0: {
            guesses: parsed.guesses || [],
            phase: parsed.phase || "playing",
            digitFeedback: parsed.digitFeedback || [],
          },
          1: getDefaultSlotState(),
          2: getDefaultSlotState(),
        },
        highest_unlocked_slot: 0,
      };
    }
    return parsed as TodaySession;
  } catch {
    return null;
  }
}

export function saveSession(session: TodaySession): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Ignore storage errors
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // Ignore storage errors
  }
}
