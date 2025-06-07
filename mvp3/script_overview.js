// script_overview.js – Full extraction for overview.html
let state = {
  // ↘ Prepopulate with two sample Goals
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

  // ↘ Prepopulate with two sample Risks
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

  // ↘ Prepopulate with two sample KPIs
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

  // No initial placements, so all samples appear unplaced in overview.html
  placements: {},

  // No sample dependencies to start
  dependencies: [],

  // (For future) risk-goal or kpi-goal links
  links: [],

  // Prepopulate scenarioOptions as false
  scenarioOptions: {
    hire: false,
    fund: false
  },

  // ForgeCast default
  forgeCastChallenge: "",
  forgeCastResult: { suggestion: "", rationale: "" },

  // CrownLensRisks must contain each Risk’s title so they show up in Risk Dashboard
  crownLensRisks: ["Budget Overrun", "Staff Turnover"]
};
function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Merge into existing (so that default samples are overwritten if the user has saved data)
      state = { ...state, ...parsed };
    } catch (err) {
      console.warn("Failed to parse saved state:", err);
    }
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}
  renderAllPages();
}
function renderAllPages() {
  const page = window.location.pathname.split("/").pop() || "overview.html";

  if (page === "overview.html") {
    renderOverview();
  } else if (page === "CommandCanvas.html") {
    renderCommandCanvas();
  } else if (page === "OrchestratedPaths.html") {
    renderOrchestratedPaths();
  } else if (page === "ForgeCast.html") {
    renderForgeCast();
  } else if (page === "CrownLens.html") {
    renderCrownLens();
  }
function renderOverview() {
  // 1) Goals List
  const goalsList = document.getElementById("goals-list");
  goalsList.innerHTML = "";
  state.goals.forEach((g) => {
    // If a goal is already placed on the timeline, skip it here
    if (state.placements[g.id]) return;

    const card = document.createElement("div");
    card.className = "card goal list-card";
    card.setAttribute("data-id", g.id);
    card.setAttribute("data-type", "goal");
    card.setAttribute("draggable", "true");
    card.setAttribute("ondragstart", "drag(event)");
    card.style.position = "static";
    card.style.marginBottom = "0.75rem";

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
      deleteKpi(k.id);
    });

    card.appendChild(removeBtn);
    card.appendChild(title);
    card.appendChild(subtitle);

    kpisList.appendChild(card);
  });

  // 4) Attach form handlers if not already attached
  attachOverviewFormHandlers();
}
function attachOverviewFormHandlers() {
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
      renderAllPages();
    });
  }
      renderAllPages();
    });
  }
function deleteGoal(id) {
  state.goals = state.goals.filter((g) => g.id !== id);
  delete state.placements[id];
  saveState();
  renderAllPages();
}
function deleteRisk(id) {
  // Find the title before removal
  const r = state.risks.find((r) => r.id === id);
  const title = r ? r.title : null;

  // Remove from risks array
  state.risks = state.risks.filter((r) => r.id !== id);
  delete state.placements[id];

  // Remove from crownLensRisks
  if (title) {
    state.crownLensRisks = state.crownLensRisks.filter((t) => t !== title);
  }
  renderAllPages();
}
function deleteKpi(id) {
  state.kpis = state.kpis.filter((k) => k.id !== id);
  delete state.placements[id];
  saveState();
  renderAllPages();
}
      renderAllPages();
    });
  }
  renderAllPages();

  // If using the mobile hamburger to toggle sidebar:
  const hamburger = document.querySelector(".hamburger-btn");
  if (hamburger) {
    hamburger.addEventListener("click", () => {
      document.querySelector(".sidebar").classList.toggle("open");
    });
  }
document.addEventListener("DOMContentLoaded", () => {
  loadState();
  renderAllPages();
});