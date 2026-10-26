import * as THREE from 'three';

const FLUOR_COLORS = [
  '#FAFF00', // Neon Yellow
  '#FF007F', // Vivid Magenta / Hot Pink
  '#00F0FF', // Electric Cyan
  '#FF5500', // Blazing Orange
  '#8B00FF', // Deep Electric Violet
  '#00FF66', // Acid Green
  '#FFFFFF', // Crisp White
];

/**
 * Creates high-resolution canvas textures for the 6 specific Marta Minujín artworks
 */
export function createArtworkTexture(artworkId: string, renderer: THREE.WebGLRenderer): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  switch (artworkId) {
    case 'energia_multidireccional':
      renderEnergiaMultidireccional(ctx, canvas.width, canvas.height);
      break;
    case 'laberinto_minujinda_1985':
      renderLaberintoMinujinda(ctx, canvas.width, canvas.height);
      break;
    case 'sin_titulo_2013':
      renderSinTitulo(ctx, canvas.width, canvas.height);
      break;
    case 'laberinto_minujinda_vertical':
      renderVerticalMinujinda(ctx, canvas.width, canvas.height);
      break;
    case 'arte_mediatico_happening':
      renderHappeningCollage(ctx, canvas.width, canvas.height);
      break;
    case 'iconicos_anteojos':
      renderGlassesArtwork(ctx, canvas.width, canvas.height);
      break;
    default:
      renderEnergiaMultidireccional(ctx, canvas.width, canvas.height);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  texture.needsUpdate = true;
  return texture;
}

// 1. Energía Multidireccional (2016)
function renderEnergiaMultidireccional(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#101018';
  ctx.fillRect(0, 0, w, h);

  const numStrips = 280;
  for (let i = 0; i < numStrips; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const length = 180 + Math.random() * 320;
    const width = 18 + Math.random() * 32;
    const angle = (Math.floor(Math.random() * 8) * Math.PI) / 4 + (Math.random() - 0.5) * 0.2;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;

    const color = FLUOR_COLORS[i % FLUOR_COLORS.length];
    ctx.fillStyle = color;
    ctx.fillRect(-length / 2, -width / 2, length, width);

    ctx.shadowColor = 'transparent';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(-length / 2, -width / 6, length, width / 3);

    ctx.restore();
  }
}

// 2. Laberinto Minujinda (1985)
function renderLaberintoMinujinda(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#151520';
  ctx.fillRect(0, 0, w, h);

  const stripeHeight = 28;
  const numStripes = Math.ceil(h / stripeHeight) + 4;

  for (let i = 0; i < numStripes; i++) {
    const y = i * stripeHeight;
    ctx.fillStyle = FLUOR_COLORS[i % FLUOR_COLORS.length];

    ctx.beginPath();
    ctx.moveTo(0, y);

    const waveFreq = 0.016;
    const waveAmp = 16;
    const phase = i * 0.45;

    for (let x = 0; x <= w; x += 10) {
      const curY = y + Math.sin(x * waveFreq + phase) * waveAmp;
      ctx.lineTo(x, curY);
    }

    ctx.lineTo(w, y + stripeHeight * 1.5);
    ctx.lineTo(0, y + stripeHeight * 1.5);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(15, 10, 30, 0.5)';
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}

// 3. Sin título (2013)
function renderSinTitulo(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#0B0B14';
  ctx.fillRect(0, 0, w, h);

  const bandWidth = 44;
  for (let d = -w; d < w * 2; d += bandWidth * 1.4) {
    ctx.fillStyle = FLUOR_COLORS[Math.abs(Math.floor(d / bandWidth)) % FLUOR_COLORS.length];
    ctx.beginPath();
    ctx.moveTo(d, 0);
    ctx.lineTo(d + bandWidth, 0);
    ctx.lineTo(d + bandWidth + h, h);
    ctx.lineTo(d + h, h);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  // Crossing reverse diagonal strips
  for (let d = -w; d < w * 2; d += bandWidth * 2) {
    ctx.fillStyle = FLUOR_COLORS[(Math.abs(Math.floor(d / bandWidth)) + 2) % FLUOR_COLORS.length];
    ctx.beginPath();
    ctx.moveTo(d + h, 0);
    ctx.lineTo(d + h + bandWidth, 0);
    ctx.lineTo(d, h);
    ctx.lineTo(d - bandWidth, h);
    ctx.closePath();
    ctx.fill();
  }
}

// 4. Laberinto Minujinda (Franja Vertical)
function renderVerticalMinujinda(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#0F0E18';
  ctx.fillRect(0, 0, w, h);

  const stripeW = 32;
  const numStripes = Math.ceil(w / stripeW) + 2;

  for (let i = 0; i < numStripes; i++) {
    const x = i * stripeW;
    ctx.fillStyle = FLUOR_COLORS[(i * 2) % FLUOR_COLORS.length];

    ctx.beginPath();
    ctx.moveTo(x, 0);

    const waveFreq = 0.02;
    const waveAmp = 18;
    const phase = i * 0.5;

    for (let y = 0; y <= h; y += 12) {
      const curX = x + Math.cos(y * waveFreq + phase) * waveAmp;
      ctx.lineTo(curX, y);
    }

    ctx.lineTo(x + stripeW * 1.4, h);
    ctx.lineTo(x + stripeW * 1.4, 0);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }
}

// 5. Arte Mediático: Registro de Happening
function renderHappeningCollage(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Pop-art screenprint poster aesthetic
  ctx.fillStyle = '#18122B';
  ctx.fillRect(0, 0, w, h);

  // Striped floor and wall perspective
  for (let y = h * 0.45; y < h; y += 22) {
    ctx.fillStyle = FLUOR_COLORS[Math.floor((y / 22)) % FLUOR_COLORS.length];
    ctx.fillRect(0, y, w, 18);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, y + 18, w, 4);
  }

  // Giant iconic sunglasses silhouette
  ctx.fillStyle = '#FAFF00';
  ctx.beginPath();
  ctx.arc(w * 0.35, h * 0.32, 110, 0, Math.PI * 2);
  ctx.arc(w * 0.65, h * 0.32, 110, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#111118';
  ctx.beginPath();
  ctx.arc(w * 0.35, h * 0.32, 90, 0, Math.PI * 2);
  ctx.arc(w * 0.65, h * 0.32, 90, 0, Math.PI * 2);
  ctx.fill();

  // Bridge
  ctx.fillStyle = '#FAFF00';
  ctx.fillRect(w * 0.45, h * 0.28, w * 0.1, 24);

  // Mirrored lens reflection lines
  ctx.fillStyle = '#FF007F';
  ctx.fillRect(w * 0.28, h * 0.26, 140, 20);
  ctx.fillStyle = '#00F0FF';
  ctx.fillRect(w * 0.58, h * 0.26, 140, 20);

  // Curatorial stamp
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('HAPPENING • INSTITUTO DI TELLA', w / 2, h * 0.88);
}

// 6. La Mirada Pop: Anteojos Espejados
function renderGlassesArtwork(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#090910';
  ctx.fillRect(0, 0, w, h);

  // Halftone / Pop Art concentric radiant beams
  const cx = w / 2;
  const cy = h / 2;
  const rays = 32;

  for (let i = 0; i < rays; i++) {
    const angle1 = (i / rays) * Math.PI * 2;
    const angle2 = ((i + 0.6) / rays) * Math.PI * 2;
    ctx.fillStyle = FLUOR_COLORS[i % FLUOR_COLORS.length];

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle1) * w, cy + Math.sin(angle1) * w);
    ctx.lineTo(cx + Math.cos(angle2) * w, cy + Math.sin(angle2) * w);
    ctx.closePath();
    ctx.fill();
  }

  // Dark center vignette
  const radGrad = ctx.createRadialGradient(cx, cy, 60, cx, cy, w * 0.6);
  radGrad.addColorStop(0, 'rgba(0,0,0,0.2)');
  radGrad.addColorStop(0.8, 'rgba(0,0,0,0.75)');
  radGrad.addColorStop(1, '#090910');
  ctx.fillStyle = radGrad;
  ctx.fillRect(0, 0, w, h);
}

/**
 * Procedural contemporary museum floor texture (resin / polished terrazzo)
 */
export function createGalleryFloorTexture(renderer: THREE.WebGLRenderer): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Smooth warm light gray base
  ctx.fillStyle = '#181820';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Floor tile seams
  const tileSize = 256;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 2;

  for (let x = 0; x <= canvas.width; x += tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= canvas.height; y += tileSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Subtle resin reflection grain
  for (let i = 0; i < 400; i++) {
    const px = Math.random() * canvas.width;
    const py = Math.random() * canvas.height;
    ctx.fillStyle = `rgba(255, 255, 255, ${0.02 + Math.random() * 0.04})`;
    ctx.fillRect(px, py, 2, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  texture.needsUpdate = true;
  return texture;
}

/**
 * Procedural texture for the perimeter wall of upholstered mattresses
 */
export function createMattressWallTexture(renderer: THREE.WebGLRenderer): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#14141e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const blockH = 128;
  for (let y = 0; y < canvas.height; y += blockH) {
    const color = FLUOR_COLORS[Math.floor(y / blockH) % FLUOR_COLORS.length];
    ctx.fillStyle = color;
    ctx.fillRect(0, y, canvas.width, blockH - 8);

    // Deep crevice seam shadow
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, y + blockH - 8, canvas.width, 8);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 2);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  texture.needsUpdate = true;
  return texture;
}

/**
 * Procedural ceiling texture inspired by Marta Minujín's soft-art mattress aesthetic:
 * An organically dispersed matrix of straight overlapping fabric strips, cushion seams,
 * and multidirectional fluorescent ribbons inspired by "Energía Multidireccional" and "La Menesunda".
 * Strictly composed of straight overlapping rectangular lines without black outlines or dots.
 */
export function createMinujinCeilingTexture(renderer: THREE.WebGLRenderer): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d')!;

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const maxR = canvas.width / 2;
  const minR = maxR * (2.4 / 15.6); // matches oculus opening radius

  // Deep pop-art velvet magenta-violet base ground
  ctx.fillStyle = '#140822';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 1. Broad rectilinear soft-art mattress panels & foundational bands
  // Long straight cushion planks running across chords and diameters
  const numBroadPanels = 52;
  for (let b = 0; b < numBroadPanels; b++) {
    const angle = (b / numBroadPanels) * Math.PI * 2 + (b % 3 === 0 ? 0.25 : -0.15);
    const rad = minR + 40 + ((b * 47) % Math.floor(maxR - minR - 120));
    const sx = cx + Math.cos(angle) * rad;
    const sy = cy + Math.sin(angle) * rad;

    const panelLen = 420 + ((b * 83) % 480);
    const panelThick = 55 + ((b * 19) % 35);
    // Straight angles: 0, 45, 90, 135 deg plus dynamic straight tangents
    const orientations = [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4, Math.PI / 6, (5 * Math.PI) / 6];
    const panelAngle = orientations[b % orientations.length] + ((b % 5) - 2) * 0.08;

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(panelAngle);

    // Soft fabric drop shadow emulating physical overlapping mattress depth (NO black outlines!)
    ctx.shadowColor = 'rgba(0, 0, 0, 0.32)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;

    const color = FLUOR_COLORS[b % FLUOR_COLORS.length];
    ctx.fillStyle = color;
    ctx.fillRect(-panelLen / 2, -panelThick / 2, panelLen, panelThick);

    // Soft-art cushion tuft indentation (gentle center shadow for pillowed mattress feel)
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
    ctx.fillRect(-panelLen / 2, -panelThick / 6, panelLen, panelThick / 3);

    // Subtle upholstered edge highlight for fabric volume (NO black strokes!)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.fillRect(-panelLen / 2, -panelThick / 2, panelLen, panelThick * 0.12);

    ctx.restore();
  }

  // 2. Dispersed Overlapping Mattress Straps (Medium rectilinear bands)
  // Replicating Minujín's woven and crossed mattress straps in La Menesunda / Revuélquese y Viva
  const numStraps = 180;
  for (let k = 0; k < numStraps; k++) {
    const angle = (k * 2.39996) % (Math.PI * 2); // Golden angle distribution for organic dispersion
    const radDist = minR + 20 + ((k * 31) % Math.floor(maxR - minR - 60));
    const sx = cx + Math.cos(angle) * radDist;
    const sy = cy + Math.sin(angle) * radDist;

    const strapLen = 240 + ((k * 59) % 360);
    const strapThick = 26 + ((k * 13) % 24);
    // Overlapping at orthogonal and diagonal angles (0°, 45°, 90°, 135°, 30°, 60°)
    const strapAngle = ((Math.floor((k * 7) % 8) * Math.PI) / 4) + (((k % 7) - 3) * 0.06);

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(strapAngle);

    // Soft fabric drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.36)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;

    const strapColor = FLUOR_COLORS[(k * 3 + 1) % FLUOR_COLORS.length];
    ctx.fillStyle = strapColor;
    ctx.fillRect(-strapLen / 2, -strapThick / 2, strapLen, strapThick);

    // Cushion seam indent
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    ctx.fillRect(-strapLen / 2, -strapThick * 0.18, strapLen, strapThick * 0.36);

    // Fabric upper edge sheen
    ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
    ctx.fillRect(-strapLen / 2, -strapThick / 2, strapLen, strapThick * 0.15);

    ctx.restore();
  }

  // 3. Fine Kinetic Straight Overlapping Accent Lines (Energía Multidireccional streaks)
  // Pure straight lines overlapping densely across the surface
  const numFineLines = 260;
  for (let f = 0; f < numFineLines; f++) {
    const angle = (f * 1.618) % (Math.PI * 2);
    const radDist = minR + 15 + ((f * 43) % Math.floor(maxR - minR - 40));
    const sx = cx + Math.cos(angle) * radDist;
    const sy = cy + Math.sin(angle) * radDist;

    const lineLen = 140 + ((f * 67) % 240);
    const lineThick = 9 + ((f * 7) % 12);
    const lineAngle = (Math.floor((f * 5) % 12) * Math.PI) / 6 + (((f % 5) - 2) * 0.05);

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(lineAngle);

    ctx.shadowColor = 'rgba(0, 0, 0, 0.28)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;

    const lineColor = FLUOR_COLORS[(f * 4 + 2) % FLUOR_COLORS.length];
    ctx.fillStyle = lineColor;
    ctx.fillRect(-lineLen / 2, -lineThick / 2, lineLen, lineThick);

    ctx.restore();
  }

  // 4. Clustered Orthogonal Mattress Webbing Patches
  // Intersecting straight stripes mimicking quilted mattress cross-stitching
  const numClusters = 14;
  for (let c = 0; c < numClusters; c++) {
    const clusterAng = (c / numClusters) * Math.PI * 2 + 0.3;
    const clusterRad = minR + 80 + ((c * 71) % Math.floor(maxR - minR - 180));
    const px = cx + Math.cos(clusterAng) * clusterRad;
    const py = cy + Math.sin(clusterAng) * clusterRad;
    const baseAngle = (c * Math.PI) / 6;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(baseAngle);

    // Layer A: 4 parallel straight lines
    const numSubLines = 4;
    const spacing = 22;
    for (let i = 0; i < numSubLines; i++) {
      const offset = (i - (numSubLines - 1) / 2) * spacing;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
      ctx.fillStyle = FLUOR_COLORS[(c + i) % FLUOR_COLORS.length];
      ctx.fillRect(-120, offset - 7, 240, 14);
    }

    // Layer B: 4 intersecting perpendicular straight lines overlapping on top
    for (let j = 0; j < numSubLines; j++) {
      const offset = (j - (numSubLines - 1) / 2) * spacing;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.32)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
      ctx.fillStyle = FLUOR_COLORS[(c * 2 + j + 3) % FLUOR_COLORS.length];
      ctx.fillRect(offset - 7, -120, 14, 240);
    }

    ctx.restore();
  }

  // 5. Soft Organic Color Atmosphere Gradients (No black borders!)
  // Soft atmospheric inner glow at oculus aperture
  const oculusGlow = ctx.createRadialGradient(cx, cy, minR * 0.75, cx, cy, minR * 1.15);
  oculusGlow.addColorStop(0, 'rgba(20, 8, 34, 0.85)');
  oculusGlow.addColorStop(0.7, 'rgba(20, 8, 34, 0.4)');
  oculusGlow.addColorStop(1, 'rgba(20, 8, 34, 0)');
  ctx.fillStyle = oculusGlow;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Soft atmospheric perimeter blend
  const outerGlow = ctx.createRadialGradient(cx, cy, maxR * 0.90, cx, cy, maxR);
  outerGlow.addColorStop(0, 'rgba(20, 8, 34, 0)');
  outerGlow.addColorStop(1, 'rgba(20, 8, 34, 0.8)');
  ctx.fillStyle = outerGlow;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  texture.needsUpdate = true;
  return texture;
}

