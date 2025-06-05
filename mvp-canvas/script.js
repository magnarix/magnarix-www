// ======== DRAG & DROP FUNCTIONALITY (unchanged) ========
function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("text/plain", ev.target.outerHTML);
  ev.target.classList.add("dragging");
}

function drop(ev) {
  ev.preventDefault();
  const data = ev.dataTransfer.getData("text/plain");
  ev.target.insertAdjacentHTML("beforeend", data);

  // Remove the original element that was dragged
  const draggingEl = document.querySelector(".dragging");
  if (draggingEl) {
    draggingEl.parentNode.removeChild(draggingEl);
  }

  // Remove the "dragging" class from any leftover element
  document.querySelectorAll(".dragging").forEach((el) => {
    el.classList.remove("dragging");
  });
}


// ======== ADD / REMOVE CARD FUNCTIONALITY ========
document.addEventListener("DOMContentLoaded", function () {
  // 1. Handle “Add” button clicks for every column
  document.querySelectorAll(".add-card-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      // Find the column (section) that this button belongs to
      const columnSection = btn.closest(".column");
      const input = columnSection.querySelector(".new-card-input");
      const text = input.value.trim();
      if (!text) return; // do nothing if empty

      // Create a new <div class="card"> …
      const card = document.createElement("div");
      card.className = "card";
      card.setAttribute("draggable", "true");
      card.setAttribute("ondragstart", "drag(event)");

      // Card text span
      const textSpan = document.createElement("span");
      textSpan.className = "card-text";
      textSpan.textContent = text;

      // Remove-button span (“×”) floated right
      const removeSpan = document.createElement("span");
      removeSpan.className = "remove-btn";
      removeSpan.textContent = "×";
      removeSpan.style.cssText = "float: right; cursor: pointer; color: #900;";

      // Append text and remove button into card
      card.appendChild(textSpan);
      card.appendChild(removeSpan);

      // Append the new card to the column
      columnSection.appendChild(card);

      // Clear the input box
      input.value = "";
    });
  });

  // 2. Remove a card when its “×” is clicked
  //    (using event delegation so that newly added cards also work)
  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("remove-btn")) {
      // Prevent any drag-related side effects
      e.stopPropagation();
      // Remove the entire parent .card
      const cardEl = e.target.closest(".card");
      if (cardEl) cardEl.remove();
    }
  });
});
