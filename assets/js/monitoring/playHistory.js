// --- Add decoded material-ID to recently played ---

(function () {

  window.CurrentScriptVersions = window.CurrentScriptVersions || {};
  window.CurrentScriptVersions['playHistory'] = '1.0.0';
  
  var RECENT_KEY = "sb_recentlyPlayed";
  var TOGGLE_KEY = "sb_saveRecentlyPlayed";

  function shouldSave() {
    var v = (localStorage.getItem(TOGGLE_KEY) || "").toLowerCase().trim();
    if (v === "false") return false; // default enabled
    return true;
  }

  function readRecent() {
    try {
      var raw = localStorage.getItem(RECENT_KEY);
      if (!raw) return [];
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }

  function writeRecent(arr) {
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(arr));
    } catch {}
  }

  function getNormalisedUrl() {
    var url = new URL(window.location.href);

    // Force hash to exactly #primary-access
    url.hash = "primary-access";

    return url.toString();
  }

  function addRecentlyPlayed(name) {
    if (!shouldSave()) return;
    if (!name) return;

    var recent = readRecent();
    var lower = name.toLowerCase();

    // Remove duplicates
    var cleaned = recent.filter(item => {
      var n = (typeof item === "string" ? item : item?.title || "").toLowerCase();
      return n !== lower;
    });

    cleaned.unshift({
      title: name,
      url: getNormalisedUrl()
    });

    writeRecent(cleaned.slice(0, 30));
  }

  var params = new URLSearchParams(window.location.search);
  var encoded = params.get("material-ID");

  if (encoded) {
    try {
      var decoded = atob(encoded);
      addRecentlyPlayed(decoded);
    } catch (e) {
      console.warn("Failed to decode material-ID");
    }
  }
})();