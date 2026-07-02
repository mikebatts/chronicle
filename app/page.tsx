"use client";

import { useState, useEffect } from "react";
import { getTodayPuzzles, getPuzzleNumber } from "@/lib/puzzles";
import { loadState } from "@/lib/storage";
import type { Puzzle, GameState } from "@/lib/types";
import Game from "@/components/Game";
import Header from "@/components/Header";
import StatsModal from "@/components/StatsModal";
import SplashScreen from "@/components/SplashScreen";

export default function Home() {
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showSplash, setShowSplash] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const todaysPuzzles = getTodayPuzzles();
      setPuzzles(todaysPuzzles);
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

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--text-secondary)]">Loading...</p>
      </main>
    );
  }

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

  if (puzzles.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <h1
            className="text-2xl font-semibold mb-2"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Chronicle
          </h1>
          <p className="text-[var(--text-secondary)]">
            Today&apos;s puzzle isn&apos;t available yet. Check back soon.
          </p>
        </div>
      </main>
    );
  }

  const firstPuzzle = puzzles[0];
  const puzzleNumber = getPuzzleNumber(firstPuzzle.date);
  const dayName = firstPuzzle.day_of_week.charAt(0).toUpperCase() + firstPuzzle.day_of_week.slice(1);

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
        <Header onStatsClick={handleStatsClick} onLogoClick={() => setShowSplash(true)} />
        <Game puzzles={puzzles} />
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
