import type { DigitFeedback, TodaySession, Puzzle } from "./types";

export function generateShareText(
  puzzleNumber: number,
  digitFeedbackRows: DigitFeedback[][],
  won: boolean,
  streak: number
): string {
  const emojiMap = {
    correct: "🟩",
    close: "🟨",
    miss: "⬜",
    far: "🟥",
  };

  const grid = digitFeedbackRows
    .map((row) => row.map((df) => emojiMap[df.color] || "⬜").join(""))
    .join("\n");

  const streakText = streak > 0 ? ` 🔥${streak}` : "";
  return `Chronicle #${puzzleNumber} 📜${streakText}\n${grid}\nthischronicle.com`;
}

export function generateDailyShareText(
  puzzles: Puzzle[],
  session: TodaySession,
  puzzleNumber: number,
  streak: number
): string {
  const emojiMap = {
    correct: "🟩",
    close: "🟨",
    miss: "⬜",
    far: "🟥",
  };

  const lines: string[] = [`Chronicle #${puzzleNumber} 📜`, ""];

  // Show all 3 puzzles
  [0, 1, 2].forEach((slot) => {
    const slotState = session.slots[slot as 0 | 1 | 2];
    const digitRows = slotState.digitFeedback;

    lines.push(`${slot + 1}️⃣`);
    digitRows.forEach((row) => {
      const digits = row.map((df) => emojiMap[df.color] || "⬜").join("");
      lines.push(digits);
    });
    lines.push(""); // Blank line between puzzles
  });

  const slotsComplete = [0, 1, 2].filter(
    (s) => session.slots[s as 0 | 1 | 2].phase !== "playing"
  ).length;

  const streakText = streak > 0 ? `🔥${streak}` : "";
  lines.push(`${streakText} | ${slotsComplete}/3`);
  lines.push("thischronicle.com");

  return lines.join("\n");
}
