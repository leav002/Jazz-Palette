import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PRESETS, ALL_KEYS, DIFFICULTY_OPTIONS } from '../data/presets';
import { transposeProgression } from '../utils/chordUtils';
import { loadFavorites, saveFavorites, loadSettings } from '../utils/storage';
import './HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [genre, setGenre] = useState('jazz');
  const [difficulty, setDifficulty] = useState('전체');
  const [selectedKey, setSelectedKey] = useState('C');
  const [progression, setProgression] = useState(null);
  const [bpm, setBpm] = useState(() => loadSettings().defaultBpm);
  const [playing, setPlaying] = useState(false);
  const [currentBar, setCurrentBar] = useState(null);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [toast, setToast] = useState('');

  const timerRef = useRef(null);
  const stateRef = useRef({ bar: 0, beat: -1, len: 0 });

  // Load progression: from navigation state (Library) or sessionStorage (back from Variation)
  useEffect(() => {
    if (location.state?.progression) {
      const p = location.state.progression;
      setProgression(p);
      setSelectedKey(p.key);
      setBpm(p.tempo || 120);
      if (p.genre) setGenre(p.genre);
      window.history.replaceState({}, '');
    } else {
      try {
        const saved = sessionStorage.getItem('jp.lastProg');
        if (saved) {
          const p = JSON.parse(saved);
          setProgression(p);
          setSelectedKey(p.key);
          setBpm(p.tempo || 120);
          if (p.genre) setGenre(p.genre);
        }
      } catch {}
    }
  }, []);

  // Persist current progression so it survives navigation away and back
  useEffect(() => {
    if (progression) {
      sessionStorage.setItem('jp.lastProg', JSON.stringify({ ...progression, tempo: bpm }));
    }
  }, [progression, bpm]);

  // Stop guide when progression changes
  useEffect(() => {
    stopGuide();
  }, [progression]);

  useEffect(() => () => clearInterval(timerRef.current), []);

  function generate() {
    const pool = PRESETS[genre].filter(p =>
      difficulty === '전체' || p.difficulty === difficulty
    );
    if (!pool.length) { showToast('조건에 맞는 진행이 없습니다'); return; }

    const preset = pool[Math.floor(Math.random() * pool.length)];
    const bars = transposeProgression(preset.bars, 'C', selectedKey);
    setProgression({
      presetId: preset.id,
      name: preset.name,
      genre,
      sourceKey: 'C',
      sourceBars: preset.bars,
      key: selectedKey,
      bars,
      tempo: bpm,
    });
  }

  function handleKeyChange(newKey) {
    setSelectedKey(newKey);
    if (!progression) return;
    const bars = transposeProgression(progression.sourceBars, progression.sourceKey, newKey);
    setProgression({ ...progression, key: newKey, bars });
  }

  function startGuide() {
    if (!progression) return;
    stateRef.current = { totalBeats: 0, len: progression.bars.length };
    setCurrentBar(0);
    setCurrentBeat(0);

    timerRef.current = setInterval(() => {
      const s = stateRef.current;
      s.totalBeats++;
      const beat = s.totalBeats % 4;
      const bar = Math.floor(s.totalBeats / 4) % s.len;
      setCurrentBar(bar);
      setCurrentBeat(beat);
    }, Math.round(60000 / bpm));

    setPlaying(true);
  }

  function stopGuide() {
    clearInterval(timerRef.current);
    setPlaying(false);
    setCurrentBar(null);
    setCurrentBeat(0);
  }

  function toggleGuide() {
    if (playing) stopGuide();
    else startGuide();
  }

  function adjustBpm(delta) {
    const next = Math.max(40, Math.min(240, bpm + delta));
    setBpm(next);
    if (playing) {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        const s = stateRef.current;
        s.totalBeats++;
        const beat = s.totalBeats % 4;
        const bar = Math.floor(s.totalBeats / 4) % s.len;
        setCurrentBar(bar);
        setCurrentBeat(beat);
      }, Math.round(60000 / next));
    }
  }

  function saveFavorite() {
    if (!progression) return;
    const list = loadFavorites();
    const item = {
      id: `fav_${Date.now()}`,
      name: progression.name,
      genre: progression.genre,
      key: progression.key,
      bars: progression.bars,
      sourceBars: progression.sourceBars,
      sourceKey: progression.sourceKey,
      tempo: bpm,
      createdAt: new Date().toISOString(),
    };
    saveFavorites([...list, item]);
    showToast('즐겨찾기에 저장했습니다 ☆');
  }

  function goToVariation() {
    if (!progression) return;
    navigate('/variation', { state: { progression: { ...progression, tempo: bpm } } });
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  }

  const cols = progression ? Math.min(4, progression.bars.length) : 4;

  return (
    <div className="page">
      <div className="section-header">
        <span className="section-icon"></span>
        <h2>랜덤 코드 진행 생성</h2>
      </div>

      <div className="filter-row">
        <select className="filter-select" value={genre} onChange={e => setGenre(e.target.value)}>
          <option value="jazz">재즈</option>
          <option value="blues">블루스</option>
        </select>
        <select className="filter-select" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
          {DIFFICULTY_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="filter-select" value={selectedKey} onChange={e => handleKeyChange(e.target.value)}>
          {ALL_KEYS.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
        <button className="btn-generate" onClick={generate}>생성</button>
      </div>

      {progression ? (
        <>
          <p className="progression-name">{progression.name} — {progression.key}</p>

          <div className="chord-grid" style={{ '--cols': cols }}>
            {progression.bars.map((chord, i) => (
              <div key={i} className={`chord-cell${currentBar === i ? ' highlighted' : ''}`}>
                {chord}
              </div>
            ))}
          </div>

          <p className="guide-hint">현재 연주할 마디가 박자에 맞춰 하이라이트됩니다</p>

          <div className="guide-controls">
            <button className={`btn-play${playing ? ' playing' : ''}`} onClick={toggleGuide}>
              {playing ? '⏸ 정지' : '▶ 진행 가이드'}
            </button>
            <div className="bpm-row">
              <span className="bpm-label">BPM</span>
              <button className="bpm-btn" onClick={() => adjustBpm(-5)}>−</button>
              <span className="bpm-value">{bpm}</span>
              <button className="bpm-btn" onClick={() => adjustBpm(5)}>+</button>
            </div>
            <div className="beat-dots">
              {[0, 1, 2, 3].map(b => (
                <span key={b} className={`beat-dot${playing && currentBeat === b ? ' active' : ''}`} />
              ))}
            </div>
          </div>

          <div className="action-row">
            <button className="btn-action" onClick={saveFavorite}>☆ 즐겨찾기</button>
            <button className="btn-action" onClick={goToVariation}>✎ 변형하기</button>
            <button className="btn-action btn-secondary" onClick={generate}>↺ 다시</button>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <p>장르와 난이도를 선택한 뒤 <strong>생성</strong> 버튼을 누르세요</p>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
