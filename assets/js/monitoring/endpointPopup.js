(function () {
  if (window.StudybaseEndpointPopup) return;

  const POPUP_ID = "sb-endpoint-error-popup";
  const STYLE_ID = "sb-endpoint-error-popup-style";
  const MAINTENANCE_CODE = "MAINTENANCE_MODE";
  const DAILY_LIMIT_CODE = "1027";
  const RATE_LIMIT_CODE = "209";
  const RATE_LIMIT_STATUS = 429;
  const DEFAULT_HOSTS = [];
  const monitoredHosts = new Set(DEFAULT_HOSTS);
  const customErrorRules = [
    {
      id: "requests-reached",
      responses: [DAILY_LIMIT_CODE, RATE_LIMIT_STATUS],
      action: "countdown",
      title: "Server request limit reached",
      summary: "StudyBase has reached the current request limit. Please try again when the countdown finishes.",
      details: "The endpoint returned a request limit response."
    },
    {
      id: "rate-limited",
      responses: [RATE_LIMIT_CODE],
      action: "retry-minute",
      title: "You have sent too many requests",
      summary: "You have sent too many requests in a short amount of time. StudyBase has temporarily paused new requests from this page to keep the service stable. Please wait about one minute, then try again.",
      details: "The endpoint returned a short-term rate limit response. This usually happens after repeated searches, song loads, or button presses in a small time window.",
      fields: {
        "What happened": "Too many requests were sent too quickly.",
        "What to do": "Wait about one minute before trying again."
      }
    }
  ];
  const originalFetch = window.fetch ? window.fetch.bind(window) : null;
  const settings = {
    errorIcon: "/assets/images/site-icons/genie-mascot.svg",
    tiktokQrImage: "/assets/qrcodes/tiktok.png",
    tiktokUrl: "https://www.tiktok.com/@project.fin.support"
  };

  if (!originalFetch) return;

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      "#" + POPUP_ID + "{position:fixed!important;inset:0!important;z-index:2147483647!important;isolation:isolate;display:none;background:rgba(15,23,42,0.82);color:#0f172a;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;overflow:auto;}",
      "html.sb-endpoint-error-open,html.sb-endpoint-error-open body{overflow:hidden;}",
      "#" + POPUP_ID + ".is-open{display:block;}",
      "#" + POPUP_ID + " .sb-endpoint-page{min-height:100vh;display:flex;flex-direction:column;}",
      "#" + POPUP_ID + " .sb-endpoint-shell{width:min(780px,calc(100vw - 32px));margin:0 auto;padding:40px 0 32px;display:flex;flex:1;flex-direction:column;}",
      "#" + POPUP_ID + " .sb-endpoint-main{min-height:calc(100vh - 120px);display:flex;align-items:center;justify-content:center;}",
      "#" + POPUP_ID + " .sb-endpoint-card{width:100%;text-align:center;background:#fff;border-radius:24px;padding:32px 28px 28px;box-shadow:0 25px 70px -15px rgba(0,0,0,0.35),0 10px 30px -10px rgba(15,23,42,0.2);border:1px solid #e2e8f0;}",
      "#" + POPUP_ID + " .sb-endpoint-details-view .sb-endpoint-card{text-align:left;padding:26px 24px;box-shadow:0 20px 55px -12px rgba(0,0,0,0.28);}",
      "#" + POPUP_ID + " .sb-endpoint-icon-wrap{width:168px;height:168px;margin:0 auto 18px;display:flex;align-items:center;justify-content:center;overflow:visible;border-radius:9999px;background:linear-gradient(145deg,#f8fafc,#e0f2fe);padding:12px;box-shadow:inset 0 1px 0 rgba(255,255,255,0.9),0 10px 30px -8px rgba(14,165,233,0.15);}",
      "#" + POPUP_ID + " .sb-endpoint-icon-wrap img{width:100%;height:100%;object-fit:contain;display:block;filter:drop-shadow(0 8px 18px rgba(15,23,42,0.12));}",
      "#" + POPUP_ID + " .sb-endpoint-icon-fallback{width:140px;height:140px;border-radius:9999px;background:#e0f2fe;color:#0369a1;display:none;align-items:center;justify-content:center;font-size:68px;font-weight:900;}",
      "#" + POPUP_ID + " h1{margin:0;font-size:clamp(28px,3.8vw,40px);line-height:1.05;letter-spacing:-0.02em;font-weight:900;color:#0f172a;}",
      "#" + POPUP_ID + " h2{margin:0;font-size:22px;line-height:1.2;font-weight:800;color:#0f172a;}",
      "#" + POPUP_ID + " p{margin:0;color:#475569;font-size:15px;line-height:1.65;}",
      "#" + POPUP_ID + " .sb-endpoint-summary{max-width:520px;margin:12px auto 0;font-size:16px;}",
      "#" + POPUP_ID + " .sb-endpoint-custom-fields{display:none;max-width:520px;margin:16px auto 0;text-align:left;border:1px solid #e2e8f0;background:#f8fafc;border-radius:14px;padding:12px 14px;}",
      "#" + POPUP_ID + " .sb-endpoint-custom-fields.is-visible{display:block;}",
      "#" + POPUP_ID + " .sb-endpoint-custom-field{display:flex;justify-content:space-between;gap:12px;padding:6px 0;font-size:13px;line-height:1.35;}",
      "#" + POPUP_ID + " .sb-endpoint-custom-field + .sb-endpoint-custom-field{border-top:1px solid #e2e8f0;}",
      "#" + POPUP_ID + " .sb-endpoint-custom-field strong{color:#334155;font-weight:800;}",
      "#" + POPUP_ID + " .sb-endpoint-custom-field span{color:#0f172a;text-align:right;word-break:break-word;}",
      "#" + POPUP_ID + " .sb-endpoint-actions{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:22px;}",
      "#" + POPUP_ID + " .sb-endpoint-details-view .sb-endpoint-actions{margin-top:26px;justify-content:flex-end;}",
      "#" + POPUP_ID + " button,#" + POPUP_ID + " a.sb-endpoint-button{appearance:none;border:none;text-decoration:none;cursor:pointer;border-radius:14px;padding:12px 20px; transition:all .1s ease;font-size:14px;font-weight:800;display:inline-flex;align-items:center;justify-content:center;gap:8px;}",
      "#" + POPUP_ID + " .sb-endpoint-primary{background:#0f172a;color:#fff;}",
      "#" + POPUP_ID + " .sb-endpoint-primary:hover{background:#020617;}",
      "#" + POPUP_ID + " .sb-endpoint-secondary{background:#f8fafc;color:#334155;border:1px solid #cbd5e1;}",
      "#" + POPUP_ID + " .sb-endpoint-secondary:hover{background:#fff;border-color:#94a3b8;}",
      "#" + POPUP_ID + " .sb-endpoint-footer{margin-top:26px;padding-top:18px;text-align:center;color:#64748b;font-size:13px;border-top:1px solid #f1f5f9;}",
      "#" + POPUP_ID + " .sb-endpoint-footer button{padding:0;border-radius:0;background:transparent;color:#0e7490;text-decoration:underline;font:inherit;font-weight:800;}",
      "#" + POPUP_ID + " .sb-endpoint-view{display:none;}",
      "#" + POPUP_ID + "[data-view='summary'] .sb-endpoint-summary-view{display:block;}",
      "#" + POPUP_ID + "[data-view='details'] .sb-endpoint-details-view{display:block;}",
      "#" + POPUP_ID + " .sb-endpoint-details-view{width:100%; padding:28px 0 36px;}",
      "#" + POPUP_ID + " .sb-endpoint-detail-layout{display:grid;grid-template-columns:1fr;gap:14px;align-items:start;margin-top:8px;}",
      "#" + POPUP_ID + " .sb-endpoint-panel{border:1px solid #e2e8f0;background:#f8fafc;border-radius:16px;padding:14px 16px;text-align:left;}",
      "#" + POPUP_ID + " .sb-endpoint-label{margin:0 0 5px;color:#64748b;font-size:10px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;}",
      "#" + POPUP_ID + " .sb-endpoint-value{margin:0;color:#0f172a;font-size:14px;line-height:1.5;word-break:break-word;}",
      "#" + POPUP_ID + " pre.sb-endpoint-value{max-height:260px;overflow:auto;white-space:pre-wrap;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:12px;font-size:12.5px;color:#1e2937;}",
      "#" + POPUP_ID + " .sb-endpoint-qr{width:100%;aspect-ratio:1;background:#f8fafc;border:1px solid #e2e8f0;border-radius:20px;object-fit:contain;display:block;}",
      "#" + POPUP_ID + " .sb-endpoint-qr-fallback{display:none;width:100%;aspect-ratio:1;border-radius:20px;border:1px dashed #cbd5e1;background:#f8fafc;color:#64748b;align-items:center;justify-content:center;text-align:center;padding:18px;font-size:13px;line-height:1.4;}",
      "#" + POPUP_ID + " .sb-endpoint-topline{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:8px;}",
      "#" + POPUP_ID + " .sb-endpoint-chip{display:inline-flex;align-items:center;border-radius:999px;background:#e0f2fe;color:#0369a1;padding:4px 11px;font-size:10px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;}",
      "#" + POPUP_ID + " .sb-endpoint-ban-warning{font-size:13px;}",
      "#" + POPUP_ID + " .sb-daily-limit-countdown{margin-top:22px;padding:16px 18px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:14px;text-align:center;}",
      "#" + POPUP_ID + " .sb-daily-limit-label{font-size:12px;font-weight:700;color:#475569;margin-bottom:6px;letter-spacing:0.3px;}",
      "#" + POPUP_ID + " .sb-daily-limit-timer{font-size:26px;font-weight:900;color:#0f172a;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:1px;line-height:1;}",
      "#" + POPUP_ID + " .sb-daily-limit-reset-note{font-size:11px;color:#64748b;margin-top:6px;font-weight:600;}",
      "@media (max-width:760px){#" + POPUP_ID + " .sb-endpoint-shell{padding-top:24px;}#" + POPUP_ID + " .sb-endpoint-main{min-height:calc(100vh - 90px);}#" + POPUP_ID + " .sb-endpoint-card{padding:24px 18px;}#" + POPUP_ID + " .sb-endpoint-details-view .sb-endpoint-card{padding:22px 16px;}#" + POPUP_ID + " .sb-endpoint-icon-wrap{width:132px;height:132px;}#" + POPUP_ID + " .sb-endpoint-topline{flex-direction:column;}#" + POPUP_ID + " .sb-endpoint-actions{flex-direction:column;}#" + POPUP_ID + " .sb-endpoint-details-view .sb-endpoint-actions{justify-content:stretch;}#" + POPUP_ID + " button,#" + POPUP_ID + " a.sb-endpoint-button{width:100%;}}"
    ].join("");
    document.head.appendChild(style);
  }

  function ensurePopup() {
    ensureStyles();

    let host = document.getElementById(POPUP_ID);
    if (host) return host;

    host = document.createElement("div");
    host.id = POPUP_ID;
    host.setAttribute("data-view", "summary");
    host.innerHTML = [
      '<div class="sb-endpoint-page" role="alertdialog" aria-modal="true" aria-labelledby="sb-endpoint-title">',
      '  <div class="sb-endpoint-shell">',
      '    <section class="sb-endpoint-view sb-endpoint-summary-view">',
      '      <main class="sb-endpoint-main">',
      '        <div class="sb-endpoint-card">',
      '          <div class="sb-endpoint-icon-wrap" aria-hidden="true">',
      '            <img data-field="error-icon" alt="" />',
      '            <span class="sb-endpoint-icon-fallback" data-field="error-icon-fallback">!</span>',
      "          </div>",
      '          <h1 id="sb-endpoint-title" data-field="title">There was an error</h1>',
      '          <p class="sb-endpoint-summary" data-field="summary">A StudyBase request did not complete successfully.</p>',
      '          <div class="sb-endpoint-custom-fields" data-field="custom-fields"></div>',
      '          <div class="sb-endpoint-ban-warning" style="max-width:520px;margin:16px auto 0;padding:10px 14px;border-radius:12px;background:#fef2f2;border:1px solid #fecaca;color:#991b1b;font-size:12.5px;font-weight:700;line-height:1.4;">',
      "            Reaching out to the site owner by email about this will lead to a <strong>permanent account ban</strong>.",
      "          </div>",
      '          <div class="sb-endpoint-actions">',
      '            <button type="button" class="sb-endpoint-primary" data-action="dismiss">Dismiss</button>',
      "          </div>",
      "        </div>",
      "      </main>",
      "    </section>",
      '    <section class="sb-endpoint-view sb-endpoint-details-view">',
      '      <div class="sb-endpoint-card sb-details-card">',
      '        <div class="sb-endpoint-topline">',
      "          <div>",
      '            <span class="sb-endpoint-chip">Admin reference</span>',
      '            <h2 class="mt-3">Technical details for site administrators</h2>',
      '            <p class="mt-2">Show this screen to a site admin. Do not send screenshots or details to the site owner by email.</p>',
      "          </div>",
      '          <button type="button" class="sb-endpoint-secondary" data-action="summary">Back</button>',
      "        </div>",
      '        <div class="sb-endpoint-ban-warning" style="margin: 12px 0 20px; padding: 14px 18px; border-radius: 14px; background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; font-size: 13px; font-weight: 700; line-height: 1.45;">',
      "          <strong>PERMANENT BAN WARNING:</strong> Reaching out to the site owner by email about this error (or any maintenance) will result in a permanent account ban. This information is for authorised site administrators only.",
      "        </div>",
      '        <div class="sb-endpoint-detail-layout" style="grid-template-columns: 1fr;">',
      "          <div>",
      '            <div class="sb-endpoint-panel">',
      '              <p class="sb-endpoint-label">Error code</p>',
      '              <p class="sb-endpoint-value" data-field="code">Unknown</p>',
      "            </div>",
      '            <div class="sb-endpoint-panel" style="margin-top:14px;">',
      '              <p class="sb-endpoint-label">Endpoint</p>',
      '              <p class="sb-endpoint-value" data-field="endpoint">Unknown</p>',
      "            </div>",
      '            <div class="sb-endpoint-panel" style="margin-top:14px;">',
      '              <p class="sb-endpoint-label">Details</p>',
      '              <pre class="sb-endpoint-value" data-field="details">No extra details were returned.</pre>',
      "            </div>",
      "          </div>",
      "        </div>",
      '        <div class="sb-endpoint-actions">',
      '          <button type="button" class="sb-endpoint-primary" data-action="dismiss">Dismiss</button>',
      "        </div>",
      "      </div>",
      "    </section>",
      "  </div>",
      "</div>"
    ].join("");

    host.addEventListener("click", function (event) {
      const action = event.target && event.target.getAttribute ? event.target.getAttribute("data-action") : null;
      if (action === "dismiss") {
        closePopup();
        return;
      }
      if (action === "summary") {
        host.setAttribute("data-view", "summary");
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closePopup();
      }
    });

    document.body.appendChild(host);
    return host;
  }

  function setImageWithFallback(img, fallback, src) {
    if (!img) return;
    if (fallback) fallback.style.display = "none";
    img.style.display = "block";
    img.onerror = function () {
      img.style.display = "none";
      if (fallback) fallback.style.display = "flex";
    };
    img.src = src;
  }

  function renderPopupPayload(payload) {
    const popup = ensurePopup();
    const summary = payload.summary || "A StudyBase request did not complete successfully.";

    popup.querySelector('[data-field="summary"]').textContent = summary;
    popup.querySelector('[data-field="code"]').textContent = payload.code || "Unknown";
    popup.querySelector('[data-field="endpoint"]').textContent = payload.endpoint || "Unknown";
    popup.querySelector('[data-field="details"]').textContent =
      payload.details || "No extra details were returned.";

    const titleEl = popup.querySelector('[data-field="title"]');
    if (titleEl) {
      titleEl.textContent = payload.title || "There was an error";
    }

    const customFieldsEl = popup.querySelector('[data-field="custom-fields"]');
    if (customFieldsEl) {
      customFieldsEl.textContent = "";
      const fields = payload.customFields && typeof payload.customFields === "object" ? payload.customFields : null;
      if (fields) {
        Object.keys(fields).forEach(function (label) {
          const row = document.createElement("div");
          row.className = "sb-endpoint-custom-field";

          const name = document.createElement("strong");
          name.textContent = label;

          const value = document.createElement("span");
          value.textContent = String(fields[label]);

          row.appendChild(name);
          row.appendChild(value);
          customFieldsEl.appendChild(row);
        });
        customFieldsEl.classList.add("is-visible");
      } else {
        customFieldsEl.classList.remove("is-visible");
      }
    }

    const banWarnings = popup.querySelectorAll(".sb-endpoint-ban-warning");
    if (payload.hideBanWarning) {
      banWarnings.forEach((el) => { el.style.display = "none"; });
    } else {
      banWarnings.forEach((el) => { el.style.display = ""; });
    }

    const isDailyLimit = !!payload.isDailyLimit;

    // Always clean previous daily-limit UI first
    const actions = popup.querySelector('.sb-endpoint-actions');
    const existingCountdown = popup.querySelector('.sb-daily-limit-countdown');
    if (existingCountdown) existingCountdown.remove();

    if (isDailyLimit) {
      popup.setAttribute("data-daily-limit", "true");

      if (actions) actions.style.display = "";

      // Clear any previous interval
      if (popup._dailyLimitInterval) {
        clearInterval(popup._dailyLimitInterval);
        popup._dailyLimitInterval = null;
      }

      // Set up the live countdown to 00:00 UTC
      setupDailyLimitCountdown(popup);
    } else {
      popup.removeAttribute("data-daily-limit");

      if (actions) actions.style.display = "";

      // Clean up timer if we were previously in daily limit mode
      if (popup._dailyLimitInterval) {
        clearInterval(popup._dailyLimitInterval);
        popup._dailyLimitInterval = null;
      }
    }

    setImageWithFallback(
      popup.querySelector('[data-field="error-icon"]'),
      popup.querySelector('[data-field="error-icon-fallback"]'),
      settings.errorIcon
    );
    // QR image elements removed (no longer TikTok based)

  }

  function closePopup() {
    const popup = document.getElementById(POPUP_ID);
    if (!popup) return;

    // Clear any running daily limit countdown timer
    if (popup._dailyLimitInterval) {
      clearInterval(popup._dailyLimitInterval);
      popup._dailyLimitInterval = null;
    }

    popup.classList.remove("is-open");
    popup.removeAttribute("data-daily-limit");

    const dismissBtn = popup.querySelector('.sb-endpoint-summary-view button[data-action="dismiss"]');
    if (dismissBtn) dismissBtn.textContent = "Dismiss";

    // Remove any previously injected daily limit countdown
    const existingCountdown = popup.querySelector('.sb-daily-limit-countdown');
    if (existingCountdown) existingCountdown.remove();

    document.documentElement.classList.remove("sb-endpoint-error-open");
    if (window.StudybaseEndpointPopup) {
      window.StudybaseEndpointPopup.activeSignature = null;
    }
  }

  function closeToast() {
    closePopup();
  }

  function bringPopupToFront(popup) {
    if (!popup || !document.body) return;
    popup.style.zIndex = "2147483647";
    if (popup.parentNode !== document.body || document.body.lastElementChild !== popup) {
      document.body.appendChild(popup);
    }
  }

  // ==================== MAINTENANCE BANNER (above navbar) ====================
  const BANNER_ID = "sb-maint-banner";
  let bannerInjected = false;

  function ensureBannerStyles() {
    if (document.getElementById("sb-maint-banner-styles")) return;
    const st = document.createElement("style");
    st.id = "sb-maint-banner-styles";
    st.textContent = `
      #${BANNER_ID} {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 2147483640;
        background: linear-gradient(90deg, #0f172a, #1e2937);
        color: #f1f5f9;
        font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
        box-shadow: 0 10px 30px -10px rgba(0,0,0,0.45);
        border-bottom: 1px solid rgba(148,163,184,0.25);
      }
      #${BANNER_ID} .sb-maint-inner {
        max-width: 1080px;
        margin: 0 auto;
        padding: 11px 16px;
        display: flex;
        align-items: flex-start;
        gap: 14px;
        font-size: 13.5px;
        line-height: 1.45;
      }
      #${BANNER_ID} .sb-maint-icon {
        flex-shrink: 0;
        width: 28px;
        height: 28px;
        border-radius: 8px;
        background: #334155;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 15px;
        margin-top: 1px;
      }
      #${BANNER_ID} .sb-maint-text { flex: 1; }
      #${BANNER_ID} .sb-maint-text strong { color: #f8fafc; font-weight: 800; }
      #${BANNER_ID} .sb-maint-ban {
        display: block;
        margin-top: 4px;
        font-size: 12px;
        font-weight: 700;
        color: #fda4af;
        background: rgba(190, 18, 60, 0.18);
        padding: 3px 8px;
        border-radius: 6px;
        border: 1px solid rgba(244, 63, 94, 0.35);
      }
      #${BANNER_ID} .sb-maint-close {
        flex-shrink: 0;
        background: rgba(255,255,255,0.08);
        border: 1px solid rgba(148,163,184,0.3);
        color: #e2e8f0;
        width: 28px;
        height: 28px;
        border-radius: 999px;
        font-size: 18px;
        line-height: 1;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 1px;
      }
      #${BANNER_ID} .sb-maint-close:hover { background: rgba(255,255,255,0.16); }
      .sb-maint-active #sbx-navbar { padding-top: 96px !important; }
      @media (max-width: 640px) {
        #${BANNER_ID} .sb-maint-inner { padding: 10px 12px; font-size: 13px; }
      }
    `;
    document.head.appendChild(st);
  }

  function showMaintenanceBanner(message) {
    ensureBannerStyles();

    let banner = document.getElementById(BANNER_ID);
    if (banner) {
      // already visible
      return;
    }

    // Prevent showing again this session if user dismissed
    if (sessionStorage.getItem("sb-maint-banner-dismissed") === "1") {
      return;
    }


    banner = document.createElement("div");
    banner.id = BANNER_ID;
    banner.setAttribute("role", "status");
    banner.innerHTML = `
      <div class="sb-maint-inner">
        <div class="sb-maint-icon" aria-hidden="true">🛠️</div>
        <div class="sb-maint-text">
          <strong>StudyBase is currently offline for servicing.</strong>
          Online services and API requests are temporarily unavailable.
        </div>
        <button type="button" class="sb-maint-close" aria-label="Dismiss maintenance notice">&times;</button>
      </div>
    `;

    document.body.insertAdjacentElement("afterbegin", banner);
    document.documentElement.classList.add("sb-maint-active");
    // Also nudge the navbar if it exists already
    const nav = document.getElementById("sbx-navbar");
    if (nav) nav.style.paddingTop = "96px";

    banner.querySelector(".sb-maint-close").addEventListener("click", () => {
      hideMaintenanceBanner(true);
    });

    bannerInjected = true;
  }

  function hideMaintenanceBanner(remember = false) {
    const banner = document.getElementById(BANNER_ID);
    if (banner) banner.remove();
    document.documentElement.classList.remove("sb-maint-active");

    const nav = document.getElementById("sbx-navbar");
    if (nav) nav.style.paddingTop = "";

    if (remember) {
      try { sessionStorage.setItem("sb-maint-banner-dismissed", "1"); } catch (e) {}
    }
  }

  function openDetailsFromPopup() {
    if (!window.StudybaseEndpointPopup || !window.StudybaseEndpointPopup.lastError) return;
    const popup = ensurePopup();
    popup.setAttribute("data-view", "details");
    popup.classList.add("is-open");
  }

  function openPopup(payload) {
    const signature = [payload.code, payload.endpoint, payload.details].join("|");
    if (window.StudybaseEndpointPopup && window.StudybaseEndpointPopup.activeSignature === signature) {
      return;
    }

    window.StudybaseEndpointPopup.lastError = payload;
    window.StudybaseEndpointPopup.activeSignature = signature;

    const render = function () {
      const popup = ensurePopup();
      bringPopupToFront(popup);
      renderPopupPayload(payload);
      popup.setAttribute("data-view", "summary");
      popup.classList.add("is-open");
      document.documentElement.classList.add("sb-endpoint-error-open");
    };

    if (document.readyState === "loading" || !document.body) {
      document.addEventListener("DOMContentLoaded", render, { once: true });
    } else {
      render();
    }
  }

  function openMaintenanceToast(payload, endpoint) {
    const message =
      payload && typeof payload.message === "string" && payload.message.trim()
        ? payload.message.trim()
        : "Service is temporarily unavailable.";

    showMaintenanceBanner(message);
  }

  function openCustomErrorPopup(endpoint, payload, rule, triggeredCode) {
    rule = rule || {};
    const code = triggeredCode || (rule.responses && rule.responses.length ? String(rule.responses[0]) : "CUSTOM_ERROR");
    const signature = [rule.id || "custom-error", code, endpoint].join("|");
    if (window.StudybaseEndpointPopup && window.StudybaseEndpointPopup.activeSignature === signature) {
      return;
    }

    const detailsText = payload && payload.details
      ? payload.details
      : rule.details || "The endpoint returned a custom monitored error response.";

    const customPayload = {
      code: code,
      endpoint: endpoint || "Unknown",
      details: detailsText,
      summary: rule.summary || "A monitored StudyBase request needs attention.",
      title: rule.title || "Request interrupted",
      hideBanWarning: rule.hideBanWarning !== false,
      isDailyLimit: rule.action === "countdown",
      customFields: rule.fields || null
    };

    window.StudybaseEndpointPopup.lastError = customPayload;
    window.StudybaseEndpointPopup.activeSignature = signature;

    const render = function () {
      const popup = ensurePopup();
      bringPopupToFront(popup);
      renderPopupPayload(customPayload);
      popup.setAttribute("data-view", "summary");
      popup.classList.add("is-open");
      document.documentElement.classList.add("sb-endpoint-error-open");
    };

    if (document.readyState === "loading" || !document.body) {
      document.addEventListener("DOMContentLoaded", render, { once: true });
    } else {
      render();
    }
  }

  function openDailyLimitPopup(endpoint, payload, triggeredCode) {
    openCustomErrorPopup(endpoint, payload, getCustomRuleById("requests-reached") || customErrorRules[0], triggeredCode || DAILY_LIMIT_CODE);
  }

  function getCustomRuleById(id) {
    return customErrorRules.find(function (rule) {
      return rule && rule.id === id;
    }) || null;
  }

  function openRateLimitPopup(endpoint, payload, triggeredCode) {
    openCustomErrorPopup(
      endpoint,
      payload || { details: "The request was stopped because too many requests were made in a short time." },
      getCustomRuleById("rate-limited") || customErrorRules[1],
      triggeredCode || RATE_LIMIT_CODE
    );
  }

  function addMonitoredHost(rawUrl) {
    if (!rawUrl || typeof rawUrl !== "string") return;

    try {
      const parsed = new URL(rawUrl, window.location.origin);
      if (parsed.hostname) monitoredHosts.add(parsed.hostname);
    } catch (error) {
      console.warn("Unable to monitor endpoint host:", rawUrl, error);
    }
  }

  function configure(config) {
    const endpoints = config && config.endpoints ? config.endpoints : null;

    if (endpoints) {
      Object.keys(endpoints).forEach(function (key) {
        const value = endpoints[key];
        if (typeof value !== "string") return;
        if (!/^https?:\/\//i.test(value)) return;
        if (!/api/i.test(value)) return;
        addMonitoredHost(value);
      });
    }

    const monitoring = config && config.monitoring ? config.monitoring : {};
    const support = config && config.support ? config.support : {};
    const assets = config && config.assets ? config.assets : {};

    if (typeof monitoring.endpointErrorIcon === "string") settings.errorIcon = monitoring.endpointErrorIcon;
    if (typeof assets.endpointErrorIcon === "string") settings.errorIcon = assets.endpointErrorIcon;
    if (typeof support.tiktokQrImage === "string") settings.tiktokQrImage = support.tiktokQrImage;
    if (typeof support.tiktokUrl === "string") settings.tiktokUrl = support.tiktokUrl;

    if (Array.isArray(monitoring.endpointCustomErrors)) {
      const configuredRules = [];
      monitoring.endpointCustomErrors.forEach(function (rule) {
        if (!rule || typeof rule !== "object") return;
        configuredRules.push(rule);
        if (Array.isArray(rule.urls)) {
          rule.urls.forEach(function (url) {
            if (typeof url === "string" && /^https?:\/\//i.test(url)) addMonitoredHost(url);
          });
        }
      });
      customErrorRules.unshift.apply(customErrorRules, configuredRules);
    }
  }

  function isMonitoredHost(hostname) {
    if (!hostname) return false;
    if (monitoredHosts.has(hostname)) return true;
    if (hostname === "studybase.site" || hostname.endsWith(".studybase.site")) return true;
    if (hostname === "revisionbase.site" || hostname.endsWith(".revisionbase.site")) return true;
    return false;
  }

  function shouldInspect(input) {
    try {
      const requestUrl =
        typeof input === "string"
          ? input
          : input && typeof input.url === "string"
            ? input.url
            : "";

      if (!requestUrl) return false;

      const parsed = new URL(requestUrl, window.location.origin);
      return isMonitoredHost(parsed.hostname);
    } catch (error) {
      return false;
    }
  }

  function normaliseDetails(raw) {
    if (!raw) return "";
    const text = String(raw).trim();
    if (!text) return "";
    return text.length > 1500 ? text.slice(0, 1500) + "..." : text;
  }

  function getRequestUrl(input) {
    return typeof input === "string"
      ? input
      : input && typeof input.url === "string"
        ? input.url
        : "";
  }

  function ruleUrlMatches(rule, endpoint) {
    if (!rule || !Array.isArray(rule.urls) || !rule.urls.length) return true;
    return rule.urls.some(function (pattern) {
      if (pattern instanceof RegExp) return pattern.test(endpoint);
      if (typeof pattern !== "string" || !pattern) return false;
      return endpoint.indexOf(pattern) !== -1;
    });
  }

  function getResponseTokens(response, payload) {
    const tokens = [];
    if (response && response.status) tokens.push(String(response.status));

    if (payload && payload.isJson && payload.json && typeof payload.json === "object") {
      const fields = ["error", "code", "errorCode", "err", "errCode", "statusCode", "status", "message", "reason", "details", "errorMessage"];
      fields.forEach(function (field) {
        const value = payload.json[field];
        if (value !== undefined && value !== null && value !== "") tokens.push(String(value).trim());
      });
    }

    return tokens;
  }

  function ruleResponseMatches(rule, response, payload) {
    if (!rule || !Array.isArray(rule.responses) || !rule.responses.length) return true;
    const expected = rule.responses.map(function (value) { return String(value).trim(); });
    const tokens = getResponseTokens(response, payload);
    return tokens.some(function (token) { return expected.indexOf(token) !== -1; });
  }

  function getCustomErrorRule(input, response, payload) {
    const endpoint = buildEndpointLabel(input);
    return customErrorRules.find(function (rule) {
      return ruleUrlMatches(rule, endpoint) && ruleResponseMatches(rule, response, payload);
    }) || null;
  }

  function getTriggeredCode(rule, response, payload) {
    const tokens = getResponseTokens(response, payload);
    if (rule && Array.isArray(rule.responses)) {
      const expected = rule.responses.map(function (value) { return String(value).trim(); });
      const matched = tokens.find(function (token) { return expected.indexOf(token) !== -1; });
      if (matched) return matched;
    }
    return tokens[0] || (rule && rule.responses && rule.responses.length ? String(rule.responses[0]) : "CUSTOM_ERROR");
  }

  function isDailyLimitResponse(response, payload) {
    if (!response) return false;

    const status = Number(response.status || 0);
    if (status === RATE_LIMIT_STATUS) return true; // 429 Too Many Requests
    if (String(status) === DAILY_LIMIT_CODE) return true;

    if (!payload || !payload.isJson || !payload.json || typeof payload.json !== "object") return false;

    const data = payload.json;
    const errorFields = ["error", "code", "errorCode", "err", "errCode", "statusCode", "status"];
    for (const field of errorFields) {
      const val = String(data[field] || "").trim();
      if (val === DAILY_LIMIT_CODE || val === String(RATE_LIMIT_STATUS)) {
        return true;
      }
    }

    // Only treat message/reason fields as rate limit if they *exactly* match the code
    // (prevents false positives on 404s or other errors that mention numbers in passing)
    const messageFields = ["message", "reason", "details", "errorMessage"];
    for (const field of messageFields) {
      const val = String(data[field] || "").trim();
      if (val === DAILY_LIMIT_CODE || val === String(RATE_LIMIT_STATUS)) {
        return true;
      }
    }

    return false;
  }

  async function getResponsePayload(response) {
    try {
      const clone = response.clone();
      const contentType = clone.headers.get("content-type") || "";

      if (contentType.indexOf("application/json") !== -1) {
        const json = await clone.json();
        return {
          isJson: true,
          json: json,
          details: normaliseDetails(JSON.stringify(json, null, 2))
        };
      }

      return {
        isJson: false,
        json: null,
        details: normaliseDetails(await clone.text())
      };
    } catch (error) {
      return {
        isJson: false,
        json: null,
        details: ""
      };
    }
  }

  function isHandledApplicationResponse(response, payload) {
    if (!response || response.status >= 500) return false;
    if (!payload || !payload.isJson || !payload.json || typeof payload.json !== "object") return false;

    const data = payload.json;
    const error = typeof data.error === "string" ? data.error : "";

    if (error === MAINTENANCE_CODE || error === "Unknown endpoint") {
      return false;
    }

    return Boolean(
      data.ok === false &&
      (
        error ||
        typeof data.message === "string" ||
        typeof data.reason === "string" ||
        data.banned === true ||
        Object.prototype.hasOwnProperty.call(data, "retryAfter")
      )
    );
  }

  async function shouldIgnoreStateShutdownResponse(input, response) {
    try {
      const requestUrl =
        typeof input === "string"
          ? input
          : input && typeof input.url === "string"
            ? input.url
            : "";

      const parsed = new URL(requestUrl, window.location.origin);
      if (!isMonitoredHost(parsed.hostname)) {
        return false;
      }

      if (parsed.pathname !== "/state") return false;
      if (!response.ok) return false;

      const payload = await response.clone().json();
      return Boolean(
        payload &&
        payload.ok === true &&
        payload.shutdown === true &&
        payload.reason === "protoThree"
      );
    } catch (error) {
      return false;
    }
  }

  async function shouldIgnoreResourcesListMaintenanceResponse(input, response) {
    try {
      const requestUrl =
        typeof input === "string"
          ? input
          : input && typeof input.url === "string"
            ? input.url
            : "";

      const parsed = new URL(requestUrl, window.location.origin);
      if (!isMonitoredHost(parsed.hostname)) {
        return false;
      }

      if (parsed.pathname !== "/resources/list") return false;

      const payload = await response.clone().json();
      const isMaintenance = Boolean(
        payload &&
        payload.ok === false &&
        payload.error === MAINTENANCE_CODE
      );

      if (isMaintenance) {
        // Surface the proper top banner (above navbar) instead of any old popup.
        // This ensures r/index.html and other pages get the "offline for servicing" banner.
        const msg = (payload && payload.message) || "";
        try { sessionStorage.removeItem("sb-maint-banner-dismissed"); } catch (e) {}
        if (window.StudybaseEndpointPopup && typeof window.StudybaseEndpointPopup.showMaintenanceBanner === "function") {
          // Use setTimeout to let the current fetch settle before showing UI
          setTimeout(() => {
            window.StudybaseEndpointPopup.showMaintenanceBanner(msg);
          }, 0);
        }
      }

      return isMaintenance;
    } catch (error) {
      return false;
    }
  }

  async function getStateMaintenancePayload(input, response) {
    try {
      const requestUrl =
        typeof input === "string"
          ? input
          : input && typeof input.url === "string"
            ? input.url
            : "";

      const parsed = new URL(requestUrl, window.location.origin);
      if (!isMonitoredHost(parsed.hostname)) {
        return null;
      }

      if (parsed.pathname !== "/state") return null;

      const payload = await response.clone().json();
      if (payload && payload.ok === false && payload.error === MAINTENANCE_CODE) {
        return payload;
      }
    } catch (error) {
      return null;
    }

    return null;
  }

  function shouldIgnoreEndpoint(input) {
    try {
      const requestUrl =
        typeof input === "string"
          ? input
          : input && typeof input.url === "string"
            ? input.url
            : "";

      const parsed = new URL(requestUrl, window.location.origin);
      if (parsed.pathname === "/auth/check") return true;
      return false;
    } catch (error) {
      return false;
    }
  }

  function buildEndpointLabel(input) {
    try {
      const requestUrl =
        typeof input === "string"
          ? input
          : input && typeof input.url === "string"
            ? input.url
            : "";

      const parsed = new URL(requestUrl, window.location.origin);
      return parsed.href;
    } catch (error) {
      return String(input && input.url ? input.url : input || "Unknown");
    }
  }

  // ==================== DAILY LIMIT COUNTDOWN (resets at 00:00 UTC) ====================
  function getMsUntilUtcMidnight() {
    const now = new Date();
    const nextMidnight = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0, 0, 0, 0
    ));
    return nextMidnight.getTime() - now.getTime();
  }

  function formatCountdown(ms) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  }

  function setupDailyLimitCountdown(popup) {
    // Clear any existing timer
    if (popup._dailyLimitInterval) {
      clearInterval(popup._dailyLimitInterval);
      popup._dailyLimitInterval = null;
    }

    // Remove old countdown if present
    const old = popup.querySelector('.sb-daily-limit-countdown');
    if (old) old.remove();

    // Create the countdown UI
    const countdownWrap = document.createElement('div');
    countdownWrap.className = 'sb-daily-limit-countdown';

    countdownWrap.innerHTML = `
      <div class="sb-daily-limit-label">This global daily limit resets at <strong>00:00 UTC</strong></div>
      <div class="sb-daily-limit-timer"></div>
      <div class="sb-daily-limit-reset-note">Please try again after the reset</div>
    `;

    const timerEl = countdownWrap.querySelector('.sb-daily-limit-timer');

    // Insert after the summary paragraph
    const summaryP = popup.querySelector('[data-field="summary"]');
    if (summaryP && summaryP.parentNode) {
      summaryP.parentNode.insertBefore(countdownWrap, summaryP.nextSibling);
    } else {
      // Fallback: append to the card
      const card = popup.querySelector('.sb-endpoint-card');
      if (card) card.appendChild(countdownWrap);
    }

    function updateTimer() {
      if (!timerEl || !timerEl.isConnected) {
        clearInterval(popup._dailyLimitInterval);
        return;
      }
      timerEl.textContent = formatCountdown(getMsUntilUtcMidnight());
    }

    updateTimer();
    popup._dailyLimitInterval = setInterval(updateTimer, 1000);
  }

  window.fetch = async function (input, init) {
    if (!shouldInspect(input)) {
      return originalFetch(input, init);
    }

    if (shouldIgnoreEndpoint(input)) {
      return originalFetch(input, init);
    }

    try {
      const response = await originalFetch(input, init);

      const maintenancePayload = await getStateMaintenancePayload(input, response);
      if (maintenancePayload) {
        openMaintenanceToast(maintenancePayload, buildEndpointLabel(input));
        return response;
      }

      if (await shouldIgnoreResourcesListMaintenanceResponse(input, response)) {
        return response;
      }

      if (await shouldIgnoreStateShutdownResponse(input, response)) {
        return response;
      }

      const contentType = (response.headers.get("content-type") || "").toLowerCase();
      let inspectedPayload = null;
      if (!response.ok || response.status !== 200 || contentType.includes("application/json")) {
        inspectedPayload = await getResponsePayload(response);
        const customRule = getCustomErrorRule(input, response, inspectedPayload);
        if (customRule) {
          openCustomErrorPopup(
            buildEndpointLabel(input),
            inspectedPayload,
            customRule,
            getTriggeredCode(customRule, response, inspectedPayload)
          );
          return response;
        }
      }

      if (!response.ok) {
        const payload = inspectedPayload || await getResponsePayload(response);

        if (isDailyLimitResponse(response, payload)) {
          const statusStr = String(response.status || "");
          const triggeredCode = statusStr === "429" ? "429" : (statusStr === DAILY_LIMIT_CODE ? DAILY_LIMIT_CODE : statusStr);
          openDailyLimitPopup(buildEndpointLabel(input), payload, triggeredCode);
          return response;
        }

        if (isHandledApplicationResponse(response, payload)) {
          return response;
        }

        openPopup({
          code: String(response.status),
          endpoint: buildEndpointLabel(input),
          details: payload.details || response.statusText || "The endpoint returned an error response.",
          summary: "A StudyBase request returned an unexpected server error."
        });
      }

      return response;
    } catch (error) {
      const isFailedFetch = error &&
        error.name === "TypeError" &&
        /failed to fetch/i.test(String(error.message || ""));

      // When Cloudflare returns 429 (or other errors) without CORS headers,
      // fetch rejects with "Failed to fetch". We can't read the status.
      // We use a heuristic on the URL to decide whether to show the special
      // daily limit screen (no buttons + countdown) or the normal error page.
      const requestUrl = typeof input === "string"
        ? input
        : (input && typeof input.url === "string" ? input.url : "");

      const looksLikeQuotaOrRateLimit =
        /1027|error-test|rate.?limit|daily.?limit|quota|capacity/i.test(requestUrl);

      if (isFailedFetch && looksLikeQuotaOrRateLimit) {
        // Show the special clean daily limit screen for known quota-related endpoints
        // even when it comes back as a raw "Failed to fetch".
        openDailyLimitPopup(
          buildEndpointLabel(input),
          {
            details: "The request was rate-limited (429 Too Many Requests). The response could not be read because the upstream did not include CORS headers on the error."
          },
          "429"
        );
      } else {
        // Normal network / CORS-blocked error (e.g. real 404s, outages, etc.)
        // Show the standard dismiss-only network error page.
        openPopup({
          code: error && error.name ? error.name : "NETWORK_ERROR",
          endpoint: buildEndpointLabel(input),
          details: normaliseDetails(error && error.message ? error.message : String(error)),
          summary:
            "The request could not reach the StudyBase endpoint successfully. This usually means a network failure, a blocked request, or the endpoint being unavailable."
        });
      }

      throw error;
    }
  };

  window.addEventListener("site-config-ready", function (event) {
    configure(event.detail || {});
  });

  if (window.SB_CONFIG) {
    configure(window.SB_CONFIG);
  }

  window.StudybaseEndpointPopup = {
    configure: configure,
    open: openPopup,
    showMaintenance: openMaintenanceToast,
    showMaintenanceBanner: showMaintenanceBanner,
    hideMaintenanceBanner: hideMaintenanceBanner,
    close: closePopup,
    closeToast: closeToast,
    showDetails: openDetailsFromPopup,
    showDailyLimit: openDailyLimitPopup,
    showRateLimit: openRateLimitPopup,
    lastError: null,
    activeSignature: null
  };
})();
