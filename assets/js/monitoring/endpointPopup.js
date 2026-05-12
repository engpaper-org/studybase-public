(function () {
  if (window.StudybaseEndpointPopup) return;

  const POPUP_ID = "sb-endpoint-error-popup";
  const STYLE_ID = "sb-endpoint-error-popup-style";
  const MAINTENANCE_CODE = "MAINTENANCE_MODE";
  const DEFAULT_HOSTS = ["api.studybase.site", "api.revisionbase.site"];
  const monitoredHosts = new Set(DEFAULT_HOSTS);
  const originalFetch = window.fetch ? window.fetch.bind(window) : null;
  const settings = {
    errorIcon: "/assets/images/site-icons/endpoint-error.png",
    tiktokQrImage: "/assets/tokens/tiktok-qr.png",
    tiktokUrl: "https://www.tiktok.com/@studybase"
  };

  if (!originalFetch) return;

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      "#" + POPUP_ID + "{position:fixed;inset:0;z-index:2147483647;display:none;background:#f8fafc;color:#0f172a;font-family:Arial,sans-serif;overflow:auto;}",
      "#" + POPUP_ID + ".is-open{display:block;}",
      "#" + POPUP_ID + " .sb-endpoint-page{min-height:100vh;display:flex;flex-direction:column;}",
      "#" + POPUP_ID + " .sb-endpoint-shell{width:min(860px,calc(100vw - 32px));margin:0 auto;padding:42px 0 28px;display:flex;flex:1;flex-direction:column;}",
      "#" + POPUP_ID + " .sb-endpoint-main{display:flex;flex:1;align-items:center;justify-content:center;}",
      "#" + POPUP_ID + " .sb-endpoint-card{width:100%;text-align:center;}",
      "#" + POPUP_ID + " .sb-endpoint-icon-wrap{width:116px;height:116px;margin:0 auto 24px;border-radius:28px;background:#fff;border:1px solid #e2e8f0;box-shadow:0 18px 48px rgba(15,23,42,.12);display:flex;align-items:center;justify-content:center;overflow:hidden;}",
      "#" + POPUP_ID + " .sb-endpoint-icon-wrap img{width:100%;height:100%;object-fit:cover;display:block;}",
      "#" + POPUP_ID + " .sb-endpoint-icon-fallback{width:72px;height:72px;border-radius:20px;background:#fee2e2;color:#b91c1c;display:none;align-items:center;justify-content:center;font-size:44px;font-weight:900;}",
      "#" + POPUP_ID + " h1{margin:0;font-size:clamp(34px,5vw,58px);line-height:1.02;letter-spacing:0;font-weight:900;color:#0f172a;}",
      "#" + POPUP_ID + " h2{margin:0;font-size:28px;line-height:1.15;font-weight:900;color:#0f172a;}",
      "#" + POPUP_ID + " p{margin:0;color:#475569;font-size:15px;line-height:1.65;}",
      "#" + POPUP_ID + " .sb-endpoint-summary{max-width:640px;margin:18px auto 0;font-size:17px;}",
      "#" + POPUP_ID + " .sb-endpoint-actions{display:flex;flex-wrap:wrap;justify-content:center;gap:12px;margin-top:28px;}",
      "#" + POPUP_ID + " button,#" + POPUP_ID + " a.sb-endpoint-button{appearance:none;border:none;text-decoration:none;cursor:pointer;border-radius:16px;padding:12px 18px;font-size:14px;font-weight:800;display:inline-flex;align-items:center;justify-content:center;gap:8px;}",
      "#" + POPUP_ID + " .sb-endpoint-primary{background:#0f172a;color:#fff;}",
      "#" + POPUP_ID + " .sb-endpoint-secondary{background:#fff;color:#334155;border:1px solid #cbd5e1;}",
      "#" + POPUP_ID + " .sb-endpoint-footer{margin-top:auto;padding-top:28px;text-align:center;color:#64748b;font-size:14px;}",
      "#" + POPUP_ID + " .sb-endpoint-footer button{padding:0;border-radius:0;background:transparent;color:#0f172a;text-decoration:underline;font:inherit;font-weight:900;}",
      "#" + POPUP_ID + " .sb-endpoint-view{display:none;}",
      "#" + POPUP_ID + "[data-view='summary'] .sb-endpoint-summary-view{display:block;}",
      "#" + POPUP_ID + "[data-view='details'] .sb-endpoint-details-view{display:block;}",
      "#" + POPUP_ID + " .sb-endpoint-details-view{width:100%;}",
      "#" + POPUP_ID + " .sb-endpoint-detail-layout{display:grid;grid-template-columns:minmax(0,1fr) 250px;gap:18px;align-items:start;margin-top:24px;}",
      "#" + POPUP_ID + " .sb-endpoint-panel{border:1px solid #e2e8f0;background:#fff;border-radius:22px;padding:18px;text-align:left;box-shadow:0 12px 28px rgba(15,23,42,.06);}",
      "#" + POPUP_ID + " .sb-endpoint-label{margin:0 0 7px;color:#64748b;font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;}",
      "#" + POPUP_ID + " .sb-endpoint-value{margin:0;color:#0f172a;font-size:14px;line-height:1.55;word-break:break-word;}",
      "#" + POPUP_ID + " pre.sb-endpoint-value{max-height:310px;overflow:auto;white-space:pre-wrap;font-family:Consolas,'Courier New',monospace;background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:14px;}",
      "#" + POPUP_ID + " .sb-endpoint-qr{width:100%;aspect-ratio:1;background:#f8fafc;border:1px solid #e2e8f0;border-radius:20px;object-fit:contain;display:block;}",
      "#" + POPUP_ID + " .sb-endpoint-qr-fallback{display:none;width:100%;aspect-ratio:1;border-radius:20px;border:1px dashed #cbd5e1;background:#f8fafc;color:#64748b;align-items:center;justify-content:center;text-align:center;padding:18px;font-size:13px;line-height:1.4;}",
      "#" + POPUP_ID + " .sb-endpoint-topline{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:24px;}",
      "#" + POPUP_ID + " .sb-endpoint-chip{display:inline-flex;align-items:center;border-radius:999px;background:#fee2e2;color:#991b1b;padding:7px 11px;font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;}",
      "@media (max-width:760px){#" + POPUP_ID + " .sb-endpoint-shell{padding-top:26px;}#" + POPUP_ID + " .sb-endpoint-detail-layout{grid-template-columns:1fr;}#" + POPUP_ID + " .sb-endpoint-topline{align-items:flex-start;flex-direction:column;}#" + POPUP_ID + " .sb-endpoint-icon-wrap{width:96px;height:96px;border-radius:24px;}#" + POPUP_ID + " .sb-endpoint-actions{flex-direction:column;}#" + POPUP_ID + " button,#" + POPUP_ID + " a.sb-endpoint-button{width:100%;}}"
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
      '          <h1 id="sb-endpoint-title">There was an error</h1>',
      '          <p class="sb-endpoint-summary" data-field="summary">A StudyBase request did not complete successfully.</p>',
      '          <div class="sb-endpoint-actions">',
      '            <button type="button" class="sb-endpoint-primary" data-action="reload">Reload page</button>',
      '            <button type="button" class="sb-endpoint-secondary" data-action="dismiss">Close</button>',
      "          </div>",
      "        </div>",
      "      </main>",
      '      <footer class="sb-endpoint-footer">',
      "        An unexpected error occurred. To report the error, ",
      '        <button type="button" data-action="details">click here</button>.',
      "      </footer>",
      "    </section>",
      '    <section class="sb-endpoint-view sb-endpoint-details-view">',
      '      <div class="sb-endpoint-topline">',
      "        <div>",
      '          <span class="sb-endpoint-chip">Error report</span>',
      '          <h2 class="mt-3">Send a photo of this page to us on TikTok</h2>',
      '          <p class="mt-2">These details help the site admin find what went wrong.</p>',
      "        </div>",
      '        <button type="button" class="sb-endpoint-secondary" data-action="summary">Back</button>',
      "      </div>",
      '      <div class="sb-endpoint-detail-layout">',
      "        <div>",
      '          <div class="sb-endpoint-panel">',
      '            <p class="sb-endpoint-label">Error code</p>',
      '            <p class="sb-endpoint-value" data-field="code">Unknown</p>',
      "          </div>",
      '          <div class="sb-endpoint-panel" style="margin-top:14px;">',
      '            <p class="sb-endpoint-label">Endpoint</p>',
      '            <p class="sb-endpoint-value" data-field="endpoint">Unknown</p>',
      "          </div>",
      '          <div class="sb-endpoint-panel" style="margin-top:14px;">',
      '            <p class="sb-endpoint-label">Details</p>',
      '            <pre class="sb-endpoint-value" data-field="details">No extra details were returned.</pre>',
      "          </div>",
      "        </div>",
      '        <aside class="sb-endpoint-panel">',
      '          <p class="sb-endpoint-label">TikTok support</p>',
      '          <img data-field="qr-image" class="sb-endpoint-qr" alt="TikTok QR code" />',
      '          <div class="sb-endpoint-qr-fallback" data-field="qr-fallback">Upload the TikTok QR image to /assets/tokens/tiktok-qr.png</div>',
      '          <p class="sb-endpoint-value" style="margin-top:12px;">Reach out to us on TikTok and send a photo of this page.</p>',
      '          <a data-field="tiktok-link" class="sb-endpoint-button sb-endpoint-primary" style="margin-top:14px;width:100%;" href="https://www.tiktok.com/@studybase" target="_blank" rel="noopener">Open TikTok</a>',
      "        </aside>",
      "      </div>",
      '      <div class="sb-endpoint-actions">',
      '        <button type="button" class="sb-endpoint-secondary" data-action="dismiss">Close</button>',
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
      if (action === "reload") {
        closePopup();
        window.location.reload();
        return;
      }
      if (action === "details") {
        openDetailsFromPopup();
        return;
      }
      if (action === "summary") {
        host.setAttribute("data-view", "summary");
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closePopup();
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

    setImageWithFallback(
      popup.querySelector('[data-field="error-icon"]'),
      popup.querySelector('[data-field="error-icon-fallback"]'),
      settings.errorIcon
    );
    setImageWithFallback(
      popup.querySelector('[data-field="qr-image"]'),
      popup.querySelector('[data-field="qr-fallback"]'),
      settings.tiktokQrImage
    );

    const link = popup.querySelector('[data-field="tiktok-link"]');
    if (link) link.href = settings.tiktokUrl;
  }

  function closePopup() {
    const popup = document.getElementById(POPUP_ID);
    if (!popup) return;
    popup.classList.remove("is-open");
    document.documentElement.classList.remove("sb-endpoint-error-open");
    if (window.StudybaseEndpointPopup) {
      window.StudybaseEndpointPopup.activeSignature = null;
    }
  }

  function closeToast() {
    closePopup();
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
        : "Service is offline between 11:02pm and 4:00am.";

    openPopup({
      code: MAINTENANCE_CODE,
      endpoint: endpoint || "StudyBase state endpoint",
      details: message,
      summary: "StudyBase is in maintenance mode. Overnight updates are running."
    });
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
      return monitoredHosts.has(parsed.hostname);
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
      if (parsed.hostname !== "api.studybase.site" && parsed.hostname !== "api.revisionbase.site") {
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

  async function getStateMaintenancePayload(input, response) {
    try {
      const requestUrl =
        typeof input === "string"
          ? input
          : input && typeof input.url === "string"
            ? input.url
            : "";

      const parsed = new URL(requestUrl, window.location.origin);
      if (parsed.hostname !== "api.studybase.site" && parsed.hostname !== "api.revisionbase.site") {
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

      if (await shouldIgnoreStateShutdownResponse(input, response)) {
        return response;
      }

      if (!response.ok) {
        const payload = await getResponsePayload(response);
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
      openPopup({
        code: error && error.name ? error.name : "NETWORK_ERROR",
        endpoint: buildEndpointLabel(input),
        details: normaliseDetails(error && error.message ? error.message : String(error)),
        summary:
          "The request could not reach the StudyBase endpoint successfully. This usually means a network failure, a blocked request, or the endpoint being unavailable."
      });
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
    close: closePopup,
    closeToast: closeToast,
    showDetails: openDetailsFromPopup,
    lastError: null,
    activeSignature: null
  };
})();
