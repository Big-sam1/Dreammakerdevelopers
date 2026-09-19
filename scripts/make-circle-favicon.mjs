import sharp from 'sharp';
import fs from 'fs';

async function generateCircleFavicon() {
  const inputPath = 'public/favicon.jpeg';
  const size = 512;
  const radius = size / 2;

  // Create circular mask
  const circleSvg = Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${radius}" cy="${radius}" r="${radius - 2}" fill="#fff"/></svg>`
  );

  // Lime ring border matching DMD brand
  const ringSvg = Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${radius}" cy="${radius}" r="${radius - 6}" fill="none" stroke="#d6f32f" stroke-width="12"/></svg>`
  );

  // Composite with circle mask
  const circlePng = await sharp(inputPath)
    .resize(size, size, { fit: 'cover' })
    .composite([
      { input: circleSvg, blend: 'dest-in' },
      { input: ringSvg, blend: 'over' }
    ])
    .png()
    .toBuffer();

  fs.writeFileSync('public/favicon.png', circlePng);
  fs.writeFileSync('src/data/favicon.png', circlePng);

  // 32x32 ico
  const icoPng = await sharp(circlePng).resize(32, 32).png().toBuffer();
  fs.writeFileSync('public/favicon.ico', icoPng);

  // SVG with embedded circle
  const base64Png = circlePng.toString('base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512">
  <image width="512" height="512" href="data:image/png;base64,${base64Png}" xlink:href="data:image/png;base64,${base64Png}"/>
</svg>`;
  fs.writeFileSync('public/favicon.svg', svgContent);

  console.log('SUCCESS: Generated circular favicon.png, favicon.ico, and favicon.svg');
}

generateCircleFavicon().catch(console.error);
