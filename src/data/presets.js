export const PRESETS = {
  jazz: [
    { id: 'jazz_iivi_4', name: 'ii-V-I (4마디)', difficulty: '초급',
      bars: ['Dm7', 'G7', 'Cmaj7', 'Cmaj7'] },
    { id: 'jazz_turnaround', name: '터어라운드 (4마디)', difficulty: '초급',
      bars: ['Cmaj7', 'Am7', 'Dm7', 'G7'] },
    { id: 'jazz_iivi_8', name: 'ii-V-I 확장 (8마디)', difficulty: '초급',
      bars: ['Dm7', 'G7', 'Cmaj7', 'Cmaj7', 'Em7', 'A7', 'Dm7', 'G7'] },
    { id: 'jazz_rhythm_a', name: 'Rhythm Changes A (8마디)', difficulty: '중급',
      bars: ['Cmaj7', 'Am7', 'Dm7', 'G7', 'Em7', 'Am7', 'Dm7', 'G7'] },
    { id: 'jazz_autumn', name: 'Autumn Leaves 스타일 (8마디)', difficulty: '중급',
      bars: ['Am7', 'D7', 'Gmaj7', 'Cmaj7', 'F#m7b5', 'B7', 'Em7', 'Em7'] },
    { id: 'jazz_tritone', name: '트라이톤 대리 (4마디)', difficulty: '고급',
      bars: ['Dm7', 'Db7', 'Cmaj7', 'Cmaj7'] },
    { id: 'jazz_bird', name: 'Bird Changes (8마디)', difficulty: '고급',
      bars: ['Cmaj7', 'Bm7b5', 'E7', 'Am7', 'D7', 'Dm7', 'G7', 'Cmaj7'] },
  ],
  blues: [
    { id: 'blues_12bar', name: '12마디 블루스', difficulty: '초급',
      bars: ['C7', 'C7', 'C7', 'C7', 'F7', 'F7', 'C7', 'C7', 'G7', 'F7', 'C7', 'G7'] },
    { id: 'blues_quick', name: '퀵 체인지 블루스 (12마디)', difficulty: '초급',
      bars: ['C7', 'F7', 'C7', 'C7', 'F7', 'F7', 'C7', 'C7', 'G7', 'F7', 'C7', 'G7'] },
    { id: 'blues_jazz', name: '재즈 블루스 (12마디)', difficulty: '중급',
      bars: ['C7', 'F7', 'C7', 'Gm7', 'C7', 'F7', 'F#dim7', 'C7', 'Em7', 'A7', 'Dm7', 'G7'] },
    { id: 'blues_minor', name: '마이너 블루스 (12마디)', difficulty: '중급',
      bars: ['Cm7', 'Cm7', 'Cm7', 'Cm7', 'Fm7', 'Fm7', 'Cm7', 'Cm7', 'Abmaj7', 'G7', 'Cm7', 'G7'] },
  ],
};

export const ALL_KEYS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export const CHORD_ROOTS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export const CHORD_QUALITIES = [
  'maj7', 'm7', '7', 'maj7#11', 'm7b5', 'dim7',
  'sus4', '6', 'm6', '7b9', '7#9', '7alt', 'aug', 'maj9', 'm9', '9',
];

export const DIFFICULTY_OPTIONS = ['전체', '초급', '중급', '고급'];
