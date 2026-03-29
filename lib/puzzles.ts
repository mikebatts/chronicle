import puzzlesData from "@/data/puzzles.json";
import type { Puzzle } from "./types";

export function getTodayPuzzle(): Puzzle {
  const today = new Date().toISOString().split("T")[0];
  const puzzle = puzzlesData.puzzles.find((p: Puzzle) => p.date === today);
  if (!puzzle) {
    throw new Error(`No puzzle found for today: ${today}`);
  }
  return puzzle;
}

export function getPuzzleByDate(date: string): Puzzle | undefined {
  return puzzlesData.puzzles.find((p: Puzzle) => p.date === date);
}

export function getPuzzleNumber(puzzleDate: string): number {
  const firstPuzzleDate = puzzlesData.puzzles[0]?.date;
  if (!firstPuzzleDate) return 1;

  const first = new Date(firstPuzzleDate);
  const current = new Date(puzzleDate);
  const diffTime = current.getTime() - first.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1;
}
