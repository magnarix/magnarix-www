// script_commandcanvas.js – Cleaned and Working Version

const STORAGE_KEY = "mvp2State";  // ✅ FIXED: define storage key

let state = {
  goals: [],
  risks: [],
  kpis: [],
  placements: {},
  dependencies: []
};

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      state = { ...state, ...parsed };
      console.log("Loaded state:", state); // optional for debugging
    } catch (err) {
      console.warn("Failed to parse saved state:", err);
    }
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
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
  const cardId = cardEl.getAttribute("data-id");
  const cardType = cardEl.getAttribute("data-type");
  ev.dataTransfer.setData(
    "application/json",
    JSON.stringify({ id: cardId, type: cardType })
  );
  cardEl.classList.add("dragging");
}

function drop(ev) {
  ev.preventDefault();
  if (ev.target.classList.contains("marker")) {
    ev.target.classList.remove("dragover");
    handleCardDrop(ev, ev.target);
  } else if (ev.target.closest && ev.target.closest(".marker")) {
    ev.target.closest(".marker").classList.remove("dragover");
    handleCardDrop(ev, ev.target.closest(".marker"));
  }
}

function handleCardDrop(ev, markerEl) {
  const data = ev.dataTransfer.getData("application/json");
  if (!data) return;
  const { id, type } = JSON.parse(data);
  const column = markerEl.getAttribute("data-column");
  const rect = markerEl.getBoundingClientRect();

  const offsetX = ev.clientX - rect.left;
  const offsetY = ev.clientY - rect.top;

  state.placements[id] = {
    column: column,
    x: offsetX,
    y: offsetY
  };

  saveState();
  renderCommandCanvas();
}

function renderCommandCanvas() {
  const cardsContainer = document.getElementById("cards-container");
  cardsContainer.innerHTML = "";

  const unplaced = [
    ...state.goals.map((g) => ({ ...g, type: "goal" })),
    ...state.risks.map((r) => ({ ...r, type: "risk" })),
    ...state.kpis.map((k) => ({ ...k, type: "kpi" }))
  ].filter((item) => !state.placements[item.id]);

  unplaced.forEach((item) => {
    const card = document.createElement("div");
    card.className = `card ${item.type} list-card`;
    card.setAttribute("data-id", item.id);
    card.setAttribute("data-type", item.type);
    card.setAttribute("draggable", "true");
    card.setAttribute("ondragstart", "drag(event)");
    card.style.position = "static";
    card.style.marginBottom = "0.75rem";

    const title = document.createElement("div");
    title.textContent = item.title;
    title.style.fontWeight = "600";
    title.style.color = "#ffffff";

    card.appendChild(title);
    cardsContainer.appendChild(card);
  });

  document.querySelectorAll(".marker").forEach((markerEl) => {
    const column = markerEl.getAttribute("data-column");
    Array.from(markerEl.querySelectorAll(".card")).forEach((c) => c.remove());

    Object.entries(state.placements).forEach(([cardId, placement]) => {
      if (placement.column === column) {
        let item =
          state.goals.find((g) => g.id === cardId) ||
          state.risks.find((r) => r.id === cardId) ||
          state.kpis.find((k) => k.id === cardId);
        if (!item) return;

        const card = document.createElement("div");
        card.className = `card ${item.type}`;
        card.setAttribute("data-id", cardId);
        card.setAttribute("data-type", item.type);
        card.setAttribute("draggable", "true");
        card.setAttribute("ondragstart", "drag(event)");

        card.style.left = placement.x + "px";
        card.style.top = placement.y + "px";
        card.style.position = "absolute";

        const title = document.createElement("div");
        title.textContent = item.title;
        title.style.fontWeight = "600";
        title.style.fontSize = "0.9rem";
        title.style.color = "#ffffff";

        card.appendChild(title);
        markerEl.appendChild(card);
      }
    });
  });

  const depList = document.getElementById("dependency-list");
  depList.innerHTML = "";
  state.dependencies.forEach((d) => {
    const item = document.createElement("li");
    item.className = "dep-item";
    item.innerHTML = `<span class="dep-from">${d.from}</span> → <span class="dep-to">${d.to}</span>`;
    depList.appendChild(item);
  });

  attachDependencyHandler();
}

function attachDependencyHandler() {
  const depForm = document.getElementById("dep-form");
  if (depForm && !depForm.dataset.bound) {
    depForm.dataset.bound = "true";
    depForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const from = document.getElementById("dep-from").value.trim();
      const to = document.getElementById("dep-to").value.trim();
      if (!from || !to) return;
      state.dependencies.push({ from, to });
      saveState();
      renderCommandCanvas();
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadState();
  renderCommandCanvas();
});
