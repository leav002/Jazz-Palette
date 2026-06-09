import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CHORD_ROOTS, CHORD_QUALITIES } from '../data/presets';
import { parseChord, applyTritoneSub, applyIiVInsertion } from '../utils/chordUtils';
import { loadVariations, saveVariations } from '../utils/storage';
import './VariationPage.css';

function ChordSelect({ value, onChange }) {
  const { root, quality } = parseChord(value);
  return (
    <div className="chord-select-wrapper">
      <select
        className="chord-root-sel"
        value={root}
        onChange={e => onChange(e.target.value + quality)}
      >
        {CHORD_ROOTS.map(r => <option key={r} value={r}>{r}</option>)}
      </select>
      <select
        className="chord-quality-sel"
        value={quality}
        onChange={e => onChange(root + e.target.value)}
      >
        {CHORD_QUALITIES.map(q => <option key={q} value={q}>{q}</option>)}
      </select>
    </div>
  );
}

export default function VariationPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const progression = location.state?.progression ?? null;
  const loadedVariation = location.state?.loadedVariation ?? null;

  const [varBars, setVarBars] = useState(() =>
    loadedVariation ? loadedVariation.bars : (progression ? [...progression.bars] : [])
  );
  const [hintLabel, setHintLabel] = useState(loadedVariation?.hintLabel ?? '');
  const [playingOrig, setPlayingOrig] = useState(false);
  const [playingVar, setPlayingVar] = useState(false);
  const [currentBar, setCurrentBar] = useState(null);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [activeGuide, setActiveGuide] = useState(null); // 'orig' | 'var'
  const [toast, setToast] = useState('');

  const bpm = progression?.tempo ?? 120;
  const timerRef = useRef(null);
  const stateRef = useRef({ bar: 0, beat: -1, len: 0 });

  useEffect(() => () => clearInterval(timerRef.current), []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') navigate(-1); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  if (!progression) {
    return (
      <div className="page var-empty">
        <p>홈에서 코드 진행을 불러온 뒤 <strong>변형하기</strong>를 누르세요.</p>
        <button className="btn-action" onClick={() => navigate('/')}>홈으로</button>
      </div>
    );
  }

  function startGuide(bars, type) {
    clearInterval(timerRef.current);
    stateRef.current = { totalBeats: 0, len: bars.length };
    setCurrentBar(0);
    setCurrentBeat(0);
    setActiveGuide(type);
    if (type === 'orig') { setPlayingOrig(true); setPlayingVar(false); }
    else { setPlayingVar(true); setPlayingOrig(false); }

    timerRef.current = setInterval(() => {
      const s = stateRef.current;
      s.totalBeats++;
      const beat = s.totalBeats % 4;
      const bar = Math.floor(s.totalBeats / 4) % s.len;
      setCurrentBar(bar);
      setCurrentBeat(beat);
    }, Math.round(60000 / bpm));
  }

  function stopGuide() {
    clearInterval(timerRef.current);
    setPlayingOrig(false);
    setPlayingVar(false);
    setCurrentBar(null);
    setCurrentBeat(0);
    setActiveGuide(null);
  }

  function toggleGuide(type) {
    if (activeGuide === type) stopGuide();
    else startGuide(type === 'orig' ? progression.bars : varBars, type);
  }

  function handleChordChange(idx, newChord) {
    const next = [...varBars];
    next[idx] = newChord;
    setVarBars(next);
    setHintLabel('사용자 변형');
  }

  function applyHint(type) {
    if (type === 'tritone') {
      setVarBars(applyTritoneSub(progression.bars));
      setHintLabel('트라이톤 대리');
    } else {
      setVarBars(applyIiVInsertion(progression.bars));
      setHintLabel('ii-V 삽입');
    }
    stopGuide();
  }

  function resetVar() {
    setVarBars([...progression.bars]);
    setHintLabel('');
    stopGuide();
  }

  function saveVariation() {
    const list = loadVariations();
    const item = {
      id: `var_${Date.now()}`,
      originalId: progression.favoriteId ?? null,
      originalName: progression.name,
      originalBars: progression.bars,
      bars: varBars,
      hintLabel: hintLabel || '사용자 변형',
      genre: progression.genre,
      key: progression.key,
      sourceKey: progression.sourceKey,
      sourceBars: progression.sourceBars,
      tempo: bpm,
      createdAt: new Date().toISOString(),
    };
    saveVariations([...list, item]);
    showToast('변형을 저장했습니다');
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  }

  const cols = Math.min(4, progression.bars.length);

  return (
    <div className="page">
      <div className="section-header">
        <button className="btn-back" onClick={() => navigate(-1)} title="뒤로 (Esc)">← 뒤로</button>
        <span className="section-icon">✎</span>
        <h2>코드 진행 변형</h2>
        <span className="prog-label">{progression.name} — {progression.key}</span>
      </div>

      {/* Original */}
      <div className="sub-label">원본 진행</div>
      <div className="chord-grid" style={{ '--cols': cols }}>
        {progression.bars.map((chord, i) => (
          <div
            key={i}
            className={`chord-cell${activeGuide === 'orig' && currentBar === i ? ' highlighted' : ''}`}
          >
            {chord}
          </div>
        ))}
      </div>

      {/* Variation slots */}
      <div className="sub-label var-label">
        ✎ 내 변형 슬롯
        {hintLabel && <span className="hint-badge">{hintLabel}</span>}
      </div>
      <div className="chord-grid var-grid" style={{ '--cols': cols }}>
        {varBars.map((chord, i) => (
          <div
            key={i}
            className={`chord-cell var-cell${activeGuide === 'var' && currentBar === i ? ' highlighted' : ''}`}
          >
            <ChordSelect value={chord} onChange={v => handleChordChange(i, v)} />
          </div>
        ))}
      </div>

      {/* Recommended hints */}
      <div className="hints-row">
        <span className="hints-label">💡 추천 변형</span>
        <button className="btn-hint" onClick={() => applyHint('tritone')}>트라이톤 대리</button>
        <button className="btn-hint" onClick={() => applyHint('iiv')}>ii-V 삽입</button>
      </div>

      {/* Guide controls */}
      <div className="guide-controls var-guide-controls">
        <button
          className={`btn-play${playingOrig ? ' playing' : ''}`}
          onClick={() => toggleGuide('orig')}
        >
          {playingOrig ? '⏸' : '▶'} 원본 가이드
        </button>
        <button
          className={`btn-play${playingVar ? ' playing' : ''}`}
          onClick={() => toggleGuide('var')}
        >
          {playingVar ? '⏸' : '▶'} 변형 가이드
        </button>
        <div className="beat-dots">
          {[0, 1, 2, 3].map(b => (
            <span key={b} className={`beat-dot${(playingOrig || playingVar) && currentBeat === b ? ' active' : ''}`} />
          ))}
        </div>
      </div>

      <div className="action-row">
        <button className="btn-action btn-save" onClick={saveVariation}>💾 변형 저장</button>
        <button className="btn-action btn-secondary" onClick={resetVar}>↺ 초기화</button>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
