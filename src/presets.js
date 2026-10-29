// Presets are partial overrides of DEFAULTS (see render.js). Add new looks here.
export const PRESETS = {
  aiphone: { colors: ['#5B6CFF', '#A66BFF'], shadow: '#2B2A6B', weight: 2, depth: 3 },
  neon:    { colors: ['#00F5D4', '#00BBF9', '#F15BB5'], shadow: '#08305A', weight: 1, depth: 2, animation: 'shimmer' },
  fire:    { colors: ['#FFD60A', '#FF7B00', '#E5383B'], shadow: '#5A1A12', weight: 2, depth: 3 },
  mono:    { colors: ['#F2F2F2'], shadow: '#555555', weight: 1, depth: 2 },
  floor:   { colors: ['#00F5D4', '#00BBF9', '#F15BB5'], shadow: '#08305A', weight: 1, depth: 2, animation: 'floor' },
  reveal:  { colors: ['#5B6CFF', '#A66BFF'], shadow: '#2B2A6B', weight: 2, depth: 3, animation: 'reveal+shimmer' },
  // light mode: ink on paper, transparent by default (saturated colors that stay
  // readable on a white page; bright pastels would disappear there)
  light:       { light: true, transparent: true, colors: ['#2F3AE0', '#8A2BE2'], shadow: '#B9B9D6', weight: 2, depth: 3, highlight: 0.18 },
  'light-sun': { light: true, transparent: true, colors: ['#D2691E', '#C2185B', '#B45309'], shadow: '#E8D5B7', weight: 2, depth: 3, highlight: 0.15 },
  'light-mint':{ light: true, transparent: true, colors: ['#0F766E', '#0E7490'], shadow: '#C7E5E0', weight: 1, depth: 2, highlight: 0.15, animation: 'shimmer' },
  'light-ink': { light: true, transparent: true, colors: ['#111827'], shadow: '#D4D4D8', weight: 2, depth: 2, highlight: 0.12 },
};

// true for presets that already carry the light-mode look
export const isLightPreset = (name) => /^light(-|$)/.test(String(name || ''));
