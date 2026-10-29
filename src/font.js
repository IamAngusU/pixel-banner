// 5x7 pixel font. Each row is 5 bits (MSB on the left), written in hex.
export const GLYPH_W = 5;
export const GLYPH_H = 7;
const raw = {
  A: '0E 11 11 1F 11 11 11', B: '1E 11 11 1E 11 11 1E', C: '0E 11 10 10 10 11 0E',
  D: '1E 11 11 11 11 11 1E', E: '1F 10 10 1E 10 10 1F', F: '1F 10 10 1E 10 10 10',
  G: '0E 11 10 17 11 11 0F', H: '11 11 11 1F 11 11 11', I: '0E 04 04 04 04 04 0E',
  J: '07 02 02 02 02 12 0C', K: '11 12 14 18 14 12 11', L: '10 10 10 10 10 10 1F',
  M: '11 1B 15 15 11 11 11', N: '11 19 15 13 11 11 11', O: '0E 11 11 11 11 11 0E',
  P: '1E 11 11 1E 10 10 10', Q: '0E 11 11 11 15 12 0D', R: '1E 11 11 1E 14 12 11',
  S: '0F 10 10 0E 01 01 1E', T: '1F 04 04 04 04 04 04', U: '11 11 11 11 11 11 0E',
  V: '11 11 11 11 11 0A 04', W: '11 11 11 15 15 15 0A', X: '11 11 0A 04 0A 11 11',
  Y: '11 11 0A 04 04 04 04', Z: '1F 01 02 04 08 10 1F',
  0: '0E 11 13 15 19 11 0E', 1: '04 0C 04 04 04 04 0E', 2: '0E 11 01 02 04 08 1F',
  3: '1F 02 04 02 01 11 0E', 4: '02 06 0A 12 1F 02 02', 5: '1F 10 1E 01 01 11 0E',
  6: '06 08 10 1E 11 11 0E', 7: '1F 01 02 04 08 08 08', 8: '0E 11 11 0E 11 11 0E',
  9: '0E 11 11 0F 01 02 0C',
  ' ': '00 00 00 00 00 00 00', '-': '00 00 00 1F 00 00 00', '_': '00 00 00 00 00 00 1F',
  '.': '00 00 00 00 00 0C 0C', ',': '00 00 00 00 00 0C 08', ':': '00 0C 0C 00 0C 0C 00', '!': '04 04 04 04 04 00 04',
  '?': '0E 11 01 02 04 00 04', '+': '00 04 04 1F 04 04 00', '/': '01 01 02 04 08 10 10', '\\': '10 10 08 04 02 01 01',
  '"': '0A 0A 0A 00 00 00 00', '#': '0A 0A 1F 0A 1F 0A 0A', '$': '04 0F 14 0E 05 1E 04',
  '%': '18 19 02 04 08 13 03', '&': '0C 12 14 08 15 12 0D', "'": '04 04 08 00 00 00 00',
  '*': '00 15 0E 1F 0E 15 00', ';': '00 0C 0C 00 0C 08 10', '=': '00 1F 00 1F 00 00 00',
  '@': '0E 11 17 15 17 10 0E', '[': '0E 08 08 08 08 08 0E', ']': '0E 02 02 02 02 02 0E',
  '^': '04 0A 11 00 00 00 00', '`': '08 04 00 00 00 00 00', '{': '02 04 04 08 04 04 02',
  '|': '04 04 04 04 04 04 04', '}': '08 04 04 02 04 04 08', '~': '00 00 09 16 00 00 00',
  '§': '0E 10 0E 11 0E 01 0E', '€': '0E 10 1C 10 1C 10 0E', '°': '0C 12 12 0C 00 00 00',
  '¹': '04 0C 04 04 04 0E 00', '²': '0E 11 02 04 08 1F 00', '³': '1E 02 04 02 11 0E 00',
  '(': '02 04 08 08 08 04 02', ')': '08 04 02 02 02 04 08',
  '<': '02 04 08 10 08 04 02', '>': '08 04 02 01 02 04 08',
};
export const GLYPHS = Object.fromEntries(
  Object.entries(raw).map(([k, v]) => [k, v.split(' ').map((h) => parseInt(h, 16))]),
);

const transliterations = {
  'ẞ': 'SS', 'Æ': 'AE', 'Œ': 'OE', 'Ø': 'O', 'Ð': 'D', 'Þ': 'TH', 'Ł': 'L', 'Đ': 'D', 'Ŋ': 'N', 'Ħ': 'H',
  '£': 'L', '¥': 'Y', 'µ': 'M', 'Μ': 'M',
};

// Keep the pixel alphabet compact while accepting accented Latin input. The
// base glyph is used for accents; symbols with their own glyph stay distinct.
export function mapTextToGlyphs(text) {
  const chars = [];
  for (const source of String(text)) {
    const upper = source.toUpperCase();
    if (GLYPHS[upper]) {
      chars.push(upper);
      continue;
    }
    const mapped = transliterations[upper] ?? transliterations[source];
    const normalized = mapped ?? upper.normalize('NFD').replace(/\p{M}/gu, '');
    for (const char of normalized) chars.push(GLYPHS[char] ? char : '?');
  }
  return chars;
}
