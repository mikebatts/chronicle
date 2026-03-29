# Chronicle — Product & Technical Specification

**Status:** Planning complete, ready for build  
**Last updated:** March 29, 2026  
**Domain:** thischronicle.com (secured)  
**Discord channel:** #chronicle

---

## PRODUCT RECAP

**What it is:** A daily history guessing game. One historical event per day. One image. Guess the year in 3 attempts.

**Core mechanic:**
- Year input field (not a slider) — committed guess, higher stakes
- Attempt 1: Image + headline only (cold)
- Attempt 2: One contextual clue appears
- Attempt 3: Second clue, more specific
- "Too early" / "Too late" directional feedback after each wrong guess
- Scoring: smooth curve (10yr off = 900pts, 25yr off = 700pts, 50yr off = 400pts)

**Difficulty arc (Mon–Sun):**
- Monday: Warm, guiding clues
- Tue/Wed: Breadcrumb clues
- Thu/Fri: Tighter, more cryptic
- Saturday: One oblique clue
- Sunday: NO CLUES — pure knowledge, prestige badge

**The share card IS the product:**
```
Chronicle #47 📜 🔥12
🔴→🟡→✅
thischronicle.com
```

**Fail share:**
```
Chronicle #47 📜 💔
🔴→🟠→🟡
thischronicle.com
```

No year reveal on fail — preserves the mystery for friends who haven't played yet.

**Stats modal (mirrors Wordle):**
- Played, Win %, Current Streak, Max Streak
- **Chronicle-specific:** Avg Distance (average years off across all wins)
- Guess distribution bar chart

**Social layer:** Crews (private groups of 10-30, weekly standings)

**Monetization:** Free forever. No ads. Optional Ko-fi tip jar for superfans.

**Acquisition target:** NYT Games. Clean code, D7/D30/D90 retention metrics, editorial quality.

---

## TECH STACK

**Frontend:** Next.js (App Router) + Tailwind CSS  
**Hosting:** Vercel (free tier, auto-scales)  
**Game state:** localStorage only (no backend for V1)  
**Analytics:** Plausible.io ($9/mo) — privacy-first, shows DAU + retention  
**Domain:** thischronicle.com  

**Static generation model:** Puzzle content lives as a JSON file committed to the repo. Each day's puzzle is pre-rendered at build time. Zero server-side rendering overhead. Zero database cost. This is exactly how Wordle worked pre-acquisition.

---

## PUZZLE GENERATION — THE CORE MOAT

### Content tiers

**Tier 1 — Universally known era, surprising specifics (most daily puzzles)**
Easy to get in the right decade, hard to nail the exact year.
Example: "The Berlin Wall falls" → Cold War era, but was it '88, '89, or '90?

**Tier 2 — Obscure but fascinating (1-2x per week)**
Genuinely surprising facts. "The first iPhone prototype was shown internally at Apple — but when?"
Creates the "I had no idea" moment that drives word-of-mouth.

**Tier 3 — Anchor events (rare, date-specific)**
Run on actual anniversary dates. Moon landing → July 20th. MLK speech → August 28th.
Creates "today in history" resonance and press hook potential.

### Clue writing methodology

The clue is the editorial craft. Each clue must:
- Narrow the window without giving it away
- Be historically accurate and interesting on its own
- Match the day's difficulty level

**Clue tightness by day:**

| Day | Clue 1 | Clue 2 |
|-----|--------|--------|
| Monday | Broad context ("during a U.S. presidential election year") | Warm guidance ("the Cold War was ending") |
| Tuesday | Economic context | Cultural milestone |
| Wednesday | geopolitical framing | Specific decade signal |
| Thursday | Tight single clue | — |
| Friday | Tight single clue | — |
| Saturday | Oblique, almost poetic ("the world was watching something else that day") | — |
| Sunday | NO CLUES | NO CLUES |

### AI-assisted content generation pipeline

**Phase 1 (V1 launch):** Hand-curated seed set of 100 puzzles covering diverse eras, geographies, domains (politics, science, culture, sports, art). This establishes quality baseline and editorial voice.

**Phase 2 (Scaling to 365):** Use AI to generate candidates, human editor reviews and refines.

**Prompt structure for AI candidate generation:**
```
Generate a historically significant event with the following fields:
- event_name: formal name of the event
- year: exact year (must be verifiable)
- image_description: described for Wikimedia Commons search (e.g., "1969 moon landing NASA astronaut on lunar surface")
- clue_monday_1: broad contextual clue
- clue_monday_2: guiding clue
- clue_tuesday_1, clue_tuesday_2: progressively tighter
- [repeat for each day]
- context_card: 2-3 sentence engaging context about why this year mattered (written like a good tweet from a history professor)
- tier: 1, 2, or 3
- difficulty_rating: 1-10 (how hard to guess the exact year)

Rules:
- Year must be between 1900-2025
- Event must have a verifiable Wikipedia page
- Clues must not directly reveal the year
- Clues must be historically accurate and interesting on their own
- Do not generate events that are extremely famous (moon landing = tier 3 only)
```

**Human editor review checklist:**
- [ ] Year is correct and verifiable
- [ ] Image exists on Wikimedia Commons (public domain)
- [ ] Clues don't give away the answer
- [ ] Clues are historically accurate
- [ ] Context card is engaging, not just Wikipedia text
- [ ] Difficulty rating is appropriate for the day

### Editorial calendar

Build 90-day rolling calendar before launch. Ensures:
- No clashing with major real-world events
- Diverse era/geography distribution
- Tier 2 puzzles spaced 1-2x per week
- Tier 3 anchors on actual anniversary dates

---

## IMAGE SOURCING & MATCHING

### Source: Wikimedia Commons

All images from Wikimedia Commons. Public domain, zero licensing risk, permanent URLs, no hotlink protection issues.

**Image requirements:**
- Public domain (license tags: PD, CC0, CC-BY, CC-BY-SA with low complexity)
- Minimum 1200px wide (crisp on retina)
- High contrast (readable as small thumbnail)
- Unambiguous — clearly depicts the event

**Search strategy:**
1. Wikipedia event page → "Media" section → almost always has the iconic image
2. Wikimedia Commons search by event name + year
3. Direct search: `site:commons.wikimedia.org [event name] [year]`

**Image pipeline:**
1. Editor selects image during puzzle curation
2. Download + optimize (WebP, 1200px wide, <200KB)
3. Store in `/public/images/puzzles/` with puzzle ID as filename
4. Wikimedia attribution added to context card (required by most licenses)

**Fallback:** If no good Wikimedia image exists, use a well-known public domain photograph from a verified museum collection (National Archives, Getty Open, Smithsonian Open Access).

### Image verification checklist

- [ ] Image is public domain or CC-licensed
- [ ] Wikimedia attribution noted for context card
- [ ] Image is unambiguous — someone who doesn't know the event can identify it depicts the right thing
- [ ] Image doesn't reveal the year in text/date watermark
- [ ] Image is 1200px+, compresses to <200KB WebP

---

## ACCURACY VALIDATION

### Year accuracy

Every puzzle year must be verified against a primary source.

**Verification priority:**
1. Wikipedia (most events have accurate year)
2. Primary source documents (official records, archives)
3. Academic consensus

**Red flags:**
- Events with disputed dates (flag for editor review)
- Events that spanned multiple years (specify which year is the puzzle year)
- BC/BCE dates (avoid for V1, too complex)

### Clue accuracy

Each clue must be independently fact-checkable. If a clue references a specific person, event, or timeframe — that reference must be accurate.

**Editor review:** Every clue reviewed by human editor before inclusion. Editor has history background or access to a fact-check resource.

### Context card accuracy

Context cards are editorial, not just factual. They tell a story. But the facts within must be accurate.

**Style guide for context cards:**
- Write like a smart friend who loves history, not a textbook
- 2-3 sentences, ~80 words max
- One surprising detail that reframes how you see the event
- No date/year in the first sentence (save the reveal)
- Example: "The Dow didn't just drop — it erased three years of gains in a single afternoon. Banks were hemorrhaging cash, and the Fed's emergency rate cuts couldn't stop the bleeding. Investors were so spooked that some stopped answering their phones."

---

## DATA SCHEMA

### Puzzle JSON (`/data/puzzles.json`)

```json
{
  "puzzles": [
    {
      "id": 1,
      "date": "2026-04-07",
      "day_of_week": "tuesday",
      "event": "The Berlin Wall Falls",
      "event_formal": "Fall of the Berlin Wall",
      "year": 1989,
      "image": "/images/puzzles/001.webp",
      "image_attribution": " Wikimedia Commons / Bundesarchiv",
      "image_source_url": "https://commons.wikimedia.org/wiki/File:BerlinWall-BrandenburgGate.jpg",
      "headline": "A wall that divided a city for 28 years finally comes down",
      "tier": 1,
      "difficulty_rating": 4,
      "clues": {
        "monday": [
          "This happened during the final chapter of a decades-long geopolitical standoff.",
          "The leader of the Soviet Union had recently introduced sweeping reforms."
        ],
        "tuesday": [
          "This occurred in a year of significant economic upheaval.",
          "A cultural milestone in this same year changed music forever."
        ],
        "wednesday": [
          "This was a major geopolitical event in the latter half of the 20th century.",
          "The year saw significant changes in European governance."
        ],
        "thursday": "This occurred in the second half of the 20th century.",
        "friday": "A major Cold War milestone fell in this year.",
        "saturday": "The world was watching something else unfold that day."
      },
      "context_card": "For 28 years, Checkpoint Charlie was the defining symbol of the Cold War. On November 9th, 1989, a confused bureaucrat announced that East Germans could cross freely — and thousands flooded through. No one had planned the announcement. The wall fell because the system was already crumbling.",
      "reveal_year": 1989
    }
  ]
}
```

### localStorage schema (game state)

```json
{
  "chronicle_state": {
    "played": 47,
    "wins": 39,
    "losses": 8,
    "current_streak": 12,
    "max_streak": 19,
    "total_distance": 287,
    "wins_with_distance": 39,
    "guess_distribution": {
      "1": 6,
      "2": 20,
      "3": 13
    },
    "last_played": "2026-03-28",
    "last_result": "win",
    "last_guess_count": 2,
    "last_distance": 8
  }
}
```

### Puzzle of the day resolution (client-side)

```javascript
// Today's puzzle = puzzle where puzzle.date === today's date (YYYY-MM-DD)
// This runs entirely client-side — no API call needed
const today = new Date().toISOString().split('T')[0];
const todaysPuzzle = puzzles.find(p => p.date === today);
```

---

## BUILD ROADMAP

### Phase 1 — Core loop (Week 1-2)

**In scope:**
- Next.js app scaffold with Tailwind
- Puzzle JSON with 90-day curated set
- Year input with 3-attempt logic
- Directional feedback ("too early" / "too late")
- Clue reveal system (progressive)
- Scoring engine
- Share card (emoji text + canvas image export)
- Stats modal
- localStorage persistence
- Mobile-first responsive design
- Daily puzzle scheduler (date-based resolution)

**Not in scope:** Crews, accounts, archive, analytics

### Phase 2 — Social + retention (Week 3-4)

- Streak system with notification prompt
- Crew feature (invite link → private group → weekly leaderboard)
- Email notification for daily puzzle (Remix Email or Resend)
- Share card canvas rendering + download

### Phase 3 — Polish + launch (Week 5-6)

- 365-puzzle archive (past puzzles accessible by date)
- Plausible.io analytics integration
- Press outreach template
- Product Hunt launch
- Reddit community postings (r/movies for Cinema vertical, r/history)

### Phase 4 — Growth (Month 2-3)

- Second vertical (Cinema — guess year from film still)
- Hard mode (no clues, harder events)
- Difficulty rating system for personalization
- Press coverage (history/culture journalists)

---

## REPO STRUCTURE

```
chronicle/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # Main game
│   ├── stats/page.tsx       # Stats modal
│   └── globals.css
├── components/
│   ├── Game.tsx              # Core game logic
│   ├── YearInput.tsx         # Year guess input
│   ├── ClueReveal.tsx        # Progressive clue display
│   ├── ShareCard.tsx         # Share card canvas
│   ├── StatsModal.tsx        # Stats display
│   └── PuzzleDisplay.tsx     # Event image + headline
├── lib/
│   ├── puzzles.ts            # Puzzle loader + date resolution
│   ├── scoring.ts            # Score calculation
│   ├── storage.ts            # localStorage read/write
│   └── share.ts              # Share text generation
├── data/
│   └── puzzles.json          # 365 puzzles (Phase 1: 90)
├── public/
│   └── images/
│       └── puzzles/           # Optimized puzzle images
├── scripts/
│   └── generate-puzzles.ts   # AI-assisted puzzle generation
├── CLAUDE.md                 # Full build instructions for Claude Code
├── SPEC.md                   # This file
└── README.md
```

---

## NEXT STEPS

1. **Create repo** → `romulus-silvius/chronicle` on GitHub
2. **Write CLAUDE.md** → Comprehensive build instructions for Claude Code
3. **Seed puzzles.json** → First 30 puzzles (diverse, hand-curated)
4. **Scaffold Next.js app** → With Tailwind, components, game logic
5. **Connect to Mike** → Review scaffold, confirm direction, hand off to Claude Code for Phase 1 build

---

*Chronicle is the game. The share card is the marketing. The editorial curation is the moat. The NYT is the exit.*
