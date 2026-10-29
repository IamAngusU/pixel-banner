#!/usr/bin/env node
import { writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { renderSvg } from './render.js';
import { PRESETS } from './presets.js';

const str = (short) => ({ type: 'string', ...(short && { short }) });
const { values: v, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    out: str('o'), preset: str('p'), colors: str(), shadow: str(), bg: str(), animation: str('a'),
    scale: str(), 'glyph-width': str(), width: str(), depth: str(), spacing: str(), weight: str(), highlight: str(), padding: str(),
    taper: { type: 'boolean' },
    vertical: { type: 'boolean' }, footer: { type: 'boolean' },
    light: { type: 'boolean' }, dark: { type: 'boolean' }, transparent: { type: 'boolean' },
    tui: { type: 'boolean' }, ansi: { type: 'boolean' }, live: { type: 'boolean' },
    help: { type: 'boolean', short: 'h' },
  },
});

if (v.help || (!positionals.length && !v.live)) {
  console.log(`pixel-banner "TEXT" [-o datei.svg] [-p ${Object.keys(PRESETS).join('|')}]
  --colors "#5B6CFF,#A66BFF"  --shadow "#2B2A6B"  --bg "#000"  --vertical
  --scale 8  --depth 3 (0 = flach, ganze Zahl >= 0)  --spacing 1  --weight 1|2  --highlight 0.25  --padding 1
  --footer   (powered-by-Credit mit github.com/iamangusu/pixel-banner anhängen)
  --light    (Lightmode: dunkle Schrift, heller Emboss, Schatten statt Weiß-Glanz)
  --transparent  (kein Hintergrund-Rechteck -> SVG legt sich auf jede Seite)
  --glyph-width 40..160  (Glyphs schmaler/breiter)
  --width 120  (ANSI/TUI/Live-Zeilenbreite; Standard: verfügbare Fensterbreite)
  --taper        (jedes folgende Zeichen bis zu 28% schmaler)
  --dark     (Lightmode aus, z. B. um ein light-Preset zu überschreiben)
  -a none|wave|shimmer|blink|floor|reveal|reveal+shimmer
  Terminal:  --ansi   (statisches Pixelbild mit 24-Bit-Farben ausgeben)
             --tui    (animiertes Pixelbild im Terminal, Strg-C beendet)
             --live   (Text interaktiv eingeben und Vorschau sofort sehen)`);
  process.exit(v.help ? 0 : 1);
}
if (v.preset && !PRESETS[v.preset]) { console.error(`Unknown preset: ${v.preset}`); process.exit(1); }

const NUM = ['scale', 'glyph-width', 'width', 'depth', 'spacing', 'weight', 'highlight', 'padding'];
const BOOL_SKIP = ['out', 'help', 'tui', 'ansi', 'live'];
const opts = {};
for (const [k, val] of Object.entries(v)) {
  if (BOOL_SKIP.includes(k)) continue;
  if (val === undefined) continue;
  // --dark is just "light off"; --light implies a transparent background unless --bg is set
  if (k === 'dark') { opts.light = false; continue; }
  const key = k === 'glyph-width' ? 'glyphWidth' : k;
  opts[key] = NUM.includes(k) ? Number(val) : k === 'colors' ? val.split(',') : val;
}
if (opts.light && opts.bg === undefined) opts.transparent = true;
if (opts.depth !== undefined && (!Number.isSafeInteger(opts.depth) || opts.depth < 0)) {
  console.error('--depth must be a non-negative integer');
  process.exit(1);
}

const text = positionals.join(' ');

if (v.live && (v.tui || v.ansi)) {
  console.error('--live cannot be combined with --ansi or --tui');
  process.exit(1);
}

if (v.live) {
  const { editLive, buildTerminalFrames, terminalFramesToString } = await import('./ansi.js');
  let liveText;
  try {
    liveText = await editLive(text, opts, () => Number(opts.width) > 0 ? opts.width : process.stdout.columns || 0);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
  if (liveText === null || liveText.length === 0) process.exit(0);
  if (v.out) {
    writeFileSync(v.out, renderSvg(liveText, opts));
    console.log(`Saved ${v.out}`);
  } else if (liveText.length) {
    const terminalColumns = Number(opts.width) > 0 ? opts.width : process.stdout.columns || 0;
    const frames = buildTerminalFrames(liveText, opts, terminalColumns);
    process.stdout.write(terminalFramesToString(frames) + '\n');
  }
} else if (v.tui || v.ansi) {
  const { terminalFramesToString, buildTerminalFrames, animate } = await import('./ansi.js');
  const terminalColumns = Number(opts.width) > 0 ? opts.width : process.stdout.columns || 0;
  if (v.tui) {
    animate(text, opts, terminalColumns);
  } else {
    const frames = buildTerminalFrames(text, opts, terminalColumns);
    const finalRevealTime = frames.reduce((time, frame) => frame && frame.animations.has('reveal')
      ? Math.max(time, (frame.n - 1) * 0.18 + 0.7)
      : time, 0);
    process.stdout.write(terminalFramesToString(frames, finalRevealTime) + '\n');
  }
} else {
  const svg = renderSvg(text, opts);
  v.out ? writeFileSync(v.out, svg) : process.stdout.write(svg + '\n');
}
