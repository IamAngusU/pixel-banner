// Terminal renderer: draws the same 5x7 pixel glyphs as the SVG renderer.
// Each terminal cell uses a half-block so its foreground and background can
// represent two vertically stacked pixels with 24-bit color.
import readline from 'node:readline';
import { GLYPHS, GLYPH_W } from './font.js';
import { PRESETS } from './presets.js';
import { DEFAULTS } from './render.js';

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const hex = (channels) => '#' + channels.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
const mix = (a, b, t) => {
  const A = rgb(a), B = rgb(b);
  return hex(A.map((v, i) => v + (B[i] - v) * t));
};
const animationsOf = (value) => new Set((Array.isArray(value) ? value : String(value || 'none').split('+'))
  .map((name) => String(name).trim()).filter(Boolean));
const mod = (n, m) => ((n % m) + m) % m;

// Match render.js: a one-cell 2x2 dilation makes each 5x7 glyph 6x8.
function thicken(g) {
  const at = (y, x) => g[y]?.[x] || 0;
  return Array.from({ length: g.length + 1 }, (_, y) =>
    Array.from({ length: g[0].length + 1 }, (_, x) =>
      at(y, x) | at(y, x - 1) | at(y - 1, x) | at(y - 1, x - 1)));
}

function toGrid(value) {
  return value.map((row) => Array.from({ length: GLYPH_W }, (_, x) =>
    (row >> (GLYPH_W - 1 - x)) & 1));
}

function lightInk(color) {
  const [r, g, b] = rgb(color);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  if (luminance <= 0.55) return color;
  return mix(color, '#000000', Math.min(0.6, (luminance - 0.55) * 1.4));
}

export function buildFrame(text, opts = {}) {
  const o = { ...DEFAULTS, ...PRESETS[opts.preset], ...opts };
  const chars = [...String(text).toUpperCase()];
  if (!chars.length) throw new Error('Text is empty');

  const animations = animationsOf(o.animation);
  const grids = chars.map((char) => {
    const grid = toGrid(GLYPHS[char] ?? GLYPHS['?']);
    return Number(o.weight) > 1 ? thicken(grid) : grid;
  });
  const n = grids.length, glyphHeight = grids[0].length;
  const widthScale = Math.max(40, Math.min(160, Number(o.glyphWidth) || 100)) / 100;
  const taperAmount = o.taper && n > 1 ? 0.28 : 0;
  const glyphScales = grids.map((_, i) => widthScale * (1 - taperAmount * (i / Math.max(1, n - 1))));
  const glyphWidths = grids.map((grid, i) => grid[0].length * glyphScales[i]);
  const padding = Math.max(0, Number(o.padding) || 0);
  const spacing = Math.max(0, Number(o.spacing) || 0);
  const depth = Math.max(0, Math.floor(Number(o.depth) || 0));
  const wave = animations.has('wave');
  const floor = animations.has('floor');
  const textWidth = glyphWidths.reduce((sum, width) => sum + width, 0) + (n - 1) * spacing;
  const width = Math.ceil(2 * padding + textWidth + depth);
  const floorHeight = floor ? 6 : 0;
  const height = Math.ceil(2 * (padding + (wave ? 1 : 0)) + glyphHeight + depth + floorHeight);
  const colors = (o.colors.length > 1 ? o.colors : [o.colors[0], o.colors[0]])
    .map((color) => (o.light ? lightInk(color) : color));

  return {
    o, chars, animations, grids, glyphScales, glyphWidths,
    n, glyphHeight, textWidth, width, height, padding, spacing, depth,
    glyphY: padding + (wave ? 1 : 0), floorHeight, colors,
  };
}

function gradientColor(frame, x, y, time) {
  const { o, animations, colors, padding, glyphY, textWidth, glyphHeight } = frame;
  let position = o.vertical
    ? (y - glyphY) / Math.max(1, glyphHeight)
    : (x - padding) / Math.max(1, textWidth);

  if (animations.has('shimmer')) {
    // Same four-second color sweep as the SVG's repeating translated gradient.
    const revealEnd = animations.has('reveal') ? (frame.n - 1) * 0.18 + 0.7 : 0;
    const elapsed = Math.max(0, time - revealEnd);
    const shift = (mod(elapsed, 4) / 4) * 2;
    const reflected = mod(position - shift, 2);
    position = reflected <= 1 ? reflected : 2 - reflected;
  }

  const segment = Math.max(0, Math.min(colors.length - 1, position * (colors.length - 1)));
  const index = Math.floor(segment);
  return mix(colors[index], colors[Math.min(colors.length - 1, index + 1)], segment - index);
}

function putPixel(canvas, x, y, color) {
  if (canvas[y] && x >= 0 && x < canvas[y].length) canvas[y][x] = color;
}

export function renderCells(frame, time = 0) {
  const { o, animations, grids, glyphScales, glyphWidths, n, width, height, padding, spacing, depth, glyphY } = frame;
  const canvas = Array.from({ length: height }, () => Array(width).fill(null));
  const origins = [];
  let offset = padding;
  for (let i = 0; i < n; i++) {
    origins.push(offset);
    offset += glyphWidths[i] + spacing;
  }

  const reveals = animations.has('reveal');
  for (let i = 0; i < n; i++) {
    const grid = grids[i], sx = glyphScales[i], ox = origins[i];
    const delay = i * 0.18;
    const progress = reveals ? Math.max(0, Math.min(1, (time - delay) / 0.7)) : 1;
    if (reveals && progress === 0) continue;
    const revealOffset = reveals ? Math.round(3 * (1 - progress)) : 0;
    const waveOffset = animations.has('wave') && Math.sin(time * 2.5 + i) <= 0 ? 1 : 0;
    const glyphRow = glyphY + revealOffset + waveOffset;

    const cellsAt = (x, y, dx, dy, color) => {
      const left = Math.floor(ox + x * sx + dx);
      const right = Math.max(left + 1, Math.ceil(ox + (x + 1) * sx + dx));
      for (let px = left; px < right; px++) putPixel(canvas, px, glyphRow + y + dy, color);
    };

    // Paint extruded sides behind the face, in the same order as render.js.
    for (let k = depth; k >= 1; k--) {
      const shadow = o.light ? mix(o.shadow, '#ffffff', 0.62) : o.shadow;
      const shadowColor = mix(shadow, o.light ? '#ffffff' : '#000000', ((k - 1) / Math.max(depth, 1)) * 0.5);
      for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
          if (grid[y][x]) cellsAt(x, y, k, k, shadowColor);
        }
      }
    }

    // Paint the front face with the selected full-banner gradient.
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        if (!grid[y][x]) continue;
        const left = Math.floor(ox + x * sx);
        const right = Math.max(left + 1, Math.ceil(ox + (x + 1) * sx));
        const isTopEdge = !grid[y - 1]?.[x];
        for (let px = left; px < right; px++) {
          let color = gradientColor(frame, px, glyphRow + y, time);
          if (reveals && progress < 1) color = mix('#000000', color, progress);
          if (animations.has('blink') && Math.floor(time * 2) % 2 === 1) color = mix('#000000', color, 0.4);
          if (isTopEdge && Number(o.highlight) > 0) {
            const shine = o.light ? mix(o.colors[0], '#000000', 0.55) : '#ffffff';
            color = mix(color, shine, o.light ? Math.min(1, o.highlight * 1.6) : o.highlight);
          }
          putPixel(canvas, px, glyphRow + y, color);
        }
      }
    }
  }

  if (frame.floorHeight) {
    const c0 = frame.colors[0], c1 = frame.colors.at(-1);
    const top = 2 * (padding + (animations.has('wave') ? 1 : 0)) + 7 + depth + (Number(o.weight) > 1 ? 1 : 0);
    const band = Math.floor((time * 3) % Math.max(1, width));
    for (let row = 0; row < frame.floorHeight; row++) {
      const t = (row + 1) / frame.floorHeight;
      const color = mix(mix(c1, c0, 0.25 + 0.75 * t), '#000000', t * 0.7);
      for (let x = 0; x < width; x++) {
        const distance = Math.abs(x - band);
        const cell = distance < 4 ? color : distance < 8 ? mix(color, '#000000', 0.6) : null;
        if (cell) putPixel(canvas, x, top + row, cell);
      }
    }
  }

  return canvas;
}

function foreground(color) {
  const [r, g, b] = rgb(color);
  return `\x1b[38;2;${r};${g};${b}m`;
}

function background(color) {
  const [r, g, b] = rgb(color);
  return `\x1b[48;2;${r};${g};${b}m`;
}

export function frameToString(frame, time = 0) {
  const pixels = renderCells(frame, time);
  let output = '';
  for (let y = 0; y < pixels.length; y += 2) {
    for (let x = 0; x < frame.width; x++) {
      const top = pixels[y][x], bottom = pixels[y + 1]?.[x];
      if (top && bottom) output += `${foreground(top)}${background(bottom)}▀\x1b[0m`;
      else if (top) output += `${foreground(top)}▀\x1b[0m`;
      else if (bottom) output += `${foreground(bottom)}▄\x1b[0m`;
      else output += ' ';
    }
    if (y + 2 < pixels.length) output += '\n';
  }

  if (frame.o.footer) {
    const color = frame.o.light ? mix(frame.colors[0], '#000000', 0.35) : frame.colors[0];
    output += `\n${foreground(color)}powered by pixel-banner · github.com/iamangusu/pixel-banner\x1b[0m`;
  }
  return output;
}

export function animate(text, opts = {}) {
  const frame = buildFrame(text, opts);
  const fps = 12;
  let time = 0;
  let timer;
  readline.cursorTo(process.stdout, 0, 0);
  process.stdout.write('\x1b[2J\x1b[H');
  if (process.stdout.isTTY) process.stdout.write('\x1b[?25l');
  const cleanup = () => {
    clearTimeout(timer);
    if (process.stdout.isTTY) process.stdout.write('\x1b[?25h\x1b[0m\n');
  };
  const tick = () => {
    readline.cursorTo(process.stdout, 0, 0);
    process.stdout.write(frameToString(frame, time));
    time += 1 / fps;
    timer = setTimeout(tick, 1000 / fps);
  };
  timer = setTimeout(tick, 0);
  process.once('SIGINT', () => { cleanup(); process.exit(0); });
  return cleanup;
}
