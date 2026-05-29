// documents.js - Document CRUD and sidebar

// Use shared state from main.js
const documents = window.documents;
let currentDocId = window.currentDocId;

function loadDocuments() {
  const saved = localStorage.getItem('doc-editor-v2');
  documents = saved ? JSON.parse(saved) : [];
  
  if (documents.length === 0) {
    const welcome = {
      id: 'welcome-' + Date.now(),
      name: 'Welcome Note',
      content: '# Welcome!\n\nThis is a fully offline text editor.\nEverything saves locally in your browser.',
      lastEdited: Date.now()
    };
    documents.push(welcome);
    saveDocuments();
  }
}

function saveDocuments() {
  localStorage.setItem('doc-editor-v2', JSON.stringify(documents));
}

function renderDocumentList(filter = '') {
  const docList = document.getElementById('doc-list');
  docList.innerHTML = '';
  
  const filtered = documents.filter(doc => 
    doc.name.toLowerCase().includes(filter.toLowerCase())
  );

  filtered.forEach(doc => {
    const div = document.createElement('div');
    div.className = `doc-item px-3 py-2.5 rounded-xl mx-1 cursor-pointer flex items-center justify-between group ${doc.id === currentDocId ? 'active' : ''}`;
    
    div.innerHTML = `
      <div class="min-w-0 flex-1">
        <div class="font-medium truncate text-sm">${doc.name}</div>
        <div class="text-[10px] text-slate-400 mt-0.5">
          ${new Date(doc.lastEdited).toLocaleDateString()}
        </div>
      </div>
    `;
    
    div.onclick = () => loadDocument(doc.id);
    docList.appendChild(div);
  });
}

function filterDocuments() {
  const term = document.getElementById('search-input').value;
  renderDocumentList(term);
}

function loadDocument(id) {
  window.currentDocId = id;
  currentDocId = id; // keep local in sync

  const doc = documents.find(d => d.id === id);
  if (!doc) return;

  const docTitle = document.getElementById('doc-title');
  const editor = document.getElementById('editor');

  docTitle.value = doc.name;
  // Rich text editor uses innerHTML
  if (editor) {
    editor.innerHTML = doc.content || '<p><br></p>';

    // If we're currently in light mode, aggressively clean any light-colored text
    // that might have been created while the document was last used in dark mode.
    if (!window.isDarkMode && window.stripLightColorsFromContent) {
      window.stripLightColorsFromContent(editor);
    }
  }
  
  document.getElementById('last-edited').textContent = 
    `Last edited ${new Date(doc.lastEdited).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`;

  // Apply this document's saved theme preference (if any)
  let themeToApply = doc.theme;

  if (themeToApply !== 'dark' && themeToApply !== 'light') {
    // Old document or new one without theme — assign current visual or default
    themeToApply = window.isDarkMode ? 'dark' : 'light';
    doc.theme = themeToApply;
    if (window.saveDocuments) window.saveDocuments();
  }

  window.isDarkMode = (themeToApply === 'dark');
  if (window.applyEditorTheme) {
    window.applyEditorTheme(true); // force refresh
  }

  renderDocumentList(document.getElementById('search-input').value);
  if (window.updateStats) window.updateStats();

  // Note: Autosave for rich editor is now handled in editor.js via triggerAutoSave()
  // We still call it once on load to be safe
  setTimeout(() => {
    if (window.triggerAutoSave) window.triggerAutoSave();
  }, 100);
}

// === Recovery Session (for page reloads) ===

function saveRecoverySession() {
  if (!window.currentDocId) return;

  const doc = documents.find(d => d.id === window.currentDocId);
  if (!doc) return;

  const editor = document.getElementById('editor');
  if (!editor) return;

  const session = {
    docId: window.currentDocId,
    content: editor.value,
    timestamp: Date.now()
  };

  localStorage.setItem('doc-editor-recovery-session', JSON.stringify(session));
}

function clearRecoverySession() {
  localStorage.removeItem('doc-editor-recovery-session');
}

function getRecoverySession() {
  const raw = localStorage.getItem('doc-editor-recovery-session');
  return raw ? JSON.parse(raw) : null;
}

// Expose for other files
window.saveRecoverySession = saveRecoverySession;
window.clearRecoverySession = clearRecoverySession;
window.getRecoverySession = getRecoverySession;

// Save recovery session when user leaves the page (extra safety)
window.addEventListener('beforeunload', () => {
  if (window.saveRecoverySession) window.saveRecoverySession();
});

function newDocument() {
  const name = prompt('Document name:', 'Untitled Document');
  if (!name) return;

  // Inherit current theme preference for the new document
  const currentTheme = window.isDarkMode ? 'dark' : 'light';

  const newDoc = {
    id: 'doc-' + Date.now(),
    name: name.trim(),
    content: '',
    theme: currentTheme,
    lastEdited: Date.now()
  };
  
  documents.unshift(newDoc);
  saveDocuments();
  renderDocumentList();
  loadDocument(newDoc.id);
}

function renameCurrentDocument() {
  if (!currentDocId) return;
  const doc = documents.find(d => d.id === currentDocId);
  const docTitle = document.getElementById('doc-title');
  
  if (doc && docTitle.value.trim()) {
    doc.name = docTitle.value.trim();
    saveDocuments();
    renderDocumentList(document.getElementById('search-input').value);
  }
}

function duplicateCurrent() {
  if (!currentDocId) return;
  const doc = documents.find(d => d.id === currentDocId);
  
  const copy = {
    ...doc,
    id: 'doc-' + Date.now(),
    name: doc.name + ' (Copy)',
    lastEdited: Date.now()
  };
  
  documents.unshift(copy);
  saveDocuments();
  renderDocumentList();
  loadDocument(copy.id);
}

function deleteCurrent() {
  if (!currentDocId) return;
  if (!confirm('Delete this document?')) return;
  
  documents = documents.filter(d => d.id !== currentDocId);
  saveDocuments();
  currentDocId = null;
  
  const editor = document.getElementById('editor');
  const docTitle = document.getElementById('doc-title');
  if (editor) editor.innerHTML = '';
  docTitle.value = '';
  
  renderDocumentList();
  
  if (documents.length > 0) {
    loadDocument(documents[0].id);
  }
}

function exportDocument(format = 'html') {
  if (!window.currentDocId || !window.documents) return;
  const doc = window.documents.find(d => d.id === window.currentDocId);
  const editorEl = document.getElementById('editor');
  let content = editorEl ? editorEl.innerHTML : (doc.content || '');

  let filename = doc.name;
  let mime = 'text/html';

  if (format === 'md') {
    content = (editorEl ? editorEl.innerText : '').replace(/\n{3,}/g, '\n\n');
    mime = 'text/markdown';
    filename += '.md';
  } else if (format === 'txt') {
    content = (editorEl ? editorEl.innerText : '').replace(/\n{3,}/g, '\n\n');
    mime = 'text/plain';
    filename += '.txt';
  } else {
    // Full styled HTML export
    content = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${doc.name}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.7; max-width: 860px; margin: 40px auto; padding: 0 20px; }
    table { border-collapse: collapse; width: 100%; margin: 16px 0; }
    th, td { border: 1px solid #64748b; padding: 8px; }
    th { background: #f1f5f9; font-weight: 600; }
    h1, h2, h3 { margin-top: 1.5em; }
  </style>
</head>
<body>
${content}
</body>
</html>`;
  }

  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function showImportModal() {
  document.getElementById('import-modal').classList.remove('hidden');
  document.getElementById('import-modal').classList.add('flex');
}

function hideImportModal() {
  document.getElementById('import-modal').classList.remove('flex');
  document.getElementById('import-modal').classList.add('hidden');
}

function importDocument() {
  const fileInput = document.getElementById('import-file');
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const newDoc = {
      id: 'doc-' + Date.now(),
      name: file.name.replace(/\.[^/.]+$/, ""),
      content: e.target.result,
      lastEdited: Date.now()
    };
    documents.unshift(newDoc);
    saveDocuments();
    renderDocumentList();
    loadDocument(newDoc.id);
    hideImportModal();
  };
  reader.readAsText(file);
}

// Sync back to window for other scripts
window.documents = documents;

// Expose functions needed by HTML onclick handlers
window.newDocument = newDocument;
window.duplicateCurrent = duplicateCurrent;
window.deleteCurrent = deleteCurrent;
window.exportDocument = exportDocument;
window.showImportModal = showImportModal;
window.hideImportModal = hideImportModal;
window.importDocument = importDocument;
window.renameCurrentDocument = renameCurrentDocument;
window.loadDocument = loadDocument;
window.renderDocumentList = renderDocumentList;
window.saveDocuments = saveDocuments;