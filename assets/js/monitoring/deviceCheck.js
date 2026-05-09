(() => {
  "use strict";

  window.CurrentScriptVersions = window.CurrentScriptVersions || {};
  window.CurrentScriptVersions['deviceCheck'] = '1.0.0';

  var ERRORS = {
    TIME: "/index.html?error=ENV_403_TIME",
    OS: "/index.html?error=ENV_403_OS",
    PX: "/index.html?error=ENV_403_PX"
  };

  // =========================
  // FEATURE TOGGLES
  // =========================
  var ENABLE_TIME_CHECK = false;
  var ENABLE_OS_CHECK = false;
  var ENABLE_SCREEN_CHECK = false;

  // If true and page loads outside allowed time:
  // show warning banner + countdown first
  // If false:
  // redirect instantly
  var DEBUG_TIME_POPUP_ON_LOAD = false;

  // =========================
  // SETTINGS
  // =========================
  var START_HOUR = 4;   // 04:00
  var END_HOUR = 23;    // 23:00
  var MAX_WIDTH = 1550;
  var MAX_HEIGHT = 900;

  var CHECK_INTERVAL_MS = 60 * 100;
  var WARNING_SECONDS = 60;

  let maintenanceWarningShown = false;
  let countdownInterval = null;
  let checkerInterval = null;

  function outsideAllowedTime() {
    try {
      var now = new Date();
      var hour = now.getHours();
      return hour < START_HOUR || hour >= END_HOUR;
    } catch {
      return true;
    }
  }

  function isChromeOS() {
    try {
      var ua = navigator.userAgent || "";
      var platform = navigator.platform || "";
      var uaDataPlatform = navigator.userAgentData?.platform || "";

      return (
        ua.includes("CrOS") ||
        platform.toLowerCase().includes("cros") ||
        uaDataPlatform.toLowerCase().includes("chrome os")
      );
    } catch {
      return false;
    }
  }

  function screenTooLarge() {
    try {
      var width = window.screen.width || 0;
      var height = window.screen.height || 0;
      return width > MAX_WIDTH || height > MAX_HEIGHT;
    } catch {
      return true;
    }
  }

  function redirectTo(url) {
    window.location.replace(url);
  }

  function createMaintenanceBanner() {
    if (document.getElementById("maintenance-top-banner")) return;

    var style = document.createElement("style");
    style.id = "maintenance-top-banner-style";
    style.textContent = `
      #maintenance-top-banner {
        position: fixed;
        top: 12px;
        left: 50%;
        transform: translateX(-50%);
        width: min(1100px, calc(100vw - 24px));
        z-index: 999999;
        pointer-events: auto;
        animation: sbBannerSlideIn 0.28s ease;
      }

      #maintenance-top-banner-card {
        display: flex;
        align-items: flex-start;
        gap: 14px;
        padding: 14px 16px;
        border-radius: 18px;
        background: rgba(17, 24, 39, 0.95);
        color: #ffffff;
        border: 1px solid rgba(255,255,255,0.08);
        box-shadow:
          0 20px 40px rgba(0,0,0,0.25),
          inset 0 1px 0 rgba(255,255,255,0.05);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
      }

      #maintenance-top-banner-icon {
        width: 42px;
        height: 42px;
        min-width: 42px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #f59e0b, #f97316);
        color: #fff;
        font-size: 18px;
        box-shadow: 0 10px 25px rgba(249, 115, 22, 0.35);
      }

      #maintenance-top-banner-content {
        flex: 1;
        min-width: 0;
      }

      #maintenance-top-banner-title {
        font-family: Inter, system-ui, sans-serif;
        font-size: 15px;
        font-weight: 800;
        line-height: 1.2;
        margin-bottom: 4px;
      }

      #maintenance-top-banner-text {
        font-family: Inter, system-ui, sans-serif;
        font-size: 13px;
        line-height: 1.55;
        color: rgba(255,255,255,0.86);
      }

      #maintenance-top-banner-countdown {
        display: inline-block;
        font-weight: 800;
        color: #fcd34d;
        min-width: 2ch;
      }

      #maintenance-top-banner-close {
        border: 0;
        background: transparent;
        color: rgba(255,255,255,0.65);
        cursor: pointer;
        font-size: 16px;
        padding: 4px;
        line-height: 1;
        transition: color 0.2s ease, transform 0.2s ease;
      }

      #maintenance-top-banner-close:hover {
        color: rgba(255,255,255,0.95);
        transform: scale(1.05);
      }

      @keyframes sbBannerSlideIn {
        from {
          opacity: 0;
          transform: translateX(-50%) translateY(-12px);
        }
        to {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      }

      @media (max-width: 640px) {
        #maintenance-top-banner-card {
          padding: 12px 13px;
          gap: 12px;
          border-radius: 16px;
        }

        #maintenance-top-banner-title {
          font-size: 14px;
        }

        #maintenance-top-banner-text {
          font-size: 12px;
        }

        #maintenance-top-banner-icon {
          width: 38px;
          height: 38px;
          min-width: 38px;
          font-size: 16px;
        }
      }
    `;

    var banner = document.createElement("div");
    banner.id = "maintenance-top-banner";
    banner.innerHTML = `
      <div id="maintenance-top-banner-card" role="alert" aria-live="assertive">
        <div id="maintenance-top-banner-icon">
          <i class="fas fa-screwdriver-wrench"></i>
        </div>

        <div id="maintenance-top-banner-content">
          <div id="maintenance-top-banner-title">Maintenance mode starting soon</div>
          <div id="maintenance-top-banner-text">
            Access hours have now ended. Please finish what you're doing below and save any important work.
            This page will stop working in 
            <span id="maintenance-top-banner-countdown">${WARNING_SECONDS}</span>
            seconds.
          </div>
        </div>

        <button id="maintenance-top-banner-close" type="button" aria-label="Dismiss notice">
          <i class="fas fa-xmark"></i>
        </button>
      </div>
    `;

    document.head.appendChild(style);
    document.body.appendChild(banner);

    var closeBtn = document.getElementById("maintenance-top-banner-close");
    closeBtn?.addEventListener("click", () => {
      banner.remove();
    });
  }

  function updateBannerCountdown(seconds) {
    var countdownEl = document.getElementById("maintenance-top-banner-countdown");
    if (countdownEl) {
      countdownEl.textContent = String(seconds);
    }
  }

  function startMaintenanceCountdown() {
    if (maintenanceWarningShown) return;
    maintenanceWarningShown = true;

    createMaintenanceBanner();

    let remaining = WARNING_SECONDS;

    countdownInterval = setInterval(() => {
      remaining -= 1;
      updateBannerCountdown(remaining);

      if (remaining <= 0) {
        clearInterval(countdownInterval);
        countdownInterval = null;

        if (checkerInterval) {
          clearInterval(checkerInterval);
          checkerInterval = null;
        }

        redirectTo(ERRORS.TIME);
      }
    }, 1000);
  }

  function runInitialChecks() {
    if (ENABLE_OS_CHECK && !isChromeOS()) {
      redirectTo(ERRORS.OS);
      return false;
    }

    if (ENABLE_SCREEN_CHECK && screenTooLarge()) {
      redirectTo(ERRORS.PX);
      return false;
    }

    if (ENABLE_TIME_CHECK && outsideAllowedTime()) {
      if (DEBUG_TIME_POPUP_ON_LOAD) {
        startMaintenanceCountdown();
      } else {
        redirectTo(ERRORS.TIME);
      }
      return false;
    }

    return true;
  }

  function startTimeMonitoring() {
    if (!ENABLE_TIME_CHECK) return;

    checkerInterval = setInterval(() => {
      if (outsideAllowedTime()) {
        startMaintenanceCountdown();
      }
    }, CHECK_INTERVAL_MS);
  }

  if (!runInitialChecks()) return;
  startTimeMonitoring();
})();