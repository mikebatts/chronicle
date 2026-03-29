# Chronicle — Build Instructions

**Project:** Chronicle — a daily history guessing game  
**Repo:** romulus-silvius/chronicle  
**Discord channel:** #chronicle  
**Build with:** Claude Code (opus preferred for architecture)  
**Tech:** Next.js (App Router) + Tailwind CSS, static generation, localStorage only

---

## WHAT CHRONICLE IS

One historical event per day. One image. Guess the year in 3 attempts.

**Core mechanic:**
- Year input field (text input, not a slider — committed guess)
- Attempt 1: Image + headline only (cold)
- Wrong guess → "Too early" or "Too late" feedback
- Attempt 2: First contextual clue appears
- Attempt 3: Second clue (more specific)
- Correct guess OR attempts exhausted → show result + share card

**Difficulty (Mon–Sun baked into puzzle data):**
- Monday: Warm clues
- Tue/Wed: Breadcrumb clues
- Thu/Fri: Tighter clues
- Saturday: One oblique clue
- Sunday: NO CLUES — pure knowledge

---

## THE SHARE CARD — LOCKED DESIGN

This is the most important feature. The share text is pre-approved. Do not change it.

**Win (3 attempts used):**
```
Chronicle #[number] 📜 🔥[streak]
🔴→🟡→✅
thischronicle.com
```

**Win (first try):**
```
Chronicle #[number] 📜 🔥[streak]
✅ ⬜ ⬜
thischronicle.com
```

**Fail (lost):**
```
Chronicle #[number] 📜 💔
🔴→🟠→🟡
thischronicle.com
```

**The emoji key:**
- ✅ = exact year
- 🟢 = within 5 years
- 🟡 = within 15 years
- 🟠 = within 30 years
- 🔴 = 30+ years off
- ⬜ = attempt not used

**Rules:**
- Never reveal the year in fail share (preserves mystery for friends who haven't played)
- The URL in share text is `thischronicle.com`
- The 📜 scroll emoji is the Chronicle signature

---

## SCORING

Score is a smooth curve based on distance from correct year:

```
distance = |guess_year - correct_year|

if distance === 0: score = 1000
elif distance <= 5: score = 950
elif distance <= 10: score = 900
elif distance <= 15: score = 800
elif distance <= 20: score = 700
elif distance <= 25: score = 600
elif distance <= 30: score = 500
elif distance <= 40: score = 400
elif distance <= 50: score = 300
elif distance <= 75: score = 200
else: score = 100
```

---

## PUZZLE DATA SCHEMA

Every puzzle is in `/data/puzzles.json`. The puzzle for today is resolved by matching `puzzle.date === today's date (YYYY-MM-DD)`.

```typescript
interface Puzzle {
  id: number;
  date: string;              // YYYY-MM-DD format
  day_of_week: string;        // 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
  event: string;              // Short display name
  event_formal: string;       // Formal name for context card
  year: number;               // The answer (1900-2025)
  image: string;              // /images/puzzles/XXX.webp
  image_attribution: string;  // e.g. "Wikimedia Commons / Bundesarchiv"
  image_source_url: string;   // Link to source
  headline: string;           // One-line hook, no year mentioned
  tier: 1 | 2 | 3;           // Content tier
  difficulty_rating: number;  // 1-10
  clues: {
    monday: [string, string];
    tuesday: [string, string];
    wednesday: [string, string];
    thursday: string;
    friday: string;
    saturday: string;
  };
  context_card: string;       // 2-3 sentences, engaging, no year in first sentence
}
```

**Note:** Sunday puzzles have NO clues in the `clues` object. The `clues.sunday` field should be `null` or omitted.

---

## STATS — EXACT WORDLE FORMAT

Stats modal shows:

```
Played: [N]
Win %: [X]

Current Streak: [N] 🔥
Max Streak: [N]

Avg Distance: [N] yrs  ← Chronicle-specific

Guess Distribution:
1 ██████ 14%
2 ████████████ 52%
3 ███████ 31%
✗ ██ 3%
```

**localStorage key:** `chronicle_state`

```typescript
interface GameState {
  played: number;
  wins: number;
  losses: number;
  current_streak: number;
  max_streak: number;
  total_distance: number;   // Sum of |guess - year| for all wins
  wins_with_distance: number;
  guess_distribution: {
    "1": number;
    "2": number;
    "3": number;
  };
  last_played: string;      // YYYY-MM-DD
  last_result: 'win' | 'loss';
  last_guess_count: number;
  last_distance: number;
}
```

---

## GAME STATE MACHINE

```
IDLE → GUESS_1 → (correct? → WIN) or (wrong? → CLUE_1 → GUESS_2)
                                            → (correct? → WIN) or (wrong? → CLUE_2 → GUESS_3)
                                                                      → (correct? → WIN) or (wrong? → LOSS)
```

After WIN or LOSS: show result screen with score, context card, share button.

---

## COMPONENT ARCHITECTURE

### `app/page.tsx`
Main game page. Reads today's puzzle from puzzles.json (client-side date resolution). Renders Game component.

### `components/Game.tsx`
Core game logic. Manages:
- Current attempt (1, 2, or 3)
- Guesses array
- Game phase (playing | won | lost)
- Score calculation
- Share card trigger

### `components/YearInput.tsx`
Text input for year entry. Accepts 1900-2025 only. On Enter or Submit: validates → records guess → updates game state.

### `components/ClueReveal.tsx`
Shows clues progressively:
- Before guess 1: no clues shown
- After guess 1 wrong: show clues[0]
- After guess 2 wrong: show clues[0] + clues[1]

Reads difficulty from puzzle.day_of_week.

### `components/PuzzleDisplay.tsx`
Shows:
- Event image (responsive, max 500px wide)
- Event headline
- Attempt counter ("Attempt 2 of 3")

### `components/ResultScreen.tsx`
Shown after win or loss. Displays:
- "Nailed it" / "The year was [YEAR]" message
- Score
- Context card (2-3 sentence historical tidbit)
- Share button (triggers share card generation)
- "Play Again Tomorrow" / back to game

### `components/ShareCard.tsx`
Renders the shareable result. Two outputs:
1. **Plain text** (for copy/paste): Uses locked share text format above
2. **Canvas image** (for download/post): Rendered card with Chronicle branding

The canvas share card should be:
- 1200x630px (optimal for Twitter/OG)
- Dark background (#1a1a2e), Chronicle branding
- Event name + year revealed
- Emoji trail showing guesses
- Score
- URL: thischronicle.com

### `components/StatsModal.tsx`
Shows the stats modal (can be triggered from game or result screen).

### `components/Header.tsx`
Minimal header: "Chronicle" wordmark + stats button (grid icon).

---

## TECHNICAL REQUIREMENTS

### Static puzzle loading
```typescript
// lib/puzzles.ts
import puzzlesData from '@/data/puzzles.json';

export function getTodayPuzzle(): Puzzle {
  const today = new Date().toISOString().split('T')[0];
  const puzzle = puzzlesData.puzzles.find(p => p.date === today);
  if (!puzzle) {
    throw new Error(`No puzzle found for today: ${today}`);
  }
  return puzzle;
}

export function getPuzzleByDate(date: string): Puzzle | undefined {
  return puzzlesData.puzzles.find(p => p.date === date);
}
```

### localStorage persistence
```typescript
// lib/storage.ts
const STORAGE_KEY = 'chronicle_state';

export function loadState(): GameState { ... }
export function saveState(state: GameState): void { ... }
```

On app load: check if last_played === today → resume or fresh game.

### Share text generation
```typescript
// lib/share.ts
export function generateShareText(
  puzzleNumber: number,
  guesses: number[],      // [1, 3] = first guess wrong, third correct
  isWin: boolean,
  streak: number
): string {
  // Use locked format above
}
```

### Difficulty-based clue retrieval
```typescript
function getCluesForAttempt(puzzle: Puzzle, attempt: number): string[] {
  const day = puzzle.day_of_week;
  const clueMap = puzzle.clues;
  
  if (attempt === 1) return []; // No clues yet
  if (attempt === 2) {
    // Show first clue based on day
    if (day === 'sunday') return []; // Sunday = no clues ever
    if (['monday', 'tuesday', 'wednesday'].includes(day)) return [clueMap[day][0]];
    if (['thursday', 'friday', 'saturday'].includes(day)) return [clueMap[day]];
  }
  if (attempt === 3) {
    // Show all available clues
    if (day === 'sunday') return [];
    if (day === 'thursday' || day === 'friday' || day === 'saturday') return [clueMap[day]];
    return clueMap[day]; // Both clues for mon/tue/wed
  }
  return [];
}
```

---

## SEED DATA

Start with 30 hand-crafted puzzles in `/data/puzzles.json`. Diverse set:
- Spanning 1920–2020
- Mix of geographies (US, Europe, Asia)
- Mix of domains (politics, science, culture, sports, art)
- Difficulty distribution: ~5 Monday-easy, ~5 Sunday-hard, rest mid-week

Include at least 1 Sunday puzzle (no clues) to test Sunday mode.

---

## DESIGN SYSTEM

**Colors:**
- Background: `#0f0f1a` (deep navy)
- Card surface: `#1a1a2e` (elevated surface)
- Primary text: `#f5f5f5`
- Secondary text: `#a0a0b0`
- Accent: `#e8c547` (gold — for streaks, wins)
- Correct/close: `#4ade80` (green)
- Warm: `#fbbf24` (yellow)
- Cold: `#f87171` (red)
- Input border: `#3a3a5e`

**Typography:**
- Font: Inter (Google Fonts)
- Headlines: 600 weight
- Body: 400 weight
- Monospace numbers: Tabular nums for stats

**Spacing:** 4px base unit. Standard padding: 16px, 24px, 32px.

**Mobile-first:** Game works at 320px wide minimum. Share card renders correctly at mobile sizes.

---

## PERFORMANCE REQUIREMENTS

- First Contentful Paint: <1.5s
- No layout shift on puzzle load
- localStorage reads/writes are synchronous and fast
- Images are WebP, max 200KB
- Zero external API calls during gameplay (all data is local)

---

## TESTING CHECKLIST

Before calling Phase 1 complete:

- [ ] Can complete a full game (guess → feedback → result)
- [ ] Clues reveal at correct times (attempt 2 and 3)
- [ ] Sunday mode shows no clues
- [ ] Stats persist after page refresh
- [ ] Share text matches locked format exactly
- [ ] Share card canvas renders correctly (1200x630, readable)
- [ ] localStorage handles fresh start (no prior state)
- [ ] localStorage handles resuming today's puzzle
- [ ] Mobile layout is clean at 375px (iPhone SE)
- [ ] All 30 seed puzzles have valid data (no missing fields)

---

## NOT IN PHASE 1

These come in later phases. Do NOT build:

- Crews / social groups
- User accounts
- Archive mode (past puzzles)
- Email notifications
- Analytics (Plausible.io)
- Second vertical (Cinema mode)

---

## WORKING WITH MIKE

- Mike is the product designer. He owns design decisions.
- You own engineering implementation.
- Check in with progress updates in #chronicle on Discord.
- When in doubt on design/UX: ask Mike, don't guess.
- Do not commit to timelines without flagging complexity.

---

*Build the core loop tight. Everything else can wait.*
