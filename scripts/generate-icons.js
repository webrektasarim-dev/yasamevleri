const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateIcons() {
  const publicDir = path.join(__dirname, '..', 'public');
  
  // Create a simple SVG icon with the site initials "ÖYE" (Örnek Yaşam Evleri)
  const createSVG = (size) => `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#18181b;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#27272a;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.15}"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.35}" 
            font-weight="bold" fill="white" text-anchor="middle" 
            dominant-baseline="central">ÖYE</text>
    </svg>
  `;

  try {
    // Generate 192x192 icon
    await sharp(Buffer.from(createSVG(192)))
      .png()
      .toFile(path.join(publicDir, 'icon-192.png'));
    console.log('✓ Generated icon-192.png');

    // Generate 512x512 icon
    await sharp(Buffer.from(createSVG(512)))
      .png()
      .toFile(path.join(publicDir, 'icon-512.png'));
    console.log('✓ Generated icon-512.png');

    // Generate favicon (using 192 size but saved as different name)
    await sharp(Buffer.from(createSVG(192)))
      .resize(32, 32)
      .png()
      .toFile(path.join(publicDir, 'favicon.png'));
    console.log('✓ Generated favicon.png');

    console.log('\n✅ All icons generated successfully!');
  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();

