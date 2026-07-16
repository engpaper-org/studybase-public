(function () {
  const TOKEN_KEY = "studybase_session_active";
  const EXPIRY_KEY = "studybase_session_expiry";
  const SECURITY_COMPROMISE_MESSAGE = [
    "Access to this service has been restricted following the detection of suspicious activity across shared online infrastructure.",
    "The investigation involves multiple systems and extends beyond this individual website.",
    "All affected services have been temporarily disabled to reduce further risk while security and recovery procedures are carried out.",
    "Do not attempt to access, bypass, or interact with related systems until this restriction has been lifted."
  ];
  let shown = false;
  let checking = false;
  let securityCompromiseShown = false;
  function expired() {
    const token = localStorage.getItem(TOKEN_KEY);
    const expiry = Date.parse(localStorage.getItem(EXPIRY_KEY) || "");
    return Boolean(token && (!Number.isFinite(expiry) || expiry <= Date.now()));
  }
  function clear(reason = "") {
    window.StudyBaseServices?.clearAccountSession?.({ reason });
    if (!window.StudyBaseServices) [TOKEN_KEY, EXPIRY_KEY, "studybase_user", "get_help_data"].forEach(k => localStorage.removeItem(k));
  }
  function check() {
    if (!expired() || shown) return;
    shown = true;
    clear();
    const target = "/myaccount/login.html?sessionExpired=true";
    try { (window.top !== window.self ? window.top : window).location.replace(target); }
    catch (_) { window.location.replace(target); }
  }
  function safeIncidentID(value) {
    const incidentID = String(value ?? "").trim().replace(/[\u0000-\u001F\u007F]/g, "").slice(0, 200);
    return incidentID ? incidentID.replace(/^INC-/i, "SB_INC-") : "Unavailable";
  }
  function showSecurityCompromise(incidentID) {
    if (securityCompromiseShown) return;
    securityCompromiseShown = true;
    clear("security-compromise");
    const overlay = document.createElement("div");
    overlay.id = "studybase-security-compromise";
    overlay.setAttribute("role", "alertdialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "studybase-security-compromise-title");
    overlay.style.cssText = "position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(2,6,23,.92);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;overflow:auto";
    const panel = document.createElement("section");
    panel.style.cssText = "width:min(680px,100%);border:1px solid rgba(248,113,113,.35);border-radius:24px;background:#fff;padding:clamp(24px,5vw,44px);box-shadow:0 28px 80px rgba(0,0,0,.45);color:#0f172a";
    const label = document.createElement("p");
    label.textContent = "Security restriction";
    label.style.cssText = "margin:0;color:#b91c1c;font-size:12px;font-weight:800;letter-spacing:.18em;text-transform:uppercase";
    const title = document.createElement("h1");
    title.id = "studybase-security-compromise-title";
    title.textContent = "Access temporarily restricted";
    title.style.cssText = "margin:10px 0 22px;font-size:clamp(25px,4vw,36px);line-height:1.1;font-weight:850";
    panel.append(label, title);
    SECURITY_COMPROMISE_MESSAGE.forEach(text => {
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      paragraph.style.cssText = "margin:0 0 15px;color:#334155;font-size:15px;line-height:1.7";
      panel.appendChild(paragraph);
    });
    const reference = document.createElement("p");
    reference.textContent = `Incident reference: ${safeIncidentID(incidentID)}`;
    reference.style.cssText = "margin:24px 0 0;padding-top:18px;border-top:1px solid #e2e8f0;color:#475569;font:700 13px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace";
    panel.appendChild(reference);
    overlay.appendChild(panel);
    document.documentElement.style.overflow = "hidden";
    [...document.body.children].forEach(element => { element.inert = true; });
    document.body.appendChild(overlay);
    title.setAttribute("tabindex", "-1");
    title.focus();
  }
  function showSecurityCompromiseFromLocation() {
    if (location.pathname !== "/" && !location.pathname.endsWith("/index.html")) return;
    const params = new URLSearchParams(location.search);
    if (params.get("compromised") !== "true") return;
    showSecurityCompromise(params.get("incidentID"));
  }
  async function checkWithApi() {
    if (checking || localStorage.getItem(TOKEN_KEY) !== "1") return;
    checking = true;
    try {
      const sessionUrl = new URL("https://api.platformbase.online/api/session");
      if (/(^|\.)studybase\.(online|site|space|website)$/i.test(location.hostname)) {
        sessionUrl.searchParams.set("distributionId", "studybase-main");
      }
      const response = await fetch(sessionUrl, {
        method: "GET",
        credentials: "include",
        headers: { "Accept": "application/json" },
        cache: "no-store"
      });
      const result = await response.json().catch(() => null);
      if (result?.code === "SECURITY_COMPROMISE" && result?.compromised === true) {
        showSecurityCompromise(result.incidentID);
        return;
      }
      if (response.status === 401 && result?.ok === false && result?.error === "Authentication required") {
        clear("authentication-required");
        if (location.pathname.startsWith("/myaccount/") && !location.pathname.endsWith("/login.html")) {
          location.replace("/?sessionExpired=true");
        }
        return;
      }
      if (response.ok) {
        if (result?.expiresAt) localStorage.setItem(EXPIRY_KEY, result.expiresAt);
        window.StudyBaseSessionPayload = result;
        window.dispatchEvent(new CustomEvent("studybase:session-payload", { detail: result }));
      }
    } catch (_) {
      // Network failure is not proof that the session is invalid.
    } finally {
      checking = false;
    }
  }
  showSecurityCompromiseFromLocation();
  check();
  checkWithApi();
  setInterval(check, 60_000);
  setInterval(checkWithApi, 90_000);
  window.addEventListener("message", event => {
    if (event.origin !== location.origin && event.origin !== "https://auth.platformbase.online") return;
    if (event.data?.type === "studybase:security-compromise") showSecurityCompromise(event.data.incidentID);
  });
  window.StudyBaseSecurityCompromise = Object.freeze({ show: showSecurityCompromise });
  window.sessionExpireManual = function () { localStorage.setItem(EXPIRY_KEY, new Date(0).toISOString()); check(); };
})();
