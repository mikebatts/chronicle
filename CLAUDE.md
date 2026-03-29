# Chronicle — Build Instructions for Claude Code

**Project:** Chronicle — a daily history guessing game  
**Repo:** romulus-silvius/chronicle  
**Discord channel:** #chronicle  
**Domain:** thischronicle.com (secured, $10/yr)  
**Built with:** Claude Code (opus preferred for architecture)  
**Tech:** Next.js (App Router) + Tailwind CSS, static generation, localStorage only  
**Status:** Spec locked, scaffold done, ready for Phase 1 build

---

## WHAT CHRONICLE IS

One historical event per day. One image. Guess the year in 3 attempts.

This is the product vision from Mike and Romulus (March 29, 2026):

**The insight:** NYT Games has Wordle, Connections, Spelling Bee, Strands — but no history game. Chronicle fills that gap. The share mechanic is proven (Wordle), the market is validated (NYT's games division is a $9B business), and nobody has built the editorial + social layer correctly yet.

**The goal:** Acquisition by NYT Games. Built clean from day one, with retention metrics that matter (D7/D30/D90), editorial quality that signals acquirability, and zero paid features.

**The product name:** Chronicle — a real word with weight, sounds like it belongs in the NYT Games lineup.

---

## LOCKED DESIGN DECISIONS

These are DONE. Do not change them without explicit approval from Mike.

### The Share Card — Pre-Approved Format

**Win (3 attempts used):**
```
Chronicle #47 📜 🔥12
🔴→🟡→✅
thischronicle.com
```

**Win (first try — special format):**
```
Chronicle #47 📜 🔥12
✅ ⬜ ⬜
thischronicle.com
```

**Fail (lost):**
```
Chronicle #47 📜 💔
🔴→🟠→🟡
thischronicle.com
```

**Emoji key:**
- ✅ = exact year
- 🟢 = within 5 years
- 🟡 = within 15 years
- 🟠 = within 30 years
- 🔴 = 30+ years off
- ⬜ = attempt not used (for first-try wins)

**Critical rule:** Never reveal the year in fail share. Preserves the mystery for friends who haven't played yet — they want to guess themselves.

### The Stats Modal — Wordle Format + Chronicle Twist

```
Played: 47
Win %: 83

Current Streak: 12 🔥
Max Streak: 19

Avg Distance: 11 yrs  ← Chronicle-specific stat

Guess Distribution:
1 ██████ 14%
2 ████████████ 52%
3 ███████ 31%
✗ ██ 3%
```

**Avg Distance** is Chronicle's identity stat. Average years off across all wins. People compete on this.

### Difficulty Arc (Mon–Sun)

Baked into each puzzle's data. The clue tightness changes by day:

| Day | Clues | Tightness |
|-----|-------|-----------|
| Monday | 2 | Warm, guiding |
| Tuesday | 2 | Breadcrumb |
| Wednesday | 2 | Progressively tighter |
| Thursday | 1 | Tight |
| Friday | 1 | Tight |
| Saturday | 1 | Oblique, almost poetic |
| Sunday | 0 | NO CLUES — prestige mode |

### Scoring

Smooth curve based on distance from correct year:

```typescript
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

## THE GAME MECHANIC

### Core Loop

```
IDLE → GUESS_1 → (correct? → WIN) or (wrong? → CLUE_1 → GUESS_2)
                                            → (correct? → WIN) or (wrong? → CLUE_2 → GUESS_3)
                                                                      → (correct? → WIN) or (wrong? → LOSS)
```

After WIN or LOSS: show result screen with score, context card, share button.

### Directional Feedback

After each wrong guess, tell the player whether they guessed too early or too late. Narrows the window, creates strategy.

### Clue Reveal Logic

```typescript
function getCluesForAttempt(puzzle: Puzzle, attempt: number, wrongGuesses: number): string[] {
  const day = puzzle.day_of_week;
  
  // Sunday = no clues ever
  if (day === 'sunday') return [];
  
  // Get the clue set for this day
  const dayClues = getCluesForDay(puzzle.clues, day);
  
  if (attempt === 1) return []; // No clues shown yet
  if (attempt === 2) {
    // Show first clue (index 0)
    return dayClues.length > 0 ? [dayClues[0]] : [];
  }
  if (attempt === 3) {
    // Show all available clues
    return dayClues;
  }
  return [];
}
```

---

## PUZZLE DATA SCHEMA

Every puzzle lives in `/data/puzzles.json`. Today's puzzle is resolved client-side by matching `puzzle.date === today's date (YYYY-MM-DD)`.

```typescript
interface Puzzle {
  id: number;
  date: string;              // YYYY-MM-DD format
  day_of_week: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
  event: string;              // Short display name
  event_formal: string;       // Formal name for context card
  year: number;               // The answer (1900-2025)
  image: string;              // /images/puzzles/XXX.webp
  image_attribution: string;   // e.g. "Wikimedia Commons / Bundesarchiv"
  image_source_url: string;   // Link to source on Wikimedia
  headline: string;           // One-line hook, NO year mentioned
  tier: 1 | 2 | 3;           // Content tier
  difficulty_rating: number;  // 1-10
  clues: {
    monday: [string, string];
    tuesday: [string, string];
    wednesday: [string, string];
    thursday: string;
    friday: string;
    saturday: string;
    // NOTE: sunday has NO clues — field is omitted or null
  };
  context_card: string;       // 2-3 sentences, editorial voice, no year in first sentence
}
```

**Sunday puzzles:** The `clues` object has no `sunday` key. The game detects this and shows no clues.

---

## LOCALSTORAGE SCHEMA

**Key:** `chronicle_state`

```typescript
interface GameState {
  played: number;
  wins: number;
  losses: number;
  current_streak: number;
  max_streak: number;
  total_distance: number;     // Sum of |guess - year| for all wins
  wins_with_distance: number; // Only wins (losses don't count)
  guess_distribution: {
    "1": number;
    "2": number;
    "3": number;
  };
  last_played: string;        // YYYY-MM-DD
  last_result: 'win' | 'loss';
  last_guess_count: number;
  last_distance: number;
}
```

**Avg Distance calculation:** `total_distance / wins_with_distance`

---

## COMPONENT ARCHITECTURE

### `app/page.tsx`
Main game page. Reads today's puzzle from puzzles.json (client-side date resolution). Renders Game component.

### `components/Game.tsx`
Core game logic. Manages:
- Current attempt (1, 2, or 3)
- Guesses array
- Game phase (playing | won | lost)
- Directional feedback logic
- Score calculation
- Share card trigger

### `components/YearInput.tsx`
Text input for year entry. Accepts 1900-2025 only. On Enter or Submit: validates → records guess → updates game state.

### `components/ClueReveal.tsx`
Shows clues progressively based on attempt number and day of week. Returns null for Sunday.

### `components/PuzzleDisplay.tsx`
Shows:
- Event image (responsive, max 500px wide)
- Event headline
- Attempt counter ("Attempt 2 of 3")

### `components/ResultScreen.tsx`
Shown after win or loss. Displays:
- "Nailed it!" / "The year was [YEAR]" message
- Score
- Context card (2-3 sentence historical tidbit)
- Share button (copy to clipboard)
- Stats summary

### `components/ShareCard.tsx`
Renders the shareable result. Two outputs:
1. **Plain text** (for copy/paste): Uses locked share text format above
2. **Canvas image** (for download/post): 1200x630px, dark background, Chronicle branding

The canvas share card:
- 1200x630px (optimal for Twitter/OG)
- Dark background (#1a1a2e)
- Event name + year revealed
- Emoji trail showing guesses
- Score + streak
- URL: thischronicle.com

### `components/Header.tsx`
Minimal header: "Chronicle" wordmark + stats button.

### `components/StatsModal.tsx`
Shows the full stats modal (triggered from game or result screen).

---

## TECHNICAL REQUIREMENTS

### Puzzle Resolution (client-side)
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
```

### localStorage Persistence
```typescript
// lib/storage.ts
const STORAGE_KEY = 'chronicle_state';

export function loadState(): GameState { ... }
export function saveState(state: GameState): void { ... }
```

On app load: check if `last_played === today` → resume in-progress game or fresh start.

### Share Text Generation
```typescript
// lib/share.ts
export function generateShareText(
  puzzleNumber: number,
  guesses: number[],
  correctYear: number,
  isWin: boolean,
  streak: number
): string {
  // Uses locked format. See LOCKED DESIGN DECISIONS above.
}
```

---

## SEED DATA

The repo currently has 30 seed puzzles as placeholders. These are NOT production-ready — the images are placeholder paths.

**For production launch:**
- Replace placeholder images with real Wikimedia Commons images
- Verify each puzzle's year + clues + context card
- Set real dates (currently April 7-May 6, 2026 as placeholder)

The puzzle generation script (`scripts/generate-puzzles.ts`) handles Phase 2 content creation.

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

**Mobile-first:** Game works at 320px wide minimum.

---

## NOT IN PHASE 1

These come later. Do NOT build:

- Crews / social groups
- User accounts
- Archive mode (past puzzles)
- Email notifications
- Analytics (Plausible.io — add later)
- Second vertical (Cinema mode)

---

## TESTING CHECKLIST

Before calling Phase 1 complete:

- [ ] Can complete a full game (guess → directional feedback → clue reveal → result)
- [ ] Clues reveal at correct times (attempt 2 and 3)
- [ ] Sunday mode shows no clues
- [ ] Directional feedback ("too early" / "too late") works after wrong guesses
- [ ] Stats persist after page refresh
- [ ] Share text matches locked format exactly
- [ ] Share card canvas renders correctly (1200x630, readable)
- [ ] localStorage handles fresh start (no prior state)
- [ ] localStorage handles resuming today's puzzle
- [ ] Mobile layout is clean at 375px (iPhone SE)
- [ ] All seed puzzles have valid data (no missing fields)

---

## WORKING WITH MIKE

- Mike is the product designer. He owns design decisions.
- You own engineering implementation.
- Check in with progress updates in #chronicle on Discord.
- When in doubt on design/UX: ask Mike, don't guess.
- Do not commit to timelines without flagging complexity.
- If a locked design decision needs to change, bring it to Mike explicitly.

---

## PUZZLE GENERATION PIPELINE (Phase 2)

The generation script is `scripts/generate-puzzles.ts`. It:
1. Calls Claude API with structured prompt
2. Outputs candidates to staging file
3. Human editor reviews against checklist
4. Approved puzzles added to `data/puzzles.json`

The prompt enforces:
- Year range: 1900-2025
- Year verifiable on Wikipedia
- Clues don't reveal the year
- Context card has editorial voice (not Wikipedia text)
- Difficulty appropriate for the day

**The human editor is the accuracy layer.** AI generates fast, humans catch errors. No puzzle goes live without review.

---

## THE ACQUISITION ANGLE

If we're building this to be acquired, specific decisions matter:

**Clean code from day one.** Every NYT game acquisition has needed partial rebuilds due to messy code. Ours should be clean Next.js with proper TypeScript and analytics from day one.

**Retention metrics obsession.** NYT cares about D7, D30, D90. Design features that serve those metrics:
- Streaks → D7
- Crews → D30
- Monthly recap → D90

**Editorial quality signals.** Write content with voice and quality. A well-curated archive of daily events with thoughtful context notes is an asset, not just data.

**Geography breadth.** NYT has global subscribers. Content that skews US-only limits acquisition value. Mix of US, Europe, and globally significant events.

**No paid tier.** NYT can't acquire something with a paid tier they'd have to kill. Free forever signals the right model.

**域名 matters.** thischronicle.com is the right domain — .com, sounds like a NYT product.

---

*Build the core loop tight. The editorial layer is the moat. The NYT is the exit.*
