/**
 * Composites Figma exports in assets/_figma_export into Expo icon / splash / favicon.
 * Re-run after re-exporting from Figma: `npm run build:assets`
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = path.join(__dirname, '..');
const assets = path.join(root, 'assets');
const figma = path.join(assets, '_figma_export');

const BG = { r: 0x5b, g: 0xaa, b: 0x00, alpha: 1 };
const BG_HEX = '#5BAA00';

async function main() {
  const smileyPath = path.join(figma, 'mark-smiley.png');
  const wordmarkPath = path.join(figma, 'logo-wordmark.png');

  if (!fs.existsSync(smileyPath) || !fs.existsSync(wordmarkPath)) {
    console.error('Missing Figma exports. Expected:', smileyPath, wordmarkPath);
    process.exit(1);
  }

  const iconSize = 1024;
  const smileySize = Math.round(iconSize * 0.52);
  const smileyBuf = await sharp(smileyPath).resize(smileySize, smileySize, { fit: 'contain' }).png().toBuffer();

  await sharp({
    create: {
      width: iconSize,
      height: iconSize,
      channels: 4,
      background: BG,
    },
  })
    .composite([{ input: smileyBuf, gravity: 'center' }])
    .png()
    .toFile(path.join(assets, 'icon.png'));

  await sharp({
    create: {
      width: iconSize,
      height: iconSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: smileyBuf, gravity: 'center' }])
    .png()
    .toFile(path.join(assets, 'adaptive-icon.png'));

  const wmTargetW = Math.round(iconSize * 0.88);
  const wordmarkBuf = await sharp(wordmarkPath).resize({ width: wmTargetW }).png().toBuffer();

  await sharp({
    create: {
      width: iconSize,
      height: iconSize,
      channels: 4,
      background: BG,
    },
  })
    .composite([{ input: wordmarkBuf, gravity: 'center' }])
    .png()
    .toFile(path.join(assets, 'splash-icon.png'));

  await sharp(smileyPath)
    .resize(64, 64, { fit: 'contain', background: BG_HEX })
    .png()
    .toFile(path.join(assets, 'favicon.png'));

  await sharp(smileyPath)
    .resize({ width: 56 })
    .png()
    .toFile(path.join(assets, 'smiley-mark.png'));

  await sharp(wordmarkPath)
    .resize({ width: 280 })
    .png()
    .toFile(path.join(assets, 'logo-wordmark.png'));

  console.log(
    'Wrote icon.png, adaptive-icon.png, splash-icon.png, favicon.png, smiley-mark.png, logo-wordmark.png',
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
