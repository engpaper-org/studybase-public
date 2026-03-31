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
      message: "We are sorry, but the device you are currently using is not or is no longer supported by StudyBase. This is to ensure that you have maximum security and the best experience whilst on our site.",
      icon: "🔒",
      buttonText: "More information",
      buttonUrl: "/support/info/restricted_device_type.html"
    },

    "ENV_403_PX": {
      title: "Restricted Device Type",
      message: "We are sorry, but the device you are currently using is not or is no longer supported by StudyBase. This is to ensure that you have maximum security and the best experience whilst on our site.",
      icon: "🔒",
      buttonText: "More information",
      buttonUrl: "/support/info/restricted_device_type.html"
    },

    "ENV_403_LOC": {
      title: "This content is GeoBlocked",
      message: "We are sorry, but your current location is not supported. This is to ensure that you have maximum security and the best experience whilst on our site.",
      icon: "🔒",
      buttonText: "More information",
      buttonUrl: "/support/info/geoblock.html"
    },
    "ENV_403_LOC": {
      title: "Location collection blocked",
      message: "To access the site we require one time location verification, this data is not sent to our servers and location is not stored on device. All that is stored locally, on device, is true or false. Once location has be check locally the location is deleted. Please enable location services for access.",
      icon: "🔒",
      buttonText: "More information",
      buttonUrl: "/support/info/geoblock.html"
    },
    "ENV_403_TIME": {
      title: "Site is being updated overnight",
      message: "To help keep our site and our infrastructure up and running, the site shutsdown between 11pm and 4am. This is to reduce stress on the system and give it time to push all updates and bug fixes for the next day. We are sorry for any inconvinience..",
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

  function showErrorPopup(code) {
    const config = ERROR_MAP[code] || {
      title: "Unknown Error",
      message: "An unknown error occurred. Please try again.",
      icon: "⚠️"
    };

    const displayCode = code ? code : "unknown";

    const hasActionButton =
      typeof config.buttonText === "string" &&
      config.buttonText.trim() &&
      typeof config.buttonUrl === "string" &&
      config.buttonUrl.trim();

    document.body.style.overflow = "hidden";

    const overlay = document.createElement("div");
    overlay.className = "fixed inset-0 z-[9999] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 opacity-0 transition-opacity duration-300";
    overlay.id = "sb-err-overlay";

    overlay.innerHTML = `
      <div id="sb-err-card" class="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden transform scale-95 transition-all duration-300 ring-1 ring-gray-900/5" role="dialog" aria-modal="true" aria-labelledby="sb-err-title">
        
        <div class="flex items-start sm:items-center gap-4 p-5 sm:p-6 border-b border-gray-100 bg-gray-50/50">
          <div class="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-white border border-gray-200 rounded-xl text-2xl shadow-sm">
            ${config.icon}
          </div>
          <div class="flex flex-col">
            <h2 id="sb-err-title" class="text-lg sm:text-xl font-bold text-gray-900 leading-tight m-0">
              ${escapeHtml(config.title)}
            </h2>
            <p class="text-xs sm:text-sm text-gray-500 mt-1 mb-0">
              Error code: <span class="font-mono font-medium text-gray-700">${escapeHtml(displayCode)}</span>
            </p>
          </div>
        </div>

        <div class="p-5 sm:p-6 text-gray-600 text-sm sm:text-base leading-relaxed">
          ${escapeHtml(config.message)}
        </div>

        <div class="px-5 py-4 sm:px-6 sm:py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 flex-wrap">
          ${
            hasActionButton
              ? `
                <a
                  id="sb-err-action"
                  href="${escapeHtml(config.buttonUrl)}"
                  class="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-gray-900 transition-all bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 active:scale-95"
                >
                  ${escapeHtml(config.buttonText)}
                </a>
              `
              : ""
          }

          <button id="sb-err-close" class="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white transition-all bg-gray-900 border border-transparent rounded-xl shadow-sm hover:bg-gray-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 active:scale-95">
            Got it
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.classList.remove("opacity-0");
      document.getElementById("sb-err-card").classList.remove("scale-95");
      document.getElementById("sb-err-card").classList.add("scale-100");
    });

    const closeBtn = document.getElementById("sb-err-close");
    closeBtn?.focus({ preventScroll: true });

    function closeAndReloadClean() {
      document.body.style.overflow = "";

      overlay.classList.add("opacity-0");
      const card = document.getElementById("sb-err-card");
      card.classList.remove("scale-100");
      card.classList.add("scale-95");

      setTimeout(() => {
        overlay.remove();
        removeErrorParamAndReload();
      }, 300);
    }

    closeBtn?.addEventListener("click", closeAndReloadClean);

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
    showErrorPopup(code);
  });
})();