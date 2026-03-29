"use client";

interface HeaderProps {
  onStatsClick: () => void;
}

export default function Header({ onStatsClick }: HeaderProps) {
  return (
    <header className="py-4 px-4 border-b border-[var(--border)]">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="w-10" />
        <h1
          className="text-2xl font-semibold tracking-[-0.02em]"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Chronicle
        </h1>
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
    </header>
  );
}
