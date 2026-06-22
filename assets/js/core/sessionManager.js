(function () {
  const TOKEN_KEY = "studybase_session_active";
  const EXPIRY_KEY = "studybase_session_expiry";
  let shown = false;
  let checking = false;
  function expired() {
    const token = localStorage.getItem(TOKEN_KEY);
    const expiry = Date.parse(localStorage.getItem(EXPIRY_KEY) || "");
    return Boolean(token && (!Number.isFinite(expiry) || expiry <= Date.now()));
  }
  function clear(reason = "") {
    window.StudyBaseServices?.clearAccountSession?.({ reason });
    if (!window.StudyBaseServices) [TOKEN_KEY, EXPIRY_KEY, "studybase_user"].forEach(k => localStorage.removeItem(k));
  }
  function check() {
    if (!expired() || shown) return;
    shown = true;
    clear();
    const target = "/myaccount/login.html?sessionExpired=true";
    try { (window.top !== window.self ? window.top : window).location.replace(target); }
    catch (_) { window.location.replace(target); }
  }
  async function checkWithApi() {
    if (checking || localStorage.getItem(TOKEN_KEY) !== "1") return;
    checking = true;
    try {
      const response = await fetch("https://api.studybase.site/api/session", {
        method: "GET",
        credentials: "include",
        headers: { "Accept": "application/json" },
        cache: "no-store"
      });
      const result = await response.json().catch(() => null);
      if (response.status === 401 && result?.ok === false && result?.error === "Authentication required") {
        clear("authentication-required");
        if (location.pathname.startsWith("/myaccount/") && !location.pathname.endsWith("/login.html")) {
          location.replace("/?sessionExpired=true");
        }
        return;
      }
      if (response.ok) {
        if (result?.expiresAt) localStorage.setItem(EXPIRY_KEY, result.expiresAt);
      }
    } catch (_) {
      // Network failure is not proof that the session is invalid.
    } finally {
      checking = false;
    }
  }
  check();
  checkWithApi();
  setInterval(check, 60_000);
  setInterval(checkWithApi, 90_000);
  window.sessionExpireManual = function () { localStorage.setItem(EXPIRY_KEY, new Date(0).toISOString()); check(); };
})();
