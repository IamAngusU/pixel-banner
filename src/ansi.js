// ANSI renderer: same pixel grid as render.js, but drawn to a terminal.
// Uses 256-color mode for the gradient, dim colors for the 3D shadow.
// `draw` renders one static frame; `animate` loops forever for the effects.
import readline from 'node:readline';
import { GLYPHS, GLYPH_W, GLYPH_H } from './font.js';
import { PRESETS } from './presets.js';
import { DEFAULTS } from './render.js';

// parse colors like "#RRGGBB" -> [r,g,b] (0..255)
function rgb(hex) { return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)); }
// hex -> 256-color palette index (6x6x6 cube) via nearest neighbor
function x256(hex) {
  const [r, g, b] = rgb(hex);
  if (r === g && g === b) {
    if (r < 8) return 16;
    if (r > 248) return 231;
    return 232 + Math.round((r - 8) / 247 * 23);
  }
  return 16 + 36 * Math.round(r / 255 * 5) + 6 * Math.round(g / 255 * 5) + Math.round(b / 255 * 5);
}
function mix(a, b, t) {
  // mix two hex colors; t 0..1 -> weight of b
  const A = rgb(a), B = rgb(b);
  const c = A.map((v, i) => Math.round(v + (B[i] - v) * t));
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
}
// Lightmode on a white terminal: the 256-color gray ramp (232..255) is nearly
// invisible on light backgrounds, and bright "shine" turns into mud. So bright
// text colors are darkened for contrast and dim/emboss cells use the dark end.
function lightInk(hex) {
  const [r, g, b] = rgb(hex);
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  if (lum <= 0.55) return hex;                       // already dark enough
  return mix(hex, '#000000', Math.min(0.6, (lum - 0.55) * 1.4));
}
function toGrid(val) {
  return val.map((row) => Array.from({ length: GLYPH_W }, (_, x) => (row >> (GLYPH_W - 1 - x)) & 1 ? 1 : 0));
}
function thicken(g) {
  // double every cell (weight: 2) -> 10x... but 2x cells read as "8-bit chunky" in terminal
  return g.map((row) => row.flatMap((v) => [v, v]));
}

export function buildFrame(text, opts = {}) {
  const o = { ...DEFAULTS, ...PRESETS[opts.preset], ...opts };
  const chars = [...String(text).toUpperCase()];
  const grids = chars.map((c) => toGrid(GLYPHS[c] ?? GLYPHS['?']));
  const thick = !!o.weight || o.weight > 1;
  const gs = grids.map((g) => (thick ? thicken(g) : g));
  const n = gs.length, gh = gs[0].length;
  // light mode: keep the same layout, just make every color readable on white
  const light = !!o.light;
  const colors = (o.colors.length > 1 ? o.colors : [o.colors[0], o.colors[0]])
    .map((c) => (light ? lightInk(c) : c));
  return { o, chars, gs, n, gh, colors };
}

// returns an array of rows; each row is an array of {code, fg, dim} cells
export function renderCells(frame, t = 0) {
  const { o, gs, n, gh, colors } = frame;
  const sp = o.spacing || 1;
  const depth = o.depth || 1;
  const spacing = Math.max(2, Math.ceil(sp / 2));      // terminal chars are taller than wide
  const gw = gs[0][0].length;
  const H = gh + depth;
  const W = n * gw + (n - 1) * spacing;
  const rows = Array.from({ length: H }, () => Array(W).fill(null));

  const anim = o.animation;
  const light = !!o.light;
  const wave = anim === 'wave';
  const blink = anim === 'blink';
  const reveal = anim === 'reveal';
  const floor = anim === 'floor';

  for (let i = 0; i < n; i++) {
    const g = gs[i];
    const ox = i * (gw + spacing);
    const rise = reveal ? Math.max(0, Math.round((1 - (t - i * 0.18)) * 2)) : 0;
    for (let y = 0; y < gh; y++) {
      const yy = y + depth + (wave ? (Math.sin(t * 2.5 + i) > 0 ? 0 : 1) : 0) - rise;
      if (yy < 0 || yy >= H) continue;
      for (let x = 0; x < gw; x++) {
        if (!g[y][x]) continue;
        const c = ox + x;
        // gradient across the whole banner, left -> right
        const gt = colors.length > 1 ? c / (W - 1) : 0;
        let color = colors[0];
        if (colors.length > 1) {
          const seg = gt * (colors.length - 1);
          const a = colors[Math.floor(seg)], b = colors[Math.min(colors.length - 1, Math.ceil(seg))];
          color = mix(a, b, seg - Math.floor(seg));
        }
        const dim = depth > 0 && y < depth;             // shadow rows
        let fg = color;
        if (dim) fg = mix(o.shadow || '#000000', color, light ? 0.25 : 0.4);
        if (floor) fg = color;
        rows[yy][c] = { ch: '█', fg, dim };
        // draw the "sides" of each chunky cell for depth
        if (dim && g[y][x]) rows[yy][c] = { ch: light ? '░' : '▒', fg, dim: true };
      }
    }
  }
  // blink: add a soft cut on even frames
  if (blink && Math.floor(t * 2) % 2 === 1) {
    for (const row of rows) for (const cell of row) if (cell) cell.dim = true;
  }
  return rows;
}

export function frameToString(frame, t) {
  const rows = renderCells(frame, t);
  const { o, gh, colors } = frame;
  const light = !!o.light;
  const floor = o.animation === 'floor';
  let out = '';
  const W = rows[0].length;
  for (const row of rows) {
    for (const cell of row) {
      if (!cell) { out += ' '; continue; }
      // on a light terminal the "dim" attribute makes text unreadable, so use a
      // darker ink color instead of ANSI dim there
      const code = cell.dim && !light ? '\x1b[2m' : '';
      out += `\x1b[38;5;${x256(cell.fg)}m${code}${cell.ch}\x1b[0m`;
    }
    out += '\n';
  }
  if (floor) {
    // a sweeping highlight band along the bottom, using the last color
    const band = Math.floor((t * 3) % W);
    const bandInk = light ? mix(colors[colors.length - 1], '#000000', 0.35) : colors[colors.length - 1];
    const line = Array.from({ length: W }, (_, i) => {
      const d = Math.abs(i - band);
      const strong = d < 4;
      return strong ? `\x1b[38;5;${x256(bandInk)}m▓\x1b[0m` : (d < 8 ? '░' : ' ');
    }).join('');
    out += line + '\n';
  }
  // powered-by footer
  if (o.footer) {
    const credit = light ? `\x1b[38;5;${x256(mix(colors[0], '#000000', 0.35))}m` : `\x1b[38;5;${x256(colors[0])}m`;
    out += `${credit}  powered by \x1b[0m\x1b[1mpixel-banner\x1b[0m  ·  github.com/iamangusu/pixel-banner\n`;
  }
  return out.slice(0, -1); // strip trailing newline
}

export function animate(text, opts = {}) {
  const frame = buildFrame(text, opts);
  const fps = 12;
  let t = 0;
  const total = frame.o.animation === 'none' || !frame.o.animation ? -1 : Infinity;
  readline.cursorTo(process.stdout, 0, 0);
  if (process.stdout.isTTY) process.stdout.write('\x1b[?25l'); // hide cursor
  const tick = () => {
    readline.cursorTo(process.stdout, 0, 0);
    process.stdout.write(frameToString(frame, t));
    t += 1 / fps;
    if (total > 0 && t >= total) { cleanup(); return; }
    timer = setTimeout(tick, 1000 / fps);
  };
  let timer = setTimeout(tick, 0);
  const cleanup = () => { clearTimeout(timer); if (process.stdout.isTTY) process.stdout.write('\x1b[?25h\x1b[0m\n'); };
  process.on('SIGINT', () => { cleanup(); process.exit(0); });
  return cleanup;
}
