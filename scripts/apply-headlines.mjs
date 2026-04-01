/**
 * apply-headlines.mjs
 * Applies direct headlines + NYT-quality descriptions to puzzles.json.
 * Run: node scripts/apply-headlines.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const puzzlesPath = join(__dirname, '..', 'data/puzzles.json');

const PATCHES = {
  1: { headline: "Nelson Mandela Released From Prison", description: "After 27 years behind bars, the world's most famous political prisoner walked free — electrifying a nation on the brink of transformation.", difficulty_rating: 4 },
  2: { headline: "The Apollo 11 Moon Landing", description: "Two astronauts left bootprints in lunar dust while 600 million people watched on flickering television screens back home.", difficulty_rating: 3 },
  3: { headline: "The Titanic Sinks on Maiden Voyage", description: 'The "unsinkable" ocean liner struck an iceberg in the North Atlantic, taking more than 1,500 souls with her to the bottom.', difficulty_rating: 3 },
  4: { headline: "JFK Assassinated in Dallas", description: "A motorcade through Dealey Plaza ended the presidency and fractured a nation's sense of innocence in a matter of seconds.", difficulty_rating: 4 },
  5: { headline: "World Wide Web Invented", description: "A British physicist at CERN proposed a system of interlinked hypertext documents — and quietly set the stage for the modern internet.", difficulty_rating: 5 },
  6: { headline: "Chernobyl Nuclear Disaster", description: "A botched safety test at a Soviet power plant in Ukraine triggered the worst nuclear accident in history, spreading fallout across Europe.", difficulty_rating: 5 },
  7: { headline: "D-Day: Allied Invasion of Normandy", description: "More than 150,000 troops crossed the English Channel in the largest amphibious assault ever attempted, storming five beaches at dawn.", difficulty_rating: 6 },
  8: { headline: "First iPhone Released", description: "Steve Jobs pulled a sleek rectangle from his pocket onstage in San Francisco and casually redefined what a phone could be.", difficulty_rating: 5 },
  9: { headline: "The Watergate Break-In", description: "Five men were caught burglarizing the Democratic National Committee headquarters, setting off a scandal that would consume the presidency.", difficulty_rating: 7 },
  10: { headline: "Atomic Bomb Dropped on Hiroshima", description: "A single bomb obliterated a Japanese city in seconds, ushering humanity into the nuclear age with a blinding flash visible for miles.", difficulty_rating: 6 },
  11: { headline: "Fall of the Soviet Union", description: "The red flag came down over the Kremlin for the last time, ending a superpower and redrawing the map of Eurasia overnight.", difficulty_rating: 6 },
  12: { headline: "The Wright Brothers' First Flight", description: "On a windy stretch of North Carolina sand, two bicycle mechanics from Ohio kept a powered aircraft aloft for twelve glorious seconds.", difficulty_rating: 6 },
  13: { headline: "Lindbergh Flies Solo Across the Atlantic", description: "A lanky 25-year-old from Minnesota landed in Paris after 33 hours alone in a single-engine monoplane, becoming the most famous person on Earth.", difficulty_rating: 7 },
  14: { headline: "The Cuban Missile Crisis", description: "For thirteen days the world held its breath as Washington and Moscow edged toward nuclear war over Soviet weapons stationed 90 miles from Florida.", difficulty_rating: 8 },
  15: { headline: "Rosa Parks Refuses to Give Up Her Seat", description: "A seamstress in Montgomery, Alabama declined to move to the back of a city bus, igniting a 381-day boycott that changed the nation.", difficulty_rating: 7 },
  16: { headline: "The Challenger Disaster", description: "A space shuttle broke apart 73 seconds after launch as millions — including schoolchildren watching live — looked on in horror.", difficulty_rating: 8 },
  17: { headline: "The September 11 Attacks", description: "Hijacked airliners struck the World Trade Center and the Pentagon on a clear Tuesday morning, reshaping American life and global politics.", difficulty_rating: 8 },
  18: { headline: "Attack on Pearl Harbor", description: "Japanese aircraft swarmed a naval base in Hawaii early on a Sunday morning, sinking battleships and pulling a reluctant nation into world war.", difficulty_rating: 8 },
  19: { headline: "First Human in Space", description: "A Soviet cosmonaut orbited the Earth in 108 minutes, beating the Americans to the ultimate Cold War trophy and becoming an instant global celebrity.", difficulty_rating: 3 },
  20: { headline: "French Revolution Begins", description: "A Parisian mob stormed a medieval fortress-prison, toppling a symbol of royal tyranny and launching a decade of radical upheaval across Europe.", difficulty_rating: 3 },
  21: { headline: "Declaration of Independence Signed", description: "Delegates from thirteen colonies affixed their names to a document declaring self-governance — committing what the Crown would call treason.", difficulty_rating: 2 },
  22: { headline: 'MLK\'s "I Have a Dream" Speech', description: "Before a quarter-million people gathered at the Lincoln Memorial, a Baptist preacher from Atlanta delivered the defining oration of the civil rights movement.", difficulty_rating: 4 },
  23: { headline: "First Email Sent", description: "An engineer in Cambridge, Massachusetts transmitted a short test message between two computers sitting ten feet apart — and invented a new way for humanity to communicate.", difficulty_rating: 5 },
  24: { headline: "Google Founded", description: "Two Stanford PhD students launched a search engine from a rented garage in Menlo Park, convinced they could organize all the world's information.", difficulty_rating: 5 },
  25: { headline: "Amazon Founded", description: "A former Wall Street hedge fund VP started an online bookstore out of his garage in Bellevue, Washington, betting big on the nascent internet.", difficulty_rating: 6 },
  26: { headline: "DNA Double Helix Discovered", description: "Two scientists at Cambridge University pieced together the twisted-ladder architecture of life itself, working from a crucial X-ray photograph they didn't take.", difficulty_rating: 5 },
  27: { headline: "HIV/AIDS First Identified", description: "The CDC reported a mysterious cluster of pneumonia cases among young men in Los Angeles, the first public signal of an epidemic that would reshape medicine and culture.", difficulty_rating: 6 },
  28: { headline: "First Human Heart Transplant", description: "A South African surgeon in Cape Town replaced a dying man's heart with a donor's — a three-hour operation that captivated the world.", difficulty_rating: 6 },
  29: { headline: "Polio Vaccine Announced", description: 'A University of Pittsburgh researcher declared his vaccine "safe, effective, and potent," ending years of summertime dread for parents across America.', difficulty_rating: 6 },
  30: { headline: "Penicillin Discovered", description: "A Scottish bacteriologist returned from holiday to find mold killing bacteria in a petri dish he'd left by an open window — a lucky accident that would save millions of lives.", difficulty_rating: 6 },
  31: { headline: "Instagram Launched", description: "A photo-sharing app with retro filters launched to an iPhone-only audience and gained 25,000 users on its first day, turning square-cropped snapshots into a cultural language.", difficulty_rating: 7 },
  32: { headline: "YouTube Founded", description: "Three former PayPal employees registered a domain for sharing video clips online. The first upload — a 19-second clip filmed at the San Diego Zoo — hardly hinted at what was coming.", difficulty_rating: 7 },
  33: { headline: "Wikipedia Launched", description: "A free online encyclopedia invited anyone with an internet connection to write and edit its articles, betting that collective knowledge could rival centuries-old reference institutions.", difficulty_rating: 7 },
  34: { headline: "Euro Currency Introduced", description: "Twelve European nations abandoned centuries of national currencies for a shared coin — the most ambitious monetary experiment since Bretton Woods.", difficulty_rating: 7 },
  35: { headline: "Nintendo Game Boy Released", description: "A handheld console with a pea-green monochrome screen and a bundled puzzle game outsold every technologically superior rival, proving that portability trumped pixel count.", difficulty_rating: 7 },
  36: { headline: "Black Tuesday Stock Crash", description: "The New York Stock Exchange lost roughly 12% of its value in a single session, accelerating a financial collapse that would define a generation's relationship with money.", difficulty_rating: 8 },
  37: { headline: "First Photograph Taken", description: "A French inventor exposed a pewter plate coated in bitumen to light from his workshop window. The exposure took hours, capturing rooftops in a ghostly, revolutionary image.", difficulty_rating: 9 },
  38: { headline: "First Telegraph Message Sent", description: "A message traveled instantaneously along a wire strung between Washington and Baltimore, compressing distance in a way humanity had never experienced. The words chosen were biblical.", difficulty_rating: 9 },
  39: { headline: "Printing Press Invented", description: "A German goldsmith in Mainz combined movable metal type, oil-based ink, and a wooden screw press, producing books at a pace that would dismantle the medieval monopoly on knowledge.", difficulty_rating: 9 },
  40: { headline: "American Civil War Begins", description: "Confederate batteries opened fire on a federal fort in Charleston Harbor before dawn, igniting the bloodiest conflict in American history after decades of sectional tension over slavery.", difficulty_rating: 2 },
  41: { headline: "Spanish Flu Pandemic Begins", description: "A devastating influenza strain swept across a world still entangled in the Great War, eventually killing more people than the conflict itself.", difficulty_rating: 3 },
  42: { headline: "Elvis Presley's First TV Appearance", description: "A young truck driver from Memphis performed on national television, and his swiveling hips scandalized parents while sending teenage viewership through the roof.", difficulty_rating: 3 },
  43: { headline: "First McDonald's Franchise Opens", description: "A milkshake machine salesman opened a franchised hamburger stand in suburban Illinois, applying assembly-line efficiency to the American lunch counter.", difficulty_rating: 4 },
  44: { headline: "Disneyland Opens", description: "An animator-turned-mogul converted 160 acres of Anaheim orange groves into a themed amusement park, inviting television cameras to broadcast opening day to millions.", difficulty_rating: 4 },
  45: { headline: "First Barbie Doll Released", description: "A toy company executive introduced an 11.5-inch fashion doll at the American Toy Fair in New York, giving girls a plaything modeled on adult aspiration rather than infant care.", difficulty_rating: 5 },
  46: { headline: "Pac-Man Released", description: "A Japanese arcade game starring a yellow disc that devoured dots in a maze became a global phenomenon, attracting players who had never touched a joystick.", difficulty_rating: 5 },
  47: { headline: "Super Mario Bros Released", description: "A mustachioed plumber sprinted across side-scrolling worlds on a home console, reviving a crashed video game industry and defining platforming for a generation.", difficulty_rating: 5 },
  48: { headline: "Tetris Released", description: "A Soviet computer scientist created a deceptively simple puzzle game involving falling geometric shapes. It escaped the Iron Curtain to become one of the most addictive programs ever written.", difficulty_rating: 6 },
  49: { headline: "PlayStation Launched", description: "A Japanese electronics giant — better known for Walkmans and televisions — entered the console market with a CD-based system that lured developers away from cartridge rivals.", difficulty_rating: 6 },
  50: { headline: "Xbox Announced", description: "A software company best known for office productivity and operating systems revealed its first video game console, challenging two entrenched Japanese competitors.", difficulty_rating: 6 },
  51: { headline: "First iPod Released", description: "A computer company unveiled a pocket-sized device promising a thousand songs in your pocket, pairing a tiny hard drive with a satisfying click wheel.", difficulty_rating: 6 },
  52: { headline: "Netflix Streaming Launches", description: "A DVD-by-mail company began letting subscribers watch movies directly through their web browsers, betting that broadband speeds had finally caught up to the idea.", difficulty_rating: 7 },
  53: { headline: "Spotify Launches", description: "A Swedish startup offered millions of songs on demand for free — legally — funded by advertising, challenging the decade-long piracy crisis that had gutted the music industry.", difficulty_rating: 7 },
  54: { headline: "Facebook Launched", description: "A Harvard sophomore opened a social networking site restricted to college students with .edu email addresses. Within weeks, it had spread to dozens of campuses.", difficulty_rating: 7 },
  55: { headline: "Twitter Launched", description: "A microblogging platform limited posts to 140 characters, distilling the internet's chatter into a real-time stream that would reshape journalism and political communication.", difficulty_rating: 7 },
  56: { headline: "Snapchat Launched", description: "A messaging app built around photos that disappeared after viewing launched from a Stanford dorm room, inverting social media's assumption that everything should be permanent.", difficulty_rating: 8 },
  57: { headline: "Bitcoin White Paper Published", description: "A pseudonymous author posted a nine-page paper to a cryptography mailing list describing a peer-to-peer electronic cash system that required no trusted third party.", difficulty_rating: 8 },
  58: { headline: "Ethereum Launches", description: "A blockchain network went live promising not just digital currency but programmable smart contracts — a world computer that anyone could build on without permission.", difficulty_rating: 9 },
  59: { headline: "First NFT Minted", description: "An artist created a unique digital token on a blockchain, attaching verifiable ownership to a piece of digital media in a way that had never been possible before.", difficulty_rating: 9 },
  60: { headline: "Columbus Reaches the Americas", description: "A Genoese navigator sailing under the Spanish crown made landfall on a Caribbean island, believing he had reached Asia. The miscalculation changed the course of two hemispheres.", difficulty_rating: 10 },
  61: { headline: "Magna Carta Signed", description: "English barons forced King John to seal a charter at Runnymede, limiting royal power for the first time — a document that would outlive every monarch who tried to ignore it.", difficulty_rating: 4 },
  62: { headline: "Shakespeare Born", description: "A glover's son arrived in Stratford-upon-Avon during a plague year, destined to give the English language more new words than any other writer before or since.", difficulty_rating: 4 },
  63: { headline: "Star Wars Released", description: "A space opera that every studio in Hollywood had rejected finally reached theaters, and nothing about the movie business was ever quite the same.", difficulty_rating: 3 },
  64: { headline: "Jaws Released", description: "A mechanical shark that barely worked turned a young director's nightmare production into the first true summer blockbuster, and beach attendance dropped nationwide.", difficulty_rating: 3 },
  65: { headline: "E.T. the Extra-Terrestrial Released", description: "Spielberg's gentle alien stranded in suburban California became the highest-grossing film of its era, proving that a puppet and a child actor could outperform any special effect.", difficulty_rating: 4 },
  66: { headline: "Jurassic Park Released", description: "Computer-generated dinosaurs sprinted across the screen for the first time, and practical effects artists everywhere felt a tremor that had nothing to do with a T. rex.", difficulty_rating: 4 },
  67: { headline: "The Matrix Released", description: "Bullet time, leather trenchcoats, and a red pill entered the cultural lexicon overnight, as two sibling directors reimagined what an action film could look like.", difficulty_rating: 4 },
  68: { headline: "Avatar Released", description: "James Cameron bet everything on a film set on an alien moon, shot in 3D with technology that didn't exist when he started — and it became the highest-grossing movie in history.", difficulty_rating: 5 },
  69: { headline: "Sony Walkman Released", description: "A portable cassette player small enough to clip to your belt arrived from Tokyo, and for the first time, music became a truly private experience in public space.", difficulty_rating: 5 },
  70: { headline: "VHS Format Introduced", description: "A Japanese electronics company introduced a home video cassette format that would win a brutal standards war and turn every living room into a private cinema.", difficulty_rating: 5 },
  71: { headline: "CD Player Released", description: "A silver disc promising perfect sound forever went on sale, and vinyl purists immediately began an argument that still hasn't ended.", difficulty_rating: 6 },
  72: { headline: "Kodak Camera Introduced", description: "George Eastman unveiled a simple box camera with the slogan 'You press the button, we do the rest' — photography was no longer reserved for professionals with darkrooms.", difficulty_rating: 6 },
  73: { headline: "Polaroid Camera Released", description: "Edwin Land's instant camera produced a finished photograph in sixty seconds, a trick so astonishing that people gathered in crowds to watch the image appear.", difficulty_rating: 6 },
  74: { headline: "Digital Camera Invented", description: "An engineer at Kodak cobbled together a toaster-sized device that captured an image on a digital sensor — his employer buried the invention, sensing it would destroy their film business.", difficulty_rating: 7 },
  75: { headline: "Ford Model T Released", description: "Henry Ford's affordable automobile rolled off the line in Detroit, and within a decade the horse-drawn carriage became a quaint relic of another century.", difficulty_rating: 7 },
  76: { headline: "First Commercial Airplane Flight", description: "A paying passenger climbed aboard a Benoist flying boat in St. Petersburg, Florida, for a twenty-three-minute trip across Tampa Bay — the airline industry's very first ticket.", difficulty_rating: 7 },
  77: { headline: "Sputnik Launched", description: "A polished metal sphere the size of a beach ball began circling the Earth, its steady beep audible on ham radios worldwide — and the space race was on.", difficulty_rating: 8 },
  78: { headline: "Hubble Space Telescope Launched", description: "NASA placed a school-bus-sized telescope in orbit, only to discover its primary mirror had been ground to the wrong shape — a flaw that would require the most ambitious repair in space history.", difficulty_rating: 8 },
  79: { headline: "Mars Pathfinder Landing", description: "A small rover named Sojourner rolled off a landing platform onto Martian soil, beaming back photographs of a rust-colored landscape no wheel had ever touched.", difficulty_rating: 8 },
  80: { headline: "Gutenberg Bible Printed", description: "A goldsmith in Mainz produced the first major book printed with movable metal type, a technical feat that would dismantle the Church's monopoly on knowledge within a generation.", difficulty_rating: 9 },
  81: { headline: "Fall of the Western Roman Empire", description: "A teenage emperor was deposed by a Germanic chieftain, and the political entity that had governed western Europe for centuries quietly ceased to exist.", difficulty_rating: 9 },
  82: { headline: "Great Fire of London", description: "A bakery fire on Pudding Lane spread through timber-framed streets for four days, leveling most of the medieval city — and inadvertently ending the plague that had ravaged it the year before.", difficulty_rating: 4 },
  83: { headline: "The Beatles on Ed Sullivan", description: "Four young men from Liverpool performed on American television to a studio audience of screaming teenagers, and seventy-three million viewers at home watched the culture shift in real time.", difficulty_rating: 3 },
  84: { headline: "Woodstock Festival", description: "Half a million people descended on a dairy farm in upstate New York for three days of music and mud, creating the defining gathering of the counterculture era.", difficulty_rating: 3 },
  85: { headline: "Live Aid Concert", description: "Bob Geldof organized a simultaneous rock concert in London and Philadelphia, broadcast to nearly two billion viewers, turning stadium music into a vehicle for global famine relief.", difficulty_rating: 4 },
  86: { headline: "MTV Launches", description: "A new cable channel began broadcasting music videos around the clock, opening with a Buggles clip whose title turned out to be prophetic — 'Video Killed the Radio Star.'", difficulty_rating: 4 },
  87: { headline: "Napster Launches", description: "A college dropout's file-sharing program let anyone with an internet connection download almost any song for free, and the music industry's business model collapsed virtually overnight.", difficulty_rating: 4 },
  88: { headline: "iTunes Store Opens", description: "Apple offered legal music downloads for ninety-nine cents per song, giving the recording industry a lifeline after years of rampant piracy.", difficulty_rating: 4 },
  89: { headline: "The Berlin Wall Falls", description: "East German border guards, overwhelmed by crowds and confused by a bungled press conference, stepped aside — and thousands poured through checkpoints sealed for a generation.", difficulty_rating: 4 },
  90: { headline: "World War I Begins", description: "The assassination of an archduke in Sarajevo triggered a chain of alliances and ultimatums that, within weeks, plunged the great powers of Europe into the most devastating conflict the world had yet seen.", difficulty_rating: 5 },
};

const data = JSON.parse(readFileSync(puzzlesPath, 'utf-8'));
let count = 0;

for (const puzzle of data.puzzles) {
  const patch = PATCHES[puzzle.id];
  if (!patch) continue;
  puzzle.headline = patch.headline;
  puzzle.description = patch.description;
  puzzle.difficulty_rating = patch.difficulty_rating;
  count++;
}

writeFileSync(puzzlesPath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
console.log(`Updated ${count} puzzles with direct headlines + descriptions.`);
