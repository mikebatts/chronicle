You're working on Chronicle (thischronicle.com) - a daily history guessing game. 

## Context
- App: Next.js 15, React, Tailwind CSS, TypeScript
- Working directory: /Users/michaelbattaglia/.openclaw/workspace/chronicle
- Branch: staging (make changes there, push when done)
- Also push to main after staging is verified

## Tasks (in order)

### 1. Fix Share Card Emoji Map
The current lib/share.ts only handles 3 colors (correct/close/miss) but Design A uses a red square for "far off" digits. 

Look at lib/types.ts - DigitColor is currently:
```typescript
export type DigitColor = "correct" | "close" | "miss";
```

Update to include "far" or similar, then update the locking logic to produce this new color when a digit is way off. Then update the emoji map in share.ts to use the red square emoji for far-off digits.

### 2. Verify/Implement Share Button
Check components/DailyResults.tsx - the share buttons should:
- "Share on X" - opens native share dialog or copies text for pasting  
- "Copy result" - copies the share text to clipboard using navigator.clipboard.writeText()

The generateDailyShareText function should be producing this format (with puzzle labels 1,2,3 and all guess attempts):

If the buttons aren't functional, implement them properly.

### 3. Integrate puzzles-seed.csv
Check if data/puzzles-seed.csv exists (it should from a previous session). If it does:
- Read and parse it
- Convert to puzzles.json format OR modify the puzzle loading to read from CSV directly
- Verify we have 90 puzzles (3/day for 30 days from March 31)
- Ensure difficulty ramps Monday (easy) to Sunday (hard)

If puzzles-seed.csv is missing or incomplete, generate fresh puzzle data covering:
- March 31 through April 29 (30 days)
- 3 puzzles per day
- Historical events from 1600-present
- Diverse time periods
- Difficulty: monday easy, sunday hardest

### 4. General Polish
- Check for any console errors or TypeScript issues
- Ensure the game flow works: 3 sequential puzzles, results at end
- Verify localStorage persistence works

## Instructions
- Work through tasks sequentially
- After each task, explain what you did in stdout
- After all tasks complete, run npm run build to verify it compiles
- Push to origin/staging
- Then git checkout main && git merge staging && git push origin main
- Report success/failure at each step

Start now.