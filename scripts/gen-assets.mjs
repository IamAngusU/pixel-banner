// Generates the README banner and the example gallery with the tool itself.
import { writeFileSync } from 'node:fs';
import { renderSvg } from '../src/index.js';

const out = (f, text, opts) => writeFileSync(new URL('../' + f, import.meta.url), renderSvg(text, opts) + '\n');

out('assets/banner.svg', 'PIXEL-BANNER', { preset: 'aiphone', scale: 6 });
out('examples/hello.svg', 'HELLO', { preset: 'aiphone', scale: 5 });
out('examples/neon.svg', 'NEON', { preset: 'neon', scale: 5 });
out('examples/fire.svg', 'FIRE', { preset: 'fire', scale: 5 });
out('examples/wave.svg', 'WAVE', { preset: 'mono', animation: 'wave', colors: ['#FF6BD6', '#6BD6FF'], shadow: '#2A1A4A', weight: 2, scale: 5 });
out('examples/floor.svg', 'FLOOR', { preset: 'floor', scale: 5 });
out('examples/reveal.svg', 'REVEAL', { preset: 'reveal', scale: 5, footer: true });
// light-mode looks, transparent by design (they sit on white pages)
out('examples/light.svg', 'LIGHT', { preset: 'light', scale: 5 });
out('examples/light-mint.svg', 'MINT', { preset: 'light-mint', scale: 5, footer: true });
console.log('generated assets/ and examples/');
