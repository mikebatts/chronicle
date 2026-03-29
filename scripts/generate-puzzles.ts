/**
 * Generate puzzle candidates using Claude API.
 *
 * Usage:
 *   npx tsx scripts/generate-puzzles.ts generate --count 5
 *   npx tsx scripts/generate-puzzles.ts stats
 *
 * Requires ANTHROPIC_API_KEY environment variable.
 *
 * - generate: Creates N puzzle candidates, saves to data/staging/
 * - stats: Shows coverage of existing puzzles (year range, tiers, difficulty)
 */

import fs from "fs";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";

const PUZZLES_PATH = path.join(__dirname, "../data/puzzles.json");
const STAGING_DIR = path.join(__dirname, "../data/staging");

interface Puzzle {
  id: number;
  date: string;
  day_of_week: string;
  event: string;
  event_formal: string;
  year: number;
  image: string;
  image_attribution: string;
  image_source_url: string;
  headline: string;
  tier: number;
  difficulty_rating: number;
  clues: {
    monday: [string, string];
    tuesday: [string, string];
    wednesday: [string, string];
    thursday: string;
    friday: string;
    saturday: string;
  };
  context_card: string;
}

function loadPuzzles(): Puzzle[] {
  const raw = fs.readFileSync(PUZZLES_PATH, "utf-8");
  return JSON.parse(raw).puzzles;
}

function showStats() {
  const puzzles = loadPuzzles();
  console.log(`\nTotal puzzles: ${puzzles.length}`);

  // Year distribution
  const years = puzzles.map((p) => p.year).sort((a, b) => a - b);
  console.log(`Year range: ${years[0]} - ${years[years.length - 1]}`);

  const decades: Record<string, number> = {};
  for (const y of years) {
    const decade = `${Math.floor(y / 10) * 10}s`;
    decades[decade] = (decades[decade] || 0) + 1;
  }
  console.log("\nDecade distribution:");
  for (const [decade, count] of Object.entries(decades).sort()) {
    console.log(`  ${decade}: ${"█".repeat(count)} ${count}`);
  }

  // Tier distribution
  const tiers: Record<number, number> = {};
  for (const p of puzzles) {
    tiers[p.tier] = (tiers[p.tier] || 0) + 1;
  }
  console.log("\nTier distribution:");
  for (const [tier, count] of Object.entries(tiers).sort()) {
    console.log(`  Tier ${tier}: ${count}`);
  }

  // Difficulty distribution
  const difficulties: Record<number, number> = {};
  for (const p of puzzles) {
    difficulties[p.difficulty_rating] = (difficulties[p.difficulty_rating] || 0) + 1;
  }
  console.log("\nDifficulty distribution:");
  for (let d = 1; d <= 10; d++) {
    const count = difficulties[d] || 0;
    if (count > 0) {
      console.log(`  ${d}: ${"█".repeat(count)} ${count}`);
    }
  }
}

const GENERATION_PROMPT = `Generate a historical event puzzle for a daily guessing game called Chronicle. Players see an image and headline, then guess the year.

Requirements:
- Year must be between 1600 and 2025
- Year must be verifiable on Wikipedia
- The event should have a readily available public domain image on Wikimedia Commons
- Clues must NOT reveal the year directly or narrow it to a specific year
- The headline must NOT mention the year
- The context card should have an editorial voice (not Wikipedia-style prose)
- Mix of US, European, and globally significant events

Generate the puzzle as a JSON object with this exact structure:
{
  "event": "Short display name",
  "event_formal": "Formal name for context card",
  "year": 1900,
  "image_attribution": "Source, Wikimedia Commons",
  "image_source_url": "https://commons.wikimedia.org/wiki/File:Example.jpg",
  "headline": "One-line hook, NO year mentioned",
  "tier": 1,
  "difficulty_rating": 5,
  "clues": {
    "monday": ["Warm guiding clue 1", "Warm guiding clue 2"],
    "tuesday": ["Breadcrumb clue 1", "Breadcrumb clue 2"],
    "wednesday": ["Progressively tighter clue 1", "Progressively tighter clue 2"],
    "thursday": "Single tight clue",
    "friday": "Single tight clue",
    "saturday": "Oblique, almost poetic clue"
  },
  "context_card": "2-3 sentences, editorial voice. Don't mention the year in the first sentence."
}

Tier guide: 1 = well-known globally, 2 = known to history enthusiasts, 3 = niche/surprising.
Difficulty: 1 = very easy (most people know the year), 10 = very hard.`;

async function generatePuzzles(count: number) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("Error: ANTHROPIC_API_KEY environment variable not set.");
    process.exit(1);
  }

  const client = new Anthropic();
  fs.mkdirSync(STAGING_DIR, { recursive: true });

  const existingPuzzles = loadPuzzles();
  const existingYears = new Set(existingPuzzles.map((p) => p.year));
  const existingEvents = existingPuzzles.map((p) => p.event.toLowerCase());

  console.log(`Generating ${count} puzzle candidates...`);
  console.log(`Existing puzzles: ${existingPuzzles.length} (years: ${[...existingYears].sort().join(", ")})`);

  for (let i = 0; i < count; i++) {
    console.log(`\nGenerating puzzle ${i + 1}/${count}...`);

    try {
      const response = await client.messages.create({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: `${GENERATION_PROMPT}\n\nAvoid these years already used: ${[...existingYears].join(", ")}.\nAvoid these events already used: ${existingEvents.join(", ")}.\n\nGenerate ONE unique puzzle now.`,
          },
        ],
      });

      const text = response.content
        .filter((b): b is { type: "text"; text: string } => b.type === "text")
        .map((b) => b.text)
        .join("");

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error("  No JSON found in response");
        continue;
      }

      const puzzle = JSON.parse(jsonMatch[0]);

      // Validate required fields
      const required = ["event", "event_formal", "year", "headline", "clues", "context_card"];
      const missing = required.filter((f) => !(f in puzzle));
      if (missing.length > 0) {
        console.error(`  Missing fields: ${missing.join(", ")}`);
        continue;
      }

      // Validate year range
      if (puzzle.year < 1600 || puzzle.year > 2025) {
        console.error(`  Year ${puzzle.year} out of range`);
        continue;
      }

      // Save to staging
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `candidate-${timestamp}-${i}.json`;
      const filepath = path.join(STAGING_DIR, filename);
      fs.writeFileSync(filepath, JSON.stringify(puzzle, null, 2));

      console.log(`  ${puzzle.event} (${puzzle.year}) → ${filename}`);

      // Track for dedup within batch
      existingYears.add(puzzle.year);
      existingEvents.push(puzzle.event.toLowerCase());
    } catch (err) {
      console.error(`  Error: ${(err as Error).message}`);
    }
  }

  console.log(`\nDone. Candidates saved to data/staging/`);
  console.log("Review each candidate before adding to puzzles.json.");
}

// CLI
const args = process.argv.slice(2);
const command = args[0];

if (command === "stats") {
  showStats();
} else if (command === "generate") {
  const countIdx = args.indexOf("--count");
  const count = countIdx >= 0 ? parseInt(args[countIdx + 1], 10) : 5;
  if (isNaN(count) || count < 1) {
    console.error("Invalid count");
    process.exit(1);
  }
  generatePuzzles(count);
} else {
  console.log("Usage:");
  console.log("  npx tsx scripts/generate-puzzles.ts generate --count 5");
  console.log("  npx tsx scripts/generate-puzzles.ts stats");
}
