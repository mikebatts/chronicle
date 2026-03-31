const fs = require('fs');
let puzzles = JSON.parse(fs.readFileSync('./data/puzzles.json', 'utf8'));

// Keep only puzzles from March 30 onwards that are correct
const goodPuzzles = puzzles.puzzles.filter(p => {
  // Keep existing March 30 and April 1 slot 1/2 puzzles we just added
  if (p.date === '2026-03-30' && p.slot !== undefined) return true;
  if (p.date === '2026-03-31' && ['iPhone Introduced', 'World Wide Web Invented'].includes(p.event)) return true;
  if (p.date === '2026-04-01' && ['World Wide Web Invented', 'Watergate Break-In'].includes(p.event)) return true;
  // Keep original puzzles with slot 0
  if (p.slot === 0 && p.date <= '2026-03-30') return true;
  return false;
});

puzzles.puzzles = goodPuzzles;
fs.writeFileSync('./data/puzzles.json', JSON.stringify(puzzles, null, 2));
console.log('Cleaned puzzles. Total:', puzzles.puzzles.length);
