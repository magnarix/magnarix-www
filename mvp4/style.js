// state.js

const STORAGE_KEY = 'magnarix_app_state';

let defaultState = {
  strategicGoals: [],
  kpis: [],
  initiatives: [],
  settings: {},
};

// Load state from localStorage
export function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { ...defaultState };
  } catch (e) {
    console.error('Failed to load state:', e);
    return { ...defaultState };
  }
}

// Save state to localStorage
export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

// Reset to default state
export function resetState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
  } catch (e) {
    console.error('Failed to reset state:', e);
  }
}

// Update a part of the state and save it
export function updateState(key, value) {
  const currentState = loadState();
  currentState[key] = value;
  saveState(currentState);
}
