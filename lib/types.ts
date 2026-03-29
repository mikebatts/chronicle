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
  tier: 1 | 2 | 3;
  difficulty_rating: number;
  clues: {
    monday: [string, string];
    tuesday: [string, string];
    wednesday: [string, string];
    thursday: string;
    friday: string;
    saturday: string;
  };
  context_card: string;
}

export interface GameState {
  played: number;
  wins: number;
  losses: number;
  current_streak: number;
  max_streak: number;
  total_distance: number;
  wins_with_distance: number;
  guess_distribution: {
    "1": number;
    "2": number;
    "3": number;
  };
  last_played: string;
  last_result: "win" | "loss";
  last_guess_count: number;
  last_distance: number;
}

export type GamePhase = "playing" | "won" | "lost";
export type AttemptPhase = 1 | 2 | 3;
