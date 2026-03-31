(function () {

  window.CurrentScriptVersions = window.CurrentScriptVersions || {};
  window.CurrentScriptVersions['timeWarn'] = '1.0.0';

  var TIME_KEY = "siteActiveTime";
  var ALERT_KEY = "siteActiveBreakAlert";
  var DAILY_LIMIT_SECONDS = 60 * 60;

  let hasShownThisLoad = false;

  function getNow() {
    return new Date();
  }

  function getDayKey(date) {
    var y = date.getFullYear();
    var m = String(date.getMonth() + 1).padStart(2, "0");
    var d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function loadTimeData() {
    try {
      var raw = localStorage.getItem(TIME_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function loadAlertData() {
    try {
      var raw = localStorage.getItem(ALERT_KEY);
      if (!raw) {
        return {
          lastShownDay: null
        };
      }
      var parsed = JSON.parse(raw);
      return {
        lastShownDay: parsed.lastShownDay || null
      };
    } catch {
      return {
        lastShownDay: null
      };
    }
  }

  function saveAlertData(data) {
    localStorage.setItem(ALERT_KEY, JSON.stringify(data));
  }

  function formatDuration(seconds) {
    var s = Math.max(0, Math.floor(seconds || 0));
    var hours = Math.floor(s / 3600);
    var minutes = Math.floor((s % 3600) / 60);

    if (hours <= 0) return `${minutes} min`;
    if (minutes <= 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  }

  function removeExistingBanner() {
    var existing = document.getElementById("site-break-banner");
    if (existing) existing.remove();
  }

  function showBanner(stats) {
    removeExistingBanner();

    var banner = document.createElement("div");
    banner.id = "site-break-banner";
    banner.innerHTML = `
      <div class="sb-break-inner">
        <div class="sb-break-left">
          <div class="sb-break-pill">StudyBase Wellbeing</div>
          <div class="sb-break-title">You’ve spent over 1 hour on the site today.</div>
          <div class="sb-break-text">
            Today: <strong>${formatDuration(stats.dailySeconds)}</strong>
            <span class="sb-break-sep">•</span>
            This week: <strong>${formatDuration(stats.weeklySeconds)}</strong>
            <span class="sb-break-sep">•</span>
            This month: <strong>${formatDuration(stats.monthlySeconds)}</strong>
          </div>
          <div class="sb-break-subtext">
            You’re doing well — consider taking a short break for today to reset your focus.
          </div>
        </div>
        <div class="sb-break-right">
          <button type="button" class="sb-break-btn" id="site-break-close">Dismiss</button>
        </div>
      </div>
    `;

    var style = document.createElement("style");
    style.id = "site-break-banner-style";
    style.textContent = `
      #site-break-banner {
        position: fixed;
        top: 16px;
        left: 16px;
        right: 16px;
        z-index: 999999;
        display: flex;
        justify-content: center;
        pointer-events: none;
        animation: sbBreakSlideIn 0.35s ease;
      }

      .sb-break-inner {
        width: min(980px, 100%);
        pointer-events: auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
        padding: 16px 18px;
        border-radius: 18px;
        background: rgba(255, 248, 235, 0.96);
        border: 1px solid rgba(223, 182, 103, 0.45);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.14);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        color: #3d2b12;
        font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .sb-break-left {
        min-width: 0;
      }

      .sb-break-pill {
        display: inline-flex;
        align-items: center;
        padding: 5px 10px;
        border-radius: 999px;
        background: rgba(210, 154, 40, 0.12);
        border: 1px solid rgba(210, 154, 40, 0.18);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.02em;
        margin-bottom: 8px;
      }

      .sb-break-title {
        font-size: 16px;
        font-weight: 800;
        line-height: 1.25;
        margin-bottom: 6px;
      }

      .sb-break-text {
        font-size: 14px;
        line-height: 1.5;
        color: #5b431f;
      }

      .sb-break-subtext {
        margin-top: 5px;
        font-size: 13px;
        line-height: 1.45;
        color: #7a5c2e;
      }

      .sb-break-sep {
        display: inline-block;
        margin: 0 8px;
        opacity: 0.45;
      }

      .sb-break-right {
        flex-shrink: 0;
      }

      .sb-break-btn {
        appearance: none;
        border: 0;
        outline: 0;
        cursor: pointer;
        border-radius: 12px;
        padding: 11px 14px;
        background: #3d2b12;
        color: #fffaf1;
        font-size: 13px;
        font-weight: 700;
        line-height: 1;
        transition: transform 0.15s ease, opacity 0.15s ease, background 0.15s ease;
      }

      .sb-break-btn:hover {
        transform: translateY(-1px);
        opacity: 0.96;
      }

      .sb-break-btn:active {
        transform: translateY(0);
      }

      @keyframes sbBreakSlideIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @media (max-width: 720px) {
        #site-break-banner {
          top: 12px;
          left: 12px;
          right: 12px;
        }

        .sb-break-inner {
          flex-direction: column;
          align-items: stretch;
          padding: 14px;
          gap: 12px;
        }

        .sb-break-right {
          width: 100%;
        }

        .sb-break-btn {
          width: 100%;
        }

        .sb-break-text,
        .sb-break-subtext,
        .sb-break-title {
          word-wrap: break-word;
        }
      }
    `;

    if (!document.getElementById("site-break-banner-style")) {
      document.head.appendChild(style);
    }

    document.body.appendChild(banner);

    var closeBtn = document.getElementById("site-break-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        removeExistingBanner();
      });
    }
  }

  function maybeShowBreakBanner() {
    if (hasShownThisLoad) return;

    var stats = loadTimeData();
    if (!stats) return;

    var todayKey = getDayKey(getNow());
    var alertData = loadAlertData();

    if ((stats.dailySeconds || 0) < DAILY_LIMIT_SECONDS) return;

    if (alertData.lastShownDay !== todayKey) {
      alertData.lastShownDay = todayKey;
      saveAlertData(alertData);
    }

    showBanner(stats);
    hasShownThisLoad = true;
  }

  function initBreakBanner() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", maybeShowBreakBanner, { once: true });
    } else {
      maybeShowBreakBanner();
    }

    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible") {
        maybeShowBreakBanner();
      }
    });
  }

  initBreakBanner();
})();