/**
 * Scrub year leakage from puzzle text. Chronicle is a year-guessing game:
 * NO 4-digit year may appear in any player-visible text (event, headline,
 * description, context_card, clues).
 *
 * Usage:
 *   npx tsx scripts/scrub-years.ts scan            # report offenders, no writes
 *   npx tsx scripts/scrub-years.ts fix             # rewrite offenders via Claude CLI
 *   npx tsx scripts/scrub-years.ts fix --min-id 91 # only puzzles with id > min
 */

import fs from "fs";
import path from "path";
import { spawn } from "child_process";

const PUZZLES_PATH = path.join(__dirname, "../data/puzzles.json");
const MODEL = process.env.PUZZLE_MODEL || "claude-sonnet-4-6";
const BATCH = 8;
const CONCURRENCY = 3;
const CLI_TIMEOUT_MS = 15 * 60 * 1000;
const YEAR_RE = /\b(1[0-9]{3}|20[0-9]{2})\b/g;

interface Puzzle {
  id: number;
  date: string;
  slot: number;
  day_of_week: string;
  event: string;
  event_formal: string;
  year: number;
  headline: string;
  description: string;
  tier: number;
  difficulty_rating: number;
  clues: Record<string, string[]>;
  context_card: string;
}

function visibleText(p: Puzzle): Record<string, string> {
  return {
    event: p.event,
    headline: p.headline,
    description: p.description,
    context_card: p.context_card,
    clues: Object.values(p.clues).flat().join(" | "),
  };
}

function leakingFields(p: Puzzle): string[] {
  return Object.entries(visibleText(p))
    .filter(([, v]) => YEAR_RE.test(v))
    .map(([k]) => k);
}

function callClaudeCLI(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const env = { ...process.env };
    delete env.ANTHROPIC_API_KEY;
    const child = spawn("claude", ["--model", MODEL, "-p"], { env });
    let out = "";
    let err = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("claude CLI timeout"));
    }, CLI_TIMEOUT_MS);
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));
    child.on("error", (e) => {
      clearTimeout(timer);
      reject(e);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code !== 0) reject(new Error(`exit ${code}: ${err.slice(0, 200)}`));
      else resolve(out);
    });
    child.stdin.write(prompt);
    child.stdin.end();
  });
}

function extractJsonArray(text: string): any[] | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fenced ? fenced[1] : text;
  const start = body.indexOf("[");
  const end = body.lastIndexOf("]");
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(body.slice(start, end + 1));
  } catch {
    return null;
  }
}

function buildPrompt(items: Puzzle[]): string {
  const payload = items.map((p) => ({
    id: p.id,
    year_DO_NOT_REVEAL: p.year,
    event: p.event,
    headline: p.headline,
    description: p.description,
    context_card: p.context_card,
    clues: Object.values(p.clues).flat(),
  }));
  return `Chronicle is a daily game where players read about a historical event and must GUESS THE YEAR it happened. Any 4-digit year appearing in the text destroys the game.

Rewrite the following puzzle texts so that NO 4-digit year (1000-2099) appears ANYWHERE — not the event's own year, and not any other year (other years are strong hints too). Replace year references with relative or descriptive phrasing ("three decades earlier", "at the height of the Cold War", "a generation before"). Keep every other fact, the tone, and roughly the same length. Do not mention the year in words either (no "nineteen sixty-nine").

Input puzzles:
${JSON.stringify(payload, null, 2)}

Return ONLY a JSON array where each object has: id, event, headline, description, context_card, clues (array of strings, SAME length and order as input; rewrite a clue only if it contains a year, otherwise return it unchanged). No markdown, no commentary.`;
}

function loadAll(): { puzzles: Puzzle[] } {
  return JSON.parse(fs.readFileSync(PUZZLES_PATH, "utf-8"));
}

async function runPool<T>(items: T[], concurrency: number, worker: (item: T) => Promise<void>) {
  let cursor = 0;
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const item = items[cursor++];
      await worker(item);
    }
  });
  await Promise.all(runners);
}

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];
  const minIdx = args.indexOf("--min-id");
  const minId = minIdx >= 0 ? parseInt(args[minIdx + 1], 10) : 0;

  const data = loadAll();
  const offenders = data.puzzles.filter((p) => p.id > minId && leakingFields(p).length > 0);
  console.log(`Offenders (id > ${minId}): ${offenders.length}`);
  for (const p of offenders) {
    console.log(`  #${p.id} ${p.date} slot ${p.slot} [${leakingFields(p).join(", ")}] ${p.event}`);
  }
  if (cmd !== "fix") return;

  const batches: Puzzle[][] = [];
  for (let i = 0; i < offenders.length; i += BATCH) batches.push(offenders.slice(i, i + BATCH));

  const byId = new Map(data.puzzles.map((p) => [p.id, p]));
  let fixed = 0;
  let failed = 0;

  await runPool(batches, CONCURRENCY, async (batch) => {
    for (let attempt = 0; attempt < 3; attempt++) {
      let arr: any[] | null = null;
      try {
        arr = extractJsonArray(await callClaudeCLI(buildPrompt(batch)));
      } catch (e) {
        console.error(`  batch error (attempt ${attempt + 1}): ${(e as Error).message}`);
        continue;
      }
      if (!arr) continue;

      const remaining: Puzzle[] = [];
      for (const p of batch) {
        const r = arr.find((x) => x && x.id === p.id);
        const origClues = Object.values(p.clues).flat();
        const ok =
          r &&
          typeof r.event === "string" &&
          typeof r.headline === "string" &&
          typeof r.description === "string" &&
          typeof r.context_card === "string" &&
          Array.isArray(r.clues) &&
          r.clues.length === origClues.length &&
          ![r.event, r.headline, r.description, r.context_card, r.clues.join(" ")].some((t: string) =>
            YEAR_RE.test(t)
          );
        if (!ok) {
          remaining.push(p);
          continue;
        }
        const target = byId.get(p.id)!;
        target.event = r.event;
        target.headline = r.headline;
        target.description = r.description;
        target.context_card = r.context_card;
        // put rewritten clues back into the single populated day
        for (const day of Object.keys(target.clues)) {
          if (target.clues[day].length > 0) target.clues[day] = r.clues;
        }
        fixed++;
      }
      batch = remaining;
      if (batch.length === 0) break;
    }
    failed += batch.length;
    if (batch.length > 0) {
      console.error(`  UNFIXED after retries: ${batch.map((p) => p.id).join(", ")}`);
    }
  });

  fs.writeFileSync(PUZZLES_PATH, JSON.stringify({ puzzles: data.puzzles }, null, 2));
  console.log(`\nFixed: ${fixed}; unfixed: ${failed}. puzzles.json updated.`);

  const still = data.puzzles.filter((p) => p.id > minId && leakingFields(p).length > 0);
  console.log(`Remaining offenders: ${still.length}`);
}

main();
