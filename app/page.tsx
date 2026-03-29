"use client";

import { useState, useEffect } from "react";
import { getTodayPuzzle, getPuzzleNumber } from "@/lib/puzzles";
import { loadState } from "@/lib/storage";
import type { Puzzle, GameState } from "@/lib/types";
import Game from "@/components/Game";
import Header from "@/components/Header";
import StatsModal from "@/components/StatsModal";
import SplashScreen from "@/components/SplashScreen";

export default function Home() {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    try {
      const todaysPuzzle = getTodayPuzzle();
      setPuzzle(todaysPuzzle);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load puzzle");
    }
    setGameState(loadState());

    // Show splash if not seen in this session
    try {
      if (!sessionStorage.getItem("chronicle_splash_seen")) {
        setShowSplash(true);
      }
    } catch {}
  }, []);

  const handleStatsClick = () => {
    setGameState(loadState());
    setShowStats(true);
  };

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1
            className="text-2xl font-semibold mb-2"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Chronicle
          </h1>
          <p className="text-[var(--text-secondary)]">{error}</p>
        </div>
      </main>
    );
  }

  if (!puzzle) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--text-secondary)]">Loading...</p>
      </main>
    );
  }

  const puzzleNumber = getPuzzleNumber(puzzle.date);
  const dayName = puzzle.day_of_week.charAt(0).toUpperCase() + puzzle.day_of_week.slice(1);

  return (
    <>
      {showSplash && (
        <SplashScreen
          puzzleNumber={puzzleNumber}
          dayName={dayName}
          onDismiss={() => setShowSplash(false)}
        />
      )}
      <main className="min-h-screen flex flex-col">
        <Header onStatsClick={handleStatsClick} />
        <Game puzzle={puzzle} />
        {showStats && gameState && (
          <StatsModal
            gameState={gameState}
            onClose={() => setShowStats(false)}
          />
        )}
      </main>
    </>
  );
}
