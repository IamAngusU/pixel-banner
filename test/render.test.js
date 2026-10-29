import test from 'node:test';
import assert from 'node:assert/strict';
import { renderSvg, PRESETS, GLYPHS, GLYPH_H, mapTextToGlyphs } from '../src/index.js';

test('renders a valid, scalable svg', () => {
  const svg = renderSvg('HI');
  assert.match(svg, /^<svg [^>]*viewBox="0 0 \d+ \d+"/);
  assert.ok(svg.endsWith('</svg>'));
  assert.ok(!svg.includes('NaN') && !svg.includes('undefined'));
});

test('scale changes the output size, not the viewBox', () => {
  const a = renderSvg('HI', { scale: 4 }), b = renderSvg('HI', { scale: 8 });
  assert.equal(a.match(/viewBox="[^"]+"/)[0], b.match(/viewBox="[^"]+"/)[0]);
  assert.equal(2 * +a.match(/ width="(\d+)"/)[1], +b.match(/ width="(\d+)"/)[1]);
});

test('empty text throws, unsupported characters fall back to "?"', () => {
  assert.throws(() => renderSvg(''));
  const glyph = (s) => s.match(/<path id="g0" d="[^"]*"/)[0];
  assert.equal(glyph(renderSvg('🙂')), glyph(renderSvg('?')));
});

test('every printable ASCII keyboard character has a glyph', () => {
  for (let code = 32; code <= 126; code++) {
    const char = String.fromCharCode(code);
    assert.ok(Object.hasOwn(GLYPHS, char.toUpperCase()), `missing glyph for ${JSON.stringify(char)}`);
    assert.equal(mapTextToGlyphs(char).length, 1, `unexpected expansion for ${JSON.stringify(char)}`);
  }
});

test('common German and accented Latin keyboard input is handled', () => {
  assert.deepEqual(mapTextToGlyphs('äöüßÄÖÜẞ'), ['A', 'O', 'U', 'S', 'S', 'A', 'O', 'U', 'S', 'S']);
  assert.deepEqual(mapTextToGlyphs('éñøæœ'), ['E', 'N', 'O', 'A', 'E', 'O', 'E']);
  assert.ok(GLYPHS['§'] && GLYPHS['€'] && GLYPHS['°'] && GLYPHS['²'] && GLYPHS['³']);
});

// --- light mode & transparency -------------------------------------------

test('transparent: no background rect, an explicit bg paints one', () => {
  assert.ok(!/<rect width=/.test(renderSvg('A')), 'default is transparent');
  assert.ok(!/<rect width=/.test(renderSvg('A', { transparent: true, bg: '#000' })), 'transparent wins over bg');
  assert.match(renderSvg('A', { bg: '#101018' }), /<rect width="\d+" height="\d+" fill="#101018"\/>/);
});

test('light mode: no bg rect, dark ink, embossed shadow, no white shine', () => {
  const svg = renderSvg('A', { preset: 'light', footer: true });
  assert.ok(!/<rect width=/.test(svg), 'light preset is transparent');
  assert.match(svg, /fill="none" stroke="#[0-9a-f]{6}" stroke-width="0\.5"/);   // ink rim
  assert.ok(!/fill="#fff"/.test(svg), 'no white shine in light mode');
  assert.ok(!svg.includes('NaN') && !svg.includes('undefined') && svg.endsWith('</svg>'));
});

test('light mode darkens the footer credit for white pages', () => {
  const dark = renderSvg('A', { footer: true, colors: ['#ffffff', '#ffffff'], shadow: '#000' });
  const light = renderSvg('A', { footer: true, light: true, colors: ['#ffffff', '#ffffff'], shadow: '#000' });
  const stop = (s) => s.match(/id="ff\d+" gradientUnits[^>]*><stop offset="0(?:\.0+)?" stop-color="(#[0-9a-f]{6})"/)[1];
  assert.equal(stop(dark), '#ffffff');
  assert.notEqual(stop(light), '#ffffff');
});

test('svg is responsive: viewBox + preserveAspectRatio, no fixed CSS', () => {
  const svg = renderSvg('HI', { scale: 8 });
  assert.match(svg, /viewBox="0 0 \d+ \d+"/);
  assert.match(svg, /preserveAspectRatio="xMidYMid meet"/);
  assert.match(svg, /aria-label="HI"/);
  assert.ok(!/style=/.test(svg), 'sizing is left to CSS max-width');
});

test('animations add the expected elements', () => {
  assert.match(renderSvg('A', { animation: 'wave' }), /animateTransform[^>]*type="translate"/);
  assert.match(renderSvg('A', { animation: 'shimmer' }), /<animate attributeName="x1"/);
  assert.match(renderSvg('A', { animation: 'blink' }), /attributeName="opacity"/);
  assert.ok(!renderSvg('A').includes('<animate'));
});

test('gradient faces use shared banner coordinates so shimmer spans the text', () => {
  const svg = renderSvg('AB', { animation: 'shimmer', depth: 0, highlight: 0 });
  const facePaths = [...svg.matchAll(/<path d="([^"]+)" fill="url\(#f\)"\/>/g)].map((match) => match[1]);
  assert.equal(facePaths.length, 2);
  const firstX = (path) => Number(path.match(/M([\d.-]+)/)[1]);
  assert.ok(firstX(facePaths[1]) > firstX(facePaths[0]), 'each glyph face is positioned in banner coordinates');
  assert.match(svg, /<linearGradient id="f" gradientUnits="userSpaceOnUse" x1="1" y1="0" x2="\d+" y2="0"/);
  assert.match(svg, /<animate attributeName="x1" values="1;23" dur="4s" begin="0s" repeatCount="indefinite"\/>/);
  assert.match(svg, /<animate attributeName="x2" values="12;34" dur="4s" begin="0s" repeatCount="indefinite"\/>/);
  assert.ok(!svg.includes('attributeName="gradientTransform"'));
});

test('shimmer moves the selected multicolor gradient across the face', () => {
  const svg = renderSvg('AB', { animation: 'shimmer', depth: 0, highlight: 0 });
  assert.match(svg, /<stop offset="0\.000" stop-color="#5B6CFF"\/><stop offset="1\.000" stop-color="#A66BFF"\/>/);
  assert.match(svg, /<animate attributeName="x1" values="1;23" dur="4s" begin="0s" repeatCount="indefinite"\/>/);
  assert.ok(!svg.includes('id="shine"'), 'no white overlay band replaces the selected gradient');

  const afterReveal = renderSvg('HI', { animation: 'reveal+shimmer' });
  assert.equal([...afterReveal.matchAll(/<animate attributeName="opacity" values="0;1"/g)].length, 2);
  assert.match(afterReveal, /<animate attributeName="x1"[^>]*dur="4s" begin="0\.88s"/);
});

test('vertical shimmer animates the gradient endpoints on the y axis', () => {
  const svg = renderSvg('AB', { animation: 'shimmer', vertical: true, depth: 0, highlight: 0 });
  assert.match(svg, /<animate attributeName="y1" values="1;15" dur="4s" begin="0s" repeatCount="indefinite"\/>/);
  assert.match(svg, /<animate attributeName="y2" values="8;22" dur="4s" begin="0s" repeatCount="indefinite"\/>/);
});

test('floor animation does not animate the text gradient', () => {
  const svg = renderSvg('HI', { animation: 'floor' });
  assert.ok(!svg.includes('attributeName="gradientTransform"'));
  assert.ok(!/animate attributeName="x1"/.test(svg));
  assert.match(svg, /<animate attributeName="x"/, 'floor bands still move independently');
});

test('renderer keeps any requested number of gradient stops', () => {
  const colors = ['#ff0000', '#ff8800', '#ffff00', '#00ff88', '#0088ff'];
  const svg = renderSvg('A', { colors });
  const gradient = svg.match(/<linearGradient id="f"[^>]*>([\s\S]*?)<\/linearGradient>/)[1];
  assert.equal([...gradient.matchAll(/<stop\b/g)].length, colors.length);
});

test('every preset renders', () => {
  for (const preset of Object.keys(PRESETS)) assert.ok(renderSvg('TEST', { preset }));
});

test('font data is well-formed', () => {
  for (const [ch, rows] of Object.entries(GLYPHS)) {
    assert.equal(rows.length, GLYPH_H, ch);
    assert.ok(rows.every((r) => r >= 0 && r < 32), ch);
  }
});

test('floor animation adds a gradient floor band', () => {
  const svg = renderSvg('HI', { animation: 'floor' });
  assert.ok(svg.includes('reflect'), 'gradient spreadMethod reflect present');
  assert.match(svg, /<animate attributeName="x"/, 'floor bands move below the text');
  assert.ok(!svg.includes('NaN') && !svg.includes('undefined'));
});

test('reveal animation staggers every letter, including long text', () => {
  const svg = renderSvg('ABCDEFGHIJKLMNOPQRST', { animation: 'reveal' });
  const fades = [...svg.matchAll(/<animate attributeName="opacity" values="0;1" dur="0\.7s" begin="([\d.]+)s" fill="freeze"\/>/g)];
  const times = fades.map((m) => Number(m[1]));
  assert.equal(times.length, 20, 'all 20 letters get a reveal animation');
  assert.equal(times[0], 0, 'the first letter starts immediately');
  assert.equal(times[1], 0.18, 'the next letter is staggered');
  assert.equal(times.at(-1), 3.42, 'the last letter still gets a valid delay');
  assert.match(svg, /<g opacity="0" transform="translate\(0 3\)" filter="url\(#blur\)">/, 'letters start hidden, raised, and blurred before their delay');
  assert.ok(!/keyTimes="0;[1-9]/.test(svg), 'seconds are not incorrectly used as normalized keyTimes');
  assert.match(svg, /attributeName="filter" values="url\(#blur\);none"/);
});

test('reveal supports configurable duration, easing, and accelerating letter starts', () => {
  const svg = renderSvg('ABCD', {
    animation: 'reveal',
    revealDuration: 0.4,
    revealStagger: 0.2,
    revealBezier: [0.1, 0.2, 0.8, 0.9],
    revealStaggerCurve: 'accelerate',
  });
  assert.match(svg, /values="0;1" calcMode="spline" keyTimes="0;1" keySplines="0.1 0.2 0.8 0.9" dur="0.4s"/);
  const times = [...svg.matchAll(/attributeName="opacity" values="0;1"[^>]*begin="([\\d.]+)s"/g)].map((m) => Number(m[1]));
  assert.equal(times.length, 4);
  assert.equal(times[0], 0);
  assert.ok(times[2] - times[1] < times[1] - times[0] || times[1] === 0, 'later letters begin with progressively shorter gaps');
  assert.ok(times[3] > times[2]);
});

test('reveal falls back to safe easing values for invalid custom curves', () => {
  const svg = renderSvg('AB', { animation: 'reveal', revealBezier: ['bad', -3, 2, 0.5] });
  assert.ok(!svg.includes('NaN') && !svg.includes('undefined'));
  assert.match(svg, /keySplines="0.22 0 1 0.5"/);
});

test('footer renders powered-by credit with repo link', () => {
  const svg = renderSvg('HI', { footer: true });
  assert.ok(svg.includes('github.com/iamangusu/pixel-banner'), 'href present');
  assert.match(svg, /<a href=[^>]*github\.com\/iamangusu\/pixel-banner/, 'anchor wraps credit');
  assert.ok(svg.includes('url(#ff'), 'footer has its own gradient');
  assert.ok(!svg.includes('path d="<path'), 'no nested path bug');
});


test('glyph width changes geometry while keeping SVG valid', () => {
  const normal = renderSvg('TEST', { glyphWidth: 100 });
  const narrow = renderSvg('TEST', { glyphWidth: 60 });
  const wide = renderSvg('TEST', { glyphWidth: 140 });
  const width = (svg) => Number(svg.match(/viewBox="0 0 ([\d.]+) /)[1]);
  assert.ok(width(narrow) < width(normal), 'narrow glyphs reduce the viewBox width');
  assert.ok(width(wide) > width(normal), 'wide glyphs expand the viewBox width');
  assert.ok(!narrow.includes('NaN') && !narrow.includes('undefined'));
});

test('taper progressively compresses glyphs from left to right', () => {
  const svg = renderSvg('ABCD', { taper: true });
  assert.match(svg, /scale\(1\.0000 1\)/, 'first letter keeps the selected width');
  assert.match(svg, /scale\(0\.7200 1\)/, 'last letter narrows by 28 percent');
  assert.ok(!svg.includes('NaN') && svg.endsWith('</svg>'));
});
