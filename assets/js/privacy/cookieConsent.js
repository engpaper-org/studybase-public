(function () {
  "use strict";

  if (window.StudyBaseConsent) {
    window.StudyBaseConsent.init();
    return;
  }

  const CHOICE_KEY = "studybase_consent_choice";
  const LEGACY_KEY = "site_consent_granted";
  const ANALYTICS_KEY = "site_consent_analytics";
  const PRIVACY_CONFIG = window.StudyBasePrivacyConfig || {};
  const CONSENT_VERSION = PRIVACY_CONFIG.noticeVersion || "STUDYBASE_PRIVACY_FALLBACK";
  const PRIVACY_URL = PRIVACY_CONFIG.privacyUrl || "/legal/privacy.html#cookies";
  const SIX_MONTHS_MS = 183 * 24 * 60 * 60 * 1000;
  let lastFocusedElement = null;

  function readChoice() {
    try {
      const value = JSON.parse(localStorage.getItem(CHOICE_KEY) || "null");
      if (!value || value.version !== CONSENT_VERSION || typeof value.analytics !== "boolean") return null;
      if (value.expiresAt && Date.parse(value.expiresAt) <= Date.now()) return null;
      return value;
    } catch (_) {
      return null;
    }
  }

  function styles() {
    if (document.getElementById("sb-consent-ui-style")) return;
    const style = document.createElement("style");
    style.id = "sb-consent-ui-style";
    style.textContent = `
      #sb-cookie-banner,#sb-cookie-dialog{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;box-sizing:border-box;color:#0f172a}#sb-cookie-banner *,#sb-cookie-dialog *{box-sizing:border-box}
      #sb-cookie-banner{position:fixed;z-index:2147483645;right:16px;bottom:16px;left:16px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:18px;align-items:center;max-width:1080px;margin:auto;border:1px solid #cbd5e1;border-radius:20px;background:#fff;padding:20px;box-shadow:0 24px 70px rgba(15,23,42,.24)}
      .sb-cookie-title{margin:0;font-size:18px;font-weight:900;letter-spacing:-.02em}.sb-cookie-copy{max-width:720px;margin:7px 0 0;color:#475569;font-size:13px;line-height:1.55}.sb-cookie-copy a,.sb-cookie-link{color:#1d4ed8;font-weight:800;text-decoration:underline;text-underline-offset:3px}
      .sb-cookie-actions{display:flex;flex-wrap:wrap;gap:9px}.sb-cookie-button{min-height:44px;border:1px solid #1e3a8a;border-radius:12px;padding:10px 15px;background:#fff;color:#1e3a8a;font-size:13px;font-weight:900;cursor:pointer}.sb-cookie-button.primary{background:#1e3a8a;color:#fff}.sb-cookie-button:hover{box-shadow:0 0 0 3px rgba(59,130,246,.18)}.sb-cookie-button:focus-visible,.sb-cookie-link:focus-visible{outline:3px solid #f59e0b;outline-offset:3px}
      #sb-cookie-dialog{position:fixed;inset:0;z-index:2147483646;display:grid;place-items:center;padding:18px}.sb-cookie-backdrop{position:absolute;inset:0;background:rgba(2,6,23,.72)}.sb-cookie-card{position:relative;width:min(680px,100%);max-height:calc(100vh - 36px);overflow:auto;border-radius:22px;background:#fff;box-shadow:0 35px 100px rgba(2,6,23,.5)}.sb-cookie-head{padding:25px 26px 18px;border-bottom:1px solid #e2e8f0}.sb-cookie-head-row{display:flex;justify-content:space-between;gap:16px;align-items:start}.sb-cookie-close{border:0;border-radius:9px;background:#f1f5f9;padding:7px 10px;font-weight:900;cursor:pointer}.sb-cookie-body{padding:22px 26px 26px}.sb-cookie-category{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:16px;margin-top:12px;border:1px solid #e2e8f0;border-radius:16px;padding:16px}.sb-cookie-category h3{margin:0;font-size:15px}.sb-cookie-category p{margin:6px 0 0;color:#64748b;font-size:12px;line-height:1.55}.sb-cookie-status{align-self:start;border-radius:999px;background:#e2e8f0;padding:5px 9px;color:#334155;font-size:10px;font-weight:900}.sb-cookie-switch{align-self:start;display:flex;align-items:center;gap:8px;font-size:12px;font-weight:900}.sb-cookie-switch input{width:20px;height:20px;accent-color:#1e3a8a}.sb-cookie-dialog-actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:9px;margin-top:20px}
      @media(min-width:721px) and (max-height:850px){#sb-cookie-banner{right:12px;bottom:12px;left:12px;max-width:1120px;gap:14px;padding:13px 16px;border-radius:16px}.sb-cookie-title{font-size:16px}.sb-cookie-copy{margin-top:4px;font-size:11.5px;line-height:1.4}.sb-cookie-button{min-height:40px;padding:8px 12px;font-size:12px}}
      @media(max-width:720px){#sb-cookie-banner{grid-template-columns:1fr;right:10px;bottom:10px;left:10px}.sb-cookie-actions{display:grid;grid-template-columns:1fr 1fr}.sb-cookie-actions .manage{grid-column:1/-1}.sb-cookie-button{width:100%}.sb-cookie-head,.sb-cookie-body{padding:20px}.sb-cookie-dialog-actions{display:grid;grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function deleteAnalyticsCookies() {
    const names = document.cookie.split(";").map(item => item.split("=")[0].trim()).filter(name => name === "_ga" || name.startsWith("_ga_"));
    const hostParts = location.hostname.split(".");
    const domains = [location.hostname, `.${location.hostname}`];
    if (hostParts.length > 2) domains.push(`.${hostParts.slice(-2).join(".")}`);
    names.forEach(name => {
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
      domains.forEach(domain => { document.cookie = `${name}=; Max-Age=0; path=/; domain=${domain}; SameSite=Lax`; });
    });
  }

  function save(analytics) {
    const now = new Date();
    const value = {
      version: CONSENT_VERSION,
      necessary: true,
      analytics: analytics === true,
      decidedAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + SIX_MONTHS_MS).toISOString()
    };
    localStorage.setItem(CHOICE_KEY, JSON.stringify(value));
    localStorage.setItem(LEGACY_KEY, "true");
    localStorage.setItem(ANALYTICS_KEY, String(value.analytics));
    if (!value.analytics) deleteAnalyticsCookies();
    closeAll();
    window.dispatchEvent(new CustomEvent("studybase:consent-changed", { detail: value }));
    // Reload so a grant loads analytics and a withdrawal stops the already-loaded library.
    window.location.reload();
  }

  function closeAll() {
    document.getElementById("sb-cookie-banner")?.remove();
    document.getElementById("sb-cookie-dialog")?.remove();
    document.documentElement.classList.remove("sb-cookie-dialog-open");
    lastFocusedElement?.focus?.();
  }

  function showBanner() {
    styles();
    if (document.getElementById("sb-cookie-banner") || readChoice()) return;
    const banner = document.createElement("section");
    banner.id = "sb-cookie-banner";
    banner.setAttribute("aria-label", "Cookie choices");
    banner.innerHTML = `<div><h2 class="sb-cookie-title">Your privacy choices</h2><p class="sb-cookie-copy">We use necessary browser storage to provide features you request. With your permission, Google Analytics also helps us understand aggregate site use. Analytics is off unless you choose it. Read our <a href="${PRIVACY_URL}">cookie information</a>.</p></div><div class="sb-cookie-actions"><button class="sb-cookie-button primary" data-choice="all" type="button">Accept all</button><button class="sb-cookie-button primary" data-choice="necessary" type="button">Reject optional</button><button class="sb-cookie-button manage" data-choice="manage" type="button">Manage choices</button></div>`;
    banner.querySelector('[data-choice="all"]').onclick = () => save(true);
    banner.querySelector('[data-choice="necessary"]').onclick = () => save(false);
    banner.querySelector('[data-choice="manage"]').onclick = () => showDialog(false);
    document.body.appendChild(banner);
  }

  function showDialog(canClose = true) {
    styles();
    document.getElementById("sb-cookie-dialog")?.remove();
    lastFocusedElement = document.activeElement;
    const selected = readChoice()?.analytics === true;
    const dialog = document.createElement("div");
    dialog.id = "sb-cookie-dialog";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", "sb-cookie-dialog-title");
    dialog.innerHTML = `<div class="sb-cookie-backdrop"></div><section class="sb-cookie-card"><div class="sb-cookie-head"><div class="sb-cookie-head-row"><div><h2 id="sb-cookie-dialog-title" class="sb-cookie-title">Manage cookie choices</h2><p class="sb-cookie-copy">Choose whether we may use optional analytics. Your choice lasts up to six months and can be changed at any time.</p></div>${canClose ? '<button class="sb-cookie-close" type="button" aria-label="Close cookie settings">Close</button>' : ""}</div></div><div class="sb-cookie-body"><div class="sb-cookie-category"><div><h3>Necessary storage</h3><p>StudyBase · consent choice (up to 6 months), account sessions (until Monday 00:01 Europe/London), security and settings. Used only to provide features you request, remember privacy choices and protect the service.</p></div><span class="sb-cookie-status">Always active</span></div><div class="sb-cookie-category"><div><h3>Analytics</h3><p>Google Analytics (_ga and _ga_* cookies, normally up to 2 years). Measures visits and page use so we can improve StudyBase. No advertising storage or personalisation is enabled.</p></div><label class="sb-cookie-switch"><input id="sb-analytics-choice" type="checkbox" ${selected ? "checked" : ""}> Allow</label></div><p class="sb-cookie-copy">See providers, purposes and retention in our <a href="${PRIVACY_URL}" target="_blank" rel="noopener">Privacy Notice</a>.</p><div class="sb-cookie-dialog-actions"><button class="sb-cookie-button primary" id="sb-save-cookie-choice" type="button">Save choices</button><button class="sb-cookie-button" id="sb-reject-cookie-choice" type="button">Reject optional</button></div></div></section>`;
    dialog.querySelector("#sb-save-cookie-choice").onclick = () => save(dialog.querySelector("#sb-analytics-choice").checked);
    dialog.querySelector("#sb-reject-cookie-choice").onclick = () => save(false);
    dialog.querySelector(".sb-cookie-close")?.addEventListener("click", closeAll);
    dialog.addEventListener("keydown", event => {
      if (event.key === "Escape" && canClose) closeAll();
      if (event.key !== "Tab") return;
      const focusable = Array.from(dialog.querySelectorAll('a[href],button,input:not([disabled])'));
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    document.body.appendChild(dialog);
    document.documentElement.classList.add("sb-cookie-dialog-open");
    dialog.querySelector("input,button")?.focus();
  }

  function init() {
    if (!document.body) return document.addEventListener("DOMContentLoaded", init, { once: true });
    styles();
    if (new URLSearchParams(location.search).get("manageCookies") === "1") showDialog(true);
    else if (!readChoice()) showBanner();
  }

  window.StudyBaseConsent = Object.freeze({
    init,
    open: () => showDialog(true),
    acceptAll: () => save(true),
    essentialOnly: () => save(false),
    decline: () => save(false),
    choice: readChoice
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
