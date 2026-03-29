export function calculateScore(guess: number, correct: number): number {
  const distance = Math.abs(guess - correct);

  if (distance === 0) return 1000;
  if (distance <= 5) return 950;
  if (distance <= 10) return 900;
  if (distance <= 15) return 800;
  if (distance <= 20) return 700;
  if (distance <= 25) return 600;
  if (distance <= 30) return 500;
  if (distance <= 40) return 400;
  if (distance <= 50) return 300;
  if (distance <= 75) return 200;
  return 100;
}

export function getDistanceCategory(
  guess: number,
  correct: number
): "exact" | "very_close" | "close" | "warm" | "cold" {
  const distance = Math.abs(guess - correct);

  if (distance === 0) return "exact";
  if (distance <= 5) return "very_close";
  if (distance <= 15) return "close";
  if (distance <= 30) return "warm";
  return "cold";
}
