// /assets/js/securityRiskToast.js
// Shows a bottom toast for 3s if:
// - localStorage.sb_logoutAfterRedirect === "false" OR
// - localStorage.sb_redirectFromHistory === "false"
// Tailwind classes used (no Tailwind import needed).

(function () {
  "use strict";

  window.CurrentScriptVersions = window.CurrentScriptVersions || {};
  window.CurrentScriptVersions['settingsSafetyWarning'] = '1.0.0';

  var KEY_1 = "sb_logoutAfterRedirect";
  var KEY_2 = "sb_redirectFromHistory";
  var TOAST_ID = "sb-security-risk-toast";
  var SHOW_MS = 6000;

  function readFlag(key) {
    try {
      var v = localStorage.getItem(key);
      if (v == null) return null;          // not set
      return String(v).toLowerCase();       // normalize
    } catch (_) {
      return null; // localStorage blocked/unavailable
    }
  }

  function shouldShow() {
    var v1 = readFlag(KEY_1);
    var v2 = readFlag(KEY_2);

    // Only show when explicitly set to "false"
    return v1 === "false" || v2 === "false";
  }

  function removeToast() {
    var el = document.getElementById(TOAST_ID);
    if (!el) return;
    el.classList.add("opacity-0", "translate-y-2");
    window.setTimeout(() => el.remove(), 220);
  }

  function showToast() {
    if (document.getElementById(TOAST_ID)) return;

    var wrap = document.createElement("div");
    wrap.id = TOAST_ID;
    wrap.setAttribute("role", "status");
    wrap.className =
      "fixed left-0 right-0 bottom-0 z-[9999] flex justify-center px-4 pb-4 pointer-events-none";

    var card = document.createElement("div");
    card.className =
      "pointer-events-auto w-full max-w-xl rounded-2xl border border-slate-200 bg-white/95 backdrop-blur shadow-lg " +
      "px-4 py-3 flex items-start gap-3 " +
      "opacity-0 translate-y-2 transition-all duration-200";

    var icon = document.createElement("div");
    icon.className =
      "mt-0.5 h-9 w-9 shrink-0 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700";
    icon.innerHTML = '<span aria-hidden="true">⚠️</span>';

    var content = document.createElement("div");
    content.className = "min-w-0 flex-1";
    content.innerHTML =
      '<div class="font-extrabold text-slate-900 leading-tight">Security warning</div>' +
      '<div class="text-sm text-slate-700 mt-0.5">' +
      'Your security is at risk due to security settings being disabled. ' +
      'To enable them, click <span class="font-semibold">My Account</span> on the home page.' +
      "</div>";

    var close = document.createElement("button");
    close.type = "button";
    close.className =
      "ml-2 -mr-1 h-9 w-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 " +
      "text-slate-700 hover:text-slate-900 transition flex items-center justify-center";
    close.setAttribute("aria-label", "Close");
    close.innerHTML = "✕";
    close.addEventListener("click", removeToast);

    card.appendChild(icon);
    card.appendChild(content);
    card.appendChild(close);
    wrap.appendChild(card);
    document.body.appendChild(wrap);

    // animate in
    requestAnimationFrame(() => {
      card.classList.remove("opacity-0", "translate-y-2");
      card.classList.add("opacity-100", "translate-y-0");
    });

    // auto-hide after 3s
    window.setTimeout(removeToast, SHOW_MS);
  }

  // Run when DOM is ready (safe if loaded in <head> too)
  if (shouldShow()) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", showToast, { once: true });
    } else {
      showToast();
    }
  }
})();