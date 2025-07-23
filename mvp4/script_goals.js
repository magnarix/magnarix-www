import { loadState, saveState } from './state.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('goal-form');
  const list = document.getElementById('goal-list');

  const state = loadState();
  state.goals = state.goals || [];

  function renderGoals() {
    list.innerHTML = '';
    state.goals.forEach(goal => {
      const li = document.createElement('li');
      li.textContent = `${goal.title} (Owner: ${goal.owner}, Due: ${goal.dueDate}) - ${goal.desc}`;
      list.appendChild(li);
    });
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const newGoal = {
      id: 'G_' + Date.now(),
      title: document.getElementById('goal-title').value,
      desc: document.getElementById('goal-desc').value,
      dueDate: document.getElementById('goal-due').value,
      owner: document.getElementById('goal-owner').value
    };
    state.goals.push(newGoal);
    saveState(state);
    renderGoals();
    form.reset();
  });

  renderGoals();
});
