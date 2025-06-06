
// JavaScript Updates for MVP Enhancements - 2025-06-06

// 1. Inline Editing for Goals, Risks, and KPIs
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('list-card')) {
    const card = e.target;
    const content = card.textContent.trim();
    const newValue = prompt('Edit item:', content);
    if (newValue !== null && newValue.trim() !== '') {
      card.querySelector('div').textContent = newValue;
      const id = card.getAttribute('data-id');
      const type = card.getAttribute('data-type');
      updateStateItem(id, type, newValue);
      saveState();
    }
  }
});

function updateStateItem(id, type, newValue) {
  const collection = state[type + 's']; // dynamically accessing goals, risks, kpis
  const item = collection.find(i => i.id === id);
  if (item) item.title = newValue;
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
      line.style.border = '1px solid #0070f3';
      line.style.top = Math.min(fromCard.offsetTop, toCard.offsetTop) + 'px';
      line.style.left = fromCard.offsetLeft + 'px';
      line.style.width = '2px';
      line.style.height = Math.abs(fromCard.offsetTop - toCard.offsetTop) + 'px';
      canvas.appendChild(line);
    }
  });
}

// Call this in renderAllPages()
function renderAllPages() {
  const page = window.location.pathname.split("/").pop() || "index.html";
  if (page === "CommandCanvas.html") {
    renderDependenciesVisual();
  }
}

// 4. Advanced Scenario Logic
document.getElementById('hireToggle')?.addEventListener('change', updateScenarioText);
document.getElementById('fundToggle')?.addEventListener('change', updateScenarioText);

function updateScenarioText() {
  const hire = document.getElementById("hireToggle").checked;
  const fund = document.getElementById("fundToggle").checked;
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
  output.textContent = result;
}

// 5. Basic Graphical Visualization for Risk Dashboard using simple bar chart
function renderCrownLens() {
  const ul = document.getElementById("risks-list");
  ul.innerHTML = "";
  state.risks.forEach((risk) => {
    const li = document.createElement("li");
    li.textContent = `${risk.title} (Likelihood: ${risk.likelihood}, Impact: ${risk.impact})`;
    li.style.marginBottom = "0.5rem";
    ul.appendChild(li);
  });

  // Simple Bar Chart visualization
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 150;
  document.querySelector('.canvas').appendChild(canvas);
  const ctx = canvas.getContext('2d');

  state.risks.forEach((risk, index) => {
    const height = risk.likelihood === "High" ? 100 : risk.likelihood === "Medium" ? 70 : 40;
    ctx.fillStyle = "#0070f3";
    ctx.fillRect(index * 70, 150 - height, 50, height);
    ctx.fillStyle = "#000";
    ctx.fillText(risk.title, index * 70, 145);
  });
}
