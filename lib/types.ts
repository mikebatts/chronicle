export interface Puzzle {
  id: number;
  date: string;
  slot: 0 | 1 | 2; // 0=morning, 1=afternoon, 2=evening
  day_of_week: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
  event: string;
  event_formal: string;
  year: number;
  headline: string;
  description: string;
  tier: 1 | 2 | 3;
  difficulty_rating: number;
  clues: {
    monday: [string, string, string];
    tuesday: [string, string, string];
    wednesday: [string, string, string];
    thursday: [string, string];
    friday: [string, string];
    saturday: [string];
  };
  context_card: string;
}

export interface GameState {
  played: number;
  wins: number;
  losses: number;
  current_streak: number;
  max_streak: number;
  guess_distribution: {
    "1": number;
    "2": number;
    "3": number;
    "4": number;
  };
  last_played: string;
  last_result: "win" | "loss";
  last_guess_count: number;
}

export type GamePhase = "playing" | "won" | "lost";
export type AttemptPhase = 1 | 2 | 3 | 4;

export interface TodaySession {
  puzzle_date: string;
  slots: {
    0: SlotState;
    1: SlotState;
    2: SlotState;
  };
  highest_unlocked_slot: 0 | 1 | 2;
}

export interface SlotState {
  guesses: number[];
  phase: GamePhase;
  digitFeedback: DigitFeedback[][];
}

export type DigitColor = "correct" | "close" | "miss";

export interface DigitFeedback {
  digit: string;
  color: DigitColor;
}
