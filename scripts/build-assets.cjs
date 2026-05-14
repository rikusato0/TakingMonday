/**
 * Generates Expo icon / splash / favicon from assets/brand-header.png.
 * Replace brand-header.png when the logo changes, then: npm run build:assets
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = path.join(__dirname, '..');
const assets = path.join(root, 'assets');
const sourcePath = path.join(assets, 'brand-header.png');

const BG = { r: 5, g: 5, b: 5, alpha: 1 }; // #050505 — matches app.json splash / adaptive background

async function resizedLogo(maxDim) {
  return sharp(sourcePath)
    .resize(maxDim, maxDim, { fit: 'inside', withoutEnlargement: false })
    .png()
    .toBuffer();
}

async function writeSquareIcon(outName, size, logoMax) {
  const logoBuf = await resizedLogo(logoMax);
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BG,
    },
  })
    .composite([{ input: logoBuf, gravity: 'center' }])
    .png()
    .toFile(path.join(assets, outName));
}

async function main() {
  if (!fs.existsSync(sourcePath)) {
    console.error('Missing brand header. Add:\n  ', sourcePath);
    process.exit(1);
  }

  const iconSize = 1024;
  await writeSquareIcon('icon.png', iconSize, Math.round(iconSize * 0.88));
  await writeSquareIcon('splash-icon.png', iconSize, Math.round(iconSize * 0.9));
  /** Tighter fit so wide art stays inside Android adaptive icon safe zone. */
  await writeSquareIcon('adaptive-icon.png', iconSize, Math.round(iconSize * 0.62));

  await sharp(sourcePath)
    .resize(64, 64, { fit: 'inside', background: BG })
    .flatten({ background: BG })
    .png()
    .toFile(path.join(assets, 'favicon.png'));

  console.log('Wrote icon.png, adaptive-icon.png, splash-icon.png, favicon.png from brand-header.png');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
