"use client";

import { useState, useCallback, useEffect } from "react";
import type { Puzzle, GameState, GamePhase, AttemptPhase, DigitFeedback, TodaySession, SlotState } from "@/lib/types";
import { getDigitFeedback } from "@/lib/scoring";
import { loadState, saveState, loadSession, saveSession, getDefaultSession, getDefaultSlotState } from "@/lib/storage";
import { getPuzzleNumber } from "@/lib/puzzles";
import YearInput from "./YearInput";
import PuzzleDisplay from "./PuzzleDisplay";
import ClueReveal from "./ClueReveal";
import DailyResults from "./DailyResults";

interface GameProps {
  puzzles: Puzzle[];
}

function isConsecutiveDay(lastPlayed: string, today: string): boolean {
  if (!lastPlayed) return false;
  const last = new Date(lastPlayed + "T00:00:00");
  const current = new Date(today + "T00:00:00");
  const diffMs = current.getTime() - last.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

export default function Game({ puzzles }: GameProps) {
  const [currentSlot, setCurrentSlot] = useState<0 | 1 | 2>(0);
  const [unlockedSlot, setUnlockedSlot] = useState<0 | 1 | 2>(0);
  const [session, setSession] = useState<TodaySession>(() => getDefaultSession());
  const [gameState, setGameState] = useState<GameState>(() => loadState());
  const [initialized, setInitialized] = useState(false);
  const [showDailyResults, setShowDailyResults] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  // Initialize session on mount
  useEffect(() => {
    const stored = loadSession();
    if (stored && stored.puzzle_date === today) {
      setSession(stored);
      setUnlockedSlot(stored.highest_unlocked_slot);
      // Check if all slots are complete
      const allComplete = [0, 1, 2].every(
        (s) => stored.slots[s as 0 | 1 | 2].phase !== "playing"
      );
      if (allComplete) {
        setShowDailyResults(true);
        // Find first incomplete slot to resume
        const firstIncomplete = [0, 1, 2].find(
          (s) => stored.slots[s as 0 | 1 | 2].phase === "playing"
        ) as 0 | 1 | 2 | undefined;
        setCurrentSlot(firstIncomplete ?? stored.highest_unlocked_slot);
      } else {
        // Find first incomplete slot to resume
        const firstIncomplete = [0, 1, 2].find(
          (s) => stored.slots[s as 0 | 1 | 2].phase === "playing"
        ) as 0 | 1 | 2 | undefined;
        setCurrentSlot(firstIncomplete ?? stored.highest_unlocked_slot);
      }
    } else {
      // New day - start fresh
      const newSession: TodaySession = {
        puzzle_date: today,
        slots: {
          0: getDefaultSlotState(),
          1: getDefaultSlotState(),
          2: getDefaultSlotState(),
        },
        highest_unlocked_slot: 0,
      };
      setSession(newSession);
      setCurrentSlot(0);
      setUnlockedSlot(0);
      setShowDailyResults(false);
      saveSession(newSession);
    }
    setInitialized(true);
  }, [today]);

  const currentPuzzle = puzzles[currentSlot];
  const currentSlotState = session.slots[currentSlot];

  const handleGuess = useCallback(
    (yearStr: string) => {
      const year = parseInt(yearStr, 10);
      if (isNaN(year) || !currentPuzzle) return;

      const newGuesses = [...currentSlotState.guesses, year];
      const newFeedback = getDigitFeedback(year, currentPuzzle.year);
      const newFeedbackRows = [...currentSlotState.digitFeedback, newFeedback];

      const newSlotState: SlotState = {
        guesses: newGuesses,
        phase: currentSlotState.phase,
        digitFeedback: newFeedbackRows,
      };

      const guessKey = newGuesses.length.toString() as "1" | "2" | "3" | "4";
      let newSession = { ...session };
      let newGameState = { ...gameState };
      let newUnlockedSlot = unlockedSlot;
      let slotComplete = false;
      let newShowDailyResults = showDailyResults;

      if (year === currentPuzzle.year) {
        // Won this slot
        newSlotState.phase = "won";
        slotComplete = true;
        const streakBase = isConsecutiveDay(gameState.last_played, today)
          ? gameState.current_streak
          : 0;
        const newStreak = streakBase + 1;
        newGameState = {
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
      } else if (newGuesses.length >= 4) {
        // Lost this slot
        newSlotState.phase = "lost";
        slotComplete = true;
        newGameState = {
          ...gameState,
          played: gameState.played + 1,
          losses: gameState.losses + 1,
          current_streak: 0,
          last_played: today,
          last_result: "loss",
          last_guess_count: newGuesses.length,
        };
      } else {
        // Continue guessing
        // Just update the slot state
      }

      // Update session with new slot state
      newSession.slots[currentSlot] = newSlotState;

      // If slot is complete
      if (slotComplete) {
        if (currentSlot < 2) {
          // Unlock next slot
          newUnlockedSlot = (currentSlot + 1) as 0 | 1 | 2;
          newSession.highest_unlocked_slot = newUnlockedSlot;
          // Auto-advance to next puzzle
          setCurrentSlot(newUnlockedSlot);
          setUnlockedSlot(newUnlockedSlot);
        } else {
          // All 3 complete - show daily results
          newShowDailyResults = true;
          setShowDailyResults(true);
        }
      }

      setSession(newSession);
      setGameState(newGameState);
      setShowDailyResults(newShowDailyResults);
      saveState(newGameState);
      saveSession(newSession);
    },
    [currentPuzzle, currentSlotState, session, gameState, unlockedSlot, today, currentSlot, showDailyResults]
  );

  if (!initialized || !currentPuzzle) {
    return null;
  }

  // Show daily results when all 3 are complete
  if (showDailyResults) {
    return (
      <DailyResults
        puzzles={puzzles}
        session={session}
        gameState={gameState}
        onClose={() => {}}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center px-4 py-6 max-w-md mx-auto w-full">
      {/* Slot Progress */}
      <div className="w-full mb-4">
        <div className="flex items-center justify-center gap-2">
          {[0, 1, 2].map((slot) => {
            const slotState = session.slots[slot as 0 | 1 | 2];
            const isUnlocked = slot <= unlockedSlot;
            const isComplete = slotState.phase !== "playing";
            const isActive = slot === currentSlot;

            return (
              <div
                key={slot}
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold
                  transition-all duration-200
                  ${isActive ? "bg-amber-600 text-white ring-2 ring-amber-400" : ""}
                  ${!isUnlocked ? "bg-gray-700 text-gray-500" : ""}
                  ${isUnlocked && !isActive && isComplete ? "bg-green-600 text-white" : ""}
                  ${isUnlocked && !isActive && !isComplete ? "bg-gray-600 text-white" : ""}
                `}
              >
                {isComplete ? (
                  <span className="text-white">✓</span>
                ) : (
                  <span>{slot + 1}</span>
                )}
              </div>
            );
          })}
        </div>
        <div className="text-center mt-2 text-xs text-gray-400">
          Puzzle {currentSlot + 1} of 3
          {unlockedSlot < 2 && (
            <span className="ml-2 text-amber-400">
              Complete to unlock next
            </span>
          )}
        </div>
      </div>

      <PuzzleDisplay puzzle={currentPuzzle} attempt={Math.min(currentSlotState.guesses.length + 1, 4) as AttemptPhase} />

      <div className="mt-6 w-full">
        <ClueReveal
          puzzle={currentPuzzle}
          wrongGuessCount={currentSlotState.guesses.length}
        />

        <div className="mt-6">
          <YearInput
            onSubmit={handleGuess}
            disabled={currentSlotState.phase !== "playing"}
            previousGuesses={currentSlotState.digitFeedback}
          />
        </div>
      </div>
    </div>
  );
}
