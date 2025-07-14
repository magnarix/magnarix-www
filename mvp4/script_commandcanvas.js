
// script_commandcanvas.js – MVP4 Interactive Timeline
import { loadState, saveState, state } from './state.js';

loadState();

function renderGoals() {
  const container = document.getElementById("cards-container");
  container.innerHTML = "";
  state.goals.forEach(goal => {
    const card = document.createElement("div");
    card.className = "card";
    card.draggable = true;
    card.dataset.id = goal.id;
    card.innerHTML = `<strong>${goal.title}</strong><br/><em>${goal.owner}</em>`;
    card.addEventListener("dragstart", drag);
    container.appendChild(card);
  });
}

function allowDrop(ev) {
  ev.preventDefault();
  if (ev.target.classList.contains("marker")) {
    ev.target.classList.add("dragover");
  }
}

function drag(ev) {
  const cardEl = ev.target.closest(".card");
  if (!cardEl) return;
  ev.dataTransfer.setData("text/plain", cardEl.dataset.id);
}

function drop(ev) {
  ev.preventDefault();
  const goalId = ev.dataTransfer.getData("text/plain");
  const marker = ev.target.closest(".marker");
  if (!goalId || !marker) return;

  const card = document.querySelector(`[data-id='${goalId}']`);
  marker.appendChild(card);

  const columnKey = marker.dataset.time || marker.id || "unplaced";
  state.placements[goalId] = columnKey;
  saveState();
}

document.addEventListener("DOMContentLoaded", () => {
  renderGoals();
  document.querySelectorAll(".marker").forEach(marker => {
    marker.addEventListener("dragover", allowDrop);
    marker.addEventListener("drop", drop);
  });
});
