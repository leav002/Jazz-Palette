import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadFavorites, saveFavorites, loadVariations, saveVariations } from '../utils/storage';
import './LibraryPage.css';

export default function LibraryPage() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState(() => loadFavorites());
  const [variations, setVariations] = useState(() => loadVariations());
  const [toast, setToast] = useState('');

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  }

  function openFavorite(fav) {
    navigate('/', {
      state: {
        progression: {
          name: fav.name,
          genre: fav.genre,
          key: fav.key,
          bars: fav.bars,
          sourceKey: fav.sourceKey ?? fav.key,
          sourceBars: fav.sourceBars ?? fav.bars,
          tempo: fav.tempo,
          favoriteId: fav.id,
        },
      },
    });
  }

  function deleteFavorite(id) {
    const next = favorites.filter(f => f.id !== id);
    saveFavorites(next);
    setFavorites(next);
    showToast('즐겨찾기를 삭제했습니다');
  }

  function openVariation(variation) {
    navigate('/variation', {
      state: {
        progression: {
          name: variation.originalName,
          genre: variation.genre,
          key: variation.key,
          bars: variation.originalBars,
          sourceKey: variation.sourceKey ?? variation.key,
          sourceBars: variation.sourceBars ?? variation.originalBars,
          tempo: variation.tempo,
        },
        loadedVariation: variation,
      },
    });
  }

  function deleteVariation(id) {
    const next = variations.filter(v => v.id !== id);
    saveVariations(next);
    setVariations(next);
    showToast('변형을 삭제했습니다');
  }

  return (
    <div className="page lib-page">
      {/* Favorites */}
      <div className="section-header">
        <span className="section-icon">☆</span>
        <h2>즐겨찾기한 진행</h2>
        <span className="count-badge">{favorites.length}</span>
      </div>

      {favorites.length === 0 ? (
        <div className="lib-empty">
          홈에서 진행을 생성하고 즐겨찾기에 저장해보세요.
        </div>
      ) : (
        <div className="fav-grid">
          {favorites.map(fav => (
            <div key={fav.id} className="fav-card">
              <div className="fav-genre">{fav.genre === 'jazz' ? '재즈' : '블루스'} · {fav.key}</div>
              <div className="fav-name">{fav.name}</div>
              <div className="fav-bars">{fav.bars.join(' · ')}</div>
              <div className="fav-actions">
                <button className="btn-open" onClick={() => openFavorite(fav)}>열기</button>
                <button className="btn-delete" onClick={() => deleteFavorite(fav.id)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Variations */}
      <div className="section-header variation-section">
        <span className="section-icon">✎</span>
        <h2>저장한 변형</h2>
        <span className="count-badge">{variations.length}</span>
      </div>

      {variations.length === 0 ? (
        <div className="lib-empty">
          변형 화면에서 코드를 편집하고 저장해보세요.
        </div>
      ) : (
        <div className="var-list">
          {variations.map(v => (
            <div key={v.id} className="var-item">
              <div className="var-item-info">
                <div className="var-title">
                  <span className="var-orig-name">{v.originalName}</span>
                  <span className="var-arrow">→</span>
                  <span className="var-hint">{v.hintLabel}</span>
                </div>
                <div className="var-bars-preview">{v.bars.join(' · ')}</div>
              </div>
              <div className="var-item-actions">
                <button className="btn-open" onClick={() => openVariation(v)}>열기</button>
                <button className="btn-delete" onClick={() => deleteVariation(v.id)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
