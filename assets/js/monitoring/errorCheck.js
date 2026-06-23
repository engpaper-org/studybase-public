(function () {
  const ERROR_MAP = {

    // =========================
    // Standard HTTP Errors
    // =========================

    "401": {
      title: "Authentication Required (401)",
      message: "You must be signed in to access this resource.",
      icon: "🔐"
    },

    "403": {
      title: "Access Forbidden (403)",
      message: "You do not have permission to access this resource.",
      icon: "⛔"
    },

    "404": {
      title: "Resource Not Found (404)",
      message: "The requested page could not be found or may have been moved.",
      icon: "🧭"
    },

    "429": {
      title: "Rate Limit Exceeded (429)",
      message: "Too many requests detected. Please slow down and try again shortly.",
      icon: "⏳"
    },

    "500": {
      title: "Internal Server Error (500)",
      message: "An unexpected server error occurred. Please try again later.",
      icon: "🛠️"
    },

    "502": {
      title: "Bad Gateway (502)",
      message: "The upstream server returned an invalid response.",
      icon: "🌉"
    },

    "503": {
      title: "Service Unavailable (503)",
      message: "The service is temporarily unavailable due to maintenance or overload.",
      icon: "🧰"
    },

    // =========================
    // AUTH – Authentication Layer
    // =========================

    "MAINTENANCE_MODE": {
      title: "StudyBase is in maintenance mode",
      message: "Service is temporarily unavailable.",
      icon: "i",
      compact: true
    },

    "AUTH_001": {
      title: "AUTH_001 :: Not Signed In",
      message: "Authentication is required to continue.",
      icon: "🔐"
    },

    "AUTH_002": {
      title: "AUTH_002 :: Token Invalid",
      message: "Your authentication token is invalid or malformed.",
      icon: "🧾"
    },

    "AUTH_003": {
      title: "AUTH_003 :: Signature Verification Failed",
      message: "Token signature validation failed.",
      icon: "🧬"
    },

    "AUTH_004": {
      title: "AUTH_004 :: Session Expired",
      message: "Your session has expired. Please sign in again.",
      icon: "⌛"
    },

    "AUTH_005": {
      title: "AUTH_005 :: Device Unverified",
      message: "This device has not been verified for access.",
      icon: "📱"
    },

    "AUTH_006": {
      title: "AUTH_006 :: Session State Invalid",
      message: "Stored session data appears corrupted or invalid.",
      icon: "⚠️"
    },

    // =========================
    // SEC – Security Layer
    // =========================

    "SEC_001": {
      title: "SEC_001 :: Access Forbidden",
      message: "Access to this resource has been explicitly denied.",
      icon: "🛑"
    },

    "SEC_002": {
      title: "SEC_002 :: Origin Mismatch",
      message: "This page was opened from an unauthorised origin.",
      icon: "🌍"
    },

    "SEC_003": {
      title: "SEC_003 :: Invalid Referer",
      message: "This page must be accessed from the main application.",
      icon: "🔎"
    },

    "SEC_004": {
      title: "SEC_004 :: Suspicious Activity Detected",
      message: "Unusual activity has been detected and access has been restricted.",
      icon: "🚨"
    },

    "SEC_005": {
      title: "SEC_005 :: CSP Violation",
      message: "This action was blocked by Content Security Policy.",
      icon: "🛡️"
    },

    "SEC_006": {
      title: "SEC_006 :: CORS Blocked",
      message: "This request was blocked due to cross-origin restrictions.",
      icon: "🌐"
    },

    "SEC_007": {
      title: "SEC_007 :: Direct Access Blocked",
      message: "Materials cannot be accessed directly. Please navigate through the app interface.",
      icon: "📦"
    },

    "SEC_008": {
      title: "SEC_008 :: Frame Context Required",
      message: "This page must be opened inside the StudyBase application frame.",
      icon: "🧩"
    },

    // =========================
    // NAV – Navigation Layer
    // =========================

    "NAV_001": {
      title: "NAV_001 :: Invalid Route",
      message: "The requested route is not valid.",
      icon: "🗺️"
    },

    "NAV_002": {
      title: "NAV_002 :: Subject Missing",
      message: "No subject has been selected.",
      icon: "📘"
    },

    "NAV_003": {
      title: "NAV_003 :: Type Missing",
      message: "No resource type has been selected.",
      icon: "📂"
    },

    "NAV_004": {
      title: "NAV_004 :: Invalid Subject",
      message: "The selected subject is not recognised.",
      icon: "❓"
    },

    "NAV_005": {
      title: "NAV_005 :: Invalid Type",
      message: "The selected resource type is not recognised.",
      icon: "❓"
    },

    "NAV_006": {
      title: "NAV_006 :: Subject/Type Mismatch",
      message: "This resource type is not available for the selected subject.",
      icon: "🔀"
    },

    // =========================
    // SYS – System / Backend
    // =========================

    "SYS_001": {
      title: "SYS_001 :: Worker Exception",
      message: "An unexpected edge worker exception occurred.",
      icon: "⚙️"
    },

    "SYS_002": {
      title: "SYS_002 :: Storage Unavailable",
      message: "The storage service is currently unavailable.",
      icon: "🗄️"
    },

    "SYS_003": {
      title: "SYS_003 :: Binding Not Configured",
      message: "A required backend binding is not configured.",
      icon: "🔌"
    },

    "SYS_004": {
      title: "SYS_004 :: Configuration Corrupted",
      message: "A configuration file failed validation.",
      icon: "📄"
    },

    // =========================
    // NET – Network Layer
    // =========================

    "NET_001": {
      title: "NET_001 :: Request Timeout",
      message: "The request took too long to complete.",
      icon: "📡"
    },

    "NET_002": {
      title: "NET_002 :: DNS Resolution Failed",
      message: "The requested domain could not be resolved.",
      icon: "🌐"
    },

    "NET_003": {
      title: "NET_003 :: API Offline",
      message: "The backend API is currently unreachable.",
      icon: "🧯"
    },

    // =========================
    // ENV – Environment
    // =========================

    "ENV_001": {
      title: "ENV_001 :: Unsupported Browser",
      message: "Your browser is not supported by this application.",
      icon: "🖥️"
    },

    "ENV_002": {
      title: "ENV_002 :: Cookies Disabled",
      message: "Cookies must be enabled to use this site.",
      icon: "🍪"
    },

    "ENV_003": {
      title: "ENV_003 :: Local Storage Blocked",
      message: "Local storage is unavailable or disabled.",
      icon: "💾"
    },

    "ENV_008": {
      title: "ENV_008 :: JavaScript Required",
      message: "JavaScript must be enabled to use this application.",
      icon: "⚡"
    },

    "ENV_009": {
      title: "ENV_009 :: Chrome Required",
      message: "This application currently requires Google Chrome.",
      icon: "🌐"
    },

    "ENV_005": {
      title: "ENV_005 :: Restricted Environment",
      message: "Your browser environment is restricted (private mode or limited storage).",
      icon: "🔒"
    },

    "ENV_403_OS": {
      title: "Restricted Device Type",
      message: "StudyBase no longer supports this device type. This helps keep your account secure and gives you the best experience on the site.",
      icon: "🔒",
      buttonText: "More information",
      buttonUrl: "/support/info/restricted_device_type.html"
    },

    "ENV_403_PX": {
      title: "Restricted Device Type",
      message: "StudyBase no longer supports this screen size. This helps keep your account secure and gives you the best experience on the site.",
      icon: "🔒",
      buttonText: "More information",
      buttonUrl: "/support/info/restricted_device_type.html"
    },

    "ENV_403_LOC": {
      title: "This content is GeoBlocked",
      message: "Your current location is not supported. This helps keep StudyBase secure and available for supported regions.",
      icon: "🔒",
      buttonText: "More information",
      buttonUrl: "/support/info/geoblock.html"
    },
    "ENV_403_LOC": {
      title: "Location collection blocked",
      message: "StudyBase needs a one-time location check to continue. The check happens locally, your location is not sent to our servers, and only a true or false result is stored on your device.",
      icon: "🔒",
      buttonText: "More information",
      buttonUrl: "/support/info/geoblock.html"
    },
    "ENV_403_TIME": {
      title: "Site access is unavailable",
      message: "This access check is no longer used. Please refresh the page and try again.",
      icon: "🔒",
      buttonText: "More information",
      buttonUrl: "/support/info/time.html"
    },

    // =========================
    // EXP – Experimental
    // =========================

    "EXP_001": {
      title: "EXP_001 :: Prototype Mode",
      message: "This feature is currently in prototype mode.",
      icon: "🧪"
    },

    "EXP_002": {
      title: "EXP_002 :: Beta Access Required",
      message: "This feature is restricted to beta users.",
      icon: "🔬"
    }
  };

  function hasErrorParam() {
    const url = new URL(window.location.href);
    return url.searchParams.has("error");
  }

  function getErrorParam() {
    const url = new URL(window.location.href);
    return (url.searchParams.get("error") || "").trim();
  }

  function removeErrorParamAndReload() {
    const url = new URL(window.location.href);
    url.searchParams.delete("error");
    window.history.replaceState({}, "", url.toString());
    window.location.reload();
  }

  function removeErrorParamFromUrl() {
    const url = new URL(window.location.href);
    url.searchParams.delete("error");
    window.history.replaceState({}, "", url.toString());
  }

  function ensureErrorStyles() {
    if (document.getElementById("sb-err-styles")) return;

    const style = document.createElement("style");
    style.id = "sb-err-styles";
    style.textContent = `
      #sb-err-overlay {
        --sb-error-accent: #dc2626;
        --sb-error-soft: rgba(220, 38, 38, 0.1);
        --sb-error-border: rgba(220, 38, 38, 0.24);
        position: fixed;
        inset: 0;
        z-index: 2147483000;
        display: grid;
        place-items: center;
        padding: clamp(16px, 4vw, 32px);
        background:
          radial-gradient(circle at 50% 12%, rgba(255, 255, 255, 0.26), transparent 28%),
          rgba(15, 23, 42, 0.66);
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
        opacity: 1;
        transition: opacity 220ms ease;
      }

      #sb-err-overlay.is-hidden {
        opacity: 0;
      }

      #sb-err-card {
        position: relative;
        width: min(100%, 540px);
        overflow: hidden;
        border: 1px solid rgba(148, 163, 184, 0.22);
        border-radius: 28px;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.98));
        box-shadow:
          0 30px 90px rgba(15, 23, 42, 0.34),
          inset 0 1px 0 rgba(255, 255, 255, 0.85);
        color: #0f172a;
        transform: translateY(0) scale(1);
        opacity: 1;
        transition:
          transform 260ms cubic-bezier(0.16, 1, 0.3, 1),
          opacity 220ms ease;
      }

      #sb-err-card.is-hidden {
        transform: translateY(12px) scale(0.97);
        opacity: 0;
      }

      .sb-error-accent {
        position: absolute;
        inset: 0 0 auto 0;
        height: 6px;
        background: linear-gradient(90deg, var(--sb-error-accent), rgba(14, 165, 233, 0.72));
      }

      .sb-error-glow {
        position: absolute;
        top: -120px;
        right: -120px;
        width: 260px;
        height: 260px;
        border-radius: 999px;
        background: var(--sb-error-soft);
        pointer-events: none;
      }

      .sb-error-close {
        position: absolute;
        top: 16px;
        right: 16px;
        z-index: 2;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        height: 38px;
        border: 1px solid rgba(148, 163, 184, 0.24);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.8);
        color: #475569;
        font-size: 24px;
        line-height: 1;
        cursor: pointer;
        transition:
          transform 160ms ease,
          background-color 160ms ease,
          color 160ms ease,
          border-color 160ms ease;
      }

      .sb-error-close:hover {
        transform: translateY(-1px);
        background: #ffffff;
        color: #0f172a;
        border-color: rgba(100, 116, 139, 0.34);
      }

      .sb-error-body {
        position: relative;
        z-index: 1;
        padding: clamp(24px, 5vw, 36px);
      }

      .sb-error-header {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 16px;
        align-items: center;
        padding-right: 38px;
      }

      .sb-error-mark {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 54px;
        height: 54px;
        border: 1px solid var(--sb-error-border);
        border-radius: 18px;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(255, 255, 255, 0.56)),
          var(--sb-error-soft);
        color: var(--sb-error-accent);
        font-size: 28px;
        font-weight: 900;
        box-shadow: 0 14px 32px rgba(15, 23, 42, 0.1);
      }

      .sb-error-kicker {
        margin: 0 0 6px;
        color: #64748b;
        font-size: 0.76rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        line-height: 1.2;
        text-transform: uppercase;
      }

      #sb-err-title {
        margin: 0;
        color: #0f172a;
        font-size: clamp(1.35rem, 2vw, 1.75rem);
        font-weight: 900;
        letter-spacing: 0;
        line-height: 1.12;
      }

      #sb-err-message {
        margin: 22px 0 0;
        color: #475569;
        font-size: 1rem;
        line-height: 1.65;
      }

      .sb-error-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        align-items: center;
        margin-top: 22px;
        padding: 12px 14px;
        border: 1px solid rgba(148, 163, 184, 0.22);
        border-radius: 16px;
        background: rgba(248, 250, 252, 0.82);
      }

      .sb-error-meta span {
        color: #64748b;
        font-size: 0.82rem;
        font-weight: 800;
      }

      .sb-error-meta code {
        color: #0f172a;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        font-size: 0.86rem;
        font-weight: 800;
      }

      .sb-error-actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 28px;
      }

      .sb-error-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 44px;
        padding: 0.72rem 1rem;
        border-radius: 14px;
        font-size: 0.94rem;
        font-weight: 850;
        line-height: 1;
        text-decoration: none;
        cursor: pointer;
        transition:
          transform 160ms ease,
          border-color 160ms ease,
          background-color 160ms ease,
          box-shadow 160ms ease;
      }

      .sb-error-button:hover {
        transform: translateY(-1px);
      }

      .sb-error-button:active {
        transform: translateY(0) scale(0.98);
      }

      .sb-error-button:focus-visible,
      .sb-error-close:focus-visible {
        outline: 3px solid rgba(14, 165, 233, 0.28);
        outline-offset: 3px;
      }

      .sb-error-button-secondary {
        border: 1px solid rgba(148, 163, 184, 0.34);
        background: rgba(255, 255, 255, 0.82);
        color: #0f172a;
      }

      .sb-error-button-secondary:hover {
        background: #ffffff;
        border-color: rgba(100, 116, 139, 0.48);
      }

      .sb-error-button-primary {
        border: 1px solid transparent;
        background: #111827;
        color: #ffffff;
        box-shadow: 0 12px 28px rgba(15, 23, 42, 0.2);
      }

      .sb-error-button-primary:hover {
        background: #020617;
        box-shadow: 0 16px 34px rgba(15, 23, 42, 0.26);
      }

      :root.dark #sb-err-overlay {
        background:
          radial-gradient(circle at 50% 10%, rgba(14, 165, 233, 0.16), transparent 30%),
          rgba(2, 6, 23, 0.76);
      }

      :root.dark #sb-err-card {
        border-color: rgba(148, 163, 184, 0.18);
        background:
          linear-gradient(180deg, rgba(15, 23, 42, 0.98), rgba(2, 6, 23, 0.98));
        box-shadow:
          0 30px 90px rgba(0, 0, 0, 0.56),
          inset 0 1px 0 rgba(255, 255, 255, 0.05);
        color: #e2e8f0;
      }

      :root.dark .sb-error-close,
      :root.dark .sb-error-button-secondary {
        border-color: rgba(148, 163, 184, 0.18);
        background: rgba(15, 23, 42, 0.74);
        color: #e2e8f0;
      }

      :root.dark .sb-error-close:hover,
      :root.dark .sb-error-button-secondary:hover {
        background: rgba(30, 41, 59, 0.96);
        border-color: rgba(148, 163, 184, 0.32);
      }

      :root.dark .sb-error-mark {
        background:
          linear-gradient(180deg, rgba(15, 23, 42, 0.72), rgba(2, 6, 23, 0.56)),
          var(--sb-error-soft);
        box-shadow: 0 14px 32px rgba(0, 0, 0, 0.3);
      }

      :root.dark .sb-error-kicker,
      :root.dark .sb-error-meta span {
        color: #94a3b8;
      }

      :root.dark #sb-err-title,
      :root.dark .sb-error-meta code {
        color: #f8fafc;
      }

      :root.dark #sb-err-message {
        color: #cbd5e1;
      }

      :root.dark .sb-error-meta {
        border-color: rgba(148, 163, 184, 0.18);
        background: rgba(15, 23, 42, 0.6);
      }

      :root.dark .sb-error-button-primary {
        background: #f8fafc;
        color: #020617;
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.32);
      }

      :root.dark .sb-error-button-primary:hover {
        background: #e2e8f0;
      }

      #sb-maintenance-toast {
        position: fixed;
        right: 20px;
        bottom: 20px;
        z-index: 2147483000;
        width: min(390px, calc(100vw - 24px));
        transform: translateY(12px);
        opacity: 0;
        transition: transform 220ms ease, opacity 220ms ease;
      }

      #sb-maintenance-toast.is-open {
        transform: translateY(0);
        opacity: 1;
      }

      .sb-maintenance-card {
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 12px;
        align-items: start;
        padding: 14px 15px;
        border: 1px solid rgba(96, 165, 250, 0.34);
        border-radius: 18px;
        background: linear-gradient(180deg, #0f172a, #172033);
        color: #f8fafc;
        box-shadow: 0 18px 46px rgba(2, 6, 23, 0.38);
      }

      .sb-maintenance-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        border-radius: 12px;
        background: rgba(96, 165, 250, 0.18);
        color: #bfdbfe;
        font-weight: 900;
      }

      .sb-maintenance-title {
        margin: 0;
        font-size: 0.95rem;
        font-weight: 900;
        line-height: 1.25;
      }

      .sb-maintenance-copy {
        margin: 4px 0 0;
        color: rgba(255, 255, 255, 0.76);
        font-size: 0.82rem;
        font-weight: 650;
        line-height: 1.45;
      }

      .sb-maintenance-close {
        appearance: none;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.08);
        color: #f8fafc;
        cursor: pointer;
        width: 30px;
        height: 30px;
        font-size: 18px;
        line-height: 1;
      }

      @media (max-width: 520px) {
        .sb-error-header {
          grid-template-columns: 1fr;
          gap: 14px;
          padding-right: 34px;
        }

        .sb-error-mark {
          width: 50px;
          height: 50px;
        }

        .sb-error-actions {
          display: grid;
          grid-template-columns: 1fr;
        }

        .sb-error-button {
          width: 100%;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        #sb-err-overlay,
        #sb-err-card,
        .sb-error-close,
        .sb-error-button {
          transition: none;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function getErrorPresentation(code) {
    const value = String(code || "").toUpperCase();

    if (value === "401" || value.startsWith("AUTH")) {
      return {
        label: "Authentication check",
        accent: "#2563eb",
        soft: "rgba(37, 99, 235, 0.12)",
        border: "rgba(37, 99, 235, 0.28)"
      };
    }

    if (value === "403" || value.startsWith("SEC")) {
      return {
        label: "Security check",
        accent: "#dc2626",
        soft: "rgba(220, 38, 38, 0.12)",
        border: "rgba(220, 38, 38, 0.28)"
      };
    }

    if (value === "404" || value.startsWith("NAV")) {
      return {
        label: "Page notice",
        accent: "#d97706",
        soft: "rgba(217, 119, 6, 0.12)",
        border: "rgba(217, 119, 6, 0.28)"
      };
    }

    if (value === "429" || value.startsWith("NET")) {
      return {
        label: "Connection notice",
        accent: "#0891b2",
        soft: "rgba(8, 145, 178, 0.12)",
        border: "rgba(8, 145, 178, 0.28)"
      };
    }

    if (value.startsWith("5") || value.startsWith("SYS")) {
      return {
        label: "Service notice",
        accent: "#7c3aed",
        soft: "rgba(124, 58, 237, 0.12)",
        border: "rgba(124, 58, 237, 0.28)"
      };
    }

    if (value.startsWith("ENV")) {
      return {
        label: "Compatibility notice",
        accent: "#0f766e",
        soft: "rgba(15, 118, 110, 0.12)",
        border: "rgba(15, 118, 110, 0.28)"
      };
    }

    return {
      label: "StudyBase notice",
      accent: "#dc2626",
      soft: "rgba(220, 38, 38, 0.12)",
      border: "rgba(220, 38, 38, 0.28)"
    };
  }

  function showErrorPopup(code) {
    const config = ERROR_MAP[code] || {
      title: "Unknown Error",
      message: "An unknown error occurred. Please try again.",
      icon: "⚠️"
    };

    const displayCode = code ? code : "unknown";
    const presentation = getErrorPresentation(displayCode);

    const hasActionButton =
      typeof config.buttonText === "string" &&
      config.buttonText.trim() &&
      typeof config.buttonUrl === "string" &&
      config.buttonUrl.trim();

    ensureErrorStyles();
    document.body.style.overflow = "hidden";

    const overlay = document.createElement("div");
    overlay.className = "is-hidden";
    overlay.id = "sb-err-overlay";
    overlay.style.setProperty("--sb-error-accent", presentation.accent);
    overlay.style.setProperty("--sb-error-soft", presentation.soft);
    overlay.style.setProperty("--sb-error-border", presentation.border);

    overlay.innerHTML = `
      <div id="sb-err-card" class="is-hidden" role="dialog" aria-modal="true" aria-labelledby="sb-err-title" aria-describedby="sb-err-message">
        <div class="sb-error-accent" aria-hidden="true"></div>
        <div class="sb-error-glow" aria-hidden="true"></div>

        <button id="sb-err-x" class="sb-error-close" type="button" aria-label="Dismiss error">&times;</button>

        <div class="sb-error-body">
          <div class="sb-error-header">
            <div class="sb-error-mark" aria-hidden="true">!</div>
            <div>
              <p class="sb-error-kicker">${escapeHtml(presentation.label)}</p>
              <h2 id="sb-err-title">${escapeHtml(config.title)}</h2>
            </div>
          </div>

          <p id="sb-err-message">${escapeHtml(config.message)}</p>

          <div class="sb-error-meta" aria-label="Error code">
            <span>Error code</span>
            <code>${escapeHtml(displayCode)}</code>
          </div>

          <div class="sb-error-actions">
            ${
              hasActionButton
                ? `
                <a
                  id="sb-err-action"
                  href="${escapeHtml(config.buttonUrl)}"
                  class="sb-error-button sb-error-button-secondary"
                >
                  ${escapeHtml(config.buttonText)}
                </a>
              `
                : ""
            }

            <button id="sb-err-close" class="sb-error-button sb-error-button-primary" type="button">
              Try again
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.classList.remove("is-hidden");
      document.getElementById("sb-err-card")?.classList.remove("is-hidden");
    });

    const closeBtn = document.getElementById("sb-err-close");
    const closeIconBtn = document.getElementById("sb-err-x");
    closeBtn?.focus({ preventScroll: true });

    function closeAndReloadClean() {
      document.body.style.overflow = "";

      overlay.classList.add("is-hidden");
      const card = document.getElementById("sb-err-card");
      card?.classList.add("is-hidden");

      setTimeout(() => {
        overlay.remove();
        removeErrorParamAndReload();
      }, 260);
    }

    closeBtn?.addEventListener("click", closeAndReloadClean);
    closeIconBtn?.addEventListener("click", closeAndReloadClean);

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeAndReloadClean();
    });

    window.addEventListener("keydown", function onKey(e) {
      if (e.key === "Escape") {
        window.removeEventListener("keydown", onKey);
        closeAndReloadClean();
      }
    });
  }

  function showMaintenanceToast(message) {
    ensureErrorStyles();

    const existing = document.getElementById("sb-maintenance-toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.id = "sb-maintenance-toast";
    toast.innerHTML = `
      <div class="sb-maintenance-card" role="status" aria-live="polite">
        <div class="sb-maintenance-icon" aria-hidden="true">i</div>
        <div>
          <p class="sb-maintenance-title">StudyBase is in maintenance mode</p>
          <p class="sb-maintenance-copy">${escapeHtml(message || "Service is temporarily unavailable.")}</p>
        </div>
        <button class="sb-maintenance-close" type="button" aria-label="Dismiss maintenance notice">&times;</button>
      </div>
    `;

    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("is-open"));

    toast.querySelector(".sb-maintenance-close")?.addEventListener("click", () => {
      toast.classList.remove("is-open");
      removeErrorParamFromUrl();
      setTimeout(() => toast.remove(), 240);
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!hasErrorParam()) return;
    const code = getErrorParam();
    if (code.toUpperCase() === "MAINTENANCE_MODE") {
      showMaintenanceToast(ERROR_MAP.MAINTENANCE_MODE.message);
      return;
    }
    showErrorPopup(code);
  });
})();
