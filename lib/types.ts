export interface Puzzle {
  id: number;
  date: string;
  day_of_week: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
  event: string;
  event_formal: string;
  year: number;
  image: string;
  image_attribution: string;
  image_source_url: string;
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
  guesses: number[];
  phase: GamePhase;
  digitFeedback: DigitFeedback[][];
}

export type DigitColor = "correct" | "close" | "miss";

export interface DigitFeedback {
  digit: string;
  color: DigitColor;
}
