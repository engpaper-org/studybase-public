// viewer.js - PDF loading, page rendering, navigation, zoom

function uploadPDF() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/pdf';

  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    document.getElementById('pdf-filename').textContent = file.name;
    document.getElementById('pdf-filename').classList.remove('hidden');

    const arrayBuffer = await file.arrayBuffer();

    if (typeof pdfjsLib !== 'undefined') {
      try {
        window.pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        window.annotations = {};
        window.currentPage = 1;
        await renderAllPages();
      } catch (err) {
        console.error(err);
        showPlaceholder(file.name);
      }
    } else {
      showPlaceholder(file.name);
    }
  };
  input.click();
}

function autoPromptPDF() {
  // Only prompt if no PDF is loaded yet
  if (!window.pdfDoc) {
    // We don't auto-click file input on load for UX reasons,
    // but we can show a nice prompt in the viewer area if desired.
    // For now we keep the existing behavior of having an obvious "Load New PDF" button.
  }
}

function showPlaceholder(filename) {
  const container = document.getElementById('pages-container');
  container.innerHTML = `
    <div class="max-w-2xl w-full">
      <div class="bg-white text-slate-900 rounded-2xl p-8 text-center shadow-2xl">
        <div class="mx-auto w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
          <i data-lucide="file-text" class="w-8 h-8 text-red-600"></i>
        </div>
        <h3 class="font-semibold text-xl mb-2">${filename}</h3>
        <p class="text-slate-600 mb-6">PDF loaded in demo mode.<br>Full rendering works best with PDF.js included.</p>
        <canvas id="demo-canvas" width="720" height="900" class="border border-slate-200 rounded-xl mx-auto"></canvas>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();

  const canvas = document.getElementById('demo-canvas');
  if (canvas && window.setupCanvasDrawing) {
    const ctx = canvas.getContext('2d');
    window.setupCanvasDrawing(canvas, ctx, 1);
  }
}

async function renderAllPages() {
  const container = document.getElementById('pages-container');
  container.innerHTML = '';

  if (!window.pdfDoc) return;

  for (let i = 1; i <= window.pdfDoc.numPages; i++) {
    const page = await window.pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: window.scale });

    const wrapper = document.createElement('div');
    wrapper.className = 'pdf-page rounded-2xl overflow-hidden relative';
    wrapper.style.width = `${viewport.width}px`;
    wrapper.style.height = `${viewport.height}px`;
    wrapper.dataset.page = i;

    const renderCanvas = document.createElement('canvas');
    renderCanvas.width = viewport.width;
    renderCanvas.height = viewport.height;

    const renderCtx = renderCanvas.getContext('2d');
    await page.render({ canvasContext: renderCtx, viewport }).promise;

    const annCanvas = document.createElement('canvas');
    annCanvas.width = viewport.width;
    annCanvas.height = viewport.height;
    annCanvas.className = 'annotation-canvas';

    wrapper.appendChild(renderCanvas);
    wrapper.appendChild(annCanvas);
    container.appendChild(wrapper);

    if (window.setupCanvasDrawing) {
      window.setupCanvasDrawing(annCanvas, annCanvas.getContext('2d'), i);
    }
  }

  if (window.updatePageInfo) window.updatePageInfo();
}

function updatePageInfo() {
  const info = document.getElementById('page-info');
  if (window.pdfDoc) {
    info.textContent = `Page ${window.currentPage} of ${window.pdfDoc.numPages}`;
  } else {
    info.textContent = 'No PDF loaded';
  }
}

function prevPage() {
  if (window.currentPage > 1) {
    window.currentPage--;
    const pageEl = document.querySelector(`[data-page="${window.currentPage}"]`);
    if (pageEl) pageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (window.updatePageInfo) window.updatePageInfo();
  }
}

function nextPage() {
  if (window.pdfDoc && window.currentPage < window.pdfDoc.numPages) {
    window.currentPage++;
    const pageEl = document.querySelector(`[data-page="${window.currentPage}"]`);
    if (pageEl) pageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (window.updatePageInfo) window.updatePageInfo();
  }
}

function goToPage() {
  const input = document.getElementById('page-input');
  if (!input || !window.pdfDoc) return;

  let page = parseInt(input.value);
  if (page < 1) page = 1;
  if (page > window.pdfDoc.numPages) page = window.pdfDoc.numPages;

  window.currentPage = page;
  const pageEl = document.querySelector(`[data-page="${page}"]`);
  if (pageEl) pageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  if (window.updatePageInfo) window.updatePageInfo();
}

function zoomIn() {
  window.scale *= 1.2;
  if (window.pdfDoc && window.renderAllPages) window.renderAllPages();
}

function zoomOut() {
  window.scale /= 1.2;
  if (window.pdfDoc && window.renderAllPages) window.renderAllPages();
}

function fitWidth() {
  window.scale = 1.8;
  if (window.pdfDoc && window.renderAllPages) window.renderAllPages();
}

function fitPage() {
  window.scale = 1.2;
  if (window.pdfDoc && window.renderAllPages) window.renderAllPages();
}

// Expose functions needed by HTML
window.uploadPDF = uploadPDF;
window.prevPage = prevPage;
window.nextPage = nextPage;
window.goToPage = goToPage;
window.zoomIn = zoomIn;
window.zoomOut = zoomOut;
window.fitWidth = fitWidth;
window.fitPage = fitPage;