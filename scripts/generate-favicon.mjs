import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// SVG temple icon: white background, dark navy columns/pediment
// Matches the 🏛️ concept without relying on emoji font rendering
const svg32 = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
  <rect width="32" height="32" fill="white"/>
  <!-- Base step -->
  <rect x="3" y="27" width="26" height="3" fill="#0f0f1a" rx="1"/>
  <!-- Columns (3 pillars) -->
  <rect x="6"  y="13" width="4" height="14" fill="#0f0f1a" rx="1"/>
  <rect x="14" y="13" width="4" height="14" fill="#0f0f1a" rx="1"/>
  <rect x="22" y="13" width="4" height="14" fill="#0f0f1a" rx="1"/>
  <!-- Entablature (horizontal bar) -->
  <rect x="3" y="10" width="26" height="3" fill="#0f0f1a" rx="1"/>
  <!-- Pediment (triangle) -->
  <polygon points="16,2 3,10 29,10" fill="#0f0f1a"/>
</svg>`;

const svg16 = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
  <rect width="16" height="16" fill="white"/>
  <rect x="1" y="13" width="14" height="2" fill="#0f0f1a" rx="1"/>
  <rect x="2"  y="7" width="3" height="6" fill="#0f0f1a" rx="1"/>
  <rect x="6"  y="7" width="3" height="6" fill="#0f0f1a" rx="1"/>
  <rect x="11" y="7" width="3" height="6" fill="#0f0f1a" rx="1"/>
  <rect x="1"  y="5" width="14" height="2" fill="#0f0f1a" rx="1"/>
  <polygon points="8,1 1,5 15,5" fill="#0f0f1a"/>
</svg>`;

async function buildIco() {
  const png32 = await sharp(Buffer.from(svg32)).png().toBuffer();
  const png16 = await sharp(Buffer.from(svg16)).png().toBuffer();

  // ICO format: supports embedded PNG data (Vista+)
  // ICONDIR (6 bytes) + 2x ICONDIRENTRY (16 bytes each) + PNG data
  const headerSize = 6;
  const entrySize = 16;
  const numImages = 2;
  const dataOffset = headerSize + entrySize * numImages;

  const ico = Buffer.alloc(dataOffset + png32.length + png16.length);
  let pos = 0;

  // ICONDIR
  ico.writeUInt16LE(0, pos); pos += 2;       // reserved
  ico.writeUInt16LE(1, pos); pos += 2;       // type: 1 = icon
  ico.writeUInt16LE(numImages, pos); pos += 2;

  // ICONDIRENTRY for 32x32
  ico.writeUInt8(32, pos); pos++;            // width
  ico.writeUInt8(32, pos); pos++;            // height
  ico.writeUInt8(0, pos);  pos++;            // color count (0 = no palette)
  ico.writeUInt8(0, pos);  pos++;            // reserved
  ico.writeUInt16LE(1, pos); pos += 2;       // planes
  ico.writeUInt16LE(32, pos); pos += 2;      // bit count
  ico.writeUInt32LE(png32.length, pos); pos += 4;
  ico.writeUInt32LE(dataOffset + png16.length, pos); pos += 4; // offset

  // ICONDIRENTRY for 16x16
  ico.writeUInt8(16, pos); pos++;
  ico.writeUInt8(16, pos); pos++;
  ico.writeUInt8(0, pos);  pos++;
  ico.writeUInt8(0, pos);  pos++;
  ico.writeUInt16LE(1, pos); pos += 2;
  ico.writeUInt16LE(32, pos); pos += 2;
  ico.writeUInt32LE(png16.length, pos); pos += 4;
  ico.writeUInt32LE(dataOffset, pos); pos += 4;        // offset (16x16 first)

  // PNG data (16x16 first, then 32x32 — matching offsets above)
  png16.copy(ico, dataOffset);
  png32.copy(ico, dataOffset + png16.length);

  const outPath = join(__dirname, '../app/favicon.ico');
  writeFileSync(outPath, ico);
  console.log(`favicon.ico written to ${outPath} (${ico.length} bytes)`);
}

buildIco().catch(err => { console.error(err); process.exit(1); });
