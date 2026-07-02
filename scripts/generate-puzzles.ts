/**
 * Generate Chronicle puzzle candidates using the Claude API (24-month backfill).
 *
 * Usage:
 *   npx tsx scripts/generate-puzzles.ts backfill            # full 2,100-puzzle backfill
 *   npx tsx scripts/generate-puzzles.ts backfill --limit 1  # only N batches (smoke test)
 *   npx tsx scripts/generate-puzzles.ts merge               # merge staging -> puzzles.json + image-sources.json
 *   npx tsx scripts/generate-puzzles.ts stats               # coverage of current puzzles.json
 *
 * Requires ANTHROPIC_API_KEY.
 *
 * Output matches lib/types.ts exactly: NO image_* fields in the JSON; a `description`
 * field; clues object with all 7 day keys where only the day matching day_of_week is
 * populated (mon/tue/wed = 2 clues, thu/fri/sat = 1, sunday = 0).
 *
 * Image suggestions are kept separately in data/image-sources.json (keyed by puzzle id)
 * for a later download pass — they are NOT written into puzzles.json.
 */

import fs from "fs";
import path from "path";
import { spawn } from "child_process";

const PUZZLES_PATH = path.join(__dirname, "../data/puzzles.json");
const STAGING_DIR = path.join(__dirname, "../data/staging");
const IMAGE_SOURCES_PATH = path.join(__dirname, "../data/image-sources.json");

let RANGE_START = "2024-06-15";
let RANGE_END = "2026-06-14"; // inclusive; override with --from/--to
const SLOTS: (0 | 1 | 2)[] = [0, 1, 2];
const DAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;
type Day = (typeof DAYS)[number];

const CLUES_NEEDED: Record<Day, number> = {
  sunday: 0,
  monday: 2,
  tuesday: 2,
  wednesday: 2,
  thursday: 1,
  friday: 1,
  saturday: 1,
};

// Backend: "cli" (default) shells out to the Claude Code CLI on the Max
// subscription — no per-token cost. Set PUZZLE_BACKEND=openrouter to use the
// OpenRouter HTTP API instead (requires OPENROUTER_API_KEY).
const BACKEND = process.env.PUZZLE_BACKEND || "cli";
const MODEL =
  process.env.PUZZLE_MODEL ||
  (BACKEND === "cli" ? "claude-sonnet-4-6" : "anthropic/claude-sonnet-4.5");
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DAYS_PER_BATCH = BACKEND === "cli" ? 3 : 10; // CLI: 9 puzzles/call keeps each call fast
const CONCURRENCY = BACKEND === "cli" ? 3 : 5;
const MAX_TOKENS = 8000;
const TEMPERATURE = 0.7;
const CLI_TIMEOUT_MS = 15 * 60 * 1000;

function callClaudeCLI(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const env = { ...process.env };
    delete env.ANTHROPIC_API_KEY; // CLI must use its own subscription auth
    const child = spawn("claude", ["--model", MODEL, "-p"], { env });
    let out = "";
    let err = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error(`claude CLI timed out after ${CLI_TIMEOUT_MS / 1000}s`));
    }, CLI_TIMEOUT_MS);
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));
    child.on("error", (e) => {
      clearTimeout(timer);
      reject(e);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code !== 0) reject(new Error(`claude CLI exit ${code}: ${err.slice(0, 200)}`));
      else resolve(out);
    });
    child.stdin.write(prompt);
    child.stdin.end();
  });
}

async function callOpenRouter(prompt: string): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY not set");
  const resp = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      temperature: TEMPERATURE,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`${resp.status} ${body.slice(0, 200)}`);
  }
  const j: any = await resp.json();
  return j?.choices?.[0]?.message?.content ?? "";
}

async function callLLM(prompt: string): Promise<string> {
  return BACKEND === "cli" ? callClaudeCLI(prompt) : callOpenRouter(prompt);
}

interface Clues {
  monday: string[];
  tuesday: string[];
  wednesday: string[];
  thursday: string[];
  friday: string[];
  saturday: string[];
  sunday: string[];
}

interface Puzzle {
  id: number;
  date: string;
  slot: 0 | 1 | 2;
  day_of_week: Day;
  event: string;
  event_formal: string;
  year: number;
  headline: string;
  description: string;
  tier: number;
  difficulty_rating: number;
  clues: Clues;
  context_card: string;
}

interface ImageSuggestion {
  commons_filename: string;
  attribution: string;
}

// ---------- date helpers ----------

function parseDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function fmtDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function dayOfWeek(s: string): Day {
  return DAYS[parseDate(s).getUTCDay()];
}

function allDatesInRange(): string[] {
  const out: string[] = [];
  const end = parseDate(RANGE_END);
  for (let d = parseDate(RANGE_START); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    out.push(fmtDate(d));
  }
  return out;
}

// ---------- io ----------

function loadPuzzles(): Puzzle[] {
  const raw = fs.readFileSync(PUZZLES_PATH, "utf-8");
  return JSON.parse(raw).puzzles;
}

function emptyClues(): Clues {
  return {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  };
}

// ---------- era rotation (spreads events across the 1900-2024 range) ----------

const ERAS = [
  { label: "1900-1929 (turn of the century, WWI, Roaring Twenties)", min: 1900, max: 1929 },
  { label: "1930-1949 (Great Depression, WWII, post-war)", min: 1930, max: 1949 },
  { label: "1950-1969 (Cold War, Space Race, civil rights)", min: 1950, max: 1969 },
  { label: "1970-1989 (détente, technology, cultural shifts)", min: 1970, max: 1989 },
  { label: "1990-2009 (post-Cold War, digital revolution)", min: 1990, max: 2009 },
  { label: "2010-2024 (modern era)", min: 2010, max: 2024 },
];

const DOMAIN_FOCI = [
  "lean toward politics & world affairs",
  "lean toward science, technology & exploration",
  "lean toward culture, sports & entertainment",
  "lean toward art, literature & music",
];

// ---------- prompt ----------

interface SlotSpec {
  i: number;
  date: string;
  day: Day;
  slot: 0 | 1 | 2;
  cluesNeeded: number;
}

function buildPrompt(specs: SlotSpec[], batchIdx: number, usedEvents: string[]): string {
  const era = ERAS[batchIdx % ERAS.length];
  const domain = DOMAIN_FOCI[batchIdx % DOMAIN_FOCI.length];
  const specList = specs
    .map(
      (s) =>
        `  { "i": ${s.i}, "date": "${s.date}", "day_of_week": "${s.day}", "clues_needed": ${s.cluesNeeded} }`
    )
    .join(",\n");

  const avoid =
    usedEvents.length > 0
      ? `\nDo NOT reuse any of these already-used events (pick different historical moments):\n${usedEvents
          .slice(-400)
          .join("; ")}\n`
      : "";

  return `You are generating historical events for Chronicle, a daily year-guessing game. Players see an event and guess the year it happened.

I will give you a list of ${specs.length} slots to fill. For EACH slot, produce one historical event puzzle. Return a JSON array (no markdown, no commentary) where each object has this exact shape:

{
  "i": <the slot index from the input>,
  "event": "Short display name (5-8 words)",
  "event_formal": "Full formal name of the event",
  "year": <integer 1900-2024>,
  "headline": "One-line hook. Intriguing. NEVER mention any year.",
  "description": "2-3 sentence paragraph. NEVER mention any 4-digit year — players must guess the year.",
  "tier": 1 | 2 | 3,
  "difficulty_rating": <integer 1-10>,
  "clues": [<array of EXACTLY clues_needed strings; [] if clues_needed is 0>],
  "context_card": "2-3 sentences in the voice of a smart friend who loves history. NEVER mention any 4-digit year.",
  "image_suggestion": { "commons_filename": "File:Plausible_Wikimedia_Name.jpg", "attribution": "Wikimedia Commons / Source" }
}

Slots to fill:
[
${specList}
]

Hard rules:
- year must be an integer between 1900 and 2024 (never 2025+).
- The event must be historically real and verifiable (has a Wikipedia page).
- The game is YEAR-GUESSING: no 4-digit year (1000-2099) may appear ANYWHERE in event, headline, description, context_card, or clues — not the answer year and not any other year. Use relative phrasing instead ("a decade after the war", "at the height of the Cold War"). Never state the year in words either.
- Each clue set must escalate broad -> narrow. For a single-clue day, give one tight clue. For "saturday" days, the single clue must be oblique and almost poetic, not a plain fact.
- Output exactly clues_needed clue strings per slot (0, 1, or 2). Never more, never fewer.
- The three slots that share the same date MUST be three DIFFERENT events.
- Do not repeat an event across this batch.
- This batch should emphasize the era ${era.label} and ${domain}, but variety within that is welcome. Mix geographies (Americas, Europe, Asia, Africa/Middle East/Oceania).
- Tier 1 = era widely known; Tier 2 = obscure but fascinating; Tier 3 = anniversary/date-anchor event. Roughly 60% tier 1, 30% tier 2, 10% tier 3.
${avoid}
Return ONLY the JSON array of ${specs.length} objects.`;
}

// ---------- parsing & validation ----------

function extractJsonArray(text: string): any[] | null {
  // strip code fences if present
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fenced ? fenced[1] : text;
  const start = body.indexOf("[");
  const end = body.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(body.slice(start, end + 1));
  } catch {
    return null;
  }
}

function validateItem(raw: any, spec: SlotSpec): { ok: true } | { ok: false; reason: string } {
  if (!raw || typeof raw !== "object") return { ok: false, reason: "not an object" };
  for (const f of [
    "event",
    "event_formal",
    "year",
    "headline",
    "description",
    "tier",
    "difficulty_rating",
    "clues",
    "context_card",
  ]) {
    if (!(f in raw)) return { ok: false, reason: `missing ${f}` };
  }
  if (typeof raw.year !== "number" || raw.year < 1900 || raw.year > 2024) {
    return { ok: false, reason: `year ${raw.year} out of range` };
  }
  if (![1, 2, 3].includes(raw.tier)) return { ok: false, reason: `bad tier ${raw.tier}` };
  if (!Array.isArray(raw.clues)) return { ok: false, reason: "clues not array" };
  if (raw.clues.length !== spec.cluesNeeded) {
    return { ok: false, reason: `clues length ${raw.clues.length} != ${spec.cluesNeeded}` };
  }
  // year leakage check: NO 4-digit year allowed in any player-visible text
  const YEAR_LEAK = /\b(1[0-9]{3}|20[0-9]{2})\b/;
  for (const c of raw.clues) {
    if (typeof c !== "string") return { ok: false, reason: "clue not string" };
    if (YEAR_LEAK.test(c)) return { ok: false, reason: "clue contains a year" };
  }
  for (const f of ["event", "headline", "description", "context_card"] as const) {
    if (YEAR_LEAK.test(String(raw[f]))) return { ok: false, reason: `${f} contains a year` };
  }
  return { ok: true };
}

function assemble(raw: any, spec: SlotSpec, id: number): Puzzle {
  const clues = emptyClues();
  (clues as any)[spec.day] = raw.clues;
  return {
    id,
    date: spec.date,
    slot: spec.slot,
    day_of_week: spec.day,
    event: String(raw.event),
    event_formal: String(raw.event_formal),
    year: raw.year,
    headline: String(raw.headline),
    description: String(raw.description),
    tier: raw.tier,
    difficulty_rating: raw.difficulty_rating,
    clues,
    context_card: String(raw.context_card),
  };
}

// ---------- generation ----------

async function generateBatch(
  specs: SlotSpec[],
  batchIdx: number,
  usedEvents: string[]
): Promise<{ spec: SlotSpec; raw: any }[]> {
  let pending = [...specs];
  const accepted: { spec: SlotSpec; raw: any }[] = [];

  for (let attempt = 0; attempt < 3 && pending.length > 0; attempt++) {
    const prompt = buildPrompt(pending, batchIdx, usedEvents);
    let arr: any[] | null = null;
    try {
      const text = await callLLM(prompt);
      arr = extractJsonArray(text);
    } catch (err) {
      console.error(`  [batch ${batchIdx}] API error (attempt ${attempt + 1}): ${(err as Error).message}`);
      await sleep(2000 * (attempt + 1));
      continue;
    }
    if (!arr) {
      console.error(`  [batch ${batchIdx}] no JSON array parsed (attempt ${attempt + 1})`);
      continue;
    }

    const byIndex = new Map<number, any>();
    for (const item of arr) {
      if (item && typeof item.i === "number") byIndex.set(item.i, item);
    }

    const stillPending: SlotSpec[] = [];
    for (const spec of pending) {
      const raw = byIndex.get(spec.i);
      const v = raw ? validateItem(raw, spec) : { ok: false as const, reason: "missing item" };
      if (v.ok) {
        accepted.push({ spec, raw });
      } else {
        stillPending.push(spec);
      }
    }
    pending = stillPending;
    if (pending.length > 0 && attempt < 2) {
      console.error(`  [batch ${batchIdx}] retrying ${pending.length} invalid/missing slots`);
    }
  }

  if (pending.length > 0) {
    console.error(`  [batch ${batchIdx}] WARNING: ${pending.length} slots unfilled after retries`);
  }
  return accepted;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function runPool<T>(items: T[], concurrency: number, worker: (item: T, idx: number) => Promise<void>) {
  let cursor = 0;
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const idx = cursor++;
      await worker(items[idx], idx);
    }
  });
  await Promise.all(runners);
}

function stagingPath(idx: number): string {
  return path.join(STAGING_DIR, `puzzles-batch-${String(idx).padStart(3, "0")}.json`);
}

async function backfill(limitBatches?: number) {
  if (BACKEND !== "cli" && !process.env.OPENROUTER_API_KEY) {
    console.error("Error: OPENROUTER_API_KEY not set.");
    process.exit(1);
  }
  console.log(`Using model: ${MODEL} via ${BACKEND === "cli" ? "Claude CLI (subscription)" : "OpenRouter"}`);
  fs.mkdirSync(STAGING_DIR, { recursive: true });

  const existing = loadPuzzles();
  const covered = new Set(existing.map((p) => `${p.date}#${p.slot}`));

  const dates = allDatesInRange();
  const missingByDate: { date: string; specs: Omit<SlotSpec, "i">[] }[] = [];
  for (const date of dates) {
    const day = dayOfWeek(date);
    const specs: Omit<SlotSpec, "i">[] = [];
    for (const slot of SLOTS) {
      if (!covered.has(`${date}#${slot}`)) {
        specs.push({ date, day, slot, cluesNeeded: CLUES_NEEDED[day] });
      }
    }
    if (specs.length > 0) missingByDate.push({ date, specs });
  }

  const totalMissing = missingByDate.reduce((n, d) => n + d.specs.length, 0);
  console.log(`Range ${RANGE_START} -> ${RANGE_END}: ${dates.length} days`);
  console.log(`Existing puzzles: ${existing.length}; missing slots to generate: ${totalMissing}`);

  const batches: { idx: number; specs: SlotSpec[] }[] = [];
  for (let i = 0; i < missingByDate.length; i += DAYS_PER_BATCH) {
    const group = missingByDate.slice(i, i + DAYS_PER_BATCH);
    let localI = 0;
    const specs: SlotSpec[] = [];
    for (const d of group) {
      for (const s of d.specs) {
        specs.push({ ...s, i: localI++ });
      }
    }
    batches.push({ idx: batches.length, specs });
  }

  let batchList = batches;
  if (limitBatches && limitBatches > 0) batchList = batches.slice(0, limitBatches);

  // skip batches whose staging file already exists (resumable)
  const toRun = batchList.filter((b) => !fs.existsSync(stagingPath(b.idx)));
  console.log(
    `Total batches: ${batchList.length}; already staged: ${batchList.length - toRun.length}; to run: ${toRun.length}`
  );

  const usedEvents: string[] = existing.map((p) => p.event);
  let completed = 0;

  await runPool(toRun, CONCURRENCY, async (batch) => {
    const accepted = await generateBatch(batch.specs, batch.idx, usedEvents);
    const payload = accepted.map(({ spec, raw }) => ({ spec, raw }));
    fs.writeFileSync(stagingPath(batch.idx), JSON.stringify(payload, null, 2));
    for (const { raw } of accepted) usedEvents.push(String(raw.event));
    completed++;
    console.log(
      `  ✓ batch ${batch.idx}: ${accepted.length}/${batch.specs.length} slots (${completed}/${toRun.length} batches done)`
    );
  });

  console.log(`\nGeneration done. Staging files in ${STAGING_DIR}. Run \`merge\` to assemble puzzles.json.`);
}

// ---------- merge ----------

function merge() {
  const existing = loadPuzzles();
  const covered = new Set(existing.map((p) => `${p.date}#${p.slot}`));

  const files = fs
    .readdirSync(STAGING_DIR)
    .filter((f) => /^puzzles-batch-\d+\.json$/.test(f))
    .sort();

  const staged: { spec: SlotSpec; raw: any }[] = [];
  const seen = new Set<string>();
  for (const f of files) {
    const arr = JSON.parse(fs.readFileSync(path.join(STAGING_DIR, f), "utf-8"));
    for (const item of arr) {
      const key = `${item.spec.date}#${item.spec.slot}`;
      if (covered.has(key) || seen.has(key)) continue;
      seen.add(key);
      staged.push(item);
    }
  }

  staged.sort((a, b) =>
    a.spec.date === b.spec.date ? a.spec.slot - b.spec.slot : a.spec.date < b.spec.date ? -1 : 1
  );

  let nextId = existing.reduce((m, p) => Math.max(m, p.id), 0) + 1;
  const newPuzzles: Puzzle[] = [];
  const imageSources: Record<number, { commonsUrl: string; attribution: string }> = {};

  for (const { spec, raw } of staged) {
    const v = validateItem(raw, spec);
    if (!v.ok) {
      console.error(`  skipping ${spec.date}#${spec.slot}: ${v.reason}`);
      continue;
    }
    const id = nextId++;
    newPuzzles.push(assemble(raw, spec, id));
    const sug: ImageSuggestion | undefined = raw.image_suggestion;
    const fname = sug?.commons_filename || `File:${String(raw.event).replace(/\s+/g, "_")}.jpg`;
    const cleanName = fname.startsWith("File:") ? fname.slice(5) : fname;
    imageSources[id] = {
      commonsUrl: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(cleanName)}`,
      attribution: sug?.attribution || "Wikimedia Commons",
    };
  }

  const all = [...existing, ...newPuzzles];
  fs.writeFileSync(PUZZLES_PATH, JSON.stringify({ puzzles: all }, null, 2));
  fs.writeFileSync(IMAGE_SOURCES_PATH, JSON.stringify(imageSources, null, 2));

  console.log(`Merged: ${existing.length} existing + ${newPuzzles.length} new = ${all.length} total`);
  console.log(`Image sources written: ${Object.keys(imageSources).length} -> ${IMAGE_SOURCES_PATH}`);

  // integrity report
  const keys = new Set<string>();
  let dups = 0;
  for (const p of all) {
    const k = `${p.date}#${p.slot}`;
    if (keys.has(k)) dups++;
    keys.add(k);
  }
  const sortedDates = all.map((p) => p.date).sort();
  console.log(`Date range: ${sortedDates[0]} -> ${sortedDates[sortedDates.length - 1]}`);
  console.log(`Duplicate (date,slot) pairs: ${dups}`);
}

// ---------- stats ----------

function showStats() {
  const puzzles = loadPuzzles();
  console.log(`\nTotal puzzles: ${puzzles.length}`);
  const years = puzzles.map((p) => p.year).sort((a, b) => a - b);
  console.log(`Year range: ${years[0]} - ${years[years.length - 1]}`);
  const tiers: Record<number, number> = {};
  for (const p of puzzles) tiers[p.tier] = (tiers[p.tier] || 0) + 1;
  console.log("Tiers:", tiers);
  const dates = puzzles.map((p) => p.date).sort();
  console.log(`Date range: ${dates[0]} -> ${dates[dates.length - 1]}`);
}

// ---------- CLI ----------

const args = process.argv.slice(2);
const command = args[0];

const fromIdx = args.indexOf("--from");
if (fromIdx >= 0) RANGE_START = args[fromIdx + 1];
const toIdx = args.indexOf("--to");
if (toIdx >= 0) RANGE_END = args[toIdx + 1];
if (!/^\d{4}-\d{2}-\d{2}$/.test(RANGE_START) || !/^\d{4}-\d{2}-\d{2}$/.test(RANGE_END)) {
  console.error("Error: --from/--to must be YYYY-MM-DD");
  process.exit(1);
}

if (command === "stats") {
  showStats();
} else if (command === "backfill") {
  const li = args.indexOf("--limit");
  const limit = li >= 0 ? parseInt(args[li + 1], 10) : undefined;
  backfill(limit);
} else if (command === "merge") {
  merge();
} else {
  console.log("Usage:");
  console.log("  npx tsx scripts/generate-puzzles.ts backfill [--limit N] [--from YYYY-MM-DD --to YYYY-MM-DD]");
  console.log("  npx tsx scripts/generate-puzzles.ts merge");
  console.log("  npx tsx scripts/generate-puzzles.ts stats");
}
