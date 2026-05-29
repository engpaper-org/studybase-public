// editor.js - Editor logic, stats, markdown preview, search/replace, rich text formatting

let saveTimeout = null;
window.previewMode = false;

/* =======================
   Rich Text Formatting
   ======================= */

function formatDoc(command, value = null) {
  const editor = document.getElementById('editor');
  if (!editor) return;

  editor.focus();

  try {
    document.execCommand(command, false, value);
  } catch (e) {
    console.warn('execCommand failed:', command, e);
  }

  // Trigger autosave after formatting
  triggerAutoSave();
}

function insertTable(rows = 3, cols = 3) {
  const editor = document.getElementById('editor');
  if (!editor) return;

  editor.focus();

  let html = '<table style="border-collapse: collapse; width: 100%; margin: 12px 0; border: 1px solid #64748b;">';
  for (let r = 0; r < rows; r++) {
    html += '<tr>';
    for (let c = 0; c < cols; c++) {
      const isHeader = r === 0;
      const tag = isHeader ? 'th' : 'td';
      const cellStyle = isHeader 
        ? 'border: 1px solid #64748b; padding: 8px; background: #f1f5f9; font-weight: 600; text-align: left;' 
        : 'border: 1px solid #64748b; padding: 8px;';
      html += `<${tag} style="${cellStyle}">${isHeader ? `Col ${c+1}` : ''}</${tag}>`;
    }
    html += '</tr>';
  }
  html += '</table><p><br></p>';

  document.execCommand('insertHTML', false, html);
  triggerAutoSave();
}

function triggerAutoSave() {
  if (!window.currentDocId || !window.documents) return;

  const doc = window.documents.find(d => d.id === window.currentDocId);
  if (!doc) return;

  const editor = document.getElementById('editor');
  if (!editor) return;

  doc.content = editor.innerHTML;
  doc.lastEdited = Date.now();

  if (window.saveDocuments) window.saveDocuments();
  if (window.saveRecoverySession) window.saveRecoverySession();

  const lastEditedEl = document.getElementById('last-edited');
  if (lastEditedEl) lastEditedEl.textContent = 'Last edited just now';
}

/* =======================
   Stats & Preview (updated for rich text)
   ======================= */

function updateStats() {
  const editor = document.getElementById('editor');
  if (!editor) return;

  const text = editor.innerText || '';
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const readingTime = Math.max(1, Math.ceil(words / 200));

  const wc = document.getElementById('word-count');
  const cc = document.getElementById('char-count');
  const rt = document.getElementById('reading-time');

  if (wc) wc.textContent = `${words} words`;
  if (cc) cc.textContent = `${chars} characters`;
  if (rt) rt.textContent = `${readingTime} min read`;
}

function toggleMarkdownPreview() {
  const container = document.getElementById('editor-container');
  const preview = document.getElementById('markdown-preview');
  const editor = document.getElementById('editor');

  window.previewMode = !window.previewMode;

  if (window.previewMode) {
    preview.classList.remove('hidden');
    preview.classList.add('block');
    // Simple conversion: use innerText for rough markdown-like view
    preview.innerHTML = `<pre style="white-space: pre-wrap;">${(editor.innerText || '').replace(/</g,'&lt;')}</pre>`;
    editor.style.display = 'none';
  } else {
    preview.classList.remove('block');
    preview.classList.add('hidden');
    editor.style.display = '';
  }
}

function showSearchReplace() {
  const find = prompt('Find text:');
  if (!find) return;
  const replace = prompt('Replace with:');
  if (replace === null) return;

  const editor = document.getElementById('editor');
  if (!editor) return;

  // Basic find & replace in contenteditable
  const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
  const nodes = [];
  let node;
  while ((node = walker.nextNode())) {
    nodes.push(node);
  }

  nodes.forEach(textNode => {
    if (textNode.nodeValue.includes(find)) {
      const newText = textNode.nodeValue.split(find).join(replace);
      const span = document.createElement('span');
      span.innerHTML = newText.replace(/\n/g, '<br>');
      textNode.parentNode.replaceChild(span, textNode);
    }
  });

  triggerAutoSave();
}

/* =======================
   Initialization for rich editor
   ======================= */

function initRichEditor() {
  const editor = document.getElementById('editor');
  if (!editor) return;

  // Autosave on input for rich content
  editor.addEventListener('input', () => {
    clearTimeout(window.saveTimeout);
    window.saveTimeout = setTimeout(() => {
      triggerAutoSave();
      updateStats();
    }, 400);
  });

  // Update stats on selection change too
  editor.addEventListener('keyup', updateStats);
  editor.addEventListener('mouseup', updateStats);
}

// Auto-init when this script loads
document.addEventListener('DOMContentLoaded', () => {
  initRichEditor();
});

// Expose
window.formatDoc = formatDoc;
window.insertTable = insertTable;
window.updateStats = updateStats;
window.toggleMarkdownPreview = toggleMarkdownPreview;
window.showSearchReplace = showSearchReplace;
window.triggerAutoSave = triggerAutoSave;