// ==========================
//      Global State Logic
// ==========================
const STORAGE_KEY = "mvp2State";
let state = {
  goals: [],          // { id, title, desc, dueDate, owner }
  risks: [],          // { id, title, likelihood, impact, mitigation }
  kpis: [],           // { id, name, metricType, target, frequency }
  dependencies: [],   // [ { from: "...", to: "..." } ]
  placements: {},     // { [cardId]: { column: "Q1", x: 10, y: 20 } }
  links: [],          // future use (risk-goal, kpi-goal)
  scenarioOptions: { hire: false, fund: false },
  forgeCastChallenge: "",
  forgeCastResult: { suggestion: "", rationale: "" },
  crownLensRisks: []  // string titles of top risks
};

// Load saved state from localStorage if available
function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Merge into default structure (avoid missing keys)
      state = { ...state, ...parsed };
    } catch (err) {
      console.warn("Failed to parse saved state:", err);
    }
  }
}

// Save current state to localStorage
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Generate a unique ID (timestamp + random)
function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

// ==========================
//   DRAG & DROP FUNCTIONS
// ==========================
function allowDrop(ev) {
  ev.preventDefault();
  if (ev.target.classList.contains("marker")) {
    ev.target.classList.add("dragover");
  }
}

function drag(ev) {
  // carry card-type and id
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
  if (!ev.target.classList.contains("marker")) {
    // if marker has inner elements, find the marker parent
    if (ev.target.closest && ev.target.closest(".marker")) {
      ev.target.closest(".marker").classList.remove("dragover");
      handleCardDrop(ev, ev.target.closest(".marker"));
    }
    return;
  }
  ev.target.classList.remove("dragover");
  handleCardDrop(ev, ev.target);
}

// Called when a draggable card is dropped onto a marker
function handleCardDrop(ev, markerEl) {
  const data = ev.dataTransfer.getData("application/json");
  if (!data) return;
  const { id, type } = JSON.parse(data);
  const column = markerEl.getAttribute("data-column");
  const rect = markerEl.getBoundingClientRect();

  // Compute relative x/y within marker
  const offsetX = ev.clientX - rect.left;
  const offsetY = ev.clientY - rect.top;

  // Update placement in state
  state.placements[id] = {
    column: column,
    x: offsetX,
    y: offsetY
  };

  // Persist and re-render
  saveState();
  renderAllPages();
}

// ==========================
//     RENDER / RE-RENDER
// ==========================
function renderAllPages() {
  const page = window.location.pathname.split("/").pop() || "index.html";

  if (page === "index.html") {
    renderIndex();
  } else if (page === "CommandCanvas.html") {
    renderCommandCanvas();
  } else if (page === "OrchestratedPaths.html") {
    renderOrchestratedPaths();
  } else if (page === "ForgeCast.html") {
    renderForgeCast();
  } else if (page === "CrownLens.html") {
    renderCrownLens();
  }
  // Highlight active nav-item (if sidebar is loaded)
  highlightActiveNav(page);
}

// --------------------------
//       INDEX.HTML
// --------------------------
function renderIndex() {
  // 1) Goals: list existing goals
  const goalsList = document.getElementById("goals-list");
  goalsList.innerHTML = "";
  state.goals.forEach((g) => {
    const card = document.createElement("div");
    card.className = "card goal list-card";
    card.setAttribute("data-id", g.id);
    card.setAttribute("data-type", "goal");
    card.setAttribute("draggable", "true");
    card.setAttribute("ondragstart", "drag(event)");

    const title = document.createElement("div");
    title.textContent = g.title;
    title.style.fontWeight = "600";

    const subtitle = document.createElement("div");
    subtitle.style.fontSize = "0.9rem";
    subtitle.style.marginTop = "0.25rem";
    subtitle.style.color = "#3a4a59";
    subtitle.textContent = `Due: ${g.dueDate || "—"} | Owner: ${
      g.owner || "—"
    }`;

    const removeBtn = document.createElement("span");
    removeBtn.textContent = "×";
    removeBtn.style.cssText = "float: right; cursor: pointer; color: #900;";
    removeBtn.addEventListener("click", () => {
      deleteGoal(g.id);
    });

    card.appendChild(removeBtn);
    card.appendChild(title);
    if (g.desc) {
      const descEl = document.createElement("div");
      descEl.textContent = g.desc;
      descEl.style.fontSize = "0.9rem";
      descEl.style.marginTop = "0.25rem";
      descEl.style.color = "#5a6b7c";
      card.appendChild(descEl);
    }
    card.appendChild(subtitle);

    goalsList.appendChild(card);
  });

  // 2) Risks: list existing risks
  const risksList = document.getElementById("risks-list");
  risksList.innerHTML = "";
  state.risks.forEach((r) => {
    const card = document.createElement("div");
    card.className = "card risk list-card";
    card.setAttribute("data-id", r.id);
    card.setAttribute("data-type", "risk");
    card.setAttribute("draggable", "true");
    card.setAttribute("ondragstart", "drag(event)");

    const title = document.createElement("div");
    title.textContent = r.title;
    title.style.fontWeight = "600";

    const subtitle = document.createElement("div");
    subtitle.style.fontSize = "0.9rem";
    subtitle.style.marginTop = "0.25rem";
    subtitle.style.color = "#3a4a59";
    subtitle.textContent = `L:${r.likelihood} | I:${r.impact}`;

    const removeBtn = document.createElement("span");
    removeBtn.textContent = "×";
    removeBtn.style.cssText = "float: right; cursor: pointer; color: #900;";
    removeBtn.addEventListener("click", () => {
      deleteRisk(r.id);
    });

    card.appendChild(removeBtn);
    card.appendChild(title);
    if (r.mitigation) {
      const mitEl = document.createElement("div");
      mitEl.textContent = r.mitigation;
      mitEl.style.fontSize = "0.9rem";
      mitEl.style.marginTop = "0.25rem";
      mitEl.style.color = "#5a6b7c";
      card.appendChild(mitEl);
    }
    card.appendChild(subtitle);

    risksList.appendChild(card);
  });

  // 3) KPIs: list existing KPIs
  const kpisList = document.getElementById("kpis-list");
  kpisList.innerHTML = "";
  state.kpis.forEach((k) => {
    const card = document.createElement("div");
    card.className = "card kpi list-card";
    card.setAttribute("data-id", k.id);
    card.setAttribute("data-type", "kpi");
    card.setAttribute("draggable", "true");
    card.setAttribute("ondragstart", "drag(event)");

    const title = document.createElement("div");
    title.textContent = k.name;
    title.style.fontWeight = "600";

    const subtitle = document.createElement("div");
    subtitle.style.fontSize = "0.9rem";
    subtitle.style.marginTop = "0.25rem";
    subtitle.style.color = "#3a4a59";
    subtitle.textContent = `${k.metricType} target: ${k.target} | ${k.frequency}`;

    const removeBtn = document.createElement("span");
    removeBtn.textContent = "×";
    removeBtn.style.cssText = "float: right; cursor: pointer; color: #900;";
    removeBtn.addEventListener("click", () => {
      deleteKpi(k.id);
    });

    card.appendChild(removeBtn);
    card.appendChild(title);
    card.appendChild(subtitle);

    kpisList.appendChild(card);
  });

  // 4) Attach form handlers if not already attached
  attachIndexFormHandlers();
}

// Form handlers for index.html
function attachIndexFormHandlers() {
  // Goals
  const saveGoalBtn = document.getElementById("saveGoalBtn");
  if (saveGoalBtn && !saveGoalBtn.dataset.bound) {
    saveGoalBtn.dataset.bound = "true";
    saveGoalBtn.addEventListener("click", () => {
      const title = document.getElementById("goal-title").value.trim();
      const desc = document.getElementById("goal-desc").value.trim();
      const dueDate = document.getElementById("goal-due").value;
      const owner = document.getElementById("goal-owner").value.trim();
      if (!title) return;
      const id = generateId("G");
      state.goals.push({ id, title, desc, dueDate, owner });
      saveState();
      document.getElementById("goal-title").value = "";
      document.getElementById("goal-desc").value = "";
      document.getElementById("goal-due").value = "";
      document.getElementById("goal-owner").value = "";
      renderAllPages();
    });
  }

  // Risks
  const saveRiskBtn = document.getElementById("saveRiskBtn");
  if (saveRiskBtn && !saveRiskBtn.dataset.bound) {
    saveRiskBtn.dataset.bound = "true";
    saveRiskBtn.addEventListener("click", () => {
      const title = document.getElementById("risk-title").value.trim();
      const likelihood = document.getElementById("risk-likelihood").value;
      const impact = document.getElementById("risk-impact").value;
      const mitigation = document.getElementById("risk-mitigation").value.trim();
      if (!title) return;
      const id = generateId("R");
      state.risks.push({ id, title, likelihood, impact, mitigation });
      // Also add to crownLensRisks if not present
      if (!state.crownLensRisks.includes(title)) {
        state.crownLensRisks.push(title);
      }
      saveState();
      document.getElementById("risk-title").value = "";
      document.getElementById("risk-likelihood").value = "Low";
      document.getElementById("risk-impact").value = "Low";
      document.getElementById("risk-mitigation").value = "";
      renderAllPages();
    });
  }

  // KPIs
  const saveKpiBtn = document.getElementById("saveKpiBtn");
  if (saveKpiBtn && !saveKpiBtn.dataset.bound) {
    saveKpiBtn.dataset.bound = "true";
    saveKpiBtn.addEventListener("click", () => {
      const name = document.getElementById("kpi-name").value.trim();
      const metricType = document.getElementById("kpi-metricType").value;
      const target = document.getElementById("kpi-target").value.trim();
      const frequency = document.getElementById("kpi-frequency").value;
      if (!name) return;
      const id = generateId("K");
      state.kpis.push({ id, name, metricType, target, frequency });
      saveState();
      document.getElementById("kpi-name").value = "";
      document.getElementById("kpi-metricType").value = "%";
      document.getElementById("kpi-target").value = "";
      document.getElementById("kpi-frequency").value = "Weekly";
      renderAllPages();
    });
  }
}

// Deletion helpers
function deleteGoal(id) {
  state.goals = state.goals.filter((g) => g.id !== id);
  delete state.placements[id];
  saveState();
  renderAllPages();
}

function deleteRisk(id) {
  state.risks = state.risks.filter((r) => r.id !== id);
  state.crownLensRisks = state.crownLensRisks.filter((title) => {
    // If multiple risks share text, we keep the others untouched.
    // We'll only remove if exact text matches one risk we removed.
    return true; // for simplicity, keep all in crownLensRisks
  });
  delete state.placements[id];
  saveState();
  renderAllPages();
}

function deleteKpi(id) {
  state.kpis = state.kpis.filter((k) => k.id !== id);
  delete state.placements[id];
  saveState();
  renderAllPages();
}

// --------------------------
//   COMMANDCANVAS.HTML
// --------------------------
function renderCommandCanvas() {
  // 1) Clear and rebuild Strategic Initiatives column
  const cardsContainer = document.getElementById("cards-container");
  cardsContainer.innerHTML = "";
  // For each goal/risk/kpi that has NOT been placed, create a card in the left column
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

    card.appendChild(title);
    cardsContainer.appendChild(card);
  });

  // 2) Render placed cards inside each marker
  document.querySelectorAll(".marker").forEach((markerEl) => {
    const column = markerEl.getAttribute("data-column");
    // Clear existing dynamic children (but keep the marker label)
    Array.from(markerEl.querySelectorAll(".card")).forEach((c) => c.remove());

    // Find all items placed in this column
    Object.entries(state.placements).forEach(([cardId, placement]) => {
      if (placement.column === column) {
        // Find item in goals/risks/kpis
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

  // 3) Dependencies
  const depList = document.getElementById("dependency-list");
  depList.innerHTML = "";
  state.dependencies.forEach((d) => {
    const item = document.createElement("li");
    item.className = "dep-item";
    item.innerHTML = `<span class="dep-from">${d.from}</span> → <span class="dep-to">${d.to}</span>`;
    depList.appendChild(item);
  });

  // 4) Attach form handler for dependencies if not already
  attachDependencyHandler();
}

// Handle "Add Dependency" form submission
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
      document.getElementById("dep-from").value = "";
      document.getElementById("dep-to").value = "";
      renderAllPages();
    });
  }
}

// --------------------------
// ORCHESTRATEDPATHS.HTML
// --------------------------
function renderOrchestratedPaths() {
  const hireCB = document.getElementById("hireToggle");
  const fundCB = document.getElementById("fundToggle");
  if (hireCB) {
    hireCB.checked = state.scenarioOptions.hire;
    hireCB.onchange = () => {
      state.scenarioOptions.hire = hireCB.checked;
      saveState();
      updateScenarioText();
    };
  }
  if (fundCB) {
    fundCB.checked = state.scenarioOptions.fund;
    fundCB.onchange = () => {
      state.scenarioOptions.fund = fundCB.checked;
      saveState();
      updateScenarioText();
    };
  }
  updateScenarioText();
}

function updateScenarioText() {
  const hire = state.scenarioOptions.hire;
  const fund = state.scenarioOptions.fund;
  const output = document.getElementById("scenario-output");
  let result = "Scenario Result: ";
  if (hire && fund) {
    result += "Higher short-term burn but faster market capture.";
  } else if (hire) {
    result += "Rapid execution with potential funding risks.";
  } else if (fund) {
    result += "Cash reserves preserved, but slower product delivery.";
  } else {
    result += "Conservative path, steady but slow growth.";
  }
  if (output) output.textContent = result;
}

// --------------------------
//     FORGECAST.HTML
// --------------------------
function renderForgeCast() {
  const input = document.getElementById("challenge-input");
  const output = document.getElementById("insight-output");
  const rationale = document.getElementById("rationale-output");
  if (input) input.value = state.forgeCastChallenge || "";
  if (state.forgeCastResult.suggestion) {
    if (output) output.textContent = state.forgeCastResult.suggestion;
    if (rationale) rationale.textContent = state.forgeCastResult.rationale;
  }
}

// Called when "Get Insight" button is clicked
function generateInsight() {
  const inputEl = document.getElementById("challenge-input");
  const output = document.getElementById("insight-output");
  const rationale = document.getElementById("rationale-output");
  const input = inputEl.value.trim();
  if (!input) {
    output.textContent = "Please enter a strategic challenge.";
    rationale.textContent = "";
    return;
  }
  // Hardcoded suggestion for MVP
  const suggestion =
    "AI Suggestion: Consider a phased approach starting with a market study and pilot rollout.";
  const rationaleText =
    "Why this? Phased entry lowers risk and validates demand before committing full resources.";

  // Save into state
  state.forgeCastChallenge = input;
  state.forgeCastResult = { suggestion, rationale: rationaleText };
  saveState();

  // Update UI
  output.textContent = suggestion;
  rationale.textContent = rationaleText;
}

// --------------------------
//     CROWNLENS.HTML
// --------------------------
function renderCrownLens() {
  const ul = document.getElementById("risks-list");
  ul.innerHTML = "";
  state.crownLensRisks.forEach((riskTitle) => {
    const li = document.createElement("li");
    li.textContent = riskTitle;
    li.style.marginBottom = "0.5rem";
    ul.appendChild(li);
  });

  // Attach Export button handler
  const exportBtn = document.getElementById("exportCSVBtn");
  if (exportBtn && !exportBtn.dataset.bound) {
    exportBtn.dataset.bound = "true";
    exportBtn.addEventListener("click", downloadRisksCSV);
  }
}

// Export crownLensRisks to CSV
function downloadRisksCSV() {
  const header = ["Risk Title"];
  const rows = state.crownLensRisks.map((r) => [r]);
  let csvContent = [header.join(","), ...rows.map((r) => r.join(","))].join(
    "\n"
  );
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "CrownLens_Risks.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// --------------------------
//    NAV HIGHLIGHT UTILITY
// --------------------------
function highlightActiveNav(page) {
  document.querySelectorAll(".sidebar-nav .nav-item").forEach((link) => {
    if (link.getAttribute("href") === page) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

// ==========================
//    BOOTSTRAP ON LOAD
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  loadState();
  renderAllPages();

  // If using the mobile hamburger to toggle sidebar:
  const hamburger = document.querySelector(".hamburger-btn");
  if (hamburger) {
    hamburger.addEventListener("click", () => {
      document.querySelector(".sidebar").classList.toggle("open");
    });
  }
});
