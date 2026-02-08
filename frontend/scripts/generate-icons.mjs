import sharp from 'sharp';
import { mkdirSync } from 'fs';

mkdirSync('public/icons', { recursive: true });

function createIconSVG(size) {
  const fontSize = Math.round(size * 0.35);
  const subFontSize = Math.round(size * 0.12);
  return `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0F1117"/>
          <stop offset="100%" style="stop-color:#1A1D26"/>
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${Math.round(size * 0.15)}" fill="url(#bg)"/>
      <text x="50%" y="45%" text-anchor="middle" dominant-baseline="central"
            font-family="Arial, sans-serif" font-weight="800" font-size="${fontSize}" fill="#F59E0B">
        MD
      </text>
      <text x="50%" y="72%" text-anchor="middle" dominant-baseline="central"
            font-family="Arial, sans-serif" font-weight="600" font-size="${subFontSize}" fill="#9CA3AF">
        LIVE
      </text>
      <circle cx="${Math.round(size * 0.82)}" cy="${Math.round(size * 0.18)}" r="${Math.round(size * 0.06)}" fill="#EF4444"/>
    </svg>`;
}

function createOGSVG() {
  return `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0F1117"/>
          <stop offset="100%" style="stop-color:#1A1D26"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#bg)"/>

      <!-- Border accent -->
      <rect x="40" y="40" width="1120" height="550" rx="24" fill="none" stroke="#2A2D36" stroke-width="2"/>

      <!-- Title -->
      <text x="600" y="220" text-anchor="middle" font-family="Arial, sans-serif" font-weight="800" font-size="80" fill="#FFFFFF">
        Match<tspan fill="#F59E0B">Day</tspan>
      </text>

      <!-- Subtitle -->
      <text x="600" y="310" text-anchor="middle" font-family="Arial, sans-serif" font-weight="600" font-size="32" fill="#9CA3AF">
        Live Cricket &amp; Football Scores
      </text>

      <!-- Tagline -->
      <text x="600" y="380" text-anchor="middle" font-family="Arial, sans-serif" font-weight="400" font-size="24" fill="#6B7280">
        One screen. Two sports. AI-powered highlights.
      </text>

      <!-- Live dot -->
      <circle cx="410" cy="460" r="8" fill="#EF4444"/>
      <text x="430" y="468" font-family="Arial, sans-serif" font-weight="800" font-size="18" fill="#EF4444" letter-spacing="2">
        LIVE
      </text>

      <!-- Sport badges -->
      <rect x="500" y="440" width="90" height="36" rx="18" fill="#22C55E" fill-opacity="0.15"/>
      <text x="545" y="464" text-anchor="middle" font-family="Arial, sans-serif" font-weight="600" font-size="16" fill="#22C55E">
        Cricket
      </text>

      <rect x="610" y="440" width="100" height="36" rx="18" fill="#3B82F6" fill-opacity="0.15"/>
      <text x="660" y="464" text-anchor="middle" font-family="Arial, sans-serif" font-weight="600" font-size="16" fill="#3B82F6">
        Football
      </text>
    </svg>`;
}

async function generate() {
  // PWA icons
  await sharp(Buffer.from(createIconSVG(192))).png().toFile('public/icons/icon-192.png');
  console.log('Created: public/icons/icon-192.png');

  await sharp(Buffer.from(createIconSVG(512))).png().toFile('public/icons/icon-512.png');
  console.log('Created: public/icons/icon-512.png');

  // Favicon
  await sharp(Buffer.from(createIconSVG(32))).png().toFile('public/favicon.png');
  console.log('Created: public/favicon.png');

  // OG Image
  await sharp(Buffer.from(createOGSVG())).png().toFile('public/og-image.png');
  console.log('Created: public/og-image.png');

  console.log('\nAll icons generated!');
}

generate().catch(console.error);
