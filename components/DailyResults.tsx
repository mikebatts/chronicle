"use client";

import { useState } from "react";
import type { Puzzle, GameState, TodaySession, DigitFeedback } from "@/lib/types";
import { getPuzzleNumber } from "@/lib/puzzles";
import { generateDailyShareText } from "@/lib/share";
import StatsDisplay from "./StatsDisplay";

interface DailyResultsProps {
  puzzles: Puzzle[];
  session: TodaySession;
  gameState: GameState;
  onClose: () => void;
}

export default function DailyResults({ puzzles, session, gameState, onClose }: DailyResultsProps) {
  const [copyLabel, setCopyLabel] = useState("Copy result");
  const puzzleNumber = getPuzzleNumber(puzzles[0]?.date || "");

  const shareText = generateDailyShareText(puzzles, session, puzzleNumber, gameState.current_streak);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopyLabel("Copied!");
      setTimeout(() => setCopyLabel("Copy result"), 2000);
    } catch {
      // Fallback
    }
  };

  const shareToX = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex-1 flex flex-col items-center px-4 py-6 max-w-md mx-auto w-full overflow-y-auto result-fade-in">
      {/* Daily Complete Banner */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-amber-500 mb-2">Daily Complete!</h2>
        <p className="text-gray-400 text-sm">Chronicle #{puzzleNumber}</p>
      </div>

      {/* All 3 Results */}
      <div className="w-full space-y-4 mb-6">
        {[0, 1, 2].map((slot) => {
          const puzzle = puzzles[slot];
          const slotState = session.slots[slot as 0 | 1 | 2];
          const won = slotState.phase === "won";

          return (
            <div
              key={slot}
              className={`p-4 rounded-lg border ${
                won
                  ? "border-green-600 bg-green-900/20"
                  : "border-gray-700 bg-gray-800/20"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-xs text-gray-500">Puzzle {slot + 1}</span>
                  <h3 className="font-semibold text-white">{puzzle.event}</h3>
                </div>
                <div className="text-right">
                  <span
                    className="text-2xl font-bold"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {puzzle.year}
                  </span>
                  {won && (
                    <span className="ml-2 text-green-400 text-sm">
                      {slotState.guesses.length}/4
                    </span>
                  )}
                  {!won && (
                    <span className="ml-2 text-red-400 text-sm">X/4</span>
                  )}
                </div>
              </div>

              {/* Mini digit feedback */}
              <div className="flex gap-1 flex-wrap">
                {slotState.digitFeedback.map((row, rowIdx) => (
                  <div key={rowIdx} className="flex gap-0.5">
                    {row.map((df, colIdx) => (
                      <div
                        key={colIdx}
                        className={`w-6 h-6 flex items-center justify-center text-xs font-bold rounded ${
                          df.color === "correct"
                            ? "bg-green-500 text-white"
                            : df.color === "close"
                            ? "bg-yellow-500 text-white"
                            : df.color === "far"
                            ? "bg-red-600 text-white"
                            : "bg-gray-600 text-white"
                        }`}
                      >
                        {df.digit}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Share Buttons */}
      <div className="w-full flex flex-col gap-2 mb-6">
        <button
          onClick={shareToX}
          className="w-full py-3 px-4 bg-[var(--text-primary)] text-[var(--bg)] font-semibold rounded-lg hover:opacity-90 transition-opacity min-h-[48px]"
        >
          Share on 𝕏
        </button>
        <button
          onClick={copyToClipboard}
          className="w-full py-3 px-4 bg-transparent border border-[var(--border)] text-[var(--text-primary)] font-semibold rounded-lg hover:bg-[var(--surface)] transition-colors min-h-[48px]"
        >
          {copyLabel}
        </button>
      </div>

      {/* Stats */}
      <div className="w-full border-t border-[var(--border)] pt-6">
        <h3 className="text-lg font-semibold mb-4 text-center">Statistics</h3>
        <StatsDisplay gameState={gameState} />
      </div>

      {/* Footer */}
      <p className="mt-8 mb-4 text-sm text-[var(--text-secondary)]">
        Come back tomorrow for new puzzles
      </p>
    </div>
  );
}
