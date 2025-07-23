import { loadState, updateState } from './state.js';

document.addEventListener('DOMContentLoaded', () => {
  const state = loadState();

  // Link HTML elements to state keys
  const visionInput = document.getElementById('vision');
  const missionInput = document.getElementById('mission');
  const valuesInput = document.getElementById('values');
  const goalsInput = document.getElementById('goals');
  const kpisInput = document.getElementById('kpis');
  const initiativesInput = document.getElementById('initiatives');

  // Populate form from state
  if (visionInput) visionInput.value = state.vision || '';
  if (missionInput) missionInput.value = state.mission || '';
  if (valuesInput) valuesInput.value = (state.values || []).join('\n');
  if (goalsInput) goalsInput.value = (state.goals || []).join('\n');
  if (kpisInput) kpisInput.value = (state.kpis || []).join('\n');
  if (initiativesInput) initiativesInput.value = (state.initiatives || []).join('\n');

  // Save on input changes
  if (visionInput) visionInput.addEventListener('input', () => updateState('vision', visionInput.value));
  if (missionInput) missionInput.addEventListener('input', () => updateState('mission', missionInput.value));
  if (valuesInput) valuesInput.addEventListener('input', () => updateState('values', valuesInput.value.split('\n').filter(x => x.trim() !== '')));
  if (goalsInput) goalsInput.addEventListener('input', () => updateState('goals', goalsInput.value.split('\n').filter(x => x.trim() !== '')));
  if (kpisInput) kpisInput.addEventListener('input', () => updateState('kpis', kpisInput.value.split('\n').filter(x => x.trim() !== '')));
  if (initiativesInput) initiativesInput.addEventListener('input', () => updateState('initiatives', initiativesInput.value.split('\n').filter(x => x.trim() !== '')));
});
