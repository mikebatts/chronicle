"use client";

import type { GameState } from "@/lib/types";
import StatsDisplay from "./StatsDisplay";

interface StatsModalProps {
  gameState: GameState;
  onClose: () => void;
}

export default function StatsModal({ gameState, onClose }: StatsModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full max-w-sm bg-[var(--bg)] border border-[var(--border)] rounded-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Statistics</h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[var(--surface)] transition-colors"
            aria-label="Close statistics"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 5L15 15M15 5L5 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <StatsDisplay gameState={gameState} />
      </div>
    </div>
  );
}
