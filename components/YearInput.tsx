"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { DigitFeedback } from "@/lib/types";

interface YearInputProps {
  onSubmit: (year: string) => void;
  disabled?: boolean;
  previousGuesses: DigitFeedback[][];
}

const COLOR_MAP = {
  correct: "bg-[var(--digit-correct)] text-white border-[var(--digit-correct)]",
  close: "bg-[var(--digit-close)] text-white border-[var(--digit-close)]",
  miss: "bg-[var(--digit-miss)] text-white border-[var(--digit-miss)]",
};

export default function YearInput({ onSubmit, disabled, previousGuesses }: YearInputProps) {
  const [digits, setDigits] = useState(["", "", "", ""]);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    if (!disabled) {
      inputRefs[0].current?.focus();
    }
  }, [disabled, previousGuesses.length]);

  const handleChange = useCallback((index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  }, []);

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      if (digits[index] === "" && index > 0) {
        inputRefs[index - 1].current?.focus();
        setDigits((prev) => {
          const next = [...prev];
          next[index - 1] = "";
          return next;
        });
      } else {
        setDigits((prev) => {
          const next = [...prev];
          next[index] = "";
          return next;
        });
      }
      e.preventDefault();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs[index - 1].current?.focus();
    } else if (e.key === "ArrowRight" && index < 3) {
      inputRefs[index + 1].current?.focus();
    } else if (e.key === "Enter") {
      handleSubmit();
    }
  }, [digits]);

  const handleSubmit = useCallback(() => {
    if (disabled) return;
    const year = digits.join("");
    if (year.length === 4) {
      const num = parseInt(year, 10);
      if (num >= 400 && num <= 2025) {
        onSubmit(year);
        setDigits(["", "", "", ""]);
        setTimeout(() => inputRefs[0].current?.focus(), 50);
      }
    }
  }, [digits, disabled, onSubmit]);

  const allFilled = digits.every((d) => d !== "");

  return (
    <div className="w-full">
      {/* Previous guesses grid */}
      {previousGuesses.length > 0 && (
        <div className="flex flex-col items-center gap-2 mb-4">
          {previousGuesses.map((row, rowIdx) => (
            <div key={rowIdx} className="flex gap-2 w-full max-w-[340px]">
              {row.map((df, colIdx) => (
                <div
                  key={colIdx}
                  className={`flex-1 aspect-square max-w-[80px] flex items-center justify-center text-2xl sm:text-3xl font-bold rounded-lg ${COLOR_MAP[df.color]} digit-reveal`}
                  style={{ animationDelay: `${colIdx * 150}ms` }}
                >
                  {df.digit}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Current input row */}
      {!disabled && (
        <>
          <div className="flex justify-center gap-2 mb-4 max-w-[340px] mx-auto">
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={inputRefs[i]}
                type="text"
                inputMode="numeric"
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                maxLength={1}
                disabled={disabled}
                className="flex-1 aspect-square max-w-[80px] text-center text-2xl sm:text-3xl font-bold bg-transparent border-2 border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)] focus:border-transparent transition-all caret-transparent"
                aria-label={`Digit ${i + 1}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={disabled || !allFilled}
            className="w-full py-3 px-6 bg-[var(--text-primary)] text-[var(--bg)] font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed min-h-[48px]"
          >
            Guess the Year
          </button>
        </>
      )}
    </div>
  );
}
