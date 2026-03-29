"use client";

import type { Puzzle, GameState, GamePhase } from "@/lib/types";

interface ResultScreenProps {
  puzzle: Puzzle;
  puzzleNumber: number;
  guesses: number[];
  phase: GamePhase;
  score: number;
  shareText: string;
  gameState: GameState;
}

export default function ResultScreen({
  puzzle,
  puzzleNumber,
  guesses,
  phase,
  score,
  shareText,
  gameState,
}: ResultScreenProps) {
  const isWin = phase === "won";

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      alert("Copied to clipboard!");
    } catch {
      // Fallback
    }
  };

  const avgDistance =
    gameState.wins_with_distance > 0
      ? Math.round(gameState.total_distance / gameState.wins_with_distance)
      : 0;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-lg mx-auto w-full">
      {/* Result Header */}
      <div className="text-center mb-6">
        {isWin ? (
          <>
            <h2 className="text-3xl font-bold mb-2 text-[var(--correct)]">
              Nailed it!
            </h2>
            <p className="text-[var(--text-secondary)]">
              The year was {puzzle.year}
            </p>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold mb-2 text-[var(--cold)]">
              Not quite
            </h2>
            <p className="text-[var(--text-secondary)]">
              The year was {puzzle.year}
            </p>
          </>
        )}
      </div>

      {/* Context Card */}
      <div className="w-full p-4 bg-[var(--surface)] border border-[var(--border)] rounded-lg mb-6">
        <p className="text-[var(--text-primary)] leading-relaxed">
          {puzzle.context_card}
        </p>
        {puzzle.image_attribution && (
          <p className="text-xs text-[var(--text-secondary)] mt-2">
            {puzzle.image_attribution}
          </p>
        )}
      </div>

      {/* Share Button */}
      <button
        onClick={copyToClipboard}
        className="w-full py-3 px-6 bg-[var(--accent)] text-[var(--bg)] font-semibold rounded-lg hover:opacity-90 transition-opacity mb-8"
      >
        Share Result
      </button>

      {/* Stats */}
      <div className="w-full text-center">
        <h3 className="text-lg font-semibold mb-4">Statistics</h3>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold">{gameState.played}</div>
            <div className="text-xs text-[var(--text-secondary)]">Played</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {gameState.played > 0
                ? Math.round((gameState.wins / gameState.played) * 100)
                : 0}
              %
            </div>
            <div className="text-xs text-[var(--text-secondary)]">Win %</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold flex items-center justify-center gap-1">
              {gameState.current_streak}
              {gameState.current_streak > 0 && <span>🔥</span>}
            </div>
            <div className="text-xs text-[var(--text-secondary)]">Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{gameState.max_streak}</div>
            <div className="text-xs text-[var(--text-secondary)]">Max</div>
          </div>
        </div>

        {/* Avg Distance */}
        {gameState.wins > 0 && (
          <div className="text-center mb-4">
            <div className="text-lg font-semibold">
              {avgDistance} <span className="text-[var(--text-secondary)] text-sm">yrs avg</span>
            </div>
            <div className="text-xs text-[var(--text-secondary)]">Average Distance</div>
          </div>
        )}

        {/* Guess Distribution */}
        <div className="text-left">
          <h4 className="text-sm font-semibold mb-2 text-center">Distribution</h4>
          {(["1", "2", "3"] as const).map((n) => {
            const count = gameState.guess_distribution[n] || 0;
            const total = gameState.wins;
            const pct = total > 0 ? (count / total) * 100 : 0;
            return (
              <div key={n} className="flex items-center gap-2 mb-1">
                <span className="w-4 text-sm">{n}</span>
                <div className="flex-1 h-5 bg-[var(--surface)] rounded overflow-hidden">
                  <div
                    className="h-full bg-[var(--accent)]"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-sm text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Back to home hint */}
      <p className="mt-8 text-sm text-[var(--text-secondary)]">
        Come back tomorrow for a new puzzle
      </p>
    </div>
  );
}
