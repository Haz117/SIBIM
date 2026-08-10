/**
 * Genera los íconos PNG para el manifest de la PWA.
 * Ejecutar: node scripts/generate-icons.mjs
 */
import sharp from "../node_modules/sharp/lib/index.js";
import { mkdirSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, "..", "public", "icons");
mkdirSync(iconsDir, { recursive: true });

// ─── SVG icon (edificio gubernamental premium) ───────────────────────────────

const buildingSvg = (size, maskable = false) => {
  const r = maskable ? 0 : Math.round(size * 0.219);
  // Para maskable el contenido se escala al 72% (zona segura PWA)
  const scale = maskable ? 0.72 : 0.78;
  const bw = Math.round(size * scale);     // ancho del edificio
  const bh = Math.round(size * scale * 0.88);
  const bx = Math.round((size - bw) / 2);
  const by = Math.round((size - bh) / 2);

  // Proporciones del edificio relativas a bw/bh
  const u = (v) => Math.round(v);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="#7c3aed"/>
      <stop offset="100%" stop-color="#2e1065"/>
    </linearGradient>
    <linearGradient id="shine" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.13"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <clipPath id="clip">
      <rect width="${size}" height="${size}" rx="${r}"/>
    </clipPath>
  </defs>

  <!-- Fondo -->
  <rect width="${size}" height="${size}" rx="${r}" fill="url(#bg)"/>
  <!-- Brillo superior -->
  <rect width="${size}" height="${u(size * 0.5)}" rx="${r}" fill="url(#shine)" clip-path="url(#clip)"/>

  <!-- Edificio gubernamental -->
  <g transform="translate(${bx}, ${by})">
    <!-- Escalones base -->
    <rect x="${u(bw*0)}" y="${u(bh*0.88)}" width="${u(bw)}" height="${u(bh*0.07)}" rx="${u(bw*0.016)}" fill="white" opacity="0.88"/>
    <rect x="${u(bw*0.04)}" y="${u(bh*0.81)}" width="${u(bw*0.92)}" height="${u(bh*0.085)}" rx="${u(bw*0.011)}" fill="white" opacity="0.93"/>

    <!-- Cuerpo principal -->
    <rect x="${u(bw*0.08)}" y="${u(bh*0.43)}" width="${u(bw*0.84)}" height="${u(bh*0.39)}" fill="white" opacity="0.97"/>

    <!-- Frontón triangular (tejado) -->
    <polygon points="${u(bw*0.02)},${u(bh*0.43)} ${u(bw*0.5)},${u(bh*0.1)} ${u(bw*0.98)},${u(bh*0.43)}" fill="white" opacity="0.97"/>

    <!-- Pilastras -->
    <rect x="${u(bw*0.085)}" y="${u(bh*0.42)}" width="${u(bw*0.036)}" height="${u(bh*0.4)}" rx="${u(bw*0.009)}" fill="rgba(76,29,149,0.28)"/>
    <rect x="${u(bw*0.175)}" y="${u(bh*0.42)}" width="${u(bw*0.036)}" height="${u(bh*0.4)}" rx="${u(bw*0.009)}" fill="rgba(76,29,149,0.28)"/>
    <rect x="${u(bw*0.789)}" y="${u(bh*0.42)}" width="${u(bw*0.036)}" height="${u(bh*0.4)}" rx="${u(bw*0.009)}" fill="rgba(76,29,149,0.28)"/>
    <rect x="${u(bw*0.879)}" y="${u(bh*0.42)}" width="${u(bw*0.036)}" height="${u(bh*0.4)}" rx="${u(bw*0.009)}" fill="rgba(76,29,149,0.28)"/>

    <!-- Ventanas (3) -->
    <rect x="${u(bw*0.095)}" y="${u(bh*0.475)}" width="${u(bw*0.185)}" height="${u(bh*0.165)}" rx="${u(bw*0.012)}" fill="rgba(76,29,149,0.44)"/>
    <rect x="${u(bw*0.407)}" y="${u(bh*0.475)}" width="${u(bw*0.185)}" height="${u(bh*0.165)}" rx="${u(bw*0.012)}" fill="rgba(76,29,149,0.44)"/>
    <rect x="${u(bw*0.72)}" y="${u(bh*0.475)}" width="${u(bw*0.185)}" height="${u(bh*0.165)}" rx="${u(bw*0.012)}" fill="rgba(76,29,149,0.44)"/>

    <!-- Puerta (arco) -->
    <rect  x="${u(bw*0.41)}" y="${u(bh*0.66)}" width="${u(bw*0.18)}" height="${u(bh*0.15)}" rx="0" fill="rgba(76,29,149,0.44)"/>
    <ellipse cx="${u(bw*0.5)}" cy="${u(bh*0.66)}" rx="${u(bw*0.09)}" ry="${u(bh*0.042)}" fill="rgba(76,29,149,0.44)"/>

    <!-- Estrella/punto en pedimento -->
    <circle cx="${u(bw*0.5)}" cy="${u(bh*0.22)}" r="${u(bw*0.022)}" fill="rgba(76,29,149,0.35)"/>
  </g>
</svg>`;
};

// ─── Generar PNGs ──────────────────────────────────────────────────────────

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

for (const size of sizes) {
  const svg = buildingSvg(size, false);
  await sharp(Buffer.from(svg)).png().toFile(join(iconsDir, `icon-${size}.png`));
  console.log(`✓ icon-${size}.png`);
}

// Maskable (fondo full-bleed, contenido en zona segura central)
const maskSvg = buildingSvg(512, true);
await sharp(Buffer.from(maskSvg)).png().toFile(join(iconsDir, "icon-maskable-512.png"));
console.log("✓ icon-maskable-512.png");

// Favicon base (32px)
const favSvg = buildingSvg(32, false);
await sharp(Buffer.from(favSvg)).png().toFile(join(__dirname, "..", "public", "favicon-32.png"));
console.log("✓ favicon-32.png");

console.log("\nIconos generados en public/icons/");
