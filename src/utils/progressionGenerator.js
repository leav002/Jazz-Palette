const NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

function noteAt(root, semi) {
  return NOTES[(NOTES.indexOf(root) + semi + 12) % 12];
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function maybe(p = 0.5) {
  return Math.random() < p;
}

// ─── Jazz ─────────────────────────────────────────────────────────────

function jazzChords(root) {
  const n = (semi, q) => noteAt(root, semi) + q;
  return {
    Imaj7:   n(0,  'maj7'),
    iim7:    n(2,  'm7'),
    iiim7:   n(4,  'm7'),
    IVmaj7:  n(5,  'maj7'),
    V7:      n(7,  '7'),
    V7alt:   n(7,  '7alt'),
    V7b9:    n(7,  '7b9'),
    bV7:     n(6,  '7'),       // tritone sub of V
    vim7:    n(9,  'm7'),
    viim7b5: n(11, 'm7b5'),
    VI7:     n(9,  '7'),       // V7/ii  (e.g. A7 in C)
    III7:    n(4,  '7'),       // V7/vi  (e.g. E7 in C)
    I7:      n(0,  '7'),       // V7/IV  (e.g. C7 in C)
    bII7:    n(1,  '7'),       // tritone sub of V (Neapolitan)
    bVII7:   n(10, '7'),       // subtonic dominant
  };
}

// 4-bar cells: arrays of chord keys from jazzChords()
const JAZZ_CELLS = {
  beginner: [
    { keys: ['iim7',  'V7',     'Imaj7',  'Imaj7'],  name: 'ii-V-I' },
    { keys: ['Imaj7', 'vim7',   'iim7',   'V7'],      name: '터어라운드' },
    { keys: ['Imaj7', 'IVmaj7', 'iim7',   'V7'],      name: 'I-IV-ii-V' },
    { keys: ['vim7',  'iim7',   'V7',     'Imaj7'],   name: 'vi-ii-V-I' },
    { keys: ['Imaj7', 'iiim7',  'iim7',   'V7'],      name: 'I-iii-ii-V' },
    { keys: ['Imaj7', 'Imaj7',  'iim7',   'V7'],      name: 'I 연장+ii-V' },
    { keys: ['iim7',  'V7',     'vim7',   'iim7'],    name: '기만 종지' },
  ],
  intermediate: [
    { keys: ['Imaj7', 'VI7',    'iim7',   'V7'],      name: '세컨더리 도미넌트' },
    { keys: ['Imaj7', 'III7',   'vim7',   'iim7'],    name: 'III7 경유' },
    { keys: ['Imaj7', 'I7',     'IVmaj7', 'iim7'],    name: 'V/IV 접근' },
    { keys: ['iim7',  'bII7',   'Imaj7',  'vim7'],    name: '트라이톤 대리' },
    { keys: ['iiim7', 'VI7',    'iim7',   'V7'],      name: 'iii-VI-ii-V' },
    { keys: ['Imaj7', 'viim7b5','III7',   'vim7'],    name: 'Bird 프레임' },
    { keys: ['IVmaj7','VI7',    'iim7',   'V7'],      name: 'IV-VI-ii-V' },
    { keys: ['vim7',  'III7',   'IVmaj7', 'V7'],      name: 'vi-III-IV-V' },
  ],
  advanced: [
    { keys: ['iim7',  'V7alt',  'Imaj7',  'Imaj7'],   name: '얼터드 도미넌트' },
    { keys: ['iim7',  'bII7',   'Imaj7',  'bVII7'],   name: '크로매틱 하강' },
    { keys: ['iim7',  'V7b9',   'vim7',   'VI7'],     name: 'b9+기만종지' },
    { keys: ['viim7b5','III7',  'vim7',   'iim7'],    name: 'ii-V/vi 연쇄' },
    { keys: ['iiim7', 'bII7',   'iim7',   'V7alt'],   name: '트라이톤+얼터드' },
    { keys: ['Imaj7', 'bV7',    'IVmaj7', 'iim7'],    name: 'bV7→IV 접근' },
  ],
};

export function generateJazz(keyRoot, difficulty) {
  const c = jazzChords(keyRoot);
  const resolve = (cell) => cell.keys.map(k => c[k]);

  let pool;
  if (difficulty === '초급') {
    pool = JAZZ_CELLS.beginner;
  } else if (difficulty === '중급') {
    pool = [...JAZZ_CELLS.beginner, ...JAZZ_CELLS.intermediate];
  } else {
    pool = [...JAZZ_CELLS.beginner, ...JAZZ_CELLS.intermediate, ...JAZZ_CELLS.advanced];
  }

  if (difficulty === '초급') {
    const cell = pick(pool);
    return { bars: resolve(cell), name: `${cell.name} (4마디)` };
  }

  // 8 bars: combine two distinct 4-bar cells
  const cell1 = pick(pool);
  let cell2;
  do { cell2 = pick(pool); } while (cell2 === cell1 && pool.length > 1);

  return {
    bars: [...resolve(cell1), ...resolve(cell2)],
    name: `${cell1.name} + ${cell2.name}`,
  };
}

// ─── Blues ────────────────────────────────────────────────────────────

export function generateBlues(keyRoot, difficulty) {
  const n = (semi, q) => noteAt(keyRoot, semi) + q;

  const I7   = n(0,  '7');
  const IV7  = n(5,  '7');
  const V7   = n(7,  '7');
  const iim7 = n(2,  'm7');
  const vim7 = n(9,  'm7');
  const VI7  = n(9,  '7');
  const dim7 = n(6,  'dim7');   // #IVdim7 chromatic passing
  const bII7 = n(1,  '7');      // tritone sub of V

  // Standard 12-bar template
  const bars = [I7, I7, I7, I7, IV7, IV7, I7, I7, V7, IV7, I7, V7];

  if (difficulty === '초급') {
    if (maybe(0.5)) bars[1] = IV7; // quick change
    return { bars, name: '블루스 (12마디)' };
  }

  // Quick change (bar 2)
  if (maybe(difficulty === '고급' ? 0.85 : 0.6)) bars[1] = IV7;

  // Bar 4: #IVdim7 chromatic approach to IV7 (bar 5)
  if (maybe(0.4)) bars[3] = dim7;

  // Bar 6: #IVdim7 as passing chord (common in jazz blues)
  if (maybe(0.35)) bars[5] = dim7;

  // Bar 8: VI7 as secondary dominant setting up ii-V
  if (maybe(0.5)) bars[7] = VI7;

  // Bars 9-10: ii-V (jazz) vs V7-IV7 (blues)
  if (maybe(difficulty === '고급' ? 0.8 : 0.5)) {
    bars[8] = iim7;
    bars[9] = V7;
  }

  // Bars 11-12: turnaround
  const turnaroundOptions = [
    [I7,   V7],     // basic
    [vim7, V7],     // vi-V
    [iim7, V7],     // ii-V
    [VI7,  iim7],   // VI7-ii (cycle of 4ths)
    ...(difficulty === '고급' ? [[I7, bII7]] : []),
  ];
  const [t11, t12] = pick(turnaroundOptions);
  bars[10] = t11;
  bars[11] = t12;

  return { bars, name: '재즈 블루스 (12마디)' };
}
