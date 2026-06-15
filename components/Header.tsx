"use client";

import Link from "next/link";

interface HeaderProps {
  onStatsClick: () => void;
  onLogoClick: () => void;
}

export default function Header({ onStatsClick, onLogoClick }: HeaderProps) {
  return (
    <header className="py-4 px-4 border-b border-[var(--border)]">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <button
          onClick={onLogoClick}
          className="text-2xl font-semibold tracking-[-0.02em] hover:opacity-70 transition-opacity"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Chronicle
        </button>
        <div className="flex items-center gap-1">
          <Link
            href="/about"
            className="px-2 py-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            About
          </Link>
          <button
            onClick={onStatsClick}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[var(--surface)] transition-colors"
            aria-label="View statistics"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="2" y="10" width="4" height="8" rx="1" fill="currentColor" />
              <rect x="8" y="6" width="4" height="12" rx="1" fill="currentColor" />
              <rect x="14" y="2" width="4" height="16" rx="1" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
