// annotation.js - Drawing tools, canvas logic, undo/redo, tool settings

window.annotations = window.annotations || {};
let annotationHistory = {};
let historyIndex = {};

function setTool(tool) {
  window.currentTool = tool;

  document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`tool-${tool}`);
  if (activeBtn) activeBtn.classList.add('active');

  const opacityControl = document.getElementById('opacity-control');
  if (opacityControl) {
    opacityControl.style.display = (tool === 'highlighter') ? 'block' : 'none';
  }
}

function setColor(color) {
  window.currentColor = color;
  const picker = document.getElementById('color-picker');
  const currentColorEl = document.getElementById('current-color');

  if (picker) picker.value = color;
  if (currentColorEl) currentColorEl.textContent = color.toUpperCase();

  document.querySelectorAll('.color-swatch').forEach(el => {
    el.classList.toggle('active', el.dataset.color === color);
  });
}

function updateStrokeSize() {
  window.currentSize = parseInt(document.getElementById('stroke-size').value);
  const sizeValue = document.getElementById('size-value');
  if (sizeValue) sizeValue.textContent = `${window.currentSize} px`;
}

function updateOpacity() {
  window.currentOpacity = parseInt(document.getElementById('opacity-slider').value) / 100;
  const opacityValue = document.getElementById('opacity-value');
  if (opacityValue) opacityValue.textContent = `${Math.round(window.currentOpacity * 100)}%`;
}

function setupCanvasDrawing(canvas, ctx, pageNum) {
  let isDrawing = false;
  let lastX = 0, lastY = 0;

  if (!window.annotations[pageNum]) window.annotations[pageNum] = [];

  function draw(e) {
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    ctx.strokeStyle = (window.currentTool === 'highlighter')
      ? window.currentColor + Math.round(window.currentOpacity * 255).toString(16).padStart(2, '0')
      : window.currentColor;

    ctx.lineWidth = window.currentSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (window.currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = window.currentSize * 1.8;
    } else {
      ctx.globalCompositeOperation = 'source-over';
    }

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();

    lastX = x;
    lastY = y;

    window.annotations[pageNum].push({
      type: 'stroke',
      x1: lastX, y1: lastY,
      x2: x, y2: y,
      color: ctx.strokeStyle,
      size: ctx.lineWidth,
      tool: window.currentTool
    });
  }

  canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    lastX = (e.clientX - rect.left) * (canvas.width / rect.width);
    lastY = (e.clientY - rect.top) * (canvas.height / rect.height);
  });

  canvas.addEventListener('mousemove', draw);

  canvas.addEventListener('mouseup', () => {
    if (isDrawing) saveHistory(pageNum);
    isDrawing = false;
  });

  canvas.addEventListener('mouseout', () => {
    if (isDrawing) saveHistory(pageNum);
    isDrawing = false;
  });

  // Touch support
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    lastX = (e.touches[0].clientX - rect.left) * (canvas.width / rect.width);
    lastY = (e.touches[0].clientY - rect.top) * (canvas.height / rect.height);
  });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches[0].clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.touches[0].clientY - rect.top) * (canvas.height / rect.height);

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();

    lastX = x;
    lastY = y;
  });

  canvas.addEventListener('touchend', () => {
    if (isDrawing) saveHistory(pageNum);
    isDrawing = false;
  });
}

// History for Undo/Redo
function saveHistory(pageNum) {
  if (!annotationHistory[pageNum]) annotationHistory[pageNum] = [];

  const wrapper = document.querySelector(`[data-page="${pageNum}"]`);
  if (!wrapper) return;

  const annCanvas = wrapper.querySelector('.annotation-canvas');
  if (!annCanvas) return;

  const dataUrl = annCanvas.toDataURL();

  annotationHistory[pageNum] = annotationHistory[pageNum].slice(0, (historyIndex[pageNum] ?? -1) + 1);
  annotationHistory[pageNum].push(dataUrl);
  historyIndex[pageNum] = annotationHistory[pageNum].length - 1;
}

function undo() {
  const page = window.currentPage;
  if (!annotationHistory[page] || (historyIndex[page] ?? 0) <= 0) return;

  historyIndex[page]--;
  restoreCanvasFromHistory(page);
}

function redo() {
  const page = window.currentPage;
  if (!annotationHistory[page] || (historyIndex[page] ?? 0) >= annotationHistory[page].length - 1) return;

  historyIndex[page]++;
  restoreCanvasFromHistory(page);
}

function restoreCanvasFromHistory(pageNum) {
  const wrapper = document.querySelector(`[data-page="${pageNum}"]`);
  if (!wrapper) return;

  const annCanvas = wrapper.querySelector('.annotation-canvas');
  if (!annCanvas) return;

  const ctx = annCanvas.getContext('2d');
  const img = new Image();

  img.onload = () => {
    ctx.clearRect(0, 0, annCanvas.width, annCanvas.height);
    ctx.drawImage(img, 0, 0);
  };

  img.src = annotationHistory[pageNum][historyIndex[pageNum]];
}

function clearCurrentPage() {
  if (!confirm("Clear all annotations on the current page?")) return;

  const wrapper = document.querySelector(`[data-page="${window.currentPage}"]`);
  if (!wrapper) return;

  const annCanvas = wrapper.querySelector('.annotation-canvas');
  if (annCanvas) {
    const ctx = annCanvas.getContext('2d');
    ctx.clearRect(0, 0, annCanvas.width, annCanvas.height);
  }

  window.annotations[window.currentPage] = [];
  annotationHistory[window.currentPage] = [];
  historyIndex[window.currentPage] = -1;
}

async function exportAnnotatedPDF() {
  const wrapper = document.querySelector(`[data-page="${window.currentPage}"]`);
  if (!wrapper) {
    alert("No page to export.");
    return;
  }

  const renderCanvas = wrapper.querySelector('canvas');
  const annCanvas = wrapper.querySelector('.annotation-canvas');

  if (!renderCanvas || !annCanvas) {
    alert("Could not find page to export.");
    return;
  }

  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = renderCanvas.width;
  exportCanvas.height = renderCanvas.height;

  const ctx = exportCanvas.getContext('2d');
  ctx.drawImage(renderCanvas, 0, 0);
  ctx.drawImage(annCanvas, 0, 0);

  const link = document.createElement('a');
  link.download = `annotated-page-${window.currentPage}.png`;
  link.href = exportCanvas.toDataURL('image/png');
  link.click();
}

// Expose functions
window.setTool = setTool;
window.setColor = setColor;
window.updateStrokeSize = updateStrokeSize;
window.updateOpacity = updateOpacity;
window.setupCanvasDrawing = setupCanvasDrawing;
window.undo = undo;
window.redo = redo;
window.clearCurrentPage = clearCurrentPage;
window.exportAnnotatedPDF = exportAnnotatedPDF;