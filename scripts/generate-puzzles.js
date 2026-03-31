// Generate 30 days of puzzles (March 31 - April 29) with 3 slots each
const puzzles = [];

const events = [
  // March 31 (Monday - easy, rating 3-4)
  { date: "2026-03-31", slot: 0, event: "Nelson Mandela Released From Prison", year: 1990, headline: "Nelson Mandela was released from prison after 27 years", difficulty: 3, day: "monday" },
  { date: "2026-03-31", slot: 1, event: "Apollo 11 Moon Landing", year: 1969, headline: "Neil Armstrong and Buzz Aldrin walked on the Moon", difficulty: 3, day: "monday" },
  { date: "2026-03-31", slot: 2, event: "Titanic Sinks", year: 1912, headline: "The RMS Titanic sank in the North Atlantic", difficulty: 4, day: "monday" },
  
  // April 1 (Tuesday - rating 4-5)
  { date: "2026-04-01", slot: 0, event: "JFK Assassination", year: 1963, headline: "President John F. Kennedy was assassinated in Dallas", difficulty: 4, day: "tuesday" },
  { date: "2026-04-01", slot: 1, event: "World Wide Web Invented", year: 1989, headline: "Tim Berners-Lee proposed the World Wide Web", difficulty: 4, day: "tuesday" },
  { date: "2026-04-01", slot: 2, event: "Chernobyl Disaster", year: 1986, headline: "A nuclear reactor exploded at Chernobyl in Ukraine", difficulty: 5, day: "tuesday" },
  
  // April 2 (Wednesday - rating 5-6)
  { date: "2026-04-02", slot: 0, event: "D-Day Normandy Landing", year: 1944, headline: "Allied forces landed at Normandy beaches in France", difficulty: 5, day: "wednesday" },
  { date: "2026-04-02", slot: 1, event: "First iPhone Released", year: 2007, headline: "Apple released the first iPhone", difficulty: 5, day: "wednesday" },
  { date: "2026-04-02", slot: 2, event: "Watergate Break-In", year: 1972, headline: "The Watergate break-in occurred at the DNC headquarters", difficulty: 6, day: "wednesday" },
  
  // April 3 (Thursday - rating 6-7)
  { date: "2026-04-03", slot: 0, event: "Hiroshima Atomic Bomb", year: 1945, headline: "The United States dropped an atomic bomb on Hiroshima", difficulty: 6, day: "thursday" },
  { date: "2026-04-03", slot: 1, event: "Fall of the Soviet Union", year: 1991, headline: "The Soviet Union dissolved into independent states", difficulty: 6, day: "thursday" },
  { date: "2026-04-03", slot: 2, event: "Wright Brothers First Flight", year: 1903, headline: "The Wright Brothers flew the first powered airplane", difficulty: 7, day: "thursday" },
  
  // April 4 (Friday - rating 7-8)
  { date: "2026-04-04", slot: 0, event: "Lindbergh Atlantic Flight", year: 1927, headline: "Charles Lindbergh made the first solo transatlantic flight", difficulty: 7, day: "friday" },
  { date: "2026-04-04", slot: 1, event: "Cuban Missile Crisis", year: 1962, headline: "The Cuban Missile Crisis brought the world to the brink of nuclear war", difficulty: 7, day: "friday" },
  { date: "2026-04-04", slot: 2, event: "Rosa Parks Bus Protest", year: 1955, headline: "Rosa Parks refused to give up her bus seat in Montgomery", difficulty: 7, day: "friday" },
  
  // April 5 (Saturday - rating 8-9)
  { date: "2026-04-05", slot: 0, event: "Challenger Disaster", year: 1986, headline: "The Space Shuttle Challenger broke apart 73 seconds after launch", difficulty: 8, day: "saturday" },
  { date: "2026-04-05", slot: 1, event: "September 11 Attacks", year: 2001, headline: "Terrorists attacked the World Trade Center and Pentagon", difficulty: 8, day: "saturday" },
  { date: "2026-04-05", slot: 2, event: "Pearl Harbor Attack", year: 1941, headline: "Japan attacked the U.S. naval base at Pearl Harbor", difficulty: 8, day: "saturday" },
  
  // April 6 (Sunday - rating 8-9)
  { date: "2026-04-06", slot: 0, event: "First Human in Space", year: 1961, headline: "Yuri Gagarin became the first human in space", difficulty: 9, day: "sunday" },
  { date: "2026-04-06", slot: 1, event: "French Revolution Begins", year: 1789, headline: "French revolutionaries stormed the Bastille in Paris", difficulty: 9, day: "sunday" },
  { date: "2026-04-06", slot: 2, event: "Declaration of Independence", year: 1776, headline: "The United States declared independence from Britain", difficulty: 9, day: "sunday" },
  
  // April 7 (Monday - easy again)
  { date: "2026-04-07", slot: 0, event: "MLK I Have a Dream", year: 1963, headline: "MLK gave his I Have a Dream speech in Washington", difficulty: 3, day: "monday" },
  { date: "2026-04-07", slot: 1, event: "First Email Sent", year: 1971, headline: "Ray Tomlinson sent the first network email", difficulty: 3, day: "monday" },
  { date: "2026-04-07", slot: 2, event: "Google Founded", year: 1998, headline: "Larry Page and Sergey Brin founded Google", difficulty: 4, day: "monday" },
  
  // April 8 (Tuesday)
  { date: "2026-04-08", slot: 0, event: "Amazon Founded", year: 1994, headline: "Jeff Bezos founded Amazon as an online bookstore", difficulty: 4, day: "tuesday" },
  { date: "2026-04-08", slot: 1, event: "DNA Structure Discovered", year: 1953, headline: "Watson and Crick discovered the structure of DNA", difficulty: 4, day: "tuesday" },
  { date: "2026-04-08", slot: 2, event: "HIV/AIDS Discovered", year: 1981, headline: "Doctors identified a new disease called AIDS in New York", difficulty: 5, day: "tuesday" },
  
  // April 9 (Wednesday)
  { date: "2026-04-09", slot: 0, event: "First Heart Transplant", year: 1967, headline: "Christiaan Barnard performed the first heart transplant", difficulty: 5, day: "wednesday" },
  { date: "2026-04-09", slot: 1, event: "Polio Vaccine Announced", year: 1955, headline: "Jonas Salk announced his polio vaccine worked", difficulty: 5, day: "wednesday" },
  { date: "2026-04-09", slot: 2, event: "Penicillin Discovered", year: 1928, headline: "Alexander Fleming discovered penicillin", difficulty: 6, day: "wednesday" },
  
  // April 10 (Thursday)
  { date: "2026-04-10", slot: 0, event: "Instagram Launched", year: 2010, headline: "Kevin Systrom launched the photo-sharing app Instagram", difficulty: 6, day: "thursday" },
  { date: "2026-04-10", slot: 1, event: "YouTube Founded", year: 2005, headline: "Steve Chen and Chad Hurley launched YouTube", difficulty: 6, day: "thursday" },
  { date: "2026-04-10", slot: 2, event: "Wikipedia Launched", year: 2001, headline: "Jimmy Wales launched the free online encyclopedia Wikipedia", difficulty: 7, day: "thursday" },
  
  // April 11 (Friday)
  { date: "2026-04-11", slot: 0, event: "Euro Currency Launched", year: 1999, headline: "The Euro became the official currency of European Union members", difficulty: 7, day: "friday" },
  { date: "2026-04-11", slot: 1, event: "MP3 Player Invented", year: 1991, headline: "Saehan Electronics sold the first portable MP3 player", difficulty: 7, day: "friday" },
  { date: "2026-04-11", slot: 2, event: "Nintendo Game Boy Released", year: 1989, headline: "Nintendo released the Game Boy handheld console", difficulty: 7, day: "friday" },
  
  // April 12 (Saturday)
  { date: "2026-04-12", slot: 0, event: "Black Tuesday Stock Crash", year: 1929, headline: "The stock market crashed, starting the Great Depression", difficulty: 8, day: "saturday" },
  { date: "2026-04-12", slot: 1, event: "First Photograph Taken", year: 1826, headline: "Joseph Niepce took the first permanent photograph", difficulty: 8, day: "saturday" },
  { date: "2026-04-12", slot: 2, event: "First Telegraph Message", year: 1844, headline: "Samuel Morse sent the first telegraph message", difficulty: 8, day: "saturday" },
  
  // April 13 (Sunday)
  { date: "2026-04-13", slot: 0, event: "Printing Press Invented", year: 1440, headline: "Johannes Gutenberg printed the first Bible with movable type", difficulty: 9, day: "sunday" },
  { date: "2026-04-13", slot: 1, event: "American Civil War Begins", year: 1861, headline: "Confederate forces attacked Fort Sumter, starting the Civil War", difficulty: 9, day: "sunday" },
  { date: "2026-04-13", slot: 2, event: "Spanish Flu Pandemic", year: 1918, headline: "A deadly flu pandemic began spreading worldwide", difficulty: 9, day: "sunday" },
  
  // April 14 (Monday)
  { date: "2026-04-14", slot: 0, event: "Elvis Presley First TV Appearance", year: 1956, headline: "Elvis Presley appeared on television for the first time", difficulty: 3, day: "monday" },
  { date: "2026-04-14", slot: 1, event: "First McDonalds Opens", year: 1955, headline: "Ray Kroc opened the first franchised McDonalds restaurant", difficulty: 3, day: "monday" },
  { date: "2026-04-14", slot: 2, event: "Disneyland Opens", year: 1955, headline: "Walt Disney opened Disneyland in California", difficulty: 4, day: "monday" },
  
  // April 15 (Tuesday)
  { date: "2026-04-15", slot: 0, event: "First Barbie Doll", year: 1959, headline: "Ruth Handler debuted the Barbie doll at the New York Toy Fair", difficulty: 4, day: "tuesday" },
  { date: "2026-04-15", slot: 1, event: "Pac-Man Released", year: 1980, headline: "Namco released the arcade game Pac-Man", difficulty: 4, day: "tuesday" },
  { date: "2026-04-15", slot: 2, event: "Super Mario Bros Released", year: 1985, headline: "Nintendo released Super Mario Bros for the NES", difficulty: 5, day: "tuesday" },
  
  // April 16 (Wednesday)
  { date: "2026-04-16", slot: 0, event: "Tetris Released", year: 1984, headline: "Alexey Pajitnov released the puzzle game Tetris", difficulty: 5, day: "wednesday" },
  { date: "2026-04-16", slot: 1, event: "PlayStation Launched", year: 1994, headline: "Sony launched the PlayStation video game console", difficulty: 5, day: "wednesday" },
  { date: "2026-04-16", slot: 2, event: "Xbox Announced", year: 2001, headline: "Microsoft announced the Xbox gaming system", difficulty: 6, day: "wednesday" },
  
  // April 17 (Thursday)
  { date: "2026-04-17", slot: 0, event: "First iPod Released", year: 2001, headline: "Steve Jobs introduced the iPod", difficulty: 6, day: "thursday" },
  { date: "2026-04-17", slot: 1, event: "Netflix Streaming Launches", year: 2007, headline: "Netflix began streaming movies over the internet", difficulty: 6, day: "thursday" },
  { date: "2026-04-17", slot: 2, event: "Spotify Launches", year: 2008, headline: "Daniel Ek launched the music streaming service Spotify", difficulty: 7, day: "thursday" },
  
  // April 18 (Friday)
  { date: "2026-04-18", slot: 0, event: "Facebook Launched", year: 2004, headline: "Mark Zuckerberg launched Facebook from his Harvard dorm", difficulty: 7, day: "friday" },
  { date: "2026-04-18", slot: 1, event: "Twitter Launched", year: 2006, headline: "Jack Dorsey sent the first Twitter message", difficulty: 7, day: "friday" },
  { date: "2026-04-18", slot: 2, event: "Snapchat Launched", year: 2011, headline: "Evan Spiegel launched the disappearing photo app Snapchat", difficulty: 7, day: "friday" },
  
  // April 19 (Saturday)
  { date: "2026-04-19", slot: 0, event: "Bitcoin White Paper", year: 2008, headline: "Satoshi Nakamoto published the Bitcoin white paper", difficulty: 8, day: "saturday" },
  { date: "2026-04-19", slot: 1, event: "Ethereum Launches", year: 2015, headline: "Vitalik Buterin launched the Ethereum blockchain", difficulty: 8, day: "saturday" },
  { date: "2026-04-19", slot: 2, event: "First NFT Minted", year: 2014, headline: "Kevin McCoy minted the first NFT on the Namecoin blockchain", difficulty: 8, day: "saturday" },
  
  // April 20 (Sunday)
  { date: "2026-04-20", slot: 0, event: "Columbus Reaches Americas", year: 1492, headline: "Christopher Columbus reached the Caribbean islands", difficulty: 9, day: "sunday" },
  { date: "2026-04-20", slot: 1, event: "Magna Carta Signed", year: 1215, headline: "King John signed the Magna Carta in England", difficulty: 9, day: "sunday" },
  { date: "2026-04-20", slot: 2, event: "Shakespeare Born", year: 1564, headline: "William Shakespeare was born in Stratford-upon-Avon", difficulty: 9, day: "sunday" },
  
  // April 21 (Monday)
  { date: "2026-04-21", slot: 0, event: "Star Wars Released", year: 1977, headline: "George Lucas released Star Wars: A New Hope", difficulty: 3, day: "monday" },
  { date: "2026-04-21", slot: 1, event: "Jaws Released", year: 1975, headline: "Steven Spielberg released the thriller Jaws", difficulty: 3, day: "monday" },
  { date: "2026-04-21", slot: 2, event: "ET Released", year: 1982, headline: "Steven Spielberg released the film E.T.", difficulty: 4, day: "monday" },
  
  // April 22 (Tuesday)
  { date: "2026-04-22", slot: 0, event: "Jurassic Park Released", year: 1993, headline: "Steven Spielberg released Jurassic Park in theaters", difficulty: 4, day: "tuesday" },
  { date: "2026-04-22", slot: 1, event: "The Matrix Released", year: 1999, headline: "The Wachowskis released the film The Matrix", difficulty: 4, day: "tuesday" },
  { date: "2026-04-22", slot: 2, event: "Avatar Released", year: 2009, headline: "James Cameron released the highest-grossing film Avatar", difficulty: 5, day: "tuesday" },
  
  // April 23 (Wednesday)
  { date: "2026-04-23", slot: 0, event: "Sony Walkman Released", year: 1979, headline: "Sony released the Walkman portable cassette player", difficulty: 5, day: "wednesday" },
  { date: "2026-04-23", slot: 1, event: "VHS Format Introduced", year: 1976, headline: "The first VCR system used Sonys Umatic format", difficulty: 5, day: "wednesday" },
  { date: "2026-04-23", slot: 2, event: "CD Player Released", year: 1982, headline: "The first compact disc player was demonstrated in Japan", difficulty: 6, day: "wednesday" },
  
  // April 24 (Thursday)
  { date: "2026-04-24", slot: 0, event: "Kodak Founded", year: 1888, headline: "George Eastman founded the Kodak camera company", difficulty: 6, day: "thursday" },
  { date: "2026-04-24", slot: 1, event: "Polaroid Camera Released", year: 1948, headline: "Edwin Land demonstrated the first Polaroid camera", difficulty: 6, day: "thursday" },
  { date: "2026-04-24", slot: 2, event: "Digital Camera Invented", year: 1975, headline: "Steven Sasson invented the first digital camera", difficulty: 7, day: "thursday" },
  
  // April 25 (Friday)
  { date: "2026-04-25", slot: 0, event: "Ford Model T Released", year: 1908, headline: "Henry Ford began producing the Model T automobile", difficulty: 7, day: "friday" },
  { date: "2026-04-25", slot: 1, event: "First Commercial Airplane Flight", year: 1914, headline: "Tony Jannus flew the first commercial airline flight", difficulty: 7, day: "friday" },
  { date: "2026-04-25", slot: 2, event: "Wright Brothers Flight", year: 1903, headline: "Orville and Wilbur Wright achieved the first powered flight", difficulty: 7, day: "friday" },
  
  // April 26 (Saturday)
  { date: "2026-04-26", slot: 0, event: "Sputnik Launched", year: 1957, headline: "The Soviet Union launched the first artificial satellite", difficulty: 8, day: "saturday" },
  { date: "2026-04-26", slot: 1, event: "Hubble Telescope Launched", year: 1990, headline: "NASA launched the Hubble Space Telescope into orbit", difficulty: 8, day: "saturday" },
  { date: "2026-04-26", slot: 2, event: "Mars Pathfinder Landing", year: 1997, headline: "NASAs Sojourner rover landed on Mars", difficulty: 8, day: "saturday" },
  
  // April 27 (Sunday)
  { date: "2026-04-27", slot: 0, event: "Gutenberg Bible Printed", year: 1455, headline: "Johannes Gutenberg printed the first Bible with movable type", difficulty: 9, day: "sunday" },
  { date: "2026-04-27", slot: 1, event: "Roman Empire Falls", year: 476, headline: "The last Roman emperor was deposed, ending the Western Roman Empire", difficulty: 9, day: "sunday" },
  { date: "2026-04-27", slot: 2, event: "Great Fire of London", year: 1666, headline: "A massive fire destroyed most of medieval London", difficulty: 9, day: "sunday" },
  
  // April 28 (Monday)
  { date: "2026-04-28", slot: 0, event: "Beatles First Ed Sullivan Show", year: 1964, headline: "The Beatles made their historic U.S. debut on TV", difficulty: 3, day: "monday" },
  { date: "2026-04-28", slot: 1, event: "Woodstock Festival", year: 1969, headline: "400,000 people attended the Woodstock music festival", difficulty: 3, day: "monday" },
  { date: "2026-04-28", slot: 2, event: "Live Aid Concert", year: 1985, headline: "Bob Geldof organized Live Aid concerts in London and Philadelphia", difficulty: 4, day: "monday" },
  
  // April 29 (Tuesday)
  { date: "2026-04-29", slot: 0, event: "MTV Launches", year: 1981, headline: "MTV launched as the first 24-hour music video channel", difficulty: 4, day: "tuesday" },
  { date: "2026-04-29", slot: 1, event: "Napster Launches", year: 1999, headline: "Shawn Fning created the Napster file-sharing service", difficulty: 4, day: "tuesday" },
  { date: "2026-04-29", slot: 2, event: "iTunes Store Opens", year: 2003, headline: "Steve Jobs opened the iTunes Store with 200,000 songs", difficulty: 5, day: "tuesday" },
];

// Output as JSON
const output = puzzles.map((p, i) => ({
  id: i + 1,
  date: p.date,
  slot: p.slot,
  day_of_week: p.day,
  event: p.event,
  event_formal: p.event,
  year: p.year,
  headline: p.headline,
  description: "What year did this happen?",
  tier: 1,
  difficulty_rating: p.difficulty,
  clues: { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [] },
  context_card: "This event occurred in " + p.year + "."
}));

console.log("Generated", output.length, "puzzles");
console.log(JSON.stringify({ puzzles: output }, null, 2));
