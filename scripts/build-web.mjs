// Builds docs/index.html: inlines the core (font, presets, render) into web/template.html.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const url = (f) => new URL('../' + f, import.meta.url);
const read = (f) => readFileSync(url(f), 'utf8');
const core = ['src/font.js', 'src/presets.js', 'src/render.js'].map(read).join('\n')
  .replace(/^import .*$/gm, '').replace(/^export /gm, '');
// Wrapped in a function so core names never collide with browser globals.
const bundle = `const PixelBanner = (() => {\n${core}\nreturn { renderSvg, DEFAULTS, PRESETS };\n})();`;
mkdirSync(url('docs/'), { recursive: true });
writeFileSync(url('docs/index.html'), read('web/template.html').replace('/*__CORE__*/', () => bundle));
console.log('built docs/index.html');
