// Scheduled overnight maintenance has been retired. This compatibility stub is
// intentionally inert because older pages still include this script.
(function () {
  window.CurrentScriptVersions = window.CurrentScriptVersions || {};
  window.CurrentScriptVersions.timeCheck = "1.0.1";
  window.SB_MAINTENANCE_ACTIVE = false;
  try {
    document.dispatchEvent(new CustomEvent("sb-maintenance-banner-hidden"));
  } catch (_) {}
})();