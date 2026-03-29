"use client";

import { useState, useCallback, useEffect } from "react";
import type { Puzzle, GameState, GamePhase, AttemptPhase, DigitFeedback } from "@/lib/types";
import { getDigitFeedback } from "@/lib/scoring";
import { loadState, saveState, loadSession, saveSession } from "@/lib/storage";
import { getPuzzleNumber } from "@/lib/puzzles";
import { generateShareText } from "@/lib/share";
import YearInput from "./YearInput";
import PuzzleDisplay from "./PuzzleDisplay";
import ClueReveal from "./ClueReveal";
import ResultScreen from "./ResultScreen";

interface GameProps {
  puzzle: Puzzle;
}

function isConsecutiveDay(lastPlayed: string, today: string): boolean {
  if (!lastPlayed) return false;
  const last = new Date(lastPlayed + "T00:00:00");
  const current = new Date(today + "T00:00:00");
  const diffMs = current.getTime() - last.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

export default function Game({ puzzle }: GameProps) {
  const [phase, setPhase] = useState<GamePhase>("playing");
  const [attempt, setAttempt] = useState<AttemptPhase>(1);
  const [guesses, setGuesses] = useState<number[]>([]);
  const [digitFeedbackRows, setDigitFeedbackRows] = useState<DigitFeedback[][]>([]);
  const [gameState, setGameState] = useState<GameState>(() => loadState());
  const [wrongGuessCount, setWrongGuessCount] = useState(0);
  const [initialized, setInitialized] = useState(false);

  const puzzleNumber = getPuzzleNumber(puzzle.date);
  const today = new Date().toISOString().split("T")[0];

  // Restore in-progress session on mount
  useEffect(() => {
    const session = loadSession();
    if (session && session.puzzle_date === today) {
      setGuesses(session.guesses);
      setPhase(session.phase);
      setDigitFeedbackRows(session.digitFeedback || []);
      if (session.phase === "playing") {
        const attemptNum = Math.min(session.guesses.length + 1, 4) as AttemptPhase;
        setAttempt(attemptNum);
        setWrongGuessCount(session.guesses.length);
      } else {
        // Won or lost — count wrong guesses
        const wrongCount = session.phase === "won"
          ? session.guesses.length - 1
          : session.guesses.length;
        setWrongGuessCount(Math.max(0, wrongCount));
      }
    }
    setInitialized(true);
  }, [today]);

  const handleGuess = useCallback(
    (yearStr: string) => {
      const year = parseInt(yearStr, 10);
      if (isNaN(year)) return;

      const newGuesses = [...guesses, year];
      const newFeedback = getDigitFeedback(year, puzzle.year);
      const newFeedbackRows = [...digitFeedbackRows, newFeedback];
      setGuesses(newGuesses);
      setDigitFeedbackRows(newFeedbackRows);

      const guessKey = newGuesses.length.toString() as "1" | "2" | "3" | "4";

      if (year === puzzle.year) {
        setPhase("won");
        setWrongGuessCount(newGuesses.length - 1);
        const streakBase = isConsecutiveDay(gameState.last_played, today)
          ? gameState.current_streak
          : 0;
        const newStreak = streakBase + 1;
        const newState: GameState = {
          ...gameState,
          played: gameState.played + 1,
          wins: gameState.wins + 1,
          current_streak: newStreak,
          max_streak: Math.max(gameState.max_streak, newStreak),
          guess_distribution: {
            ...gameState.guess_distribution,
            [guessKey]: (gameState.guess_distribution[guessKey] || 0) + 1,
          },
          last_played: today,
          last_result: "win",
          last_guess_count: newGuesses.length,
        };
        setGameState(newState);
        saveState(newState);
        saveSession({ puzzle_date: today, guesses: newGuesses, phase: "won", digitFeedback: newFeedbackRows });
      } else if (newGuesses.length >= 4) {
        setPhase("lost");
        setWrongGuessCount(newGuesses.length);
        const newState: GameState = {
          ...gameState,
          played: gameState.played + 1,
          losses: gameState.losses + 1,
          current_streak: 0,
          last_played: today,
          last_result: "loss",
          last_guess_count: newGuesses.length,
        };
        setGameState(newState);
        saveState(newState);
        saveSession({ puzzle_date: today, guesses: newGuesses, phase: "lost", digitFeedback: newFeedbackRows });
      } else {
        // Wrong guess, game continues
        setWrongGuessCount(newGuesses.length);
        setAttempt((prev) => (prev + 1) as AttemptPhase);
        saveSession({ puzzle_date: today, guesses: newGuesses, phase: "playing", digitFeedback: newFeedbackRows });
      }
    },
    [guesses, digitFeedbackRows, puzzle.year, gameState, today]
  );

  if (!initialized) {
    return null;
  }

  const shareText = generateShareText(
    puzzleNumber,
    digitFeedbackRows,
    phase === "won",
    gameState.current_streak
  );

  if (phase !== "playing") {
    return (
      <ResultScreen
        puzzle={puzzle}
        puzzleNumber={puzzleNumber}
        guesses={guesses}
        digitFeedbackRows={digitFeedbackRows}
        phase={phase}
        shareText={shareText}
        gameState={gameState}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center px-4 py-6 max-w-md mx-auto w-full">
      <PuzzleDisplay puzzle={puzzle} attempt={attempt} />

      <div className="mt-6 w-full">
        <ClueReveal
          puzzle={puzzle}
          wrongGuessCount={wrongGuessCount}
        />

        <div className="mt-6">
          <YearInput
            onSubmit={handleGuess}
            disabled={phase !== "playing"}
            previousGuesses={digitFeedbackRows}
          />
        </div>
      </div>
    </div>
  );
}
