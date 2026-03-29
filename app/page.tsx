"use client";

import { useState, useEffect } from "react";
import { getTodayPuzzle } from "@/lib/puzzles";
import type { Puzzle } from "@/lib/types";
import Game from "@/components/Game";

export default function Home() {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const todaysPuzzle = getTodayPuzzle();
      setPuzzle(todaysPuzzle);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load puzzle");
    }
  }, []);

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Chronicle</h1>
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

  return (
    <main className="min-h-screen flex flex-col">
      <header className="p-4 border-b border-[var(--border)]">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">Chronicle</h1>
        </div>
      </header>
      <Game puzzle={puzzle} />
    </main>
  );
}
