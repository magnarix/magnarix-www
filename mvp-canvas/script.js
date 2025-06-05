
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
