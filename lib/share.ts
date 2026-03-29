import { getDistanceCategory } from "./scoring";

export function generateShareText(
  puzzleNumber: number,
  guesses: number[],
  correctYear: number,
  isWin: boolean,
  streak: number
): string {
  const emojiTrail = guesses
    .map((g, i) => {
      const cat = getDistanceCategory(g, correctYear);
      switch (cat) {
        case "exact":
          return "✅";
        case "very_close":
          return "🟢";
        case "close":
          return "🟡";
        case "warm":
          return "🟠";
        case "cold":
          return "🔴";
      }
    })
    .join(isWin ? " → " : " → ");

  if (isWin) {
    const streakEmoji = streak > 0 ? ` 🔥${streak}` : "";
    const firstTry = guesses.length === 1 && Math.abs(guesses[0] - correctYear) === 0;

    if (firstTry) {
      return `Chronicle #${puzzleNumber} 📜${streakEmoji}
✅ ⬜ ⬜
thischronicle.com`;
    }

    return `Chronicle #${puzzleNumber} 📜${streakEmoji}
${emojiTrail}
thischronicle.com`;
  }

  return `Chronicle #${puzzleNumber} 📜 💔
${emojiTrail}
thischronicle.com`;
}
