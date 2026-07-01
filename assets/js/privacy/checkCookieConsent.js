(function () {
  "use strict";

  if (window.__SB_CONSENT_BOOTSTRAPPED__) return;
  window.__SB_CONSENT_BOOTSTRAPPED__ = true;

  const CHOICE_KEY = "studybase_consent_choice";
  const LEGACY_KEY = "site_consent_granted";
  const ANALYTICS_KEY = "site_consent_analytics";
  const PENDING_LOG_KEY = "studybase_consent_log_pending";
  const PRIVACY_CONFIG = window.StudyBasePrivacyConfig || {};
  const CONSENT_VERSION = PRIVACY_CONFIG.noticeVersion || "STUDYBASE_PRIVACY_FALLBACK";
  const GOOGLE_TAG_ID = PRIVACY_CONFIG.googleTagId || "G-N7LHC0S1T1";
  const LOG_URL = PRIVACY_CONFIG.consentLogUrl || "";

  function readStoredChoice() {
    try {
      const parsed = JSON.parse(localStorage.getItem(CHOICE_KEY) || "null");
      if (parsed && ["accepted", "declined"].includes(parsed.service)) return parsed;
    } catch (_) {}
    return null;
  }

  const storedChoice = readStoredChoice();
  const choice = storedChoice?.version === CONSENT_VERSION ? storedChoice : null;
  const serviceAllowed = choice?.service === "accepted";
  const analyticsAllowed = serviceAllowed && choice?.analytics === true;
  window.StudyBaseConsentState = Object.freeze({
    choice: choice?.service || "pending",
    serviceAllowed,
    analyticsAllowed,
    version: choice?.version || CONSENT_VERSION,
    previousVersion: storedChoice?.version || null,
    requiresReview: Boolean(storedChoice && !choice)
  });

  function queueAgreementLog() {
    if (!serviceAllowed || !LOG_URL || window.__SB_CONSENT_LOG_SENDING__) return;
    let payload = null;
    try { payload = JSON.parse(localStorage.getItem(PENDING_LOG_KEY) || "null"); } catch (_) {}
    if (!payload) return;
    window.__SB_CONSENT_LOG_SENDING__ = true;
    try {
      fetch(LOG_URL, {
        method: "POST",
        mode: "no-cors",
        keepalive: true,
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body: JSON.stringify(payload)
      }).then(() => {
        try { localStorage.removeItem(PENDING_LOG_KEY); } catch (_) {}
      }).catch(() => {
        window.__SB_CONSENT_LOG_SENDING__ = false;
      });
    } catch (_) {
      window.__SB_CONSENT_LOG_SENDING__ = false;
    }
  }

  function loadAnalytics() {
    if (!analyticsAllowed || document.querySelector('script[data-sb-google-analytics="true"]')) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag("consent", "default", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "granted"
    });
    window.gtag("js", new Date());
    window.gtag("config", GOOGLE_TAG_ID, { anonymize_ip: true });
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GOOGLE_TAG_ID)}`;
    script.dataset.sbGoogleAnalytics = "true";
    document.head.appendChild(script);
  }

  function addLimitedCsp() {
    if (document.querySelector('meta[data-sb-limited-csp="true"]')) return;
    const meta = document.createElement("meta");
    meta.httpEquiv = "Content-Security-Policy";
    meta.dataset.sbLimitedCsp = "true";
    meta.content = "default-src 'self' data: blob:; connect-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; frame-src 'none'; media-src 'self' blob:; object-src 'none'; form-action 'none'; base-uri 'self'";
    document.head.prepend(meta);
  }

  function blockNetwork() {
    if (window.__SB_CONSENT_NATIVE__) return;
    const native = {
      fetch: window.fetch?.bind(window),
      xhrOpen: window.XMLHttpRequest?.prototype.open,
      xhrSend: window.XMLHttpRequest?.prototype.send,
      sendBeacon: navigator.sendBeacon?.bind(navigator),
      WebSocket: window.WebSocket,
      EventSource: window.EventSource
    };
    window.__SB_CONSENT_NATIVE__ = native;
    const denied = () => new DOMException("Full StudyBase consent is required for network features.", "NotAllowedError");
    if (native.fetch) window.fetch = () => Promise.reject(denied());
    if (window.XMLHttpRequest && native.xhrOpen && native.xhrSend) {
      window.XMLHttpRequest.prototype.open = function (...args) { this.__sbConsentRequest = args; return native.xhrOpen.apply(this, args); };
      window.XMLHttpRequest.prototype.send = function () { throw denied(); };
    }
    try { navigator.sendBeacon = () => false; } catch (_) {}
    if (native.WebSocket) window.WebSocket = function () { throw denied(); };
    if (native.EventSource) window.EventSource = function () { throw denied(); };
  }

  function clearAccountDisplayState() {
    [
      "studybase_session_active",
      "studybase_session_expiry",
      "studybase_user",
      "get_help_data"
    ].forEach(key => {
      try { localStorage.removeItem(key); } catch (_) {}
    });
  }

  function installLimitedStyles() {
    document.documentElement.classList.add("sb-consent-limited");
    const style = document.createElement("style");
    style.id = "sb-consent-limited-style";
    style.textContent = `
      html.sb-consent-pending, html.sb-consent-pending body { overflow: hidden !important; }
      html.sb-consent-limited [data-sbx-login],
      html.sb-consent-limited [data-sbx-account],
      html.sb-consent-limited [data-sbx-signout],
      html.sb-consent-limited .sbx-nav-auth,
      html.sb-consent-limited #login,
      html.sb-consent-limited #login-submit { display: none !important; }
      body { padding-bottom: 92px; }
    `;
    document.head.appendChild(style);
  }

  if (serviceAllowed) {
    queueAgreementLog();
    loadAnalytics();
  } else {
    document.documentElement.classList.add("sb-consent-pending");
    addLimitedCsp();
    blockNetwork();
    clearAccountDisplayState();
    installLimitedStyles();
  }

  function initialiseConsent() {
    if (window.StudyBaseConsent?.init) {
      window.StudyBaseConsent.init();
      return true;
    }
    return false;
  }

  if (!initialiseConsent()) {
    const loader = document.createElement("script");
    loader.src = "/assets/js/privacy/cookieConsent.js";
    loader.defer = true;
    loader.dataset.sbConsentLoader = "true";
    loader.addEventListener("load", initialiseConsent, { once: true });
    document.head.appendChild(loader);
  }

  window.addEventListener("studybase:consent-accepted", () => window.location.reload());
})();
