// state.js - centralized state management

const STORAGE_KEY = 'magnarix_app_state';

let defaultState = {
  vision: "",
  mission: "",
  values: [],
  goals: [],
  kpis: [],
  initiatives: [],
  notes: [],
  settings: {}
};

export function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { ...defaultState };
  } catch (e) {
    console.error('Failed to load state:', e);
    return { ...defaultState };
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

export function updateState(key, value) {
  const current = loadState();
  current[key] = value;
  saveState(current);
}

export function resetState() {
  saveState({ ...defaultState });
}
