(function () {
  "use strict";

  if (window.__SB_CONSENT_BOOTSTRAPPED__) return;
  window.__SB_CONSENT_BOOTSTRAPPED__ = true;

  const deviceGuard = document.createElement("script");
  deviceGuard.src = "/assets/js/core/deviceAccess.js?v=20260712";
  deviceGuard.defer = true;
  document.head.appendChild(deviceGuard);

  const CHOICE_KEY = "studybase_consent_choice";
  const LEGACY_KEY = "site_consent_granted";
  const ANALYTICS_KEY = "site_consent_analytics";
  const PRIVACY_CONFIG = window.StudyBasePrivacyConfig || {};
  const CONSENT_VERSION = PRIVACY_CONFIG.noticeVersion || "STUDYBASE_PRIVACY_FALLBACK";
  const GOOGLE_TAG_ID = PRIVACY_CONFIG.googleTagId || "G-N7LHC0S1T1";

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

  const choice = readChoice();
  const analyticsAllowed = choice?.analytics === true;
  window.StudyBaseConsentState = Object.freeze({
    choice: choice ? (analyticsAllowed ? "all" : "necessary") : "pending",
    serviceAllowed: true,
    analyticsAllowed,
    version: CONSENT_VERSION,
    requiresReview: !choice
  });

  function loadAnalytics() {
    if (!analyticsAllowed || document.querySelector('script[data-sb-google-analytics="true"]')) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag("consent", "default", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "granted",
      functionality_storage: "denied",
      personalization_storage: "denied",
      security_storage: "granted"
    });
    window.gtag("js", new Date());
    window.gtag("config", GOOGLE_TAG_ID, {
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GOOGLE_TAG_ID)}`;
    script.dataset.sbGoogleAnalytics = "true";
    document.head.appendChild(script);
  }

  loadAnalytics();

  function initialiseConsent() {
    if (window.StudyBaseConsent?.init) {
      window.StudyBaseConsent.init();
      return true;
    }
    return false;
  }

  window.StudyBaseOpenCookieSettings = function () {
    if (window.StudyBaseConsent?.open) {
      window.StudyBaseConsent.open();
      return;
    }
    const recoveryLoader = document.createElement("script");
    recoveryLoader.src = "/assets/js/privacy/cookieConsent.js?v=20260714b";
    recoveryLoader.async = false;
    recoveryLoader.addEventListener("load", () => window.StudyBaseConsent?.open(), { once: true });
    document.head.appendChild(recoveryLoader);
  };

  if (!initialiseConsent()) {
    if (document.readyState === "loading") {
      document.write('<script src="/assets/js/privacy/cookieConsent.js?v=20260714b" data-sb-consent-loader="true"><\/script>');
    } else {
      const loader = document.createElement("script");
      loader.src = "/assets/js/privacy/cookieConsent.js?v=20260714b";
      loader.async = false;
      loader.dataset.sbConsentLoader = "true";
      loader.addEventListener("load", initialiseConsent, { once: true });
      document.head.appendChild(loader);
    }
  }

  // Keep old feature checks working while consent is migrated away from service access.
  try {
    localStorage.setItem(LEGACY_KEY, "true");
    localStorage.setItem(ANALYTICS_KEY, String(analyticsAllowed));
    localStorage.removeItem("studybase_consent_log_pending");
    localStorage.removeItem("consent_uid");
  } catch (_) {}
})();
