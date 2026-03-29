"use client";

import type { Puzzle, AttemptPhase } from "@/lib/types";

interface PuzzleDisplayProps {
  puzzle: Puzzle;
  attempt: AttemptPhase;
}

export default function PuzzleDisplay({ puzzle, attempt }: PuzzleDisplayProps) {
  return (
    <div className="w-full text-center">
      <h2
        className="text-2xl leading-relaxed mb-3 px-2"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {puzzle.headline}
      </h2>

      <p className="text-[var(--text-secondary)] text-base leading-relaxed mb-4 px-2">
        {puzzle.description}
      </p>

      <div className="text-sm text-[var(--text-secondary)]">
        Attempt {attempt} of 4
      </div>
    </div>
  );
}
