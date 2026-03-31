const fs = require('fs');
const puzzles = JSON.parse(fs.readFileSync('./data/puzzles.json', 'utf8'));

// Ensure March 30 puzzle has slot 0
puzzles.puzzles[0].slot = 0;

// New puzzles to add for today and future days
const newPuzzles = [
  // March 31 - slot 1
  {
    id: 100,
    date: "2026-03-31",
    slot: 1,
    day_of_week: "tuesday",
    event: "iPhone Introduced",
    event_formal: "First iPhone Announcement by Apple",
    year: 2007,
    headline: "Apple reinvented the phone",
    description: "Steve Jobs unveiled the iPhone, calling it a widescreen iPod with touch controls.",
    tier: 1,
    difficulty_rating: 5,
    clues: {
      monday: ["Steve Jobs presented this", "replaced the iPod", "touch screen interface"],
      tuesday: ["Apple product launch", "first released in June", "no physical keyboard"],
      wednesday: ["changed mobile computing", "App Store came later", "multi-touch display"],
      thursday: ["digital era landmark", "smartphone revolution"],
      friday: ["late 2000s tech", "revolutionary interface"],
      saturday: ["one more thing"]
    },
    context_card: "Jobs unveiled iPhone Jan 9, 2007. Sold June 29. No App Store at launch."
  },
  // March 31 - slot 2
  {
    id: 101,
    date: "2026-03-31",
    slot: 2,
    day_of_week: "tuesday",
    event: "Watergate Break-In",
    event_formal: "Watergate Scandal Begins",
    year: 1972,
    headline: "A break-in that would bring down a president",
    description: "Five men were arrested at the Democratic National Committee headquarters.",
    tier: 1,
    difficulty_rating: 7,
    clues: {
      monday: ["Democratic headquarters", "Nixon administration", "1970s Washington"],
      tuesday: ["burglars caught", "Connected to CREEP", "journalists investigated"],
      wednesday: ["led to resignation", "Cover-up worse than crime", "Congressional hearings"],
      thursday: ["1970s scandal", "Supreme Court case"],
      friday: ["June 1972", "Washington DC"],
      saturday: ["Deep Throat clues"]
    },
    context_card: "Break-in June 17, 1972. Nixon resigned Aug 9, 1974."
  },
  // April 1 - slot 1
  {
    id: 102,
    date: "2026-04-01",
    slot: 1,
    day_of_week: "wednesday",
    event: "World Wide Web Invented",
    event_formal: "Tim Berners-Lee Creates the World Wide Web",
    year: 1989,
    headline: "A British scientist changed how we share information",
    description: "Tim Berners-Lee proposed the World Wide Web at CERN.",
    tier: 1,
    difficulty_rating: 6,
    clues: {
      monday: ["CERN Switzerland", "hypertext proposal", "late 1980s"],
      tuesday: ["information sharing system", "British scientist", "HTTP and HTML"],
      wednesday: ["inventor refused to patent it", "made it free", "changed communication"],
      thursday: ["pre-internet era", "information age"],
      friday: ["late 20th century", "European science"],
      saturday: ["browser invented later"]
    },
    context_card: "Berners-Lee proposed WWW March 1989. First website went live 1991."
  },
  // April 1 - slot 2
  {
    id: 103,
    date: "2026-04-01",
    slot: 2,
    day_of_week: "wednesday",
    event: "Chernobyl Disaster",
    event_formal: "Chernobyl Nuclear Meltdown",
    year: 1986,
    headline: "The world's worst nuclear accident",
    description: "Reactor number 4 at Chernobyl exploded during a safety test.",
    tier: 1,
    difficulty_rating: 6,
    clues: {
      monday: ["nuclear disaster", "Soviet Union", "April 1986"],
      tuesday: ["reactor exploded", "Pripyat evacuation", "cover-up initially"],
      wednesday: ["radiation spread across Europe", "new sarcophagus built", "worst nuclear accident"],
      thursday: ["20th century disaster", "Soviet era"],
      friday: ["Ukraine", "nuclear meltdown"],
      saturday: ["mutant imagery"]
    },
    context_card: "Explosion April 26, 1986. 350000 evacuated. Sarcophagus built to contain it."
  }
];

puzzles.puzzles.push(...newPuzzles);
fs.writeFileSync('./data/puzzles.json', JSON.stringify(puzzles, null, 2));
console.log('Added', newPuzzles.length, 'new puzzles. Total:', puzzles.puzzles.length);

// Verify March 30
const march30 = puzzles.puzzles.filter(p => p.date === '2026-03-30');
console.log('\nMarch 30 puzzles:');
march30.forEach(p => console.log('  Slot', p.slot + ':', p.event, '(' + p.year + ')'));
