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
    scale: str(), 'glyph-width': str(), depth: str(), spacing: str(), weight: str(), highlight: str(), padding: str(),
    taper: { type: 'boolean' },
    vertical: { type: 'boolean' }, footer: { type: 'boolean' },
    light: { type: 'boolean' }, dark: { type: 'boolean' }, transparent: { type: 'boolean' },
    tui: { type: 'boolean' }, ansi: { type: 'boolean' },
    help: { type: 'boolean', short: 'h' },
  },
});

if (v.help || !positionals.length) {
  console.log(`pixel-banner "TEXT" [-o datei.svg] [-p ${Object.keys(PRESETS).join('|')}]
  --colors "#5B6CFF,#A66BFF"  --shadow "#2B2A6B"  --bg "#000"  --vertical
  --scale 8  --depth 3  --spacing 1  --weight 1|2  --highlight 0.25  --padding 1
  --footer   (powered-by-Credit mit github.com/iamangusu/pixel-banner anhängen)
  --light    (Lightmode: dunkle Schrift, heller Emboss, Schatten statt Weiß-Glanz)
  --transparent  (kein Hintergrund-Rechteck -> SVG legt sich auf jede Seite)
  --glyph-width 40..160  (Glyphs schmaler/breiter)
  --taper        (jedes folgende Zeichen bis zu 28% schmaler)
  --dark     (Lightmode aus, z. B. um ein light-Preset zu überschreiben)
  -a none|wave|shimmer|blink|floor|reveal|reveal+shimmer
  Terminal:  --ansi   (eine statische ANSI-Ansicht ausgeben)
             --tui    (animierte Live-Ansicht im Terminal, Strg-C beendet)`);
  process.exit(v.help ? 0 : 1);
}
if (v.preset && !PRESETS[v.preset]) { console.error(`Unknown preset: ${v.preset}`); process.exit(1); }

const NUM = ['scale', 'glyph-width', 'depth', 'spacing', 'weight', 'highlight', 'padding'];
const BOOL_SKIP = ['out', 'help', 'tui', 'ansi'];
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

const text = positionals.join(' ');

if (v.tui || v.ansi) {
  const { frameToString, buildFrame, animate } = await import('./ansi.js');
  if (v.tui) {
    animate(text, opts);
  } else {
    const frame = buildFrame(text, opts);
    process.stdout.write(frameToString(frame, 0) + '\n');
  }
} else {
  const svg = renderSvg(text, opts);
  v.out ? writeFileSync(v.out, svg) : process.stdout.write(svg + '\n');
}
