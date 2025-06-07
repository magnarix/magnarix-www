
// script_overview.js – Complete and corrected for overview.html

const STORAGE_KEY = "mvp2State";

let state = {
  goals: [
    {
      id: "G_sample1",
      title: "Increase Market Share",
      desc: "Expand into new regions by Q4 2025",
      dueDate: "2025-12-31",
      owner: "Alice"
    },
    {
      id: "G_sample2",
      title: "Improve Customer Satisfaction",
      desc: "Implement NPS surveys across all products",
      dueDate: "2025-06-30",
      owner: "Bob"
    }
  ],
  risks: [
    {
      id: "R_sample1",
      title: "Budget Overrun",
      likelihood: "High",
      impact: "High",
      mitigation: "Negotiate vendor contracts early"
    },
    {
      id: "R_sample2",
      title: "Staff Turnover",
      likelihood: "Medium",
      impact: "Medium",
      mitigation: "Offer retention bonuses"
    }
  ],
  kpis: [
    {
      id: "K_sample1",
      name: "Monthly Recurring Revenue",
      metricType: "$",
      target: "100K",
      frequency: "Monthly"
    },
    {
      id: "K_sample2",
      name: "Customer NPS",
      metricType: "%",
      target: "50",
      frequency: "Quarterly"
    }
  ],
  placements: {},
  dependencies: [],
  links: [],
  scenarioOptions: { hire: false, fund: false },
  forgeCastChallenge: "",
  forgeCastResult: { suggestion: "", rationale: "" },
  crownLensRisks: ["Budget Overrun", "Staff Turnover"]
};

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      state = { ...state, ...parsed };
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

function renderOverview() {
  const goalsList = document.getElementById("goals-list");
  goalsList.innerHTML = "";
  state.goals.forEach((g) => {
    if (state.placements[g.id]) return;

    const card = document.createElement("div");
    card.className = "card goal list-card";
    card.setAttribute("data-id", g.id);
    card.setAttribute("data-type", "goal");
    card.setAttribute("draggable", "true");
    card.style.position = "static";
    card.style.marginBottom = "0.75rem";

    const title = document.createElement("div");
    title.textContent = g.title;
    title.style.fontWeight = "600";

    const subtitle = document.createElement("div");
    subtitle.style.fontSize = "0.9rem";
    subtitle.style.marginTop = "0.25rem";
    subtitle.style.color = "#3a4a59";
    subtitle.textContent = `Due: ${g.dueDate || "—"} | Owner: ${g.owner || "—"}`;

    const removeBtn = document.createElement("span");
    removeBtn.textContent = "×";
    removeBtn.style.cssText = "float: right; cursor: pointer; color: #900;";
    removeBtn.addEventListener("click", () => deleteGoal(g.id));

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

  const risksList = document.getElementById("risks-list");
  risksList.innerHTML = "";
  state.risks.forEach((r) => {
    if (state.placements[r.id]) return;

    const card = document.createElement("div");
    card.className = "card risk list-card";
    card.setAttribute("data-id", r.id);
    card.setAttribute("data-type", "risk");
    card.setAttribute("draggable", "true");
    card.style.position = "static";
    card.style.marginBottom = "0.75rem";

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
    removeBtn.addEventListener("click", () => deleteRisk(r.id));

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

  const kpisList = document.getElementById("kpis-list");
  kpisList.innerHTML = "";
  state.kpis.forEach((k) => {
    if (state.placements[k.id]) return;

    const card = document.createElement("div");
    card.className = "card kpi list-card";
    card.setAttribute("data-id", k.id);
    card.setAttribute("data-type", "kpi");
    card.setAttribute("draggable", "true");
    card.style.position = "static";
    card.style.marginBottom = "0.75rem";

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
    removeBtn.addEventListener("click", () => deleteKpi(k.id));

    card.appendChild(removeBtn);
    card.appendChild(title);
    card.appendChild(subtitle);
    kpisList.appendChild(card);
  });

  attachOverviewFormHandlers();
}

function attachOverviewFormHandlers() {
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
      renderOverview();
    });
  }

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
      if (!state.crownLensRisks.includes(title)) {
        state.crownLensRisks.push(title);
      }
      saveState();
      renderOverview();
    });
  }

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
      renderOverview();
    });
  }
}

function deleteGoal(id) {
  state.goals = state.goals.filter((g) => g.id !== id);
  delete state.placements[id];
  saveState();
  renderOverview();
}

function deleteRisk(id) {
  const r = state.risks.find((r) => r.id === id);
  const title = r ? r.title : null;
  state.risks = state.risks.filter((r) => r.id !== id);
  delete state.placements[id];
  if (title) {
    state.crownLensRisks = state.crownLensRisks.filter((t) => t !== title);
  }
  saveState();
  renderOverview();
}

function deleteKpi(id) {
  state.kpis = state.kpis.filter((k) => k.id !== id);
  delete state.placements[id];
  saveState();
  renderOverview();
}

document.addEventListener("DOMContentLoaded", () => {
  loadState();
  renderOverview();
});
