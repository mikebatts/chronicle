"use client";

import { useState, useRef } from "react";

interface YearInputProps {
  onSubmit: (year: string) => void;
  disabled?: boolean;
}

export default function YearInput({ onSubmit, disabled }: YearInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;

    const year = parseInt(value, 10);
    if (year >= 1900 && year <= 2025) {
      onSubmit(value);
      setValue("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <input
        ref={inputRef}
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter year"
        min="1900"
        max="2025"
        disabled={disabled}
        className="w-full px-6 py-4 text-center text-2xl font-mono bg-[var(--surface)] border-2 border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] transition-colors disabled:opacity-50"
        autoFocus
      />
      <button
        type="submit"
        disabled={disabled}
        className="mt-4 w-full py-3 px-6 bg-[var(--accent)] text-[var(--bg)] font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Guess
      </button>
    </form>
  );
}
