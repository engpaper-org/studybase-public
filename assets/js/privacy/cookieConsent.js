(function () {
  "use strict";

  if (window.StudyBaseConsent) {
    window.StudyBaseConsent.init();
    return;
  }

  const CHOICE_KEY = "studybase_consent_choice";
  const LEGACY_KEY = "site_consent_granted";
  const ANALYTICS_KEY = "site_consent_analytics";
  const PENDING_LOG_KEY = "studybase_consent_log_pending";
  const PRIVACY_CONFIG = window.StudyBasePrivacyConfig || {};
  const CONSENT_VERSION = PRIVACY_CONFIG.noticeVersion || "STUDYBASE_PRIVACY_FALLBACK";
  const PRIVACY_URL = PRIVACY_CONFIG.privacyUrl || "/legal/privacy.html?consentReview=1";
  const TERMS_URL = PRIVACY_CONFIG.termsUrl || "/legal/tos.html?consentReview=1";
  const ACCOUNT_LOCAL_KEYS = Object.freeze([
    "studybase_session_active",
    "studybase_session_expiry",
    "studybase_user",
    "get_help_data",
    "studybase_friend_request_usage",
    "studybase_weekly_feedback",
    "sb_showContentWarnings"
  ]);
  let declineInProgress = false;

  function readStoredChoice() {
    try {
      const value = JSON.parse(localStorage.getItem(CHOICE_KEY) || "null");
      return value && ["accepted", "declined"].includes(value.service) ? value : null;
    } catch (_) {
      return null;
    }
  }

  function readChoice() {
    const value = readStoredChoice();
    return value?.version === CONSENT_VERSION ? value : null;
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, character => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
  }

  function removeModal() {
    document.getElementById("sb-consent-modal")?.remove();
    document.documentElement.classList.remove("sb-consent-pending");
  }

  function styleMarkup() {
    if (document.getElementById("sb-consent-ui-style")) return;
    const style = document.createElement("style");
    style.id = "sb-consent-ui-style";
    style.textContent = `
      #sb-consent-modal, #sb-limited-consent-banner { font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; box-sizing: border-box; }
      #sb-consent-modal *, #sb-limited-consent-banner * { box-sizing: border-box; }
      #sb-consent-modal { position: fixed; inset: 0; z-index: 2147483646; display: grid; place-items: center; padding: 18px; }
      .sb-consent-backdrop { position: absolute; inset: 0; background: rgba(2, 6, 23, .82); backdrop-filter: blur(16px); }
      .sb-consent-card { position: relative; width: min(720px, 100%); max-height: calc(100vh - 36px); overflow-y: auto; border: 1px solid rgba(191, 219, 254, .9); border-radius: 30px; background: #fff; color: #0f172a; box-shadow: 0 40px 120px rgba(2, 6, 23, .5); }
      .sb-consent-head { position: relative; overflow: hidden; padding: 28px 30px 25px; background: radial-gradient(circle at 92% 8%, rgba(139, 92, 246, .16), transparent 32%), linear-gradient(135deg, #eff6ff, #fff 54%, #f5f3ff); }
      .sb-consent-head::after { content: ""; position: absolute; right: -35px; bottom: -65px; width: 180px; height: 180px; border: 1px solid rgba(99, 102, 241, .12); border-radius: 999px; }
      .sb-consent-brand { position: relative; z-index: 1; display: flex; align-items: center; gap: 11px; }
      .sb-consent-brand-icon { display: grid; width: 38px; height: 38px; place-items: center; border-radius: 12px; background: linear-gradient(135deg, #2563eb, #7c3aed); color: #fff; font-size: 12px; font-weight: 950; letter-spacing: -.02em; box-shadow: 0 10px 24px rgba(79, 70, 229, .25); }
      .sb-consent-brand-copy { color: #334155; font-size: 12px; font-weight: 900; letter-spacing: .04em; }
      .sb-consent-title { position: relative; z-index: 1; margin: 18px 0 0; max-width: 590px; font-size: clamp(29px, 5vw, 43px); line-height: 1.04; font-weight: 950; letter-spacing: -.045em; }
      .sb-consent-copy { position: relative; z-index: 1; margin: 14px 0 0; max-width: 620px; color: #475569; font-size: 14px; line-height: 1.7; }
      .sb-consent-body { padding: 24px 30px 30px; }
      .sb-consent-modes { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
      .sb-consent-mode { min-height: 92px; padding: 15px; border: 1px solid #e2e8f0; border-radius: 17px; background: #f8fafc; }
      .sb-consent-mode-full { border-color: #bfdbfe; background: linear-gradient(145deg, #eff6ff, #f5f3ff); }
      .sb-consent-mode strong { display: block; color: #0f172a; font-size: 13px; }
      .sb-consent-mode span { display: block; margin-top: 5px; color: #64748b; font-size: 11px; line-height: 1.5; }
      .sb-consent-links { margin: 16px 0 0; color: #64748b; font-size: 12px; line-height: 1.6; }
      .sb-consent-links a { color: #1d4ed8; font-weight: 800; text-decoration: underline; text-underline-offset: 3px; }
      .sb-consent-update { margin-bottom: 14px; border: 1px solid #bfdbfe; border-radius: 18px; background: #eff6ff; padding: 15px 17px; color: #1e3a8a; }
      .sb-consent-update strong { display: block; font-size: 13px; }
      .sb-consent-update ul { display: grid; gap: 5px; margin: 9px 0 0; padding-left: 18px; color: #475569; font-size: 11px; line-height: 1.45; }
      .sb-consent-actions { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 22px; }
      .sb-consent-button { position: relative; min-height: 76px; border-radius: 15px; padding: 13px 12px; font-size: 13px; font-weight: 900; cursor: pointer; transition: transform .18s ease, box-shadow .18s ease, background .18s ease; }
      .sb-consent-button:hover { transform: translateY(-1px); }
      .sb-consent-accept { border: 0; background: linear-gradient(135deg, #2563eb, #6d28d9); color: #fff; box-shadow: 0 12px 25px rgba(79, 70, 229, .24); }
      .sb-consent-essential { border: 1px solid #93c5fd; background: #eff6ff; color: #1e3a8a; }
      .sb-consent-decline { border: 1px solid #cbd5e1; background: #fff; color: #334155; }
      .sb-consent-button span { display: block; }
      .sb-consent-button small { display: block; margin-top: 4px; font-size: 10px; font-weight: 700; line-height: 1.35; opacity: .78; }
      .sb-consent-preferred { position: absolute; top: -9px; right: 10px; border: 2px solid #fff; border-radius: 999px; background: #fef3c7; padding: 3px 7px; color: #92400e; font-size: 8px; font-weight: 950; letter-spacing: .08em; text-transform: uppercase; box-shadow: 0 4px 10px rgba(120, 53, 15, .12); }
      #sb-limited-consent-banner { position: fixed; z-index: 2147483645; right: 0; bottom: 0; left: 0; display: flex; align-items: center; justify-content: center; gap: 18px; border-top: 1px solid #fbbf24; background: #fffbeb; padding: 14px 20px; color: #78350f; box-shadow: 0 -12px 40px rgba(120, 53, 15, .16); }
      #sb-limited-consent-banner p { max-width: 820px; margin: 0; font-size: 13px; font-weight: 700; line-height: 1.5; }
      #sb-limited-consent-banner button { flex: none; border: 0; border-radius: 12px; background: #92400e; padding: 10px 15px; color: #fff; font-size: 12px; font-weight: 900; cursor: pointer; }
      @media (max-width: 620px) { .sb-consent-head, .sb-consent-body { padding: 22px; } .sb-consent-modes, .sb-consent-actions { grid-template-columns: 1fr; } #sb-limited-consent-banner { align-items: stretch; flex-direction: column; gap: 8px; } }
    `;
    document.head.appendChild(style);
  }

  function showLimitedBanner() {
    styleMarkup();
    if (document.getElementById("sb-limited-consent-banner")) return;
    const banner = document.createElement("aside");
    banner.id = "sb-limited-consent-banner";
    banner.setAttribute("aria-label", "Limited functionality notice");
    banner.innerHTML = `<p><strong>Limited functionality:</strong> consent has not been given. Account login, protected resources, social features, reports, external embeds and analytics remain disabled.</p><button type="button">Review choice</button>`;
    banner.querySelector("button").addEventListener("click", () => buildModal(true));
    document.body.appendChild(banner);
  }

  function clearLocalAccountData() {
    if (typeof window.StudyBaseClearLocalAccountData === "function") {
      window.StudyBaseClearLocalAccountData();
      return;
    }
    try {
      Object.keys(localStorage)
        .filter(key => ACCOUNT_LOCAL_KEYS.includes(key) || key.startsWith("sb_weekly_feedback_completed_"))
        .forEach(key => localStorage.removeItem(key));
    } catch (_) {
      ACCOUNT_LOCAL_KEYS.forEach(key => {
        try { localStorage.removeItem(key); } catch (_) {}
      });
    }
    ACCOUNT_LOCAL_KEYS.forEach(key => {
      try { sessionStorage.removeItem(key); } catch (_) {}
    });
  }

  function revokeServerSession() {
    const apiBase = window.StudyBaseServices?.API_BASE || "https://api.platformbase.online/api";
    try {
      return fetch(`${apiBase}/logout`, {
        method: "POST",
        credentials: "include",
        keepalive: true,
        headers: { "Content-Type": "application/json" },
        body: "{}"
      }).catch(() => null);
    } catch (_) {
      return Promise.resolve(null);
    }
  }

  function acceptConsent(analytics) {
    const allowAnalytics = analytics === true;
    const decidedAt = new Date().toISOString();
    const choice = { version: CONSENT_VERSION, service: "accepted", analytics: allowAnalytics, selection: allowAnalytics ? "all" : "essential", decidedAt };
    const uid = localStorage.getItem("consent_uid") || `uid_${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem("consent_uid", uid);
    localStorage.setItem(CHOICE_KEY, JSON.stringify(choice));
    localStorage.setItem(LEGACY_KEY, "true");
    localStorage.setItem(ANALYTICS_KEY, String(allowAnalytics));
    localStorage.setItem(PENDING_LOG_KEY, JSON.stringify({
      userId: uid,
      consent: CONSENT_VERSION,
      service: "accepted",
      analytics: allowAnalytics,
      selection: choice.selection,
      decidedAt,
      page: window.location.href,
      userAgent: navigator.userAgent
    }));
    removeModal();
    document.getElementById("sb-limited-consent-banner")?.remove();
    window.dispatchEvent(new CustomEvent("studybase:consent-accepted", { detail: choice }));
  }

  function declineConsent() {
    if (declineInProgress) return;
    declineInProgress = true;
    const choice = { version: CONSENT_VERSION, service: "declined", analytics: false, selection: "deny", decidedAt: new Date().toISOString() };
    localStorage.setItem(CHOICE_KEY, JSON.stringify(choice));
    localStorage.setItem(LEGACY_KEY, "false");
    localStorage.setItem(ANALYTICS_KEY, "false");
    clearLocalAccountData();
    window.dispatchEvent(new CustomEvent("studybase:account-session-cleared", { detail: { reason: "consent-declined" } }));
    removeModal();
    document.documentElement.classList.add("sb-consent-limited");
    showLimitedBanner();
    Promise.race([
      revokeServerSession(),
      new Promise(resolve => window.setTimeout(resolve, 1500))
    ]).finally(() => window.location.reload());
  }

  function buildModal(force = false) {
    styleMarkup();
    if (document.getElementById("sb-consent-modal")) return;
    const existing = readChoice();
    const previous = readStoredChoice();
    if (!force && existing?.service === "accepted") return;
    const showUpdate = Boolean(PRIVACY_CONFIG.showUpdateNotice && previous && previous.version !== CONSENT_VERSION);
    const modalTitle = showUpdate ? (PRIVACY_CONFIG.updateTitle || "We've updated our Privacy Notice") : "Choose your StudyBase experience";
    const modalCopy = showUpdate
      ? (PRIVACY_CONFIG.updateMessage || "Please review the updated privacy choices before continuing.")
      : "You have a genuine choice. Enabling StudyBase lets this page contact account and security services for login, protected resources, friends and reports. Limited mode keeps public static pages available where possible and blocks those connections, external embeds and analytics.";
    const updateItems = Array.isArray(PRIVACY_CONFIG.updateChanges) ? PRIVACY_CONFIG.updateChanges : [];
    const updateMarkup = showUpdate ? `<div class="sb-consent-update"><strong>What changed</strong><ul>${updateItems.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>` : "";
    const modal = document.createElement("div");
    modal.id = "sb-consent-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "sb-consent-title");
    modal.innerHTML = `
      <div class="sb-consent-backdrop"></div>
      <section class="sb-consent-card">
        <div class="sb-consent-head">
          <div class="sb-consent-brand"><span class="sb-consent-brand-icon">SB</span><span class="sb-consent-brand-copy">StudyBase privacy controls</span></div>
          <h2 id="sb-consent-title" class="sb-consent-title">${escapeHtml(modalTitle)}</h2>
          <p class="sb-consent-copy">${escapeHtml(modalCopy)}</p>
        </div>
        <div class="sb-consent-body">
          ${updateMarkup}
          <div class="sb-consent-modes" aria-hidden="true">
            <div class="sb-consent-mode"><strong>Limited mode</strong><span>Public static pages only. Choosing this signs you out and clears local account data from this browser.</span></div>
            <div class="sb-consent-mode sb-consent-mode-full"><strong>StudyBase enabled</strong><span>Accounts, protected resources, friends, reports and required security services become available.</span></div>
          </div>
          <p class="sb-consent-links">Accept all enables essential services and optional analytics. Essential only enables account and security services without analytics. Deny signs you out, clears account-related local data, and keeps limited mode. Enabling StudyBase means you agree to the <a href="${TERMS_URL}" target="_blank" rel="noopener">Terms and Conditions</a> and acknowledge the <a href="${PRIVACY_URL}" target="_blank" rel="noopener">Privacy Notice</a>.</p>
          <div class="sb-consent-actions">
            <button id="sb-consent-accept-all" class="sb-consent-button sb-consent-accept" type="button"><span class="sb-consent-preferred">Preferred</span><span>Accept all</span><small>Essential services and analytics</small></button>
            <button id="sb-consent-essential" class="sb-consent-button sb-consent-essential" type="button"><span>Essential only</span><small>No optional analytics</small></button>
            <button id="sb-consent-decline" class="sb-consent-button sb-consent-decline" type="button"><span>Deny</span><small>Sign out, clear account data and use limited mode</small></button>
          </div>
        </div>
      </section>`;
    document.body.appendChild(modal);
    document.documentElement.classList.add("sb-consent-pending");
    document.getElementById("sb-consent-decline").addEventListener("click", declineConsent);
    document.getElementById("sb-consent-essential").addEventListener("click", () => acceptConsent(false));
    document.getElementById("sb-consent-accept-all").addEventListener("click", () => acceptConsent(true));
  }

  function guardLimitedInteractions() {
    document.addEventListener("submit", event => {
      if (!window.StudyBaseConsentState?.serviceAllowed && !event.target.closest("#sb-consent-modal")) {
        event.preventDefault();
        buildModal(true);
      }
    }, true);
    document.addEventListener("click", event => {
      if (window.StudyBaseConsentState?.serviceAllowed) return;
      const link = event.target.closest?.("a[href]");
      if (!link) return;
      let target;
      try { target = new URL(link.href, location.href); } catch (_) { return; }
      const protectedTarget = target.pathname.startsWith("/myaccount/") || target.pathname.startsWith("/r/material.html") || target.hostname.endsWith("platformbase.online") || target.hostname.startsWith("subscription.");
      if (!protectedTarget) return;
      event.preventDefault();
      buildModal(true);
    }, true);
  }

  function initConsent() {
    if (!document.body) {
      document.addEventListener("DOMContentLoaded", initConsent, { once: true });
      return;
    }
    styleMarkup();
    guardLimitedInteractions();
    const choice = readChoice();
    if (choice?.service === "accepted") {
      removeModal();
      document.getElementById("sb-limited-consent-banner")?.remove();
      return;
    }
    showLimitedBanner();
    const policyReview = location.pathname.startsWith("/legal/") && new URLSearchParams(location.search).get("consentReview") === "1";
    if (!choice && !policyReview) buildModal();
  }

  window.StudyBaseConsent = Object.freeze({
    init: initConsent,
    open: () => buildModal(true),
    acceptAll: () => acceptConsent(true),
    essentialOnly: () => acceptConsent(false),
    decline: declineConsent,
    choice: readChoice
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initConsent, { once: true });
  else initConsent();
})();
