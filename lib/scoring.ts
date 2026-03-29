import type { DigitFeedback, DigitColor } from "./types";

/**
 * Wordle-style digit feedback for a 4-digit year guess.
 * correct = correct digit in correct position
 * close = digit exists in answer but wrong position
 * miss = digit not in answer
 */
export function getDigitFeedback(guess: number, answer: number): DigitFeedback[] {
  const guessStr = guess.toString().padStart(4, "0");
  const answerStr = answer.toString().padStart(4, "0");

  const result: DigitFeedback[] = guessStr.split("").map((d) => ({
    digit: d,
    color: "miss" as DigitColor,
  }));

  // Track which answer digits have been "used" by correct or close
  const answerUsed = [false, false, false, false];

  // First pass: mark correct
  for (let i = 0; i < 4; i++) {
    if (guessStr[i] === answerStr[i]) {
      result[i].color = "correct";
      answerUsed[i] = true;
    }
  }

  // Second pass: mark close
  for (let i = 0; i < 4; i++) {
    if (result[i].color === "correct") continue;
    for (let j = 0; j < 4; j++) {
      if (!answerUsed[j] && guessStr[i] === answerStr[j]) {
        result[i].color = "close";
        answerUsed[j] = true;
        break;
      }
    }
  }

  return result;
}

/**
 * Convert digit feedback to share emoji row.
 */
export function digitFeedbackToEmoji(feedback: DigitFeedback[]): string {
  return feedback
    .map((d) => {
      switch (d.color) {
        case "correct": return "🟩";
        case "close": return "🟨";
        case "miss": return "⬛";
      }
    })
    .join("");
}
