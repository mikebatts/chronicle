import type { DigitFeedback } from "./types";
import { digitFeedbackToEmoji } from "./scoring";

export function generateShareText(
  puzzleNumber: number,
  digitFeedbackRows: DigitFeedback[][],
  isWin: boolean,
  streak: number
): string {
  const guessCount = digitFeedbackRows.length;
  const result = isWin ? `${guessCount}/4` : "X/4";
  const streakPart = isWin && streak > 0 ? ` 🔥${streak}` : !isWin ? " 💔" : "";

  const grid = digitFeedbackRows.map((row) => digitFeedbackToEmoji(row)).join("\n");

  return `Chronicle #${puzzleNumber} 📜 ${result}${streakPart}
${grid}
thischronicle.com`;
}
