// main.js - Initialization, shared state, theme, keyboard shortcuts

// Shared state
window.pdfDoc = null;
window.currentPage = 1;
window.scale = 1.4;
window.annotations = {};
window.currentTool = 'pen';
window.currentColor = '#ef4444';
window.currentSize = 4;
window.currentOpacity = 0.6;

// Theme
let pdfIsLight = false;

function toggleTheme() {
  pdfIsLight = !pdfIsLight;
  applyPdfTheme();
  localStorage.setItem('pdf-annotator-theme', pdfIsLight ? 'light' : 'dark');
}

function applyPdfTheme() {
  const body = document.body;
  const icon = document.getElementById('pdf-theme-icon');
  const text = document.getElementById('pdf-theme-text');

  if (pdfIsLight) {
    body.classList.add('light-pdf');
    if (icon) icon.setAttribute('data-lucide', 'sun');
    if (text) text.textContent = 'Light';
  } else {
    body.classList.remove('light-pdf');
    if (icon) icon.setAttribute('data-lucide', 'moon');
    if (text) text.textContent = 'Dark';
  }
  if (window.lucide) lucide.createIcons();
}

function loadPdfTheme() {
  const saved = localStorage.getItem('pdf-annotator-theme');
  pdfIsLight = (saved === 'light');
  applyPdfTheme();
}

function init() {
  if (window.lucide) lucide.createIcons();

  loadPdfTheme();

  // Set up color swatches
  document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      if (window.setColor) window.setColor(swatch.dataset.color);
    });
  });

  // Initial active swatch
  const initialSwatch = document.querySelector(`.color-swatch[data-color="${window.currentColor}"]`);
  if (initialSwatch) initialSwatch.classList.add('active');

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (window.undo) window.undo();
    }
    if (e.ctrlKey && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      if (window.redo) window.redo();
    }
  });

  // Auto prompt for PDF
  if (window.autoPromptPDF) {
    setTimeout(window.autoPromptPDF, 800);
  }

  console.log('%c[PDF Annotator] Initialized with split modules.', 'color:#64748b');
}

init();