import { loadState, saveState } from './state.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('risk-form');
  const list = document.getElementById('risk-list');

  const state = loadState();
  state.risks = state.risks || [];

  function renderRisks() {
    list.innerHTML = '';
    state.risks.forEach(risk => {
      const li = document.createElement('li');
      li.textContent = `${risk.title} (Likelihood: ${risk.likelihood}, Impact: ${risk.impact})`;
      list.appendChild(li);
    });
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const newRisk = {
      id: 'R_' + Date.now(),
      title: document.getElementById('risk-title').value,
      likelihood: document.getElementById('risk-likelihood').value,
      impact: document.getElementById('risk-impact').value
    };
    state.risks.push(newRisk);
    saveState(state);
    renderRisks();
    form.reset();
  });

  renderRisks();
});
