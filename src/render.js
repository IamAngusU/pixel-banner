// Pure renderer: renderSvg(text, options) -> SVG string. No DOM or Node dependencies.
// All sizes are in "cells" (1 cell = 1 pixel of the pixel font); `scale` only sets the output size.
import { GLYPHS, GLYPH_W, GLYPH_H } from './font.js';
import { PRESETS } from './presets.js';

export const DEFAULTS = {
  scale: 8,            // output size of one cell in px
  glyphWidth: 100,     // glyph width as a percentage; 100 = original 5x7 proportions
  taper: false,        // progressively narrow each glyph from left to right
  spacing: 1,          // cells between letters
  weight: 1,           // 1 = thin, 2 = bold
  colors: ['#5B6CFF', '#A66BFF'], // gradient stops (hex), 1..n colors
  vertical: false,     // gradient runs top to bottom instead of left to right
  depth: 3,            // 3D shadow depth in cells
  shadow: '#2B2A6B',   // shadow color (hex)
  highlight: 0.25,     // opacity of the light top edge (0 = off)
  animation: 'none',   // none | wave | shimmer | blink | floor | reveal | reveal+shimmer
  bg: null,            // background color, or null for transparent
  transparent: false,  // true = never paint a background rect (overrides bg)
  light: false,        // true = light-mode look (bright shadow, dark shine, framed for white pages)
  padding: 1,          // margin in cells
  footer: false,       // append a "powered by" pixel credit under the banner
};

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const mix = (a, b, t) => {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('');
};

const toGrid = (rows) => rows.map((r) => Array.from({ length: GLYPH_W }, (_, x) => (r >> (GLYPH_W - 1 - x)) & 1));

// Bold: 2x2 dilation, so a 5x7 glyph becomes 6x8.
function thicken(g) {
  const at = (y, x) => g[y]?.[x] || 0;
  return Array.from({ length: g.length + 1 }, (_, y) =>
    Array.from({ length: g[0].length + 1 }, (_, x) => at(y, x) | at(y, x - 1) | at(y - 1, x) | at(y - 1, x - 1)));
}

const face = (g, x, y) => g[y]?.[x] === 1;
const edge = (g, x, y) => face(g, x, y) && !face(g, x, y - 1); // pixels with nothing above them

// Path built from horizontal runs: much smaller than one <rect> per pixel.
const fmt = (value) => Number(value.toFixed(4)).toString();

function runs(g, ox, keep, sx = 1, oy = 0) {
  let d = '';
  g.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (!keep(g, x, y)) continue;
      const s = x;
      while (keep(g, x + 1, y)) x++;
      const width = (x - s + 1) * sx;
      d += `M${fmt(ox + s * sx)} ${fmt(oy + y)}h${fmt(width)}v1h${fmt(-width)}z`;
    }
  });
  return d;
}

export function renderSvg(text, opts = {}) {
  const o = { ...DEFAULTS, ...PRESETS[opts.preset], ...opts };
  const animations = new Set((Array.isArray(o.animation) ? o.animation : String(o.animation || 'none').split('+'))
    .map((name) => String(name).trim()).filter(Boolean));
  const hasAnimation = (name) => animations.has(name);
  const chars = [...String(text).toUpperCase()];
  if (!chars.length) throw new Error('Text is empty');

  const grids = chars.map((c) => {
    const g = toGrid(GLYPHS[c] ?? GLYPHS['?']);
    return o.weight > 1 ? thicken(g) : g;
  });
  const n = grids.length, gh = grids[0].length;
  const widthScale = Math.max(40, Math.min(160, Number(o.glyphWidth) || 100)) / 100;
  const taperAmount = o.taper && n > 1 ? 0.28 : 0;
  const glyphScale = (i) => widthScale * (1 - taperAmount * (i / Math.max(1, n - 1)));
  const glyphWidths = grids.map((g, i) => g[0].length * glyphScale(i));
  const wave = hasAnimation('wave') ? 1 : 0;
  const glyphY = o.padding + wave;
  const floor = hasAnimation('floor');
  const reveal = hasAnimation('reveal');
  const shimmerEnabled = hasAnimation('shimmer');
  const floorH = floor ? 6 : 0;   // gradient floor band below the text
  const footerH = o.footer ? (2 * (GLYPH_H + 1) + 3) : 0;  // two text lines + gap
  const W = 2 * o.padding + glyphWidths.reduce((sum, width) => sum + width, 0) + (n - 1) * o.spacing + o.depth;
  const H = 2 * (o.padding + wave) + gh + o.depth + floorH;
  const Htotal = H + footerH;
  const textWidth = glyphWidths.reduce((sum, width) => sum + width, 0) + (n - 1) * o.spacing;
  const len = o.vertical ? gh : textWidth;
  const [x1, y1, x2, y2] = o.vertical
    ? [0, glyphY, 0, glyphY + len]
    : [o.padding, 0, o.padding + len, 0];
  const colors = o.colors.length > 1 ? o.colors : [o.colors[0], o.colors[0]];

  const stops = colors.map((c, i) => `<stop offset="${(i / (colors.length - 1)).toFixed(3)}" stop-color="${c}"/>`).join('');
  // Move the selected color gradient across the letters. When combined with
  // reveal, begin the color sweep after the last glyph has appeared.
  const motionBegin = reveal ? `${((n - 1) * 0.18 + 0.7).toFixed(2)}s` : '0s';
  const gradientMotion = shimmerEnabled || floor
    ? `<animateTransform attributeName="gradientTransform" type="translate" from="0 0" to="${o.vertical ? `0 ${2 * len}` : `${2 * len} 0`}" dur="4s" begin="${motionBegin}" repeatCount="indefinite"/>`
    : '';

  const ox = (i) => o.padding + glyphWidths.slice(0, i).reduce((sum, width) => sum + width, 0) + i * o.spacing;
  const defs = grids.map((g, i) => `<path id="g${i}" d="${runs(g, 0, face)}"/>`).join('');

  // light mode: ink on paper — the 3D body below each glyph becomes an emboss
  // highlight (shadow -> white), shine uses ink instead of white, and the
  // gradient gets a subtle dark rim so it still reads on a white page.
  const light = !!o.light;
  const shadowInk = light ? mix(o.shadow, '#ffffff', 0.62) : o.shadow;
  const shine = light ? mix(o.colors[0], '#000000', 0.55) : '#fff';
  const shineOpacity = light ? Math.min(1, o.highlight * 1.6) : o.highlight;

  const letters = grids.map((g, i) => {
    const sx = glyphScale(i);
    let shadow = '';
    for (let k = o.depth; k >= 1; k--) {
      // Compensate the x offset so glyph compression does not flatten the 3D depth.
      shadow += `<use href="#g${i}" x="${(k / sx).toFixed(3)}" y="${k}" fill="${mix(shadowInk, light ? '#ffffff' : '#000000', ((k - 1) / (o.depth || 1)) * 0.5)}"/>`;
    }
    const shadowLayer = `<g transform="translate(${ox(i)} ${glyphY}) scale(${sx.toFixed(4)} 1)">${shadow}</g>`;
    const facePath = `<path d="${runs(g, ox(i), face, sx, glyphY)}" fill="url(#f)"/>`;
    let details = '';
    if (light) details += `<path d="${runs(g, 0, face)}" fill="none" stroke="${mix(o.colors[0], '#000000', 0.5)}" stroke-width="0.5" stroke-opacity="0.35"/>`;
    if (o.highlight > 0) details += `<path d="${runs(g, 0, edge)}" fill="${shine}" fill-opacity="${shineOpacity}"/>`;
    const detailLayer = details ? `<g transform="translate(${ox(i)} ${glyphY}) scale(${sx.toFixed(4)} 1)">${details}</g>` : '';
    const waveFx = wave ? `<animateTransform attributeName="transform" type="translate" values="0 0;0 -1;0 0" dur="1.2s" begin="${(i * 0.12).toFixed(2)}s" repeatCount="indefinite"/>` : '';
    const revealBase = reveal ? ' opacity="0" transform="translate(0 3)" filter="url(#blur)"' : '';
    return `<g${revealBase}>${shadowLayer}${facePath}${detailLayer}${waveFx}${reveal ? revealFx(i) : ''}</g>`;
  }).join('');

  const blink = hasAnimation('blink') ? '<animate attributeName="opacity" values="1;.35;1" dur="1.6s" repeatCount="indefinite"/>' : '';
  // transparent wins over bg -> no rect at all, so the SVG can sit on any page color
  const paintBg = !o.transparent && !!o.bg;
  const bg = paintBg ? `<rect width="${W}" height="${Htotal}" fill="${o.bg}"/>` : '';

  const floorBand = floor ? floorFx(o, W, floorH) : '';
  const footer = o.footer ? footerFx(o, W, H) : '';

  // aria-label + responsive: width/height only hint the intrinsic size, CSS max-width keeps it fluid
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${Htotal}" width="${W * o.scale}" height="${Htotal * o.scale}" preserveAspectRatio="xMidYMid meet" shape-rendering="crispEdges" role="img" aria-label="${esc(String(text))}">`
    + `<title>${esc(String(text))}</title><defs>${defs}${reveal ? blurFilter() : ''}<linearGradient id="f" gradientUnits="userSpaceOnUse" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" spreadMethod="reflect">${stops}${gradientMotion}</linearGradient></defs>`
    + `${bg}<g>${blink}${letters}</g>`
    + `${floorBand}${footer}<!-- Generated with Pixel Banner: https://github.com/IamAngusU/pixel-banner --></svg>`;
}

// text-reveal: each letter fades in with a rise + blur, staggered left to right.
// `begin` is a time offset in seconds; keyTimes are normalized fractions and must
// stay within 0..1. Mixing the two was why longer words stopped revealing.
function revealFx(i) {
  const delay = (i * 0.18).toFixed(2);
  return `<animate attributeName="opacity" values="0;1" dur="0.7s" begin="${delay}s" fill="freeze"/>`
    + `<animateTransform attributeName="transform" type="translate" values="0 3;0 0" dur="0.7s" begin="${delay}s" fill="freeze"/>`
    + `<animate attributeName="filter" values="url(#blur);none" dur="0.7s" begin="${delay}s" fill="freeze"/>`;
}

function blurFilter() {
  return `<filter id="blur" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="1.5"/></filter>`;
}

// gradient-floor: a soft wavy light band sweeping along the floor under the text.
function floorFx(o, W, floorH) {
  const rows = [];               // each row = one horizontal light band, dimmer toward the bottom
  const hasWave = (Array.isArray(o.animation) ? o.animation : String(o.animation || 'none').split('+')).includes('wave');
  const top = 2 * (o.padding + (hasWave ? 1 : 0)) + 7 + o.depth + (o.weight > 1 ? 1 : 0);
  const c0 = o.colors[0], c1 = o.colors[o.colors.length - 1];
  for (let r = 0; r < floorH; r++) {
    const t = (r + 1) / floorH;  // 0 at the top band, 1 at the bottom
    const col = mix(c1, c0, 0.25 + 0.75 * t);
    rows.push(`<rect x="0" y="${top + r}" width="${W}" height="1" fill="${col}" fill-opacity="${(0.9 * (1 - t) + 0.1).toFixed(3)}">
      <animate attributeName="x" values="0;-${2 * W};0" dur="${(3 + t * 5).toFixed(1)}s" repeatCount="indefinite"/>
    </rect>`);
  }
  return `<g shape-rendering="crispEdges">${rows.join('')}</g>`;
}

// powered-by credit: small pixel text + repo link, rendered in the banner style.
function footerFx(o, W, H) {
  const label = 'POWERED BY PIXEL-BANNER';
  const url = 'GITHUB.COM/IAMANGUSU/PIXEL-BANNER';
  const gh2 = GLYPH_H + 1;        // 1 blank row between lines
  const line = (s) => {
    const grids = [...s].map((c) => toGrid(GLYPHS[c] ?? GLYPHS['?']));
    const n = grids.length, gw = grids[0][0].length, sp = 2;
    const w = n * gw + (n - 1) * sp;
    const ox = (i) => i * (gw + sp);
    const d = grids.map((g, i) => runs(g, ox(i), face)).join('');
    return { d, w };
  };
  const l1 = line(label);
  const l2 = line(url);
  const fw = Math.max(l1.w, l2.w);
  const fx0 = Math.max(1, Math.round((W - fw) / 2));   // centered
  const fy0 = H + 2;                                    // 2 cells below the banner
  const c0 = o.colors[0], c1 = o.colors[o.colors.length - 1];
  const fills = o.colors.length > 1 ? o.colors : [c0, c0];
  // on a light page a bright gradient disappears: darken the credit so it stays readable
  const ink = o.light ? fills.map((c) => mix(c, '#000000', 0.45)) : fills;
  const id = (o._footerId = (o._footerId || 0) + 1);
  const fgrad = `<linearGradient id="ff${id}" gradientUnits="userSpaceOnUse" x1="${fx0}" y1="0" x2="${fx0 + fw}" y2="0">`
    + ink.map((c, i) => `<stop offset="${i / (ink.length - 1)}" stop-color="${c}"/>`).join('') + `</linearGradient>`;
  return `<g font-family="none" shape-rendering="crispEdges"><a href="https://github.com/iamangusu/pixel-banner" target="_blank" rel="noopener">`
    + `<g transform="translate(${fx0} ${fy0})" fill="url(#ff${id})">`
    + `<path d="${l1.d}"/>`
    + `<path d="${l2.d}" transform="translate(0 ${gh2})"/>`
    + `</g></a></g>` + fgrad;
}
