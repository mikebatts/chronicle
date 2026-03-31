const fs = require('fs');
const path = require('path');

// Read CSV
const csvPath = path.join(__dirname, '../data/puzzles-seed.csv');
const csvContent = fs.readFileSync(csvPath, 'utf8');
const lines = csvContent.trim().split('\n');
const header = lines[0].split(',');
const puzzles = [];

for (let i = 1; i < lines.length; i++) {
  const values = lines[i].split(',');
  const row = {};
  header.forEach((col, idx) => {
    row[col.trim()] = values[idx]?.trim();
  });
  
  puzzles.push({
    id: puzzles.length + 1,
    date: row.date,
    slot: parseInt(row.slot),
    day_of_week: row.day_of_week,
    event: row.event_name,
    event_formal: formatEventFormal(row.event_name),
    year: parseInt(row.year),
    headline: row.headline,
    description: generateDescription(row.event_name, row.year),
    tier: parseInt(row.tier) || 1,
    difficulty_rating: parseInt(row.difficulty_rating),
    clues: generateClues(row.event_name, row.year, row.day_of_week),
    context_card: generateContextCard(row.event_name, row.year)
  });
}

function formatEventFormal(event) {
  const formalizations = {
    'Apollo 11 Moon Landing': 'Apollo 11 — First Humans Walk on the Moon',
    'Titanic Sinks': 'Sinking of the RMS Titanic',
    'JFK Assassination': 'Assassination of President John F. Kennedy',
    'World Wide Web Invented': 'World Wide Web Proposed by Tim Berners-Lee',
    'Chernobyl Disaster': 'Chernobyl Nuclear Disaster',
    'D-Day Normandy Landing': 'D-Day — Allied Forces Land at Normandy',
    'First iPhone Released': 'Apple iPhone — First Generation Released',
    'Watergate Break-In': 'Watergate Scandal Begins',
    'Hiroshima Atomic Bomb': 'Atomic Bomb Dropped on Hiroshima',
    'Fall of the Soviet Union': 'Dissolution of the Soviet Union',
    'Wright Brothers First Flight': 'Wright Brothers — First Powered Flight',
    'Lindbergh Atlantic Flight': 'Lindbergh Completes First Solo Transatlantic Flight',
    'Cuban Missile Crisis': 'Cuban Missile Crisis — World on Brink of War',
    'Rosa Parks Bus Protest': 'Rosa Parks Sparks Montgomery Bus Boycott',
    'Challenger Disaster': 'Space Shuttle Challenger Disaster',
    'September 11 Attacks': 'September 11 Terrorist Attacks',
    'Pearl Harbor Attack': 'Attack on Pearl Harbor',
    'First Human in Space': 'Yuri Gagarin — First Human in Space',
    'French Revolution Begins': 'Storming of the Bastille — French Revolution Begins',
    'Declaration of Independence': 'Signing of the Declaration of Independence',
    'First Kodak Camera': 'Kodak Camera — First User-Friendly Camera',
    'First Nobel Prizes Awarded': 'First Nobel Prizes Awarded in Stockholm',
    'DNA Structure Discovered': 'Watson and Crick Discover DNA Structure',
  };
  
  if (formalizations[event]) return formalizations[event];
  
  // Default: just title case
  return event
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function generateDescription(event, year) {
  const descriptions = {
    'Apollo 11 Moon Landing': `On July 20, 1969, NASA astronauts Neil Armstrong and Buzz Aldrin became the first humans to walk on the Moon, fulfilling President Kennedy's ambitious goal set in 1961. Armstrong's famous words — "That's one small step for man, one giant leap for mankind" — echoed around the world as an estimated 600 million people watched on television.`,
    'Titanic Sinks': `The RMS Titanic, the largest ship afloat at the time, struck an iceberg on April 15, 1912, during its maiden voyage from Southampton to New York City. Over 1,500 passengers and crew perished in one of the deadliest peacetime maritime disasters. The tragedy led to major improvements in maritime safety regulations.`,
    'Nelson Mandela Released From Prison': `After 27 years of imprisonment, Nelson Mandela walked free on February 11, 1990, becoming a symbol of the fight against apartheid in South Africa. His release sparked a movement that would eventually lead to the end of apartheid and his election as South Africa's first Black president in 1994.`,
    default: `This event marked a significant moment in history, shaping the course of events in the years that followed. It remains an important date remembered for its impact on society and culture.`
  };
  
  return descriptions[event] || descriptions.default;
}

function generateClues(event, year, dayOfWeek) {
  // Generic clue templates based on difficulty
  const clueSets = {
    monday: [
      `This event occurred in the ${getDecade(year)} decade.`,
      `The world was a different place back then.`,
      `This was watched by millions around the globe.`
    ],
    tuesday: [
      `This happened during the ${getHalfCentury(year)} of the 20th century.`,
      `Technology was rapidly changing this era.`,
      `This event had worldwide implications.`
    ],
    wednesday: [
      `The year was significant for this type of event.`,
      `Social changes were underway during this period.`,
      `This was a defining moment in its decade.`
    ],
    thursday: [
      `This occurred in the latter half of the 20th century.`,
      `The aftermath of this event is still felt today.`
    ],
    friday: [
      `This happened during a period of rapid change.`,
      `This event is taught in schools worldwide.`
    ],
    saturday: [
      `This marked a turning point in history.`
    ],
    sunday: []
  };
  
  return clueSets[dayOfWeek] || clueSets.monday;
}

function generateContextCard(event, year) {
  const contextCards = {
    'Apollo 11 Moon Landing': 'The Apollo 11 mission returned 47.5 pounds of lunar samples to Earth. The entire Apollo program cost $25.4 billion (about $180 billion today).',
    'Titanic Sinks': 'The Titanic was carrying some of the wealthiest people in the world. Only 710 of the 2,224 passengers and crew survived. Many of the lifeboats were launched partially empty.',
    'Nelson Mandela Released From Prison': 'Mandela was 71 years old when he was released. He had spent 27 years in prison, including 18 years on Robben Island where he performed hard labor in a quarry.',
    default: `This event occurred in ${year} and remains significant in historical studies.`
  };
  
  return contextCards[event] || contextCards.default;
}

function getDecade(year) {
  const y = parseInt(year);
  const decade = Math.floor(y / 10) * 10;
  return decade + 's';
}

function getHalfCentury(year) {
  const y = parseInt(year);
  return y < 1950 ? 'first half' : 'second half';
}

// Output JSON (no extra text)
const output = { puzzles };
process.stdout.write(JSON.stringify(output, null, 2));
