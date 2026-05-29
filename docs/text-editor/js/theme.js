// theme.js - Editor-only light/dark mode (completely separate from the site)
// Now supports per-document theme preference

window.isDarkMode = false; // Make it global so other files can read it

function toggleTheme() {
  window.isDarkMode = !window.isDarkMode;
  applyEditorTheme();

  // Save the theme preference to the *current document* if one is open
  if (window.currentDocId && window.documents) {
    const doc = window.documents.find(d => d.id === window.currentDocId);
    if (doc) {
      doc.theme = window.isDarkMode ? 'dark' : 'light';
      if (window.saveDocuments) window.saveDocuments();
    }
  }
}

function applyEditorTheme(force = false) {
  const appRoot = document.getElementById('editor-app');
  const icon = document.getElementById('theme-icon');
  const textEl = document.getElementById('theme-text');
  const editor = document.getElementById('editor');

  if (!appRoot) return;

  if (window.isDarkMode) {
    appRoot.classList.add('dark');
    if (icon) icon.setAttribute('data-lucide', 'sun');
    if (textEl) textEl.textContent = 'Light';

    // Force dark mode colors with !important
    if (editor) {
      editor.style.setProperty('color', '#e2e8f0', 'important');
      editor.style.setProperty('background-color', '#0f172a', 'important');
    }

    // Also force dark background on the container
    const container = document.getElementById('editor-container');
    if (container) container.style.setProperty('background-color', '#0f172a', 'important');

  } else {
    appRoot.classList.remove('dark');
    if (icon) icon.setAttribute('data-lucide', 'moon');
    if (textEl) textEl.textContent = 'Dark';

    // Force light mode colors with !important
    if (editor) {
      editor.style.setProperty('color', '#0f172a', 'important');
      editor.style.setProperty('background-color', '#ffffff', 'important');

      // Aggressively strip any light-colored inline styles from the content
      // This fixes text that was previously formatted while in dark mode
      stripLightColorsFromContent(editor);
    }

    const container = document.getElementById('editor-container');
    if (container) container.style.setProperty('background-color', '#ffffff', 'important');

    // Extra safety: force color on the editor again after stripping
    if (editor) {
      setTimeout(() => {
        if (editor && !window.isDarkMode) {
          editor.style.setProperty('color', '#0f172a', 'important');
        }
      }, 10);
    }
  }
  
  // Always refresh icons when theme changes
  if (window.lucide) {
    lucide.createIcons();
  }
}

/**
 * Recursively removes light/white color styles from rich text content.
 * This fixes the common issue where formatting done in dark mode leaves white text.
 */
function stripLightColorsFromContent(element) {
  if (!element) return;

  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_ELEMENT,
    null,
    false
  );

  let node;
  while ((node = walker.nextNode())) {
    const style = node.getAttribute('style');
    if (style) {
      // Remove color properties that are light/white
      let newStyle = style
        .replace(/color\s*:\s*#(e2e8f0|f1f5f9|f8fafc|ffffff|fff)[^;]*/gi, '')
        .replace(/color\s*:\s*rgb\s*\(\s*2[0-5][0-9]\s*,\s*2[0-5][0-9]\s*,\s*2[0-5][0-9]\s*\)[^;]*/gi, '')
        .replace(/color\s*:\s*white[^;]*/gi, '')
        .replace(/;\s*;/g, ';')
        .replace(/^\s*;\s*/, '')
        .trim();

      if (newStyle) {
        node.setAttribute('style', newStyle);
      } else {
        node.removeAttribute('style');
      }
    }

    // Also clean up any very light background colors if they exist
    const bgStyle = node.getAttribute('style');
    if (bgStyle) {
      let cleaned = bgStyle
        .replace(/background-color\s*:\s*#(0f172a|1e293b)[^;]*/gi, '')
        .replace(/;\s*;/g, ';')
        .replace(/^\s*;\s*/, '')
        .trim();

      if (cleaned && cleaned !== bgStyle) {
        node.setAttribute('style', cleaned);
      }
    }
  }
}

function loadEditorTheme() {
  // Fallback global theme (used for new documents)
  const saved = localStorage.getItem('text-editor-theme');
  window.isDarkMode = (saved === 'dark');
  applyEditorTheme();
}

// Expose for other files
window.loadEditorTheme = loadEditorTheme;
window.toggleTheme = toggleTheme;
window.applyEditorTheme = applyEditorTheme;
window.stripLightColorsFromContent = stripLightColorsFromContent;