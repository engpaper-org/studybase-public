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
  const CONSENT_VERSION = "STUDYBASE_CONSENT_2026_07";
  const PRIVACY_URL = "/legal/privacy.html?consentReview=1";
  const TERMS_URL = "/legal/tos.html?consentReview=1";

  function readChoice() {
    try {
      const value = JSON.parse(localStorage.getItem(CHOICE_KEY) || "null");
      return value?.version === CONSENT_VERSION && ["accepted", "declined"].includes(value.service) ? value : null;
    } catch (_) {
      return null;
    }
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
      .sb-consent-card { position: relative; width: min(680px, 100%); max-height: calc(100vh - 36px); overflow-y: auto; border: 1px solid #dbeafe; border-radius: 28px; background: #fff; color: #0f172a; box-shadow: 0 40px 120px rgba(2, 6, 23, .48); }
      .sb-consent-head { padding: 28px 30px 24px; background: linear-gradient(135deg, #eff6ff, #fff 54%, #f5f3ff); }
      .sb-consent-kicker { margin: 0; color: #2563eb; font-size: 11px; font-weight: 900; letter-spacing: .2em; text-transform: uppercase; }
      .sb-consent-title { margin: 10px 0 0; font-size: clamp(28px, 5vw, 42px); line-height: 1.04; font-weight: 950; letter-spacing: -.04em; }
      .sb-consent-copy { margin: 14px 0 0; color: #475569; font-size: 14px; line-height: 1.7; }
      .sb-consent-body { padding: 24px 30px 30px; }
      .sb-consent-choice { display: flex; gap: 12px; padding: 15px; border: 1px solid #dbeafe; border-radius: 17px; background: #f8fafc; color: #334155; font-size: 13px; line-height: 1.55; }
      .sb-consent-choice input { width: 19px; height: 19px; margin: 1px 0 0; accent-color: #2563eb; }
      .sb-consent-links { margin: 16px 0 0; color: #64748b; font-size: 12px; line-height: 1.6; }
      .sb-consent-links a { color: #1d4ed8; font-weight: 800; text-decoration: underline; text-underline-offset: 3px; }
      .sb-consent-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 22px; }
      .sb-consent-button { min-height: 48px; border-radius: 14px; padding: 12px 15px; font-size: 13px; font-weight: 900; cursor: pointer; }
      .sb-consent-accept { border: 0; background: #2563eb; color: #fff; }
      .sb-consent-decline { border: 1px solid #cbd5e1; background: #fff; color: #334155; }
      #sb-limited-consent-banner { position: fixed; z-index: 2147483645; right: 0; bottom: 0; left: 0; display: flex; align-items: center; justify-content: center; gap: 18px; border-top: 1px solid #fbbf24; background: #fffbeb; padding: 14px 20px; color: #78350f; box-shadow: 0 -12px 40px rgba(120, 53, 15, .16); }
      #sb-limited-consent-banner p { max-width: 820px; margin: 0; font-size: 13px; font-weight: 700; line-height: 1.5; }
      #sb-limited-consent-banner button { flex: none; border: 0; border-radius: 12px; background: #92400e; padding: 10px 15px; color: #fff; font-size: 12px; font-weight: 900; cursor: pointer; }
      @media (max-width: 620px) { .sb-consent-head, .sb-consent-body { padding: 22px; } .sb-consent-actions { grid-template-columns: 1fr; } #sb-limited-consent-banner { align-items: stretch; flex-direction: column; gap: 8px; } }
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

  function acceptConsent() {
    const analytics = document.getElementById("sb-consent-analytics")?.checked === true;
    const decidedAt = new Date().toISOString();
    const choice = { version: CONSENT_VERSION, service: "accepted", analytics, decidedAt };
    const uid = localStorage.getItem("consent_uid") || `uid_${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem("consent_uid", uid);
    localStorage.setItem(CHOICE_KEY, JSON.stringify(choice));
    localStorage.setItem(LEGACY_KEY, "true");
    localStorage.setItem(ANALYTICS_KEY, String(analytics));
    localStorage.setItem(PENDING_LOG_KEY, JSON.stringify({
      userId: uid,
      consent: CONSENT_VERSION,
      service: "accepted",
      analytics,
      decidedAt,
      page: window.location.href,
      userAgent: navigator.userAgent
    }));
    removeModal();
    document.getElementById("sb-limited-consent-banner")?.remove();
    window.dispatchEvent(new CustomEvent("studybase:consent-accepted", { detail: choice }));
  }

  function declineConsent() {
    const choice = { version: CONSENT_VERSION, service: "declined", analytics: false, decidedAt: new Date().toISOString() };
    localStorage.setItem(CHOICE_KEY, JSON.stringify(choice));
    localStorage.setItem(LEGACY_KEY, "false");
    localStorage.setItem(ANALYTICS_KEY, "false");
    ["studybase_session_active", "studybase_session_expiry", "studybase_user", "get_help_data"].forEach(key => localStorage.removeItem(key));
    removeModal();
    document.documentElement.classList.add("sb-consent-limited");
    showLimitedBanner();
    window.setTimeout(() => window.location.reload(), 50);
  }

  function buildModal(force = false) {
    styleMarkup();
    if (document.getElementById("sb-consent-modal")) return;
    const existing = readChoice();
    if (!force && existing?.service === "accepted") return;
    const modal = document.createElement("div");
    modal.id = "sb-consent-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "sb-consent-title");
    modal.innerHTML = `
      <div class="sb-consent-backdrop"></div>
      <section class="sb-consent-card">
        <div class="sb-consent-head">
          <p class="sb-consent-kicker">Privacy and service choice</p>
          <h2 id="sb-consent-title" class="sb-consent-title">Choose your StudyBase experience</h2>
          <p class="sb-consent-copy">You have a genuine choice. Enabling StudyBase lets this page contact account and security services for login, protected resources, friends and reports. Limited mode keeps public static pages available where possible and blocks those connections, external embeds and analytics.</p>
        </div>
        <div class="sb-consent-body">
          <label class="sb-consent-choice"><input id="sb-consent-analytics" type="checkbox"><span><strong>Allow optional Google Analytics</strong><br>Share page-view and browser interaction statistics with Google to help improve StudyBase. This is optional and is off unless you select it.</span></label>
          <p class="sb-consent-links">By enabling StudyBase you agree to the <a href="${TERMS_URL}" target="_blank" rel="noopener">Terms and Conditions</a> and acknowledge the <a href="${PRIVACY_URL}" target="_blank" rel="noopener">Privacy Notice</a>. You can choose limited mode instead, or change this decision later from the Privacy Centre or permanent limited-mode banner.</p>
          <div class="sb-consent-actions">
            <button id="sb-consent-decline" class="sb-consent-button sb-consent-decline" type="button">Use limited version</button>
            <button id="sb-consent-accept" class="sb-consent-button sb-consent-accept" type="button">Accept and enable StudyBase</button>
          </div>
        </div>
      </section>`;
    document.body.appendChild(modal);
    document.documentElement.classList.add("sb-consent-pending");
    document.getElementById("sb-consent-analytics").checked = existing?.analytics === true;
    document.getElementById("sb-consent-decline").addEventListener("click", declineConsent);
    document.getElementById("sb-consent-accept").addEventListener("click", acceptConsent);
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
    accept: acceptConsent,
    decline: declineConsent,
    choice: readChoice
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initConsent, { once: true });
  else initConsent();
})();
