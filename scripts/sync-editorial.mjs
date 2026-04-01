/**
 * sync-editorial.mjs
 *
 * One-time script: merges editorial content from games-schedule.csv into puzzles.json.
 * 25 puzzles receive proper context cards written by Mike/Romulus.
 *
 * Run: node scripts/sync-editorial.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// Editorial content from games-schedule.csv — human-written by Mike/Romulus.
// Keyed by puzzle ID from puzzles.json.
const EDITORIAL = {
  // ID 1 — Nelson Mandela Released From Prison (1990)
  1: {
    event: "Nelson Mandela Released From Prison",
    event_formal: "Nelson Mandela Released From Prison",
    context_card: "Nelson Mandela had spent 18 of his 27 years imprisoned on Robben Island, a bleak outcrop in Table Bay. By the time he walked free on February 11th, 1990, he had become the most famous political prisoner in the world. Within four years, he was president.",
    difficulty_rating: 5,
  },
  // ID 2 — Apollo 11 Moon Landing (1969)
  2: {
    event: "Apollo 11 Moon Landing",
    event_formal: "Apollo 11 Moon Landing",
    context_card: "Neil Armstrong's first steps on the Moon were watched by an estimated 600 million people — one-fifth of the world's population. The lunar module was called Eagle. Armstrong had only 30 seconds of fuel remaining when he found a landing spot. He called it 'magnificent desolation.'",
    difficulty_rating: 2,
  },
  // ID 3 — The Titanic Sinks (1912)
  3: {
    event: "The Titanic Sinks",
    event_formal: "The Titanic Sinks",
    context_card: "The Titanic was carrying some of the world's wealthiest people and hundreds of immigrants seeking a new life in America. It struck the iceberg at 11:40 PM and sank in under three hours. The nearby RMS Carpathia rescued 705 survivors. The disaster led to major changes in maritime safety regulations.",
    difficulty_rating: 3,
  },
  // ID 4 — JFK Assassinated in Dallas (1963)
  4: {
    event: "JFK Assassinated in Dallas",
    event_formal: "Assassination of President John F. Kennedy",
    context_card: "Lee Harvey Oswald fired three shots from the sixth floor of the Texas School Book Depository on November 22nd, 1963. Kennedy was pronounced dead at 1:00 PM. Two days later, Oswald was shot by nightclub owner Jack Ruby in the Dallas Police Department basement — live on national television. The truth of what happened that day has never fully left public debate.",
    difficulty_rating: 6,
  },
  // ID 6 — Chernobyl Nuclear Disaster (1986)
  6: {
    event: "Chernobyl Nuclear Disaster",
    event_formal: "Chernobyl Nuclear Disaster",
    context_card: "On April 26, 1986, Reactor 4 at Chernobyl exploded during a low-power test. The fire released radioactive material 9 kilometers into the atmosphere. Soviet authorities evacuated Pripyat (population 49,000) 36 hours later. The final death toll remains disputed — from 31 immediate deaths to estimates of thousands of cancer cases from radiation exposure. The destroyed reactor was finally enclosed in a giant steel sarcophagus in 2016.",
    difficulty_rating: 5,
  },
  // ID 7 — D-Day: Allied Forces Land at Normandy (1944)
  7: {
    event: "D-Day: Allied Forces Land at Normandy",
    event_formal: "D-Day: Allied Invasion of Normandy",
    context_card: "On June 6th, 1944, the Allies launched the most complex military operation in history. Paratroopers had already dropped behind enemy lines by the time the first landing craft hit the beaches at 6:30 AM. The cost was enormous — over 4,000 Allied soldiers died on D-Day alone — but within a year, Germany had surrendered.",
    difficulty_rating: 6,
  },
  // ID 8 — First iPhone Released (2007)
  8: {
    event: "First iPhone Released",
    event_formal: "Apple iPhone Launch",
    context_card: "Steve Jobs unveiled the iPhone on January 9, 2007, calling it 'a revolutionary product.' It didn't go on sale until June, but it immediately changed what people expected from mobile devices. The initial model had no App Store — that came in 2008. By 2011, the iPhone had made Apple the most valuable company in the world.",
    difficulty_rating: 4,
  },
  // ID 10 — The Atomic Bomb Drops on Hiroshima (1945)
  10: {
    event: "The Atomic Bomb Drops on Hiroshima",
    event_formal: "Atomic Bombing of Hiroshima",
    context_card: "The Manhattan Project had cost two billion dollars and employed hundreds of thousands of people — most of whom had no idea what they were building. On August 6th, 1945, the result was dropped on Hiroshima. Three days later, a second bomb fell on Nagasaki. Japan surrendered on August 15th. The atomic age had begun.",
    difficulty_rating: 7,
  },
  // ID 11 — Fall of the Soviet Union (1991)
  11: {
    event: "Fall of the Soviet Union",
    event_formal: "Dissolution of the Soviet Union",
    context_card: "On December 26, 1991, the Supreme Soviet of the USSR ratified the Belovezh Accords, formally ending the Soviet Union. What had been the world's largest country by area splintered into 15 independent nations. For 69 years, the Soviet experiment had shaped global politics. Its end brought both hope for a new world order and anxiety about nuclear weapons in unstable new states.",
    difficulty_rating: 4,
  },
  // ID 12 — The Wright Brothers' First Flight (1903)
  12: {
    event: "The Wright Brothers' First Flight",
    event_formal: "Wright Brothers' First Powered Flight at Kitty Hawk",
    context_card: "The Wright Brothers made four flights at Kitty Hawk on December 17th, 1903. The first lasted just 12 seconds and covered 120 feet. By the end of that day, they had flown a total of 59 seconds. Orville would later say that the sensation of flight never fully wore off on him — it just kept getting better.",
    difficulty_rating: 3,
  },
  // ID 13 — Lindbergh Completes First Solo Transatlantic Flight (1927)
  13: {
    event: "Lindbergh's First Solo Transatlantic Flight",
    event_formal: "Charles Lindbergh's Transatlantic Flight",
    context_card: "The Spirit of St. Louis was so loaded with fuel at takeoff that it barely cleared the telephone wires at the end of the runway. Charles Lindbergh landed at Le Bourget at 10:22 PM on May 21st, 1927, and was immediately mobbed by the crowd. He became the most famous man in the world overnight — and remained so for the rest of his life, for better and worse.",
    difficulty_rating: 7,
  },
  // ID 14 — Cuban Missile Crisis (1962)
  14: {
    event: "Cuban Missile Crisis",
    event_formal: "Cuban Missile Crisis",
    context_card: "For thirteen days in October 1962, the world came closer to nuclear war than it ever has before or since. Soviet ships carrying additional missiles turned back at the US naval blockade. Soviet leader Khrushchev eventually agreed to remove the missiles in exchange for a US pledge not to invade Cuba and a secret agreement to remove American missiles from Turkey. The crisis was resolved — but only barely.",
    difficulty_rating: 9,
  },
  // ID 15 — Rosa Parks Refuses to Give Up Her Seat (1955)
  15: {
    event: "Rosa Parks Refuses to Give Up Her Seat",
    event_formal: "Rosa Parks' Bus Protest, Montgomery, Alabama",
    context_card: "Rosa Parks was not simply tired from work when she refused to move — she was tired of giving in. She had been trained at the Highlander Folk School, a center for civil rights activism. Her arrest on December 1st, 1955 was strategic: the NAACP had been looking for a test case. The resulting boycott lasted 381 days and ended with the Supreme Court ruling bus segregation unconstitutional.",
    difficulty_rating: 4,
  },
  // ID 16 — The Challenger Disaster (1986)
  16: {
    event: "The Challenger Disaster",
    event_formal: "Space Shuttle Challenger Disaster",
    context_card: "Engineers at Morton Thiokol had warned NASA the night before launch that O-rings could fail in temperatures below 53°F — and it was 28°F at Cape Canaveral that morning. Their objections were overruled. The Rogers Commission that investigated the disaster famously included physicist Richard Feynman, who demonstrated the O-ring failure with a glass of ice water at a press conference.",
    difficulty_rating: 5,
  },
  // ID 17 — September 11 Attacks (2001)
  17: {
    event: "September 11 Attacks",
    event_formal: "September 11, 2001 Terrorist Attacks",
    context_card: "On September 11, 2001, nearly 3,000 people were killed in a series of coordinated terrorist attacks. The FBI quickly opened an investigation called PENTTBOM. Within days, President George W. Bush had signed the USA PATRIOT Act. The attacks reshaped American foreign policy, airport security, and domestic surveillance in ways still felt today.",
    difficulty_rating: 2,
  },
  // ID 19 — First Human in Space (1961)
  19: {
    event: "First Human in Space",
    event_formal: "Yuri Gagarin's First Human Spaceflight",
    context_card: "Yuri Gagarin orbited Earth in Vostok 1 on April 12, 1961, completing one orbit in 108 minutes. At 27, he became the first human to see Earth from space. He parachuted from his capsule before it landed — ejection at 7km was standard procedure. A city in Kazakhstan was renamed Baikonur in his honor, and his face became a symbol of Soviet achievement.",
    difficulty_rating: 3,
  },
  // ID 20 — French Revolution Begins (1789)
  20: {
    event: "French Revolution Begins",
    event_formal: "Storming of the Bastille, French Revolution",
    context_card: "On July 14, 1789, several hundred Parisians stormed the Bastille, a medieval fortress that had become a symbol of royal tyranny. They freed the seven prisoners inside and killed the governor. The event became the defining moment of the French Revolution and is now commemorated annually as Bastille Day, France's national holiday.",
    difficulty_rating: 4,
  },
  // ID 23 — First Email Sent (1971)
  23: {
    event: "First Email Sent",
    event_formal: "First Electronic Mail Message",
    context_card: "Ray Tomlinson sent the first email in 1971, choosing the @ symbol to separate the user name from the computer name. The message itself was largely forgettable — something like 'QWERTYUIOP.' But the @ sign became Tomlinson's lasting contribution to digital communication, now used in billions of email addresses worldwide.",
    difficulty_rating: 7,
  },
  // ID 24 — Google Founded (1998)
  24: {
    event: "Google Founded",
    event_formal: "Google Founded",
    context_card: "Larry Page and Sergey Brin met at Stanford in 1995 and initially didn't get along. Their search algorithm, PageRank, ranked websites by their links rather than keywords. Their first office was a garage rented from a friend. The name 'Google' came from 'googol,' a mathematical term for 1 followed by 100 zeros.",
    difficulty_rating: 6,
  },
  // ID 25 — Amazon Founded (1994)
  25: {
    event: "Amazon Founded",
    event_formal: "Amazon.com Founded",
    context_card: "Jeff Bezos left his hedge fund job in 1994 to start an online bookstore, originally called Cadabra. He chose the name Amazon because it sounded 'exotic and different,' and the Amazon River was the biggest river he could think of. He raised $1 million from his own parents — the minimum viable investment to start. By 2020, Amazon had a market cap of $1.7 trillion.",
    difficulty_rating: 6,
  },
  // ID 26 — DNA Structure Discovered (1953)
  26: {
    event: "DNA Structure Discovered",
    event_formal: "Discovery of the DNA Double Helix",
    context_card: "Watson and Crick published their double helix model in Nature on April 25, 1953. Their famous line: 'It has not escaped our notice that the specific pairing we have postulated immediately suggests a possible copying mechanism for the genetic material.' Rosalind Franklin's Photo 51, which showed the helix structure, was critical — but she died in 1958 and never shared the Nobel Prize.",
    difficulty_rating: 5,
  },
  // ID 27 — HIV/AIDS Identified (1981)
  27: {
    event: "HIV/AIDS First Identified",
    event_formal: "First Identification of HIV/AIDS",
    context_card: "The CDC's Morbidity and Mortality Weekly Report on June 5, 1981, documented five young gay men in Los Angeles with a rare pneumonia. By the end of 1981, there were 159 reported cases. The disease wouldn't be called AIDS until 1982, and the HIV virus wouldn't be identified until 1984. It would eventually kill 35 million people worldwide.",
    difficulty_rating: 7,
  },
  // ID 34 — Euro Currency Launched (1999)
  34: {
    event: "Euro Currency Launched",
    event_formal: "Euro Currency Launched",
    context_card: "The Euro was introduced as an accounting currency on January 1, 1999, with physical notes and coins following on January 1, 2002. Twelve countries abandoned their national currencies — including the Deutsche Mark, French Franc, and Italian Lira — for the first time in history. The transition was initially chaotic in some countries, with ATM glitches and confusion at stores.",
    difficulty_rating: 6,
  },
  // ID 83 — The Beatles' First US TV Appearance (1964)
  83: {
    event: "The Beatles' First US TV Appearance",
    event_formal: "The Beatles on The Ed Sullivan Show",
    context_card: "When The Beatles landed at JFK Airport on February 7, 1964, they were met by 3,000 screaming fans — the largest welcome in airport history to that point. They appeared on The Ed Sullivan Show ten days later, watched by 73 million viewers. Within weeks, Beatlemania had completely reshaped American pop music and youth culture.",
    difficulty_rating: 5,
  },
};

// Load puzzles.json
const puzzlesPath = join(root, 'data/puzzles.json');
const data = JSON.parse(readFileSync(puzzlesPath, 'utf-8'));

let updated = 0;
for (const puzzle of data.puzzles) {
  const edit = EDITORIAL[puzzle.id];
  if (!edit) continue;
  puzzle.event = edit.event;
  puzzle.event_formal = edit.event_formal;
  puzzle.context_card = edit.context_card;
  puzzle.difficulty_rating = edit.difficulty_rating;
  updated++;
}

writeFileSync(puzzlesPath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
console.log(`Updated ${updated} puzzles with editorial content.`);

// Report which puzzles still have placeholder context cards
const placeholders = data.puzzles.filter(p => p.context_card.startsWith('This event occurred'));
console.log(`\n${placeholders.length} puzzles still have placeholder context cards (Phase 2 editorial work needed):`);
for (const p of placeholders) {
  console.log(`  [${p.date} slot ${p.slot}] ID ${p.id}: ${p.event} (${p.year})`);
}
