const NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const SHARP_TO_FLAT = { 'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb' };

function normalizeRoot(root) {
  return SHARP_TO_FLAT[root] ?? root;
}

export function parseChord(chord) {
  const m = chord.match(/^([A-G][b#]?)(.*)/);
  if (!m) return { root: 'C', quality: 'maj7' };
  return { root: normalizeRoot(m[1]), quality: m[2] || '' };
}

export function getSemitones(fromKey, toKey) {
  const a = NOTES.indexOf(fromKey);
  const b = NOTES.indexOf(toKey);
  if (a === -1 || b === -1) return 0;
  return (b - a + 12) % 12;
}

export function transposeChord(chord, semitones) {
  if (!semitones) return chord;
  const { root, quality } = parseChord(chord);
  const idx = NOTES.indexOf(root);
  if (idx === -1) return chord;
  return NOTES[(idx + semitones + 12) % 12] + quality;
}

export function transposeProgression(bars, fromKey, toKey) {
  const semi = getSemitones(fromKey, toKey);
  if (!semi) return bars;
  return bars.map(c => transposeChord(c, semi));
}

const DOM7_QUALITIES = ['7', '7b9', '7#9', '7alt', '7b5', '7#5'];
const RESOLUTION_QUALITIES = ['maj7', 'm7', '6', 'm6', 'maj9', 'm9'];

export function applyTritoneSub(bars) {
  return bars.map(chord => {
    const { root, quality } = parseChord(chord);
    if (DOM7_QUALITIES.includes(quality)) {
      const idx = NOTES.indexOf(root);
      if (idx !== -1) return NOTES[(idx + 6) % 12] + '7';
    }
    return chord;
  });
}

export function applyIiVInsertion(bars) {
  const result = [];
  for (let i = 0; i < bars.length; i += 2) {
    const a = bars[i];
    const b = bars[i + 1];
    if (b !== undefined) {
      const { root, quality } = parseChord(b);
      const idx = NOTES.indexOf(root);
      if (idx !== -1 && RESOLUTION_QUALITIES.includes(quality)) {
        const iiRoot = NOTES[(idx + 10) % 12];
        const vRoot = NOTES[(idx + 5) % 12];
        result.push(iiRoot + 'm7', vRoot + '7');
      } else {
        result.push(a, b);
      }
    } else {
      result.push(a);
    }
  }
  return result;
}
