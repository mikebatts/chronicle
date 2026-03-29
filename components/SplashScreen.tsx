"use client";

import { useState, useCallback } from "react";

interface SplashScreenProps {
  puzzleNumber: number;
  dayName: string;
  onDismiss: () => void;
}

export default function SplashScreen({ puzzleNumber, dayName, onDismiss }: SplashScreenProps) {
  const [phase, setPhase] = useState<"in" | "out">("in");

  const dismiss = useCallback(() => {
    if (phase === "out") return;
    setPhase("out");
    setTimeout(() => {
      try {
        sessionStorage.setItem("chronicle_splash_seen", "1");
      } catch {}
      onDismiss();
    }, 400);
  }, [phase, onDismiss]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--bg)] cursor-pointer transition-opacity duration-400 ${phase === "out" ? "opacity-0" : "opacity-100"}`}
      onClick={dismiss}
    >
      <div className="splash-title text-6xl mb-4">🏛️</div>

      <h1
        className="splash-title text-5xl sm:text-6xl font-semibold tracking-[-0.02em]"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Chronicle
      </h1>

      <p className="splash-tagline mt-4 text-lg text-[var(--text-secondary)]">
        Guess the year.
      </p>

      <p className="splash-info mt-3 text-sm text-[var(--text-secondary)]">
        Puzzle #{puzzleNumber} &mdash; {dayName}
      </p>

      <button
        className="splash-button mt-8 px-8 py-3 text-[var(--text-primary)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface)] transition-colors font-medium"
        onClick={(e) => {
          e.stopPropagation();
          dismiss();
        }}
      >
        Play
      </button>
    </div>
  );
}
