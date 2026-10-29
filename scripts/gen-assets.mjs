// Generates the README banner and the example gallery with the tool itself.
import { writeFileSync } from 'node:fs';
import { renderSvg } from '../src/index.js';

const out = (f, text, opts) => writeFileSync(new URL('../' + f, import.meta.url), renderSvg(text, opts) + '\n');

out('assets/banner.svg', 'PIXEL-BANNER', { preset: 'neon', scale: 6 });
out('assets/pixel-banner.svg', 'PIXEL-BANNER', { preset: 'neon', animation: 'reveal+shimmer', scale: 8 });
out('examples/hello.svg', 'HELLO', { preset: 'aiphone', scale: 5 });
out('examples/neon.svg', 'NEON', { preset: 'neon', scale: 5 });
out('examples/fire.svg', 'FIRE', { preset: 'fire', scale: 5 });
out('examples/wave.svg', 'WAVE', { preset: 'mono', animation: 'wave', colors: ['#FF6BD6', '#6BD6FF'], shadow: '#2A1A4A', weight: 2, scale: 5 });
out('examples/floor.svg', 'FLOOR', { preset: 'floor', scale: 5 });
out('examples/reveal.svg', 'REVEAL', { preset: 'reveal', scale: 5 });
// light-mode looks, transparent by design (they sit on white pages)
out('examples/light.svg', 'LIGHT', { preset: 'light', scale: 5 });
out('examples/light-mint.svg', 'MINT', { preset: 'light-mint', scale: 5 });

// Adaptive, clickable README button based on the generator badge in IamAngusU/badges.
const pbMark = renderSvg('PB', {
  preset: 'neon', animation: 'none', depth: 0, padding: 0, spacing: 0, highlight: 0, scale: 5,
});
const pbViewBox = pbMark.match(/viewBox="([^"]+)"/)[1];
const pbContent = pbMark.slice(pbMark.indexOf('>') + 1, pbMark.lastIndexOf('</svg>'));
const generatorButton = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="72" viewBox="0 0 480 72" role="img" aria-label="Open the Pixel Banner generator">
  <title>Open the Pixel Banner generator</title>
  <style>.badge-bg{fill:#fff;stroke:#dfe3e9}.badge-fg{fill:#11151b}.badge-muted{fill:#667085}.badge-sep{stroke:#d2d8e0}@media(prefers-color-scheme:dark){.badge-bg{fill:#0b0f14;stroke:#303741}.badge-fg{fill:#f7f8fa}.badge-muted{fill:#949eac}.badge-sep{stroke:#49515c}}</style>
  <rect class="badge-bg" x="1" y="1" width="478" height="70" rx="18"/>
  <svg x="16" y="11" width="50" height="50" viewBox="${pbViewBox}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${pbContent}</svg>
  <path class="badge-sep" d="M82 15V57" fill="none" stroke-width="1.25"/>
  <text class="badge-fg" x="101" y="44" font-family="Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif" font-size="24" font-weight="720">Pixel Banner</text>
  <path class="badge-sep" d="M268 18V54" fill="none" stroke-width="1.25"/>
  <text class="badge-muted" x="288" y="43" font-family="Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif" font-size="20" font-weight="500">Open generator</text>
</svg>`;
writeFileSync(new URL('../assets/generator-button.svg', import.meta.url), generatorButton + '\n');
console.log('generated assets/ and examples/');
