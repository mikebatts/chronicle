"use client";

import type { Puzzle, AttemptPhase } from "@/lib/types";

interface PuzzleDisplayProps {
  puzzle: Puzzle;
  attempt: AttemptPhase;
}

export default function PuzzleDisplay({ puzzle, attempt }: PuzzleDisplayProps) {
  return (
    <div className="w-full text-center">
      {puzzle.image && (
        <div className="relative mb-4 mx-auto max-w-md">
          <img
            src={puzzle.image}
            alt={puzzle.event}
            className="w-full h-auto rounded-lg"
          />
        </div>
      )}

      <p className="text-lg text-[var(--text-secondary)] mb-2 px-4">
        {puzzle.headline}
      </p>

      <div className="text-sm text-[var(--text-secondary)]">
        Attempt {attempt} of 3
      </div>
    </div>
  );
}
