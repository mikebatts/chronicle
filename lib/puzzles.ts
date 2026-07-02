import puzzlesData from "@/data/puzzles.json";
import type { Puzzle } from "./types";

const puzzles = puzzlesData.puzzles as unknown as Puzzle[];

function getLocalDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function getTodayPuzzle(): Puzzle {
  const today = getLocalDate();
  // Find slot 0 (morning) puzzle for today
  const puzzle = puzzles.find((p) => p.date === today && p.slot === 0);
  if (!puzzle) {
    throw new Error(`No puzzle found for today: ${today}`);
  }
  return puzzle;
}

export function getTodayPuzzles(): Puzzle[] {
  const today = getLocalDate();
  const todaySlots = [0, 1, 2].map((slot) =>
    puzzles.find((p) => p.date === today && p.slot === slot)
  );

  // All-or-nothing: Game renders exactly 3 slots. If any slot is missing for
  // today, report no puzzle rather than recycling content from another date.
  if (todaySlots.some((p) => !p)) {
    return [];
  }

  return todaySlots as Puzzle[];
}

export function getPuzzleByDate(date: string, slot: 0 | 1 | 2 = 0): Puzzle | undefined {
  return puzzles.find((p) => p.date === date && p.slot === slot);
}

export function getPuzzleNumber(puzzleDate: string): number {
  const firstPuzzleDate = puzzles[0]?.date;
  if (!firstPuzzleDate) return 1;

  const first = new Date(firstPuzzleDate);
  const current = new Date(puzzleDate);
  const diffTime = current.getTime() - first.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1;
}
