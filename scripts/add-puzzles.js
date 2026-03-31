const fs = require('fs');
const puzzles = JSON.parse(fs.readFileSync('./data/puzzles.json', 'utf8'));

// Add slot to existing 2026-03-30 puzzle
puzzles.puzzles.forEach(p => {
  if (p.date === '2026-03-30' && !p.slot) {
    p.slot = 0;
  }
});

// Add 2 new puzzles for today (slot 1 and 2)
const newPuzzles = [
  {
    id: 2,
    date: "2026-03-30",
    slot: 1,
    day_of_week: "monday",
    event: "Apollo 11 Moon Landing",
    event_formal: "Apollo 11 — First Humans Walk on the Moon",
    year: 1969,
    headline: "One small step for man, one giant leap for mankind",
    description: "Neil Armstrong became the first human to walk on the Moon, followed by Buzz Aldrin. The two spent over two hours outside the spacecraft collecting samples and taking photographs while Michael Collins orbited above in the command module Columbia.",
    tier: 1,
    difficulty_rating: 5,
    clues: {
      monday: [
        "This achievement fulfilled a decade-old national pledge.",
        "The mission originated from Florida and traveled nearly a quarter million miles.",
        "The world watched on grainy black-and-white television screens."
      ],
      tuesday: [
        "The first humans to touch lunar soil came from the same country that sent Lindbergh across the Atlantic.",
        "The voyage took about a week from launch to landing.",
        "Television cameras captured every moment for an estimated 600 million viewers."
      ],
      wednesday: [
        "A Saturn V rocket carried the crew beyond Earth orbit.",
        "The site of landing was called the Sea of Tranquility.",
        "The event was broadcast to the largest television audience in history at that time."
      ],
      thursday: [
        "Two astronauts walked on an extraterrestrial surface.",
        "This occurred in the latter half of the 1960s."
      ],
      friday: [
        "A historic space mission took place in the Space Race era.",
        "The landing site was a flat plain on the Moon."
      ],
      saturday: [
        "Armstrong and Aldrin spent part of their time on a surface that had never been touched by human feet."
      ]
    },
    context_card: "Neil Armstrong stepped onto the lunar surface at 10:56 PM EDT on July 20th, 1969. The words he spoke were improvised; NASA had approved a different version. The mission returned 47.5 pounds of moon rocks."
  },
  {
    id: 3,
    date: "2026-03-30",
    slot: 2,
    day_of_week: "monday",
    event: "Titanic Sinks",
    event_formal: "Sinking of the RMS Titanic",
    year: 1912,
    headline: "The unsinkable ship met its end in the North Atlantic",
    description: "The RMS Titanic struck an iceberg at 11:40 PM and sank in the early hours of April 15th. Of the 2,224 aboard, more than 1,500 perished in the freezing Atlantic waters.",
    tier: 1,
    difficulty_rating: 6,
    clues: {
      monday: [
        "A ship that claimed to be unsinkable met its end in frigid waters.",
        "The disaster led to major reforms in maritime safety standards.",
        "The vessel was the largest ship afloat at the time."
      ],
      tuesday: [
        "Over 1,500 lives were lost due to insufficient lifeboats.",
        "The ship was traveling from Southampton to New York City.",
        "An iceberg was spotted too late to avoid a catastrophic collision."
      ],
      wednesday: [
        "The ship had four funnels but only three were functional.",
        "This occurred in the North Atlantic in the early 20th century.",
        "Survivors were rescued by another ship several hours later."
      ],
      thursday: [
        "A maritime disaster occurred in the early 20th century.",
        "The ship had enough lifeboats for only half the passengers."
      ],
      friday: [
        "The tragedy occurred on a ship known as the largest afloat.",
        "This happened in the second decade of the 20th century."
      ],
      saturday: [
        "The wreck was not discovered until 1985, resting two miles below the surface."
      ]
    },
    context_card: "The Titanic struck the iceberg at 11:40 PM on April 14th, 1912. By 2:20 AM, the ship had completely submerged. The Carpathia rescued survivors at 4:10 AM. Of the 710 survivors, 74 percent were women and children."
  }
];

puzzles.puzzles.push(...newPuzzles);
fs.writeFileSync('./data/puzzles.json', JSON.stringify(puzzles, null, 2));
console.log('Added 2 new puzzles for today with slots 1 and 2');
