/**
 * Download puzzle images from Wikimedia Commons.
 *
 * Usage: npx tsx scripts/download-images.ts
 *
 * - Reads puzzles.json, resolves Wikimedia Commons URLs via their API
 * - Downloads, resizes to 1200px wide, converts to WebP (<200KB target)
 * - Skips SVGs and non-Commons URLs (prints a report)
 * - Idempotent: skips files that already exist
 * - Rate-limited: 1 second between requests
 */

import fs from "fs";
import path from "path";
import sharp from "sharp";

interface PuzzleData {
  id: number;
  image: string;
  image_source_url: string;
  event: string;
}

const PUZZLES_PATH = path.join(__dirname, "../data/puzzles.json");
const OUTPUT_DIR = path.join(__dirname, "../public/images/puzzles");
const MAX_WIDTH = 1200;
const WEBP_QUALITY = 80;
const RATE_LIMIT_MS = 1000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Extract the Wikimedia Commons filename from a URL.
 * Handles URLs like:
 *   https://commons.wikimedia.org/wiki/File:Something.jpg
 *   https://upload.wikimedia.org/wikipedia/commons/...
 */
function extractCommonsFilename(url: string): string | null {
  // Pattern: /wiki/File:Filename.ext
  const fileMatch = url.match(/\/wiki\/File:(.+)$/i);
  if (fileMatch) {
    return decodeURIComponent(fileMatch[1]);
  }

  // Pattern: upload URL — extract filename from path
  const uploadMatch = url.match(/\/wikipedia\/commons\/[a-f0-9]\/[a-f0-9]{2}\/(.+)$/i);
  if (uploadMatch) {
    return decodeURIComponent(uploadMatch[1]);
  }

  return null;
}

/**
 * Use the Wikimedia Commons API to get a direct image URL for a file.
 */
async function getDirectImageUrl(filename: string): Promise<string | null> {
  const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(filename)}&prop=imageinfo&iiprop=url|mime&iiurlwidth=${MAX_WIDTH}&format=json`;

  const res = await fetch(apiUrl);
  if (!res.ok) return null;

  const data = await res.json();
  const pages = data.query?.pages;
  if (!pages) return null;

  const page = Object.values(pages)[0] as { imageinfo?: { url: string; thumburl?: string; mime: string }[] };
  const info = page?.imageinfo?.[0];
  if (!info) return null;

  // Skip SVG files
  if (info.mime === "image/svg+xml") {
    return null;
  }

  // Prefer the thumbnail URL (already resized) or fall back to full URL
  return info.thumburl || info.url;
}

async function downloadAndProcess(url: string, outputPath: string): Promise<boolean> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`  HTTP ${res.status} for ${url}`);
      return false;
    }

    const buffer = Buffer.from(await res.arrayBuffer());

    await sharp(buffer)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toFile(outputPath);

    const stats = fs.statSync(outputPath);
    const sizeKB = Math.round(stats.size / 1024);
    console.log(`  Saved: ${path.basename(outputPath)} (${sizeKB}KB)`);
    return true;
  } catch (err) {
    console.error(`  Error processing: ${(err as Error).message}`);
    return false;
  }
}

async function main() {
  // Read puzzles
  const raw = fs.readFileSync(PUZZLES_PATH, "utf-8");
  const data = JSON.parse(raw);
  const puzzles: PuzzleData[] = data.puzzles;

  // Ensure output directory
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;
  const needsManualFix: { id: number; event: string; reason: string }[] = [];

  for (const puzzle of puzzles) {
    const outputFilename = puzzle.image.split("/").pop()!;
    const outputPath = path.join(OUTPUT_DIR, outputFilename);

    console.log(`\n[#${puzzle.id}] ${puzzle.event}`);

    // Skip if already downloaded
    if (fs.existsSync(outputPath)) {
      console.log(`  Already exists, skipping`);
      skipped++;
      continue;
    }

    const sourceUrl = puzzle.image_source_url;

    // Check if it's a Wikimedia Commons URL
    if (!sourceUrl.includes("wikimedia.org") && !sourceUrl.includes("wikipedia.org")) {
      console.log(`  Not a Wikimedia URL: ${sourceUrl}`);
      needsManualFix.push({ id: puzzle.id, event: puzzle.event, reason: "Not a Wikimedia URL" });
      failed++;
      continue;
    }

    const filename = extractCommonsFilename(sourceUrl);
    if (!filename) {
      console.log(`  Could not extract filename from: ${sourceUrl}`);
      needsManualFix.push({ id: puzzle.id, event: puzzle.event, reason: "Could not parse URL" });
      failed++;
      continue;
    }

    console.log(`  File: ${filename}`);

    const directUrl = await getDirectImageUrl(filename);
    if (!directUrl) {
      console.log(`  Could not resolve direct URL (may be SVG)`);
      needsManualFix.push({ id: puzzle.id, event: puzzle.event, reason: "SVG or API failure" });
      failed++;
      continue;
    }

    const success = await downloadAndProcess(directUrl, outputPath);
    if (success) {
      downloaded++;
    } else {
      needsManualFix.push({ id: puzzle.id, event: puzzle.event, reason: "Download/processing failed" });
      failed++;
    }

    await sleep(RATE_LIMIT_MS);
  }

  // Summary
  console.log("\n=== SUMMARY ===");
  console.log(`Downloaded: ${downloaded}`);
  console.log(`Already existed: ${skipped}`);
  console.log(`Failed: ${failed}`);

  if (needsManualFix.length > 0) {
    console.log("\nNeed manual fix:");
    for (const item of needsManualFix) {
      console.log(`  #${item.id} ${item.event} — ${item.reason}`);
    }
  }
}

main().catch(console.error);
