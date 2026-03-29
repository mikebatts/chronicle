"use client";

import { useState } from "react";
import type { Puzzle, GameState, GamePhase, DigitFeedback } from "@/lib/types";
import StatsDisplay from "./StatsDisplay";

interface ResultScreenProps {
  puzzle: Puzzle;
  puzzleNumber: number;
  guesses: number[];
  digitFeedbackRows: DigitFeedback[][];
  phase: GamePhase;
  shareText: string;
  gameState: GameState;
}

const COLOR_MAP = {
  correct: "bg-[var(--digit-correct)] text-white border-[var(--digit-correct)]",
  close: "bg-[var(--digit-close)] text-white border-[var(--digit-close)]",
  miss: "bg-[var(--digit-miss)] text-white border-[var(--digit-miss)]",
};

export default function ResultScreen({
  puzzle,
  puzzleNumber,
  guesses,
  digitFeedbackRows,
  phase,
  shareText,
  gameState,
}: ResultScreenProps) {
  const isWin = phase === "won";
  const [copyLabel, setCopyLabel] = useState("Copy result");
  const resultText = isWin ? `${guesses.length}/4` : "X/4";

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

  const tryWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
      } catch {
        // User cancelled or not supported
      }
    } else {
      await copyToClipboard();
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center px-4 py-6 max-w-md mx-auto w-full overflow-y-auto result-fade-in">
      {/* Year Reveal */}
      <div className="text-center mt-2 mb-4">
        <div
          className="text-6xl sm:text-7xl font-bold mb-2 tracking-tight"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {puzzle.year}
        </div>
        <p
          className="text-xl text-[var(--text-secondary)] leading-relaxed"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {puzzle.event_formal}
        </p>
      </div>

      {/* Result */}
      <div className="text-center mb-4">
        <span className={`text-2xl font-bold ${isWin ? "text-[var(--digit-correct)]" : "text-[var(--text-secondary)]"}`}>
          {resultText}
        </span>
      </div>

      {/* Digit feedback grid */}
      <div className="flex flex-col items-center gap-2 mb-6">
        {digitFeedbackRows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-2">
            {row.map((df, colIdx) => (
              <div
                key={colIdx}
                className={`w-12 h-12 flex items-center justify-center text-lg font-bold rounded-lg ${COLOR_MAP[df.color]}`}
              >
                {df.digit}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Context Card */}
      <div className="w-full px-4 py-4 bg-[var(--surface)] rounded-lg mb-6">
        <p className="text-[var(--text-primary)] leading-relaxed text-sm">
          {puzzle.context_card}
        </p>
      </div>

      {/* Share Buttons — vertical stack */}
      <div className="w-full flex flex-col gap-2 mb-6">
        <button
          onClick={tryWebShare}
          className="w-full py-3 px-4 bg-[var(--text-primary)] text-[var(--bg)] font-semibold rounded-lg hover:opacity-90 transition-opacity min-h-[48px]"
        >
          Share
        </button>
        <button
          onClick={copyToClipboard}
          className="w-full py-3 px-4 bg-transparent border border-[var(--border)] text-[var(--text-primary)] font-semibold rounded-lg hover:bg-[var(--surface)] transition-colors min-h-[48px]"
        >
          {copyLabel}
        </button>
        <button
          onClick={shareToX}
          className="w-full py-3 px-4 bg-transparent border border-[var(--border)] text-[var(--text-primary)] font-semibold rounded-lg hover:bg-[var(--surface)] transition-colors min-h-[48px]"
          aria-label="Share on X"
        >
          Share on 𝕏
        </button>
      </div>

      {/* Stats */}
      <div className="w-full border-t border-[var(--border)] pt-6">
        <h3 className="text-lg font-semibold mb-4 text-center">Statistics</h3>
        <StatsDisplay gameState={gameState} />
      </div>

      {/* Footer */}
      <p className="mt-8 mb-4 text-sm text-[var(--text-secondary)]">
        Come back tomorrow for a new puzzle
      </p>
    </div>
  );
}
