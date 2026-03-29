"use client";

import type { Puzzle, AttemptPhase } from "@/lib/types";

interface ClueRevealProps {
  puzzle: Puzzle;
  showClues: boolean[];
  attempt: AttemptPhase;
}

export default function ClueReveal({ puzzle, showClues, attempt }: ClueRevealProps) {
  const day = puzzle.day_of_week;

  // Sunday = no clues ever
  if (day === "sunday") {
    return null;
  }

  // Get clues based on day
  const getCluesForDay = (): string[] => {
    switch (day) {
      case "monday":
        return puzzle.clues.monday;
      case "tuesday":
        return puzzle.clues.tuesday;
      case "wednesday":
        return puzzle.clues.wednesday;
      case "thursday":
        return [puzzle.clues.thursday];
      case "friday":
        return [puzzle.clues.friday];
      case "saturday":
        return [puzzle.clues.saturday];
      default:
        return [];
    }
  };

  const clues = getCluesForDay();

  return (
    <div className="mt-6 space-y-3">
      {clues.map((clue, i) => {
        if (!showClues[i]) return null;
        return (
          <div
            key={i}
            className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-center"
          >
            <p className="text-[var(--text-primary)] italic">"{clue}"</p>
          </div>
        );
      })}
    </div>
  );
}
