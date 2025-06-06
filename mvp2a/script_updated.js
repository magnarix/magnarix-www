// JavaScript Updates for MVP Enhancements - 2025-06-06

// 1. Inline Editing for Goals, Risks, and KPIs
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('list-card')) {
    const card = e.target;
    const content = card.querySelector('div')?.textContent?.trim() || '';
    const newValue = prompt('Edit item:', content);
    if (newValue !== null && newValue.trim() !== '') {
      const id = card.getAttribute('data-id');
      const type = card.getAttribute('data-type');
      updateStateItem(id, type, newValue);
      card.querySelector('div').textContent = newValue;
      saveState();
    }
  }
});

function updateStateItem(id, type, newValue) {
  const collection = state[type + 's']; // dynamically access goals, risks, kpis
  const item = collection.find(i => i.id === id);
  if (item) {
    if (type === 'goal') item.title = newValue;
    if (type === 'risk') item.title = newValue;
    if (type === 'kpi') item.name = newValue;
  }
}

// 2. Enhanced Drag-and-Drop Visual Feedback
document.addEventListener('dragstart', (e) => {
  if (e.target.classList.contains('card')) {
    e.target.style.opacity = '0.5';
  }
});
document.addEventListener('dragend', (e) => {
  if (e.target.classList.contains('card')) {
    e.target.style.opacity = '1';
  }
});

// 3. Basic Dependency Visualization (Simple Lines)
function renderDependenciesVisual() {
  const canvas = document.querySelector('.canvas');
  if (!canvas) return;
  canvas.querySelectorAll('.dep-line').forEach(line => line.remove());

  state.dependencies.forEach(dep => {
    const fromCard = document.querySelector(`[data-id="${dep.from}"]`);
    const toCard = document.querySelector(`[data-id="${dep.to}"]`);
    if (fromCard && toCard) {
      const line = document.createElement('div');
      line.className = 'dep-line';
      line.style.position = 'absolute';
      line.style.borderLeft = '2px dashed #0070f3';
      line.style.height = Math.abs(toCard.offsetTop - fromCard.offsetTop) + 'px';
      line.style.left = fromCard.offsetLeft + 80 + 'px';
      line.style.top = Math.min(fromCard.offsetTop, toCard.offsetTop) + 'px';
      canvas.appendChild(line);
    }
  });
}

// Add this to renderAllPages or relevant render function
function renderAllPages() {
  const page = window.location.pathname.split("/").pop() || "index.html";

  if (page === "index.html") {
    renderIndex();
  } else if (page === "CommandCanvas.html") {
    renderCommandCanvas();
    renderDependenciesVisual();
  } else if (page === "OrchestratedPaths.html") {
    renderOrchestratedPaths();
  } else if (page === "ForgeCast.html") {
    renderForgeCast();
  } else if (page === "CrownLens.html") {
    renderCrownLens();
  }

  highlightActiveNav(page);
}

// 4. Advanced Scenario Logic
function renderOrchestratedPaths() {
  const hireCB = document.getElementById("hireToggle");
  const fundCB = document.getElementById("fundToggle");
  if (hireCB) {
    hireCB.checked = state.scenarioOptions?.hire || false;
    hireCB.onchange = updateScenarioText;
  }
  if (fundCB) {
    fundCB.checked = state.scenarioOptions?.fund || false;
    fundCB.onchange = updateScenarioText;
  }
  updateScenarioText();
}

function updateScenarioText() {
  const hire = document.getElementById("hireToggle")?.checked;
  const fund = document.getElementById("fundToggle")?.checked;
  const output = document.getElementById("scenario-output");
  let result = "Scenario Result: ";
  if (hire && fund) {
    result += "High burn, high growth potential.";
  } else if (hire) {
    result += "Fast execution, cashflow risk.";
  } else if (fund) {
    result += "Conservative cashflow, slow pace.";
  } else {
    result += "Steady, predictable progress.";
  }
  if (output) output.textContent = result;
}

// 5. Risk Dashboard: Simple Bar Chart
function renderCrownLens() {
  const ul = document.getElementById("risks-list");
  if (ul) ul.innerHTML = "";
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 150;
  document.querySelector('.canvas')?.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const risks = state.risks || [];
  risks.forEach((risk, index) => {
    const height = risk.likelihood === "High" ? 100 : risk.likelihood === "Medium" ? 70 : 40;
    ctx.fillStyle = "#0070f3";
    ctx.fillRect(index * 70, 150 - height, 50, height);
    ctx.fillStyle = "#000";
    ctx.fillText(risk.title.substring(0, 6), index * 70, 145);
  });
}

// You can still append this file to your project as script_updated.js and reference it in index.html
