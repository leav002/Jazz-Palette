const KEYS = {
  FAVORITES: 'jazzpalette.favorites',
  VARIATIONS: 'jazzpalette.variations',
  SETTINGS: 'jazzpalette.settings',
};

const DEFAULT_SETTINGS = {
  defaultBpm: 120,
  showGuide: true,
  theme: 'dark',
};

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage error:', e);
  }
}

export const loadFavorites = () => load(KEYS.FAVORITES, []);
export const saveFavorites = (list) => save(KEYS.FAVORITES, list);

export const loadVariations = () => load(KEYS.VARIATIONS, []);
export const saveVariations = (list) => save(KEYS.VARIATIONS, list);

export const loadSettings = () => ({ ...DEFAULT_SETTINGS, ...load(KEYS.SETTINGS, {}) });
export const saveSettings = (s) => save(KEYS.SETTINGS, s);
