"use client";

import type { GameState } from "@/lib/types";

interface StatsDisplayProps {
  gameState: GameState;
}

export default function StatsDisplay({ gameState }: StatsDisplayProps) {
  const totalGames = gameState.played;
  const losses = gameState.losses;

  // Build distribution data: 1, 2, 3, 4, and X (losses)
  const distEntries: { label: string; count: number; isLoss?: boolean }[] = [
    { label: "1", count: gameState.guess_distribution["1"] || 0 },
    { label: "2", count: gameState.guess_distribution["2"] || 0 },
    { label: "3", count: gameState.guess_distribution["3"] || 0 },
    { label: "4", count: gameState.guess_distribution["4"] || 0 },
    { label: "X", count: losses, isLoss: true },
  ];

  const maxCount = Math.max(...distEntries.map((e) => e.count), 1);

  return (
    <div className="w-full text-center">
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

      {totalGames > 0 && (
        <div className="text-left">
          <h4 className="text-sm font-semibold mb-2 text-center">Guess Distribution</h4>
          {distEntries.map((entry) => {
            const barWidth = entry.count > 0 ? Math.max((entry.count / maxCount) * 100, 8) : 0;
            return (
              <div key={entry.label} className="flex items-center gap-2 mb-1">
                <span className="w-4 text-sm font-medium">{entry.label}</span>
                <div className="flex-1 h-5 relative">
                  <div
                    className={`h-full rounded-sm ${entry.isLoss ? "bg-[var(--digit-gray)]" : "bg-[var(--digit-green)]"}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                <span className="w-8 text-sm text-right text-[var(--text-secondary)]">
                  {entry.count}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
