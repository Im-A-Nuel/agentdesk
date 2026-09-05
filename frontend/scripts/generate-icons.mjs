// Renders public/icon.svg to PNG sizes and packages them as a favicon.ico (PNG-embedded)
// plus an apple-touch-icon.png. Run with: npm run generate:icons

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";

const svg = readFileSync(resolve("public", "icon.svg"));

const sizes = [16, 32, 48, 64, 128, 256];
const pngs = [];
for (const size of sizes) {
  const png = await sharp(svg).resize(size, size).png().toBuffer();
  pngs.push({ size, data: png });
}

function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  const entries = [];
  let offset = 6 + 16 * images.length;
  for (const { size, data } of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += data.length;
  }

  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

writeFileSync(resolve("public", "favicon.ico"), buildIco(pngs));

const appleTouch = await sharp(svg).resize(180, 180).png().toBuffer();
writeFileSync(resolve("public", "apple-touch-icon.png"), appleTouch);

console.log("favicon.ico + apple-touch-icon.png generated from public/icon.svg");