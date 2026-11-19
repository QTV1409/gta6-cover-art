// Vice Nights cover renderer: draws a multi-panel GTA-style poster cover
// onto any canvas. Every panel gets its own photo, crop (zoom + pan) and
// colour grade; the title is set in the bundled Anton font with a sunset
// gradient fill and a dark outline, over halftone dots and a vignette.
export const GRADES = {
  sunset: {
    name: 'Sunset',
    sky: ['#2b1055', '#7597de'],
    sun: '#ff9a3d',
    wash: ['rgba(255,122,26,0.28)', 'rgba(255,45,149,0.34)'],
    title: ['#ffe259', '#ff7e5f'],
    band: 'rgba(20,6,32,0.72)',
    accent: '#ff2d95',
  },
  neon: {
    name: 'Neon Nights',
    sky: ['#0b0620', '#3b0f66'],
    sun: '#00e5ff',
    wash: ['rgba(0,229,255,0.22)', 'rgba(255,45,149,0.38)'],
    title: ['#7df9ff', '#ff2d95'],
    band: 'rgba(8,4,28,0.78)',
    accent: '#00e5ff',
  },
  palm: {
    name: 'Palm Dusk',
    sky: ['#123524', '#f4a259'],
    sun: '#ffd166',
    wash: ['rgba(244,162,89,0.26)', 'rgba(18,53,36,0.30)'],
    title: ['#ffe8a3', '#ff8c42'],
    band: 'rgba(10,26,18,0.72)',
    accent: '#ffd166',
  },
  noir: {
    name: 'Noir',
    sky: ['#0d0d12', '#3d3d4d'],
    sun: '#e8e8e8',
    wash: ['rgba(255,255,255,0.10)', 'rgba(0,0,0,0.42)'],
    title: ['#ffffff', '#c9c9d6'],
    band: 'rgba(0,0,0,0.75)',
    accent: '#ffffff',
  },
};

export const LAYOUTS = {
  poster: {
    name: 'Poster',
    panels: [
      { x: 0, y: 0, w: 1, h: 0.58 },
      { x: 0, y: 0.58, w: 0.5, h: 0.42 },
      { x: 0.5, y: 0.58, w: 0.5, h: 0.42 },
    ],
  },
  trio: {
    name: 'Comic Trio',
    panels: [
      { x: 0, y: 0, w: 1 / 3, h: 1 },
      { x: 1 / 3, y: 0, w: 1 / 3, h: 1 },
      { x: 2 / 3, y: 0, w: 1 / 3, h: 1 },
    ],
  },
  split: {
    name: 'Split Hero',
    panels: [
      { x: 0, y: 0, w: 0.58, h: 1 },
      { x: 0.58, y: 0, w: 0.42, h: 0.5 },
      { x: 0.58, y: 0.5, w: 0.42, h: 0.5 },
    ],
  },
};

export const SIZES = {
  '1080x1080': { w: 1080, h: 1080, label: 'Square · 1080 × 1080' },
  '1080x1350': { w: 1080, h: 1350, label: 'Portrait · 1080 × 1350' },
  '1920x1080': { w: 1920, h: 1080, label: 'Wide · 1920 × 1080' },
};

/** A fresh default cover state: three sample slots, poster layout, sunset grade. */
export function defaultCoverState() {
  return {
    layout: 'poster',
    size: '1080x1080',
    grade: 'sunset',
    title: 'Sunset Heist',
    subtitle: 'VICE NIGHTS · EST. 2026',
    badge: 'NEW',
    photos: [null, null, null],
    panelPhoto: [0, 1, 0],
    zoom: [1.15, 1.15, 1.15],
    panX: [0, 0, 0],
    panY: [0, 0, 0],
    halftone: true,
    vignette: true,
    rays: true,
    borders: true,
  };
}

/** Fills `rect` with `photo`, cover-cropped, zoomed and panned. */
export function drawPanelPhoto(ctx, photo, rect, zoom, panX, panY) {
  const scale = Math.max(rect.w / photo.naturalWidth, rect.h / photo.naturalHeight) * zoom;
  const pw = photo.naturalWidth * scale;
  const ph = photo.naturalHeight * scale;
  const dx = rect.x + (rect.w - pw) / 2 + panX * rect.w * 0.4;
  const dy = rect.y + (rect.h - ph) / 2 + panY * rect.h * 0.4;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.drawImage(photo, dx, dy, pw, ph);
  ctx.restore();
}

/** Paints a retro sun disc with rays inside the hero panel. */
export function drawSunDisc(ctx, rect, grade, rays) {
  const cx = rect.x + rect.w * 0.72;
  const cy = rect.y + rect.h * 0.52;
  const r = Math.min(rect.w, rect.h) * 0.26;
  if (rays) {
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = grade.sun;
    ctx.lineWidth = Math.max(2, r * 0.06);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r * 1.15, cy + Math.sin(a) * r * 1.15);
      ctx.lineTo(cx + Math.cos(a) * r * 1.7, cy + Math.sin(a) * r * 1.7);
      ctx.stroke();
    }
    ctx.restore();
  }
  const glow = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 1.6);
  glow.addColorStop(0, grade.sun);
  glow.addColorStop(1, 'rgba(255,120,60,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(cx - r * 1.7, cy - r * 1.7, r * 3.4, r * 3.4);
  const disc = ctx.createLinearGradient(cx, cy - r, cx, cy + r);
  disc.addColorStop(0, '#fff3b0');
  disc.addColorStop(0.55, grade.sun);
  disc.addColorStop(1, '#ff2d95');
  ctx.fillStyle = disc;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}

/** Stamps a halftone dot field over the bottom of the cover. */
export function drawHalftone(ctx, w, h) {
  const step = Math.max(10, w / 90);
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  for (let y = h * 0.78; y < h; y += step) {
    const t = (y - h * 0.78) / (h * 0.22);
    for (let x = step / 2; x < w; x += step) {
      const r = step * (0.12 + 0.3 * t);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/** Darkens the cover edges so the title band and panels pop. */
export function drawVignette(ctx, w, h) {
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.42)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

/** Draws the starburst sticker badge in the top-right corner. */
export function drawStickerBadge(ctx, w, h, text, accent) {
  if (!text.trim()) return;
  const cx = w - w * 0.09;
  const cy = Math.min(w, h) * 0.09;
  const r = Math.min(w, h) * 0.075 + text.length * 3;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(0.16);
  ctx.beginPath();
  const spikes = 12;
  for (let i = 0; i < spikes * 2; i++) {
    const a = (i / (spikes * 2)) * Math.PI * 2;
    const rr = i % 2 === 0 ? r : r * 0.82;
    const px = Math.cos(a) * rr;
    const py = Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = accent;
  ctx.fill();
  ctx.lineWidth = Math.max(2, r * 0.06);
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();
  ctx.fillStyle = '#14061f';
  ctx.font = `900 ${Math.max(14, r * 0.42)}px "AntonCover", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text.trim().toUpperCase(), 0, 1);
  ctx.restore();
}

/** Draws the big title and subtitle across a dark band at the foot. */
export function drawTitleBand(ctx, w, h, state, grade) {
  const bandH = h * 0.2;
  const bandY = h - bandH;
  ctx.fillStyle = grade.band;
  ctx.fillRect(0, bandY, w, bandH);
  ctx.fillStyle = grade.accent;
  ctx.fillRect(0, bandY, w, Math.max(3, h * 0.006));
  const title = state.title.trim().toUpperCase() || 'VICE NIGHTS';
  let size = h * 0.115;
  ctx.font = `${size}px "AntonCover", "Arial Black", sans-serif`;
  while (ctx.measureText(title).width > w * 0.92 && size > 16) {
    size -= 2;
    ctx.font = `${size}px "AntonCover", "Arial Black", sans-serif`;
  }
  const grad = ctx.createLinearGradient(0, bandY + bandH * 0.15, 0, bandY + bandH * 0.85);
  grad.addColorStop(0, grade.title[0]);
  grad.addColorStop(1, grade.title[1]);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(10,2,18,0.9)';
  ctx.lineWidth = Math.max(3, size * 0.14);
  ctx.strokeText(title, w / 2, bandY + bandH * 0.46);
  ctx.fillStyle = grad;
  ctx.fillText(title, w / 2, bandY + bandH * 0.46);
  const sub = state.subtitle.trim().toUpperCase();
  if (sub) {
    const subSize = Math.max(13, h * 0.021);
    ctx.font = `700 ${subSize}px system-ui, sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    const spaced = sub.split('').join('  ');
    ctx.fillText(spaced, w / 2, bandY + bandH * 0.86);
  }
}

/** Draws the whole cover for `state` onto `canvas` (its own pixel size). */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const grade = GRADES[state.grade] ?? GRADES.sunset;
  const layout = LAYOUTS[state.layout] ?? LAYOUTS.poster;
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, grade.sky[0]);
  sky.addColorStop(1, grade.sky[1]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  drawSunDisc(ctx, { x: 0, y: 0, w, h: h * 0.58 }, grade, state.rays);
  const gap = state.borders ? Math.max(4, w * 0.008) : 0;
  layout.panels.forEach((p, i) => {
    const rect = { x: p.x * w + gap / 2, y: p.y * h + gap / 2, w: p.w * w - gap, h: p.h * h - gap };
    const photo = state.photos[state.panelPhoto[i]];
    if (photo) {
      drawPanelPhoto(ctx, photo, rect, state.zoom[i], state.panX[i], state.panY[i]);
    } else {
      const empty = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
      empty.addColorStop(0, 'rgba(255,255,255,0.10)');
      empty.addColorStop(1, 'rgba(0,0,0,0.25)');
      ctx.fillStyle = empty;
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.font = `700 ${Math.max(14, w * 0.018)}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`PANEL ${i + 1} · ADD A PHOTO`, rect.x + rect.w / 2, rect.y + rect.h / 2);
    }
    const wash = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
    wash.addColorStop(0, grade.wash[0]);
    wash.addColorStop(1, grade.wash[1]);
    ctx.fillStyle = wash;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    if (state.borders) {
      ctx.lineWidth = Math.max(3, w * 0.006);
      ctx.strokeStyle = '#ffffff';
      ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    }
  });
  if (state.halftone) drawHalftone(ctx, w, h);
  if (state.vignette) drawVignette(ctx, w, h);
  drawTitleBand(ctx, w, h, state, grade);
  drawStickerBadge(ctx, w, h, state.badge, grade.accent);
}

/** Renders `state` at an export size and returns the fresh canvas. */
export function renderExportCanvas(state) {
  const size = SIZES[state.size] ?? SIZES['1080x1080'];
  const canvas = document.createElement('canvas');
  canvas.width = size.w;
  canvas.height = size.h;
  drawCover(canvas, state);
  return canvas;
}
