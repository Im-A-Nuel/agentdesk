// Renders public/og.png (1200x630 social preview) from an inline SVG.
// Run with: npm run generate:og

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="brass" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#86a7ea"/>
      <stop offset="45%" stop-color="#7c3aed"/>
      <stop offset="100%" stop-color="#e17cb7"/>
    </linearGradient>
    <linearGradient id="soft" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#86a7ea" stop-opacity="0.22"/>
      <stop offset="55%" stop-color="#7c3aed" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="#e17cb7" stop-opacity="0.22"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="#ffffff"/>
  <circle cx="1000" cy="120" r="360" fill="url(#soft)"/>
  <circle cx="120" cy="620" r="300" fill="url(#soft)"/>
  <g transform="translate(110 210)">
    <rect width="120" height="120" rx="30" fill="url(#brass)"/>
    <g fill="#ffffff" transform="translate(25 25) scale(2.9)">
      <path fill-rule="evenodd" d="M8 3h8a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3ZM10.6 5.8a1.4 1.4 0 1 0 2.8 0 1.4 1.4 0 1 0-2.8 0ZM11.3 5.8h1.4v2.4h-1.4Z"/>
      <rect x="10.6" y="10" width="2.8" height="8" rx="1.4"/>
      <rect x="6.6" y="16" width="4" height="1.9" rx="0.95"/>
      <rect x="7.6" y="18.7" width="3" height="1.8" rx="0.9"/>
    </g>
  </g>
  <text x="280" y="255" font-family="Arial, sans-serif" font-size="64" font-weight="800" fill="#16161c">AgentDesk</text>
  <text x="280" y="330" font-family="Arial, sans-serif" font-size="32" font-weight="600" fill="#6a6a74">Hire onchain AI agents on BNB Smart Chain</text>
  <text x="280" y="385" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="#7c3aed">Scoped. Capped. Revocable.</text>
  <text x="280" y="470" font-family="ui-monospace, Menlo, monospace" font-size="18" fill="#9a9aa4">ERC-8004 registry · Altana Keystore · ERC-8183 hire · BSC testnet</text>
</svg>`;

const png = await sharp(Buffer.from(svg)).resize(1200, 630).png().toBuffer();
writeFileSync(resolve("public", "og.png"), png);
console.log("public/og.png generated");