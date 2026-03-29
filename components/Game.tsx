"use client";

import { useState, useCallback } from "react";
import type { Puzzle, GameState, GamePhase, AttemptPhase } from "@/lib/types";
import { calculateScore, getDistanceCategory } from "@/lib/scoring";
import { loadState, saveState } from "@/lib/storage";
import { getPuzzleNumber } from "@/lib/puzzles";
import { generateShareText } from "@/lib/share";
import YearInput from "./YearInput";
import PuzzleDisplay from "./PuzzleDisplay";
import ClueReveal from "./ClueReveal";
import ResultScreen from "./ResultScreen";

interface GameProps {
  puzzle: Puzzle;
}

const HEAT_EMOJI: Record<string, string> = {
  exact: "✅",
  very_close: "🟢",
  close: "🟡",
  warm: "🟠",
  cold: "🔴",
};

export default function Game({ puzzle }: GameProps) {
  const [phase, setPhase] = useState<GamePhase>("playing");
  const [attempt, setAttempt] = useState<AttemptPhase>(1);
  const [guesses, setGuesses] = useState<number[]>([]);
  const [gameState, setGameState] = useState<GameState>(() => loadState());
  const [showClues, setShowClues] = useState<boolean[]>([false, false]);

  const puzzleNumber = getPuzzleNumber(puzzle.date);
  const today = new Date().toISOString().split("T")[0];

  const handleGuess = useCallback(
    (yearStr: string) => {
      const year = parseInt(yearStr, 10);
      if (isNaN(year)) return;

      const newGuesses = [...guesses, year];
      setGuesses(newGuesses);

      if (year === puzzle.year) {
        setPhase("won");
        const newState: GameState = {
          ...gameState,
          played: gameState.played + 1,
          wins: gameState.wins + 1,
          current_streak: gameState.current_streak + 1,
          max_streak: Math.max(
            gameState.max_streak,
            gameState.current_streak + 1
          ),
          total_distance: gameState.total_distance + Math.abs(year - puzzle.year),
          wins_with_distance: gameState.wins_with_distance + 1,
          guess_distribution: {
            ...gameState.guess_distribution,
            [newGuesses.length.toString()]:
              (gameState.guess_distribution[newGuesses.length.toString()] || 0) + 1,
          },
          last_played: today,
          last_result: "win",
          last_guess_count: newGuesses.length,
          last_distance: Math.abs(year - puzzle.year),
        };
        setGameState(newState);
        saveState(newState);
      } else if (newGuesses.length >= 3) {
        setPhase("lost");
        const newState: GameState = {
          ...gameState,
          played: gameState.played + 1,
          losses: gameState.losses + 1,
          current_streak: 0,
          last_played: today,
          last_result: "loss",
          last_guess_count: newGuesses.length,
          last_distance: Math.abs(year - puzzle.year),
        };
        setGameState(newState);
        saveState(newState);
      } else {
        setAttempt((prev) => (prev + 1) as AttemptPhase);
        setShowClues((prev) => {
          const next = [...prev];
          next[newGuesses.length - 1] = true;
          return next;
        });
      }
    },
    [guesses, puzzle.year, gameState, puzzle.date, today]
  );

  const shareText = generateShareText(
    puzzleNumber,
    guesses,
    puzzle.year,
    phase === "won",
    gameState.current_streak
  );

  if (phase !== "playing") {
    return (
      <ResultScreen
        puzzle={puzzle}
        puzzleNumber={puzzleNumber}
        guesses={guesses}
        phase={phase}
        score={guesses.length > 0 ? calculateScore(guesses[guesses.length - 1], puzzle.year) : 0}
        shareText={shareText}
        gameState={gameState}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-lg mx-auto w-full">
      <PuzzleDisplay puzzle={puzzle} attempt={attempt} />

      <div className="mt-6 w-full">
        {guesses.length > 0 && (
          <div className="flex justify-center gap-2 mb-4">
            {guesses.map((g, i) => {
              const cat = getDistanceCategory(g, puzzle.year);
              return (
                <span
                  key={i}
                  className="text-2xl"
                  title={`Guess ${i + 1}: ${g} (${cat})`}
                >
                  {HEAT_EMOJI[cat]}
                </span>
              );
            })}
          </div>
        )}

        <ClueReveal
          puzzle={puzzle}
          showClues={showClues}
          attempt={attempt}
        />

        <YearInput onSubmit={handleGuess} disabled={phase !== "playing"} />
      </div>
    </div>
  );
}
