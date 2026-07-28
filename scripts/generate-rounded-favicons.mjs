/**
 * Generates circular favicon assets from public/logo.png
 * Run: node scripts/generate-rounded-favicons.mjs
 */
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const source = path.join(root, "public", "logo.png");

async function makeRoundedIcon(size, output, { circle = true } = {}) {
  const radius = circle ? size / 2 : Math.round(size * 0.22);
  const mask = circle
    ? `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/></svg>`
    : `<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="white"/></svg>`;

  await sharp(source)
    .resize(size, size, { fit: "cover", position: "centre" })
    .ensureAlpha()
    .composite([{ input: Buffer.from(mask), blend: "dest-in" }])
    .png()
    .toFile(output);

  console.log(`Wrote ${output} (${size}x${size})`);
}

await makeRoundedIcon(512, path.join(root, "public", "logo-rounded-temp.png"));
await sharp(path.join(root, "public", "logo-rounded-temp.png"))
  .toFile(path.join(root, "public", "logo.png"));
const fs = await import("fs");
fs.unlinkSync(path.join(root, "public", "logo-rounded-temp.png"));
await makeRoundedIcon(512, path.join(root, "src", "app", "icon.png"));
await makeRoundedIcon(180, path.join(root, "src", "app", "apple-icon.png"));
await makeRoundedIcon(32, path.join(root, "public", "favicon-32.png"));

console.log("Done — favicons are now circular with transparent corners.");
