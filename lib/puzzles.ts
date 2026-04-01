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
  // Get all 3 slots for today, fill missing slots with next available
  const todaySlots = [0, 1, 2].map((slot) =>
    puzzles.find((p) => p.date === today && p.slot === slot)
  );

  // For missing slots, get next day's puzzle or use previous
  const result: Puzzle[] = [];
  let fallbackDate = new Date(today);

  for (let i = 0; i < 3; i++) {
    if (todaySlots[i]) {
      result.push(todaySlots[i]!);
    } else {
      // Find next puzzle for this slot
      fallbackDate = new Date(today);
      fallbackDate.setDate(fallbackDate.getDate() + i);
      const fallbackStr = fallbackDate.toISOString().split("T")[0];
      const fallback = puzzles.find(
        (p) => p.date === fallbackStr && p.slot === i
      );
      if (fallback) {
        result.push(fallback);
      } else {
        // Use first puzzle as ultimate fallback with modified slot
        const base = puzzles[0];
        if (base) {
          result.push({ ...base, date: fallbackStr, slot: i as 0 | 1 | 2 });
        }
      }
    }
  }

  return result;
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
