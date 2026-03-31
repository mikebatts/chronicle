"use client";

import { useState } from "react";
import { track } from "@vercel/analytics";
import type { Puzzle, GameState, TodaySession, DigitFeedback } from "@/lib/types";
import { getPuzzleNumber } from "@/lib/puzzles";
import { generateDailyShareText } from "@/lib/share";
import StatsDisplay from "./StatsDisplay";

const SPARKLE_CONFIG = [
  { style: { left: "10%", top: "-10px" }, tx: "-18px", ty: "-28px", delay: 0 },
  { style: { left: "50%", top: "-10px" }, tx: "0px", ty: "-32px", delay: 60 },
  { style: { right: "10%", top: "-10px" }, tx: "18px", ty: "-28px", delay: 120 },
  { style: { left: "10%", bottom: "-10px" }, tx: "-18px", ty: "28px", delay: 80 },
  { style: { left: "50%", bottom: "-10px" }, tx: "0px", ty: "32px", delay: 40 },
  { style: { right: "10%", bottom: "-10px" }, tx: "18px", ty: "28px", delay: 100 },
] as const;

interface DailyResultsProps {
  puzzles: Puzzle[];
  session: TodaySession;
  gameState: GameState;
  onClose: () => void;
}

export default function DailyResults({ puzzles, session, gameState, onClose }: DailyResultsProps) {
  const [copyLabel, setCopyLabel] = useState("Copy");
  const puzzleNumber = getPuzzleNumber(puzzles[0]?.date || "");

  const shareText = generateDailyShareText(puzzles, session, puzzleNumber, gameState.current_streak);
  const allWon = ([0, 1, 2] as const).every((i) => session.slots[i].phase === "won");

  const copyToClipboard = async () => {
    // Track share clicked (copy fallback)
    track("share_clicked", { method: "copy" });
    
    try {
      await navigator.clipboard.writeText(shareText);
      setCopyLabel("Copied!");
      setTimeout(() => setCopyLabel("Copy"), 2000);
    } catch {
      // Fallback
    }
  };

  const shareScore = async () => {
    // Track share clicked
    track("share_clicked", { method: "native" });
    
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
      } catch {
        // User cancelled or share failed — fall through silently
      }
    } else {
      // Fallback to clipboard on browsers without Web Share API
      try {
        await navigator.clipboard.writeText(shareText);
        setCopyLabel("Copied!");
        setTimeout(() => setCopyLabel("Copy"), 2000);
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className={`flex-1 flex flex-col items-center px-4 py-6 max-w-md mx-auto w-full overflow-y-auto result-fade-in${allWon ? " celebration-bg" : ""}`}>
      {/* Daily Complete Banner */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-amber-500 mb-2">Daily Complete!</h2>
        <p className="text-[var(--text-secondary)] text-sm">Chronicle #{puzzleNumber}</p>
      </div>

      {/* All 3 Results */}
      <div className="w-full space-y-3 mb-6">
        {[0, 1, 2].map((slot) => {
          const puzzle = puzzles[slot];
          const slotState = session.slots[slot as 0 | 1 | 2];
          const won = slotState.phase === "won";

          return (
            <div
              key={slot}
              className={`question-card-reveal relative p-4 rounded-lg border ${
                won
                  ? "border-[var(--digit-correct)] bg-[var(--digit-correct)]/10"
                  : "border-[var(--border)] bg-[var(--surface)]"
              }`}
              style={{ animationDelay: `${slot * 150}ms` }}
            >
              {won && SPARKLE_CONFIG.map((sp, i) => (
                <span
                  key={i}
                  className="sparkle"
                  style={{
                    ...sp.style,
                    "--tx": sp.tx,
                    "--ty": sp.ty,
                    animationDelay: `${slot * 150 + 380 + sp.delay}ms`,
                  } as unknown as React.CSSProperties}
                >
                  ⭐
                </span>
              ))}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0 pr-3">
                  <span className="text-xs text-[var(--text-secondary)]">Question {slot + 1}</span>
                  <h3 className="font-semibold text-[var(--text-primary)] leading-snug">{puzzle.event}</h3>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className="text-2xl font-bold text-[var(--text-primary)]"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {puzzle.year}
                  </span>
                  <div className="text-sm mt-0.5">
                    {won ? (
                      <span className="text-[var(--digit-correct)]">{slotState.guesses.length}/4</span>
                    ) : (
                      <span className="text-red-500">✗/4</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Digit feedback rows */}
              <div className="flex flex-col gap-1">
                {slotState.digitFeedback.map((row, rowIdx) => (
                  <div key={rowIdx} className="flex gap-1">
                    {row.map((df, colIdx) => (
                      <div
                        key={colIdx}
                        className={`w-7 h-7 flex items-center justify-center text-xs font-bold rounded text-white ${
                          df.color === "correct"
                            ? "bg-[var(--digit-correct)]"
                            : df.color === "close"
                            ? "bg-[var(--digit-close)]"
                            : "bg-[var(--digit-miss)]"
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
          onClick={shareScore}
          className={`w-full py-3 px-4 bg-[var(--text-primary)] text-[var(--bg)] font-semibold rounded-lg hover:opacity-90 transition-opacity min-h-[48px]${allWon ? " share-pulse" : ""}`}
        >
          Share Score
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
