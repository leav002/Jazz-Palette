import { useState } from 'react';
import { loadSettings, saveSettings } from '../utils/storage';
import './SettingsPage.css';

function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.dataset.theme = 'dark';
  } else {
    delete document.documentElement.dataset.theme;
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState(loadSettings);

  function update(patch) {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);
    if (patch.theme !== undefined) applyTheme(patch.theme);
  }

  function adjustBpm(delta) {
    update({ defaultBpm: Math.max(40, Math.min(240, settings.defaultBpm + delta)) });
  }

  return (
    <div className="page settings-page">
      <div className="section-header">
        <span className="section-icon">⚙</span>
        <h2>설정</h2>
      </div>

      <div className="settings-group">
        <div className="settings-row">
          <div className="settings-label">
            <span className="settings-row-title">기본 템포</span>
            <span className="settings-row-desc">새 진행 생성 시 초기 BPM</span>
          </div>
          <div className="bpm-row">
            <button className="bpm-btn" onClick={() => adjustBpm(-5)}>−</button>
            <span className="bpm-value">{settings.defaultBpm}</span>
            <button className="bpm-btn" onClick={() => adjustBpm(5)}>+</button>
          </div>
        </div>

        <div className="settings-row">
          <div className="settings-label">
            <span className="settings-row-title">테마</span>
            <span className="settings-row-desc">앱 색상 테마</span>
          </div>
          <div className="theme-toggle">
            <button
              className={`theme-btn${settings.theme === 'light' ? ' active' : ''}`}
              onClick={() => update({ theme: 'light' })}
            >
              라이트
            </button>
            <button
              className={`theme-btn${settings.theme === 'dark' ? ' active' : ''}`}
              onClick={() => update({ theme: 'dark' })}
            >
              다크
            </button>
          </div>
        </div>
      </div>

      <p className="settings-save-note">변경 사항은 자동으로 저장됩니다</p>
    </div>
  );
}
