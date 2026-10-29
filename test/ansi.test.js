import test from 'node:test';
import assert from 'node:assert/strict';
import { GLYPHS } from '../src/font.js';
import { buildFrame, buildTerminalFrames, terminalFramesToString, wrapText } from '../src/ansi.js';

test('backslash has its own mirrored pixel glyph', () => {
  assert.deepEqual(GLYPHS['\\'], [...GLYPHS['/']].reverse());
});

test('terminal wrapping prefers spaces and stays inside the available width', () => {
  const lines = wrapText('HELLO WORLD', {}, 50);
  assert.deepEqual(lines, ['HELLO', 'WORLD']);
  assert.ok(lines.every((line) => buildFrame(line).width <= 49));
});

test('long unbroken text wraps between glyphs without losing characters', () => {
  const text = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const frames = buildTerminalFrames(text, {}, 50);
  assert.ok(frames.length > 1);
  assert.equal(frames.map((frame) => frame.chars.join('')).join(''), text);
  assert.ok(frames.every((frame) => frame.width <= 49));
});

test('explicit newlines stay as separate terminal lines', () => {
  assert.deepEqual(wrapText('HELLO\nWORLD', {}, 0), ['HELLO', 'WORLD']);
});

test('a wrapped footer appears once', () => {
  const frames = buildTerminalFrames('HELLO WORLD', { footer: true }, 50);
  const output = terminalFramesToString(frames);
  assert.equal((output.match(/powered by pixel-banner/g) || []).length, 1);
});
