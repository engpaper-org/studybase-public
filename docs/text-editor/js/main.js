// main.js - Initialization and wiring

// Shared state (exposed on window for other scripts)
window.documents = [];
window.currentDocId = null;
window.saveTimeout = null;
window.previewMode = false;

function init() {
  // Load fallback global theme (used only for new documents)
  if (window.loadEditorTheme) window.loadEditorTheme();

  // Load documents (defined in documents.js)
  if (window.loadDocuments) window.loadDocuments();
  if (window.renderDocumentList) window.renderDocumentList();

  // Load first document — this will apply that document's saved theme preference
  if (window.documents && window.documents.length > 0) {
    if (window.loadDocument) window.loadDocument(window.documents[0].id);
  }

  // Check for unsaved changes from previous session (after loading documents)
  // Called with a short delay to ensure everything is ready after refresh
  setTimeout(() => {
    if (window.checkForRecovery) window.checkForRecovery();
  }, 600);

  // Set initial selected state on font size buttons
  setTimeout(() => {
    if (window.setFontSize) window.setFontSize(currentFontSize || 'medium');
  }, 150);

  const editor = document.getElementById('editor');
  if (editor) {
    editor.addEventListener('input', () => {
      if (window.updateStats) window.updateStats();
    });
  }

  // Initial Lucide icons
  if (window.lucide) lucide.createIcons();

  // Re-render icons after dynamic content (in case)
  setTimeout(() => {
    if (window.lucide) lucide.createIcons();
  }, 300);

  // Keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      if (window.currentDocId && window.documents) {
        const doc = window.documents.find(d => d.id === window.currentDocId);
        if (doc) {
          const editorEl = document.getElementById('editor');
          doc.content = editorEl ? editorEl.value : '';
          doc.lastEdited = Date.now();
          if (window.saveDocuments) window.saveDocuments();
          alert('Document saved locally.');
        }
      }
    }
    
    if (e.ctrlKey && e.key.toLowerCase() === 'f') {
      e.preventDefault();
      const search = document.getElementById('search-input');
      if (search) search.focus();
    }
  });

  console.log('%c[Text Editor] Initialized with split JS files.', 'color:#64748b');
}

// === QOL / Layout Helpers ===

let sidebarCollapsed = false;

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const mainArea = document.getElementById('main-editor-area');

  sidebarCollapsed = !sidebarCollapsed;

  if (sidebarCollapsed) {
    sidebar.style.display = 'none';
    mainArea.style.marginLeft = '0';
  } else {
    sidebar.style.display = 'flex';
    mainArea.style.marginLeft = '0';
  }
}

function saveCurrentDocumentLocally() {
  if (!window.currentDocId || !window.documents) {
    alert("No document is currently open.");
    return;
  }

  const doc = window.documents.find(d => d.id === window.currentDocId);
  if (!doc) return;

  const content = document.getElementById('editor').value;
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${doc.name}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Show a nice saved status
  const statusEl = document.getElementById('last-edited');
  if (statusEl) {
    const originalText = statusEl.textContent;
    statusEl.textContent = 'Saved to device ✓';
    setTimeout(() => {
      statusEl.textContent = originalText;
    }, 1800);
  }
}

// Make functions globally available for onclick handlers
window.toggleSidebar = toggleSidebar;
window.saveCurrentDocumentLocally = saveCurrentDocumentLocally;

// === Page Reload Recovery ===

let pendingRecovery = null;

function checkForRecovery() {
  const session = window.getRecoverySession ? window.getRecoverySession() : null;
  if (!session || !window.documents) return;

  const savedDoc = window.documents.find(d => d.id === session.docId);
  if (!savedDoc) {
    window.clearRecoverySession?.();
    return;
  }

  // Check if the session content differs from the saved version
  if (session.content === savedDoc.content) {
    window.clearRecoverySession?.();
    return;
  }

  pendingRecovery = session;

  // Use a simple, reliable confirm dialog on refresh/reload.
  // This is more likely to appear immediately when the page reloads.
  const shouldRecover = confirm(
    `It looks like you had unsaved changes in "${savedDoc.name}" before refreshing.\n\nDo you want to load them back?`
  );

  if (shouldRecover) {
    recoverDocument();
  } else {
    discardRecovery();
  }
}

function recoverDocument() {
  if (!pendingRecovery) return;

  const doc = window.documents.find(d => d.id === pendingRecovery.docId);
  if (!doc) {
    pendingRecovery = null;
    window.clearRecoverySession?.();
    return;
  }

  // Load the document (this sets up the editor)
  if (window.loadDocument) {
    window.loadDocument(pendingRecovery.docId);
  }

  // Overwrite the rich text content with the recovered version
  const editor = document.getElementById('editor');
  if (editor) {
    editor.innerHTML = pendingRecovery.content || '<p><br></p>';
    // Trigger autosave of the recovered content
    if (window.triggerAutoSave) {
      window.triggerAutoSave();
    } else {
      // Fallback
      doc.content = editor.innerHTML;
      doc.lastEdited = Date.now();
      if (window.saveDocuments) window.saveDocuments();
    }
  }

  // Clear the recovery session
  window.clearRecoverySession?.();
  pendingRecovery = null;
}

function discardRecovery() {
  window.clearRecoverySession?.();
  pendingRecovery = null;
}

// Expose recovery functions globally (useful for debugging)
window.recoverDocument = recoverDocument;
window.discardRecovery = discardRecovery;
window.checkForRecovery = checkForRecovery;

// === Extra QOL Features ===

let currentFontSize = 'medium';
let wordWrapEnabled = true;

function setFontSize(size) {
  const editor = document.getElementById('editor');
  if (!editor) return;

  currentFontSize = size;

  let fontSize = '15.5px';
  if (size === 'small') fontSize = '13.5px';
  if (size === 'large') fontSize = '17.5px';

  editor.style.fontSize = fontSize;

  // Update visual selected state on the buttons
  const buttons = {
    small: document.getElementById('font-size-small'),
    medium: document.getElementById('font-size-medium'),
    large: document.getElementById('font-size-large')
  };

  Object.keys(buttons).forEach(key => {
    const btn = buttons[key];
    if (!btn) return;
    if (key === size) {
      btn.classList.add('ring-2', 'ring-indigo-500', 'bg-indigo-100', 'dark:bg-indigo-900/50');
    } else {
      btn.classList.remove('ring-2', 'ring-indigo-500', 'bg-indigo-100', 'dark:bg-indigo-900/50');
    }
  });
}

function toggleWordWrap() {
  const textarea = document.getElementById('editor');
  const btn = document.getElementById('wrap-btn');
  if (!textarea || !btn) return;

  wordWrapEnabled = !wordWrapEnabled;

  if (wordWrapEnabled) {
    textarea.style.whiteSpace = 'pre-wrap';
    textarea.style.wordBreak = 'break-word';
    btn.classList.add('bg-emerald-100', 'text-emerald-700');
  } else {
    textarea.style.whiteSpace = 'pre';
    textarea.style.wordBreak = 'normal';
    btn.classList.remove('bg-emerald-100', 'text-emerald-700');
  }
}

// Make available globally
window.setFontSize = setFontSize;
window.toggleWordWrap = toggleWordWrap;

init();