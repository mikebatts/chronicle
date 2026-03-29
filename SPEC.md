# Chronicle — Product & Technical Specification

**Status:** Planning complete, spec locked  
**Last updated:** March 29, 2026  
**Domain:** thischronicle.com (secured, $10/yr)  
**Discord channel:** #chronicle  
**GitHub:** romulus-silvius/chronicle

---

## THE PRODUCT

Chronicle is a daily history guessing game. One historical event per day. One image. Guess the year in 3 attempts.

**Core mechanic:**
- Year input field (not a slider) — committed guess, higher stakes
- Attempt 1: Image + headline only (cold)
- Wrong guess → "Too early" / "Too late" directional feedback
- Attempt 2: First contextual clue appears
- Attempt 3: Second clue (more specific)
- Correct guess OR attempts exhausted → result screen + share card

**Difficulty arc (Mon–Sun baked into puzzle data):**
- Monday: Warm, guiding clues
- Tue/Wed: Breadcrumb clues
- Thu/Fri: Tighter, more cryptic
- Saturday: One oblique clue
- Sunday: NO CLUES — pure knowledge, prestige badge

---

## THE SHARE CARD — LOCKED DESIGN

This is the most important feature. The share text is pre-approved. Do not change it.

**Win (3 attempts used):**
```
Chronicle #47 📜 🔥12
🔴→🟡→✅
thischronicle.com
```

**Win (first try):**
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

## STATS MODAL — LOCKED FORMAT

Mirrors Wordle's stat screen. Shows:

```
Played: 47
Win %: 83

Current Streak: 12 🔥
Max Streak: 19

Avg Distance: 11 yrs ← Chronicle-specific

Guess Distribution:
1 ██████ 14%
2 ████████████ 52%
3 ███████ 31%
✗ ██ 3%
```

**Chronicle-specific stat:** Avg Distance — average years off across all wins. People brag about this.

---

## GAME GOALS

**Free forever.** No ads, no paywall, no "play 3 free per day."

**Shooting for NYT acquisition.** Clean code, D7/D30/D90 retention metrics, editorial quality. The NYT has Wordle, Connections, Spelling Bee, Strands — no history game. That's the gap.

**Monetization (post-acquisition only):** Ko-fi tip jar for superfans. No paid tier, no ads.

---

## TECH STACK

**Frontend:** Next.js (App Router) + Tailwind CSS  
**Hosting:** Vercel (free tier, auto-scales)  
**Game state:** localStorage only (no backend, no auth, no database for V1)  
**Analytics:** Plausible.io ($9/mo) — privacy-first, shows DAU + retention  
**Domain:** thischronicle.com  

**Static generation model:** Puzzle content lives as a JSON file committed to the repo. Each day's puzzle is pre-rendered at build time. Zero server-side overhead. Zero database cost. Exactly how Wordle worked pre-acquisition.

---

## PUZZLE GENERATION PIPELINE

**Phase 1 (launch):** Hand-curated seed set (90 puzzles)  
**Phase 2 (from day one):** AI-assisted generation + human editor

### The Pipeline

A Node.js script (`scripts/generate-puzzles.ts`) that:
1. Calls an LLM API (Claude via OpenRouter) with a structured prompt
2. Outputs candidate puzzles to a staging file
3. Human editor reviews candidates against a checklist
4. Approved puzzles get added to `data/puzzles.json`

### The Generation Prompt

```
Generate a historically significant event puzzle with:
- event_name, year (1900-2025, verifiable on Wikipedia)
- headline (engaging, NO year mentioned)
- clues for each day of week (Mon = warm, Sunday = none)
- context_card (2-3 sentences, editorial voice, no year in first sentence)
- tier (1/2/3), difficulty_rating (1-10)

Rules:
- Clues must narrow the window without giving it away
- Context must be historically accurate and engaging
- Year must be verifiable on Wikipedia
- No tier-3 anchor events without a specific date alignment
- Tier 1: Universally known era, surprising specifics
- Tier 2: Obscure but fascinating (1-2x per week)
- Tier 3: Anchor events on actual anniversary dates
```

### The Accuracy Checklist

Every puzzle goes through human review:

- [ ] Year is correct and verifiable on Wikipedia
- [ ] Image exists on Wikimedia Commons (public domain)
- [ ] Image is unambiguous — depicts the event clearly
- [ ] Clues don't give away the year
- [ ] Clues are historically accurate
- [ ] Context card is engaging (not just Wikipedia text)
- [ ] Difficulty rating is appropriate for the day

### Content Tiers

**Tier 1 — Universally known era, surprising specifics (most daily puzzles)**
Easy to get in the right decade, hard to nail exact year.
Example: "The Berlin Wall falls" → Cold War era, but was it '88, '89, or '90?

**Tier 2 — Obscure but fascinating (1-2x per week)**
Genuinely surprising facts that create "I had no idea" moments.

**Tier 3 — Anchor events (rare, date-specific)**
Run on actual anniversaries. Moon landing → July 20th. MLK speech → August 28th.

---

## IMAGE SOURCING — DISCIPLINED APPROACH

**Source:** Wikimedia Commons only. Public domain, permanent URLs, no licensing risk.

**Why Wikimedia:**
- Public domain / CC-licensed content
- Permanent URLs (the image won't disappear)
- Most major historical events have their iconic photo there
- Zero licensing ambiguity

**Pipeline:**
1. Find the event on Wikipedia → check "Media" section for the iconic image
2. Locate it on Wikimedia Commons → verify license (PD, CC0, CC-BY with low complexity)
3. Download → optimize to WebP (≥1200px wide, <200KB)
4. Store in `/public/images/puzzles/` — NOT hotlinked, lives in the repo
5. Add attribution to the context card

**Fallback sources:**
- National Archives (archives.gov)
- Getty Open Access
- Smithsonian Open Access

**Quality rules:**
- ≥1200px wide, crisp on retina
- High contrast, readable as small thumbnail
- No date watermarks that give away the year
- Unambiguous — clearly depicts the event

**What we cannot do:** Scrape random historical photos. Quality inconsistent, licensing unclear, URLs go dead.

---

## 365-PUZZLE PLAN

**Month 1 (before launch):** Generate 90 candidates → editor reviews → 75 approved → launch-ready

**Month 2-3:** Generate remaining candidates in batches of 30-50 → review → add to JSON

**Ongoing (post-launch):** Generate 30 days ahead, always maintain 30-puzzle buffer. Never publish un-reviewed puzzles.

---

## WHAT STAYS STATIC FOREVER

These decisions are architectural and don't change:

- **Game data:** JSON file in repo — no database, no API
- **Game state:** localStorage — streaks, stats, today's play
- **No user accounts** — NYT adds these on acquisition
- **No ads, ever** — signals we know what we're building
- **No paid tier** — free forever, revenue comes post-acquisition

**This is the NYT-friendly architecture:** clean code, proven retention mechanics, zero infra complexity, fast technical due diligence.

---

## ANALYTICS

**Plausible.io ($9/mo):** Privacy-first, shows DAU, D7/D30/D90 retention, share events.

The metrics NYT will ask for in due diligence:
- Daily active users
- D7 retention (% still playing after 7 days)
- D30 retention (% still playing after 30 days)
- Share event rate (% sharing their result)

---

## BUILD ROADMAP

### Phase 1 — Core Loop (Week 1-2)
- Next.js app scaffold with Tailwind
- 90-puzzle curated set (real puzzles, real images)
- Year input with 3-attempt logic
- Directional feedback ("too early" / "too late")
- Clue reveal system (progressive)
- Scoring engine
- Share card (emoji text + canvas image export)
- Stats modal
- localStorage persistence
- Mobile-first responsive design
- Daily puzzle scheduler (date-based resolution)

### Phase 2 — Social + Retention (Week 3-4)
- Streak system with notification prompt
- Crew feature (invite link → private group → weekly leaderboard)
- Email notification for daily puzzle (Remix Email or Resend)
- Share card canvas rendering + download

### Phase 3 — Polish + Launch (Week 5-6)
- 365-puzzle archive (past puzzles accessible by date)
- Plausible.io analytics integration
- Press outreach template
- Product Hunt launch
- Reddit community postings (r/movies for Cinema vertical, r/history)

### Phase 4 — Growth (Month 2-3)
- Second vertical (Cinema — guess year from film still)
- Hard mode (no clues, harder events)
- Difficulty rating system for personalization
- Press coverage

---

## REPO STRUCTURE

```
chronicle/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # Main game
│   └── globals.css
├── components/
│   ├── Game.tsx              # Core game logic
│   ├── YearInput.tsx         # Year guess input
│   ├── ClueReveal.tsx        # Progressive clue display
│   ├── ShareCard.tsx         # Share card canvas
│   ├── StatsModal.tsx        # Stats display
│   ├── ResultScreen.tsx      # Win/loss screen
│   └── PuzzleDisplay.tsx     # Event image + headline
├── lib/
│   ├── puzzles.ts            # Puzzle loader + date resolution
│   ├── scoring.ts            # Score calculation
│   ├── storage.ts            # localStorage read/write
│   ├── share.ts              # Share text generation
│   └── types.ts              # TypeScript interfaces
├── data/
│   └── puzzles.json          # Puzzle library (365 target)
├── scripts/
│   └── generate-puzzles.ts   # AI-assisted puzzle generation
├── public/
│   └── images/
│       └── puzzles/           # Optimized puzzle images
├── CLAUDE.md                 # Build instructions for Claude Code
├── SPEC.md                   # This file
└── README.md
```

---

## NEXT STEPS

1. **Finalize SPEC + CLAUDE.md** ← this update
2. **Write `scripts/generate-puzzles.ts`** — AI-assisted generation script
3. **Hand-curate 90 puzzles with real images** — 2-3 hours with Wikipedia + Wikimedia Commons open
4. **Run generation script** — produce candidates, editor reviews, approve
5. **Build Phase 1** — hand off to Claude Code with updated CLAUDE.md
6. **Launch** — deploy to Vercel, connect domain

---

*Chronicle is the game. The share card is the marketing. The editorial curation is the moat. The NYT is the exit.*
