/**
 * rebuild-schedule-csv.mjs
 * Generates games-schedule.csv from puzzles.json as the 90-row editorial bible.
 * One row per puzzle (3 per day). Clues extracted from the day-specific clue array.
 * Run: node scripts/rebuild-schedule-csv.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const data = JSON.parse(readFileSync(join(root, 'data/puzzles.json'), 'utf-8'));

const DAY_NAMES = {
  monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
  thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday',
};

function getClues(puzzle) {
  const day = puzzle.day_of_week;
  const arr = puzzle.clues?.[day] ?? [];
  return [arr[0] ?? '', arr[1] ?? ''];
}

function esc(s) {
  return `"${String(s ?? '').replace(/"/g, '""')}"`;
}

const header = [
  'Puzzle #', 'Date', 'Day', 'Slot',
  'Event', 'Year', 'Difficulty', 'Tier',
  'Headline', 'Clue 1', 'Clue 2', 'Context Card'
].join(',');

const rows = data.puzzles.map((p, i) => {
  const [clue1, clue2] = getClues(p);
  return [
    i + 1,
    p.date,
    DAY_NAMES[p.day_of_week] ?? p.day_of_week,
    p.slot,
    esc(p.event),
    p.year,
    p.difficulty_rating,
    p.tier,
    esc(p.headline),
    esc(clue1),
    esc(clue2),
    esc(p.context_card),
  ].join(',');
});

const csv = [header, ...rows].join('\n') + '\n';
const outPath = join(root, 'scripts/games-schedule.csv');
writeFileSync(outPath, csv, 'utf-8');
console.log(`Written ${data.puzzles.length} puzzles to games-schedule.csv`);
