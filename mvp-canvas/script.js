// ========================================================================
// Existing drag-and-drop functions (unchanged from before)
// ========================================================================
function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.outerHTML);
  ev.dataTransfer.effectAllowed = "move";
  ev.target.classList.add("dragging");
}

function drop(ev) {
  ev.preventDefault();
  const data = ev.dataTransfer.getData("text");
  const target = ev.target;
  const dropZone = target.classList.contains("card") ? target.parentNode : target;
  dropZone.insertAdjacentHTML('beforeend', data);
  document.querySelector('.dragging')?.remove();
}

// ========================================================================
// New DOMContentLoaded logic for tooltips, accordions, quick-add, summary, etc.
// ========================================================================
document.addEventListener("DOMContentLoaded", () => {
  // 1. Accordion toggles (Explain more → / Collapse ▲)
  document.querySelectorAll(".toggle-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetID = btn.getAttribute("data-target");
      const detailDiv = document.getElementById(targetID);
      if (detailDiv.classList.contains("hidden")) {
        detailDiv.classList.remove("hidden");
        btn.innerText = "Collapse ▲";
      } else {
        detailDiv.classList.add("hidden");
        btn.innerText = "Explain more →";
      }
    });
  });

  // 2. Tooltips & Info Modals for Goals, Risks, KPIs
  const definitions = {
    goals: "Goals are top-level objectives you want to accomplish—in plain language, 'What do we hope to achieve this quarter?'",
    risks: "Risks are uncertainties or possible blockers. Think, 'What could derail our progress if it goes wrong?'",
    kpis:  "KPIs (Key Performance Indicators) are the measurable metrics that tell us whether we succeeded—e.g., revenue targets, user-growth percentages, or NPS scores."
  };

  document.querySelectorAll(".info-icon").forEach(icon => {
    let tooltip;

    // Show tooltip on hover
    icon.addEventListener("mouseover", () => {
      const section = icon.getAttribute("data-section");
      tooltip = document.createElement("div");
      tooltip.classList.add("tooltip");
      tooltip.innerText = definitions[section] || "";
      document.body.appendChild(tooltip);
      const rect = icon.getBoundingClientRect();
      tooltip.style.top = (rect.bottom + window.scrollY + 5) + "px";
      tooltip.style.left = (rect.left + window.scrollX) + "px";
    });

    // Hide tooltip on mouseout
    icon.addEventListener("mouseout", () => {
      if (tooltip) {
        tooltip.remove();
        tooltip = null;
      }
    });

    // On click, show a modal with a longer explanation
    icon.addEventListener("click", () => {
      const section = icon.getAttribute("data-section");
      const modal = document.createElement("div");
      modal.classList.add("modal");
      const contentBox = document.createElement("div");
      contentBox.classList.add("modal-content");
      const heading = document.createElement("h2");
      heading.innerText = section.charAt(0).toUpperCase() + section.slice(1);
      const paragraph = document.createElement("p");
      paragraph.innerText = definitions[section] || "";
      const closeBtn = document.createElement("button");
      closeBtn.innerText = "Got it!";
      closeBtn.addEventListener("click", () => {
        modal.remove();
      });
      contentBox.appendChild(heading);
      contentBox.appendChild(paragraph);
      contentBox.appendChild(closeBtn);
      modal.appendChild(contentBox);
      document.body.appendChild(modal);
    });
  });

  // 3. Highlight linked Risks/KPIs when clicking on a Goal
  function setupGoalHighlight(row) {
    row.addEventListener("click", () => {
      document.querySelectorAll(".risk-row, .kpi-row").forEach(r => r.classList.remove("highlighted"));
      const goalID = row.getAttribute("data-goal-id");
      document.querySelectorAll(`.risk-row[data-related-goals*="${goalID}"]`).forEach(r => r.classList.add("highlighted"));
      document.querySelectorAll(`.kpi-row[data-related-goals*="${goalID}"]`).forEach(k => k.classList.add("highlighted"));
    });
  }
  document.querySelectorAll(".goal-row").forEach(setupGoalHighlight);

  // 4. Quick-Add for Goals
  let nextGoalIndex = 1;

  function updateGoalSelects() {
    const selectRisk = document.getElementById("new-risk-related");
    const selectKpi  = document.getElementById("new-kpi-related");
    // Clear existing options (keep the first placeholder)
    Array.from(selectRisk.options).slice(1).forEach(opt => opt.remove());
    Array.from(selectKpi.options).slice(1).forEach(opt => opt.remove());
    // Add an option for each existing goal
    document.querySelectorAll(".goal-row").forEach(g => {
      const gid = g.getAttribute("data-goal-id");
      const text = g.querySelector("td").innerText;
      [selectRisk, selectKpi].forEach(sel => {
        const opt = document.createElement("option");
        opt.value = gid;
        opt.innerText = text;
        sel.appendChild(opt);
      });
    });
  }

  document.getElementById("add-goal-btn").addEventListener("click", () => {
    const inputEl = document.getElementById("new-goal-text");
    const val = inputEl.value.trim();
    const errorEl = document.getElementById("goal-error");
    if (!val) {
      errorEl.innerText = "Goal cannot be blank.";
      return;
    }
    const isDup = Array.from(document.querySelectorAll(".goal-row")).some(r =>
      r.querySelector("td").innerText.toLowerCase() === val.toLowerCase()
    );
    if (isDup) {
      errorEl.innerText = "That Goal already exists.";
      return;
    }
    // Clear error and input
    errorEl.innerText = "";
    inputEl.value = "";

    // Create new <tr class="goal-row"> in the Goals table
    const newRow = document.createElement("tr");
    const newID = "g" + (++nextGoalIndex);
    newRow.classList.add("goal-row");
    newRow.setAttribute("data-goal-id", newID);
    newRow.innerHTML = `<td>${val}</td>`;
    document.querySelector("#goals-table tbody").appendChild(newRow);
    setupGoalHighlight(newRow);
    updateGoalSelects();
  });

  // 5. Quick-Add for Risks
  document.getElementById("add-risk-btn").addEventListener("click", () => {
    const textEl = document.getElementById("new-risk-text");
    const relEl  = document.getElementById("new-risk-related");
    const errorEl = document.getElementById("risk-error");
    const text = textEl.value.trim();
    const related = relEl.value;
    if (!text) {
      errorEl.innerText = "Risk cannot be blank.";
      return;
    }
    if (!related) {
      errorEl.innerText = "Select a related Goal.";
      return;
    }
    // Clear error and inputs
    errorEl.innerText = "";
    textEl.value = "";
    relEl.selectedIndex = 0;

    // Create <tr class="risk-row"> in the Risks table
    const tr = document.createElement("tr");
    tr.classList.add("risk-row");
    tr.setAttribute("data-related-goals", related);
    tr.innerHTML = `<td>${text}</td>`;
    document.querySelector("#risks-table tbody").appendChild(tr);
  });

  // 6. Quick-Add for KPIs
  document.getElementById("add-kpi-btn").addEventListener("click", () => {
    const textEl = document.getElementById("new-kpi-text");
    const relEl  = document.getElementById("new-kpi-related");
    const errorEl = document.getElementById("kpi-error");
    const text = textEl.value.trim();
    const related = relEl.value;
    if (!text) {
      errorEl.innerText = "KPI cannot be blank.";
      return;
    }
    if (!related) {
      errorEl.innerText = "Select a related Goal.";
      return;
    }
    // Clear error and inputs
    errorEl.innerText = "";
    textEl.value = "";
    relEl.selectedIndex = 0;

    // Create <tr class="kpi-row"> in the KPIs table
    const tr = document.createElement("tr");
    tr.classList.add("kpi-row");
    tr.setAttribute("data-related-goals", related);
    tr.innerHTML = `<td>${text}</td>`;
    document.querySelector("#kpis-table tbody").appendChild(tr);
  });

  // Populate the “related Goal” <select> for Risks & KPIs
  updateGoalSelects();

  // 7. Load / Hide Sample Canvas
  const sampleCanvas = {
    goals: [
      { id: "g_sample1", text: "Increase Free-Trial Signups by 20% in Q4" },
      { id: "g_sample2", text: "Improve Customer NPS from 35 to 50" }
    ],
    risks: [
      { text: "If server latency spikes, free-trial UX drops", related: "g_sample1" },
      { text: "If support ticket queues lengthen, NPS will fall",   related: "g_sample2" }
    ],
    kpis: [
      { text: "Weekly Free-Trial Signup Count",   related: "g_sample1" },
      { text: "Net Promoter Score Survey",        related: "g_sample2" }
    ]
  };

  document.getElementById("load-sample-btn").addEventListener("click", () => {
    // Add sample goals if not already present
    sampleCanvas.goals.forEach(g => {
      if (!document.querySelector(`.goal-row[data-goal-id="${g.id}"]`)) {
        const tr = document.createElement("tr");
        tr.classList.add("goal-row");
        tr.setAttribute("data-goal-id", g.id);
        tr.innerHTML = `<td>${g.text}</td>`;
        document.querySelector("#goals-table tbody").appendChild(tr);
        setupGoalHighlight(tr);
      }
    });
    // Add sample risks
    sampleCanvas.risks.forEach(rObj => {
      const tr = document.createElement("tr");
      tr.classList.add("risk-row");
      tr.setAttribute("data-related-goals", rObj.related);
      tr.innerHTML = `<td>${rObj.text}</td>`;
      document.querySelector("#risks-table tbody").appendChild(tr);
    });
    // Add sample KPIs
    sampleCanvas.kpis.forEach(kObj => {
      const tr = document.createElement("tr");
      tr.classList.add("kpi-row");
      tr.setAttribute("data-related-goals", kObj.related);
      tr.innerHTML = `<td>${kObj.text}</td>`;
      document.querySelector("#kpis-table tbody").appendChild(tr);
    });
    updateGoalSelects();
    document.getElementById("load-sample-btn").classList.add("hidden");
    document.getElementById("hide-sample-btn").classList.remove("hidden");
  });

  document.getElementById("hide-sample-btn").addEventListener("click", () => {
    sampleCanvas.goals.forEach(gObj => {
      const row = document.querySelector(`.goal-row[data-goal-id="${gObj.id}"]`);
      if (row) row.remove();
    });
    document.querySelectorAll(`.risk-row[data-related-goals*="g_sample1"], .risk-row[data-related-goals*="g_sample2"]`)
      .forEach(r => r.remove());
    document.querySelectorAll(`.kpi-row[data-related-goals*="g_sample1"], .kpi-row[data-related-goals*="g_sample2"]`)
      .forEach(k => k.remove());
    updateGoalSelects();
    document.getElementById("hide-sample-btn").classList.add("hidden");
    document.getElementById("load-sample-btn").classList.remove("hidden");
  });

  // 8. Real-Time Summary Panel
  function refreshSummary() {
    const goals = Array.from(document.querySelectorAll(".goal-row"));
    const risks = Array.from(document.querySelectorAll(".risk-row"));
    const kpis  = Array.from(document.querySelectorAll(".kpi-row"));

    document.getElementById("counts-text").innerText =
      `You have ${goals.length} Goal${goals.length !== 1 ? "s" : ""}, `
      + `${risks.length} Risk${risks.length !== 1 ? "s" : ""}, and `
      + `${kpis.length} KPI${kpis.length !== 1 ? "s" : ""}.`;

    const connectionsList = document.getElementById("connections-list");
    connectionsList.innerHTML = "";
    goals.forEach(g => {
      const gid = g.getAttribute("data-goal-id");
      const goalText = g.querySelector("td").innerText;
      const linkedRisks = risks.filter(r => r.getAttribute("data-related-goals").includes(gid));
      const linkedKpis  = kpis.filter(k => k.getAttribute("data-related-goals").includes(gid));
      const li = document.createElement("li");
      li.innerText = `“${goalText}” → ${linkedRisks.length} Risk${linkedRisks.length !== 1 ? "s" : ""}, `
                   + `${linkedKpis.length} KPI${linkedKpis.length !== 1 ? "s" : ""}`;
      connectionsList.appendChild(li);
    });

    const missingList = document.getElementById("missing-list");
    missingList.innerHTML = "";
    goals.forEach(g => {
      const gid = g.getAttribute("data-goal-id");
      const goalText = g.querySelector("td").innerText;
      const hasRisk = !!document.querySelector(`.risk-row[data-related-goals*="${gid}"]`);
      if (!hasRisk) {
        const li = document.createElement("li");
        li.innerText = `Goal “${goalText}” has no Risks assigned.`;
        missingList.appendChild(li);
      }
    });
    kpis.forEach(k => {
      const kText = k.querySelector("td").innerText;
      const related = k.getAttribute("data-related-goals");
      if (!related) {
        const li = document.createElement("li");
        li.innerText = `KPI “${kText}” not linked to any Goal.`;
        missingList.appendChild(li);
      }
    });
  }

  // Run it once on load…
  refreshSummary();
  // …and whenever Goals/Risks/KPIs tables change
  const observer = new MutationObserver(refreshSummary);
  observer.observe(document.querySelector("#goals-table tbody"), { childList: true });
  observer.observe(document.querySelector("#risks-table tbody"),  { childList: true });
  observer.observe(document.querySelector("#kpis-table tbody"),   { childList: true });

  // 9. Export entire Canvas as JSON
  document.getElementById("export-json-btn").addEventListener("click", () => {
    const goalsData = Array.from(document.querySelectorAll(".goal-row")).map(r => ({
      id: r.getAttribute("data-goal-id"),
      text: r.querySelector("td").innerText.trim()
    }));
    const risksData = Array.from(document.querySelectorAll(".risk-row")).map(r => ({
      text: r.querySelector("td").innerText.trim(),
      related: r.getAttribute("data-related-goals").split(",").filter(s => s)
    }));
    const kpisData = Array.from(document.querySelectorAll(".kpi-row")).map(k => ({
      text: k.querySelector("td").innerText.trim(),
      related: k.getAttribute("data-related-goals").split(",").filter(s => s)
    }));
    const canvasObj = { goals: goalsData, risks: risksData, kpis: kpisData };
    const jsonStr = JSON.stringify(canvasObj, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-canvas.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
});
