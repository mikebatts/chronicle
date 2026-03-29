"use client";

import type { Puzzle } from "@/lib/types";

interface ClueRevealProps {
  puzzle: Puzzle;
  wrongGuessCount: number;
}

export default function ClueReveal({ puzzle, wrongGuessCount }: ClueRevealProps) {
  const day = puzzle.day_of_week;

  // Sunday = no clues ever
  if (day === "sunday") return null;
  if (wrongGuessCount === 0) return null;

  // Get clues array for the current day
  const getCluesForDay = (): string[] => {
    switch (day) {
      case "monday": return puzzle.clues.monday;
      case "tuesday": return puzzle.clues.tuesday;
      case "wednesday": return puzzle.clues.wednesday;
      case "thursday": return puzzle.clues.thursday;
      case "friday": return puzzle.clues.friday;
      case "saturday": return puzzle.clues.saturday;
      default: return [];
    }
  };

  const allClues = getCluesForDay();
  // Show one clue per wrong guess, up to available clues
  const visibleClues = allClues.slice(0, wrongGuessCount);

  if (visibleClues.length === 0) return null;

  return (
    <div className="space-y-3 mb-2">
      {visibleClues.map((clue, i) => (
        <div
          key={i}
          className="px-4 py-3 bg-[var(--surface)] rounded-lg text-center clue-reveal"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <p className="text-sm text-[var(--text-secondary)] italic leading-relaxed">
            &ldquo;{clue}&rdquo;
          </p>
        </div>
      ))}
    </div>
  );
}
